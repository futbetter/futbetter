CREATE TYPE "public"."article_status" AS ENUM('DRAFT', 'SCHEDULED', 'PUBLISHED', 'UNPUBLISHED');--> statement-breakpoint
CREATE TYPE "public"."article_type" AS ENUM('NEWS', 'ANALYSIS');--> statement-breakpoint
CREATE TYPE "public"."comment_status" AS ENUM('PENDING', 'APPROVED', 'HIDDEN', 'DELETED');--> statement-breakpoint
CREATE TYPE "public"."comment_target" AS ENUM('ARTICLE', 'MATCH');--> statement-breakpoint
CREATE TYPE "public"."match_status" AS ENUM('SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."outcome" AS ENUM('HOME', 'DRAW', 'AWAY');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('OPEN', 'RESOLVED', 'DISMISSED');--> statement-breakpoint
CREATE TYPE "public"."report_target" AS ENUM('COMMENT', 'ARTICLE', 'MATCH', 'LINK', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('SUPER_ADMIN', 'EDITOR', 'WRITER', 'MODERATOR', 'AD_MANAGER', 'ANALYST', 'USER');--> statement-breakpoint
CREATE TABLE "ad_slots" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"format" text DEFAULT 'banner' NOT NULL,
	"desktop_image_url" text,
	"mobile_image_url" text,
	"html" text,
	"url" text,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"impressions" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ad_slots_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "affiliate_campaigns" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"partner_id" text,
	"tracking_url" text NOT NULL,
	"campaign_code" text NOT NULL,
	"placement" text DEFAULT 'homepage' NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"unique_clicks" integer DEFAULT 0 NOT NULL,
	"registrations" integer DEFAULT 0 NOT NULL,
	"conversions" integer DEFAULT 0 NOT NULL,
	"revenue" double precision DEFAULT 0 NOT NULL,
	"country" text DEFAULT 'Global' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "affiliate_campaigns_campaign_code_unique" UNIQUE("campaign_code")
);
--> statement-breakpoint
CREATE TABLE "affiliate_clicks" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" text NOT NULL,
	"ip_hash" text,
	"country" text,
	"device" text,
	"traffic_source" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"type" "article_type" DEFAULT 'NEWS' NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"cover_image" text,
	"content_markdown" text NOT NULL,
	"author_id" text,
	"category" text DEFAULT 'Breaking News' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"status" "article_status" DEFAULT 'DRAFT' NOT NULL,
	"publish_at" timestamp with time zone,
	"related_match_id" text,
	"related_team_id" text,
	"related_competition_id" text,
	"seo_title" text,
	"seo_description" text,
	"social_image" text,
	"show_prediction_box" boolean DEFAULT false NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" text,
	"admin_name" text,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_type" "comment_target" NOT NULL,
	"target_id" text NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"status" "comment_status" DEFAULT 'APPROVED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competitions" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"country" text,
	"type" text DEFAULT 'league' NOT NULL,
	"season" text,
	"logo_url" text,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "competitions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"competition_id" text,
	"home_team_id" text NOT NULL,
	"away_team_id" text NOT NULL,
	"kickoff_at" timestamp with time zone NOT NULL,
	"venue" text,
	"status" "match_status" DEFAULT 'SCHEDULED' NOT NULL,
	"home_score" integer,
	"away_score" integer,
	"featured" boolean DEFAULT false NOT NULL,
	"preview" text,
	"home_form" text,
	"away_form" text,
	"h2h_notes" text,
	"key_players" jsonb,
	"injuries" jsonb,
	"expected_lineups" jsonb,
	"prediction_winner" "outcome",
	"prediction_confidence" integer,
	"prediction_score_home" integer,
	"prediction_score_away" integer,
	"prediction_reasoning" text,
	"prediction_full_analysis" text,
	"prediction_key_factors" jsonb,
	"prediction_correct" boolean,
	"expert_name" text,
	"expert_winner" "outcome",
	"expert_confidence" integer,
	"expert_score_home" integer,
	"expert_score_away" integer,
	"voting_locked" boolean DEFAULT false NOT NULL,
	"sponsor_partner_id" text,
	"is_match_of_the_day" boolean DEFAULT false NOT NULL,
	"comments_enabled" boolean DEFAULT true NOT NULL,
	"voting_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "matches_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"content_markdown" text NOT NULL,
	"seo_description" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"logo" text,
	"description" text,
	"cta_text" text DEFAULT 'Learn more' NOT NULL,
	"referral_url" text NOT NULL,
	"tracking_url" text,
	"campaign_id" text,
	"country" text DEFAULT 'Global' NOT NULL,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"placement" text DEFAULT 'sidebar' NOT NULL,
	"package_tier" text DEFAULT 'BASIC' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prediction_outcomes" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" text NOT NULL,
	"user_id" text NOT NULL,
	"choice" "outcome" NOT NULL,
	"correct" boolean NOT NULL,
	"evaluated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_type" "report_target" NOT NULL,
	"target_id" text NOT NULL,
	"reporter_id" text,
	"reason" text NOT NULL,
	"status" "report_status" DEFAULT 'OPEN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"site_name" text DEFAULT 'FutBetter' NOT NULL,
	"slogan" text DEFAULT 'Football. Analysis. Predictions.' NOT NULL,
	"hero_text" text DEFAULT 'Better Football Insights.' NOT NULL,
	"contact_email" text DEFAULT 'futbetterofficial@gmail.com' NOT NULL,
	"social_telegram" text DEFAULT 'https://t.me/futbetter_official' NOT NULL,
	"social_tiktok" text DEFAULT 'https://www.tiktok.com/@futbetter_official' NOT NULL,
	"social_instagram" text DEFAULT 'https://www.instagram.com/futbetter_official' NOT NULL,
	"social_x" text DEFAULT 'https://x.com/futbetter_off' NOT NULL,
	"telegram_bot_username" text DEFAULT 'futbetterlogin_bot' NOT NULL,
	"monthly_users" integer DEFAULT 0 NOT NULL,
	"monthly_page_views" integer DEFAULT 0 NOT NULL,
	"telegram_audience" integer DEFAULT 0 NOT NULL,
	"social_reach" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"short_name" text,
	"slug" text NOT NULL,
	"country" text,
	"logo_url" text,
	"primary_color" text DEFAULT '#22c55e' NOT NULL,
	"secondary_color" text DEFAULT '#111111' NOT NULL,
	"competition_id" text,
	"founded_year" integer,
	"description" text,
	"website" text,
	"social_links" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "teams_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"username" text,
	"email" text,
	"password_hash" text,
	"image" text,
	"role" "role" DEFAULT 'USER' NOT NULL,
	"telegram_id" text,
	"telegram_username" text,
	"banned" boolean DEFAULT false NOT NULL,
	"ban_reason" text,
	"favorite_team_id" text,
	"total_predictions" integer DEFAULT 0 NOT NULL,
	"correct_predictions" integer DEFAULT 0 NOT NULL,
	"incorrect_predictions" integer DEFAULT 0 NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"best_streak" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_telegram_id_unique" UNIQUE("telegram_id")
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" text NOT NULL,
	"user_id" text NOT NULL,
	"choice" "outcome" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "watch_providers" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" text NOT NULL,
	"provider_name" text NOT NULL,
	"logo_url" text,
	"url" text NOT NULL,
	"region" text DEFAULT 'Global' NOT NULL,
	"start_time" timestamp with time zone,
	"status" text DEFAULT 'active' NOT NULL,
	"description" text
);
--> statement-breakpoint
ALTER TABLE "affiliate_campaigns" ADD CONSTRAINT "affiliate_campaigns_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_clicks" ADD CONSTRAINT "affiliate_clicks_campaign_id_affiliate_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."affiliate_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_related_match_id_matches_id_fk" FOREIGN KEY ("related_match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_related_team_id_teams_id_fk" FOREIGN KEY ("related_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_related_competition_id_competitions_id_fk" FOREIGN KEY ("related_competition_id") REFERENCES "public"."competitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_home_team_id_teams_id_fk" FOREIGN KEY ("home_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_away_team_id_teams_id_fk" FOREIGN KEY ("away_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prediction_outcomes" ADD CONSTRAINT "prediction_outcomes_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prediction_outcomes" ADD CONSTRAINT "prediction_outcomes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_providers" ADD CONSTRAINT "watch_providers_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "articles_type_status_idx" ON "articles" USING btree ("type","status");--> statement-breakpoint
CREATE INDEX "articles_publish_idx" ON "articles" USING btree ("publish_at");--> statement-breakpoint
CREATE INDEX "matches_kickoff_idx" ON "matches" USING btree ("kickoff_at");--> statement-breakpoint
CREATE INDEX "matches_status_idx" ON "matches" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "prediction_outcomes_match_user_unique" ON "prediction_outcomes" USING btree ("match_id","user_id");--> statement-breakpoint
CREATE INDEX "prediction_outcomes_user_idx" ON "prediction_outcomes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE UNIQUE INDEX "votes_match_user_unique" ON "votes" USING btree ("match_id","user_id");