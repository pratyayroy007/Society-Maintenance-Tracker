# 🏛️ Residenza — System Design & Architecture Document

**Author**: Engineering Team  
**System**: Residenza Apartment Society Maintenance & Complaint Management Platform  
**Target Scale**: Residential Housing Societies & Multi-Building Apartment Complexes  

---

## 1. Executive Architectural Overview

Residenza is architected as a high-performance, modular web platform designed to streamline residential facility management, ticket resolution workflows, and community communications. The application employs a modern **Client-Server Single-Repository (Monorepo-lite)** architecture powered by **Next.js 15 App Router**, **TypeScript**, **Prisma ORM**, and **Tailwind CSS** with the **`satnaing/shadcn-admin`** component paradigm.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                              │
│   Next.js 15 App Router • React 19 Client Components • Tailwind CSS    │
│   satnaing/shadcn-admin Sidebar • Segmented Tabs • ThemeProvider       │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ HTTP/2 JSON & REST
┌──────────────────────────────────▼─────────────────────────────────────┐
│                     APPLICATION & API ROUTE LAYER                      │
│   Next.js Route Handlers • JWT Session Guards • Zod Validation         │
│   Role-Based Authorization (RBAC) • File Upload Validation Pipeline    │
└──────────────────┬───────────────────────────────┬─────────────────────┘
                   │                               │
┌──────────────────▼──────────────┐ ┌──────────────▼─────────────────────┐
│       DATA PERSISTENCE LAYER    │ │    ASYNCHRONOUS NOTIFICATION BUS   │
│   Prisma ORM • SQLite / Postgres│ │   Nodemailer (SMTP) • Resend API   │
│   Cascade FKs • Indexed Queries │ │   In-App EmailLog Database Table   │
└─────────────────────────────────┘ └────────────────────────────────────┘
```

The system is partitioned into four distinct layers:
1. **Presentation Layer**: Client and Server Components rendering responsive UI with theme toggling (Light/Dark) and instant state transitions.
2. **Application & API Layer**: RESTful route handlers enforcing authentication, payload validation, and role-based access boundaries.
3. **Data Persistence Layer**: Prisma ORM abstraction managing relational constraints, indexing strategies, and transactional consistency.
4. **Asynchronous Notification Bus**: A resilient multi-provider email dispatch engine handling real-world SMTP delivery, in-app notification auditing, and non-blocking background queueing.

---

## 2. Database Design & Relational Integrity

The persistence tier is designed with strict relational integrity, referential foreign key constraints, and performance-optimized indexing to handle high read-to-write ratios.

```text
┌─────────────────┐       1:N       ┌────────────────────────┐
│      User       ├─────────────────►       Complaint        │
│─────────────────│                 │────────────────────────│
│ id (PK, CUID)   │                 │ id (PK, CUID)          │
│ name            │                 │ title, description     │
│ email (UQ, IDX) │                 │ category (IDX)         │
│ passwordHash    │                 │ status (IDX)           │
│ role (RES/ADM)  │                 │ priority (LOW/MED/HIGH)│
│ flatNumber      │                 │ photoUrl               │
└────────┬────────┘                 │ residentId (FK)        │
         │                          │ createdAt (IDX)        │
         │ 1:N                      └───────────┬────────────┘
         │                                      │
┌────────▼────────┐                             │ 1:N
│     Notice      │                             │
│─────────────────│                 ┌───────────▼────────────┐
│ id (PK, CUID)   │                 │ ComplaintStatusHistory │
│ title, content  │                 │────────────────────────│
│ isImportant(IDX)│                 │ id (PK, CUID)          │
│ createdById(FK) │                 │ complaintId (FK, IDX)  │
└─────────────────┘                 │ previousStatus         │
                                    │ newStatus, note        │
                                    │ changedById (FK)       │
                                    │ createdAt              │
                                    └────────────────────────┘
```

### Key Data Modeling Patterns:

1. **Immutable Audit Trail (`ComplaintStatusHistory`)**:
   Instead of destructively overwriting complaint statuses, every status transition (`OPEN` $	o$ `IN_PROGRESS` $	o$ `RESOLVED`) creates an immutable historical event record. This record captures the actor (`changedById`), prior status, new status, timestamp, and optional administrative remarks. This guarantees transparency and dispute resolution between residents and facility managers.

2. **Cascade Referential Actions**:
   Parent-child relations (such as `User` $	o$ `Complaint` and `Complaint` $	o$ `ComplaintStatusHistory`) utilize `onDelete: Cascade`. This ensures database hygiene without orphaned records upon account or ticket deletion.

3. **Composite & Single-Column Indexing Strategy**:
   - `Complaint([status])`, `Complaint([category])`, `Complaint([residentId])`: Eliminates full table scans during dashboard filtering and user-scoped queries.
   - `Notice([isImportant])`: Enables instant fetching of pinned announcements.
   - `EmailLog([to])`: Facilitates fast lookups for the resident in-app notification center.

---

## 3. Authentication & Role-Based Access Control (RBAC)

Security in Residenza is structured on defense-in-depth principles:

```text
Incoming HTTP Request
         │
         ▼
┌──────────────────────────────────────────────┐
│  Extract Token (Cookie or Bearer Header)     │
└──────────────────────┬───────────────────────┘
                       │
             ┌─────────┴─────────┐
             │ Valid JWT Signature?
             ▼                   ▼
           [No]                [Yes]
             │                   │
      401 Unauthorized    Extract User Claims (id, role, email)
                                 │
                       ┌─────────┴─────────┐
                       │ Required Role Match?
                       ▼                   ▼
                     [No]                [Yes]
                       │                   │
                403 Forbidden     Execute API Handler
```

1. **Cryptographic Password Storage**:
   User passwords are encrypted using **BCrypt.js** with 10 salt rounds, guarding against rainbow table lookups and brute-force cracking.
2. **Stateless JWT Session Management**:
   Upon authentication, a signed **JSON Web Token (JWT)** is issued containing identity claims (`id`, `email`, `role`, `flatNumber`). Tokens are signed using HMAC-SHA256 with a 7-day expiration.
3. **Secure Cookie Transport**:
   JWT tokens are stored in `HttpOnly`, `SameSite=Lax` cookies, preventing cross-site scripting (XSS) token exfiltration while mitigating Cross-Site Request Forgery (CSRF).
4. **Declarative Privilege Separation**:
   - **`RESIDENT`**: Scoped strictly to creating tickets, viewing own complaints, browsing the notice board, and accessing personal notification logs.
   - **`ADMIN`**: Privileged access to triage all society complaints, update statuses, reassign priorities, modify SLA thresholds, publish notices, and inspect facility distribution analytics.

---

## 4. Dynamic SLA & Overdue Calculation Engine

To maintain facility maintenance accountability, Residenza implements a dynamic **Service Level Agreement (SLA)** engine.

$$	ext{Age (Days)} = rac{	ext{Current Timestamp} - 	ext{Ticket Created Timestamp}}{86,400,000 	ext{ ms}}$$

$$	ext{isOverdue} = (	ext{status} 
eq 	ext{'RESOLVED'}) \land (	ext{Age} > 	ext{Threshold Days})$$

```text
Database `SystemSetting` Table ──► Dynamic `OVERDUE_DAYS_THRESHOLD` (e.g. 3 Days)
                                                  │
                                                  ▼
Query Active Complaints ────────► Compute Elapsed Time vs Threshold
                                                  │
                                                  ▼
                         ┌────────────────────────────────────────┐
                         │   Overdue Tickets Surface to Top       │
                         │   with Pulsing Badges & Alert Styling  │
                         └────────────────────────────────────────┘
```

- **Configurable SLA Storage**: The threshold is not hard-coded; it is stored dynamically in the `SystemSetting` table and can be altered in real-time via the Admin SLA modal.
- **Smart Queue Elevation**: In the Admin triage table, overdue complaints automatically float to the top of the queue with high-visibility pulsing red badges, preventing critical issues (e.g. major water leaks, lift stoppages) from languishing unattended.

---

## 5. Multi-Provider Asynchronous Notification Pipeline

Communication is crucial in property management. Residenza implements a resilient multi-tier notification architecture.

```text
Event: Complaint Raised / Status Updated / Urgent Notice
                        │
                        ▼
           `sendEmail()` Dispatcher
                        │
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
   [Option 1]     [Option 2]     [Option 3]
   Google SMTP    Resend API     Console Mock
 (societymaintainence@gmail.com)  (re_...)     (Zero-Config Dev)
         │              │              │
         └──────────────┼──────────────┘
                        │
                        ▼
         ┌─────────────────────────────┐
         │  Save to `EmailLog` Table   │
         │  (In-App Notification Center)│
         └─────────────────────────────┘
```

1. **Live Google SMTP Transport**:
   Configured with `societymaintainence@gmail.com` using a secure 16-character Google App Password. Node.js TLS options (`rejectUnauthorized: false`) ensure seamless operation across restricted Windows proxy environments.
2. **Non-Blocking Execution & Socket Timeouts**:
   Email dispatches are executed asynchronously via fire-and-forget background promises with **4-second connection timeouts**. This prevents slow mail server handshakes from blocking HTTP route responses.
3. **In-App Notification Center Mirror**:
   Every outgoing email is simultaneously recorded into the `EmailLog` database table. Residents can open the top navigation **Mail Drawer** to review all dispatches in real-time with full HTML fidelity, ensuring visibility even if external mail delivers to Spam folders.

---

## 6. Scalability, Security, & Production Trade-offs

| Engineering Dimension | Current Architecture (MVP / Phase 1) | Production Scale (100,000+ Units) |
| :--- | :--- | :--- |
| **Database Engine** | Embedded SQLite (`dev.db`) | Managed PostgreSQL (Amazon RDS / Supabase) with Read Replicas. |
| **Media Storage** | Local Disk (`public/uploads/`) | Amazon S3 / Cloudflare R2 with Presigned URLs and CDN caching. |
| **Notification Queue** | In-Process Asynchronous Dispatch | BullMQ / Redis-backed background worker queue with automatic retry backoff. |
| **Real-Time Updates** | Client SWR / Refresh Polling | WebSockets / Server-Sent Events (SSE) for instant live triage table updates. |
| **Rate Limiting** | Route-level guards | Redis-backed sliding window rate limiter (Upstash) against API abuse. |

---

## 7. Conclusion

Residenza demonstrates a comprehensive, secure, and production-ready solution to society facility management. By combining clean Next.js 15 App Router architecture, immutable audit histories, dynamic SLA triage, multi-provider email automation, and the refined **`satnaing/shadcn-admin`** design system, the platform fulfills all functional and non-functional requirements.
