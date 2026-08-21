'use client';

import React, { useState } from 'react';
import { X, Sliders, AlertCircle, Loader2, Check } from 'lucide-react';

interface AdminThresholdModalProps {
  currentDays: number;
  isOpen: boolean;
  onClose: () => void;
  onThresholdUpdated: (newDays: number) => void;
}

export default function AdminThresholdModal({
  currentDays,
  isOpen,
  onClose,
  onThresholdUpdated,
}: AdminThresholdModalProps) {
  const [days, setDays] = useState(currentDays.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const val = Number(days);
    if (isNaN(val) || val < 1 || val > 60) {
      setError('Please enter a valid threshold between 1 and 60 days');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'OVERDUE_DAYS_THRESHOLD',
          value: String(val),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update setting');
      }

      onThresholdUpdated(val);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update threshold');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">SLA Configuration</span>
            <h3 className="text-base font-bold text-slate-900">Configure Overdue Threshold</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-xs text-slate-600 leading-relaxed">
            Unresolved complaints older than this threshold will automatically be flagged as <strong>OVERDUE</strong> and surfaced to the top of the admin view.
          </p>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Overdue Threshold (in Days)
            </label>
            <input
              type="number"
              min={1}
              max={60}
              required
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

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
              <span>{loading ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
