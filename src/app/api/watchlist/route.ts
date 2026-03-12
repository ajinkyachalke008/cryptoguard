import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { watchlists } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const blockchain = searchParams.get('blockchain');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Build query with filters
    let query: any = db.select().from(watchlists);

    // Filter by user_id = 1
    if (blockchain) {
      query = query.where(
        and(
          eq(watchlists.userId, 1),
          eq(watchlists.blockchain, blockchain)
        )
      );
    } else {
      query = query.where(eq(watchlists.userId, 1));
    }

    // Get total count for pagination
    const countQuery = blockchain
      ? db.select().from(watchlists).where(
          and(
            eq(watchlists.userId, 1),
            eq(watchlists.blockchain, blockchain)
          )
        )
      : db.select().from(watchlists).where(eq(watchlists.userId, 1));

    const [watchlistEntries, totalEntries] = await Promise.all([
      query.orderBy(desc(watchlists.createdAt)).limit(limit).offset(offset),
      countQuery
    ]);

    const total = totalEntries.length;
    const hasMore = offset + limit < total;

    return NextResponse.json({
      watchlist: watchlistEntries,
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
    const { wallet_address, blockchain, label, risk_threshold } = body;

    // Validate required fields
    if (!wallet_address) {
      return NextResponse.json(
        { error: 'wallet_address is required', code: 'MISSING_WALLET_ADDRESS' },
        { status: 400 }
      );
    }

    if (!blockchain) {
      return NextResponse.json(
        { error: 'blockchain is required', code: 'MISSING_BLOCKCHAIN' },
        { status: 400 }
      );
    }

    // Validate wallet_address format (basic validation)
    const trimmedWalletAddress = wallet_address.trim();
    if (trimmedWalletAddress.length === 0) {
      return NextResponse.json(
        { error: 'wallet_address cannot be empty', code: 'INVALID_WALLET_ADDRESS' },
        { status: 400 }
      );
    }

    // Validate blockchain
    const trimmedBlockchain = blockchain.trim().toLowerCase();
    if (trimmedBlockchain.length === 0) {
      return NextResponse.json(
        { error: 'blockchain cannot be empty', code: 'INVALID_BLOCKCHAIN' },
        { status: 400 }
      );
    }

    // Validate risk_threshold if provided
    let validatedRiskThreshold = 70; // default
    if (risk_threshold !== undefined && risk_threshold !== null) {
      const threshold = Number(risk_threshold);
      if (isNaN(threshold) || threshold < 0 || threshold > 100) {
        return NextResponse.json(
          { error: 'risk_threshold must be between 0 and 100', code: 'INVALID_RISK_THRESHOLD' },
          { status: 400 }
        );
      }
      validatedRiskThreshold = threshold;
    }

    // Check for duplicates (same wallet_address + blockchain for user_id = 1)
    const existingEntry = await db
      .select()
      .from(watchlists)
      .where(
        and(
          eq(watchlists.userId, 1),
          eq(watchlists.walletAddress, trimmedWalletAddress),
          eq(watchlists.blockchain, trimmedBlockchain)
        )
      )
      .limit(1);

    if (existingEntry.length > 0) {
      return NextResponse.json(
        { 
          error: 'Watchlist entry already exists for this wallet and blockchain', 
          code: 'DUPLICATE_ENTRY' 
        },
        { status: 409 }
      );
    }

    // Create new watchlist entry
    const newEntry = await db
      .insert(watchlists)
      .values({
        userId: 1,
        walletAddress: trimmedWalletAddress,
        blockchain: trimmedBlockchain,
        label: label?.trim() || null,
        riskThreshold: validatedRiskThreshold,
        lastActivityAt: null,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newEntry[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}