import { emailLayout } from './layouts/layout.ts';

export function workspaceInvitationAcceptedInviteeTemplate(
  inviteeName: string,
  workspaceName: string,
  roleName: string,
) {
  return emailLayout(`
    <h2>Hello ${inviteeName},</h2>

    <p>
      You have successfully accepted the invitation to join
      <strong>${workspaceName}</strong>.
    </p>

    <p>
      You are now a member of this workspace with the role:
      <strong>${roleName}</strong>.
    </p>

    <p>
      You can now start collaborating with other members of the workspace.
    </p>

    <br>

    <p>
      Best regards,<br>
      The LinkFlow Team
    </p>
  `);
}
