// Default copy for the editable legal / info pages. Used to seed the
// database and as a fallback if a page hasn't been created yet.

export interface DefaultPage {
  slug: string;
  title: string;
  seoDescription: string;
  contentMarkdown: string;
}

export const DEFAULT_PAGES: DefaultPage[] = [
  {
    slug: "about",
    title: "About FutBetter",
    seoDescription: "FutBetter is a football media platform combining news, analysis, predictions and community voting.",
    contentMarkdown: `FutBetter is a football analytics, news and predictions platform built for fans who want more than just the score.

We combine breaking football news, in-depth tactical analysis, data-informed match predictions and a live community voting system so you can see what thousands of other fans think before kick-off.

## What we do

- **News** — breaking transfers, club news and national team updates across every major league.
- **Analysis** — tactical previews, form guides, head-to-head records and key player breakdowns.
- **Predictions** — FutBetter's own editorial prediction for every major match, alongside expert picks where available.
- **Community Voting** — cast your prediction on any match and see how the FutBetter community is leaning.
- **Rankings** — track your own prediction accuracy and climb the leaderboard.

## Our principle

FutBetter is built around football audience, quality content and genuine community engagement first. Commercial partnerships — advertising, sponsorships and affiliate campaigns — are layered on top of that foundation, never the other way around.

Got feedback or a partnership enquiry? Reach us at the contact details below.`,
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    seoDescription: "How FutBetter collects, uses and protects your data.",
    contentMarkdown: `_Last updated: ${new Date().toISOString().slice(0, 10)}_

FutBetter ("we", "us") respects your privacy. This policy explains what data we collect and how we use it.

## Information we collect

- **Account data**: when you log in with Telegram, we store your Telegram ID, display name, username and profile photo.
- **Activity data**: votes, predictions, comments and pages you view, used to calculate your prediction accuracy and personalize your experience.
- **Technical data**: IP address (hashed where used for analytics), device type, browser and general location (country/region), used for analytics and fraud/abuse prevention.

## How we use your information

To operate your account, calculate rankings, secure the platform against abuse, measure traffic for our advertising and sponsorship partners, and improve the product.

## Sharing

We do not sell your personal data. Aggregated, non-identifying statistics may be shared with advertising and sponsorship partners.

## Your rights

You may request access to or deletion of your data at any time by contacting us.

## Contact

Questions about this policy can be sent to our contact email listed on the Contact page.`,
  },
  {
    slug: "terms",
    title: "Terms of Use",
    seoDescription: "The terms and conditions for using FutBetter.",
    contentMarkdown: `By using FutBetter you agree to the following terms.

## 1. The service

FutBetter provides football news, analysis, predictions and a community voting feature. Predictions — whether from FutBetter's editorial team, experts, or the community — are opinions and statistical estimates only. They are **not guarantees** of any match outcome.

## 2. Accounts

You are responsible for your account and any activity on it. One account per person; do not attempt to manipulate voting or rankings with multiple accounts.

## 3. Community conduct

See our Community Rules for acceptable behaviour when commenting or voting.

## 4. No financial advice

Nothing on FutBetter constitutes betting, financial or investment advice. Any third-party partner referenced on the site operates independently and under its own terms — see our Affiliate Disclosure.

## 5. Changes

We may update these terms from time to time; continued use of FutBetter after a change constitutes acceptance.`,
  },
  {
    slug: "cookies",
    title: "Cookie Policy",
    seoDescription: "How FutBetter uses cookies and similar technologies.",
    contentMarkdown: `FutBetter uses cookies and similar technologies to keep you signed in, remember your preferences, and measure site traffic.

## Types of cookies we use

- **Essential** — required for login sessions and security.
- **Analytics** — help us understand how the site is used so we can improve it.
- **Advertising** — may be used by our advertising and sponsorship partners to measure campaign performance.

You can control cookies through your browser settings. Disabling essential cookies may prevent you from logging in or voting.`,
  },
  {
    slug: "community-rules",
    title: "Community Rules",
    seoDescription: "Guidelines for voting and commenting on FutBetter.",
    contentMarkdown: `To keep FutBetter's community useful and welcoming, please follow these rules:

1. **Be respectful.** No harassment, hate speech, or personal attacks.
2. **No spam or manipulation.** Do not create multiple accounts to inflate votes or rankings.
3. **Stay on topic.** Keep comments relevant to the match or article.
4. **No abusive links.** Do not post malicious, unauthorized or unrelated promotional links.
5. **Report, don't retaliate.** Use the report feature for content that breaks these rules.

Violations may result in comment removal, voting restrictions, or an account ban at our moderators' discretion.`,
  },
  {
    slug: "advertising-policy",
    title: "Advertising Policy",
    seoDescription: "How advertising and sponsored content works on FutBetter.",
    contentMarkdown: `FutBetter offers advertising, sponsorships and partner placements across the site. This policy explains how commercial content is handled.

## Editorial independence

Our news and analysis coverage is produced independently of any advertiser or sponsor. Sponsorship of a match, section, or placement does not influence our editorial prediction or analysis.

## Disclosure

Sponsored articles, "Match of the Day presented by" placements, and partner banners are clearly labelled as advertising or sponsored content.

## Standards

We do not accept advertising that is misleading, uses guaranteed-win or risk-free language, or targets a region where such advertising is not legally permitted.

For advertising enquiries, visit our [Advertise](/advertise) page.`,
  },
  {
    slug: "affiliate-disclosure",
    title: "Affiliate Disclosure",
    seoDescription: "FutBetter's disclosure on affiliate and partner links.",
    contentMarkdown: `Some links on FutBetter are affiliate or partner links. If you click through and register or take an action with a partner, FutBetter may receive a commission at no extra cost to you.

## What this means for you

- Affiliate relationships never influence our football news, analysis, or predictions.
- Partner placements are clearly labelled.
- We link only to partners' official, authorized pages.
- We do not use misleading language such as "guaranteed win," "risk-free," or "100% success."

If a partner offer is not available in your region, it will not be shown, or will be clearly marked as unavailable.

Please gamble responsibly. If you are concerned about your gambling habits, resources are available through your local responsible-gambling organization.`,
  },
];
