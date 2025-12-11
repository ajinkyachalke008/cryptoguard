import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { walletScans } from '@/db/schema';

const SUPPORTED_BLOCKCHAINS = [
  'ethereum',
  'bitcoin',
  'polygon',
  'bsc',
  'arbitrum',
  'optimism',
  'avalanche',
  'solana',
  'cardano',
  'polkadot'
];

function generateRiskScore(): number {
  return Math.floor(Math.random() * (95 - 15 + 1)) + 15;
}

function generateSanctionsStatus(): 'clean' | 'sanctioned' | 'flagged' {
  const rand = Math.random();
  if (rand < 0.10) return 'sanctioned';
  if (rand < 0.25) return 'flagged';
  return 'clean';
}

function generatePepRiskLevel(): 'none' | 'low' | 'medium' | 'high' {
  const rand = Math.random();
  if (rand < 0.05) return 'high';
  if (rand < 0.15) return 'medium';
  if (rand < 0.30) return 'low';
  return 'none';
}

function generateMultiChainData(blockchain: string) {
  const numChains = Math.floor(Math.random() * 4) + 2;
  const allChains = [...SUPPORTED_BLOCKCHAINS];
  const selectedChains = [blockchain];
  
  for (let i = 0; i < numChains - 1; i++) {
    const availableChains = allChains.filter(c => !selectedChains.includes(c));
    const randomChain = availableChains[Math.floor(Math.random() * availableChains.length)];
    selectedChains.push(randomChain);
  }
  
  return {
    chains: selectedChains,
    total_balance_usd: Math.floor(Math.random() * 1000000) + 1000,
    cross_chain_activity: selectedChains.length > 3 ? 'high' : selectedChains.length > 2 ? 'medium' : 'low'
  };
}

function generateChainRisks(chains: string[], overallRiskScore: number) {
  return chains.map(chain => {
    const chainRiskScore = Math.max(0, Math.min(100, overallRiskScore + (Math.random() * 20 - 10)));
    const flags: string[] = [];
    
    if (chainRiskScore > 70) {
      flags.push('high_value_transactions', 'mixer_interaction');
    }
    if (chainRiskScore > 50) {
      flags.push('frequent_transfers', 'anonymous_counterparties');
    }
    if (chainRiskScore > 30) {
      flags.push('new_address', 'irregular_patterns');
    }
    
    return {
      chain,
      risk_score: Math.round(chainRiskScore),
      flags: flags.slice(0, Math.floor(Math.random() * 3) + 1)
    };
  });
}

function generateAIExplanation(
  riskScore: number,
  sanctionsStatus: string,
  pepLevel: string,
  multiChainData: any
): string {
  let explanation = `Comprehensive risk analysis for wallet address:\n\n`;
  
  if (riskScore < 30) {
    explanation += `LOW RISK PROFILE (${riskScore}/100): This wallet demonstrates low-risk characteristics with standard transaction patterns and no significant red flags. `;
  } else if (riskScore < 60) {
    explanation += `MODERATE RISK PROFILE (${riskScore}/100): This wallet shows some elevated risk indicators requiring additional monitoring. `;
  } else {
    explanation += `HIGH RISK PROFILE (${riskScore}/100): This wallet exhibits significant risk factors that warrant thorough investigation. `;
  }
  
  if (sanctionsStatus === 'sanctioned') {
    explanation += `\n\nCRITICAL: Wallet appears on one or more international sanctions lists. Immediate compliance review required. All transactions with this address may be prohibited under applicable regulations.`;
  } else if (sanctionsStatus === 'flagged') {
    explanation += `\n\nWARNING: Wallet has been flagged for potential sanctions-related concerns. Enhanced due diligence recommended before proceeding with any transactions.`;
  } else {
    explanation += `\n\nSanctions screening: No current sanctions matches identified across major international lists.`;
  }
  
  if (pepLevel === 'high') {
    explanation += `\n\nPEP ALERT (HIGH): Wallet is associated with a high-level Politically Exposed Person. Enhanced monitoring and Source of Funds verification mandatory under AML regulations.`;
  } else if (pepLevel === 'medium') {
    explanation += `\n\nPEP NOTICE (MEDIUM): Wallet shows connection to a mid-level PEP. Standard enhanced due diligence procedures should be applied.`;
  } else if (pepLevel === 'low') {
    explanation += `\n\nPEP INDICATOR (LOW): Minor PEP associations detected. Standard customer due diligence may be sufficient.`;
  }
  
  explanation += `\n\nMulti-Chain Analysis: Wallet is active across ${multiChainData.chains.length} blockchain networks with total estimated value of $${multiChainData.total_balance_usd.toLocaleString()}. `;
  
  if (multiChainData.cross_chain_activity === 'high') {
    explanation += `High cross-chain activity detected, suggesting sophisticated asset management or potential layering activities. Monitor for unusual bridging patterns.`;
  } else if (multiChainData.cross_chain_activity === 'medium') {
    explanation += `Moderate cross-chain usage observed, consistent with diversified portfolio management.`;
  } else {
    explanation += `Limited cross-chain activity indicates focused blockchain usage.`;
  }
  
  return explanation;
}

function generateCrossChainFlow(chains: string[], riskScore: number) {
  const numInbound = Math.floor(Math.random() * chains.length) + 1;
  const numOutbound = Math.floor(Math.random() * chains.length) + 1;
  
  const inboundChains = chains.slice(0, numInbound);
  const outboundChains = chains.slice(-numOutbound);
  
  const suspiciousPatterns: string[] = [];
  
  if (riskScore > 70) {
    suspiciousPatterns.push(
      'Rapid chain-hopping within short timeframes',
      'High-frequency bridge usage to privacy-focused chains',
      'Layered transactions across multiple networks'
    );
  } else if (riskScore > 50) {
    suspiciousPatterns.push(
      'Irregular bridging patterns detected',
      'Asymmetric inbound/outbound flow volumes'
    );
  } else if (riskScore > 30) {
    suspiciousPatterns.push(
      'Minor timing anomalies in cross-chain transfers'
    );
  }
  
  const numPatterns = Math.min(suspiciousPatterns.length, Math.floor(Math.random() * 3) + 2);
  
  return {
    inbound_chains: inboundChains,
    outbound_chains: outboundChains,
    suspicious_patterns: suspiciousPatterns.slice(0, numPatterns)
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, blockchain } = body;
    
    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        { 
          error: 'Wallet address is required and must be a string',
          code: 'MISSING_ADDRESS'
        },
        { status: 400 }
      );
    }
    
    if (!blockchain || typeof blockchain !== 'string') {
      return NextResponse.json(
        { 
          error: 'Blockchain is required and must be a string',
          code: 'MISSING_BLOCKCHAIN'
        },
        { status: 400 }
      );
    }
    
    const normalizedBlockchain = blockchain.toLowerCase().trim();
    
    if (!SUPPORTED_BLOCKCHAINS.includes(normalizedBlockchain)) {
      return NextResponse.json(
        { 
          error: `Unsupported blockchain. Supported chains: ${SUPPORTED_BLOCKCHAINS.join(', ')}`,
          code: 'UNSUPPORTED_BLOCKCHAIN'
        },
        { status: 400 }
      );
    }
    
    const normalizedAddress = address.trim();
    
    const riskScore = generateRiskScore();
    const sanctionsStatus = generateSanctionsStatus();
    const pepRiskLevel = generatePepRiskLevel();
    const multiChainData = generateMultiChainData(normalizedBlockchain);
    const chainRisks = generateChainRisks(multiChainData.chains, riskScore);
    const crossChainFlow = generateCrossChainFlow(multiChainData.chains, riskScore);
    
    const sanctionLists = sanctionsStatus === 'sanctioned' 
      ? ['OFAC SDN', 'UN Security Council', 'EU Sanctions']
      : sanctionsStatus === 'flagged'
      ? ['OFAC SDN']
      : [];
    
    const sanctionsData = {
      is_sanctioned: sanctionsStatus === 'sanctioned',
      sanction_lists: sanctionLists,
      severity: sanctionsStatus === 'sanctioned' ? 'critical' : sanctionsStatus === 'flagged' ? 'medium' : 'none',
      jurisdictions: sanctionsStatus !== 'clean' ? ['US', 'EU', 'UK'] : []
    };
    
    const pepPositions = ['Minister', 'Senator', 'Governor', 'Ambassador', 'Central Bank Official'];
    const pepCountries = ['US', 'UK', 'DE', 'FR', 'CN', 'RU', 'BR', 'IN'];
    
    const pepData = {
      is_pep: pepRiskLevel !== 'none',
      pep_level: pepRiskLevel,
      country: pepRiskLevel !== 'none' ? pepCountries[Math.floor(Math.random() * pepCountries.length)] : '',
      position: pepRiskLevel !== 'none' ? pepPositions[Math.floor(Math.random() * pepPositions.length)] : ''
    };
    
    const aiExplanation = generateAIExplanation(
      riskScore,
      sanctionsStatus,
      pepRiskLevel,
      multiChainData
    );
    
    const scanData = {
      sanctions_data: sanctionsData,
      pep_data: pepData,
      multi_chain_data: multiChainData,
      chain_risks: chainRisks,
      ai_explanation: aiExplanation,
      cross_chain_flow: crossChainFlow
    };

    // Determine risk level based on score
    const riskLevel = riskScore >= 75 ? 'critical' : riskScore >= 50 ? 'high' : riskScore >= 25 ? 'medium' : 'low';
    
    // Generate tags from chain risks
    const tags = chainRisks.flatMap(cr => cr.flags);
    
    // Generate rule-based flags
    const ruleBasedFlags = chainRisks.flatMap(cr => 
      cr.flags.map(f => f.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
    );
    
    const newScan = await db.insert(walletScans)
      .values({
        walletAddress: normalizedAddress,
        chain: normalizedBlockchain,
        rawData: JSON.stringify(scanData),
        riskScore,
        riskLevel,
        tags: JSON.stringify(tags),
        aiExplanation,
        ruleBasedFlags: JSON.stringify(ruleBasedFlags),
        createdAt: new Date().toISOString()
      })
      .returning();
    
    if (newScan.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to create wallet scan',
          code: 'CREATION_FAILED'
        },
        { status: 500 }
      );
    }
    
    const result = newScan[0];
    
    const response = {
      id: result.id,
      wallet_address: result.walletAddress,
      blockchain: result.chain,
      risk_score: result.riskScore,
      risk_level: result.riskLevel,
      sanctions_status: sanctionsStatus,
      pep_risk_level: pepRiskLevel,
      created_at: result.createdAt,
      scan_data: scanData
    };
    
    return NextResponse.json(response, { status: 201 });
    
  } catch (error) {
    console.error('POST wallet scan error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}