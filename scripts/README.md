# Perfect Zenkai - Setup Scripts

This directory contains automation scripts to streamline the setup process for Perfect Zenkai.

## 🔐 Authentication Setup Scripts

### `setup-auth-cli.ps1` (Windows PowerShell)

Automates the CLI-based parts of Google OAuth authentication setup on Windows.

**Usage:**

```powershell
.\scripts\setup-auth-cli.ps1
```

### `setup-auth-cli.sh` (macOS/Linux Bash)

Automates the CLI-based parts of Google OAuth authentication setup on Unix-like systems.

**Usage:**

```bash
# Make executable first
chmod +x scripts/setup-auth-cli.sh

# Run the script
./scripts/setup-auth-cli.sh
```

## What These Scripts Do

### ✅ Automated Tasks:

- Check for required CLI tools (Netlify CLI, Google Cloud CLI)
- Install Netlify CLI if missing
- Prompt for Google OAuth Client ID
- Create `.env` file with proper configuration
- Configure Netlify environment variables
- Enable Google Cloud APIs (if gcloud is available)
- Trigger production deployment
- Validate the setup

### ❌ Manual Tasks (Cannot be automated):

- Creating Google Cloud Project
- Configuring OAuth Consent Screen
- Creating OAuth 2.0 Credentials
- Copying the Client ID from Google Console

## Prerequisites

Before running these scripts, you must:

1. **Complete Google Cloud Console setup** (manual steps):

   - Create Google Cloud Project
   - Configure OAuth Consent Screen
   - Create OAuth 2.0 Client ID
   - Copy the Client ID

2. **Have Node.js and npm installed**

3. **Have access to your Netlify account**

## Script Features

### 🎨 User-Friendly Interface:

- Colored output for better readability
- Clear step-by-step progress indicators
- Input validation and error handling
- Helpful prompts and confirmations

### 🔧 Smart Detection:

- Automatically detects installed CLI tools
- Validates Client ID format
- Checks environment variable configuration
- Provides troubleshooting guidance

### 🚀 Production Ready:

- Configures both development and production environments
- Handles Netlify deployment
- Enables required Google Cloud APIs
- Provides verification checklist

## Troubleshooting

If you encounter issues with the scripts:

1. **Permission Errors (Windows)**:

   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **Permission Errors (macOS/Linux)**:

   ```bash
   chmod +x scripts/setup-auth-cli.sh
   ```

3. **CLI Tool Issues**:

   - Ensure Node.js and npm are installed
   - Check internet connection for CLI installations
   - Verify Google Cloud CLI installation if using gcloud features

4. **Authentication Issues**:
   - Ensure you've completed the manual Google Cloud Console steps
   - Verify your Client ID format
   - Check the main documentation: `docs/AUTHENTICATION_SETUP.md`

## Support

For detailed authentication setup instructions, see:

- `docs/AUTHENTICATION_SETUP.md` - Complete setup guide
- Google Cloud Console documentation
- Netlify CLI documentation

---

**Last Updated**: December 2024  
**Compatible with**: Perfect Zenkai MVP 8+
