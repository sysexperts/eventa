import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const apiKey = process.env.SENDGRID_API_KEY;
    
    if (!apiKey) {
      console.warn("⚠️  SENDGRID_API_KEY not configured. Email functionality disabled.");
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: "smtp.sendgrid.net",
        port: 587,
        secure: false, // TLS
        auth: {
          user: "apikey",
          pass: apiKey,
        },
      });

      this.isConfigured = true;
      console.log("✅ Email service configured with SendGrid");
    } catch (error) {
      console.error("❌ Failed to configure email service:", error);
    }
  }

  async sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.warn(`📧 Email not sent (service not configured): ${subject} to ${to}`);
      return false;
    }

    try {
      const fromEmail = process.env.SENDGRID_FROM_EMAIL || "noreply@omekan.com";
      const fromName = process.env.SENDGRID_FROM_NAME || "Omekan Events";

      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
      });

      console.log(`✅ Email sent: ${subject} to ${to}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);
      return false;
    }
  }

  // ═══════════════════ EMAIL TEMPLATES ═══════════════════

  async sendVerificationEmail(to: string, name: string, token: string): Promise<boolean> {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verifizierung</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 102, 255, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #0066ff 0%, #0052cc 100%);">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                <span style="background: linear-gradient(to right, #00e5ff, #0066ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">o</span>mekan
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #ffffff;">
                Willkommen, ${name}! 👋
              </h2>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #a0a0a0;">
                Vielen Dank für deine Registrierung bei Omekan! Um deinen Account zu aktivieren, bestätige bitte deine E-Mail-Adresse.
              </p>

              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #a0a0a0;">
                Klicke einfach auf den Button unten:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 10px 0;">
                    <a href="${verifyUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #0066ff 0%, #0052cc 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(0, 102, 255, 0.3);">
                      E-Mail bestätigen
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #666666;">
                Oder kopiere diesen Link in deinen Browser:<br>
                <a href="${verifyUrl}" style="color: #0066ff; word-break: break-all;">${verifyUrl}</a>
              </p>

              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #666666; padding-top: 20px; border-top: 1px solid #2a2a2a;">
                Dieser Link ist 24 Stunden gültig. Falls du dich nicht registriert hast, ignoriere diese E-Mail einfach.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #0a0a0a; text-align: center; border-top: 1px solid #2a2a2a;">
              <p style="margin: 0; font-size: 14px; color: #666666;">
                © 2026 Omekan Events. Alle Rechte vorbehalten.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return this.sendEmail({
      to,
      subject: "Bestätige deine E-Mail-Adresse bei Omekan",
      html,
    });
  }

  async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Willkommen bei Omekan</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 102, 255, 0.1);">
          
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #0066ff 0%, #0052cc 100%);">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff;">
                <span style="background: linear-gradient(to right, #00e5ff, #0066ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">o</span>mekan
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #ffffff;">
                Willkommen bei Omekan, ${name}! 🎉
              </h2>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #a0a0a0;">
                Dein Account wurde erfolgreich aktiviert! Du kannst jetzt die volle Power von Omekan nutzen.
              </p>

              <h3 style="margin: 30px 0 15px; font-size: 18px; font-weight: 600; color: #ffffff;">
                Was du jetzt tun kannst:
              </h3>

              <ul style="margin: 0 0 30px; padding-left: 20px; font-size: 16px; line-height: 1.8; color: #a0a0a0;">
                <li>🎭 Entdecke Events in deiner Nähe</li>
                <li>🎵 Folge deinen Lieblings-Artists</li>
                <li>📅 Erstelle eigene Events</li>
                <li>🌍 Tritt Communities bei</li>
                <li>⭐ Bewerte und kommentiere Events</li>
              </ul>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 10px 0;">
                    <a href="${frontendUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #0066ff 0%, #0052cc 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(0, 102, 255, 0.3);">
                      Los geht's!
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px 40px; background-color: #0a0a0a; text-align: center; border-top: 1px solid #2a2a2a;">
              <p style="margin: 0; font-size: 14px; color: #666666;">
                © 2026 Omekan Events. Alle Rechte vorbehalten.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return this.sendEmail({
      to,
      subject: "🎉 Willkommen bei Omekan!",
      html,
    });
  }

  async sendPasswordResetEmail(to: string, name: string, token: string): Promise<boolean> {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Passwort zurücksetzen</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 102, 255, 0.1);">
          
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #0066ff 0%, #0052cc 100%);">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff;">
                <span style="background: linear-gradient(to right, #00e5ff, #0066ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">o</span>mekan
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #ffffff;">
                Passwort zurücksetzen 🔐
              </h2>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #a0a0a0;">
                Hallo ${name},
              </p>

              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #a0a0a0;">
                Du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt. Klicke auf den Button unten, um ein neues Passwort festzulegen:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 10px 0;">
                    <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #0066ff 0%, #0052cc 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(0, 102, 255, 0.3);">
                      Passwort zurücksetzen
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #666666;">
                Oder kopiere diesen Link in deinen Browser:<br>
                <a href="${resetUrl}" style="color: #0066ff; word-break: break-all;">${resetUrl}</a>
              </p>

              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #666666; padding-top: 20px; border-top: 1px solid #2a2a2a;">
                ⚠️ Dieser Link ist nur 1 Stunde gültig.<br>
                Falls du diese Anfrage nicht gestellt hast, ignoriere diese E-Mail einfach. Dein Passwort bleibt unverändert.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px 40px; background-color: #0a0a0a; text-align: center; border-top: 1px solid #2a2a2a;">
              <p style="margin: 0; font-size: 14px; color: #666666;">
                © 2026 Omekan Events. Alle Rechte vorbehalten.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return this.sendEmail({
      to,
      subject: "Passwort zurücksetzen - Omekan",
      html,
    });
  }
}

// Singleton instance
export const emailService = new EmailService();
