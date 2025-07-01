// api/ai-chat/index.js - COST-OPTIMIZED Azure Function
const { SecretClient } = require("@azure/keyvault-secrets");
const { DefaultAzureCredential } = require("@azure/identity");
const { z } = require("zod");

// Global caching to minimize Key Vault calls (COST OPTIMIZATION)
let cachedApiKey = null;
let keyVaultClient = null;

// Daily cost tracking for GPT-4 (COST PROTECTION)
let dailyCostTracker = {
    date: new Date().toDateString(),
    totalCost: 0,
    requestCount: 0
};

// Define Zod schema for incoming messages
const messageSchema = z.object({
    role: z.enum(["user", "assistant", "system", "function"]),
    content: z.string().nullable().optional(),
    function_call: z.object({
        name: z.string(),
        arguments: z.string()
    }).optional(),
    name: z.string().optional(),
});

// Define Zod schema for incoming request body
const chatRequestSchema = z.object({
    messages: z.array(messageSchema).min(1, "messages array cannot be empty"),
    temperature: z.number().min(0).max(2).default(0.7).optional(),
    max_tokens: z.number().int().min(1).default(150).optional(),
    functions: z.array(z.object({
        name: z.string(),
        description: z.string().optional(),
        parameters: z.record(z.any())
    })).optional(),
    function_call: z.union([
        z.literal("none"),
        z.literal("auto"),
        z.object({ name: z.string() })
    ]).optional(),
});

module.exports = async function (context, req) {
    const startTime = Date.now();
    
    // CORS headers for multiple deployment targets
    context.res = {
        headers: {
            'Access-Control-Allow-Origin': 'https://perfectzenkai.netlify.app', // Restrict to your frontend domain
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400' // Cache preflight for 24 hours
        }
    };

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        context.res.status = 200;
        context.res.body = '';
        return;
    }

    // Only allow POST for actual AI chat
    if (req.method !== 'POST') {
        context.res.status = 405;
        context.res.body = { error: 'Method not allowed' };
        return;
    }

    try {
        // Reset daily tracker if new day
        const today = new Date().toDateString();
        if (dailyCostTracker.date !== today) {
            dailyCostTracker = { date: today, totalCost: 0, requestCount: 0 };
        }

        // COST PROTECTION: Check daily limits
        const DAILY_COST_LIMIT = 2.00; // $2 daily limit for GPT-4
        const DAILY_REQUEST_LIMIT = 100; // Max 100 requests per day
        
        if (dailyCostTracker.totalCost >= DAILY_COST_LIMIT) {
            context.res.status = 429;
            context.res.body = { 
                error: 'Daily cost limit reached. Service will resume tomorrow.',
                dailyCost: dailyCostTracker.totalCost,
                limit: DAILY_COST_LIMIT
            };
            return;
        }
        
        if (dailyCostTracker.requestCount >= DAILY_REQUEST_LIMIT) {
            context.res.status = 429;
            context.res.body = { 
                error: 'Daily request limit reached. Service will resume tomorrow.',
                requestCount: dailyCostTracker.requestCount,
                limit: DAILY_REQUEST_LIMIT
            };
            return;
        }

        // COST OPTIMIZATION: Initialize Key Vault client once
        if (!keyVaultClient) {
            const credential = new DefaultAzureCredential();
            keyVaultClient = new SecretClient(
                "https://perfectzenkai-secrets.vault.azure.net/", 
                credential
            );
        }

        // COST OPTIMIZATION: Cache API key to reduce Key Vault calls
        if (!cachedApiKey) {
            context.log('Fetching Direct OpenAI API key from Key Vault...');
            const secret = await keyVaultClient.getSecret("openai-direct-api-key");
            cachedApiKey = secret.value;
            context.log('Direct OpenAI API key cached successfully');
        }

        // Validate request body using Zod
        let parsedBody;
        try {
            parsedBody = chatRequestSchema.parse(req.body);
        } catch (validationError) {
            context.log.error('Request body validation failed:', validationError.errors);
            context.res.status = 400;
            context.res.body = { 
                error: 'Invalid request body',
                details: validationError.errors
            };
            return;
        }

        // UPDATED: Use GPT-4.1-mini with function calling support
        const openAIRequest = {
            model: 'gpt-4.1-mini',
            messages: parsedBody.messages,
            temperature: parsedBody.temperature || 0.7,
            max_tokens: parsedBody.max_tokens || 150, // COST CONTROL: Reduced tokens due to higher GPT-4 cost
            timeout: 20000 // Slightly longer timeout for GPT-4
        };

        // Add function calling support if functions are provided
        if (parsedBody.functions) {
            openAIRequest.functions = parsedBody.functions;
            openAIRequest.function_call = parsedBody.function_call || 'auto';
        }

        context.log(`Making OpenAI API call with ${parsedBody.messages.length} messages`);

        // Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${cachedApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(openAIRequest)
        });

        if (!response.ok) {
            context.log.error(`OpenAI API error: ${response.status} ${response.statusText}`);
            context.res.status = response.status;
            context.res.body = { error: 'AI service unavailable' };
            return;
        }

        const data = await response.json();
        
        // Enhanced cost tracking for GPT-4
        const executionTime = Date.now() - startTime;
        const tokenUsage = data.usage ? data.usage.total_tokens : 0;
        const promptTokens = data.usage ? data.usage.prompt_tokens : 0;
        const completionTokens = data.usage ? data.usage.completion_tokens : 0;
        
        // Estimate cost for GPT-4.1-mini direct OpenAI (approximate)
        // GPT-4o-mini pricing: $0.15/1M input tokens, $0.60/1M output tokens
        const estimatedCost = (promptTokens * 0.00000015) + (completionTokens * 0.0000006);
        
        // Update daily cost tracking
        dailyCostTracker.totalCost += estimatedCost;
        dailyCostTracker.requestCount += 1;
        
        context.log(`Direct OpenAI GPT-4.1-mini - Execution: ${executionTime}ms, Total tokens: ${tokenUsage}, Cost: $${estimatedCost.toFixed(6)}, Daily total: $${dailyCostTracker.totalCost.toFixed(4)}`);
        
        context.res.status = 200;
        context.res.body = {
            choices: data.choices,
            usage: data.usage,
            executionTime: executionTime,
            estimatedCost: estimatedCost,
            dailyUsage: {
                totalCost: dailyCostTracker.totalCost,
                requestCount: dailyCostTracker.requestCount,
                costLimit: 2.00,
                requestLimit: 100
            }
        };

    } catch (error) {
        const executionTime = Date.now() - startTime;
        context.log.error(`AI Chat Error (${executionTime}ms):`, error.message);
        
        // Don't expose internal errors to client
        context.res.status = 500;
        context.res.body = { 
            error: 'Service temporarily unavailable',
            executionTime: executionTime
        };
    }
}; 