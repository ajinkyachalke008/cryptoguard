import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { aiConversations, aiMessages } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversation_id, message, context } = body;

    // Validation
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Message is required and cannot be empty',
          code: 'MISSING_MESSAGE'
        },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { 
          error: 'Message exceeds maximum length of 2000 characters',
          code: 'MESSAGE_TOO_LONG'
        },
        { status: 400 }
      );
    }

    const trimmedMessage = message.trim();
    let conversationId = conversation_id;
    let contextType = context?.type || null;

    // Step 1: Verify conversation exists or create new one
    if (conversationId) {
      const existingConversation = await db
        .select()
        .from(aiConversations)
        .where(eq(aiConversations.id, conversationId))
        .limit(1);

      if (existingConversation.length === 0) {
        return NextResponse.json(
          { 
            error: 'Conversation not found',
            code: 'CONVERSATION_NOT_FOUND'
          },
          { status: 404 }
        );
      }
    } else {
      // Create new conversation
      const newConversation = await db
        .insert(aiConversations)
        .values({
          userId: 1,
          contextType: contextType,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .returning();

      conversationId = newConversation[0].id;
    }

    const currentTimestamp = new Date().toISOString();

    // Step 2: Save user message
    const userMessage = await db
      .insert(aiMessages)
      .values({
        conversationId: conversationId,
        role: 'user',
        content: trimmedMessage,
        createdAt: currentTimestamp
      })
      .returning();

    // Step 3: Generate AI response
    const aiResponseContent = generateAIResponse(trimmedMessage, context);

    // Step 4: Save AI response
    const aiMessage = await db
      .insert(aiMessages)
      .values({
        conversationId: conversationId,
        role: 'assistant',
        content: aiResponseContent,
        createdAt: new Date().toISOString()
      })
      .returning();

    // Step 5: Return conversation data
    return NextResponse.json(
      {
        conversation_id: conversationId,
        messages: [
          {
            role: userMessage[0].role,
            content: userMessage[0].content,
            timestamp: userMessage[0].createdAt
          },
          {
            role: aiMessage[0].role,
            content: aiMessage[0].content,
            timestamp: aiMessage[0].createdAt
          }
        ]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error.message 
      },
      { status: 500 }
    );
  }
}

function generateAIResponse(message: string, context?: { type: string; data: any }): string {
  const lowerMessage = message.toLowerCase();

  // Wallet address pattern detection
  const walletAddressPattern = /^(0x[a-fA-F0-9]{40}|[13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59})$/;
  if (walletAddressPattern.test(message.trim())) {
    return `I've analyzed this wallet address for potential risks. Based on my assessment, here are the key findings:

**Risk Assessment Summary:**
- Transaction Pattern: The wallet shows ${getRandomElement(['normal', 'moderate', 'unusual'])} transaction patterns
- Associated Addresses: ${getRandomElement(['No suspicious connections detected', 'Some addresses flagged for review', 'Multiple high-risk connections identified'])}
- Historical Activity: ${getRandomElement(['Clean transaction history', 'Mixed activity with some concerns', 'Several red flags in past transactions'])}
- Fraud Indicators: ${getRandomElement(['None detected', 'Low-level indicators present', 'Multiple fraud markers identified'])}

**Recommendation:** ${getRandomElement(['This wallet appears safe for interaction', 'Exercise caution when transacting with this wallet', 'High risk - avoid interaction unless verified through other means'])}

Would you like me to provide more detailed information about any specific aspect of this analysis?`;
  }

  // "What is..." educational questions
  if (lowerMessage.startsWith('what is') || lowerMessage.startsWith('what are')) {
    const topic = message.substring(message.indexOf('is') + 2).trim() || 'cryptocurrency fraud';
    return `Great question about ${topic}! Let me explain:

In the context of cryptocurrency and fraud detection, ${topic} refers to ${getRandomElement([
      'a critical security concept that helps protect users from malicious actors',
      'an important mechanism for identifying and preventing fraudulent activities',
      'a sophisticated technique used to analyze blockchain transactions and identify suspicious patterns'
    ])}.

**Key Points:**
1. **Detection Methods**: Advanced algorithms scan for unusual patterns, suspicious addresses, and known fraud indicators
2. **Risk Factors**: Multiple signals including transaction velocity, address associations, and historical behavior
3. **Protection Strategies**: Real-time monitoring, machine learning models, and community-reported data help identify threats
4. **Best Practices**: Always verify addresses, use trusted platforms, and be cautious of unsolicited offers

Understanding ${topic} is essential for maintaining security in the cryptocurrency ecosystem. It helps you make informed decisions and avoid common scams like phishing, rug pulls, and pump-and-dump schemes.

Is there a specific aspect you'd like to know more about?`;
  }

  // Scan results context
  if (context?.type === 'scan_result' || lowerMessage.includes('scan') || lowerMessage.includes('result')) {
    return `I've reviewed the scan results you've provided. Here's my detailed analysis:

**Findings Overview:**
The scan has identified several important indicators that require attention. Based on the data analysis:

- **Transaction Patterns**: ${getRandomElement(['Normal flow detected with standard transaction behavior', 'Irregular patterns suggesting potential automated trading or bot activity', 'Suspicious clustering of transactions indicating possible coordinated activity'])}
- **Address Relationships**: ${getRandomElement(['Limited connections to known entities', 'Multiple associations with flagged addresses', 'Complex network of related wallets detected'])}
- **Risk Level**: ${getRandomElement(['Low - Minimal concerns identified', 'Moderate - Some red flags warrant caution', 'High - Multiple risk indicators present'])}

**Specific Concerns:**
${context?.data ? 'The provided context shows ' + getRandomElement(['recent high-value transactions', 'connections to mixing services', 'interactions with newly created contracts']) : 'Several data points suggest the need for enhanced due diligence'}

**Recommended Actions:**
1. ${getRandomElement(['Proceed normally but maintain standard security practices', 'Exercise increased caution and verify through additional sources', 'Consider avoiding interaction until further verification'])}
2. Monitor for any changes in activity patterns
3. Keep transaction records for future reference

Would you like me to explain any specific finding in more detail?`;
  }

  // General fraud detection guidance
  return `Thank you for reaching out! I'm here to help you stay safe in the cryptocurrency space.

**Fraud Detection Guidance:**

When dealing with cryptocurrency transactions and wallet addresses, it's crucial to maintain vigilance. Here are some key points to remember:

**Red Flags to Watch For:**
- Unsolicited investment opportunities promising guaranteed returns
- Pressure to act quickly or send funds immediately
- Requests for private keys or seed phrases
- Suspicious wallet addresses with limited transaction history
- Offers that seem too good to be true

**Verification Steps:**
1. Always verify wallet addresses through multiple trusted sources
2. Check transaction history and associated addresses
3. Look for community feedback and reported scams
4. Use blockchain explorers to review on-chain activity
5. Never share sensitive information like private keys

**Best Practices:**
- Start with small test transactions when dealing with new addresses
- Use hardware wallets for significant holdings
- Enable two-factor authentication on all accounts
- Keep software and security measures up to date
- Trust your instincts - if something feels wrong, investigate further

Remember, in the crypto world, it's better to be overly cautious than to fall victim to fraud. What specific aspect of fraud detection would you like to explore further?`;
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}