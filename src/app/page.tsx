import Link from 'next/link';
import { Building2, ShieldCheck, Clock, Camera, FileCheck, ArrowRight, UserCheck, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">SocietyCare</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition"
            >
              Register Resident
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide uppercase">
          🏢 Modern Apartment Society Maintenance Platform
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          Transparent Maintenance Resolution for Apartment Societies
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Empowering residents to raise issues with supporting photos and track chronological audit histories, while administrators manage priorities, monitor overdue tasks, and broadcast announcements.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition hover:-translate-y-0.5"
          >
            <span>Access Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/10 transition"
          >
            <span>Register as Resident</span>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Photo Evidence & Category Triage</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload photos with complaints across Plumbing, Electrical, Carpentry, Elevator, and Security categories.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Full Status Audit Timeline</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every status transition (Open ➔ In Progress ➔ Resolved) is logged with exact actor, timestamp, and remarks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Overdue Engine & Notice Board</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated overdue alerts based on configurable thresholds, with pinned important society broadcasts.
            </p>
          </div>
        </div>

        {/* Demo Credentials Box */}
        <div className="p-6 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-left max-w-xl mx-auto space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-indigo-300">
            Quick Test Accounts (Seeded)
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-black/30 border border-white/5">
              <span className="font-bold text-white block">👤 Resident Account</span>
              <p className="text-slate-400 text-[11px] mt-0.5">Email: john@society.com</p>
              <p className="text-slate-400 text-[11px]">Pass: Password@123</p>
            </div>
            <div className="p-3 rounded-lg bg-black/30 border border-white/5">
              <span className="font-bold text-white block">🛡️ Admin Account</span>
              <p className="text-slate-400 text-[11px] mt-0.5">Email: admin@society.com</p>
              <p className="text-slate-400 text-[11px]">Pass: Password@123</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
        © 2026 SocietyCare • Built with Next.js 15, TypeScript, Tailwind CSS & Prisma
      </footer>
    </div>
  );
}
