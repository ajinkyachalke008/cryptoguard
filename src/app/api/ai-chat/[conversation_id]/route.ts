import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { aiConversations, aiMessages } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { conversation_id: string } }
) {
  try {
    const conversationId = params.conversation_id;

    // Validate conversation ID
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

    // Get conversation from ai_conversations table
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

    // Get all messages for this conversation ordered by timestamp ASC
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

    // Construct response with conversation and messages
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