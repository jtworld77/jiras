# Architecture Overview

## Folder Structure

```
/workspace
├── app/                          # Next.js App Router
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts          # Auth callback handler
│   ├── projects/
│   │   ├── [id]/
│   │   │   └── page.tsx          # Project board (server component)
│   │   └── page.tsx              # Projects list (server component)
│   ├── globals.css               # Global styles with Tailwind
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Login page (server component)
│
├── components/                   # React components
│   ├── IssueCard.tsx            # Basic issue card display
│   ├── IssueModal.tsx           # Issue detail modal with edit/delete/comments
│   ├── KanbanBoard.tsx          # Main board with DndContext
│   ├── KanbanColumn.tsx         # Column with droppable area
│   ├── LoginForm.tsx            # Magic link auth form
│   ├── LogoutButton.tsx         # Logout functionality
│   ├── ProjectList.tsx          # Projects CRUD interface
│   └── SortableIssueCard.tsx    # Draggable wrapper for IssueCard
│
├── lib/
│   ├── queries/                 # Database query functions
│   │   ├── comments.ts          # CRUD for comments
│   │   ├── issues.ts            # CRUD + reorder for issues
│   │   └── projects.ts          # CRUD for projects
│   └── supabase/
│       ├── client.ts            # Client-side Supabase instance
│       └── server.ts            # Server-side Supabase with cookies
│
├── supabase/
│   └── schema.sql               # Complete DB schema with RLS
│
├── types/
│   └── index.ts                 # TypeScript types for DB models
│
├── .env.local.example           # Environment variables template
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Database Schema

### Tables

**projects**
- id: UUID (PK)
- name: TEXT
- description: TEXT
- user_id: UUID (FK → auth.users)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ

**issues**
- id: UUID (PK)
- project_id: UUID (FK → projects)
- title: TEXT
- description: TEXT
- status: TEXT (todo|doing|done)
- order_index: INTEGER
- user_id: UUID (FK → auth.users)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ

**comments**
- id: UUID (PK)
- issue_id: UUID (FK → issues)
- content: TEXT
- user_id: UUID (FK → auth.users)
- created_at: TIMESTAMPTZ

### Indexes
- Projects by user_id
- Issues by project_id, status
- Issues by (project_id, status, order_index) for efficient ordering
- Comments by issue_id

### RLS Policies
All tables have full CRUD policies ensuring users only access their own data.

## Key Components

### Authentication Flow
1. User enters email → `LoginForm.tsx`
2. Supabase sends magic link
3. User clicks link → `/auth/callback/route.ts`
4. Session established → redirects to `/projects`

### Data Flow
1. **Server Components** fetch initial data via `createClient()` from `lib/supabase/server.ts`
2. Pass data as props to **Client Components**
3. Client components use `lib/queries/*` for mutations
4. Queries use `lib/supabase/client.ts` for client-side operations

### Drag & Drop
- `@dnd-kit/core` for DndContext and drag overlay
- `@dnd-kit/sortable` for sortable lists within columns
- `@dnd-kit/utilities` for CSS transforms
- On drop: calculates new order_index, updates local state, persists to DB

### State Management
- Server components fetch initial state
- Client components manage local state with `useState`
- Optimistic updates: UI updates immediately, DB syncs async
- On error: reverts to previous state

## API Helpers

### Projects (`lib/queries/projects.ts`)
- `getProjects()` - List all user projects
- `getProject(id)` - Get single project
- `createProject(name, description?)` - Create new project
- `updateProject(id, updates)` - Update project
- `deleteProject(id)` - Delete project (cascades to issues)

### Issues (`lib/queries/issues.ts`)
- `getIssuesByProject(projectId)` - List issues for project
- `getIssue(id)` - Get single issue
- `createIssue(projectId, title, description?, status?)` - Create issue
- `updateIssue(id, updates)` - Update title/description
- `updateIssueStatus(id, status, newOrderIndex)` - Move between columns
- `reorderIssues(issues[])` - Batch update order indices
- `deleteIssue(id)` - Delete issue

### Comments (`lib/queries/comments.ts`)
- `getCommentsByIssue(issueId)` - List comments
- `createComment(issueId, content)` - Add comment
- `deleteComment(id)` - Delete comment

## Styling
- Tailwind CSS for all styling
- No custom CSS beyond Tailwind directives
- Dark/light mode CSS variables (respects system preference)
- Responsive grid layouts (1/2/3 columns based on screen size)
