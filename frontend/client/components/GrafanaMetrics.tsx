import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Database,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Shield,
  AlertTriangle,
} from "lucide-react";

interface GrafanaMetricsProps {
  refreshInterval?: number;
}

interface Metric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "stable";
  change: number;
  status: "normal" | "warning" | "critical";
  icon: React.ComponentType<any>;
  color: string;
}

export const GrafanaMetrics: React.FC<GrafanaMetricsProps> = ({
  refreshInterval = 5000,
}) => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Initialize metrics
  useEffect(() => {
    const initialMetrics: Metric[] = [
      {
        id: "cpu",
        name: "CPU Usage",
        value: 73,
        unit: "%",
        trend: "up",
        change: 5.2,
        status: "normal",
        icon: Cpu,
        color: "text-blue-400",
      },
      {
        id: "memory",
        name: "Memory Usage",
        value: 68,
        unit: "%",
        trend: "stable",
        change: 0.1,
        status: "normal",
        icon: MemoryStick,
        color: "text-green-400",
      },
      {
        id: "disk",
        name: "Disk Usage",
        value: 45,
        unit: "%",
        trend: "up",
        change: 2.3,
        status: "normal",
        icon: HardDrive,
        color: "text-purple-400",
      },
      {
        id: "network",
        name: "Network I/O",
        value: 234,
        unit: "MB/s",
        trend: "down",
        change: -12.4,
        status: "normal",
        icon: Network,
        color: "text-cyan-400",
      },
      {
        id: "database",
        name: "DB Connections",
        value: 87,
        unit: "conn",
        trend: "up",
        change: 8.7,
        status: "warning",
        icon: Database,
        color: "text-amber-400",
      },
      {
        id: "users",
        name: "Active Users",
        value: 342,
        unit: "users",
        trend: "up",
        change: 15.6,
        status: "normal",
        icon: Users,
        color: "text-emerald-400",
      },
      {
        id: "response",
        name: "Response Time",
        value: 45,
        unit: "ms",
        trend: "stable",
        change: 0.8,
        status: "normal",
        icon: Clock,
        color: "text-indigo-400",
      },
      {
        id: "threats",
        name: "Threats Blocked",
        value: 23,
        unit: "threats",
        trend: "up",
        change: 4.2,
        status: "warning",
        icon: Shield,
        color: "text-red-400",
      },
    ];

    setMetrics(initialMetrics);
  }, []);

  // Update metrics periodically
  useEffect(() => {
    const updateMetrics = () => {
      setMetrics((prev) =>
        prev.map((metric) => {
          const variance = (Math.random() - 0.5) * 0.2; // ±10% variance
          let newValue = metric.value * (1 + variance);

          // Apply constraints based on metric type
          if (metric.unit === "%") {
            newValue = Math.max(0, Math.min(100, newValue));
          } else if (metric.unit === "ms") {
            newValue = Math.max(10, Math.min(500, newValue));
          } else if (metric.unit === "users") {
            newValue = Math.max(0, newValue);
          }

          const change = ((newValue - metric.value) / metric.value) * 100;
          const trend: "up" | "down" | "stable" =
            Math.abs(change) < 1 ? "stable" : change > 0 ? "up" : "down";

          // Determine status based on metric type and value
          let status: "normal" | "warning" | "critical" = "normal";
          if (metric.unit === "%" && newValue > 85) {
            status = "critical";
          } else if (metric.unit === "%" && newValue > 75) {
            status = "warning";
          } else if (metric.unit === "ms" && newValue > 100) {
            status = "warning";
          } else if (metric.unit === "ms" && newValue > 200) {
            status = "critical";
          }

          return {
            ...metric,
            value: Math.round(newValue * 10) / 10,
            trend,
            change: Math.round(change * 10) / 10,
            status,
          };
        }),
      );
      setLastUpdate(new Date());
    };

    const interval = setInterval(updateMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-400" />;
      case "down":
        return <TrendingDown className="h-3 w-3 text-red-400" />;
      default:
        return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "critical":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            Critical
          </Badge>
        );
      case "warning":
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            Warning
          </Badge>
        );
      default:
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            Normal
          </Badge>
        );
    }
  };

  const criticalMetrics = metrics.filter((m) => m.status === "critical");
  const warningMetrics = metrics.filter((m) => m.status === "warning");

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cyber-card-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyber-cyan font-mono">
                  System Status
                </p>
                <p className="text-2xl font-bold text-emerald-400 font-mono">
                  {criticalMetrics.length === 0 ? "Healthy" : "Degraded"}
                </p>
              </div>
              <Activity className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-card-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyber-cyan font-mono">
                  Critical Alerts
                </p>
                <p className="text-2xl font-bold text-red-400 font-mono">
                  {criticalMetrics.length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-card-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyber-cyan font-mono">
                  Last Update
                </p>
                <p className="text-lg font-bold text-cyber-cyan font-mono">
                  {lastUpdate.toLocaleTimeString()}
                </p>
              </div>
              <Clock className="h-8 w-8 text-cyber-cyan" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.id} className="cyber-card-enhanced">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <metric.icon className={`h-4 w-4 ${metric.color}`} />
                    <span className="text-sm font-medium text-cyber-cyan font-mono">
                      {metric.name}
                    </span>
                  </div>
                  {getStatusBadge(metric.status)}
                </div>

                {/* Value */}
                <div className="flex items-baseline space-x-2">
                  <span
                    className={`text-2xl font-bold font-mono ${metric.color}`}
                  >
                    {metric.value}
                  </span>
                  <span className="text-sm text-cyber-cyan/60 font-mono">
                    {metric.unit}
                  </span>
                </div>

                {/* Trend */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(metric.trend)}
                    <span
                      className={`text-xs font-mono ${
                        metric.change > 0
                          ? "text-green-400"
                          : metric.change < 0
                            ? "text-red-400"
                            : "text-gray-400"
                      }`}
                    >
                      {metric.change > 0 ? "+" : ""}
                      {metric.change}%
                    </span>
                  </div>
                  <span className="text-xs text-cyber-cyan/60 font-mono">
                    vs last period
                  </span>
                </div>

                {/* Progress bar for percentage metrics */}
                {metric.unit === "%" && (
                  <Progress
                    value={metric.value}
                    className="h-1"
                    // @ts-ignore - Custom color handling
                    color={
                      metric.status === "critical"
                        ? "red"
                        : metric.status === "warning"
                          ? "amber"
                          : "green"
                    }
                  />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alert Summary */}
      {(criticalMetrics.length > 0 || warningMetrics.length > 0) && (
        <Card className="cyber-card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 cyber-glow">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <span>Active Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {criticalMetrics.map((metric) => (
                  <div
                    key={`critical-${metric.id}`}
                    className="flex items-center justify-between p-2 border border-red-500/30 rounded bg-red-500/10"
                  >
                    <div className="flex items-center space-x-2">
                      <metric.icon className="h-4 w-4 text-red-400" />
                      <span className="text-sm font-mono text-red-400">
                        {metric.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono text-red-400">
                        {metric.value} {metric.unit}
                      </span>
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                        Critical
                      </Badge>
                    </div>
                  </div>
                ))}
                {warningMetrics.map((metric) => (
                  <div
                    key={`warning-${metric.id}`}
                    className="flex items-center justify-between p-2 border border-amber-500/30 rounded bg-amber-500/10"
                  >
                    <div className="flex items-center space-x-2">
                      <metric.icon className="h-4 w-4 text-amber-400" />
                      <span className="text-sm font-mono text-amber-400">
                        {metric.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono text-amber-400">
                        {metric.value} {metric.unit}
                      </span>
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                        Warning
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
