import { db } from '@/db';
import { users } from '@/db/schema';

async function main() {
    const sampleUsers = [
        {
            email: 'admin@cryptoguard.io',
            passwordHash: '$2b$10$rKJ8F3xE9mN2pQ7wV5yL.eHzX4cT6bA9sD1fG8hK2jL3mN4oP5qR6',
            role: 'admin',
            createdAt: new Date('2024-01-15T08:30:00Z').toISOString(),
            updatedAt: new Date('2024-01-15T08:30:00Z').toISOString(),
        },
        {
            email: 'analyst@cryptoguard.io',
            passwordHash: '$2b$10$sL4mH6yG1pR9tX3wZ8aM.fJzY5dU7cB0vE2gI9kM3nO4pQ6rS7tU8',
            role: 'user',
            createdAt: new Date('2024-02-01T10:15:00Z').toISOString(),
            updatedAt: new Date('2024-02-01T10:15:00Z').toISOString(),
        },
        {
            email: 'security@cryptoguard.io',
            passwordHash: '$2b$10$tM5nI7zH2qS0uY4xA9bN.gKaZ6eV8dC1wF3hJ0lN4oP5qR7sT8uV9',
            role: 'user',
            createdAt: new Date('2024-02-10T14:45:00Z').toISOString(),
            updatedAt: new Date('2024-02-10T14:45:00Z').toISOString(),
        },
        {
            email: 'monitor@cryptoguard.io',
            passwordHash: '$2b$10$uN6oJ8aI3rT1vZ5yB0cO.hLbA7fW9eD2xG4iK1mO5pQ6rS8tU9vW0',
            role: 'user',
            createdAt: new Date('2024-03-05T09:20:00Z').toISOString(),
            updatedAt: new Date('2024-03-05T09:20:00Z').toISOString(),
        },
        {
            email: 'auditor@cryptoguard.io',
            passwordHash: '$2b$10$vO7pK9bJ4sU2wA6zC1dP.iMcB8gX0fE3yH5jL2nP6qR7sT9uV0wX1',
            role: 'user',
            createdAt: new Date('2024-03-15T11:30:00Z').toISOString(),
            updatedAt: new Date('2024-03-15T11:30:00Z').toISOString(),
        },
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});