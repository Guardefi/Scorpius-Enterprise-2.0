import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ExternalLink,
  RefreshCw,
  Maximize2,
  BarChart3,
  AlertTriangle,
  Clock,
} from "lucide-react";

interface GrafanaDashboardProps {
  dashboardId: string;
  title: string;
  description?: string;
  height?: number;
  timeRange?: string;
  refresh?: string;
  className?: string;
}

export const GrafanaDashboard: React.FC<GrafanaDashboardProps> = ({
  dashboardId,
  title,
  description,
  height = 400,
  timeRange = "1h",
  refresh = "30s",
  className = "",
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const grafanaUrl =
    import.meta.env.VITE_GRAFANA_URL || "http://localhost:3001";

  // Simulate dashboard data fetching
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // For demo purposes, we'll simulate success most of the time
        if (Math.random() > 0.1) {
          setLoading(false);
          setLastUpdate(new Date());
        } else {
          throw new Error("Failed to load dashboard");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
      }
    };

    fetchDashboard();

    // Set up refresh interval
    const refreshMs =
      refresh === "30s" ? 30000 : refresh === "1m" ? 60000 : 30000;
    const interval = setInterval(fetchDashboard, refreshMs);

    return () => clearInterval(interval);
  }, [dashboardId, refresh]);

  const openInGrafana = () => {
    const url = `${grafanaUrl}/d/${dashboardId}?orgId=1&refresh=${refresh}&from=now-${timeRange}&to=now`;
    window.open(url, "_blank");
  };

  const refreshDashboard = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setLoading(false);
      setLastUpdate(new Date());
    }, 1000);
  };

  const getDashboardMockData = () => {
    // Generate different mock visualizations based on dashboard ID
    switch (dashboardId) {
      case "platform-overview":
        return <PlatformOverviewMock />;
      case "mempool-monitor":
        return <MempoolMonitorMock />;
      case "cost-overview":
        return <CostOverviewMock />;
      case "security-metrics":
        return <SecurityMetricsMock />;
      case "performance-metrics":
        return <PerformanceMetricsMock />;
      case "user-analytics":
        return <UserAnalyticsMock />;
      default:
        return <DefaultDashboardMock />;
    }
  };

  return (
    <Card className={`cyber-card-enhanced ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2 cyber-glow text-lg">
              <BarChart3 className="h-5 w-5 text-cyber-cyan" />
              <span>{title}</span>
            </CardTitle>
            {description && (
              <p className="text-sm text-cyber-cyan/60 font-mono mt-1">
                {description}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant="secondary"
              className="text-xs font-mono bg-cyber-cyan/10 text-cyber-cyan border-cyber-cyan/30"
            >
              {timeRange} • {refresh}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshDashboard}
              disabled={loading}
              className="btn-secondary"
            >
              <RefreshCw
                className={`h-3 w-3 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openInGrafana}
              className="btn-primary"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div
          className="relative overflow-hidden rounded-b-lg"
          style={{ height: `${height}px` }}
        >
          {loading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-8 w-full bg-cyber-cyan/10" />
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-20 bg-cyber-cyan/10" />
                <Skeleton className="h-20 bg-cyber-cyan/10" />
                <Skeleton className="h-20 bg-cyber-cyan/10" />
              </div>
              <Skeleton className="h-48 w-full bg-cyber-cyan/10" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full bg-red-500/10 border border-red-500/30">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <p className="text-red-400 font-mono text-sm">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshDashboard}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full">
              {getDashboardMockData()}

              {/* Last update indicator */}
              <div className="absolute bottom-2 right-2 flex items-center space-x-1 text-xs text-cyber-cyan/60 bg-black/60 backdrop-blur rounded px-2 py-1">
                <Clock className="h-3 w-3" />
                <span className="font-mono">
                  {lastUpdate.toLocaleTimeString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Mock dashboard components
const PlatformOverviewMock = () => (
  <div className="p-6 h-full bg-gradient-to-br from-cyber-cyan/5 to-transparent">
    <div className="grid grid-cols-4 gap-4 mb-6">
      {[
        { label: "CPU", value: "73%", color: "text-blue-400" },
        { label: "Memory", value: "68%", color: "text-green-400" },
        { label: "Network", value: "45%", color: "text-purple-400" },
        { label: "Storage", value: "34%", color: "text-amber-400" },
      ].map((metric, i) => (
        <div
          key={i}
          className="text-center p-3 border border-cyber-cyan/20 rounded bg-black/30"
        >
          <div className={`text-lg font-bold font-mono ${metric.color}`}>
            {metric.value}
          </div>
          <div className="text-xs text-cyber-cyan/60 font-mono">
            {metric.label}
          </div>
        </div>
      ))}
    </div>
    <div className="h-48 border border-cyber-cyan/20 rounded bg-black/30 flex items-center justify-center">
      <div className="text-cyber-cyan/60 font-mono text-sm">
        System Performance Chart
      </div>
    </div>
  </div>
);

const MempoolMonitorMock = () => (
  <div className="p-6 h-full bg-gradient-to-br from-emerald-500/5 to-transparent">
    <div className="grid grid-cols-3 gap-4 mb-4">
      {[
        { label: "Pending Txs", value: "1,247", color: "text-emerald-400" },
        { label: "Gas Price", value: "23 Gwei", color: "text-yellow-400" },
        { label: "MEV Value", value: "2.4 ETH", color: "text-purple-400" },
      ].map((metric, i) => (
        <div
          key={i}
          className="text-center p-2 border border-cyber-cyan/20 rounded bg-black/30"
        >
          <div className={`text-lg font-bold font-mono ${metric.color}`}>
            {metric.value}
          </div>
          <div className="text-xs text-cyber-cyan/60 font-mono">
            {metric.label}
          </div>
        </div>
      ))}
    </div>
    <div className="h-32 border border-cyber-cyan/20 rounded bg-black/30 flex items-center justify-center">
      <div className="text-cyber-cyan/60 font-mono text-sm">
        Transaction Flow Visualization
      </div>
    </div>
  </div>
);

const CostOverviewMock = () => (
  <div className="p-6 h-full bg-gradient-to-br from-amber-500/5 to-transparent">
    <div className="grid grid-cols-2 gap-4 mb-4">
      {[
        { label: "Monthly Cost", value: "$3,247", color: "text-amber-400" },
        { label: "Optimization", value: "12%", color: "text-green-400" },
      ].map((metric, i) => (
        <div
          key={i}
          className="text-center p-3 border border-cyber-cyan/20 rounded bg-black/30"
        >
          <div className={`text-lg font-bold font-mono ${metric.color}`}>
            {metric.value}
          </div>
          <div className="text-xs text-cyber-cyan/60 font-mono">
            {metric.label}
          </div>
        </div>
      ))}
    </div>
    <div className="h-40 border border-cyber-cyan/20 rounded bg-black/30 flex items-center justify-center">
      <div className="text-cyber-cyan/60 font-mono text-sm">
        Cost Analysis Chart
      </div>
    </div>
  </div>
);

const SecurityMetricsMock = () => (
  <div className="p-6 h-full bg-gradient-to-br from-red-500/5 to-transparent">
    <div className="grid grid-cols-3 gap-4 mb-4">
      {[
        { label: "Threats", value: "23", color: "text-red-400" },
        { label: "Blocked", value: "98%", color: "text-green-400" },
        { label: "Alerts", value: "2", color: "text-yellow-400" },
      ].map((metric, i) => (
        <div
          key={i}
          className="text-center p-2 border border-cyber-cyan/20 rounded bg-black/30"
        >
          <div className={`text-lg font-bold font-mono ${metric.color}`}>
            {metric.value}
          </div>
          <div className="text-xs text-cyber-cyan/60 font-mono">
            {metric.label}
          </div>
        </div>
      ))}
    </div>
    <div className="h-32 border border-cyber-cyan/20 rounded bg-black/30 flex items-center justify-center">
      <div className="text-cyber-cyan/60 font-mono text-sm">
        Security Events Timeline
      </div>
    </div>
  </div>
);

const PerformanceMetricsMock = () => (
  <div className="p-6 h-full bg-gradient-to-br from-purple-500/5 to-transparent">
    <div className="grid grid-cols-2 gap-4 mb-4">
      {[
        { label: "Response Time", value: "45ms", color: "text-purple-400" },
        { label: "Throughput", value: "1.2k/s", color: "text-blue-400" },
      ].map((metric, i) => (
        <div
          key={i}
          className="text-center p-3 border border-cyber-cyan/20 rounded bg-black/30"
        >
          <div className={`text-lg font-bold font-mono ${metric.color}`}>
            {metric.value}
          </div>
          <div className="text-xs text-cyber-cyan/60 font-mono">
            {metric.label}
          </div>
        </div>
      ))}
    </div>
    <div className="h-40 border border-cyber-cyan/20 rounded bg-black/30 flex items-center justify-center">
      <div className="text-cyber-cyan/60 font-mono text-sm">
        Performance Metrics
      </div>
    </div>
  </div>
);

const UserAnalyticsMock = () => (
  <div className="p-6 h-full bg-gradient-to-br from-cyan-500/5 to-transparent">
    <div className="grid grid-cols-3 gap-4 mb-4">
      {[
        { label: "Active Users", value: "342", color: "text-cyan-400" },
        { label: "Sessions", value: "1,247", color: "text-green-400" },
        { label: "Retention", value: "87%", color: "text-purple-400" },
      ].map((metric, i) => (
        <div
          key={i}
          className="text-center p-2 border border-cyber-cyan/20 rounded bg-black/30"
        >
          <div className={`text-lg font-bold font-mono ${metric.color}`}>
            {metric.value}
          </div>
          <div className="text-xs text-cyber-cyan/60 font-mono">
            {metric.label}
          </div>
        </div>
      ))}
    </div>
    <div className="h-32 border border-cyber-cyan/20 rounded bg-black/30 flex items-center justify-center">
      <div className="text-cyber-cyan/60 font-mono text-sm">
        User Activity Heatmap
      </div>
    </div>
  </div>
);

const DefaultDashboardMock = () => (
  <div className="p-6 h-full bg-gradient-to-br from-cyber-cyan/5 to-transparent">
    <div className="h-full border border-cyber-cyan/20 rounded bg-black/30 flex items-center justify-center">
      <div className="text-center">
        <BarChart3 className="h-12 w-12 text-cyber-cyan/60 mx-auto mb-2" />
        <div className="text-cyber-cyan/60 font-mono text-sm">
          Dashboard Visualization
        </div>
      </div>
    </div>
  </div>
);
