# Personal Jira

A simple personal task management app with Kanban boards.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Auth**: Email magic link (single user)
- **Drag & Drop**: dnd-kit

## Features

- Projects management
- Kanban board (Todo / Doing / Done)
- Issues with drag & drop reordering
- Basic comments on issues
- Persistent order in database

## Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to SQL Editor and run the schema from `supabase/schema.sql`

### 2. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL` - Your project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your anon/public key

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── auth/callback/      # Auth callback handler
│   ├── login/              # Login page
│   ├── project/[id]/       # Project board page
│   │   └── issue/[issueId] # Issue detail page
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── page.tsx            # Projects list
├── components/
│   ├── comment-list.tsx
│   ├── delete-button.tsx
│   ├── issue-card.tsx
│   ├── issue-form.tsx
│   ├── kanban-board.tsx
│   └── kanban-column.tsx
├── lib/
│   ├── actions/            # Server actions
│   │   ├── auth.ts
│   │   ├── comments.ts
│   │   ├── issues.ts
│   │   └── projects.ts
│   └── supabase/           # Supabase clients
│       ├── client.ts
│       ├── middleware.ts
│       └── server.ts
├── types/
│   └── database.ts
└── middleware.ts
```

## Database Schema

### Tables

- **projects**: id, name, description, created_at, user_id
- **issues**: id, title, description, status, order, project_id, created_at, updated_at
- **comments**: id, content, issue_id, created_at

### Row Level Security

All tables have RLS enabled. Users can only access their own data.

## Authentication

Uses Supabase magic link authentication. Single user setup - just enter your email to receive a login link.

## License

MIT
