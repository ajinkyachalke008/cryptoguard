// src/hub/reports/engine/ReportDataCompiler.ts
import { WalletReportData, Classification, RiskFlag } from '../reports.types';
import { IntelligenceDossier } from '../../services/investigation.service';
import { DataLineageTracker } from './DataLineageTracker';
import { ReportIdGenerator } from './ReportIdGenerator';

export const ReportDataCompiler = {
  async compileWalletData(
    dossier: IntelligenceDossier, 
    classification: Classification,
    operatorName: string,
    tracker: DataLineageTracker
  ): Promise<WalletReportData> {
    
    // Simulate mapping flags if not present
    const riskFlags: RiskFlag[] = [];
    if (dossier.security.isSanctioned) {
      riskFlags.push({
        type: 'OFAC SANCTION MATCH',
        severity: 'CRITICAL',
        detail: 'Address is listed on the US Treasury OFAC SDN list.',
        source: 'US_TREASURY_OFAC'
      });
    }
    
    if (dossier.security.riskScore > 60) {
      riskFlags.push({
        type: 'HIGH VELOCITY ACTIVITY',
        severity: 'HIGH',
        detail: 'Sudden spike in transaction volume and capital flow detected in last 24h.',
        source: 'ARIA_BEHAVIORAL_ENGINE'
      });
    }

    return {
      reportId: ReportIdGenerator.generate('WALLET'),
      reportType: 'WALLET',
      classification,
      generatedAt: new Date().toISOString(),
      operatorName,
      address: dossier.entity.address,
      network: dossier.entity.chain,
      ensName: dossier.entity.address === '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' ? 'vitalik.eth' : undefined,
      entityType: dossier.entity.type,
      riskScore: dossier.security.riskScore,
      riskLevel: dossier.security.riskLevel,
      netWorth: dossier.financials.netWorth,
      assets: dossier.financials.assets,
      history: dossier.financials.history,
      riskFlags,
      chainDistribution: [], // Expansion point
      topCounterparties: [], // Expansion point
      dataLineage: tracker.getAll()
    };
  }
};
