-- AlterTable
ALTER TABLE "public"."refresh_tokens" ADD COLUMN     "rememberMe" BOOLEAN NOT NULL DEFAULT false;
