import { emailButton } from './partials/button.ts';
import { emailLayout } from './layouts/layout.ts';

export function verifyEmailTemplate(name: string, url: string) {
  return emailLayout(`

<h2>Hello ${name},</h2>

<br>

<p>

Welcome to LinkFlow!

Please verify your email address to activate your account.

</p>

${emailButton('Verify Email', url)}

<p>

This verification link will expire in
<strong>10 minutes</strong>.

</p>

`);
}
