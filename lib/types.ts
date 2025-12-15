export type Project = {
  id: string
  user_id: string
  name: string
  created_at: string
}

export type Status = 'todo' | 'doing' | 'done'

export type Issue = {
  id: string
  project_id: string
  user_id: string
  title: string
  description: string | null
  status: Status
  position: number
  created_at: string
}

export type Comment = {
  id: string
  issue_id: string
  user_id: string
  content: string
  created_at: string
}
