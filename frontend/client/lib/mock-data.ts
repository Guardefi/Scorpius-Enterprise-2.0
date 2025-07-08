/**
 * SCORPIUS Security Platform - Comprehensive Mock Data
 * Realistic demo data for all platform modules
 */

// Common Types
export interface BaseEntity {
  id: string;
  timestamp: string;
  chain: string;
}

export interface Address {
  address: string;
  ens?: string;
  label?: string;
}

// Real Ethereum addresses for realism
export const MOCK_ADDRESSES = {
  // Known DeFi protocols
  UNISWAP_V2_ROUTER: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  UNISWAP_V3_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
  SUSHISWAP_ROUTER: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
  PANCAKE_ROUTER: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
  AAVE_LENDING: "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9",
  COMPOUND_COMPTROLLER: "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B",

  // Known exploited contracts
  EULER_EXPLOIT: "0x797AAb1ce7c01eB727ab980762bA88e7133d2157",
  TORNADO_CASH: "0x47CE0C6eD5B0Ce3d3A51fdb1C52DC66a7c3c2936",
  RONIN_BRIDGE: "0x8407dc57739bcda7aa53ca88c8fbb171de0e1c2d",

  // Honeypot examples
  HONEYPOT_1: "0x762873d2c2b30e4BB726a45f8C862e0d1cfFa0E4",
  HONEYPOT_2: "0x1B73F74D95Dd88B2E5A5C5aaA6d8cE22c0C7aA3A",
  HONEYPOT_3: "0x9F5A5C8A3461A8B6C6b5cA5B5E5A5A5A5A5A5A5A",

  // MEV bots and searchers
  MEV_BOT_1: "0x6887246668a3b87F54DeB3b94Ba47a6f63F32985",
  MEV_BOT_2: "0x000000000035B5e5ad9019092C665357240f594e",
  FLASHLOAN_BOT: "0x59728544B08AB483533B381a893E5266fCD5070",

  // Whale wallets
  VITALIK: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  WHALE_1: "0x8EB8a3b98659Cce290402893d0123abb75E3ab28",
  WHALE_2: "0x742D35CC6434C0532925C1A82c5097bF1C94A9b5",

  // Exchange hot wallets
  BINANCE_HOT: "0x28C6c06298d514Db089934071355E5743bf21d60",
  COINBASE_HOT: "0x503828976D22510aad0201ac7EC88293211D23Da",
  KRAKEN_HOT: "0x267be1C1D684F78cb4F6a176C4911b741E4Ffdc0",
};

// Transaction hashes for realism
export const MOCK_TX_HASHES = [
  "0x4bb6f5ea4b5b8e1e5e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e",
  "0x7cc9a2ba2b2c3e4e5e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e",
  "0xa9f3b8c7d6e5f4a3b2c1d0e9f8g7h6i5j4k3l2m1n0o9p8q7r6s5t4u3v2w1x0",
  "0xf1e2d3c4b5a6978869788697868697869786969786978697869786978697869",
  "0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0",
  "0xdeadbeef000000000000000000000000000000000000000000000000deadbeef",
  "0xcafebabe111111111111111111111111111111111111111111111111cafebabe",
  "0x1337133713371337133713371337133713371337133713371337133713371337",
];

// Block numbers for different time periods
export const MOCK_BLOCKS = {
  RECENT: 18850000,
  HOUR_AGO: 18849700,
  DAY_AGO: 18842500,
  WEEK_AGO: 18792500,
  MONTH_AGO: 18642500,
  EULER_EXPLOIT: 16817996,
  TORNADO_SANCTION: 15564000,
  THE_DAO_HACK: 1920000,
};

// ===== HONEYPOT DETECTION DATA =====
export interface HoneypotAnalysis {
  id: string;
  contractAddress: string;
  honeypotScore: number;
  riskLevel: "critical" | "high" | "medium" | "low" | "safe";
  primaryTrigger: string;
  analysisTime: number;
  lastAnalyzed: string;
  methods: {
    static: {
      score: number;
      patterns: Array<{
        name: string;
        severity: "critical" | "high" | "medium" | "low";
        description: string;
        found: boolean;
        bytecodeLocation?: string;
      }>;
    };
    bytecode: {
      score: number;
      similarity: number;
      matchedContracts: Array<{
        address: string;
        similarity: number;
        verified: boolean;
        type: string;
        reported: string;
      }>;
      differenceHighlights: Array<{
        function: string;
        difference: string;
      }>;
    };
    dynamic: {
      score: number;
      simulation: {
        environment: string;
        blockNumber: string;
        testAmount: string;
      };
      transactions: Array<{
        step: number;
        type: string;
        hash: string;
        gasUsed: number;
        success: boolean;
        value: string;
        description: string;
        tokensReceived?: string;
        revertReason?: string;
      }>;
    };
    ml: {
      score: number;
      confidence: number;
      prediction: string;
      model: string;
      features: Array<{
        name: string;
        value: number;
        importance: number;
      }>;
    };
    liquidity: {
      score: number;
      buySuccessRate: number;
      sellSuccessRate: number;
      slippageTraps: boolean;
      maxSlippage: number;
      pools: Array<{
        dex: string;
        address: string;
        reserves: { token: string; eth: string };
        priceImpact: number;
      }>;
    };
  };
}

export const MOCK_HONEYPOT_ANALYSES: HoneypotAnalysis[] = [
  {
    id: "hp_001",
    contractAddress: MOCK_ADDRESSES.HONEYPOT_1,
    honeypotScore: 94,
    riskLevel: "critical",
    primaryTrigger: "Sell function reverts on amount > 0.1 ETH",
    analysisTime: 3.7,
    lastAnalyzed: "2024-01-15T14:30:00Z",
    methods: {
      static: {
        score: 92,
        patterns: [
          {
            name: "Sell Function Missing",
            severity: "critical",
            description: "Contract lacks proper sell transfer logic",
            found: true,
            bytecodeLocation: "0x1a4...0x2f8",
          },
          {
            name: "Hidden Owner Functions",
            severity: "high",
            description: "Suspicious owner-only functions detected",
            found: true,
            bytecodeLocation: "0x3a1...0x4c2",
          },
          {
            name: "Modifiable Balance",
            severity: "critical",
            description: "Owner can modify user balances arbitrarily",
            found: true,
            bytecodeLocation: "0x5d3...0x6e4",
          },
        ],
      },
      bytecode: {
        score: 89,
        similarity: 96.7,
        matchedContracts: [
          {
            address: MOCK_ADDRESSES.HONEYPOT_2,
            similarity: 96.7,
            verified: false,
            type: "Known Honeypot",
            reported: "2024-01-10",
          },
          {
            address: "0x9A8B7C6D5E4F3A2B1C9D8E7F6A5B4C3D2E1F9A8B",
            similarity: 84.3,
            verified: false,
            type: "Similar Pattern",
            reported: "2024-01-08",
          },
        ],
        differenceHighlights: [
          { function: "transfer", difference: "Missing sell logic" },
          { function: "_beforeTokenTransfer", difference: "Additional checks" },
        ],
      },
      dynamic: {
        score: 98,
        simulation: {
          environment: "Mainnet Fork",
          blockNumber: "18850000",
          testAmount: "0.1 ETH",
        },
        transactions: [
          {
            step: 1,
            type: "approve",
            hash: MOCK_TX_HASHES[0],
            gasUsed: 46000,
            success: true,
            value: "100000000000000000",
            description: "Token approval successful",
          },
          {
            step: 2,
            type: "buy",
            hash: MOCK_TX_HASHES[1],
            gasUsed: 125000,
            success: true,
            value: "100000000000000000",
            description: "Buy transaction completed",
            tokensReceived: "1000000000000000000000",
          },
          {
            step: 3,
            type: "sell",
            hash: MOCK_TX_HASHES[2],
            gasUsed: 45000,
            success: false,
            value: "500000000000000000000",
            description: "Sell transaction failed - honeypot detected",
            revertReason: "Transfer amount exceeds balance",
          },
        ],
      },
      ml: {
        score: 93,
        confidence: 96.8,
        prediction: "honeypot",
        model: "RandomForest v2.1",
        features: [
          { name: "Function Complexity", value: 0.89, importance: 0.95 },
          { name: "Transfer Patterns", value: 0.94, importance: 0.92 },
          { name: "Owner Privileges", value: 0.97, importance: 0.98 },
          { name: "Gas Usage Patterns", value: 0.76, importance: 0.84 },
        ],
      },
      liquidity: {
        score: 91,
        buySuccessRate: 100,
        sellSuccessRate: 8,
        slippageTraps: true,
        maxSlippage: 67.3,
        pools: [
          {
            dex: "Uniswap V2",
            address: "0xabc123...",
            reserves: { token: "500000", eth: "2.4" },
            priceImpact: 12.4,
          },
        ],
      },
    },
  },
  {
    id: "hp_002",
    contractAddress: MOCK_ADDRESSES.HONEYPOT_3,
    honeypotScore: 23,
    riskLevel: "low",
    primaryTrigger: "No significant issues detected",
    analysisTime: 2.1,
    lastAnalyzed: "2024-01-15T13:45:00Z",
    methods: {
      static: {
        score: 15,
        patterns: [
          {
            name: "Standard Transfer Function",
            severity: "low",
            description: "Standard ERC-20 transfer implementation",
            found: false,
          },
          {
            name: "Owner Privileges",
            severity: "medium",
            description: "Limited owner functions detected",
            found: true,
            bytecodeLocation: "0x2b1...0x3c8",
          },
        ],
      },
      bytecode: {
        score: 18,
        similarity: 23.1,
        matchedContracts: [
          {
            address: "0x1234567890abcdef1234567890abcdef12345678",
            similarity: 23.1,
            verified: true,
            type: "Standard ERC-20",
            reported: "2024-01-12",
          },
        ],
        differenceHighlights: [
          { function: "mint", difference: "Additional minting logic" },
        ],
      },
      dynamic: {
        score: 12,
        simulation: {
          environment: "Mainnet Fork",
          blockNumber: "18850000",
          testAmount: "0.1 ETH",
        },
        transactions: [
          {
            step: 1,
            type: "approve",
            hash: MOCK_TX_HASHES[3],
            gasUsed: 46000,
            success: true,
            value: "100000000000000000",
            description: "Token approval successful",
          },
          {
            step: 2,
            type: "buy",
            hash: MOCK_TX_HASHES[4],
            gasUsed: 125000,
            success: true,
            value: "100000000000000000",
            description: "Buy transaction completed",
            tokensReceived: "1000000000000000000000",
          },
          {
            step: 3,
            type: "sell",
            hash: MOCK_TX_HASHES[5],
            gasUsed: 98000,
            success: true,
            value: "500000000000000000000",
            description: "Sell transaction successful",
          },
        ],
      },
      ml: {
        score: 28,
        confidence: 89.2,
        prediction: "safe",
        model: "RandomForest v2.1",
        features: [
          { name: "Function Complexity", value: 0.34, importance: 0.85 },
          { name: "Transfer Patterns", value: 0.12, importance: 0.92 },
          { name: "Owner Privileges", value: 0.45, importance: 0.78 },
          { name: "Gas Usage Patterns", value: 0.23, importance: 0.71 },
        ],
      },
      liquidity: {
        score: 19,
        buySuccessRate: 100,
        sellSuccessRate: 98,
        slippageTraps: false,
        maxSlippage: 2.1,
        pools: [
          {
            dex: "Uniswap V3",
            address: "0xdef456...",
            reserves: { token: "10000000", eth: "45.7" },
            priceImpact: 0.8,
          },
        ],
      },
    },
  },
];

// ===== VULNERABILITY SCANNER DATA =====
export interface Vulnerability {
  id: string;
  severity: "Critical" | "High" | "Medium" | "Low" | "Info";
  title: string;
  description: string;
  contract: string;
  function?: string;
  lineNumber?: number;
  cweId?: string;
  confidence: number;
  impact: number;
  recommendation: string;
  references?: string[];
  exploitability: number;
  timestamp: string;
}

export const MOCK_VULNERABILITIES: Vulnerability[] = [
  {
    id: "vuln_001",
    severity: "Critical",
    title: "Reentrancy in withdraw function",
    description:
      "The withdraw function makes external calls before updating balances, allowing reentrancy attacks",
    contract: "0x1234567890123456789012345678901234567890",
    function: "withdraw(uint256)",
    lineNumber: 45,
    cweId: "CWE-362",
    confidence: 95,
    impact: 100,
    exploitability: 85,
    recommendation:
      "Use the checks-effects-interactions pattern or implement reentrancy guards",
    references: [
      "https://consensys.github.io/smart-contract-best-practices/attacks/reentrancy/",
      "https://blog.openzeppelin.com/reentrancy-after-istanbul/",
    ],
    timestamp: "2024-01-15T10:30:00Z",
  },
  {
    id: "vuln_002",
    severity: "High",
    title: "Integer overflow in calculation",
    description: "Arithmetic operation can overflow without proper safeguards",
    contract: "0x2345678901234567890123456789012345678901",
    function: "calculateReward(uint256,uint256)",
    lineNumber: 78,
    cweId: "CWE-190",
    confidence: 87,
    impact: 75,
    exploitability: 60,
    recommendation:
      "Use SafeMath library or Solidity ^0.8.0 built-in overflow checks",
    references: [
      "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/math/SafeMath.sol",
    ],
    timestamp: "2024-01-15T10:28:00Z",
  },
  {
    id: "vuln_003",
    severity: "Medium",
    title: "Uninitialized state variable",
    description:
      "State variable used without initialization, may lead to unexpected behavior",
    contract: "0x3456789012345678901234567890123456789012",
    function: "initialize()",
    lineNumber: 23,
    cweId: "CWE-665",
    confidence: 78,
    impact: 45,
    exploitability: 30,
    recommendation:
      "Initialize all state variables or implement proper initialization checks",
    timestamp: "2024-01-15T10:25:00Z",
  },
  {
    id: "vuln_004",
    severity: "Low",
    title: "Missing zero address check",
    description:
      "Function does not validate input address against zero address",
    contract: "0x4567890123456789012345678901234567890123",
    function: "setOwner(address)",
    lineNumber: 156,
    cweId: "CWE-20",
    confidence: 65,
    impact: 25,
    exploitability: 15,
    recommendation: "Add require(address != address(0)) validation",
    timestamp: "2024-01-15T10:20:00Z",
  },
];

// ===== MEV OPERATIONS DATA =====
export interface MEVStrategy {
  id: string;
  name: string;
  type: "arbitrage" | "liquidation" | "sandwich" | "frontrun";
  status: "active" | "paused" | "stopped";
  profitability: number;
  successRate: number;
  totalProfit: string;
  totalTxs: number;
  gasUsed: string;
  lastExecution: string;
  targetPools: string[];
  description: string;
}

export const MOCK_MEV_STRATEGIES: MEVStrategy[] = [
  {
    id: "mev_001",
    name: "DEX Arbitrage Scanner",
    type: "arbitrage",
    status: "active",
    profitability: 847.23,
    successRate: 92.4,
    totalProfit: "127.834",
    totalTxs: 1247,
    gasUsed: "15847239",
    lastExecution: "2024-01-15T14:42:00Z",
    targetPools: [
      MOCK_ADDRESSES.UNISWAP_V2_ROUTER,
      MOCK_ADDRESSES.SUSHISWAP_ROUTER,
    ],
    description: "Automated arbitrage between Uniswap V2/V3 and Sushiswap",
  },
  {
    id: "mev_002",
    name: "Liquidation Bot",
    type: "liquidation",
    status: "active",
    profitability: 1234.56,
    successRate: 89.7,
    totalProfit: "89.456",
    totalTxs: 456,
    gasUsed: "8923847",
    lastExecution: "2024-01-15T14:38:00Z",
    targetPools: [
      MOCK_ADDRESSES.AAVE_LENDING,
      MOCK_ADDRESSES.COMPOUND_COMPTROLLER,
    ],
    description:
      "Monitors undercollateralized positions for liquidation opportunities",
  },
  {
    id: "mev_003",
    name: "Sandwich Attack Defense",
    type: "sandwich",
    status: "paused",
    profitability: 432.18,
    successRate: 76.3,
    totalProfit: "23.891",
    totalTxs: 234,
    gasUsed: "4567123",
    lastExecution: "2024-01-15T13:15:00Z",
    targetPools: [MOCK_ADDRESSES.UNISWAP_V3_ROUTER],
    description: "Defensive strategy against sandwich attacks",
  },
];

export interface MEVOpportunity {
  id: string;
  type: "arbitrage" | "liquidation" | "sandwich" | "frontrun";
  priority: "high" | "medium" | "low";
  estimatedProfit: string;
  gasRequired: number;
  targetTx: string;
  deadline: string;
  pools: string[];
  status: "pending" | "executing" | "completed" | "failed";
  description: string;
  timestamp: string;
}

export const MOCK_MEV_OPPORTUNITIES: MEVOpportunity[] = [
  {
    id: "opp_001",
    type: "arbitrage",
    priority: "high",
    estimatedProfit: "2.847",
    gasRequired: 185000,
    targetTx: MOCK_TX_HASHES[0],
    deadline: "2024-01-15T14:47:00Z",
    pools: [MOCK_ADDRESSES.UNISWAP_V2_ROUTER, MOCK_ADDRESSES.SUSHISWAP_ROUTER],
    status: "pending",
    description: "ETH/USDC price discrepancy: 0.12% profit margin",
    timestamp: "2024-01-15T14:45:00Z",
  },
  {
    id: "opp_002",
    type: "liquidation",
    priority: "medium",
    estimatedProfit: "1.234",
    gasRequired: 250000,
    targetTx: MOCK_TX_HASHES[1],
    deadline: "2024-01-15T14:50:00Z",
    pools: [MOCK_ADDRESSES.AAVE_LENDING],
    status: "executing",
    description: "WBTC position at 102% collateral ratio",
    timestamp: "2024-01-15T14:44:00Z",
  },
];

// ===== WALLET GUARD DATA =====
export interface WalletRiskProfile {
  address: string;
  ens?: string;
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  totalValue: string;
  approvals: {
    total: number;
    unlimited: number;
    risky: number;
  };
  interactions: {
    defi: number;
    dexes: number;
    bridges: number;
    suspicious: number;
  };
  flags: string[];
  lastActivity: string;
  firstSeen: string;
}

export const MOCK_WALLET_PROFILES: WalletRiskProfile[] = [
  {
    address: MOCK_ADDRESSES.VITALIK,
    ens: "vitalik.eth",
    riskScore: 15,
    riskLevel: "low",
    totalValue: "1,247,891.23",
    approvals: {
      total: 47,
      unlimited: 12,
      risky: 2,
    },
    interactions: {
      defi: 234,
      dexes: 156,
      bridges: 23,
      suspicious: 1,
    },
    flags: ["High Value", "Known Entity"],
    lastActivity: "2024-01-15T13:30:00Z",
    firstSeen: "2015-07-30T00:00:00Z",
  },
  {
    address: MOCK_ADDRESSES.WHALE_1,
    riskScore: 67,
    riskLevel: "medium",
    totalValue: "89,456.78",
    approvals: {
      total: 123,
      unlimited: 45,
      risky: 12,
    },
    interactions: {
      defi: 89,
      dexes: 234,
      bridges: 45,
      suspicious: 8,
    },
    flags: ["Multiple Risky Approvals", "Bridge Usage"],
    lastActivity: "2024-01-15T14:20:00Z",
    firstSeen: "2023-03-15T00:00:00Z",
  },
];

// ===== TIME MACHINE DATA =====
export interface HistoricalExploit {
  id: string;
  name: string;
  date: string;
  blockNumber: number;
  txHash: string;
  protocol: string;
  lossAmount: string;
  exploitType: string;
  description: string;
  steps: Array<{
    step: number;
    action: string;
    txHash: string;
    gasUsed: number;
    details: string;
  }>;
  rootCause: string;
  prevention: string;
  status: "analyzed" | "simulating" | "available";
}

export const MOCK_HISTORICAL_EXPLOITS: HistoricalExploit[] = [
  {
    id: "exploit_001",
    name: "Euler Finance Flash Loan Attack",
    date: "2023-03-13T00:00:00Z",
    blockNumber: MOCK_BLOCKS.EULER_EXPLOIT,
    txHash:
      "0xc4f9beb213c98d48e7ff77a8c49ac5d4e0a2faeb6dfc0bc90a6e2c17b4e1dd05",
    protocol: "Euler Finance",
    lossAmount: "197,000,000",
    exploitType: "Flash Loan + Donation Attack",
    description:
      "Attacker used flash loans to manipulate Euler's health check mechanism",
    steps: [
      {
        step: 1,
        action: "Flash loan 30M DAI from Aave",
        txHash: MOCK_TX_HASHES[0],
        gasUsed: 156000,
        details: "Obtained large amount of DAI for manipulation",
      },
      {
        step: 2,
        action: "Deposit to Euler and borrow against it",
        txHash: MOCK_TX_HASHES[1],
        gasUsed: 234000,
        details: "Created leveraged position on Euler",
      },
      {
        step: 3,
        action: "Donate to manipulate exchange rate",
        txHash: MOCK_TX_HASHES[2],
        gasUsed: 189000,
        details: "Manipulated internal accounting via donation",
      },
      {
        step: 4,
        action: "Exploit health check and drain funds",
        txHash: MOCK_TX_HASHES[3],
        gasUsed: 456000,
        details: "Bypassed liquidation checks and withdrew excess funds",
      },
    ],
    rootCause: "Flawed donation mechanism in exchange rate calculation",
    prevention: "Implement donation protection and better health checks",
    status: "analyzed",
  },
  {
    id: "exploit_002",
    name: "Ronin Bridge Exploit",
    date: "2022-03-23T00:00:00Z",
    blockNumber: 14435779,
    txHash:
      "0x2c2b7dd30a7d3d9c6f5b5e4d3c2b1a0f9e8d7c6b5a4e3d2c1b0a9f8e7d6c5b4a",
    protocol: "Ronin Bridge",
    lossAmount: "625,000,000",
    exploitType: "Validator Compromise",
    description:
      "Attackers compromised validator keys to approve malicious withdrawals",
    steps: [
      {
        step: 1,
        action: "Compromise Sky Mavis validators",
        txHash: MOCK_TX_HASHES[4],
        gasUsed: 125000,
        details: "Gained control of 4 out of 9 validators",
      },
      {
        step: 2,
        action: "Compromise Axie DAO validator",
        txHash: MOCK_TX_HASHES[5],
        gasUsed: 98000,
        details: "Obtained 5th validator signature",
      },
      {
        step: 3,
        action: "Submit malicious withdrawal",
        txHash: MOCK_TX_HASHES[6],
        gasUsed: 156000,
        details: "Withdrew 173,600 ETH from bridge",
      },
      {
        step: 4,
        action: "Second withdrawal",
        txHash: MOCK_TX_HASHES[7],
        gasUsed: 134000,
        details: "Withdrew 25.5M USDC",
      },
    ],
    rootCause: "Insufficient decentralization of validator set",
    prevention: "Increase validator diversity and implement time delays",
    status: "analyzed",
  },
];

// ===== ANALYTICS DATA =====
export interface SecurityMetrics {
  timestamp: string;
  threatsDetected: number;
  contractsScanned: number;
  vulnerabilitiesFound: number;
  honeypotsCaught: number;
  mevProfits: number;
  gasUsed: number;
  successRate: number;
}

export const MOCK_SECURITY_METRICS: SecurityMetrics[] = [
  {
    timestamp: "2024-01-15T00:00:00Z",
    threatsDetected: 127,
    contractsScanned: 1456,
    vulnerabilitiesFound: 89,
    honeypotsCaught: 23,
    mevProfits: 15.67,
    gasUsed: 2847291,
    successRate: 94.2,
  },
  {
    timestamp: "2024-01-14T00:00:00Z",
    threatsDetected: 98,
    contractsScanned: 1234,
    vulnerabilitiesFound: 67,
    honeypotsCaught: 18,
    mevProfits: 12.34,
    gasUsed: 2156789,
    successRate: 91.8,
  },
  {
    timestamp: "2024-01-13T00:00:00Z",
    threatsDetected: 156,
    contractsScanned: 1678,
    vulnerabilitiesFound: 124,
    honeypotsCaught: 34,
    mevProfits: 23.89,
    gasUsed: 3456123,
    successRate: 96.5,
  },
];

// ===== QUANTUM SECURITY DATA =====
export interface QuantumThreat {
  id: string;
  algorithm: string;
  threatLevel: "low" | "medium" | "high" | "critical";
  affectedSystems: string[];
  estimatedTimeToBreak: string;
  mitigationStatus: "none" | "partial" | "complete";
  description: string;
  recommendation: string;
}

export const MOCK_QUANTUM_THREATS: QuantumThreat[] = [
  {
    id: "qt_001",
    algorithm: "ECDSA secp256k1",
    threatLevel: "high",
    affectedSystems: ["Bitcoin", "Ethereum", "Most cryptocurrencies"],
    estimatedTimeToBreak: "10-15 years",
    mitigationStatus: "partial",
    description:
      "Quantum computers could break ECDSA signatures using Shor's algorithm",
    recommendation:
      "Migrate to post-quantum signature schemes like CRYSTALS-Dilithium",
  },
  {
    id: "qt_002",
    algorithm: "SHA-256",
    threatLevel: "medium",
    affectedSystems: ["Bitcoin mining", "Merkle trees"],
    estimatedTimeToBreak: "20-30 years",
    mitigationStatus: "none",
    description:
      "Grover's algorithm provides quadratic speedup for hash breaking",
    recommendation:
      "Consider migration to SHA-3 or other quantum-resistant hash functions",
  },
];

// ===== MEMPOOL DATA =====
export interface MempoolTransaction {
  hash: string;
  from: string;
  to?: string;
  value: string;
  gasPrice: string;
  gasLimit: number;
  nonce: number;
  data: string;
  timestamp: string;
  type: "swap" | "transfer" | "approval" | "mint" | "burn" | "other";
  priority: "high" | "medium" | "low";
  mevRisk: number;
  estimatedProfit?: string;
}

export const MOCK_MEMPOOL_TXS: MempoolTransaction[] = [
  {
    hash: MOCK_TX_HASHES[0],
    from: MOCK_ADDRESSES.WHALE_1,
    to: MOCK_ADDRESSES.UNISWAP_V2_ROUTER,
    value: "5000000000000000000",
    gasPrice: "25000000000",
    gasLimit: 185000,
    nonce: 147,
    data: "0x7ff36ab500000000000000000000000000000000000000000000000000000000",
    timestamp: "2024-01-15T14:45:30Z",
    type: "swap",
    priority: "high",
    mevRisk: 85,
    estimatedProfit: "2.34",
  },
  {
    hash: MOCK_TX_HASHES[1],
    from: MOCK_ADDRESSES.MEV_BOT_1,
    to: MOCK_ADDRESSES.FLASHLOAN_BOT,
    value: "0",
    gasPrice: "30000000000",
    gasLimit: 456000,
    nonce: 892,
    data: "0x095ea7b3000000000000000000000000000000000000000000000000000000000",
    timestamp: "2024-01-15T14:45:28Z",
    type: "approval",
    priority: "medium",
    mevRisk: 45,
  },
];

// ===== EXPORT HELPER FUNCTIONS =====
export const mockDataUtils = {
  // Generate random timestamp within last 30 days
  randomRecentTimestamp: (): string => {
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const randomTime = thirtyDaysAgo + Math.random() * (now - thirtyDaysAgo);
    return new Date(randomTime).toISOString();
  },

  // Generate random Ethereum address
  randomAddress: (): string => {
    const chars = "0123456789abcdef";
    let result = "0x";
    for (let i = 0; i < 40; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Generate random transaction hash
  randomTxHash: (): string => {
    const chars = "0123456789abcdef";
    let result = "0x";
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Generate random amount in ETH
  randomEthAmount: (min: number = 0.001, max: number = 1000): string => {
    return (Math.random() * (max - min) + min).toFixed(6);
  },

  // Generate random gas price in gwei
  randomGasPrice: (): string => {
    return ((Math.random() * 50 + 10) * 1e9).toString();
  },

  // Generate time series data
  generateTimeSeries: (
    days: number = 30,
    baseValue: number = 100,
  ): Array<{ timestamp: string; value: number }> => {
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      const variance = (Math.random() - 0.5) * 0.2; // ±10% variance
      const value = Math.round(baseValue * (1 + variance));

      data.push({
        timestamp: date.toISOString(),
        value: Math.max(0, value),
      });
    }

    return data;
  },
};

// Export all mock data collections
export const MOCK_DATA = {
  addresses: MOCK_ADDRESSES,
  txHashes: MOCK_TX_HASHES,
  blocks: MOCK_BLOCKS,
  honeypotAnalyses: MOCK_HONEYPOT_ANALYSES,
  vulnerabilities: MOCK_VULNERABILITIES,
  mevStrategies: MOCK_MEV_STRATEGIES,
  mevOpportunities: MOCK_MEV_OPPORTUNITIES,
  walletProfiles: MOCK_WALLET_PROFILES,
  historicalExploits: MOCK_HISTORICAL_EXPLOITS,
  securityMetrics: MOCK_SECURITY_METRICS,
  quantumThreats: MOCK_QUANTUM_THREATS,
  mempoolTxs: MOCK_MEMPOOL_TXS,
  utils: mockDataUtils,
};

export default MOCK_DATA;
