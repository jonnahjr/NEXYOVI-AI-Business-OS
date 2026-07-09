import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const host = process.env.SMTP_HOST || 'smtp.resend.com';
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER || '';
    const pass = process.env.SMTP_PASS || '';

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    } else {
      // Fallback: use a JSON transporter that logs instead of sending
      this.transporter = nodemailer.createTransport({ jsonTransport: true });
    }
  }

  /**
   * Send an invoice email with an HTML invoice body.
   */
  async sendInvoiceEmail(options: {
    to: string;
    from?: string;
    invoiceNo: string;
    customer: string;
    issueDate: string;
    dueDate: string;
    total: number;
    status: string;
    items: { description: string; quantity: number; unitPrice: number; total: number }[];
    notes?: string;
    pdfBase64?: string;
  }): Promise<any> {
    const fromName = process.env.SMTP_FROM_NAME || 'Nexyovi Billing';
    const fromEmail = process.env.SMTP_FROM_EMAIL || options.from || 'billing@nexyovi.com';
    const from = `"${fromName}" <${fromEmail}>`;

    const itemsHtml = options.items
      .map(
        (item) =>
          `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;">${item.description}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;text-align:center;">${item.quantity}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;text-align:right;">ETB ${Number(item.unitPrice).toLocaleString()}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;text-align:right;font-weight:600;">ETB ${Number(item.total).toLocaleString()}</td>
          </tr>`
      )
      .join('');

    const statusColor =
      options.status === 'PAID' ? '#10b981' :
      options.status === 'OVERDUE' ? '#ef4444' :
      options.status === 'SENT' ? '#3b82f6' :
      options.status === 'DRAFT' ? '#94a3b8' : '#6b7280';

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:#f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="font-size:28px;font-weight:900;color:#0f172a;margin:0;letter-spacing:-0.5px;">INVOICE</h1>
                    <p style="font-size:14px;color:#475569;margin:4px 0 0 0;font-weight:600;">${options.invoiceNo}</p>
                  </td>
                  <td align="right">
                    <span style="display:inline-block;padding:4px 14px;border-radius:999px;font-size:12px;font-weight:700;background:${statusColor}15;color:${statusColor};border:1px solid ${statusColor}30;">
                      ${options.status}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Details -->
          <tr>
            <td style="padding:24px 40px 0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px 0;">Bill To</p>
                    <p style="font-size:15px;font-weight:600;color:#0f172a;margin:0;">${options.customer}</p>
                    <p style="font-size:13px;color:#64748b;margin:2px 0 0 0;">${options.to}</p>
                  </td>
                  <td align="right">
                    <p style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px 0;">Details</p>
                    <p style="font-size:13px;color:#475569;margin:0;">Issue: ${options.issueDate}</p>
                    <p style="font-size:13px;color:#475569;margin:2px 0 0 0;">Due: ${options.dueDate || '—'}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding:24px 40px 0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <thead>
                  <tr style="background:#f1f5f9;">
                    <th style="padding:10px 12px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;text-align:left;">Description</th>
                    <th style="padding:10px 12px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;text-align:center;">Qty</th>
                    <th style="padding:10px 12px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;text-align:right;">Unit Price</th>
                    <th style="padding:10px 12px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;text-align:right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Total -->
          <tr>
            <td style="padding:16px 40px 0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top:2px solid #0f172a;padding-top:12px;">
                    <p style="font-size:18px;font-weight:900;color:#0f172a;margin:0;text-align:right;">
                      Total: ETB ${Number(options.total).toLocaleString()}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Notes -->
          ${options.notes ? `
          <tr>
            <td style="padding:24px 40px 0 40px;">
              <div style="background:#f8fafc;border-radius:8px;padding:16px;">
                <p style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px 0;">Notes</p>
                <p style="font-size:13px;color:#475569;margin:0;">${options.notes}</p>
              </div>
            </td>
          </tr>` : ''}

          <!-- Footer -->
          <tr>
            <td style="padding:32px 40px;text-align:center;">
              <p style="font-size:11px;color:#94a3b8;margin:0;">Thank you for your business!</p>
              <p style="font-size:11px;color:#94a3b8;margin:4px 0 0 0;">Nexyovi Enterprise · billing@nexyovi.com</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const mailOptions: nodemailer.SendMailOptions = {
      from,
      to: options.to,
      subject: `Invoice ${options.invoiceNo} from Nexyovi Billing`,
      html,
      attachments: options.pdfBase64
        ? [{ filename: `${options.invoiceNo}.pdf`, content: options.pdfBase64, encoding: 'base64' }]
        : [],
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent for ${options.invoiceNo} to ${options.to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error(`❌ Failed to send email for ${options.invoiceNo}:`, error.message);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}
