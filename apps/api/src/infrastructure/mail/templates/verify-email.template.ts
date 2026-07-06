import { emailLayout } from "./layout.template.ts";

export function verifyEmailTemplate(data: {
    fullName: string;
    verifyUrl: string;
}) {

    return emailLayout(`

<h2>Hello ${data.fullName},</h2>

<p>
Thank you for registering your LinkFlow account.
</p>

<p>

Please click the button below to verify your email.

</p>

<a
class="button"
href="${data.verifyUrl}"
>

Verify Email

</a>

<p>

If you didn't create this account, you can safely ignore this email.

</p>

`);

}