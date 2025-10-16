# A3S Admin Dashboard - Complete Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Architecture](#architecture)
4. [Features & Workflows](#features--workflows)
5. [Database Schema](#database-schema)
6. [API Reference](#api-reference)
7. [Configuration](#configuration)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## Introduction

### What is A3S Admin Dashboard?

A3S Admin Dashboard is a comprehensive accessibility compliance management platform designed to streamline WCAG 2.2 AA compliance workflows. It combines AI-powered automation with expert human oversight to deliver professional accessibility solutions to clients.

### Target Audience

- Accessibility consultants
- Project managers
- Development teams
- QA teams
- Client stakeholders

### Key Benefits

- **Efficiency**: Automate repetitive tasks with AI
- **Quality**: Expert oversight ensures accuracy
- **Scalability**: Manage multiple clients and projects
- **Transparency**: Real-time tracking and reporting
- **Collaboration**: Team-based workflows
- **Compliance**: WCAG 2.2 AA compliant interface

---

## Getting Started

### System Requirements

#### Minimum Requirements
- Node.js 18.x or higher
- pnpm 8.x or higher
- 4GB RAM
- 10GB free disk space

#### Recommended Requirements
- Node.js 20.x
- pnpm 9.x
- 8GB RAM
- 20GB free disk space
- SSD storage

### Installation Steps

#### 1. Clone the Repository

```bash
git clone https://github.com/your-org/a3s-admin.git
cd a3s-admin
```

#### 2. Install Dependencies

```bash
pnpm install
```

This will install all required packages including:
- Next.js 15.3
- React 19.0
- TypeScript 5.7
- Tailwind CSS 4.0
- Drizzle ORM
- And all other dependencies

#### 3. Environment Setup

Create a `.env.local` file based on `.env.example`:

```bash
cp .env.example .env.local
```

Fill in all required environment variables (see [Configuration](#configuration) section).

#### 4. Database Setup

```bash
# Generate database schema
pnpm db:generate

# Push schema to database
pnpm db:push

# (Optional) Seed with sample data
pnpm db:seed
```

#### 5. Run Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

### First-Time Setup Checklist

- [ ] Install Node.js and pnpm
- [ ] Clone repository
- [ ] Install dependencies
- [ ] Set up PostgreSQL database
- [ ] Configure environment variables
- [ ] Set up Clerk authentication
- [ ] Configure Supabase storage
- [ ] Set up Resend email service
- [ ] Configure OpenRouter API
- [ ] Run database migrations
- [ ] Seed database (optional)
- [ ] Start development server
- [ ] Access application in browser
- [ ] Sign in with Clerk
- [ ] Verify all features work

---

## Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐  │
│  │   React    │  │  Next.js   │  │   Tailwind CSS      │  │
│  │   19.0     │  │   15.3     │  │      4.0            │  │
│  └────────────┘  └────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Server                          │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐  │
│  │  App Router│  │ API Routes │  │  Server Actions     │  │
│  │            │  │            │  │                     │  │
│  └────────────┘  └────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │   Supabase   │  │    Clerk     │
│   Database   │  │  (Storage)   │  │    (Auth)    │
└──────────────┘  └──────────────┘  └──────────────┘
        │                  
        │                  
        ▼                  
┌──────────────────────────────────────────┐
│         External Services                │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐│
│  │ Resend  │  │OpenRouter│ │  Google  ││
│  │ (Email) │  │   (AI)   │ │  Sheets  ││
│  └─────────┘  └─────────┘  └──────────┘│
└──────────────────────────────────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS 4.0
- **Components**: ShadCN UI (Radix UI primitives)
- **State Management**: React hooks, Zustand
- **Forms**: React Hook Form + Zod
- **Rich Text**: Tiptap
- **Icons**: Tabler Icons
- **Animations**: Motion

#### Backend
- **API**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **File Storage**: Supabase Storage

#### Authentication & Services
- **Auth**: Clerk
- **Email**: Resend
- **AI**: OpenRouter
- **Sheets**: Google Sheets API

#### Development Tools
- **Package Manager**: pnpm
- **Linter**: ESLint
- **Formatter**: Prettier
- **Git Hooks**: Husky
- **Type Checking**: TypeScript

### Application Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages
│   ├── dashboard/           # Main application
│   │   ├── clients/         # Client pages
│   │   ├── projects/        # Project pages
│   │   ├── reports/         # Report pages
│   │   ├── teams/           # Team pages
│   │   ├── tickets/         # Ticket pages
│   │   └── layout.tsx       # Dashboard layout
│   ├── api/                 # API routes
│   │   ├── clients/         # Client APIs
│   │   ├── projects/        # Project APIs
│   │   ├── reports/         # Report APIs
│   │   ├── teams/           # Team APIs
│   │   └── tickets/         # Ticket APIs
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # Shared components
│   ├── ui/                  # ShadCN UI components
│   ├── layout/              # Layout components
│   ├── notifications/       # Notification system
│   └── ...                  # Other shared components
├── features/                # Feature modules
│   ├── clients/             # Client feature
│   │   ├── components/      # Client-specific components
│   │   ├── hooks/           # Client hooks
│   │   └── types.ts         # Client types
│   ├── projects/            # Project feature
│   ├── reports/             # Report feature
│   ├── teams/               # Team feature
│   └── tickets/             # Ticket feature
├── lib/                     # Utilities & services
│   ├── ai/                  # AI integration
│   │   ├── openrouter-client.ts
│   │   └── report-prompts.ts
│   ├── db/                  # Database
│   │   ├── schema/          # Drizzle schemas
│   │   ├── queries/         # Database queries
│   │   └── index.ts         # DB connection
│   ├── email/               # Email service
│   │   └── resend-client.ts
│   ├── notifications/       # Notification service
│   │   ├── types.ts
│   │   ├── notification-service.ts
│   │   └── index.ts
│   ├── file-storage.ts      # File upload/download
│   ├── google-sheets.ts     # Google Sheets API
│   └── utils.ts             # Utility functions
└── types/                   # TypeScript types
    ├── client.ts
    ├── project.ts
    ├── report.ts
    ├── team.ts
    └── ...
```

### Data Flow

#### 1. User Authentication Flow

```
User → Sign In Page → Clerk → JWT Token → Protected Routes → Dashboard
```

#### 2. API Request Flow

```
Component → API Route → Drizzle ORM → PostgreSQL → Response → Component Update
```

#### 3. AI Report Generation Flow

```
User Input → Report Form → API Route → OpenRouter → AI Response → Editor → Database → Email
```

#### 4. File Upload Flow

```
File Select → Drag & Drop → Validation → Supabase API → Storage → URL → Database
```

---

## Features & Workflows

### 1. Client Management

#### Overview
Manage all your accessibility clients in one place. Track client information, contacts, projects, and communication history.

#### Key Features
- ✅ Create and edit clients
- ✅ Multiple contact persons per client
- ✅ Client industry and organization size tracking
- ✅ Document management (NDAs, contracts, certifications)
- ✅ Project association
- ✅ Activity timeline
- ✅ Search and filter clients
- ✅ Export client data

#### Workflow

##### Creating a New Client

**Step 1: Navigate to Clients**
```
Dashboard → Clients → New Client
```

**Step 2: Fill Basic Information**
- Client name (required)
- Industry
- Organization size
- Website URL
- Primary contact name
- Primary contact email
- Primary contact phone

**Step 3: Add Additional Contacts (Optional)**
- Add multiple contact persons
- Specify roles and departments
- Set communication preferences

**Step 4: Upload Documents (Optional)**
- NDA
- Service agreements
- Accessibility certifications
- Previous reports

**Step 5: Review and Save**
- Review all information
- Click "Create Client"
- Receive success notification

##### Managing Existing Clients

**View Client Details**
```
Clients List → Click Client Row → Client Detail Page
```

**Edit Client Information**
```
Client Detail → Edit Button → Update Form → Save Changes
```

**Delete Client**
```
Client Detail → Actions Menu → Delete → Confirm
```
⚠️ **Warning**: Deleting a client will also delete all associated projects, reports, and issues.

**Add Projects**
```
Client Detail → Projects Tab → New Project → Fill Form → Save
```

#### Best Practices

1. **Complete Information**: Fill in all available fields for better organization
2. **Primary Contact**: Always set a primary contact for communications
3. **Document Upload**: Upload important documents early in the relationship
4. **Regular Updates**: Keep client information up-to-date
5. **Communication Log**: Use the activity timeline to log important communications

---

### 2. Project Management

#### Overview
Projects are the core unit of work in A3S. Each project represents a website, application, or system being evaluated for accessibility compliance.

#### Key Features
- ✅ Multi-step project creation wizard
- ✅ Google Sheets integration for issue tracking
- ✅ Credential management (FTP, GitHub, staging)
- ✅ Document versioning and storage
- ✅ Issue lifecycle tracking
- ✅ Project status management
- ✅ Team assignment
- ✅ Accessibility goal tracking

#### Workflow

##### Creating a New Project

**Step 1: Basic Information**
```
Dashboard → Projects → New Project
```

Fill in:
- Project name (required)
- Client selection (required)
- Project description
- Website URL
- Project type (Website, Web App, Mobile App, etc.)
- WCAG level (A, AA, AAA)
- Target compliance date

**Step 2: Google Sheets Setup**

Option A: Connect Existing Sheet
1. Enter Google Sheet ID
2. Enter Sheet Name (tab name)
3. Click "Validate"
4. System verifies structure
5. Sync issues automatically

Option B: Create New Sheet
1. Click "Create New Sheet"
2. System creates template sheet
3. Sheet ID automatically populated
4. Ready to add issues

**Sheet Structure Required:**
```
Column A: Issue ID
Column B: Title
Column C: Description
Column D: WCAG Guideline
Column E: Severity (Critical/High/Medium/Low)
Column F: Status (Open/In Progress/Resolved/Closed)
Column G: Page URL
Column H: Element
Column I: Assigned To
Column J: Due Date
```

**Step 3: Credentials (Optional)**

Add access credentials for:
- **FTP/SFTP**: Host, username, password, port
- **GitHub**: Repository URL, access token
- **Staging**: URL, username, password
- **Production**: Access details
- **CMS**: Admin URL and credentials

All credentials are encrypted before storage.

**Step 4: Documents (Optional)**

Upload relevant documents:
- Requirements documents
- Design files
- Previous audit reports
- Style guides
- Component libraries

**Step 5: Team Assignment (Optional)**

Assign team members:
- Project manager
- QA testers
- Developers
- Accessibility consultants

**Step 6: Review and Create**
- Review all entered information
- Click "Create Project"
- Project is created and ready for issue tracking

##### Managing Project Issues

**View Issues**
```
Project Detail → Issues Tab
```

**Sync from Google Sheets**
```
Issues Tab → Sync Button
```
- System fetches latest data from Google Sheets
- New issues are created
- Existing issues are updated
- Status changes are reflected

**Filter Issues**
```
Issues Tab → Filter Dropdown
```
Filter by:
- Severity (Critical, High, Medium, Low)
- Status (Open, In Progress, Resolved, Closed)
- WCAG Guideline
- Assigned team member
- Due date

**Export Issues**
```
Issues Tab → Export Button → Select Format (CSV/Excel/PDF)
```

**Bulk Operations**
```
Select Multiple Issues → Actions Menu → 
  - Change Status
  - Assign To
  - Update Severity
  - Mark as Sent
```

##### Generating Reports

**Navigate to Report Generation**
```
Project Detail → Reports Tab → Generate Report
```

See [AI Report Generation](#3-ai-report-generation) section for detailed workflow.

#### Best Practices

1. **Google Sheets Structure**: Follow the required column structure exactly
2. **Regular Syncs**: Sync issues regularly to keep data current
3. **Credentials Security**: Only add credentials when absolutely necessary
4. **Team Assignment**: Assign team members early for accountability
5. **Status Updates**: Keep issue statuses current
6. **Document Everything**: Upload all relevant project documents

---

### 3. AI Report Generation

#### Overview
The AI Report Generation feature is the flagship capability of A3S. It automates the creation of professional accessibility reports using AI while allowing for human review and customization.

#### Key Features
- ✅ 4-step streamlined workflow
- ✅ Multiple report types
- ✅ AI-powered content generation
- ✅ Rich text editor for customization
- ✅ Email delivery with CC/BCC
- ✅ PDF export (coming soon)
- ✅ Custom branding (coming soon)

#### Report Types

##### 1. Executive Summary
**Purpose**: High-level overview for business stakeholders
**Audience**: Executives, managers, decision-makers
**Content**:
- Executive summary
- Key findings
- Business impact
- Risk assessment
- Actionable recommendations
- Timeline and next steps

##### 2. Technical Report
**Purpose**: Detailed technical analysis for developers
**Audience**: Development teams, QA engineers
**Content**:
- Technical issue details
- Code examples
- WCAG success criteria
- Remediation steps
- Testing procedures
- Implementation guidelines

##### 3. Compliance Report
**Purpose**: Legal and regulatory compliance
**Audience**: Compliance officers, legal teams
**Content**:
- Compliance status
- WCAG conformance level
- Non-conformance issues
- Risk levels
- Remediation requirements
- Certification readiness

##### 4. Monthly Progress Report
**Purpose**: Track ongoing improvements
**Audience**: Project managers, clients
**Content**:
- Period overview
- Issues resolved
- New issues discovered
- Progress metrics
- Upcoming milestones
- Resource allocation

##### 5. Custom Report
**Purpose**: Flexible report format
**Audience**: Any audience
**Content**: Customizable based on requirements

#### Workflow

##### Step 1: Select Project

```
Dashboard → Reports → Generate New Report
```

1. Click on project card or select from dropdown
2. Project details are displayed
3. Client information is loaded
4. Click "Next" to proceed

**Auto-advance**: Automatically moves to next step after selection

##### Step 2: Select Issues

1. View all project issues
2. Filter issues by:
   - Severity
   - Status
   - WCAG guideline
   - Assigned to
3. Select issues to include in report (checkboxes)
4. Enter report title (required)
5. Select report type (required)
6. Click "Next"

**Tips**:
- Select only issues relevant to report type
- Use descriptive report titles (e.g., "January 2025 Monthly Progress Report")
- For compliance reports, include all non-conformant issues

##### Step 3: Custom Instructions & Generate

1. **(Optional)** Add custom instructions for AI:
   ```
   Examples:
   - "Focus on critical issues first"
   - "Include code examples for all issues"
   - "Use simple, non-technical language"
   - "Emphasize business impact"
   ```

2. Click "Generate Report with AI"

3. **AI Processing** (30-60 seconds):
   - Status updates appear:
     - "Analyzing accessibility issues..."
     - "Generating AI report content..."
     - "Processing AI response..."
     - "Finalizing report..."
   - Progress bar shows activity
   - Robot icon animates

4. **Generation Complete**:
   - Success notification appears
   - Report content is loaded
   - Auto-advances to email configuration

**Behind the Scenes**:
- AI analyzes selected issues
- Reviews WCAG guidelines
- Generates appropriate content for report type
- Creates summary and recommendations
- Formats content in HTML
- Estimates reading time

##### Step 4: Configure & Send Email

**Email Body Editor**:
- Full rich text editing capabilities
- AI-generated content pre-loaded
- Edit, add, or remove content
- Format text, add lists, headings
- Preview changes in real-time

**Email Configuration**:

1. **Recipients** (Required):
   ```
   - Enter email address
   - Click "+" to add
   - Add multiple recipients
   - Remove with "X" button
   ```

2. **CC Recipients** (Optional):
   ```
   - Enter CC email address
   - Click "+" to add
   - Add multiple CC recipients
   - Remove with "X" button
   ```

3. **BCC Recipients** (Optional):
   ```
   - Enter BCC email address
   - Click "+" to add
   - Add multiple BCC recipients
   - Remove with "X" button
   ```

4. **Email Subject** (Required):
   ```
   Default: "Accessibility Report - [Project Name]"
   Customize as needed
   ```

5. **Sender Information** (Optional):
   ```
   - Your name
   - Company name
   ```

6. **Custom Message** (Optional):
   ```
   Add a personal message before the report content
   Example: "Thank you for your continued partnership..."
   ```

7. **Preview Email**:
   ```
   Click "Show Preview" to see formatted email
   ```

8. **Send Report**:
   ```
   Click "Send Report (X recipients)"
   - Report is saved to database
   - Emails are sent to all recipients
   - Issues are marked as "sent"
   - Success notification appears
   - Redirected to reports list
   ```

**Validation**:
- At least one recipient required
- Valid email format required
- Subject cannot be empty
- Email body cannot be empty
- Maximum 50 total recipients (TO + CC + BCC)

**Keyboard Shortcuts**:
- `Ctrl/Cmd + Enter`: Send email quickly

#### Email Template

The generated email includes:

```
┌─────────────────────────────────────────┐
│           Email Header                   │
│  Report Title                            │
│  Project Name | Issue Count              │
├─────────────────────────────────────────┤
│  Custom Message (if provided)            │
├─────────────────────────────────────────┤
│  Report Content Preview                  │
│  (AI-generated, user-edited)             │
│  - Executive Summary                     │
│  - Key Findings                          │
│  - Recommendations                       │
│  - Detailed Issues                       │
│  - Next Steps                            │
├─────────────────────────────────────────┤
│  Footer                                  │
│  - Generated by A3S                      │
│  - Sender name (if provided)             │
│  - Company name (if provided)            │
└─────────────────────────────────────────┘
```

#### AI Report Customization

##### Editing Generated Content

**Rich Text Editor Features**:
- **Formatting**: Bold, italic, strikethrough
- **Headings**: H1, H2, H3
- **Lists**: Bullet lists, numbered lists
- **Quotes**: Block quotes
- **Code**: Inline code, code blocks
- **Links**: Insert hyperlinks
- **Undo/Redo**: Ctrl+Z, Ctrl+Shift+Z

**Editing Tips**:
1. Review AI-generated content for accuracy
2. Add company-specific terminology
3. Adjust tone for target audience
4. Add or remove sections as needed
5. Include specific examples or recommendations
6. Verify WCAG guideline references

##### Custom Instructions Best Practices

**Effective Instructions**:
- ✅ "Focus on user experience impact"
- ✅ "Include specific code examples"
- ✅ "Use language suitable for non-technical stakeholders"
- ✅ "Prioritize issues by business risk"
- ✅ "Include implementation timelines"

**Ineffective Instructions**:
- ❌ "Make it good"
- ❌ "Write report"
- ❌ Too vague or generic

#### Report Management

##### View Report History

```
Dashboard → Reports → View All Reports
```

**Filter Options**:
- Client
- Project
- Report type
- Status (Draft, Generated, Sent)
- Date range

##### Edit Existing Report

```
Reports List → Click Report → Edit Button
```
- Modify content
- Update metadata
- Resend to additional recipients

##### Delete Report

```
Report Detail → Actions → Delete → Confirm
```
⚠️ **Warning**: This action cannot be undone

#### Troubleshooting

**AI Generation Fails**:
- Check OpenRouter API key
- Verify API quota
- Check network connection
- Retry generation

**Email Sending Fails**:
- Verify Resend API key
- Check recipient email addresses
- Verify sender domain is configured
- Check API rate limits

**Empty Report Content**:
- Verify issues are selected
- Check AI response in console
- Try regenerating with different instructions

---

### 4. Issue Tracking

#### Overview
Issues are the core data for accessibility compliance. They represent WCAG violations discovered during audits and testing.

#### Key Features
- ✅ Google Sheets synchronization
- ✅ WCAG guideline classification
- ✅ Severity levels (Critical, High, Medium, Low)
- ✅ Priority tracking
- ✅ Status workflow (Open → In Progress → Resolved → Closed)
- ✅ Assignment to team members
- ✅ Due date tracking
- ✅ Bulk operations
- ✅ Filtering and search
- ✅ Export capabilities

#### Issue Lifecycle

```
[Open] → [In Progress] → [Resolved] → [Closed]
   ↑                           ↓
   └───────── [Reopened] ──────┘
```

**Open**: Issue discovered, not yet addressed
**In Progress**: Team member working on fix
**Resolved**: Fix implemented, awaiting verification
**Closed**: Verified fixed and complete
**Reopened**: Issue recurred or fix incomplete

#### WCAG Guidelines

Issues are classified by WCAG 2.2 success criteria:

**Perceivable**:
- 1.1 Text Alternatives
- 1.2 Time-based Media
- 1.3 Adaptable
- 1.4 Distinguishable

**Operable**:
- 2.1 Keyboard Accessible
- 2.2 Enough Time
- 2.3 Seizures and Physical Reactions
- 2.4 Navigable
- 2.5 Input Modalities

**Understandable**:
- 3.1 Readable
- 3.2 Predictable
- 3.3 Input Assistance

**Robust**:
- 4.1 Compatible

#### Severity Levels

**Critical**:
- Blocks core functionality
- Affects large user base
- Legal compliance risk
- Immediate action required

**High**:
- Significant usability impact
- Affects important features
- WCAG Level A violations
- Should be fixed soon

**Medium**:
- Moderate usability impact
- WCAG Level AA violations
- Should be addressed in regular sprint

**Low**:
- Minor usability impact
- WCAG Level AAA violations
- Fix when possible

#### Google Sheets Integration

##### Setup

1. **Create Google Service Account**:
   ```
   Google Cloud Console → IAM & Admin → Service Accounts → Create
   ```

2. **Generate Key**:
   ```
   Service Account → Keys → Add Key → JSON
   ```

3. **Share Sheet**:
   ```
   Google Sheet → Share → Add service account email → Editor access
   ```

4. **Configure Environment**:
   ```env
   GOOGLE_SHEETS_CLIENT_EMAIL=xxx@xxx.iam.gserviceaccount.com
   GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
   ```

##### Synchronization

**Manual Sync**:
```
Project Detail → Issues Tab → Sync Button
```

**What Happens**:
1. System connects to Google Sheets
2. Fetches all rows
3. Creates new issues not in database
4. Updates existing issues with changes
5. Preserves database-only fields (sentAt, reportsSent, etc.)
6. Displays sync results

**Auto-Sync** (Coming Soon):
- Scheduled sync every 15 minutes
- Webhook-based instant sync

##### Sheet Best Practices

1. **Don't Delete Columns**: System expects specific columns
2. **Use Dropdowns**: Add data validation for Status, Severity
3. **Unique IDs**: Ensure Issue ID column has unique values
4. **Clean Data**: Avoid special characters in IDs
5. **Regular Updates**: Update sheet regularly, sync to database
6. **Backup**: Keep backup copy of sheet

#### Workflow

##### Viewing Issues

```
Dashboard → Projects → Select Project → Issues Tab
```

**Issue List View**:
- Issue ID
- Title
- WCAG Guideline
- Severity badge
- Status badge
- Assigned to
- Due date
- Actions

##### Filtering Issues

```
Issues Tab → Filters
```

**Filter Options**:
- Severity: All / Critical / High / Medium / Low
- Status: All / Open / In Progress / Resolved / Closed
- WCAG: Select guideline
- Assigned: Select team member
- Due Date: Date range

##### Bulk Operations

1. **Select Issues**: Check boxes next to issues
2. **Open Actions Menu**: Click "Actions" dropdown
3. **Choose Operation**:
   - Change Status
   - Update Severity
   - Assign To
   - Set Due Date
   - Mark as Sent
   - Delete

##### Exporting Issues

```
Issues Tab → Export Button → Select Format
```

**Export Formats**:
- CSV (Excel compatible)
- Excel (XLSX)
- PDF (formatted report)
- JSON (for integrations)

**Export Options**:
- Current filters
- All issues
- Selected issues only

---

### 5. Team Management

#### Overview
Manage your organization's teams, including both internal staff and external contractors. Track roles, hierarchies, and assignments.

#### Key Features
- ✅ Internal and external teams
- ✅ Team member profiles
- ✅ Role-based organization
- ✅ Reporting hierarchy
- ✅ Organization chart visualization
- ✅ Team assignments to projects
- ✅ Availability tracking

#### Team Types

**Internal Teams**:
- Company employees
- Direct management
- Full access to system

**External Teams**:
- Contractors
- Consultants
- Partner organizations
- Limited access based on assignments

#### Roles

**Executive Level**:
- **CEO**: Chief Executive Officer
- **CTO**: Chief Technology Officer

**Management Level**:
- **Manager**: Team manager
- **Team Lead**: Project team leader
- **Project Manager**: Project oversight

**Technical Level**:
- **Senior Developer**: Experienced developer
- **Developer**: Standard developer
- **QA Engineer**: Quality assurance
- **Accessibility Specialist**: WCAG expert

**Support Level**:
- **Support Engineer**: Technical support
- **Consultant**: External expert

#### Workflow

##### Creating a Team

```
Dashboard → Teams → New Team
```

**Step 1: Team Information**
- Team name (required)
- Team type (Internal/External)
- Description
- Manager (optional)

**Step 2: Save**
- Click "Create Team"
- Team is created
- Ready to add members

##### Adding Team Members

```
Teams → Select Team → New Member
```

**Step 1: Basic Information**
- First name (required)
- Last name (required)
- Email (required)
- Phone
- Job title

**Step 2: Team & Role**
- Select team (required)
- Select role (required)
- Department
- Reports to (manager)
- Start date

**Step 3: Save**
- Click "Create Team Member"
- Member is added to team
- Can now be assigned to projects

##### Organization Chart

```
Teams → Organization Chart
```

**Features**:
- Visual hierarchy
- Interactive nodes
- Zoom and pan
- Export as image
- Print capability

**Navigation**:
- Click node: View member details
- Drag: Pan chart
- Scroll: Zoom in/out
- Double-click: Center on node

##### Assigning Teams to Projects

```
Project Detail → Team Tab → Assign Team Members
```

**Process**:
1. Select team members
2. Assign roles on project
3. Set availability percentage
4. Save assignments

#### Best Practices

1. **Clear Hierarchy**: Define reporting structure clearly
2. **Regular Updates**: Keep team information current
3. **Role Clarity**: Assign appropriate roles
4. **Contact Information**: Keep contact details updated
5. **Availability**: Track team member availability

---

### 6. Notification System

#### Overview
The A3S notification system provides real-time feedback for all user actions, with persistent history and actionable notifications.

#### Key Features
- ✅ Toast notifications with rich colors
- ✅ Action buttons (Retry, Undo, View)
- ✅ Persistent notification center
- ✅ Unread badge indicators
- ✅ Category-specific notifications
- ✅ Cross-tab synchronization
- ✅ Mobile-responsive design

#### Notification Types

**Success** (Green):
- Operations completed successfully
- Items created/updated/deleted
- Reports generated
- Emails sent

**Error** (Red):
- Operation failures
- Validation errors
- API errors
- Network issues

**Warning** (Yellow):
- Potential issues
- Confirmations needed
- Data quality issues

**Info** (Blue):
- General information
- Status updates
- Tips and suggestions

**Loading** (Blue, animated):
- Long-running operations
- Processing indicators

#### Notification Center

**Location**: Header, bell icon

**Features**:
- View recent 20 notifications
- Unread badge counter
- Time-relative timestamps ("2 minutes ago")
- Mark as read (individual or all)
- Delete notifications
- Clear all history
- Auto-sync across tabs

**Usage**:
```
Header → Click Bell Icon → Notification Center Opens
```

#### Action Buttons

Many notifications include action buttons:

**Retry**:
- Failed operations
- Allows immediate retry
- Example: "Failed to save - Retry?"

**Undo**:
- Reversible actions
- Delete operations
- Example: "Client deleted - Undo?"

**View**:
- Navigate to created items
- Quick access
- Example: "Project created - View?"

#### For Developers

See [NOTIFICATIONS_GUIDE.md](NOTIFICATIONS_GUIDE.md) for complete API documentation and usage examples.

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────┐       ┌───────────────┐
│   Clients   │──1:N──│   Projects   │──1:N──│    Issues     │
└─────────────┘       └──────────────┘       └───────────────┘
                              │                       │
                              │                       │
                              │                       │
                              │1:N                    │N:M
                              │                       │
                              ▼                       ▼
                       ┌──────────────┐       ┌───────────────┐
                       │   Reports    │──N:M──│ Report Issues │
                       └──────────────┘       └───────────────┘
                              │
                              │1:N
                              ▼
                       ┌──────────────┐
                       │ Client Files │
                       └──────────────┘

┌─────────────┐       ┌──────────────┐
│    Teams    │──1:N──│ Team Members │
└─────────────┘       └──────────────┘
       │                      │
       │                      │
       │N:M                   │N:M
       │                      │
       ▼                      ▼
┌──────────────────────────────────┐
│    Project Team Assignments       │
└──────────────────────────────────┘
```

### Core Tables

#### clients

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  organization_size VARCHAR(50),
  website_url TEXT,
  primary_contact_name VARCHAR(255),
  primary_contact_email VARCHAR(255),
  primary_contact_phone VARCHAR(50),
  billing_address TEXT,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(255),
  metadata JSONB
);
```

**Indexes**:
- `idx_clients_name` ON name
- `idx_clients_status` ON status
- `idx_clients_created_at` ON created_at

#### projects

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  website_url TEXT,
  project_type VARCHAR(100),
  wcag_level VARCHAR(10),
  target_compliance_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  google_sheet_id VARCHAR(255),
  google_sheet_name VARCHAR(255),
  last_synced_at TIMESTAMP,
  credentials JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(255),
  metadata JSONB
);
```

**Indexes**:
- `idx_projects_client_id` ON client_id
- `idx_projects_status` ON status
- `idx_projects_created_at` ON created_at

#### accessibility_issues

```sql
CREATE TABLE accessibility_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  issue_id VARCHAR(100) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  wcag_guideline VARCHAR(100),
  severity VARCHAR(50),
  priority VARCHAR(50),
  status VARCHAR(50) DEFAULT 'open',
  page_url TEXT,
  element TEXT,
  assigned_to VARCHAR(255),
  due_date DATE,
  sent_at TIMESTAMP,
  reports_sent INTEGER DEFAULT 0,
  last_sent_month VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  synced_at TIMESTAMP,
  metadata JSONB,
  UNIQUE(project_id, issue_id)
);
```

**Indexes**:
- `idx_issues_project_id` ON project_id
- `idx_issues_status` ON status
- `idx_issues_severity` ON severity
- `idx_issues_wcag` ON wcag_guideline
- `idx_issues_assigned_to` ON assigned_to

#### reports

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  report_type VARCHAR(100) NOT NULL,
  ai_generated_content TEXT,
  edited_content TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  sent_at TIMESTAMP,
  sent_to TEXT[],
  cc_recipients TEXT[],
  bcc_recipients TEXT[],
  email_subject VARCHAR(500),
  email_body TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(255),
  metadata JSONB
);
```

**Indexes**:
- `idx_reports_project_id` ON project_id
- `idx_reports_status` ON status
- `idx_reports_created_at` ON created_at

#### teams

```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  team_type VARCHAR(50) NOT NULL,
  description TEXT,
  manager_id UUID REFERENCES team_members(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);
```

#### team_members

```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  role VARCHAR(100) NOT NULL,
  title VARCHAR(255),
  department VARCHAR(255),
  reports_to_id UUID REFERENCES team_members(id),
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);
```

### Relationships

**One-to-Many**:
- clients → projects
- projects → accessibility_issues
- projects → reports
- teams → team_members

**Many-to-Many**:
- reports ↔ accessibility_issues (through report_issues junction table)
- projects ↔ teams (through project_teams junction table)

---

## API Reference

### REST API Endpoints

#### Clients

```http
GET    /api/clients              # List all clients
POST   /api/clients              # Create new client
GET    /api/clients/:id          # Get client details
PATCH  /api/clients/:id          # Update client
DELETE /api/clients/:id          # Delete client
GET    /api/clients/:id/projects # Get client's projects
```

#### Projects

```http
GET    /api/projects             # List all projects
POST   /api/projects             # Create new project
GET    /api/projects/:id         # Get project details
PATCH  /api/projects/:id         # Update project
DELETE /api/projects/:id         # Delete project
POST   /api/projects/:id/sync    # Sync issues from Google Sheets
GET    /api/projects/:id/issues  # Get project issues
```

#### Reports

```http
GET    /api/reports              # List all reports
POST   /api/reports              # Create new report
GET    /api/reports/:id          # Get report details
PATCH  /api/reports/:id          # Update report
DELETE /api/reports/:id          # Delete report
POST   /api/reports/generate     # Generate AI report
POST   /api/reports/send-email   # Send report via email
```

#### Teams

```http
GET    /api/teams                # List all teams
POST   /api/teams                # Create new team
GET    /api/teams/:id            # Get team details
PATCH  /api/teams/:id            # Update team
DELETE /api/teams/:id            # Delete team
GET    /api/teams/members        # List all team members
POST   /api/teams/members        # Create team member
GET    /api/teams/members/:id    # Get member details
PATCH  /api/teams/members/:id    # Update member
DELETE /api/teams/members/:id    # Delete member
```

### API Request/Response Examples

#### Create Client

**Request**:
```http
POST /api/clients
Content-Type: application/json

{
  "name": "Acme Corporation",
  "industry": "Technology",
  "organizationSize": "500-1000",
  "websiteUrl": "https://acme.com",
  "primaryContactName": "John Doe",
  "primaryContactEmail": "john@acme.com",
  "primaryContactPhone": "+1-555-0100"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Acme Corporation",
    "industry": "Technology",
    "organizationSize": "500-1000",
    "websiteUrl": "https://acme.com",
    "primaryContactName": "John Doe",
    "primaryContactEmail": "john@acme.com",
    "primaryContactPhone": "+1-555-0100",
    "status": "active",
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  }
}
```

#### Generate AI Report

**Request**:
```http
POST /api/reports/generate
Content-Type: application/json

{
  "projectId": "123e4567-e89b-12d3-a456-426614174001",
  "issueIds": [
    "123e4567-e89b-12d3-a456-426614174002",
    "123e4567-e89b-12d3-a456-426614174003"
  ],
  "reportType": "executive_summary",
  "systemPrompt": "Focus on business impact..."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "content": "<h1>Executive Summary</h1><p>...</p>",
    "summary": "The accessibility audit revealed...",
    "recommendations": [
      "Implement keyboard navigation",
      "Add ARIA labels to interactive elements",
      "Improve color contrast"
    ],
    "estimatedReadingTime": 8,
    "metadata": {
      "projectName": "Acme Website",
      "reportType": "executive_summary",
      "issueCount": 2,
      "generatedAt": "2025-01-15T10:30:00Z",
      "wordCount": 1500
    }
  }
}
```

### Error Responses

All API endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional context"
  }
}
```

**Common HTTP Status Codes**:
- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Configuration

### Environment Variables

#### Required Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/a3s_admin

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# File Storage (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Email (Resend)
RESEND_API_KEY=re_...

# AI (OpenRouter)
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=openai/gpt-4-turbo-preview
```

#### Optional Variables

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=A3S Admin Dashboard

# Google Sheets Integration
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_CLIENT_EMAIL=a3s-admin@xxx.iam.gserviceaccount.com

# Sentry (Error Tracking)
SENTRY_DSN=https://xxx@sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_REPORTS=true
NEXT_PUBLIC_ENABLE_GOOGLE_SHEETS=true
NEXT_PUBLIC_ENABLE_FILE_UPLOAD=true
```

### Service Configuration

#### Clerk Setup

1. **Create Application**:
   - Go to [clerk.com](https://clerk.com)
   - Create new application
   - Choose authentication methods
   - Copy API keys

2. **Configure URLs**:
   ```env
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
   ```

3. **Set Redirect URLs**:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`

#### Supabase Setup

1. **Create Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Wait for initialization

2. **Create Storage Bucket**:
   ```sql
   CREATE BUCKET client_files PUBLIC;
   ```

3. **Set Policies**:
   - Allow authenticated users to upload
   - Allow public read for certain files
   - Restrict delete to admins

4. **Copy Keys**:
   - Project URL
   - Anon key (public)
   - Service role key (private, backend only)

#### Resend Setup

1. **Create Account**:
   - Go to [resend.com](https://resend.com)
   - Create account
   - Verify domain

2. **Domain Verification**:
   - Add DNS records
   - Verify SPF, DKIM, DMARC
   - Wait for propagation

3. **API Key**:
   - Generate API key
   - Add to environment variables
   - Test email sending

#### OpenRouter Setup

1. **Create Account**:
   - Go to [openrouter.ai](https://openrouter.ai)
   - Create account
   - Add payment method

2. **API Key**:
   - Generate API key
   - Set credit limits
   - Monitor usage

3. **Model Selection**:
   ```env
   # Recommended models
   OPENROUTER_MODEL=openai/gpt-4-turbo-preview    # Best quality
   # or
   OPENROUTER_MODEL=anthropic/claude-3-sonnet     # Good balance
   # or
   OPENROUTER_MODEL=openai/gpt-3.5-turbo          # Most economical
   ```

#### Google Sheets Setup

1. **Create Service Account**:
   - Google Cloud Console
   - IAM & Admin → Service Accounts
   - Create service account
   - Generate JSON key

2. **Enable APIs**:
   - Google Sheets API
   - Google Drive API

3. **Share Sheets**:
   - Share each sheet with service account email
   - Give Editor access

4. **Environment Setup**:
   ```env
   GOOGLE_SHEETS_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
   GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

---

## Deployment

### Vercel Deployment (Recommended)

#### Prerequisites
- GitHub repository
- Vercel account
- All environment variables ready

#### Steps

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-org/a3s-admin.git
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import GitHub repository
   - Select a3s-admin repository

3. **Configure Project**:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `pnpm build`
   - Output Directory: .next
   - Install Command: `pnpm install`

4. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add all variables from `.env.local`
   - Ensure secrets are not exposed

5. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Access deployment URL

6. **Set Up Domain** (Optional):
   - Go to Project Settings → Domains
   - Add custom domain
   - Update DNS records
   - Wait for SSL certificate

#### Post-Deployment

1. **Verify Application**:
   - Test authentication
   - Test API endpoints
   - Test file uploads
   - Test AI report generation

2. **Monitor Logs**:
   - Vercel Dashboard → Logs
   - Check for errors
   - Monitor performance

3. **Set Up Monitoring**:
   - Enable Vercel Analytics
   - Configure Sentry (if using)
   - Set up uptime monitoring

### Docker Deployment

#### Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

#### Build and Run

```bash
# Build image
docker build -t a3s-admin:latest .

# Run container
docker run -d \
  --name a3s-admin \
  -p 3000:3000 \
  --env-file .env.local \
  a3s-admin:latest
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.local
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: a3s_admin
      POSTGRES_USER: a3s_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

Run with:

```bash
docker-compose up -d
```

### Manual Server Deployment

#### Prerequisites
- Ubuntu 22.04 or newer
- Node.js 20.x
- PostgreSQL 16
- Nginx (for reverse proxy)
- PM2 (for process management)

#### Steps

1. **Install Dependencies**:
   ```bash
   # Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # pnpm
   npm install -g pnpm

   # PM2
   npm install -g pm2

   # PostgreSQL
   sudo apt-get install postgresql-16

   # Nginx
   sudo apt-get install nginx
   ```

2. **Clone Repository**:
   ```bash
   cd /var/www
   git clone https://github.com/your-org/a3s-admin.git
   cd a3s-admin
   ```

3. **Install Application**:
   ```bash
   pnpm install
   ```

4. **Configure Environment**:
   ```bash
   cp .env.example .env.production
   nano .env.production
   # Fill in production values
   ```

5. **Build Application**:
   ```bash
   pnpm build
   ```

6. **Start with PM2**:
   ```bash
   pm2 start pnpm --name a3s-admin -- start
   pm2 save
   pm2 startup
   ```

7. **Configure Nginx**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

8. **Enable SSL** (Let's Encrypt):
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

9. **Set Up Monitoring**:
   ```bash
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 100M
   pm2 set pm2-logrotate:retain 10
   ```

---

## Troubleshooting

### Common Issues

#### Build Errors

**Issue**: Build fails with TypeScript errors

**Solution**:
```bash
# Clear cache
rm -rf .next node_modules
pnpm install
pnpm build
```

**Issue**: "Cannot find module" errors

**Solution**:
- Check import paths
- Verify file exists
- Check for typos in file names
- Ensure correct case (file systems are case-sensitive)

#### Database Issues

**Issue**: Cannot connect to database

**Solution**:
```bash
# Check DATABASE_URL format
# Should be: postgresql://user:password@host:port/database

# Test connection
psql $DATABASE_URL

# Check PostgreSQL is running
sudo systemctl status postgresql
```

**Issue**: Migration errors

**Solution**:
```bash
# Reset database (CAUTION: Deletes all data)
pnpm db:drop
pnpm db:push

# Or manually fix
pnpm db:studio
# Fix issues in Drizzle Studio
```

#### Authentication Issues

**Issue**: Clerk authentication not working

**Solution**:
- Verify Clerk API keys
- Check redirect URLs in Clerk dashboard
- Ensure domain is whitelisted
- Clear browser cache and cookies
- Check browser console for errors

#### AI Report Generation Issues

**Issue**: AI reports not generating

**Solution**:
- Check OpenRouter API key
- Verify API quota/credits
- Check model availability
- Review system prompt configuration
- Check network connectivity

**Issue**: Poor quality AI responses

**Solution**:
- Improve custom instructions
- Select better model (GPT-4)
- Provide more context
- Review generated content and edit
- Adjust system prompt in code

#### File Upload Issues

**Issue**: File uploads failing

**Solution**:
- Verify Supabase credentials
- Check storage bucket permissions
- Verify file size limits
- Check CORS settings
- Review browser console errors

#### Email Sending Issues

**Issue**: Emails not sending

**Solution**:
- Verify Resend API key
- Check domain verification
- Verify sender domain
- Check recipient email addresses
- Review API rate limits

### Debug Mode

Enable debug logging:

```env
# .env.local
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
DEBUG=*
```

View logs:

```bash
# Development
pnpm dev

# Production (PM2)
pm2 logs a3s-admin

# Production (Docker)
docker logs a3s-admin

# Production (systemd)
journalctl -u a3s-admin -f
```

### Performance Issues

**Issue**: Slow page loads

**Solutions**:
1. Enable caching
2. Optimize images
3. Reduce bundle size
4. Use lazy loading
5. Optimize database queries
6. Add database indexes

**Issue**: High memory usage

**Solutions**:
1. Check for memory leaks
2. Optimize component re-renders
3. Use React.memo()
4. Implement pagination
5. Limit concurrent operations

---

## Best Practices

### Development

1. **Code Organization**:
   - Follow feature-based structure
   - Keep components small and focused
   - Use TypeScript for type safety
   - Write descriptive names

2. **Git Workflow**:
   - Use feature branches
   - Write meaningful commit messages
   - Follow conventional commits
   - Create pull requests for review

3. **Testing**:
   - Write unit tests for utilities
   - Test API endpoints
   - Perform manual testing
   - Test on multiple devices

4. **Code Quality**:
   - Run ESLint before committing
   - Format with Prettier
   - Fix all warnings
   - Review own code before PR

### Security

1. **API Keys**:
   - Never commit `.env` files
   - Use different keys for dev/prod
   - Rotate keys regularly
   - Monitor key usage

2. **Data Protection**:
   - Encrypt sensitive data
   - Use HTTPS only
   - Implement rate limiting
   - Validate all inputs

3. **Authentication**:
   - Use secure sessions
   - Implement proper RBAC
   - Log authentication events
   - Monitor for suspicious activity

### Performance

1. **Frontend**:
   - Lazy load components
   - Optimize images
   - Minimize bundle size
   - Use caching

2. **Backend**:
   - Optimize database queries
   - Add appropriate indexes
   - Use pagination
   - Implement caching

3. **Database**:
   - Regular backups
   - Monitor query performance
   - Optimize slow queries
   - Maintain indexes

### Maintenance

1. **Updates**:
   - Keep dependencies updated
   - Review security advisories
   - Test updates in development
   - Document breaking changes

2. **Monitoring**:
   - Set up error tracking
   - Monitor performance metrics
   - Track user analytics
   - Review logs regularly

3. **Backups**:
   - Daily database backups
   - Store backups securely
   - Test restore procedures
   - Document backup process

---

## Conclusion

This documentation provides a comprehensive guide to the A3S Admin Dashboard. For additional help:

- 📧 **Email**: support@a3s.com
- 📚 **Documentation**: This file
- 🐛 **Issues**: GitHub Issues
- 💬 **Discussions**: GitHub Discussions

For notification system documentation, see [NOTIFICATIONS_GUIDE.md](NOTIFICATIONS_GUIDE.md).

For branding guidelines, see [BRANDING_GUIDE.md](BRANDING_GUIDE.md).

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Maintained By**: A3S Team

