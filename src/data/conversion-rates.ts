import { ConversionRate } from '@/lib/types';

export const conversionRates: ConversionRate[] = [
  {
    id: 'meeting_set_rate',
    name: 'Meeting Set Rate',
    rate: 0.2,
    min: 0.15,
    max: 0.35,
    source: 'Martal Group 2026: 20-35% of qualified meetings convert to opportunities',
    source_url: 'https://martal.ca/conversion-rate-statistics-lb/',
    adjustable: true,
    description: 'Percentage of qualified replies that convert to booked meetings',
  },
  {
    id: 'qualified_reply_rate',
    name: 'Qualified Reply Rate',
    rate: 0.5,
    min: 0.3,
    max: 0.7,
    source: 'The Digital Bloom 2025: 30-50% of replies are neutral/negative, meaning 50-70% qualified',
    source_url: 'https://thedigitalbloom.com/learn/cold-outbound-reply-rate-benchmarks/',
    adjustable: true,
    description: 'Percentage of replies that are qualified prospects',
  },
  {
    id: 'reply_rate',
    name: 'Reply Rate',
    rate: 0.055,
    min: 0.034,
    max: 0.107,
    source: 'Instantly.ai 2026: 3.43% avg, 5.5% top quartile, 10.7% elite',
    source_url: 'https://instantly.ai/cold-email-benchmark-report-2026',
    adjustable: true,
    description: 'Percentage of delivered emails that receive a response',
  },
  {
    id: 'deliverability_rate',
    name: 'Email Deliverability Rate',
    rate: 0.85,
    min: 0.75,
    max: 0.98,
    source: 'Instantly.ai 2026: <2% bounce rate = ~98% delivery, but spam filters reduce inbox placement to 83-85%',
    source_url: 'https://instantly.ai/cold-email-benchmark-report-2026',
    adjustable: true,
    description: 'Percentage of sent emails that reach the inbox (after bounces and spam filters)',
  },
  {
    id: 'email_find_rate',
    name: 'Email Find Success Rate',
    rate: 0.5,
    min: 0.21,
    max: 0.725,
    source: 'Dropcontact 2025 Benchmark: 20,000 tests show 21% (LeadMagic) to 72.5% (Icypeas)',
    source_url: 'https://www.dropcontact.com/email-finder-benchmark',
    adjustable: true,
    description: 'Percentage of contacts with valid email found',
  },
  {
    id: 'post_enrichment_valid_rate',
    name: 'Post-Enrichment Valid Rate',
    rate: 0.85,
    min: 0.77,
    max: 0.95,
    source: 'The Digital Bloom 2025: B2B data decays ~22% annually; some tools show 22.7% invalid emails',
    source_url: 'https://thedigitalbloom.com/learn/b2b-email-deliverability-benchmarks-2025/',
    adjustable: true,
    description: 'Percentage of enriched contacts that remain valid after verification',
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
