// src/hub/hub.types.ts

export type ChainId = 'eth' | 'bsc' | 'polygon' | 'arbitrum' | 'optimism' | 'avalanche' | 'fantom' | 'bitcoin';

export interface ChainConfig {
  name: string;
  symbol: string;
  decimals: number;
  explorer: string;
}

export type RiskSeverity = 'INFO' | 'WARNING' | 'DANGER' | 'CRITICAL';

export interface RiskSignal {
  id: string;
  label: string;
  severity: RiskSeverity;
  triggered: boolean;
  value: string;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE';

export interface RiskThreshold {
  min: number;
  max: number;
  color?: string;
  action?: string;
  label?: string;
}

export interface HealthResult {
  status: 'UP' | 'DEGRADED' | 'DOWN';
  latencyMs: number;
  httpCode: number;
}

// ... Additional types will be added as features are implemented
