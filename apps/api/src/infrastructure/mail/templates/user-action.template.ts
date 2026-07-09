import { emailLayout } from "./layouts/layout.ts";
import type { UserActionTemplateProps } from "../interfaces/mail.service.ts";

export function userActionTemplate({
    fullName,
    action,
    reason,
    actionTime,
}: UserActionTemplateProps): string {

    return emailLayout(`

<h2>Hello ${fullName},</h2>

<br>

<p>

This is to inform you that your LinkFlow account has been updated.

</p>

<table
    style="
        width:100%;
        margin-top:24px;
        border-collapse:collapse;
    "
>

<tr>
    <td><strong>Action</strong></td>
    <td>${action}</td>
</tr>

<tr>
    <td><strong>Date</strong></td>
    <td> ${new Date(actionTime).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })}</td>
</tr>

${
reason
? `
<tr>
    <td><strong>Reason</strong></td>
    <td>${reason}</td>
</tr>
`
: ""
}

</table>

<br>

<p>

If you believe this action was performed in error,
please contact our support team immediately.

</p>

`);
}