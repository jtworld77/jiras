import { updateIssueStatus } from '@/lib/db/issues'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { id, status, position } = await request.json()
    const issue = await updateIssueStatus(id, status, position)
    return NextResponse.json(issue)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update issue' },
      { status: 500 }
    )
  }
}
