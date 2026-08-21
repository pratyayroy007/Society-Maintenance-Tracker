import { prisma } from './prisma';

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailPayload): Promise<{ success: boolean; id?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const isMock = !apiKey || apiKey === 'mock_key_for_dev' || apiKey.startsWith('mock_');

  if (isMock) {
    console.log(`\n📧 [MOCK EMAIL SERVICE]`);
    console.log(`To: ${Array.isArray(to) ? to.join(', ') : to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body Preview: ${html.replace(/<[^>]*>/g, '').substring(0, 150)}...\n`);
    return { success: true, id: `mock_${Date.now()}` };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'SocietyCare <notifications@resend.dev>',
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.warn('Resend API Warning:', err);
      return { success: false };
    }

    const data = await res.json();
    return { success: true, id: data.id };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false };
  }
}

export async function notifyStatusChange(
  residentEmail: string,
  residentName: string,
  complaintTitle: string,
  newStatus: string,
  note?: string | null
) {
  const statusColors: Record<string, string> = {
    OPEN: '#d97706',
    IN_PROGRESS: '#2563eb',
    RESOLVED: '#059669',
  };

  const color = statusColors[newStatus] || '#4f46e5';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
      <div style="background-color: #4f46e5; padding: 15px; border-radius: 8px 8px 0 0; text-align: center; color: white;">
        <h2 style="margin: 0;">🏢 SocietyCare Maintenance Update</h2>
      </div>
      <div style="padding: 20px; background-color: #ffffff;">
        <p>Dear <strong>${residentName}</strong>,</p>
        <p>Your maintenance request status has been updated by the society administrator:</p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid ${color}; padding: 15px; margin: 15px 0; border-radius: 4px;">
          <p style="margin: 0 0 8px 0;"><strong>Complaint:</strong> ${complaintTitle}</p>
          <p style="margin: 0 0 8px 0;"><strong>New Status:</strong> <span style="color: ${color}; font-weight: bold;">${newStatus}</span></p>
          ${note ? `<p style="margin: 0;"><strong>Admin Remarks:</strong> <em>"${note}"</em></p>` : ''}
        </div>

        <p style="font-size: 13px; color: #64748b;">You can log in to your resident portal anytime to view the complete history timeline.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center;">SocietyCare Automated Notification System</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: residentEmail,
    subject: `[Status Update: ${newStatus}] ${complaintTitle}`,
    html,
  });
}

export async function notifyImportantNotice(noticeTitle: string, noticeContent: string) {
  try {
    const residents = await prisma.user.findMany({
      where: { role: 'RESIDENT' },
      select: { email: true },
    });

    if (residents.length === 0) return;

    const emails = residents.map((r) => r.email);

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fef3c7; background-color: #fffbeb; border-radius: 12px;">
        <div style="background-color: #d97706; padding: 15px; border-radius: 8px 8px 0 0; text-align: center; color: white;">
          <h2 style="margin: 0;">⚠️ IMPORTANT SOCIETY ANNOUNCEMENT</h2>
        </div>
        <div style="padding: 20px; background-color: #ffffff; border-radius: 0 0 8px 8px;">
          <h3 style="color: #1e293b; margin-top: 0;">${noticeTitle}</h3>
          <p style="color: #334155; line-height: 1.6; white-space: pre-wrap;">${noticeContent}</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">Society Management Committee</p>
        </div>
      </div>
    `;

    return sendEmail({
      to: emails,
      subject: `⚠️ [IMPORTANT NOTICE] ${noticeTitle}`,
      html,
    });
  } catch (err) {
    console.error('Failed to broadcast notice email:', err);
  }
}
