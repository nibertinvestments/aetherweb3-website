const express = require('express');
const { apiKeyManager } = require('../middleware/auth');

const router = express.Router();

/**
 * Create new API key
 * POST /api/keys
 */
router.post('/', async (req, res) => {
  try {
    const { customerId, name, permissions, tier } = req.body;
    
    // Validate input
    if (!customerId) {
      return res.status(400).json({ 
        error: 'Customer ID is required' 
      });
    }

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ 
        error: 'Name is required and must be a string' 
      });
    }

    // Validate permissions
    if (permissions) {
      const validPermissions = { read: true, write: false };
      if (typeof permissions !== 'object' || 
          typeof permissions.read !== 'boolean' || 
          typeof permissions.write !== 'boolean') {
        return res.status(400).json({ 
          error: 'Permissions must be an object with read and write boolean properties',
          example: validPermissions
        });
      }
    }

    // Validate tier
    const validTiers = ['free', 'basic', 'pro', 'enterprise'];
    if (tier && !validTiers.includes(tier)) {
      return res.status(400).json({ 
        error: 'Invalid tier',
        validTiers 
      });
    }

    // Create the API key
    const newKey = await apiKeyManager.createApiKey(
      customerId,
      name,
      permissions || { read: true, write: false },
      tier || 'free'
    );

    res.status(201).json({
      success: true,
      data: newKey,
      warning: 'Store this API key securely - you will not be able to see it again!'
    });

  } catch (error) {
    console.error('Error creating API key:', error);
    res.status(500).json({
      error: 'Failed to create API key',
      message: error.message
    });
  }
});

/**
 * List customer's API keys
 * GET /api/keys?customerId=xxx
 */
router.get('/', async (req, res) => {
  try {
    const { customerId } = req.query;
    
    if (!customerId) {
      return res.status(400).json({
        error: 'Customer ID is required as query parameter'
      });
    }

    const keys = await apiKeyManager.listApiKeys(customerId);
    
    res.json({
      success: true,
      data: {
        keys,
        total: keys.length
      }
    });

  } catch (error) {
    console.error('Error listing API keys:', error);
    res.status(500).json({
      error: 'Failed to list API keys',
      message: error.message
    });
  }
});

/**
 * Get specific API key details
 * GET /api/keys/:keyId?customerId=xxx
 */
router.get('/:keyId', async (req, res) => {
  try {
    const { customerId } = req.query;
    const { keyId } = req.params;
    
    if (!customerId) {
      return res.status(400).json({
        error: 'Customer ID is required as query parameter'
      });
    }

    const keys = await apiKeyManager.listApiKeys(customerId);
    const key = keys.find(k => k.id === keyId);
    
    if (!key) {
      return res.status(404).json({
        error: 'API key not found'
      });
    }

    res.json({
      success: true,
      data: key
    });

  } catch (error) {
    console.error('Error getting API key:', error);
    res.status(500).json({
      error: 'Failed to get API key',
      message: error.message
    });
  }
});

/**
 * Update API key
 * PUT /api/keys/:keyId
 */
router.put('/:keyId', async (req, res) => {
  try {
    const { customerId, name, permissions, tier } = req.body;
    const { keyId } = req.params;
    
    if (!customerId) {
      return res.status(400).json({
        error: 'Customer ID is required'
      });
    }

    const updates = {};
    if (name) updates.name = name;
    if (permissions) updates.permissions = permissions;
    if (tier) updates.tier = tier;

    await apiKeyManager.updateApiKey(keyId, customerId, updates);

    res.json({
      success: true,
      message: 'API key updated successfully'
    });

  } catch (error) {
    console.error('Error updating API key:', error);
    res.status(500).json({
      error: 'Failed to update API key',
      message: error.message
    });
  }
});

/**
 * Revoke API key
 * DELETE /api/keys/:keyId?customerId=xxx
 */
router.delete('/:keyId', async (req, res) => {
  try {
    const { customerId } = req.query;
    const { keyId } = req.params;
    
    if (!customerId) {
      return res.status(400).json({
        error: 'Customer ID is required as query parameter'
      });
    }

    await apiKeyManager.revokeApiKey(keyId, customerId);

    res.json({
      success: true,
      message: 'API key revoked successfully'
    });

  } catch (error) {
    console.error('Error revoking API key:', error);
    res.status(500).json({
      error: 'Failed to revoke API key',
      message: error.message
    });
  }
});

/**
 * Get API key usage statistics
 * GET /api/keys/:keyId/usage?customerId=xxx&days=30
 */
router.get('/:keyId/usage', async (req, res) => {
  try {
    const { customerId, days = 30 } = req.query;
    const { keyId } = req.params;
    
    if (!customerId) {
      return res.status(400).json({
        error: 'Customer ID is required as query parameter'
      });
    }

    // Verify key belongs to customer
    const keys = await apiKeyManager.listApiKeys(customerId);
    const key = keys.find(k => k.id === keyId);
    
    if (!key) {
      return res.status(404).json({
        error: 'API key not found'
      });
    }

    const usage = await apiKeyManager.getUsageStats(keyId, parseInt(days));

    res.json({
      success: true,
      data: {
        keyId,
        usage,
        period: `${days} days`
      }
    });

  } catch (error) {
    console.error('Error getting usage stats:', error);
    res.status(500).json({
      error: 'Failed to get usage statistics',
      message: error.message
    });
  }
});

/**
 * Validate API key endpoint
 * POST /api/keys/validate
 */
router.post('/validate', async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({
        error: 'API key is required'
      });
    }

    const keyInfo = await apiKeyManager.validateApiKey(apiKey);
    
    if (!keyInfo) {
      return res.status(401).json({
        error: 'Invalid API key'
      });
    }

    res.json({
      success: true,
      data: {
        valid: true,
        keyId: keyInfo.id,
        customerId: keyInfo.customerId,
        name: keyInfo.name,
        permissions: keyInfo.permissions,
        tier: keyInfo.tier,
        rateLimit: keyInfo.rateLimit
      }
    });

  } catch (error) {
    console.error('Error validating API key:', error);
    res.status(500).json({
      error: 'Failed to validate API key',
      message: error.message
    });
  }
});

module.exports = router;