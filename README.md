# Personal Jira

Simple personal project management app built with Next.js and Supabase.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up Supabase:
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql`
   - Copy your Supabase URL and anon key

3. Configure environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- Create and manage projects
- Kanban board with Todo/Doing/Done columns
- Drag & drop issues between columns
- Add comments to issues
- Persistent issue ordering

## Tech Stack

- Next.js 14 (App Router)
- Supabase (PostgreSQL)
- Tailwind CSS
- react-beautiful-dnd
