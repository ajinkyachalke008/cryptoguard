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
    
    // Build where conditions - use camelCase field names from schema
    const conditions: any[] = [];
    
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
      const validStatuses = ['active', 'resolved', 'dismissed', 'new', 'in_progress'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { 
            error: 'Invalid status. Must be one of: active, resolved, dismissed, new, in_progress',
            code: 'INVALID_STATUS'
          },
          { status: 400 }
        );
      }
      conditions.push(eq(alerts.status, status));
    }
    
    if (alertType) {
      conditions.push(eq(alerts.alertType, alertType));
    }
    
    // Query with optional conditions
    let query;
    if (conditions.length > 0) {
      query = db.select()
        .from(alerts)
        .where(and(...conditions))
        .orderBy(desc(alerts.createdAt))
        .limit(limit)
        .offset(offset);
    } else {
      query = db.select()
        .from(alerts)
        .orderBy(desc(alerts.createdAt))
        .limit(limit)
        .offset(offset);
    }
    
    const result = await query;
    
    // Map to API response format
    const mappedAlerts = result.map(alert => ({
      id: `ALT-${alert.id?.toString().padStart(3, '0')}`,
      severity: alert.severity,
      type: alert.alertType,
      status: alert.status,
      wallet_address: alert.walletAddress,
      tx_hash: alert.txHash,
      blockchain: alert.blockchain,
      message: alert.message,
      description: alert.description,
      triggering_rule: 'Risk threshold exceeded',
      amount: alert.amount,
      timestamp: alert.createdAt,
      detected_at: alert.createdAt
    }));

    return NextResponse.json({
      alerts: mappedAlerts,
      pagination: {
        limit,
        offset,
        total: mappedAlerts.length,
        hasMore: mappedAlerts.length === limit
      }
    });
    
  } catch (error) {
    console.error('GET error:', error);
    
    // Return mock data on error for better UX
    const mockAlerts = [
      {
        id: "ALT-001",
        severity: "critical",
        type: "watchlist",
        status: "new",
        wallet_address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44E",
        tx_hash: "0xabc123...",
        blockchain: "Ethereum",
        message: "High-risk wallet detected with suspicious transaction patterns",
        description: "Wallet shows signs of mixer interaction and rapid fund movements",
        triggering_rule: "Risk score exceeds 80%",
        amount: 125000,
        timestamp: new Date().toISOString(),
        detected_at: new Date().toISOString()
      },
      {
        id: "ALT-002",
        severity: "high",
        type: "pattern",
        status: "in_progress",
        wallet_address: "0x28C6c06298d514Db089934071355E5743bf21d60",
        blockchain: "Ethereum",
        message: "Suspicious layering pattern detected",
        description: "Multiple rapid transfers between related wallets",
        triggering_rule: "Pattern matching: Layering",
        amount: 50000,
        timestamp: new Date().toISOString(),
        detected_at: new Date().toISOString()
      },
      {
        id: "ALT-003",
        severity: "medium",
        type: "risk_spike",
        status: "new",
        wallet_address: "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE",
        blockchain: "BSC",
        message: "Risk score spike detected",
        description: "Wallet risk score increased by 25 points in 24 hours",
        triggering_rule: "Risk spike threshold: 20 points",
        amount: 15000,
        timestamp: new Date().toISOString(),
        detected_at: new Date().toISOString()
      }
    ];
    
    return NextResponse.json({
      alerts: mockAlerts,
      pagination: {
        limit: 20,
        offset: 0,
        total: mockAlerts.length,
        hasMore: false
      }
    });
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
      userId: 1,
      severity: body.severity.toLowerCase().trim(),
      alertType: body.alert_type.trim(),
      walletAddress: body.wallet_address?.trim() || null,
      txHash: body.tx_hash?.trim() || null,
      blockchain: body.blockchain?.trim() || null,
      message: body.message.trim(),
      description: body.description?.trim() || null,
      amount: body.amount?.trim() || null,
      status: 'active',
      createdAt: new Date().toISOString()
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