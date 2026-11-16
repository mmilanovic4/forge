import "server-only";

import { organization } from "better-auth/plugins/organization";

import { appName } from "../app-config";
import { emailEnabled } from "../auth-config";
import { queueEmail } from "../email";
import { invitationEmailTpl } from "../email-templates";
import { invitationPath } from "./invitation";

// The better-auth organization plugin as this app configures it. Roles and
// permissions are the plugin's defaults — ./permissions.js reads the same
// definitions for the UI.
export const organizationPlugin = () =>
  organization({
    // Without SMTP nobody can verify an address, so requiring it would make
    // invitations impossible to accept.
    requireEmailVerificationOnInvitation: emailEnabled,
    // Without SMTP the inviter shares the link from the members page.
    sendInvitationEmail: emailEnabled
      ? ({ id, email, organization, inviter }) => {
          queueEmail({
            to: email,
            subject: `Join ${organization.name} on ${appName}`,
            html: invitationEmailTpl({
              organizationName: organization.name,
              inviterName: inviter.user.name,
              url: new URL(
                invitationPath(id),
                process.env.BETTER_AUTH_URL,
              ).toString(),
            }),
          });
        }
      : undefined,
  });
