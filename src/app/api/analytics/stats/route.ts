import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { walletScans, protocolScans, nftScans, marketplaceScans, alerts, watchlist } from '@/db/schema';
import { sql, count, avg, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') ?? '30d';

    // Validate period parameter
    const validPeriods = ['7d', '30d', '90d'];
    if (!validPeriods.includes(period)) {
      return NextResponse.json({
        error: 'Invalid period. Must be one of: 7d, 30d, 90d',
        code: 'INVALID_PERIOD'
      }, { status: 400 });
    }

    // Calculate date range based on period
    const now = new Date();
    const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
    const daysAgo = daysMap[period as keyof typeof daysMap];
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const startDateISO = startDate.toISOString();

    // Query database for real counts
    const [walletScansCount] = await db
      .select({ count: count() })
      .from(walletScans)
      .where(sql`${walletScans.createdAt} >= ${startDateISO}`);

    const [protocolScansCount] = await db
      .select({ count: count() })
      .from(protocolScans)
      .where(sql`${protocolScans.createdAt} >= ${startDateISO}`);

    const [nftScansCount] = await db
      .select({ count: count() })
      .from(nftScans)
      .where(sql`${nftScans.createdAt} >= ${startDateISO}`);

    const [marketplaceScansCount] = await db
      .select({ count: count() })
      .from(marketplaceScans)
      .where(sql`${marketplaceScans.createdAt} >= ${startDateISO}`);

    // Get total alerts and count by severity
    const alertsData = await db
      .select({
        severity: alerts.severity,
        count: count()
      })
      .from(alerts)
      .where(sql`${alerts.createdAt} >= ${startDateISO}`)
      .groupBy(alerts.severity);

    const alertsBySeverity = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    let totalAlerts = 0;
    let criticalAlerts = 0;

    alertsData.forEach(alert => {
      const severity = alert.severity.toLowerCase();
      if (severity in alertsBySeverity) {
        alertsBySeverity[severity as keyof typeof alertsBySeverity] = alert.count;
        totalAlerts += alert.count;
        if (severity === 'critical') {
          criticalAlerts = alert.count;
        }
      }
    });

    // Get active watchlist count
    const [activeWatchlistCount] = await db
      .select({ count: count() })
      .from(watchlist)
      .where(eq(watchlist.isActive, true));

    // Calculate average risk scores from all scan types
    const [walletAvgRisk] = await db
      .select({ avg: avg(walletScans.riskScore) })
      .from(walletScans)
      .where(sql`${walletScans.createdAt} >= ${startDateISO}`);

    const [protocolAvgRisk] = await db
      .select({ avg: avg(protocolScans.riskScore) })
      .from(protocolScans)
      .where(sql`${protocolScans.createdAt} >= ${startDateISO}`);

    const [nftAvgRisk] = await db
      .select({ avg: avg(nftScans.riskScore) })
      .from(nftScans)
      .where(sql`${nftScans.createdAt} >= ${startDateISO}`);

    const [marketplaceAvgRisk] = await db
      .select({ avg: avg(marketplaceScans.riskScore) })
      .from(marketplaceScans)
      .where(sql`${marketplaceScans.createdAt} >= ${startDateISO}`);

    // Calculate combined average risk score
    const riskScores = [
      walletAvgRisk?.avg,
      protocolAvgRisk?.avg,
      nftAvgRisk?.avg,
      marketplaceAvgRisk?.avg
    ].filter(score => score !== null && score !== undefined);

    const avgRiskScore = riskScores.length > 0
      ? Math.round(riskScores.reduce((sum, score) => sum + Number(score), 0) / riskScores.length)
      : 0;

    // Count high risk entities (risk score >= 70)
    const [highRiskWallets] = await db
      .select({ count: count() })
      .from(walletScans)
      .where(sql`${walletScans.createdAt} >= ${startDateISO} AND ${walletScans.riskScore} >= 70`);

    const [highRiskProtocols] = await db
      .select({ count: count() })
      .from(protocolScans)
      .where(sql`${protocolScans.createdAt} >= ${startDateISO} AND ${protocolScans.riskScore} >= 70`);

    const [highRiskNfts] = await db
      .select({ count: count() })
      .from(nftScans)
      .where(sql`${nftScans.createdAt} >= ${startDateISO} AND ${nftScans.riskScore} >= 70`);

    const [highRiskMarketplaces] = await db
      .select({ count: count() })
      .from(marketplaceScans)
      .where(sql`${marketplaceScans.createdAt} >= ${startDateISO} AND ${marketplaceScans.riskScore} >= 70`);

    const highRiskEntities = (highRiskWallets?.count ?? 0) +
      (highRiskProtocols?.count ?? 0) +
      (highRiskNfts?.count ?? 0) +
      (highRiskMarketplaces?.count ?? 0);

    // Calculate total scans
    const wallet_scans = walletScansCount?.count ?? 0;
    const protocol_scans = protocolScansCount?.count ?? 0;
    const nft_scans = nftScansCount?.count ?? 0;
    const marketplace_scans = marketplaceScansCount?.count ?? 0;
    const total_scans = wallet_scans + protocol_scans + nft_scans + marketplace_scans;

    // Generate blockchain distribution (mock data based on total scans)
    const ethereumScans = Math.round(total_scans * 0.40);
    const remainingScans = total_scans - ethereumScans;
    const bitcoinScans = Math.round(remainingScans * 0.20);
    const polygonScans = Math.round(remainingScans * 0.25);
    const bscScans = Math.round(remainingScans * 0.30);
    const arbitrumScans = remainingScans - bitcoinScans - polygonScans - bscScans;

    const scans_by_blockchain = {
      ethereum: ethereumScans,
      bitcoin: bitcoinScans,
      polygon: polygonScans,
      bsc: bscScans,
      arbitrum: Math.max(0, arbitrumScans)
    };

    // Generate top risks based on period (mock data)
    const riskTypes = [
      { type: 'Suspicious Transactions', basePercentage: 0.25 },
      { type: 'Smart Contract Vulnerabilities', basePercentage: 0.20 },
      { type: 'Phishing Indicators', basePercentage: 0.18 },
      { type: 'High Risk Associations', basePercentage: 0.15 },
      { type: 'Unusual Activity Patterns', basePercentage: 0.12 },
      { type: 'Blacklisted Entities', basePercentage: 0.10 }
    ];

    const top_risks = riskTypes.map(risk => {
      const count = Math.round(total_scans * risk.basePercentage);
      const percentage = total_scans > 0 ? Math.round((count / total_scans) * 100) : 0;
      return {
        type: risk.type,
        count,
        percentage
      };
    }).sort((a, b) => b.count - a.count);

    // Build response
    const stats = {
      period,
      total_scans,
      wallet_scans,
      protocol_scans,
      nft_scans,
      marketplace_scans,
      total_alerts: totalAlerts,
      critical_alerts: criticalAlerts,
      active_watchlist: activeWatchlistCount?.count ?? 0,
      avg_risk_score: avgRiskScore,
      high_risk_entities: highRiskEntities,
      scans_by_blockchain,
      alerts_by_severity: alertsBySeverity,
      top_risks
    };

    return NextResponse.json(stats, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}