const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port: Number(port),
          secure: Number(port) === 465, // true for 465, false for other ports
          auth: {
            user,
            pass
          }
        });
        console.log("📨 Nodemailer SMTP Mail Transporter initialized successfully!");
      } catch (err) {
        console.error("❌ Failed to initialize Nodemailer SMTP Transporter:", err.message);
        this.transporter = null;
      }
    } else {
      console.log("ℹ️ No SMTP environment variables found. Falling back to local terminal verification logger.");
      this.transporter = null;
    }
  }

  async sendOTP(email, otp) {
    // If transporter is active, attempt to send real email
    if (this.transporter) {
      try {
        const fromAddress = process.env.SMTP_FROM || 'no-reply@treetmi.id';
        const mailOptions = {
          from: `"treetmi.id" <${fromAddress}>`,
          to: email,
          subject: `Kode Verifikasi OTP Anda [${otp}] - Treetmi Hub`,
          html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #F8F7F3; color: #111;">
              <div style="text-align: center; margin-bottom: 30px;">
                <span style="font-size: 28px; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -1px; background-color: #FFD551; color: #000; padding: 5px 15px; display: inline-block;">
                  TREETMI
                </span>
                <span style="font-size: 28px; font-weight: 900; font-style: italic; text-transform: uppercase; color: #111;">.ID</span>
              </div>
              
              <div style="background-color: #ffffff; padding: 40px; border-radius: 24px; border: 2px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <h2 style="font-size: 22px; font-weight: 900; text-transform: uppercase; font-style: italic; margin-top: 0; color: #000; text-align: center; border-bottom: 2px solid #F8F7F3; padding-bottom: 20px;">
                  🔐 KODE VERIFIKASI MASUK
                </h2>
                
                <p style="font-size: 15px; line-height: 1.6; color: #4a5568; margin-top: 20px; text-align: center;">
                  Gunakan kode OTP berikut untuk masuk atau mengaktifkan akun Anda di <strong>Treetmi Creator Hub</strong>. Kode ini berlaku selama 15 menit.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <div style="font-size: 42px; font-weight: 900; letter-spacing: 6px; color: #000; background-color: #FFD551; padding: 15px 30px; display: inline-block; border-radius: 16px; border: 2px solid #000; box-shadow: 4px 4px 0px #000;">
                    ${otp}
                  </div>
                </div>
                
                <p style="font-size: 13px; color: #a0aec0; text-align: center; margin-top: 30px;">
                  Jika Anda tidak meminta kode ini, abaikan email ini dengan aman.
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; font-size: 11px; color: #a0aec0; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                © 2026 TREETMI.ID — ALL RIGHTS RESERVED
              </div>
            </div>
          `
        };

        const info = await this.transporter.sendMail(mailOptions);
        console.log(`✅ Verification email sent successfully to ${email}. Message ID: ${info.messageId}`);
        return true;
      } catch (err) {
        console.error(`❌ Error sending SMTP email to ${email}:`, err.message);
        console.log("⚠️ Falling back to printing OTP in terminal...");
      }
    }

    // Console fall-back logger
    this.printOTPToTerminal(email, otp);
    return true;
  }

  printOTPToTerminal(email, otp) {
    const border = "┌" + "─".repeat(60) + "┐";
    const empty = "│" + " ".repeat(60) + "│";
    const title = "│             🔑 TREETMI.ID LOCAL OTP VERIFICATION LOG            │";
    const line1 = `│  Target Email  : ${email.padEnd(43)} │`;
    const line2 = `│  OTP Code      : ${otp.padEnd(43)} │`;
    const line3 = "│  Expiry        : 15 Menit (Local Dev Sandbox Mode)          │";
    const bottom = "└" + "─".repeat(60) + "┘";

    console.log("\n" + border);
    console.log(title);
    console.log(border);
    console.log(empty);
    console.log(line1);
    console.log(line2);
    console.log(line3);
    console.log(empty);
    console.log(bottom + "\n");
  }
}

module.exports = new EmailService();
