# FutBetter — Football Analytics & Predictions

A full production football media platform: news, match analysis, community
predictions, rankings, and a complete role-based admin/CMS. Built with
Next.js 16 (App Router, Turbopack), Drizzle ORM + PostgreSQL, and NextAuth
(staff email/password + Telegram Login Widget).

This README is the deployment guide — follow it in order the first time
you set the project up.

## 1. What you need before you start

- A GitHub (or GitLab/Bitbucket) account, to hold the repo Vercel deploys from.
- A [Vercel](https://vercel.com) account (the recommended host for this stack).
- A managed Postgres database — [Neon](https://neon.tech) or
  [Supabase](https://supabase.com) both work well and have generous free
  tiers. If you already have a Supabase project, you already have this.
- A Telegram bot for "Login with Telegram", created via
  [@BotFather](https://t.me/BotFather). The spec assumes `@futbetterlogin_bot`,
  but any bot username works as long as it matches your env vars below.

## 2. Environment variables

Copy `.env.example` to `.env.local` for local development, and add the same
keys in Vercel under **Project Settings → Environment Variables** for
production. Never commit `.env.local` — it's already in `.gitignore`.

| Variable | What it is | Notes |
|---|---|---|
| `DATABASE_URL` | Postgres connection string | From Neon/Supabase. Must include `sslmode=require` (or the pooled connection string Supabase gives you). |
| `AUTH_SECRET` | Random secret for NextAuth | Generate with `openssl rand -base64 32`. Different per environment. |
| `NEXTAUTH_URL` | Public URL of the site | `http://localhost:3000` locally, `https://futbetter.com` in production. |
| `TELEGRAM_BOT_TOKEN` | Bot token from BotFather | **Server-side only, never exposed to the browser.** |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | Bot username (no `@`) | Public — used to render the Telegram Login widget. |
| `SUPER_ADMIN_EMAIL` | Owner admin login email | Used only by the seed script to create the first account. |
| `SUPER_ADMIN_PASSWORD` | Owner admin login password | **Change this from the example value before seeding production.** |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL | Used in SEO metadata, sitemap, JSON-LD, and share links. |

## 3. Database setup

This app uses Drizzle ORM. The schema lives in `src/lib/db/schema.ts` and a
ready-to-run migration is already generated at `drizzle/0000_icy_kat_farrell.sql`.

Run these from a machine/CI environment that can actually reach your
database (this includes your own laptop, or a Vercel deployment — see
note below):

```bash
npm install

# Applies the migration to whatever DATABASE_URL points at
npm run db:migrate

# Seeds: super admin user, default legal pages, sample competitions/teams/
# matches/articles so the site isn't empty on first load
npm run db:seed
```

`npm run db:seed` is safe to re-run — it checks for existing rows (like the
admin user) before inserting, so it won't create duplicates.

> **Note on this delivered codebase:** the sandbox this project was built in
> has no network path to raw Postgres connections, so the migration and seed
> could not be executed here. `npm run build` and `npm run lint` have both
> been verified clean in that sandbox using defensive fallbacks (see
> `src/lib/settings.ts` and `src/app/sitemap.ts`), but you must run
> `db:migrate` and `db:seed` yourself once, from your own machine or from
> Vercel, against your real `DATABASE_URL`.

### Alternative: `db:push`

For quick iteration you can skip migration files entirely and push the
schema directly:

```bash
npm run db:push
```

Use `db:migrate` (not `db:push`) for anything you consider production data,
since it keeps a versioned history in `drizzle/`.

## 4. Telegram bot configuration

1. Message [@BotFather](https://t.me/BotFather) → `/newbot` (or use an
   existing bot) → copy the token into `TELEGRAM_BOT_TOKEN`.
2. Set the bot's username (without `@`) into
   `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`.
3. Still in BotFather: `/setdomain` → select your bot → enter your production
   domain (e.g. `futbetter.com`, no `https://`, no trailing slash). The
   Telegram Login Widget will refuse to render/authenticate on domains that
   aren't registered this way.
4. If you use a Vercel preview URL before the real domain is live, you'll
   need to re-run `/setdomain` for each domain you test the login on (or
   just test Telegram login only on the final production domain).

## 5. Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel: **Add New → Project**, import the repo.
3. Framework preset: Next.js (auto-detected).
4. Add all the environment variables from section 2 under
   **Environment Variables** (set them for Production, Preview, and
   Development as appropriate — at minimum Production).
5. Deploy.
6. After the first successful deploy, run `npm run db:migrate` and
   `npm run db:seed` locally with `DATABASE_URL` pointed at the same
   production database (or run them from a one-off Vercel CLI / GitHub
   Action step — anywhere that has network access to your DB).
7. Visit `/admin/login` and sign in with `SUPER_ADMIN_EMAIL` /
   `SUPER_ADMIN_PASSWORD`.

**Immediately after your first login as Super Admin:** go to
**Admin → Users** and change your password (or create your real personal
admin account and demote/remove the seeded one) — don't leave the site
running on the seed-script default password.

## 6. Uploading real team/competition logos

To avoid shipping this codebase with third-party club crests embedded in
the repository (a trademark/licensing risk for a commercial product), teams
are seeded with placeholder initials badges instead of real logos. The data
model is logo-ready:

1. Go to **Admin → Teams → (a team) → Edit**.
2. Paste a logo image URL into the **Logo URL** field (host the image
   yourself — e.g. upload to Vercel Blob, Cloudinary, S3, or your own CDN —
   or link directly to a source you're licensed to use) and save.
3. The badge switches from initials to the uploaded image automatically
   everywhere that team appears (match cards, match pages, rankings, etc).

Do the same for competition logos and any other league/team artwork you
have rights to use.

## 7. Admin panel — what's in it

Sign in at `/admin/login` (staff-only; separate from the public Telegram
login). Depending on your role you'll see:

- **Dashboard** — KPIs and quick actions.
- **Articles** — full news/analysis CMS: categories, SEO fields, tags,
  cover image, draft/scheduled/published workflow, optional attached
  prediction box.
- **Matches** — create matches, attach editorial predictions, expert
  predictions, H2H notes, form, key players/injuries, watch-link
  providers; mark results to auto-evaluate community predictions; log
  **live match events** (goals, penalties, own goals, red cards, VAR
  calls) — logging a goal instantly updates the scoreboard, flips the
  match to LIVE, and appears as a "⚽ GOAL!" flash and a running match
  timeline on the public site within ~20 seconds (see section 11 below).
- **Teams / Competitions** — manage the team & league database, including
  logo URLs and brand colors.
- **Ads** — the full `AD_SLOT_*` inventory (home/article/match placements),
  enable/disable per slot, upload creative, link URL, impression/click
  tracking.
- **Partners** — generic partner/sponsor records (logo, link, tier).
- **Users** — manage staff roles (`SUPER_ADMIN`, `EDITOR`, `WRITER`,
  `MODERATOR`, `AD_MANAGER`, `ANALYST`) and view community users.
- **Moderation** — comments and reports queue.
- **Pages** — editable legal/info pages (About, Privacy, Terms, Cookies,
  Community Rules, Advertising Policy, Affiliate Disclosure).
- **Settings** — site name, slogan, social links (Telegram/TikTok/
  Instagram/X), contact email, and the editable stats shown on `/advertise`.
- **Audit Log** — a record of staff actions across the admin panel.

The whole admin panel is responsive and usable on mobile (sidebar collapses
to a top bar / drawer below the `md` breakpoint).

## 8. Local development

```bash
npm install
cp .env.example .env.local   # fill in real values
npm run db:migrate
npm run db:seed
npm run dev
```

Then open `http://localhost:3000` for the public site and
`http://localhost:3000/admin/login` for the admin panel.

## 9. Useful scripts

```bash
npm run dev          # start dev server (Turbopack)
npm run build        # production build
npm run start        # run a production build locally
npm run lint         # ESLint
npm run db:generate  # generate a new migration from schema.ts changes
npm run db:migrate   # apply migrations to DATABASE_URL
npm run db:push      # push schema directly (no migration file)
npm run db:studio    # open Drizzle Studio (visual DB browser)
npm run db:seed      # seed super admin, default pages, and sample content
```

## 10. What's built vs. intentionally left for later

**Fully built:** homepage, match pages, news/analysis with CMS, community
voting (one vote per user, locks at kickoff), editorial + expert
predictions, results processing that scores predictions and feeds
rankings, user profiles with prediction stats, team/competition database,
the full Super Admin panel described above (ads, partners, affiliate
tracking tables, roles, audit log), `/advertise` page with editable stats,
comments + moderation + reports data model, SEO (metadata, JSON-LD,
sitemap, robots.txt, canonical URLs), Telegram Login, staff credential
login, mobile-responsive public site and admin, admin-driven live match
events (goals/cards) with a real-time-feeling scoreboard flash and match
timeline on the public site (see section 11).

**Scaffolded in the data model but not yet built as UI:** live public
comment form/thread display on articles and match pages (moderation
backend exists), global search, Telegram notifications, a downloadable
media kit PDF, player-level pages, live-score/football-data API
integration, 2FA. These were flagged in the original spec as things that
can be added incrementally after launch — the schema and admin scaffolding
were built to make each of these additive rather than requiring a rework.

## 11. Live goals, without a live-data subscription

FutBetter doesn't yet pull scores from a football-data API (see section 10),
so live updates are admin-driven and lightweight by design:

- In **Admin → Matches → (a match) → Live Match Events**, log a goal (team,
  minute, scorer). This updates the match's score, flips its status to
  `LIVE` if needed, and records the event.
- The public site (home page, match cards, and the match detail page) polls
  for fresh data roughly every 20 seconds *only while a page is showing a
  LIVE match* (see `src/components/LiveRefresher.tsx`) — no websockets or
  extra infrastructure required.
- When a new goal event arrives, the scoreline flashes green and a
  "⚽ GOAL! Team 67'" toast appears briefly (`src/components/LiveScore.tsx`),
  and the match page shows a full minute-by-minute timeline.
- This is intentionally swappable: if you later integrate a live-scores API
  (section 10), you'd feed the same `matchEvents` table / `addMatchEvent`
  action from a webhook or polling job instead of a human, and everything
  downstream keeps working unchanged.

## 12. Security notes

- No secrets are hardcoded anywhere in the codebase — everything sensitive
  comes from environment variables.
- Staff passwords are hashed with bcrypt before storage; nothing plaintext
  ever touches the database.
- The Telegram Login callback verifies Telegram's HMAC-SHA256 signature
  server-side (`src/lib/telegram.ts`) and rejects auth payloads older than
  24 hours, per Telegram's own recommended practice.
- `/admin/*` (other than `/admin/login`) is gated by `src/proxy.ts`, which
  requires a valid staff session before any admin route or server action
  runs.
- Rotate `AUTH_SECRET`, `TELEGRAM_BOT_TOKEN`, and `SUPER_ADMIN_PASSWORD` if
  they were ever shared over chat/email during setup.
