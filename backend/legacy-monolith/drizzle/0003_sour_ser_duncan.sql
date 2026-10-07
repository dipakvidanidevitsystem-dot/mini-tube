CREATE TABLE `minitube_video_milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`video_id` int NOT NULL,
	`milestone` int NOT NULL,
	`reached_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `minitube_video_milestones_id` PRIMARY KEY(`id`),
	CONSTRAINT `minitube_video_milestones_video_milestone_unique` UNIQUE(`video_id`,`milestone`)
);
--> statement-breakpoint
ALTER TABLE `minitube_video_views` ADD `watched_seconds` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `minitube_video_milestones` ADD CONSTRAINT `minitube_video_milestones_video_id_minitube_videos_id_fk` FOREIGN KEY (`video_id`) REFERENCES `minitube_videos`(`id`) ON DELETE cascade ON UPDATE no action;