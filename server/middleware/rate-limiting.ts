
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  keyGenerator?: (req: any) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

class RateLimitManager {
  private redis: Redis | null = null;

  constructor() {
    if (process.env.REDIS_URL) {
      this.redis = new Redis(process.env.REDIS_URL);
    }
  }

  // Create rate limiter with different tiers
  createRateLimiter(tier: 'free' | 'pro' | 'enterprise', endpoint: string) {
    const configs: Record<string, RateLimitConfig> = {
      // Free tier limits
      'free-chat': {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 20, // 20 requests per window
        message: 'Free tier: Too many chat requests. Upgrade for higher limits.',
      },
      'free-api': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 100, // 100 requests per hour
        message: 'Free tier: API rate limit exceeded. Upgrade for higher limits.',
      },

      // Pro tier limits
      'pro-chat': {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // 100 requests per window
        message: 'Pro tier: Rate limit exceeded. Contact support for higher limits.',
      },
      'pro-api': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 1000, // 1000 requests per hour
        message: 'Pro tier: API rate limit exceeded.',
      },

      // Enterprise tier limits
      'enterprise-chat': {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 500, // 500 requests per window
        message: 'Enterprise tier: Rate limit exceeded.',
      },
      'enterprise-api': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 10000, // 10000 requests per hour
        message: 'Enterprise tier: API rate limit exceeded.',
      },
    };

    const configKey = `${tier}-${endpoint}`;
    const config = configs[configKey] || configs[`${tier}-api`];

    const rateLimitOptions: any = {
      ...config,
      keyGenerator: (req: any) => {
        // Use user ID if available, otherwise IP
        return req.user?.claims?.sub || req.ip;
      },
      handler: (req: any, res: any) => {
        res.status(429).json({
          error: 'Rate limit exceeded',
          message: config.message,
          retryAfter: Math.round(config.windowMs / 1000),
          tier,
          upgradeUrl: tier === 'free' ? '/upgrade' : '/contact-sales'
        });
      },
    };

    // Use Redis store if available for distributed rate limiting
    if (this.redis) {
      rateLimitOptions.store = new RedisStore({
        sendCommand: (...args: string[]) => this.redis!.call(...args),
      });
    }

    return rateLimit(rateLimitOptions);
  }

  // Dynamic rate limiting based on user behavior
  createAdaptiveRateLimiter() {
    return rateLimit({
      windowMs: 15 * 60 * 1000,
      max: (req: any) => {
        // Adjust limits based on user behavior
        const userTier = req.user?.tier || 'free';
        const baseLimit = userTier === 'enterprise' ? 500 : userTier === 'pro' ? 100 : 20;
        
        // Reduce limit for users with suspicious activity
        if (req.user?.riskScore > 5) {
          return Math.floor(baseLimit * 0.5);
        }
        
        // Increase limit for verified premium users
        if (req.user?.verified && userTier !== 'free') {
          return Math.floor(baseLimit * 1.5);
        }
        
        return baseLimit;
      },
      keyGenerator: (req: any) => req.user?.claims?.sub || req.ip,
      message: 'Adaptive rate limit exceeded based on usage patterns',
    });
  }

  // API quota management
  async checkAPIQuota(userId: string, tier: string): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
    const quotas = {
      free: { monthly: 1000, daily: 50 },
      pro: { monthly: 50000, daily: 2000 },
      enterprise: { monthly: 1000000, daily: 50000 }
    };

    const quota = quotas[tier as keyof typeof quotas] || quotas.free;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // In a real implementation, you'd check these against a database
    const monthlyUsage = 0; // Get from database
    const dailyUsage = 0; // Get from database

    const monthlyRemaining = quota.monthly - monthlyUsage;
    const dailyRemaining = quota.daily - dailyUsage;
    const remaining = Math.min(monthlyRemaining, dailyRemaining);

    return {
      allowed: remaining > 0,
      remaining,
      resetTime: new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
    };
  }
}

export const rateLimitManager = new RateLimitManager();

// Export specific limiters for different endpoints
export const chatRateLimit = (tier: string) => rateLimitManager.createRateLimiter(tier as any, 'chat');
export const apiRateLimit = (tier: string) => rateLimitManager.createRateLimiter(tier as any, 'api');
export const adaptiveRateLimit = rateLimitManager.createAdaptiveRateLimiter();
