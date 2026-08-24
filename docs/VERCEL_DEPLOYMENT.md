# 🚀 Vercel Deployment Guide — Residenza

This step-by-step guide walks you through deploying **Residenza** to [Vercel](https://vercel.com) with production database and email notifications.

---

## 📋 Prerequisites
1. A [Vercel Account](https://vercel.com/signup).
2. Your GitHub repository with the latest code pushed: `https://github.com/pratyayroy007/Society-Maintenance-Tracker`.
3. A free cloud database (such as **Neon PostgreSQL**, **Supabase**, or **Vercel Postgres**).

---

## 🛠️ Step 1: Provision a Free Production Database (1 Minute)

Because Vercel runs in a serverless environment with ephemeral storage, production requires a hosted cloud database.

### Option A: Free Neon PostgreSQL (Recommended — Takes 30 seconds)
1. Go to [neon.tech](https://neon.tech) and sign up for free.
2. Click **Create Project** $	o$ Name: `residenza-db`.
3. Copy the **Connection String** (e.g. `postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require`).

---

## ⚙️ Step 2: Deploy to Vercel (3 Clicks)

1. Log in to [vercel.com](https://vercel.com) and click **"Add New..." $	o$ "Project"**.
2. Select your repository: **`pratyayroy007/Society-Maintenance-Tracker`** and click **Import**.
3. Under **Environment Variables**, add the following keys:

| Environment Variable | Value Example | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://user:pass@ep-xyz.aws.neon.tech/neondb?sslmode=require` | Your Cloud PostgreSQL connection string |
| `JWT_SECRET` | `super-secret-production-jwt-key-2026` | Random secure string for signing tokens |
| `DEFAULT_OVERDUE_DAYS` | `3` | Default society overdue SLA threshold |
| `SMTP_HOST` | `smtp.gmail.com` | Google SMTP server |
| `SMTP_PORT` | `587` | Google SMTP port |
| `SMTP_USER` | `societymaintainence@gmail.com` | Official Society sender Gmail |
| `SMTP_PASS` | `abarbtbhswyqwgja` | 16-character Google App Password |
| `SMTP_FROM` | `Residenza <societymaintainence@gmail.com>` | Sender header displayed in emails |

4. Click **Deploy**!

---

## 🗄️ Step 3: Seed Demo Data to Production Database

Once deployed, push the Prisma schema and seed demo accounts into your cloud database:

Run locally from your terminal (pointing to your cloud `DATABASE_URL`):
```bash
# In your local project terminal, set DATABASE_URL temporarily:
$env:DATABASE_URL="your-neon-or-supabase-connection-string"

# Push the schema to cloud database
npx prisma db push

# Seed demo admin and residents
npx tsx prisma/seed.ts
```

---

## 🌐 Step 4: Access Your Live Application

Your application is now live at `https://your-project-name.vercel.app` with:
* Real-time Google SMTP email dispatch.
* Complete `satnaing/shadcn-admin` sidebar & layout.
* Full Light & Dark mode support.
* Production cloud database persistence.
