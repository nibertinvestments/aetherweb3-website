const ApiKeyManager = require('../lib/apiKeyManager');

const apiKeyManager = new ApiKeyManager();

/**
 * Middleware to validate API keys
 */
async function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || 
                 req.headers['authorization']?.replace('Bearer ', '');

  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      message: 'Include your API key in the x-api-key header or Authorization Bearer token'
    });
  }

  try {
    // Validate the API key
    const keyInfo = await apiKeyManager.validateApiKey(apiKey);
    
    if (!keyInfo) {
      return res.status(401).json({
        error: 'Invalid API key',
        message: 'The provided API key is invalid or has been revoked'
      });
    }

    // Check if key is expired
    if (keyInfo.expiresAt && keyInfo.expiresAt < new Date()) {
      return res.status(401).json({
        error: 'API key expired',
        message: 'Your API key has expired. Please generate a new one.'
      });
    }

    // Attach key info to request
    req.keyInfo = keyInfo;
    req.customerId = keyInfo.customerId;
    req.apiKeyId = keyInfo.id;

    next();
  } catch (error) {
    console.error('API key validation failed:', error);
    return res.status(500).json({
      error: 'Authentication error',
      message: 'Unable to validate API key'
    });
  }
}

/**
 * Middleware to enforce rate limits based on API key tier
 */
async function rateLimitByTier(req, res, next) {
  if (!req.keyInfo) {
    return next();
  }

  const tier = req.keyInfo.tier;
  const limits = req.keyInfo.rateLimit;
  
  // For now, we'll implement basic rate limiting
  // In production, use Redis or similar for distributed rate limiting
  req.rateLimit = {
    tier,
    limit: limits.requestsPerMinute,
    remaining: limits.requestsPerMinute // Simplified for demo
  };

  // Add rate limit headers
  res.set({
    'X-RateLimit-Tier': tier,
    'X-RateLimit-Limit': limits.requestsPerMinute.toString(),
    'X-RateLimit-Remaining': req.rateLimit.remaining.toString(),
    'X-RateLimit-Reset': Math.floor(Date.now() / 1000) + 60 // Reset in 60 seconds
  });

  next();
}

/**
 * Middleware to track API usage for analytics and billing
 */
function trackUsage(req, res, next) {
  if (!req.keyInfo) {
    return next();
  }

  const originalSend = res.send;
  const startTime = Date.now();

  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Track usage asynchronously (don't block response)
    setImmediate(async () => {
      try {
        await apiKeyManager.trackUsage(
          req.apiKeyId,
          req.path,
          req.method,
          statusCode,
          responseTime
        );
      } catch (error) {
        console.error('Failed to track usage:', error);
      }
    });

    // Add response headers
    res.set({
      'X-Response-Time': `${responseTime}ms`,
      'X-API-Key-ID': req.apiKeyId
    });

    originalSend.call(this, data);
  };

  next();
}

/**
 * Middleware to check method permissions
 */
function checkMethodPermissions(req, res, next) {
  if (!req.keyInfo || !req.body || !req.body.method) {
    return next();
  }

  const method = req.body.method;
  const permissions = req.keyInfo.permissions;

  // Define method categories
  const readMethods = [
    'eth_blockNumber', 'eth_getBalance', 'eth_getTransactionByHash',
    'eth_getTransactionReceipt', 'eth_call', 'eth_gasPrice',
    'eth_getBlockByNumber', 'eth_getBlockByHash', 'eth_getLogs',
    'eth_chainId', 'net_version', 'web3_clientVersion', 'eth_syncing',
    'eth_getCode', 'eth_getStorageAt', 'eth_getTransactionCount',
    'eth_estimateGas', 'eth_feeHistory', 'eth_maxPriorityFeePerGas'
  ];

  const writeMethods = [
    'eth_sendRawTransaction', 'eth_sendTransaction'
  ];

  // Check permissions
  if (writeMethods.includes(method) && !permissions.write) {
    return res.status(403).json({
      error: 'Insufficient permissions',
      message: 'Write permission required for this method',
      method: method,
      required_permission: 'write'
    });
  }

  if (readMethods.includes(method) && !permissions.read) {
    return res.status(403).json({
      error: 'Insufficient permissions', 
      message: 'Read permission required for this method',
      method: method,
      required_permission: 'read'
    });
  }

  next();
}

/**
 * Middleware to handle CORS for API requests
 */
function corsHandler(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
}

/**
 * Error handling middleware for authentication
 */
function authErrorHandler(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing authentication token'
    });
  }
  
  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Insufficient permissions for this operation'
    });
  }
  
  next(err);
}

module.exports = {
  validateApiKey,
  rateLimitByTier,
  trackUsage,
  checkMethodPermissions,
  corsHandler,
  authErrorHandler,
  apiKeyManager
};