import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { walletScans } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const blockchain = searchParams.get('blockchain');
    
    // Validate pagination parameters
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json({ 
        error: "Invalid limit parameter",
        code: "INVALID_LIMIT" 
      }, { status: 400 });
    }
    
    if (isNaN(offset) || offset < 0) {
      return NextResponse.json({ 
        error: "Invalid offset parameter",
        code: "INVALID_OFFSET" 
      }, { status: 400 });
    }

    // Mock user ID (as specified in requirements)
    const userId = 1;

    // Build where conditions
    const conditions = [eq(walletScans.userId, userId)];
    
    if (blockchain) {
      conditions.push(eq(walletScans.chain, blockchain));
    }

    const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];

    // Get total count for pagination metadata
    const totalCountResult = await db.select()
      .from(walletScans)
      .where(whereCondition);
    
    const total = totalCountResult.length;

    // Get paginated scans
    const scans = await db.select()
      .from(walletScans)
      .where(whereCondition)
      .orderBy(desc(walletScans.createdAt))
      .limit(limit)
      .offset(offset);

    // Parse rawData JSON for each result
    const parsedScans = scans.map(scan => {
      let parsedRawData = null;
      
      if (scan.rawData) {
        try {
          parsedRawData = typeof scan.rawData === 'string' 
            ? JSON.parse(scan.rawData) 
            : scan.rawData;
        } catch (error) {
          console.error('Error parsing rawData for scan ID', scan.id, ':', error);
          parsedRawData = scan.rawData;
        }
      }

      return {
        ...scan,
        rawData: parsedRawData
      };
    });

    // Calculate pagination metadata
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
    console.error('GET wallet scans error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}