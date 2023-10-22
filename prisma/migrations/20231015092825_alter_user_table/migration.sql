/*
  Warnings:

  - A unique constraint covering the columns `[nickName]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `nickName` VARCHAR(100) NULL,
    MODIFY `introduction` VARCHAR(100) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_nickName_key` ON `User`(`nickName`);
