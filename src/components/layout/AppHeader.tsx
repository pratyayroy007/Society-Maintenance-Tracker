'use client';

import React, { useState } from 'react';
import { Menu, Sun, Moon, Mail, PlusCircle, Search, LogOut } from 'lucide-react';
import { UserSession } from '@/lib/types';
import { useTheme } from '../ThemeContext';
import { Button } from '../ui/button';
import EmailInboxModal, { EmailNotification } from '../EmailInboxModal';

interface AppHeaderProps {
  user: UserSession | null;
  onOpenRaiseModal?: () => void;
  title?: string;
}

export default function AppHeader({ user, onOpenRaiseModal, title = 'Dashboard' }: AppHeaderProps) {
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      window.location.href = '/login';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 sm:px-6 backdrop-blur">
        {/* Page Title & Breadcrumb */}
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold tracking-tight text-foreground">{title}</h2>
        </div>

        {/* Header Right Controls */}
        <div className="flex items-center gap-2.5">
          {/* Quick Raise CTA */}
          {user?.role === 'RESIDENT' && onOpenRaiseModal && (
            <Button
              size="sm"
              onClick={onOpenRaiseModal}
              className="gap-1.5 font-semibold text-xs shadow-xs"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Raise Complaint</span>
            </Button>
          )}

          {/* Email Inbox Notifications */}
          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                fetchNotifications();
                setIsInboxOpen(true);
              }}
              title="In-App Email Notifications"
              className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Mail className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </Button>
          )}

          {/* Theme Switcher */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-400" />}
          </Button>

          {/* User Avatar + Sign Out */}
          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </header>

      {/* In-App Email Drawer */}
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
