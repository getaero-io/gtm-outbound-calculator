# GTM Outbound Calculator - Comprehensive Update Plan

## Updates Requested

### 1. Provider Additions

**Contact Sourcing:**
- ✅ Apollo (existing)
- ⚫ Apify LinkedIn Scraping (new)

**Email Finding:**
- ✅ LeadMagic (existing)
- ⚫ Prospeo (new)
- ⚫ FindyMail (new)
- ⚫ Icypeas (new)

**Email Verification:**
- ✅ LeadMagic (existing)
- ⚫ ZeroBounce (new)

**Enrichment:**
- ⚫ CRUSTdata (new)
- ⚫ People Data Labs (new)

**Email Sending:**
- ✅ Instantly (existing)
- ✅ Smartlead (existing)
- ✅ Icypeas (existing - REMOVE, this is email finding, not sending)

### 2. Infrastructure Cost Fixes
- Change from 2.5 inboxes/domain to 3 inboxes/domain
- Move monthly inbox costs from setup_costs to monthly_recurring

### 3. Enrichment Pricing
- Make enrichment costs editable (custom dollar values)
- Support phone finding, job change detection, etc.

### 4. New Features
- Add headcount/SDR cost input
- Add industry efficiency metrics display (cost per meeting benchmarks)

### 5. Conversion Rate Updates
- Update with 2026 benchmarks from research

---

## New Provider Pricing Data

### Contact Sourcing

**Apify**
```typescript
{
  id: 'apify',
  name: 'Apify',
  category: 'contact_sourcing',
  website_url: 'https://apify.com',
  pricing_url: 'https://apify.com/pricing',
  tiers: [
    { name: 'Free', monthly_cost: 0, credits: 0, features: ['$5 platform credits (auto-renews)'], is_lowest_tier: true },
    { name: 'Starter', monthly_cost: 39, credits: 0, features: ['$0.30/compute unit'], is_lowest_tier: false },
    { name: 'Scale', monthly_cost: 199, credits: 0, features: ['$0.25/compute unit'], is_lowest_tier: false },
  ],
  cost_per_unit: {
    contact_search: 0.003, // $3 per 1,000 LinkedIn profiles (no cookies)
  },
  notes: ['Actor-specific pricing', 'LinkedIn Profile Scraper: $3/1K profiles', 'Company Employees: $4-8/1K'],
  last_updated: '2026-02-07',
}
```

### Email Finding

**Prospeo**
```typescript
{
  id: 'prospeo',
  name: 'Prospeo',
  category: 'email_finding',
  website_url: 'https://prospeo.io',
  pricing_url: 'https://prospeo.io/pricing',
  tiers: [
    { name: 'Free', monthly_cost: 0, credits: 100, features: ['100 credits/month'], is_lowest_tier: true },
    { name: 'Starter', monthly_cost: 39, credits: 1000, features: ['1,000 credits'], is_lowest_tier: false },
    { name: 'Growth', monthly_cost: 99, credits: 5000, features: ['5,000 credits'], is_lowest_tier: false },
    { name: 'Pro', monthly_cost: 199, credits: 20000, features: ['20,000 credits'], is_lowest_tier: false },
  ],
  cost_per_unit: {
    email_find: 0.039, // Starter tier
    email_verify: 0.0195, // 0.5 credit if valid
  },
  notes: ['1 credit per email found', '0.5 credit for domain verifications if VALID', 'No rollover'],
  last_updated: '2026-02-07',
}
```

**FindyMail**
```typescript
{
  id: 'findymail',
  name: 'FindyMail',
  category: 'email_finding',
  website_url: 'https://www.findymail.com',
  pricing_url: 'https://www.findymail.com/pricing',
  tiers: [
    { name: 'Free Trial', monthly_cost: 0, credits: 10, features: ['10 finder + 10 verifications'], is_lowest_tier: true },
    { name: 'Basic', monthly_cost: 49, credits: 1000, features: ['1,000 credits', 'Rollover up to 2×'], is_lowest_tier: false },
    { name: 'Starter', monthly_cost: 99, credits: 5000, features: ['5,000 credits', 'Rollover up to 10K'], is_lowest_tier: false },
  ],
  cost_per_unit: {
    email_find: 0.049, // Basic tier
    phone_find: 0.49, // 10 credits per phone
  },
  notes: ['1 credit per email', '10 credits per phone', 'Credits rollover up to 2× plan limit'],
  last_updated: '2026-02-07',
}
```

**Icypeas**
```typescript
{
  id: 'icypeas',
  name: 'Icypeas',
  category: 'email_finding',
  website_url: 'https://www.icypeas.com',
  pricing_url: 'https://www.icypeas.com/pricing',
  tiers: [
    { name: 'Free', monthly_cost: 0, credits: 50, features: ['50 free credits'], is_lowest_tier: true },
    { name: 'Basic', monthly_cost: 19, credits: 1000, features: ['1,000 credits/month'], is_lowest_tier: false },
    { name: 'Premium', monthly_cost: 39, credits: 4000, features: ['4,000 credits/month'], is_lowest_tier: false },
    { name: 'Advanced', monthly_cost: 89, credits: 10000, features: ['10,000 credits/month'], is_lowest_tier: false },
  ],
  cost_per_unit: {
    email_find: 0.019, // Basic tier
  },
  notes: ['1 credit per email', 'Unlimited rollover', 'Annual plans 20% off'],
  last_updated: '2026-02-07',
}
```

### Email Verification

**ZeroBounce**
```typescript
{
  id: 'zerobounce',
  name: 'ZeroBounce',
  category: 'email_verification',
  website_url: 'https://www.zerobounce.net',
  pricing_url: 'https://www.zerobounce.net/email-validation-pricing',
  tiers: [
    { name: 'Free', monthly_cost: 0, credits: 100, features: ['100 monthly verifications'], is_lowest_tier: true },
    { name: 'Pay As You Go', monthly_cost: 0, credits: 2000, features: ['$20 minimum', 'Credits never expire'], is_lowest_tier: false },
    { name: 'ZeroBounce ONE', monthly_cost: 99, credits: 25000, features: ['25K verifications + 10K scores'], is_lowest_tier: false },
  ],
  cost_per_unit: {
    email_verify: 0.01, // 2,000 credit tier
  },
  notes: ['No charge for duplicates/unknown', 'Credits never expire (PAYG)', '1 credit per verification'],
  last_updated: '2026-02-07',
}
```

### Enrichment

**CRUSTdata**
```typescript
{
  id: 'crustdata',
  name: 'CRUSTdata',
  category: 'contact_sourcing', // Also enrichment
  website_url: 'https://crustdata.com',
  pricing_url: 'https://crustdata.com/pricing',
  tiers: [
    { name: 'Free', monthly_cost: 0, credits: 0, features: ['Limited features'], is_lowest_tier: true },
    { name: 'Paid', monthly_cost: 95, credits: 0, features: ['Additional searches'], is_lowest_tier: false },
  ],
  cost_per_unit: {
    contact_search: 0.03, // 3 credits per 100 results (PersonDB)
    contact_export: 0.03, // Person enrichment: 3 credits
    company_search: 0.01, // 1 credit per 100 results (CompanyDB)
  },
  notes: ['From integration: 3 credits/profile, 1 credit/company', 'Real-time: 5 credits', 'Email lookup: 2 credits'],
  last_updated: '2026-02-07',
  integration_credits: [
    { operation: 'person_enrichment', credits: 3, notes: 'Database enrichment' },
    { operation: 'company_enrichment', credits: 1, notes: 'Database enrichment' },
    { operation: 'persondb_search', credits: 3, notes: 'Per 100 results' },
    { operation: 'companydb_search', credits: 1, notes: 'Per 100 results' },
  ],
}
```

**People Data Labs**
```typescript
{
  id: 'peopledatalabs',
  name: 'People Data Labs',
  category: 'contact_sourcing', // Also enrichment
  website_url: 'https://www.peopledatalabs.com',
  pricing_url: 'https://www.peopledatalabs.com/pricing/person',
  tiers: [
    { name: 'Free', monthly_cost: 0, credits: 100, features: ['100 monthly records'], is_lowest_tier: true },
    { name: 'Pro', monthly_cost: 98, credits: 350, features: ['350 person + 1K company'], is_lowest_tier: false },
    { name: 'Pro Annual', monthly_cost: 78, credits: 350, features: ['20% discount', 'Credit rollover'], is_lowest_tier: false },
  ],
  cost_per_unit: {
    contact_export: 0.28, // $0.20-0.28 per credit (mid-range)
    contact_search: 0.50, // Person Identify API
  },
  notes: ['From integration: 5 credits per operation', '$0.20-0.28/credit for enrichment', '$0.40-0.55 for Identify API'],
  last_updated: '2026-02-07',
  integration_credits: [
    { operation: 'person_enrichment', credits: 5, notes: 'Standard operations' },
    { operation: 'company_enrichment', credits: 5 },
    { operation: 'autocomplete', credits: 0, notes: 'Free operations' },
  ],
}
```

---

## Updated Conversion Rates (2026 Benchmarks)

From research:

```typescript
export const conversionRates: ConversionRate[] = [
  {
    id: 'meeting_set_rate',
    name: 'Meeting Set Rate',
    rate: 0.20, // Keep existing 20%
    min: 0.15,
    max: 0.30,
    source: 'Industry benchmark 2026',
    adjustable: true,
    description: 'Percentage of qualified replies that convert to booked meetings',
  },
  {
    id: 'qualified_reply_rate',
    name: 'Qualified Reply Rate',
    rate: 0.50, // Keep existing 50%
    min: 0.30,
    max: 0.70,
    source: 'GTM community data',
    adjustable: true,
    description: 'Percentage of replies that are qualified prospects',
  },
  {
    id: 'reply_rate',
    name: 'Reply Rate',
    rate: 0.05, // Keep existing 5% (matches research 5-6%)
    min: 0.01,
    max: 0.10,
    source: 'Cold outreach benchmark 2026: 5-6% average, 10% excellent',
    adjustable: true,
    description: 'Percentage of delivered emails that receive a response',
  },
  {
    id: 'deliverability_rate',
    name: 'Email Deliverability Rate',
    rate: 0.85, // Keep existing 85%
    min: 0.70,
    max: 0.95,
    source: 'Industry standard',
    adjustable: true,
    description: 'Percentage of sent emails that reach the inbox',
  },
  {
    id: 'email_find_rate',
    name: 'Email Find Success Rate',
    rate: 0.50, // Keep existing 50%
    min: 0.30,
    max: 0.80,
    source: 'Provider average',
    adjustable: true,
    description: 'Percentage of contacts with valid email found',
  },
  {
    id: 'post_enrichment_valid_rate',
    name: 'Post-Enrichment Valid Rate',
    rate: 0.85, // Update from community: "15% bounce rate" = 85% valid
    min: 0.70,
    max: 0.95,
    source: 'GTM community: 15% typical bounce rate',
    adjustable: true,
    description: 'Percentage of enriched contacts that remain valid',
  },
];
```

---

## Infrastructure Cost Updates

**Current (WRONG):**
- 2.5 inboxes per domain
- Inbox costs in setup_costs

**New (CORRECT):**
- 3 inboxes per domain
- Inbox costs in monthly_recurring
- Formula: `Math.ceil(emails_to_send / emails_per_domain_per_month) = domains_needed`
- Then: `domains_needed * 3 = inboxes_needed`

---

## Headcount/SDR Costs

Add new input section:

```typescript
interface HeadcountInput {
  sdr_count?: number;
  sdr_monthly_cost?: number; // Default $7,500-13,000/month per SDR (for 2 reps)
  include_headcount_in_total?: boolean; // Default false
}
```

**Benchmarks to display:**
- Outbound SDR: 12-15 qualified meetings/month (solid), 18-20 (top)
- Cost per meeting (outsourced): $150-$500
- Cost per meeting (in-house): Calculate from SDR costs + tool costs

---

## New Enrichment Fields

```typescript
interface EnrichmentConfig {
  id: string;
  name: string;
  provider_id: string;
  operation: string;
  cost_per_unit: number; // NOW EDITABLE
  unit_type: 'contact' | 'email' | 'phone' | 'company';
  apply_to_percentage: number;
  enabled: boolean;
}
```

**Pre-built enrichment options:**
- Phone finding (LeadMagic: $0.12, FindyMail: $0.49)
- Job change detection (LeadMagic: $0.072 - 3 credits)
- Company enrichment (CRUSTdata: 1 credit, Apollo: $0.05)

---

## Implementation Tasks

### Task 1: Update provider-pricing.ts
- Add all new providers with accurate tiers
- Update existing provider costs if needed
- Remove Icypeas from email_sending

### Task 2: Update calculator.ts
- Fix infrastructure calculation (3 inboxes/domain)
- Move inbox costs to monthly_recurring
- Support custom enrichment costs

### Task 3: Update types.ts
- Add headcount fields to CalculatorInput
- Make enrichment cost_per_unit editable

### Task 4: Update conversion-rates.ts
- Update post_enrichment_valid_rate source

### Task 5: Update page.tsx
- Add provider dropdowns for new providers
- Add headcount input section
- Make enrichment cost editable
- Add industry benchmarks display
- Show cost per meeting vs. industry benchmarks

### Task 6: Test & Deploy
- Verify all calculations
- Test with different provider combinations
- Deploy to Vercel
