#!/bin/bash

# ============================================================================
# Azure Deployment Script — Sovereign Node 9010 (Groknett ValueForge)
# Target: Azure Container Apps (groknett-deploy / australiaeast)
# 
# Prerequisites:
#   - Azure CLI installed and logged in: az login
#   - Docker CLI available (image is built & pushed to ACR by this script)
#
# What this script provisions:
#   1. Resource Group
#   2. Azure Container Registry (ACR) — private image hosting
#   3. Storage Account + Azure Files share — persistent SQLite storage
#   4. Key Vault — secrets management
#   5. Container Apps Environment + Storage mount
#   6. Container App — with health probe, Azure Files, and Key Vault refs
# ============================================================================

set -euo pipefail

# --------------- Configuration ---------------
# NOTE: These values match the actual Azure resources created by azd/GitHub Actions
RESOURCE_GROUP="groknett-deploy"
LOCATION="australiaeast"
STORAGE_ACCOUNT="groknettstorage"
FILE_SHARE_NAME="groknett-data"
ACR_NAME="acrgroknettvaaoxk4iafo3kuo"
KEY_VAULT_NAME="groknett-kv"
APP_NAME="cagroknettvalueforgaoxk4iafo3kuo"
ENVIRONMENT_NAME="groknett-env"
STORAGE_MOUNT_NAME="sqlitedata"
# ----------------------------------------------

echo "=== Sovereign Node 9010: Azure Deployment ==="
echo ""

# ---- 1. Resource Group ----
echo "1/8. Creating Resource Group..."
az group create \
  --name "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --output none

# ---- 2. Azure Container Registry ----
echo "2/8. Creating Azure Container Registry..."
az acr create \
  --name "$ACR_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --sku Basic \
  --admin-enabled true \
  --output none

ACR_LOGIN_SERVER=$(az acr show \
  --name "$ACR_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query "loginServer" --output tsv)

echo "     Building and pushing image to $ACR_LOGIN_SERVER..."
az acr build \
  --registry "$ACR_NAME" \
  --image groknett-valueforge:latest \
  --file Dockerfile . \
  --output none

IMAGE="${ACR_LOGIN_SERVER}/groknett-valueforge:latest"

# ---- 3. Storage Account + Azure Files share ----
echo "3/8. Creating Storage Account + File Share..."
az storage account create \
  --name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --sku Standard_ZRS \
  --allow-blob-public-access false \
  --min-tls-version TLS1_2 \
  --output none

STORAGE_KEY=$(az storage account keys list \
  --account-name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --query "[0].value" --output tsv)

az storage share-rm create \
  --storage-account "$STORAGE_ACCOUNT" \
  --name "$FILE_SHARE_NAME" \
  --quota 1 \
  --output none

# ---- 4. Key Vault ----
echo "4/8. Creating Key Vault..."
az keyvault create \
  --name "$KEY_VAULT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --enable-rbac-authorization false \
  --output none

# Seed placeholder secrets (replace values before go-live)
az keyvault secret set \
  --vault-name "$KEY_VAULT_NAME" \
  --name "AuditSecret" \
  --value "CHANGE-ME-BEFORE-GO-LIVE" \
  --output none

echo "     Key Vault ready. Update secrets via:"
echo "       az keyvault secret set --vault-name $KEY_VAULT_NAME --name AuditSecret --value <real-value>"

# ---- 5. Container Apps Environment + Storage mount ----
echo "5/8. Creating Container Apps Environment..."
az containerapp env create \
  --name "$ENVIRONMENT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --output none

echo "6/8. Mounting Azure Files to environment..."
az containerapp env storage set \
  --name "$ENVIRONMENT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --storage-name "$STORAGE_MOUNT_NAME" \
  --azure-file-account-name "$STORAGE_ACCOUNT" \
  --azure-file-account-key "$STORAGE_KEY" \
  --azure-file-share-name "$FILE_SHARE_NAME" \
  --access-mode ReadWrite \
  --output none

# ---- 6. Get ACR credentials for Container Apps ----
ACR_USERNAME=$(az acr credential show \
  --name "$ACR_NAME" \
  --query "username" --output tsv)
ACR_PASSWORD=$(az acr credential show \
  --name "$ACR_NAME" \
  --query "passwords[0].value" --output tsv)

# ---- 7. Deploy Container App ----
echo "7/8. Deploying Container App..."
az containerapp create \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --environment "$ENVIRONMENT_NAME" \
  --image "$IMAGE" \
  --registry-server "$ACR_LOGIN_SERVER" \
  --registry-username "$ACR_USERNAME" \
  --registry-password "$ACR_PASSWORD" \
  --cpu 0.5 \
  --memory 1Gi \
  --target-port 8000 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 3 \
  --env-vars \
    "PORT=8000" \
    "DB_PATH=/mnt/data/database.sqlite" \
    "NODE_ENV=production" \
  --output none

# ---- 8. Configure health probe + volume mount ----
echo "8/8. Configuring health probe and persistent storage..."

# Export current YAML, patch it, and re-apply
YAML_FILE=$(mktemp /tmp/containerapp-XXXXXX.yaml)

az containerapp show \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --output yaml > "$YAML_FILE"

# Use Python (available in Azure CLI env) to patch the YAML
python3 - "$YAML_FILE" << 'PYTHON_PATCH'
import sys, yaml

path = sys.argv[1]
with open(path) as f:
    spec = yaml.safe_load(f)

tmpl = spec["properties"]["template"]

# Add volume definition
tmpl["volumes"] = [{
    "name": "sqlitedata",
    "storageName": "sqlitedata",
    "storageType": "AzureFile"
}]

# Patch the first container
container = tmpl["containers"][0]

# Add volume mount
container["volumeMounts"] = [{
    "volumeName": "sqlitedata",
    "mountPath": "/mnt/data"
}]

# Add HTTP health probes
container["probes"] = [
    {
        "type": "liveness",
        "httpGet": {"path": "/api/health", "port": 8000},
        "initialDelaySeconds": 10,
        "periodSeconds": 30,
        "failureThreshold": 3
    },
    {
        "type": "readiness",
        "httpGet": {"path": "/api/health", "port": 8000},
        "initialDelaySeconds": 5,
        "periodSeconds": 10,
        "failureThreshold": 3
    },
    {
        "type": "startup",
        "httpGet": {"path": "/api/health", "port": 8000},
        "initialDelaySeconds": 3,
        "periodSeconds": 5,
        "failureThreshold": 10
    }
]

with open(path, "w") as f:
    yaml.dump(spec, f, default_flow_style=False)
PYTHON_PATCH

az containerapp update \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --yaml "$YAML_FILE" \
  --output none

rm -f "$YAML_FILE"

# ---- Done ----
APP_URL=$(az containerapp show \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query "properties.configuration.ingress.fqdn" \
  --output tsv)

echo ""
echo "============================================"
echo " Deployment Complete — Sovereign Node 9010"
echo "============================================"
echo ""
echo " URL:       https://$APP_URL"
echo " Health:    https://$APP_URL/api/health"
echo " ACR:       $ACR_LOGIN_SERVER"
echo " Key Vault: $KEY_VAULT_NAME"
echo " Storage:   $STORAGE_ACCOUNT/$FILE_SHARE_NAME → /mnt/data"
echo ""
echo " Verify:"
echo "   curl https://$APP_URL/api/health"
echo ""
echo " Manage secrets:"
echo "   az keyvault secret set --vault-name $KEY_VAULT_NAME --name AuditSecret --value <value>"
echo ""
