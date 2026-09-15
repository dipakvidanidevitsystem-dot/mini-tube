ALTER TABLE `minitube_videos` ADD `processing_status` enum('pending','ready','failed') DEFAULT 'ready' NOT NULL;--> statement-breakpoint
ALTER TABLE `minitube_videos` ADD `processing_error` text;