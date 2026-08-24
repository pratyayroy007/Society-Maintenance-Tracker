## Residenza — Society Maintenance Tracker

<div align="center">

![Residenza Logo](public/logo.jpg)

**Next-Generation Apartment Society Maintenance & Complaint Management Platform**

[![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.4-2d3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![shadcn/ui](https://img.shields.io/badge/UI-shadcn--admin-black?style=flat)](https://ui.shadcn.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## Executive Summary

**Residenza** is a full-stack, enterprise-grade apartment society maintenance and facility complaint resolution portal. Designed around the modern **`satnaing/shadcn-admin`** dashboard paradigm, it bridges the communication gap between residential apartment occupants and housing society managing committees.

Residents can submit categorized maintenance issues with supporting photographic evidence, inspect chronological audit histories, and receive automated email dispatch confirmations. Administrators leverage a centralized triage command center featuring live KPI counters, overdue SLA alerts, dynamic priority adjustments, customizable resolution thresholds, society announcements, and real-time Google SMTP email broadcasts.

---

## Key Features & Capabilities

###  Resident Experience
- **Interactive Dashboard**: Modern collapsible sidebar layout with high-level personal metrics (Total Raised, Pending Triage, In Progress, Resolved).
- **Facility Service Quick-Selector**: Visual category cards with high-definition facility imagery (Plumbing, Electrical, Elevator, Security, Housekeeping, Carpentry).
- **Multi-Part Ticket Filing**: Title, category, urgency/priority, rich descriptions, and photo evidence upload (JPEG/PNG/WebP with 5MB validation).
- **Audit Timeline Modal**: Step-by-step chronological visual lifecycle showing every status transition, admin remarks, and exact timestamps.
- **In-App Notification Center**: Built-in email preview drawer with real-time badge count to inspect all sent communications directly in the browser.
- **Society Notice Feed**: Real-time announcements with pinned priority badges for urgent building alerts.

###  Administrator Operations Center
- **Triage Command Table**: Filter by Status (`OPEN`, `IN_PROGRESS`, `RESOLVED`), Category (8 types), Priority (`LOW`, `MEDIUM`, `HIGH`), and Overdue SLA.
- **Smart Queue Sorting**: Overdue tickets exceeding the society SLA threshold automatically float to the top of the triage table with animated visual alerts.
- **Status Transition Workflow**: Modal capturing mandatory/optional administrative notes saved into the immutable audit history.
- **Configurable SLA Threshold**: Real-time adjustment of `OVERDUE_DAYS_THRESHOLD` dynamically stored in the database.
- **Notice Publishing & Broadcasting**: Post society announcements with optional `isImportant` pinning that automatically broadcasts urgent emails to all residents.
- **Category Analytics**: Proportional visual progress bars tracking issue distribution across society assets for preventive maintenance planning.

###  Design & Accessibility
- **`satnaing/shadcn-admin` Design System**: Collapsible sidebar, sticky top header, segmented tab switches, and high-contrast tables.
- **Light & Dark Theme Switcher**: Full HSL design token support with smooth transitions, persistent `localStorage` memory, and system preference detection.
- **Responsive Architecture**: Mobile-friendly navigation with responsive tables and modals.

###  Asynchronous Email Notification Engine
- **Live Google SMTP Delivery**: Pre-configured for official society email (`societymaintainence@gmail.com`) with TLS proxy resilience.
- **Multi-Provider Support**: Seamless support for Gmail App Passwords, Resend API (`RESEND_API_KEY`), and safe development console mock fallback.
- **Non-Blocking Architecture**: Fire-and-forget background execution with 4-second connection timeouts ensuring sub-50ms API response latency.

---

##  Technical Architecture & Tech Stack

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        RESIDENZA CLIENT LAYER                          │
│   Next.js 15 (App Router) • React 19 • Tailwind CSS • Lucide Icons     │
│   satnaing/shadcn-admin Sidebar • Segmented Tabs • Dark/Light Modes    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ HTTPS / REST JSON
┌──────────────────────────────────▼─────────────────────────────────────┐
│                       NEXT.JS API ROUTE HANDLERS                       │
│   JWT Cookie Auth • RBAC Middleware • Zod Validation • Upload Handler  │
└──────────────────┬───────────────────────────────┬─────────────────────┘
                   │                               │
┌──────────────────▼──────────────┐ ┌──────────────▼─────────────────────┐
│          PRISMA ORM             │ │      EMAIL NOTIFICATION ENGINE     │
│   SQLite / PostgreSQL Engine    │ │   Nodemailer (SMTP) • Resend API   │
│   Cascade FKs • Indexed Queries │ │   In-App EmailLog Database Storage │
└─────────────────────────────────┘ └────────────────────────────────────┘
```

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 15.2 (App Router) | Server Components, Client Components, and API Route Handlers. |
| **Language** | TypeScript 5.7 | End-to-end type safety across schemas, API payloads, and UI. |
| **Database** | SQLite (Dev) / PostgreSQL (Prod) | Relational persistence with foreign keys and cascade deletions. |
| **ORM** | Prisma 6.4 | Type-safe query building, migrations, and declarative schema. |
| **UI & Styling** | Tailwind CSS 3.4 + shadcn/ui | HSL semantic tokens, responsive grid, custom scrollbars. |
| **Authentication** | BCrypt.js + JSONWebToken | Password hashing with 10 salt rounds and HTTP-only JWT cookies. |
| **Validation** | Zod 3.24 | Schema validation for all input payloads and API requests. |
| **Email Service** | Nodemailer 6.9 + Resend API | Multi-provider SMTP transporter with TLS certificate tolerance. |

---

##  Repository Directory Structure

```text
society-maintenance-tracker/
├── prisma/                          # Database configuration & seeding
│   ├── schema.prisma                # Prisma schema (User, Complaint, History, Notice, Setting, EmailLog)
│   ├── seed.ts                      # Database seeder with demo accounts & sample data
│   └── dev.db                       # Local SQLite database (gitignored)
├── public/                          # Static assets
│   ├── logo.jpg                     # Official Residenza Since 2026 emblem
│   └── uploads/                     # Local photo evidence storage
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── admin/page.tsx           # Admin Command & Operations Dashboard
│   │   ├── resident/page.tsx        # Resident Portal & Facility Explorer
│   │   ├── login/page.tsx           # Split-screen authentication sign-in
│   │   ├── register/page.tsx        # Split-screen resident registration
│   │   ├── api/                     # Backend REST API Endpoints
│   │   │   ├── auth/                # Login, Register, Me, Logout
│   │   │   ├── complaints/          # Complaint CRUD, status transitions, priority
│   │   │   ├── notices/             # Society notice creation & broadcasting
│   │   │   ├── notifications/       # In-App Email notification retrieval
│   │   │   ├── settings/            # System settings (overdue SLA threshold)
│   │   │   ├── upload/              # File evidence upload handler
│   │   │   └── dashboard/           # Aggregated metrics & stats
│   │   ├── globals.css              # Global shadcn HSL design tokens
│   │   ├── layout.tsx               # Root layout with ThemeProvider
│   │   └── page.tsx                 # Public landing page
│   ├── components/                  # UI Components
│   │   ├── layout/                  # Navigation & Frame
│   │   │   ├── AppSidebar.tsx       # Collapsible Left Sidebar (shadcn-admin style)
│   │   │   └── AppHeader.tsx        # Sticky Top Header with notification bell
│   │   ├── ui/                      # shadcn/ui primitives (Button, Card, Badge, Table, Tabs)
│   │   ├── ComplaintCard.tsx        # Complaint card with priority badges & timeline trigger
│   │   ├── ComplaintDetailModal.tsx # Full chronological status audit history modal
│   │   ├── RaiseComplaintModal.tsx  # Multi-category complaint creator with photo preview
│   │   ├── AdminStatusUpdateModal.tsx# Status transition modal with remarks
│   │   ├── AdminNoticeModal.tsx     # Society notice creator with pinning toggle
│   │   ├── AdminThresholdModal.tsx  # Dynamic SLA threshold configuration modal
│   │   ├── EmailInboxModal.tsx      # In-App Email notification drawer
│   │   ├── FacilityCard.tsx         # Quick facility selector cards with imagery
│   │   ├── NoticeBoard.tsx          # Society announcement feed
│   │   ├── Navbar.tsx               # Standalone navigation bar
│   │   └── ThemeContext.tsx         # Theme Provider & toggle hook
│   └── lib/                         # Shared utilities
│       ├── auth.ts                  # JWT signing, verification & password hashing
│       ├── email.ts                 # Multi-provider email dispatch & logging
│       ├── overdue.ts               # SLA calculation & overdue evaluation logic
│       ├── prisma.ts                # Prisma client singleton
│       ├── types.ts                 # TypeScript type declarations
│       ├── utils.ts                 # shadcn cn() className merger
│       └── validators.ts            # Zod validation schemas
├── docs/
│   └── SYSTEM_DESIGN.md             # 800+ Word Architecture & System Design Document
├── scripts/                         # Automated test & utility scripts
│   ├── test-api.ts                  # Core backend API test suite (17 tests)
│   ├── test-day3.ts                 # Admin & notification test suite (7 tests)
│   └── test-live-email.ts           # Live Google SMTP connection & delivery test
├── .env.example                     # Environment template (safe to commit)
├── Dockerfile                       # Multi-stage containerization build
├── package.json                     # Dependencies & script definitions
├── tailwind.config.ts               # Tailwind CSS theme extension
├── tsconfig.json                    # TypeScript compiler options
└── README.md                        # Primary documentation
```

---

##  Installation & Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0+ or v22.x LTS
- **npm** (v10+), **yarn**, or **pnpm**
- **Git**

### 2. Clone and Install Dependencies
```bash
# Clone the repository
git clone https://github.com/pratyayroy007/Society-Maintenance-Tracker.git
cd Society-Maintenance-Tracker

# Install dependencies
npm install --legacy-peer-deps
```

### 3. Configure Environment Variables
Copy `.env.example` to create your local `.env` file:
```bash
cp .env.example .env
```

Ensure your `.env` contains:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="super-secret-jwt-key-society-tracker-2026-xyz"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DEFAULT_OVERDUE_DAYS="3"

# --- Live Google SMTP Email Dispatch (Pre-configured) ---
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="societymaintainence@gmail.com"
SMTP_PASS="abarbtbhswyqwgja"
SMTP_FROM="Residenza <societymaintainence@gmail.com>"
```

### 4. Initialize Database & Seed Demo Data
```bash
# Push schema to SQLite database
npx prisma db push

# Seed with demo admin, residents, categorized complaints, and notices
npx tsx prisma/seed.ts
```

### 5. Start Development Server
```bash
npm run dev
```
Navigate to **`http://localhost:3000`** in your browser.

---

##  Demo User Credentials

The database seed script automatically provisions the following accounts:

| Role | Name | Email | Password | Unit / Details |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | Super Admin | `admin@society.com` | `Password@123` | Management Committee Head |
| **Resident 1** | John Doe | `john@society.com` | `Password@123` | Flat A-402 |
| **Resident 2** | Sarah Jenkins | `sarah@society.com` | `Password@123` | Flat B-105 |

*(One-click demo login buttons are available directly on the `/login` screen).*

---

##  Database Schema & Entity Relationships

```text
┌─────────────────┐       1:N       ┌────────────────────────┐
│      User       ├─────────────────►       Complaint        │
│─────────────────│                 │────────────────────────│
│ id (PK)         │                 │ id (PK)                │
│ name            │                 │ title, description     │
│ email (UQ)      │                 │ category, status       │
│ passwordHash    │                 │ priority, photoUrl     │
│ role (RES/ADM)  │                 │ residentId (FK)        │
│ flatNumber      │                 │ resolvedAt, createdAt  │
└────────┬────────┘                 └───────────┬────────────┘
         │                                      │
         │ 1:N                                  │ 1:N
         │                                      │
┌────────▼────────┐                 ┌───────────▼────────────┐
│     Notice      │                 │ ComplaintStatusHistory │
│─────────────────│                 │────────────────────────│
│ id (PK)         │                 │ id (PK)                │
│ title, content  │                 │ complaintId (FK)       │
│ isImportant     │                 │ previousStatus         │
│ createdById(FK) │                 │ newStatus, note        │
└─────────────────┘                 │ changedById (FK)       │
                                    └────────────────────────┘
```

### Database Tables & Field Definitions

1. **`User`**:
   - `id`: String (CUID, Primary Key)
   - `name`: String
   - `email`: String (Unique, Indexed)
   - `passwordHash`: String (BCrypt hashed)
   - `flatNumber`: String (Optional)
   - `phoneNumber`: String (Optional)
   - `role`: String (`RESIDENT` | `ADMIN`, Default: `RESIDENT`)
   - `createdAt`, `updatedAt`: DateTime

2. **`Complaint`**:
   - `id`: String (CUID, Primary Key)
   - `title`: String
   - `description`: String
   - `category`: String (Indexed: `PLUMBING`, `ELECTRICAL`, `CARPENTRY`, `CLEANING`, `ELEVATOR`, `SECURITY`, `PAINTING`, `OTHER`)
   - `status`: String (Indexed: `OPEN`, `IN_PROGRESS`, `RESOLVED`)
   - `priority`: String (`LOW`, `MEDIUM`, `HIGH`, Default: `MEDIUM`)
   - `photoUrl`: String (Optional URL / path)
   - `residentId`: String (Foreign Key $	o$ `User.id` on cascade delete)
   - `resolvedAt`: DateTime (Optional timestamp)
   - `createdAt`, `updatedAt`: DateTime

3. **`ComplaintStatusHistory`** *(Immutable Audit Trail)*:
   - `id`: String (CUID, Primary Key)
   - `complaintId`: String (Foreign Key $	o$ `Complaint.id` on cascade delete)
   - `previousStatus`: String (Nullable)
   - `newStatus`: String (`OPEN`, `IN_PROGRESS`, `RESOLVED`)
   - `changedById`: String (Foreign Key $	o$ `User.id`)
   - `note`: String (Optional admin remarks / technician note)
   - `createdAt`: DateTime (Timestamp of transition)

4. **`Notice`**:
   - `id`: String (CUID, Primary Key)
   - `title`: String
   - `content`: String
   - `isImportant`: Boolean (Indexed, Default: `false`)
   - `createdById`: String (Foreign Key $	o$ `User.id`)
   - `createdAt`, `updatedAt`: DateTime

5. **`SystemSetting`**:
   - `key`: String (Primary Key, e.g., `OVERDUE_DAYS_THRESHOLD`)
   - `value`: String (e.g., `"3"`)
   - `description`: String (Optional)
   - `updatedAt`: DateTime

6. **`EmailLog`**:
   - `id`: String (CUID, Primary Key)
   - `to`: String (Indexed recipient email)
   - `subject`: String
   - `html`: String (Rendered HTML body)
   - `status`: String (`SENT` | `DELIVERED` | `FAILED`)
   - `createdAt`: DateTime

---

##  REST API Reference

All API routes authenticate via the `auth-token` HTTP-only cookie or standard `Authorization: Bearer <token>` header.

### 1. Authentication Endpoints

#### `POST /api/auth/register`
Register a new resident account.
- **Request Body**:
  ```json
  {
    "name": "Alex Smith",
    "email": "alex@example.com",
    "password": "Password@123",
    "flatNumber": "C-301",
    "phoneNumber": "+919876543210"
  }
  ```
- **Response (201 Created)**: Returns `{ message: "User registered successfully", user: {...}, token: "..." }`.

#### `POST /api/auth/login`
Authenticate credentials and establish session.
- **Request Body**: `{ "email": "john@society.com", "password": "Password@123" }`
- **Response (200 OK)**: Sets HTTP-only `auth-token` cookie. Returns `{ user: {...}, token: "..." }`.

#### `GET /api/auth/me`
Retrieve active user session.
- **Response (200 OK)**: Returns `{ user: { id, name, email, role, flatNumber } }`.

#### `POST /api/auth/logout`
Invalidates session and clears `auth-token` cookie.

---

### 2. Complaint Management Endpoints

#### `GET /api/complaints`
Retrieve complaints with role-based filtering and overdue annotations.
- **Access**: Residents receive own complaints; Admins receive all complaints.
- **Query Parameters**:
  - `category`: Filter by category (e.g. `PLUMBING`, `ELECTRICAL`).
  - `status`: Filter by status (`OPEN`, `IN_PROGRESS`, `RESOLVED`).
  - `priority`: Filter by priority (`LOW`, `MEDIUM`, `HIGH`).
  - `isOverdue`: `true` | `false`.
  - `search`: Keyword search in title or description.
- **Response (200 OK)**: Returns `{ complaints: [...], total: 12, thresholdDays: 3 }`.

#### `POST /api/complaints`
Raise a new maintenance complaint.
- **Request Body**:
  ```json
  {
    "title": "Main Water Valve Leakage",
    "category": "PLUMBING",
    "priority": "HIGH",
    "description": "Heavy water leakage near the kitchen sink pipe line.",
    "photoUrl": "/uploads/leak-evidence.jpg"
  }
  ```
- **Response (201 Created)**: Returns `{ message: "Complaint raised successfully", complaint: {...} }`.
- **Side Effect**: Dispatches confirmation email to resident via Google SMTP and logs to in-app notification center.

#### `GET /api/complaints/:id`
Fetch single complaint with full chronological history timeline.

#### `PATCH /api/complaints/:id/status`
Update complaint status with administrative audit note *(Admin Only)*.
- **Request Body**:
  ```json
  {
    "status": "IN_PROGRESS",
    "note": "Assigned to Senior Plumber Rajesh. Visiting unit at 3:00 PM."
  }
  ```
- **Response (200 OK)**: Returns updated complaint and creates new `ComplaintStatusHistory` entry.
- **Side Effect**: Dispatches status update email with admin remarks to resident.

#### `PATCH /api/complaints/:id/priority`
Update ticket urgency *(Admin Only)*.
- **Request Body**: `{ "priority": "HIGH" }`

---

### 3. Notices & Communication Endpoints

#### `GET /api/notices`
Retrieve society notice announcements (pinned notices ordered first).

#### `POST /api/notices`
Publish an announcement *(Admin Only)*.
- **Request Body**:
  ```json
  {
    "title": "Water Tank Cleaning Schedule",
    "content": "Water supply will be suspended on Sunday from 10 AM to 2 PM.",
    "isImportant": true
  }
  ```
- **Side Effect**: When `isImportant: true`, triggers urgent email broadcast to all registered resident emails.

#### `GET /api/notifications`
Retrieve in-app email notification history for the authenticated resident/admin.

#### `POST /api/upload`
Upload photo attachment evidence (Multipart `FormData` with 5MB MIME validation).

---

##  Automated Testing

Residenza includes automated end-to-end test suites covering API security, RBAC authorization, SLA calculation, and email dispatch.

```bash
# Run Core Backend API Test Suite (17 Tests)
npx tsx scripts/test-api.ts

# Run Day 3 Admin & Notification Test Suite (7 Tests)
npx tsx scripts/test-day3.ts

# Run Live Google SMTP Connection & Delivery Test
npx tsx scripts/test-live-email.ts
```

### Production Build Validation
```bash
npm run build
```
*(Compiles all 18 static & dynamic routes with zero TypeScript/ESLint errors).*

---

##  Docker Deployment

A multi-stage Docker build is included:

```bash
# Build Docker image
docker build -t residenza-app .

# Run container
docker run -p 3000:3000 --env-file .env residenza-app
```

---

##  License & Attribution

Developed for the **Society Maintenance Tracker** technical evaluation. Built with modern web standards and MIT License.
