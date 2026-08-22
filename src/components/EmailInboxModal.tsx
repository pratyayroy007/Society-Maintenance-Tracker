'use client';

import React, { useState } from 'react';
import { X, Mail, CheckCircle2, Calendar, ExternalLink, Inbox } from 'lucide-react';

export interface EmailNotification {
  id: string;
  to: string;
  subject: string;
  html: string;
  status: string;
  createdAt: string;
}

interface EmailInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: EmailNotification[];
  userEmail: string;
}

export default function EmailInboxModal({ isOpen, onClose, notifications, userEmail }: EmailInboxModalProps) {
  const [selectedEmail, setSelectedEmail] = useState<EmailNotification | null>(
    notifications[0] || null
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden max-h-[88vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>In-App Email Notification Center</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                  {notifications.length} Emails
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live email dispatches sent to <strong>{userEmail}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Email List Left Column */}
          <div className="md:col-span-5 border-r border-slate-100 dark:border-slate-800 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
            {notifications.length === 0 ? (
              <div className="p-10 text-center space-y-2 text-slate-400">
                <Inbox className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-xs font-semibold">No emails sent to this address yet.</p>
                <p className="text-[10px] text-slate-400">Raise a complaint to receive your instant confirmation email!</p>
              </div>
            ) : (
              notifications.map((email) => {
                const isSelected = selectedEmail?.id === email.id;
                return (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={`p-3.5 cursor-pointer transition ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-l-4 border-indigo-600'
                        : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        SocietyCare
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(email.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                      {email.subject}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {email.html.replace(/<[^>]*>/g, ' ').substring(0, 80)}...
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Email Preview Right Column */}
          <div className="md:col-span-7 p-4 overflow-y-auto bg-slate-100 dark:bg-slate-950/80 flex flex-col">
            {selectedEmail ? (
              <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 space-y-3 flex-1">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Subject</span>
                  <h4 className="text-sm font-bold text-slate-900">{selectedEmail.subject}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>To: {selectedEmail.to}</span>
                    <span>{new Date(selectedEmail.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Render HTML Body */}
                <div
                  className="prose prose-sm max-w-none text-xs text-slate-800"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">
                Select an email from the left to view preview
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0 flex items-center justify-between text-xs text-slate-500">
          <span>💡 To deliver emails to your real inbox, add your Gmail App Password to <code>.env</code></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-bold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
