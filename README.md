# AetherWeb3 - Multi-EVM Gateway

[![Live Status](https://img.shields.io/badge/status-operational-brightgreen)](https://nibertinvestments.github.io/aetherweb3-website/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

A production-ready multi-blockchain gateway service providing reliable RPC access to Ethereum, Base, and Arbitrum networks.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Security](#security)
- [Support](#support)
- [License](#license)

## Overview

AetherWeb3 provides a unified interface for interacting with multiple EVM-compatible blockchain networks. The service offers authenticated RPC access with built-in rate limiting, monitoring, and enterprise-grade reliability features.

### Live Service Information

- **Website**: [https://nibertinvestments.github.io/aetherweb3-website/](https://nibertinvestments.github.io/aetherweb3-website/)
- **API Gateway**: [https://multi-evm-gateway-197221342816.us-central1.run.app](https://multi-evm-gateway-197221342816.us-central1.run.app)
- **Documentation**: [Interactive API Docs](https://nibertinvestments.github.io/aetherweb3-website/documentation.html)

## Features

### Core Capabilities
- **Multi-Network Support**: Ethereum, Base, and Arbitrum networks
- **High Performance**: Sub-100ms average response times
- **Enterprise Reliability**: 99.9% uptime SLA
- **Flexible Pricing**: Free tier with 120,000 daily calls
- **Developer Tools**: Interactive API testing and comprehensive documentation
- **Instant Setup**: Real-time API key generation

### Supported Networks

| Network | Chain ID | Endpoint | Status |
|---------|----------|----------|---------|
| Ethereum | 1 | `/ethereum` | Operational |
| Base | 8453 | `/base` | Operational |
| Arbitrum | 42161 | `/arbitrum` | Operational |

## Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher

### Get API Access

1. Visit [AetherWeb3](https://nibertinvestments.github.io/aetherweb3-website/) to register
2. Choose your plan (free tier available)
3. Get your API key instantly

### Make Your First Request

```bash
curl -X POST https://multi-evm-gateway-197221342816.us-central1.run.app/ethereum \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getBalance",
    "params": ["0x742d35cc6634c0532925a3b8d3ac74e4dc3c8ef5", "latest"],
    "id": 1
  }'
```

Expected response:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x1b1ae4d6e2ef500000"
}
```

## Installation

### For Development

```bash
# Clone the repository
git clone https://github.com/nibertinvestments/aetherweb3-website.git
cd aetherweb3-website

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Configure your environment variables
# Edit .env with your specific values

# Start development server
npm run dev
```

### For Production

```bash
# Install production dependencies
npm ci --only=production

# Build the application
npm run build

# Start the production server
npm start
```

## Usage

### Authentication

All API requests require authentication using the `X-API-Key` header:

```bash
X-API-Key: YOUR_API_KEY
```

### Registration

Create a new account and get your API key:

```bash
curl -X POST https://multi-evm-gateway-197221342816.us-central1.run.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "email": "your.email@example.com", 
    "password": "secure_password",
    "plan": "free"
  }'
```

### Login

Authenticate with existing credentials:

```bash
curl -X POST https://multi-evm-gateway-197221342816.us-central1.run.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your.email@example.com",
    "password": "secure_password"
  }'
```

### Making RPC Calls

The service supports standard JSON-RPC 2.0 format for all networks:

```bash
# Get latest block number
curl -X POST https://multi-evm-gateway-197221342816.us-central1.run.app/ethereum \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Get account balance
curl -X POST https://multi-evm-gateway-197221342816.us-central1.run.app/base \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getBalance",
    "params": ["0x742d35cc6634c0532925a3b8d3ac74e4dc3c8ef5", "latest"],
    "id": 1
  }'
```

## API Documentation

### Interactive Documentation

Test the API directly in your browser: [Interactive API Docs](https://nibertinvestments.github.io/aetherweb3-website/documentation.html)

### Supported RPC Methods

The gateway supports standard Ethereum JSON-RPC methods:

#### Account Information
- `eth_getBalance` - Get account balance
- `eth_getTransactionCount` - Get account nonce
- `eth_getCode` - Get contract code

#### Block Information  
- `eth_blockNumber` - Get latest block number
- `eth_getBlockByNumber` - Get block by number
- `eth_getBlockByHash` - Get block by hash

#### Transaction Operations
- `eth_getTransactionByHash` - Get transaction details
- `eth_sendRawTransaction` - Submit signed transaction
- `eth_getTransactionReceipt` - Get transaction receipt
- `eth_estimateGas` - Estimate gas usage
- `eth_gasPrice` - Get current gas price

#### Network Information
- `eth_chainId` - Get chain ID
- `net_version` - Get network version
- `web3_clientVersion` - Get client version

### Integration Examples

#### Web3.js
```javascript
const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider(
  'https://multi-evm-gateway-197221342816.us-central1.run.app/ethereum',
  {
    headers: {
      'X-API-Key': 'YOUR_API_KEY'
    }
  }
));

const balance = await web3.eth.getBalance('0x742d35cc6634c0532925a3b8d3ac74e4dc3c8ef5');
```

#### Ethers.js
```javascript
const { ethers } = require('ethers');

const provider = new ethers.providers.JsonRpcProvider({
  url: 'https://multi-evm-gateway-197221342816.us-central1.run.app/ethereum',
  headers: {
    'X-API-Key': 'YOUR_API_KEY'
  }
});

const balance = await provider.getBalance('0x742d35cc6634c0532925a3b8d3ac74e4dc3c8ef5');
```

#### Python
```python
import requests

def make_rpc_call(network, method, params):
    url = f"https://multi-evm-gateway-197221342816.us-central1.run.app/{network}"
    headers = {
        'X-API-Key': 'YOUR_API_KEY',
        'Content-Type': 'application/json'
    }
    data = {
        'jsonrpc': '2.0',
        'method': method,
        'params': params,
        'id': 1
    }
    
    response = requests.post(url, json=data, headers=headers)
    return response.json()

# Example usage
balance = make_rpc_call('ethereum', 'eth_getBalance', 
                       ['0x742d35cc6634c0532925a3b8d3ac74e4dc3c8ef5', 'latest'])
```

## Configuration

### Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```env
# Google Cloud Configuration
PROJECT_ID=your-project-id
GOOGLE_CLOUD_PROJECT=your-project-id

# Node RPC Endpoints (internal IPs)
ETH_NODE_IP=10.128.0.6
BASE_NODE_IP=10.142.0.2
ARBITRUM_NODE_IP=10.138.0.2

# Stripe API Configuration
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Network Configuration
VPC_NETWORK=evm-vpc
VPC_CONNECTOR=evm-connector

# Security Settings
JWT_SECRET=your-jwt-secret
BCRYPT_ROUNDS=12
```

### Rate Limits

| Plan | Requests/Minute | Daily Limit | Cost |
|------|-----------------|-------------|------|
| Free | 20 | 120,000 | $0 |
| Starter | 60 | 120,000 + overage | $9.99/month |
| Pro | 200 | 120,000 + overage | $29.99/month |
| Enterprise | Custom | Custom | Contact sales |

### Pricing

- **Free Tier**: 120,000 calls/day at no cost
- **Overage Rates**: 
  - Starter: $0.0004 per call
  - Pro: $0.0001 per call
- **Enterprise**: Custom pricing available

## Development

### Local Setup

1. **Clone and Install**:
   ```bash
   git clone https://github.com/nibertinvestments/aetherweb3-website.git
   cd aetherweb3-website
   npm install
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm test` - Run test suite
- `npm run lint` - Run code linter
- `npm run security-audit` - Run security audit
- `npm run build` - Build for production

### Project Structure

```
aetherweb3-website/
├── gateway/                 # Gateway application
│   ├── app.js              # Main gateway server
│   └── SECURITY-README.md  # Security guidelines
├── lib/                    # Shared libraries
│   └── apiKeyManager.js    # API key management
├── middleware/             # Express middleware
│   └── auth.js            # Authentication middleware
├── routes/                 # API routes
│   └── apiKeys.js         # API key routes
├── multi-evm-gateway/     # Multi-EVM gateway service
├── docs/                  # Documentation (see docs/ folder)
├── index.html             # Frontend website
├── documentation.html     # API documentation
└── package.json           # Project configuration
```

### Testing

The project uses Jest for testing. Run tests with:

```bash
npm test
```

Create new tests in the `__tests__` directory following the existing patterns.

## Deployment

### Production Deployment

1. **Prepare Environment**:
   ```bash
   # Set production environment variables
   export NODE_ENV=production
   export PORT=8080
   ```

2. **Build and Deploy**:
   ```bash
   npm ci --only=production
   npm run build
   npm start
   ```

### Docker Deployment

```bash
# Build image
docker build -t aetherweb3-gateway .

# Run container
docker run -p 8080:8080 \
  -e NODE_ENV=production \
  -e PROJECT_ID=your-project-id \
  aetherweb3-gateway
```

### Cloud Run Deployment

```bash
# Deploy to Google Cloud Run
gcloud run deploy multi-evm-gateway \
  --image gcr.io/your-project/gateway:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Contributing

We welcome contributions to AetherWeb3! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to get started.

### Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Run linting (`npm run lint`)
7. Commit your changes (`git commit -m 'Add amazing feature'`)
8. Push to the branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

### Code Style

- Follow existing code patterns and conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Ensure proper error handling
- Write tests for new features

## Security

Security is a top priority for AetherWeb3. Please see our [Security Policy](SECURITY.md) for details on:

- Reporting security vulnerabilities
- Security best practices
- Supported versions

### Security Features

- **SSL/TLS Encryption**: All traffic encrypted end-to-end
- **API Key Authentication**: Secure access control
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Sanitized request processing
- **Security Headers**: OWASP recommended headers
- **Regular Audits**: Continuous security monitoring

For security concerns, please email [security@nibertinvestments.com](mailto:security@nibertinvestments.com).

## Support

### Community Support

- **Documentation**: [Interactive API Docs](https://nibertinvestments.github.io/aetherweb3-website/documentation.html)
- **Issues**: [GitHub Issues](https://github.com/nibertinvestments/aetherweb3-website/issues)
- **Feature Requests**: Submit via GitHub Issues

### Commercial Support

- **Technical Support**: [support@nibertinvestments.com](mailto:support@nibertinvestments.com)
- **Sales & Enterprise**: [sales@nibertinvestments.com](mailto:sales@nibertinvestments.com)
- **Response Time**: < 24 hours for technical issues

### Status & Monitoring

- **Service Status**: [Status Page](https://nibertinvestments.github.io/aetherweb3-website/documentation.html)
- **Performance Metrics**: Sub-100ms average response time
- **Uptime**: 99.9% SLA (last 30 days)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Commercial Use

- ✅ Commercial use permitted
- ✅ Private use permitted  
- ✅ Modification permitted
- ✅ Distribution permitted

**Copyright © 2025 Nibert Investments LLC**

---

## Roadmap

### Upcoming Features

- **Q1 2025**: Polygon and Optimism network support
- **Q2 2025**: WebSocket streaming and mobile SDKs
- **Q3 2025**: GraphQL endpoints and advanced analytics
- **Q4 2025**: Regional expansion and enhanced monitoring

---

*Built with ❤️ by [Nibert Investments LLC](https://nibertinvestments.com)*