# Multi-EVM Gateway - Enterprise Edition

Production-ready, enterprise-grade gateway for Ethereum, Base, and Arbitrum networks with comprehensive security features.

## Overview

The Multi-EVM Gateway provides a unified interface for interacting with multiple EVM-compatible blockchain networks. It offers authenticated RPC access with built-in rate limiting, monitoring, and enterprise-grade security features.

## Features

### Supported Networks
- **Ethereum Mainnet** - Full RPC and WebSocket support
- **Base Network** - Coinbase's L2 solution  
- **Arbitrum One** - High-performance L2 scaling

### Security Features
- API Key Authentication via Stripe integration
- Rate Limiting with tier-based quotas
- Request Validation with method whitelisting
- DDoS Protection via Cloudflare Security
- SSL/TLS Encryption end-to-end
- Container Security with vulnerability scanning
- VPC Network Isolation for backend nodes
- Security Headers (Helmet.js integration)
- Input Sanitization and size limits
- Audit Logging for all requests

### Monitoring & Analytics
- Real-time Usage Tracking
- Cost Analytics with Stripe billing
- WebSocket Connection Monitoring
- Security Event Alerting
- Comprehensive Logging

## Architecture

```
Internet → Cloudflare DDoS → Load Balancer → Cloud Run Gateway → VPC → Blockchain Nodes
            ↓                   ↓               ↓                ↓        ↓
          DDoS                SSL            Auth            Internal    Cached
         Protection         Termination     & Rate          Network     Data
                                           Limiting         Only
```

## API Authentication

### HTTP API Endpoints
```bash
# Include API key in header
curl -H "x-api-key: your_stripe_customer_email" \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
     https://your-gateway-url/api/v1/ethereum
```

### WebSocket Connections
```javascript
// Use Bearer token in Authorization header
const ws = new WebSocket('wss://your-gateway-url/ws/v1/ethereum', {
  headers: {
    'Authorization': 'Bearer your_stripe_customer_email'
  }
});
```

## API Endpoints

### RPC Endpoints
| Network | Endpoint | Description |
|---------|----------|-------------|
| Ethereum | `/api/v1/ethereum` | Ethereum mainnet RPC |
| Base | `/api/v1/base` | Base network RPC |
| Arbitrum | `/api/v1/arbitrum` | Arbitrum One RPC |

### WebSocket Endpoints
| Network | Endpoint | Description |
|---------|----------|-------------|
| Ethereum | `/ws/v1/ethereum` | Real-time Ethereum events |
| Base | `/ws/v1/base` | Real-time Base events |
| Arbitrum | `/ws/v1/arbitrum` | Real-time Arbitrum events |

### Monitoring Endpoints
| Endpoint | Description | Auth Required |
|----------|-------------|---------------|
| `/health` | Service health status | No |
| `/api/v1/docs` | API documentation | No |
| `/api/v1/usage/{customerId}` | Usage analytics | Yes |
| `/api/v1/ws/connections` | Active WebSocket connections | Yes |

## Security Specifications

### Rate Limiting
| Tier | Requests/Minute | WebSocket Connections |
|------|-----------------|----------------------|
| Basic | 100 | 5 |
| Pro | 1,000 | 25 |
| Enterprise | 10,000 | 100 |

### Supported JSON-RPC Methods
```javascript
[
  'eth_blockNumber', 'eth_getBalance', 'eth_getTransactionCount',
  'eth_getTransactionByHash', 'eth_getTransactionReceipt',
  'eth_call', 'eth_estimateGas', 'eth_gasPrice', 'eth_feeHistory',
  'eth_getBlockByNumber', 'eth_getBlockByHash', 'eth_getLogs',
  'eth_sendRawTransaction', 'eth_chainId', 'net_version',
  'web3_clientVersion', 'eth_syncing'
]
```

### Security Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## Billing Integration

### Stripe Integration
- **Customer Management** via Stripe Customer API
- **Subscription Verification** for access control
- **Usage-based Billing** with automatic cost calculation
- **Webhook Support** for payment event handling

### Cost Structure
- **Base Rate**: $0.001 per KB of response data
- **Minimum Charge**: $0.001 per request
- **WebSocket**: Included in subscription tier

## Deployment

### Prerequisites
```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Environment Variables
```bash
# Google Cloud
PROJECT_ID=your-project-id
GOOGLE_CLOUD_PROJECT=your-project-id

# Node endpoints (internal IPs)
ETH_NODE_IP=10.128.0.6
BASE_NODE_IP=10.142.0.2
ARBITRUM_NODE_IP=10.138.0.2

# Stripe configuration
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Network configuration
VPC_NETWORK=evm-vpc
VPC_CONNECTOR=evm-connector
```

### Secure Deployment
```bash
# Deploy with security configurations
./scripts/deploy-secure-gateway.ps1
```

## Monitoring & Alerting

### Health Monitoring
```bash
# Check service health
curl https://your-gateway-url/health

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-13T20:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "stripe": true,
    "firestore": true,
    "nodes": {
      "ethereum": "http://10.128.0.6:8545",
      "base": "http://10.142.0.2:8545", 
      "arbitrum": "http://10.138.0.2:8545"
    }
  }
}
```

### Usage Analytics
```bash
# Get usage statistics
curl -H "x-api-key: your_key" \
     https://your-gateway-url/api/v1/usage/customer_id

Response:
```json
{
  "summary": {
    "totalRequests": 1250,
    "totalCost": 12.50,
    "chainBreakdown": {
      "ethereum": { "requests": 800, "cost": 8.00 },
      "base": { "requests": 300, "cost": 3.00 },
      "arbitrum": { "requests": 150, "cost": 1.50 }
    }
  },
  "recent": [...],
  "timestamp": "2025-01-13T20:00:00.000Z"
}
```

## Development

### Local Development
```bash
# Start development server
npm run dev

# Run security audit
npm run security-audit

# Run tests
npm test
```

### Testing API
```bash
# Test Ethereum endpoint
curl -H "x-api-key: test@example.com" \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
     http://localhost:8080/api/v1/ethereum
```

### WebSocket Testing
```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:8080/ws/v1/ethereum', {
  headers: {
    'Authorization': 'Bearer test@example.com'
  }
});

// Subscribe to new blocks
ws.send(JSON.stringify({
  "jsonrpc": "2.0",
  "method": "eth_subscribe",
  "params": ["newHeads"],
  "id": 1
}));
```

## Troubleshooting

### Common Issues

**Authentication Errors**
- Verify API key format and Stripe customer exists
- Check active subscription status
- Ensure proper header format: `x-api-key: customer_email`

**Rate Limiting**
- Check current usage with `/api/v1/usage/{customerId}`
- Upgrade subscription tier for higher limits
- Implement exponential backoff in client code

**WebSocket Connection Issues**
- Use proper Authorization header: `Bearer {api_key}`
- Check path format: `/ws/v1/{chain}`
- Verify subscription includes WebSocket access

### Support Channels
- **Email**: support@nibertinvestments.com
- **Documentation**: See main project README.md
- **Issues**: https://github.com/nibertinvestments/aetherweb3-website/issues

## License

MIT License - see LICENSE file for details.

## Security

For security concerns, please email security@nibertinvestments.com

---

**Built for the Ethereum ecosystem**