```powershell
# DNS Setup for aetherweb3.xyz
Write-Host "Setting up DNS for aetherweb3.xyz..." -ForegroundColor Cyan

$headers = @{
    "Authorization" = "Bearer cvAtsTuHLRQIxL3xKJFQMWUQBR99UXQGoDF0B0hG"
    "Content-Type" = "application/json"
}

$zoneId = "f62fea2b1c2b622c3db71cc67eee7085"

Write-Host "Creating DNS records..." -ForegroundColor Yellow

# Create main domain CNAME to GitHub Pages
$mainDomain = @{
    type = "CNAME"
    name = "aetherweb3.xyz"
    content = "nibertinvestments.github.io"
    proxied = $true
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records" -Method POST -Headers $headers -Body $mainDomain
    Write-Host "Main domain DNS record created successfully" -ForegroundColor Green
} catch {
    Write-Host "Main domain record might already exist" -ForegroundColor Yellow
}

# Create www subdomain
$wwwDomain = @{
    type = "CNAME"
    name = "www"
    content = "aetherweb3.xyz"
    proxied = $true
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records" -Method POST -Headers $headers -Body $wwwDomain
    Write-Host "WWW subdomain DNS record created successfully" -ForegroundColor Green
} catch {
    Write-Host "WWW record might already exist" -ForegroundColor Yellow
}

# Create API subdomain for backend
$apiDomain = @{
    type = "CNAME"
    name = "api"
    content = "multi-evm-gateway-197221342816.us-central1.run.app"
    proxied = $true
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records" -Method POST -Headers $headers -Body $apiDomain
    Write-Host "API subdomain DNS record created successfully" -ForegroundColor Green
} catch {
    Write-Host "API record might already exist" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Configuring security settings..." -ForegroundColor Yellow

# Enable security features
$securitySettings = @(
    @{ id = "ssl"; value = "full" },
    @{ id = "always_use_https"; value = "on" },
    @{ id = "min_tls_version"; value = "1.2" },
    @{ id = "security_level"; value = "medium" }
)

foreach ($setting in $securitySettings) {
    $body = @{ value = $setting.value } | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/settings/$($setting.id)" -Method PATCH -Headers $headers -Body $body
        Write-Host "$($setting.id) set to $($setting.value)" -ForegroundColor Green
    } catch {
        Write-Host "Could not update $($setting.id)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Cloudflare setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Your URLs:" -ForegroundColor Cyan
Write-Host "   Main site: https://aetherweb3.xyz" -ForegroundColor White
Write-Host "   WWW: https://www.aetherweb3.xyz" -ForegroundColor White
Write-Host "   API: https://api.aetherweb3.xyz" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. DNS propagation may take up to 24 hours" -ForegroundColor White
Write-Host "2. Your domain should start working soon!" -ForegroundColor White
Write-Host "3. GoDaddy parking page will be replaced automatically" -ForegroundColor White
```