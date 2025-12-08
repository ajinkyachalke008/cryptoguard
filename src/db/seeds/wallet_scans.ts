import { db } from '@/db';
import { walletScans } from '@/db/schema';

async function main() {
    const sampleWalletScans = [
        {
            userId: 1,
            walletAddress: '0x742d35cc6634c0532925a3b844bc9e7595f0beb1',
            chain: 'eth',
            rawData: {
                balance: "15.3 ETH",
                tx_count: 342,
                first_tx: "2022-03-15",
                last_tx: "2024-01-28",
                contract_interactions: 45,
                token_holdings: ["USDT", "USDC", "DAI"]
            },
            riskScore: 12,
            riskLevel: 'low',
            tags: ["high-value", "defi", "whale"],
            aiExplanation: "This wallet shows patterns of legitimate DeFi trading with multiple established protocols. The wallet has a long history of consistent activity across major platforms like Uniswap and Aave. No suspicious patterns or red flags detected. The high transaction volume is consistent with an experienced trader.",
            ruleBasedFlags: ["high_volume", "defi_user"],
            createdAt: new Date('2024-01-15T10:30:00Z').toISOString(),
        },
        {
            userId: 2,
            walletAddress: '0x8576acc5c05d6ce88f4e49bf65bdf0c62f91353c',
            chain: 'bsc',
            rawData: {
                balance: "0.8 BNB",
                tx_count: 89,
                first_tx: "2023-11-20",
                last_tx: "2024-01-20",
                contract_interactions: 12,
                token_holdings: ["BUSD", "CAKE"]
            },
            riskScore: 35,
            riskLevel: 'medium',
            tags: ["new-wallet", "rapid-accumulation"],
            aiExplanation: "Moderate risk detected due to relatively new wallet age combined with rapid accumulation of funds. The wallet shows interaction with multiple yield farming protocols in a short timeframe. While not necessarily malicious, this pattern warrants monitoring. Consider verifying the source of initial funds.",
            ruleBasedFlags: ["new_wallet", "rapid_accumulation", "yield_farming"],
            createdAt: new Date('2024-01-18T14:22:00Z').toISOString(),
        },
        {
            userId: 1,
            walletAddress: '0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be',
            chain: 'eth',
            rawData: {
                balance: "2.1 ETH",
                tx_count: 156,
                first_tx: "2023-06-10",
                last_tx: "2024-01-25",
                contract_interactions: 28,
                tornado_cash_interactions: 3
            },
            riskScore: 68,
            riskLevel: 'high',
            tags: ["mixer", "privacy-focused", "suspicious"],
            aiExplanation: "HIGH RISK: This wallet has documented interactions with Tornado Cash mixer service on three separate occasions. While privacy tools have legitimate uses, mixer usage combined with irregular transaction patterns raises significant concerns. The wallet also shows connections to addresses flagged in previous investigations. Recommend enhanced due diligence before any interaction.",
            ruleBasedFlags: ["mixer_interaction", "tornado_cash", "irregular_patterns"],
            createdAt: new Date('2024-01-22T09:15:00Z').toISOString(),
        },
        {
            userId: 3,
            walletAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            chain: 'polygon',
            rawData: {
                balance: "450 MATIC",
                tx_count: 1243,
                first_tx: "2021-08-05",
                last_tx: "2024-01-27",
                contract_interactions: 234,
                exchange_deposits: 45
            },
            riskScore: 8,
            riskLevel: 'low',
            tags: ["exchange", "institutional", "verified"],
            aiExplanation: "This wallet demonstrates clear institutional trading patterns with regular deposits to major centralized exchanges. The transaction history shows consistent behavior over an extended period with no anomalies. The wallet appears to be associated with a legitimate trading operation. Risk assessment: MINIMAL.",
            ruleBasedFlags: ["exchange_user", "high_frequency"],
            createdAt: new Date('2024-01-10T16:45:00Z').toISOString(),
        },
        {
            userId: 4,
            walletAddress: '0x1e0049783f008a0085193e00003d00cd54003c71',
            chain: 'eth',
            rawData: {
                balance: "0.03 ETH",
                tx_count: 23,
                first_tx: "2024-01-05",
                last_tx: "2024-01-23",
                phishing_connections: 5,
                known_scam_interactions: 2
            },
            riskScore: 92,
            riskLevel: 'critical',
            tags: ["phishing", "scam", "dangerous"],
            aiExplanation: "CRITICAL ALERT: This wallet has direct connections to multiple confirmed phishing campaigns and known scam operations. Transaction analysis reveals patterns consistent with wallet drainer attacks. The address has been flagged by multiple security platforms. DO NOT INTERACT - Exercise extreme caution and report any suspicious activity immediately.",
            ruleBasedFlags: ["phishing_connection", "scam_interaction", "malicious_contract"],
            createdAt: new Date('2024-01-20T11:30:00Z').toISOString(),
        },
        {
            userId: 2,
            walletAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
            chain: 'bsc',
            rawData: {
                balance: "125 BNB",
                tx_count: 567,
                first_tx: "2022-09-15",
                last_tx: "2024-01-26",
                contract_interactions: 89,
                nft_trades: 34
            },
            riskScore: 22,
            riskLevel: 'low',
            tags: ["nft-trader", "defi", "active"],
            aiExplanation: "Active trader with balanced portfolio across DeFi and NFT markets. The wallet shows consistent engagement with reputable platforms and marketplaces. Transaction patterns indicate an experienced user with good security practices. Minor risk factors include some interaction with newer protocols, but overall profile suggests legitimate activity.",
            ruleBasedFlags: ["active_trader", "nft_activity"],
            createdAt: new Date('2024-01-12T13:20:00Z').toISOString(),
        },
        {
            userId: 5,
            walletAddress: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
            chain: 'polygon',
            rawData: {
                balance: "8.7 MATIC",
                tx_count: 445,
                first_tx: "2023-02-20",
                last_tx: "2024-01-24",
                sanctioned_connections: 1,
                high_risk_jurisdictions: true
            },
            riskScore: 78,
            riskLevel: 'critical',
            tags: ["sanctioned", "compliance-risk", "blocked"],
            aiExplanation: "CRITICAL COMPLIANCE RISK: This wallet has been identified with connections to sanctioned entities and addresses from high-risk jurisdictions. The blockchain forensics reveal fund flows that intersect with OFAC-sanctioned addresses. Immediate compliance review required. Any transaction with this wallet may violate sanctions regulations.",
            ruleBasedFlags: ["sanctioned_entity", "ofac_match", "compliance_risk"],
            createdAt: new Date('2024-01-16T08:55:00Z').toISOString(),
        },
        {
            userId: 3,
            walletAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
            chain: 'eth',
            rawData: {
                balance: "234.5 ETH",
                tx_count: 2156,
                first_tx: "2020-05-10",
                last_tx: "2024-01-29",
                contract_interactions: 456,
                smart_contract_deployments: 12
            },
            riskScore: 15,
            riskLevel: 'low',
            tags: ["developer", "smart-contract", "whale"],
            aiExplanation: "This wallet belongs to an active smart contract developer with extensive on-chain history. Multiple contract deployments show consistent development activity. The wallet interacts primarily with development tools, test networks, and established DeFi protocols. Profile indicates a sophisticated user with strong technical knowledge. Risk level: LOW.",
            ruleBasedFlags: ["contract_deployer", "developer_wallet"],
            createdAt: new Date('2024-01-08T15:40:00Z').toISOString(),
        },
        {
            userId: 4,
            walletAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            chain: 'eth',
            rawData: {
                balance: "5.2 ETH",
                tx_count: 178,
                first_tx: "2023-08-12",
                last_tx: "2024-01-21",
                contract_interactions: 34,
                mev_bot_activity: true
            },
            riskScore: 45,
            riskLevel: 'medium',
            tags: ["mev-bot", "automated", "high-frequency"],
            aiExplanation: "Moderate risk detected due to MEV (Maximal Extractable Value) bot activity patterns. The wallet shows automated high-frequency trading behavior typical of arbitrage bots. While not inherently malicious, MEV activities can impact network congestion and transaction ordering. The bot appears to be operating within normal parameters but requires monitoring for any aggressive or predatory behavior.",
            ruleBasedFlags: ["mev_activity", "bot_detected", "high_frequency"],
            createdAt: new Date('2024-01-14T12:10:00Z').toISOString(),
        },
        {
            userId: 1,
            walletAddress: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce',
            chain: 'bsc',
            rawData: {
                balance: "1250 BNB",
                tx_count: 89,
                first_tx: "2023-12-01",
                last_tx: "2024-01-19",
                large_transfers: 15,
                suspicious_timing: true
            },
            riskScore: 58,
            riskLevel: 'high',
            tags: ["suspicious-timing", "large-transfers", "monitoring-required"],
            aiExplanation: "HIGH RISK: Analysis reveals suspicious transaction timing patterns that correlate with known market manipulation events. The wallet has received multiple large transfers from addresses with questionable origins. While not definitively malicious, the combination of new wallet age, large fund movements, and timing anomalies suggests potential wash trading or market manipulation. Recommend close monitoring and enhanced verification.",
            ruleBasedFlags: ["suspicious_timing", "large_transfers", "market_manipulation_pattern"],
            createdAt: new Date('2024-01-25T17:25:00Z').toISOString(),
        },
    ];

    await db.insert(walletScans).values(sampleWalletScans);
    
    console.log('✅ Wallet scans seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});