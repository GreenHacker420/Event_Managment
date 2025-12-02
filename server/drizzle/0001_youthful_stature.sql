CREATE TABLE `verification` (
	`id` varchar(255) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` varchar(255) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP TABLE `verificationToken`;--> statement-breakpoint
ALTER TABLE `session` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `session` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `account` ADD `accountId` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `account` ADD `providerId` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `account` ADD `accessToken` text;--> statement-breakpoint
ALTER TABLE `account` ADD `refreshToken` text;--> statement-breakpoint
ALTER TABLE `account` ADD `accessTokenExpiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `account` ADD `refreshTokenExpiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `account` ADD `idToken` text;--> statement-breakpoint
ALTER TABLE `account` ADD `password` text;--> statement-breakpoint
ALTER TABLE `account` ADD `createdAt` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `account` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `session` ADD `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `session` ADD `token` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `session` ADD `expiresAt` timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE `session` ADD `ipAddress` varchar(255);--> statement-breakpoint
ALTER TABLE `session` ADD `userAgent` text;--> statement-breakpoint
ALTER TABLE `session` ADD `createdAt` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `session` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `user` ADD `phone` varchar(50);--> statement-breakpoint
ALTER TABLE `user` ADD `location` varchar(255);--> statement-breakpoint
ALTER TABLE `user` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `user` ADD `role` varchar(50);--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_token_unique` UNIQUE(`token`);--> statement-breakpoint
ALTER TABLE `account` DROP COLUMN `type`;--> statement-breakpoint
ALTER TABLE `account` DROP COLUMN `provider`;--> statement-breakpoint
ALTER TABLE `account` DROP COLUMN `providerAccountId`;--> statement-breakpoint
ALTER TABLE `account` DROP COLUMN `refresh_token`;--> statement-breakpoint
ALTER TABLE `account` DROP COLUMN `access_token`;--> statement-breakpoint
ALTER TABLE `account` DROP COLUMN `expires_at`;--> statement-breakpoint
ALTER TABLE `account` DROP COLUMN `token_type`;--> statement-breakpoint
ALTER TABLE `account` DROP COLUMN `id_token`;--> statement-breakpoint
ALTER TABLE `account` DROP COLUMN `session_state`;--> statement-breakpoint
ALTER TABLE `session` DROP COLUMN `sessionToken`;--> statement-breakpoint
ALTER TABLE `session` DROP COLUMN `expires`;