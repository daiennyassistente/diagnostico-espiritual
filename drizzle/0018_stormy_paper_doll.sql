ALTER TABLE `quiz_responses` ADD `quizId` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `quiz_responses` ADD `paid` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `quiz_responses` ADD `emailSent` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `quiz_responses` ADD CONSTRAINT `quiz_responses_quizId_unique` UNIQUE(`quizId`);