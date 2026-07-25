export function workspaceMemberRemovedTemplate(memberName: string, workspaceName: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Removed from Workspace</title>
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
            You Have Been Removed from a Workspace
          </h2>

          <p style="color: #52525b;">
            Hi ${memberName},
          </p>

          <p style="color: #52525b;">
            You have been removed from the workspace
            <strong>${workspaceName}</strong>.
          </p>

          <p style="color: #52525b;">
            You no longer have access to this workspace and its resources.
          </p>

          <p style="color: #52525b;">
            If you believe this was a mistake, please contact the workspace owner.
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
