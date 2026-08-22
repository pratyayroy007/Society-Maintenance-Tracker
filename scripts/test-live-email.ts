import nodemailer from 'nodemailer';

async function testGmail() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const user = process.env.SMTP_USER || 'societymaintainence@gmail.com';
  const pass = (process.env.SMTP_PASS || 'abarbtbhswyqwgja').replace(/\s+/g, '');
  const port = Number(process.env.SMTP_PORT) || 587;
  const from = process.env.SMTP_FROM || `Residenza <${user}>`;

  console.log('Testing SMTP connection with Google Servers...');
  console.log({ host, port, user, from });

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    await transporter.verify();
    console.log('✅ SMTP Connection verified successfully with Google Servers!');

    const info = await transporter.sendMail({
      from,
      to: 'pratyaykatwa@gmail.com',
      subject: '🏢 Residenza Maintenance Portal — Live Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px;">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 20px; border-radius: 8px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0;">🏢 Residenza Maintenance Portal</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Live Email Verification</p>
          </div>
          <div style="padding: 20px 0; color: #1e293b;">
            <p>Dear <strong>Pratyay</strong>,</p>
            <p>Your official Society email (<strong>${user}</strong>) is now <strong>fully operational</strong> and configured to send live emails to resident inboxes!</p>
            <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 12px; border-radius: 6px; margin: 15px 0;">
              <p style="margin: 0; color: #065f46; font-weight: bold;">✅ Live Delivery Test: Passed</p>
            </div>
            <p style="color: #64748b; font-size: 13px;">Whenever you or any resident raises a complaint or an admin updates a status, this system will automatically email them directly.</p>
          </div>
        </div>
      `,
    });

    console.log('🎉 Live Test Email Sent Successfully to pratyaykatwa@gmail.com!');
    console.log('Message ID:', info.messageId);
  } catch (err) {
    console.error('❌ Connection or send failed:', err);
  }
}

testGmail();
