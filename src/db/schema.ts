import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('user'), // 'user', 'admin', 'developer', 'enterprise'
  status: text('status').notNull().default('active'), // 'active', 'suspended', 'blocked', 'pending_verification'
  accountType: text('account_type').notNull().default('user'), // 'user', 'developer', 'enterprise'
  signupMethod: text('signup_method').notNull().default('email'), // 'email', 'oauth_google', 'wallet'
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  lastLoginAt: text('last_login_at'),
  suspendedAt: text('suspended_at'),
  suspendedBy: integer('suspended_by'),
  suspendReason: text('suspend_reason'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Wallet scans table - renamed fields to match new schema
export const walletScans = sqliteTable('wallet_scans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  walletAddress: text('wallet_address').notNull(),
  chain: text('chain').notNull(),
  rawData: text('raw_data', { mode: 'json' }),
  riskScore: integer('risk_score').notNull(),
  riskLevel: text('risk_level').notNull(),
  tags: text('tags', { mode: 'json' }),
  aiExplanation: text('ai_explanation'),
  ruleBasedFlags: text('rule_based_flags', { mode: 'json' }),
  createdAt: text('created_at').notNull(),
});

// Transaction scans table
export const transactionScans = sqliteTable('transaction_scans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  txHash: text('tx_hash').notNull(),
  chain: text('chain').notNull(),
  rawData: text('raw_data', { mode: 'json' }),
  riskScore: integer('risk_score').notNull(),
  riskLevel: text('risk_level').notNull(),
  tags: text('tags', { mode: 'json' }),
  aiExplanation: text('ai_explanation'),
  ruleBasedFlags: text('rule_based_flags', { mode: 'json' }),
  createdAt: text('created_at').notNull(),
});

// Scan logs table
export const scanLogs = sqliteTable('scan_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type').notNull(),
  identifier: text('identifier').notNull(),
  userId: integer('user_id').references(() => users.id),
  status: text('status').notNull(),
  errorMessage: text('error_message'),
  durationMs: integer('duration_ms').notNull(),
  createdAt: text('created_at').notNull(),
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

// API Keys table
export const apiKeys = sqliteTable('api_keys', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  name: text('name').notNull(),
  key: text('key').notNull().unique(),
  status: text('status').notNull().default('active'),
  lastUsedAt: text('last_used_at'),
  createdAt: text('created_at').notNull(),
});

// Case Management table
export const cases = sqliteTable('cases', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('open'),
  priority: text('priority').notNull().default('medium'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Case Items table (links scans/alerts to cases)
export const caseItems = sqliteTable('case_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  caseId: integer('case_id').references(() => cases.id),
  itemType: text('item_type').notNull(), // 'wallet_scan', 'transaction_scan', 'alert'
  itemId: integer('item_id').notNull(),
  createdAt: text('created_at').notNull(),
});

// Webhooks table
export const webhooks = sqliteTable('webhooks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  url: text('url').notNull(),
  name: text('name').notNull(),
  events: text('events', { mode: 'json' }), // ['alert.created', 'scan.completed']
  secret: text('secret').notNull(),
  status: text('status').notNull().default('active'),
  createdAt: text('created_at').notNull(),
});

// Wallet Intelligence tables
export const wallets = sqliteTable('wallets', {
  walletAddress: text('wallet_address').primaryKey(),
  firstSeen: text('first_seen').notNull(),
  lastSeen: text('last_seen').notNull(),
});

export const walletClusters = sqliteTable('wallet_clusters', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clusterId: text('cluster_id').notNull().unique(),
  confidence: text('confidence').notNull(), // 'low', 'medium', 'high'
  createdAt: text('created_at').notNull(),
});

export const walletClusterMembers = sqliteTable('wallet_cluster_members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clusterId: text('cluster_id').references(() => walletClusters.clusterId),
  walletAddress: text('wallet_address').references(() => wallets.walletAddress),
  role: text('role').notNull(),
});

export const walletActivityLogs = sqliteTable('wallet_activity_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  walletAddress: text('wallet_address').references(() => wallets.walletAddress),
  timestamp: text('timestamp').notNull(),
  activityType: text('activity_type').notNull(), // 'transaction', 'contract', 'liquidity'
  amount: text('amount'),
});

export const timezoneProfiles = sqliteTable('timezone_profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  walletAddress: text('wallet_address').references(() => wallets.walletAddress),
  hourlyActivityDistribution: text('hourly_activity_distribution', { mode: 'json' }),
  peakHours: text('peak_hours', { mode: 'json' }),
  confidence: text('confidence').notNull(), // 'low', 'medium', 'high'
});

export const geoInferenceProfiles = sqliteTable('geo_inference_profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  walletAddress: text('wallet_address').references(() => wallets.walletAddress),
  regionProbabilities: text('region_probabilities', { mode: 'json' }),
  confidence: text('confidence').notNull(), // 'low', 'medium', 'high'
});

// Authentication logs for admin monitoring
export const authLogs = sqliteTable('auth_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  email: text('email').notNull(),
  eventType: text('event_type').notNull(), // 'login_success', 'login_failed', 'signup', 'logout', 'password_reset'
  loginMethod: text('login_method'), // 'password', 'oauth_google', 'wallet'
  ipHash: text('ip_hash'), // Hashed IP for privacy
  userAgent: text('user_agent'),
  deviceType: text('device_type'), // 'desktop', 'mobile', 'tablet'
  browser: text('browser'),
  os: text('os'),
  countryCode: text('country_code'),
  regionCode: text('region_code'),
  failureReason: text('failure_reason'),
  riskFlags: text('risk_flags', { mode: 'json' }), // ['multiple_failed', 'new_device', 'geo_anomaly']
  createdAt: text('created_at').notNull(),
});

// User sessions for admin visibility
export const userSessions = sqliteTable('user_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id).notNull(),
  sessionToken: text('session_token').notNull().unique(),
  ipHash: text('ip_hash'),
  userAgent: text('user_agent'),
  deviceType: text('device_type'),
  browser: text('browser'),
  os: text('os'),
  countryCode: text('country_code'),
  lastActivityAt: text('last_activity_at').notNull(),
  createdAt: text('created_at').notNull(),
  expiresAt: text('expires_at').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  terminatedBy: text('terminated_by'), // 'user', 'admin', 'system'
  terminatedAt: text('terminated_at'),
});

// Admin audit logs for compliance
export const adminAuditLogs = sqliteTable('admin_audit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  adminUserId: integer('admin_user_id').references(() => users.id),
  targetUserId: integer('target_user_id').references(() => users.id),
  action: text('action').notNull(), // 'suspend_user', 'unsuspend_user', 'force_logout', 'reset_password', 'view_details'
  reason: text('reason'),
  details: text('details', { mode: 'json' }),
  createdAt: text('created_at').notNull(),
});

// Suspicious activity alerts
export const securityAlerts = sqliteTable('security_alerts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  alertType: text('alert_type').notNull(), // 'multiple_failed_logins', 'geo_anomaly', 'bot_activity', 'brute_force'
  severity: text('severity').notNull(), // 'low', 'medium', 'high', 'critical'
  description: text('description').notNull(),
  metadata: text('metadata', { mode: 'json' }),
  status: text('status').notNull().default('active'), // 'active', 'resolved', 'dismissed'
  resolvedBy: integer('resolved_by').references(() => users.id),
  resolvedAt: text('resolved_at'),
  createdAt: text('created_at').notNull(),
});
