import { emailButton } from './partials/button.ts';
import { emailLayout } from './layouts/layout.ts';

export function workspaceInvitationTemplate(
  name: string,
  inviterName: string,
  workspaceName: string,
  roleName: string,
  urlAccept: string,
  urlDecline: string,
) {
  return emailLayout(`
    <h2>Hello ${name},</h2>

    <p>
      <strong>${inviterName}</strong> has invited you to join the workspace
      <strong>${workspaceName}</strong> on LinkFlow.
    </p>

    <p>
      You have been invited to join as
      <strong>${roleName}</strong>.
    </p>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:32px 0;">
      <tr>
        <td style="padding-right:12px;">
          ${emailButton('Accept Invitation', urlAccept)}
        </td>

        <td>
          ${emailButton('Decline Invitation', urlDecline, '#6b7280')}
        </td>
      </tr>
    </table>

    <p>
      This invitation will expire in <strong>7 days</strong>.
    </p>

    <p>
      If you weren't expecting this invitation, you can safely ignore this email.
    </p>

    <br>

    <p>
      Best regards,<br>
      The LinkFlow Team
    </p>
  `);
}
