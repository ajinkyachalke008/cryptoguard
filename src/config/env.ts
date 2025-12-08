/**
 * Environment Configuration
 * 
 * Loads and validates all required environment variables.
 * Throws clear errors if critical variables are missing.
 * Provides typed access to configuration values.
 */

import { logger } from '@/lib/utils/logger';

interface EnvironmentConfig {
  // Application
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  
  // Database
  databaseUrl: string;
  databaseAuthToken?: string;
  
  // Authentication
  jwtSecret: string;
  jwtExpiresIn: string;
  
  // Web3 / Blockchain APIs
  web3ApiKey: string;
  etherscanApiKey?: string;
  moralisApiKey?: string;
  alchemyApiKey?: string;
  
  // AI Provider
  aiApiKey: string;
  aiApiUrl: string;
  aiModel: string;
  
  // Security
  bcryptRounds: number;
  
  // Rate Limiting
  rateLimitEnabled: boolean;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  
  // CORS
  corsOrigins: string[];
  
  // Stripe (for payments)
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
}

class EnvironmentValidator {
  private config: EnvironmentConfig;

  constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }

  /**
   * Load environment variables with defaults
   */
  private loadConfig(): EnvironmentConfig {
    return {
      // Application
      nodeEnv: (process.env.NODE_ENV as any) || 'development',
      port: parseInt(process.env.PORT || '4000', 10),
      
      // Database
      databaseUrl: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || '',
      databaseAuthToken: process.env.TURSO_AUTH_TOKEN,
      
      // Authentication
      jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_change_in_production',
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
      
      // Web3 APIs
      web3ApiKey: process.env.WEB3_API_KEY || 'mock_web3_key',
      etherscanApiKey: process.env.ETHERSCAN_API_KEY,
      moralisApiKey: process.env.MORALIS_API_KEY,
      alchemyApiKey: process.env.ALCHEMY_API_KEY,
      
      // AI Provider
      aiApiKey: process.env.AI_API_KEY || 'mock_ai_key',
      aiApiUrl: process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions',
      aiModel: process.env.AI_MODEL || 'gpt-4',
      
      // Security
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
      
      // Rate Limiting
      rateLimitEnabled: process.env.RATE_LIMIT_ENABLED !== 'false',
      rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
      rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
      
      // CORS
      corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
      
      // Stripe
      stripeSecretKey: process.env.STRIPE_SECRET_KEY,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    };
  }

  /**
   * Validate required environment variables
   */
  private validateConfig(): void {
    const errors: string[] = [];

    // Check critical variables in production
    if (this.config.nodeEnv === 'production') {
      if (!this.config.databaseUrl) {
        errors.push('DATABASE_URL or TURSO_DATABASE_URL is required in production');
      }

      if (this.config.jwtSecret === 'your_jwt_secret_change_in_production') {
        errors.push('JWT_SECRET must be set to a secure value in production');
      }

      if (this.config.aiApiKey === 'mock_ai_key') {
        logger.warn('AI_API_KEY not configured - AI explanations will use mock data');
      }

      if (this.config.web3ApiKey === 'mock_web3_key') {
        logger.warn('WEB3_API_KEY not configured - Web3 data will use mock responses');
      }
    }

    // Validate numeric values
    if (this.config.port < 1 || this.config.port > 65535) {
      errors.push('PORT must be between 1 and 65535');
    }

    if (this.config.bcryptRounds < 4 || this.config.bcryptRounds > 31) {
      errors.push('BCRYPT_ROUNDS must be between 4 and 31');
    }

    // Log warnings for missing optional values
    if (!this.config.etherscanApiKey && this.config.nodeEnv === 'production') {
      logger.warn('ETHERSCAN_API_KEY not set - Etherscan features will be limited');
    }

    if (!this.config.stripeSecretKey && this.config.nodeEnv === 'production') {
      logger.warn('STRIPE_SECRET_KEY not set - Payment features will be disabled');
    }

    // Throw error if critical variables are missing
    if (errors.length > 0) {
      const errorMessage = `Environment configuration errors:\n${errors.join('\n')}`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    // Log successful configuration
    logger.info('Environment configuration loaded successfully', {
      nodeEnv: this.config.nodeEnv,
      port: this.config.port,
      rateLimitEnabled: this.config.rateLimitEnabled,
      aiConfigured: this.config.aiApiKey !== 'mock_ai_key',
      web3Configured: this.config.web3ApiKey !== 'mock_web3_key',
    });
  }

  /**
   * Get configuration object
   */
  public getConfig(): EnvironmentConfig {
    return { ...this.config };
  }

  /**
   * Get specific config value
   */
  public get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    return this.config[key];
  }

  /**
   * Check if running in production
   */
  public isProduction(): boolean {
    return this.config.nodeEnv === 'production';
  }

  /**
   * Check if running in development
   */
  public isDevelopment(): boolean {
    return this.config.nodeEnv === 'development';
  }

  /**
   * Check if running in test mode
   */
  public isTest(): boolean {
    return this.config.nodeEnv === 'test';
  }
}

// Export singleton instance
const envValidator = new EnvironmentValidator();
export const env = envValidator.getConfig();
export const envConfig = envValidator;

// Export individual config values for convenience
export const {
  nodeEnv,
  port,
  databaseUrl,
  databaseAuthToken,
  jwtSecret,
  jwtExpiresIn,
  web3ApiKey,
  aiApiKey,
  aiApiUrl,
  aiModel,
  bcryptRounds,
  rateLimitEnabled,
  corsOrigins,
} = env;
