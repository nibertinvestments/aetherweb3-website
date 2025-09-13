# Complete Cloudflare Setup for aetherweb3.xyz

## 🚀 Quick Setup Steps

### Step 1: Get Cloudflare API Token
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use "Custom token" template
4. Configure permissions:
   - Zone:Zone:Edit
   - Zone:DNS:Edit
   - Zone:Page Rules:Edit
   - Zone:Zone Settings:Edit
5. Set Zone Resources to "Include - Specific zone - aetherweb3.xyz"
6. Click "Continue to summary" → "Create Token"
7. Copy the token and add it to your .env file

### Step 2: Add API Token to Environment
Open your .env file and replace:
```
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here
```
With your actual token.

### Step 3: Run Cloudflare Setup
```bash
cd "C:\Users\jnibe\Desktop\EVM NODES AND RPC WSS API ENDPOINTS"
node cloudflare-setup.js
```

## 🌐 DNS Configuration

The script will create these DNS records:

| Type  | Name              | Content                                                    | Proxied |
|-------|-------------------|------------------------------------------------------------|---------||
| CNAME | aetherweb3.xyz    | nibertinvestments.github.io                               | ✅ Yes   |
| CNAME | www.aetherweb3.xyz| aetherweb3.xyz                                            | ✅ Yes   |
| CNAME | api.aetherweb3.xyz| multi-evm-gateway-197221342816.us-central1.run.app       | ✅ Yes   |

## 🛡️ Security Settings

Auto-configured security features:

### SSL/TLS Settings
- SSL Mode: Full
- Always Use HTTPS: ON
- Minimum TLS Version: 1.2
- HSTS: Enabled

### DDoS Protection
- Security Level: Medium
- Bot Fight Mode: ON
- Browser Integrity Check: ON
- Challenge TTL: 30 minutes

### Firewall Rules
1. **Block High Threats**: Block IPs with threat score ≥ 10
2. **Challenge Medium Threats**: Challenge IPs with threat score 5-9
3. **API Rate Limiting**: Challenge requests to /api/* endpoints

## 📋 Page Rules

Automatically created page rules:

1. **API Endpoints** (`aetherweb3.xyz/api/*`)
   - Cache Level: Bypass
   - Security Level: High

2. **CSS Files** (`aetherweb3.xyz/*.css`)
   - Cache Level: Cache Everything
   - Edge Cache TTL: 30 days

3. **JavaScript Files** (`aetherweb3.xyz/*.js`)
   - Cache Level: Cache Everything
   - Edge Cache TTL: 30 days

## 🔄 Manual Steps Required

### 1. Update Nameservers (If you own aetherweb3.xyz)
Point your domain's nameservers to Cloudflare:
- Zone ID: `f62fea2b1c2b622c3db71cc67eee7085`
- Check Cloudflare dashboard for specific nameservers

### 2. Verify Domain Ownership
If you don't own aetherweb3.xyz yet:
1. Purchase it from a domain registrar
2. Update nameservers to Cloudflare
3. Re-run the setup script

### 3. Enable GitHub Pages Custom Domain
✅ Already done - CNAME file created in repository

## 🌍 URL Mapping

After setup completion:

| URL | Destination | Purpose |
|-----|------------|---------||
| https://aetherweb3.xyz | GitHub Pages | Main website |
| https://www.aetherweb3.xyz | Redirect to main | WWW redirect |
| https://api.aetherweb3.xyz | Cloud Run backend | API endpoints |

## 📊 Monitoring & Analytics

### Cloudflare Analytics
- Traffic analytics available in dashboard
- Security events monitoring
- Performance insights

### Set Up Alerts
1. Go to Cloudflare Dashboard → Notifications
2. Create alerts for:
   - High threat levels
   - Origin server errors
   - SSL certificate issues

## 🧪 Testing Your Setup

After DNS propagation (24-48 hours):

```bash
# Test main domain
curl -I https://aetherweb3.xyz

# Test WWW redirect
curl -I https://www.aetherweb3.xyz

# Test API endpoint
curl -I https://api.aetherweb3.xyz/health

# Check SSL
openssl s_client -connect aetherweb3.xyz:443 -servername aetherweb3.xyz
```

## 🔧 Troubleshooting

### Common Issues

1. **DNS not resolving**
   - Wait for propagation (up to 48 hours)
   - Check nameserver configuration
   - Verify zone is active in Cloudflare

2. **SSL errors**
   - Ensure GitHub Pages HTTPS is enabled
   - Check Cloudflare SSL mode is "Full"
   - Wait for certificate generation

3. **API calls failing**
   - Verify CORS origins include your domain
   - Check firewall rules aren't blocking
   - Ensure API subdomain is proxied

### Status Checks

```bash
# Check DNS propagation
nslookup aetherweb3.xyz 8.8.8.8

# Check SSL certificate
curl -vI https://aetherweb3.xyz 2>&1 | grep -i ssl

# Test from different locations
curl -H "CF-IPCountry: US" https://aetherweb3.xyz
```

## 💰 Cost Optimization

### Free Tier Limits
- 100,000 requests/month
- 3 page rules
- Basic DDoS protection
- Shared SSL certificate

### Upgrade Considerations
- **Pro ($20/month)**: More page rules, better analytics
- **Business ($200/month)**: Advanced security, 100% uptime SLA

## 🚨 Emergency Procedures

### Under Attack Mode
If experiencing DDoS:
```bash
# Enable via dashboard or API
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/f62fea2b1c2b622c3db71cc67eee7085/settings/security_level" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"value":"under_attack"}'
```

### Pause Cloudflare
If issues with proxying:
1. Dashboard → DNS → Click orange cloud to gray
2. Traffic will bypass Cloudflare temporarily

## ✅ Final Checklist

- [ ] Cloudflare API token added to .env
- [ ] Setup script executed successfully
- [ ] Domain nameservers pointed to Cloudflare
- [ ] GitHub Pages custom domain configured
- [ ] CORS origins updated for new domain
- [ ] DNS propagation completed
- [ ] SSL certificate active
- [ ] All endpoints tested and working

---

**Status**: Ready for deployment to https://aetherweb3.xyz 🚀