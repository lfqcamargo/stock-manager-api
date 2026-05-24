-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('pending', 'sent', 'failed');

-- AlterTable
ALTER TABLE "emails" ADD COLUMN     "observation" TEXT,
ADD COLUMN     "retry_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" "EmailStatus" NOT NULL DEFAULT 'pending';
