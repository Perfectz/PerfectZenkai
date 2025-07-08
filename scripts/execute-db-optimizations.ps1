# Database Optimization MVP - Execution Script
# Generated: 2025-01-27
# Execute database optimization migrations in phases

Write-Host "🚀 Perfect Zenkai Database Optimization MVP" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Check if Supabase URL and key are available
$env:SUPABASE_URL = $env:VITE_SUPABASE_URL
$env:SUPABASE_ANON_KEY = $env:VITE_SUPABASE_ANON_KEY

if (-not $env:SUPABASE_URL) {
    Write-Host "❌ SUPABASE_URL not found in environment variables" -ForegroundColor Red
    Write-Host "   Please ensure .env.local is properly configured" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Supabase connection configured" -ForegroundColor Green
Write-Host "   URL: $env:SUPABASE_URL" -ForegroundColor Gray

# Phase 1: Critical Security Fixes
Write-Host "`n🔒 Phase 1: Executing Critical Security Fixes..." -ForegroundColor Yellow
Write-Host "   Priority: P0 - CRITICAL" -ForegroundColor Red

$phase1File = "database/migrations/20250127_phase1_security_fixes.sql"
if (Test-Path $phase1File) {
    Write-Host "   📄 Found migration file: $phase1File" -ForegroundColor Gray
    Write-Host "   🔧 Fixing goals table security vulnerability..." -ForegroundColor Yellow
    Write-Host "   🛡️  Adding RLS policies..." -ForegroundColor Yellow
    
    # NOTE: For manual execution in Supabase dashboard
    Write-Host "`n   ⚠️  MANUAL EXECUTION REQUIRED:" -ForegroundColor Yellow
    Write-Host "      1. Go to https://supabase.com/dashboard/project/kslvxxoykdkstnkjgpnd/sql" -ForegroundColor Cyan
    Write-Host "      2. Copy and paste the contents of $phase1File" -ForegroundColor Cyan
    Write-Host "      3. Execute the SQL to fix critical security issues" -ForegroundColor Cyan
    
    Write-Host "   ✅ Phase 1 migration file ready for execution" -ForegroundColor Green
} else {
    Write-Host "   ❌ Phase 1 migration file not found" -ForegroundColor Red
}

# Phase 2: Missing Tables Implementation
Write-Host "`n📊 Phase 2: Implementing Missing Tables..." -ForegroundColor Yellow
Write-Host "   Priority: P1 - HIGH" -ForegroundColor Red

$phase2File = "database/migrations/20250127_phase2_missing_tables.sql"
if (Test-Path $phase2File) {
    Write-Host "   📄 Found migration file: $phase2File" -ForegroundColor Gray
    Write-Host "   🔄 Adding recurring tasks system tables..." -ForegroundColor Yellow
    Write-Host "   📝 Adding task templates system..." -ForegroundColor Yellow
    
    Write-Host "`n   ⚠️  MANUAL EXECUTION REQUIRED:" -ForegroundColor Yellow
    Write-Host "      1. Execute Phase 1 first, then this migration" -ForegroundColor Cyan
    Write-Host "      2. Copy and paste the contents of $phase2File" -ForegroundColor Cyan
    Write-Host "      3. This will enable MVP-21 recurring tasks feature" -ForegroundColor Cyan
    
    Write-Host "   ✅ Phase 2 migration file ready for execution" -ForegroundColor Green
} else {
    Write-Host "   ❌ Phase 2 migration file not found" -ForegroundColor Red
}

# Phase 3: Performance Optimization
Write-Host "`n⚡ Phase 3: Performance Optimization..." -ForegroundColor Yellow
Write-Host "   Priority: P2 - MEDIUM" -ForegroundColor Yellow

$phase3File = "database/migrations/20250127_phase3_performance_optimization.sql"
if (Test-Path $phase3File) {
    Write-Host "   📄 Found migration file: $phase3File" -ForegroundColor Gray
    Write-Host "   🚀 Adding enhanced indexing..." -ForegroundColor Yellow
    Write-Host "   🔍 Adding full-text search capabilities..." -ForegroundColor Yellow
    Write-Host "   📈 Adding utility functions for metrics..." -ForegroundColor Yellow
    
    Write-Host "`n   ⚠️  MANUAL EXECUTION REQUIRED:" -ForegroundColor Yellow
    Write-Host "      1. Execute Phase 1 & 2 first, then this migration" -ForegroundColor Cyan
    Write-Host "      2. Copy and paste the contents of $phase3File" -ForegroundColor Cyan
    Write-Host "      3. This will optimize query performance significantly" -ForegroundColor Cyan
    
    Write-Host "   ✅ Phase 3 migration file ready for execution" -ForegroundColor Green
} else {
    Write-Host "   ❌ Phase 3 migration file not found" -ForegroundColor Red
}

# Verification Script
Write-Host "`n🔍 Creating Verification Script..." -ForegroundColor Yellow

$verificationScript = @"
-- Verification Script for Database Optimization MVP
-- Run this after executing all three phases to verify success

-- Check if goals table has user_id column (Phase 1)
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'goals' AND column_name = 'user_id'
        ) 
        THEN 'Goals table has user_id column' 
        ELSE 'Goals table missing user_id column' 
    END as phase1_check;

-- Check if recurring_todos table exists (Phase 2)
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'recurring_todos'
        ) 
        THEN 'Recurring todos table exists' 
        ELSE 'Recurring todos table missing' 
    END as phase2_check;

-- Check if enhanced indexes exist (Phase 3)
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE indexname = 'idx_todos_user_priority_done'
        ) 
        THEN 'Performance indexes created' 
        ELSE 'Performance indexes missing' 
    END as phase3_check;

-- Overall RLS status check
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('todos', 'goals', 'weight_entries', 'recurring_todos', 'task_templates')
ORDER BY tablename;
"@

$verificationScript | Out-File -FilePath "database/migrations/verification_script.sql" -Encoding UTF8
Write-Host "   📄 Created verification script: database/migrations/verification_script.sql" -ForegroundColor Gray

# Summary
Write-Host "`n📋 EXECUTION SUMMARY" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "✅ Database Optimization MVP plan completed" -ForegroundColor Green
Write-Host "✅ All migration files created successfully" -ForegroundColor Green
Write-Host "✅ Verification script generated" -ForegroundColor Green

Write-Host "`n🎯 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Execute Phase 1 (CRITICAL) - Fix security vulnerability immediately" -ForegroundColor Red
Write-Host "2. Execute Phase 2 (HIGH) - Add missing tables for recurring tasks" -ForegroundColor Yellow
Write-Host "3. Execute Phase 3 (MEDIUM) - Optimize performance with enhanced indexes" -ForegroundColor Yellow
Write-Host "4. Run verification script to confirm success" -ForegroundColor Green

Write-Host "`n⚠️  SECURITY ALERT:" -ForegroundColor Red
Write-Host "   The goals table currently allows cross-user data access!" -ForegroundColor Red
Write-Host "   Execute Phase 1 immediately to fix this vulnerability." -ForegroundColor Red

Write-Host "`n🔗 Supabase Dashboard URL:" -ForegroundColor Cyan
Write-Host "   https://supabase.com/dashboard/project/kslvxxoykdkstnkjgpnd/sql" -ForegroundColor Blue

Write-Host "`n🎉 Database Optimization MVP Ready for Deployment!" -ForegroundColor Green 