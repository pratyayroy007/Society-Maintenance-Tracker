'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Building2, LogOut, PlusCircle, Sun, Moon, Bell, Mail } from 'lucide-react';
import { UserSession } from '@/lib/types';
import { useTheme } from './ThemeContext';
import EmailInboxModal, { EmailNotification } from './EmailInboxModal';

interface NavbarProps {
  user: UserSession | null;
  onOpenRaiseModal?: () => void;
}

export default function Navbar({ user, onOpenRaiseModal }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [isInboxOpen, setIsInboxOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000); // Polling every 10s
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleMyComplaintsClick = (e: React.MouseEvent) => {
    if (pathname === '/resident') {
      e.preventDefault();
      const target = document.getElementById('my-complaints-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      router.push('/resident#my-complaints-section');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30 group-hover:bg-indigo-700 transition">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight block">
                    SocietyCare
                  </span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold tracking-wider uppercase block -mt-1">
                    Maintenance Portal
                  </span>
                </div>
              </Link>

              {user && (
                <div className="hidden md:flex items-center gap-1 ml-6 border-l border-slate-200 dark:border-slate-800 pl-6">
                  {user.role === 'RESIDENT' ? (
                    <button
                      onClick={handleMyComplaintsClick}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60"
                    >
                      My Complaints
                    </button>
                  ) : (
                    <Link
                      href="/admin"
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60"
                    >
                      Admin Operations
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Controls: Notifications + Theme Toggle + User Session */}
            <div className="flex items-center gap-2.5">
              {/* In-App Email Notifications Bell */}
              {user && (
                <button
                  onClick={() => setIsInboxOpen(true)}
                  title="View Email Notifications"
                  className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-black text-white">
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                  )}
                </button>
              )}

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </button>

              {user ? (
                <>
                  {user.role === 'RESIDENT' && onOpenRaiseModal && (
                    <button
                      onClick={onOpenRaiseModal}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Raise Complaint</span>
                    </button>
                  )}

                  <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-[11px]">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{user.name}</p>
                      <div className="flex items-center gap-1">
                        <span
                          className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                            user.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                          }`}
                        >
                          {user.role}
                        </span>
                        {user.flatNumber && (
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                            • {user.flatNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    title="Sign out"
                    className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* In-App Email Notification Drawer / Modal */}
      {user && (
        <EmailInboxModal
          isOpen={isInboxOpen}
          onClose={() => setIsInboxOpen(false)}
          notifications={notifications}
          userEmail={user.email}
        />
      )}
    </>
  );
}
