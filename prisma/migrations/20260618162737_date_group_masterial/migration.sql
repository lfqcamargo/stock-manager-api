/*
  Warnings:

  - You are about to drop the column `created_at` on the `groups` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `materials` table. All the data in the column will be lost.
  - Added the required column `unit` to the `materials` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "groups" DROP COLUMN "created_at";

-- AlterTable
ALTER TABLE "materials" DROP COLUMN "created_at",
ADD COLUMN     "unit" "UnitMeasure" NOT NULL;
