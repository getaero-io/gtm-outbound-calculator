export type ProviderCategory =
  | 'contact_sourcing'
  | 'email_finding'
  | 'email_verification'
  | 'phone_finding'
  | 'email_sending'
  | 'infrastructure';

export interface PricingTier {
  name: string;
  monthly_cost: number;
  credits?: number;
  emails?: number;
  contacts?: number;
  features: string[];
  is_lowest_tier: boolean;
}

export interface Provider {
  id: string;
  name: string;
  category: ProviderCategory;
  logo_url?: string;
  website_url: string;
  pricing_url: string;
  tiers: PricingTier[];
  cost_per_unit: {
    email_find?: number;
    email_verify?: number;
    phone_find?: number;
    contact_export?: number;
    contact_search?: number;
    company_search?: number;
    email_send_1k?: number;
    inbox_monthly?: number;
    domain_yearly?: number;
  };
  notes: string[];
  last_updated: string;
  integration_credits?: {
    operation: string;
    credits: number;
    notes?: string;
  }[];
}

export interface ConversionRate {
  id: string;
  name: string;
  rate: number;
  min: number;
  max: number;
  source: string;
  source_url?: string;
  adjustable: boolean;
  description: string;
}

export interface EnrichmentConfig {
  id: string;
  name: string;
  provider_id: string;
  operation: string;
  cost_per_unit: number;
  unit_type: 'contact' | 'email' | 'phone' | 'company';
  apply_to_percentage: number; // 0-100, default 100
  enabled: boolean;
}

export interface WaterfallStep {
  id: string;
  provider_id: string;
  order: number; // 1-based order in waterfall sequence
  expected_coverage_rate: number; // % of remaining contacts this step will find
}

export interface WaterfallConfig {
  id: string;
  name: string;
  category: 'email_finding' | 'phone_finding' | 'email_verification';
  enabled: boolean;
  steps: WaterfallStep[];
}

export interface WaterfallAnalysis {
  config: WaterfallConfig;
  total_coverage_rate: number; // Combined coverage from all steps
  total_cost: number;
  cost_per_successful_find: number;
  breakdown_by_step: {
    step_number: number;
    provider_name: string;
    contacts_processed: number;
    successful_finds: number;
    cost: number;
  }[];
}

export interface CalculatorInput {
  meetings_needed: number;
  conversion_rates: {
    meeting_set_rate: number;
    qualified_reply_rate: number;
    reply_rate: number;
    deliverability_rate: number;
    email_find_rate: number;
    post_enrichment_valid_rate: number;
  };
  selected_providers: {
    contact_sourcing?: string;
    email_finding: string;
    email_verification?: string;
    email_sending: string;
    phone_finding?: string;
  };
  enrichments?: EnrichmentConfig[];
  waterfalls?: WaterfallConfig[]; // Waterfall enrichment configs
  infrastructure?: {
    emails_per_domain?: number;
    emails_per_inbox_per_month?: number;
    domain_cost_yearly?: number;
    inbox_cost_monthly?: number;
    inboxes_per_domain?: number;
  };
  headcount?: {
    sdr_count?: number;
    sdr_monthly_cost?: number;
    include_headcount_in_total?: boolean;
  };
}

export interface CostBreakdown {
  category: string;
  provider: string;
  operation?: string;
  unit_cost: number;
  quantity: number;
  total: number;
  citation_url: string;
  notes?: string;
}

export interface CalculatorOutput {
  leads_to_source: number;
  valid_emails_needed: number;
  emails_to_send: number;
  expected_replies: number;
  expected_qualified_replies: number;
  expected_meetings: number;
  breakdown: CostBreakdown[];
  waterfall_analysis?: WaterfallAnalysis[]; // Waterfall cost/coverage analysis
  total_cost: number;
  monthly_recurring: number;
  setup_costs: number;
  cost_per_meeting: number;
  headcount_cost?: number;
  total_cost_with_headcount?: number;
  cost_per_meeting_with_headcount?: number;
}
