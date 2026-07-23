/*
  Warnings:

  - You are about to drop the column `invited_id` on the `workspace_invitations` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `workspace_invitations` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `workspace_members` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inviter_id` to the `workspace_invitations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_id` to the `workspace_invitations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_id` to the `workspace_members` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."workspace_invitations" DROP CONSTRAINT "workspace_invitations_invited_id_fkey";

-- AlterTable
ALTER TABLE "public"."roles" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."workspace_invitations" DROP COLUMN "invited_id",
DROP COLUMN "role",
ADD COLUMN     "inviter_id" UUID NOT NULL,
ADD COLUMN     "role_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "public"."workspace_members" DROP COLUMN "role",
ADD COLUMN     "role_id" UUID NOT NULL;

-- DropEnum
DROP TYPE "public"."WorkspaceRole";

-- CreateIndex
CREATE INDEX "role_permissions_permission_id_idx" ON "public"."role_permissions"("permission_id");

-- CreateIndex
CREATE INDEX "workspace_invitations_role_id_idx" ON "public"."workspace_invitations"("role_id");

-- CreateIndex
CREATE INDEX "workspace_members_role_id_idx" ON "public"."workspace_members"("role_id");

-- AddForeignKey
ALTER TABLE "public"."workspace_members" ADD CONSTRAINT "workspace_members_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workspace_invitations" ADD CONSTRAINT "workspace_invitations_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workspace_invitations" ADD CONSTRAINT "workspace_invitations_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
