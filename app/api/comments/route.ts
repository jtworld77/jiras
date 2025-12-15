import { getComments } from '@/lib/db/comments'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const issueId = searchParams.get('issueId')
    
    if (!issueId) {
      return NextResponse.json(
        { error: 'issueId is required' },
        { status: 400 }
      )
    }
    
    const comments = await getComments(issueId)
    return NextResponse.json(comments)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}
