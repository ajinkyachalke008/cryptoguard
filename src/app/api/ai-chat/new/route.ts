import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { aiConversations } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { context_type, context_data } = body;

    const newConversation = await db.insert(aiConversations)
      .values({
        userId: 1,
        contextType: context_type || 'general',
        contextData: context_data || null,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(
      {
        id: newConversation[0].id,
        user_id: newConversation[0].userId,
        context_type: newConversation[0].contextType,
        context_data: newConversation[0].contextData,
        created_at: newConversation[0].createdAt
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