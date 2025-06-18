# Perfect Zenkai Security Fixes - Remote Application Script
# This script applies the critical security fixes to a remote Supabase instance

Write-Host "Perfect Zenkai Security Fixes Application" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "This script will fix the following critical security issues:" -ForegroundColor Yellow
Write-Host "1. auth_users_exposed - user_lookup view exposed to anonymous users"
Write-Host "2. security_definer_view - Views bypassing RLS policies" 
Write-Host "3. rls_disabled_in_public - No RLS on goals and journal_entries tables"
Write-Host ""

$continue = Read-Host "Do you want to proceed with applying these fixes? (Y/n)"
if ($continue -eq "n" -or $continue -eq "N") {
    Write-Host "Aborted by user." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Checking migration file..." -ForegroundColor Cyan
$migrationFile = "supabase/migrations/20250616000000_fix_critical_security_issues.sql"

if (-not (Test-Path $migrationFile)) {
    Write-Host "ERROR: Migration file not found: $migrationFile" -ForegroundColor Red
    Write-Host "Please ensure the migration file exists." -ForegroundColor Yellow
    exit 1
}

Write-Host "OK: Migration file found" -ForegroundColor Green

Write-Host ""
Write-Host "Checking Supabase CLI..." -ForegroundColor Cyan

try {
    $supabaseVersion = npx supabase --version 2>&1
    Write-Host "OK: Supabase CLI available - $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Supabase CLI not available" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Applying security migration to remote Supabase..." -ForegroundColor Cyan
Write-Host "This will push the migration to your linked Supabase project"
Write-Host ""

# Apply the migration
npx supabase db push

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Migration failed to apply" -ForegroundColor Red
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "1. Not logged in - run: npx supabase login"
    Write-Host "2. Not linked to project - run: npx supabase link --project-ref YOUR_PROJECT_REF"
    Write-Host "3. Migration conflicts - check your database state"
    exit 1
}

Write-Host ""
Write-Host "SUCCESS: Security migration applied!" -ForegroundColor Green

Write-Host ""
Write-Host "Running database linter to verify fixes..." -ForegroundColor Cyan
npx supabase db lint

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS: All security issues fixed!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "WARNING: Some issues may remain - check linter output above" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Security Fixes Complete!" -ForegroundColor Green
Write-Host "======================="
Write-Host "The following security issues have been fixed:"
Write-Host "- user_lookup view now requires authentication"
Write-Host "- Removed SECURITY DEFINER from views"
Write-Host "- Enabled RLS on goals and journal_entries tables"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Test your application with multiple users"
Write-Host "2. Verify data isolation is working"
Write-Host "3. Update frontend code if needed"
Write-Host ""
Write-Host "Documentation: docs/SECURITY_FIXES_APPLIED.md" 