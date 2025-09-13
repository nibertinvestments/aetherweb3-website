# 🚀 **EVM GATEWAY BUILD PLAN**

## **📋 COMPLETE GATEWAY DEPLOYMENT STEPS**

### **Phase 1: Gateway Application Development**

#### **Step 1: Create Node.js Gateway Service**
```bash
# Create gateway directory structure
mkdir evm-gateway
cd evm-gateway

# Initialize Node.js project
npm init -y

# Install required dependencies
npm install express cors helmet rate-limiter-flexible
npm install axios ws uuid jsonwebtoken bcryptjs
npm install @google-cloud/firestore @google-cloud/logging
npm install dotenv compression morgan
```

#### **Step 2: Build Gateway Application Code**
```javascript
// server.js - Main gateway server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('rate-limiter-flexible');
const axios = require('axios');

// Import route handlers
const ethRoutes = require('./routes/ethereum');
const arbRoutes = require('./routes/arbitrum');
const baseRoutes = require('./routes/base');
const authRoutes = require('./routes/auth');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting configuration
const rateLimiter = new rateLimit.RateLimiterMemory({
  keyPrefix: 'evm_api',
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

// Apply rate limiting middleware
app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({ error: 'Too many requests' });
  }
});

// Routes
app.use('/api/v1/eth', ethRoutes);
app.use('/api/v1/arbitrum', arbRoutes);
app.use('/api/v1/base', baseRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Gateway server running on port ${PORT}`);
});
```

#### **Step 3: Create Route Handlers**
```javascript
// routes/ethereum.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const ETH_NODE_URL = process.env.ETH_NODE_URL || 'http://10.128.0.2:8545';

router.post('/', async (req, res) => {
  try {
    const response = await axios.post(ETH_NODE_URL, req.body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Ethereum node error' });
  }
});

module.exports = router;
```