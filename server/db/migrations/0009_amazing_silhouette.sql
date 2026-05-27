DROP INDEX IF EXISTS `widget_configs_ctx_type_uniq`;--> statement-breakpoint
ALTER TABLE `widget_configs` ADD `label` text;--> statement-breakpoint
ALTER TABLE `habits` ADD `weekday` text;