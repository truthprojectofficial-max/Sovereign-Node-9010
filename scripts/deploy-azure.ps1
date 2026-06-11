# ============================================================================
# Azure Deployment Script — Sovereign Node 9010 (Groknett ValueForge)
# Target: Azure Container Apps (groknett-deploy / australiaeast)
#
# Run: .\deploy-azure.ps1
# Prerequisites: Azure CLI installed, logged in (az login)
# ============================================================================

$ErrorActionPreference = "Stop"

# --------------- Configuration ---------------
# NOTE: These values match the actual Azure resources created by azd/GitHub Actions
$RESOURCE_GROUP    = "groknett-deploy"
$LOCATION          = "australiaeast"
$STORAGE_ACCOUNT   = "groknettstorage"
$FILE_SHARE_NAME   = "groknett-data"
$ACR_NAME          = "acrgroknettvaaoxk4iafo3kuo"
$KEY_VAULT_NAME    = "groknett-kv"
$APP_NAME          = "cagroknettvalueforgaoxk4iafo3kuo"
$ENVIRONMENT_NAME  = "groknett-env"
$STORAGE_MOUNT     = "sqlitedata"
# ----------------------------------------------

Write-Host ""
Write-Host "=== Sovereign Node 9010: Azure Deployment ===" -ForegroundColor Cyan
Write-Host ""

# ---- 1. Resource Group ----
Write-Host "1/8. Creating Resource Group..." -ForegroundColor Yellow
az group create --name $RESOURCE_GROUP --location $LOCATION --output none
if ($LASTEXITCODE -ne 0) { throw "Failed to create resource group" }

# ---- 2. Azure Container Registry ----
Write-Host "2/8. Creating Azure Container Registry..." -ForegroundColor Yellow
az acr create --name $ACR_NAME --resource-group $RESOURCE_GROUP --sku Basic --admin-enabled true --output none
if ($LASTEXITCODE -ne 0) { throw "Failed to create ACR" }

$ACR_LOGIN_SERVER = az acr show --name $ACR_NAME --resource-group $RESOURCE_GROUP --query "loginServer" --output tsv
Write-Host "     Building and pushing image to $ACR_LOGIN_SERVER..." -ForegroundColor Gray
az acr build --registry $ACR_NAME --image groknett-valueforge:latest --file Dockerfile . --output none
if ($LASTEXITCODE -ne 0) { throw "Failed to build/push image to ACR" }

$IMAGE = "$ACR_LOGIN_SERVER/groknett-valueforge:latest"

# ---- 3. Storage Account + Azure Files share ----
Write-Host "3/8. Creating Storage Account + File Share..." -ForegroundColor Yellow
az storage account create --name $STORAGE_ACCOUNT --resource-group $RESOURCE_GROUP --location $LOCATION --sku Standard_LRS --allow-blob-public-access false --output none
if ($LASTEXITCODE -ne 0) { throw "Failed to create storage account" }

$STORAGE_KEY = az storage account keys list --account-name $STORAGE_ACCOUNT --resource-group $RESOURCE_GROUP --query "[0].value" --output tsv

az storage share-rm create --storage-account $STORAGE_ACCOUNT --name $FILE_SHARE_NAME --quota 1 --output none
if ($LASTEXITCODE -ne 0) { throw "Failed to create file share" }

# ---- 4. Key Vault ----
Write-Host "4/8. Creating Key Vault..." -ForegroundColor Yellow
az keyvault create --name $KEY_VAULT_NAME --resource-group $RESOURCE_GROUP --location $LOCATION --enable-rbac-authorization false --output none
if ($LASTEXITCODE -ne 0) { throw "Failed to create Key Vault" }

az keyvault secret set --vault-name $KEY_VAULT_NAME --name "AuditSecret" --value "CHANGE-ME-BEFORE-GO-LIVE" --output none
Write-Host "     Key Vault ready. Update secrets later via:" -ForegroundColor Gray
Write-Host "       az keyvault secret set --vault-name $KEY_VAULT_NAME --name AuditSecret --value <real-value>" -ForegroundColor Gray

# ---- 5. Container Apps Environment ----
Write-Host "5/8. Creating Container Apps Environment..." -ForegroundColor Yellow
az containerapp env create --name $ENVIRONMENT_NAME --resource-group $RESOURCE_GROUP --location $LOCATION --output none
if ($LASTEXITCODE -ne 0) { throw "Failed to create Container Apps environment" }

# ---- 6. Mount Azure Files ----
Write-Host "6/8. Mounting Azure Files to environment..." -ForegroundColor Yellow
az containerapp env storage set --name $ENVIRONMENT_NAME --resource-group $RESOURCE_GROUP --storage-name $STORAGE_MOUNT --azure-file-account-name $STORAGE_ACCOUNT --azure-file-account-key $STORAGE_KEY --azure-file-share-name $FILE_SHARE_NAME --access-mode ReadWrite --output none
if ($LASTEXITCODE -ne 0) { throw "Failed to mount Azure Files" }

# ---- Get ACR credentials ----
$ACR_USERNAME = az acr credential show --name $ACR_NAME --query "username" --output tsv
$ACR_PASSWORD = az acr credential show --name $ACR_NAME --query "passwords[0].value" --output tsv

# ---- 7. Deploy Container App ----
Write-Host "7/8. Deploying Container App..." -ForegroundColor Yellow
az containerapp create `
  --name $APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --environment $ENVIRONMENT_NAME `
  --image $IMAGE `
  --registry-server $ACR_LOGIN_SERVER `
  --registry-username $ACR_USERNAME `
  --registry-password $ACR_PASSWORD `
  --cpu 0.5 `
  --memory 1Gi `
  --target-port 8000 `
  --ingress external `
  --min-replicas 1 `
  --max-replicas 3 `
  --env-vars "PORT=8000" "DB_PATH=/mnt/data/database.sqlite" "NODE_ENV=production" `
  --output none
if ($LASTEXITCODE -ne 0) { throw "Failed to create Container App" }

# ---- 8. Configure health probe + volume mount via YAML patch ----
Write-Host "8/8. Configuring health probes and persistent storage..." -ForegroundColor Yellow

# Use the REST API approach via az rest for volume + probe configuration
$appId = az containerapp show --name $APP_NAME --resource-group $RESOURCE_GROUP --query "id" --output tsv

$patchBody = @{
  properties = @{
    template = @{
      volumes = @(
        @{
          name = "sqlitedata"
          storageName = "sqlitedata"
          storageType = "AzureFile"
        }
      )
      containers = @(
        @{
          name = $APP_NAME
          image = $IMAGE
          resources = @{
            cpu = 0.5
            memory = "1Gi"
          }
          env = @(
            @{ name = "PORT"; value = "8000" }
            @{ name = "DB_PATH"; value = "/mnt/data/database.sqlite" }
            @{ name = "NODE_ENV"; value = "production" }
          )
          volumeMounts = @(
            @{
              volumeName = "sqlitedata"
              mountPath = "/mnt/data"
            }
          )
          probes = @(
            @{
              type = "liveness"
              httpGet = @{ path = "/api/health"; port = 8000 }
              initialDelaySeconds = 10
              periodSeconds = 30
              failureThreshold = 3
            }
            @{
              type = "readiness"
              httpGet = @{ path = "/api/health"; port = 8000 }
              initialDelaySeconds = 5
              periodSeconds = 10
              failureThreshold = 3
            }
            @{
              type = "startup"
              httpGet = @{ path = "/api/health"; port = 8000 }
              initialDelaySeconds = 3
              periodSeconds = 5
              failureThreshold = 10
            }
          )
        }
      )
    }
  }
} | ConvertTo-Json -Depth 10 -Compress

$patchFile = Join-Path $env:TEMP "containerapp-patch.json"
$patchBody | Set-Content -Path $patchFile -Encoding utf8

az rest --method PATCH --url "${appId}?api-version=2024-03-01" --body "@${patchFile}" --output none
if ($LASTEXITCODE -ne 0) {
  Write-Host "     Note: Volume/probe patch via REST failed. App is deployed but without volume mount." -ForegroundColor DarkYellow
  Write-Host "     You can add these manually in the Azure Portal." -ForegroundColor DarkYellow
}

Remove-Item $patchFile -ErrorAction SilentlyContinue

# ---- Done ----
$APP_URL = az containerapp show --name $APP_NAME --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" --output tsv

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host " Deployment Complete - Sovereign Node 9010" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host " URL:       https://$APP_URL" -ForegroundColor White
Write-Host " Health:    https://$APP_URL/api/health" -ForegroundColor White
Write-Host " ACR:       $ACR_LOGIN_SERVER" -ForegroundColor White
Write-Host " Key Vault: $KEY_VAULT_NAME" -ForegroundColor White
Write-Host " Storage:   $STORAGE_ACCOUNT/$FILE_SHARE_NAME -> /mnt/data" -ForegroundColor White
Write-Host ""
Write-Host " Verify:" -ForegroundColor Cyan
Write-Host "   curl https://$APP_URL/api/health" -ForegroundColor Cyan
Write-Host ""
