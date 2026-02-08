import { Provider, PricingTier } from '@/lib/types';

export const providers: Provider[] = [
  // CONTACT SOURCING
  {
    id: 'apollo',
    name: 'Apollo',
    category: 'contact_sourcing',
    website_url: 'https://www.apollo.io',
    pricing_url: 'https://www.apollo.io/pricing',
    tiers: [
      {
        name: 'Free',
        monthly_cost: 0,
        credits: 10000,
        features: ['10K credits/month', 'Basic search', 'Limited exports'],
        is_lowest_tier: true,
      },
      {
        name: 'Basic',
        monthly_cost: 49,
        credits: 12000,
        features: ['12K credits/month', 'Advanced search', 'CSV export'],
        is_lowest_tier: false,
      },
      {
        name: 'Professional',
        monthly_cost: 99,
        credits: 24000,
        features: ['24K credits/month', 'API access', 'CRM sync'],
        is_lowest_tier: false,
      },
    ],
    cost_per_unit: {
      contact_search: 0.05, // 2 credits * $0.025
      contact_export: 0.05,
    },
    notes: [
      'Free tier: 10K credits/month',
      'Paid plans: $0.025 per credit',
      'All operations cost 2 credits',
    ],
    last_updated: '2026-02-07',
    integration_credits: [
      { operation: 'apollo_enrich_contact', credits: 2 },
      { operation: 'apollo_enrich_company', credits: 2 },
      { operation: 'apollo_people_search', credits: 2 },
      { operation: 'apollo_company_search', credits: 2 },
    ],
  },
  {
    id: 'peopledatalabs',
    name: 'People Data Labs',
    category: 'contact_sourcing',
    website_url: 'https://www.peopledatalabs.com',
    pricing_url: 'https://www.peopledatalabs.com/pricing/person',
    tiers: [
      {
        name: 'Free',
        monthly_cost: 0,
        credits: 100,
        features: ['100 monthly records'],
        is_lowest_tier: true,
      },
      {
        name: 'Pro',
        monthly_cost: 98,
        credits: 350,
        features: ['350 person + 1K company'],
        is_lowest_tier: false,
      },
      {
        name: 'Pro Annual',
        monthly_cost: 78,
        credits: 350,
        features: ['20% discount', 'Credit rollover'],
        is_lowest_tier: false,
      },
    ],
    cost_per_unit: {
      contact_export: 0.28,
      contact_search: 0.5,
    },
    notes: [
      'From integration: 5 credits per operation',
      '$0.20-0.28/credit for enrichment',
      '$0.40-0.55 for Identify API',
    ],
    last_updated: '2026-02-07',
    integration_credits: [
      { operation: 'person_enrichment', credits: 5, notes: 'Standard operations' },
      { operation: 'company_enrichment', credits: 5 },
      { operation: 'autocomplete', credits: 0, notes: 'Free operations' },
    ],
  },
  {
    id: 'apify',
    name: 'Apify',
    category: 'contact_sourcing',
    website_url: 'https://apify.com',
    pricing_url: 'https://apify.com/pricing',
    tiers: [
      {
        name: 'Free',
        monthly_cost: 0,
        credits: 0,
        features: ['$5 platform credits (auto-renews)'],
        is_lowest_tier: true,
      },
      {
        name: 'Starter',
        monthly_cost: 39,
        credits: 0,
        features: ['$0.30/compute unit'],
        is_lowest_tier: false,
      },
      {
        name: 'Scale',
        monthly_cost: 199,
        credits: 0,
        features: ['$0.25/compute unit'],
        is_lowest_tier: false,
      },
    ],
    cost_per_unit: {
      contact_search: 0.003,
    },
    notes: [
      'Actor-specific pricing',
      'LinkedIn Profile Scraper: $3/1K profiles',
      'Company Employees: $4-8/1K',
    ],
    last_updated: '2026-02-07',
  },
  {
    id: 'crustdata',
    name: 'CRUSTdata',
    category: 'contact_sourcing',
    website_url: 'https://crustdata.com',
    pricing_url: 'https://crustdata.com/pricing',
    tiers: [
      {
        name: 'Free',
        monthly_cost: 0,
        credits: 0,
        features: ['Limited features'],
        is_lowest_tier: true,
      },
      {
        name: 'Paid',
        monthly_cost: 95,
        credits: 0,
        features: ['Additional searches'],
        is_lowest_tier: false,
      },
    ],
    cost_per_unit: {
      contact_search: 0.03,
      contact_export: 0.03,
      company_search: 0.01,
    },
    notes: [
      'From integration: 3 credits/profile, 1 credit/company',
      'Real-time: 5 credits',
      'Email lookup: 2 credits',
    ],
    last_updated: '2026-02-07',
    integration_credits: [
      { operation: 'person_enrichment', credits: 3, notes: 'Database enrichment' },
      { operation: 'company_enrichment', credits: 1, notes: 'Database enrichment' },
      { operation: 'persondb_search', credits: 3, notes: 'Per 100 results' },
      { operation: 'companydb_search', credits: 1, notes: 'Per 100 results' },
    ],
  },

  // EMAIL FINDING
  {
    id: 'leadmagic',
    name: 'LeadMagic',
    category: 'email_finding',
    website_url: 'https://leadmagic.io',
    pricing_url: 'https://leadmagic.io/pricing',
    tiers: [
      {
        name: 'Basic',
        monthly_cost: 59.99,
        credits: 2500,
        features: ['Email Finder', 'Validation', 'Mobile Finder', 'API Access'],
        is_lowest_tier: true,
      },
      {
        name: 'Essential',
        monthly_cost: 99.99,
        credits: 10000,
        features: ['Email Finder', 'Validation', 'Mobile Finder', 'API Access'],
        is_lowest_tier: false,
      },
      {
        name: 'Growth',
        monthly_cost: 179.99,
        credits: 20000,
        features: ['Email Finder', 'Validation', 'Mobile Finder', 'API Access'],
        is_lowest_tier: false,
      },
    ],
    cost_per_unit: {
      email_find: 0.024, // 1 credit * $0.024
      email_verify: 0.0012, // (1/20) credit * $0.024
      phone_find: 0.12, // 5 credits * $0.024
    },
    notes: [
      '1 credit per valid email found',
      'No charge for catch-all emails',
      '1 credit per 20 email validations',
      '5 credits per mobile number',
      'Credits roll over monthly',
    ],
    last_updated: '2026-02-07',
    integration_credits: [
      { operation: 'leadmagic_email_finder', credits: 1, notes: 'Conditional: 0 if not found' },
      { operation: 'leadmagic_email_validation', credits: 0.05, notes: '1 credit per 20 validations' },
      { operation: 'leadmagic_mobile_finder', credits: 5, notes: 'Conditional: 0 if not found' },
    ],
  },
  {
    id: 'icypeas',
    name: 'Icypeas',
    category: 'email_finding',
    website_url: 'https://www.icypeas.com',
    pricing_url: 'https://www.icypeas.com/pricing',
    tiers: [
      {
        name: 'Free',
        monthly_cost: 0,
        credits: 50,
        features: ['50 free credits'],
        is_lowest_tier: true,
      },
      {
        name: 'Basic',
        monthly_cost: 19,
        credits: 1000,
        features: ['1,000 credits/month'],
        is_lowest_tier: false,
      },
      {
        name: 'Premium',
        monthly_cost: 39,
        credits: 4000,
        features: ['4,000 credits/month'],
        is_lowest_tier: false,
      },
      {
        name: 'Advanced',
        monthly_cost: 89,
        credits: 10000,
        features: ['10,000 credits/month'],
        is_lowest_tier: false,
      },
    ],
    cost_per_unit: {
      email_find: 0.019,
    },
    notes: ['1 credit per email', 'Unlimited rollover', 'Annual plans 20% off'],
    last_updated: '2026-02-07',
  },
  {
    id: 'prospeo',
    name: 'Prospeo',
    category: 'email_finding',
    website_url: 'https://prospeo.io',
    pricing_url: 'https://prospeo.io/pricing',
    tiers: [
      {
        name: 'Free',
        monthly_cost: 0,
        credits: 100,
        features: ['100 credits/month'],
        is_lowest_tier: true,
      },
      {
        name: 'Starter',
        monthly_cost: 39,
        credits: 1000,
        features: ['1,000 credits'],
        is_lowest_tier: false,
      },
      {
        name: 'Growth',
        monthly_cost: 99,
        credits: 5000,
        features: ['5,000 credits'],
        is_lowest_tier: false,
      },
      {
        name: 'Pro',
        monthly_cost: 199,
        credits: 20000,
        features: ['20,000 credits'],
        is_lowest_tier: false,
      },
    ],
    cost_per_unit: {
      email_find: 0.039,
      email_verify: 0.0195,
    },
    notes: [
      '1 credit per email found',
      '0.5 credit for domain verifications if VALID',
      'No rollover',
    ],
    last_updated: '2026-02-07',
  },
  {
    id: 'findymail',
    name: 'FindyMail',
    category: 'email_finding',
    website_url: 'https://www.findymail.com',
    pricing_url: 'https://www.findymail.com/pricing',
    tiers: [
      {
        name: 'Free Trial',
        monthly_cost: 0,
        credits: 10,
        features: ['10 finder + 10 verifications'],
        is_lowest_tier: true,
      },
      {
        name: 'Basic',
        monthly_cost: 49,
        credits: 1000,
        features: ['1,000 credits', 'Rollover up to 2×'],
        is_lowest_tier: false,
      },
      {
        name: 'Starter',
        monthly_cost: 99,
        credits: 5000,
        features: ['5,000 credits', 'Rollover up to 10K'],
        is_lowest_tier: false,
      },
    ],
    cost_per_unit: {
      email_find: 0.049,
      phone_find: 0.49,
    },
    notes: [
      '1 credit per email',
      '10 credits per phone',
      'Credits rollover up to 2× plan limit',
    ],
    last_updated: '2026-02-07',
  },

  // EMAIL VERIFICATION
  {
    id: 'leadmagic_verify',
    name: 'LeadMagic (Verification)',
    category: 'email_verification',
    website_url: 'https://leadmagic.io',
    pricing_url: 'https://leadmagic.io/pricing',
    tiers: [
      {
        name: 'Basic',
        monthly_cost: 59.99,
        credits: 2500,
        features: ['Email Validation', 'Catch-all verification included'],
        is_lowest_tier: true,
      },
    ],
    cost_per_unit: {
      email_verify: 0.0012, // 1/20 credit * $0.024
    },
    notes: [
      '1 credit per 20 email validations',
      'Catch-all verification included',
    ],
    last_updated: '2026-02-07',
  },
  {
    id: 'icypeas_verify',
    name: 'Icypeas (Verification)',
    category: 'email_verification',
    website_url: 'https://www.icypeas.com',
    pricing_url: 'https://www.icypeas.com/pricing',
    tiers: [
      {
        name: 'Basic',
        monthly_cost: 19,
        credits: 1000,
        features: ['Email Verifier'],
        is_lowest_tier: true,
      },
    ],
    cost_per_unit: {
      email_verify: 0.0019,
    },
    notes: ['0.1 credit per verification'],
    last_updated: '2026-02-07',
  },
  {
    id: 'zerobounce',
    name: 'ZeroBounce',
    category: 'email_verification',
    website_url: 'https://www.zerobounce.net',
    pricing_url: 'https://www.zerobounce.net/email-validation-pricing',
    tiers: [
      {
        name: 'Free',
        monthly_cost: 0,
        credits: 100,
        features: ['100 monthly verifications'],
        is_lowest_tier: true,
      },
      {
        name: 'Pay As You Go',
        monthly_cost: 0,
        credits: 2000,
        features: ['$20 minimum', 'Credits never expire'],
        is_lowest_tier: false,
      },
      {
        name: 'ZeroBounce ONE',
        monthly_cost: 99,
        credits: 25000,
        features: ['25K verifications + 10K scores'],
        is_lowest_tier: false,
      },
    ],
    cost_per_unit: {
      email_verify: 0.01,
    },
    notes: [
      'No charge for duplicates/unknown',
      'Credits never expire (PAYG)',
      '1 credit per verification',
    ],
    last_updated: '2026-02-07',
  },

  // EMAIL SENDING
  {
    id: 'instantly',
    name: 'Instantly',
    category: 'email_sending',
    website_url: 'https://instantly.ai',
    pricing_url: 'https://instantly.ai/pricing',
    tiers: [
      {
        name: 'Growth',
        monthly_cost: 47,
        emails: 5000,
        features: ['Unlimited inboxes', 'Unlimited warmup', 'A/B testing'],
        is_lowest_tier: true,
      },
      {
        name: 'Hypergrowth',
        monthly_cost: 97,
        emails: 100000,
        features: ['Unlimited inboxes', 'Unlimited warmup', 'A/B testing'],
        is_lowest_tier: false,
      },
      {
        name: 'Light Speed',
        monthly_cost: 358,
        emails: 500000,
        features: ['Unlimited inboxes', 'Unlimited warmup', 'A/B testing'],
        is_lowest_tier: false,
      },
    ],
    cost_per_unit: {},
    notes: [
      'Unlimited email accounts',
      'Unlimited email warmup',
      'No per-email cost (subscription only)',
    ],
    last_updated: '2026-02-07',
  },
  {
    id: 'smartlead',
    name: 'Smartlead',
    category: 'email_sending',
    website_url: 'https://www.smartlead.ai',
    pricing_url: 'https://www.smartlead.ai/pricing',
    tiers: [
      {
        name: 'Base',
        monthly_cost: 39,
        emails: 6000,
        features: ['Unlimited warmups', 'Unlimited email accounts', 'CRM integrations'],
        is_lowest_tier: true,
      },
      {
        name: 'Pro',
        monthly_cost: 94,
        emails: 90000,
        features: ['Unlimited warmups', 'Unlimited email accounts', 'CRM integrations'],
        is_lowest_tier: false,
      },
      {
        name: 'Smart',
        monthly_cost: 174,
        emails: 150000,
        features: ['Unlimited warmups', 'Unlimited email accounts', 'CRM integrations'],
        is_lowest_tier: false,
      },
    ],
    cost_per_unit: {
      inbox_monthly: 4.5, // SmartSenders add-on
    },
    notes: [
      'Unlimited email warmups',
      'Unlimited email accounts',
      'SmartSenders: $4.50/mailbox/month (optional)',
    ],
    last_updated: '2026-02-07',
  },

  // INFRASTRUCTURE
  {
    id: 'google_workspace',
    name: 'Google Workspace',
    category: 'infrastructure',
    website_url: 'https://workspace.google.com',
    pricing_url: 'https://workspace.google.com/pricing',
    tiers: [
      {
        name: 'Business Starter',
        monthly_cost: 6,
        features: ['Custom email', '30GB storage', 'Video meetings'],
        is_lowest_tier: true,
      },
    ],
    cost_per_unit: {
      inbox_monthly: 6,
    },
    notes: ['Per user/inbox', 'Annual commitment recommended'],
    last_updated: '2026-02-07',
  },
  {
    id: 'custom_domain',
    name: 'Domain Registration',
    category: 'infrastructure',
    website_url: 'https://www.namecheap.com',
    pricing_url: 'https://www.namecheap.com/domains/registration/',
    tiers: [
      {
        name: 'Standard',
        monthly_cost: 1.08, // $13/year / 12
        features: ['Domain registration', 'DNS management'],
        is_lowest_tier: true,
      },
    ],
    cost_per_unit: {
      domain_yearly: 13,
    },
    notes: ['Average $12-15/domain/year', 'Industry standard'],
    last_updated: '2026-02-07',
  },

  // EMAIL FINDING - Additional Providers
  {
    id: 'hunter',
    name: 'Hunter.io',
    category: 'email_finding',
    website_url: 'https://hunter.io',
    pricing_url: 'https://hunter.io/pricing',
    tiers: [
      {
        name: 'Free',
        monthly_cost: 0,
        credits: 25,
        features: ['25 searches/month', '50 verifications/month'],
        is_lowest_tier: true,
      },
      {
        name: 'Starter',
        monthly_cost: 34,
        credits: 500,
        features: ['500 searches', '1,000 verifications'],
        is_lowest_tier: false,
      },
      {
        name: 'Growth',
        monthly_cost: 104,
        credits: 2500,
        features: ['2,500 searches', '5,000 verifications'],
        is_lowest_tier: false,
      },
      {
        name: 'Business',
        monthly_cost: 349,
        credits: 10000,
        features: ['10,000 searches', '20,000 verifications', 'API access'],
        is_lowest_tier: false,
      },
    ],
    cost_per_unit: {
      email_find: 0.068, // Starter: $34/500 = $0.068
      email_verify: 0.017, // Starter: 0.5 credit per verification
    },
    notes: [
      '1 credit = 1 email found',
      '0.5 credit = 1 email verified',
      'Annual billing: 30% discount',
    ],
    last_updated: '2026-02-07',
  },
  {
    id: 'dropcontact',
    name: 'Dropcontact',
    category: 'email_finding',
    website_url: 'https://www.dropcontact.com',
    pricing_url: 'https://www.dropcontact.com/pricing',
    tiers: [
      {
        name: 'Free Trial',
        monthly_cost: 0,
        credits: 50,
        features: ['50 free credits', 'B2B email enrichment'],
        is_lowest_tier: true,
      },
      {
        name: 'Starter',
        monthly_cost: 79,
        credits: 0,
        features: [
          'Pay on success',
          '100% GDPR-compliant',
          'Native email validation',
          'Advanced catch-all verification',
        ],
        is_lowest_tier: false,
      },
      {
        name: 'Growth',
        monthly_cost: 120,
        credits: 0,
        features: [
          'Credits carry over',
          'LinkedIn enrichment',
          'Company change detection',
          'AI job classification',
        ],
        is_lowest_tier: false,
      },
    ],
    cost_per_unit: {
      email_find: 0.79, // Estimated based on Starter plan
      email_verify: 0.40,
    },
    notes: [
      'Pay only on successful email finding',
      '99% email validity guarantee',
      'No database - uses algorithms only',
      'Outperforms waterfall enrichment',
    ],
    last_updated: '2026-02-07',
  },
  {
    id: 'snovio',
    name: 'Snov.io',
    category: 'email_finding',
    website_url: 'https://snov.io',
    pricing_url: 'https://snov.io/pricing',
    tiers: [
      {
        name: 'Trial',
        monthly_cost: 0,
        credits: 50,
        features: ['50 credits', '100 recipients', 'Email campaigns'],
        is_lowest_tier: true,
      },
      {
        name: 'Pro S',
        monthly_cost: 99,
        credits: 5000,
        features: [
          '5,000 credits',
          '25,000 recipients',
          'Unlimited warm-ups',
          'API access',
        ],
        is_lowest_tier: false,
      },
      {
        name: 'Pro M',
        monthly_cost: 189,
        credits: 20000,
        features: ['20,000 credits', '100,000 recipients'],
        is_lowest_tier: false,
      },
    ],
    cost_per_unit: {
      email_find: 0.0198, // Pro S: $99/5000 = $0.0198
      email_verify: 0.0198, // 1 credit per verification
    },
    notes: [
      '1 credit per prospect or verification',
      'Credit rollover on premium plans',
      'Annual billing: 25% discount',
    ],
    last_updated: '2026-02-07',
  },

  // PHONE FINDING
  {
    id: 'leadmagic_phone',
    name: 'LeadMagic (Phone)',
    category: 'phone_finding',
    website_url: 'https://leadmagic.io',
    pricing_url: 'https://leadmagic.io/pricing',
    tiers: [
      {
        name: 'Basic',
        monthly_cost: 59.99,
        credits: 2500,
        features: ['Mobile Finder', 'Waterfall enrichment'],
        is_lowest_tier: true,
      },
    ],
    cost_per_unit: {
      phone_find: 0.12, // 5 credits * $0.024
    },
    notes: ['5 credits per valid mobile', 'No charge if not found'],
    last_updated: '2026-02-07',
  },
  {
    id: 'bettercontact',
    name: 'BetterContact',
    category: 'phone_finding',
    website_url: 'https://bettercontact.rocks',
    pricing_url: 'https://bettercontact.rocks/pricing',
    tiers: [
      {
        name: 'Starter',
        monthly_cost: 15,
        credits: 200,
        features: [
          '200 valid emails or 20 mobile phones',
          'Waterfall enrichment (20+ vendors)',
          'Only charged when valid',
        ],
        is_lowest_tier: true,
      },
      {
        name: 'Pro',
        monthly_cost: 49,
        credits: 1000,
        features: [
          '1,000 emails or 100 phones',
          'Credit roll-over',
          'Catch-all verification',
          'Mobile phone verification',
        ],
        is_lowest_tier: false,
      },
      {
        name: 'Enterprise',
        monthly_cost: 799,
        credits: 0,
        features: ['Custom credits', 'Use your own API keys', 'Dedicated account manager'],
        is_lowest_tier: false,
      },
    ],
    cost_per_unit: {
      email_find: 0.049, // Pro: $49/1000
      phone_find: 0.49, // 10 credits per phone
    },
    notes: [
      '1 credit = 1 email',
      '10 credits = 1 mobile phone',
      'Only charged for valid data',
      'No charge for catch-alls',
    ],
    last_updated: '2026-02-07',
  },
  {
    id: 'lusha',
    name: 'Lusha',
    category: 'phone_finding',
    website_url: 'https://www.lusha.com',
    pricing_url: 'https://www.lusha.com/pricing',
    tiers: [
      {
        name: 'Free',
        monthly_cost: 0,
        credits: 70,
        features: ['70 credits/month', 'Browser extension', 'CRM integrations'],
        is_lowest_tier: true,
      },
      {
        name: 'Pro',
        monthly_cost: 29,
        credits: 480,
        features: ['480 credits/month', 'Direct dial & mobile numbers', 'API access'],
        is_lowest_tier: false,
      },
      {
        name: 'Premium',
        monthly_cost: 51,
        credits: 960,
        features: ['960 credits/month', 'Intent data', 'Job change alerts'],
        is_lowest_tier: false,
      },
    ],
    cost_per_unit: {
      email_find: 0.06, // Pro: 1 credit per email, $29/480 = $0.06
      phone_find: 0.60, // 10 credits per phone number
    },
    notes: [
      '1 credit = 1 email',
      '10 credits = 1 phone number',
      'Credits roll over on annual plans',
    ],
    last_updated: '2026-02-07',
  },
  {
    id: 'cognism',
    name: 'Cognism',
    category: 'phone_finding',
    website_url: 'https://www.cognism.com',
    pricing_url: 'https://www.cognism.com/pricing',
    tiers: [
      {
        name: 'Platinum',
        monthly_cost: 1375,
        credits: 0,
        features: [
          'Up to 25M contacts',
          'Lead Builder & Insights',
          'Data enrichment',
          '$15K platform fee + $1.5K/user annually',
        ],
        is_lowest_tier: true,
      },
      {
        name: 'Diamond',
        monthly_cost: 2292,
        credits: 0,
        features: [
          'Up to 50M contacts',
          'Phone-verified mobile numbers (98% accuracy)',
          'Intent data (Bombora)',
          'AI segmentation',
          '$25K platform fee + $2.5K/user annually',
        ],
        is_lowest_tier: false,
      },
    ],
    cost_per_unit: {
      contact_search: 0.055, // Estimated based on Platinum annual
      phone_find: 0.092, // Estimated Diamond verified phones
    },
    notes: [
      'Annual contracts only',
      'Platform fee + per-user fee model',
      'Diamond Data: phone-verified mobiles',
      '98% accuracy on Diamond numbers',
    ],
    last_updated: '2026-02-07',
  },
  {
    id: 'rocketreach',
    name: 'RocketReach',
    category: 'phone_finding',
    website_url: 'https://rocketreach.co',
    pricing_url: 'https://rocketreach.co/pricing',
    tiers: [
      {
        name: 'Free',
        monthly_cost: 0,
        credits: 5,
        features: ['5 free lookups', 'Email & phone access'],
        is_lowest_tier: true,
      },
      {
        name: 'Essentials',
        monthly_cost: 69,
        credits: 100,
        features: ['100 lookups/month', 'Email-only access'],
        is_lowest_tier: false,
      },
      {
        name: 'Pro',
        monthly_cost: 139,
        credits: 200,
        features: ['200 lookups/month', 'Email & phone', 'API access'],
        is_lowest_tier: false,
      },
      {
        name: 'Ultimate',
        monthly_cost: 209,
        credits: 300,
        features: ['300 lookups/month', 'Intent data', 'Bulk lookups'],
        is_lowest_tier: false,
      },
    ],
    cost_per_unit: {
      email_find: 0.69, // Essentials: $69/100
      phone_find: 0.70, // Pro: $139/200
    },
    notes: [
      'Lookup only charged if email/phone found',
      'Annual billing available',
      'Team plans available for 2-5 users',
    ],
    last_updated: '2026-02-07',
  },

  // EMAIL VERIFICATION - Additional Providers
  {
    id: 'neverbounce',
    name: 'NeverBounce',
    category: 'email_verification',
    website_url: 'https://www.neverbounce.com',
    pricing_url: 'https://www.neverbounce.com/pricing',
    tiers: [
      {
        name: 'Free',
        monthly_cost: 0,
        credits: 0,
        features: ['Free trial available'],
        is_lowest_tier: true,
      },
      {
        name: 'Pay As You Go',
        monthly_cost: 0,
        credits: 1000,
        features: [
          '$8/1K verifications',
          'Credits expire in 12 months',
          'No monthly commitment',
        ],
        is_lowest_tier: false,
      },
      {
        name: 'Sync Starter',
        monthly_cost: 24,
        credits: 1000,
        features: ['1,000 verifications', 'Auto-sync daily', 'List maintenance'],
        is_lowest_tier: false,
      },
    ],
    cost_per_unit: {
      email_verify: 0.008, // Pay as you go: $8/1000
    },
    notes: [
      'No charge for duplicates/unknown',
      'Volume discounts available',
      '$0.002/email for 2M+ volume',
    ],
    last_updated: '2026-02-07',
  },
  {
    id: 'millionverifier',
    name: 'MillionVerifier',
    category: 'email_verification',
    website_url: 'https://www.millionverifier.com',
    pricing_url: 'https://www.millionverifier.com/pricing',
    tiers: [
      {
        name: 'Free',
        monthly_cost: 0,
        credits: 100,
        features: ['100 free verifications'],
        is_lowest_tier: true,
      },
      {
        name: 'Pay As You Go',
        monthly_cost: 0,
        credits: 10000,
        features: ['$40 for 10K', 'Bulk API', 'No expiration'],
        is_lowest_tier: false,
      },
    ],
    cost_per_unit: {
      email_verify: 0.004, // $40/10K = $0.004
    },
    notes: [
      'Credits never expire',
      'Free API access',
      'Catch-all detection included',
      '99% accuracy guarantee',
    ],
    last_updated: '2026-02-07',
  },

  // EMAIL SENDING - Additional Providers
  {
    id: 'lemlist',
    name: 'Lemlist',
    category: 'email_sending',
    website_url: 'https://www.lemlist.com',
    pricing_url: 'https://www.lemlist.com/pricing',
    tiers: [
      {
        name: 'Email Starter',
        monthly_cost: 59,
        emails: 0,
        features: [
          '3 sending identities',
          'Unlimited campaigns',
          'Email personalization',
          'A/B testing',
        ],
        is_lowest_tier: true,
      },
      {
        name: 'Email Pro',
        monthly_cost: 99,
        emails: 0,
        features: [
          '10 sending identities',
          'Advanced personalization',
          'Custom tracking domain',
          'LinkedIn integration',
        ],
        is_lowest_tier: false,
      },
      {
        name: 'Multichannel Expert',
        monthly_cost: 159,
        emails: 0,
        features: [
          'Unlimited identities',
          'LinkedIn + Email',
          'Call tasks',
          'Advanced workflows',
        ],
        is_lowest_tier: false,
      },
    ],
    cost_per_unit: {},
    notes: [
      'Pricing per seat, not per email',
      'Unlimited email sending',
      'Warmup included in all plans',
      'Annual billing: 2 months free',
    ],
    last_updated: '2026-02-07',
  },
];

export function getProvidersByCategory(category: string): Provider[] {
  return providers.filter((p) => p.category === category);
}

export function getProviderById(id: string): Provider | undefined {
  return providers.find((p) => p.id === id);
}

export function calculateTierForVolume(
  provider: Provider,
  volume: number,
  volumeType: 'emails' | 'credits' | 'contacts',
): PricingTier | null {
  const sortedTiers = [...provider.tiers].sort(
    (a, b) => (a[volumeType] || 0) - (b[volumeType] || 0),
  );

  for (const tier of sortedTiers) {
    const tierLimit = tier[volumeType] || 0;
    if (volume <= tierLimit) {
      return tier;
    }
  }

  return sortedTiers[sortedTiers.length - 1] || null;
}
