import { after } from "next/server";

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

/**
 * Sends after the response instead of before it. Delivery can take seconds —
 * against some SMTP servers far longer than the rest of the request — and no
 * auth flow's response depends on it: a failure is logged by sendEmail, and
 * telling the caller would reveal whether the address has an account anyway.
 */
export function queueEmail(message) {
  // sendEmail has already logged the failure; nobody is left to rethrow to.
  const send = () => sendEmail(message).catch(() => {});
  try {
    after(send);
  } catch {
    // Outside a request (a script, a test) there is no "after"; send now.
    void send();
  }
}
