import { emailLayout } from './layouts/layout.ts';

export function workspaceMemberLeftOwnerTemplate(
  ownerName: string,
  memberName: string,
  workspaceName: string,
) {
  return emailLayout(`
    <p>
      Hi ${ownerName},
    </p>

    <p>
      <strong>${memberName}</strong> has left the workspace
      <strong>${workspaceName}</strong>.
    </p>

    <p>
      They no longer have access to the workspace and its resources.
    </p>

    <p>
      Best regards,<br />
      The LinkFlow Team
    </p>

    `);
}
