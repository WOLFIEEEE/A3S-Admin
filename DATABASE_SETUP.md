# Database Setup Guide

This project uses **Supabase** as the database provider and **Drizzle ORM** for database operations.

## 🚀 Quick Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned
3. Go to **Settings** → **Database** and copy the connection string
4. Go to **Settings** → **API** and copy the URL and keys

### 2. Environment Variables

Copy `env.example.txt` to `.env` and fill in your Supabase credentials:

```bash
# Database Connection
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/[database]

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# File Encryption (generate a 32-character key)
FILE_ENCRYPTION_KEY=your-32-character-encryption-key-here
```

### 3. Generate and Apply Database Schema

```bash
# Generate migration files
pnpm db:generate

# Apply schema to your database
pnpm db:push
```

## 📊 Database Schema

The database includes the following main entities:

### Clients
- **clients** - Client information and business details
- **client_files** - File uploads and documents
- **client_credentials** - Encrypted login credentials

### Projects
- **projects** - Accessibility compliance projects
- **project_milestones** - Project milestones and deliverables
- **project_developers** - Team member assignments
- **project_time_entries** - Time tracking
- **project_documents** - Project documentation
- **project_activities** - Activity logs

### Tickets
- **tickets** - Issue tracking and task management
- **ticket_comments** - Ticket discussions
- **ticket_attachments** - File attachments

## 🛠 Available Commands

```bash
# Generate migration files from schema changes
pnpm db:generate

# Apply schema changes to database
pnpm db:push

# Run migrations (for production)
pnpm db:migrate

# Open Drizzle Studio (database GUI)
pnpm db:studio

# Drop database (⚠️ DESTRUCTIVE)
pnpm db:drop
```

## 🔐 Security Features

- **Encrypted Credentials**: Client credentials are encrypted using AES-256
- **File Security**: Sensitive files are encrypted before storage
- **Row Level Security**: Supabase RLS policies protect data access
- **Type Safety**: Full TypeScript support with Drizzle ORM

## 📁 File Structure

```
src/lib/db/
├── index.ts              # Database connection and clients
├── schema/
│   ├── clients.ts        # Client-related tables
│   ├── projects.ts       # Project-related tables
│   ├── tickets.ts        # Ticket-related tables
│   └── index.ts          # Schema exports
└── queries/
    ├── clients.ts        # Client query functions
    ├── projects.ts       # Project query functions
    ├── tickets.ts        # Ticket query functions
    └── index.ts          # Query exports
```

## 🔄 Development Workflow

1. **Make Schema Changes**: Edit files in `src/lib/db/schema/`
2. **Generate Migration**: Run `pnpm db:generate`
3. **Apply Changes**: Run `pnpm db:push`
4. **Test**: Use `pnpm db:studio` to inspect data

## 🚨 Important Notes

- Always backup your database before running migrations in production
- Use `db:push` for development, `db:migrate` for production
- Keep your `FILE_ENCRYPTION_KEY` secure and consistent across environments
- The service role key should only be used server-side

## 🆘 Troubleshooting

### Connection Issues
- Verify your `DATABASE_URL` is correct
- Check if your IP is allowlisted in Supabase
- Ensure the database is not paused

### Migration Issues
- Run `pnpm db:drop` and `pnpm db:push` to reset (⚠️ loses data)
- Check for conflicting schema changes
- Verify all environment variables are set

### Type Issues
- Run `pnpm db:generate` after schema changes
- Restart your TypeScript server
- Check for circular imports in schema files
