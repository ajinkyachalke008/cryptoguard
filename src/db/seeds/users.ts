import { db } from '@/db';
import { users } from '@/db/schema';

async function main() {
    const sampleUsers = [
        {
            email: 'admin@cryptoguard.io',
            passwordHash: '$2b$10$YQZ8kR9vJ3mK4pL7nX2wEeB5tH6gF8dC1aS9wQ3mK4pL7nX2wEeB5t',
            role: 'admin',
            createdAt: new Date('2024-10-15T09:30:00.000Z').toISOString(),
            updatedAt: new Date('2024-12-20T14:45:00.000Z').toISOString(),
        },
        {
            email: 'analyst@cryptoguard.io',
            passwordHash: '$2b$10$mK4pL7nX2wEeB5tH6gF8dC1aS9wQ3mK4pL7nX2wEeB5tH6gF8dC1a',
            role: 'user',
            createdAt: new Date('2024-11-02T11:15:00.000Z').toISOString(),
            updatedAt: new Date('2024-12-18T16:20:00.000Z').toISOString(),
        },
        {
            email: 'security@cryptoguard.io',
            passwordHash: '$2b$10$pL7nX2wEeB5tH6gF8dC1aS9wQ3mK4pL7nX2wEeB5tH6gF8dC1aS9w',
            role: 'user',
            createdAt: new Date('2024-11-10T08:45:00.000Z').toISOString(),
            updatedAt: new Date('2024-12-19T10:30:00.000Z').toISOString(),
        },
        {
            email: 'monitor@cryptoguard.io',
            passwordHash: '$2b$10$X2wEeB5tH6gF8dC1aS9wQ3mK4pL7nX2wEeB5tH6gF8dC1aS9wQ3mK',
            role: 'user',
            createdAt: new Date('2024-11-18T13:20:00.000Z').toISOString(),
            updatedAt: new Date('2024-12-21T09:15:00.000Z').toISOString(),
        },
        {
            email: 'auditor@cryptoguard.io',
            passwordHash: '$2b$10$EeB5tH6gF8dC1aS9wQ3mK4pL7nX2wEeB5tH6gF8dC1aS9wQ3mK4pL',
            role: 'user',
            createdAt: new Date('2024-11-25T15:00:00.000Z').toISOString(),
            updatedAt: new Date('2024-12-22T11:45:00.000Z').toISOString(),
        }
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});