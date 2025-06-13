# Perfect Zenkai - Quick Authentication Setup
# Pre-configured for project: 401604583214

Write-Host "🔐 Perfect Zenkai - Quick Authentication Setup" -ForegroundColor Cyan
Write-Host "Project: 401604583214" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan

# Your project details
$PROJECT_NUMBER = "401604583214"
$PROJECT_ID = "perfect-zenkai-auth"

Write-Host "`n📋 Your Project Information" -ForegroundColor Yellow
Write-Host "============================"
Write-Host "Project Number: $PROJECT_NUMBER" -ForegroundColor Green
Write-Host "Suggested Project ID: $PROJECT_ID" -ForegroundColor Yellow
Write-Host ""

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

Write-Host "📝 Next Steps for Google Cloud Console:" -ForegroundColor Yellow
Write-Host "======================================="
Write-Host "1. Go to: https://console.cloud.google.com/"
Write-Host "2. Select project: $PROJECT_NUMBER"
Write-Host "3. Navigate to: APIs `& Services > OAuth consent screen"
Write-Host "4. Configure OAuth consent screen:"
Write-Host "   - User Type: External"
Write-Host "   - App name: Perfect Zenkai"
Write-Host "   - App domain: https://perfectzenkai.netlify.app"
Write-Host "   - Authorized domains: perfectzenkai.netlify.app, localhost"
Write-Host "   - Scopes: userinfo.email, userinfo.profile, openid"
Write-Host "   - Test users: Add your email"
Write-Host "5. Go to: APIs `& Services > Credentials"
Write-Host "6. Create OAuth 2.0 Client ID:"
Write-Host "   - Type: Web application"
Write-Host "   - Name: Perfect Zenkai Web Client"
Write-Host "   - Authorized redirect URIs:"
Write-Host "     * http://localhost:5176/auth/callback"
Write-Host "     * https://perfectzenkai.netlify.app/auth/callback"
Write-Host "7. Copy the Client ID"
Write-Host ""

# Get Client ID from user
$clientId = Read-Host "Enter your Google OAuth Client ID (format: xxxxx.apps.googleusercontent.com)"

# Validate Client ID format
if (-not $clientId.EndsWith(".apps.googleusercontent.com")) {
    Write-Host "Warning: Client ID doesn't end with '.apps.googleusercontent.com'" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
}

Write-Host "`n📝 Creating .env file" -ForegroundColor Yellow
Write-Host "====================="

# Create .env file
$envContent = @"
# Perfect Zenkai Environment Variables

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=$clientId

# Development
VITE_APP_ENV=development

# Project Information
GOOGLE_CLOUD_PROJECT_NUMBER=$PROJECT_NUMBER
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "✅ .env file created with Google Client ID" -ForegroundColor Green

Write-Host "`n🌐 Netlify Configuration" -ForegroundColor Yellow
Write-Host "========================"

# Check if Netlify CLI is available
if (Test-Command "netlify") {
    Write-Host "✅ Netlify CLI is available" -ForegroundColor Green
    
    $configureNetlify = Read-Host "Do you want to configure Netlify environment variables now? (Y/n)"
    if ($configureNetlify -ne "n" -and $configureNetlify -ne "N") {
        
        Write-Host "Logging into Netlify..." -ForegroundColor Cyan
        netlify login
        
        Write-Host "Setting environment variable..." -ForegroundColor Cyan
        netlify env:set VITE_GOOGLE_CLIENT_ID $clientId
        
        Write-Host "✅ Netlify environment variable set" -ForegroundColor Green
        
        $deploy = Read-Host "Do you want to trigger a new deployment? (Y/n)"
        if ($deploy -ne "n" -and $deploy -ne "N") {
            Write-Host "Deploying to production..." -ForegroundColor Cyan
            netlify deploy --prod
            Write-Host "✅ Deployment triggered" -ForegroundColor Green
        }
    }
} else {
    Write-Host "❌ Netlify CLI not found. Installing..." -ForegroundColor Red
    npm install -g netlify-cli
    Write-Host "✅ Netlify CLI installed. Please run this script again to configure Netlify." -ForegroundColor Green
}

Write-Host "`n🧪 Testing Setup" -ForegroundColor Yellow
Write-Host "================"

# Test environment variable
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "VITE_GOOGLE_CLIENT_ID=(.+)") {
        Write-Host "✅ Environment variable configured: $($matches[1])" -ForegroundColor Green
    } else {
        Write-Host "❌ Environment variable not found in .env" -ForegroundColor Red
    }
} else {
    Write-Host "❌ .env file not found" -ForegroundColor Red
}

Write-Host "`n🎉 Quick Setup Complete!" -ForegroundColor Green
Write-Host "========================="
Write-Host "Your project: $PROJECT_NUMBER" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Start your development server: npm run dev"
Write-Host "2. Navigate to http://localhost:5176"
Write-Host "3. Test the Google OAuth login"
Write-Host ""
Write-Host "If you encounter issues:"
Write-Host "- Check docs/AUTHENTICATION_SETUP.md"
Write-Host "- Verify Google Cloud Console configuration"
Write-Host "- Ensure all redirect URIs are correct"

Write-Host "`n📚 Google Cloud Console URLs for Project $PROJECT_NUMBER" -ForegroundColor Yellow
Write-Host "=========================================================="
Write-Host "OAuth Consent Screen:"
Write-Host "https://console.cloud.google.com/apis/credentials/consent?project=$PROJECT_NUMBER"
Write-Host ""
Write-Host "Credentials:"
Write-Host "https://console.cloud.google.com/apis/credentials?project=$PROJECT_NUMBER"
Write-Host ""
Write-Host "APIs Library:"
Write-Host "https://console.cloud.google.com/apis/library?project=$PROJECT_NUMBER" 