export function workspaceMemberLeftOwnerTemplate(
  ownerName: string,
  memberName: string,
  workspaceName: string,
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Member Left Workspace</title>
      </head>

      <body style="
        margin: 0;
        padding: 0;
        background-color: #f4f4f5;
        font-family: Arial, sans-serif;
      ">

        <div style="
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          padding: 40px;
          border-radius: 8px;
        ">

          <h2 style="color: #18181b;">
            Member Left Your Workspace
          </h2>

          <p style="color: #52525b;">
            Hi ${ownerName},
          </p>

          <p style="color: #52525b;">
            <strong>${memberName}</strong> has left the workspace
            <strong>${workspaceName}</strong>.
          </p>

          <p style="color: #52525b;">
            They no longer have access to the workspace and its resources.
          </p>

          <p style="color: #52525b;">
            Best regards,<br />
            <strong>The LinkFlow Team</strong>
          </p>

        </div>

      </body>
    </html>
  `;
}
