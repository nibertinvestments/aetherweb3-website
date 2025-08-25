# AetherWeb3 Domain Setup & Cloudflare Integration

## 🚨 GoDaddy Domain Issue Resolution

Since you own `aetherweb3.xyz` but GoDaddy has a parking page, here's how to fix it:

### Step 1: Access GoDaddy Domain Management
1. Log into your GoDaddy account
2. Go to "My Products" → "Domains" 
3. Click on `aetherweb3.xyz`
4. Go to "DNS" or "Manage DNS"

### Step 2: Remove GoDaddy Parking
1. Look for an "A" record pointing to GoDaddy's parking server
2. Delete any existing A records that point to GoDaddy IPs
3. Turn OFF "Domain parking" if enabled
4. Turn OFF "Domain forwarding" if enabled

### Step 3: Point to Cloudflare Nameservers
1. In GoDaddy DNS settings, look for "Nameservers"
2. Change from "Default" to "Custom"
3. Add Cloudflare's nameservers (get these from your Cloudflare dashboard):
   - `name1.cloudflare.com`
   - `name2.cloudflare.com`
4. Save changes (can take 24-48 hours to propagate)

## 🔑 Getting Your Cloudflare API Token

### Method 1: Dashboard
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use "Custom token" template
4. Set permissions:
   - Zone:Zone:Edit
   - Zone:DNS:Edit
   - Zone:Page Rules:Edit
   - Zone:Zone Settings:Edit
5. Zone Resources: Include - Specific zone - aetherweb3.xyz
6. Create and copy the token

### Method 2: Find Existing Token
1. Check your Cloudflare dashboard under API Tokens
2. Look for any existing tokens with the right permissions
3. If you have Global API Key, that works too (less secure)

## 🛠️ Quick Setup Commands

Once you have the API token, add it to your .env:

```bash
# In your .env file, replace this line:
CLOUDFLARE_API_TOKEN=your_actual_api_token_here
```

Then run our setup script:
```powershell
.\setup-cloudflare.ps1
```

## 🌐 Alternative Domain Strategy (If GoDaddy Issues Persist)

If GoDaddy continues to be problematic, consider these alternatives:

### Option 1: Use a Subdomain
- Keep using GitHub Pages URL: `nibertinvestments.github.io/aetherweb3-website`
- Add Cloudflare proxy later when domain is freed up

### Option 2: Different Domain Extension
- `aetherweb3.com` (if available)
- `aetherweb3.io` (if available)  
- `aetherweb3.net` (if available)

### Option 3: Brandable Alternatives
- `aethergw.xyz`
- `evmgateway.xyz`
- `web3gateway.xyz`

## 🔐 Current Cloudflare Zone Configuration

Your current setup:
- Zone ID: `f62fea2b1c2b622c3db71cc67eee7085`
- Account ID: `a124635d8a39fa57a62b5b00183e6212`
- Domain: `aetherweb3.xyz`

## 🚀 Next Steps

1. **Fix GoDaddy**: Remove parking, point nameservers to Cloudflare
2. **Get API Token**: From Cloudflare dashboard
3. **Update .env**: Add the API token
4. **Run Setup**: Execute the PowerShell script
5. **Wait for DNS**: 24-48 hours for propagation
6. **Test**: Visit https://aetherweb3.xyz

## ⚡ Quick Test Commands

After setup, test with:
```bash
# Test DNS resolution
nslookup aetherweb3.xyz

# Test HTTPS
curl -I https://aetherweb3.xyz

# Test API endpoint
curl -I https://api.aetherweb3.xyz/health
```

---

**Need help?** Check the complete Cloudflare setup guide in `cloudflare-complete-setup.md`