DROP TABLE `admins`;--> statement-breakpoint
DROP TABLE `quiz_questions`;--> statement-breakpoint
ALTER TABLE `payments` DROP INDEX `payments_mercadopagoPaymentId_unique`;--> statement-breakpoint
ALTER TABLE `payments` MODIFY COLUMN `stripePaymentIntentId` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `payments` MODIFY COLUMN `status` enum('pending','succeeded','failed','canceled') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `leads` DROP COLUMN `name`;--> statement-breakpoint
ALTER TABLE `payments` DROP COLUMN `mercadopagoPaymentId`;--> statement-breakpoint
ALTER TABLE `payments` DROP COLUMN `downloadToken`;--> statement-breakpoint
ALTER TABLE `quiz_responses` DROP COLUMN `step11`;--> statement-breakpoint
ALTER TABLE `quiz_responses` DROP COLUMN `step12`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `passwordHash`;