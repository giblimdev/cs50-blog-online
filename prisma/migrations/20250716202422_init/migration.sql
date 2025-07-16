/*
  Warnings:

  - You are about to drop the column `access_token` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `access_token_expires_at` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `account_id` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `id_token` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `provider_id` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token_expires_at` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `author_id` on the `comment` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `comment` table. All the data in the column will be lost.
  - You are about to drop the column `parent_id` on the `comment` table. All the data in the column will be lost.
  - You are about to drop the column `post_id` on the `comment` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `comment` table. All the data in the column will be lost.
  - You are about to drop the column `comment_id` on the `image` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `image` table. All the data in the column will be lost.
  - You are about to drop the column `post_id` on the `image` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `image` table. All the data in the column will be lost.
  - You are about to drop the column `author_id` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `profile` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `profile` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `expires_at` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `ip_address` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `user_agent` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `verification` table. All the data in the column will be lost.
  - You are about to drop the column `expires_at` on the `verification` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `verification` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `profile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountId` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `providerId` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorId` to the `comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postId` to the `comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorId` to the `post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `verification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "account" DROP CONSTRAINT "account_user_id_fkey";

-- DropForeignKey
ALTER TABLE "comment" DROP CONSTRAINT "comment_author_id_fkey";

-- DropForeignKey
ALTER TABLE "comment" DROP CONSTRAINT "comment_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "comment" DROP CONSTRAINT "comment_post_id_fkey";

-- DropForeignKey
ALTER TABLE "image" DROP CONSTRAINT "image_comment_id_fkey";

-- DropForeignKey
ALTER TABLE "image" DROP CONSTRAINT "image_post_id_fkey";

-- DropForeignKey
ALTER TABLE "image" DROP CONSTRAINT "image_user_id_fkey";

-- DropForeignKey
ALTER TABLE "post" DROP CONSTRAINT "post_author_id_fkey";

-- DropForeignKey
ALTER TABLE "profile" DROP CONSTRAINT "profile_user_id_fkey";

-- DropForeignKey
ALTER TABLE "session" DROP CONSTRAINT "session_user_id_fkey";

-- DropIndex
DROP INDEX "profile_user_id_key";

-- AlterTable
ALTER TABLE "account" DROP COLUMN "access_token",
DROP COLUMN "access_token_expires_at",
DROP COLUMN "account_id",
DROP COLUMN "created_at",
DROP COLUMN "id_token",
DROP COLUMN "provider_id",
DROP COLUMN "refresh_token",
DROP COLUMN "refresh_token_expires_at",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "accessTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "accountId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "idToken" TEXT,
ADD COLUMN     "providerId" TEXT NOT NULL,
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "refreshTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "comment" DROP COLUMN "author_id",
DROP COLUMN "created_at",
DROP COLUMN "parent_id",
DROP COLUMN "post_id",
DROP COLUMN "updated_at",
ADD COLUMN     "authorId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "postId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "image" DROP COLUMN "comment_id",
DROP COLUMN "created_at",
DROP COLUMN "post_id",
DROP COLUMN "user_id",
ADD COLUMN     "commentId" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "postId" TEXT,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "post" DROP COLUMN "author_id",
DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "authorId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "profile" DROP COLUMN "first_name",
DROP COLUMN "user_id",
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "session" DROP COLUMN "created_at",
DROP COLUMN "expires_at",
DROP COLUMN "ip_address",
DROP COLUMN "updated_at",
DROP COLUMN "user_agent",
DROP COLUMN "user_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userAgent" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "created_at",
DROP COLUMN "role",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "emailVerified" SET DEFAULT false;

-- AlterTable
ALTER TABLE "verification" DROP COLUMN "created_at",
DROP COLUMN "expires_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "profile_userId_key" ON "profile"("userId");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image" ADD CONSTRAINT "image_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image" ADD CONSTRAINT "image_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image" ADD CONSTRAINT "image_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
