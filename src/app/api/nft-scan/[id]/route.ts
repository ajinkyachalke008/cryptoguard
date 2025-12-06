import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { nftScans } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    // Query NFT scan by ID
    const scan = await db.select()
      .from(nftScans)
      .where(eq(nftScans.id, parseInt(id)))
      .limit(1);

    // Check if scan exists
    if (scan.length === 0) {
      return NextResponse.json(
        { 
          error: 'NFT scan not found',
          code: 'SCAN_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Parse scan_data if it's a JSON string
    const scanResult = scan[0];
    let parsedScanData = scanResult.scanData;
    
    if (typeof scanResult.scanData === 'string') {
      try {
        parsedScanData = JSON.parse(scanResult.scanData);
      } catch (parseError) {
        console.error('Failed to parse scan_data:', parseError);
        // Keep original string if parsing fails
      }
    }

    // Return scan with parsed data
    return NextResponse.json({
      ...scanResult,
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