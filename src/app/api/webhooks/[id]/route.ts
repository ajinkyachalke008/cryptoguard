import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { webhooks } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const webhookId = parseInt(params.id)

    // Verify webhook exists
    const webhook = await db.query.webhooks.findFirst({
      where: eq(webhooks.id, webhookId)
    })

    if (!webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 })
    }

    // Delete the webhook
    await db.delete(webhooks).where(eq(webhooks.id, webhookId))

    return NextResponse.json({ success: true, message: "Webhook revoked successfully" })
  } catch (error) {
    console.error("Failed to revoke webhook:", error)
    return NextResponse.json({ error: "Failed to revoke webhook" }, { status: 500 })
  }
}
