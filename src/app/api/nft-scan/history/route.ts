import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { nftScans } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    if (isNaN(limit) || limit < 1) {
      return NextResponse.json({ 
        error: 'Invalid limit parameter',
        code: 'INVALID_LIMIT' 
      }, { status: 400 });
    }

    if (isNaN(offset) || offset < 0) {
      return NextResponse.json({ 
        error: 'Invalid offset parameter',
        code: 'INVALID_OFFSET' 
      }, { status: 400 });
    }

    const userIdCondition = eq(nftScans.userId, 1);

    const totalResult = await db
      .select()
      .from(nftScans)
      .where(userIdCondition);

    const total = totalResult.length;

    const scans = await db
      .select()
      .from(nftScans)
      .where(userIdCondition)
      .orderBy(desc(nftScans.createdAt))
      .limit(limit)
      .offset(offset);

    const parsedScans = scans.map(scan => ({
      ...scan,
      scanData: scan.scanData ? JSON.parse(scan.scanData as string) : null
    }));

    const hasMore = offset + limit < total;

    return NextResponse.json({
      scans: parsedScans,
      pagination: {
        total,
        limit,
        offset,
        has_more: hasMore
      }
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}