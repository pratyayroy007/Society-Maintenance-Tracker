'use client';

import React, { useState, useEffect } from 'react';
import AppSidebar from '@/components/layout/AppSidebar';
import AppHeader from '@/components/layout/AppHeader';
import ComplaintDetailModal from '@/components/ComplaintDetailModal';
import AdminStatusUpdateModal from '@/components/AdminStatusUpdateModal';
import AdminNoticeModal from '@/components/AdminNoticeModal';
import AdminThresholdModal from '@/components/AdminThresholdModal';
import NoticeBoard, { NoticeItem } from '@/components/NoticeBoard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { UserSession, ComplaintWithDetails } from '@/lib/types';
import {
  Shield,
  Clock,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  Search,
  Sliders,
  PlusCircle,
  RefreshCw,
  Eye,
  Edit,
  Layers,
  FileText,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [complaints, setComplaints] = useState<ComplaintWithDetails[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [thresholdDays, setThresholdDays] = useState(3);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
        window.location.href = '/login';
        return;
      }
      const authData = await authRes.json();
      if (authData.user.role !== 'ADMIN') {
        window.location.href = '/resident';
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

  const metrics = {
    total: complaints.length,
    open: complaints.filter((c) => c.status === 'OPEN').length,
    inProgress: complaints.filter((c) => c.status === 'IN_PROGRESS').length,
    resolved: complaints.filter((c) => c.status === 'RESOLVED').length,
    overdue: complaints.filter((c) => c.isOverdue).length,
  };

  const categoryCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-muted-foreground">Loading Administrator Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* satnaing/shadcn-admin Sidebar */}
      <AppSidebar
        user={user}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        openCount={metrics.open}
        overdueCount={metrics.overdue}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader user={user} title="Admin Operations" />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Top Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="gap-1 font-semibold uppercase tracking-wider text-[10px]">
                  <Shield className="h-3 w-3 text-primary" /> Admin Command
                </Badge>
                <span className="text-xs text-muted-foreground">• Society Maintenance Operations</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Complaints & Facility Triage
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRefreshing(true);
                  fetchComplaints();
                  fetchNotices();
                }}
                className="gap-1.5 text-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsThresholdModalOpen(true)}
                className="gap-1.5 text-xs"
              >
                <Sliders className="h-3.5 w-3.5 text-muted-foreground" />
                <span>SLA: <strong>{thresholdDays} Days</strong></span>
              </Button>

              <Button
                size="sm"
                onClick={() => setIsNoticeModalOpen(true)}
                className="gap-1.5 text-xs font-semibold"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Broadcast Notice</span>
              </Button>
            </div>
          </div>

          {/* Metric Cards in shadcn Style */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Total Complaints</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.total}</div>
                <p className="text-[11px] text-muted-foreground mt-1">Across all units</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-amber-600 dark:text-amber-400">Open (Pending)</CardTitle>
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{metrics.open}</div>
                <p className="text-[11px] text-muted-foreground mt-1">Requires triage</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-blue-600 dark:text-blue-400">In Progress</CardTitle>
                <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{metrics.inProgress}</div>
                <p className="text-[11px] text-muted-foreground mt-1">Active tasks</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Resolved</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{metrics.resolved}</div>
                <p className="text-[11px] text-muted-foreground mt-1">Closed successfully</p>
              </CardContent>
            </Card>

            <Card className="border-destructive/30 bg-destructive/5 col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-destructive">Overdue SLA</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{metrics.overdue}</div>
                <p className="text-[11px] text-muted-foreground mt-1">&gt; {thresholdDays} days open</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Container: Complaints Table, Category Analytics, Notices */}
          <div id="complaints-table" className="pt-2">
            <Tabs defaultValue="tickets" className="space-y-4">
              <TabsList>
                <TabsTrigger value="tickets" className="gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Complaints Triage ({filteredComplaints.length})</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-1.5">
                  <Layers className="h-3.5 w-3.5" />
                  <span>Category Breakdown</span>
                </TabsTrigger>
                <TabsTrigger value="notices" className="gap-1.5">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Notice Board ({notices.length})</span>
                </TabsTrigger>
              </TabsList>

              {/* Complaints Triage Tab */}
              <TabsContent value="tickets" className="space-y-4">
                {/* Search & Filter Card */}
                <Card className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search resident, flat, title, category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 rounded-md border border-input bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-2.5 py-1.5 rounded-md border border-input bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="ALL">All Status</option>
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>

                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-2.5 py-1.5 rounded-md border border-input bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
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
                        className="px-2.5 py-1.5 rounded-md border border-input bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="ALL">All Priority</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                      </select>

                      <select
                        value={overdueFilter}
                        onChange={(e) => setOverdueFilter(e.target.value)}
                        className="px-2.5 py-1.5 rounded-md border border-input bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="ALL">Overdue: All</option>
                        <option value="OVERDUE">Overdue Only</option>
                        <option value="NOT_OVERDUE">Within SLA</option>
                      </select>
                    </div>
                  </div>
                </Card>

                {/* Shadcn Data Table */}
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ticket & Issue</TableHead>
                        <TableHead>Resident / Unit</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Age / Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredComplaints.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                            No complaints match the selected filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredComplaints.map((complaint) => {
                          const daysAgo = Math.floor(
                            (new Date().getTime() - new Date(complaint.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                          );

                          return (
                            <TableRow key={complaint.id} className={complaint.isOverdue ? 'bg-destructive/5' : ''}>
                              {/* Ticket details */}
                              <TableCell>
                                <div className="flex items-start gap-2.5">
                                  {complaint.photoUrl ? (
                                    <img
                                      src={complaint.photoUrl}
                                      alt="thumb"
                                      onClick={() => setSelectedComplaint(complaint)}
                                      className="w-9 h-9 rounded-md object-cover border shrink-0 cursor-pointer shadow-xs"
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded-md bg-muted text-muted-foreground flex items-center justify-center shrink-0 text-[10px] font-bold">
                                      {complaint.category.slice(0, 3)}
                                    </div>
                                  )}
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-semibold text-foreground line-clamp-1">{complaint.title}</span>
                                      {complaint.isOverdue && (
                                        <Badge variant="destructive" className="px-1.5 py-0 text-[9px] font-bold uppercase animate-pulse">
                                          Overdue
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{complaint.description}</p>
                                  </div>
                                </div>
                              </TableCell>

                              {/* Resident */}
                              <TableCell>
                                <div className="font-medium text-foreground">{complaint.resident.name}</div>
                                <span className="text-[11px] text-primary font-semibold">
                                  Unit {complaint.resident.flatNumber || 'N/A'}
                                </span>
                              </TableCell>

                              {/* Category */}
                              <TableCell>
                                <Badge variant="outline" className="text-[10px] font-semibold uppercase">
                                  {complaint.category}
                                </Badge>
                              </TableCell>

                              {/* Priority Dropdown */}
                              <TableCell>
                                <select
                                  value={complaint.priority}
                                  onChange={(e) => handleQuickPriorityChange(complaint.id, e.target.value)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border focus:outline-none ${
                                    complaint.priority === 'HIGH'
                                      ? 'bg-destructive/15 text-destructive border-destructive/30'
                                      : complaint.priority === 'MEDIUM'
                                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                      : 'bg-muted text-muted-foreground border-border'
                                  }`}
                                >
                                  <option value="LOW">Low</option>
                                  <option value="MEDIUM">Medium</option>
                                  <option value="HIGH">High</option>
                                </select>
                              </TableCell>

                              {/* Status */}
                              <TableCell>
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                                    complaint.status === 'RESOLVED'
                                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                      : complaint.status === 'IN_PROGRESS'
                                      ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
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
                              </TableCell>

                              {/* Age */}
                              <TableCell className="text-[11px] text-muted-foreground">
                                <div>{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</div>
                                <span className="text-[10px] text-muted-foreground/80">
                                  {new Date(complaint.createdAt).toLocaleDateString()}
                                </span>
                              </TableCell>

                              {/* Actions */}
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setSelectedComplaint(complaint)}
                                    title="View Timeline"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>

                                  <Button
                                    size="sm"
                                    onClick={() => setUpdatingComplaint(complaint)}
                                    className="h-7 px-2.5 text-xs font-semibold gap-1"
                                  >
                                    <Edit className="h-3 w-3" />
                                    <span>Status</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" id="analytics-section">
                <Card className="p-6 space-y-4">
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className="text-base font-bold">Category Distribution Analytics</CardTitle>
                    <CardDescription>Breakdown of all maintenance issues across society facilities</CardDescription>
                  </CardHeader>
                  <div className="space-y-3 pt-2">
                    {Object.entries(categoryCounts).map(([cat, count]) => {
                      const pct = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;
                      return (
                        <div key={cat} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-foreground">
                            <span>{cat}</span>
                            <span className="text-muted-foreground">{count} issues ({pct}%)</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </TabsContent>

              {/* Notices Tab */}
              <TabsContent value="notices" id="notices-section">
                <NoticeBoard notices={notices} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

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
