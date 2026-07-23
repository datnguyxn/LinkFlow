import { emailLayout } from './layouts/layout.ts';

export function workspaceInvitationAcceptedOwnerTemplate(
  inviterName: string,
  inviteeName: string,
  workspaceName: string,
) {
  return emailLayout(`
    <h2>Hello ${inviterName},</h2>

    <p>
      Good news! <strong>${inviteeName}</strong> has accepted your invitation
      to join the workspace <strong>${workspaceName}</strong>.
    </p>

    <p>
      The new member has successfully joined your workspace.
    </p>

    <p>
      You can now collaborate with them in ${workspaceName}.
    </p>

    <br>

    <p>
      Best regards,<br>
      The LinkFlow Team
    </p>
  `);
}
