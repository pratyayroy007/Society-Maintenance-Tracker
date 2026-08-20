import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { createComplaintSchema } from '@/lib/validators';
import { getOverdueThresholdDays, isComplaintOverdue } from '@/lib/overdue';

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const isOverdueParam = searchParams.get('isOverdue');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const thresholdDays = await getOverdueThresholdDays();

    // Query builder
    const whereClause: any = {};

    // Residents only see their own complaints
    if (session.role !== 'ADMIN') {
      whereClause.residentId = session.id;
    }

    if (category && category !== 'ALL') {
      whereClause.category = category;
    }

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (priority && priority !== 'ALL') {
      whereClause.priority = priority;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    const complaints = await prisma.complaint.findMany({
      where: whereClause,
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
      orderBy: { createdAt: 'desc' },
    });

    // Annotate with isOverdue
    const complaintsWithOverdue = complaints.map((c) => {
      const overdue = isComplaintOverdue(c.createdAt, c.status, thresholdDays);
      return {
        ...c,
        isOverdue: overdue,
      };
    });

    // If filtering by overdue specifically
    let result = complaintsWithOverdue;
    if (isOverdueParam === 'true') {
      result = complaintsWithOverdue.filter((c) => c.isOverdue);
    } else if (isOverdueParam === 'false') {
      result = complaintsWithOverdue.filter((c) => !c.isOverdue);
    }

    // Overdue complaints surface at the top for admins if no custom sort
    if (session.role === 'ADMIN') {
      result.sort((a, b) => {
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    return NextResponse.json({
      complaints: result,
      total: result.length,
      thresholdDays,
    });
  } catch (error) {
    console.error('Fetch complaints error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = createComplaintSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, description, category, photoUrl, priority } = result.data;

    // Use transaction to create complaint and record initial status history
    const createdComplaint = await prisma.$transaction(async (tx) => {
      const complaint = await tx.complaint.create({
        data: {
          title,
          description,
          category,
          status: 'OPEN',
          priority: priority || 'MEDIUM',
          photoUrl: photoUrl || null,
          residentId: session.id,
        },
      });

      await tx.complaintStatusHistory.create({
        data: {
          complaintId: complaint.id,
          previousStatus: null,
          newStatus: 'OPEN',
          changedById: session.id,
          note: 'Complaint raised by resident.',
        },
      });

      return complaint;
    });

    const fullComplaint = await prisma.complaint.findUnique({
      where: { id: createdComplaint.id },
      include: {
        resident: {
          select: { id: true, name: true, email: true, flatNumber: true },
        },
        history: {
          include: {
            changedBy: { select: { id: true, name: true, role: true } },
          },
        },
      },
    });

    return NextResponse.json(
      { message: 'Complaint raised successfully', complaint: fullComplaint },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create complaint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
