import { ConversionRate } from '@/lib/types';

export const conversionRates: ConversionRate[] = [
  {
    id: 'meeting_set_rate',
    name: 'Meeting Set Rate',
    rate: 0.2,
    min: 0.15,
    max: 0.30,
    source: 'Industry benchmark 2026',
    adjustable: true,
    description: 'Percentage of qualified replies that convert to booked meetings',
  },
  {
    id: 'qualified_reply_rate',
    name: 'Qualified Reply Rate',
    rate: 0.5,
    min: 0.3,
    max: 0.7,
    source: 'GTM community data',
    adjustable: true,
    description: 'Percentage of replies that are qualified prospects',
  },
  {
    id: 'reply_rate',
    name: 'Reply Rate',
    rate: 0.05,
    min: 0.01,
    max: 0.10,
    source: 'Cold outreach benchmark 2026: 5-6% average, 10% excellent',
    adjustable: true,
    description: 'Percentage of delivered emails that receive a response',
  },
  {
    id: 'deliverability_rate',
    name: 'Email Deliverability Rate',
    rate: 0.85,
    min: 0.7,
    max: 0.95,
    source: 'Industry standard',
    adjustable: true,
    description: 'Percentage of sent emails that reach the inbox',
  },
  {
    id: 'email_find_rate',
    name: 'Email Find Success Rate',
    rate: 0.5,
    min: 0.3,
    max: 0.8,
    source: 'Provider average',
    adjustable: true,
    description: 'Percentage of contacts with valid email found',
  },
  {
    id: 'post_enrichment_valid_rate',
    name: 'Post-Enrichment Valid Rate',
    rate: 0.85,
    min: 0.7,
    max: 0.95,
    source: 'GTM community: 15% typical bounce rate',
    adjustable: true,
    description: 'Percentage of enriched contacts that remain valid',
  },
];

export function getDefaultRates(): Record<string, number> {
  return conversionRates.reduce(
    (acc, rate) => ({
      ...acc,
      [rate.id]: rate.rate,
    }),
    {},
  );
}

export function getRateById(id: string): ConversionRate | undefined {
  return conversionRates.find((r) => r.id === id);
}
