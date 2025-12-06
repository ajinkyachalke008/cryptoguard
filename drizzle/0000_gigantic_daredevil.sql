CREATE TABLE `ai_conversations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`context_type` text,
	`context_data` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ai_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`conversation_id` integer,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`timestamp` text NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `ai_conversations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `alerts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`severity` text NOT NULL,
	`alert_type` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`wallet_address` text,
	`tx_hash` text,
	`blockchain` text,
	`message` text NOT NULL,
	`description` text,
	`amount` text,
	`created_at` text NOT NULL,
	`resolved_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `marketplace_scans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`marketplace_name` text NOT NULL,
	`risk_score` integer NOT NULL,
	`marketplace_risk_label` text,
	`created_at` text NOT NULL,
	`scan_data` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `nft_scans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`collection_name` text NOT NULL,
	`contract_address` text NOT NULL,
	`risk_score` integer NOT NULL,
	`wash_trading_level` text,
	`fake_volume_ratio` text,
	`created_at` text NOT NULL,
	`scan_data` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `protocol_scans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`protocol_name` text NOT NULL,
	`contract_address` text NOT NULL,
	`blockchain` text NOT NULL,
	`risk_score` integer NOT NULL,
	`audit_score` integer,
	`vuln_score` integer,
	`rug_pull_risk` text,
	`created_at` text NOT NULL,
	`scan_data` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`report_type` text NOT NULL,
	`entity_address` text NOT NULL,
	`blockchain` text NOT NULL,
	`report_data` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `wallet_scans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`wallet_address` text NOT NULL,
	`blockchain` text NOT NULL,
	`risk_score` integer NOT NULL,
	`scan_type` text NOT NULL,
	`sanctions_status` text,
	`pep_risk_level` text,
	`created_at` text NOT NULL,
	`scan_data` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `watchlists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`wallet_address` text NOT NULL,
	`blockchain` text NOT NULL,
	`label` text,
	`risk_threshold` integer DEFAULT 70,
	`created_at` text NOT NULL,
	`last_activity_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
