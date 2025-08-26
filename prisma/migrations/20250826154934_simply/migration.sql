/*
  Warnings:

  - You are about to drop the column `commentId` on the `image` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `tag` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "image" DROP CONSTRAINT "image_commentId_fkey";

-- DropForeignKey
ALTER TABLE "tag" DROP CONSTRAINT "tag_categoryId_fkey";

-- AlterTable
ALTER TABLE "image" DROP COLUMN "commentId";

-- AlterTable
ALTER TABLE "tag" DROP COLUMN "categoryId";
