/*
  Warnings:

  - You are about to drop the `user_roles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."user_roles" DROP CONSTRAINT "user_roles_roleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_roles" DROP CONSTRAINT "user_roles_userId_fkey";

-- DropTable
DROP TABLE "public"."user_roles";
