// api/get-secret/index.js
// Azure Key Vault configuration service using managed identity

import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

// Initialize Key Vault client with managed identity
const keyVaultUrl = 'https://perfectzenkai-secrets.vault.azure.net/';
const credential = new DefaultAzureCredential();
const secretClient = new SecretClient(keyVaultUrl, credential);

export default async function (context, req) {
    context.log('📥 Configuration request received');
    
    try {
        // Validate request
        if (!req.body || !req.body.secretName) {
            context.log.error('❌ Missing secretName in request body');
            context.res = {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
                body: { 
                    error: 'Missing secretName in request body',
                    code: 'MISSING_SECRET_NAME'
                }
            };
            return;
        }

        const secretName = req.body.secretName;
        context.log(`🔍 Retrieving secret from Key Vault: ${secretName}`);

        // Validate secret name
        const allowedSecrets = ['supabase-url', 'supabase-anon-key', 'openai-direct-api-key'];
        if (!allowedSecrets.includes(secretName)) {
            context.log.error(`❌ Unknown secret name: ${secretName}`);
            context.res = {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
                body: { 
                    error: `Unknown secret name: ${secretName}`,
                    code: 'UNKNOWN_SECRET_NAME',
                    allowedSecrets: allowedSecrets
                }
            };
            return;
        }

        // Get secret from Key Vault
        const secret = await secretClient.getSecret(secretName);
        
        if (!secret || !secret.value) {
            context.log.error(`❌ Secret not found: ${secretName}`);
            context.res = {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
                body: { 
                    error: `Secret not found: ${secretName}`,
                    code: 'SECRET_NOT_FOUND'
                }
            };
            return;
        }

        context.log(`✅ Secret retrieved successfully: ${secretName}`);

        // Return the secret value
        context.res = {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'private, max-age=300', // Cache for 5 minutes
                'Access-Control-Allow-Origin': 'https://perfectzenkai.netlify.app',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: { 
                value: secret.value,
                secretName: secretName,
                source: 'Azure Key Vault',
                timestamp: new Date().toISOString()
            }
        };

    } catch (error) {
        context.log.error('💥 Error accessing Key Vault:', error);
        
        context.res = {
            status: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'https://perfectzenkai.netlify.app'
            },
            body: { 
                error: 'Internal server error while retrieving secret',
                code: 'KEY_VAULT_ERROR',
                message: error.message
            }
        };
    }
}; 