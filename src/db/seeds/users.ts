import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcrypt';

async function main() {
    const passwordHash = await bcrypt.hash('password123', 10);

    const sampleUsers = [
        {
            email: 'ajinkyachalke008@gmail.com',
            passwordHash,
            role: 'admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            email: 'admin@cryptoguard.io',
            passwordHash,
            role: 'admin',
            createdAt: new Date('2024-10-15T09:30:00.000Z').toISOString(),
            updatedAt: new Date('2024-12-20T14:45:00.000Z').toISOString(),
        },
        {
            email: 'analyst@cryptoguard.io',
            passwordHash,
            role: 'user',
            createdAt: new Date('2024-11-02T11:15:00.000Z').toISOString(),
            updatedAt: new Date('2024-12-18T16:20:00.000Z').toISOString(),
        },
        {
            email: 'security@cryptoguard.io',
            passwordHash,
            role: 'user',
            createdAt: new Date('2024-11-10T08:45:00.000Z').toISOString(),
            updatedAt: new Date('2024-12-19T10:30:00.000Z').toISOString(),
        },
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully (password for all: password123)');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});