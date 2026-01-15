CREATE TABLE `room_players` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`name` text NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`is_host` integer DEFAULT false NOT NULL,
	`last_seen` integer NOT NULL,
	`is_eliminated` integer DEFAULT false NOT NULL,
	`lives` integer DEFAULT 2 NOT NULL,
	`join_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`language` text DEFAULT 'id' NOT NULL,
	`dictionary_language` text DEFAULT 'id' NOT NULL,
	`timer_enabled` integer DEFAULT false NOT NULL,
	`timer_duration` integer DEFAULT 30 NOT NULL,
	`turn_deadline` integer,
	`current_player_index` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`winner_id` text,
	`status` text DEFAULT 'waiting' NOT NULL,
	`game_history` text DEFAULT '[]' NOT NULL,
	`used_words` text DEFAULT '[]' NOT NULL,
	`retry_votes` text DEFAULT '[]' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
