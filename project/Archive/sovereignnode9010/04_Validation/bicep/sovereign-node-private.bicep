// Sovereign Node 9010 v3.9.1
// Bicep template for hardened private deployment with Private Endpoints
//
// This is the declarative equivalent of Deploy-SovereignNode9010-PrivateEndpoints.azcli
// Pre-work (strict bootstrap) MUST have been run before building/pushing the image.
// The container will refuse to start without the BOOTSTRAP_COMPLETE marker.
//
// Features:
// - VNet with dedicated subnets
// - Private Endpoints for ACR, Key Vault, Storage (Azure Files for 03_Vault)
// - Private DNS zones + links
// - Container Apps Environment (VNet integrated)
// - Container App with persistent volume mount + secrets
// - System-assigned managed identity
// - Strong security defaults aligned with 00-99 and NO_NETWORK philosophy

@description('Prefix for all resource names')
param namePrefix string = 'sovereign9010priv'

@description('Azure region')
param location string = resourceGroup().location

@description('The full image reference (e.g. myacr.azurecr.io/sovereign-node-9010:latest)')
param containerImage string

@secure()
@description('Tau auth token (will be stored in Key Vault)')
param taasAuthToken string

@secure()
@description('Audit secret key for Merkle seals')
param auditSecretKey string

@description('Whether to allow external ingress (set false for fully private)')
param allowExternalIngress bool = true

var uniqueSuffix = uniqueString(resourceGroup().id)
var vnetName = '${namePrefix}-vnet'
var subnetPrivateEndpoints = 'snet-private-endpoints'
var subnetContainerApps = 'snet-containerapps'
var acrName = '${namePrefix}acr${uniqueSuffix}'
var kvName = '${namePrefix}kv${uniqueSuffix}'
var storageName = '${namePrefix}st${uniqueSuffix}'
var shareName = 'sovereign-vault'
var envName = '${namePrefix}-env'
var appName = '${namePrefix}-app'

// ==================== Networking ====================

resource vnet 'Microsoft.Network/virtualNetworks@2023-11-01' = {
  name: vnetName
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: ['10.10.0.0/16']
    }
    subnets: [
      {
        name: subnetPrivateEndpoints
        properties: {
          addressPrefix: '10.10.1.0/24'
          privateEndpointNetworkPolicies: 'Disabled'
        }
      }
      {
        name: subnetContainerApps
        properties: {
          addressPrefix: '10.10.2.0/23'
          delegations: [
            {
              name: 'Microsoft.App.environments'
              properties: {
                serviceName: 'Microsoft.App/environments'
              }
            }
          ]
        }
      }
    ]
  }
}

resource privateDnsAcr 'Microsoft.Network/privateDnsZones@2020-06-01' = {
  name: 'privatelink.azurecr.io'
  location: 'global'
}

resource privateDnsKv 'Microsoft.Network/privateDnsZones@2020-06-01' = {
  name: 'privatelink.vaultcore.azure.net'
  location: 'global'
}

resource privateDnsStorage 'Microsoft.Network/privateDnsZones@2020-06-01' = {
  name: 'privatelink.file.core.windows.net'
  location: 'global'
}

// VNet links for private DNS
resource dnsLinkAcr 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2020-06-01' = {
  parent: privateDnsAcr
  name: 'acr-link'
  location: 'global'
  properties: {
    registrationEnabled: false
    virtualNetwork: { id: vnet.id }
  }
}

resource dnsLinkKv 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2020-06-01' = {
  parent: privateDnsKv
  name: 'kv-link'
  location: 'global'
  properties: {
    registrationEnabled: false
    virtualNetwork: { id: vnet.id }
  }
}

resource dnsLinkStorage 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2020-06-01' = {
  parent: privateDnsStorage
  name: 'storage-link'
  location: 'global'
  properties: {
    registrationEnabled: false
    virtualNetwork: { id: vnet.id }
  }
}

// ==================== Core Resources ====================

resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: location
  sku: { name: 'Premium' } // Required for Private Link
  properties: {
    publicNetworkAccess: 'Disabled'
  }
}

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: kvName
  location: location
  properties: {
    tenantId: subscription().tenantId
    sku: { family: 'A', name: 'standard' }
    publicNetworkAccess: 'Disabled'
    enableRbacAuthorization: false
  }
}

resource storage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageName
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: {
    publicNetworkAccess: 'Disabled'
    allowBlobPublicAccess: false
  }
}

resource fileShare 'Microsoft.Storage/storageAccounts/fileServices/shares@2023-01-01' = {
  parent: storage
  name: shareName
  properties: {}
}

// Store secrets in Key Vault
resource secretTaaS 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'TAAS-AUTH-TOKEN'
  properties: {
    value: taasAuthToken
  }
}

resource secretAudit 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'AUDIT-SECRET-KEY'
  properties: {
    value: auditSecretKey
  }
}

// ==================== Private Endpoints ====================

resource peAcr 'Microsoft.Network/privateEndpoints@2023-11-01' = {
  name: 'pe-${acrName}'
  location: location
  properties: {
    subnet: { id: resourceId('Microsoft.Network/virtualNetworks/subnets', vnetName, subnetPrivateEndpoints) }
    privateLinkServiceConnections: [
      {
        name: 'acr-pls'
        properties: {
          privateLinkServiceId: acr.id
          groupIds: ['registry']
        }
      }
    ]
  }
}

resource peKv 'Microsoft.Network/privateEndpoints@2023-11-01' = {
  name: 'pe-${kvName}'
  location: location
  properties: {
    subnet: { id: resourceId('Microsoft.Network/virtualNetworks/subnets', vnetName, subnetPrivateEndpoints) }
    privateLinkServiceConnections: [
      {
        name: 'kv-pls'
        properties: {
          privateLinkServiceId: keyVault.id
          groupIds: ['vault']
        }
      }
    ]
  }
}

resource peStorage 'Microsoft.Network/privateEndpoints@2023-11-01' = {
  name: 'pe-${storageName}'
  location: location
  properties: {
    subnet: { id: resourceId('Microsoft.Network/virtualNetworks/subnets', vnetName, subnetPrivateEndpoints) }
    privateLinkServiceConnections: [
      {
        name: 'storage-pls'
        properties: {
          privateLinkServiceId: storage.id
          groupIds: ['file']
        }
      }
    ]
  }
}

// ==================== Container Apps ====================

resource containerEnv 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: envName
  location: location
  properties: {
    vnetConfiguration: {
      infrastructureSubnetId: resourceId('Microsoft.Network/virtualNetworks/subnets', vnetName, subnetContainerApps)
    }
  }
}

resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: appName
  location: location
  properties: {
    managedEnvironmentId: containerEnv.id
    configuration: {
      ingress: {
        external: allowExternalIngress
        targetPort: 8000
        traffic: [
          { latestRevision: true, weight: 100 }
        ]
      }
      secrets: [
        { name: 'taas-token', value: taasAuthToken }
        { name: 'audit-secret', value: auditSecretKey }
      ]
      registries: [
        {
          server: '${acrName}.azurecr.io'
          identity: 'system'  // Will use system-assigned identity
        }
      ]
    }
    template: {
      scale: { minReplicas: 1, maxReplicas: 3 }
      containers: [
        {
          name: 'node'
          image: containerImage
          resources: { cpu: json('1.0'), memory: '2Gi' }
          env: [
            { name: 'TAAS_AUTH_TOKEN', secretRef: 'taas-token' }
            { name: 'AUDIT_SECRET_KEY', secretRef: 'audit-secret' }
            { name: 'SOVEREIGN_DB_PATH', value: '/workspace/03_Vault/facts_registry.db' }
            { name: 'NO_NETWORK', value: '1' }
          ]
          volumeMounts: [
            { mountPath: '/workspace/03_Vault', volumeName: 'vault' }
          ]
        }
      ]
      volumes: [
        {
          name: 'vault'
          storageType: 'AzureFile'
          storageName: shareName
          azureFile: {
            shareName: shareName
            accountName: storageName
            accountKey: listKeys(storage.id, storage.apiVersion).keys[0].value
          }
        }
      ]
    }
  }
  identity: {
    type: 'SystemAssigned'
  }
  dependsOn: [
    acr
    keyVault
    storage
  ]
}

// Role assignments for the Container App's system-assigned identity (least privilege)
// 
// Per ANAO Auditing Standards 2024 (F2024L00057) principles of ethics, economy,
// efficiency, effectiveness and traceable use of public resources, all access
// must be explicitly granted, auditable, and follow least-privilege.

resource roleAcrPull 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: acr
  name: guid(containerApp.id, acr.id, 'AcrPull')
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d') // AcrPull
    principalId: containerApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

resource roleKvSecretsUser 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: keyVault
  name: guid(containerApp.id, keyVault.id, 'Key Vault Secrets User')
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6') // Key Vault Secrets User
    principalId: containerApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

resource roleStorageFileContributor 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: storage
  name: guid(containerApp.id, storage.id, 'Storage File Data SMB Share Contributor')
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '0c867c2a-1d8c-454a-a3db-ab2ea1bdc8bb') // Storage File Data SMB Share Contributor
    principalId: containerApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

// Outputs
output appFqdn string = containerApp.properties.configuration.ingress.fqdn
output privateEndpointIds array = [
  peAcr.id
  peKv.id
  peStorage.id
]
output keyVaultName string = keyVault.name
output acrLoginServer string = acr.properties.loginServer
