'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Building2, Bell, LogOut, User as UserIcon, Shield, LayoutDashboard, PlusCircle } from 'lucide-react';
import { UserSession } from '@/lib/types';

interface NavbarProps {
  user: UserSession | null;
  onOpenRaiseModal?: () => void;
}

export default function Navbar({ user, onOpenRaiseModal }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-md group-hover:bg-indigo-700 transition">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-lg tracking-tight block">SocietyCare</span>
                <span className="text-[10px] text-indigo-600 font-semibold tracking-wider uppercase block -mt-1">
                  Maintenance Tracker
                </span>
              </div>
            </Link>

            {user && (
              <div className="hidden md:flex items-center gap-1 ml-6 border-l border-slate-200 pl-6">
                {user.role === 'RESIDENT' ? (
                  <Link
                    href="/resident"
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      pathname === '/resident'
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    My Complaints
                  </Link>
                ) : (
                  <Link
                    href="/admin"
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      pathname.startsWith('/admin')
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Admin Dashboard
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {user.role === 'RESIDENT' && onOpenRaiseModal && (
                  <button
                    onClick={onOpenRaiseModal}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Raise Complaint</span>
                  </button>
                )}

                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</p>
                    <div className="flex items-center gap-1">
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {user.role}
                      </span>
                      {user.flatNumber && (
                        <span className="text-[10px] text-slate-500 font-medium">
                          • {user.flatNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
