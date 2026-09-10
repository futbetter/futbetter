import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  uniqueIndex,
  index,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ---------- ENUMS ----------
export const roleEnum = pgEnum("role", [
  "SUPER_ADMIN",
  "EDITOR",
  "WRITER",
  "MODERATOR",
  "AD_MANAGER",
  "ANALYST",
  "USER",
]);

export const matchStatusEnum = pgEnum("match_status", [
  "SCHEDULED",
  "LIVE",
  "FINISHED",
  "POSTPONED",
  "CANCELLED",
]);

export const outcomeEnum = pgEnum("outcome", ["HOME", "DRAW", "AWAY"]);

export const matchEventTypeEnum = pgEnum("match_event_type", [
  "GOAL",
  "PENALTY_GOAL",
  "OWN_GOAL",
  "RED_CARD",
  "VAR",
]);

export const matchEventTeamEnum = pgEnum("match_event_team", ["HOME", "AWAY"]);

export const articleTypeEnum = pgEnum("article_type", ["NEWS", "ANALYSIS"]);

export const articleStatusEnum = pgEnum("article_status", [
  "DRAFT",
  "SCHEDULED",
  "PUBLISHED",
  "UNPUBLISHED",
]);

export const commentStatusEnum = pgEnum("comment_status", [
  "PENDING",
  "APPROVED",
  "HIDDEN",
  "DELETED",
]);

export const commentTargetEnum = pgEnum("comment_target", ["ARTICLE", "MATCH"]);

export const reportTargetEnum = pgEnum("report_target", [
  "COMMENT",
  "ARTICLE",
  "MATCH",
  "LINK",
  "OTHER",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "OPEN",
  "RESOLVED",
  "DISMISSED",
]);

// ---------- USERS ----------
export const users = pgTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: text("name"),
    username: text("username").unique(),
    email: text("email").unique(),
    passwordHash: text("password_hash"),
    image: text("image"),
    role: roleEnum("role").notNull().default("USER"),
    telegramId: text("telegram_id").unique(),
    telegramUsername: text("telegram_username"),
    banned: boolean("banned").notNull().default(false),
    banReason: text("ban_reason"),
    favoriteTeamId: text("favorite_team_id"),
    totalPredictions: integer("total_predictions").notNull().default(0),
    correctPredictions: integer("correct_predictions").notNull().default(0),
    incorrectPredictions: integer("incorrect_predictions").notNull().default(0),
    currentStreak: integer("current_streak").notNull().default(0),
    bestStreak: integer("best_streak").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("users_role_idx").on(t.role)]
);

// ---------- COMPETITIONS ----------
export const competitions = pgTable("competitions", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  country: text("country"),
  type: text("type").notNull().default("league"), // league | cup | international
  season: text("season"),
  logoUrl: text("logo_url"),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- TEAMS ----------
export const teams = pgTable("teams", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  shortName: text("short_name"),
  slug: text("slug").notNull().unique(),
  country: text("country"),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").notNull().default("#22c55e"),
  secondaryColor: text("secondary_color").notNull().default("#111111"),
  competitionId: text("competition_id").references(() => competitions.id),
  foundedYear: integer("founded_year"),
  description: text("description"),
  website: text("website"),
  socialLinks: jsonb("social_links").$type<Record<string, string>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- MATCHES ----------
export const matches = pgTable(
  "matches",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()`),
    slug: text("slug").notNull().unique(),
    competitionId: text("competition_id").references(() => competitions.id),
    homeTeamId: text("home_team_id")
      .notNull()
      .references(() => teams.id),
    awayTeamId: text("away_team_id")
      .notNull()
      .references(() => teams.id),
    kickoffAt: timestamp("kickoff_at", { withTimezone: true }).notNull(),
    venue: text("venue"),
    status: matchStatusEnum("status").notNull().default("SCHEDULED"),
    homeScore: integer("home_score"),
    awayScore: integer("away_score"),
    featured: boolean("featured").notNull().default(false),
    preview: text("preview"),
    homeForm: text("home_form"), // e.g. "WWLDW"
    awayForm: text("away_form"),
    h2hNotes: text("h2h_notes"),
    keyPlayers: jsonb("key_players").$type<string[]>(),
    injuries: jsonb("injuries").$type<string[]>(),
    expectedLineups: jsonb("expected_lineups").$type<{ home: string[]; away: string[] }>(),
    // FutBetter editorial prediction
    predictionWinner: outcomeEnum("prediction_winner"),
    predictionConfidence: integer("prediction_confidence"),
    predictionScoreHome: integer("prediction_score_home"),
    predictionScoreAway: integer("prediction_score_away"),
    predictionReasoning: text("prediction_reasoning"),
    predictionFullAnalysis: text("prediction_full_analysis"),
    predictionKeyFactors: jsonb("prediction_key_factors").$type<string[]>(),
    predictionCorrect: boolean("prediction_correct"),
    // expert prediction (optional, single expert for MVP)
    expertName: text("expert_name"),
    expertWinner: outcomeEnum("expert_winner"),
    expertConfidence: integer("expert_confidence"),
    expertScoreHome: integer("expert_score_home"),
    expertScoreAway: integer("expert_score_away"),
    // voting control
    votingLocked: boolean("voting_locked").notNull().default(false),
    // sponsorship
    sponsorPartnerId: text("sponsor_partner_id"),
    isMatchOfTheDay: boolean("is_match_of_the_day").notNull().default(false),
    commentsEnabled: boolean("comments_enabled").notNull().default(true),
    votingEnabled: boolean("voting_enabled").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("matches_kickoff_idx").on(t.kickoffAt),
    index("matches_status_idx").on(t.status),
  ]
);

// ---------- MATCH EVENTS (live goals / cards) ----------
export const matchEvents = pgTable(
  "match_events",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()`),
    matchId: text("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    type: matchEventTypeEnum("type").notNull().default("GOAL"),
    team: matchEventTeamEnum("team").notNull(),
    minute: integer("minute").notNull(),
    scorerName: text("scorer_name"),
    homeScoreAfter: integer("home_score_after").notNull(),
    awayScoreAfter: integer("away_score_after").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("match_events_match_idx").on(t.matchId, t.createdAt)]
);

// ---------- VOTES ----------
export const votes = pgTable(
  "votes",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()`),
    matchId: text("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    choice: outcomeEnum("choice").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("votes_match_user_unique").on(t.matchId, t.userId)]
);

// ---------- PREDICTION OUTCOMES (history / rankings) ----------
export const predictionOutcomes = pgTable(
  "prediction_outcomes",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()`),
    matchId: text("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    choice: outcomeEnum("choice").notNull(),
    correct: boolean("correct").notNull(),
    evaluatedAt: timestamp("evaluated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("prediction_outcomes_match_user_unique").on(t.matchId, t.userId),
    index("prediction_outcomes_user_idx").on(t.userId),
  ]
);

// ---------- WATCH PROVIDERS ----------
export const watchProviders = pgTable("watch_providers", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: text("match_id")
    .notNull()
    .references(() => matches.id, { onDelete: "cascade" }),
  providerName: text("provider_name").notNull(),
  logoUrl: text("logo_url"),
  url: text("url").notNull(),
  region: text("region").notNull().default("Global"),
  startTime: timestamp("start_time", { withTimezone: true }),
  status: text("status").notNull().default("active"), // active | disabled
  description: text("description"),
});

// ---------- ARTICLES (NEWS + ANALYSIS) ----------
export const articles = pgTable(
  "articles",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()`),
    slug: text("slug").notNull().unique(),
    type: articleTypeEnum("type").notNull().default("NEWS"),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    coverImage: text("cover_image"),
    contentMarkdown: text("content_markdown").notNull(),
    authorId: text("author_id").references(() => users.id),
    category: text("category").notNull().default("Breaking News"),
    tags: jsonb("tags").$type<string[]>().default([]),
    status: articleStatusEnum("status").notNull().default("DRAFT"),
    publishAt: timestamp("publish_at", { withTimezone: true }),
    relatedMatchId: text("related_match_id").references(() => matches.id),
    relatedTeamId: text("related_team_id").references(() => teams.id),
    relatedCompetitionId: text("related_competition_id").references(() => competitions.id),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    socialImage: text("social_image"),
    showPredictionBox: boolean("show_prediction_box").notNull().default(false),
    viewCount: integer("view_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("articles_type_status_idx").on(t.type, t.status),
    index("articles_publish_idx").on(t.publishAt),
  ]
);

// ---------- COMMENTS ----------
export const comments = pgTable("comments", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  targetType: commentTargetEnum("target_type").notNull(),
  targetId: text("target_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  status: commentStatusEnum("status").notNull().default("APPROVED"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- REPORTS ----------
export const reports = pgTable("reports", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  targetType: reportTargetEnum("target_type").notNull(),
  targetId: text("target_id").notNull(),
  reporterId: text("reporter_id").references(() => users.id),
  reason: text("reason").notNull(),
  status: reportStatusEnum("status").notNull().default("OPEN"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- ADVERTISING ----------
export const adSlots = pgTable("ad_slots", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(), // AD_HOME_TOP etc
  name: text("name").notNull(),
  enabled: boolean("enabled").notNull().default(false),
  format: text("format").notNull().default("banner"),
  desktopImageUrl: text("desktop_image_url"),
  mobileImageUrl: text("mobile_image_url"),
  html: text("html"),
  url: text("url"),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  impressions: integer("impressions").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- PARTNERS ----------
export const partners = pgTable("partners", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  logo: text("logo"),
  description: text("description"),
  ctaText: text("cta_text").notNull().default("Learn more"),
  referralUrl: text("referral_url").notNull(),
  trackingUrl: text("tracking_url"),
  campaignId: text("campaign_id"),
  country: text("country").notNull().default("Global"),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  placement: text("placement").notNull().default("sidebar"),
  packageTier: text("package_tier").notNull().default("BASIC"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- AFFILIATE CAMPAIGNS ----------
export const affiliateCampaigns = pgTable("affiliate_campaigns", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  partnerId: text("partner_id").references(() => partners.id, { onDelete: "cascade" }),
  trackingUrl: text("tracking_url").notNull(),
  campaignCode: text("campaign_code").notNull().unique(),
  placement: text("placement").notNull().default("homepage"),
  clicks: integer("clicks").notNull().default(0),
  uniqueClicks: integer("unique_clicks").notNull().default(0),
  registrations: integer("registrations").notNull().default(0),
  conversions: integer("conversions").notNull().default(0),
  revenue: doublePrecision("revenue").notNull().default(0),
  country: text("country").notNull().default("Global"),
  active: boolean("active").notNull().default(true),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const affiliateClicks = pgTable("affiliate_clicks", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: text("campaign_id")
    .notNull()
    .references(() => affiliateCampaigns.id, { onDelete: "cascade" }),
  ipHash: text("ip_hash"),
  country: text("country"),
  device: text("device"),
  trafficSource: text("traffic_source"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- SITE SETTINGS (singleton) ----------
export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  siteName: text("site_name").notNull().default("FutBetter"),
  slogan: text("slogan").notNull().default("Football. Analysis. Predictions."),
  heroText: text("hero_text").notNull().default("Better Football Insights."),
  contactEmail: text("contact_email").notNull().default("futbetterofficial@gmail.com"),
  socialTelegram: text("social_telegram").notNull().default("https://t.me/futbetter_official"),
  socialTiktok: text("social_tiktok").notNull().default("https://www.tiktok.com/@futbetter_official"),
  socialInstagram: text("social_instagram").notNull().default("https://www.instagram.com/futbetter_official"),
  socialX: text("social_x").notNull().default("https://x.com/futbetter_off"),
  telegramBotUsername: text("telegram_bot_username").notNull().default("futbetterlogin_bot"),
  monthlyUsers: integer("monthly_users").notNull().default(0),
  monthlyPageViews: integer("monthly_page_views").notNull().default(0),
  telegramAudience: integer("telegram_audience").notNull().default(0),
  socialReach: integer("social_reach").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- STATIC / LEGAL PAGES (editable from Admin) ----------
export const pages = pgTable("pages", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  contentMarkdown: text("content_markdown").notNull(),
  seoDescription: text("seo_description"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- AUDIT LOG ----------
export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: text("admin_id").references(() => users.id),
  adminName: text("admin_name"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  details: jsonb("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- RELATIONS ----------
export const matchesRelations = relations(matches, ({ one, many }) => ({
  homeTeam: one(teams, { fields: [matches.homeTeamId], references: [teams.id] }),
  awayTeam: one(teams, { fields: [matches.awayTeamId], references: [teams.id] }),
  competition: one(competitions, { fields: [matches.competitionId], references: [competitions.id] }),
  votes: many(votes),
  watchProviders: many(watchProviders),
  events: many(matchEvents),
}));

export const matchEventsRelations = relations(matchEvents, ({ one }) => ({
  match: one(matches, { fields: [matchEvents.matchId], references: [matches.id] }),
}));

export const watchProvidersRelations = relations(watchProviders, ({ one }) => ({
  match: one(matches, { fields: [watchProviders.matchId], references: [matches.id] }),
}));

export const teamsRelations = relations(teams, ({ one }) => ({
  competition: one(competitions, { fields: [teams.competitionId], references: [competitions.id] }),
}));

export const articlesRelations = relations(articles, ({ one }) => ({
  author: one(users, { fields: [articles.authorId], references: [users.id] }),
  relatedMatch: one(matches, { fields: [articles.relatedMatchId], references: [matches.id] }),
  relatedTeam: one(teams, { fields: [articles.relatedTeamId], references: [teams.id] }),
  relatedCompetition: one(competitions, {
    fields: [articles.relatedCompetitionId],
    references: [competitions.id],
  }),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  match: one(matches, { fields: [votes.matchId], references: [matches.id] }),
  user: one(users, { fields: [votes.userId], references: [users.id] }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  votes: many(votes),
  outcomes: many(predictionOutcomes),
}));

export const predictionOutcomesRelations = relations(predictionOutcomes, ({ one }) => ({
  match: one(matches, { fields: [predictionOutcomes.matchId], references: [matches.id] }),
  user: one(users, { fields: [predictionOutcomes.userId], references: [users.id] }),
}));

export const competitionsRelations = relations(competitions, ({ many }) => ({
  teams: many(teams),
  matches: many(matches),
}));
