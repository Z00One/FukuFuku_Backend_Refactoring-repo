/*
  Warnings:

  - The primary key for the `image` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `User_id_key` ON `user`;

-- DropIndex
DROP INDEX `User_nickName_key` ON `user`;

-- AlterTable
ALTER TABLE `image` DROP PRIMARY KEY,
    ADD PRIMARY KEY (`url`);

-- AlterTable
ALTER TABLE `user` DROP PRIMARY KEY,
    ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE UNIQUE INDEX `User_email_key` ON `User`(`email`);
