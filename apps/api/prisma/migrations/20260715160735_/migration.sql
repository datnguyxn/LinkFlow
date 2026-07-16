/*
  Warnings:

  - The `theme` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."Theme" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "theme",
ADD COLUMN     "theme" "public"."Theme" NOT NULL DEFAULT 'SYSTEM';
