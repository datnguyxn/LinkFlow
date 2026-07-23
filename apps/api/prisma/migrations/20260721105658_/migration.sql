-- AlterEnum
ALTER TYPE "public"."NotificationType" ADD VALUE 'WORKSPACE_INVITATION';

-- AlterTable
ALTER TABLE "public"."notifications" ADD COLUMN     "data" JSONB,
ADD COLUMN     "reat_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "notifications_user_id_reat_at_idx" ON "public"."notifications"("user_id", "reat_at");
