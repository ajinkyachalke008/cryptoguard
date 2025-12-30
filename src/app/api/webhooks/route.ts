import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { webhooks } from "@/db/schema"
import { desc, eq } from "drizzle-orm"

export async function GET(req: NextRequest) {
  try {
    const hooks = await db.query.webhooks.findMany({
      orderBy: [desc(webhooks.createdAt)]
    })

    return NextResponse.json({ success: true, webhooks: hooks })
  } catch (error) {
    console.error("Failed to fetch webhooks:", error)
    return NextResponse.json({ error: "Failed to fetch webhooks" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, url, events } = body

    if (!name || !url) {
      return NextResponse.json({ error: "Name and URL are required" }, { status: 400 })
    }

    const secret = `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
    
    const [newWebhook] = await db.insert(webhooks).values({
      name,
      url,
      events: events || ['alert.created'],
      secret,
      status: 'active',
      userId: 1, // Default user for demo
      createdAt: new Date().toISOString()
    }).returning()

    return NextResponse.json({ success: true, webhook: newWebhook }, { status: 201 })
  } catch (error) {
    console.error("Failed to create webhook:", error)
    return NextResponse.json({ error: "Failed to create webhook" }, { status: 500 })
  }
}
