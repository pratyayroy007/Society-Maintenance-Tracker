#  Society Maintenance Tracker

A comprehensive apartment society maintenance and complaint management platform built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM**.

---

##  Repository & Folder Structure

The repository is organized following clean architectural practices:

```text
society-maintenance-tracker/
├── prisma/                      # Database configuration & seeding
│   ├── schema.prisma            # Prisma schema (User, Complaint, History, Notice, Setting)
│   └── seed.ts                  # Database seeder with demo accounts & sample data
├── public/                      # Static assets (images, icons)
├── scripts/                     # Automated test & utility scripts
│   └── test-api.ts              # Automated end-to-end API test suite
├── src/
│   ├── app/                     # Next.js 15 App Router pages & API routes
│   │   ├── api/                 # Backend REST API Endpoints
│   │   │   ├── auth/            # Auth: register, login, me, logout
│   │   │   ├── complaints/      # Complaints: CRUD, status transition, priority
│   │   │   ├── dashboard/       # Admin analytics & status breakdown
│   │   │   ├── notices/         # Society notices & pinned announcements
│   │   │   └── settings/        # System settings & overdue threshold
│   │   ├── globals.css          # Global Tailwind styles
│   │   ├── layout.tsx           # Root application layout
│   │   └── page.tsx             # Home landing page
│   └── lib/                     # Shared backend & frontend utilities
│       ├── auth.ts              # JWT signing/verification & bcrypt hashing
│       ├── overdue.ts           # Dynamic overdue calculation engine
│       ├── prisma.ts            # Prisma Client singleton
│       ├── types.ts             # TypeScript interfaces & types
│       └── validators.ts        # Zod validation schemas
├── .env.example                 # Example environment variables (safe to commit)
├── .gitignore                   # Files excluded from git tracking
├── next.config.mjs              # Next.js configuration
├── package.json                 # Project dependencies & scripts
├── postcss.config.mjs           # PostCSS configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript compiler configuration
└── README.md                    # Project documentation & setup guide
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v22)
- **npm** or **pnpm** or **yarn**

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/society-maintenance-tracker.git
cd society-maintenance-tracker

# Install dependencies
npm install --legacy-peer-deps
```

### 3. Environment Setup
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

### 4. Database Setup & Seeding
```bash
# Generate Prisma Client and initialize SQLite database
npx prisma db push

# Seed the database with sample admin, residents, complaints & notices
npx tsx prisma/seed.ts
```

### 5. Run Automated Tests
```bash
npx tsx scripts/test-api.ts
```

### 6. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Credentials

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@society.com` | `Password@123` | Full administrative controls & dashboard |
| **Resident 1** | `john@society.com` | `Password@123` | Flat A-402 |
| **Resident 2** | `sarah@society.com` | `Password@123` | Flat B-105 |

---

## 📋 Database Schema

- **`User`**: Role-based authentication (`RESIDENT`, `ADMIN`), flat number, contact info.
- **`Complaint`**: Title, description, category, status (`OPEN`, `IN_PROGRESS`, `RESOLVED`), priority (`LOW`, `MEDIUM`, `HIGH`), photo attachment, resolution date.
- **`ComplaintStatusHistory`**: Complete audit log for every status transition with actor, timestamp, and notes.
- **`Notice`**: Society announcements with `isImportant` pinning.
- **`SystemSetting`**: Configurable overdue threshold in days (`OVERDUE_DAYS_THRESHOLD`).

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register`: Register new resident/admin.
- `POST /api/auth/login`: Authenticate and receive JWT cookie.
- `GET /api/auth/me`: Get current session profile.
- `POST /api/auth/logout`: Invalidate session cookie.

### Complaints
- `GET /api/complaints`: List complaints (Residents see own; Admins see all with filters).
- `POST /api/complaints`: Raise a new complaint with category, description, photo.
- `GET /api/complaints/:id`: Get complaint details with full status history timeline.
- `PATCH /api/complaints/:id/status`: Admin updates status (`OPEN` -> `IN_PROGRESS` -> `RESOLVED`) with notes.
- `PATCH /api/complaints/:id/priority`: Admin updates priority (`LOW`, `MEDIUM`, `HIGH`).

### System & Notices
- `GET & POST /api/notices`: Notice board feed with pinned announcements.
- `GET & PATCH /api/settings`: System configuration (overdue threshold).
- `GET /api/dashboard`: Admin overview statistics & metrics.
