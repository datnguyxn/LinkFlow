/*
  Warnings:

  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `avatarUrl` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastLoginAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "UrlStatus" AS ENUM ('ACTIVE', 'DISABLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR');

-- CreateEnum
CREATE TYPE "OAuthProvider" AS ENUM ('GOOGLE', 'GITHUB');

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "avatarUrl",
DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "emailVerified",
DROP COLUMN "fullName",
DROP COLUMN "lastLoginAt",
DROP COLUMN "passwordHash",
DROP COLUMN "updatedAt",
ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "full_name" TEXT,
ADD COLUMN     "last_login_at" TIMESTAMP(3),
ADD COLUMN     "password_hash" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ALTER COLUMN "username" DROP NOT NULL,
ALTER COLUMN "language" DROP DEFAULT,
ALTER COLUMN "timezone" DROP DEFAULT,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "oauth_accounts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "provider" "OAuthProvider" NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oauth_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaces" (
    "id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_members" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "WorkspaceRole" NOT NULL DEFAULT 'MEMBER',
    "invited_at" TIMESTAMP(3),
    "joined_at" TIMESTAMP(3),

    CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "urls" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "short_code" TEXT NOT NULL,
    "original_url" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "favicon_url" TEXT,
    "password_hash" TEXT,
    "expires_at" TIMESTAMP(3),
    "max_clicks" INTEGER,
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "status" "UrlStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "urls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_codes" (
    "id" UUID NOT NULL,
    "url_id" UUID NOT NULL,
    "image_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "url_tags" (
    "url_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "url_tags_pkey" PRIMARY KEY ("url_id","tag_id")
);

-- CreateTable
CREATE TABLE "click_events" (
    "id" UUID NOT NULL,
    "url_id" UUID NOT NULL,
    "ip_address" TEXT,
    "country" TEXT,
    "city" TEXT,
    "region" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "browser" TEXT,
    "browser_version" TEXT,
    "operating_system" TEXT,
    "device" TEXT,
    "referrer" TEXT,
    "user_agent" TEXT,
    "clicked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "click_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_statistics" (
    "id" UUID NOT NULL,
    "url_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "total_clicks" INTEGER NOT NULL DEFAULT 0,
    "unique_clicks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "daily_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "browser_statistics" (
    "id" UUID NOT NULL,
    "url_id" UUID NOT NULL,
    "browser" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "browser_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "country_statistics" (
    "id" UUID NOT NULL,
    "url_id" UUID NOT NULL,
    "country" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "country_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_statistics" (
    "id" UUID NOT NULL,
    "url_id" UUID NOT NULL,
    "device" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "device_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "last_used_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resource_id" UUID,
    "metadata" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_slug_key" ON "workspaces"("slug");

-- CreateIndex
CREATE INDEX "workspace_members_workspace_id_idx" ON "workspace_members"("workspace_id");

-- CreateIndex
CREATE INDEX "workspace_members_user_id_idx" ON "workspace_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_members_workspace_id_user_id_key" ON "workspace_members"("workspace_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "urls_short_code_key" ON "urls"("short_code");

-- CreateIndex
CREATE INDEX "urls_workspace_id_idx" ON "urls"("workspace_id");

-- CreateIndex
CREATE INDEX "urls_user_id_idx" ON "urls"("user_id");

-- CreateIndex
CREATE INDEX "urls_short_code_idx" ON "urls"("short_code");

-- CreateIndex
CREATE UNIQUE INDEX "qr_codes_url_id_key" ON "qr_codes"("url_id");

-- CreateIndex
CREATE INDEX "tags_workspace_id_idx" ON "tags"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_workspace_id_name_key" ON "tags"("workspace_id", "name");

-- CreateIndex
CREATE INDEX "click_events_url_id_idx" ON "click_events"("url_id");

-- CreateIndex
CREATE INDEX "click_events_clicked_at_idx" ON "click_events"("clicked_at");

-- CreateIndex
CREATE INDEX "click_events_country_idx" ON "click_events"("country");

-- CreateIndex
CREATE INDEX "daily_statistics_url_id_idx" ON "daily_statistics"("url_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_statistics_url_id_date_key" ON "daily_statistics"("url_id", "date");

-- CreateIndex
CREATE INDEX "browser_statistics_url_id_idx" ON "browser_statistics"("url_id");

-- CreateIndex
CREATE UNIQUE INDEX "browser_statistics_url_id_browser_key" ON "browser_statistics"("url_id", "browser");

-- CreateIndex
CREATE INDEX "country_statistics_url_id_idx" ON "country_statistics"("url_id");

-- CreateIndex
CREATE UNIQUE INDEX "country_statistics_url_id_country_key" ON "country_statistics"("url_id", "country");

-- CreateIndex
CREATE INDEX "device_statistics_url_id_idx" ON "device_statistics"("url_id");

-- CreateIndex
CREATE UNIQUE INDEX "device_statistics_url_id_device_key" ON "device_statistics"("url_id", "device");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "api_keys_workspace_id_idx" ON "api_keys"("workspace_id");

-- CreateIndex
CREATE INDEX "api_keys_user_id_idx" ON "api_keys"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs"("resource");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "urls" ADD CONSTRAINT "urls_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "urls" ADD CONSTRAINT "urls_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_url_id_fkey" FOREIGN KEY ("url_id") REFERENCES "urls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "url_tags" ADD CONSTRAINT "url_tags_url_id_fkey" FOREIGN KEY ("url_id") REFERENCES "urls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "url_tags" ADD CONSTRAINT "url_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "click_events" ADD CONSTRAINT "click_events_url_id_fkey" FOREIGN KEY ("url_id") REFERENCES "urls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_statistics" ADD CONSTRAINT "daily_statistics_url_id_fkey" FOREIGN KEY ("url_id") REFERENCES "urls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "browser_statistics" ADD CONSTRAINT "browser_statistics_url_id_fkey" FOREIGN KEY ("url_id") REFERENCES "urls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "country_statistics" ADD CONSTRAINT "country_statistics_url_id_fkey" FOREIGN KEY ("url_id") REFERENCES "urls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_statistics" ADD CONSTRAINT "device_statistics_url_id_fkey" FOREIGN KEY ("url_id") REFERENCES "urls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
