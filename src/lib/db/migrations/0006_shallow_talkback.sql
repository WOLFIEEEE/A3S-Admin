ALTER TYPE "public"."billing_frequency" ADD VALUE 'daily' BEFORE 'monthly';--> statement-breakpoint
ALTER TYPE "public"."billing_frequency" ADD VALUE 'weekly' BEFORE 'monthly';--> statement-breakpoint
ALTER TYPE "public"."billing_frequency" ADD VALUE 'bi-weekly' BEFORE 'monthly';--> statement-breakpoint
ALTER TYPE "public"."billing_frequency" ADD VALUE 'half-yearly' BEFORE 'yearly';