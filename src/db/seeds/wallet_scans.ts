import { db } from '@/db';
import { walletScans } from '@/db/schema';

async function main() {
    const sampleWalletScans = [
        {
            userId: 1,
            walletAddress: '0x742d35cc6634c0532925a3b844bc9e7595f0beb1',
            chain: 'eth',
            rawData: JSON.stringify({
                balance: "1.5 ETH",
                tx_count: 247,
                first_tx: "2023-01-15",
                last_tx: "2024-01-10",
                token_holdings: ["USDT", "USDC", "DAI"],
                defi_protocols: ["Uniswap", "Aave"]
            }),
            riskScore: 15,
            riskLevel: 'low',
            tags: JSON.stringify(["high-value", "exchange", "defi"]),
            aiExplanation: 'This wallet shows patterns of high-frequency trading with multiple DeFi protocols. No red flags detected. Active participation in legitimate exchanges and decentralized protocols indicates normal trading behavior.',
            ruleBasedFlags: JSON.stringify(["high_volume", "exchange_interaction"]),
            createdAt: new Date('2024-01-15T10:30:00Z').toISOString(),
        },
        {
            userId: 2,
            walletAddress: '0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be',
            chain: 'eth',
            rawData: JSON.stringify({
                balance: "0.05 ETH",
                tx_count: 1847,
                first_tx: "2022-08-20",
                last_tx: "2024-01-18",
                mixer_interactions: ["Tornado Cash"],
                suspicious_patterns: true
            }),
            riskScore: 82,
            riskLevel: 'critical',
            tags: JSON.stringify(["mixer", "suspicious", "high-risk"]),
            aiExplanation: 'ALERT: This wallet has direct connections to known mixing services including Tornado Cash. Multiple interactions with sanctioned entities detected. Exercise extreme caution when dealing with this address.',
            ruleBasedFlags: JSON.stringify(["mixer_interaction", "sanctioned_entity", "privacy_tool"]),
            createdAt: new Date('2024-01-18T14:22:00Z').toISOString(),
        },
        {
            userId: 3,
            walletAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            chain: 'eth',
            rawData: JSON.stringify({
                balance: "125.8 ETH",
                tx_count: 89,
                first_tx: "2023-11-05",
                last_tx: "2024-01-20",
                whale_status: true,
                large_transfers: ["50 ETH", "45 ETH", "30 ETH"]
            }),
            riskScore: 35,
            riskLevel: 'medium',
            tags: JSON.stringify(["whale", "defi", "high-value"]),
            aiExplanation: 'Moderate risk detected due to whale-sized holdings and rapid accumulation patterns. While no direct malicious activity found, the large balance and frequency of transactions warrant monitoring.',
            ruleBasedFlags: JSON.stringify(["whale_wallet", "rapid_accumulation", "large_balance"]),
            createdAt: new Date('2024-01-20T09:15:00Z').toISOString(),
        },
        {
            userId: 1,
            walletAddress: '0x1e0447b19bb6ecfdae1e4ae1694b0c3659614e4e',
            chain: 'bsc',
            rawData: JSON.stringify({
                balance: "2.3 BNB",
                tx_count: 156,
                first_tx: "2023-10-12",
                last_tx: "2024-01-19",
                pancakeswap_activity: true,
                token_swaps: 142
            }),
            riskScore: 22,
            riskLevel: 'low',
            tags: JSON.stringify(["dex-trader", "pancakeswap", "active"]),
            aiExplanation: 'This wallet demonstrates regular DeFi trading activity on PancakeSwap with no suspicious patterns. Transaction history shows consistent small to medium-sized swaps typical of a retail trader.',
            ruleBasedFlags: JSON.stringify(["dex_interaction", "frequent_trader"]),
            createdAt: new Date('2024-01-19T16:45:00Z').toISOString(),
        },
        {
            userId: 4,
            walletAddress: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
            chain: 'polygon',
            rawData: JSON.stringify({
                balance: "450.2 MATIC",
                tx_count: 12,
                first_tx: "2024-01-05",
                last_tx: "2024-01-21",
                new_wallet: true,
                rapid_growth: true
            }),
            riskScore: 58,
            riskLevel: 'high',
            tags: JSON.stringify(["new-wallet", "rapid-accumulation", "unverified"]),
            aiExplanation: 'High risk assessment due to wallet age and rapid accumulation of funds. New wallet created less than a month ago with significant balance growth raises concerns about potential money laundering or fraud preparation.',
            ruleBasedFlags: JSON.stringify(["new_wallet", "rapid_accumulation", "large_inflow"]),
            createdAt: new Date('2024-01-21T11:30:00Z').toISOString(),
        },
        {
            userId: 5,
            walletAddress: '0x5a46e8c32baf8b0a63c696d1c0f4f86a92c35e2d',
            chain: 'eth',
            rawData: JSON.stringify({
                balance: "0.002 ETH",
                tx_count: 2847,
                first_tx: "2021-03-15",
                last_tx: "2024-01-22",
                phishing_links: ["confirmed"],
                scam_reports: 34
            }),
            riskScore: 95,
            riskLevel: 'critical',
            tags: JSON.stringify(["phishing", "scam", "blacklisted"]),
            aiExplanation: 'CRITICAL ALERT: This wallet has been identified in multiple phishing campaigns and has 34 confirmed scam reports. Direct connections to known fraud operations detected. DO NOT INTERACT under any circumstances.',
            ruleBasedFlags: JSON.stringify(["phishing_confirmed", "scam_reports", "blacklisted", "fraud_network"]),
            createdAt: new Date('2024-01-22T08:00:00Z').toISOString(),
        },
        {
            userId: 2,
            walletAddress: '0x8b3192f5eebd8579568a2ed41e6feb402f93f73f',
            chain: 'bsc',
            rawData: JSON.stringify({
                balance: "8.7 BNB",
                tx_count: 423,
                first_tx: "2023-05-20",
                last_tx: "2024-01-17",
                contract_interactions: ["verified_contracts_only"],
                defi_protocols: ["Venus", "PancakeSwap"]
            }),
            riskScore: 8,
            riskLevel: 'low',
            tags: JSON.stringify(["verified", "defi-user", "safe"]),
            aiExplanation: 'Low risk profile with consistent interaction with verified smart contracts and established DeFi protocols. Transaction patterns indicate experienced user following best security practices.',
            ruleBasedFlags: JSON.stringify(["verified_contracts", "established_user"]),
            createdAt: new Date('2024-01-17T13:20:00Z').toISOString(),
        },
        {
            userId: 3,
            walletAddress: '0x2f62f2b4c5fcd7570a709dec05d68ea19c82a9ac',
            chain: 'polygon',
            rawData: JSON.stringify({
                balance: "12.5 MATIC",
                tx_count: 678,
                first_tx: "2023-07-10",
                last_tx: "2024-01-23",
                nft_trading: true,
                opensea_activity: 234
            }),
            riskScore: 42,
            riskLevel: 'medium',
            tags: JSON.stringify(["nft-trader", "opensea", "moderate-risk"]),
            aiExplanation: 'Moderate risk detected due to high-frequency NFT trading activity. Some interactions with unverified NFT contracts noted. While not explicitly malicious, the activity pattern suggests exposure to potential scam NFT projects.',
            ruleBasedFlags: JSON.stringify(["nft_trader", "unverified_contracts", "high_frequency"]),
            createdAt: new Date('2024-01-23T15:10:00Z').toISOString(),
        },
        {
            userId: 4,
            walletAddress: '0xbe0eb53f46cd790cd13851d5eff43d12404d33e8',
            chain: 'eth',
            rawData: JSON.stringify({
                balance: "35.4 ETH",
                tx_count: 1256,
                first_tx: "2022-01-08",
                last_tx: "2024-01-16",
                lending_protocols: ["Compound", "Aave", "MakerDAO"],
                stable_activity: true
            }),
            riskScore: 12,
            riskLevel: 'low',
            tags: JSON.stringify(["defi", "lending", "established", "whale"]),
            aiExplanation: 'This wallet shows patterns of sophisticated DeFi usage with focus on lending protocols. Long transaction history with established protocols and no suspicious activity. Strong security profile.',
            ruleBasedFlags: JSON.stringify(["established_user", "verified_protocols", "low_risk"]),
            createdAt: new Date('2024-01-16T10:00:00Z').toISOString(),
        },
        {
            userId: 5,
            walletAddress: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
            chain: 'bsc',
            rawData: JSON.stringify({
                balance: "1.2 BNB",
                tx_count: 89,
                first_tx: "2023-12-01",
                last_tx: "2024-01-14",
                rug_pull_victim: true,
                lost_funds: "0.8 BNB"
            }),
            riskScore: 68,
            riskLevel: 'high',
            tags: JSON.stringify(["victim", "rug-pull", "compromised"]),
            aiExplanation: 'High risk assessment due to previous interaction with confirmed rug pull project. Wallet shows signs of potential compromise with unusual transaction patterns post-incident. Recommend security audit and wallet migration.',
            ruleBasedFlags: JSON.stringify(["rug_pull_victim", "suspicious_activity", "potential_compromise"]),
            createdAt: new Date('2024-01-14T12:40:00Z').toISOString(),
        },
    ];

    await db.insert(walletScans).values(sampleWalletScans);
    
    console.log('✅ Wallet scans seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});