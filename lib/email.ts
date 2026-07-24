import nodemailer from 'nodemailer'

function cleanFrom(value: string | undefined): string {
  if (!value) return '"GameZone Arena" <noreply@gamezone.gg>'
  return value.replace(/^"+|"+$/g, '').trim()
}

function createTransport() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log(`[EMAIL] Using SMTP ${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 587}`)
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  console.log('[EMAIL] No SMTP configured, OTPs will be logged to console')
  return null
}

const transporter = createTransport()
const fromAddress = cleanFrom(process.env.SMTP_FROM)

export async function sendOtpEmail(email: string, otp: string): Promise<void> {
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to: email,
        subject: 'Your GameZone Arena Verification Code',
        html: `
          <div style="background:#0B0E14;padding:40px 20px;font-family:Arial,sans-serif;">
            <div style="max-width:480px;margin:0 auto;background:#131824;border:1px solid #262D3D;border-radius:16px;padding:40px;">
              <h1 style="color:#F5F6FA;font-size:24px;margin:0 0 8px;">Verify your email</h1>
              <p style="color:#9BA3B7;font-size:14px;margin:0 0 24px;">Use this code to complete your registration at GameZone Arena.</p>
              <div style="background:#1B2130;border-radius:12px;padding:24px;text-align:center;">
                <span style="font-size:36px;font-weight:700;color:#7C5CFF;letter-spacing:8px;">${otp}</span>
              </div>
              <p style="color:#9BA3B7;font-size:12px;margin-top:24px;">This code expires in 5 minutes. If you didn't request this, ignore this email.</p>
            </div>
          </div>
        `,
      })
      console.log(`[EMAIL] OTP sent successfully to ${email} (id: ${info.messageId})`)
      return
    } catch (error) {
      console.error(`[EMAIL] Failed to send via SMTP:`, error)
    }
  }

  console.log(`[EMAIL] ===== OTP for ${email}: ${otp} =====`)
}
