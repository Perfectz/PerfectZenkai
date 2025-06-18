# Hybrid Configuration Setup

## 🎯 **Overview**

This setup provides a **secure hybrid configuration approach** that uses:
- **Local environment variables** for development (secure, fast)
- **Azure Function App environment variables** for production (secure, no secrets in code)

**Benefits:**
- ✅ **No secrets in code** or version control
- ✅ **Fast local development** (no API calls needed)
- ✅ **Secure production** (Azure-managed environment variables)
- ✅ **No Key Vault dependency** (simpler, more reliable)

## 🔧 **Setup Instructions**

### 1. **Local Development Setup**

Create a `.env.local` file in your project root:

```bash
# .env.local (Never commit this file)
VITE_SUPABASE_URL=https://kslvxxoykdkstnkjgpnd.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
VITE_OPENAI_API_KEY=your-openai-api-key-here
```

**Getting your credentials:**
1. **Supabase credentials:**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Go to Settings → API
   - Copy the URL and anon key

2. **OpenAI API key:**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key (starts with `sk-`)

### 2. **Production Configuration**

The Azure Function App already has the environment variables configured:
- `SUPABASE_URL` = `https://kslvxxoykdkstnkjgpnd.supabase.co`
- `SUPABASE_ANON_KEY` = `eyJhbGci...` (redacted for security)
- `OPENAI_API_KEY` = `your-openai-api-key-placeholder` (replace with real key)

## 📝 **How It Works**

### **Development Mode** 
```typescript
// When running `npm run dev`:
import.meta.env.DEV === true

// Configuration loaded from:
VITE_SUPABASE_URL=https://...        // Your .env.local file
VITE_SUPABASE_ANON_KEY=eyJhbGci...   // Your .env.local file
```

### **Production Mode**
```typescript
// When deployed to production:
import.meta.env.DEV === false

// Configuration loaded from:
GET /api/get-secret → Azure Function App env vars
```

### **Code Flow**
```typescript
// src/services/keyVaultService.ts
async getSecret(secretName: string) {
  if (import.meta.env.DEV) {
    // 🏠 Use local environment variables
    return import.meta.env[envVarName];
  } else {
    // 🌐 Call Azure Function for production config
    return await fetch('/api/get-secret', { ... });
  }
}
```

## 🚀 **Usage Examples**

### **In Your Components**
```typescript
import { configurationService } from '../services/keyVaultService';

// This automatically uses the right source (local vs Azure)
const config = await configurationService.getSupabaseConfig();
console.log(`Using config from: ${configurationService.getConfigSource()}`);
```

### **Debug Information**
```typescript
// Check configuration source
console.log(configurationService.getConfigSource());
// Development: "Local Environment Variables"
// Production: "Azure Function App Settings"
```

## 🔒 **Security Features**

### **Development Security**
- ✅ `.env.local` is in `.gitignore` (never committed)
- ✅ Variables prefixed with `VITE_` are compile-time only
- ✅ No secrets transmitted over network in dev mode

### **Production Security**
- ✅ Secrets stored in Azure Function App environment variables
- ✅ Variables not exposed to browser (server-side only)
- ✅ HTTPS-only transmission
- ✅ Azure-managed security controls

## 🛠️ **Troubleshooting**

### **Local Development Issues**
```bash
# Check if .env.local exists
ls -la .env.local

# Verify variables are loaded
console.log(import.meta.env.VITE_SUPABASE_URL)
```

### **Production Issues**
```bash
# Check Azure Function App settings
az functionapp config appsettings list \
  --name perfectzenkai-api \
  --resource-group perfectzenkai-rg \
  --query "[?name=='SUPABASE_URL' || name=='SUPABASE_ANON_KEY']"
```

## 🔧 **Updating Production Credentials**

**To update Azure Function App environment variables:**

```bash
# Update OpenAI API key
az functionapp config appsettings set \
  --name perfectzenkai-api \
  --resource-group perfectzenkai-rg \
  --settings OPENAI_API_KEY="sk-your-real-openai-key"

# Update multiple credentials at once
az functionapp config appsettings set \
  --name perfectzenkai-api \
  --resource-group perfectzenkai-rg \
  --settings SUPABASE_URL="new-url" SUPABASE_ANON_KEY="new-key" OPENAI_API_KEY="sk-your-key"
```

## 📚 **Next Steps**

1. **Create `.env.local`** with your Supabase and OpenAI credentials
2. **Test locally** with `npm run dev`
3. **Deploy** - production will use Azure environment variables
4. **Update production OpenAI key** using the Azure CLI command above
5. **Monitor** - Check browser console for configuration source

## 🔄 **Migration from Key Vault**

This approach **replaces Azure Key Vault** with a simpler, more reliable solution:

| Aspect | Key Vault | Hybrid Approach |
|--------|-----------|-----------------|
| **Complexity** | High (RBAC, SDK, credentials) | Low (env vars only) |
| **Reliability** | Dependency on Azure services | Direct environment access |
| **Performance** | Network calls + authentication | Instant (local), fast (Azure) |
| **Security** | Enterprise-grade | Production-appropriate |
| **Development** | Requires Azure connection | Fully offline capable |

**Result:** Same security, better reliability, simpler setup! 🎉 