
import { performance } from 'perf_hooks';
import cluster from 'cluster';
import os from 'os';

interface OptimizationConfig {
  enableCaching: boolean;
  enableCompression: boolean;
  enableRateLimiting: boolean;
  maxConcurrentRequests: number;
  responseTimeThreshold: number;
  memoryThreshold: number;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  hits: number;
}

export class ProductionOptimizationService {
  private cache = new Map<string, CacheEntry>();
  private requestQueue: Array<{ resolve: Function; reject: Function; fn: Function }> = [];
  private activeRequests = 0;
  private config: OptimizationConfig;

  constructor(config: Partial<OptimizationConfig> = {}) {
    this.config = {
      enableCaching: true,
      enableCompression: true,
      enableRateLimiting: true,
      maxConcurrentRequests: 100,
      responseTimeThreshold: 1000,
      memoryThreshold: 500 * 1024 * 1024, // 500MB
      ...config
    };

    // Cleanup cache every 5 minutes
    setInterval(() => this.cleanupCache(), 5 * 60 * 1000);
  }

  // Advanced caching with TTL and hit counting
  public cache(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
    if (!this.config.enableCaching) return;

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0
    });
  }

  public getFromCache(key: string): any | null {
    if (!this.config.enableCaching) return null;

    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    entry.hits++;
    return entry.data;
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Request queue management for load balancing
  public async queueRequest<T>(fn: () => Promise<T>): Promise<T> {
    if (this.activeRequests < this.config.maxConcurrentRequests) {
      this.activeRequests++;
      try {
        return await fn();
      } finally {
        this.activeRequests--;
        this.processQueue();
      }
    }

    return new Promise<T>((resolve, reject) => {
      this.requestQueue.push({ resolve, reject, fn });
    });
  }

  private async processQueue(): void {
    if (this.requestQueue.length === 0 || this.activeRequests >= this.config.maxConcurrentRequests) {
      return;
    }

    const { resolve, reject, fn } = this.requestQueue.shift()!;
    this.activeRequests++;

    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.activeRequests--;
      this.processQueue();
    }
  }

  // Memory optimization
  public checkMemoryUsage(): { usage: number; threshold: number; needsCleanup: boolean } {
    const memUsage = process.memoryUsage();
    const usage = memUsage.heapUsed;
    const needsCleanup = usage > this.config.memoryThreshold;

    if (needsCleanup) {
      this.forceGarbageCollection();
    }

    return {
      usage,
      threshold: this.config.memoryThreshold,
      needsCleanup
    };
  }

  private forceGarbageCollection(): void {
    if (global.gc) {
      global.gc();
    }
    
    // Clear old cache entries more aggressively
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl * 0.5 || entry.hits === 0) {
        this.cache.delete(key);
      }
    }
  }

  // Performance monitoring middleware
  public createPerformanceMiddleware() {
    return (req: any, res: any, next: any) => {
      const start = performance.now();
      const originalSend = res.send;

      res.send = function(data: any) {
        const duration = performance.now() - start;
        
        // Log slow requests
        if (duration > 1000) {
          console.warn(`Slow request: ${req.method} ${req.path} took ${duration.toFixed(2)}ms`);
        }

        // Set performance headers
        res.set('X-Response-Time', `${duration.toFixed(2)}ms`);
        res.set('X-Server-Performance', duration > 500 ? 'slow' : 'fast');

        return originalSend.call(this, data);
      };

      next();
    };
  }

  // Database connection pooling optimization
  public optimizeDatabase() {
    return {
      pool: {
        min: 2,
        max: 20,
        idle: 30000,
        acquire: 30000,
        evict: 1000
      },
      retry: {
        max: 3,
        backoffBase: 1000,
        backoffExponent: 1.5
      }
    };
  }

  // Static asset optimization
  public getStaticAssetConfig() {
    return {
      maxAge: '1y',
      etag: true,
      lastModified: true,
      setHeaders: (res: any, path: string) => {
        if (path.endsWith('.js') || path.endsWith('.css')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (path.endsWith('.html')) {
          res.setHeader('Cache-Control', 'public, max-age=3600');
        }
      }
    };
  }

  // API response compression
  public shouldCompress(req: any, res: any): boolean {
    if (!this.config.enableCompression) return false;
    
    // Don't compress if response is already compressed
    if (res.get('Content-Encoding')) return false;
    
    // Only compress text-based content
    const contentType = res.get('Content-Type') || '';
    return /json|text|javascript|css|xml/.test(contentType);
  }

  // Health check endpoint optimization
  public createHealthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      environment: process.env.NODE_ENV || 'development',
      cache: {
        size: this.cache.size,
        hitRate: this.calculateHitRate()
      },
      queue: {
        pending: this.requestQueue.length,
        active: this.activeRequests
      }
    };
  }

  private calculateHitRate(): number {
    const entries = Array.from(this.cache.values());
    if (entries.length === 0) return 0;
    
    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0);
    return totalHits / entries.length;
  }

  // Production logging configuration
  public getLoggingConfig() {
    return {
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
      format: 'json',
      transports: [
        {
          type: 'console',
          colorize: false,
          timestamp: true
        },
        {
          type: 'file',
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        },
        {
          type: 'file',
          filename: 'logs/combined.log',
          maxsize: 5242880,
          maxFiles: 5
        }
      ]
    };
  }

  public getCacheStats() {
    const entries = Array.from(this.cache.values());
    return {
      totalEntries: this.cache.size,
      totalHits: entries.reduce((sum, entry) => sum + entry.hits, 0),
      averageHits: entries.length > 0 ? entries.reduce((sum, entry) => sum + entry.hits, 0) / entries.length : 0,
      memoryUsage: JSON.stringify(Array.from(this.cache.entries())).length,
      hitRate: this.calculateHitRate()
    };
  }
}

export const productionOptimization = new ProductionOptimizationService();
