CREATE TYPE "public"."match_event_team" AS ENUM('HOME', 'AWAY');--> statement-breakpoint
CREATE TYPE "public"."match_event_type" AS ENUM('GOAL', 'PENALTY_GOAL', 'OWN_GOAL', 'RED_CARD', 'VAR');--> statement-breakpoint
CREATE TABLE "match_events" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" text NOT NULL,
	"type" "match_event_type" DEFAULT 'GOAL' NOT NULL,
	"team" "match_event_team" NOT NULL,
	"minute" integer NOT NULL,
	"scorer_name" text,
	"home_score_after" integer NOT NULL,
	"away_score_after" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "match_events_match_idx" ON "match_events" USING btree ("match_id","created_at");