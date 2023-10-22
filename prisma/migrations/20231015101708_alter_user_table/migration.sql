/*
  Warnings:

  - A unique constraint covering the columns `[nickName]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
-- DROP INDEX `Board_id_key` ON `board`;

-- DropIndex
DROP INDEX `User_email_key` ON `user`;

-- AlterTable
ALTER TABLE `board` ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE UNIQUE INDEX `User_nickName_key` ON `User`(`nickName`);
