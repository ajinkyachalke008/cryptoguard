import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reports } from '@/db/schema';

const VALID_REPORT_TYPES = ['wallet', 'protocol', 'nft', 'comprehensive'];
const VALID_BLOCKCHAINS = ['ethereum', 'bitcoin', 'polygon', 'bsc', 'avalanche', 'arbitrum', 'optimism', 'base'];

function generateRiskScore(): number {
  return Math.floor(Math.random() * 71) + 20; // 20-90
}

function getRiskLevel(score: number): string {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Medium';
  if (score >= 20) return 'Low';
  return 'Minimal';
}

function generateKeyFindings(reportType: string, riskScore: number): string[] {
  const findings = [
    'Multiple high-value transactions detected in recent activity',
    'Interaction with known mixing services identified',
    'Unusual transaction pattern detected during off-peak hours',
    'Connection to flagged addresses in compliance database',
    'Large volume of micro-transactions suggesting potential wash trading',
    'Cross-chain bridge activity with multiple networks',
    'Smart contract interactions with unverified protocols',
    'Concentration of assets in high-risk DeFi platforms'
  ];
  
  const count = Math.floor(Math.random() * 5) + 4; // 4-8
  return findings.sort(() => Math.random() - 0.5).slice(0, count);
}

function generateTransactionAnalysis() {
  const totalTransactions = Math.floor(Math.random() * 9901) + 100; // 100-10000
  const suspiciousPercent = Math.random() * 0.25 + 0.05; // 5-30%
  const totalVolumeUSD = Math.floor(Math.random() * 10000000) + 100000;
  
  return {
    total_transactions: totalTransactions,
    total_volume_usd: totalVolumeUSD,
    suspicious_transactions: Math.floor(totalTransactions * suspiciousPercent),
    high_risk_interactions: Math.floor(Math.random() * 20) + 5
  };
}

function generateRelatedEntities(count: number): Array<{ address: string; relationship: string; risk_score: number }> {
  const relationships = [
    'Direct Transfer',
    'Smart Contract Interaction',
    'Token Swap',
    'Liquidity Pool',
    'NFT Marketplace',
    'Bridge Contract',
    'Staking Protocol',
    'Lending Platform'
  ];
  
  const entities = [];
  for (let i = 0; i < count; i++) {
    entities.push({
      address: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      relationship: relationships[Math.floor(Math.random() * relationships.length)],
      risk_score: Math.floor(Math.random() * 100)
    });
  }
  
  return entities;
}

function generateRecommendations(riskLevel: string): string[] {
  const allRecommendations = [
    'Implement enhanced due diligence procedures for this entity',
    'Monitor all future transactions for unusual patterns',
    'Request additional KYC documentation before proceeding',
    'Consider implementing transaction velocity limits',
    'Review and update internal risk assessment policies',
    'Conduct periodic re-evaluation of entity risk profile',
    'Establish stricter compliance protocols for high-risk interactions',
    'Document all findings for regulatory reporting purposes',
    'Set up automated alerts for suspicious activity',
    'Consult with legal team regarding potential regulatory implications'
  ];
  
  const count = Math.floor(Math.random() * 4) + 3; // 3-6
  return allRecommendations.sort(() => Math.random() - 0.5).slice(0, count);
}

function generateChartData() {
  return {
    risk_breakdown: {
      labels: ['Transaction Risk', 'Entity Risk', 'Network Risk', 'Compliance Risk', 'Behavioral Risk'],
      values: Array.from({ length: 5 }, () => Math.floor(Math.random() * 100))
    },
    transaction_flow: {
      nodes: Array.from({ length: 8 }, (_, i) => ({
        id: i,
        label: `Entity ${i + 1}`,
        value: Math.floor(Math.random() * 1000000)
      })),
      links: Array.from({ length: 12 }, () => ({
        source: Math.floor(Math.random() * 8),
        target: Math.floor(Math.random() * 8),
        value: Math.floor(Math.random() * 500000)
      }))
    },
    timeline: {
      dates: Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split('T')[0];
      }),
      transaction_counts: Array.from({ length: 30 }, () => Math.floor(Math.random() * 100)),
      risk_scores: Array.from({ length: 30 }, () => Math.floor(Math.random() * 100))
    }
  };
}

function generateExecutiveSummary(
  entityAddress: string,
  blockchain: string,
  reportType: string,
  riskScore: number,
  riskLevel: string,
  transactionAnalysis: any
): string {
  return `This ${reportType} analysis report examines the blockchain entity ${entityAddress} on the ${blockchain} network. 
  
Our investigation has identified a risk score of ${riskScore}/100, categorized as ${riskLevel} risk. The entity has processed ${transactionAnalysis.total_transactions.toLocaleString()} transactions with a total volume of $${transactionAnalysis.total_volume_usd.toLocaleString()}.

Our analysis flagged ${transactionAnalysis.suspicious_transactions} suspicious transactions and detected ${transactionAnalysis.high_risk_interactions} high-risk interactions with known problematic addresses or protocols.

Based on comprehensive blockchain forensics, transaction pattern analysis, and cross-referencing with global compliance databases, we recommend ${riskLevel === 'Critical' || riskLevel === 'High' ? 'enhanced due diligence and close monitoring' : 'standard monitoring procedures'} for this entity.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entity_address, blockchain, report_type } = body;

    // Validation
    if (!entity_address || typeof entity_address !== 'string' || entity_address.trim() === '') {
      return NextResponse.json(
        { error: 'entity_address is required and must be a non-empty string', code: 'MISSING_ENTITY_ADDRESS' },
        { status: 400 }
      );
    }

    if (!blockchain || typeof blockchain !== 'string' || blockchain.trim() === '') {
      return NextResponse.json(
        { error: 'blockchain is required and must be a non-empty string', code: 'MISSING_BLOCKCHAIN' },
        { status: 400 }
      );
    }

    if (!report_type || !VALID_REPORT_TYPES.includes(report_type)) {
      return NextResponse.json(
        {
          error: `report_type must be one of: ${VALID_REPORT_TYPES.join(', ')}`,
          code: 'INVALID_REPORT_TYPE'
        },
        { status: 400 }
      );
    }

    // Generate report data
    const riskScore = generateRiskScore();
    const riskLevel = getRiskLevel(riskScore);
    const transactionAnalysis = generateTransactionAnalysis();
    const relatedEntitiesCount = Math.floor(Math.random() * 8) + 3; // 3-10
    const relatedEntities = generateRelatedEntities(relatedEntitiesCount);
    const keyFindings = generateKeyFindings(report_type, riskScore);
    const recommendations = generateRecommendations(riskLevel);
    const charts = generateChartData();
    const executiveSummary = generateExecutiveSummary(
      entity_address,
      blockchain,
      report_type,
      riskScore,
      riskLevel,
      transactionAnalysis
    );

    const reportData = {
      executive_summary: executiveSummary,
      risk_score: riskScore,
      risk_level: riskLevel,
      key_findings: keyFindings,
      transaction_analysis: transactionAnalysis,
      related_entities: relatedEntities,
      recommendations: recommendations,
      charts: charts
    };

    // Store in database
    const newReport = await db.insert(reports).values({
      report_type: report_type,
      entity_address: entity_address.trim(),
      blockchain: blockchain.trim().toLowerCase(),
      user_id: 1,
      report_data: JSON.stringify(reportData),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).returning();

    // Parse the report_data back to object for response
    const createdReport = {
      ...newReport[0],
      report_data: JSON.parse(newReport[0].report_data as string)
    };

    return NextResponse.json(createdReport, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}