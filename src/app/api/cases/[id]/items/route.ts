import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { caseItems, cases } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const caseId = parseInt(params.id)
    const body = await req.json()
    const { itemType, itemId } = body

    if (!itemType || !itemId) {
      return NextResponse.json({ error: "Item type and ID are required" }, { status: 400 })
    }

    // Verify case exists
    const caseExists = await db.query.cases.findFirst({
      where: eq(cases.id, caseId)
    })

    if (!caseExists) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    const [newItem] = await db.insert(caseItems).values({
      caseId,
      itemType,
      itemId,
      createdAt: new Date().toISOString()
    }).returning()

    // Update case updatedAt timestamp
    await db.update(cases)
      .set({ updatedAt: new Date().toISOString() })
      .where(eq(cases.id, caseId))

    return NextResponse.json({ success: true, item: newItem }, { status: 201 })
  } catch (error) {
    console.error("Failed to add item to case:", error)
    return NextResponse.json({ error: "Failed to add item to case" }, { status: 500 })
  }
}
