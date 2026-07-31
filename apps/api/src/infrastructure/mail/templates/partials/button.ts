export function emailButton(
  text: string,
  href: string,
  color?: string,
) {
  // Single button (centered)
  if (!color) {
    return `
      <p style="text-align:center">

        <a
            href="${href}"
            class="button"
        >
            ${text}
        </a>

      </p>
    `;
  }

  // Multi-button (used inside a table row)
  return `
    <a
      href="${href}"
      target="_blank"
      style="
        display:inline-block;
        background:${color};
        color:#ffffff;
        text-decoration:none;
        padding:14px 28px;
        border-radius:8px;
        font-weight:600;
      "
    >
      ${text}
    </a>
  `;
}