# Comprehensive Google Cloud Project Audit Script
# This script provides a complete overview of all resources in the multi-evm-gateway project

Write-Host "=== GOOGLE CLOUD PROJECT AUDIT ===" -ForegroundColor Cyan
Write-Host "Starting comprehensive audit of multi-evm-gateway-8511..." -ForegroundColor Green
Write-Host ""

# Check authentication status
Write-Host "1. AUTHENTICATION STATUS" -ForegroundColor Yellow
Write-Host "========================" -ForegroundColor Yellow
try {
    $auth = gcloud auth list --format="value(account)" 2>$null
    if ($auth) {
        Write-Host "✓ Authenticated as: $auth" -ForegroundColor Green
    } else {
        Write-Host "✗ Not authenticated" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Authentication check failed" -ForegroundColor Red
}
Write-Host ""

# Project information
Write-Host "2. PROJECT INFORMATION" -ForegroundColor Yellow
Write-Host "=====================" -ForegroundColor Yellow
try {
    $project = gcloud config get-value project 2>$null
    Write-Host "Current project: $project" -ForegroundColor Green
    
    gcloud projects describe $project --format="table(name,projectId,projectNumber,lifecycleState,createTime)" 2>$null
} catch {
    Write-Host "✗ Failed to get project information" -ForegroundColor Red
}
Write-Host ""

# Enabled APIs
Write-Host "3. ENABLED APIS & SERVICES" -ForegroundColor Yellow
Write-Host "==========================" -ForegroundColor Yellow
try {
    Write-Host "Enabled APIs:" -ForegroundColor Green
    gcloud services list --enabled --format="table(name,title)" 2>$null
} catch {
    Write-Host "✗ Failed to list enabled APIs" -ForegroundColor Red
}
Write-Host ""

# Compute instances
Write-Host "4. COMPUTE INSTANCES" -ForegroundColor Yellow
Write-Host "===================" -ForegroundColor Yellow
try {
    $instances = gcloud compute instances list --format="csv(name,zone,status,machineType.basename(),internalIP,externalIP)" 2>$null
    if ($instances) {
        Write-Host "VM Instances:" -ForegroundColor Green
        $instances | ForEach-Object { Write-Host $_ }
    } else {
        Write-Host "No compute instances found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Failed to list compute instances" -ForegroundColor Red
}
Write-Host ""

# Storage buckets
Write-Host "5. STORAGE BUCKETS" -ForegroundColor Yellow
Write-Host "=================" -ForegroundColor Yellow
try {
    $buckets = gcloud storage buckets list --format="csv(name,location,storageClass)" 2>$null
    if ($buckets) {
        Write-Host "Storage Buckets:" -ForegroundColor Green
        $buckets | ForEach-Object { Write-Host $_ }
        
        # Get bucket usage
        Write-Host ""
        Write-Host "Bucket Usage Details:" -ForegroundColor Green
        gcloud storage buckets list --format="table(name,location,storageClass,metageneration)" 2>$null
    } else {
        Write-Host "No storage buckets found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Failed to list storage buckets" -ForegroundColor Red
}
Write-Host ""

# Network resources
Write-Host "6. NETWORK RESOURCES" -ForegroundColor Yellow
Write-Host "===================" -ForegroundColor Yellow
try {
    Write-Host "VPC Networks:" -ForegroundColor Green
    gcloud compute networks list --format="table(name,subnet_mode,bgp_routing_mode,ipv4_range)" 2>$null
    
    Write-Host ""
    Write-Host "Subnets:" -ForegroundColor Green
    gcloud compute networks subnets list --format="table(name,network.basename(),region,ipCidrRange)" 2>$null
    
    Write-Host ""
    Write-Host "Firewall Rules:" -ForegroundColor Green
    gcloud compute firewall-rules list --format="table(name,network.basename(),direction,priority,sourceRanges.list():label=SRC_RANGES,allowed[].map().firewall_rule().list():label=ALLOW,targetTags.list():label=TARGET_TAGS)" 2>$null
} catch {
    Write-Host "✗ Failed to list network resources" -ForegroundColor Red
}
Write-Host ""

# Cloud Run services
Write-Host "7. CLOUD RUN SERVICES" -ForegroundColor Yellow
Write-Host "=====================" -ForegroundColor Yellow
try {
    $services = gcloud run services list --format="csv(SERVICE,REGION,URL)" 2>$null
    if ($services -and $services.Count -gt 1) {
        Write-Host "Cloud Run Services:" -ForegroundColor Green
        $services | ForEach-Object { Write-Host $_ }
    } else {
        Write-Host "No Cloud Run services found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Failed to list Cloud Run services" -ForegroundColor Red
}
Write-Host ""

# IAM policies
Write-Host "8. IAM ROLES & PERMISSIONS" -ForegroundColor Yellow
Write-Host "==========================" -ForegroundColor Yellow
try {
    Write-Host "Project IAM Policy:" -ForegroundColor Green
    gcloud projects get-iam-policy multi-evm-gateway-8511 --flatten="bindings[].members" --format="table(bindings.role,bindings.members)" 2>$null
} catch {
    Write-Host "✗ Failed to get IAM policies" -ForegroundColor Red
}
Write-Host ""

# Billing information
Write-Host "9. BILLING INFORMATION" -ForegroundColor Yellow
Write-Host "=====================" -ForegroundColor Yellow
try {
    Write-Host "Billing Account:" -ForegroundColor Green
    gcloud billing projects describe multi-evm-gateway-8511 --format="table(billingAccountName,billingEnabled)" 2>$null
} catch {
    Write-Host "✗ Failed to get billing information" -ForegroundColor Red
}
Write-Host ""

# Cloud Build history
Write-Host "10. CLOUD BUILD HISTORY" -ForegroundColor Yellow
Write-Host "======================" -ForegroundColor Yellow
try {
    $builds = gcloud builds list --limit=10 --format="csv(id,status,createTime,duration)" 2>$null
    if ($builds -and $builds.Count -gt 1) {
        Write-Host "Recent Cloud Builds:" -ForegroundColor Green
        $builds | ForEach-Object { Write-Host $_ }
    } else {
        Write-Host "No Cloud Build history found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Failed to get Cloud Build history" -ForegroundColor Red
}
Write-Host ""

# Resource usage and quotas
Write-Host "11. RESOURCE QUOTAS" -ForegroundColor Yellow
Write-Host "==================" -ForegroundColor Yellow
try {
    Write-Host "Compute Engine Quotas (key metrics):" -ForegroundColor Green
    gcloud compute project-info describe --format="table(quotas.metric,quotas.limit,quotas.usage)" 2>$null | Select-String -Pattern "(CPUS|INSTANCES|DISKS_TOTAL_GB|IN_USE_ADDRESSES)"
} catch {
    Write-Host "✗ Failed to get quota information" -ForegroundColor Red
}
Write-Host ""

# Recent logs (errors only)
Write-Host "12. RECENT ERROR LOGS" -ForegroundColor Yellow
Write-Host "====================" -ForegroundColor Yellow
try {
    Write-Host "Recent errors in the last 24 hours:" -ForegroundColor Green
    gcloud logging read "severity=ERROR" --limit=5 --format="table(timestamp,resource.type,jsonPayload.message)" --freshness=1d 2>$null
} catch {
    Write-Host "✗ Failed to get recent logs" -ForegroundColor Red
}
Write-Host ""

# Secret Manager secrets
Write-Host "13. SECRET MANAGER" -ForegroundColor Yellow
Write-Host "=================" -ForegroundColor Yellow
try {
    $secrets = gcloud secrets list --format="csv(name,createTime)" 2>$null
    if ($secrets -and $secrets.Count -gt 1) {
        Write-Host "Stored Secrets:" -ForegroundColor Green
        $secrets | ForEach-Object { Write-Host $_ }
    } else {
        Write-Host "No secrets found in Secret Manager" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Failed to list secrets" -ForegroundColor Red
}
Write-Host ""

# Cloud Functions
Write-Host "14. CLOUD FUNCTIONS" -ForegroundColor Yellow
Write-Host "==================" -ForegroundColor Yellow
try {
    $functions = gcloud functions list --format="csv(name,status,trigger,runtime)" 2>$null
    if ($functions -and $functions.Count -gt 1) {
        Write-Host "Cloud Functions:" -ForegroundColor Green
        $functions | ForEach-Object { Write-Host $_ }
    } else {
        Write-Host "No Cloud Functions found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Failed to list Cloud Functions" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "=== AUDIT COMPLETE ===" -ForegroundColor Cyan
Write-Host "This audit shows all major resources in your Google Cloud project." -ForegroundColor Green
Write-Host "Review the sections above to understand your current setup." -ForegroundColor Green
Write-Host ""