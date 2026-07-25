import { emailLayout } from './layouts/layout.ts';

export function workspaceOwnershipTransferredPreviousOwnerTemplate(
  previousOwnerName: string,
  workspaceName: string,
) {
  return emailLayout(`
    <h2>Hello ${previousOwnerName},</h2>

    <p>
      Ownership of the workspace
      <strong>${workspaceName}</strong>
      has been transferred to another workspace member.
    </p>

    <p>
      You are no longer the owner of this workspace
      and your role has been changed to
      <strong>Member</strong>.
    </p>

    <p>
      You can still access the workspace according to
      your current member permissions.
    </p>

    <p>
      If you did not authorize this ownership transfer,
      please contact your workspace administrator.
    </p>

    <br>
    
    <p>
      Best regards,<br>
      <strong>LinkFlow Team</strong>
    </p>
  `);
}
