'use client';

import React, { useState } from 'react';
import { X, Clock, Wrench, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { ComplaintWithDetails } from '@/lib/types';

interface AdminStatusUpdateModalProps {
  complaint: ComplaintWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: () => void;
}

export default function AdminStatusUpdateModal({
  complaint,
  isOpen,
  onClose,
  onStatusUpdated,
}: AdminStatusUpdateModalProps) {
  const [status, setStatus] = useState<'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('IN_PROGRESS');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !complaint) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/complaints/${complaint.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          note: note.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      setNote('');
      onStatusUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Status update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Workflow Transition</span>
            <h3 className="text-base font-bold text-slate-900">Update Complaint Status</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Ticket Summary */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <p className="font-bold text-slate-800 line-clamp-1">{complaint.title}</p>
            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span>Resident: {complaint.resident.name} ({complaint.resident.flatNumber || 'N/A'})</span>
              <span>Current: <strong className="uppercase">{complaint.status}</strong></span>
            </div>
          </div>

          {/* Status Options */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              New Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('OPEN')}
                className={`p-3 rounded-xl border text-left transition flex flex-col items-center gap-1.5 ${
                  status === 'OPEN'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-400/30'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-bold">Open</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('IN_PROGRESS')}
                className={`p-3 rounded-xl border text-left transition flex flex-col items-center gap-1.5 ${
                  status === 'IN_PROGRESS'
                    ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-400/30'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Wrench className="w-5 h-5 text-blue-500" />
                <span className="text-xs font-bold">In Progress</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('RESOLVED')}
                className={`p-3 rounded-xl border text-left transition flex flex-col items-center gap-1.5 ${
                  status === 'RESOLVED'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-400/30'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-xs font-bold">Resolved</span>
              </button>
            </div>
          </div>

          {/* Remarks Note */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Admin Remarks / Resolution Note
            </label>
            <textarea
              rows={3}
              placeholder={
                status === 'RESOLVED'
                  ? 'e.g. Plumber replaced faulty gasket and tested water flow. Issue fixed.'
                  : status === 'IN_PROGRESS'
                  ? 'e.g. Electrician scheduled for inspection at 3 PM today.'
                  : 'Add any remarks or context for this status change...'
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-400"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              This note will be logged in the public audit timeline and emailed to the resident.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{loading ? 'Updating...' : 'Save Status Change'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
