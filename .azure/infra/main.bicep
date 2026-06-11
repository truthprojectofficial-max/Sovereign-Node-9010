// ==============================================================================
// Groknett ValueForge - Main Infrastructure Entry Point
// ==============================================================================
targetScope = 'resourceGroup'

// PARAMETERS
// ==============================================================================

@description('Application name (used for resource naming)')
@minLength(3)
@maxLength(24)
param appName string = 'groknett-valueforge'

@description('Azure region for all resources')
param location string = resourceGroup().location

@description('Environment name (dev, staging, prod)')
@allowed([
  'dev'
  'staging'
  'prod'
])
param environmentName string = 'prod'

@description('Container image reference (set by azd postprovision hook)')
param containerImage string = ''

@description('Application port')
param appPort int = 8000

@description('Node.js environment mode')
@allowed([
  'development'
  'production'
])
param nodeEnv string = 'production'

@description('Log level for application')
@allowed([
  'trace'
  'debug'
  'info'
  'warn'
  'error'
  'fatal'
])
param logLevel string = 'info'

@description('Container Apps Environment CPU allocation')
param containerAppCpu string = '0.5'

@description('Container Apps Environment Memory allocation')
param containerAppMemory string = '1Gi'

@description('Minimum replica count')
@minValue(0)
@maxValue(30)
param minReplicas int = 1

@description('Maximum replica count')
@minValue(1)
@maxValue(30)
param maxReplicas int = 2

@description('Storage file share size in GB for SQLite persistence')
@minValue(1)
@maxValue(5120)
param storageShareSizeGb int = 10

@description('Tags to apply to all resources')
param tags object = {
  Application: 'Groknett-ValueForge'
  Environment: environmentName
  ManagedBy: 'Bicep'
  Project: 'Sovereign-Node-9010'
}

// VARIABLES
// ==============================================================================

var resourceToken = toLower(uniqueString(resourceGroup().id, appName))

// MODULES
// ==============================================================================

// Monitoring: Application Insights & Log Analytics
module monitoring 'monitoring.bicep' = {
  name: 'monitoring-deployment'
  params: {
    appName: appName
    location: location
    resourceToken: resourceToken
    tags: tags
  }
}

// Core Resources: ACR, Key Vault, Storage, Managed Identity, Container Apps
module resources 'resources.bicep' = {
  name: 'resources-deployment'
  params: {
    appName: appName
    location: location
    resourceToken: resourceToken
    containerImage: containerImage
    appPort: appPort
    nodeEnv: nodeEnv
    logLevel: logLevel
    containerAppCpu: containerAppCpu
    containerAppMemory: containerAppMemory
    minReplicas: minReplicas
    maxReplicas: maxReplicas
    storageShareSizeGb: storageShareSizeGb
    tags: tags
    logAnalyticsWorkspaceId: monitoring.outputs.logAnalyticsWorkspaceId
  }
}

// OUTPUTS
// ==============================================================================

output AZURE_LOCATION string = location
output AZURE_RESOURCE_GROUP string = resourceGroup().name
output AZURE_CONTAINER_REGISTRY_NAME string = resources.outputs.containerRegistryName
output AZURE_CONTAINER_REGISTRY_ENDPOINT string = resources.outputs.containerRegistryLoginServer
output AZURE_CONTAINER_APP_NAME string = resources.outputs.containerAppName
output AZURE_CONTAINER_APP_FQDN string = resources.outputs.containerAppFqdn
output AZURE_KEY_VAULT_NAME string = resources.outputs.keyVaultName
output AZURE_STORAGE_ACCOUNT_NAME string = resources.outputs.storageAccountName
output AZURE_MANAGED_IDENTITY_CLIENT_ID string = resources.outputs.managedIdentityClientId
output AZURE_APP_INSIGHTS_CONNECTION_STRING string = monitoring.outputs.appInsightsConnectionString
output AZURE_LOG_ANALYTICS_WORKSPACE_ID string = monitoring.outputs.logAnalyticsWorkspaceId
output APP_URL string = 'https://${resources.outputs.containerAppFqdn}'
output CONTAINER_IMAGE string = containerImage
