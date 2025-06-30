# MVP-24 – E2E Test Environment Hardening & Azure Function Fix

## 📜 Problem Statement
**UPDATE**: Two distinct issues have been identified:

1. **Local E2E Environment**: Tests fail due to `webServer` timeouts caused by zombie `vite` processes occupying port 5173.
2. **Azure Function 500 Error**: The deployed `get-secret` function continues returning HTTP 500 errors, indicating the credential fix was not deployed or is insufficient.

*Current Error from Browser Console*:
```
POST https://perfectzenkai-api.azurewebsites.net/api/get-secret net::ERR_ABORTED 500 (Internal Server Error)
❌ Failed to get secret supabase-url from Key Vault: Error: HTTP 500
```

## 🎯 Updated Goals
1. **Environment Hardening**: ✅ COMPLETED - Reliable local E2E testing environment
2. **Azure Function Deployment**: Deploy the credential fix to resolve 500 errors
3. **End-to-End Validation**: Confirm the full application works with Azure Key Vault

## 🔍 Approaches Attempted

### ❌ TRIED: Azure Function Unit Testing
- **Approach**: Created `api/get-secret/index.test.js` with mocked Azure SDK
- **Blocker**: CJS/ESM interop issues with `vitest` prevented reliable mocking
- **Status**: Abandoned due to complexity

### ❌ TRIED: start-server-and-test
- **Approach**: Used `start-server-and-test` package for E2E workflow
- **Blocker**: Dependency on deprecated `wmic.exe` caused `spawn ENOENT` errors
- **Status**: Replaced with `npm-run-all`

### ✅ COMPLETED: Environment Hardening
- **Approach**: 
  - Created `scripts/kill-port.ps1` and `scripts/kill-port.sh` for cross-platform port cleanup
  - Integrated `npm-run-all` and `wait-on` for reliable server lifecycle management
  - Added `test:cleanup` script to kill processes on port 5173
- **Status**: Successfully implemented and working

### 🔄 IN PROGRESS: Azure Function Credential Fix
- **Approach**: Modified `api/get-secret/index.js` to use `ManagedIdentityCredential` in Azure environment
- **Issue**: Fix created locally but **NOT YET DEPLOYED** to Azure Function App
- **Status**: Requires deployment

### ✅ COMPLETED: Enhanced Azure Function (Local Testing)
- **Approach**: Enhanced `api/get-secret/index.js` with fallback strategies and better error handling
- **Status**: ✅ **Local testing successful** - function retrieves secrets correctly with proper error handling
- **Test Results**:
  - ✅ Valid secret request (supabase-url): **200 OK** with correct value
  - ✅ Invalid secret request: **403 Forbidden** (security working)
  - ✅ Missing secret name: **400 Bad Request** (validation working)
- **Next Step**: **Deploy `api-deploy-enhanced.zip` to Azure Function App**

### 🚀 IMMEDIATE DEPLOYMENT REQUIRED
**The fix works locally but needs to be deployed to resolve production 500 errors.**

#### Deployment Package Ready:
- **File**: `api-deploy-enhanced.zip` (created with enhanced function)
- **Local Test**: ✅ PASSED - function retrieves Supabase URL successfully

#### Azure Function App Deployment Steps:
1. **Go to Azure Portal** → Function Apps → `perfectzenkai-api`
2. **Download current deployment** (backup before deployment)
3. **Upload `api-deploy-enhanced.zip`** via Deployment Center or Azure CLI
4. **Verify deployment** by testing the endpoint directly:
   ```bash
   curl -X POST https://perfectzenkai-api.azurewebsites.net/api/get-secret \
        -H "Content-Type: application/json" \
        -d '{"secretName":"supabase-url"}'
   ```
5. **Expected Result**: HTTP 200 with Supabase URL (not 500 error)

#### Alternative Deployment via Azure CLI:
```bash
# If Azure CLI is available
az functionapp deployment source config-zip \
  --resource-group perfectzenkai-rg \
  --name perfectzenkai-api \
  --src api-deploy-enhanced.zip
```

## 🚀 Next Strategy: Azure Function Deployment

### Immediate Actions Required:
1. **Deploy Updated Function**: Use `api-deploy-final.zip` created earlier
2. **Alternative Strategy**: If ManagedIdentityCredential fails, implement environment variable fallback
3. **Diagnostic Enhancement**: Add more detailed logging to Azure Function for better debugging

### Deployment Verification Plan:
1. Deploy `api-deploy-final.zip` to Azure Function App
2. Test `get-secret` endpoint directly via Postman/curl
3. Verify browser application no longer shows 500 errors
4. Run local E2E test to confirm end-to-end functionality

### Fallback Strategy (if ManagedIdentityCredential fails):
```javascript
// Add to api/get-secret/index.js as Plan B
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    context.log('🔄 Using environment variables as fallback');
    return {
        value: secretName === 'supabase-url' ? process.env.SUPABASE_URL : process.env.SUPABASE_ANON_KEY
    };
}
```

## 🚨 CRITICAL ISSUE DISCOVERED: Azure Function App Configuration Corruption

#### Deployment Status:
- ✅ **Code Deployment**: Successfully deployed `api-deploy-enhanced.zip` 
- ✅ **Function Runtime**: Deployment successful with ID `64ad60210d0048a89f1a8bec111af7b0`
- ✅ **CONFIGURATION SUCCESSFULLY RESTORED**

**Status Update**: All Azure Function App environment variables have been restored successfully via Azure Portal.

**Confirmed Settings in Place:**
- ✅ `AzureWebJobsStorage` - Storage connection string restored
- ✅ `FUNCTIONS_EXTENSION_VERSION` - ~4
- ✅ `FUNCTIONS_WORKER_RUNTIME` - node  
- ✅ `KEYVAULT_URL` - https://perfectzenkai-secrets.vault.azure.net/
- ✅ `SCM_DO_BUILD_DURING_DEPLOYMENT` - true
- ✅ `WEBSITE_CONTENTAZUREFILECONNECTIONSTRING` - Storage connection restored
- ✅ `WEBSITE_CONTENTSHARE` - perfectzenkai-api9275f5e831dc
- ✅ `WEBSITE_NODE_DEFAULT_VERSION` - ~22 (Node.js 22 enabled)
- ✅ `WEBSITE_RUN_FROM_PACKAGE` - 1

**Function App Status**: 
- ✅ Configuration restored via Azure Portal Environment Variables
- ✅ Enhanced function code deployed (with fallback strategies)
- ✅ Ready for testing

**Next Validation Steps:**
1. **Test your application** at `https://localhost:5174/`
2. **Check browser console** - 500 errors should be resolved
3. **Verify auth flow** - Should see "🔧 Using auth service: supabase" without errors

## 📅 Updated Timeline
| Task | Status | Next Action |
|------|--------|-------------|
| Environment Hardening | ✅ DONE | - |
| Azure Function Fix | 🔄 LOCAL ONLY | Deploy `api-deploy-final.zip` |
| End-to-End Validation | ⏳ PENDING | Test after deployment |

## 🛡 Risk Analysis
- **Deployment Risk**: Azure deployment may overwrite Function App settings
- **Credential Risk**: ManagedIdentityCredential may not have sufficient permissions
- **Mitigation**: Prepare environment variable fallback before deployment

### 🚨 **ISSUE PERSISTS: Still Getting 500 Errors After Configuration Restoration**

**Current Status**: Configuration restored successfully, but Azure Function still returning HTTP 500 errors.

**Error Logs from Browser:**
```
perfectzenkai-api.azurewebsites.net/api/get-secret:1 
Failed to load resource: the server responded with a status of 500 ()
❌ Failed to get secret supabase-url from Key Vault: Error: HTTP 500
```

**Possible Root Causes:**
1. **Function App needs restart** - Configuration changes may not be active
2. **Runtime startup issue** - Node.js 22 or dependencies may have issues
3. **Managed Identity permissions** - May not have Key Vault access
4. **Function code execution error** - Runtime error in deployed code

### 🔧 **Next Debugging Steps**

#### Step 1: Force Function App Restart
The configuration restoration may require a full restart to take effect.

#### Step 2: Check Function Logs
Need to examine Azure Function execution logs to see specific error details.

#### Step 3: Test Function Directly
Test the enhanced function endpoint with detailed error reporting.

#### Step 4: Fallback Strategy Implementation
If Key Vault continues to fail, implement direct environment variable approach as designed in enhanced function.

### 🛠 **Immediate Actions Required**
1. **Restart Azure Function App** via Azure Portal
2. **Check Function Logs** for runtime errors
3. **Test endpoint directly** with curl/Postman
4. **Implement environment variable fallback** if Key Vault access fails

---
_Updated: 2025-06-18 by AI assistant_
_Key Insight: The fix exists locally but has not been deployed to Azure, explaining persistent 500 errors_ 