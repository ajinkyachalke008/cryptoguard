import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull(),
});

// Wallet scans table
export const walletScans = sqliteTable('wallet_scans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  walletAddress: text('wallet_address').notNull(),
  blockchain: text('blockchain').notNull(),
  riskScore: integer('risk_score').notNull(),
  scanType: text('scan_type').notNull(),
  sanctionsStatus: text('sanctions_status'),
  pepRiskLevel: text('pep_risk_level'),
  createdAt: text('created_at').notNull(),
  scanData: text('scan_data', { mode: 'json' }),
});

// Protocol scans table
export const protocolScans = sqliteTable('protocol_scans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  protocolName: text('protocol_name').notNull(),
  contractAddress: text('contract_address').notNull(),
  blockchain: text('blockchain').notNull(),
  riskScore: integer('risk_score').notNull(),
  auditScore: integer('audit_score'),
  vulnScore: integer('vuln_score'),
  rugPullRisk: text('rug_pull_risk'),
  createdAt: text('created_at').notNull(),
  scanData: text('scan_data', { mode: 'json' }),
});

// NFT scans table
export const nftScans = sqliteTable('nft_scans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  collectionName: text('collection_name').notNull(),
  contractAddress: text('contract_address').notNull(),
  riskScore: integer('risk_score').notNull(),
  washTradingLevel: text('wash_trading_level'),
  fakeVolumeRatio: text('fake_volume_ratio'),
  createdAt: text('created_at').notNull(),
  scanData: text('scan_data', { mode: 'json' }),
});

// Marketplace scans table
export const marketplaceScans = sqliteTable('marketplace_scans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  marketplaceName: text('marketplace_name').notNull(),
  riskScore: integer('risk_score').notNull(),
  marketplaceRiskLabel: text('marketplace_risk_label'),
  createdAt: text('created_at').notNull(),
  scanData: text('scan_data', { mode: 'json' }),
});

// Alerts table
export const alerts = sqliteTable('alerts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  severity: text('severity').notNull(),
  alertType: text('alert_type').notNull(),
  status: text('status').notNull().default('active'),
  walletAddress: text('wallet_address'),
  txHash: text('tx_hash'),
  blockchain: text('blockchain'),
  message: text('message').notNull(),
  description: text('description'),
  amount: text('amount'),
  createdAt: text('created_at').notNull(),
  resolvedAt: text('resolved_at'),
});

// Watchlists table
export const watchlists = sqliteTable('watchlists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  walletAddress: text('wallet_address').notNull(),
  blockchain: text('blockchain').notNull(),
  label: text('label'),
  riskThreshold: integer('risk_threshold').default(70),
  createdAt: text('created_at').notNull(),
  lastActivityAt: text('last_activity_at'),
});

// AI conversations table
export const aiConversations = sqliteTable('ai_conversations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  contextType: text('context_type'),
  contextData: text('context_data', { mode: 'json' }),
  createdAt: text('created_at').notNull(),
});

// AI messages table
export const aiMessages = sqliteTable('ai_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  conversationId: integer('conversation_id').references(() => aiConversations.id),
  role: text('role').notNull(),
  content: text('content').notNull(),
  timestamp: text('timestamp').notNull(),
});

// Reports table
export const reports = sqliteTable('reports', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  reportType: text('report_type').notNull(),
  entityAddress: text('entity_address').notNull(),
  blockchain: text('blockchain').notNull(),
  reportData: text('report_data', { mode: 'json' }),
  createdAt: text('created_at').notNull(),
});