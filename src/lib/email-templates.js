const wrapper = (content) => `
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;font-family:sans-serif;color:#111;">
${content}
</table>
`;

// For every value a user controls. Even your own name isn't safe: anyone can
// sign up with someone else's address, and the verification email then carries
// their markup to that stranger's inbox.
const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

// GitHub sign-ups have no firstName, so the sentence has to read correctly
// with and without the greeting — hence the lowercase `sentence`.
const opening = (firstName, sentence) =>
  firstName
    ? `Hi ${escapeHtml(firstName)}, ${sentence}`
    : sentence.charAt(0).toUpperCase() + sentence.slice(1);

// The URLs are ours, but may carry a user-supplied callbackURL.
const button = (url, label) =>
  `<a href="${escapeHtml(url)}" style="display:inline-block;padding:10px 20px;background:#6366f1;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:500;">${label}</a>`;

export const loginCodeEmailTpl = ({ otp }) =>
  wrapper(`
  <tr><td style="padding:32px 0 16px;">
    <p style="font-size:20px;font-weight:600;margin:0;">Your login code</p>
  </td></tr>
  <tr><td style="padding:0 0 16px;">
    <p style="font-size:14px;margin:0;color:#555;">Enter the code below to sign in. This code expires in 10 minutes.</p>
  </td></tr>
  <tr><td style="padding:0 0 32px;">
    <p style="font-size:32px;font-weight:700;margin:0;letter-spacing:8px;">${otp}</p>
  </td></tr>
  <tr><td>
    <p style="font-size:12px;color:#999;margin:0;">If you didn't request this code, you can ignore this email.</p>
  </td></tr>`);

export const magicLinkEmailTpl = ({ url }) =>
  wrapper(`
  <tr><td style="padding:32px 0 16px;">
    <p style="font-size:20px;font-weight:600;margin:0;">Your login link</p>
  </td></tr>
  <tr><td style="padding:0 0 16px;">
    <p style="font-size:14px;margin:0;color:#555;">Click the button below to sign in. This link expires in 1 hour.</p>
  </td></tr>
  <tr><td style="padding:0 0 32px;">
    ${button(url, "Sign in")}
  </td></tr>
  <tr><td>
    <p style="font-size:12px;color:#999;margin:0;">If you didn't request this link, you can ignore this email.</p>
  </td></tr>`);

export const resetPasswordEmailTpl = ({ firstName, url }) =>
  wrapper(`
  <tr><td style="padding:32px 0 16px;">
    <p style="font-size:20px;font-weight:600;margin:0;">Reset your password</p>
  </td></tr>
  <tr><td style="padding:0 0 16px;">
    <p style="font-size:14px;margin:0;color:#555;">${opening(firstName, "click the button below to reset your password. This link expires in 1 hour.")}</p>
  </td></tr>
  <tr><td style="padding:0 0 32px;">
    ${button(url, "Reset password")}
  </td></tr>
  <tr><td>
    <p style="font-size:12px;color:#999;margin:0;">If you didn't request a password reset, you can ignore this email.</p>
  </td></tr>`);

export const verifyEmailTpl = ({ firstName, url }) =>
  wrapper(`
  <tr><td style="padding:32px 0 16px;">
    <p style="font-size:20px;font-weight:600;margin:0;">Verify your email</p>
  </td></tr>
  <tr><td style="padding:0 0 16px;">
    <p style="font-size:14px;margin:0;color:#555;">${opening(firstName, "click the button below to verify your email address.")}</p>
  </td></tr>
  <tr><td style="padding:0 0 32px;">
    ${button(url, "Verify email")}
  </td></tr>
  <tr><td>
    <p style="font-size:12px;color:#999;margin:0;">If you didn't create an account, you can ignore this email.</p>
  </td></tr>`);

export const invitationEmailTpl = ({ organizationName, inviterName, url }) => {
  const organization = escapeHtml(organizationName);
  const inviter = escapeHtml(inviterName);
  return wrapper(`
  <tr><td style="padding:32px 0 16px;">
    <p style="font-size:20px;font-weight:600;margin:0;">Join ${organization}</p>
  </td></tr>
  <tr><td style="padding:0 0 16px;">
    <p style="font-size:14px;margin:0;color:#555;">${inviter} invited you to join <strong>${organization}</strong>. This invitation expires in 48 hours.</p>
  </td></tr>
  <tr><td style="padding:0 0 32px;">
    ${button(url, "Accept invitation")}
  </td></tr>
  <tr><td>
    <p style="font-size:12px;color:#999;margin:0;">If you weren't expecting this invitation, you can ignore this email.</p>
  </td></tr>`);
};
