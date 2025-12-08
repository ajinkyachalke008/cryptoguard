import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { scanLogs } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

const VALID_TYPES = ['wallet', 'transaction'] as const;
const VALID_STATUSES = ['success', 'error'] as const;

type ScanLogType = typeof VALID_TYPES[number];
type ScanLogStatus = typeof VALID_STATUSES[number];

function isValidType(type: string): type is ScanLogType {
  return VALID_TYPES.includes(type as ScanLogType);
}

function isValidStatus(status: string): status is ScanLogStatus {
  return VALID_STATUSES.includes(status as ScanLogStatus);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const log = await db.select()
        .from(scanLogs)
        .where(eq(scanLogs.id, parseInt(id)))
        .limit(1);

      if (log.length === 0) {
        return NextResponse.json({ 
          error: 'Scan log not found',
          code: 'NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(log[0]);
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const userId = searchParams.get('user_id');

    if (type && !isValidType(type)) {
      return NextResponse.json({ 
        error: "Invalid type. Must be 'wallet' or 'transaction'",
        code: "INVALID_TYPE" 
      }, { status: 400 });
    }

    if (status && !isValidStatus(status)) {
      return NextResponse.json({ 
        error: "Invalid status. Must be 'success' or 'error'",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    if (userId && isNaN(parseInt(userId))) {
      return NextResponse.json({ 
        error: "Invalid user_id. Must be a valid integer",
        code: "INVALID_USER_ID" 
      }, { status: 400 });
    }

    const conditions = [];
    if (type) {
      conditions.push(eq(scanLogs.type, type));
    }
    if (status) {
      conditions.push(eq(scanLogs.status, status));
    }
    if (userId) {
      conditions.push(eq(scanLogs.userId, parseInt(userId)));
    }

    let query = db.select().from(scanLogs);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const logs = await query
      .orderBy(desc(scanLogs.createdAt))
      .limit(limit)
      .offset(offset);

    let totalCount = 0;
    try {
      const countQuery = db.select({ count: scanLogs.id }).from(scanLogs);
      const countResult = conditions.length > 0 
        ? await countQuery.where(and(...conditions))
        : await countQuery;
      totalCount = countResult.length;
    } catch (error) {
      console.error('Error getting count:', error);
    }

    return NextResponse.json({
      data: logs,
      pagination: {
        limit,
        offset,
        total: totalCount
      }
    });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, identifier, status, duration_ms, user_id, error_message } = body;

    if (!type) {
      return NextResponse.json({ 
        error: "Type is required",
        code: "MISSING_TYPE" 
      }, { status: 400 });
    }

    if (!isValidType(type)) {
      return NextResponse.json({ 
        error: "Invalid type. Must be 'wallet' or 'transaction'",
        code: "INVALID_TYPE" 
      }, { status: 400 });
    }

    if (!identifier || typeof identifier !== 'string' || identifier.trim() === '') {
      return NextResponse.json({ 
        error: "Identifier is required and must be a non-empty string",
        code: "MISSING_IDENTIFIER" 
      }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ 
        error: "Status is required",
        code: "MISSING_STATUS" 
      }, { status: 400 });
    }

    if (!isValidStatus(status)) {
      return NextResponse.json({ 
        error: "Invalid status. Must be 'success' or 'error'",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    if (duration_ms === undefined || duration_ms === null) {
      return NextResponse.json({ 
        error: "Duration_ms is required",
        code: "MISSING_DURATION" 
      }, { status: 400 });
    }

    if (typeof duration_ms !== 'number' || !Number.isInteger(duration_ms) || duration_ms < 0) {
      return NextResponse.json({ 
        error: "Duration_ms must be a positive integer",
        code: "INVALID_DURATION" 
      }, { status: 400 });
    }

    if (user_id !== undefined && user_id !== null && (typeof user_id !== 'number' || !Number.isInteger(user_id))) {
      return NextResponse.json({ 
        error: "User_id must be a valid integer",
        code: "INVALID_USER_ID" 
      }, { status: 400 });
    }

    if (error_message !== undefined && error_message !== null && typeof error_message !== 'string') {
      return NextResponse.json({ 
        error: "Error_message must be a string",
        code: "INVALID_ERROR_MESSAGE" 
      }, { status: 400 });
    }

    const newLog = await db.insert(scanLogs).values({
      type: type.trim(),
      identifier: identifier.trim(),
      status: status.trim(),
      durationMs: duration_ms,
      userId: user_id ?? null,
      errorMessage: error_message ? error_message.trim() : null,
      createdAt: new Date().toISOString()
    }).returning();

    return NextResponse.json(newLog[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const existing = await db.select()
      .from(scanLogs)
      .where(eq(scanLogs.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Scan log not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { status, error_message, duration_ms } = body;

    const updates: Partial<typeof scanLogs.$inferInsert> = {};

    if (status !== undefined) {
      if (!isValidStatus(status)) {
        return NextResponse.json({ 
          error: "Invalid status. Must be 'success' or 'error'",
          code: "INVALID_STATUS" 
        }, { status: 400 });
      }
      updates.status = status.trim();
    }

    if (error_message !== undefined) {
      if (error_message !== null && typeof error_message !== 'string') {
        return NextResponse.json({ 
          error: "Error_message must be a string or null",
          code: "INVALID_ERROR_MESSAGE" 
        }, { status: 400 });
      }
      updates.errorMessage = error_message ? error_message.trim() : null;
    }

    if (duration_ms !== undefined) {
      if (typeof duration_ms !== 'number' || !Number.isInteger(duration_ms) || duration_ms < 0) {
        return NextResponse.json({ 
          error: "Duration_ms must be a positive integer",
          code: "INVALID_DURATION" 
        }, { status: 400 });
      }
      updates.durationMs = duration_ms;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(existing[0]);
    }

    const updated = await db.update(scanLogs)
      .set(updates)
      .where(eq(scanLogs.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const existing = await db.select()
      .from(scanLogs)
      .where(eq(scanLogs.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Scan log not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(scanLogs)
      .where(eq(scanLogs.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Scan log deleted successfully',
      deleted: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}