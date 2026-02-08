import { getProviderById, calculateTierForVolume } from '@/data/provider-pricing';
import type {
  CalculatorInput,
  CalculatorOutput,
  CostBreakdown,
  EnrichmentConfig,
} from './types';

export function calculateCampaignCosts(input: CalculatorInput): CalculatorOutput {
  const { meetings_needed, conversion_rates, selected_providers, enrichments, infrastructure } =
    input;

  // Default infrastructure params
  const emails_per_domain = infrastructure?.emails_per_domain ?? 500;
  const emails_per_inbox = infrastructure?.emails_per_inbox_per_month ?? 200;
  const domain_cost_yearly = infrastructure?.domain_cost_yearly ?? 13;
  const inbox_cost_monthly = infrastructure?.inbox_cost_monthly ?? 6;

  // Reverse calculate funnel
  const qualified_replies = meetings_needed / conversion_rates.meeting_set_rate;
  const total_replies = qualified_replies / conversion_rates.qualified_reply_rate;
  const emails_delivered = total_replies / conversion_rates.reply_rate;
  const valid_emails_needed = emails_delivered / conversion_rates.deliverability_rate;
  const contacts_with_emails = valid_emails_needed / conversion_rates.email_find_rate;
  const leads_to_source = contacts_with_emails / conversion_rates.post_enrichment_valid_rate;

  const breakdown: CostBreakdown[] = [];

  // 1. Contact Sourcing Cost
  if (selected_providers.contact_sourcing) {
    const provider = getProviderById(selected_providers.contact_sourcing);
    if (provider) {
      const cost_per_contact = provider.cost_per_unit.contact_search || 0;
      const quantity = Math.ceil(leads_to_source);

      // Check if free tier covers it
      const lowestTier = provider.tiers.find((t) => t.is_lowest_tier);
      const isFree = lowestTier && lowestTier.monthly_cost === 0;
      const freeCreditsAvailable = lowestTier?.credits || 0;
      const creditsNeeded = quantity * (provider.integration_credits?.[0]?.credits || 1);

      if (isFree && creditsNeeded <= freeCreditsAvailable) {
        breakdown.push({
          category: 'Contact Sourcing',
          provider: provider.name,
          operation: 'Search/Export',
          unit_cost: 0,
          quantity,
          total: 0,
          citation_url: provider.pricing_url,
          notes: `Free tier covers ${freeCreditsAvailable.toLocaleString()} credits/month`,
        });
      } else {
        breakdown.push({
          category: 'Contact Sourcing',
          provider: provider.name,
          operation: 'Search/Export',
          unit_cost: cost_per_contact,
          quantity,
          total: cost_per_contact * quantity,
          citation_url: provider.pricing_url,
        });
      }
    }
  }

  // 2. Email Finding Cost
  const emailProvider = getProviderById(selected_providers.email_finding);
  if (emailProvider?.cost_per_unit.email_find) {
    const quantity = Math.ceil(contacts_with_emails);
    breakdown.push({
      category: 'Email Finding',
      provider: emailProvider.name,
      unit_cost: emailProvider.cost_per_unit.email_find,
      quantity,
      total: emailProvider.cost_per_unit.email_find * quantity,
      citation_url: emailProvider.pricing_url,
    });
  }

  // 3. Email Verification Cost
  if (selected_providers.email_verification) {
    const verifyProvider = getProviderById(selected_providers.email_verification);
    if (verifyProvider?.cost_per_unit.email_verify) {
      const quantity = Math.ceil(contacts_with_emails);
      breakdown.push({
        category: 'Email Verification',
        provider: verifyProvider.name,
        unit_cost: verifyProvider.cost_per_unit.email_verify,
        quantity,
        total: verifyProvider.cost_per_unit.email_verify * quantity,
        citation_url: verifyProvider.pricing_url,
      });
    }
  }

  // 4. Email Sending Platform
  const sendingProvider = getProviderById(selected_providers.email_sending);
  if (sendingProvider) {
    const requiredTier = calculateTierForVolume(
      sendingProvider,
      Math.ceil(emails_delivered),
      'emails',
    );

    const tierToUse = requiredTier || sendingProvider.tiers[sendingProvider.tiers.length - 1];

    breakdown.push({
      category: 'Email Sending Platform',
      provider: sendingProvider.name,
      operation: tierToUse?.name || 'Subscription',
      unit_cost: tierToUse?.monthly_cost || 0,
      quantity: 1,
      total: tierToUse?.monthly_cost || 0,
      citation_url: sendingProvider.pricing_url,
      notes: tierToUse
        ? `${tierToUse.name} tier (up to ${tierToUse.emails?.toLocaleString()} emails/mo)`
        : undefined,
    });
  }

  // 5. Domain Costs
  const domains_needed = Math.ceil(emails_delivered / emails_per_domain);
  const domain_cost_monthly = (domain_cost_yearly / 12) * domains_needed;

  breakdown.push({
    category: 'Infrastructure',
    provider: 'Domain Registration',
    operation: 'Domains',
    unit_cost: domain_cost_yearly / 12,
    quantity: domains_needed,
    total: domain_cost_monthly,
    citation_url: 'https://www.namecheap.com',
    notes: `${domains_needed} domains @ $${(domain_cost_yearly / 12).toFixed(2)}/mo each`,
  });

  // 6. Inbox Costs (if needed - check if sending platform includes it)
  const sendingIncludesInboxes = sendingProvider?.notes.some((n) =>
    n.toLowerCase().includes('unlimited'),
  );

  if (!sendingIncludesInboxes || selected_providers.email_sending === 'smartlead') {
    const inboxes_needed = Math.ceil(emails_delivered / emails_per_inbox);
    const inbox_total = inboxes_needed * inbox_cost_monthly;

    breakdown.push({
      category: 'Infrastructure',
      provider: 'Email Inboxes',
      operation: 'Inbox Setup',
      unit_cost: inbox_cost_monthly,
      quantity: inboxes_needed,
      total: inbox_total,
      citation_url: 'https://workspace.google.com/pricing',
      notes: `${inboxes_needed} inboxes @ $${inbox_cost_monthly}/mo each`,
    });
  }

  // 7. Additional Enrichments
  if (enrichments && enrichments.length > 0) {
    enrichments
      .filter((e) => e.enabled)
      .forEach((enrichment) => {
        const provider = getProviderById(enrichment.provider_id);
        if (!provider) return;

        let quantity = 0;
        switch (enrichment.unit_type) {
          case 'contact':
            quantity = Math.ceil(leads_to_source * (enrichment.apply_to_percentage / 100));
            break;
          case 'email':
            quantity = Math.ceil(contacts_with_emails * (enrichment.apply_to_percentage / 100));
            break;
          case 'phone':
            quantity = Math.ceil(contacts_with_emails * (enrichment.apply_to_percentage / 100));
            break;
          case 'company':
            quantity = Math.ceil(leads_to_source * (enrichment.apply_to_percentage / 100));
            break;
        }

        breakdown.push({
          category: 'Additional Enrichment',
          provider: provider.name,
          operation: enrichment.name,
          unit_cost: enrichment.cost_per_unit,
          quantity,
          total: enrichment.cost_per_unit * quantity,
          citation_url: provider.pricing_url,
          notes:
            enrichment.apply_to_percentage < 100
              ? `Applied to ${enrichment.apply_to_percentage}% of ${enrichment.unit_type}s`
              : undefined,
        });
      });
  }

  const total_cost = breakdown.reduce((sum, item) => sum + item.total, 0);
  const monthly_recurring = breakdown
    .filter(
      (b) =>
        b.category === 'Email Sending Platform' ||
        (b.category === 'Infrastructure' && b.operation !== 'Domains'),
    )
    .reduce((sum, item) => sum + item.total, 0);

  return {
    leads_to_source: Math.ceil(leads_to_source),
    valid_emails_needed: Math.ceil(valid_emails_needed),
    emails_to_send: Math.ceil(emails_delivered),
    expected_replies: Math.ceil(total_replies),
    expected_qualified_replies: Math.ceil(qualified_replies),
    expected_meetings: meetings_needed,
    breakdown,
    total_cost,
    monthly_recurring,
    setup_costs: total_cost - monthly_recurring,
    cost_per_meeting: total_cost / meetings_needed,
  };
}
