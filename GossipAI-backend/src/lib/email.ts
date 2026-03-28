import PDFDocument from "pdfkit";
import { Resend } from "resend";
import { env } from "../config/env";
import { AppError } from "../shared/errors/app-error";

const resend = new Resend(env.RESEND_API_KEY);

// ─── Shared helpers ────────────────────────────────────────────────────────────

const BRAND_PURPLE = "#7F19E6";
const BRAND_LIGHT  = "#C792FF";

const emailWrapper = (content: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
    table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}
    img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none}
    body{margin:0;padding:0;background:#09060F}
  </style>
</head>
<body style="margin:0;padding:0;background:#09060F;font-family:'Inter',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:40px 16px 48px;">
        <table role="presentation" width="100%" style="max-width:540px;" cellpadding="0" cellspacing="0" border="0">

          <!-- Logo / Brand header -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#3D0A7A,#7F19E6);border-radius:16px;padding:10px 22px;">
                    <span style="color:#FFFFFF;font-size:20px;font-weight:800;letter-spacing:-0.5px;">Gossip<span style="color:#E0C3FF;">AI</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#110D1B;border:1px solid rgba(127,25,230,0.22);border-radius:20px;overflow:hidden;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0;color:#4A3E5C;font-size:12px;line-height:1.6;">
                You're receiving this because you have a GossipAI account.<br/>
                If you believe this was sent in error, please ignore it.
              </p>
              <p style="margin:10px 0 0;color:#3A2F4A;font-size:11px;">© ${new Date().getFullYear()} GossipAI · All rights reserved</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// ─── Password reset ─────────────────────────────────────────────────────────── 

const buildPasswordResetHtml = (code: string) => emailWrapper(`
  <!-- Top accent bar -->
  <tr><td style="height:4px;background:linear-gradient(90deg,#7F19E6,#C792FF,#7F19E6);"></td></tr>

  <tr>
    <td style="padding:36px 36px 28px;">

      <!-- Icon -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:22px;">
        <tr>
          <td style="background:rgba(127,25,230,0.15);border:1px solid rgba(127,25,230,0.3);border-radius:14px;width:52px;height:52px;text-align:center;vertical-align:middle;">
            <span style="font-size:26px;line-height:1;">🔐</span>
          </td>
        </tr>
      </table>

      <h1 style="margin:0 0 8px;color:#F4EEF9;font-size:24px;font-weight:800;letter-spacing:-0.4px;">Reset your password</h1>
      <p style="margin:0 0 24px;color:#9B8DAE;font-size:15px;line-height:1.6;">
        We received a request to reset the password for your GossipAI account. Enter the verification code below in the app.
      </p>

      <!-- Code box -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
        <tr>
          <td align="center" style="background:#0D0917;border:1.5px solid rgba(127,25,230,0.45);border-radius:16px;padding:24px 16px;">
            <p style="margin:0 0 6px;color:#7A6B8E;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Verification Code</p>
            <span style="font-size:48px;font-weight:900;letter-spacing:16px;color:${BRAND_LIGHT};font-family:'Courier New',Courier,monospace;">${code}</span>
          </td>
        </tr>
      </table>

      <!-- Expiry notice -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
        <tr>
          <td style="background:rgba(248,192,69,0.08);border:1px solid rgba(248,192,69,0.2);border-radius:10px;padding:12px 16px;">
            <p style="margin:0;color:#F8C045;font-size:13px;font-weight:600;">⏱ This code expires in <strong>15 minutes</strong></p>
          </td>
        </tr>
      </table>

      <p style="margin:0;color:#6B5C7A;font-size:13px;line-height:1.6;">
        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>
    </td>
  </tr>

  <!-- Bottom separator -->
  <tr>
    <td style="height:1px;background:rgba(255,255,255,0.05);"></td>
  </tr>
  <tr>
    <td style="padding:16px 36px;background:#0D0917;">
      <p style="margin:0;color:#4A3E5C;font-size:12px;">Sent to your registered email · Do not share this code with anyone</p>
    </td>
  </tr>
`);

// ─── Summary email ──────────────────────────────────────────────────────────── 

const formatEmailDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) +
    " at " +
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

const buildSummaryHtml = (userName: string, title: string, text: string, createdAt: string) =>
  emailWrapper(`
  <!-- Top accent bar -->
  <tr><td style="height:4px;background:linear-gradient(90deg,#7F19E6,#C792FF,#7F19E6);"></td></tr>

  <tr>
    <td style="padding:36px 36px 28px;">

      <!-- Badge + greeting -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
        <tr>
          <td style="background:rgba(127,25,230,0.12);border:1px solid rgba(127,25,230,0.28);border-radius:999px;padding:4px 14px;">
            <span style="color:${BRAND_LIGHT};font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;">✦ AI Summary</span>
          </td>
        </tr>
      </table>

      <h1 style="margin:0 0 6px;color:#F4EEF9;font-size:22px;font-weight:800;letter-spacing:-0.4px;">${title.replace(/</g, "&lt;")}</h1>
      <p style="margin:0 0 24px;color:#7A6B8E;font-size:13px;">Hey ${userName.replace(/</g, "&lt;")} · Generated ${formatEmailDate(createdAt)}</p>

      <!-- Summary card -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
        <tr>
          <td style="background:#0D0917;border:1px solid rgba(127,25,230,0.18);border-radius:14px;padding:20px 22px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
              <tr>
                <td style="background:rgba(127,25,230,0.15);border-radius:10px;width:36px;height:36px;text-align:center;vertical-align:middle;">
                  <span style="font-size:18px;">✨</span>
                </td>
                <td style="padding-left:12px;vertical-align:middle;">
                  <p style="margin:0;color:#FFFFFF;font-size:14px;font-weight:700;">AI Analysis</p>
                  <p style="margin:2px 0 0;color:#6B5A82;font-size:11px;">Generated by GossipAI · SUMMARIZE</p>
                </td>
              </tr>
            </table>
            <p style="margin:0;color:#CBC0DA;font-size:15px;line-height:1.75;white-space:pre-wrap;">${text.replace(/</g, "&lt;").replace(/\n/g, "<br/>")}</p>
          </td>
        </tr>
      </table>

      <!-- CTA note -->
      <p style="margin:0;color:#6B5C7A;font-size:13px;line-height:1.6;">
        A PDF copy of this summary is attached to this email for your records.<br/>
        Open GossipAI anytime to continue the conversation.
      </p>
    </td>
  </tr>

  <tr>
    <td style="height:1px;background:rgba(255,255,255,0.05);"></td>
  </tr>
  <tr>
    <td style="padding:16px 36px;background:#0D0917;">
      <p style="margin:0;color:#4A3E5C;font-size:12px;">This summary was requested by you from GossipAI · Do not share sensitive content</p>
    </td>
  </tr>
`);

const generateSummaryPdf = (title: string, text: string, createdAt: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 52, info: { Title: title, Author: "GossipAI" } });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header bar (approximated with a filled rect)
    doc.rect(0, 0, doc.page.width, 6).fill("#7F19E6");

    // Brand
    doc.y = 32;
    doc.fontSize(10).fillColor("#7F19E6").font("Helvetica-Bold").text("GossipAI", 52, 32);

    // Badge label
    doc.fontSize(9).fillColor("#A566F2").font("Helvetica-Bold").text("AI Summary · SUMMARIZE", 52, 48);

    // Title
    doc.moveDown(0.8);
    doc.fontSize(22).fillColor("#1A0A2E").font("Helvetica-Bold").text(title, { lineGap: 4 });

    // Date meta
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor("#7A6A8E").font("Helvetica").text(`Generated ${formatEmailDate(createdAt)}`);

    // Divider
    doc.moveDown(0.8);
    doc.moveTo(52, doc.y).lineTo(doc.page.width - 52, doc.y).lineWidth(0.5).strokeColor("#E5D9F7").stroke();

    // Section label
    doc.moveDown(0.6);
    doc.fontSize(10).fillColor("#7F19E6").font("Helvetica-Bold").text("AI ANALYSIS");

    // Summary text
    doc.moveDown(0.4);
    doc.fontSize(13).fillColor("#2A1A3E").font("Helvetica").text(text, { lineGap: 5, paragraphGap: 8 });

    // Footer bar
    const footerY = doc.page.height - 36;
    doc.rect(0, footerY, doc.page.width, 36).fill("#F7F2FF");
    doc.fontSize(9).fillColor("#9B8DB0").font("Helvetica")
      .text(`© ${new Date().getFullYear()} GossipAI · All rights reserved`, 52, footerY + 12, { align: "center" });

    doc.end();
  });
};

// ─── Exports ──────────────────────────────────────────────────────────────────

const handleResendError = (err: unknown, context: string): never => {
  if (err instanceof AppError) throw err;
  console.error(`[Resend] Unexpected error (${context}):`, err);
  throw new AppError(
    `Email service unavailable: ${err instanceof Error ? err.message : String(err)}`,
    502,
    undefined,
    "EMAIL_SEND_FAILED",
    true
  );
};

export const sendPasswordResetEmail = async (to: string, code: string): Promise<void> => {
  try {
    const { data, error } = await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to,
      subject: "Your GossipAI password reset code",
      html: buildPasswordResetHtml(code),
    });

    if (error) {
      console.error("[Resend] Password reset email failed:", JSON.stringify(error, null, 2));
      throw new AppError(`Email service error: ${error.message}`, 502, { resendError: error }, "EMAIL_SEND_FAILED", true);
    }

    console.log(`[Resend] Password reset email sent. id=${data?.id} to=${to}`);
  } catch (err) {
    handleResendError(err, "sendPasswordResetEmail");
  }
};

export const sendSummaryEmail = async (
  to: string,
  userName: string,
  title: string,
  text: string,
  createdAt: string
): Promise<void> => {
  try {
    const pdfBuffer = await generateSummaryPdf(title, text, createdAt);
    const pdfBase64 = pdfBuffer.toString("base64");

    const safeFileName = `gossipai_summary_${new Date(createdAt).getTime()}.pdf`;

    const { data, error } = await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to,
      subject: `Your GossipAI Summary: ${title}`,
      html: buildSummaryHtml(userName, title, text, createdAt),
      attachments: [
        {
          filename: safeFileName,
          content: pdfBase64,
        },
      ],
    });

    if (error) {
      console.error("[Resend] Summary email failed:", JSON.stringify(error, null, 2));
      throw new AppError(`Email service error: ${error.message}`, 502, { resendError: error }, "EMAIL_SEND_FAILED", true);
    }

    console.log(`[Resend] Summary email sent. id=${data?.id} to=${to}`);
  } catch (err) {
    handleResendError(err, "sendSummaryEmail");
  }
};
