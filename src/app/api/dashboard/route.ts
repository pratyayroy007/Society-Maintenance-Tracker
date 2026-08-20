import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { getOverdueThresholdDays, isComplaintOverdue } from '@/lib/overdue';

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const thresholdDays = await getOverdueThresholdDays();
    const allComplaints = await prisma.complaint.findMany({
      include: {
        resident: { select: { name: true, flatNumber: true } },
      },
    });

    const statusCounts: Record<string, number> = {
      OPEN: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
    };

    const categoryCounts: Record<string, number> = {};
    let overdueCount = 0;

    for (const c of allComplaints) {
      // Status count
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;

      // Category count
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;

      // Overdue count
      if (isComplaintOverdue(c.createdAt, c.status, thresholdDays)) {
        overdueCount++;
      }
    }

    const recentComplaints = await prisma.complaint.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        resident: { select: { name: true, flatNumber: true } },
      },
    });

    const totalComplaints = allComplaints.length;

    return NextResponse.json({
      metrics: {
        total: totalComplaints,
        byStatus: statusCounts,
        byCategory: categoryCounts,
        overdueCount,
        overdueThresholdDays: thresholdDays,
      },
      recentComplaints,
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
