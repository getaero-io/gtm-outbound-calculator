import type { WaterfallConfig } from '@/lib/types';

export const waterfallPresets: Record<string, WaterfallConfig> = {
  email_finding_max_coverage: {
    id: 'preset-email-max',
    name: 'Max Email Coverage',
    category: 'email_finding',
    enabled: true,
    steps: [
      {
        id: 'step-1',
        provider_id: 'apollo',
        order: 1,
        expected_coverage_rate: 0.65, // 65% coverage
      },
      {
        id: 'step-2',
        provider_id: 'hunter',
        order: 2,
        expected_coverage_rate: 0.50, // 50% of remaining
      },
      {
        id: 'step-3',
        provider_id: 'prospeo',
        order: 3,
        expected_coverage_rate: 0.40, // 40% of remaining
      },
    ],
  },
  email_finding_cost_optimized: {
    id: 'preset-email-cost',
    name: 'Cost-Optimized Email',
    category: 'email_finding',
    enabled: true,
    steps: [
      {
        id: 'step-1',
        provider_id: 'apollo',
        order: 1,
        expected_coverage_rate: 0.65,
      },
      {
        id: 'step-2',
        provider_id: 'findymail',
        order: 2,
        expected_coverage_rate: 0.45,
      },
    ],
  },
  phone_finding_standard: {
    id: 'preset-phone-std',
    name: 'Standard Phone Enrichment',
    category: 'phone_finding',
    enabled: true,
    steps: [
      {
        id: 'step-1',
        provider_id: 'bettercontact',
        order: 1,
        expected_coverage_rate: 0.70, // BetterContact has built-in waterfall
      },
      {
        id: 'step-2',
        provider_id: 'lusha',
        order: 2,
        expected_coverage_rate: 0.40,
      },
    ],
  },
};
