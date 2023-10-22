/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Board_id_key` ON `board`;

-- CreateTable
CREATE TABLE `UserImage` (
    `url` VARCHAR(100) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `u_id` INTEGER NOT NULL,

    UNIQUE INDEX `UserImage_u_id_key`(`u_id`),
    PRIMARY KEY (`url`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_email_key` ON `User`(`email`);

-- AddForeignKey
ALTER TABLE `UserImage` ADD CONSTRAINT `UserImage_u_id_fkey` FOREIGN KEY (`u_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
