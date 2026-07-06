import { emailLayout } from "./layout.template.ts";

export function resetPasswordTemplate(data: {
    fullName: string;
    resetUrl: string;
}) {

    return emailLayout(`

<h2>Hello ${data.fullName},</h2>

<p>

Someone requested a password reset.

</p>

<a

class="button"

href="${data.resetUrl}"

>

Reset Password

</a>

<p>

If this wasn't you, simply ignore this email.

</p>

`);

}