'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Sliders,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Home,
  Layers,
} from 'lucide-react';
import { UserSession } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  user: UserSession | null;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  openCount?: number;
  overdueCount?: number;
}

export default function AppSidebar({
  user,
  collapsed,
  setCollapsed,
  openCount = 0,
  overdueCount = 0,
}: AppSidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      window.location.href = '/login';
    }
  };

  const navItems = user?.role === 'ADMIN'
    ? [
        {
          title: 'Overview & Triage',
          href: '/admin',
          icon: LayoutDashboard,
          badge: overdueCount > 0 ? `${overdueCount} Overdue` : null,
          badgeVariant: 'destructive' as const,
        },
        {
          title: 'All Complaints',
          href: '/admin#complaints-table',
          icon: ClipboardList,
          badge: openCount > 0 ? `${openCount} Open` : null,
          badgeVariant: 'warning' as const,
        },
        {
          title: 'Category Analytics',
          href: '/admin#analytics-section',
          icon: Layers,
        },
        {
          title: 'Society Notices',
          href: '/admin#notices-section',
          icon: Bell,
        },
      ]
    : [
        {
          title: 'Dashboard',
          href: '/resident',
          icon: Home,
        },
        {
          title: 'My Complaints',
          href: '/resident#my-complaints-section',
          icon: ClipboardList,
          badge: openCount > 0 ? `${openCount} Active` : null,
          badgeVariant: 'warning' as const,
        },
        {
          title: 'Society Facilities',
          href: '/resident#facilities-section',
          icon: Layers,
        },
        {
          title: 'Notice Board',
          href: '/resident#notices-section',
          icon: Bell,
        },
      ];

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r bg-card transition-all duration-300 z-30 h-screen sticky top-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand Header with Residenza Logo */}
      <div className="flex h-16 items-center justify-between px-3.5 border-b">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <img
            src="/logo.jpg"
            alt="Residenza Logo"
            className="h-9 w-9 shrink-0 rounded-lg object-cover shadow-sm border border-border"
          />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-tight tracking-tight text-foreground">Residenza</span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                {user?.role === 'ADMIN' ? 'Admin Portal' : 'Resident Portal'}
              </span>
            </div>
          )}
        </Link>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex h-6 w-6 items-center justify-center rounded-md border text-muted-foreground hover:text-foreground hover:bg-accent transition"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Navigation Group */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          {!collapsed && (
            <h4 className="px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Main Menu
            </h4>
          )}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href.includes('#') && pathname === item.href.split('#')[0]);

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-secondary text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <div className="flex flex-1 items-center justify-between">
                      <span>{item.title}</span>
                      {item.badge && (
                        <span
                          className={cn(
                            'px-1.5 py-0.5 rounded text-[9px] font-bold uppercase',
                            item.badgeVariant === 'destructive'
                              ? 'bg-destructive/15 text-destructive border border-destructive/20'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Footer Profile Card */}
      {user && (
        <div className="border-t p-3 bg-muted/30">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20">
                {user.name.charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <div className="flex flex-col truncate">
                  <span className="text-xs font-semibold truncate leading-tight">{user.name}</span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {user.role} {user.flatNumber ? `• ${user.flatNumber}` : ''}
                  </span>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
