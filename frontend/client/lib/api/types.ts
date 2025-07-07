// Wallet Security API Types

export interface WalletCheckRequest {
  address: string;
  chain_id: number;
  include_nfts?: boolean;
}

export interface TokenApproval {
  token: string;
  contract_address: string;
  spender: string;
  amount: string;
  is_unlimited: boolean;
  risk_level: "low" | "medium" | "high" | "critical";
  last_updated: string;
  value_at_risk?: string;
}

export interface WalletCheckResponse {
  address: string;
  risk_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
  total_approvals: number;
  high_risk_approvals: number;
  approvals: TokenApproval[];
  recommendations: string[];
  last_scan: string;
}

export interface RevokeRequest {
  address: string;
  token_contract: string;
  spender: string;
  chain_id?: number;
}

export interface RevokeResponse {
  success: boolean;
  message: string;
  transaction_hash?: string;
  gas_estimate?: string;
}

// Additional types for enhanced features
export interface WalletScanHistory {
  id: string;
  address: string;
  scan_date: string;
  risk_score: number;
  total_approvals: number;
  high_risk_count: number;
}

export interface SecurityAlert {
  id: string;
  type: "new_approval" | "risk_increase" | "suspicious_activity";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  timestamp: string;
  wallet_address: string;
}
