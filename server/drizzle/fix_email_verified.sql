-- Alter emailVerified column from timestamp to boolean
ALTER TABLE `user` MODIFY COLUMN `emailVerified` BOOLEAN DEFAULT FALSE;
