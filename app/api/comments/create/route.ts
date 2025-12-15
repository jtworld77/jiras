import { createComment } from '@/lib/db/comments'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { issueId, content } = await request.json()
    const comment = await createComment(issueId, content)
    return NextResponse.json(comment)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
