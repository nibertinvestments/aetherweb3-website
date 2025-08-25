# Google Cloud Billing Report - August 23, 2025
# Project: multi-evm-gateway-8511

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "   GOOGLE CLOUD BILLING REPORT - AUGUST 23, 2025" -ForegroundColor Cyan
Write-Host "   Project: multi-evm-gateway-8511" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# VM Runtime Calculation (from creation to now)
$vmStartTime = [DateTime]"2025-08-22T21:48:32"
$currentTime = [DateTime]::Now
$totalHours = ($currentTime - $vmStartTime).TotalHours
$todayHours = 24  # Full day for August 23

Write-Host "COMPUTE ENGINE COSTS" -ForegroundColor Yellow
Write-Host "===================" -ForegroundColor Yellow
Write-Host "VM Runtime Period: $([Math]::Round($totalHours, 2)) total hours"
Write-Host "Today's Runtime: $todayHours hours (full day)"
Write-Host ""

# VM Costs (e2-standard-4 pricing)
$vmHourlyRate = 0.134048  # e2-standard-4 US regions
$vmCount = 3
$vmCostToday = $vmHourlyRate * $vmCount * $todayHours

Write-Host "3x e2-standard-4 VMs:" -ForegroundColor Green
Write-Host "  Rate: `$$vmHourlyRate/hour per VM"
Write-Host "  Count: $vmCount VMs"
Write-Host "  Today: `$$([Math]::Round($vmCostToday, 2))" -ForegroundColor Green
Write-Host ""

# SSD Storage Costs
$ssdGbRate = 0.17  # pd-ssd monthly rate per GB
$ssdDailyRate = $ssdGbRate / 30  # Daily rate
$totalSsdGb = 750  # 3 x 250GB disks
$ssdCostToday = $ssdDailyRate * $totalSsdGb

Write-Host "PERSISTENT SSD STORAGE" -ForegroundColor Yellow
Write-Host "=====================" -ForegroundColor Yellow
Write-Host "3x 250GB pd-ssd disks:" -ForegroundColor Green
Write-Host "  Rate: `$$ssdGbRate/GB/month"
Write-Host "  Total: $totalSsdGb GB"
Write-Host "  Today: `$$([Math]::Round($ssdCostToday, 2))" -ForegroundColor Green
Write-Host ""

# Network Costs
$egressGbRate = 0.12  # Standard egress rate
$estimatedEgressGb = 5  # Estimated daily egress
$networkCostToday = $egressGbRate * $estimatedEgressGb

Write-Host "NETWORK EGRESS" -ForegroundColor Yellow
Write-Host "==============" -ForegroundColor Yellow
Write-Host "Estimated egress:" -ForegroundColor Green
Write-Host "  Rate: `$$egressGbRate/GB"
Write-Host "  Usage: $estimatedEgressGb GB (estimated)"
Write-Host "  Today: `$$([Math]::Round($networkCostToday, 2))" -ForegroundColor Green
Write-Host ""

# Storage Operations
$storageOpsCount = 25  # From cache operations
$storageOpsRate = 0.005  # Per 1000 operations
$storageOpsCost = ($storageOpsCount / 1000) * $storageOpsRate

Write-Host "STORAGE OPERATIONS" -ForegroundColor Yellow
Write-Host "=================" -ForegroundColor Yellow
Write-Host "Cache operations:" -ForegroundColor Green
Write-Host "  Operations: $storageOpsCount"
Write-Host "  Rate: `$$storageOpsRate/1000 ops"
Write-Host "  Today: `$$([Math]::Round($storageOpsCost, 4))" -ForegroundColor Green
Write-Host ""

# Cloud Storage Bucket
$bucketStorageGb = 0  # Empty bucket currently
$bucketStorageRate = 0.023  # Standard storage per GB/month
$bucketDailyRate = $bucketStorageRate / 30
$bucketCostToday = $bucketDailyRate * $bucketStorageGb

Write-Host "CLOUD STORAGE BUCKET" -ForegroundColor Yellow
Write-Host "===================" -ForegroundColor Yellow
Write-Host "triangle2 bucket:" -ForegroundColor Green
Write-Host "  Storage: $bucketStorageGb GB"
Write-Host "  Rate: `$$bucketStorageRate/GB/month"
Write-Host "  Today: `$$([Math]::Round($bucketCostToday, 4))" -ForegroundColor Green
Write-Host ""

# Total Cost Calculation
$totalCostToday = $vmCostToday + $ssdCostToday + $networkCostToday + $storageOpsCost + $bucketCostToday

Write-Host "=" * 40 -ForegroundColor Cyan
Write-Host "TOTAL ESTIMATED COST - TODAY" -ForegroundColor Cyan
Write-Host "=" * 40 -ForegroundColor Cyan
Write-Host ""
Write-Host "Compute VMs:      `$$([Math]::Round($vmCostToday, 2))" -ForegroundColor White
Write-Host "SSD Storage:      `$$([Math]::Round($ssdCostToday, 2))" -ForegroundColor White
Write-Host "Network:          `$$([Math]::Round($networkCostToday, 2))" -ForegroundColor White
Write-Host "Storage Ops:      `$$([Math]::Round($storageOpsCost, 4))" -ForegroundColor White
Write-Host "Bucket Storage:   `$$([Math]::Round($bucketCostToday, 4))" -ForegroundColor White
Write-Host "-" * 25
Write-Host "TODAY'S TOTAL:    `$$([Math]::Round($totalCostToday, 2))" -ForegroundColor Green -BackgroundColor Black
Write-Host ""

# Monthly Projection
$monthlyProjection = $totalCostToday * 30
Write-Host "MONTHLY PROJECTION: `$$([Math]::Round($monthlyProjection, 2))" -ForegroundColor Yellow
Write-Host ""

# Cost Breakdown Percentages
$vmPercent = ($vmCostToday / $totalCostToday) * 100
$storagePercent = ($ssdCostToday / $totalCostToday) * 100
$networkPercent = ($networkCostToday / $totalCostToday) * 100

Write-Host "COST BREAKDOWN" -ForegroundColor Yellow
Write-Host "==============" -ForegroundColor Yellow
Write-Host "VMs:        $([Math]::Round($vmPercent, 1))%" -ForegroundColor Green
Write-Host "SSD:        $([Math]::Round($storagePercent, 1))%" -ForegroundColor Green  
Write-Host "Network:    $([Math]::Round($networkPercent, 1))%" -ForegroundColor Green
Write-Host "Other:      $([Math]::Round(100 - $vmPercent - $storagePercent - $networkPercent, 1))%" -ForegroundColor Green
Write-Host ""

Write-Host "BILLING ACCOUNT: 010B10-83D34E-545473" -ForegroundColor Cyan
Write-Host "STATUS: Active & Enabled" -ForegroundColor Green
Write-Host ""
Write-Host "Report generated: $(Get-Date)" -ForegroundColor Gray