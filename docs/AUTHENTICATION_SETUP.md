# Authentication Setup Guide

## 🔐 Google OAuth Configuration

Perfect Zenkai uses Google OAuth for secure authentication. Follow these steps to set up authentication in your development and production environments.

## Prerequisites

- Google account
- Access to Google Cloud Console
- Perfect Zenkai project running locally

## Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** (or select an existing one):
   - Click the project selector dropdown at the top
   - Click "NEW PROJECT"
   - Enter project name: `Perfect Zenkai Auth`
   - Click "CREATE"
   - Wait for project creation and select it

## Step 2: Configure OAuth Consent Screen (FIRST!)

⚠️ **Important**: You MUST configure the OAuth consent screen before creating credentials.

1. **Navigate to APIs & Services > OAuth consent screen**
2. **Choose User Type**:
   - Select "External" (for personal Google accounts)
   - Click "CREATE"

3. **App Information** (Required fields):
   - **App name**: `Perfect Zenkai`
   - **User support email**: Your email address
   - **App logo**: (Optional) Upload your app logo
   - **App domain**: `https://perfectzenkai.netlify.app`
   - **Authorized domains**: Click "ADD DOMAIN" and add:
     - `perfectzenkai.netlify.app`
     - `localhost` (for development)
   - **Developer contact information**: Your email address
   - Click "SAVE AND CONTINUE"

4. **Scopes** (Step 2):
   - Click "ADD OR REMOVE SCOPES"
   - Select these Google APIs scopes:
     - `userinfo.email` (See your primary Google Account email address)
     - `userinfo.profile` (See your personal info, including any personal info you've made publicly available)
     - `openid` (Associate you with your personal info on Google)
   - Click "UPDATE" then "SAVE AND CONTINUE"

5. **Test users** (Step 3):
   - Click "ADD USERS"
   - Add your email address and any other emails you want to test with
   - Click "SAVE AND CONTINUE"

6. **Summary** (Step 4):
   - Review your settings
   - Click "BACK TO DASHBOARD"

## Step 3: Enable Required APIs

1. **Navigate to APIs & Services > Library**
2. **Search and enable these APIs**:
   - **Google Identity Services API** (search for "Google Identity")
   - **People API** (search for "People API")
   - These are the only APIs you need for basic OAuth

## Step 4: Create OAuth 2.0 Credentials

1. **Go to APIs & Services > Credentials**
2. **Click "+ CREATE CREDENTIALS"**
3. **Select "OAuth client ID"**

4. **Configure the OAuth client**:
   - **Application type**: `Web application`
   - **Name**: `Perfect Zenkai Web Client`
   
   - **Authorized JavaScript origins** (Optional but recommended):
     - `http://localhost:5176`
     - `http://localhost:5174`
     - `http://localhost:5173`
     - `https://perfectzenkai.netlify.app`
   
   - **Authorized redirect URIs** (CRITICAL):
     - `http://localhost:5176/auth/callback`
     - `http://localhost:5174/auth/callback`
     - `http://localhost:5173/auth/callback`
     - `https://perfectzenkai.netlify.app/auth/callback`

5. **Click "CREATE"**
6. **Copy the Client ID** from the popup (format: `123456789-abcdef.apps.googleusercontent.com`)
7. **Click "DONE"**

## Step 5: Configure Environment Variables

### Development Setup

1. **Create `.env` file** in your project root:
```env
# Perfect Zenkai Environment Variables

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com

# Development
VITE_APP_ENV=development
```

2. **Replace `your-actual-client-id-here.apps.googleusercontent.com`** with your actual Client ID from Step 4

### Production Setup (Netlify)

1. **Go to your Netlify dashboard**: https://app.netlify.com/
2. **Select your Perfect Zenkai site** (perfectzenkai.netlify.app)
3. **Navigate to Site settings > Environment variables**
4. **Click "Add a variable"**:
   - **Key**: `VITE_GOOGLE_CLIENT_ID`
   - **Value**: Your actual Client ID from Google Cloud Console
   - **Scopes**: All scopes
5. **Click "Create variable"**
6. **Trigger a new deploy** to apply the environment variable

## Step 6: Test Authentication

1. **Restart your development server**:
```bash
npm run dev
```

2. **Navigate to your app** (usually http://localhost:5176)
3. **Click "Continue with Google"**
4. **Complete OAuth flow** (you'll see a Google consent screen)
5. **Verify you're redirected to dashboard**

## CLI Automation Options

### 🚀 Automated Setup Scripts

We've created automation scripts to handle the CLI-based parts of the setup:

#### Windows (PowerShell)
```powershell
# Run the automated setup script
.\scripts\setup-auth-cli.ps1
```

#### macOS/Linux (Bash)
```bash
# Make script executable (macOS/Linux only)
chmod +x scripts/setup-auth-cli.sh

# Run the automated setup script
./scripts/setup-auth-cli.sh
```

### What the Scripts Automate:
- ✅ Install Netlify CLI (if not present)
- ✅ Check for Google Cloud CLI
- ✅ Create `.env` file with your Client ID
- ✅ Configure Netlify environment variables
- ✅ Enable Google Cloud APIs (if gcloud is available)
- ✅ Trigger production deployment
- ✅ Validate setup

### Manual CLI Commands (if you prefer)

#### Google Cloud CLI (gcloud)
```bash
# Install Google Cloud CLI first
# https://cloud.google.com/sdk/docs/install

# Login and set project
gcloud auth login
gcloud config set project perfect-zenkai-auth

# Enable required APIs
gcloud services enable identitytoolkit.googleapis.com
gcloud services enable people.googleapis.com
```

#### Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Set environment variable (after getting Client ID)
netlify env:set VITE_GOOGLE_CLIENT_ID "your-client-id-here.apps.googleusercontent.com"

# Deploy with new environment variable
netlify deploy --prod
```

### What CANNOT be automated:
- OAuth consent screen configuration (manual UI only)
- Creating OAuth 2.0 credentials (manual UI only)
- Copying the Client ID (manual step)

## Troubleshooting

### Common Issues

#### 1. "Google Client ID is not configured"
- **Cause**: Missing or incorrect `VITE_GOOGLE_CLIENT_ID` in `.env`
- **Solution**: 
  - Verify `.env` file exists in project root
  - Check Client ID format (should end with `.apps.googleusercontent.com`)
  - Restart dev server after adding environment variables

#### 2. "redirect_uri_mismatch" Error
- **Cause**: Redirect URI in Google Console doesn't match your app's URL
- **Solution**: 
  - Go to Google Cloud Console > APIs & Services > Credentials
  - Edit your OAuth 2.0 Client ID
  - Add exact redirect URI:
    - Development: `http://localhost:5176/auth/callback`
    - Production: `https://perfectzenkai.netlify.app/auth/callback`
  - **Note**: URIs are case-sensitive and must match exactly

#### 3. "access_denied" Error
- **Cause**: OAuth consent screen issues or user not authorized
- **Solution**: 
  - Ensure OAuth consent screen is fully configured
  - Check that your app is in "Testing" mode
  - Add your email as a test user
  - **Check**: APIs & Services > OAuth consent screen > Test users

#### 4. "invalid_client" Error
- **Cause**: Incorrect Client ID
- **Solution**: 
  - Double-check Client ID in `.env` matches Google Console exactly
  - Ensure no extra spaces or characters

#### 5. "This app isn't verified" Warning
- **Cause**: Normal for apps in testing mode
- **Solution**: 
  - Click "Advanced" then "Go to Perfect Zenkai (unsafe)"
  - This is expected during development
  - For production, you'd need to verify your app (not required for personal use)

### Debug Steps

1. **Check environment variables**:
```bash
# In your terminal (Windows PowerShell)
echo $env:VITE_GOOGLE_CLIENT_ID

# Or check in browser console
console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID)
```

2. **Check browser console** for detailed error messages

3. **Verify redirect URI** matches exactly (including protocol, port, and path)

4. **Check OAuth consent screen status**:
   - Go to APIs & Services > OAuth consent screen
   - Ensure status shows "Testing"
   - Verify your email is in test users list

5. **Test with incognito browser** to rule out cache issues

6. **Check Network tab** in browser dev tools for failed requests

## Current Google Cloud Console Navigation (2024)

The interface has changed significantly. Here's the current navigation:

- **Main Menu**: Hamburger menu (☰) in top-left
- **APIs & Services**: In the main navigation menu
- **OAuth consent screen**: Under APIs & Services
- **Credentials**: Under APIs & Services  
- **Library**: Under APIs & Services (for enabling APIs)

## Security Best Practices

### Environment Variables
- ✅ Never commit `.env` files to version control
- ✅ Use different Client IDs for development and production
- ✅ Regularly rotate OAuth credentials
- ✅ Monitor OAuth usage in Google Console

### OAuth Configuration
- ✅ Use HTTPS in production
- ✅ Limit redirect URIs to your actual domains only
- ✅ Review OAuth consent screen regularly
- ✅ Monitor for suspicious authentication attempts
- ✅ Keep authorized domains list minimal

## Free Tier Information

✅ **Google OAuth is completely FREE** for your use case:
- Unlimited authentication requests
- No cost per user login
- Google Identity Services API: Free
- People API: 100,000 requests/day (free tier)
- Perfect Zenkai only uses basic profile info (well within limits)

## File Structure

```
perfect-zenkai/
├── .env                          # Environment variables (not in git)
├── .env.example                  # Example environment file
├── src/modules/auth/
│   ├── services/googleAuth.ts    # Google OAuth service
│   ├── store/authStore.ts        # Authentication state
│   ├── components/LoginPage.tsx  # Login UI
│   └── types/auth.ts            # Type definitions
└── docs/
    └── AUTHENTICATION_SETUP.md  # This guide
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | `123456789-abc.apps.googleusercontent.com` |
| `VITE_APP_ENV` | Application environment | `development` or `production` |

## Quick Setup Checklist

- [ ] Create Google Cloud project
- [ ] Configure OAuth consent screen (External, add domains, scopes, test users)
- [ ] Enable Google Identity Services API and People API
- [ ] Create OAuth 2.0 Client ID with correct redirect URIs
- [ ] Copy Client ID to `.env` file
- [ ] Add Client ID to Netlify environment variables
- [ ] Test authentication flow
- [ ] Verify redirect to dashboard works

## Support

If you encounter issues:

1. **Check this guide** for common solutions
2. **Review browser console** for error messages
3. **Verify Google Cloud Console** configuration matches exactly
4. **Test with fresh browser session** (incognito mode)
5. **Check Netlify deploy logs** for environment variable issues

---

**Last Updated**: December 2024  
**Version**: 2.0 (Updated for current Google Cloud Console interface)  
**Compatible with**: Perfect Zenkai MVP 8+ 