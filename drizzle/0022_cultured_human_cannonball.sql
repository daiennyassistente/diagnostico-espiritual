CREATE TABLE `transaction_control` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transactionId` varchar(255) NOT NULL,
	`quizId` varchar(36) NOT NULL,
	`leadId` int NOT NULL,
	`status` enum('pending','approved','failed','cancelled') NOT NULL DEFAULT 'pending',
	`processed` int NOT NULL DEFAULT 0,
	`emailSent` int NOT NULL DEFAULT 0,
	`productReleased` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transaction_control_id` PRIMARY KEY(`id`),
	CONSTRAINT `transaction_control_transactionId_unique` UNIQUE(`transactionId`)
);
