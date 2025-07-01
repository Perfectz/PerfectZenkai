# Perfect Zenkai Code Analysis with Gemini CLI
Write-Host "=== Perfect Zenkai Code Analysis ===" -ForegroundColor Green
Write-Host ""

# Check if API key is set
if (-not $env:GEMINI_API_KEY) {
    Write-Host "ERROR: GEMINI_API_KEY environment variable not set!" -ForegroundColor Red
    Write-Host "Please run: " -ForegroundColor Yellow
    Write-Host '$env:GEMINI_API_KEY="your_api_key_here"' -ForegroundColor Green
    exit 1
}

Write-Host "API Key found. Starting comprehensive code analysis..." -ForegroundColor Green
Write-Host ""

# Analysis prompts for different aspects
$analyses = @(
    @{
        Name = "TypeScript Type Safety Analysis"
        Prompt = "Analyze this React TypeScript codebase for type safety issues. Focus on: 1) Missing type annotations 2) 'any' usage 3) Type assertion issues 4) Interface/type completeness 5) Generic type usage. Provide specific file locations and fixes."
    },
    @{
        Name = "React Best Practices Analysis"
        Prompt = "Analyze this React codebase for best practices violations. Focus on: 1) Component structure and patterns 2) Hook usage and dependencies 3) State management patterns 4) Event handling 5) Component lifecycle. Provide specific recommendations."
    },
    @{
        Name = "Performance Optimization Analysis"
        Prompt = "Analyze this codebase for performance issues and optimizations. Focus on: 1) Bundle size optimizations 2) Rendering performance 3) Memory leaks 4) Unnecessary re-renders 5) Lazy loading opportunities. Suggest specific improvements."
    },
    @{
        Name = "Security Vulnerability Analysis"
        Prompt = "Analyze this codebase for security vulnerabilities. Focus on: 1) XSS prevention 2) Input validation 3) Authentication/authorization 4) Data sanitization 5) Dependency vulnerabilities. Highlight critical issues."
    },
    @{
        Name = "Code Maintainability Analysis"
        Prompt = "Analyze this codebase for maintainability issues. Focus on: 1) Code organization and structure 2) Naming conventions 3) Code duplication 4) Function/component complexity 5) Documentation quality. Suggest refactoring opportunities."
    }
)

# Create results directory
$resultsDir = "gemini-analysis-results"
if (Test-Path $resultsDir) {
    Remove-Item $resultsDir -Recurse -Force
}
New-Item -ItemType Directory -Path $resultsDir | Out-Null

Write-Host "Running $($analyses.Count) comprehensive analyses..." -ForegroundColor Cyan
Write-Host ""

foreach ($analysis in $analyses) {
    Write-Host "🔍 Running: $($analysis.Name)" -ForegroundColor Yellow
    
    $outputFile = Join-Path $resultsDir "$($analysis.Name -replace ' ', '_').md"
    
    try {
        # Run Gemini analysis and save to file
        $result = gemini -p $analysis.Prompt --all_files 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            # Save results to markdown file
            @"
# $($analysis.Name)

## Analysis Prompt
$($analysis.Prompt)

## Results
$result

---
Generated on $(Get-Date)
"@ | Out-File -FilePath $outputFile -Encoding UTF8
            
            Write-Host "   ✅ Completed - Results saved to: $outputFile" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Failed - Error: $result" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ❌ Exception: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Start-Sleep -Seconds 2  # Rate limiting
}

Write-Host "=== Analysis Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Results saved in: $resultsDir" -ForegroundColor Cyan
Write-Host "Files created:" -ForegroundColor White
Get-ChildItem $resultsDir -Name | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review analysis results in the $resultsDir folder" -ForegroundColor White
Write-Host "2. Prioritize critical security and performance issues" -ForegroundColor White
Write-Host "3. Implement suggested fixes and improvements" -ForegroundColor White
Write-Host "4. Re-run analysis to verify improvements" -ForegroundColor White 