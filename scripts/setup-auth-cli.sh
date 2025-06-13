#!/bin/bash

# Perfect Zenkai Authentication Setup - CLI Automation Script
# This script automates the CLI-based parts of Google OAuth setup

echo "🔐 Perfect Zenkai Authentication Setup - CLI Automation"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to prompt for user input
get_user_input() {
    local prompt="$1"
    local required="${2:-true}"
    local input
    
    while true; do
        read -p "$prompt: " input
        if [[ "$required" == "false" || -n "$input" ]]; then
            echo "$input"
            return
        fi
        echo -e "${YELLOW}This field is required. Please enter a value.${NC}"
    done
}

echo -e "\n${YELLOW}📋 Pre-requisites Check${NC}"
echo "========================"

# Check if Netlify CLI is installed
if command_exists netlify; then
    echo -e "${GREEN}✅ Netlify CLI is installed${NC}"
    netlify --version
else
    echo -e "${RED}❌ Netlify CLI not found. Installing...${NC}"
    npm install -g netlify-cli
    echo -e "${GREEN}✅ Netlify CLI installed${NC}"
fi

# Check if Google Cloud CLI is installed
if command_exists gcloud; then
    echo -e "${GREEN}✅ Google Cloud CLI is installed${NC}"
    gcloud --version
else
    echo -e "${RED}❌ Google Cloud CLI not found${NC}"
    echo -e "${YELLOW}Please install Google Cloud CLI from: https://cloud.google.com/sdk/docs/install${NC}"
    echo -e "${YELLOW}After installation, run this script again.${NC}"
    read -p "Do you want to continue without Google Cloud CLI? (y/N): " install_gcloud
    if [[ "$install_gcloud" != "y" && "$install_gcloud" != "Y" ]]; then
        exit 1
    fi
fi

echo -e "\n${YELLOW}🔧 Manual Steps Required${NC}"
echo "========================="
echo "The following steps MUST be done manually in Google Cloud Console:"
echo "1. Create Google Cloud Project"
echo "2. Configure OAuth Consent Screen"
echo "3. Create OAuth 2.0 Credentials"
echo "4. Copy the Client ID"
echo ""
echo "Please complete these steps first, then return here with your Client ID."
echo ""

# Get Client ID from user
client_id=$(get_user_input "Enter your Google OAuth Client ID (format: xxxxx.apps.googleusercontent.com)")

# Validate Client ID format
if [[ ! "$client_id" == *.apps.googleusercontent.com ]]; then
    echo -e "${YELLOW}⚠️  Warning: Client ID doesn't end with '.apps.googleusercontent.com'${NC}"
    read -p "Continue anyway? (y/N): " continue_anyway
    if [[ "$continue_anyway" != "y" && "$continue_anyway" != "Y" ]]; then
        exit 1
    fi
fi

echo -e "\n${YELLOW}📝 Creating .env file${NC}"
echo "====================="

# Create .env file
cat > .env << EOF
# Perfect Zenkai Environment Variables

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=$client_id

# Development
VITE_APP_ENV=development
EOF

echo -e "${GREEN}✅ .env file created with Google Client ID${NC}"

echo -e "\n${YELLOW}🌐 Netlify Configuration${NC}"
echo "========================"

# Check if user wants to configure Netlify
read -p "Do you want to configure Netlify environment variables? (Y/n): " configure_netlify
if [[ "$configure_netlify" != "n" && "$configure_netlify" != "N" ]]; then
    
    echo -e "${CYAN}Logging into Netlify...${NC}"
    netlify login
    
    echo -e "${CYAN}Setting environment variable...${NC}"
    netlify env:set VITE_GOOGLE_CLIENT_ID "$client_id"
    
    echo -e "${GREEN}✅ Netlify environment variable set${NC}"
    
    read -p "Do you want to trigger a new deployment? (Y/n): " deploy
    if [[ "$deploy" != "n" && "$deploy" != "N" ]]; then
        echo -e "${CYAN}Deploying to production...${NC}"
        netlify deploy --prod
        echo -e "${GREEN}✅ Deployment triggered${NC}"
    fi
fi

echo -e "\n${YELLOW}☁️  Google Cloud Configuration${NC}"
echo "==============================="

if command_exists gcloud; then
    read -p "Do you want to configure Google Cloud APIs? (Y/n): " configure_gcloud
    if [[ "$configure_gcloud" != "n" && "$configure_gcloud" != "N" ]]; then
        
        project_id=$(get_user_input "Enter your Google Cloud Project ID")
        
        echo -e "${CYAN}Logging into Google Cloud...${NC}"
        gcloud auth login
        
        echo -e "${CYAN}Setting project...${NC}"
        gcloud config set project "$project_id"
        
        echo -e "${CYAN}Enabling required APIs...${NC}"
        gcloud services enable identitytoolkit.googleapis.com
        gcloud services enable people.googleapis.com
        
        echo -e "${GREEN}✅ Google Cloud APIs enabled${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Google Cloud CLI not available - skipping API enablement${NC}"
fi

echo -e "\n${YELLOW}🧪 Testing Setup${NC}"
echo "================"

# Test environment variable
if [[ -f ".env" ]]; then
    if grep -q "VITE_GOOGLE_CLIENT_ID=" .env; then
        client_id_from_file=$(grep "VITE_GOOGLE_CLIENT_ID=" .env | cut -d'=' -f2)
        echo -e "${GREEN}✅ Environment variable configured: $client_id_from_file${NC}"
    else
        echo -e "${RED}❌ Environment variable not found in .env${NC}"
    fi
else
    echo -e "${RED}❌ .env file not found${NC}"
fi

echo -e "\n${GREEN}🎉 Setup Complete!${NC}"
echo "=================="
echo "Next steps:"
echo "1. Start your development server: npm run dev"
echo "2. Navigate to http://localhost:5176"
echo "3. Test the Google OAuth login"
echo ""
echo "If you encounter issues, check the troubleshooting section in:"
echo "docs/AUTHENTICATION_SETUP.md"

echo -e "\n${YELLOW}📚 Manual Verification Checklist${NC}"
echo "================================="
echo "Please verify these settings in Google Cloud Console:"
echo "□ OAuth consent screen is configured"
echo "□ Test users include your email"
echo "□ Authorized redirect URIs include:"
echo "  - http://localhost:5176/auth/callback"
echo "  - https://perfectzenkai.netlify.app/auth/callback"
echo "□ Authorized domains include:"
echo "  - perfectzenkai.netlify.app"
echo "  - localhost" 