import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";

import { GrafanaDashboard } from "@/components/GrafanaDashboard";
import { GrafanaMetrics } from "@/components/GrafanaMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  Activity,
  Server,
  Database,
  Network,
  DollarSign,
  Users,
  Shield,
  TrendingUp,
  Gauge,
  ExternalLink,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

const GrafanaMonitoring = () => {
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "checking"
  >("checking");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Mock Grafana connection status for demo
  useEffect(() => {
    const checkConnection = () => {
      // Simulate connection check with mock data
      setTimeout(() => {
        setConnectionStatus("connected");
      }, 1000);
    };

    checkConnection();
    // Mock periodic checks
    const interval = setInterval(() => {
      setConnectionStatus("connected");
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const refreshAll = () => {
    setLastRefresh(new Date());
    window.location.reload();
  };

  const openGrafanaAdmin = () => {
    const grafanaUrl =
      import.meta.env.VITE_GRAFANA_URL || "http://localhost:3001";
    window.open(grafanaUrl, "_blank");
  };

  // Dashboard configurations
  const dashboards = [
    {
      id: "platform-overview",
      title: "Platform Overview",
      description: "High-level system metrics and performance indicators",
      category: "overview",
    },
    {
      id: "mempool-monitor",
      title: "Mempool Monitor",
      description:
        "Real-time blockchain mempool activity and transaction analysis",
      category: "blockchain",
    },
    {
      id: "cost-overview",
      title: "Cost Analysis",
      description: "Infrastructure costs and resource optimization metrics",
      category: "cost",
    },
    {
      id: "security-metrics",
      title: "Security Dashboard",
      description:
        "Threat detection, security events, and vulnerability metrics",
      category: "security",
    },
    {
      id: "performance-metrics",
      title: "Performance Analytics",
      description: "Application performance, latency, and throughput analysis",
      category: "performance",
    },
    {
      id: "user-analytics",
      title: "User Analytics",
      description: "User behavior, engagement, and usage patterns",
      category: "analytics",
    },
  ];

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "disconnected":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Connected";
      case "disconnected":
        return "Disconnected";
      default:
        return "Checking...";
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Connection Status & Controls */}
        <Card className="cyber-card-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon()}
                  <span className="text-sm font-medium text-cyber-cyan font-mono">
                    Grafana Status:
                  </span>
                  <Badge
                    variant={
                      connectionStatus === "connected"
                        ? "default"
                        : "destructive"
                    }
                    className="font-mono"
                  >
                    {getStatusText()}
                  </Badge>
                </div>
                <div className="text-sm text-cyber-cyan/60 font-mono">
                  Last refresh: {lastRefresh.toLocaleTimeString()}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshAll}
                  className="btn-secondary"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openGrafanaAdmin}
                  className="btn-primary"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Grafana
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection Error Alert */}
        {connectionStatus === "disconnected" && (
          <Alert
            variant="destructive"
            className="border-red-500/30 bg-red-500/10"
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="font-mono">
              Unable to connect to Grafana. Please ensure Grafana is running and
              accessible at the configured URL.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Dashboard Content */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black/50 border border-cyber-cyan/30">
            <TabsTrigger value="overview" className="font-mono">
              Overview
            </TabsTrigger>
            <TabsTrigger value="dashboards" className="font-mono">
              Dashboards
            </TabsTrigger>
            <TabsTrigger value="metrics" className="font-mono">
              Live Metrics
            </TabsTrigger>
            <TabsTrigger value="settings" className="font-mono">
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="cyber-card-enhanced">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium text-cyber-cyan font-mono">
                        Active Dashboards
                      </span>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-cyber-cyan font-mono">
                      6
                    </div>
                    <div className="text-xs text-cyber-cyan/60 font-mono">
                      All systems operational
                    </div>
                  </CardContent>
                </Card>

                <Card className="cyber-card-enhanced">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Server className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-medium text-cyber-cyan font-mono">
                        Data Sources
                      </span>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-cyber-cyan font-mono">
                      3
                    </div>
                    <div className="text-xs text-cyber-cyan/60 font-mono">
                      Prometheus, InfluxDB, Logs
                    </div>
                  </CardContent>
                </Card>

                <Card className="cyber-card-enhanced">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-medium text-cyber-cyan font-mono">
                        Alert Rules
                      </span>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-cyber-cyan font-mono">
                      24
                    </div>
                    <div className="text-xs text-cyber-cyan/60 font-mono">
                      2 firing, 22 ok
                    </div>
                  </CardContent>
                </Card>

                <Card className="cyber-card-enhanced">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-orange-400" />
                      <span className="text-sm font-medium text-cyber-cyan font-mono">
                        Uptime
                      </span>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-cyber-cyan font-mono">
                      99.9%
                    </div>
                    <div className="text-xs text-cyber-cyan/60 font-mono">
                      Last 30 days
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tron Separator */}
              <div className="cyber-divider"></div>

              {/* Main Overview Dashboard */}
              <GrafanaDashboard
                dashboardId="platform-overview"
                title="Platform Overview"
                description="Real-time system health and performance metrics"
                height={600}
                timeRange="24h"
                refresh="1m"
              />
            </motion.div>
          </TabsContent>

          {/* Dashboards Tab */}
          <TabsContent value="dashboards" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {dashboards.map((dashboard, index) => (
                <motion.div
                  key={dashboard.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <GrafanaDashboard
                    dashboardId={dashboard.id}
                    title={dashboard.title}
                    description={dashboard.description}
                    height={400}
                    timeRange="1h"
                    refresh="30s"
                  />
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* Live Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <GrafanaMetrics refreshInterval={5000} />
            </motion.div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="cyber-card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 cyber-glow">
                    <Settings className="h-5 w-5" />
                    <span>Grafana Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-cyber-cyan font-mono">
                        Grafana URL
                      </label>
                      <div className="mt-1 p-2 bg-black/50 border border-cyber-cyan/20 rounded text-sm text-cyber-cyan/80 font-mono">
                        {import.meta.env.VITE_GRAFANA_URL ||
                          "http://localhost:3001"}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-cyber-cyan font-mono">
                        Default Theme
                      </label>
                      <div className="mt-1 p-2 bg-black/50 border border-cyber-cyan/20 rounded text-sm text-cyber-cyan/80 font-mono">
                        Dark
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-cyber-cyan font-mono">
                        Refresh Interval
                      </label>
                      <div className="mt-1 p-2 bg-black/50 border border-cyber-cyan/20 rounded text-sm text-cyber-cyan/80 font-mono">
                        30 seconds
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-cyber-cyan font-mono">
                        Default Time Range
                      </label>
                      <div className="mt-1 p-2 bg-black/50 border border-cyber-cyan/20 rounded text-sm text-cyber-cyan/80 font-mono">
                        Last 1 hour
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-cyber-cyan/20" />

                  <div>
                    <h4 className="text-sm font-medium mb-2 text-cyber-cyan font-mono">
                      Available Data Sources
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-black/50 border border-cyber-cyan/20 rounded">
                        <span className="text-sm text-cyber-cyan font-mono">
                          Prometheus
                        </span>
                        <Badge
                          variant="default"
                          className="bg-emerald-500/20 text-emerald-400 font-mono"
                        >
                          Connected
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-black/50 border border-cyber-cyan/20 rounded">
                        <span className="text-sm text-cyber-cyan font-mono">
                          InfluxDB
                        </span>
                        <Badge
                          variant="default"
                          className="bg-emerald-500/20 text-emerald-400 font-mono"
                        >
                          Connected
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-black/50 border border-cyber-cyan/20 rounded">
                        <span className="text-sm text-cyber-cyan font-mono">
                          Elasticsearch
                        </span>
                        <Badge
                          variant="outline"
                          className="border-red-500/30 text-red-400 font-mono"
                        >
                          Disconnected
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default GrafanaMonitoring;
