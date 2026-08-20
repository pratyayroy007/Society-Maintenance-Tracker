import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { updatePrioritySchema } from '@/lib/validators';

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
      return NextResponse.json({ error: 'Only administrators can update priority' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const result = updatePrioritySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { priority } = result.data;

    const existing = await prisma.complaint.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const updated = await prisma.complaint.update({
      where: { id },
      data: { priority },
    });

    return NextResponse.json({
      message: `Priority updated to ${priority}`,
      complaint: updated,
    });
  } catch (error) {
    console.error('Update priority error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
