# Perfect Zenkai Security Fixes - Remote Application Script
# This script applies the critical security fixes to a remote Supabase instance

Write-Host "Perfect Zenkai Security Fixes Application" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

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

# Check if Supabase CLI is available
if (-not (Test-Command "npx")) {
    Write-Host "❌ NPX not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

Write-Host "OK: NPX is available - will use npx supabase" -ForegroundColor Green

Write-Host "`nSecurity Issues to Fix" -ForegroundColor Yellow
Write-Host "======================"
Write-Host "This script will fix the following critical security issues:"
Write-Host "1. ISSUE: auth_users_exposed - user_lookup view exposed to anonymous users"
Write-Host "2. ISSUE: security_definer_view - Views bypassing RLS policies"
Write-Host "3. ISSUE: rls_disabled_in_public - No RLS on goals and journal_entries tables"
Write-Host ""

$continue = Read-Host "Do you want to proceed with applying these fixes? (Y/n)"
if ($continue -eq "n" -or $continue -eq "N") {
    Write-Host "Aborted by user." -ForegroundColor Yellow
    exit 0
}

Write-Host "`nSupabase Connection Setup" -ForegroundColor Yellow
Write-Host "========================="

# Check if already linked to a project
$projectRef = ""
try {
    $linkStatus = npx supabase status 2>&1
    if ($linkStatus -like "*Project URL*") {
        Write-Host "OK: Already linked to a Supabase project" -ForegroundColor Green
        $useExisting = Read-Host "Use existing project link? (Y/n)"
        if ($useExisting -eq "n" -or $useExisting -eq "N") {
            $projectRef = Get-UserInput "Enter your Supabase project reference ID"
        }
    } else {
        Write-Host "ERROR: Not linked to any Supabase project" -ForegroundColor Red
        $projectRef = Get-UserInput "Enter your Supabase project reference ID"
    }
} catch {
    Write-Host "ERROR: Error checking Supabase status" -ForegroundColor Red
    $projectRef = Get-UserInput "Enter your Supabase project reference ID"
}

# Link to project if needed
if ($projectRef) {
    Write-Host "`nLinking to Supabase project..." -ForegroundColor Cyan
    npx supabase login
    npx supabase link --project-ref $projectRef
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to link to Supabase project" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Successfully linked to Supabase project" -ForegroundColor Green
}

Write-Host "`n📤 Applying Security Migration" -ForegroundColor Yellow
Write-Host "==============================="

# Apply the security fixes migration
Write-Host "Applying security fixes migration..." -ForegroundColor Cyan
$migrationFile = "supabase/migrations/20250616000000_fix_critical_security_issues.sql"

if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ Migration file not found: $migrationFile" -ForegroundColor Red
    Write-Host "Please ensure the migration file exists." -ForegroundColor Yellow
    exit 1
}

# Push migration to remote
npx supabase db push

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to apply security migration" -ForegroundColor Red
    Write-Host "Please check the error above and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Security migration applied successfully!" -ForegroundColor Green

Write-Host "`n🔍 Verification" -ForegroundColor Yellow
Write-Host "==============="

# Run database linter to verify fixes
Write-Host "Running database linter to verify fixes..." -ForegroundColor Cyan
npx supabase db lint

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database linter passed - security issues fixed!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Database linter found issues - please review the output above" -ForegroundColor Yellow
}

Write-Host "`n🧪 Security Validation" -ForegroundColor Yellow
Write-Host "======================"
Write-Host "To validate the security fixes work correctly:"
Write-Host "1. Create test users in your Supabase dashboard"
Write-Host "2. Test data isolation - each user should only see their own data"
Write-Host "3. Test anonymous access is blocked"
Write-Host "4. Verify RLS policies are working"

Write-Host "`n✅ Security Fixes Applied!" -ForegroundColor Green
Write-Host "=========================="
Write-Host "The following security issues have been fixed:"
Write-Host "✅ user_lookup view - now requires authentication"
Write-Host "✅ security_definer_view - removed SECURITY DEFINER, added user filtering"
Write-Host "✅ rls_disabled_in_public - enabled RLS on goals and journal_entries"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Update your frontend code to handle the new security model"
Write-Host "2. Test all user flows thoroughly"
Write-Host "3. Deploy frontend updates to production"
Write-Host ""
Write-Host "📚 Documentation: docs/SECURITY_FIXES_APPLIED.md" 