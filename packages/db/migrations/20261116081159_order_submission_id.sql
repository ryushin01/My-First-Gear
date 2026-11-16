ALTER TABLE "orders" ADD COLUMN "submission_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_submission_id_unique" UNIQUE("submission_id");