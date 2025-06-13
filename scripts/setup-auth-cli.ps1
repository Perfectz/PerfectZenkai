# Perfect Zenkai Authentication Setup - CLI Automation Script
# This script automates the CLI-based parts of Google OAuth setup

Write-Host "🔐 Perfect Zenkai Authentication Setup - CLI Automation" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Function to prompt for user input
function Get-UserInput($prompt, $required = $true) {
    do {
        $input = Read-Host $prompt
        if (-not $required -or $input) {
            return $input
        }
        Write-Host "This field is required. Please enter a value." -ForegroundColor Yellow
    } while ($true)
}

Write-Host "`n📋 Pre-requisites Check" -ForegroundColor Yellow
Write-Host "========================"

# Check if Netlify CLI is installed
if (Test-Command "netlify") {
    Write-Host "✅ Netlify CLI is installed" -ForegroundColor Green
    netlify --version
} else {
    Write-Host "❌ Netlify CLI not found. Installing..." -ForegroundColor Red
    npm install -g netlify-cli
    Write-Host "✅ Netlify CLI installed" -ForegroundColor Green
}

# Check if Google Cloud CLI is installed
if (Test-Command "gcloud") {
    Write-Host "✅ Google Cloud CLI is installed" -ForegroundColor Green
    gcloud --version
} else {
    Write-Host "❌ Google Cloud CLI not found" -ForegroundColor Red
    Write-Host "Please install Google Cloud CLI from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    Write-Host "After installation, run this script again." -ForegroundColor Yellow
    $installGcloud = Read-Host "Do you want to continue without Google Cloud CLI? (y/N)"
    if ($installGcloud -ne "y" -and $installGcloud -ne "Y") {
        exit 1
    }
}

Write-Host "`n🔧 Manual Steps Required" -ForegroundColor Yellow
Write-Host "========================="
Write-Host "The following steps MUST be done manually in Google Cloud Console:"
Write-Host "1. Create Google Cloud Project"
Write-Host "2. Configure OAuth Consent Screen"
Write-Host "3. Create OAuth 2.0 Credentials"
Write-Host "4. Copy the Client ID"
Write-Host ""
Write-Host "Please complete these steps first, then return here with your Client ID."
Write-Host ""

# Get Client ID from user
$clientId = Get-UserInput "Enter your Google OAuth Client ID (format: xxxxx.apps.googleusercontent.com)"

# Validate Client ID format
if (-not $clientId.EndsWith(".apps.googleusercontent.com")) {
    Write-Host "⚠️  Warning: Client ID doesn't end with '.apps.googleusercontent.com'" -ForegroundColor Yellow
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
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "✅ .env file created with Google Client ID" -ForegroundColor Green

Write-Host "`n🌐 Netlify Configuration" -ForegroundColor Yellow
Write-Host "========================"

# Check if user wants to configure Netlify
$configureNetlify = Read-Host "Do you want to configure Netlify environment variables? (Y/n)"
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

Write-Host "`n☁️  Google Cloud Configuration" -ForegroundColor Yellow
Write-Host "==============================="

if (Test-Command "gcloud") {
    $configureGcloud = Read-Host "Do you want to configure Google Cloud APIs? (Y/n)"
    if ($configureGcloud -ne "n" -and $configureGcloud -ne "N") {
        
        $projectId = Get-UserInput "Enter your Google Cloud Project ID"
        
        Write-Host "Logging into Google Cloud..." -ForegroundColor Cyan
        gcloud auth login
        
        Write-Host "Setting project..." -ForegroundColor Cyan
        gcloud config set project $projectId
        
        Write-Host "Enabling required APIs..." -ForegroundColor Cyan
        gcloud services enable identitytoolkit.googleapis.com
        gcloud services enable people.googleapis.com
        
        Write-Host "✅ Google Cloud APIs enabled" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  Google Cloud CLI not available - skipping API enablement" -ForegroundColor Yellow
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

Write-Host "`n🎉 Setup Complete!" -ForegroundColor Green
Write-Host "=================="
Write-Host "Next steps:"
Write-Host "1. Start your development server: npm run dev"
Write-Host "2. Navigate to http://localhost:5176"
Write-Host "3. Test the Google OAuth login"
Write-Host ""
Write-Host "If you encounter issues, check the troubleshooting section in:"
Write-Host "docs/AUTHENTICATION_SETUP.md"

Write-Host "`n📚 Manual Verification Checklist" -ForegroundColor Yellow
Write-Host "================================="
Write-Host "Please verify these settings in Google Cloud Console:"
Write-Host "□ OAuth consent screen is configured"
Write-Host "□ Test users include your email"
Write-Host "□ Authorized redirect URIs include:"
Write-Host "  - http://localhost:5176/auth/callback"
Write-Host "  - https://perfectzenkai.netlify.app/auth/callback"
Write-Host "□ Authorized domains include:"
Write-Host "  - perfectzenkai.netlify.app"
Write-Host "  - localhost" 