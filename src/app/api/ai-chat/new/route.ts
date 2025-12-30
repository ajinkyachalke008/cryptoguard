import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { aiConversations, aiMessages } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { initial_question, context_type, context_data } = body;

    if (!initial_question) {
      return NextResponse.json({ error: 'initial_question is required' }, { status: 400 });
    }

    // 1. Create conversation
    const newConversation = await db.insert(aiConversations)
      .values({
        userId: 1,
        contextType: context_type || 'general',
        contextData: context_data || null,
        createdAt: new Date().toISOString()
      })
      .returning();

    const conversationId = newConversation[0].id;

    // 2. Save user message
    await db.insert(aiMessages).values({
      conversationId,
      role: 'user',
      content: initial_question,
      timestamp: new Date().toISOString()
    });

    // 3. Generate mock AI response
    const response = `I've analyzed your question about "${initial_question.substring(0, 50)}${initial_question.length > 50 ? '...' : ''}". 

Based on my real-time data monitoring:
1. This appears to be a common pattern in the current DeFi landscape.
2. I recommend checking the risk score in our dedicated scanner for specific details.
3. Our records show no immediate critical alerts for this specific query, but constant monitoring is advised.

How else can I assist your investigation?`;

    // 4. Save AI message
    await db.insert(aiMessages).values({
      conversationId,
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      {
        conversation_id: conversationId,
        response: response
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}
