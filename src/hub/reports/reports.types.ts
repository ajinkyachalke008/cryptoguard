// src/hub/reports/reports.types.ts

export type Classification = 
  | 'UNCLASSIFIED' 
  | 'CONFIDENTIAL' 
  | 'RESTRICTED' 
  | 'FOR LAW ENFORCEMENT' 
  | 'INTERNAL USE ONLY';

export type ReportType = 'WALLET' | 'TOKEN' | 'INVESTIGATION';

export interface RiskFlag {
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  detail: string;
  source: string;
}

export interface DataLineageItem {
  dataItem: string;    // e.g. "ETH Native Balance"
  sourceAPI: string;   // e.g. "Alchemy"
  endpoint: string;    // e.g. "eth_getBalance"
  timestamp: string;
  status: 'SUCCESS' | 'FAILED';
  error?: string;
}

export interface WalletReportData {
  reportId: string;
  reportType: 'WALLET';
  classification: Classification;
  generatedAt: string;
  operatorName: string;
  
  // Subject Info
  address: string;
  network: string;
  ensName?: string;
  entityType: string;
  
  // Financials
  riskScore: number;
  riskLevel: string;
  netWorth: number;
  assets: any[];
  history: any[];
  
  // Analysis
  riskFlags: RiskFlag[];
  chainDistribution: any[];
  topCounterparties: any[];
  
  // Lineage
  dataLineage: DataLineageItem[];
}

export interface ReportConfig {
  classification: Classification;
  includeRawData: boolean;
  includeCharts: boolean;
  includeDataLineage: boolean;
  includeAnalystCertification: boolean;
  includeAppendix: boolean;
  watermark: boolean;
}
