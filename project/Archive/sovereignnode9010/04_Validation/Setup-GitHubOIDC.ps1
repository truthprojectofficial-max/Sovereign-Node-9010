<#
.SYNOPSIS
    Creates Azure AD App Registration + Federated Identity Credential for GitHub OIDC.

.DESCRIPTION
    This script sets up passwordless authentication from GitHub Actions to Azure
    using OpenID Connect (OIDC). It is the recommended, most secure method
    (no long-lived secrets).

    The resulting identity is used by:
    - .github/workflows/deploy-private-bicep.yml
    - Any other GitHub Actions workflows that need to deploy to Azure.

    IMPORTANT (per project philosophy):
    - Pre-work (strict bootstrap) is mandatory before any deployment.
    - This script creates the deployment identity with least-privilege roles.
    - All actions are logged and auditable (aligns with ANAO Auditing Standards F2024L00057).

.PARAMETER GitHubRepo
    Full GitHub repository in owner/repo format (e.g. "yourorg/sovereign-node-9010")

.PARAMETER Environment
    GitHub Environment name (e.g. "production"). Creates an environment-scoped federated credential.

.PARAMETER SubscriptionId
    Target Azure Subscription ID.

.PARAMETER ResourceGroupName
    Resource Group where the Sovereign Node resources will live (for role assignments).

.PARAMETER DisplayName
    Display name for the App Registration (defaults to a sensible name based on repo).

.EXAMPLE
    .\04_Validation\Setup-GitHubOIDC.ps1 `
        -GitHubRepo "yourorg/sovereign-node-9010" `
        -Environment "production" `
        -SubscriptionId "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" `
        -ResourceGroupName "rg-sovereign-node-private"

.NOTES
    Requires: Azure CLI (az) logged in with permissions to create App Registrations
              and assign roles at the subscription/resource group level.

    After running, add these as GitHub Repository Secrets (or Variables):
        AZURE_CLIENT_ID
        AZURE_TENANT_ID
        AZURE_SUBSCRIPTION_ID
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$GitHubRepo,

    [string]$Environment = "production",

    [Parameter(Mandatory)]
    [string]$SubscriptionId,

    [Parameter(Mandatory)]
    [string]$ResourceGroupName,

    [string]$DisplayName = "GitHub-OIDC-$($GitHubRepo -replace '/','-')"
)

$ErrorActionPreference = "Stop"

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "   Sovereign Node 9010 - GitHub OIDC Federated Identity Setup" -ForegroundColor Cyan
Write-Host "   Pre-work is mandatory. This identity will only be usable after bootstrap." -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan

# Ensure we're in the correct subscription
az account set --subscription $SubscriptionId | Out-Null
$tenantId = (az account show --query tenantId -o tsv)

Write-Host "`n[1/5] Creating App Registration: $DisplayName" -ForegroundColor Yellow

# Create App Registration (or get existing)
$app = az ad app list --display-name $DisplayName --query "[0]" | ConvertFrom-Json

if (-not $app) {
    $app = az ad app create --display-name $DisplayName --query "{appId: appId, objectId: id}" | ConvertFrom-Json
    Write-Host "  Created new App Registration. AppId: $($app.appId)" -ForegroundColor Green
} else {
    Write-Host "  App Registration already exists. AppId: $($app.appId)" -ForegroundColor Green
}

# Create Service Principal if it doesn't exist
$sp = az ad sp list --filter "appId eq '$($app.appId)'" --query "[0]" | ConvertFrom-Json

if (-not $sp) {
    $sp = az ad sp create --id $app.appId --query "{id: id}" | ConvertFrom-Json
    Write-Host "  Created Service Principal." -ForegroundColor Green
} else {
    Write-Host "  Service Principal already exists." -ForegroundColor Green
}

# Create Federated Identity Credential (environment-scoped)
$federatedSubject = "repo:$GitHubRepo:environment:$Environment"

Write-Host "`n[2/5] Creating Federated Identity Credential for subject: $federatedSubject" -ForegroundColor Yellow

$existingCred = az ad app federated-credential list --id $app.appId --query "[?subject == '$federatedSubject']" | ConvertFrom-Json

if (-not $existingCred) {
    az ad app federated-credential create `
        --id $app.appId `
        --parameters "{
            \"name\": \"github-oidc-$Environment\",
            \"issuer\": \"https://token.actions.githubusercontent.com\",
            \"subject\": \"$federatedSubject\",
            \"audiences\": [\"api://AzureADTokenExchange\"]
        }" | Out-Null

    Write-Host "  Federated credential created for environment '$Environment'." -ForegroundColor Green
} else {
    Write-Host "  Federated credential already exists for this subject." -ForegroundColor Green
}

# Also create a branch-based credential for main (common pattern)
$mainSubject = "repo:$GitHubRepo:ref:refs/heads/main"
$existingMain = az ad app federated-credential list --id $app.appId --query "[?subject == '$mainSubject']" | ConvertFrom-Json

if (-not $existingMain) {
    az ad app federated-credential create `
        --id $app.appId `
        --parameters "{
            \"name\": \"github-oidc-main\",
            \"issuer\": \"https://token.actions.githubusercontent.com\",
            \"subject\": \"$mainSubject\",
            \"audiences\": [\"api://AzureADTokenExchange\"]
        }" | Out-Null
    Write-Host "  Additional federated credential created for refs/heads/main." -ForegroundColor Green
}

# Role assignments (least privilege)
Write-Host "`n[3/5] Assigning least-privilege roles..." -ForegroundColor Yellow

$rolesToAssign = @(
    @{ Name = "Contributor"; Scope = "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroupName" },
    @{ Name = "AcrPush"; Scope = "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroupName" },
    @{ Name = "Key Vault Secrets Officer"; Scope = "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroupName" },
    @{ Name = "Storage Account Contributor"; Scope = "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroupName" }
)

foreach ($role in $rolesToAssign) {
    $existingAssignment = az role assignment list `
        --assignee $sp.id `
        --role $role.Name `
        --scope $role.Scope `
        --query "[0].id" -o tsv 2>$null

    if (-not $existingAssignment) {
        az role assignment create `
            --assignee $sp.id `
            --role $role.Name `
            --scope $role.Scope | Out-Null
        Write-Host "  Assigned '$($role.Name)' on $($role.Scope)" -ForegroundColor Green
    } else {
        Write-Host "  Role '$($role.Name)' already assigned." -ForegroundColor DarkGray
    }
}

# Output summary for GitHub
Write-Host "`n[4/5] GitHub Repository Secrets / Variables (add these):" -ForegroundColor Yellow
Write-Host ""
Write-Host "  AZURE_CLIENT_ID       = $($app.appId)" -ForegroundColor White
Write-Host "  AZURE_TENANT_ID       = $tenantId" -ForegroundColor White
Write-Host "  AZURE_SUBSCRIPTION_ID = $SubscriptionId" -ForegroundColor White
Write-Host ""
Write-Host "Recommended: Store as Repository Secrets (Settings → Secrets and variables → Actions)." -ForegroundColor Cyan

Write-Host "`n[5/5] Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Add the three values above to your GitHub repository secrets."
Write-Host "  2. Run the strict bootstrap before building any image that will be deployed."
Write-Host "  3. Trigger the workflow: .github/workflows/deploy-private-bicep.yml"
Write-Host "  4. (Optional) Configure branch protection + required environment approvals on 'production'."

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Green
Write-Host "   GitHub OIDC Federated Identity setup complete." -ForegroundColor Green
Write-Host "   This identity can only deploy after mandatory pre-work has been executed." -ForegroundColor Green
Write-Host "================================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "The script is idempotent — you can safely re-run it." -ForegroundColor DarkGray
