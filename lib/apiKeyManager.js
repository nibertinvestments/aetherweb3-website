const crypto = require('crypto');
const { Firestore } = require('@google-cloud/firestore');
const { KeyManagementServiceClient } = require('@google-cloud/kms');

class ApiKeyManager {
  constructor() {
    this.firestore = new Firestore();
    this.kmsClient = new KeyManagementServiceClient();
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT || 'multi-evm-gateway-8511';
    this.keyRingPath = this.kmsClient.keyRingPath(
      this.projectId,
      'global',
      'api-key-ring'
    );
    this.cryptoKeyPath = this.keyRingPath + '/cryptoKeys/api-key-encryption';
  }

  /**
   * Generate a cryptographically secure API key
   */
  generateApiKey(prefix = 'live') {
    const randomBytes = crypto.randomBytes(32);
    const key = randomBytes.toString('base64url');
    return `ak_${prefix}_${key}`;
  }

  /**
   * Hash API key for secure storage
   */
  hashApiKey(apiKey) {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  /**
   * Encrypt API key using Google Cloud KMS
   */
  async encryptApiKey(plainKey) {
    try {
      const [result] = await this.kmsClient.encrypt({
        name: this.cryptoKeyPath,
        plaintext: Buffer.from(plainKey, 'utf8'),
      });
      return result.ciphertext.toString('base64');
    } catch (error) {
      console.error('KMS encryption error:', error);
      throw new Error('Failed to encrypt API key');
    }
  }

  /**
   * Decrypt API key using Google Cloud KMS
   */
  async decryptApiKey(encryptedKey) {
    try {
      const [result] = await this.kmsClient.decrypt({
        name: this.cryptoKeyPath,
        ciphertext: Buffer.from(encryptedKey, 'base64'),
      });
      return result.plaintext.toString('utf8');
    } catch (error) {
      console.error('KMS decryption error:', error);
      throw new Error('Failed to decrypt API key');
    }
  }

  /**
   * Create a new API key for a customer
   */
  async createApiKey(customerId, keyName, permissions = { read: true, write: false }, tier = 'free') {
    try {
      const apiKey = this.generateApiKey();
      const hashedKey = this.hashApiKey(apiKey);
      const encryptedKey = await this.encryptApiKey(apiKey);

      const keyData = {
        id: crypto.randomUUID(),
        customerId,
        name: keyName,
        hashedKey,
        encryptedKey,
        permissions,
        tier,
        status: 'active',
        createdAt: new Date(),
        lastUsedAt: null,
        usageCount: 0,
        rateLimit: this.getTierRateLimit(tier),
        expiresAt: null // Keys don't expire by default
      };

      // Store in Firestore
      await this.firestore.collection('apiKeys').doc(keyData.id).set(keyData);

      // Return the plain key only once
      return {
        id: keyData.id,
        apiKey,
        name: keyName,
        permissions,
        tier,
        rateLimit: keyData.rateLimit,
        createdAt: keyData.createdAt
      };
    } catch (error) {
      console.error('Error creating API key:', error);
      throw new Error('Failed to create API key');
    }
  }

  /**
   * Validate an API key and return key information
   */
  async validateApiKey(apiKey) {
    try {
      const hashedKey = this.hashApiKey(apiKey);
      
      // Query Firestore for the hashed key
      const snapshot = await this.firestore
        .collection('apiKeys')
        .where('hashedKey', '==', hashedKey)
        .where('status', '==', 'active')
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const keyDoc = snapshot.docs[0];
      const keyData = keyDoc.data();

      // Check if key is expired
      if (keyData.expiresAt && keyData.expiresAt.toDate() < new Date()) {
        return null;
      }

      // Update last used timestamp and usage count
      await keyDoc.ref.update({
        lastUsedAt: new Date(),
        usageCount: (keyData.usageCount || 0) + 1
      });

      return {
        id: keyData.id,
        customerId: keyData.customerId,
        name: keyData.name,
        permissions: keyData.permissions,
        tier: keyData.tier,
        rateLimit: keyData.rateLimit,
        usageCount: (keyData.usageCount || 0) + 1,
        lastUsedAt: new Date()
      };
    } catch (error) {
      console.error('Error validating API key:', error);
      return null;
    }
  }

  /**
   * List all API keys for a customer
   */
  async listApiKeys(customerId) {
    try {
      const snapshot = await this.firestore
        .collection('apiKeys')
        .where('customerId', '==', customerId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: data.id,
          name: data.name,
          permissions: data.permissions,
          tier: data.tier,
          status: data.status,
          createdAt: data.createdAt,
          lastUsedAt: data.lastUsedAt,
          usageCount: data.usageCount,
          rateLimit: data.rateLimit,
          // Never return the actual key or encrypted key
          maskedKey: this.maskApiKey(data.hashedKey)
        };
      });
    } catch (error) {
      console.error('Error listing API keys:', error);
      throw new Error('Failed to list API keys');
    }
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(keyId, customerId) {
    try {
      const keyRef = this.firestore.collection('apiKeys').doc(keyId);
      const doc = await keyRef.get();

      if (!doc.exists) {
        throw new Error('API key not found');
      }

      const keyData = doc.data();
      if (keyData.customerId !== customerId) {
        throw new Error('Unauthorized to revoke this API key');
      }

      await keyRef.update({
        status: 'revoked',
        revokedAt: new Date()
      });

      return true;
    } catch (error) {
      console.error('Error revoking API key:', error);
      throw new Error('Failed to revoke API key');
    }
  }

  /**
   * Update API key permissions or tier
   */
  async updateApiKey(keyId, customerId, updates) {
    try {
      const keyRef = this.firestore.collection('apiKeys').doc(keyId);
      const doc = await keyRef.get();

      if (!doc.exists) {
        throw new Error('API key not found');
      }

      const keyData = doc.data();
      if (keyData.customerId !== customerId) {
        throw new Error('Unauthorized to update this API key');
      }

      const allowedUpdates = {};
      if (updates.name) allowedUpdates.name = updates.name;
      if (updates.permissions) allowedUpdates.permissions = updates.permissions;
      if (updates.tier) {
        allowedUpdates.tier = updates.tier;
        allowedUpdates.rateLimit = this.getTierRateLimit(updates.tier);
      }

      allowedUpdates.updatedAt = new Date();

      await keyRef.update(allowedUpdates);
      return true;
    } catch (error) {
      console.error('Error updating API key:', error);
      throw new Error('Failed to update API key');
    }
  }

  /**
   * Get rate limit for tier
   */
  getTierRateLimit(tier) {
    const limits = {
      'free': { requestsPerMinute: 100, requestsPerDay: 120000 },
      'basic': { requestsPerMinute: 1000, requestsPerDay: 1000000 },
      'pro': { requestsPerMinute: 10000, requestsPerDay: 10000000 },
      'enterprise': { requestsPerMinute: 100000, requestsPerDay: 100000000 }
    };
    return limits[tier] || limits['free'];
  }

  /**
   * Mask API key for display
   */
  maskApiKey(hashedKey) {
    if (!hashedKey || hashedKey.length < 8) return '****';
    return `ak_****_${hashedKey.slice(-8)}`;
  }

  /**
   * Track API key usage
   */
  async trackUsage(keyId, endpoint, method, statusCode, responseTime) {
    try {
      const usageData = {
        keyId,
        endpoint,
        method,
        statusCode,
        responseTime,
        timestamp: new Date(),
        date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
      };

      // Store usage data for analytics
      await this.firestore.collection('apiUsage').add(usageData);

      // Update daily usage counter
      const dailyUsageRef = this.firestore
        .collection('dailyUsage')
        .doc(`${keyId}_${usageData.date}`);

      await this.firestore.runTransaction(async (transaction) => {
        const doc = await transaction.get(dailyUsageRef);
        if (doc.exists) {
          transaction.update(dailyUsageRef, {
            count: doc.data().count + 1,
            lastRequest: new Date()
          });
        } else {
          transaction.set(dailyUsageRef, {
            keyId,
            date: usageData.date,
            count: 1,
            firstRequest: new Date(),
            lastRequest: new Date()
          });
        }
      });
    } catch (error) {
      console.error('Error tracking usage:', error);
      // Don't throw error for usage tracking failures
    }
  }

  /**
   * Get usage statistics for an API key
   */
  async getUsageStats(keyId, days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const snapshot = await this.firestore
        .collection('apiUsage')
        .where('keyId', '==', keyId)
        .where('timestamp', '>=', startDate)
        .where('timestamp', '<=', endDate)
        .get();

      const usage = snapshot.docs.map(doc => doc.data());
      
      return {
        totalRequests: usage.length,
        averageResponseTime: usage.reduce((sum, req) => sum + req.responseTime, 0) / usage.length || 0,
        errorRate: usage.filter(req => req.statusCode >= 400).length / usage.length || 0,
        dailyBreakdown: this.groupUsageByDay(usage),
        endpointBreakdown: this.groupUsageByEndpoint(usage)
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      throw new Error('Failed to get usage statistics');
    }
  }

  /**
   * Group usage by day
   */
  groupUsageByDay(usage) {
    const groups = {};
    usage.forEach(req => {
      const day = req.timestamp.toDate().toISOString().split('T')[0];
      groups[day] = (groups[day] || 0) + 1;
    });
    return groups;
  }

  /**
   * Group usage by endpoint
   */
  groupUsageByEndpoint(usage) {
    const groups = {};
    usage.forEach(req => {
      groups[req.endpoint] = (groups[req.endpoint] || 0) + 1;
    });
    return groups;
  }
}

module.exports = ApiKeyManager;