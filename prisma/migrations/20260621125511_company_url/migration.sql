/*
  Warnings:

  - You are about to drop the column `photo` on the `companies` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "companies" DROP COLUMN "photo",
ADD COLUMN     "photo_url" TEXT;
