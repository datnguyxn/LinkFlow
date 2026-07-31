import { emailLayout } from './layouts/layout.ts';

export function workspaceDeletedTemplate(
  memberName: string,
  workspaceName: string,
  ownerName: string,
) {
  return emailLayout(`
    <h2>Hello ${memberName},</h2>

    <p>
      We would like to let you know that the workspace
      <strong>${workspaceName}</strong> has been permanently deleted by
      <strong>${ownerName}</strong>.
    </p>

    <p>
      As a result:
    </p>

    <ul style="padding-left:20px; margin:16px 0;">
      <li>Your access to this workspace has been removed.</li>
      <li>All workspace resources are no longer available.</li>
      <li>Any pending invitations related to this workspace have been cancelled.</li>
    </ul>

    <p>
      If you believe this workspace was deleted by mistake or you need access to its
      contents, please contact the workspace owner.
    </p>

    <br>

    <p>
      Thank you for using LinkFlow.
    </p>

    <br>

    <p>
      Best regards,<br>
      The LinkFlow Team
    </p>
  `);
}