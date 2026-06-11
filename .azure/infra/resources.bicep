// ==============================================================================
// Groknett ValueForge - Core Azure Resources
// ==============================================================================
targetScope = 'resourceGroup'

// PARAMETERS
// ==============================================================================

param appName string
param location string
param resourceToken string
param containerImage string
param appPort int
param nodeEnv string
param logLevel string
param containerAppCpu string
param containerAppMemory string
param minReplicas int
param maxReplicas int
param storageShareSizeGb int
param tags object
param logAnalyticsWorkspaceId string

// VARIABLES
// ==============================================================================

var acrName = 'acr${substring(replace(appName, '-', ''), 0, 10)}${resourceToken}'
var keyVaultName = 'kv${uniqueString(resourceGroup().id, appName, subscription().id)}'
var storageAccountName = 'st${substring(replace(appName, '-', ''), 0, 16)}${substring(resourceToken, 0, 4)}'
var fileShareName = 'sqlite-data'
var managedIdentityName = 'id${substring(replace(appName, '-', ''), 0, 18)}${resourceToken}'
var containerAppEnvName = 'cae${substring(replace(appName, '-', ''), 0, 15)}${resourceToken}'
var containerAppName = 'ca${substring(replace(appName, '-', ''), 0, 17)}${resourceToken}'

// AZURE CONTAINER REGISTRY
// ==============================================================================

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: location
  tags: tags
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: false
    publicNetworkAccess: 'Enabled'
    zoneRedundancy: 'Disabled'
    networkRuleBypassOptions: 'AzureServices'
  }
  identity: {
    type: 'SystemAssigned'
  }
}

// MANAGED IDENTITY
// ==============================================================================

resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2024-11-30' = {
  name: managedIdentityName
  location: location
  tags: tags
}

// KEY VAULT
// ==============================================================================

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  tags: tags
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
    enablePurgeProtection: true
    publicNetworkAccess: 'Enabled'
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
  }
}

// STORAGE ACCOUNT (for SQLite persistence)
// ==============================================================================

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  tags: tags
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    allowSharedKeyAccess: true
    publicNetworkAccess: 'Enabled'
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
  }
}

// Azure Files Service (for file share)
resource fileServices 'Microsoft.Storage/storageAccounts/fileServices@2023-05-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    shareDeleteRetentionPolicy: {
      enabled: true
      days: 7
    }
  }
}

// Azure File Share (persistent volume for SQLite)
resource fileShare 'Microsoft.Storage/storageAccounts/fileServices/shares@2023-05-01' = {
  parent: fileServices
  name: fileShareName
  properties: {
    accessTier: 'TransactionOptimized'
    shareQuota: storageShareSizeGb
    enabledProtocols: 'SMB'
  }
}

// RBAC: Managed Identity -> ACR Pull
// ==============================================================================

var acrPullRoleId = '7f951dda-4ed3-4680-a7ca-43fe172d538d'

resource acrPullRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(containerRegistry.id, managedIdentity.id, acrPullRoleId)
  scope: containerRegistry
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', acrPullRoleId)
    principalId: managedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// RBAC: Managed Identity -> Key Vault Secrets User
// ==============================================================================

var keyVaultSecretsUserRoleId = '4633458b-17de-408a-b874-0445c86b69e6'

resource keyVaultSecretsUserRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, managedIdentity.id, keyVaultSecretsUserRoleId)
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', keyVaultSecretsUserRoleId)
    principalId: managedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// RBAC: Managed Identity -> Storage Account Contributor
// ==============================================================================

var storageAccountContributorRoleId = '17d1049b-9a84-46fb-8f53-869881c3d3ab'

resource storageAccountRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageAccount.id, managedIdentity.id, storageAccountContributorRoleId)
  scope: storageAccount
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', storageAccountContributorRoleId)
    principalId: managedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// CONTAINER APPS ENVIRONMENT
// ==============================================================================

resource containerAppEnvironment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: containerAppEnvName
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: reference(logAnalyticsWorkspaceId, '2022-10-01').customerId
        sharedKey: listKeys(logAnalyticsWorkspaceId, '2022-10-01').primarySharedKey
      }
    }
    zoneRedundant: false
    workloadProfiles: [
      {
        name: 'Consumption'
        workloadProfileType: 'Consumption'
      }
    ]
  }
}

// Storage for Container Apps Environment (Azure Files mount)
resource containerAppEnvironmentStorage 'Microsoft.App/managedEnvironments/storages@2024-03-01' = {
  parent: containerAppEnvironment
  name: 'sqlite-storage'
  properties: {
    azureFile: {
      accountName: storageAccount.name
      accountKey: storageAccount.listKeys().keys[0].value
      shareName: fileShare.name
      accessMode: 'ReadWrite'
    }
  }
}

// CONTAINER APP
// ==============================================================================

resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: containerAppName
  location: location
  tags: union(tags, { 'azd-service-name': 'app' })
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${managedIdentity.id}': {}
    }
  }
  properties: {
    environmentId: containerAppEnvironment.id
    workloadProfileName: 'Consumption'
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: appPort
        transport: 'http'
        allowInsecure: false
        traffic: [
          {
            latestRevision: true
            weight: 100
          }
        ]
      }
      registries: [
        {
          server: containerRegistry.properties.loginServer
          identity: managedIdentity.id
        }
      ]
      secrets: []
    }
    template: {
      containers: [
        {
          name: 'groknett-valueforge'
          image: !empty(containerImage) ? containerImage : 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
          resources: {
            cpu: json(containerAppCpu)
            memory: containerAppMemory
          }
          env: [
            {
              name: 'NODE_ENV'
              value: nodeEnv
            }
            {
              name: 'LOG_LEVEL'
              value: logLevel
            }
            {
              name: 'PORT'
              value: string(appPort)
            }
            {
              name: 'DB_PATH'
              value: '/app/data/database.sqlite'
            }
            {
              name: 'AZURE_KEY_VAULT_NAME'
              value: keyVault.name
            }
            {
              name: 'AZURE_CLIENT_ID'
              value: managedIdentity.properties.clientId
            }
          ]
          volumeMounts: [
            {
              volumeName: 'sqlite-volume'
              mountPath: '/app/data'
            }
          ]
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/api/health'
                port: appPort
                scheme: 'HTTP'
              }
              initialDelaySeconds: 30
              periodSeconds: 10
              timeoutSeconds: 5
              failureThreshold: 3
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/api/health'
                port: appPort
                scheme: 'HTTP'
              }
              initialDelaySeconds: 10
              periodSeconds: 5
              timeoutSeconds: 3
              failureThreshold: 3
              successThreshold: 1
            }
          ]
        }
      ]
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
        rules: [
          {
            name: 'http-scaling-rule'
            http: {
              metadata: {
                concurrentRequests: '100'
              }
            }
          }
        ]
      }
      volumes: [
        {
          name: 'sqlite-volume'
          storageType: 'AzureFile'
          storageName: containerAppEnvironmentStorage.name
        }
      ]
    }
  }
  dependsOn: [
    acrPullRoleAssignment
    keyVaultSecretsUserRoleAssignment
    storageAccountRoleAssignment
  ]
}

// OUTPUTS
// ==============================================================================

output containerRegistryName string = containerRegistry.name
output containerRegistryLoginServer string = containerRegistry.properties.loginServer
output keyVaultName string = keyVault.name
output keyVaultUri string = keyVault.properties.vaultUri
output storageAccountName string = storageAccount.name
output storageAccountId string = storageAccount.id
output fileShareName string = fileShare.name
output managedIdentityClientId string = managedIdentity.properties.clientId
output managedIdentityPrincipalId string = managedIdentity.properties.principalId
output containerAppEnvironmentName string = containerAppEnvironment.name
output containerAppName string = containerApp.name
output containerAppFqdn string = containerApp.properties.configuration.ingress.fqdn
