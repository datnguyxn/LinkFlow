import { emailButton } from './partials/button.ts';
import { emailLayout } from './layouts/layout.ts';

export function workspaceInvitationTemplate(
  name: string,
  inviterName: string,
  workspaceName: string,
  roleName: string,
  url: string,
) {
  return emailLayout(`

<h2>Hello ${name},</h2>

<br>

<p>
<strong>${inviterName}</strong> has invited you to join the workspace
<strong>${workspaceName}</strong> on LinkFlow.
</p>

<p>
You have been invited to join as a
<strong>${roleName}</strong>.
</p>

${emailButton('Accept Invitation', url)}

<p>
This invitation link will expire in
<strong>7 days</strong>.
</p>

<p>
If you were not expecting this invitation, you can safely ignore this email.
</p>

`);
}
