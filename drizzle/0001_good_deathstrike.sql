CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`whatsapp` varchar(20) NOT NULL,
	`email` varchar(320) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`step1` text,
	`step2` text,
	`step3` text,
	`step4` text,
	`step5` text,
	`step6` text,
	`step7` text,
	`step8` text,
	`step9` text,
	`step10` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quiz_responses_id` PRIMARY KEY(`id`)
);
