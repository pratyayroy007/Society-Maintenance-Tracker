import Link from 'next/link';
import { ArrowRight, ShieldCheck, Clock, Camera, FileCheck, UserCheck, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="Residenza Logo"
              className="h-9 w-9 rounded-lg object-cover shadow-md border border-white/10"
            />
            <span className="font-extrabold text-lg tracking-tight text-white">Residenza</span>
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
          🏢 Residenza Apartment Society Maintenance Platform
        </div>

        <div className="flex justify-center">
          <img
            src="/logo.jpg"
            alt="Residenza Logo"
            className="w-28 h-28 rounded-2xl shadow-2xl border-2 border-indigo-500/30 object-cover"
          />
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
            <span>Resident Sign Up</span>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Media Evidence Upload</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload photos directly from your camera or gallery to provide visual evidence for faster maintenance triage.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Dynamic SLA & Overdue Alerts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Configurable SLA thresholds automatically flag overdue tickets and surface high-priority issues to the top.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Full Status Audit Trail</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every status update records the administrator note, previous state, and exact timestamp in an immutable timeline.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
        <p>Residenza Since 2026 • Society Maintenance Tracker • Designed with shadcn-admin</p>
      </footer>
    </div>
  );
}
