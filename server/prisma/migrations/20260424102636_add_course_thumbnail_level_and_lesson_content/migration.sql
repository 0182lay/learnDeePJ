-- AlterTable
ALTER TABLE `courses` ADD COLUMN `level` VARCHAR(191) NULL,
    ADD COLUMN `thumbnail_url` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `lessons` ADD COLUMN `content` TEXT NULL;
