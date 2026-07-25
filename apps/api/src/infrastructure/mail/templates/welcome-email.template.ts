import { emailButton } from './partials/button.ts';
import { emailLayout } from './layouts/layout.ts';

export function welcomeEmailTemplate(name: string, dashboardUrl: string) {
  return emailLayout(`

<h2>Welcome to LinkFlow, ${name}! 🎉</h2>

<br>

<p>
Your account has been successfully created.
</p>

<p>
We're excited to have you on board. LinkFlow helps you create, manage,
and analyze your short URLs in one place.
</p>

${emailButton('Go to LinkFlow', dashboardUrl)}

<p>
If you have any questions, feel free to reach out to our support team.
</p>

<br>

<p>
Enjoy using LinkFlow!
</p>

<br>

<p>
Best regards,<br>
<strong>The LinkFlow Team</strong>
</p>

`);
}
