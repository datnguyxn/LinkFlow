/*
  Warnings:

  - You are about to drop the `WorkspaceInvitation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."WorkspaceInvitation" DROP CONSTRAINT "WorkspaceInvitation_inviterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkspaceInvitation" DROP CONSTRAINT "WorkspaceInvitation_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkspaceInvitation" DROP CONSTRAINT "WorkspaceInvitation_workspaceId_fkey";

-- DropTable
DROP TABLE "public"."WorkspaceInvitation";

-- CreateTable
CREATE TABLE "public"."workspace_invitations" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "inviterId" UUID NOT NULL,
    "userId" UUID,
    "email" TEXT NOT NULL,
    "role" "public"."WorkspaceRole" NOT NULL,
    "token" TEXT NOT NULL,
    "status" "public"."InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workspace_invitations_token_key" ON "public"."workspace_invitations"("token");

-- CreateIndex
CREATE INDEX "workspace_invitations_workspaceId_idx" ON "public"."workspace_invitations"("workspaceId");

-- CreateIndex
CREATE INDEX "workspace_invitations_email_idx" ON "public"."workspace_invitations"("email");

-- CreateIndex
CREATE INDEX "workspace_invitations_userId_idx" ON "public"."workspace_invitations"("userId");

-- AddForeignKey
ALTER TABLE "public"."workspace_invitations" ADD CONSTRAINT "workspace_invitations_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workspace_invitations" ADD CONSTRAINT "workspace_invitations_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workspace_invitations" ADD CONSTRAINT "workspace_invitations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
