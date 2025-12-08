/**
 * Risk Engine Service
 * 
 * Provides deterministic, rule-based risk scoring and tagging.
 * Analyzes wallet and transaction data to compute risk scores, levels, tags, and flags.
 * 
 * Risk scoring is based on multiple factors:
 * - Wallet age and transaction history
 * - Interaction with known risky addresses
 * - Mixer/privacy tool usage
 * - Transaction patterns
 * - Value and frequency analysis
 */

import { logger } from '../utils/logger';
import type { WalletActivityData, TransactionDetails } from './web3Service';

export interface RiskAssessment {
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  ruleBasedFlags: string[];
  confidence: number; // 0-1
}

class RiskEngineService {
  /**
   * Analyze wallet and compute risk score
   */
  async analyzeWallet(
    walletData: WalletActivityData,
    blacklistCheck?: { isBlacklisted: boolean; reasons: string[] }
  ): Promise<RiskAssessment> {
    logger.info(`Analyzing wallet risk: ${walletData.address}`);

    let riskScore = 0;
    const tags: string[] = [];
    const flags: string[] = [];

    // Rule 1: Blacklist check (critical)
    if (blacklistCheck?.isBlacklisted) {
      riskScore += 70;
      flags.push('blacklisted');
      tags.push('sanctioned');
      tags.push('high-risk');
    }

    // Rule 2: Wallet age analysis
    const walletAge = this.calculateWalletAge(walletData.firstTransaction);
    if (walletAge < 30) {
      riskScore += 15;
      flags.push('new_wallet');
      tags.push('new-wallet');
    } else if (walletAge > 730) {
      riskScore -= 5; // bonus for established wallets
      tags.push('established');
    }

    // Rule 3: Transaction count analysis
    if (walletData.transactionCount < 10) {
      riskScore += 10;
      flags.push('low_activity');
    } else if (walletData.transactionCount > 1000) {
      tags.push('high-volume');
      flags.push('high_volume');
    }

    // Rule 4: Known tags analysis
    if (walletData.knownTags?.includes('Exchange')) {
      riskScore -= 10;
      tags.push('exchange');
    }
    if (walletData.knownTags?.includes('Whale')) {
      tags.push('whale');
      flags.push('whale_wallet');
    }
    if (walletData.knownTags?.includes('Bot')) {
      riskScore += 5;
      tags.push('bot');
      flags.push('bot_detected');
    }

    // Rule 5: DeFi protocol interactions
    if (walletData.defiProtocols.length > 3) {
      riskScore -= 5; // bonus for diverse DeFi usage
      tags.push('defi');
    }

    // Rule 6: Check for mixer interactions (high risk indicator)
    const hasMixerInteraction = this.checkMixerInteraction(walletData);
    if (hasMixerInteraction) {
      riskScore += 40;
      flags.push('mixer_interaction');
      tags.push('mixer');
      tags.push('privacy-focused');
    }

    // Rule 7: Analyze transaction ratio
    const txRatio = walletData.incomingTxCount / Math.max(walletData.outgoingTxCount, 1);
    if (txRatio > 5) {
      riskScore += 10;
      flags.push('accumulation_pattern');
      tags.push('accumulator');
    } else if (txRatio < 0.2) {
      riskScore += 10;
      flags.push('distribution_pattern');
      tags.push('distributor');
    }

    // Rule 8: Contract interaction analysis
    if (walletData.contractInteractions > 100) {
      tags.push('smart-contract-user');
    }

    // Rule 9: NFT trading
    if (walletData.nftCount && walletData.nftCount > 10) {
      tags.push('nft-trader');
      flags.push('nft_activity');
    }

    // Rule 10: Balance check
    const balance = parseFloat(walletData.balance.split(' ')[0]);
    if (balance > 100) {
      tags.push('high-value');
      flags.push('large_balance');
    }

    // Normalize risk score to 0-100 range
    riskScore = Math.max(0, Math.min(100, riskScore));

    // Determine risk level
    const riskLevel = this.getRiskLevel(riskScore);

    // Calculate confidence (based on data completeness)
    const confidence = this.calculateConfidence(walletData);

    logger.debug('Wallet risk analysis complete', {
      address: walletData.address,
      riskScore,
      riskLevel,
      tags,
      flags,
    });

    return {
      riskScore,
      riskLevel,
      tags,
      ruleBasedFlags: flags,
      confidence,
    };
  }

  /**
   * Analyze transaction and compute risk score
   */
  async analyzeTransaction(txData: TransactionDetails): Promise<RiskAssessment> {
    logger.info(`Analyzing transaction risk: ${txData.hash}`);

    let riskScore = 0;
    const tags: string[] = [];
    const flags: string[] = [];

    // Rule 1: Transaction status
    if (txData.status === 'failed') {
      riskScore += 15;
      flags.push('failed_transaction');
      tags.push('failed');
    }

    // Rule 2: Value analysis
    const value = parseFloat(txData.value.split(' ')[0]);
    if (value > 50) {
      riskScore += 15;
      flags.push('large_value');
      tags.push('large_transfer');
    } else if (value < 0.001) {
      riskScore += 5;
      flags.push('dust_transaction');
    }

    // Rule 3: Token transfers
    if (txData.tokenTransfers && txData.tokenTransfers.length > 0) {
      tags.push('token_swap');
      if (txData.tokenTransfers.length > 5) {
        riskScore += 10;
        flags.push('multiple_tokens');
      }
    }

    // Rule 4: Contract interaction
    if (txData.contractAddress) {
      tags.push('contract_interaction');
      
      // Check for known method IDs
      if (txData.methodId === '0xa9059cbb') {
        // ERC20 transfer
        tags.push('token_transfer');
      } else if (txData.methodId === '0x095ea7b3') {
        // ERC20 approve - potential security risk
        riskScore += 10;
        flags.push('token_approval');
        tags.push('approval');
      }
    }

    // Rule 5: Gas analysis
    if (txData.gasUsed > 500000) {
      riskScore += 5;
      flags.push('high_gas_usage');
      tags.push('complex_transaction');
    }

    // Rule 6: Check for new contract creation
    if (txData.to === '0x0000000000000000000000000000000000000000') {
      riskScore += 20;
      flags.push('contract_creation');
      tags.push('contract_creation');
    }

    // Rule 7: Flash loan detection (very high gas + large value)
    if (txData.gasUsed > 1000000 && value > 100) {
      riskScore += 35;
      flags.push('flash_loan_pattern');
      tags.push('flash_loan');
    }

    // Rule 8: Bridge transaction detection
    const isBridge = this.detectBridgeTransaction(txData);
    if (isBridge) {
      riskScore += 5;
      tags.push('bridge');
      flags.push('bridge_transaction');
    }

    // Normalize risk score
    riskScore = Math.max(0, Math.min(100, riskScore));

    // Determine risk level
    const riskLevel = this.getRiskLevel(riskScore);

    // High confidence for transaction data (it's concrete)
    const confidence = 0.95;

    logger.debug('Transaction risk analysis complete', {
      hash: txData.hash,
      riskScore,
      riskLevel,
      tags,
      flags,
    });

    return {
      riskScore,
      riskLevel,
      tags,
      ruleBasedFlags: flags,
      confidence,
    };
  }

  /**
   * Helper: Calculate wallet age in days
   */
  private calculateWalletAge(firstTransaction: string): number {
    const firstTx = new Date(firstTransaction);
    const now = new Date();
    const ageMs = now.getTime() - firstTx.getTime();
    return Math.floor(ageMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Helper: Check for mixer/privacy tool interactions
   */
  private checkMixerInteraction(walletData: WalletActivityData): boolean {
    // In production: Check against known mixer contract addresses
    const mixerKeywords = ['tornado', 'mixer', 'tumbler'];
    return walletData.defiProtocols.some(protocol =>
      mixerKeywords.some(keyword => protocol.toLowerCase().includes(keyword))
    );
  }

  /**
   * Helper: Detect bridge transactions
   */
  private detectBridgeTransaction(txData: TransactionDetails): boolean {
    // Check for common bridge patterns
    return (
      txData.methodId?.includes('bridge') ||
      txData.inputData?.includes('bridge') ||
      false
    );
  }

  /**
   * Helper: Calculate confidence score based on data completeness
   */
  private calculateConfidence(walletData: WalletActivityData): number {
    let score = 0.5; // base confidence

    if (walletData.transactionCount > 50) score += 0.1;
    if (walletData.transactionCount > 200) score += 0.1;
    if (walletData.defiProtocols.length > 0) score += 0.1;
    if (walletData.tokenHoldings.length > 0) score += 0.1;
    if (walletData.knownTags && walletData.knownTags.length > 0) score += 0.1;

    return Math.min(1, score);
  }

  /**
   * Helper: Convert numeric score to risk level
   */
  private getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  }
}

// Export singleton instance
export const riskEngineService = new RiskEngineService();
