import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { protocolScans } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse pagination parameters
    const limit = Math.min(
      parseInt(searchParams.get('limit') ?? '20'),
      100
    );
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const blockchain = searchParams.get('blockchain');

    // Validate pagination parameters
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { error: 'Invalid limit parameter', code: 'INVALID_LIMIT' },
        { status: 400 }
      );
    }

    if (isNaN(offset) || offset < 0) {
      return NextResponse.json(
        { error: 'Invalid offset parameter', code: 'INVALID_OFFSET' },
        { status: 400 }
      );
    }

    // Build query conditions (user_id = 1)
    const conditions = [eq(protocolScans.userId, 1)];

    if (blockchain) {
      conditions.push(eq(protocolScans.blockchain, blockchain));
    }

    const whereCondition = conditions.length > 1 
      ? and(...conditions) 
      : conditions[0];

    // Get total count for pagination
    const totalResult = await db
      .select()
      .from(protocolScans)
      .where(whereCondition);

    const total = totalResult.length;

    // Get paginated scans
    const scans = await db
      .select()
      .from(protocolScans)
      .where(whereCondition)
      .orderBy(desc(protocolScans.createdAt))
      .limit(limit)
      .offset(offset);

    // Parse scan_data JSON for each scan
    const parsedScans = scans.map(scan => ({
      ...scan,
      scanData: scan.scanData ? JSON.parse(scan.scanData as string) : null
    }));

    // Calculate pagination metadata
    const hasMore = offset + limit < total;

    return NextResponse.json(
      {
        scans: parsedScans,
        pagination: {
          total,
          limit,
          offset,
          has_more: hasMore
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET protocol scans error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}