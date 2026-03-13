// src/hub/osint/osint.types.ts

export type OSINTRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface OSINTEntity {
  id: string;
  name: string;
  type: 'exchange' | 'mixer' | 'sanctioned' | 'scam' | 'whale' | 'protocol' | 'unknown';
  isSanctioned?: boolean;
}

export interface TransactionHop {
  id: string;
  from: string;
  to: string;
  value: string;
  symbol: string;
  timestamp: number;
  txHash: string;
  counterpartyLabel?: string;
  counterpartyType?: OSINTEntity['type'];
  riskLevel: OSINTRiskLevel;
}

export interface TraceData {
  nodes: Array<{
    id: string;
    label: string;
    type: string;
    isSanctioned: boolean;
    value?: string;
  }>;
  edges: Array<{
    source: string;
    target: string;
    amount: string;
    txHash: string;
    timestamp: number;
  }>;
}

export interface WalletOSINTProfile {
  address: string;
  chain: string;
  labels: string[];
  firstSeen: number;
  lastSeen: number;
  totalTxCount: number;
  riskScore: number;
  riskLevel: OSINTRiskLevel;
  signals: Array<{
    type: string;
    severity: OSINTRiskLevel;
    detail: string;
  }>;
}

export interface RansomwareSignal {
  address: string;
  family: string;
  totalPaid: string;
  txCount: number;
  lastActivity: number;
}

export interface TokenAuditResult {
  contractAddress: string;
  chain: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  riskLevel: OSINTRiskLevel;
  honeypot: boolean;
  mintable: boolean;
  proxy: boolean;
  buyTax: number;
  sellTax: number;
  ownerPrivileges: string[];
  holderConcentration: number;
}

export interface CaseEvidence {
  id: string;
  type: 'screenshot' | 'transaction' | 'api_response' | 'note';
  title: string;
  data: any;
  timestamp: string;
  source: string;
  significance: OSINTRiskLevel;
}

export interface OSINTCase {
  id: string;
  title: string;
  status: 'active' | 'closed' | 'archived';
  createdAt: string;
  lastUpdated: string;
  subjects: Array<{
    type: string;
    value: string;
    chain?: string;
  }>;
  evidence: CaseEvidence[];
  notes: string;
  riskLevel: OSINTRiskLevel;
}
