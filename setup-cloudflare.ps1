# Cloudflare Setup Automation for aetherweb3.xyz
# PowerShell Script

Write-Host "🚀 AetherWeb3 Cloudflare Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Check if .env file exists
$envPath = ".\multi-evm-gateway\gateway\.env"
if (!(Test-Path $envPath)) {
    Write-Host "❌ .env file not found at $envPath" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Step 1: Get your Cloudflare API Token" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to: https://dash.cloudflare.com/profile/api-tokens" -ForegroundColor White
Write-Host "2. Click 'Create Token'" -ForegroundColor White
Write-Host "3. Use 'Custom token' template" -ForegroundColor White
Write-Host "4. Set permissions:" -ForegroundColor White
Write-Host "   - Zone:Zone:Edit" -ForegroundColor Gray
Write-Host "   - Zone:DNS:Edit" -ForegroundColor Gray
Write-Host "   - Zone:Page Rules:Edit" -ForegroundColor Gray
Write-Host "   - Zone:Zone Settings:Edit" -ForegroundColor Gray
Write-Host "5. Zone Resources: Include - Specific zone - aetherweb3.xyz" -ForegroundColor White
Write-Host "6. Create Token and copy it" -ForegroundColor White
Write-Host ""

# Prompt for API token
$apiToken = Read-Host "Enter your Cloudflare API Token"

if ([string]::IsNullOrWhiteSpace($apiToken)) {
    Write-Host "❌ API Token is required" -ForegroundColor Red
    exit 1
}

Write-Host "🔧 Updating .env file..." -ForegroundColor Yellow

# Read .env file
$envContent = Get-Content $envPath -Raw

# Replace the API token line
$envContent = $envContent -replace "CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here", "CLOUDFLARE_API_TOKEN=$apiToken"

# Write back to .env file
Set-Content -Path $envPath -Value $envContent -NoNewline

Write-Host "✅ .env file updated" -ForegroundColor Green

Write-Host "🌐 Running Cloudflare setup..." -ForegroundColor Yellow

# Set environment variables from .env for Node.js script
Get-Content $envPath | Where-Object { $_ -match '^[^#].*=' } | ForEach-Object {
    $key, $value = $_ -split '=', 2
    [Environment]::SetEnvironmentVariable($key, $value, 'Process')
}

# Run the Node.js setup script
try {
    node .\cloudflare-setup.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🎉 Cloudflare setup completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Next steps:" -ForegroundColor Yellow
        Write-Host "1. If you own aetherweb3.xyz, update nameservers to Cloudflare" -ForegroundColor White
        Write-Host "2. If you don't own it, purchase the domain and set nameservers" -ForegroundColor White
        Write-Host "3. Wait for DNS propagation (24-48 hours)" -ForegroundColor White
        Write-Host "4. Test your site at https://aetherweb3.xyz" -ForegroundColor White
        Write-Host ""
        Write-Host "🔗 Your endpoints will be:" -ForegroundColor Cyan
        Write-Host "   Main site: https://aetherweb3.xyz" -ForegroundColor White
        Write-Host "   API:       https://api.aetherweb3.xyz" -ForegroundColor White
        Write-Host "   WWW:       https://www.aetherweb3.xyz" -ForegroundColor White
        Write-Host ""
        Write-Host "🎯 GitHub Pages is now configured for aetherweb3.xyz" -ForegroundColor Green
        Write-Host "🛡️  DDoS protection and security rules are active" -ForegroundColor Green
        Write-Host "🚀 Your site is production-ready!" -ForegroundColor Green
    } else {
        Write-Host "❌ Setup failed. Check the output above for errors." -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error running setup script: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "📚 For detailed instructions, see: cloudflare-complete-setup.md" -ForegroundColor Cyan

# Pause to let user read the output
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")