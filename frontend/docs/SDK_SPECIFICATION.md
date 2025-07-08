# SCORPIUS Security Platform - SDK Specification

## Overview

The SCORPIUS SDK provides a comprehensive interface for integrating security analysis capabilities into your applications. Available in multiple languages with consistent APIs across all platforms.

## Supported Languages

- **JavaScript/TypeScript** - Node.js & Browser
- **Python** - 3.8+
- **Go** - 1.19+
- **Rust** - 1.65+
- **Java** - 11+
- **C#** - .NET 6+

---

## JavaScript/TypeScript SDK

### Installation

```bash
npm install @scorpius/sdk
# or
yarn add @scorpius/sdk
# or
pnpm add @scorpius/sdk
```

### Configuration

```typescript
import { ScorpiusClient, ScorpiusConfig } from "@scorpius/sdk";

const config: ScorpiusConfig = {
  apiKey: process.env.SCORPIUS_API_KEY,
  baseUrl: "https://api.scorpius.dev",
  version: "v1",
  timeout: 30000,
  retries: 3,
  environment: "production", // 'development', 'staging', 'production'
};

const scorpius = new ScorpiusClient(config);
```

### Security Scanner

```typescript
// Comprehensive vulnerability scanning
const scanResult = await scorpius.scanner.analyze({
  target: {
    type: "contract",
    address: "0x...",
    chain: "ethereum",
  },
  engines: ["slither", "mythril", "manticore"],
  depth: "deep",
  timeout: 600,
});

// Plugin-specific scanning
const slitherResult = await scorpius.scanner.slither({
  source: contractSource,
  detectors: ["reentrancy", "uninitialized-state"],
  severity: ["high", "medium"],
});

const mythrilResult = await scorpius.scanner.mythril({
  bytecode: "0x608060405...",
  maxDepth: 22,
  timeout: 600,
});

const manticoreResult = await scorpius.scanner.manticore({
  source: contractSource,
  explorationStrategy: "dfs",
  maxStates: 100,
});

// Get scan results
const results = await scorpius.scanner.getResults(scanResult.id);

// Get engine status
const engineStatus = await scorpius.scanner.getEngineStatus();
```

### Honeypot Detection

```typescript
// Multi-method honeypot analysis
const honeypotAnalysis = await scorpius.honeypot.analyze({
  contractAddress: "0x...",
  chain: "ethereum",
  methods: {
    static: true,
    bytecode: true,
    dynamic: true,
    ml: true,
    liquidity: true,
  },
  simulationParams: {
    testAmount: "0.1",
    slippageTolerance: 3,
    gasLimit: 500000,
  },
});

// Get analysis results
const honeypotResults = await scorpius.honeypot.getResults(honeypotAnalysis.id);

// Replay simulation step
const replayResult = await scorpius.honeypot.replaySimulation({
  analysisId: honeypotAnalysis.id,
  stepIndex: 2,
  customParams: {
    amount: "1.0",
    gasPrice: "20000000000",
  },
});

// Watchlist management
await scorpius.honeypot.addToWatchlist({
  address: "0x...",
  chain: "ethereum",
  alertThreshold: 70,
  scanInterval: 300,
  alerts: {
    email: true,
    webhook: "https://your-webhook.com",
  },
});

const watchlist = await scorpius.honeypot.getWatchlist({
  page: 1,
  limit: 20,
  filter: "active",
});
```

### MEV Operations

```typescript
// Strategy management
const strategy = await scorpius.mev.createStrategy({
  name: "DEX Arbitrage Bot",
  type: "arbitrage",
  parameters: {
    targetPools: ["0x...", "0x..."],
    minProfitThreshold: 0.01,
    maxGasPrice: 50000000000,
    slippageTolerance: 0.5,
  },
});

const strategies = await scorpius.mev.getStrategies();

await scorpius.mev.updateStrategyStatus(strategy.id, {
  status: "active",
});

// Opportunity detection
const opportunities = await scorpius.mev.getOpportunities({
  type: ["arbitrage", "liquidation"],
  minProfit: 0.1,
  priority: ["high"],
});

// Execute opportunity
const execution = await scorpius.mev.executeOpportunity(opportunityId, {
  strategyId: strategy.id,
  maxGas: 200000,
  dryRun: false,
});

// Real-time opportunities subscription
const unsubscribe = scorpius.mev.subscribeToOpportunities({
  filters: { type: ["arbitrage"] },
  onOpportunity: (opportunity) => {
    console.log("New MEV opportunity:", opportunity);
  },
  onError: (error) => {
    console.error("Subscription error:", error);
  },
});
```

### Wallet Guard

```typescript
// Wallet analysis
const walletAnalysis = await scorpius.wallet.analyze({
  address: "0x...",
  chain: "ethereum",
  depth: "deep",
  includeHistory: true,
});

// Risk profile
const riskProfile = await scorpius.wallet.getRiskProfile("0x...");

// Token approvals
const approvals = await scorpius.wallet.getApprovals("0x...");

// Revoke approval
await scorpius.wallet.revokeApproval({
  walletAddress: "0x...",
  tokenAddress: "0x...",
  spenderAddress: "0x...",
  signature: "0x...",
});
```

### Time Machine

```typescript
// Historical queries
const historicalData = await scorpius.timeMachine.query({
  blockNumber: 18850000,
  queries: [
    {
      type: "balance",
      address: "0x...",
      token: "0x...",
    },
    {
      type: "storage",
      address: "0x...",
      slot: "0x0",
    },
  ],
});

// Historical exploits
const exploits = await scorpius.timeMachine.getExploits({
  category: "flash-loan",
  dateRange: {
    start: "2023-01-01",
    end: "2024-01-01",
  },
});

// Replay exploit
const replayResult = await scorpius.timeMachine.replayExploit(
  "euler_finance_2023",
  {
    forkBlock: 16817996,
    customParams: {
      flashLoanAmount: "30000000",
    },
  },
);
```

### Analytics

```typescript
// Dashboard analytics
const dashboardData = await scorpius.analytics.getDashboard({
  timeRange: "24h",
});

// Custom analytics query
const customResults = await scorpius.analytics.customQuery({
  query: {
    metrics: ["scan_count", "threat_level"],
    dimensions: ["time", "contract_type"],
    filters: { chain: "ethereum" },
    aggregation: "sum",
  },
  visualization: "line",
});

// Generate report
const report = await scorpius.analytics.generateReport({
  type: "security",
  timeRange: "30d",
  format: "pdf",
  includeCharts: true,
});
```

### WebSocket Connections

```typescript
// Real-time monitoring
const ws = scorpius.realtime.connect();

ws.subscribe("threats", (threat) => {
  console.log("New threat detected:", threat);
});

ws.subscribe("scans", (scan) => {
  console.log("Scan completed:", scan);
});

ws.subscribe("mev-opportunities", (opportunity) => {
  console.log("MEV opportunity:", opportunity);
});

// Mempool monitoring
const mempoolWs = scorpius.mempool.connect({
  chains: ["ethereum", "bsc"],
  filters: {
    minValue: "1.0",
    types: ["swap", "approval"],
  },
});

mempoolWs.onTransaction((tx) => {
  console.log("New transaction:", tx);
});

mempoolWs.onMEVOpportunity((opportunity) => {
  console.log("MEV opportunity found:", opportunity);
});
```

### Plugin System

```typescript
// Plugin management
const plugins = await scorpius.plugins.list();

await scorpius.plugins.install("slither-enhanced", {
  version: "latest",
});

await scorpius.plugins.configure("slither-enhanced", {
  timeout: 300,
  maxMemory: "2GB",
});

// Custom plugin upload
const customPlugin = await scorpius.plugins.uploadCustom({
  name: "Custom Scanner",
  file: pluginBinary,
  metadata: { version: "1.0.0" },
});
```

---

## Python SDK

### Installation

```bash
pip install scorpius-sdk
```

### Configuration

```python
from scorpius import ScorpiusClient

client = ScorpiusClient(
    api_key="your-api-key",
    base_url="https://api.scorpius.dev",
    timeout=30,
    retries=3
)
```

### Security Scanner

```python
# Vulnerability scanning
scan_result = client.scanner.analyze(
    target={
        'type': 'contract',
        'address': '0x...',
        'chain': 'ethereum'
    },
    engines=['slither', 'mythril'],
    depth='deep'
)

# Plugin-specific scanning
slither_result = client.scanner.slither(
    source=contract_source,
    detectors=['reentrancy', 'uninitialized-state']
)

mythril_result = client.scanner.mythril(
    bytecode='0x608060405...',
    max_depth=22
)

# Get results
results = client.scanner.get_results(scan_result['id'])
```

### Honeypot Detection

```python
# Honeypot analysis
honeypot_analysis = client.honeypot.analyze(
    contract_address='0x...',
    chain='ethereum',
    methods={
        'static': True,
        'bytecode': True,
        'dynamic': True,
        'ml': True,
        'liquidity': True
    }
)

# Get results
results = client.honeypot.get_results(honeypot_analysis['id'])

# Watchlist management
client.honeypot.add_to_watchlist(
    address='0x...',
    chain='ethereum',
    alert_threshold=70,
    scan_interval=300
)

watchlist = client.honeypot.get_watchlist(
    page=1,
    limit=20,
    filter_type='active'
)
```

### MEV Operations

```python
# Strategy management
strategy = client.mev.create_strategy(
    name='Python Arbitrage Bot',
    type='arbitrage',
    parameters={
        'target_pools': ['0x...'],
        'min_profit_threshold': 0.01,
        'max_gas_price': 50000000000
    }
)

# Get opportunities
opportunities = client.mev.get_opportunities(
    filters={
        'type': ['arbitrage'],
        'min_profit': 0.1
    }
)

# Execute opportunity
execution = client.mev.execute_opportunity(
    opportunity_id='opp_123',
    strategy_id=strategy['id'],
    max_gas=200000
)
```

### Async Support

```python
import asyncio
from scorpius import AsyncScorpiusClient

async def main():
    async_client = AsyncScorpiusClient(api_key="your-api-key")

    # Async vulnerability scanning
    scan_result = await async_client.scanner.analyze(
        target={'type': 'contract', 'address': '0x...', 'chain': 'ethereum'},
        engines=['slither']
    )

    # Async honeypot analysis
    honeypot_result = await async_client.honeypot.analyze(
        contract_address='0x...',
        chain='ethereum'
    )

    await async_client.close()

asyncio.run(main())
```

---

## Go SDK

### Installation

```bash
go get github.com/scorpius-security/go-sdk
```

### Configuration

```go
package main

import (
    "context"
    "log"

    "github.com/scorpius-security/go-sdk/scorpius"
)

func main() {
    client := scorpius.NewClient(&scorpius.Config{
        APIKey:  "your-api-key",
        BaseURL: "https://api.scorpius.dev",
        Timeout: 30,
        Retries: 3,
    })

    ctx := context.Background()

    // Security scanning
    scanResult, err := client.Scanner.Analyze(ctx, &scorpius.ScanRequest{
        Target: scorpius.Target{
            Type:    "contract",
            Address: "0x...",
            Chain:   "ethereum",
        },
        Engines: []string{"slither", "mythril"},
        Depth:   "deep",
    })
    if err != nil {
        log.Fatal(err)
    }

    // Honeypot analysis
    honeypotResult, err := client.Honeypot.Analyze(ctx, &scorpius.HoneypotRequest{
        ContractAddress: "0x...",
        Chain:          "ethereum",
        Methods: scorpius.HoneypotMethods{
            Static:    true,
            Bytecode:  true,
            Dynamic:   true,
            ML:        true,
            Liquidity: true,
        },
    })
    if err != nil {
        log.Fatal(err)
    }

    // MEV operations
    strategy, err := client.MEV.CreateStrategy(ctx, &scorpius.MEVStrategy{
        Name: "Go Arbitrage Bot",
        Type: "arbitrage",
        Parameters: map[string]interface{}{
            "target_pools":         []string{"0x..."},
            "min_profit_threshold": 0.01,
        },
    })
    if err != nil {
        log.Fatal(err)
    }
}
```

### WebSocket Support

```go
package main

import (
    "context"
    "log"

    "github.com/scorpius-security/go-sdk/scorpius"
)

func main() {
    client := scorpius.NewClient(&scorpius.Config{
        APIKey: "your-api-key",
        WSEndpoint: "wss://api.scorpius.dev/ws",
    })

    ctx := context.Background()

    // Real-time threat monitoring
    threats := make(chan scorpius.Threat)

    err := client.Realtime.SubscribeThreats(ctx, threats)
    if err != nil {
        log.Fatal(err)
    }

    for threat := range threats {
        log.Printf("New threat detected: %+v", threat)
    }
}
```

---

## Rust SDK

### Installation

```toml
[dependencies]
scorpius-sdk = "0.2.0"
tokio = "1.0"
```

### Configuration

```rust
use scorpius_sdk::{ScorpiusClient, Config, ScanRequest, Target};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = Config {
        api_key: "your-api-key".to_string(),
        base_url: "https://api.scorpius.dev".to_string(),
        timeout: 30,
        retries: 3,
    };

    let client = ScorpiusClient::new(config);

    // Security scanning
    let scan_request = ScanRequest {
        target: Target {
            target_type: "contract".to_string(),
            address: Some("0x...".to_string()),
            chain: "ethereum".to_string(),
            ..Default::default()
        },
        engines: vec!["slither".to_string(), "mythril".to_string()],
        depth: "deep".to_string(),
        ..Default::default()
    };

    let scan_result = client.scanner.analyze(scan_request).await?;
    println!("Scan started: {}", scan_result.id);

    // Honeypot analysis
    let honeypot_result = client.honeypot.analyze(
        "0x...".to_string(),
        "ethereum".to_string(),
        None
    ).await?;

    println!("Honeypot analysis: {}", honeypot_result.honeypot_score);

    // MEV operations
    let strategy = client.mev.create_strategy(
        "Rust Arbitrage Bot".to_string(),
        "arbitrage".to_string(),
        serde_json::json!({
            "target_pools": ["0x..."],
            "min_profit_threshold": 0.01
        })
    ).await?;

    println!("Strategy created: {}", strategy.id);

    Ok(())
}
```

---

## Java SDK

### Installation

```xml
<dependency>
    <groupId>dev.scorpius</groupId>
    <artifactId>scorpius-sdk</artifactId>
    <version>0.2.0</version>
</dependency>
```

### Configuration

```java
import dev.scorpius.sdk.ScorpiusClient;
import dev.scorpius.sdk.Config;
import dev.scorpius.sdk.models.*;

public class ScorpiusExample {
    public static void main(String[] args) {
        Config config = Config.builder()
            .apiKey("your-api-key")
            .baseUrl("https://api.scorpius.dev")
            .timeout(30)
            .retries(3)
            .build();

        ScorpiusClient client = new ScorpiusClient(config);

        try {
            // Security scanning
            ScanRequest scanRequest = ScanRequest.builder()
                .target(Target.builder()
                    .type("contract")
                    .address("0x...")
                    .chain("ethereum")
                    .build())
                .engines(Arrays.asList("slither", "mythril"))
                .depth("deep")
                .build();

            ScanResult scanResult = client.scanner().analyze(scanRequest);
            System.out.println("Scan ID: " + scanResult.getId());

            // Honeypot analysis
            HoneypotRequest honeypotRequest = HoneypotRequest.builder()
                .contractAddress("0x...")
                .chain("ethereum")
                .methods(HoneypotMethods.builder()
                    .staticAnalysis(true)
                    .bytecodeAnalysis(true)
                    .dynamicAnalysis(true)
                    .mlAnalysis(true)
                    .liquidityAnalysis(true)
                    .build())
                .build();

            HoneypotResult honeypotResult = client.honeypot().analyze(honeypotRequest);
            System.out.println("Honeypot Score: " + honeypotResult.getHoneypotScore());

            // MEV operations
            MEVStrategy strategy = client.mev().createStrategy(
                MEVStrategyRequest.builder()
                    .name("Java Arbitrage Bot")
                    .type("arbitrage")
                    .parameters(Map.of(
                        "target_pools", Arrays.asList("0x..."),
                        "min_profit_threshold", 0.01
                    ))
                    .build()
            );

            System.out.println("Strategy ID: " + strategy.getId());

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

---

## C# SDK

### Installation

```bash
dotnet add package Scorpius.SDK
```

### Configuration

```csharp
using Scorpius.SDK;
using Scorpius.SDK.Models;

class Program
{
    static async Task Main(string[] args)
    {
        var config = new ScorpiusConfig
        {
            ApiKey = "your-api-key",
            BaseUrl = "https://api.scorpius.dev",
            Timeout = 30,
            Retries = 3
        };

        var client = new ScorpiusClient(config);

        try
        {
            // Security scanning
            var scanRequest = new ScanRequest
            {
                Target = new Target
                {
                    Type = "contract",
                    Address = "0x...",
                    Chain = "ethereum"
                },
                Engines = new[] { "slither", "mythril" },
                Depth = "deep"
            };

            var scanResult = await client.Scanner.AnalyzeAsync(scanRequest);
            Console.WriteLine($"Scan ID: {scanResult.Id}");

            // Honeypot analysis
            var honeypotRequest = new HoneypotRequest
            {
                ContractAddress = "0x...",
                Chain = "ethereum",
                Methods = new HoneypotMethods
                {
                    Static = true,
                    Bytecode = true,
                    Dynamic = true,
                    ML = true,
                    Liquidity = true
                }
            };

            var honeypotResult = await client.Honeypot.AnalyzeAsync(honeypotRequest);
            Console.WriteLine($"Honeypot Score: {honeypotResult.HoneypotScore}");

            // MEV operations
            var strategyRequest = new MEVStrategyRequest
            {
                Name = "C# Arbitrage Bot",
                Type = "arbitrage",
                Parameters = new Dictionary<string, object>
                {
                    ["target_pools"] = new[] { "0x..." },
                    ["min_profit_threshold"] = 0.01
                }
            };

            var strategy = await client.MEV.CreateStrategyAsync(strategyRequest);
            Console.WriteLine($"Strategy ID: {strategy.Id}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}
```

---

## CLI Tool

### Installation

```bash
# Install via npm
npm install -g @scorpius/cli

# Or download binary
curl -L https://releases.scorpius.dev/cli/latest/scorpius-cli-linux -o scorpius
chmod +x scorpius
sudo mv scorpius /usr/local/bin/
```

### Usage

```bash
# Configure CLI
scorpius configure --api-key your-api-key

# Security scanning
scorpius scan --address 0x... --chain ethereum --engines slither,mythril

# Honeypot analysis
scorpius honeypot analyze --address 0x... --chain ethereum --all-methods

# MEV operations
scorpius mev strategies list
scorpius mev opportunities --type arbitrage --min-profit 0.1

# Wallet analysis
scorpius wallet analyze --address 0x... --chain ethereum

# Time machine
scorpius time-machine query --block 18850000 --address 0x...

# Analytics
scorpius analytics dashboard --timerange 24h
scorpius analytics report --type security --format pdf

# Plugin management
scorpius plugins list
scorpius plugins install slither-enhanced
scorpius plugins configure slither-enhanced --timeout 300

# System status
scorpius status
scorpius logs --service scanner --level error
```

---

## SDK Configuration Options

### Environment Variables

```bash
# API Configuration
SCORPIUS_API_KEY=your-api-key
SCORPIUS_BASE_URL=https://api.scorpius.dev
SCORPIUS_WS_URL=wss://api.scorpius.dev/ws
SCORPIUS_ENVIRONMENT=production

# Request Configuration
SCORPIUS_TIMEOUT=30000
SCORPIUS_RETRIES=3
SCORPIUS_RATE_LIMIT=1000

# WebSocket Configuration
SCORPIUS_WS_RECONNECT_ATTEMPTS=5
SCORPIUS_WS_HEARTBEAT_INTERVAL=30000

# Logging Configuration
SCORPIUS_LOG_LEVEL=info
SCORPIUS_LOG_FORMAT=json
```

### Advanced Configuration

```typescript
const config: ScorpiusConfig = {
  // Authentication
  apiKey: process.env.SCORPIUS_API_KEY,

  // Endpoints
  baseUrl: "https://api.scorpius.dev",
  websocketUrl: "wss://api.scorpius.dev/ws",

  // Request settings
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,

  // Rate limiting
  rateLimit: {
    requests: 1000,
    window: 3600000, // 1 hour
  },

  // Caching
  cache: {
    enabled: true,
    ttl: 300000, // 5 minutes
    maxSize: 100,
  },

  // WebSocket settings
  websocket: {
    reconnectAttempts: 5,
    heartbeatInterval: 30000,
    compression: true,
  },

  // Logging
  logging: {
    level: "info",
    format: "json",
    destinations: ["console", "file"],
  },

  // Error handling
  errorHandling: {
    retryableStatusCodes: [429, 500, 502, 503, 504],
    maxRetryDelay: 30000,
  },
};
```

---

## Error Handling

### Error Types

```typescript
interface ScorpiusError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId?: string;
}

// Common error codes
enum ErrorCodes {
  // Authentication
  INVALID_API_KEY = "INVALID_API_KEY",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",

  // Rate limiting
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  QUOTA_EXCEEDED = "QUOTA_EXCEEDED",

  // Analysis errors
  SCAN_TIMEOUT = "SCAN_TIMEOUT",
  SCAN_FAILED = "SCAN_FAILED",
  INVALID_CONTRACT = "INVALID_CONTRACT",
  UNSUPPORTED_CHAIN = "UNSUPPORTED_CHAIN",

  // System errors
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
}
```

### Error Handling Examples

```typescript
try {
  const result = await scorpius.scanner.analyze(request);
} catch (error) {
  if (error.code === "RATE_LIMIT_EXCEEDED") {
    // Wait and retry
    await new Promise((resolve) =>
      setTimeout(resolve, error.details.retryAfter * 1000),
    );
    return await scorpius.scanner.analyze(request);
  } else if (error.code === "SCAN_TIMEOUT") {
    // Try with different parameters
    return await scorpius.scanner.analyze({
      ...request,
      depth: "standard",
      timeout: 300,
    });
  } else {
    throw error;
  }
}
```

---

## Testing

### Unit Testing

```typescript
import { ScorpiusClient } from "@scorpius/sdk";
import { MockScorpiusClient } from "@scorpius/sdk/testing";

describe("Security Scanner", () => {
  it("should analyze contract successfully", async () => {
    const mockClient = new MockScorpiusClient();

    mockClient.scanner.analyze.mockResolvedValue({
      id: "scan_123",
      status: "completed",
      vulnerabilities: [
        {
          type: "reentrancy",
          severity: "high",
          confidence: 95,
        },
      ],
    });

    const result = await mockClient.scanner.analyze({
      target: {
        type: "contract",
        address: "0x...",
        chain: "ethereum",
      },
      engines: ["slither"],
    });

    expect(result.id).toBe("scan_123");
    expect(result.vulnerabilities).toHaveLength(1);
  });
});
```

### Integration Testing

```typescript
describe("Integration Tests", () => {
  const client = new ScorpiusClient({
    apiKey: process.env.SCORPIUS_TEST_API_KEY,
    baseUrl: "https://api-staging.scorpius.dev",
  });

  it("should perform end-to-end security scan", async () => {
    const scan = await client.scanner.analyze({
      target: {
        type: "contract",
        address: "0x...",
        chain: "ethereum",
      },
      engines: ["slither"],
    });

    expect(scan.id).toBeDefined();

    // Poll for completion
    let result;
    for (let i = 0; i < 30; i++) {
      result = await client.scanner.getResults(scan.id);
      if (result.status === "completed") break;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    expect(result.status).toBe("completed");
    expect(result.vulnerabilities).toBeDefined();
  });
});
```

This comprehensive SDK specification provides enterprise-grade integration capabilities across multiple programming languages with consistent APIs, comprehensive error handling, and extensive testing support.
