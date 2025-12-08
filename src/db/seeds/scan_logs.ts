import { db } from '@/db';
import { scanLogs } from '@/db/schema';

async function main() {
    const sampleScanLogs = [
        {
            type: 'wallet',
            identifier: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3',
            userId: 1,
            status: 'success',
            errorMessage: null,
            durationMs: 1250,
            createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            type: 'transaction',
            identifier: '0x9a5e8f234b7c91d8e6f3a4b5c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
            userId: 2,
            status: 'success',
            errorMessage: null,
            durationMs: 890,
            createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        },
        {
            type: 'wallet',
            identifier: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
            userId: 1,
            status: 'success',
            errorMessage: null,
            durationMs: 2150,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            type: 'transaction',
            identifier: '0x1f3e7b9c4d5a6e8f0a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4',
            userId: 3,
            status: 'success',
            errorMessage: null,
            durationMs: 1680,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
        },
        {
            type: 'wallet',
            identifier: '0xinvalid',
            userId: 2,
            status: 'error',
            errorMessage: 'Invalid wallet address format',
            durationMs: 120,
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            type: 'transaction',
            identifier: '0x234f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4',
            userId: 4,
            status: 'error',
            errorMessage: 'Network timeout - blockchain node unreachable',
            durationMs: 5000,
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
        },
        {
            type: 'wallet',
            identifier: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            userId: 5,
            status: 'success',
            errorMessage: null,
            durationMs: 1920,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            type: 'transaction',
            identifier: '0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8',
            userId: 1,
            status: 'success',
            errorMessage: null,
            durationMs: 750,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(),
        },
        {
            type: 'wallet',
            identifier: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            userId: 3,
            status: 'success',
            errorMessage: null,
            durationMs: 2850,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            type: 'transaction',
            identifier: '0x4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5',
            userId: 2,
            status: 'success',
            errorMessage: null,
            durationMs: 1540,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
        },
        {
            type: 'wallet',
            identifier: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
            userId: 4,
            status: 'success',
            errorMessage: null,
            durationMs: 980,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            type: 'transaction',
            identifier: '0x9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0',
            userId: 5,
            status: 'error',
            errorMessage: 'Rate limit exceeded for external API',
            durationMs: 280,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
        },
        {
            type: 'wallet',
            identifier: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
            userId: 1,
            status: 'success',
            errorMessage: null,
            durationMs: 2340,
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        },
        {
            type: 'transaction',
            identifier: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
            userId: 3,
            status: 'success',
            errorMessage: null,
            durationMs: 1475,
            createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        },
        {
            type: 'transaction',
            identifier: '0xb3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4',
            userId: 2,
            status: 'error',
            errorMessage: 'Smart contract not verified on explorer',
            durationMs: 450,
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        },
    ];

    await db.insert(scanLogs).values(sampleScanLogs);
    
    console.log('✅ Scan logs seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});