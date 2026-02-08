# GTM Outbound Calculator - Providers Added (2026-02-07)

## Summary

Added 10 new providers based on GTM user stories analysis from 39,013 community messages across Clay Slack, GTM Cafe, and Pavilion communities.

## Providers Added

### Email Finding (3 providers)

1. **Hunter.io**
   - Category: `email_finding`
   - Pricing: $34-349/mo
   - Free tier: 25 searches, 50 verifications/month
   - Cost per email: $0.068 (Starter)
   - Cost per verification: $0.017
   - Features: 30% discount on annual billing
   - Source: [Hunter.io pricing](https://hunter.io/pricing)

2. **Dropcontact**
   - Category: `email_finding`
   - Pricing: €79-120/mo
   - Free tier: 50 credits
   - Cost per email: €0.79 (estimated)
   - Cost per verification: €0.40
   - Features: 100% GDPR-compliant, 99% email validity, pay on success only
   - Source: [Dropcontact pricing](https://www.dropcontact.com/pricing)

3. **Snov.io**
   - Category: `email_finding`
   - Pricing: $99-189/mo
   - Free tier: 50 credits, 100 recipients
   - Cost per email: $0.0198 (Pro S)
   - Cost per verification: $0.0198
   - Features: Credit rollover, 25% discount on annual
   - Source: [Snov.io pricing](https://snov.io/pricing)

### Phone Finding (5 providers)

4. **BetterContact**
   - Category: `phone_finding`
   - Pricing: $15-799/mo
   - Free tier: 50 credits
   - Cost per email: $0.049 (Pro)
   - Cost per phone: $0.49 (10 credits)
   - Features: Waterfall enrichment (20+ vendors), only charged when valid, no charge for catch-alls
   - Source: [BetterContact pricing](https://bettercontact.rocks/pricing)

5. **Lusha**
   - Category: `phone_finding`
   - Pricing: $29-51/mo
   - Free tier: 70 credits/month
   - Cost per email: $0.06
   - Cost per phone: $0.60 (10 credits)
   - Features: Browser extension, CRM integrations, credits roll over on annual
   - Source: [Lusha pricing](https://www.lusha.com/pricing)

6. **Cognism**
   - Category: `phone_finding`
   - Pricing: $1,375-2,292/mo (annual contracts only)
   - Platform fee: $15K (Platinum) or $25K (Diamond)
   - Cost per contact: $0.055
   - Cost per phone: $0.092 (Diamond verified)
   - Features: 98% accuracy on Diamond phone-verified mobiles, up to 50M contacts on Diamond
   - Source: [Cognism pricing](https://www.cognism.com/pricing)

7. **RocketReach**
   - Category: `phone_finding`
   - Pricing: $69-209/mo
   - Free tier: 5 lookups
   - Cost per email: $0.69 (Essentials)
   - Cost per phone: $0.70 (Pro)
   - Features: Only charged if email/phone found, intent data on Ultimate
   - Source: [RocketReach pricing](https://rocketreach.co/pricing)

### Email Verification (2 providers)

8. **NeverBounce**
   - Category: `email_verification`
   - Pricing: $24/mo (Sync) or Pay-as-you-go
   - Pay-as-you-go: $8/1,000 verifications
   - Cost per verification: $0.008
   - Features: Credits expire in 12 months, auto-sync daily, volume discounts to $0.002/email
   - Source: [NeverBounce pricing](https://www.neverbounce.com/pricing)

9. **MillionVerifier**
   - Category: `email_verification`
   - Pricing: Pay-as-you-go
   - Free tier: 100 verifications
   - Cost per verification: $0.004 ($40/10K)
   - Features: Credits never expire, 99% accuracy guarantee, catch-all detection
   - Source: [MillionVerifier pricing](https://www.millionverifier.com/pricing)

### Email Sending (1 provider)

10. **Lemlist**
    - Category: `email_sending`
    - Pricing: $59-159/mo per seat
    - Features: Unlimited email sending, warmup included, LinkedIn integration (Pro+)
    - Annual discount: 2 months free
    - Source: [Lemlist pricing](https://www.lemlist.com/pricing)

## Total Provider Count

After this update, the calculator now includes:

- **Contact Sourcing**: 4 providers (Apollo, People Data Labs, Apify, CRUSTdata)
- **Email Finding**: 7 providers (LeadMagic, Icypeas, Prospeo, FindyMail, Hunter, Dropcontact, Snov.io)
- **Email Verification**: 5 providers (LeadMagic, Icypeas, ZeroBounce, NeverBounce, MillionVerifier)
- **Email Sending**: 3 providers (Instantly, Smartlead, Lemlist)
- **Phone Finding**: 6 providers (LeadMagic, BetterContact, Lusha, Cognism, RocketReach, + existing)
- **Infrastructure**: 2 providers (Google Workspace, Custom Domain)

**Total: 27 providers** (up from 17)

## GTM User Story Coverage

These providers address the following pain points from the GTM user stories:

1. **US-E1**: Find work emails from LinkedIn URLs ✅
   - Hunter, Dropcontact, Snov.io, FindyMail, Prospeo

2. **US-E2**: Find mobile phone numbers ✅
   - BetterContact (waterfall 20+ vendors), Lusha, Cognism (98% accuracy), RocketReach

3. **US-V1**: Verify email addresses ✅
   - NeverBounce ($0.008/email), MillionVerifier ($0.004/email)

4. **US-V2**: Handle catch-all emails ✅
   - BetterContact (no charge for catch-alls), Dropcontact (advanced catch-all verification)

5. **US-S3**: Push leads to Lemlist ✅
   - Lemlist provider added

6. **US-E6**: Waterfall enrichment ✅
   - BetterContact (20+ vendor waterfall built-in)

## Next Steps

1. ✅ Add providers to provider-pricing.ts
2. ✅ Verify TypeScript compilation
3. ✅ Test dev server
4. ⏳ Deploy to Vercel
5. ⏳ Update documentation with new providers

## Deployment

Ready to deploy to: https://gtm-outbound-calculator.vercel.app

Build status: ✅ Passing (Next.js 16.1.6 with Turbopack)
