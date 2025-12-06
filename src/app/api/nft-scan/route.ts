import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// Define nft_scans table inline since it's not in the provided schema
const nftScans = sqliteTable('nft_scans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  collectionName: text('collection_name').notNull(),
  contractAddress: text('contract_address').notNull(),
  blockchain: text('blockchain').notNull(),
  riskScore: integer('risk_score').notNull(),
  washTradingLevel: text('wash_trading_level').notNull(),
  fakeVolumeRatio: text('fake_volume_ratio').notNull(),
  scanData: text('scan_data').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { collection_name, contract_address, blockchain } = body;

    // Validation
    if (!collection_name) {
      return NextResponse.json({
        error: 'collection_name is required',
        code: 'MISSING_COLLECTION_NAME'
      }, { status: 400 });
    }

    if (!contract_address) {
      return NextResponse.json({
        error: 'contract_address is required',
        code: 'MISSING_CONTRACT_ADDRESS'
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedCollectionName = collection_name.trim();
    const sanitizedContractAddress = contract_address.trim().toLowerCase();
    const sanitizedBlockchain = (blockchain || 'ethereum').trim().toLowerCase();

    // Generate mock risk score (10-85)
    const riskScore = Math.floor(Math.random() * 76) + 10;

    // Determine wash trading level (30% have medium/high)
    const washTradingRandom = Math.random();
    let washTradingLevel: string;
    let washTradingDetected: boolean;
    let washTradingVolumePercentage: number;

    if (washTradingRandom < 0.35) {
      washTradingLevel = 'none';
      washTradingDetected = false;
      washTradingVolumePercentage = 0;
    } else if (washTradingRandom < 0.70) {
      washTradingLevel = 'low';
      washTradingDetected = true;
      washTradingVolumePercentage = Math.floor(Math.random() * 15) + 1;
    } else if (washTradingRandom < 0.85) {
      washTradingLevel = 'medium';
      washTradingDetected = true;
      washTradingVolumePercentage = Math.floor(Math.random() * 25) + 15;
    } else {
      washTradingLevel = 'high';
      washTradingDetected = true;
      washTradingVolumePercentage = Math.floor(Math.random() * 40) + 40;
    }

    // Generate fake volume data (5-60% for risky collections)
    const fakePercentage = riskScore > 40 
      ? Math.floor(Math.random() * 56) + 5 
      : Math.floor(Math.random() * 10) + 1;
    
    const totalVolumeUsd = Math.floor(Math.random() * 10000000) + 100000;
    const fakeVolumeUsd = Math.floor(totalVolumeUsd * (fakePercentage / 100));
    const realVolumeUsd = totalVolumeUsd - fakeVolumeUsd;
    const manipulationScore = Math.floor((fakePercentage / 60) * 100);

    const fakeVolumeRatio = `${fakePercentage}%`;

    // Generate marketplace data
    const allMarketplaces = ['OpenSea', 'Blur', 'LooksRare', 'X2Y2'];
    const marketplaceCount = Math.floor(Math.random() * 4) + 1;
    const shuffled = [...allMarketplaces].sort(() => Math.random() - 0.5);
    const listedOn = shuffled.slice(0, marketplaceCount);

    const floorPriceUsd = Math.floor(Math.random() * 49990) + 10;
    const holderCount = Math.floor(Math.random() * 49900) + 100;
    const uniqueTraders = Math.floor(holderCount * (0.3 + Math.random() * 0.5));

    // Generate suspicious patterns
    const possiblePatterns = [
      'Circular trading between related wallets',
      'Rapid buy-sell cycles within minutes',
      'Identical transaction amounts across multiple trades',
      'High frequency trading from new wallets',
      'Price manipulation through coordinated buying',
      'Volume spikes during low liquidity periods',
      'Wash trading ring of 5+ connected addresses'
    ];
    
    const patternCount = washTradingDetected ? Math.floor(Math.random() * 3) + 1 : 0;
    const patterns = possiblePatterns
      .sort(() => Math.random() - 0.5)
      .slice(0, patternCount);

    const suspiciousWallets = washTradingDetected 
      ? Math.floor(Math.random() * 50) + 5 
      : 0;

    // Generate AI explanation
    let aiExplanation = '';
    if (riskScore < 30) {
      aiExplanation = `This collection shows minimal risk indicators with a score of ${riskScore}/100. Trading patterns appear organic with healthy holder distribution across ${holderCount} wallets. The marketplace presence on ${listedOn.join(', ')} demonstrates legitimate market interest. Volume analysis shows only ${fakePercentage}% potentially inflated activity, which is within normal market variance.`;
    } else if (riskScore < 60) {
      aiExplanation = `Moderate risk detected (${riskScore}/100) for this collection. Analysis reveals ${washTradingLevel} wash trading activity affecting approximately ${washTradingVolumePercentage}% of volume. We identified ${suspiciousWallets} wallets exhibiting suspicious trading patterns. While ${listedOn.length} major marketplaces list this collection, ${fakePercentage}% of trading volume appears artificially inflated. Exercise caution and conduct additional research before investing.`;
    } else {
      aiExplanation = `HIGH RISK ALERT (${riskScore}/100): This collection exhibits significant red flags. Our analysis detected ${washTradingLevel} levels of wash trading with ${washTradingVolumePercentage}% of volume being artificial. ${suspiciousWallets} suspicious wallets are engaged in coordinated manipulation. Approximately ${fakePercentage}% of reported volume is fake, indicating systematic market manipulation. Patterns detected: ${patterns.join(', ')}. We strongly advise avoiding this collection until these concerns are addressed.`;
    }

    // Build scan_data object
    const scanData = {
      wash_trading_data: {
        detected: washTradingDetected,
        volume_percentage: washTradingVolumePercentage,
        suspicious_wallets: suspiciousWallets,
        patterns: patterns
      },
      fake_volume_data: {
        real_volume_usd: realVolumeUsd,
        fake_volume_usd: fakeVolumeUsd,
        fake_percentage: fakePercentage,
        manipulation_score: manipulationScore
      },
      marketplace_data: {
        listed_on: listedOn,
        floor_price_usd: floorPriceUsd,
        total_volume_usd: totalVolumeUsd,
        holder_count: holderCount,
        unique_traders: uniqueTraders
      },
      ai_explanation: aiExplanation
    };

    // Insert into database
    const timestamp = new Date().toISOString();
    const newScan = await db.insert(nftScans)
      .values({
        userId: 1,
        collectionName: sanitizedCollectionName,
        contractAddress: sanitizedContractAddress,
        blockchain: sanitizedBlockchain,
        riskScore: riskScore,
        washTradingLevel: washTradingLevel,
        fakeVolumeRatio: fakeVolumeRatio,
        scanData: JSON.stringify(scanData),
        createdAt: timestamp,
        updatedAt: timestamp
      })
      .returning();

    // Format response
    const response = {
      id: newScan[0].id,
      collection_name: newScan[0].collectionName,
      contract_address: newScan[0].contractAddress,
      blockchain: newScan[0].blockchain,
      risk_score: newScan[0].riskScore,
      wash_trading_level: newScan[0].washTradingLevel,
      fake_volume_ratio: newScan[0].fakeVolumeRatio,
      created_at: newScan[0].createdAt,
      scan_data: scanData
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}