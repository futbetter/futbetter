import "dotenv/config";
import bcrypt from "bcryptjs";
import { db, pool } from "../src/lib/db";
import {
  users,
  competitions,
  teams,
  matches,
  articles,
  watchProviders,
  adSlots,
  partners,
  siteSettings,
  pages,
} from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import { toSlug, matchSlug } from "../src/lib/utils";
import { DEFAULT_PAGES } from "../src/lib/default-pages";

async function main() {
  console.log("🌱 Seeding FutBetter database...");

  // ---------- Super Admin ----------
  const adminEmail = (process.env.SUPER_ADMIN_EMAIL || "futbetterofficial@gmail.com").toLowerCase();
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || "change-this-immediately-123!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const [existingAdmin] = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
  if (!existingAdmin) {
    await db.insert(users).values({
      name: "FutBetter Admin",
      username: "futbetter_admin",
      email: adminEmail,
      passwordHash,
      role: "SUPER_ADMIN",
    });
    console.log(`✔ Created super admin: ${adminEmail}`);
  } else {
    console.log(`• Super admin already exists: ${adminEmail}`);
  }

  // ---------- Site settings ----------
  await db
    .insert(siteSettings)
    .values({
      id: 1,
      monthlyUsers: 42000,
      monthlyPageViews: 310000,
      telegramAudience: 8600,
      socialReach: 21000,
    })
    .onConflictDoNothing({ target: siteSettings.id });
  console.log("✔ Site settings ready");

  // ---------- Default legal / info pages ----------
  for (const p of DEFAULT_PAGES) {
    await db
      .insert(pages)
      .values({ slug: p.slug, title: p.title, contentMarkdown: p.contentMarkdown, seoDescription: p.seoDescription })
      .onConflictDoNothing({ target: pages.slug });
  }
  console.log(`✔ Seeded ${DEFAULT_PAGES.length} default pages`);

  // ---------- Competitions ----------
  const competitionData = [
    { name: "Premier League", country: "England", type: "league" },
    { name: "La Liga", country: "Spain", type: "league" },
    { name: "Serie A", country: "Italy", type: "league" },
    { name: "Bundesliga", country: "Germany", type: "league" },
    { name: "Ligue 1", country: "France", type: "league" },
    { name: "UEFA Champions League", country: "Europe", type: "cup" },
  ];

  const competitionIds: Record<string, string> = {};
  for (const c of competitionData) {
    const slug = toSlug(c.name);
    const [existing] = await db.select().from(competitions).where(eq(competitions.slug, slug)).limit(1);
    if (existing) {
      competitionIds[c.name] = existing.id;
      continue;
    }
    const [created] = await db.insert(competitions).values({ ...c, slug }).returning();
    competitionIds[c.name] = created.id;
  }
  console.log(`✔ Seeded ${competitionData.length} competitions`);

  // ---------- Teams ----------
  // No official crest artwork is bundled (see README) — logoUrl is left null so
  // the site renders a clean colour badge with initials until real,
  // properly-licensed logos are uploaded from the admin panel.
  const teamData = [
    { name: "Real Madrid", shortName: "Real Madrid", country: "Spain", competition: "La Liga", color: "#febe10" },
    { name: "Barcelona", shortName: "Barça", country: "Spain", competition: "La Liga", color: "#a50044" },
    { name: "Manchester City", shortName: "Man City", country: "England", competition: "Premier League", color: "#6cabdd" },
    { name: "Liverpool", shortName: "Liverpool", country: "England", competition: "Premier League", color: "#c8102e" },
    { name: "Arsenal", shortName: "Arsenal", country: "England", competition: "Premier League", color: "#ef0107" },
    { name: "Manchester United", shortName: "Man Utd", country: "England", competition: "Premier League", color: "#da291c" },
    { name: "Chelsea", shortName: "Chelsea", country: "England", competition: "Premier League", color: "#034694" },
    { name: "Tottenham Hotspur", shortName: "Spurs", country: "England", competition: "Premier League", color: "#132257" },
    { name: "Bayern Munich", shortName: "Bayern", country: "Germany", competition: "Bundesliga", color: "#dc052d" },
    { name: "Borussia Dortmund", shortName: "Dortmund", country: "Germany", competition: "Bundesliga", color: "#fde100" },
    { name: "Juventus", shortName: "Juventus", country: "Italy", competition: "Serie A", color: "#000000" },
    { name: "Inter Milan", shortName: "Inter", country: "Italy", competition: "Serie A", color: "#010e80" },
    { name: "AC Milan", shortName: "Milan", country: "Italy", competition: "Serie A", color: "#fb090b" },
    { name: "Paris Saint-Germain", shortName: "PSG", country: "France", competition: "Ligue 1", color: "#004170" },
  ];

  const teamIds: Record<string, string> = {};
  for (const t of teamData) {
    const slug = toSlug(t.name);
    const [existing] = await db.select().from(teams).where(eq(teams.slug, slug)).limit(1);
    if (existing) {
      teamIds[t.name] = existing.id;
      continue;
    }
    const [created] = await db
      .insert(teams)
      .values({
        name: t.name,
        shortName: t.shortName,
        slug,
        country: t.country,
        primaryColor: t.color,
        secondaryColor: "#111111",
        competitionId: competitionIds[t.competition],
      })
      .returning();
    teamIds[t.name] = created.id;
  }
  console.log(`✔ Seeded ${teamData.length} teams`);

  // ---------- Matches ----------
  const now = Date.now();
  const hours = (n: number) => new Date(now + n * 3600 * 1000);
  const daysAgo = (n: number) => new Date(now - n * 86400 * 1000);

  async function upsertMatch(opts: {
    home: string;
    away: string;
    competition: string;
    kickoffAt: Date;
    venue?: string;
    featured?: boolean;
    isMatchOfTheDay?: boolean;
    status?: "SCHEDULED" | "FINISHED";
    homeScore?: number;
    awayScore?: number;
    prediction?: {
      winner: "HOME" | "DRAW" | "AWAY";
      confidence: number;
      scoreHome: number;
      scoreAway: number;
      reasoning: string;
      keyFactors: string[];
    };
    homeForm?: string;
    awayForm?: string;
    preview?: string;
  }) {
    const slug = matchSlug(opts.home, opts.away, opts.kickoffAt);
    const [existing] = await db.select().from(matches).where(eq(matches.slug, slug)).limit(1);
    if (existing) return existing.id;

    const [created] = await db
      .insert(matches)
      .values({
        slug,
        competitionId: competitionIds[opts.competition],
        homeTeamId: teamIds[opts.home],
        awayTeamId: teamIds[opts.away],
        kickoffAt: opts.kickoffAt,
        venue: opts.venue,
        status: opts.status ?? "SCHEDULED",
        featured: opts.featured ?? false,
        isMatchOfTheDay: opts.isMatchOfTheDay ?? false,
        homeScore: opts.homeScore,
        awayScore: opts.awayScore,
        votingLocked: opts.status === "FINISHED",
        preview: opts.preview,
        homeForm: opts.homeForm,
        awayForm: opts.awayForm,
        predictionWinner: opts.prediction?.winner,
        predictionConfidence: opts.prediction?.confidence,
        predictionScoreHome: opts.prediction?.scoreHome,
        predictionScoreAway: opts.prediction?.scoreAway,
        predictionReasoning: opts.prediction?.reasoning,
        predictionKeyFactors: opts.prediction?.keyFactors,
      })
      .returning();
    return created.id;
  }

  const featuredMatchId = await upsertMatch({
    home: "Real Madrid",
    away: "Barcelona",
    competition: "La Liga",
    kickoffAt: hours(30),
    venue: "Santiago Bernabéu",
    featured: true,
    isMatchOfTheDay: true,
    homeForm: "WWDWW",
    awayForm: "WLWWD",
    preview:
      "El Clásico returns with both sides fighting for top spot. Real Madrid's home form has been imperious, while Barcelona arrive full of attacking confidence after a dominant run.",
    prediction: {
      winner: "HOME",
      confidence: 62,
      scoreHome: 2,
      scoreAway: 1,
      reasoning: "Real Madrid's strong home record and Barcelona's recent defensive frailties on the road give the hosts the edge in a tight, high-scoring Clásico.",
      keyFactors: [
        "Real Madrid unbeaten at home in their last 12 La Liga matches",
        "Barcelona have conceded first in 4 of their last 5 away games",
        "Historic head-to-head is closely balanced",
      ],
    },
  });

  await upsertMatch({
    home: "Manchester City",
    away: "Liverpool",
    competition: "Premier League",
    kickoffAt: hours(6),
    venue: "Etihad Stadium",
    homeForm: "WWWDL",
    awayForm: "WWWWD",
    preview: "A potential title-decider between two of the Premier League's form teams.",
    prediction: { winner: "DRAW", confidence: 41, scoreHome: 1, scoreAway: 1, reasoning: "Two evenly matched sides — expect a cagey, tactical affair.", keyFactors: ["Both teams unbeaten in their last 6", "City missing a key defender through injury"] },
  });

  await upsertMatch({
    home: "Arsenal",
    away: "Chelsea",
    competition: "Premier League",
    kickoffAt: hours(52),
    venue: "Emirates Stadium",
    homeForm: "WDWWW",
    awayForm: "WWLWD",
    preview: "North vs West London bragging rights are on the line as Arsenal look to close the gap at the top.",
    prediction: { winner: "HOME", confidence: 68, scoreHome: 2, scoreAway: 1, reasoning: "Arsenal's attacking form at home and Chelsea's inconsistent away defending point to a narrow home win.", keyFactors: ["Arsenal have won 5 of the last 6 meetings at home", "Chelsea's press has been vulnerable to counter-attacks"] },
  });

  await upsertMatch({
    home: "Bayern Munich",
    away: "Borussia Dortmund",
    competition: "Bundesliga",
    kickoffAt: hours(78),
    venue: "Allianz Arena",
    homeForm: "WWWWW",
    awayForm: "WDWLW",
  });

  await upsertMatch({
    home: "Inter Milan",
    away: "AC Milan",
    competition: "Serie A",
    kickoffAt: hours(100),
    venue: "San Siro",
  });

  await upsertMatch({
    home: "Paris Saint-Germain",
    away: "Juventus",
    competition: "UEFA Champions League",
    kickoffAt: hours(126),
    venue: "Parc des Princes",
  });

  // finished matches for the Results page
  await upsertMatch({
    home: "Manchester United",
    away: "Tottenham Hotspur",
    competition: "Premier League",
    kickoffAt: daysAgo(3),
    status: "FINISHED",
    homeScore: 2,
    awayScore: 2,
  });

  await upsertMatch({
    home: "Juventus",
    away: "Inter Milan",
    competition: "Serie A",
    kickoffAt: daysAgo(6),
    status: "FINISHED",
    homeScore: 1,
    awayScore: 3,
  });

  console.log("✔ Seeded matches");

  if (featuredMatchId) {
    await db
      .insert(watchProviders)
      .values([
        {
          matchId: featuredMatchId,
          providerName: "Official Broadcaster",
          url: "https://example.com/watch/clasico",
          region: "Global",
          description: "Official authorized broadcast partner",
        },
        {
          matchId: featuredMatchId,
          providerName: "FutBetter Streaming Partner",
          url: "https://example.com/stream/clasico",
          region: "UK & Ireland",
        },
      ])
      .onConflictDoNothing();
    console.log("✔ Seeded watch providers for the featured match");
  }

  // ---------- Sample articles ----------
  const [adminUser] = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);

  const articleData = [
    {
      type: "NEWS" as const,
      title: "Real Madrid confirm fitness boost ahead of El Clásico",
      subtitle: "Manager confident of a strong lineup for the weekend showdown",
      category: "Breaking News",
      content:
        "Real Madrid have received a timely fitness boost ahead of their high-stakes clash with Barcelona this weekend.\n\nSeveral key players returned to full training this week, giving the coaching staff a full squad to choose from for one of the biggest fixtures of the season.\n\n## What it means\n\nWith both sides chasing top spot, a fully fit squad could prove decisive in a match that regularly produces moments of magic.",
      tags: ["Real Madrid", "El Clasico", "La Liga"],
      relatedMatchId: featuredMatchId,
      showPredictionBox: true,
    },
    {
      type: "NEWS" as const,
      title: "Premier League transfer roundup: latest rumours and confirmed deals",
      subtitle: "Everything you need to know from the January window",
      category: "Transfers",
      content:
        "The January transfer window continues to produce headlines across the Premier League.\n\nSeveral clubs are reportedly closing in on deals as they look to strengthen their squads for the run-in.\n\nWe'll keep this roundup updated as more news breaks.",
      tags: ["Transfers", "Premier League"],
    },
    {
      type: "ANALYSIS" as const,
      title: "Arsenal vs Chelsea: Tactical breakdown and FutBetter prediction",
      subtitle: "How the Gunners' pressing structure could unlock a nervy Chelsea backline",
      category: "Premier League",
      content:
        "Arsenal's high press has been a defining feature of their recent form, and this weekend's visit from Chelsea presents an interesting tactical puzzle.\n\n## Key battle: Arsenal's press vs Chelsea's build-up\n\nChelsea have struggled to progress the ball cleanly under sustained pressure this season, a trend Arsenal will look to exploit early.\n\n## FutBetter's Verdict\n\nExpect Arsenal to control large spells of possession, with Chelsea relying on transitions to create their best chances.",
      tags: ["Arsenal", "Chelsea", "Tactics"],
    },
  ];

  for (const a of articleData) {
    const slug = toSlug(a.title);
    const [existing] = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
    if (existing) continue;
    await db.insert(articles).values({
      slug,
      type: a.type,
      title: a.title,
      subtitle: a.subtitle,
      contentMarkdown: a.content,
      category: a.category,
      tags: a.tags,
      status: "PUBLISHED",
      publishAt: new Date(),
      authorId: adminUser?.id,
      relatedMatchId: a.relatedMatchId,
      showPredictionBox: a.showPredictionBox ?? false,
    });
  }
  console.log(`✔ Seeded ${articleData.length} articles`);

  // ---------- Ad slots ----------
  const adSlotCodes = [
    "AD_HOME_TOP",
    "AD_HOME_MIDDLE",
    "AD_HOME_SIDEBAR",
    "AD_ARTICLE_TOP",
    "AD_ARTICLE_MIDDLE",
    "AD_ARTICLE_BOTTOM",
    "AD_MATCH_TOP",
    "AD_MATCH_SIDEBAR",
    "AD_MATCH_BOTTOM",
    "AD_MOBILE_STICKY",
    "AD_FOOTER",
  ];
  for (const code of adSlotCodes) {
    await db
      .insert(adSlots)
      .values({ code, name: code.replace(/_/g, " "), enabled: false, format: "banner" })
      .onConflictDoNothing({ target: adSlots.code });
  }
  console.log(`✔ Seeded ${adSlotCodes.length} ad slot placeholders (disabled by default)`);

  // ---------- Example partner (disabled) ----------
  await db
    .insert(partners)
    .values({
      name: "Example Partner",
      description: "Sample partner record — edit or delete this from the admin panel.",
      ctaText: "Visit Partner",
      referralUrl: "https://example.com",
      country: "Global",
      placement: "sidebar",
      packageTier: "BASIC",
      active: false,
    })
    .onConflictDoNothing();
  console.log("✔ Seeded example partner (inactive)");

  console.log("\n✅ Seed complete.");
  console.log(`\nAdmin login → ${adminEmail} / (the SUPER_ADMIN_PASSWORD you set in .env)`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
