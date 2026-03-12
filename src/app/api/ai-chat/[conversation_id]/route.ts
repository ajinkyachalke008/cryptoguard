import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { aiConversations, aiMessages } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversation_id: string }> }
) {
  try {
    const { conversation_id } = await params;
    const conversationId = conversation_id;

    if (!conversationId || isNaN(parseInt(conversationId))) {
      return NextResponse.json(
        {
          error: 'Valid conversation ID is required',
          code: 'INVALID_CONVERSATION_ID'
        },
        { status: 400 }
      );
    }

    const parsedConversationId = parseInt(conversationId);

    const conversation = await db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.id, parsedConversationId))
      .limit(1);

    if (conversation.length === 0) {
      return NextResponse.json(
        {
          error: 'Conversation not found',
          code: 'CONVERSATION_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const messages = await db
      .select({
        id: aiMessages.id,
        role: aiMessages.role,
        content: aiMessages.content,
        timestamp: aiMessages.timestamp
      })
      .from(aiMessages)
      .where(eq(aiMessages.conversationId, parsedConversationId))
      .orderBy(asc(aiMessages.timestamp));

    const response = {
      id: conversation[0].id,
      user_id: conversation[0].userId,
      context_type: conversation[0].contextType,
      context_data: conversation[0].contextData,
      created_at: conversation[0].createdAt,
      messages: messages.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: msg.timestamp
      }))
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('GET conversation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversation_id: string }> }
) {
  try {
    const { conversation_id } = await params;
    const conversationId = conversation_id;
    const body = await request.json();
    const { question } = body;

    if (!question) {
      return NextResponse.json({ error: 'question is required' }, { status: 400 });
    }

    if (!conversationId || isNaN(parseInt(conversationId))) {
      return NextResponse.json({ error: 'Invalid conversation ID' }, { status: 400 });
    }

    const parsedConversationId = parseInt(conversationId);

    // 1. Verify conversation exists
    const conversation = await db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.id, parsedConversationId))
      .limit(1);

    if (conversation.length === 0) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // 2. Save user message
    await db.insert(aiMessages).values({
      conversationId: parsedConversationId,
      role: 'user',
      content: question,
      timestamp: new Date().toISOString()
    });

    // 3. Generate mock AI response
    const response = `I understand your follow-up about "${question.substring(0, 30)}". 

Based on my analysis, this further confirms the risk profile we initially discussed. I've cross-referenced this with our latest fraud patterns and found a 65% match with known sophisticated phishing tactics.

Is there a specific wallet address or transaction hash you'd like me to look into related to this?`;

    // 4. Save AI message
    await db.insert(aiMessages).values({
      conversationId: parsedConversationId,
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      {
        response: response
      },
      { status: 200 }
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
