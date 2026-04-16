CREATE TABLE `buyers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`paymentId` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`amount` int NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'brl',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `buyers_id` PRIMARY KEY(`id`),
	CONSTRAINT `buyers_paymentId_unique` UNIQUE(`paymentId`)
);
