'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ComplaintDetailModal from '@/components/ComplaintDetailModal';
import AdminStatusUpdateModal from '@/components/AdminStatusUpdateModal';
import AdminNoticeModal from '@/components/AdminNoticeModal';
import AdminThresholdModal from '@/components/AdminThresholdModal';
import NoticeBoard, { NoticeItem } from '@/components/NoticeBoard';
import { UserSession, ComplaintWithDetails } from '@/lib/types';
import {
  Building2,
  Shield,
  Clock,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  FileText,
  Search,
  Sliders,
  PlusCircle,
  RefreshCw,
  Eye,
  Edit,
  ArrowUpDown,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [complaints, setComplaints] = useState<ComplaintWithDetails[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [thresholdDays, setThresholdDays] = useState(3);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [overdueFilter, setOverdueFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintWithDetails | null>(null);
  const [updatingComplaint, setUpdatingComplaint] = useState<ComplaintWithDetails | null>(null);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const authRes = await fetch('/api/auth/me');
      if (!authRes.ok) {
        router.push('/login');
        return;
      }
      const authData = await authRes.json();
      if (authData.user.role !== 'ADMIN') {
        router.push('/resident');
        return;
      }
      setUser(authData.user);

      await Promise.all([fetchComplaints(), fetchNotices(), fetchSettings()]);
    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await fetch('/api/complaints');
      if (res.ok) {
        const data = await res.json();
        setComplaints(data.complaints || []);
      }
    } catch (err) {
      console.error('Failed to load complaints:', err);
    }
  };

  const fetchNotices = async () => {
    try {
      const res = await fetch('/api/notices');
      if (res.ok) {
        const data = await res.json();
        setNotices(data.notices || []);
      }
    } catch (err) {
      console.error('Failed to load notices:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setThresholdDays(data.overdueDaysThreshold || 3);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const handleQuickPriorityChange = async (complaintId: string, newPriority: string) => {
    try {
      const res = await fetch(`/api/complaints/${complaintId}/priority`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority }),
      });
      if (res.ok) {
        fetchComplaints();
      }
    } catch (err) {
      console.error('Priority update error:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter and sort complaints
  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && c.category !== categoryFilter) return false;
    if (priorityFilter !== 'ALL' && c.priority !== priorityFilter) return false;
    if (overdueFilter === 'OVERDUE' && !c.isOverdue) return false;
    if (overdueFilter === 'NOT_OVERDUE' && c.isOverdue) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.resident.name.toLowerCase().includes(q) ||
        (c.resident.flatNumber && c.resident.flatNumber.toLowerCase().includes(q)) ||
        c.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate Metrics
  const metrics = {
    total: complaints.length,
    open: complaints.filter((c) => c.status === 'OPEN').length,
    inProgress: complaints.filter((c) => c.status === 'IN_PROGRESS').length,
    resolved: complaints.filter((c) => c.status === 'RESOLVED').length,
    overdue: complaints.filter((c) => c.isOverdue).length,
  };

  // Category Breakdown for reporting
  const categoryCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading Administrator Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded uppercase tracking-wider">
                <Shield className="w-3 h-3" /> Administrator Portal
              </span>
              <span className="text-xs text-slate-400 font-semibold">• Society Management Command Center</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Maintenance Operations & Triage
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review resident tickets, update statuses with audit trail notes, configure SLAs, and broadcast notices.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setRefreshing(true);
                fetchComplaints();
                fetchNotices();
              }}
              title="Refresh Data"
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
            </button>

            <button
              onClick={() => setIsThresholdModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
            >
              <Sliders className="w-4 h-4 text-slate-500" />
              <span>Overdue SLA: <strong>{thresholdDays} Days</strong></span>
            </button>

            <button
              onClick={() => setIsNoticeModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Broadcast Notice</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Complaints</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{metrics.total}</h3>
            <span className="text-[10px] text-slate-400">All registered issues</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Open (Pending)</span>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{metrics.open}</h3>
            <span className="text-[10px] text-amber-600/80">Requires triage</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-xs">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">In Progress</span>
            <h3 className="text-2xl font-black text-blue-600 mt-1">{metrics.inProgress}</h3>
            <span className="text-[10px] text-blue-600/80">Work underway</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Resolved</span>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{metrics.resolved}</h3>
            <span className="text-[10px] text-emerald-600/80">Closed tickets</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-rose-300 bg-rose-50/40 shadow-xs ring-1 ring-rose-200 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Overdue Issues</span>
              {metrics.overdue > 0 && <span className="flex h-2 w-2 rounded-full bg-rose-600 animate-ping" />}
            </div>
            <h3 className="text-2xl font-black text-rose-600 mt-1">{metrics.overdue}</h3>
            <span className="text-[10px] text-rose-700/80">&gt; {thresholdDays} days open</span>
          </div>
        </div>

        {/* Complaints Table Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">All Society Complaints</h2>
              <p className="text-xs text-slate-500">
                Overdue items automatically surface at the top of the queue.
              </p>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search resident, title, unit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-60"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Status</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Categories</option>
                <option value="PLUMBING">Plumbing</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="CARPENTRY">Carpentry</option>
                <option value="CLEANING">Cleaning</option>
                <option value="ELEVATOR">Elevator</option>
                <option value="SECURITY">Security</option>
                <option value="OTHER">Other</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Priority</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              <select
                value={overdueFilter}
                onChange={(e) => setOverdueFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">Overdue: All</option>
                <option value="OVERDUE">Overdue Only</option>
                <option value="NOT_OVERDUE">Within SLA</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Ticket & Details</th>
                  <th className="py-3 px-3">Resident / Unit</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Age / Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No complaints match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((complaint) => {
                    const daysAgo = Math.floor(
                      (new Date().getTime() - new Date(complaint.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                    );

                    return (
                      <tr
                        key={complaint.id}
                        className={`hover:bg-slate-50/80 transition ${
                          complaint.isOverdue ? 'bg-rose-50/20' : ''
                        }`}
                      >
                        {/* Title & Attachment */}
                        <td className="py-3 px-4">
                          <div className="flex items-start gap-2.5">
                            {complaint.photoUrl ? (
                              <img
                                src={complaint.photoUrl}
                                alt="thumb"
                                onClick={() => setSelectedComplaint(complaint)}
                                className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0 cursor-pointer shadow-xs"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 text-[10px] font-bold">
                                {complaint.category.slice(0, 3)}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 line-clamp-1">{complaint.title}</span>
                                {complaint.isOverdue && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-600 text-white uppercase shrink-0 animate-pulse">
                                    <AlertTriangle className="w-2.5 h-2.5" /> OVERDUE
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{complaint.description}</p>
                            </div>
                          </div>
                        </td>

                        {/* Resident */}
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{complaint.resident.name}</div>
                          <span className="text-[11px] text-indigo-600 font-bold">
                            Unit: {complaint.resident.flatNumber || 'N/A'}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                            {complaint.category}
                          </span>
                        </td>

                        {/* Priority with Quick Dropdown */}
                        <td className="py-3 px-3">
                          <select
                            value={complaint.priority}
                            onChange={(e) => handleQuickPriorityChange(complaint.id, e.target.value)}
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border focus:outline-none ${
                              complaint.priority === 'HIGH'
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : complaint.priority === 'MEDIUM'
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                          >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                          </select>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              complaint.status === 'RESOLVED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : complaint.status === 'IN_PROGRESS'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {complaint.status === 'RESOLVED' ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : complaint.status === 'IN_PROGRESS' ? (
                              <Wrench className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            <span>{complaint.status}</span>
                          </span>
                        </td>

                        {/* Age / Date */}
                        <td className="py-3 px-3 text-[11px] text-slate-500">
                          <div>{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedComplaint(complaint)}
                              title="View History Timeline"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setUpdatingComplaint(complaint)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Update Status</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Section: Category Breakdown Reporting & Notice Board Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Category Analytics Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Complaints by Category</h3>
            </div>

            <div className="space-y-2.5">
              {Object.entries(categoryCounts).map(([cat, count]) => {
                const pct = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{cat}</span>
                      <span className="text-slate-500">{count} issues ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notice Board Management (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Live Notice Board Feed</h3>
              <button
                onClick={() => setIsNoticeModalOpen(true)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Notice</span>
              </button>
            </div>
            <NoticeBoard notices={notices} />
          </div>
        </div>
      </main>

      {/* Modals */}
      <ComplaintDetailModal
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
      />

      <AdminStatusUpdateModal
        complaint={updatingComplaint}
        isOpen={Boolean(updatingComplaint)}
        onClose={() => setUpdatingComplaint(null)}
        onStatusUpdated={() => fetchComplaints()}
      />

      <AdminNoticeModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        onNoticeCreated={() => fetchNotices()}
      />

      <AdminThresholdModal
        currentDays={thresholdDays}
        isOpen={isThresholdModalOpen}
        onClose={() => setIsThresholdModalOpen(false)}
        onThresholdUpdated={(newDays) => {
          setThresholdDays(newDays);
          fetchComplaints();
        }}
      />
    </div>
  );
}
