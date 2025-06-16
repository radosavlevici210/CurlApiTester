
import { performance } from 'perf_hooks';

interface PerformanceMetric {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: Date;
  userId?: string;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
}

interface SystemHealth {
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    percentage: number;
  };
  database: {
    connectionCount: number;
    queryTime: number;
    status: 'healthy' | 'degraded' | 'down';
  };
  api: {
    requestsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
  };
  storage: {
    diskUsage: number;
    availableSpace: number;
  };
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private startTime = Date.now();
  private requestCounts = new Map<string, number>();
  private errorCounts = new Map<string, number>();

  // Middleware to track request performance
  trackRequest() {
    return (req: any, res: any, next: any) => {
      const startTime = performance.now();
      const startCpuUsage = process.cpuUsage();

      res.on('finish', () => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        const endCpuUsage = process.cpuUsage(startCpuUsage);

        const metric: PerformanceMetric = {
          endpoint: req.route?.path || req.path,
          method: req.method,
          responseTime,
          statusCode: res.statusCode,
          timestamp: new Date(),
          userId: req.user?.claims?.sub,
          memoryUsage: process.memoryUsage(),
          cpuUsage: endCpuUsage
        };

        this.recordMetric(metric);
        this.updateRequestCounts(req.path, res.statusCode);
      });

      next();
    };
  }

  private recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Keep only last 10000 metrics in memory
    if (this.metrics.length > 10000) {
      this.metrics = this.metrics.slice(-5000);
    }

    // Log slow requests
    if (metric.responseTime > 5000) { // 5 seconds
      console.warn(`Slow request detected: ${metric.method} ${metric.endpoint} - ${metric.responseTime}ms`);
    }

    // Log errors
    if (metric.statusCode >= 400) {
      console.error(`Error response: ${metric.method} ${metric.endpoint} - ${metric.statusCode}`);
    }
  }

  private updateRequestCounts(path: string, statusCode: number) {
    const key = `${path}:${new Date().getMinutes()}`;
    this.requestCounts.set(key, (this.requestCounts.get(key) || 0) + 1);
    
    if (statusCode >= 400) {
      const errorKey = `error:${path}:${new Date().getMinutes()}`;
      this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);
    }

    // Cleanup old entries
    this.cleanupOldCounts();
  }

  private cleanupOldCounts() {
    const currentMinute = new Date().getMinutes();
    const cutoffMinute = (currentMinute - 60 + 60) % 60; // 60 minutes ago

    for (const [key] of this.requestCounts) {
      const minute = parseInt(key.split(':').pop() || '0');
      if (minute === cutoffMinute) {
        this.requestCounts.delete(key);
      }
    }

    for (const [key] of this.errorCounts) {
      const minute = parseInt(key.split(':').pop() || '0');
      if (minute === cutoffMinute) {
        this.errorCounts.delete(key);
      }
    }
  }

  // Get system health status
  getSystemHealth(): SystemHealth {
    const uptime = Date.now() - this.startTime;
    const memoryUsage = process.memoryUsage();
    const recentMetrics = this.getRecentMetrics(60000); // Last minute

    const requestsPerMinute = recentMetrics.length;
    const averageResponseTime = recentMetrics.length > 0 
      ? recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length 
      : 0;
    
    const errorCount = recentMetrics.filter(m => m.statusCode >= 400).length;
    const errorRate = recentMetrics.length > 0 ? (errorCount / recentMetrics.length) * 100 : 0;

    return {
      uptime,
      memory: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
        percentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
      },
      cpu: {
        percentage: this.calculateCPUPercentage()
      },
      database: {
        connectionCount: 1, // Mock value
        queryTime: 50, // Mock value
        status: 'healthy'
      },
      api: {
        requestsPerMinute,
        averageResponseTime,
        errorRate
      },
      storage: {
        diskUsage: 45, // Mock percentage
        availableSpace: 55 // Mock percentage
      }
    };
  }

  // Get performance analytics
  getPerformanceAnalytics(timeRange: '1h' | '24h' | '7d' | '30d') {
    const timeRanges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const cutoff = Date.now() - timeRanges[timeRange];
    const metrics = this.metrics.filter(m => m.timestamp.getTime() > cutoff);

    return {
      totalRequests: metrics.length,
      averageResponseTime: metrics.length > 0 
        ? metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length 
        : 0,
      p95ResponseTime: this.calculatePercentile(metrics.map(m => m.responseTime), 95),
      p99ResponseTime: this.calculatePercentile(metrics.map(m => m.responseTime), 99),
      errorRate: metrics.length > 0 
        ? (metrics.filter(m => m.statusCode >= 400).length / metrics.length) * 100 
        : 0,
      topEndpoints: this.getTopEndpoints(metrics),
      hourlyBreakdown: this.getHourlyBreakdown(metrics),
      statusCodeDistribution: this.getStatusCodeDistribution(metrics)
    };
  }

  private getRecentMetrics(timeMs: number): PerformanceMetric[] {
    const cutoff = Date.now() - timeMs;
    return this.metrics.filter(m => m.timestamp.getTime() > cutoff);
  }

  private calculateCPUPercentage(): number {
    // Simplified CPU calculation
    const recentMetrics = this.getRecentMetrics(60000);
    if (recentMetrics.length === 0) return 0;

    const avgCpuUser = recentMetrics.reduce((sum, m) => sum + m.cpuUsage.user, 0) / recentMetrics.length;
    return Math.min(100, (avgCpuUser / 1000000) * 100); // Convert microseconds to percentage
  }

  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  private getTopEndpoints(metrics: PerformanceMetric[]) {
    const endpointCounts = new Map<string, number>();
    metrics.forEach(m => {
      const key = `${m.method} ${m.endpoint}`;
      endpointCounts.set(key, (endpointCounts.get(key) || 0) + 1);
    });

    return Array.from(endpointCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([endpoint, count]) => ({ endpoint, count }));
  }

  private getHourlyBreakdown(metrics: PerformanceMetric[]) {
    const hourlyData = new Map<number, { requests: number; errors: number }>();
    
    metrics.forEach(m => {
      const hour = m.timestamp.getHours();
      const current = hourlyData.get(hour) || { requests: 0, errors: 0 };
      current.requests++;
      if (m.statusCode >= 400) current.errors++;
      hourlyData.set(hour, current);
    });

    return Array.from(hourlyData.entries())
      .map(([hour, data]) => ({ hour, ...data }))
      .sort((a, b) => a.hour - b.hour);
  }

  private getStatusCodeDistribution(metrics: PerformanceMetric[]) {
    const distribution = new Map<number, number>();
    metrics.forEach(m => {
      distribution.set(m.statusCode, (distribution.get(m.statusCode) || 0) + 1);
    });

    return Array.from(distribution.entries())
      .map(([code, count]) => ({ code, count, percentage: (count / metrics.length) * 100 }))
      .sort((a, b) => a.code - b.code);
  }

  // Get alerts for performance issues
  getPerformanceAlerts() {
    const health = this.getSystemHealth();
    const alerts = [];

    if (health.memory.percentage > 85) {
      alerts.push({
        type: 'warning',
        message: 'High memory usage detected',
        value: `${health.memory.percentage.toFixed(1)}%`,
        threshold: '85%'
      });
    }

    if (health.api.errorRate > 5) {
      alerts.push({
        type: 'error',
        message: 'High error rate detected',
        value: `${health.api.errorRate.toFixed(1)}%`,
        threshold: '5%'
      });
    }

    if (health.api.averageResponseTime > 2000) {
      alerts.push({
        type: 'warning',
        message: 'Slow response times detected',
        value: `${health.api.averageResponseTime.toFixed(0)}ms`,
        threshold: '2000ms'
      });
    }

    return alerts;
  }
}

export const performanceMonitor = new PerformanceMonitor();
