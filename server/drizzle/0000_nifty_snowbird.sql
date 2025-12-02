CREATE TABLE `account` (
	`id` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`type` varchar(255) NOT NULL,
	`provider` varchar(255) NOT NULL,
	`providerAccountId` varchar(255) NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` int,
	`token_type` varchar(255),
	`scope` varchar(255),
	`id_token` text,
	`session_state` varchar(255),
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `activity` (
	`id` varchar(255) NOT NULL,
	`eventId` varchar(255) NOT NULL,
	`userId` varchar(255),
	`type` enum('task_created','task_completed','task_updated','expense_added','expense_approved','member_added','channel_created','event_updated') NOT NULL,
	`description` text,
	`metadata` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `activity_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `channel` (
	`id` varchar(255) NOT NULL,
	`eventId` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(50),
	`color` varchar(50),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `channel_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `event_member` (
	`id` varchar(255) NOT NULL,
	`eventId` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`role` enum('organizer','team_lead','member','viewer') DEFAULT 'member',
	`channelId` varchar(255),
	`joinedAt` timestamp DEFAULT (now()),
	CONSTRAINT `event_member_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `event` (
	`id` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`date` datetime NOT NULL,
	`location` varchar(255),
	`budget` decimal(10,2),
	`category` varchar(50),
	`type` varchar(50),
	`status` enum('active','archived','draft') DEFAULT 'active',
	`guestCount` int,
	`organizerId` varchar(255) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `event_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expense` (
	`id` varchar(255) NOT NULL,
	`eventId` varchar(255) NOT NULL,
	`channelId` varchar(255),
	`amount` decimal(10,2) NOT NULL,
	`description` varchar(255) NOT NULL,
	`category` varchar(100),
	`status` enum('pending','approved','rejected') DEFAULT 'pending',
	`date` datetime,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `expense_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `message` (
	`id` varchar(255) NOT NULL,
	`eventId` varchar(255) NOT NULL,
	`channelId` varchar(255),
	`userId` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `message_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`sessionToken` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `session_sessionToken` PRIMARY KEY(`sessionToken`)
);
--> statement-breakpoint
CREATE TABLE `subgroup` (
	`id` varchar(255) NOT NULL,
	`channelId` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`members` int DEFAULT 1,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `subgroup_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `task` (
	`id` varchar(255) NOT NULL,
	`eventId` varchar(255) NOT NULL,
	`channelId` varchar(255),
	`assigneeId` varchar(255),
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('todo','in_progress','review','done') DEFAULT 'todo',
	`priority` enum('low','medium','high','urgent') DEFAULT 'medium',
	`dueDate` datetime,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `task_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255),
	`email` varchar(255),
	`emailVerified` timestamp(3),
	`image` varchar(255),
	`password` varchar(255),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verificationToken` (
	`id` varchar(255) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `verificationToken_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `activity` ADD CONSTRAINT `activity_eventId_event_id_fk` FOREIGN KEY (`eventId`) REFERENCES `event`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `activity` ADD CONSTRAINT `activity_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `channel` ADD CONSTRAINT `channel_eventId_event_id_fk` FOREIGN KEY (`eventId`) REFERENCES `event`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `event_member` ADD CONSTRAINT `event_member_eventId_event_id_fk` FOREIGN KEY (`eventId`) REFERENCES `event`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `event_member` ADD CONSTRAINT `event_member_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `event_member` ADD CONSTRAINT `event_member_channelId_channel_id_fk` FOREIGN KEY (`channelId`) REFERENCES `channel`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `event` ADD CONSTRAINT `event_organizerId_user_id_fk` FOREIGN KEY (`organizerId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `expense` ADD CONSTRAINT `expense_eventId_event_id_fk` FOREIGN KEY (`eventId`) REFERENCES `event`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `expense` ADD CONSTRAINT `expense_channelId_channel_id_fk` FOREIGN KEY (`channelId`) REFERENCES `channel`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `message` ADD CONSTRAINT `message_eventId_event_id_fk` FOREIGN KEY (`eventId`) REFERENCES `event`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `message` ADD CONSTRAINT `message_channelId_channel_id_fk` FOREIGN KEY (`channelId`) REFERENCES `channel`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `message` ADD CONSTRAINT `message_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subgroup` ADD CONSTRAINT `subgroup_channelId_channel_id_fk` FOREIGN KEY (`channelId`) REFERENCES `channel`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `task` ADD CONSTRAINT `task_eventId_event_id_fk` FOREIGN KEY (`eventId`) REFERENCES `event`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `task` ADD CONSTRAINT `task_channelId_channel_id_fk` FOREIGN KEY (`channelId`) REFERENCES `channel`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `task` ADD CONSTRAINT `task_assigneeId_user_id_fk` FOREIGN KEY (`assigneeId`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;