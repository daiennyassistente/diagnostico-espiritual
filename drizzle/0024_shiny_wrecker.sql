CREATE TABLE `visitors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`visitorId` varchar(36) NOT NULL,
	`eventType` enum('site_entry','quiz_start','lead_created') NOT NULL,
	`leadId` int,
	`email` varchar(320),
	`whatsapp` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `visitors_id` PRIMARY KEY(`id`),
	CONSTRAINT `visitors_visitorId_unique` UNIQUE(`visitorId`)
);
