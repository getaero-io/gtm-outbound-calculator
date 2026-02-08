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
    pricing_url: 'https://www.peopledatalabs.com/pricing',
    tiers: [
      {
        name: 'Developer',
        monthly_cost: 0,
        credits: 1000,
        features: ['1K credits/month', 'API access'],
        is_lowest_tier: true,
      },
    ],
    cost_per_unit: {
      contact_search: 0.25, // 5 credits * ~$0.05 (estimate)
    },
    notes: [
      'Pricing varies by volume',
      'Typical: ~$0.05/credit',
      'All operations cost 5 credits',
    ],
    last_updated: '2026-02-07',
    integration_credits: [
      { operation: 'peopledatalabs_enrich_contact', credits: 5 },
      { operation: 'peopledatalabs_enrich_company', credits: 5 },
      { operation: 'peopledatalabs_person_search', credits: 5 },
      { operation: 'peopledatalabs_company_search', credits: 5 },
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
    website_url: 'https://icypeas.com',
    pricing_url: 'https://icypeas.com/pricing',
    tiers: [
      {
        name: 'Basic',
        monthly_cost: 19,
        credits: 1000,
        features: ['Email Finder', 'Email Verifier', 'Domain Scan'],
        is_lowest_tier: true,
      },
      {
        name: 'Premium',
        monthly_cost: 39,
        credits: 4000,
        features: ['Email Finder', 'Email Verifier', 'Domain Scan'],
        is_lowest_tier: false,
      },
      {
        name: 'Advanced',
        monthly_cost: 89,
        credits: 10000,
        features: ['Email Finder', 'Email Verifier', 'Domain Scan'],
        is_lowest_tier: false,
      },
    ],
    cost_per_unit: {
      email_find: 0.019, // 1 credit at Basic tier
      email_verify: 0.0019, // 0.1 credit at Basic tier
    },
    notes: [
      '1 credit per email found',
      '0.1 credit per verification',
      'Credits roll over monthly',
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
    website_url: 'https://icypeas.com',
    pricing_url: 'https://icypeas.com/pricing',
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
      email_verify: 0.0019, // 0.1 credit * $0.019
    },
    notes: ['0.1 credit per verification'],
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
