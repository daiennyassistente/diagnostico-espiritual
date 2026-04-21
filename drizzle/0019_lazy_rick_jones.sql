ALTER TABLE `leads` ADD `userId` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `leads` ADD CONSTRAINT `leads_userId_unique` UNIQUE(`userId`);