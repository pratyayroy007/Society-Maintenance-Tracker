'use client';

import React, { useState, useEffect } from 'react';
import AppSidebar from '@/components/layout/AppSidebar';
import AppHeader from '@/components/layout/AppHeader';
import ComplaintCard from '@/components/ComplaintCard';
import RaiseComplaintModal from '@/components/RaiseComplaintModal';
import ComplaintDetailModal from '@/components/ComplaintDetailModal';
import NoticeBoard, { NoticeItem } from '@/components/NoticeBoard';
import FacilityCard, { FACILITIES } from '@/components/FacilityCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { UserSession, ComplaintWithDetails } from '@/lib/types';
import {
  PlusCircle,
  Search,
  RefreshCw,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Building2,
  Wrench,
  Bell,
} from 'lucide-react';

export default function ResidentDashboard() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [complaints, setComplaints] = useState<ComplaintWithDetails[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintWithDetails | null>(null);

  const fetchSessionAndData = async () => {
    try {
      const authRes = await fetch('/api/auth/me');
      if (!authRes.ok) {
        window.location.href = '/login';
        return;
      }
      const authData = await authRes.json();
      setUser(authData.user);

      await Promise.all([fetchComplaints(), fetchNotices()]);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
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
      console.error('Error fetching complaints:', err);
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
      console.error('Error fetching notices:', err);
    }
  };

  useEffect(() => {
    fetchSessionAndData();
  }, []);

  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && c.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total: complaints.length,
    open: complaints.filter((c) => c.status === 'OPEN').length,
    inProgress: complaints.filter((c) => c.status === 'IN_PROGRESS').length,
    resolved: complaints.filter((c) => c.status === 'RESOLVED').length,
    overdue: complaints.filter((c) => c.isOverdue).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-muted-foreground">Loading Residenza Portal...</p>
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
        openCount={stats.open}
        overdueCount={stats.overdue}
      />

      {/* Main Content Viewport */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader
          user={user}
          onOpenRaiseModal={() => setIsRaiseModalOpen(true)}
          title="Resident Portal"
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Top Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Welcome back, {user?.name.split(' ')[0]} 👋
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Unit <strong>{user?.flatNumber || 'A-402'}</strong> • Registered: <strong>{user?.email}</strong>
              </p>
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
                size="sm"
                onClick={() => setIsRaiseModalOpen(true)}
                className="gap-1.5 text-xs font-semibold"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Raise Complaint</span>
              </Button>
            </div>
          </div>

          {/* Metric KPI Cards in shadcn Style */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Total Tickets</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-[11px] text-muted-foreground mt-1">All time raised requests</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-amber-600 dark:text-amber-400">Pending Triage</CardTitle>
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.open}</div>
                <p className="text-[11px] text-muted-foreground mt-1">Under review by admin</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-blue-600 dark:text-blue-400">In Progress</CardTitle>
                <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</div>
                <p className="text-[11px] text-muted-foreground mt-1">Technician working</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Resolved</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.resolved}</div>
                <p className="text-[11px] text-muted-foreground mt-1">Completed & verified</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Facility Services Section */}
          <div id="facilities-section" className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Facility & Maintenance Services</h3>
                <p className="text-xs text-muted-foreground">Select a category to quickly log an issue</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {FACILITIES.map((facility) => (
                <FacilityCard
                  key={facility.category}
                  facility={facility}
                  onSelect={() => setIsRaiseModalOpen(true)}
                />
              ))}
            </div>
          </div>

          {/* Tabs Container: Complaints + Notice Board */}
          <div id="my-complaints-section" className="pt-2">
            <Tabs defaultValue="complaints" className="space-y-4">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="complaints" className="gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    <span>My Complaints ({filteredComplaints.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="notices" className="gap-1.5">
                    <Bell className="h-3.5 w-3.5" />
                    <span>Notice Board ({notices.length})</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Complaints Tab Content */}
              <TabsContent value="complaints" className="space-y-4">
                {/* Search & Filter Bar */}
                <Card className="p-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search your complaints by title, category, description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 rounded-md border border-input bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-2.5 py-1.5 rounded-md border border-input bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="ALL">All Statuses</option>
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
                    </div>
                  </div>
                </Card>

                {/* Complaints Grid */}
                {filteredComplaints.length === 0 ? (
                  <Card className="p-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-semibold text-foreground">No Complaints Found</h4>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      {searchQuery || statusFilter !== 'ALL'
                        ? 'No complaints match your active filters. Try clearing your search.'
                        : 'You have not submitted any maintenance requests yet.'}
                    </p>
                    <Button size="sm" onClick={() => setIsRaiseModalOpen(true)} className="gap-1.5">
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span>Submit a Complaint</span>
                    </Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredComplaints.map((complaint) => (
                      <ComplaintCard
                        key={complaint.id}
                        complaint={complaint}
                        onViewDetails={(c) => setSelectedComplaint(c)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Notice Board Tab Content */}
              <TabsContent value="notices" id="notices-section">
                <NoticeBoard notices={notices} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Modals */}
      <RaiseComplaintModal
        isOpen={isRaiseModalOpen}
        onClose={() => setIsRaiseModalOpen(false)}
        onComplaintCreated={() => fetchComplaints()}
      />

      <ComplaintDetailModal
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
      />
    </div>
  );
}
