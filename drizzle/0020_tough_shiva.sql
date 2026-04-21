CREATE TABLE `devotional_deliveries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transactionId` varchar(255) NOT NULL,
	`paymentId` int NOT NULL,
	`leadId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`productName` text NOT NULL,
	`status` enum('pending','sent','failed','cancelled') NOT NULL DEFAULT 'pending',
	`sentAt` timestamp,
	`failureReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `devotional_deliveries_id` PRIMARY KEY(`id`),
	CONSTRAINT `devotional_deliveries_transactionId_unique` UNIQUE(`transactionId`)
);
