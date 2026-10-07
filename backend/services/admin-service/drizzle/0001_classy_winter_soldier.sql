CREATE TABLE `minitube_comment_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`comment_id` int NOT NULL,
	`user_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `minitube_comment_likes_id` PRIMARY KEY(`id`),
	CONSTRAINT `minitube_comment_likes_comment_user_unique` UNIQUE(`comment_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `minitube_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`video_id` int NOT NULL,
	`reporter_id` int NOT NULL,
	`reason` text NOT NULL,
	`status` enum('pending','reviewed') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `minitube_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `minitube_saved_videos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`video_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `minitube_saved_videos_id` PRIMARY KEY(`id`),
	CONSTRAINT `minitube_saved_videos_user_video_unique` UNIQUE(`user_id`,`video_id`)
);
--> statement-breakpoint
CREATE TABLE `minitube_watch_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`video_id` int NOT NULL,
	`watched_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `minitube_watch_history_id` PRIMARY KEY(`id`),
	CONSTRAINT `minitube_watch_history_user_video_unique` UNIQUE(`user_id`,`video_id`)
);
--> statement-breakpoint
ALTER TABLE `minitube_comments` ADD `parent_id` int;--> statement-breakpoint
ALTER TABLE `minitube_users` ADD `role` enum('user','admin') DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE `minitube_users` ADD `disabled` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `minitube_videos` ADD `visibility` enum('public','private') DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE `minitube_comment_likes` ADD CONSTRAINT `minitube_comment_likes_comment_id_minitube_comments_id_fk` FOREIGN KEY (`comment_id`) REFERENCES `minitube_comments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `minitube_comment_likes` ADD CONSTRAINT `minitube_comment_likes_user_id_minitube_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `minitube_users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `minitube_reports` ADD CONSTRAINT `minitube_reports_video_id_minitube_videos_id_fk` FOREIGN KEY (`video_id`) REFERENCES `minitube_videos`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `minitube_reports` ADD CONSTRAINT `minitube_reports_reporter_id_minitube_users_id_fk` FOREIGN KEY (`reporter_id`) REFERENCES `minitube_users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `minitube_saved_videos` ADD CONSTRAINT `minitube_saved_videos_user_id_minitube_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `minitube_users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `minitube_saved_videos` ADD CONSTRAINT `minitube_saved_videos_video_id_minitube_videos_id_fk` FOREIGN KEY (`video_id`) REFERENCES `minitube_videos`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `minitube_watch_history` ADD CONSTRAINT `minitube_watch_history_user_id_minitube_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `minitube_users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `minitube_watch_history` ADD CONSTRAINT `minitube_watch_history_video_id_minitube_videos_id_fk` FOREIGN KEY (`video_id`) REFERENCES `minitube_videos`(`id`) ON DELETE cascade ON UPDATE no action;