import nodemailer from "nodemailer";

import { emailEnabled } from "./auth-config";
import { logger } from "./logger";

const transporter = emailEnabled
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
    })
  : null;

export async function sendEmail({ to, subject, html }) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
  } catch (err) {
    // The recipient is left out on purpose — it's personal data.
    logger.error("Failed to send email", { err, subject });
    throw err;
  }
}
