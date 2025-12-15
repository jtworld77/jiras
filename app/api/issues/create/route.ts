import { createIssue } from '@/lib/db/issues'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { projectId, title, description } = await request.json()
    const issue = await createIssue(projectId, title, description)
    return NextResponse.json(issue)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create issue' },
      { status: 500 }
    )
  }
}
