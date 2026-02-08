import { ConversionRate } from '@/lib/types';

export const conversionRates: ConversionRate[] = [
  {
    id: 'meeting_set_rate',
    name: 'Meeting Set Rate',
    rate: 0.2,
    min: 0.15,
    max: 0.30,
    source: 'Industry benchmark',
    adjustable: true,
    description: 'Percentage of qualified replies that convert to booked meetings',
  },
  {
    id: 'qualified_reply_rate',
    name: 'Qualified Reply Rate',
    rate: 0.5,
    min: 0.4,
    max: 0.6,
    source: 'GTM Cafe community data',
    adjustable: true,
    description: 'Percentage of replies that are qualified/interested',
  },
  {
    id: 'reply_rate',
    name: 'Reply Rate',
    rate: 0.05,
    min: 0.03,
    max: 0.10,
    source: 'Cold outbound benchmarks',
    adjustable: true,
    description: 'Percentage of delivered emails that receive any reply',
  },
  {
    id: 'deliverability_rate',
    name: 'Email Deliverability',
    rate: 0.85,
    min: 0.75,
    max: 0.95,
    source: 'GTM Cafe (15% bounce rate expected)',
    adjustable: true,
    description: 'Percentage of emails that successfully deliver (avoid bounce)',
  },
  {
    id: 'email_find_rate',
    name: 'Email Find Rate',
    rate: 0.5,
    min: 0.4,
    max: 0.70,
    source: 'GTM Cafe community data',
    adjustable: true,
    description: 'Percentage of contacts where valid email can be found',
  },
  {
    id: 'post_enrichment_valid_rate',
    name: 'Post-Enrichment Valid Rate',
    rate: 0.5,
    min: 0.3,
    max: 0.7,
    source: 'GTM Cafe (list quality after enrichment)',
    adjustable: true,
    description: 'Percentage of enriched leads that pass quality filters',
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
