import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { marketplaceScans } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    const scan = await db.select()
      .from(marketplaceScans)
      .where(eq(marketplaceScans.id, parseInt(id)))
      .limit(1);

    if (scan.length === 0) {
      return NextResponse.json(
        { 
          error: 'Marketplace scan not found',
          code: 'SCAN_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    const scanData = scan[0];
    
    // Parse scan_data if it's a JSON string
    let parsedScanData = scanData.scanData;
    if (typeof scanData.scanData === 'string') {
      try {
        parsedScanData = JSON.parse(scanData.scanData);
      } catch (parseError) {
        console.error('Error parsing scan_data:', parseError);
        // Keep original string if parsing fails
      }
    }

    return NextResponse.json({
      ...scanData,
      scanData: parsedScanData
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}