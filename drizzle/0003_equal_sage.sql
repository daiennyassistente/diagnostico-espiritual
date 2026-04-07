CREATE TABLE `diagnostic_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`profileName` varchar(255) NOT NULL,
	`profileDescription` text NOT NULL,
	`strengths` text NOT NULL,
	`challenges` text NOT NULL,
	`recommendations` text NOT NULL,
	`nextSteps` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `diagnostic_history_id` PRIMARY KEY(`id`)
);
