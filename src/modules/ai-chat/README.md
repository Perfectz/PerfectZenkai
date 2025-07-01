# AI Chat Troubleshooting Guide

## Quick Fix for AI Chat Not Working

### Option 1: Local Development Mode (Recommended)
1. Create `.env.local` file in project root:
```bash
# Add your OpenAI API key for local development
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional: Configure other settings
VITE_AI_MODEL=gpt-4o-mini
VITE_AI_TEMPERATURE=0.7
VITE_AI_MAX_TOKENS=150
```

2. Restart the development server:
```bash
npm run dev
```

### Option 2: Azure Functions Mode (Production)
If you don't have an OpenAI API key, the app will use Azure Functions:
- URL: `https://perfectzenkai-api.azurewebsites.net/api/ai-chat`
- This requires the Azure Function to be deployed and working

## Testing AI Chat

### Browser Console Test
1. Open DevTools (F12)
2. Go to Chat page: `/chat`
3. Check console for errors
4. Try sending a message: "Hello, test message"

### Debug Script
Run in browser console:
```javascript
// Import and run debug script
import('./debug-chat.js').then(m => m.debugAiChat())
```

## Common Issues & Solutions

### Issue: "Configuration invalid" error
**Solution**: Add `VITE_OPENAI_API_KEY` to `.env.local`

### Issue: "Azure Function error: 404"
**Solution**: 
1. Check if Azure Function is deployed
2. Verify URL: `https://perfectzenkai-api.azurewebsites.net/api/ai-chat`
3. Add local OpenAI API key as fallback

### Issue: TypeScript compilation errors
**Solution**: These don't prevent AI Chat from working in development, but should be fixed:
```bash
npm run dev --ignore-errors
```

### Issue: Network/CORS errors
**Solution**: 
1. Check browser network tab
2. Verify API endpoints are accessible
3. Check CORS settings in Azure Functions

## Current Status
- ✅ Fixed `getSupabaseClientSync` import errors
- ✅ Created debug utilities
- ❌ Need environment configuration (OpenAI API key)
- ⚠️ TypeScript errors (306 remaining, non-blocking for development)

## Next Steps
1. **Add OpenAI API key** to `.env.local` for immediate testing
2. **Test basic message** in chat interface
3. **Check browser console** for any remaining errors
4. **Fix TypeScript errors** gradually (optional for AI Chat functionality) 