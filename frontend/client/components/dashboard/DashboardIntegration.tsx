/**
 * Complete Dashboard Integration Component
 * Connects all widgets to backend services
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  useStaticScan, 
  useBytecodeLab, 
  useSimulations, 
  useBridgeMonitor,
  useTimeMachineCards,
  useQuantumKeys,
  useQuantumThreatForecast,
  useQuantumHeatmap,
  useHoneypotAnalysis,
  useHoneypotWatchlist,
  useAnalytics,
  useComputing,
  useNotifications
} from '../../hooks/use-dashboard-api';
import { 
  Shield, 
  Code, 
  Activity, 
  Bridge, 
  Clock, 
  Key, 
  AlertTriangle,
  Target,
  BarChart3,
  Server,
  Bell
} from 'lucide-react';

interface DashboardProps {
  defaultAddress?: string;
}

export function DashboardIntegration({ defaultAddress = '' }: DashboardProps) {
  const [address, setAddress] = useState(defaultAddress);
  const [activeTab, setActiveTab] = useState('scanner');

  // Hook integrations
  const staticScan = useStaticScan(address);
  const bytecodeLab = useBytecodeLab(address);
  const simulations = useSimulations();
  const bridgeMonitor = useBridgeMonitor(address);
  const timeMachineCards = useTimeMachineCards(10);
  const quantumKeys = useQuantumKeys();
  const quantumForecast = useQuantumThreatForecast();
  const quantumHeatmap = useQuantumHeatmap();
  const honeypotAnalysis = useHoneypotAnalysis(address);
  const honeypotWatchlist = useHoneypotWatchlist();
  const analytics = useAnalytics();
  const computing = useComputing();
  const notifications = useNotifications();

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Address change will trigger hooks automatically
  };

  return (
    <div className="space-y-6">
      {/* Header with Address Input */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Scorpius Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive blockchain security analysis</p>
        </div>
        <form onSubmit={handleAddressSubmit} className="flex gap-2">
          <Input
            placeholder="Enter contract address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-80"
          />
          <Button type="submit">Analyze</Button>
        </form>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="scanner">Scanner</TabsTrigger>
          <TabsTrigger value="quantum">Quantum</TabsTrigger>
          <TabsTrigger value="honeypot">Honeypot</TabsTrigger>
          <TabsTrigger value="bridge">Bridge</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Scanner Tab */}
        <TabsContent value="scanner" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Static Scan Summary */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Static Scan Summary</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {staticScan.loading ? (
                  <div>Loading scan results...</div>
                ) : staticScan.data ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Critical:</span>
                      <Badge variant="destructive">{staticScan.data.critical || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>High:</span>
                      <Badge variant="destructive">{staticScan.data.high || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Medium:</span>
                      <Badge variant="secondary">{staticScan.data.medium || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Low:</span>
                      <Badge variant="outline">{staticScan.data.low || 0}</Badge>
                    </div>
                  </div>
                ) : (
                  <div>Enter an address to scan</div>
                )}
              </CardContent>
            </Card>

            {/* Bytecode Lab */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bytecode Analysis</CardTitle>
                <Code className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {bytecodeLab.loading ? (
                  <div>Analyzing bytecode...</div>
                ) : bytecodeLab.data ? (
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Decompiled:</strong> {bytecodeLab.data.decompiled ? 'Yes' : 'No'}
                    </div>
                    {bytecodeLab.data.cfgImage && (
                      <img 
                        src={bytecodeLab.data.cfgImage} 
                        alt="Control Flow Graph" 
                        className="w-full h-32 object-cover rounded"
                      />
                    )}
                  </div>
                ) : (
                  <div>Enter an address for bytecode analysis</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Simulations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Active Simulations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {simulations.loading ? (
                <div>Loading simulations...</div>
              ) : (
                <div className="space-y-2">
                  {simulations.simulations.map((sim: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <span>{sim.scriptName || `Simulation ${index + 1}`}</span>
                      <Badge variant={sim.status === 'completed' ? 'default' : 'secondary'}>
                        {sim.status}
                      </Badge>
                    </div>
                  ))}
                  {simulations.simulations.length === 0 && (
                    <div className="text-muted-foreground">No active simulations</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quantum Tab */}
        <TabsContent value="quantum" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quantum Keys */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quantum Keys</CardTitle>
                <Key className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quantumKeys.keys.length}</div>
                <p className="text-xs text-muted-foreground">Total keys managed</p>
              </CardContent>
            </Card>

            {/* Threat Forecast */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Threat Level</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {quantumForecast.loading ? (
                  <div>Loading forecast...</div>
                ) : quantumForecast.forecast ? (
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {quantumForecast.forecast.level || 'Medium'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {quantumForecast.forecast.description || 'Quantum threat assessment'}
                    </p>
                  </div>
                ) : (
                  <div>No forecast data</div>
                )}
              </CardContent>
            </Card>

            {/* Heatmap Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mempool Activity</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {quantumHeatmap.loading ? (
                  <div>Loading heatmap...</div>
                ) : quantumHeatmap.heatmapData ? (
                  <div>
                    <div className="text-2xl font-bold text-green-600">Active</div>
                    <p className="text-xs text-muted-foreground">Real-time monitoring</p>
                  </div>
                ) : (
                  <div>No heatmap data</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Honeypot Tab */}
        <TabsContent value="honeypot" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Honeypot Analysis */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Honeypot Analysis</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {honeypotAnalysis.loading ? (
                  <div>Analyzing contract...</div>
                ) : honeypotAnalysis.summary ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Risk Score:</span>
                      <Badge variant={honeypotAnalysis.summary.riskScore > 70 ? 'destructive' : 'secondary'}>
                        {honeypotAnalysis.summary.riskScore || 0}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="text-sm">{honeypotAnalysis.summary.honeypotType || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confidence:</span>
                      <span className="text-sm">{honeypotAnalysis.summary.confidence || 0}%</span>
                    </div>
                  </div>
                ) : (
                  <div>Enter an address to analyze</div>
                )}
              </CardContent>
            </Card>

            {/* Watchlist */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Watchlist</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{honeypotWatchlist.watchlist.length}</div>
                <p className="text-xs text-muted-foreground">Monitored addresses</p>
                {address && (
                  <Button 
                    size="sm" 
                    className="mt-2"
                    onClick={() => honeypotWatchlist.addToWatchlist(address)}
                    disabled={honeypotWatchlist.loading}
                  >
                    Add to Watchlist
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bridge Tab */}
        <TabsContent value="bridge" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bridge Monitor</CardTitle>
              <Bridge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {bridgeMonitor.loading ? (
                <div>Loading bridge data...</div>
              ) : bridgeMonitor.data ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Active Flows:</span>
                    <span>{bridgeMonitor.data.flows?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Spikes Detected:</span>
                    <span>{bridgeMonitor.data.spikes?.length || 0}</span>
                  </div>
                </div>
              ) : (
                <div>Enter an address to monitor bridge activity</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analytics Overview</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {analytics.loading ? (
                <div>Loading analytics...</div>
              ) : analytics.overview ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{analytics.overview.totalScans || 0}</div>
                    <p className="text-xs text-muted-foreground">Total Scans</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{analytics.overview.vulnerabilities || 0}</div>
                    <p className="text-xs text-muted-foreground">Vulnerabilities Found</p>
                  </div>
                </div>
              ) : (
                <div>No analytics data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Computing Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Computing Status</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {computing.loading ? (
                  <div>Loading status...</div>
                ) : computing.status ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>CPU Usage:</span>
                      <span>{computing.status.cpu || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Memory:</span>
                      <span>{computing.status.memory || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Jobs:</span>
                      <span>{computing.jobs.length}</span>
                    </div>
                  </div>
                ) : (
                  <div>No system data available</div>
                )}
              </CardContent>
            </Card>

            {/* Time Machine Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Time Machine</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{timeMachineCards.cards.length}</div>
                <p className="text-xs text-muted-foreground">Historical snapshots</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}