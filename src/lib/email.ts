import nodemailer from 'nodemailer';
import { prisma } from './prisma';

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
}

// Create reusable transporter
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 587;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  return null;
}

export async function sendEmail({ to, subject, html }: EmailPayload): Promise<{ success: boolean; id?: string }> {
  const recipients = Array.isArray(to) ? to.join(', ') : to;

  // 1. Check for SMTP Transporter (e.g. Gmail / Brevo / SendGrid / Custom SMTP)
  const transporter = getTransporter();
  if (transporter) {
    try {
      const from = process.env.SMTP_FROM || `"SocietyCare" <${process.env.SMTP_USER}>`;
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      console.log(`✅ [REAL EMAIL SENT via SMTP] MessageId: ${info.messageId} to ${recipients}`);
      return { success: true, id: info.messageId };
    } catch (err) {
      console.error('❌ SMTP Email sending failed:', err);
    }
  }

  // 2. Check for Resend API Key
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && resendKey !== 'mock_key_for_dev' && !resendKey.startsWith('mock_')) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: 'SocietyCare <onboarding@resend.dev>',
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`✅ [REAL EMAIL SENT via Resend] Id: ${data.id} to ${recipients}`);
        return { success: true, id: data.id };
      } else {
        const err = await res.json();
        console.warn('Resend API Warning:', err);
      }
    } catch (err) {
      console.error('❌ Resend email dispatch failed:', err);
    }
  }

  // 3. Fallback: Log email clearly to console in dev mode
  console.log(`\n📬 [EMAIL DISPATCH LOG — Configure SMTP_USER/SMTP_PASS in .env to deliver to real inboxes]`);
  console.log(`To: ${recipients}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body Preview: ${html.replace(/<[^>]*>/g, ' ').substring(0, 180)}...\n`);

  return { success: true, id: `mock_${Date.now()}` };
}

// 1. Trigger when a resident raises a new complaint
export async function notifyComplaintRaised(
  residentEmail: string,
  residentName: string,
  complaintTitle: string,
  category: string,
  description: string,
  complaintId: string,
  priority: string = 'MEDIUM'
) {
  const ticketRef = complaintId.substring(complaintId.length - 6).toUpperCase();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 20px; border-radius: 8px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 22px;">🏢 SocietyCare Maintenance</h2>
        <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 13px;">Complaint Confirmation #${ticketRef}</p>
      </div>

      <div style="padding: 24px 8px 16px 8px; color: #1e293b;">
        <p style="font-size: 15px;">Dear <strong>${residentName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
          Your maintenance complaint has been successfully registered in the society portal. Our maintenance administration team has been notified and will review your ticket.
        </p>

        <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 16px; margin: 20px 0; border-radius: 6px;">
          <table style="width: 100%; font-size: 13px; color: #334155;">
            <tr>
              <td style="padding: 4px 0; font-weight: bold; width: 120px;">Ticket ID:</td>
              <td style="padding: 4px 0;">#${ticketRef}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold;">Subject:</td>
              <td style="padding: 4px 0;">${complaintTitle}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold;">Category:</td>
              <td style="padding: 4px 0;"><span style="background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 4px; font-weight: 600;">${category}</span></td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold;">Initial Status:</td>
              <td style="padding: 4px 0;"><span style="color: #d97706; font-weight: bold;">OPEN (Pending Triage)</span></td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold;">Priority:</td>
              <td style="padding: 4px 0;">${priority}</td>
            </tr>
          </table>

          <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed #cbd5e1;">
            <strong style="font-size: 12px; color: #64748b;">Description:</strong>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #334155; line-height: 1.5;">${description}</p>
          </div>
        </div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
          You will receive automatic email updates whenever a technician is assigned or the status changes. You can also view the full timeline history in your resident dashboard.
        </p>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
          SocietyCare Apartment Maintenance & Complaint Management System
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: residentEmail,
    subject: `[Ticket #${ticketRef} Registered] ${complaintTitle}`,
    html,
  });
}

// 2. Trigger when complaint status changes
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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="background-color: #4f46e5; padding: 18px; border-radius: 8px; text-align: center; color: white;">
        <h2 style="margin: 0; font-size: 20px;">🏢 SocietyCare Status Update</h2>
      </div>
      <div style="padding: 20px 8px 8px 8px; color: #1e293b;">
        <p style="font-size: 15px;">Dear <strong>${residentName}</strong>,</p>
        <p style="font-size: 14px; color: #475569;">
          Your maintenance request status has been updated by the society administrator:
        </p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid ${color}; padding: 16px; margin: 18px 0; border-radius: 6px;">
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Complaint:</strong> ${complaintTitle}</p>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>New Status:</strong> <span style="color: ${color}; font-weight: bold;">${newStatus}</span></p>
          ${note ? `<p style="margin: 0; font-size: 13px; color: #334155;"><strong>Admin Remarks:</strong> <em style="color: #475569;">"${note}"</em></p>` : ''}
        </div>

        <p style="font-size: 13px; color: #64748b;">You can log in to your resident portal anytime to track progress.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0 12px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">SocietyCare Automated Notification System</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: residentEmail,
    subject: `[Status Update: ${newStatus}] ${complaintTitle}`,
    html,
  });
}

// 3. Trigger on important pinned notices
export async function notifyImportantNotice(noticeTitle: string, noticeContent: string) {
  try {
    const residents = await prisma.user.findMany({
      where: { role: 'RESIDENT' },
      select: { email: true },
    });

    if (residents.length === 0) return;
    const emails = residents.map((r) => r.email);

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #fef3c7; background-color: #ffffff; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%); padding: 18px; border-radius: 8px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 20px;">⚠️ IMPORTANT SOCIETY ANNOUNCEMENT</h2>
        </div>
        <div style="padding: 20px 8px 8px 8px; color: #1e293b;">
          <h3 style="color: #0f172a; margin-top: 0; font-size: 17px;">${noticeTitle}</h3>
          <p style="color: #334155; line-height: 1.6; font-size: 14px; white-space: pre-wrap;">${noticeContent}</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0 12px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">Society Management Committee</p>
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
