'use client';

import React from 'react';
import { Calendar, AlertTriangle, CheckCircle2, Clock, Wrench, Eye } from 'lucide-react';
import { ComplaintWithDetails } from '@/lib/types';

interface ComplaintCardProps {
  complaint: ComplaintWithDetails;
  onViewDetails: (complaint: ComplaintWithDetails) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  PLUMBING: '🚰',
  ELECTRICAL: '⚡',
  CARPENTRY: '🪚',
  CLEANING: '🧹',
  ELEVATOR: '🛗',
  SECURITY: '🛡️',
  PAINTING: '🎨',
  OTHER: '📦',
};

export default function ComplaintCard({ complaint, onViewDetails }: ComplaintCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            <Clock className="w-3 h-3" /> Open
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
            <Wrench className="w-3 h-3" /> In Progress
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </span>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 uppercase tracking-wider">
            High Priority
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 uppercase tracking-wider">
            Medium
          </span>
        );
      case 'LOW':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Low
          </span>
        );
      default:
        return null;
    }
  };

  const formattedDate = new Date(complaint.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      className={`relative rounded-2xl bg-white dark:bg-slate-900 border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
        complaint.isOverdue
          ? 'border-rose-300 dark:border-rose-800 ring-1 ring-rose-300 dark:ring-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20'
          : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {getStatusBadge(complaint.status)}
            {getPriorityBadge(complaint.priority)}
            {complaint.isOverdue && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white uppercase tracking-wider animate-pulse">
                <AlertTriangle className="w-3 h-3" /> OVERDUE
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
            <span>{CATEGORY_ICONS[complaint.category] || '📦'}</span>
            <span>{complaint.category}</span>
          </span>
        </div>

        <h4 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 mb-1.5">{complaint.title}</h4>
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">{complaint.description}</p>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {complaint.photoUrl && (
            <div className="relative cursor-pointer" onClick={() => onViewDetails(complaint)}>
              <img
                src={complaint.photoUrl}
                alt="Attachment"
                className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
              />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
              </span>
            </div>
          )}

          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" /> {formattedDate}
            </span>
          </div>
        </div>

        <button
          onClick={() => onViewDetails(complaint)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Timeline ({complaint.history?.length || 1})</span>
        </button>
      </div>
    </div>
  );
}
