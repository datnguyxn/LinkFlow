export function emailFooter(): string {
    return `
<div class="footer">

    <p>
        Thanks for using <strong>LinkFlow</strong>.
    </p>

    <p>
        If you didn't request this email, you can safely ignore it.
    </p>

    <div class="divider"></div>

    <p>
        © ${new Date().getFullYear()} LinkFlow.
        All rights reserved.
    </p>

</div>
`;
}