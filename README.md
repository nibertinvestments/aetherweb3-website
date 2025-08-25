# AetherWeb3 - Multi-EVM Gateway Infrastructure

## Overview

AetherWeb3 is a comprehensive blockchain infrastructure project providing high-performance RPC and WebSocket API endpoints for multiple EVM-compatible networks including Ethereum, Base, and Arbitrum.

## 🚀 Live Website

**Website**: [https://aetherweb3.xyz](https://aetherweb3.xyz)

## 🏗️ Architecture

### Core Components

1. **Multi-EVM Gateway** (`/multi-evm-gateway/`)
   - High-performance API gateway
   - Load balancing across multiple nodes
   - Rate limiting and authentication
   - Real-time monitoring and analytics

2. **Node Infrastructure** (Root deployment scripts)
   - Ethereum nodes (Geth)
   - Base nodes (op-geth)
   - Arbitrum nodes (Nitro)
   - Auto-pruning and optimization

3. **Website & Payment System** (`/multi-evm-gateway/website/`)
   - Professional landing page
   - Stripe payment integration
   - API key management dashboard
   - Comprehensive documentation

## 📊 Pricing Tiers

| Tier | Requests/Day | Price | Features |
|------|-------------|-------|----------|
| **Free** | 120,000 | $0 | Basic access, community support |
| **Starter** | 1,000,000 | $29/month | Priority support, higher limits |
| **Pro** | 10,000,000 | $99/month | Advanced features, dedicated support |
| **Streaming** | Unlimited | $299/month | WebSocket access, custom solutions |

## 🛠️ Quick Start

### For Users
1. Visit [aetherweb3.xyz](https://aetherweb3.xyz)
2. Choose your plan
3. Get your API key instantly
4. Start making requests

### For Developers
```bash
# Example API call
curl -X POST https://multi-evm-gateway-994206105149.us-central1.run.app/ethereum \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"method":"eth_blockNumber","params":[],"id":1,"jsonrpc":"2.0"}'
```

## 🔧 Infrastructure Deployment

### Prerequisites
- Google Cloud Platform account
- PowerShell 5.1+
- gcloud CLI

### Deploy Complete Infrastructure
```powershell
# Deploy all EVM nodes
.\deploy-evm-infrastructure.ps1

# Deploy gateway
.\deploy-gateway.ps1

# Setup monitoring
.\install-ops-agent.ps1
```

### Individual Node Deployment
```powershell
# Ethereum node
.\deploy-eth-node-vm.ps1

# Base node
.\deploy-base-node-vm.ps1

# Arbitrum node
.\deploy-arbitrum-node-vm.ps1
```

## 📁 Project Structure

```
├── 📄 Core Infrastructure Scripts
│   ├── deploy-*.ps1              # Node deployment scripts
│   ├── install-*.ps1              # Installation scripts
│   └── setup-*.ps1                # Configuration scripts
│
├── 🏗️ multi-evm-gateway/
│   ├── gateway/                   # API gateway application
│   ├── website/                   # Frontend & payment system
│   ├── scripts/                   # Deployment automation
│   └── Dockerfile                 # Container configuration
│
├── 🔄 auto-pruning/
│   ├── *-pruned.sh                # Node optimization scripts
│   └── deploy-auto-pruning.sh     # Automated maintenance
│
└── 📚 Documentation
    ├── *.md                       # Setup guides
    └── *.md                       # Status reports
```

## 🔐 Security Features

- **API Key Authentication**: Secure access control
- **Rate Limiting**: Prevent abuse and ensure fair usage
- **SSL/TLS Encryption**: All traffic encrypted
- **DDoS Protection**: Cloudflare integration
- **Regular Security Audits**: Automated vulnerability scanning

## 📈 Performance Metrics

- **99.9% Uptime**: Highly available infrastructure
- **<100ms Response Time**: Optimized for speed
- **Multi-Region**: Global load balancing
- **Auto-Scaling**: Dynamic resource allocation

## 🤝 Support

- **Documentation**: [aetherweb3.xyz/documentation](https://aetherweb3.xyz/documentation.html)
- **API Management**: [aetherweb3.xyz/api-management](https://aetherweb3.xyz/api-management.html)
- **Email Support**: Contact through website

## 🔄 Recent Updates

- ✅ Complete website redesign with professional UI
- ✅ Stripe payment integration with live processing
- ✅ Comprehensive API documentation
- ✅ Real-time usage monitoring
- ✅ Multi-tier pricing system
- ✅ Auto-pruning for optimal node performance

## 📊 Network Support

| Network | Chain ID | RPC Endpoint | WebSocket |
|---------|----------|--------------|----------|
| **Ethereum Mainnet** | 1 | ✅ Available | ✅ Available |
| **Base Mainnet** | 8453 | ✅ Available | ✅ Available |
| **Arbitrum One** | 42161 | ✅ Available | ✅ Available |

## 🛡️ Infrastructure Status

- **Ethereum Nodes**: 🟢 Operational
- **Base Nodes**: 🟢 Operational  
- **Arbitrum Nodes**: 🟢 Operational
- **Gateway Service**: 🟢 Operational
- **Payment System**: 🟢 Operational
- **Monitoring**: 🟢 Operational

---

**Built with ❤️ for the Web3 ecosystem**

*Empowering developers with reliable, fast, and scalable blockchain infrastructure.*