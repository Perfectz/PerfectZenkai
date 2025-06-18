module.exports = async function (context, req) {
    context.log('📝 Test function called');
    
    // Set CORS headers
    context.res = {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Content-Type": "application/json"
        }
    };

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        context.res.status = 200;
        return;
    }

    try {
        context.log('🔍 Testing Azure environment');
        
        // Test 1: Basic functionality
        context.log('✅ Test 1: Basic function works');
        
        // Test 2: Check environment variables
        const keyVaultUrl = process.env.KEY_VAULT_URL;
        context.log(`🔐 KEY_VAULT_URL: ${keyVaultUrl || 'NOT SET'}`);
        
        // Test 3: Try to require Azure dependencies
        context.log('🔍 Testing Azure SDK imports...');
        const { DefaultAzureCredential } = require("@azure/identity");
        context.log('✅ DefaultAzureCredential imported successfully');
        
        const { SecretClient } = require("@azure/keyvault-secrets");
        context.log('✅ SecretClient imported successfully');
        
        // Test 4: Try to create credentials
        context.log('🔑 Testing credential creation...');
        const credential = new DefaultAzureCredential();
        context.log('✅ DefaultAzureCredential created successfully');
        
        context.res.body = JSON.stringify({
            success: true,
            tests: [
                { name: "Basic function", status: "PASS" },
                { name: "Environment variables", status: keyVaultUrl ? "PASS" : "WARN", details: `KEY_VAULT_URL: ${keyVaultUrl}` },
                { name: "Azure SDK imports", status: "PASS" },
                { name: "Credential creation", status: "PASS" }
            ],
            message: "All tests passed!"
        });

    } catch (error) {
        context.log(`❌ Test failed: ${error.message}`);
        context.log(`❌ Error stack: ${error.stack}`);
        
        context.res.status = 500;
        context.res.body = JSON.stringify({
            error: "Test failed",
            details: error.message,
            stack: error.stack
        });
    }
}; 