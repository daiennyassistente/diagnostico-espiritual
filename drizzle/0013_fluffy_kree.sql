ALTER TABLE `payments` ADD `emailStatus` enum('pendente','enviado','falha') DEFAULT 'pendente' NOT NULL;--> statement-breakpoint
ALTER TABLE `payments` ADD `emailSentAt` timestamp;