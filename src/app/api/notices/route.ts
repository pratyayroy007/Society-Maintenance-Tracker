import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { createNoticeSchema } from '@/lib/validators';

export async function GET() {
  try {
    const notices = await prisma.notice.findMany({
      include: {
        createdBy: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: [
        { isImportant: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ notices });
  } catch (error) {
    console.error('Fetch notices error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only administrators can post notices' }, { status: 403 });
    }

    const body = await request.json();
    const result = createNoticeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, content, isImportant } = result.data;

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        isImportant: Boolean(isImportant),
        createdById: session.id,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    return NextResponse.json(
      { message: 'Notice posted successfully', notice },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create notice error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
