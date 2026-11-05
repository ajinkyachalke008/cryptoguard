import { describe, it, expect } from 'vitest';
import { riskEngineService } from '../lib/services/riskEngineService';
import type { WalletActivityData } from '../lib/services/web3Service';

describe('RiskEngineService — Deterministic Rule Scoring', () => {
  const baseWallet: WalletActivityData = {
    address: '0x71c67d7e378e1b4b9b9423c89b8d2eb975d048e7',
    chain: 'eth',
    balance: '1.5 ETH',
    transactionCount: 50,
    firstTransaction: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(), // 100 days old
    lastTransaction: new Date().toISOString(),
    tokenHoldings: ['USDC', 'USDT'],
    contractInteractions: 5,
    defiProtocols: ['Uniswap'],
    incomingTxCount: 25,
    outgoingTxCount: 25,
    totalValueTransferred: '5.0 ETH',
    knownTags: []
  };

  it('assigns low risk score to a normal established wallet', async () => {
    const assessment = await riskEngineService.analyzeWallet(baseWallet);
    expect(assessment.riskScore).toBeLessThan(30);
    expect(assessment.riskLevel).toBe('low');
  });

  it('adds +70 critical penalty for blacklisted wallets', async () => {
    const assessment = await riskEngineService.analyzeWallet(baseWallet, {
      isBlacklisted: true,
      reasons: ['OFAC Specially Designated Nationals List']
    });
    expect(assessment.riskScore).toBeGreaterThanOrEqual(70);
    expect(assessment.ruleBasedFlags).toContain('blacklisted');
    expect(assessment.tags).toContain('sanctioned');
  });

  it('adds +40 penalty for mixer interactions', async () => {
    const mixerWallet: WalletActivityData = {
      ...baseWallet,
      defiProtocols: ['Tornado Cash', 'Uniswap'],
      knownTags: ['Tornado.Cash']
    };
    const assessment = await riskEngineService.analyzeWallet(mixerWallet);
    expect(assessment.riskScore).toBeGreaterThanOrEqual(40);
    expect(assessment.ruleBasedFlags).toContain('mixer_interaction');
    expect(assessment.tags).toContain('mixer');
  });

  it('adds +15 penalty for new wallets under 30 days old', async () => {
    const newWallet: WalletActivityData = {
      ...baseWallet,
      firstTransaction: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days old
    };
    const assessment = await riskEngineService.analyzeWallet(newWallet);
    expect(assessment.ruleBasedFlags).toContain('new_wallet');
  });

  it('clamps scores strictly between 0 and 100', async () => {
    const extremeIllicitWallet: WalletActivityData = {
      ...baseWallet,
      knownTags: ['Tornado.Cash', 'Bot'],
      incomingTxCount: 100,
      outgoingTxCount: 1, // Extreme ratio +10
      firstTransaction: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // New wallet +15
    };
    const assessment = await riskEngineService.analyzeWallet(extremeIllicitWallet, {
      isBlacklisted: true,
      reasons: ['OFAC Sanctioned']
    });
    // Total raw additions: 70 + 40 + 15 + 10 + 5 = 140 -> Clamped to 100
    expect(assessment.riskScore).toBe(100);
    expect(assessment.riskLevel).toBe('critical');
  });
});
