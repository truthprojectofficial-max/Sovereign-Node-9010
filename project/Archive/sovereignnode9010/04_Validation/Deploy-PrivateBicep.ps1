<#
.SYNOPSIS
Deploys the Sovereign Node 9010 private Bicep template.

Requires:
- The strict bootstrap to have been run before the container image was built.
- az CLI logged in
- The Bicep CLI (usually comes with az)

Usage:
    .\04_Validation\Deploy-PrivateBicep.ps1 `
        -ResourceGroupName "rg-sovereign-private" `
        -Location "eastus2" `
        -ContainerImage "myacr.azurecr.io/sovereign-node-9010:latest" `
        -TaaS "super-secret-taas" `
        -AuditSecret "super-secret-audit"
#>
param(
    [string]$ResourceGroupName = "rg-sovereign-node-private",
    [string]$Location = "eastus2",
    [Parameter(Mandatory)]
    [string]$ContainerImage,
    [Parameter(Mandatory)]
    [string]$TaaS,
    [Parameter(Mandatory)]
    [string]$AuditSecret,
    [bool]$AllowExternalIngress = $false
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$bicepFile = Join-Path $scriptDir "bicep\sovereign-node-private.bicep"
$paramsFile = Join-Path $scriptDir "bicep\parameters.example.json"

Write-Host "=== Sovereign Node 9010 - Private Bicep Deployment ===" -ForegroundColor Cyan
Write-Host "Pre-work enforcement: The image must have been built after running the strict bootstrap." -ForegroundColor Yellow

# Ensure resource group exists
az group create --name $ResourceGroupName --location $Location | Out-Null

# Deploy
$deploymentName = "sovereign-private-$(Get-Date -Format 'yyyyMMddHHmmss')"

az deployment group create `
    --resource-group $ResourceGroupName `
    --name $deploymentName `
    --template-file $bicepFile `
    --parameters `
        containerImage=$ContainerImage `
        taasAuthToken=$TaaS `
        auditSecretKey=$AuditSecret `
        allowExternalIngress=$AllowExternalIngress `
    --query "properties.outputs.appFqdn.value" -o tsv

Write-Host ""
Write-Host "Deployment initiated. Check the Azure Portal for the Container App and private endpoints." -ForegroundColor Green
Write-Host "Remember: The node will only start if the mandatory pre-work was completed before the image was built." -ForegroundColor Yellow
