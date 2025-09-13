# AetherWeb3 API Reference

This document provides comprehensive API reference for the AetherWeb3 multi-EVM gateway service.

## Base URL

```
https://multi-evm-gateway-197221342816.us-central1.run.app
```

## Authentication

All API requests require authentication using the `X-API-Key` header:

```http
X-API-Key: YOUR_API_KEY
```

## Supported Networks

| Network | Endpoint | Chain ID | Description |
|---------|----------|----------|-------------|
| Ethereum | `/ethereum` | 1 | Ethereum Mainnet |
| Base | `/base` | 8453 | Base Network (Coinbase L2) |
| Arbitrum | `/arbitrum` | 42161 | Arbitrum One |

## JSON-RPC Methods

All endpoints support standard Ethereum JSON-RPC 2.0 methods:

### Account Methods

#### eth_getBalance
Get the balance of an account.

**Parameters:**
1. `address` - 20-byte account address
2. `block` - Block parameter (latest, earliest, pending, or block number)

**Example:**
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

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x1b1ae4d6e2ef500000"
}
```

#### eth_getTransactionCount
Get the number of transactions sent from an address.

**Parameters:**
1. `address` - 20-byte account address
2. `block` - Block parameter

**Example:**
```bash
curl -X POST https://multi-evm-gateway-197221342816.us-central1.run.app/ethereum \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getTransactionCount",
    "params": ["0x742d35cc6634c0532925a3b8d3ac74e4dc3c8ef5", "latest"],
    "id": 1
  }'
```

#### eth_getCode
Get the code at a given address.

**Parameters:**
1. `address` - 20-byte contract address
2. `block` - Block parameter

### Block Methods

#### eth_blockNumber
Get the latest block number.

**Example:**
```bash
curl -X POST https://multi-evm-gateway-197221342816.us-central1.run.app/ethereum \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_blockNumber",
    "params": [],
    "id": 1
  }'
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x12a4f2c"
}
```

#### eth_getBlockByNumber
Get block information by block number.

**Parameters:**
1. `block` - Block parameter
2. `fullTransactions` - Boolean, return full transaction objects

**Example:**
```bash
curl -X POST https://multi-evm-gateway-197221342816.us-central1.run.app/ethereum \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getBlockByNumber",
    "params": ["latest", false],
    "id": 1
  }'
```

#### eth_getBlockByHash
Get block information by block hash.

**Parameters:**
1. `hash` - 32-byte block hash
2. `fullTransactions` - Boolean, return full transaction objects

### Transaction Methods

#### eth_getTransactionByHash
Get transaction information by transaction hash.

**Parameters:**
1. `hash` - 32-byte transaction hash

**Example:**
```bash
curl -X POST https://multi-evm-gateway-197221342816.us-central1.run.app/ethereum \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getTransactionByHash",
    "params": ["0x9fc76417374aa880d4449a1f7f31ec597f00b1f6f3dd2d66f4c9c6c445836d8b"],
    "id": 1
  }'
```

#### eth_getTransactionReceipt
Get transaction receipt by transaction hash.

**Parameters:**
1. `hash` - 32-byte transaction hash

#### eth_sendRawTransaction
Submit a pre-signed transaction for broadcast.

**Parameters:**
1. `data` - Signed transaction data

#### eth_estimateGas
Estimate gas usage for a transaction.

**Parameters:**
1. `transaction` - Transaction object

#### eth_gasPrice
Get the current gas price.

**Example:**
```bash
curl -X POST https://multi-evm-gateway-197221342816.us-central1.run.app/ethereum \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_gasPrice",
    "params": [],
    "id": 1
  }'
```

### Utility Methods

#### eth_call
Execute a function call without creating a transaction.

**Parameters:**
1. `transaction` - Transaction object
2. `block` - Block parameter

#### eth_getLogs
Get logs matching given filter criteria.

**Parameters:**
1. `filter` - Log filter object

#### eth_chainId
Get the chain ID of the network.

**Example:**
```bash
curl -X POST https://multi-evm-gateway-197221342816.us-central1.run.app/ethereum \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_chainId",
    "params": [],
    "id": 1
  }'
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x1"
}
```

#### net_version
Get the network ID.

#### web3_clientVersion
Get the client version string.

## Error Handling

The API returns standard JSON-RPC error responses:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32601,
    "message": "Method not found"
  }
}
```

### Common Error Codes

| Code | Message | Description |
|------|---------|-------------|
| -32700 | Parse error | Invalid JSON |
| -32600 | Invalid Request | JSON-RPC request invalid |
| -32601 | Method not found | Method does not exist |
| -32602 | Invalid params | Invalid method parameters |
| -32603 | Internal error | Internal JSON-RPC error |
| -32000 | Server error | Generic server error |

## Rate Limits

Rate limits are enforced per API key:

| Plan | Requests/Minute | Daily Limit |
|------|-----------------|-------------|
| Free | 20 | 120,000 |
| Starter | 60 | 120,000 + overage |
| Pro | 200 | 120,000 + overage |
| Enterprise | Custom | Custom |

When rate limits are exceeded, the API returns:

```json
{
  "error": {
    "code": 429,
    "message": "Rate limit exceeded"
  }
}
```

## Client Libraries

### Web3.js
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

// Use standard Web3.js methods
const balance = await web3.eth.getBalance('0x742d35cc6634c0532925a3b8d3ac74e4dc3c8ef5');
```

### Ethers.js
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

### Python (requests)
```python
import requests

def make_rpc_call(network, method, params, api_key):
    url = f"https://multi-evm-gateway-197221342816.us-central1.run.app/{network}"
    headers = {
        'X-API-Key': api_key,
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
result = make_rpc_call('ethereum', 'eth_getBalance', 
                      ['0x742d35cc6634c0532925a3b8d3ac74e4dc3c8ef5', 'latest'],
                      'YOUR_API_KEY')
```

## Best Practices

### Performance Optimization
1. **Batch Requests**: Group multiple calls when possible
2. **Caching**: Cache responses for repeated queries
3. **Rate Limiting**: Implement client-side rate limiting
4. **Connection Pooling**: Reuse HTTP connections

### Security
1. **API Key Security**: Store API keys securely, never in code
2. **Environment Variables**: Use environment variables for configuration
3. **HTTPS Only**: Always use HTTPS endpoints
4. **Error Handling**: Don't expose sensitive information in error messages

### Monitoring
1. **Usage Tracking**: Monitor your API usage and costs
2. **Error Monitoring**: Track and investigate API errors
3. **Performance Monitoring**: Monitor response times and success rates
4. **Alerting**: Set up alerts for usage thresholds and errors

## Support

For API support and questions:

- **Documentation**: [Interactive API Docs](https://nibertinvestments.github.io/aetherweb3-website/documentation.html)
- **Technical Support**: support@nibertinvestments.com
- **GitHub Issues**: [Report issues](https://github.com/nibertinvestments/aetherweb3-website/issues)

---

*For more detailed examples and interactive testing, visit our [live documentation](https://nibertinvestments.github.io/aetherweb3-website/documentation.html).*