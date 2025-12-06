import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { watchlist } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const id = params.id;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const requestBody = await request.json();

    // Security check: prevent user ID injection
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const { label, risk_threshold, last_activity_at } = requestBody;

    // Validate risk_threshold if provided
    if (risk_threshold !== undefined) {
      const threshold = Number(risk_threshold);
      if (isNaN(threshold) || threshold < 0 || threshold > 100) {
        return NextResponse.json(
          {
            error: 'Risk threshold must be a number between 0 and 100',
            code: 'INVALID_RISK_THRESHOLD',
          },
          { status: 400 }
        );
      }
    }

    // Check if record exists and belongs to user
    const existingRecord = await db
      .select()
      .from(watchlist)
      .where(and(eq(watchlist.id, parseInt(id)), eq(watchlist.userId, user.id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Watchlist entry not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: {
      label?: string;
      risk_threshold?: number;
      last_activity_at?: string;
      updatedAt: string;
    } = {
      updatedAt: new Date().toISOString(),
    };

    if (label !== undefined) {
      updateData.label = typeof label === 'string' ? label.trim() : label;
    }

    if (risk_threshold !== undefined) {
      updateData.risk_threshold = Number(risk_threshold);
    }

    if (last_activity_at !== undefined) {
      updateData.last_activity_at = last_activity_at;
    }

    // Update the record
    const updated = await db
      .update(watchlist)
      .set(updateData)
      .where(and(eq(watchlist.id, parseInt(id)), eq(watchlist.userId, user.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update watchlist entry', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const id = params.id;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists and belongs to user
    const existingRecord = await db
      .select()
      .from(watchlist)
      .where(and(eq(watchlist.id, parseInt(id)), eq(watchlist.userId, user.id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Watchlist entry not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete the record
    const deleted = await db
      .delete(watchlist)
      .where(and(eq(watchlist.id, parseInt(id)), eq(watchlist.userId, user.id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete watchlist entry', code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Removed from watchlist',
        deleted: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}