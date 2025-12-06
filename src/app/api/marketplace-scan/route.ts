import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// Define marketplace_scans table schema
const marketplaceScans = sqliteTable('marketplace_scans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  marketplaceName: text('marketplace_name').notNull(),
  riskScore: integer('risk_score').notNull(),
  marketplaceRiskLabel: text('marketplace_risk_label').notNull(),
  scanData: text('scan_data').notNull(),
  createdAt: text('created_at').notNull(),
});

// Helper function to generate risk label based on score
function getRiskLabel(score: number): 'safe' | 'caution' | 'risky' | 'dangerous' {
  if (score < 30) return 'safe';
  if (score < 50) return 'caution';
  if (score < 70) return 'risky';
  return 'dangerous';
}

// Helper function to generate random number within range
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to generate random decimal
function randomDecimal(min: number, max: number, decimals: number = 1): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

// Helper function to select random items from array
function selectRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { marketplace_name } = body;

    // Validation: Require marketplace_name
    if (!marketplace_name) {
      return NextResponse.json({
        error: 'marketplace_name is required',
        code: 'MISSING_REQUIRED_FIELD'
      }, { status: 400 });
    }

    // Validate marketplace_name is a string and not empty
    if (typeof marketplace_name !== 'string' || marketplace_name.trim() === '') {
      return NextResponse.json({
        error: 'marketplace_name must be a non-empty string',
        code: 'INVALID_MARKETPLACE_NAME'
      }, { status: 400 });
    }

    // Generate mock risk score (15-75)
    const riskScore = randomInRange(15, 75);
    const riskLabel = getRiskLabel(riskScore);

    // Generate marketplace data based on risk level
    const isVerified = Math.random() < 0.6; // 60% verified
    const isLowRisk = riskScore < 50;

    // Reputation score based on risk level
    const reputationScore = isLowRisk 
      ? randomInRange(60, 98) 
      : randomInRange(30, 60);

    // Scam reports (lower for safer marketplaces)
    const scamReports = isLowRisk 
      ? randomInRange(0, 10) 
      : randomInRange(10, 50);

    // User complaints (proportional to risk)
    const userComplaints = isLowRisk 
      ? randomInRange(0, 20) 
      : randomInRange(20, 100);

    // Uptime percentage (95-99.9%)
    const uptimePercentage = randomDecimal(95, 99.9, 2);

    // Available security features
    const allSecurityFeatures = [
      '2FA Authentication',
      'Escrow Service',
      'Dispute Resolution',
      'Insurance Coverage',
      'Identity Verification',
      'Transaction Monitoring',
      'Multi-signature Wallets',
      'Cold Storage',
      'SSL Encryption',
      'DDoS Protection',
      'Bug Bounty Program',
      'Security Audits'
    ];

    // Select security features (more for safer marketplaces)
    const securityFeatureCount = isLowRisk 
      ? randomInRange(5, 8) 
      : randomInRange(2, 5);
    const securityFeatures = selectRandomItems(allSecurityFeatures, securityFeatureCount);

    // Available blockchain networks
    const allChains = [
      'Ethereum',
      'Bitcoin',
      'Binance Smart Chain',
      'Polygon',
      'Solana',
      'Avalanche',
      'Arbitrum',
      'Optimism',
      'Fantom',
      'Cardano',
      'Polkadot',
      'Cosmos'
    ];

    // Select supported chains (1-10)
    const chainCount = randomInRange(1, 10);
    const supportedChains = selectRandomItems(allChains, chainCount);

    // Generate AI explanation based on risk level
    const aiExplanations = {
      safe: `${marketplace_name} demonstrates strong security practices with a reputation score of ${reputationScore}/100 and ${securityFeatures.length} security features implemented. The marketplace shows minimal scam reports (${scamReports}) and maintains excellent uptime (${uptimePercentage}%). ${isVerified ? 'The platform is verified and requires KYC,' : 'While not verified,'} it has established trust within the community with low user complaints (${userComplaints}). Supports ${supportedChains.length} blockchain networks, indicating robust infrastructure.`,
      caution: `${marketplace_name} shows moderate risk indicators with a reputation score of ${reputationScore}/100. While the platform maintains good uptime (${uptimePercentage}%), there are ${scamReports} scam reports and ${userComplaints} user complaints on record. ${isVerified ? 'The marketplace is verified, which adds credibility,' : 'The lack of verification raises some concerns,'} but ${securityFeatures.length} security features are in place. Exercise caution and conduct thorough due diligence before transacting on this platform.`,
      risky: `${marketplace_name} presents elevated risk with a reputation score of only ${reputationScore}/100. The platform has ${scamReports} scam reports and ${userComplaints} user complaints, which is concerning. ${isVerified ? 'Despite being verified,' : 'The marketplace lacks verification and'} only ${securityFeatures.length} security features are implemented. Uptime is ${uptimePercentage}%, but the high number of complaints suggests potential operational issues. Strongly recommend caution and using alternative platforms if possible.`,
      dangerous: `${marketplace_name} exhibits high-risk characteristics with a poor reputation score of ${reputationScore}/100. Critical concerns include ${scamReports} scam reports and ${userComplaints} user complaints. ${isVerified ? 'Even with verification,' : 'Without proper verification,'} the marketplace shows only ${securityFeatures.length} security features, which is insufficient for safe trading. We strongly advise against using this platform. Consider well-established alternatives with better security track records and community trust.`
    };

    const aiExplanation = aiExplanations[riskLabel];

    // Construct scan_data object
    const scanData = {
      marketplace_data: {
        reputation_score: reputationScore,
        verified: isVerified,
        kyc_required: isVerified && Math.random() < 0.8, // 80% of verified require KYC
        scam_reports: scamReports,
        user_complaints: userComplaints,
        uptime_percentage: uptimePercentage,
        security_features: securityFeatures,
        supported_chains: supportedChains
      },
      ai_explanation: aiExplanation
    };

    // Insert into database with user_id = 1
    const createdAt = new Date().toISOString();
    
    const newScan = await db.insert(marketplaceScans)
      .values({
        userId: 1,
        marketplaceName: marketplace_name.trim(),
        riskScore: riskScore,
        marketplaceRiskLabel: riskLabel,
        scanData: JSON.stringify(scanData),
        createdAt: createdAt
      })
      .returning();

    if (newScan.length === 0) {
      throw new Error('Failed to create marketplace scan');
    }

    // Parse the stored scan_data back to object for response
    const createdScan = newScan[0];
    const parsedScanData = JSON.parse(createdScan.scanData);

    // Construct response
    const response = {
      id: createdScan.id,
      marketplace_name: createdScan.marketplaceName,
      risk_score: createdScan.riskScore,
      marketplace_risk_label: createdScan.marketplaceRiskLabel as 'safe' | 'caution' | 'risky' | 'dangerous',
      created_at: createdScan.createdAt,
      scan_data: parsedScanData
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}