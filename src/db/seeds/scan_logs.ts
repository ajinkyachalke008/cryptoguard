import { db } from '@/db';
import { scanLogs } from '@/db/schema';

async function main() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const getRandomDate = (start: Date, end: Date) => {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
    };

    const sampleScanLogs = [
        {
            type: 'wallet',
            identifier: '0x742d35cc6634c0532925a3b844bc9e7fea9498f0',
            userId: 1,
            status: 'success',
            errorMessage: null,
            durationMs: 1250,
            createdAt: getRandomDate(sevenDaysAgo, now),
        },
        {
            type: 'transaction',
            identifier: '0x9a5e8f234d567abc89012def345678901234567890abcdef1234567890abcdef',
            userId: 2,
            status: 'success',
            errorMessage: null,
            durationMs: 890,
            createdAt: getRandomDate(sevenDaysAgo, now),
        },
        {
            type: 'wallet',
            identifier: '0x8ba1f109551bd432803012645ac136ddd64dba72',
            userId: 3,
            status: 'success',
            errorMessage: null,
            durationMs: 2100,
            createdAt: getRandomDate(sevenDaysAgo, now),
        },
        {
            type: 'transaction',
            identifier: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            userId: 1,
            status: 'success',
            errorMessage: null,
            durationMs: 1680,
            createdAt: getRandomDate(sevenDaysAgo, now),
        },
        {
            type: 'wallet',
            identifier: '0xinvalid',
            userId: 4,
            status: 'error',
            errorMessage: 'Invalid wallet address format',
            durationMs: 120,
            createdAt: getRandomDate(sevenDaysAgo, now),
        },
        {
            type: 'transaction',
            identifier: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            userId: 5,
            status: 'success',
            errorMessage: null,
            durationMs: 2450,
            createdAt: getRandomDate(sevenDaysAgo, now),
        },
        {
            type: 'wallet',
            identifier: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce',
            userId: 2,
            status: 'success',
            errorMessage: null,
            durationMs: 1820,
            createdAt: getRandomDate(sevenDaysAgo, now),
        },
        {
            type: 'transaction',
            identifier: '0x234f567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            userId: 3,
            status: 'error',
            errorMessage: 'Network timeout - blockchain node unreachable',
            durationMs: 5000,
            createdAt: getRandomDate(sevenDaysAgo, now),
        },
        {
            type: 'wallet',
            identifier: '0x5a0b54d5dc17e0aadc383d2db43b0a0d3e029c4c',
            userId: 4,
            status: 'success',
            errorMessage: null,
            durationMs: 950,
            createdAt: getRandomDate(sevenDaysAgo, now),
        },
        {
            type: 'transaction',
            identifier: '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
            userId: 1,
            status: 'success',
            errorMessage: null,
            durationMs: 1340,
            createdAt: getRandomDate(sevenDaysAgo, now),
        },
        {
            type: 'wallet',
            identifier: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
            userId: 5,
            status: 'success',
            errorMessage: null,
            durationMs: 2890,
            createdAt: getRandomDate(sevenDaysAgo, now),
        },
        {
            type: 'transaction',
            identifier: '0x890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678',
            userId: 2,
            status: 'success',
            errorMessage: null,
            durationMs: 780,
            createdAt: getRandomDate(sevenDaysAgo, now),
        },
        {
            type: 'wallet',
            identifier: '0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be',
            userId: 3,
            status: 'error',
            errorMessage: 'Rate limit exceeded for external API',
            durationMs: 250,
            createdAt: getRandomDate(sevenDaysAgo, now),
        },
        {
            type: 'transaction',
            identifier: '0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc',
            userId: 4,
            status: 'success',
            errorMessage: null,
            durationMs: 1560,
            createdAt: getRandomDate(sevenDaysAgo, now),
        },
        {
            type: 'wallet',
            identifier: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12',
            userId: 5,
            status: 'success',
            errorMessage: null,
            durationMs: 2200,
            createdAt: getRandomDate(sevenDaysAgo, now),
        },
    ];

    await db.insert(scanLogs).values(sampleScanLogs);

    console.log('✅ Scan logs seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});