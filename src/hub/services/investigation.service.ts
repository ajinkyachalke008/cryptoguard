// src/hub/services/investigation.service.ts
import { MoralisService } from './moralis.service';
import { AlchemyService } from './alchemy.service';
import { OFACService } from './ofac.service';
import { GoPlusService } from '../osint/services/intelligence/goplus.service';
import { BitcoinOSINTService } from '../osint/services/blockchain/bitcoin.osint.service';
import { EthereumOSINTService } from '../osint/services/blockchain/ethereum.osint.service';
import { IntelligentForensicsService } from './intelligentForensics.service';
import { ChainabuseService } from '../osint/services/intelligence/chainabuse.service';
import { WhaleAlertService } from '../osint/services/intelligence/whalealert.service';
import { ScamSnifferService } from '../osint/services/intelligence/scamsniffer.service';

export interface IntelligenceDossier {
  entity: {
    address: string;
    type: 'WALLET' | 'CONTRACT' | 'TXID' | 'UNKNOWN';
    chain: string;
    tags: string[];
    isDeterministic?: boolean;
  };
  financials: {
    netWorth: number;
    assets: any[];
    history: any[];
  };
  security: {
    riskScore: number;
    riskLevel: string;
    isSanctioned: boolean;
    maliciousFlags: string[];
    riskAnalysis: any;
  };
  narrative?: any;
}

export const InvestigationService = {
  detectType(input: string): 'WALLET' | 'TXID' | 'UNKNOWN' {
    const trimmed = input.trim();
    // Wallets & Accounts
    if (/^(0x)?[0-9a-fA-F]{40}$/.test(trimmed)) return 'WALLET'; // EVM
    if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(trimmed) || /^bc1[ac-hj-np-z02-9]{11,71}$/.test(trimmed)) return 'WALLET'; // BTC
    if (/^[A-HJ-NP-Z1-9]{32,44}$/.test(trimmed)) return 'WALLET'; // SOL
    
    // Domain Systems
    if (/\.eth$/.test(trimmed)) return 'WALLET'; // ENS
    if (/\.sol$/.test(trimmed)) return 'WALLET'; // SOL Name
    if (/\.lens$/.test(trimmed)) return 'WALLET'; // Lens
    
    // Transactions
    if (/^0x([A-Fa-f0-9]{64})$/.test(trimmed)) return 'TXID'; // EVM TX
    if (/^[A-HJ-NP-Z1-9]{64,88}$/.test(trimmed)) return 'TXID'; // SOL TX (Sig)
    
    return 'UNKNOWN';
  },

  async queryUniversal(input: string, chain = 'eth'): Promise<IntelligenceDossier> {
    const type = this.detectType(input);
    const dossier: IntelligenceDossier = {
      entity: { address: input, type, chain, tags: [], isDeterministic: false },
      financials: { netWorth: 0, assets: [], history: [] },
      security: { riskScore: 0, riskLevel: 'Safe', isSanctioned: false, maliciousFlags: [], riskAnalysis: null }
    };

    if (type === 'WALLET') {
      try {
        const [balances, sanctions, netWorth, audit, history, chainabuse] = await Promise.all([
          MoralisService.getTokenBalances(input, chain),
          OFACService.checkAddress(input),
          MoralisService.getWalletNetWorth(input),
          GoPlusService.checkAddress(input),
          chain === 'bitcoin' ? BitcoinOSINTService.getTransactions(input) : EthereumOSINTService.getTxList(input),
          ChainabuseService.getReports(input)
        ]);

        dossier.financials.assets = balances || [];
        dossier.financials.netWorth = parseFloat(netWorth?.total_net_worth_usd || '0');
        
        // Map history safely and adjust for BTC (Blockstream) format
        const rawHistory = history?.result || history || [];
        if (chain === 'bitcoin') {
          dossier.financials.history = Array.isArray(rawHistory) ? rawHistory.map((tx: any) => ({
             hash: tx.txid,
             block_timestamp: tx.status?.block_time ? new Date(tx.status.block_time * 1000).toISOString() : new Date().toISOString()
          })) : [];
        } else {
          dossier.financials.history = Array.isArray(rawHistory) ? rawHistory : [];
        }
        
        dossier.security.isSanctioned = sanctions?.isSanctioned || false;
        dossier.security.riskAnalysis = audit?.result;
        
        // High-Value / Legendary Target Detection
        if (input === '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa') {
          dossier.entity.tags.push('LEGENDARY_FOUNDER', 'GENESIS_BLOCK');
        }

        // Integrate True OSINT Intelligence
        if (chainabuse.length > 0) {
          dossier.entity.tags.push('VERIFIED_SCAMMER', 'CHAINABUSE_REPORTED');
          dossier.security.maliciousFlags.push(...chainabuse.map(r => `[CHAINABUSE] ${r.scamType}: ${r.description}`));
        }
        
        // Determine if result is ESI (Synthetic) - Only if keys are missing
        const moralisKey = process.env.HUB_MORALIS_API_KEY;
        if (!moralisKey || moralisKey.length < 5) {
          dossier.entity.isDeterministic = true;
          dossier.entity.tags.push('SYNTHETIC_INTEL');
        }

        // Professional Risk Scoring logic
        let score = 10; // Base score for active entities
        if (dossier.security.isSanctioned) score += 90;
        if (audit?.result?.cybercrime === '1') score += 50;
        if (audit?.result?.money_laundering === '1') score += 60;
        if (chainabuse.length > 0) score += 40;
        
        if (dossier.financials.netWorth > 500000) dossier.entity.tags.push('HIGH_VALUE');
        if (dossier.financials.netWorth > 1000000) dossier.entity.tags.push('INSTITUTIONAL');
        
        dossier.security.riskScore = Math.min(score, 100);
        const s = dossier.security.riskScore;
        dossier.security.riskLevel = s < 30 ? 'Low' : s < 60 ? 'Medium' : s < 80 ? 'High' : 'Critical';

        // 🧬 FORENSIC FINGERPRINTING ENGINE (Phase 5)
        // Feature 1: Peeling Chain Detection (High Velocity Layering)
        const highValueOutflows = dossier.financials.history.filter((tx: any) => tx.value && parseFloat(tx.value) > 10000);
        if (highValueOutflows.length > 5) {
          dossier.entity.tags.push('PEELING_CHAIN_DETECTED');
          dossier.security.maliciousFlags.push("[FORENSICS] High-velocity layering (Peeling Chain) signature detected in last 100 txs.");
        }

        // Feature 2: Structuring Detection (Smurfing Patterns)
        const smallUniformIns = dossier.financials.history.filter((tx: any) => tx.value && parseFloat(tx.value) > 900 && parseFloat(tx.value) < 1100);
        if (smallUniformIns.length > 10) {
          dossier.entity.tags.push('STRUCTURING_SIGNATURE');
          dossier.security.maliciousFlags.push("[FORENSICS] Structuring / Smurfing behavior detected: Multiple uniform sub-$1k transfers.");
        }

      } catch (err) {
        console.error("Universal Query Interrupted:", err);
      }
    }

    return dossier;
  }
};
