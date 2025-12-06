import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { alerts } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    
    // Filter parameters
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const alertType = searchParams.get('type');
    const userId = 1; // Hardcoded as per requirements
    
    // Build where conditions
    const conditions = [eq(alerts.user_id, userId)];
    
    if (severity) {
      const validSeverities = ['critical', 'high', 'medium', 'low'];
      if (!validSeverities.includes(severity)) {
        return NextResponse.json(
          { 
            error: 'Invalid severity. Must be one of: critical, high, medium, low',
            code: 'INVALID_SEVERITY'
          },
          { status: 400 }
        );
      }
      conditions.push(eq(alerts.severity, severity));
    }
    
    if (status) {
      const validStatuses = ['active', 'resolved', 'dismissed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { 
            error: 'Invalid status. Must be one of: active, resolved, dismissed',
            code: 'INVALID_STATUS'
          },
          { status: 400 }
        );
      }
      conditions.push(eq(alerts.status, status));
    }
    
    if (alertType) {
      conditions.push(eq(alerts.alert_type, alertType));
    }
    
    // Get total count for pagination
    const countResult = await db.select()
      .from(alerts)
      .where(and(...conditions));
    const total = countResult.length;
    
    // Get paginated results
    const results = await db.select()
      .from(alerts)
      .where(and(...conditions))
      .orderBy(desc(alerts.created_at))
      .limit(limit)
      .offset(offset);
    
    const hasMore = offset + limit < total;
    
    return NextResponse.json({
      alerts: results,
      pagination: {
        total,
        limit,
        offset,
        has_more: hasMore
      }
    });
    
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.severity) {
      return NextResponse.json(
        { 
          error: 'Severity is required',
          code: 'MISSING_SEVERITY'
        },
        { status: 400 }
      );
    }
    
    if (!body.alert_type) {
      return NextResponse.json(
        { 
          error: 'Alert type is required',
          code: 'MISSING_ALERT_TYPE'
        },
        { status: 400 }
      );
    }
    
    if (!body.message) {
      return NextResponse.json(
        { 
          error: 'Message is required',
          code: 'MISSING_MESSAGE'
        },
        { status: 400 }
      );
    }
    
    // Validate severity value
    const validSeverities = ['critical', 'high', 'medium', 'low'];
    if (!validSeverities.includes(body.severity)) {
      return NextResponse.json(
        { 
          error: 'Invalid severity. Must be one of: critical, high, medium, low',
          code: 'INVALID_SEVERITY'
        },
        { status: 400 }
      );
    }
    
    // Sanitize inputs
    const alertData = {
      user_id: 1, // Hardcoded as per requirements
      severity: body.severity.toLowerCase().trim(),
      alert_type: body.alert_type.trim(),
      wallet_address: body.wallet_address?.trim() || null,
      tx_hash: body.tx_hash?.trim() || null,
      blockchain: body.blockchain?.trim() || null,
      message: body.message.trim(),
      description: body.description?.trim() || null,
      amount: body.amount?.trim() || null,
      status: 'active', // Default status
      created_at: new Date().toISOString()
    };
    
    // Insert into database
    const newAlert = await db.insert(alerts)
      .values(alertData)
      .returning();
    
    return NextResponse.json(newAlert[0], { status: 201 });
    
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}