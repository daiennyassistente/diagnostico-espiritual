ALTER TABLE `payments` MODIFY COLUMN `stripePaymentIntentId` varchar(255);--> statement-breakpoint
ALTER TABLE `payments` MODIFY COLUMN `status` enum('pending','succeeded','failed','canceled','approved') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `payments` ADD `mercadopagoPaymentId` varchar(255);--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_mercadopagoPaymentId_unique` UNIQUE(`mercadopagoPaymentId`);