/*
  Warnings:

  - You are about to drop the column `ipAddress` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `rememberMe` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `revokedAt` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `redirectType` on the `urls` table. All the data in the column will be lost.
  - You are about to drop the column `acceptedAt` on the `workspace_invitations` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `workspace_invitations` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `workspace_invitations` table. All the data in the column will be lost.
  - You are about to drop the column `inviterId` on the `workspace_invitations` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `workspace_invitations` table. All the data in the column will be lost.
  - You are about to drop the column `workspaceId` on the `workspace_invitations` table. All the data in the column will be lost.
  - Added the required column `expires_at` to the `workspace_invitations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invited_id` to the `workspace_invitations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `workspace_invitations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspace_id` to the `workspace_invitations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `workspace_members` table without a default value. This is not possible if the table is not empty.
  - Made the column `joined_at` on table `workspace_members` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."WorkspaceStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."WorkspaceMemberStatus" AS ENUM ('ACTIVE', 'REMOVED', 'LEFT');

-- AlterEnum
ALTER TYPE "public"."InvitationStatus" ADD VALUE 'REVOKED';

-- DropForeignKey
ALTER TABLE "public"."workspace_invitations" DROP CONSTRAINT "workspace_invitations_inviterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."workspace_invitations" DROP CONSTRAINT "workspace_invitations_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."workspace_invitations" DROP CONSTRAINT "workspace_invitations_workspaceId_fkey";

-- DropIndex
DROP INDEX "public"."workspace_invitations_userId_idx";

-- DropIndex
DROP INDEX "public"."workspace_invitations_workspaceId_idx";

-- AlterTable
ALTER TABLE "public"."refresh_tokens" DROP COLUMN "ipAddress",
DROP COLUMN "rememberMe",
DROP COLUMN "revokedAt",
DROP COLUMN "userAgent",
ADD COLUMN     "ip_address" TEXT,
ADD COLUMN     "remember_me" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "revoked_at" TIMESTAMP(3),
ADD COLUMN     "user_agent" TEXT;

-- AlterTable
ALTER TABLE "public"."urls" DROP COLUMN "redirectType",
ADD COLUMN     "redirect_type" "public"."RedirectType" NOT NULL DEFAULT 'TEMPORARY';

-- AlterTable
ALTER TABLE "public"."workspace_invitations" DROP COLUMN "acceptedAt",
DROP COLUMN "createdAt",
DROP COLUMN "expiresAt",
DROP COLUMN "inviterId",
DROP COLUMN "userId",
DROP COLUMN "workspaceId",
ADD COLUMN     "accepted_at" TIMESTAMP(3),
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "invited_id" UUID NOT NULL,
ADD COLUMN     "rejected_at" TIMESTAMP(3),
ADD COLUMN     "revoked_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" UUID,
ADD COLUMN     "workspace_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "public"."workspace_members" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "status" "public"."WorkspaceMemberStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "joined_at" SET NOT NULL,
ALTER COLUMN "joined_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."workspaces" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "status" "public"."WorkspaceStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "workspace_invitations_workspace_id_idx" ON "public"."workspace_invitations"("workspace_id");

-- CreateIndex
CREATE INDEX "workspace_invitations_user_id_idx" ON "public"."workspace_invitations"("user_id");

-- CreateIndex
CREATE INDEX "workspaces_owner_id_idx" ON "public"."workspaces"("owner_id");

-- AddForeignKey
ALTER TABLE "public"."workspace_invitations" ADD CONSTRAINT "workspace_invitations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workspace_invitations" ADD CONSTRAINT "workspace_invitations_invited_id_fkey" FOREIGN KEY ("invited_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workspace_invitations" ADD CONSTRAINT "workspace_invitations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
