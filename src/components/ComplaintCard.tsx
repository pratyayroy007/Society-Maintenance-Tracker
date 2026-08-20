'use client';

import React from 'react';
import { Calendar, AlertTriangle, CheckCircle2, Clock, Wrench, ShieldAlert, Eye, MessageSquare } from 'lucide-react';
import { ComplaintWithDetails } from '@/lib/types';

interface ComplaintCardProps {
  complaint: ComplaintWithDetails;
  onViewDetails: (complaint: ComplaintWithDetails) => void;
}

export default function ComplaintCard({ complaint, onViewDetails }: ComplaintCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" /> Open
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Wrench className="w-3 h-3" /> In Progress
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
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
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-700 uppercase tracking-wider">
            High Priority
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider">
            Medium
          </span>
        );
      case 'LOW':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wider">
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
    <div className={`relative rounded-2xl bg-white border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
      complaint.isOverdue ? 'border-red-300 ring-1 ring-red-200 bg-red-50/20' : 'border-slate-200'
    }`}>
      {/* Top badges */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {getStatusBadge(complaint.status)}
            {getPriorityBadge(complaint.priority)}
            {complaint.isOverdue && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-600 text-white uppercase tracking-wider animate-pulse">
                <AlertTriangle className="w-3 h-3" /> OVERDUE
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-600 font-semibold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
            {complaint.category}
          </span>
        </div>

        {/* Title & Description */}
        <h4 className="text-base font-bold text-slate-900 line-clamp-1 mb-1.5">{complaint.title}</h4>
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">{complaint.description}</p>
      </div>

      {/* Media Thumbnail & Meta Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {complaint.photoUrl && (
            <div className="relative group/thumb cursor-pointer" onClick={() => onViewDetails(complaint)}>
              <img
                src={complaint.photoUrl}
                alt="Complaint attachment"
                className="w-9 h-9 rounded-lg object-cover border border-slate-200 shadow-xs"
              />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
              </span>
            </div>
          )}

          <div className="text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" /> {formattedDate}
            </span>
          </div>
        </div>

        <button
          onClick={() => onViewDetails(complaint)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Timeline ({complaint.history?.length || 1})</span>
        </button>
      </div>
    </div>
  );
}
