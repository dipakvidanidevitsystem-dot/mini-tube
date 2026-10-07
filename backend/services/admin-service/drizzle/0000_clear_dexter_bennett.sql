CREATE TABLE `minitube_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`video_id` int NOT NULL,
	`user_id` int NOT NULL,
	`comment` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `minitube_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `minitube_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`video_id` int NOT NULL,
	`user_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `minitube_likes_id` PRIMARY KEY(`id`),
	CONSTRAINT `minitube_likes_video_user_unique` UNIQUE(`video_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `minitube_password_resets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`token_hash` varchar(64) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `minitube_password_resets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `minitube_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subscriber_id` int NOT NULL,
	`channel_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `minitube_subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `minitube_subscriptions_subscriber_channel_unique` UNIQUE(`subscriber_id`,`channel_id`)
);
--> statement-breakpoint
CREATE TABLE `minitube_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`profile_image` varchar(500),
	`notify_new_subscriber` boolean NOT NULL DEFAULT true,
	`notify_video_uploaded` boolean NOT NULL DEFAULT true,
	`notify_comment` boolean NOT NULL DEFAULT true,
	`notify_like` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `minitube_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `minitube_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `minitube_videos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`video_url` varchar(500) NOT NULL,
	`thumbnail_url` varchar(500) NOT NULL,
	`category` varchar(100),
	`views` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `minitube_videos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `minitube_comments` ADD CONSTRAINT `minitube_comments_video_id_minitube_videos_id_fk` FOREIGN KEY (`video_id`) REFERENCES `minitube_videos`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `minitube_comments` ADD CONSTRAINT `minitube_comments_user_id_minitube_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `minitube_users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `minitube_likes` ADD CONSTRAINT `minitube_likes_video_id_minitube_videos_id_fk` FOREIGN KEY (`video_id`) REFERENCES `minitube_videos`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `minitube_likes` ADD CONSTRAINT `minitube_likes_user_id_minitube_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `minitube_users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `minitube_password_resets` ADD CONSTRAINT `minitube_password_resets_user_id_minitube_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `minitube_users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `minitube_subscriptions` ADD CONSTRAINT `minitube_subscriptions_subscriber_id_minitube_users_id_fk` FOREIGN KEY (`subscriber_id`) REFERENCES `minitube_users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `minitube_subscriptions` ADD CONSTRAINT `minitube_subscriptions_channel_id_minitube_users_id_fk` FOREIGN KEY (`channel_id`) REFERENCES `minitube_users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `minitube_videos` ADD CONSTRAINT `minitube_videos_user_id_minitube_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `minitube_users`(`id`) ON DELETE cascade ON UPDATE no action;