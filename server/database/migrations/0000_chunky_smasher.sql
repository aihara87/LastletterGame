CREATE TABLE `words` (
	`id` text PRIMARY KEY NOT NULL,
	`word` text NOT NULL,
	`category` text,
	`language` text DEFAULT 'id' NOT NULL,
	`created_at` integer NOT NULL
);
