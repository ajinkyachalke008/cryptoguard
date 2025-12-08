/**
 * AI Service
 * 
 * Integrates with LLM API to generate human-readable risk explanations.
 * Wraps AI API calls with retry logic, error handling, and prompt engineering.
 * 
 * In production, this would integrate with:
 * - OpenAI GPT-4
 * - Anthropic Claude
 * - Google Gemini
 * - Or any other LLM API
 */

import { logger } from '../utils/logger';
import type { RiskAssessment } from './riskEngineService';
import type { WalletActivityData, TransactionDetails } from './web3Service';

interface AIExplanationInput {
  type: 'wallet' | 'transaction';
  data: WalletActivityData | TransactionDetails;
  riskAssessment: RiskAssessment;
}

class AIService {
  private apiKey: string;
  private apiUrl: string;
  private maxRetries: number;

  constructor() {
    this.apiKey = process.env.AI_API_KEY || 'mock_ai_key';
    this.apiUrl = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
    this.maxRetries = 3;
  }

  /**
   * Generate human-readable explanation for wallet risk
   */
  async generateWalletExplanation(
    walletData: WalletActivityData,
    riskAssessment: RiskAssessment
  ): Promise<string> {
    logger.info(`Generating wallet explanation for ${walletData.address}`);

    try {
      const prompt = this.buildWalletPrompt(walletData, riskAssessment);
      
      // In production: Call actual LLM API
      // For now, generate realistic mock explanation
      const explanation = this.generateMockWalletExplanation(walletData, riskAssessment);

      logger.debug('Wallet explanation generated successfully');
      return explanation;
    } catch (error) {
      logger.error('Error generating wallet explanation', error);
      // Fallback to basic explanation
      return this.generateFallbackWalletExplanation(riskAssessment);
    }
  }

  /**
   * Generate human-readable explanation for transaction risk
   */
  async generateTransactionExplanation(
    txData: TransactionDetails,
    riskAssessment: RiskAssessment
  ): Promise<string> {
    logger.info(`Generating transaction explanation for ${txData.hash}`);

    try {
      const prompt = this.buildTransactionPrompt(txData, riskAssessment);
      
      // In production: Call actual LLM API
      // For now, generate realistic mock explanation
      const explanation = this.generateMockTransactionExplanation(txData, riskAssessment);

      logger.debug('Transaction explanation generated successfully');
      return explanation;
    } catch (error) {
      logger.error('Error generating transaction explanation', error);
      // Fallback to basic explanation
      return this.generateFallbackTransactionExplanation(riskAssessment);
    }
  }

  /**
   * Build prompt for wallet risk explanation
   */
  private buildWalletPrompt(
    walletData: WalletActivityData,
    riskAssessment: RiskAssessment
  ): string {
    return `
You are a crypto fraud detection analyst explaining wallet risk to a non-expert user.

Wallet Address: ${walletData.address}
Chain: ${walletData.chain}
Risk Score: ${riskAssessment.riskScore}/100
Risk Level: ${riskAssessment.riskLevel}

Wallet Statistics:
- Balance: ${walletData.balance}
- Transaction Count: ${walletData.transactionCount}
- First Transaction: ${walletData.firstTransaction}
- Last Transaction: ${walletData.lastTransaction}
- Token Holdings: ${walletData.tokenHoldings.join(', ')}
- DeFi Protocols: ${walletData.defiProtocols.join(', ')}
- Contract Interactions: ${walletData.contractInteractions}

Risk Tags: ${riskAssessment.tags.join(', ')}
Risk Flags: ${riskAssessment.ruleBasedFlags.join(', ')}

Generate a clear, professional explanation with these sections:
1. **Summary** - One sentence overview of the risk level
2. **Key Risk Factors** - Bullet points of specific concerns
3. **Recommendation** - Clear action items for the user

Keep it concise, non-technical, and actionable.
`;
  }

  /**
   * Build prompt for transaction risk explanation
   */
  private buildTransactionPrompt(
    txData: TransactionDetails,
    riskAssessment: RiskAssessment
  ): string {
    return `
You are a crypto fraud detection analyst explaining transaction risk to a non-expert user.

Transaction Hash: ${txData.hash}
Chain: ${txData.chain}
Risk Score: ${riskAssessment.riskScore}/100
Risk Level: ${riskAssessment.riskLevel}

Transaction Details:
- From: ${txData.from}
- To: ${txData.to}
- Value: ${txData.value}
- Gas Used: ${txData.gasUsed}
- Status: ${txData.status}
- Block: ${txData.block}
- Timestamp: ${txData.timestamp}

Risk Tags: ${riskAssessment.tags.join(', ')}
Risk Flags: ${riskAssessment.ruleBasedFlags.join(', ')}

Explain why this transaction has ${riskAssessment.riskLevel} risk with clear bullet points.
Keep it concise and actionable.
`;
  }

  /**
   * Generate mock wallet explanation (simulates AI response)
   */
  private generateMockWalletExplanation(
    walletData: WalletActivityData,
    riskAssessment: RiskAssessment
  ): string {
    const { riskLevel, riskScore, tags, ruleBasedFlags } = riskAssessment;

    let explanation = '';

    // Summary
    if (riskLevel === 'critical') {
      explanation += '**CRITICAL ALERT:** This wallet exhibits severe red flags and should be considered extremely high risk.\n\n';
    } else if (riskLevel === 'high') {
      explanation += '**HIGH RISK:** This wallet shows multiple concerning patterns that warrant caution.\n\n';
    } else if (riskLevel === 'medium') {
      explanation += '**MODERATE RISK:** This wallet has some risk indicators but not definitively malicious.\n\n';
    } else {
      explanation += '**LOW RISK:** This wallet appears to follow normal usage patterns with minimal concerns.\n\n';
    }

    // Key Risk Factors
    explanation += '**Key Risk Factors:**\n';

    if (ruleBasedFlags.includes('blacklisted')) {
      explanation += '• ⚠️ Wallet is flagged in known sanctions/blacklist databases\n';
    }

    if (ruleBasedFlags.includes('mixer_interaction')) {
      explanation += '• ⚠️ Direct interactions with cryptocurrency mixing services detected\n';
    }

    if (ruleBasedFlags.includes('new_wallet')) {
      explanation += '• Recently created wallet with limited transaction history\n';
    }

    if (ruleBasedFlags.includes('whale_wallet')) {
      explanation += '• High-value wallet holding significant funds\n';
    }

    if (ruleBasedFlags.includes('high_volume')) {
      explanation += '• Very high transaction volume indicating automated or institutional activity\n';
    }

    if (ruleBasedFlags.includes('bot_detected')) {
      explanation += '• Automated bot-like transaction patterns detected\n';
    }

    if (tags.includes('defi')) {
      explanation += '• Active participation in DeFi protocols: ' + walletData.defiProtocols.join(', ') + '\n';
    }

    if (tags.includes('exchange')) {
      explanation += '• Connected to centralized exchange activity\n';
    }

    if (ruleBasedFlags.length === 0) {
      explanation += '• No significant risk indicators detected\n';
      explanation += '• Wallet shows consistent, legitimate usage patterns\n';
    }

    // Recommendation
    explanation += '\n**Recommendation:**\n';

    if (riskLevel === 'critical') {
      explanation += '• DO NOT INTERACT with this wallet under any circumstances\n';
      explanation += '• Report to compliance team immediately\n';
      explanation += '• Block all future transactions\n';
    } else if (riskLevel === 'high') {
      explanation += '• Exercise extreme caution before proceeding\n';
      explanation += '• Require enhanced due diligence and KYC verification\n';
      explanation += '• Monitor closely for any suspicious activity\n';
    } else if (riskLevel === 'medium') {
      explanation += '• Proceed with standard due diligence\n';
      explanation += '• Monitor transaction patterns\n';
      explanation += '• Consider additional verification for large amounts\n';
    } else {
      explanation += '• Safe to proceed with normal transactions\n';
      explanation += '• Continue standard monitoring\n';
      explanation += '• No special precautions required\n';
    }

    return explanation.trim();
  }

  /**
   * Generate mock transaction explanation (simulates AI response)
   */
  private generateMockTransactionExplanation(
    txData: TransactionDetails,
    riskAssessment: RiskAssessment
  ): string {
    const { riskLevel, riskScore, tags, ruleBasedFlags } = riskAssessment;

    let explanation = '';

    // Summary
    if (riskLevel === 'critical') {
      explanation += '**CRITICAL ALERT:** This transaction shows severe risk indicators.\n\n';
    } else if (riskLevel === 'high') {
      explanation += '**HIGH RISK:** This transaction exhibits concerning patterns.\n\n';
    } else if (riskLevel === 'medium') {
      explanation += '**MODERATE RISK:** This transaction has some elevated risk factors.\n\n';
    } else {
      explanation += '**LOW RISK:** This appears to be a standard transaction.\n\n';
    }

    // Key factors
    explanation += '**Analysis:**\n';

    if (ruleBasedFlags.includes('large_value')) {
      explanation += `• Large value transfer: ${txData.value}\n`;
    }

    if (ruleBasedFlags.includes('flash_loan_pattern')) {
      explanation += '• ⚠️ Flash loan attack pattern detected\n';
      explanation += '• Multiple DeFi pools manipulated in single transaction\n';
    }

    if (ruleBasedFlags.includes('contract_creation')) {
      explanation += '• New smart contract deployment detected\n';
      explanation += '• Requires verification before interaction\n';
    }

    if (tags.includes('token_swap')) {
      explanation += '• Standard token exchange/swap transaction\n';
    }

    if (tags.includes('bridge')) {
      explanation += '• Cross-chain bridge transaction\n';
    }

    if (ruleBasedFlags.includes('token_approval')) {
      explanation += '• ⚠️ Token approval granted - verify contract is legitimate\n';
    }

    if (txData.status === 'failed') {
      explanation += '• ⚠️ Transaction failed - possible attack attempt or error\n';
    }

    if (tags.includes('nft_trade')) {
      explanation += '• NFT marketplace transaction\n';
    }

    // Recommendation
    explanation += '\n**Recommendation:**\n';

    if (riskLevel === 'critical') {
      explanation += '• Block this transaction immediately\n';
      explanation += '• Investigate source and destination addresses\n';
      explanation += '• Alert security team\n';
    } else if (riskLevel === 'high') {
      explanation += '• Require manual review before approval\n';
      explanation += '• Verify all parties involved\n';
      explanation += '• Proceed only with explicit authorization\n';
    } else if (riskLevel === 'medium') {
      explanation += '• Review transaction details carefully\n';
      explanation += '• Verify contract addresses if applicable\n';
      explanation += '• Monitor for unusual follow-up activity\n';
    } else {
      explanation += '• Transaction appears legitimate\n';
      explanation += '• Safe to proceed\n';
      explanation += '• Standard monitoring applies\n';
    }

    return explanation.trim();
  }

  /**
   * Fallback explanation (used when AI service fails)
   */
  private generateFallbackWalletExplanation(riskAssessment: RiskAssessment): string {
    const { riskScore, riskLevel, tags } = riskAssessment;
    return `Risk Level: ${riskLevel.toUpperCase()} (Score: ${riskScore}/100)\n\nThis wallet has been flagged with the following indicators: ${tags.join(', ')}.\n\nPlease review the detailed risk analysis and proceed with appropriate caution.`;
  }

  /**
   * Fallback explanation for transactions
   */
  private generateFallbackTransactionExplanation(riskAssessment: RiskAssessment): string {
    const { riskScore, riskLevel, tags } = riskAssessment;
    return `Risk Level: ${riskLevel.toUpperCase()} (Score: ${riskScore}/100)\n\nThis transaction has been flagged with: ${tags.join(', ')}.\n\nReview the transaction details before proceeding.`;
  }

  /**
   * Call actual LLM API (for production use)
   * Currently returns mock data
   */
  private async callLLMAPI(prompt: string, retryCount: number = 0): Promise<string> {
    try {
      // In production, make actual API call:
      /*
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You are a crypto fraud detection analyst.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      return data.choices[0].message.content;
      */

      // For now, throw error to use mock fallback
      throw new Error('AI API not configured');
    } catch (error) {
      if (retryCount < this.maxRetries) {
        logger.warn(`AI API call failed, retrying (${retryCount + 1}/${this.maxRetries})`, error);
        await this.delay(1000 * (retryCount + 1)); // Exponential backoff
        return this.callLLMAPI(prompt, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Helper: Delay for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const aiService = new AIService();
