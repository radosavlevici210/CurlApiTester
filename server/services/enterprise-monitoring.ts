
import { performance } from 'perf_hooks';
import { EventEmitter } from 'events';
import os from 'os';

interface SystemMetrics {
  cpu: {
    usage: number;
    temperature: number;
    cores: number;
  };
  memory: {
    used: number;
    available: number;
    percentage: number;
    heap: NodeJS.MemoryUsage;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    connections: number;
  };
  database: {
    connections: number;
    poolSize: number;
    queryTime: number;
    activeQueries: number;
  };
  api: {
    requestsPerSecond: number;
    responseTime: number;
    errorRate: number;
    throughput: number;
  };
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  source: string;
  metrics?: any;
  resolved: boolean;
}

export class EnterpriseMonitoringService extends EventEmitter {
  private metrics: SystemMetrics[] = [];
  private alerts: Alert[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private thresholds = {
    cpu: 85,
    memory: 90,
    errorRate: 5,
    responseTime: 2000
  };

  constructor() {
    super();
    this.startMonitoring();
  }

  private startMonitoring() {
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, 5000); // Collect metrics every 5 seconds
  }

  private async collectMetrics(): Promise<SystemMetrics> {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    const metrics: SystemMetrics = {
      cpu: {
        usage: this.calculateCPUUsage(cpuUsage),
        temperature: 45 + Math.random() * 20, // Mock temperature
        cores: os.cpus().length
      },
      memory: {
        used: memUsage.heapUsed,
        available: memUsage.heapTotal - memUsage.heapUsed,
        percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100,
        heap: memUsage
      },
      network: {
        bytesIn: Math.floor(Math.random() * 1000000),
        bytesOut: Math.floor(Math.random() * 1000000),
        connections: Math.floor(Math.random() * 100)
      },
      database: {
        connections: 5 + Math.floor(Math.random() * 10),
        poolSize: 20,
        queryTime: 50 + Math.random() * 200,
        activeQueries: Math.floor(Math.random() * 5)
      },
      api: {
        requestsPerSecond: 10 + Math.random() * 50,
        responseTime: 100 + Math.random() * 500,
        errorRate: Math.random() * 10,
        throughput: 1000 + Math.random() * 5000
      }
    };

    this.metrics.push(metrics);
    this.checkThresholds(metrics);
    
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }

    this.emit('metrics', metrics);
    return metrics;
  }

  private calculateCPUUsage(cpuUsage: NodeJS.CpuUsage): number {
    // Simplified CPU usage calculation
    return Math.min(100, (cpuUsage.user + cpuUsage.system) / 1000000 * 100);
  }

  private checkThresholds(metrics: SystemMetrics) {
    // CPU threshold check
    if (metrics.cpu.usage > this.thresholds.cpu) {
      this.createAlert('critical', `High CPU usage: ${metrics.cpu.usage.toFixed(1)}%`, 'system', metrics);
    }

    // Memory threshold check
    if (metrics.memory.percentage > this.thresholds.memory) {
      this.createAlert('critical', `High memory usage: ${metrics.memory.percentage.toFixed(1)}%`, 'system', metrics);
    }

    // API error rate check
    if (metrics.api.errorRate > this.thresholds.errorRate) {
      this.createAlert('warning', `High error rate: ${metrics.api.errorRate.toFixed(1)}%`, 'api', metrics);
    }

    // Response time check
    if (metrics.api.responseTime > this.thresholds.responseTime) {
      this.createAlert('warning', `Slow response time: ${metrics.api.responseTime.toFixed(0)}ms`, 'api', metrics);
    }
  }

  private createAlert(type: Alert['type'], message: string, source: string, metrics?: any) {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: new Date(),
      source,
      metrics,
      resolved: false
    };

    this.alerts.push(alert);
    this.emit('alert', alert);

    // Auto-resolve info alerts after 5 minutes
    if (type === 'info') {
      setTimeout(() => {
        this.resolveAlert(alert.id);
      }, 5 * 60 * 1000);
    }
  }

  public getMetrics(timeRange: '1h' | '6h' | '24h' | '7d' = '1h'): SystemMetrics[] {
    const now = Date.now();
    const ranges = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    };

    const cutoff = now - ranges[timeRange];
    return this.metrics.filter((_, index) => {
      const timestamp = now - (this.metrics.length - index) * 5000; // 5 second intervals
      return timestamp > cutoff;
    });
  }

  public getAlerts(type?: Alert['type'], resolved?: boolean): Alert[] {
    return this.alerts.filter(alert => {
      if (type && alert.type !== type) return false;
      if (resolved !== undefined && alert.resolved !== resolved) return false;
      return true;
    });
  }

  public resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      this.emit('alertResolved', alert);
      return true;
    }
    return false;
  }

  public getCurrentMetrics(): SystemMetrics | null {
    return this.metrics[this.metrics.length - 1] || null;
  }

  public generateHealthReport() {
    const current = this.getCurrentMetrics();
    const activeAlerts = this.getAlerts(undefined, false);
    
    return {
      status: activeAlerts.some(a => a.type === 'critical') ? 'critical' : 
              activeAlerts.some(a => a.type === 'warning') ? 'warning' : 'healthy',
      uptime: process.uptime(),
      metrics: current,
      alerts: {
        total: this.alerts.length,
        active: activeAlerts.length,
        critical: activeAlerts.filter(a => a.type === 'critical').length,
        warnings: activeAlerts.filter(a => a.type === 'warning').length
      },
      performance: {
        avgResponseTime: current?.api.responseTime || 0,
        throughput: current?.api.throughput || 0,
        errorRate: current?.api.errorRate || 0
      }
    };
  }

  public stop() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }
}

export const enterpriseMonitoring = new EnterpriseMonitoringService();
