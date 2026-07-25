import { emailLayout } from './layouts/layout.ts';

export function workspaceInvitationRevokedInviteeTemplate(
  inviteeName: string,
  inviterName: string,
  workspaceName: string,
) {
  return emailLayout(`
    <h2>Hello ${inviteeName},</h2>

    <p>
        We regret to inform you that your invitation to join
        <strong>${workspaceName}</strong> has been revoked by ${inviterName}.
    </p>

    <p>
        If you have any questions or concerns, please feel free to reach out to ${inviterName} directly.
    </p>

    <p>
        You can also request a new invitation from ${inviterName} if you wish to join the workspace in the future.
    </p>

    <br>

    <p>
      Best regards,<br>
      The LinkFlow Team
    </p>
  `);
}
