import { db } from '@/db';
import { transactionScans } from '@/db/schema';

async function main() {
    const sampleTransactionScans = [
        {
            userId: 1,
            txHash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f',
            chain: 'eth',
            rawData: {
                value: '10.5 ETH',
                gas_used: 21000,
                from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
                to: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
                block: 18234567,
                status: 'success'
            },
            riskScore: 15,
            riskLevel: 'low',
            tags: ['large_transfer', 'bridge'],
            aiExplanation: 'Standard token transfer between wallets. No suspicious activity detected.',
            ruleBasedFlags: ['large_value'],
            createdAt: new Date('2024-12-15T10:30:00Z').toISOString(),
        },
        {
            userId: 2,
            txHash: '0x9f8e7d6c5b4a3210fedcba9876543210fedcba9876543210fedcba9876543210',
            chain: 'bsc',
            rawData: {
                value: '250.0 BNB',
                gas_used: 95000,
                from: '0x123abc456def789ghi012jkl345mno678pqr901st',
                to: '0xdEaD000000000000000000000000000000000000',
                block: 34567890,
                status: 'success'
            },
            riskScore: 85,
            riskLevel: 'critical',
            tags: ['flash_loan', 'suspicious'],
            aiExplanation: 'WARNING: This transaction involves a smart contract with known vulnerabilities. High risk of exploit.',
            ruleBasedFlags: ['smart_contract_risk', 'rapid_execution'],
            createdAt: new Date('2024-12-18T14:22:00Z').toISOString(),
        },
        {
            userId: 3,
            txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            chain: 'polygon',
            rawData: {
                value: '5000.0 MATIC',
                gas_used: 45000,
                from: '0x456def789abc012ghi345jkl678mno901pqr234st',
                to: '0x789ghi012jkl345mno678pqr901stu234vwx567yz',
                block: 45678901,
                status: 'success'
            },
            riskScore: 72,
            riskLevel: 'high',
            tags: ['nft_trade'],
            aiExplanation: 'Large value transfer detected. Destination wallet has history of scam reports.',
            ruleBasedFlags: ['suspicious_destination', 'large_value'],
            createdAt: new Date('2024-12-20T09:15:00Z').toISOString(),
        },
        {
            userId: 1,
            txHash: '0x2468ace13579bdf2468ace13579bdf2468ace13579bdf2468ace13579bdf2468',
            chain: 'eth',
            rawData: {
                value: '0.5 ETH',
                gas_used: 21000,
                from: '0xabc123def456ghi789jkl012mno345pqr678stu901',
                to: '0x234vwx567yzA890bcd123efg456hij789klm012no',
                block: 18345678,
                status: 'success'
            },
            riskScore: 22,
            riskLevel: 'low',
            tags: ['token_swap'],
            aiExplanation: 'Standard token transfer between wallets. No suspicious activity detected.',
            ruleBasedFlags: [],
            createdAt: new Date('2024-12-22T16:45:00Z').toISOString(),
        },
        {
            userId: 4,
            txHash: '0x135792468ace135792468ace135792468ace135792468ace135792468ace1357',
            chain: 'bsc',
            rawData: {
                value: '1500.0 BNB',
                gas_used: 150000,
                from: '0x567hij890klm123nop456qrs789tuv012wxy345zaB',
                to: '0x890mno123pqr456stu789vwx012yzA345bcd678efG',
                block: 34678912,
                status: 'success'
            },
            riskScore: 90,
            riskLevel: 'critical',
            tags: ['contract_creation', 'high_risk'],
            aiExplanation: 'Flash loan attack pattern identified. Multiple pools affected in single transaction.',
            ruleBasedFlags: ['smart_contract_risk', 'rapid_execution', 'multiple_tokens'],
            createdAt: new Date('2024-12-25T11:30:00Z').toISOString(),
        },
        {
            userId: 2,
            txHash: '0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210',
            chain: 'polygon',
            rawData: {
                value: '750.0 MATIC',
                gas_used: 32000,
                from: '0x901tuv234wxy567zaB890cde123fgh456ijk789lmN',
                to: '0x234opq567rst890uvw123xyz456AbC789dEf012GhI',
                block: 45789012,
                status: 'success'
            },
            riskScore: 45,
            riskLevel: 'medium',
            tags: ['token_swap'],
            aiExplanation: 'Standard DEX swap transaction. Moderate price impact detected.',
            ruleBasedFlags: ['large_value'],
            createdAt: new Date('2024-12-27T08:20:00Z').toISOString(),
        },
        {
            userId: 5,
            txHash: '0x369cf258be147ad369cf258be147ad369cf258be147ad369cf258be147ad369c',
            chain: 'eth',
            rawData: {
                value: '25.0 ETH',
                gas_used: 75000,
                from: '0x567jkl890mno123pqr456stu789vwx012yzA345bcD',
                to: '0x890efg123hij456klm789nop012qrs345tuv678wxY',
                block: 18456789,
                status: 'success'
            },
            riskScore: 68,
            riskLevel: 'high',
            tags: ['large_transfer'],
            aiExplanation: 'Large value transfer to new wallet address. Exercise caution.',
            ruleBasedFlags: ['large_value', 'suspicious_destination'],
            createdAt: new Date('2024-12-28T13:50:00Z').toISOString(),
        },
        {
            userId: 3,
            txHash: '0x7890abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx1234yzAB5678CdEf',
            chain: 'bsc',
            rawData: {
                value: '50.0 BNB',
                gas_used: 28000,
                from: '0x123zAb456cDe789fGh012iJk345lMn678oPq901rSt',
                to: '0x456uVw789xYz012AbC345dEf678GhI901jKl234MnO',
                block: 34789123,
                status: 'success'
            },
            riskScore: 18,
            riskLevel: 'low',
            tags: ['bridge'],
            aiExplanation: 'Cross-chain bridge transaction. All security checks passed.',
            ruleBasedFlags: [],
            createdAt: new Date('2024-12-30T10:10:00Z').toISOString(),
        },
        {
            userId: 1,
            txHash: '0xdef0123456789abc0def123456789abc0def123456789abc0def123456789abc0',
            chain: 'polygon',
            rawData: {
                value: '2000.0 MATIC',
                gas_used: 68000,
                from: '0x789pQr012sTu345vWx678yZa901BcD234eFg567HiJ',
                to: '0x012kLm345NoP678qRs901TuV234wXy567ZaB890cDe',
                block: 45890123,
                status: 'success'
            },
            riskScore: 55,
            riskLevel: 'high',
            tags: ['nft_trade', 'large_transfer'],
            aiExplanation: 'NFT marketplace transaction with elevated risk score due to high value.',
            ruleBasedFlags: ['large_value'],
            createdAt: new Date('2024-12-31T15:35:00Z').toISOString(),
        },
        {
            userId: 4,
            txHash: '0x1111222233334444555566667777888899990000aaaabbbbccccddddeeeefffff',
            chain: 'eth',
            rawData: {
                value: '3.2 ETH',
                gas_used: 42000,
                from: '0x345fGh678iJk901lMn234oPq567rSt890uVw123xYz',
                to: '0x678AbC901dEf234GhI567jKl890mNo123pQr456StU',
                block: 18567890,
                status: 'success'
            },
            riskScore: 12,
            riskLevel: 'low',
            tags: ['token_swap'],
            aiExplanation: 'Standard token transfer between wallets. No suspicious activity detected.',
            ruleBasedFlags: [],
            createdAt: new Date('2025-01-02T12:00:00Z').toISOString(),
        },
    ];

    await db.insert(transactionScans).values(sampleTransactionScans);
    
    console.log('✅ Transaction scans seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});