import { emailLayout } from './layouts/layout.ts';

export function workspaceOwnershipTransferredNewOwnerTemplate(
  newOwnerName: string,
  workspaceName: string,
) {
  return emailLayout(`
    <h2>Hello ${newOwnerName},</h2>

    <p>
      You are now the owner of the workspace
      <strong>${workspaceName}</strong>.
    </p>

    <p>
      The ownership transfer has been completed successfully.
      You now have full ownership and administrative control
      over this workspace.
    </p>

    <p>
      You can now manage the workspace, members, roles,
      and other workspace settings.
    </p>

    <p>
      If you did not expect this change, please contact your
      workspace administrator.
    </p>

    <br>
    
    <p>
      Best regards,<br>
      <strong>LinkFlow Team</strong>
    </p>
  `);
}
