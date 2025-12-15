import { updateIssuePositions } from '@/lib/db/issues'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { updates } = await request.json()
    await updateIssuePositions(updates)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to reorder issues' },
      { status: 500 }
    )
  }
}
