// api/get-secret/index.js
// Simplified configuration service using Azure Function App environment variables

module.exports = async function (context, req) {
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
        context.log(`🔍 Retrieving configuration: ${secretName}`);

        // Map secret names to environment variable names
        const envMap = {
            'supabase-url': 'SUPABASE_URL',
            'supabase-anon-key': 'SUPABASE_ANON_KEY',
            'openai-direct-api-key': 'OPENAI_API_KEY'
        };

        const envVarName = envMap[secretName];
        if (!envVarName) {
            context.log.error(`❌ Unknown configuration key: ${secretName}`);
            context.res = {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
                body: { 
                    error: `Unknown configuration key: ${secretName}`,
                    code: 'UNKNOWN_SECRET_NAME',
                    availableKeys: Object.keys(envMap)
                }
            };
            return;
        }

        // Get value from environment variables
        const value = process.env[envVarName];
        if (!value) {
            context.log.error(`❌ Configuration not found: ${envVarName}`);
            context.res = {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
                body: { 
                    error: `Configuration not found: ${secretName}`,
                    code: 'SECRET_NOT_FOUND',
                    envVar: envVarName
                }
            };
            return;
        }

        context.log(`✅ Configuration retrieved successfully: ${secretName}`);

        // Return the configuration value
        context.res = {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'private, max-age=300' // Cache for 5 minutes
            },
            body: { 
                value: value,
                secretName: secretName,
                source: 'Azure Function App Environment Variables',
                timestamp: new Date().toISOString()
            }
        };

    } catch (error) {
        context.log.error('💥 Unexpected error in get-secret function:', error);
        
        context.res = {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
            body: { 
                error: 'Internal server error while retrieving configuration',
                code: 'INTERNAL_ERROR',
                message: error.message
            }
        };
    }
}; 