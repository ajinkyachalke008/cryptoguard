import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { cases, caseItems } from "@/db/schema"
import { desc, eq } from "drizzle-orm"

export async function GET(req: NextRequest) {
  try {
    const allCases = await db.query.cases.findMany({
      orderBy: [desc(cases.updatedAt)]
    })

    return NextResponse.json({ success: true, cases: allCases })
  } catch (error) {
    console.error("Failed to fetch cases:", error)
    return NextResponse.json({ error: "Failed to fetch cases" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, description, priority } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const now = new Date().toISOString()
    const [newCase] = await db.insert(cases).values({
      title,
      description,
      priority: priority || 'medium',
      status: 'open',
      userId: 1, // Default user for demo
      createdAt: now,
      updatedAt: now
    }).returning()

    return NextResponse.json({ success: true, case: newCase }, { status: 201 })
  } catch (error) {
    console.error("Failed to create case:", error)
    return NextResponse.json({ error: "Failed to create case" }, { status: 500 })
  }
}
