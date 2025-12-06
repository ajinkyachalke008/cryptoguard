import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { nftScans } from '@/db/schema';
import { eq, desc, and, count } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

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

    const userIdCondition = eq(nftScans.userId, user.id);

    const [totalResult] = await db
      .select({ count: count() })
      .from(nftScans)
      .where(userIdCondition);

    const total = totalResult?.count ?? 0;

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