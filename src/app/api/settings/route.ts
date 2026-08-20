import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { updateSettingSchema } from '@/lib/validators';
import { getOverdueThresholdDays } from '@/lib/overdue';

export async function GET() {
  const thresholdDays = await getOverdueThresholdDays();
  const allSettings = await prisma.systemSetting.findMany();
  return NextResponse.json({
    overdueDaysThreshold: thresholdDays,
    settings: allSettings,
  });
}

export async function PATCH(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only administrators can modify settings' }, { status: 403 });
    }

    const body = await request.json();
    const result = updateSettingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.flatten() }, { status: 400 });
    }

    const { key, value } = result.data;

    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value, description: 'System Configuration' },
    });

    return NextResponse.json({ message: 'Setting updated successfully', setting });
  } catch (error) {
    console.error('Update setting error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
