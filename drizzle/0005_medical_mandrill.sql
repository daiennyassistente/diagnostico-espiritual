CREATE TABLE `quiz_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`step` int NOT NULL,
	`question` text NOT NULL,
	`options` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quiz_questions_id` PRIMARY KEY(`id`)
);
