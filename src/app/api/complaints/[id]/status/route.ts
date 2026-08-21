import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { updateStatusSchema } from '@/lib/validators';
import { notifyStatusChange } from '@/lib/email';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only administrators can update complaint status' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const result = updateStatusSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { status: newStatus, note } = result.data;

    const existingComplaint = await prisma.complaint.findUnique({
      where: { id },
      include: { resident: true },
    });

    if (!existingComplaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    if (existingComplaint.status === newStatus) {
      return NextResponse.json(
        { error: `Complaint is already in status '${newStatus}'` },
        { status: 400 }
      );
    }

    const previousStatus = existingComplaint.status;
    const isResolving = newStatus === 'RESOLVED';

    const updatedComplaint = await prisma.$transaction(async (tx) => {
      const updated = await tx.complaint.update({
        where: { id },
        data: {
          status: newStatus,
          resolvedAt: isResolving ? new Date() : (newStatus === 'OPEN' ? null : existingComplaint.resolvedAt),
        },
      });

      await tx.complaintStatusHistory.create({
        data: {
          complaintId: id,
          previousStatus,
          newStatus,
          changedById: session.id,
          note: note || (isResolving ? 'Complaint resolved by admin.' : `Status updated to ${newStatus}`),
        },
      });

      return updated;
    });

    // Send email notification to resident in background
    if (existingComplaint.resident?.email) {
      notifyStatusChange(
        existingComplaint.resident.email,
        existingComplaint.resident.name,
        existingComplaint.title,
        newStatus,
        note
      ).catch((err) => console.error('Status change email error:', err));
    }

    const fullComplaint = await prisma.complaint.findUnique({
      where: { id: updatedComplaint.id },
      include: {
        resident: {
          select: { id: true, name: true, email: true, flatNumber: true },
        },
        history: {
          orderBy: { createdAt: 'asc' },
          include: {
            changedBy: { select: { id: true, name: true, role: true } },
          },
        },
      },
    });

    return NextResponse.json({
      message: `Complaint status updated to ${newStatus}`,
      complaint: fullComplaint,
    });
  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
