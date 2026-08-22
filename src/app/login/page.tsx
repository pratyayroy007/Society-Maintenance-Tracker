'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Lock, Mail, AlertCircle, Loader2, ArrowRight, UserCheck, Shield, Sun, Moon, CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/components/ThemeContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid email or password');
      }

      if (data.user?.role === 'ADMIN') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/resident';
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* Left Column: Brand Showcase (shadcn-admin Style) */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 bg-slate-950 text-white overflow-hidden border-r border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950" />
        
        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <img
            src="/logo.jpg"
            alt="Residenza Logo"
            style={{ width: '40px', height: '40px', maxWidth: '40px' }}
            className="w-10 h-10 rounded-xl object-cover shadow-lg border border-white/10"
          />
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white block">Residenza</span>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest block -mt-1">Since 2026</span>
          </div>
        </div>

        {/* Centerpiece Feature Callouts */}
        <div className="relative z-10 space-y-6 max-w-md my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            🏢 Apartment Maintenance Platform
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Transparent maintenance resolution for modern societies.
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed">
            Direct photo evidence uploads, automated SLA overdue tracking, live email notifications, and chronological audit histories.
          </p>

          <div className="space-y-3 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Real-time email dispatch via Google SMTP</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Dynamic overdue threshold & priority controls</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Immutable ticket audit timeline & remarks</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-slate-500">
          © 2026 Residenza Portal • Designed with shadcn-admin
        </div>
      </div>

      {/* Right Column: Sign In Form */}
      <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-12 relative">
        {/* Top Controls */}
        <div className="flex items-center justify-between">
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <img
              src="/logo.jpg"
              alt="Residenza Logo"
              style={{ width: '32px', height: '32px', maxWidth: '32px' }}
              className="w-8 h-8 rounded-lg object-cover border"
            />
            <span className="font-extrabold text-sm tracking-tight">Residenza</span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 text-muted-foreground"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-400" />}
            </Button>

            <Link href="/register">
              <Button variant="outline" size="sm" className="text-xs">
                Register
              </Button>
            </Link>
          </div>
        </div>

        {/* Form Center Container */}
        <div className="mx-auto w-full max-w-sm space-y-6 my-auto py-8">
          <div className="space-y-2 text-center">
            <div className="flex justify-center mb-3">
              <img
                src="/logo.jpg"
                alt="Residenza Logo"
                style={{ width: '56px', height: '56px', maxWidth: '56px' }}
                className="w-14 h-14 rounded-2xl object-cover shadow-md border"
              />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Sign In to Residenza</h2>
            <p className="text-xs text-muted-foreground">
              Enter your credentials or use the demo accounts below
            </p>
          </div>

          <Card className="p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-md border border-input bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-md border border-input bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full font-semibold text-xs shadow-xs gap-1.5 mt-2"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{loading ? 'Authenticating...' : 'Sign In with Email'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </form>

            {/* Quick Demo Logins */}
            <div className="mt-6 pt-5 border-t space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center mb-2">
                One-Click Demo Logins
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('john@society.com', 'Password@123')}
                  className="flex flex-col items-start p-2.5 rounded-lg bg-secondary hover:bg-accent border text-left transition"
                >
                  <div className="flex items-center gap-1 text-xs font-bold text-foreground">
                    <UserCheck className="w-3.5 h-3.5 text-primary" />
                    <span>Resident</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate w-full">john@society.com</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@society.com', 'Password@123')}
                  className="flex flex-col items-start p-2.5 rounded-lg bg-secondary hover:bg-accent border text-left transition"
                >
                  <div className="flex items-center gap-1 text-xs font-bold text-foreground">
                    <Shield className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Admin</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate w-full">admin@society.com</span>
                </button>
              </div>
            </div>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Create a resident account
            </Link>
          </p>
        </div>

        <div className="text-center text-[11px] text-muted-foreground">
          Residenza Apartment Society Maintenance System
        </div>
      </div>
    </div>
  );
}
