const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const fetch = require('node-fetch');
const path = require('path');
const { validateApiKey, rateLimitByTier } = require('../middleware/auth');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

// Load blockchain endpoints from environment
const NODES = {
  ethereum: process.env.ETH_RPC_URL || 'http://34.69.20.131:8545',
  base: process.env.BASE_RPC_URL || 'http://34.138.53.72:8545', 
  arbitrum: process.env.ARBITRUM_RPC_URL || 'http://34.53.32.201:8545'
};

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"]
    }
  }
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://aetherweb3.xyz', 'https://www.aetherweb3.xyz']
    : true,
  credentials: true
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Enhanced request function for blockchain calls
async function makeChainRequest(chain, requestBody, req) {
  try {
    const nodeUrl = NODES[chain];
    console.log(`🔗 ${chain} request from ${req.apiKeyInfo.tier} tier`);
    
    const response = await fetch(nodeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'AetherWeb3-Gateway/1.0',
        'X-API-Key': req.headers['x-api-key'],
        'X-Chain': chain,
        'X-Customer-ID': req.apiKeyInfo.customerId
      },
      body: JSON.stringify(requestBody),
      timeout: 15000
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`✅ ${chain} success (${req.apiKeyInfo.tier})`);
    
    return result;
    
  } catch (error) {
    console.error(`❌ ${chain} error:`, error.message);
    throw error;
  }
}

// API key management routes
const apiKeysRouter = require('../routes/apiKeys');
app.use('/api/keys', apiKeysRouter);

// Root endpoint - API info
app.get('/', (req, res) => {
  res.json({
    message: "AetherWeb3 Multi-EVM Gateway API",
    website: "https://aetherweb3.xyz",
    endpoints: {
      ethereum: "POST /ethereum",
      base: "POST /base", 
      arbitrum: "POST /arbitrum",
      generic: "POST /api/v1/rpc (requires chain parameter)"
    },
    authentication: "Enterprise API key required",
    features: [
      "Enterprise-grade API key management",
      "Google Cloud KMS encryption",
      "Tier-based rate limiting",
      "Usage tracking and analytics",
      "Separate endpoints for optimal performance"
    ]
  });
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: Object.keys(NODES),
    message: 'AetherWeb3 Gateway ready',
    version: require('../package.json').version
  });
});

// Test endpoint with authentication
app.get('/test', validateApiKey, (req, res) => {
  res.json({
    message: 'Authentication successful!',
    keyInfo: {
      customerId: req.apiKeyInfo.customerId,
      name: req.apiKeyInfo.name,
      tier: req.apiKeyInfo.tier,
      permissions: req.apiKeyInfo.permissions
    },
    timestamp: new Date().toISOString(),
    availableEndpoints: ['/ethereum', '/base', '/arbitrum']
  });
});

// Separate endpoints for each chain with authentication and rate limiting
app.post('/ethereum', validateApiKey, rateLimitByTier, async (req, res) => {
  try {
    const result = await makeChainRequest('ethereum', req.body, req);
    res.json({
      ...result,
      _gateway: {
        chain: 'ethereum',
        tier: req.apiKeyInfo.tier,
        endpoint: 'dedicated',
        customerId: req.apiKeyInfo.customerId
      }
    });
  } catch (error) {
    res.status(502).json({
      jsonrpc: "2.0",
      id: req.body?.id || null,
      error: {
        code: -32603,
        message: `Ethereum node error: ${error.message}`,
        chain: 'ethereum'
      }
    });
  }
});

app.post('/base', validateApiKey, rateLimitByTier, async (req, res) => {
  try {
    const result = await makeChainRequest('base', req.body, req);
    res.json({
      ...result,
      _gateway: {
        chain: 'base',
        tier: req.apiKeyInfo.tier,
        endpoint: 'dedicated',
        customerId: req.apiKeyInfo.customerId
      }
    });
  } catch (error) {
    res.status(502).json({
      jsonrpc: "2.0",
      id: req.body?.id || null,
      error: {
        code: -32603,
        message: `Base node error: ${error.message}`,
        chain: 'base'
      }
    });
  }
});

app.post('/arbitrum', validateApiKey, rateLimitByTier, async (req, res) => {
  try {
    const result = await makeChainRequest('arbitrum', req.body, req);
    res.json({
      ...result,
      _gateway: {
        chain: 'arbitrum',
        tier: req.apiKeyInfo.tier,
        endpoint: 'dedicated',
        customerId: req.apiKeyInfo.customerId
      }
    });
  } catch (error) {
    res.status(502).json({
      jsonrpc: "2.0",
      id: req.body?.id || null,
      error: {
        code: -32603,
        message: `Arbitrum node error: ${error.message}`,
        chain: 'arbitrum'
      }
    });
  }
});

// Generic RPC endpoint (for backward compatibility)
app.post('/api/v1/rpc', validateApiKey, rateLimitByTier, async (req, res) => {
  try {
    const targetChain = req.body.chain;
    
    if (!targetChain) {
      return res.status(400).json({
        error: 'Missing chain parameter',
        hint: 'Use separate endpoints: /ethereum, /base, /arbitrum for better performance'
      });
    }
    
    if (!NODES[targetChain]) {
      return res.status(400).json({
        error: `Unsupported chain: ${targetChain}`,
        supportedChains: Object.keys(NODES)
      });
    }
    
    const result = await makeChainRequest(targetChain, req.body, req);
    res.json({
      ...result,
      _gateway: {
        chain: targetChain,
        tier: req.apiKeyInfo.tier,
        endpoint: 'generic',
        customerId: req.apiKeyInfo.customerId
      }
    });
    
  } catch (error) {
    res.status(502).json({
      jsonrpc: "2.0",
      id: req.body?.id || null,
      error: {
        code: -32603,
        message: error.message
      }
    });
  }
});

// API information endpoint
app.get('/api-info', (req, res) => {
  res.json({
    message: 'AetherWeb3 Multi-EVM Gateway',
    endpoints: {
      ethereum: 'POST /ethereum',
      base: 'POST /base',
      arbitrum: 'POST /arbitrum',
      generic: 'POST /api/v1/rpc (requires chain parameter)',
      apiKeys: 'GET/POST/DELETE /api/keys (API key management)'
    },
    authentication: 'Enterprise API key system with KMS encryption',
    features: [
      'Google Cloud KMS encryption',
      'Tier-based rate limiting',
      'Usage tracking and analytics',
      'RESTful API key management',
      'Enterprise security standards',
      'Separate endpoints for optimal performance'
    ],
    usage: {
      headers: { 'X-API-Key': 'ak_live_your-api-key', 'Content-Type': 'application/json' },
      body: { 'jsonrpc': '2.0', 'method': 'eth_blockNumber', 'params': [], 'id': 1 }
    },
    tiers: {
      free: { requests_per_minute: 60, features: ['Basic access'] },
      basic: { requests_per_minute: 300, features: ['Priority support'] },
      pro: { requests_per_minute: 1000, features: ['Advanced analytics'] },
      enterprise: { requests_per_minute: 10000, features: ['Custom solutions'] }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 AetherWeb3 Gateway running on port ${port}`);
  console.log(`🌐 Health check: http://localhost:${port}/health`);
  console.log(`📡 Blockchain endpoints:`);
  console.log(`   POST /ethereum   - ${NODES.ethereum}`);
  console.log(`   POST /base       - ${NODES.base}`);
  console.log(`   POST /arbitrum   - ${NODES.arbitrum}`);
  console.log(`🔐 Authentication: Enterprise API key system with KMS`);
  console.log(`🎯 API Key Management: /api/keys`);
  console.log(`✅ Ready for requests`);
});

server.on('error', (error) => {
  console.error(`❌ Server error: ${error.message}`);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use`);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gateway...');
  server.close(() => {
    console.log('✅ Gateway shutdown complete');
    process.exit(0);
  });
});

module.exports = app;