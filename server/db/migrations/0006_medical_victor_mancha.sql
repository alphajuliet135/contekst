CREATE TABLE `todo_lists` (
	`id` text PRIMARY KEY NOT NULL,
	`context_id` text NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (current_timestamp),
	FOREIGN KEY (`context_id`) REFERENCES `contexts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `todos` ADD `list_id` text REFERENCES todo_lists(id);