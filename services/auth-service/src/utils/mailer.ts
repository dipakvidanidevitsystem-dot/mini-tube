import nodemailer, { type Transporter } from "nodemailer";

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

class MailerService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });
  }

  async sendMail({ to, subject, html }: MailOptions) {
    await this.transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  }

  sendMailFireAndForget(options: MailOptions) {
    this.sendMail(options).catch((err) => console.error("email failed:", err));
  }
}

export { MailerService };
export const mailerService = new MailerService();
