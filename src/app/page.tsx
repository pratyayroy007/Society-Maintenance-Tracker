import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white">
      <div className="max-w-3xl w-full text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-sm font-medium">
          🏢 Society Maintenance & Complaint Tracker
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          Streamlined Complaint Resolution & Society Management
        </h1>
        
        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          Empowering residents to report issues with photos and track full audit timelines, while admins triage priorities, monitor overdue tasks, and broadcast notices.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto pt-4">
          <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-left">
            <h3 className="font-semibold text-white">Demo Admin Account</h3>
            <p className="text-xs text-slate-400 mt-1">Email: admin@society.com</p>
            <p className="text-xs text-slate-400">Password: Password@123</p>
          </div>
          <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-left">
            <h3 className="font-semibold text-white">Demo Resident Account</h3>
            <p className="text-xs text-slate-400 mt-1">Email: john@society.com</p>
            <p className="text-xs text-slate-400">Password: Password@123</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <a
            href="/api/dashboard"
            className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold transition text-white shadow-lg shadow-indigo-600/30"
          >
            Backend API Ready (Day 1)
          </a>
        </div>
      </div>
    </div>
  );
}
