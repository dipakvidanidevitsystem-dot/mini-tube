CREATE TABLE `minitube_video_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`video_id` int NOT NULL,
	`user_id` int,
	`viewed_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `minitube_video_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `minitube_video_views` ADD CONSTRAINT `minitube_video_views_video_id_minitube_videos_id_fk` FOREIGN KEY (`video_id`) REFERENCES `minitube_videos`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `minitube_video_views` ADD CONSTRAINT `minitube_video_views_user_id_minitube_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `minitube_users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `minitube_video_views_video_viewed_at_idx` ON `minitube_video_views` (`video_id`,`viewed_at`);