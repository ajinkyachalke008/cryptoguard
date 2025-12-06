import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { alerts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { status } = body;

    // Validate status if provided
    if (status && !['active', 'resolved', 'dismissed'].includes(status)) {
      return NextResponse.json(
        {
          error: 'Invalid status. Must be one of: active, resolved, dismissed',
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    // Check if alert exists
    const existingAlert = await db
      .select()
      .from(alerts)
      .where(eq(alerts.id, parseInt(id)))
      .limit(1);

    if (existingAlert.length === 0) {
      return NextResponse.json(
        {
          error: 'Alert not found',
          code: 'ALERT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: {
      status?: string;
      resolvedAt?: string;
    } = {};

    if (status) {
      updateData.status = status;

      // Set resolved_at if status changed to "resolved"
      if (status === 'resolved') {
        updateData.resolvedAt = new Date().toISOString();
      }
    }

    // Update alert
    const updated = await db
      .update(alerts)
      .set(updateData)
      .where(eq(alerts.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to update alert',
          code: 'UPDATE_FAILED',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    // Check if alert exists
    const existingAlert = await db
      .select()
      .from(alerts)
      .where(eq(alerts.id, parseInt(id)))
      .limit(1);

    if (existingAlert.length === 0) {
      return NextResponse.json(
        {
          error: 'Alert not found',
          code: 'ALERT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Delete alert
    const deleted = await db
      .delete(alerts)
      .where(eq(alerts.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to delete alert',
          code: 'DELETE_FAILED',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Alert deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
      },
      { status: 500 }
    );
  }
}