CREATE TABLE `quiz_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`eventName` enum('QuizStarted','QuizCompleted','QuizAbandoned') NOT NULL,
	`eventId` varchar(255) NOT NULL,
	`userEmail` varchar(320),
	`userPhone` varchar(20),
	`profileName` varchar(255),
	`currentStep` int,
	`totalSteps` int,
	`reason` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quiz_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `quiz_events_eventId_unique` UNIQUE(`eventId`)
);
