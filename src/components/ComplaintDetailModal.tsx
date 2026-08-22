'use client';

import React from 'react';
import { X, Clock, User } from 'lucide-react';
import { ComplaintWithDetails } from '@/lib/types';

interface ComplaintDetailModalProps {
  complaint: ComplaintWithDetails | null;
  onClose: () => void;
}

export default function ComplaintDetailModal({ complaint, onClose }: ComplaintDetailModalProps) {
  if (!complaint) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                {complaint.category}
              </span>
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Ticket #{complaint.id.substring(complaint.id.length - 6).toUpperCase()}
              </span>
              {complaint.isOverdue && (
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-600 text-white uppercase tracking-wider">
                  Overdue
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{complaint.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Top Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Status</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{complaint.status}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Priority</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{complaint.priority}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Resident</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{complaint.resident.name} ({complaint.resident.flatNumber || 'N/A'})</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Raised On</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {new Date(complaint.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
              {complaint.description}
            </p>
          </div>

          {/* Photo Attachment */}
          {complaint.photoUrl && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Photo Evidence</h4>
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-72 bg-slate-900/5 dark:bg-slate-950 flex items-center justify-center">
                <img
                  src={complaint.photoUrl}
                  alt="Complaint Photo"
                  className="w-full h-full object-contain max-h-72"
                />
              </div>
            </div>
          )}

          {/* Complete Status Lifecycle Timeline */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Status Lifecycle & Audit Trail</span>
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {complaint.history && complaint.history.length > 0 ? (
                complaint.history.map((step) => (
                  <div key={step.id} className="relative">
                    <div
                      className={`absolute -left-[19px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-sm flex items-center justify-center ${
                        step.newStatus === 'RESOLVED'
                          ? 'bg-emerald-500'
                          : step.newStatus === 'IN_PROGRESS'
                          ? 'bg-blue-500'
                          : 'bg-amber-500'
                      }`}
                    />

                    <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {step.previousStatus ? `${step.previousStatus} ➔ ` : ''}
                          <span
                            className={
                              step.newStatus === 'RESOLVED'
                                ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                                : step.newStatus === 'IN_PROGRESS'
                                ? 'text-blue-600 dark:text-blue-400 font-extrabold'
                                : 'text-amber-600 dark:text-amber-400 font-extrabold'
                            }
                          >
                            {step.newStatus}
                          </span>
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(step.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {step.note && (
                        <p className="text-slate-600 dark:text-slate-300 mt-1 italic bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                          "{step.note}"
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>Updated by: <strong>{step.changedBy.name}</strong> ({step.changedBy.role})</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No history events recorded.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
