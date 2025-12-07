/**
 * Date utility functions for CryptoGuard
 * All dates are between November 1, 2025 and December 31, 2025
 */

// November 1, 2025 00:00:00
const NOV_1_2025 = new Date('2025-11-01T00:00:00').getTime()
// December 31, 2025 23:59:59
const DEC_31_2025 = new Date('2025-12-31T23:59:59').getTime()

/**
 * Generate a random date between November 1, 2025 and December 31, 2025
 */
export function getRandomDate(): Date {
  const randomTime = NOV_1_2025 + Math.random() * (DEC_31_2025 - NOV_1_2025)
  return new Date(randomTime)
}

/**
 * Generate a random date string in YYYY-MM-DD format
 */
export function getRandomDateString(): string {
  return getRandomDate().toISOString().split('T')[0]
}

/**
 * Generate a random timestamp in ISO format
 */
export function getRandomTimestamp(): string {
  return getRandomDate().toISOString()
}

/**
 * Generate a random date in locale string format
 */
export function getRandomDateLocale(): string {
  return getRandomDate().toLocaleString()
}

/**
 * Get a date N days ago from Dec 31, 2025
 */
export function getDaysAgo(days: number): Date {
  return new Date(DEC_31_2025 - days * 24 * 60 * 60 * 1000)
}

/**
 * Get a date string N days ago from Dec 31, 2025
 */
export function getDaysAgoString(days: number): string {
  return getDaysAgo(days).toISOString().split('T')[0]
}

/**
 * Format date for display (e.g., "Nov 15, 2025")
 */
export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

/**
 * Get current year (always 2025 for this app)
 */
export function getCurrentYear(): number {
  return 2025
}
