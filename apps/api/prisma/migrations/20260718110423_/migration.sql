-- CreateEnum
CREATE TYPE "public"."RedirectType" AS ENUM ('PERMANENT', 'TEMPORARY');

-- AlterTable
ALTER TABLE "public"."urls" ADD COLUMN     "redirectType" "public"."RedirectType" NOT NULL DEFAULT 'TEMPORARY';
