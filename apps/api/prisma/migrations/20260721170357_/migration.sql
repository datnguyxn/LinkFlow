/*
  Warnings:

  - You are about to drop the column `reat_at` on the `notifications` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."notifications_user_id_reat_at_idx";

-- AlterTable
ALTER TABLE "public"."notifications" DROP COLUMN "reat_at",
ADD COLUMN     "read_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "notifications_user_id_read_at_idx" ON "public"."notifications"("user_id", "read_at");
