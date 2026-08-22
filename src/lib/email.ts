import nodemailer from 'nodemailer';
import { prisma } from './prisma';

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
}

let cachedTransporter: any = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, '');
  const port = Number(process.env.SMTP_PORT) || 587;

  if (host && user && pass) {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 4000,
      greetingTimeout: 4000,
      socketTimeout: 4000,
      tls: {
        rejectUnauthorized: false,
      },
    });
    return cachedTransporter;
  }

  return null;
}

export async function sendEmail({ to, subject, html }: EmailPayload): Promise<{ success: boolean; id?: string }> {
  const recipientList = Array.isArray(to) ? to : [to];
  const recipientsString = recipientList.join(', ');

  let sentSuccessfully = false;
  let messageId = `msg_${Date.now()}`;

  // 1. Try SMTP Transporter (e.g. Gmail / Brevo / Custom SMTP)
  const transporter = getTransporter();
  if (transporter) {
    try {
      const from = process.env.SMTP_FROM || `"Residenza" <${process.env.SMTP_USER}>`;
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      console.log(`✅ [REAL EMAIL SENT via SMTP] MessageId: ${info.messageId} to ${recipientsString}`);
      sentSuccessfully = true;
      messageId = info.messageId;
    } catch (err) {
      console.error('❌ SMTP Email delivery failed:', err);
    }
  }

  // 2. Try Resend API
  if (!sentSuccessfully) {
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
            from: 'Residenza <onboarding@resend.dev>',
            to: recipientList,
            subject,
            html,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          console.log(`✅ [REAL EMAIL SENT via Resend] Id: ${data.id} to ${recipientsString}`);
          sentSuccessfully = true;
          messageId = data.id;
        }
      } catch (err) {
        console.error('❌ Resend API dispatch failed:', err);
      }
    }
  }

  // Persist in DB for the In-App Notification Center
  try {
    for (const recipient of recipientList) {
      await prisma.emailLog.create({
        data: {
          to: recipient.trim().toLowerCase(),
          subject,
          html,
          status: sentSuccessfully ? 'DELIVERED' : 'SENT',
        },
      });
    }
  } catch (dbErr) {
    console.error('Failed to log email to DB:', dbErr);
  }

  return { success: true, id: messageId };
}

// Trigger: Resident raises a complaint
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
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 22px; border-radius: 8px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 22px; letter-spacing: -0.5px;">🏢 Residenza Maintenance</h2>
        <p style="margin: 6px 0 0 0; opacity: 0.95; font-size: 13px; font-weight: 500;">Ticket Confirmation #${ticketRef}</p>
      </div>

      <div style="padding: 24px 8px 16px 8px; color: #1e293b;">
        <p style="font-size: 15px; margin-top: 0;">Dear <strong>${residentName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
          Your maintenance complaint has been registered in the Residenza portal. Our administration team has been notified.
        </p>

        <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 18px; margin: 20px 0; border-radius: 6px;">
          <table style="width: 100%; font-size: 13px; color: #334155; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; width: 130px; color: #64748b;">Ticket Reference:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">#${ticketRef}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Subject:</td>
              <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${complaintTitle}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Category:</td>
              <td style="padding: 6px 0;"><span style="background: #e0e7ff; color: #3730a3; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 11px;">${category}</span></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Status:</td>
              <td style="padding: 6px 0;"><span style="color: #d97706; font-weight: bold;">OPEN (Pending Triage)</span></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Priority:</td>
              <td style="padding: 6px 0; font-weight: bold;">${priority}</td>
            </tr>
          </table>

          <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #cbd5e1;">
            <strong style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Description:</strong>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #334155; line-height: 1.5;">${description}</p>
          </div>
        </div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
          You can track this complaint in your resident portal at any time to see real-time updates and technician assignments.
        </p>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
          Residenza Apartment Maintenance & Complaint Management System
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

// Trigger: Status changes
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
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="background-color: #4f46e5; padding: 20px; border-radius: 8px; text-align: center; color: white;">
        <h2 style="margin: 0; font-size: 20px;">🏢 Residenza Status Update</h2>
      </div>
      <div style="padding: 20px 8px 8px 8px; color: #1e293b;">
        <p style="font-size: 15px;">Dear <strong>${residentName}</strong>,</p>
        <p style="font-size: 14px; color: #475569;">
          Your maintenance request status has been updated:
        </p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid ${color}; padding: 16px; margin: 18px 0; border-radius: 6px;">
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Complaint:</strong> ${complaintTitle}</p>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>New Status:</strong> <span style="color: ${color}; font-weight: bold;">${newStatus}</span></p>
          ${note ? `<p style="margin: 0; font-size: 13px; color: #334155;"><strong>Admin Remarks:</strong> <em style="color: #475569;">"${note}"</em></p>` : ''}
        </div>

        <p style="font-size: 13px; color: #64748b;">Log in to your portal to track progress.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0 12px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">Residenza Automated Notification System</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: residentEmail,
    subject: `[Status Update: ${newStatus}] ${complaintTitle}`,
    html,
  });
}

// Trigger: Important notices
export async function notifyImportantNotice(noticeTitle: string, noticeContent: string) {
  try {
    const residents = await prisma.user.findMany({
      where: { role: 'RESIDENT' },
      select: { email: true },
    });

    if (residents.length === 0) return;
    const emails = residents.map((r) => r.email);

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #fef3c7; background-color: #ffffff; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%); padding: 18px; border-radius: 8px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 20px;">⚠️ IMPORTANT SOCIETY ANNOUNCEMENT</h2>
        </div>
        <div style="padding: 20px 8px 8px 8px; color: #1e293b;">
          <h3 style="color: #0f172a; margin-top: 0; font-size: 17px;">${noticeTitle}</h3>
          <p style="color: #334155; line-height: 1.6; font-size: 14px; white-space: pre-wrap;">${noticeContent}</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0 12px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">Residenza Management Committee</p>
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
