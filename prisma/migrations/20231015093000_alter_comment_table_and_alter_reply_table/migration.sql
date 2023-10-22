-- AlterTable
ALTER TABLE `comment` MODIFY `commenter` VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE `reply` MODIFY `commenter` VARCHAR(20) NOT NULL;
