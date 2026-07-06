-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "newsletteredAt" TIMESTAMP(3),
ADD COLUMN     "starred" BOOLEAN NOT NULL DEFAULT false;
