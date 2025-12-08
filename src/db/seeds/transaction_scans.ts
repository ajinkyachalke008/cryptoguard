import { db } from '@/db';
import { transactionScans } from '@/db/schema';

async function main() {
    const sampleTransactionScans = [
        {
            userId: 1,
            txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
            chain: 'eth',
            rawData: {
                value: '10.5 ETH',
                gas_used: 21000,
                from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
                to: '0x8B9c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c',
                block: 18234567,
                status: 'success'
            },
            riskScore: 15,
            riskLevel: 'low',
            tags: ['token_swap'],
            aiExplanation: 'Standard token transfer between wallets. No suspicious activity detected.',
            ruleBasedFlags: [],
            createdAt: new Date('2024-11-05').toISOString()
        },
        {
            userId: 2,
            txHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
            chain: 'bsc',
            rawData: {
                value: '125.7 BNB',
                gas_used: 45000,
                from: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
                to: '0x3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f',
                block: 32456789,
                status: 'success'
            },
            riskScore: 78,
            riskLevel: 'critical',
            tags: ['large_transfer', 'bridge'],
            aiExplanation: 'Large value transfer detected. Destination wallet has history of scam reports.',
            ruleBasedFlags: ['large_value', 'suspicious_destination'],
            createdAt: new Date('2024-11-08').toISOString()
        },
        {
            userId: 3,
            txHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
            chain: 'polygon',
            rawData: {
                value: '2500 MATIC',
                gas_used: 180000,
                from: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e',
                to: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
                block: 45678901,
                status: 'success'
            },
            riskScore: 88,
            riskLevel: 'critical',
            tags: ['flash_loan', 'suspicious'],
            aiExplanation: 'Flash loan attack pattern identified. Multiple pools affected in single transaction.',
            ruleBasedFlags: ['rapid_execution', 'multiple_tokens'],
            createdAt: new Date('2024-11-12').toISOString()
        },
        {
            userId: 1,
            txHash: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
            chain: 'eth',
            rawData: {
                value: '0.25 ETH',
                gas_used: 85000,
                from: '0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a',
                to: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b',
                block: 18245678,
                status: 'success'
            },
            riskScore: 22,
            riskLevel: 'low',
            tags: ['nft_trade'],
            aiExplanation: 'Standard NFT purchase transaction. Marketplace contract verified.',
            ruleBasedFlags: [],
            createdAt: new Date('2024-11-15').toISOString()
        },
        {
            userId: 4,
            txHash: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
            chain: 'bsc',
            rawData: {
                value: '450 USDT',
                gas_used: 52000,
                from: '0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c',
                to: '0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d',
                block: 32467890,
                status: 'success'
            },
            riskScore: 42,
            riskLevel: 'medium',
            tags: ['token_swap'],
            aiExplanation: 'Moderate risk detected. Recipient wallet has mixed transaction history.',
            ruleBasedFlags: ['multiple_tokens'],
            createdAt: new Date('2024-11-18').toISOString()
        },
        {
            userId: 5,
            txHash: '0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a',
            chain: 'polygon',
            rawData: {
                value: '0 MATIC',
                gas_used: 320000,
                from: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
                to: '0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1',
                block: 45689012,
                status: 'success'
            },
            riskScore: 72,
            riskLevel: 'high',
            tags: ['contract_creation', 'high_risk'],
            aiExplanation: 'WARNING: This transaction involves a smart contract with known vulnerabilities. High risk of exploit.',
            ruleBasedFlags: ['smart_contract_risk'],
            createdAt: new Date('2024-11-20').toISOString()
        },
        {
            userId: 2,
            txHash: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
            chain: 'eth',
            rawData: {
                value: '3.2 ETH',
                gas_used: 28000,
                from: '0xc3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
                to: '0xd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3',
                block: 18256789,
                status: 'success'
            },
            riskScore: 18,
            riskLevel: 'low',
            tags: ['token_swap'],
            aiExplanation: 'Regular DeFi swap transaction. Both wallets have established transaction history.',
            ruleBasedFlags: [],
            createdAt: new Date('2024-11-22').toISOString()
        },
        {
            userId: 3,
            txHash: '0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c',
            chain: 'bsc',
            rawData: {
                value: '85.5 BNB',
                gas_used: 62000,
                from: '0xe5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4',
                to: '0xf6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5',
                block: 32478901,
                status: 'success'
            },
            riskScore: 58,
            riskLevel: 'high',
            tags: ['large_transfer'],
            aiExplanation: 'High-value transfer to newly created wallet. Monitoring recommended.',
            ruleBasedFlags: ['large_value', 'suspicious_destination'],
            createdAt: new Date('2024-11-25').toISOString()
        },
        {
            userId: 4,
            txHash: '0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d',
            chain: 'polygon',
            rawData: {
                value: '1200 USDC',
                gas_used: 48000,
                from: '0xa7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6',
                to: '0xb8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7',
                block: 45690123,
                status: 'success'
            },
            riskScore: 35,
            riskLevel: 'medium',
            tags: ['token_swap'],
            aiExplanation: 'Standard token exchange. Minor risk factors detected in recipient wallet activity.',
            ruleBasedFlags: ['multiple_tokens'],
            createdAt: new Date('2024-11-28').toISOString()
        },
        {
            userId: 5,
            txHash: '0x0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e',
            chain: 'eth',
            rawData: {
                value: '0.8 ETH',
                gas_used: 34000,
                from: '0xc9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8',
                to: '0xd0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9',
                block: 18267890,
                status: 'success'
            },
            riskScore: 12,
            riskLevel: 'low',
            tags: ['nft_trade'],
            aiExplanation: 'Verified NFT marketplace transaction. All security checks passed.',
            ruleBasedFlags: [],
            createdAt: new Date('2024-12-01').toISOString()
        }
    ];

    await db.insert(transactionScans).values(sampleTransactionScans);
    
    console.log('✅ Transaction scans seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});