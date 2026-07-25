import { emailLayout } from './layouts/layout.ts';
import { emailButton } from './partials/button.ts';

export function workspaceMemberRoleUpdatedTemplate(
  memberName: string,
  workspaceName: string,
  previousRoleName: string,
  newRoleName: string,
  workspaceUrl: string,
) {
  return emailLayout(`
    <h2>Hello ${memberName},</h2>

    <p>
      Your role in the workspace
      <strong>${workspaceName}</strong>
      has been updated.
    </p>

    <p>
      <strong>Previous role:</strong>
      ${previousRoleName}
    </p>

    <p>
      <strong>New role:</strong>
      ${newRoleName}
    </p>

    <p>
      Your new role determines the permissions and actions
      available to you in this workspace.
    </p>

    ${emailButton('Open Workspace', workspaceUrl)}

    <p>
      If you did not expect this change, please contact your workspace owner.
    </p>

    <br>
    
    <p>
      Best regards,<br>
      The LinkFlow Team
    </p>
  `);
}
