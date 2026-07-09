export function emailButton(
    text: string,
    url: string,
): string {

    return `
<p style="text-align:center">

<a
    href="${url}"
    class="button"
>
    ${text}
</a>

</p>
`;
}