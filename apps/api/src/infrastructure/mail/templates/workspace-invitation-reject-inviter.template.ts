import { emailLayout } from './layouts/layout.ts';

export function workspaceInvitationRejectedInviterTemplate(
  inviteeName: string,
  inviterName: string,
  workspaceName: string,
) {
  return emailLayout(`
    <h2>Hello ${inviterName},</h2>

    <p>
        We regret to inform you that ${inviteeName} has rejected your invitation to join
        <strong>${workspaceName}</strong>.
    </p>

    <p>
        If you have any questions or concerns, please feel free to reach out to ${inviteeName} directly.
    </p>

    <p>
        You can also send another invitation to ${inviteeName} if you wish to invite them again in the future.
    </p>

    <br>

    <p>
      Best regards,<br>
      The LinkFlow Team
    </p>
  `);
}
