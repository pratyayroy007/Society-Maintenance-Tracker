'use client';

import React from 'react';
import { Bell, Pin, Calendar, ShieldCheck } from 'lucide-react';

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
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Bell className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Society Notice Board</h3>
        </div>
        <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
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
                  ? 'bg-amber-50/60 border-amber-200/80 shadow-xs ring-1 ring-amber-200/50'
                  : 'bg-slate-50/60 border-slate-200/70 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 leading-snug">
                  {notice.isImportant && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-black bg-amber-500 text-white shrink-0">
                      <Pin className="w-2.5 h-2.5" /> PINNED
                    </span>
                  )}
                  <span>{notice.title}</span>
                </h4>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-2.5">{notice.content}</p>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-200/40">
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
