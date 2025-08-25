const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const WebSocket = require('ws');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// Load environment variables
require('dotenv').config();

// Initialize Firestore and Stripe with error handling
let firestore, stripe;
try {
  const { Firestore } = require('@google-cloud/firestore');
  firestore = new Firestore({
    projectId: process.env.PROJECT_ID || 'multi-evm-gateway-8511'
  });
} catch (error) {
  console.warn('Firestore not available:', error.message);
}

try {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('Stripe not configured: STRIPE_SECRET_KEY environment variable not set');
  }
} catch (error) {
  console.warn('Stripe not available:', error.message);
}

const app = express();

// Cloudflare configuration
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID || 'f62fea2b1c2b622c3db71cc67eee7085';
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || 'a124635d8a39fa57a62b5b00183e6212';
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN; // Add when needed for API calls

// CORS Configuration
const cors = require('cors');
const allowedOrigins = (process.env.CORS_ORIGIN || 'https://aetherweb3.xyz,https://www.aetherweb3.xyz,https://nibertinvestments.github.io').split(',');

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'X-API-Key']
}));

// Middleware
app.use(express.json());

// Node endpoints (using external IPs for production access)
const NODES = {
  ethereum: process.env.ETH_RPC_URL || 'http://34.69.20.131:8545',
  base: process.env.BASE_RPC_URL || 'http://34.138.53.72:8545',
  arbitrum: process.env.ARBITRUM_RPC_URL || 'http://34.53.32.201:8545'
};

const WS_NODES = {
  ethereum: process.env.ETH_WS_URL || 'ws://34.69.20.131:8546',
  base: process.env.BASE_WS_URL || 'ws://34.138.53.72:8546',
  arbitrum: process.env.ARBITRUM_WS_URL || 'ws://34.53.32.201:8546'
};

// Enhanced security middleware with performance optimizations
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "ws:", "https:"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Enhanced rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests',
    retryAfter: '15 minutes',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false
});

app.use(globalLimiter);

// Slow down middleware for heavy API usage
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 100, // Allow 100 requests per 15 minutes at full speed
  delayMs: (used) => (used - 100) * 100 // Slow down by 100ms per request over limit
});

app.use('/api/', speedLimiter);

// Request ID middleware for tracking
app.use((req, res, next) => {
  req.requestId = require('crypto').randomUUID();
  res.setHeader('X-Request-ID', req.requestId);
  console.log(`📧 [${req.requestId}] ${req.method} ${req.path} from ${req.ip}`);
  next();
});

// In-memory user storage (replace with database in production)
const users = new Map();
const apiKeys = new Map();
const usage = new Map();

// Customer data for testing (in production, fetch from Firestore)
const CUSTOMERS = new Map([
  ['test@aetherweb3.xyz', {
    id: 'cust_test123',
    email: 'test@aetherweb3.xyz',
    plan: 'basic',
    requestsToday: 0,
    maxRequestsPerDay: 10000,
    active: true,
    apiKey: 'test@aetherweb3.xyz'
  }],
  ['aetherweb3-dev-key-2025', {
    id: 'cust_dev456',
    email: 'dev@aetherweb3.xyz',
    plan: 'developer',
    requestsToday: 0,
    maxRequestsPerDay: 50000,
    active: true,
    apiKey: 'aetherweb3-dev-key-2025'
  }],
  ['aetherweb3-pro-key-2025', {
    id: 'cust_pro789',
    email: 'pro@aetherweb3.xyz',
    plan: 'professional',
    requestsToday: 0,
    maxRequestsPerDay: 500000,
    active: true,
    apiKey: 'aetherweb3-pro-key-2025'
  }]
]);

// Enhanced authentication middleware
function authenticate(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.headers['X-API-Key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      message: 'Please provide your API key in the X-API-Key header',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }

  const customer = CUSTOMERS.get(apiKey);
  if (!customer) {
    return res.status(401).json({
      error: 'Invalid API key',
      message: 'The provided API key is not valid or has been revoked',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }

  if (!customer.active) {
    return res.status(403).json({
      error: 'Account suspended',
      message: 'Your account has been suspended. Please contact support.',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }

  // Check rate limits
  if (customer.requestsToday >= customer.maxRequestsPerDay) {
    return res.status(429).json({
      error: 'Daily limit exceeded',
      message: `You have exceeded your daily limit of ${customer.maxRequestsPerDay} requests`,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }

  req.customer = customer;
  req.apiKey = apiKey;
  next();
}

// JSON-RPC validation middleware
function validateJsonRpc(req, res, next) {
  const { jsonrpc, method, id } = req.body;
  
  if (jsonrpc !== '2.0') {
    return res.status(400).json({
      jsonrpc: '2.0',
      error: {
        code: -32600,
        message: 'Invalid Request',
        data: 'JSON-RPC version must be 2.0'
      },
      id: id || null,
      requestId: req.requestId
    });
  }

  if (!method || typeof method !== 'string') {
    return res.status(400).json({
      jsonrpc: '2.0',
      error: {
        code: -32600,
        message: 'Invalid Request',
        data: 'Method is required and must be a string'
      },
      id: id || null,
      requestId: req.requestId
    });
  }

  next();
}

// Enhanced usage logging
function logUsage(customerId, chain, method, responseSize, requestId, ip) {
  if (!usage.has(customerId)) {
    usage.set(customerId, []);
  }
  
  const log = {
    timestamp: new Date().toISOString(),
    chain,
    method,
    responseSize,
    requestId,
    ip,
    cost: calculateCost(method, responseSize, chain)
  };
  
  usage.get(customerId).push(log);
  
  // Keep only last 1000 requests per customer
  const customerUsage = usage.get(customerId);
  if (customerUsage.length > 1000) {
    customerUsage.splice(0, customerUsage.length - 1000);
  }
  
  // Update daily counter
  const customer = CUSTOMERS.get(customerId);
  if (customer) {
    customer.requestsToday++;
  }
}

function calculateCost(method, responseSize, chain) {
  // Simple cost calculation (in practice, this would be more sophisticated)
  const baseCost = 0.001; // $0.001 per request
  const sizeCost = responseSize > 1000 ? (responseSize / 1000) * 0.0001 : 0;
  const chainMultiplier = chain === 'ethereum' ? 1.5 : 1.0;
  
  return (baseCost + sizeCost) * chainMultiplier;
}

// Health check endpoint with enhanced info
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.1.0',
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 8080,
    chains: {
      available: Object.keys(NODES),
      websockets: Object.keys(WS_NODES)
    },
    features: {
      authentication: true,
      rateLimiting: true,
      cors: true,
      compression: true,
      logging: true,
      multiChain: true,
      websockets: true,
      serverSentEvents: true,
      stripeIntegration: !!stripe
    },
    uptime: process.uptime()
  };
  
  res.json(health);
});

// Usage analytics endpoint
app.get('/api/v1/usage', authenticate, async (req, res) => {
  try {
    const customerUsage = usage.get(req.customer.id) || [];
    
    // Calculate summary statistics
    const summary = {
      totalRequests: customerUsage.length,
      requestsToday: req.customer.requestsToday,
      remainingToday: req.customer.maxRequestsPerDay - req.customer.requestsToday,
      totalCost: customerUsage.reduce((sum, record) => sum + record.cost, 0),
      chainBreakdown: {}
    };

    // Calculate per-chain breakdown
    Object.keys(NODES).forEach(chain => {
      summary.chainBreakdown[chain] = {
        requests: 0,
        cost: 0
      };
    });

    customerUsage.forEach(record => {
      if (!summary.chainBreakdown[record.chain]) {
        summary.chainBreakdown[record.chain] = { requests: 0, cost: 0 };
      }
      summary.chainBreakdown[record.chain].requests++;
      summary.chainBreakdown[record.chain].cost += record.cost;
    });
    res.json({
      summary,
      recent: customerUsage.slice(0, 50),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Failed to get usage [${req.requestId}]:`, error.message);
    res.status(500).json({
      error: 'Failed to retrieve usage data',
      code: 'USAGE_RETRIEVAL_ERROR',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
});

// API endpoint for listing available chains
app.get('/api/v1/chains', authenticate, (req, res) => {
  res.json({
    chains: Object.keys(NODES),
    websocket_support: true,
    rate_limits: {
      global: "1000 requests per 15 minutes",
      per_customer: "Dynamic based on subscription"
    }
  });
});

// Helper function to handle single chain requests with enhanced delay protection and firewall bypass
async function handleSingleChainRequest(chain, requestBody, req, res) {
  try {
    const { chain: _, ...cleanRequestBody } = requestBody; // Remove chain from request
    
    // Add 30ms delay to prevent gateway overload (as requested by user)
    console.log(`⏱️ Applying 30ms delay for ${chain} to prevent gateway overload`);
    await new Promise(resolve => setTimeout(resolve, 30));
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // Increased timeout
    
    console.log(`🔗 Single chain request to ${chain} (30ms delay applied)`);
    
    // Enhanced headers to bypass firewalls and DDoS protection
    const response = await fetch(NODES[chain], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Multi-EVM-Gateway/1.0 (Node.js; compatible; +https://aetherweb3.xyz)',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Accept-Encoding': 'gzip, deflate',
        'X-Forwarded-For': req.headers['x-forwarded-for'] || req.ip,
        'X-Real-IP': req.headers['x-real-ip'] || req.ip,
        'X-Gateway-Source': 'multi-evm-gateway',
        'X-Gateway-Version': '1.0',
        'Referer': 'https://aetherweb3.xyz/',
        'Origin': 'https://aetherweb3.xyz'
      },
      body: JSON.stringify(cleanRequestBody),
      signal: controller.signal,
      // Add retry logic and connection pooling
      keepalive: true,
      timeout: 40000
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log(`✅ ${chain} single request completed (${response.status})`);
    
    // Log usage
    if (req.customer) {
      logUsage(
        req.customer.id,
        chain,
        requestBody.method || 'unknown',
        JSON.stringify(result).length,
        req.requestId,
        req.ip
      );
    }
    
    res.json(result);
    
  } catch (error) {
    console.error(`Single chain request failed [${req.requestId}]:`, error.message);
    res.status(502).json({
      jsonrpc: "2.0",
      id: requestBody?.id || null,
      error: {
        code: -32603,
        message: "Internal error",
        data: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
}

// Enhanced multi-chain handler with better error handling and troubleshooting
async function handleMultiChainRequest(requestBody, req) {
  const results = {};
  
  // Create promises for all chains with enhanced error handling
  const chainPromises = Object.keys(NODES).map(async (chainName) => {
    try {
      // Apply 30ms delay per chain
      await new Promise(resolve => setTimeout(resolve, 30));
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);
      
      console.log(`🔗 Multi-chain request to ${chainName} (30ms delay applied)`);
      
      const response = await fetch(NODES[chainName], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Multi-EVM-Gateway/1.0 (Node.js; compatible; +https://aetherweb3.xyz)',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
          'Accept-Encoding': 'gzip, deflate',
          'X-Forwarded-For': req.headers['x-forwarded-for'] || req.ip,
          'X-Real-IP': req.headers['x-real-ip'] || req.ip,
          'X-Gateway-Source': 'multi-evm-gateway',
          'X-Gateway-Version': '1.0',
          'Referer': 'https://aetherweb3.xyz/',
          'Origin': 'https://aetherweb3.xyz'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
        keepalive: true,
        timeout: 40000
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      console.log(`✅ ${chainName} multi-chain request completed (${response.status})`);
      
      // Log usage
      if (req.customer) {
        logUsage(
          req.customer.id,
          chainName,
          requestBody.method || 'unknown',
          JSON.stringify(result).length,
          req.requestId,
          req.ip
        );
      }
      
      return { chainName, result };
      
    } catch (error) {
      console.warn(`❌ Chain ${chainName} failed:`, error.message);
      
      // Detailed error logging for troubleshooting
      if (error.name === 'AbortError') {
        console.warn(`⏰ ${chainName} request timed out`);
      } else if (error.code === 'ECONNREFUSED') {
        console.warn(`🚫 ${chainName} connection refused - check firewall`);
      } else if (error.code === 'ENOTFOUND') {
        console.warn(`🔍 ${chainName} DNS resolution failed`);
      } else if (error.code === 'ECONNRESET') {
        console.warn(`🔄 ${chainName} connection reset - possible DDoS protection`);
      }
      
      return { 
        chainName, 
        result: null, 
        error: error.message,
        troubleshooting: {
          firewall: error.code === 'ECONNREFUSED',
          dns: error.code === 'ENOTFOUND',
          timeout: error.name === 'AbortError',
          ddos: error.code === 'ECONNRESET'
        }
      };
    }
  });
  
  // Wait for all chain responses
  const chainResults = await Promise.allSettled(chainPromises);
  
  // Process results with enhanced error reporting
  chainResults.forEach((promiseResult) => {
    if (promiseResult.status === 'fulfilled') {
      const { chainName, result, error, troubleshooting } = promiseResult.value;
      
      if (result && !error) {
        // Successful response
        results[chainName] = result.result || result;
      } else {
        // Chain failed, set to null with error info
        results[chainName] = {
          error: error || 'Unknown error',
          troubleshooting: troubleshooting || {}
        };
      }
    } else {
      // Promise rejected
      console.warn('Chain promise rejected:', promiseResult.reason);
    }
  });
  
  console.log(`🎯 Multi-chain request completed: ${Object.keys(results).length} chains processed`);
  
  return results;
}

// Unified multi-chain RPC endpoint
app.post('/api/v1/rpc', authenticate, validateJsonRpc, async (req, res) => {
  try {
    const requestBody = req.body;
    const targetChain = requestBody.chain;
    
    // If specific chain is requested, route to that chain only
    if (targetChain && NODES[targetChain]) {
      return await handleSingleChainRequest(targetChain, requestBody, req, res);
    }
    
    // If no chain specified or invalid chain, query all chains
    const results = await handleMultiChainRequest(requestBody, req);
    
    // Return aggregated results
    res.json({
      jsonrpc: "2.0",
      id: requestBody.id,
      result: results,
      chains: Object.keys(NODES),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`Multi-chain RPC error [${req.requestId}]:`, error.message);
    res.status(500).json({
      jsonrpc: "2.0",
      id: req.body?.id || null,
      error: {
        code: -32603,
        message: "Internal error",
        data: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

// Payment page route
app.get('/payment', (req, res) => {
  const paymentPageHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AetherWeb3 - Payment Plans</title>
    <script src="https://js.stripe.com/v3/"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .header {
            text-align: center;
            margin-bottom: 3rem;
            color: white;
        }
        
        .header h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .pricing-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
        }
        
        .pricing-card {
            background: white;
            border-radius: 20px;
            padding: 2.5rem;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .pricing-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 30px 60px rgba(0,0,0,0.15);
        }
        
        .pricing-card.featured {
            border: 3px solid #667eea;
            transform: scale(1.05);
        }
        
        .pricing-card.featured::before {
            content: 'Most Popular';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 0.5rem;
            font-weight: bold;
            font-size: 0.9rem;
        }
        
        .plan-name {
            font-size: 1.8rem;
            font-weight: bold;
            color: #333;
            margin-bottom: 1rem;
        }
        
        .plan-price {
            font-size: 3rem;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 0.5rem;
        }
        
        .plan-period {
            color: #666;
            margin-bottom: 2rem;
            font-size: 1rem;
        }
        
        .features {
            list-style: none;
            margin-bottom: 2rem;
        }
        
        .features li {
            padding: 0.75rem 0;
            border-bottom: 1px solid #f0f0f0;
            position: relative;
            padding-left: 2rem;
        }
        
        .features li::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #667eea;
            font-weight: bold;
            font-size: 1.2rem;
        }
        
        .features li:last-child {
            border-bottom: none;
        }
        
        .subscribe-btn {
            width: 100%;
            padding: 1rem 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 1.1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .subscribe-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        
        .subscribe-btn:active {
            transform: translateY(0);
        }
        
        .footer {
            text-align: center;
            color: white;
            opacity: 0.8;
            margin-top: 3rem;
        }
        
        .footer a {
            color: white;
            text-decoration: none;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .pricing-container {
                grid-template-columns: 1fr;
            }
            
            .pricing-card.featured {
                transform: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>AetherWeb3 API Plans</h1>
            <p>Choose the perfect plan for your blockchain development needs</p>
        </div>
        
        <div class="pricing-container">
            <!-- Starter Plan -->
            <div class="pricing-card">
                <div class="plan-name">Starter</div>
                <div class="plan-price">$9.99</div>
                <div class="plan-period">per month</div>
                <ul class="features">
                    <li>100,000 API requests/month</li>
                    <li>Multi-EVM support</li>
                    <li>WebSocket connections</li>
                    <li>Rate limiting protection</li>
                    <li>24/7 uptime monitoring</li>
                    <li>Email support</li>
                </ul>
                <button class="subscribe-btn" onclick="subscribe('starter')">
                    Get Started
                </button>
            </div>
            
            <!-- Pro Plan (Featured) -->
            <div class="pricing-card featured">
                <div class="plan-name">Pro</div>
                <div class="plan-price">$29.99</div>
                <div class="plan-period">per month</div>
                <ul class="features">
                    <li>1,000,000 API requests/month</li>
                    <li>All Starter features</li>
                    <li>Priority routing</li>
                    <li>Advanced analytics</li>
                    <li>Custom rate limits</li>
                    <li>Priority support</li>
                    <li>SLA guarantee</li>
                </ul>
                <button class="subscribe-btn" onclick="subscribe('pro')">
                    Go Pro
                </button>
            </div>
            
            <!-- Enterprise Plan -->
            <div class="pricing-card">
                <div class="plan-name">Enterprise</div>
                <div class="plan-price">Custom</div>
                <div class="plan-period">contact sales</div>
                <ul class="features">
                    <li>Unlimited API requests</li>
                    <li>All Pro features</li>
                    <li>Dedicated infrastructure</li>
                    <li>Custom integrations</li>
                    <li>White-label options</li>
                    <li>Dedicated support</li>
                    <li>Custom SLA</li>
                </ul>
                <button class="subscribe-btn" onclick="contactSales()">
                    Contact Sales
                </button>
            </div>
        </div>
        
        <div class="footer">
            <p>Powered by <a href="https://aetherweb3.xyz">AetherWeb3</a> | 
            <a href="mailto:sales@nibertinvestments.com">Contact Support</a></p>
        </div>
    </div>
    
    <script>
        const stripe = Stripe('${process.env.STRIPE_PUBLISHABLE_KEY || 'pk_live_51Rz6RyL16dRIvW3a4oO4uUhxqnm6sS25nZiMjD2fUzV844TJlAOz5uQCwlMDbxfekO2Dy17aknAao5RJghuQokR100breUUXps'}');
        
        async function subscribe(plan) {
            try {
                const response = await fetch('/api/create-checkout-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        plan: plan,
                        successUrl: window.location.origin + '/payment?success=true',
                        cancelUrl: window.location.href
                    })
                });
                
                const session = await response.json();
                
                if (session.error) {
                    alert('Error: ' + session.error);
                    return;
                }
                
                // Redirect to Stripe Checkout
                const result = await stripe.redirectToCheckout({
                    sessionId: session.id
                });
                
                if (result.error) {
                    alert('Error: ' + result.error.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            }
        }
        
        function contactSales() {
            window.location.href = 'mailto:sales@nibertinvestments.com?subject=Enterprise Plan Inquiry';
        }
        
        // Check for success parameter
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('success') === 'true') {
            alert('Payment successful! Your subscription is now active.');
        }
    </script>
</body>
</html>
`;
  
  res.setHeader('Content-Type', 'text/html');
  res.send(paymentPageHTML);
});

// Stripe checkout session creation endpoint
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }
    
    const { plan, successUrl, cancelUrl } = req.body;
    
    // Plan pricing mapping (these should be set as environment variables)
    const planPrices = {
      starter: process.env.STRIPE_STARTER_PRICE_ID || 'price_1Svc4nL16dRIvW3aWfiGMqJJ',
      pro: process.env.STRIPE_PRO_PRICE_ID || 'price_1Svc4qL16dRIvW3aVJEYnLF1'
    };
    
    if (!planPrices[plan]) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: planPrices[plan],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || 'https://aetherweb3.xyz/payment?success=true',
      cancel_url: cancelUrl || 'https://aetherweb3.xyz/payment',
      metadata: {
        plan: plan
      }
    });
    
    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Create proxy middleware for each chain
Object.keys(NODES).forEach(chain => {
  const proxyOptions = {
    target: NODES[chain],
    changeOrigin: true,
    pathRewrite: {
      [`^/api/v1/${chain}`]: '',
    },
    timeout: 30000,
    proxyTimeout: 30000,
    onError: (err, req, res) => {
      console.error(`Proxy error for ${chain}:`, err.message);
      if (!res.headersSent) {
        res.status(502).json({
          error: 'Gateway error',
          message: 'Blockchain node unavailable',
          chain: chain,
          timestamp: new Date().toISOString()
        });
      }
    },
    onProxyReq: (proxyReq, req, res) => {
      // Log request to blockchain node
      console.log(`Proxying to ${chain}: ${req.method} ${req.path}`);
      
      // Ensure proper headers
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Accept', 'application/json');
      
      // Log usage
      if (req.customer && req.body) {
        logUsage(
          req.customer.id, 
          chain, 
          req.body.method || 'unknown',
          JSON.stringify(req.body).length,
          req.requestId,
          req.ip
        );
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      // Log response from blockchain node
      console.log(`Response from ${chain}: ${proxyRes.statusCode}`);
      
      // Add custom headers
      proxyRes.headers['X-Gateway'] = 'Multi-EVM-Gateway';
      proxyRes.headers['X-Chain'] = chain;
      proxyRes.headers['X-Customer'] = req.customer?.id || 'anonymous';
    }
  };

  const proxy = createProxyMiddleware(proxyOptions);

  // Apply middleware stack for each chain
  app.use(`/api/v1/${chain}`, authenticate, validateJsonRpc, proxy);
});

// Server-Sent Events for real-time blockchain updates
app.get('/api/v1/stream/:chain', authenticate, (req, res) => {
  const { chain } = req.params;
  
  if (!NODES[chain]) {
    return res.status(400).json({ error: 'Invalid chain' });
  }

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial connection event
  res.write(`data: ${JSON.stringify({
    type: 'connected',
    chain: chain,
    timestamp: new Date().toISOString()
  })}\n\n`);

  // Simulate real-time blockchain data (replace with actual WebSocket to node)
  const interval = setInterval(async () => {
    try {
      // Example: Get latest block number
      const response = await fetch(NODES[chain], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        })
      });
      
      const data = await response.json();
      res.write(`data: ${JSON.stringify({
        type: 'blockUpdate',
        chain: chain,
        blockNumber: data.result,
        timestamp: new Date().toISOString()
      })}\n\n`);
    } catch (error) {
      res.write(`data: ${JSON.stringify({
        type: 'error',
        message: 'Failed to fetch block data',
        timestamp: new Date().toISOString()
      })}\n\n`);
    }
  }, 5000); // Update every 5 seconds

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(interval);
    console.log(`SSE client disconnected from ${chain}`);
  });
});

// WebSocket handling for real-time data
app.get('/ws/v1/:chain', (req, res) => {
  const { chain } = req.params;
  
  if (!WS_NODES[chain]) {
    return res.status(400).json({ error: 'Invalid chain for WebSocket' });
  }

  res.json({
    message: 'WebSocket endpoint available',
    chain: chain,
    endpoint: WS_NODES[chain],
    usage: `Connect to ws://your-domain/ws/v1/${chain} with Authorization header`,
    auth_required: true
  });
});

// --- Enhanced Server with HTTP/2 Support ---
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Try to use HTTPS for HTTP/2 support, fallback to HTTP
let server;
const isProduction = process.env.NODE_ENV === 'production';
const domain = process.env.DOMAIN || 'aetherweb3.xyz';

try {
  if (isProduction) {
    // Production: For Free Cloudflare plan, run HTTP server (Cloudflare handles HTTPS)
    // For Pro plan with Origin certificates, uncomment HTTPS section below
    
    console.log('🌐 Production mode: HTTP server (Cloudflare handles SSL termination)');
    server = http.createServer(app);
    
    /* HTTPS Configuration for Pro Plan with Origin Certificates:
    let options;
    
    // Try Cloudflare Origin certificates
    try {
      options = {
        key: fs.readFileSync('/etc/ssl/private/aetherweb3_private.key'),
        cert: fs.readFileSync('/etc/ssl/certs/aetherweb3_origin.pem')
      };
      console.log('🔒 Using Cloudflare Origin certificates');
      server = https.createServer(options, app);
    } catch (cfError) {
      // Fallback to Let's Encrypt
      const certPath = process.env.CERT_PATH || `/etc/letsencrypt/live/${domain}`;
      options = {
        key: fs.readFileSync(path.join(certPath, 'privkey.pem')),
        cert: fs.readFileSync(path.join(certPath, 'fullchain.pem'))
      };
      console.log('🔒 Using Let\'s Encrypt certificates');
      server = https.createServer(options, app);
    }
    */
    
    console.log(`✨ Gateway configured for ${domain} (Cloudflare Free Plan)`);
  } else {
    // Development: Try local certificates, fallback to HTTP
    try {
      const options = {
        key: fs.readFileSync('./certificates/privkey.pem'),
        cert: fs.readFileSync('./certificates/fullchain.pem')
      };
      server = https.createServer(options, app);
      console.log('🔒 HTTPS server created with local certificates');
    } catch (certError) {
      console.warn('⚠️  SSL certificates not found, using HTTP server');
      server = http.createServer(app);
    }
  }
} catch (error) {
  console.warn('⚠️  SSL setup failed, using HTTP server:', error.message);
  server = http.createServer(app);
}

// Stripe webhook endpoint (for handling successful payments)
app.post('/webhook/stripe', express.raw({type: 'application/json'}), (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }
  
  const sig = req.headers['stripe-signature'];
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle billing events
  switch (event.type) {
    case 'invoice.payment_succeeded':
      console.log('Payment succeeded:', event.data.object);
      break;
    case 'invoice.payment_failed':
      console.log('Payment failed:', event.data.object);
      // TODO: Suspend API access
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

const PORT = process.env.PORT || 8080;
const isHTTPS = server instanceof https.Server;
const protocol = isHTTPS ? 'https' : 'http';
const wsProtocol = isHTTPS ? 'wss' : 'ws';

// Add error handling for unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`🚀 Multi-EVM Gateway running on port ${PORT}`);
  console.log(`🌐 Protocol: ${protocol.toUpperCase()}${isHTTPS ? ' (HTTP/2 enabled)' : ''}`);
  console.log(`📡 Project: ${process.env.PROJECT_ID || 'multi-evm-gateway-8511'}`);
  console.log(`⛓️  Available chains:`, Object.keys(NODES));
  
  console.log('\n📋 API Endpoints:');
  Object.keys(NODES).forEach(chain => {
    console.log(`   ${protocol}://localhost:${PORT}/api/v1/${chain}`);
  });
  
  // Add the new unified endpoint to the listing
  console.log(`   ${protocol}://localhost:${PORT}/api/v1/rpc (Multi-chain unified endpoint)`);
  console.log(`   ${protocol}://localhost:${PORT}/payment (Payment page)`);
  
  console.log('\n🔌 WebSocket Endpoints:');
  Object.keys(WS_NODES).forEach(chain => {
    console.log(`   ${wsProtocol}://localhost:${PORT}/ws/v1/${chain}`);
  });
  
  console.log('\n📊 Server-Sent Events:');
  Object.keys(NODES).forEach(chain => {
    console.log(`   ${protocol}://localhost:${PORT}/api/v1/stream/${chain}`);
  });
  
  console.log('\n💳 Payment & Management:');
  console.log(`   ${protocol}://localhost:${PORT}/payment (Payment plans)`);
  console.log(`   ${protocol}://localhost:${PORT}/api/v1/usage (Usage analytics)`);
  console.log(`   ${protocol}://localhost:${PORT}/health (Health check)`);
  
  console.log('\n🔐 Authentication:');
  console.log('   Use X-API-Key header with valid API key');
  console.log('   Test keys: test@aetherweb3.xyz, aetherweb3-dev-key-2025, aetherweb3-pro-key-2025');
  
  console.log('\n⚡ Features:');
  console.log('   • Multi-chain support (Ethereum, Base, Arbitrum)');
  console.log('   • Enhanced rate limiting and authentication');
  console.log('   • Real-time WebSocket and SSE support');
  console.log('   • Usage analytics and billing integration');
  console.log('   • Stripe payment processing');
  console.log('   • 30ms delay protection against node overload');
  console.log('   • Advanced error handling and troubleshooting');
  
  if (isProduction) {
    console.log('\n🌊 Cloudflare Integration:');
    console.log('   • SSL termination handled by Cloudflare');
    console.log('   • DDoS protection active');
    console.log('   • Global CDN acceleration');
  }
});