import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { cases, caseItems } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const caseId = parseInt(id)
    
    const caseDetail = await db.query.cases.findFirst({
      where: eq(cases.id, caseId)
    })

    if (!caseDetail) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    const items = await db.query.caseItems.findMany({
      where: eq(caseItems.caseId, caseId)
    })

    return NextResponse.json({ 
      success: true, 
      case: caseDetail,
      items
    })
  } catch (error) {
    console.error("Failed to fetch case detail:", error)
    return NextResponse.json({ error: "Failed to fetch case detail" }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const caseId = parseInt(id)
    const body = await req.json()
    const { status, priority, title, description } = body

    const updateData: any = {
      updatedAt: new Date().toISOString()
    }
    if (status) updateData.status = status
    if (priority) updateData.priority = priority
    if (title) updateData.title = title
    if (description !== undefined) updateData.description = description

    const [updatedCase] = await db.update(cases)
      .set(updateData)
      .where(eq(cases.id, caseId))
      .returning()

    return NextResponse.json({ success: true, case: updatedCase })
  } catch (error) {
    console.error("Failed to update case:", error)
    return NextResponse.json({ error: "Failed to update case" }, { status: 500 })
  }
}
