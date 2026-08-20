import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { getOverdueThresholdDays, isComplaintOverdue } from '@/lib/overdue';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        resident: {
          select: {
            id: true,
            name: true,
            email: true,
            flatNumber: true,
            phoneNumber: true,
          },
        },
        history: {
          orderBy: { createdAt: 'asc' },
          include: {
            changedBy: {
              select: { id: true, name: true, role: true },
            },
          },
        },
      },
    });

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    // Check authorization: Resident can only view their own complaint
    if (session.role !== 'ADMIN' && complaint.residentId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const thresholdDays = await getOverdueThresholdDays();
    const isOverdue = isComplaintOverdue(complaint.createdAt, complaint.status, thresholdDays);

    return NextResponse.json({
      complaint: {
        ...complaint,
        isOverdue,
      },
    });
  } catch (error) {
    console.error('Fetch single complaint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
