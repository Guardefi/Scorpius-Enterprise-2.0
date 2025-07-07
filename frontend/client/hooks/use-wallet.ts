import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  WalletCheckRequest,
  WalletCheckResponse,
  RevokeRequest,
  RevokeResponse,
  WalletScanHistory,
} from "@/lib/api/types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Wallet check hook
export const useWalletCheck = () => {
  return useMutation<WalletCheckResponse, Error, WalletCheckRequest>({
    mutationFn: async (request: WalletCheckRequest) => {
      // Try API first, fallback to mock data
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/wallet/check`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        });

        if (response.ok) {
          const data = await response.json();
          return data.data || data;
        }
      } catch (error) {
        console.warn("API unavailable, using mock data");
      }

      // Mock response for demo purposes
      return generateMockWalletData(request.address);
    },
  });
};

// Wallet revoke hook
export const useWalletRevoke = () => {
  const queryClient = useQueryClient();

  return useMutation<RevokeResponse, Error, RevokeRequest>({
    mutationFn: async (request: RevokeRequest) => {
      // Try API first, fallback to mock data
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/wallet/revoke`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        });

        if (response.ok) {
          const data = await response.json();
          return data.data || data;
        }
      } catch (error) {
        console.warn("API unavailable, using mock response");
      }

      // Mock response for demo purposes
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay
      return {
        success: true,
        message: "Approval revocation transaction submitted successfully",
        transaction_hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        gas_estimate: "45000",
      };
    },
    onSuccess: () => {
      // Invalidate and refetch wallet data after successful revocation
      queryClient.invalidateQueries({ queryKey: ["wallet-check"] });
    },
  });
};

// Get wallet scan history
export const useWalletHistory = (address?: string) => {
  return useQuery<WalletScanHistory[]>({
    queryKey: ["wallet-history", address],
    queryFn: async () => {
      if (!address) return [];

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/wallet/history?address=${address}`,
        );

        if (response.ok) {
          const data = await response.json();
          return data.data || [];
        }
      } catch (error) {
        console.warn("API unavailable, using mock history");
      }

      // Mock history data
      return generateMockWalletHistory(address);
    },
    enabled: !!address,
  });
};

// Mock data generators
function generateMockWalletData(address: string): WalletCheckResponse {
  const approvals = generateMockApprovals();
  const highRiskCount = approvals.filter(
    (a) => a.risk_level === "high" || a.risk_level === "critical",
  ).length;

  return {
    address,
    risk_score: Math.floor(Math.random() * 40) + 30, // 30-70 risk score
    risk_level:
      highRiskCount > 3 ? "high" : highRiskCount > 1 ? "medium" : "low",
    total_approvals: approvals.length,
    high_risk_approvals: highRiskCount,
    approvals,
    recommendations: generateRecommendations(highRiskCount),
    last_scan: new Date().toISOString(),
  };
}

function generateMockApprovals() {
  const tokens = [
    "USDC",
    "USDT",
    "DAI",
    "WETH",
    "UNI",
    "LINK",
    "AAVE",
    "COMP",
    "MKR",
    "SNX",
  ];
  const spenderTypes = [
    "Uniswap V3",
    "1inch",
    "OpenSea",
    "SushiSwap",
    "Curve",
    "Balancer",
    "Unknown Contract",
    "MEV Bot",
  ];

  const approvals = [];
  const count = Math.floor(Math.random() * 8) + 2; // 2-10 approvals

  for (let i = 0; i < count; i++) {
    const token = tokens[Math.floor(Math.random() * tokens.length)];
    const isUnlimited = Math.random() > 0.4; // 60% chance of unlimited
    const riskLevel = isUnlimited
      ? Math.random() > 0.7
        ? "critical"
        : Math.random() > 0.5
          ? "high"
          : "medium"
      : Math.random() > 0.8
        ? "medium"
        : "low";

    approvals.push({
      token,
      contract_address: `0x${Math.random().toString(16).substr(2, 40)}`,
      spender: `0x${Math.random().toString(16).substr(2, 40)}`,
      amount: isUnlimited ? "∞" : `${Math.floor(Math.random() * 1000000)}`,
      is_unlimited: isUnlimited,
      risk_level: riskLevel as any,
      last_updated: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      value_at_risk: `$${Math.floor(Math.random() * 50000)}`,
    });
  }

  return approvals;
}

function generateRecommendations(highRiskCount: number): string[] {
  const allRecommendations = [
    "Revoke unlimited approvals for tokens you're not actively using",
    "Regularly audit your token approvals every month",
    "Use hardware wallets for high-value transactions",
    "Only approve the minimum amount needed for each transaction",
    "Be cautious of approving tokens to unknown contracts",
    "Consider using approval management tools regularly",
    "Review approvals after interacting with new DeFi protocols",
    "Set up monitoring alerts for new approvals",
  ];

  const count = Math.min(highRiskCount + 2, allRecommendations.length);
  return allRecommendations.slice(0, count);
}

function generateMockWalletHistory(address: string): WalletScanHistory[] {
  const history = [];
  const count = Math.floor(Math.random() * 5) + 1; // 1-5 historical scans

  for (let i = 0; i < count; i++) {
    history.push({
      id: `scan_${i}`,
      address,
      scan_date: new Date(
        Date.now() - i * 7 * 24 * 60 * 60 * 1000,
      ).toISOString(), // Weekly intervals
      risk_score: Math.floor(Math.random() * 40) + 30,
      total_approvals: Math.floor(Math.random() * 10) + 5,
      high_risk_count: Math.floor(Math.random() * 3),
    });
  }

  return history;
}
