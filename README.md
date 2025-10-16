# A3S Admin Dashboard

<div align="center">

![A3S Logo](public/icon.png)

**Comprehensive WCAG 2.2 AA Compliance Solutions**

AI-Powered Accessibility Management Platform with Expert Oversight

[![Next.js](https://img.shields.io/badge/Next.js-15.3-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-Private-red)](LICENSE)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Tech Stack](#-tech-stack)

</div>

---

## 📋 Overview

A3S Admin Dashboard is a comprehensive accessibility compliance management platform designed to streamline WCAG 2.2 AA compliance workflows. Built with Next.js 15 and React 19, it combines AI-powered automation with expert human oversight to deliver professional accessibility solutions.

### Key Highlights

- 🤖 **AI-Powered Report Generation** - Automated accessibility reports with OpenRouter integration
- 📊 **Client & Project Management** - Complete CRM for accessibility clients
- 🎯 **Issue Tracking** - Google Sheets integration for real-time issue sync
- 👥 **Team Management** - Organization charts and team collaboration
- 📧 **Email Automation** - Resend integration for professional communications
- 🔔 **Smart Notifications** - Persistent notification system with action buttons
- 📱 **Mobile-First Design** - Fully responsive across all devices
- 🎨 **Modern UI/UX** - ShadCN UI components with dark mode support

---

## ✨ Features

### Core Features

#### 1. **Client Management**
- Create and manage accessibility clients
- Track client details, contacts, and communication history
- Link clients to multiple projects
- Document management (NDA, contracts, certifications)
- Activity timeline and audit logs

#### 2. **Project Management**
- Multi-step project creation wizard
- Google Sheets integration for issue tracking
- Credential management (FTP, GitHub, staging environments)
- Document versioning and file storage
- Project status tracking and reporting

#### 3. **AI Report Generation**
- 4-step streamlined report workflow
- Multiple report types (Executive, Technical, Compliance, Monthly)
- AI-powered content generation with OpenRouter
- Rich text editor for content customization
- Email delivery with CC/BCC support

#### 4. **Issue Tracking**
- Real-time Google Sheets synchronization
- WCAG guideline classification
- Severity and priority tracking
- Issue lifecycle management
- Bulk operations and filtering

#### 5. **Team Management**
- Internal and external team organization
- Role-based access control
- Organization chart visualization
- Team member profiles and assignments
- Reporting hierarchy

#### 6. **Notification System**
- Toast notifications with action buttons
- Persistent notification center
- Category-specific notifications
- Unread badge indicators
- Cross-tab synchronization

### Additional Features

- 🔐 **Authentication** - Clerk integration for secure auth
- 🗄️ **Database** - PostgreSQL with Drizzle ORM
- 📤 **Email Service** - Resend for transactional emails
- 🎨 **Theming** - Dark/Light mode with system preference
- 🔍 **Global Search** - KBar command palette (Cmd+K)
- 📊 **Data Tables** - Advanced filtering, sorting, pagination
- 🖼️ **File Upload** - Supabase storage integration
- ♿ **Accessibility** - WCAG 2.2 AA compliant interface

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- pnpm 8.x or higher
- PostgreSQL database
- Supabase account (for file storage)
- Clerk account (for authentication)
- Resend account (for emails)
- OpenRouter API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/a3s-admin.git
   cd a3s-admin
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/a3s_admin"
   
   # Authentication (Clerk)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   
   # Supabase (File Storage)
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   
   # Email (Resend)
   RESEND_API_KEY=re_...
   
   # AI (OpenRouter)
   OPENROUTER_API_KEY=sk-or-v1-...
   
   # Google Sheets Integration
   GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_SHEETS_CLIENT_EMAIL=a3s-admin@xxx.iam.gserviceaccount.com
   ```

4. **Set up the database**
   ```bash
   # Generate migrations
   pnpm db:generate
   
   # Run migrations
   pnpm db:push
   
   # Seed database (optional)
   pnpm db:seed
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📖 Documentation

For detailed documentation, see [DOCUMENTATION.md](DOCUMENTATION.md)

### Quick Links

- [Architecture Overview](DOCUMENTATION.md#architecture)
- [Feature Documentation](DOCUMENTATION.md#features)
- [API Reference](DOCUMENTATION.md#api-reference)
- [Database Schema](DOCUMENTATION.md#database-schema)
- [Notification System](NOTIFICATIONS_GUIDE.md)
- [Deployment Guide](DOCUMENTATION.md#deployment)

---

## 🛠️ Tech Stack

### Core Technologies

- **Framework**: [Next.js 15](https://nextjs.org/) - React framework with App Router
- **React**: [React 19](https://reactjs.org/) - UI library
- **TypeScript**: [TypeScript 5.7](https://www.typescriptlang.org/) - Type safety
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/) - Utility-first CSS

### UI Components

- **Component Library**: [ShadCN UI](https://ui.shadcn.com/) - Radix UI primitives
- **Icons**: [Tabler Icons](https://tabler.io/icons) - Modern icon set
- **Animations**: [Motion](https://motion.dev/) - Smooth animations
- **Rich Text**: [Tiptap](https://tiptap.dev/) - WYSIWYG editor

### Database & ORM

- **Database**: [PostgreSQL](https://www.postgresql.org/) - Relational database
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- **Migrations**: Drizzle Kit - Schema management

### Authentication & Storage

- **Auth**: [Clerk](https://clerk.com/) - User authentication
- **File Storage**: [Supabase](https://supabase.com/) - Object storage
- **Email**: [Resend](https://resend.com/) - Transactional emails

### AI & Integration

- **AI**: [OpenRouter](https://openrouter.ai/) - Multi-model AI API
- **Sheets**: [Google Sheets API](https://developers.google.com/sheets) - Issue sync
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/) - Toast notifications

### Development Tools

- **Linting**: ESLint - Code quality
- **Formatting**: Prettier - Code formatting
- **Git Hooks**: Husky - Pre-commit hooks
- **Type Checking**: TypeScript - Static analysis

---

## 📁 Project Structure

```
a3s-admin/
├── public/                  # Static assets
│   ├── icon.png            # App icon
│   ├── favicon.svg         # Favicon
│   └── manifest.json       # PWA manifest
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/           # API routes
│   │   ├── dashboard/     # Dashboard pages
│   │   └── layout.tsx     # Root layout
│   ├── components/        # React components
│   │   ├── ui/           # ShadCN UI components
│   │   ├── layout/       # Layout components
│   │   └── notifications/ # Notification components
│   ├── features/         # Feature modules
│   │   ├── clients/      # Client management
│   │   ├── projects/     # Project management
│   │   ├── reports/      # Report generation
│   │   ├── teams/        # Team management
│   │   └── tickets/      # Ticket system
│   ├── lib/              # Utilities & services
│   │   ├── ai/          # AI integration
│   │   ├── db/          # Database config
│   │   ├── email/       # Email service
│   │   ├── notifications/ # Notification service
│   │   └── utils.ts     # Utility functions
│   └── types/            # TypeScript types
├── scripts/              # Utility scripts
│   └── seed.ts          # Database seeding
├── .env.example         # Environment variables template
├── drizzle.config.ts    # Drizzle ORM config
├── tailwind.config.ts   # Tailwind configuration
├── tsconfig.json        # TypeScript config
├── package.json         # Dependencies
├── README.md            # This file
└── DOCUMENTATION.md     # Detailed documentation
```

---

## 🔧 Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint errors
pnpm format           # Format with Prettier
pnpm format:check     # Check formatting

# Database
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations
pnpm db:push          # Push schema changes
pnpm db:studio        # Open Drizzle Studio
pnpm db:seed          # Seed database with sample data
pnpm db:drop          # Drop database schema
```

---

## 🌐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | `pk_test_...` |
| `CLERK_SECRET_KEY` | Clerk secret key | `sk_test_...` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key | `eyJ...` |
| `RESEND_API_KEY` | Resend API key | `re_...` |
| `OPENROUTER_API_KEY` | OpenRouter API key | `sk-or-v1-...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` |
| `GOOGLE_SHEETS_PRIVATE_KEY` | Google service account key | - |
| `GOOGLE_SHEETS_CLIENT_EMAIL` | Google service account email | - |

See `.env.example` for a complete list.

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

```bash
# Or use Vercel CLI
vercel
```

### Docker

```bash
# Build image
docker build -t a3s-admin .

# Run container
docker run -p 3000:3000 a3s-admin
```

### Manual Deployment

```bash
# Build application
pnpm build

# Start production server
pnpm start
```

See [DOCUMENTATION.md#deployment](DOCUMENTATION.md#deployment) for detailed deployment guides.

---

## 📊 Database Schema

The application uses PostgreSQL with the following main tables:

- **clients** - Client information and contacts
- **projects** - Project details and configuration
- **reports** - AI-generated accessibility reports
- **accessibility_issues** - WCAG compliance issues
- **teams** - Internal and external teams
- **team_members** - Team member profiles
- **tickets** - Support ticket system
- **client_files** - Document management

See [DOCUMENTATION.md#database-schema](DOCUMENTATION.md#database-schema) for the complete schema.

---

## 🤝 Contributing

This is a private repository. For team members:

1. Create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. Push and create a pull request
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

---

## 📝 License

This project is private and proprietary. All rights reserved.

---

## 🆘 Support

For support and questions:

- 📧 Email: support@a3s.com
- 📚 Documentation: [DOCUMENTATION.md](DOCUMENTATION.md)
- 🐛 Issues: GitHub Issues (private repo)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [ShadCN UI](https://ui.shadcn.com/) - Beautiful UI components
- [Vercel](https://vercel.com/) - Hosting and deployment
- [Clerk](https://clerk.com/) - Authentication solution
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM

---

<div align="center">

**Built with ❤️ by the A3S Team**

[Website](https://a3s.com) • [Documentation](DOCUMENTATION.md) • [Changelog](CHANGELOG.md)

</div>
