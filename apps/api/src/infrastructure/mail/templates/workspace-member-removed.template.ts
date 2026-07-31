import { emailLayout } from './layouts/layout.ts';

export function workspaceMemberRemovedTemplate(memberName: string, workspaceName: string) {
  return emailLayout(`
    <h2>
      Hello ${memberName},
    </h2>

    <p>
      You have been removed from the workspace
      <strong>${workspaceName}</strong>.
    </p>

    <p>
      You no longer have access to this workspace and its resources.
    </p>

    <p>
      If you believe this was a mistake, please contact the workspace owner.
    </p>

    <p>
      Best regards,<br />
      The LinkFlow Team
    </p>
  `);
}
