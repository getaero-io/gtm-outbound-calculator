This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## New Features

### Waterfall Enrichment (Feb 2026)

Configure sequential provider fallback to maximize data coverage:

- **Visual Waterfall Builder:** Drag-and-drop interface for creating enrichment sequences
- **Cost vs Coverage Analysis:** Compare waterfall vs single-provider strategies
- **Real-time Metrics:** See total coverage, cost per find, and step-by-step breakdown
- **Preset Configurations:** Start with proven waterfall patterns (Max Coverage, Cost-Optimized, etc.)
- **Support for All Categories:** Email finding, phone finding, email verification

**Example:** Apollo (65%) → Hunter (50% of remaining) → Prospeo (40% of remaining) = 89.5% total coverage

See [docs/WATERFALL_ENRICHMENT.md](./docs/WATERFALL_ENRICHMENT.md) for complete guide.

### Infrastructure Optimization (Feb 2026)

Industry-standard email warming and domain cycling:

- **4 Presets:** Conservative (20/day), Standard (30/day), Aggressive (50/day), Maximum (70/day)
- **Cost Savings:** 70% reduction vs old conservative settings
- **2026 Benchmarks:** Based on Instantly, Smartlead, MailForge, SuperSend research
- **Real-time Warnings:** Alerts when exceeding safe sending limits

### 27 Provider Integrations

- **Contact Sourcing:** Apollo, People Data Labs, Apify, CRUSTdata
- **Email Finding:** LeadMagic, Icypeas, Prospeo, FindyMail, Hunter, Dropcontact, Snov.io
- **Email Verification:** LeadMagic, Icypeas, ZeroBounce, NeverBounce, MillionVerifier
- **Email Sending:** Instantly, Smartlead, Lemlist
- **Phone Finding:** LeadMagic, BetterContact, Lusha, Cognism, RocketReach

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
