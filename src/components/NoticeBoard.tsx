'use client';

import React from 'react';
import { Bell, Pin, ShieldCheck } from 'lucide-react';

export interface NoticeItem {
  id: string;
  title: string;
  content: string;
  isImportant: boolean;
  createdAt: string;
  createdBy: {
    name: string;
    role: string;
  };
}

interface NoticeBoardProps {
  notices: NoticeItem[];
}

export default function NoticeBoard({ notices }: NoticeBoardProps) {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Bell className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Society Notice Board</h3>
        </div>
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">
          {notices.length} Announcements
        </span>
      </div>

      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {notices.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No notices posted yet.</p>
        ) : (
          notices.map((notice) => (
            <div
              key={notice.id}
              className={`p-3.5 rounded-xl border transition ${
                notice.isImportant
                  ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-800/60 shadow-xs ring-1 ring-amber-200/50 dark:ring-amber-900/40'
                  : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 leading-snug">
                  {notice.isImportant && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-black bg-amber-500 text-white shrink-0">
                      <Pin className="w-2.5 h-2.5" /> PINNED
                    </span>
                  )}
                  <span>{notice.title}</span>
                </h4>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2.5">{notice.content}</p>

              <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-200/40 dark:border-slate-800">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-indigo-500" />
                  {notice.createdBy.name}
                </span>
                <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
