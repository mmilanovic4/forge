import { after } from "next/server";

import nodemailer from "nodemailer";

import { emailEnabled } from "./auth-config";
import { logger } from "./logger";

const port = Number(process.env.SMTP_PORT) || 587;

// 465 is implicit TLS: encrypted from the first byte. Every other port starts
// in plain text and upgrades with STARTTLS — which nodemailer only attempts,
// carrying on unencrypted if the server (or someone in between) doesn't offer
// it. Reset links and login codes travel this way, so production insists on
// the upgrade. SMTP_REQUIRE_TLS=false is the way out for a relay on a trusted
// network that has no TLS; development defaults to it for Mailpit.
const secure = port === 465;
const requireTLS =
  !secure &&
  (process.env.SMTP_REQUIRE_TLS
    ? process.env.SMTP_REQUIRE_TLS !== "false"
    : process.env.NODE_ENV === "production");

const transporter = emailEnabled
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      requireTLS,
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
