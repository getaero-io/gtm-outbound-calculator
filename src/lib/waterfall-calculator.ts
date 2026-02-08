import type { WaterfallConfig, WaterfallAnalysis } from './types';
import { getProviderById } from '@/data/provider-pricing';

/**
 * Calculate coverage and cost for a waterfall enrichment sequence
 *
 * Waterfall logic: Each step processes contacts that failed in previous steps
 * Example: 1000 contacts -> Step 1 finds 600 (60%) -> Step 2 processes 400, finds 200 (50% of 400) -> etc.
 */
export function calculateWaterfallAnalysis(
  config: WaterfallConfig,
  total_contacts: number
): WaterfallAnalysis {
  let remaining_contacts = total_contacts;
  let total_found = 0;
  let total_cost = 0;
  const breakdown_by_step: WaterfallAnalysis['breakdown_by_step'] = [];

  // Sort steps by order
  const sorted_steps = [...config.steps].sort((a, b) => a.order - b.order);

  sorted_steps.forEach((step, index) => {
    const provider = getProviderById(step.provider_id);
    if (!provider) return;

    // Calculate how many this step will find
    const successful_finds = Math.ceil(remaining_contacts * step.expected_coverage_rate);

    // Determine cost per unit based on category
    let cost_per_unit = 0;
    switch (config.category) {
      case 'email_finding':
        cost_per_unit = provider.cost_per_unit.email_find || 0;
        break;
      case 'phone_finding':
        cost_per_unit = provider.cost_per_unit.phone_find || 0;
        break;
      case 'email_verification':
        cost_per_unit = provider.cost_per_unit.email_verify || 0;
        break;
    }

    // Cost = contacts processed × cost per unit
    const step_cost = remaining_contacts * cost_per_unit;

    breakdown_by_step.push({
      step_number: step.order,
      provider_name: provider.name,
      contacts_processed: remaining_contacts,
      successful_finds,
      cost: step_cost,
    });

    total_found += successful_finds;
    total_cost += step_cost;
    remaining_contacts -= successful_finds;
  });

  const total_coverage_rate = total_contacts > 0 ? total_found / total_contacts : 0;
  const cost_per_successful_find = total_found > 0 ? total_cost / total_found : 0;

  return {
    config,
    total_coverage_rate,
    total_cost,
    cost_per_successful_find,
    breakdown_by_step,
  };
}

/**
 * Compare waterfall vs single-provider cost and coverage
 */
export function compareWaterfallVsSingleProvider(
  waterfall_analysis: WaterfallAnalysis,
  single_provider_id: string,
  total_contacts: number
): {
  waterfall: { coverage: number; cost: number; cost_per_find: number };
  single: { coverage: number; cost: number; cost_per_find: number };
  improvement: { coverage_increase: number; cost_increase: number };
} {
  const provider = getProviderById(single_provider_id);
  if (!provider) {
    throw new Error(`Provider ${single_provider_id} not found`);
  }

  // Get cost per unit for single provider
  let cost_per_unit = 0;
  switch (waterfall_analysis.config.category) {
    case 'email_finding':
      cost_per_unit = provider.cost_per_unit.email_find || 0;
      break;
    case 'phone_finding':
      cost_per_unit = provider.cost_per_unit.phone_find || 0;
      break;
    case 'email_verification':
      cost_per_unit = provider.cost_per_unit.email_verify || 0;
      break;
  }

  // Assume single provider has same coverage as first waterfall step
  const single_coverage = waterfall_analysis.config.steps[0]?.expected_coverage_rate || 0.6;
  const single_cost = total_contacts * cost_per_unit;
  const single_finds = total_contacts * single_coverage;
  const single_cost_per_find = single_finds > 0 ? single_cost / single_finds : 0;

  return {
    waterfall: {
      coverage: waterfall_analysis.total_coverage_rate,
      cost: waterfall_analysis.total_cost,
      cost_per_find: waterfall_analysis.cost_per_successful_find,
    },
    single: {
      coverage: single_coverage,
      cost: single_cost,
      cost_per_find: single_cost_per_find,
    },
    improvement: {
      coverage_increase: waterfall_analysis.total_coverage_rate - single_coverage,
      cost_increase: waterfall_analysis.total_cost - single_cost,
    },
  };
}
