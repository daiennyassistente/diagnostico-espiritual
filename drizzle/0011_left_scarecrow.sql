CREATE TABLE `admins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(255) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`email` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admins_id` PRIMARY KEY(`id`),
	CONSTRAINT `admins_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `quiz_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`step` int NOT NULL,
	`question` text NOT NULL,
	`options` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quiz_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `payments` MODIFY COLUMN `stripePaymentIntentId` varchar(255);--> statement-breakpoint
ALTER TABLE `payments` MODIFY COLUMN `status` enum('pending','succeeded','failed','canceled','approved') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `leads` ADD `name` varchar(255);--> statement-breakpoint
ALTER TABLE `payments` ADD `mercadopagoPaymentId` varchar(255);--> statement-breakpoint
ALTER TABLE `payments` ADD `downloadToken` varchar(255);--> statement-breakpoint
ALTER TABLE `quiz_responses` ADD `step11` text;--> statement-breakpoint
ALTER TABLE `quiz_responses` ADD `step12` text;--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_mercadopagoPaymentId_unique` UNIQUE(`mercadopagoPaymentId`);