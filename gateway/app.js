const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fetch = require('node-fetch');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// API Keys
const API_KEYS = {
  'aetherweb3-dev-key-2025': { email: 'dev@aetherweb3.xyz', plan: 'developer', active: true },
  'aetherweb3-pro-key-2025': { email: 'pro@aetherweb3.xyz', plan: 'professional', active: true },
  'test@aetherweb3.xyz': { email: 'test@aetherweb3.xyz', plan: 'basic', active: true }
};

// HTTP Node endpoints (Cloudflare handles HTTPS)
const NODES = {
  ethereum: 'http://34.69.20.131:8545',
  base: 'http://34.138.53.72:8545', 
  arbitrum: 'http://34.53.32.201:8545'
};

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: { error: 'Too many requests' }
});
app.use(limiter);

// Authentication
function authenticate(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.headers['X-API-Key'];
  
  if (!apiKey || !API_KEYS[apiKey] || !API_KEYS[apiKey].active) {
    return res.status(401).json({
      error: 'Invalid API key',
      validKeys: Object.keys(API_KEYS)
    });
  }

  req.apiKey = apiKey;
  req.keyInfo = API_KEYS[apiKey];
  next();
}

// Simple request handler with 30ms delay
async function makeRequest(chain, requestBody, req) {
  // 30ms delay
  await new Promise(resolve => setTimeout(resolve, 30));
  
  console.log(`🔗 ${chain} request from ${req.keyInfo.plan}`);
  
  const response = await fetch(NODES[chain], {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Multi-EVM-Gateway/1.0'
    },
    body: JSON.stringify(requestBody),
    timeout: 15000
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  const result = await response.json();
  console.log(`✅ ${chain} success`);
  return result;
}

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    chains: Object.keys(NODES),
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 8080
  });
});

// API keys endpoint for testing
app.get('/api-keys', (req, res) => {
  res.json({
    availableKeys: Object.keys(API_KEYS),
    message: 'Use any of these keys in X-API-Key header',
    endpoints: ['/ethereum', '/base', '/arbitrum'],
    example: {
      headers: { 'X-API-Key': 'aetherweb3-dev-key-2025', 'Content-Type': 'application/json' },
      body: { 'jsonrpc': '2.0', 'method': 'eth_blockNumber', 'params': [], 'id': 1 }
    }
  });
});

// Test endpoint
app.get('/test', authenticate, (req, res) => {
  res.json({
    message: 'Authentication working!',
    keyInfo: req.keyInfo,
    timestamp: new Date().toISOString(),
    availableChains: Object.keys(NODES)
  });
});

// Separate endpoints
app.post('/ethereum', authenticate, async (req, res) => {
  try {
    const result = await makeRequest('ethereum', req.body, req);
    res.json(result);
  } catch (error) {
    res.status(502).json({
      error: 'Ethereum node error',
      message: error.message
    });
  }
});

app.post('/base', authenticate, async (req, res) => {
  try {
    const result = await makeRequest('base', req.body, req);
    res.json(result);
  } catch (error) {
    res.status(502).json({
      error: 'Base node error',
      message: error.message
    });
  }
});

app.post('/arbitrum', authenticate, async (req, res) => {
  try {
    const result = await makeRequest('arbitrum', req.body, req);
    res.json(result);
  } catch (error) {
    res.status(502).json({
      error: 'Arbitrum node error',
      message: error.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 HTTP Gateway on port ${PORT}`);
  console.log(`📡 Endpoints: /ethereum /base /arbitrum`);
  console.log(`🔑 Keys: ${Object.keys(API_KEYS).join(', ')}`);
  console.log(`✅ 30ms delays, HTTP only, separate endpoints`);
  console.log(`🌐 Cloud ready - listening on all interfaces`);
});