# Personal Jira

A simple personal Jira-like task management app for a single user.

## Features

- **Projects**: Create and manage multiple projects
- **Kanban Board**: Todo / Doing / Done columns
- **Issues**: Create, edit, and delete issues with title and description
- **Drag & Drop**: Reorder issues between columns with persistent order
- **Comments**: Add comments to issues
- **Auth**: Email magic link authentication via Supabase

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Drag & Drop**: @dnd-kit
- **Auth**: Supabase Auth (Magic Link)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up Supabase:
   - Create a new Supabase project at https://supabase.com
   - Run the SQL schema in `supabase/schema.sql` in your Supabase SQL editor
   - Get your project URL and anon key

3. Create `.env.local`:
```bash
cp .env.local.example .env.local
```

4. Add your Supabase credentials to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Database Schema

### Tables

- **projects**: id, name, description, user_id, created_at, updated_at
- **issues**: id, project_id, title, description, status, order_index, user_id, created_at, updated_at
- **comments**: id, issue_id, content, user_id, created_at

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring users can only access their own data.

## Project Structure

```
/workspace
├── app/
│   ├── auth/callback/      # Auth callback handler
│   ├── projects/
│   │   ├── [id]/          # Project board page
│   │   └── page.tsx       # Projects list page
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx           # Login page
├── components/
│   ├── IssueCard.tsx      # Issue display card
│   ├── IssueModal.tsx     # Issue details modal with comments
│   ├── KanbanBoard.tsx    # Main kanban board with drag & drop
│   ├── KanbanColumn.tsx   # Single kanban column
│   ├── LoginForm.tsx      # Magic link login form
│   ├── LogoutButton.tsx   # Logout button
│   ├── ProjectList.tsx    # Projects grid with create/delete
│   └── SortableIssueCard.tsx  # Draggable issue card wrapper
├── lib/
│   ├── queries/
│   │   ├── comments.ts    # Comment CRUD operations
│   │   ├── issues.ts      # Issue CRUD and reorder operations
│   │   └── projects.ts    # Project CRUD operations
│   └── supabase/
│       ├── client.ts      # Client-side Supabase client
│       └── server.ts      # Server-side Supabase client
├── supabase/
│   └── schema.sql         # Complete database schema
├── types/
│   └── index.ts           # TypeScript types
└── package.json
```

## Usage

1. **Login**: Enter your email and click the magic link sent to your inbox
2. **Create Project**: Click "New Project" and enter project details
3. **View Board**: Click on a project to view its kanban board
4. **Create Issue**: Click "+ Add issue" in any column
5. **Drag Issue**: Drag issues between columns or reorder within a column
6. **View/Edit Issue**: Click an issue to open the modal and edit details or add comments
7. **Delete**: Delete issues or projects using the delete buttons

## Notes

- Single user only (no teams or permissions)
- No plugins or advanced features
- Simple, explicit code over abstractions
- Server components for data fetching, client components for interactivity
