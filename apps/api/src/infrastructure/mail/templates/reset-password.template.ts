import { emailLayout } from './layouts/layout.ts';
import { emailButton } from './partials/button.ts';

export function resetPasswordTemplate(data: { fullName: string; resetUrl: string }) {
  return emailLayout(`

<h2>Hello ${data.fullName},</h2>

<br>

<p>

LinkFlow

We received a request to reset your password. You can reset your password by clicking the button below:

</p>

${emailButton('Reset Password', data.resetUrl)}

<p>

This verification link will expire in 
<strong>10 minutes</strong>.

If this wasn't you, simply ignore this email.
</p>

`);
}
