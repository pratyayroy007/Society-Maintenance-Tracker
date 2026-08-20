import { prisma } from './prisma';

export async function getOverdueThresholdDays(): Promise<number> {
  const setting = await prisma.systemSetting.findUnique({
    where: { key: 'OVERDUE_DAYS_THRESHOLD' },
  });
  if (setting && !isNaN(Number(setting.value))) {
    return Number(setting.value);
  }
  return Number(process.env.DEFAULT_OVERDUE_DAYS || '3');
}

export function isComplaintOverdue(
  createdAt: Date,
  status: string,
  thresholdDays: number
): boolean {
  if (status === 'RESOLVED') return false;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - new Date(createdAt).getTime());
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays > thresholdDays;
}
