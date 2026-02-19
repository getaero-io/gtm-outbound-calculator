'use client';

import { useState, useEffect } from 'react';
import { calculateCampaignCosts } from '@/lib/calculator';
import { providers } from '@/data/provider-pricing';
import { conversionRates as defaultConversionRates } from '@/data/conversion-rates';
import type { CalculatorInput, CalculatorOutput, EnrichmentConfig, WaterfallConfig } from '@/lib/types';
import { InputSection } from '@/components/calculator/InputSection';
import { WaterfallBuilder } from '@/components/calculator/WaterfallBuilder';
import { WaterfallVisualization } from '@/components/calculator/WaterfallVisualization';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';

export default function Home() {
  const [meetingsNeeded, setMeetingsNeeded] = useState(10);
  const [selectedProviders, setSelectedProviders] = useState<{
    contact_sourcing: string;
    email_finding: string;
    email_verification?: string;
    email_sending: string;
  }>({
    contact_sourcing: 'apollo',
    email_finding: 'leadmagic',
    email_verification: 'leadmagic',
    email_sending: 'instantly',
  });
  const [conversionRates, setConversionRates] = useState(() => {
    const rates: Record<string, number> = {};
    defaultConversionRates.forEach(r => {
      rates[r.id] = r.rate;
    });
    return rates;
  });
  const [enrichments, setEnrichments] = useState<EnrichmentConfig[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showInfrastructure, setShowInfrastructure] = useState(false);
  const [headcount, setHeadcount] = useState({
    sdr_count: 1,
    sdr_monthly_cost: 10000,
    include_headcount_in_total: true,
  });
  const [infrastructure, setInfrastructure] = useState({
    emails_per_inbox_per_month: 660, // 30 emails/day × 22 business days (industry standard)
    inboxes_per_domain: 3,
    domain_cost_yearly: 13,
    inbox_cost_monthly: 6,
  });
  const [results, setResults] = useState<CalculatorOutput | null>(null);
  const [waterfalls, setWaterfalls] = useState<WaterfallConfig[]>([]);

  // Infrastructure presets
  const infrastructurePresets = {
    conservative: { emails_per_inbox_per_month: 440, inboxes_per_domain: 3, label: 'Conservative (20/day)' },
    standard: { emails_per_inbox_per_month: 660, inboxes_per_domain: 3, label: 'Standard (30/day) - Recommended' },
    aggressive: { emails_per_inbox_per_month: 1100, inboxes_per_domain: 2, label: 'Aggressive (50/day)' },
    maximum: { emails_per_inbox_per_month: 1540, inboxes_per_domain: 2, label: 'Maximum (70/day)' },
  };

  const contactSourcingProviders = providers.filter(p => p.category === 'contact_sourcing');
  const emailFindingProviders = providers.filter(p => p.category === 'email_finding');
  const emailVerificationProviders = providers.filter(p => p.category === 'email_verification');
  const emailSendingProviders = providers.filter(p => p.category === 'email_sending');

  useEffect(() => {
    const input: CalculatorInput = {
      meetings_needed: meetingsNeeded,
      conversion_rates: {
        meeting_set_rate: conversionRates.meeting_set_rate,
        qualified_reply_rate: conversionRates.qualified_reply_rate,
        reply_rate: conversionRates.reply_rate,
        deliverability_rate: conversionRates.deliverability_rate,
        email_find_rate: conversionRates.email_find_rate,
        post_enrichment_valid_rate: conversionRates.post_enrichment_valid_rate,
      },
      selected_providers: {
        contact_sourcing: selectedProviders.contact_sourcing,
        email_finding: selectedProviders.email_finding,
        email_verification: selectedProviders.email_verification,
        email_sending: selectedProviders.email_sending,
      },
      enrichments,
      waterfalls,
      infrastructure: {
        emails_per_inbox_per_month: infrastructure.emails_per_inbox_per_month,
        emails_per_domain: infrastructure.emails_per_inbox_per_month * infrastructure.inboxes_per_domain,
        inboxes_per_domain: infrastructure.inboxes_per_domain,
        domain_cost_yearly: infrastructure.domain_cost_yearly,
        inbox_cost_monthly: infrastructure.inbox_cost_monthly,
      },
      headcount: {
        sdr_count: headcount.sdr_count,
        sdr_monthly_cost: headcount.sdr_monthly_cost,
        include_headcount_in_total: headcount.include_headcount_in_total,
      },
    };

    const output = calculateCampaignCosts(input);
    setResults(output);
  }, [meetingsNeeded, selectedProviders, conversionRates, enrichments, waterfalls, infrastructure, headcount]);

  const addEnrichment = () => {
    const newEnrichment: EnrichmentConfig = {
      id: `enrichment-${Date.now()}`,
      name: 'Phone Finding',
      provider_id: 'leadmagic',
      operation: 'leadmagic_mobile_finder',
      cost_per_unit: 0.12,
      unit_type: 'phone',
      apply_to_percentage: 100,
      enabled: true,
    };
    setEnrichments([...enrichments, newEnrichment]);
  };

  const removeEnrichment = (id: string) => {
    setEnrichments(enrichments.filter(e => e.id !== id));
  };

  const updateEnrichment = (id: string, updates: Partial<EnrichmentConfig>) => {
    setEnrichments(enrichments.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            GTM Outbound Cost Calculator
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Estimate your outbound campaign costs with precision
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="space-y-6">
            {/* SDR Team Size - Moved to Top */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                Team Size
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Number of SDRs
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={headcount.sdr_count}
                    onChange={(e) => setHeadcount({ ...headcount, sdr_count: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Cost per SDR per Month ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={headcount.sdr_monthly_cost}
                    onChange={(e) => setHeadcount({ ...headcount, sdr_monthly_cost: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Benchmark: $7,500-$13,000/month per SDR
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="include-headcount"
                    checked={headcount.include_headcount_in_total}
                    onChange={(e) => setHeadcount({ ...headcount, include_headcount_in_total: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="include-headcount" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                    Include headcount in total cost
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                Campaign Goal
              </h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Meetings Needed Per Month
                </label>
                <input
                  type="number"
                  min="1"
                  value={meetingsNeeded}
                  onChange={(e) => setMeetingsNeeded(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                Provider Selection
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Contact Sourcing
                  </label>
                  <select
                    value={selectedProviders.contact_sourcing}
                    onChange={(e) => setSelectedProviders({ ...selectedProviders, contact_sourcing: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {contactSourcingProviders.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${(p.cost_per_unit.contact_export || p.cost_per_unit.contact_search || 0).toFixed(3)}/contact)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Finding
                  </label>
                  <select
                    value={selectedProviders.email_finding}
                    onChange={(e) => setSelectedProviders({ ...selectedProviders, email_finding: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {emailFindingProviders.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${(p.cost_per_unit.email_find || 0).toFixed(3)}/email)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Verification
                  </label>
                  <select
                    value={selectedProviders.email_verification || ''}
                    onChange={(e) => setSelectedProviders({ ...selectedProviders, email_verification: e.target.value === '' ? undefined : e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">None</option>
                    {emailVerificationProviders.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${(p.cost_per_unit.email_verify || 0).toFixed(4)}/verification)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Sending
                  </label>
                  <select
                    value={selectedProviders.email_sending}
                    onChange={(e) => setSelectedProviders({ ...selectedProviders, email_sending: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {emailSendingProviders.map(p => {
                      const lowestTier = p.tiers.find(t => t.is_lowest_tier);
                      return (
                        <option key={p.id} value={p.id}>
                          {p.name} (${lowestTier?.monthly_cost || 0}/mo)
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            {/* Enrichments */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Additional Enrichments
                </h2>
                <button
                  onClick={addEnrichment}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  + Add Enrichment
                </button>
              </div>
              {enrichments.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  No additional enrichments configured
                </p>
              ) : (
                <div className="space-y-3">
                  {enrichments.map((enrichment) => (
                    <div key={enrichment.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <input
                          type="text"
                          value={enrichment.name}
                          onChange={(e) => updateEnrichment(enrichment.id, { name: e.target.value })}
                          className="flex-1 px-3 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                        />
                        <button
                          onClick={() => removeEnrichment(enrichment.id)}
                          className="ml-2 text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                            Cost per unit ($)
                          </label>
                          <input
                            type="number"
                            step="0.0001"
                            min="0"
                            value={enrichment.cost_per_unit}
                            onChange={(e) => updateEnrichment(enrichment.id, { cost_per_unit: Number(e.target.value) })}
                            className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                            Apply to {enrichment.apply_to_percentage}% of contacts
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={enrichment.apply_to_percentage}
                            onChange={(e) => updateEnrichment(enrichment.id, { apply_to_percentage: Number(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Infrastructure Configuration */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <button
                onClick={() => setShowInfrastructure(!showInfrastructure)}
                className="w-full flex justify-between items-center text-left"
              >
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Email Infrastructure Settings
                </h2>
                <span className="text-slate-500">
                  {showInfrastructure ? '▼' : '▶'}
                </span>
              </button>
              {showInfrastructure && (
                <div className="mt-6 space-y-6">
                  {/* Preset Selector */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Infrastructure Preset
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(infrastructurePresets).map(([key, preset]) => (
                        <button
                          key={key}
                          onClick={() => setInfrastructure({
                            ...infrastructure,
                            emails_per_inbox_per_month: preset.emails_per_inbox_per_month,
                            inboxes_per_domain: preset.inboxes_per_domain
                          })}
                          className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                            infrastructure.emails_per_inbox_per_month === preset.emails_per_inbox_per_month &&
                            infrastructure.inboxes_per_domain === preset.inboxes_per_domain
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                              : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 text-slate-900 dark:text-white'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Configuration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Emails per Inbox per Month
                      </label>
                      <input
                        type="number"
                        min="100"
                        max="2000"
                        step="10"
                        value={infrastructure.emails_per_inbox_per_month}
                        onChange={(e) => setInfrastructure({ ...infrastructure, emails_per_inbox_per_month: Number(e.target.value) })}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        ~{Math.round(infrastructure.emails_per_inbox_per_month / 22)} emails/day
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Inboxes per Domain
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={infrastructure.inboxes_per_domain}
                        onChange={(e) => setInfrastructure({ ...infrastructure, inboxes_per_domain: Number(e.target.value) })}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Recommended: 2-3 inboxes
                      </p>
                    </div>
                  </div>

                  {/* Cost Configuration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Domain Cost ($/year)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="50"
                        step="0.5"
                        value={infrastructure.domain_cost_yearly}
                        onChange={(e) => setInfrastructure({ ...infrastructure, domain_cost_yearly: Number(e.target.value) })}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Namecheap: $13, Porkbun: $10
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Inbox Cost ($/month)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        step="0.5"
                        value={infrastructure.inbox_cost_monthly}
                        onChange={(e) => setInfrastructure({ ...infrastructure, inbox_cost_monthly: Number(e.target.value) })}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Google: $6, Zoho: $1, Microsoft: $6
                      </p>
                    </div>
                  </div>

                  {/* Infrastructure Summary & Warnings */}
                  <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Configuration Summary
                    </h3>
                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Emails per domain per month:</span>
                        <span className="font-medium">{(infrastructure.emails_per_inbox_per_month * infrastructure.inboxes_per_domain).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Daily send limit per inbox:</span>
                        <span className="font-medium">~{Math.round(infrastructure.emails_per_inbox_per_month / 22)}/day</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Daily send limit per domain:</span>
                        <span className="font-medium">~{Math.round((infrastructure.emails_per_inbox_per_month * infrastructure.inboxes_per_domain) / 22)}/day</span>
                      </div>
                    </div>
                    {Math.round(infrastructure.emails_per_inbox_per_month / 22) > 50 && (
                      <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded text-xs text-orange-700 dark:text-orange-300">
                        ⚠️ Warning: Sending {Math.round(infrastructure.emails_per_inbox_per_month / 22)}+/day per inbox may trigger spam filters. Recommended max: 50/day.
                      </div>
                    )}
                    {Math.round((infrastructure.emails_per_inbox_per_month * infrastructure.inboxes_per_domain) / 22) > 140 && (
                      <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded text-xs text-orange-700 dark:text-orange-300">
                        ⚠️ Warning: Domain load {Math.round((infrastructure.emails_per_inbox_per_month * infrastructure.inboxes_per_domain) / 22)}+/day. Recommended max: 140/day per domain.
                      </div>
                    )}
                  </div>

                  {/* Best Practices */}
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                      2026 Industry Best Practices
                    </h3>
                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• New domains: Start 10-20 emails/day, warmup 2-4 weeks</li>
                      <li>• Warmed domains: 30-50 emails/day per inbox (safe)</li>
                      <li>• Inbox-to-domain ratio: 2-3 inboxes per domain (optimal)</li>
                      <li>• Domain limit: Max 140 emails/day to avoid spam filters</li>
                      <li>• Warmup: 20-30 warmup emails/day with 30-45% response rate</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Waterfall Enrichment Section */}
            <CollapsibleSection title="Waterfall Enrichment" badge="NEW">
              <WaterfallBuilder waterfalls={waterfalls} onChange={setWaterfalls} />
            </CollapsibleSection>

            {/* Conversion Rate Assumptions - Redesigned */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex justify-between items-center text-left"
              >
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Benchmark Assumptions
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Industry-standard conversion rates from 2025-2026 research
                  </p>
                </div>
                <span className="text-slate-500">
                  {showAdvanced ? '▼' : '▶'}
                </span>
              </button>
              {showAdvanced && (
                <div className="mt-6 space-y-6">
                  {defaultConversionRates.map((rate, index) => (
                    <div key={rate.id} className="border-l-2 border-blue-500 dark:border-blue-400 pl-4 pb-4 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <label className="text-sm font-semibold text-slate-900 dark:text-white block mb-1">
                            {rate.name}
                          </label>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {rate.description}
                          </p>
                        </div>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400 ml-4 tabular-nums">
                          {(conversionRates[rate.id] * 100).toFixed(1)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={rate.min}
                        max={rate.max}
                        step="0.01"
                        value={conversionRates[rate.id]}
                        onChange={(e) => setConversionRates({ ...conversionRates, [rate.id]: Number(e.target.value) })}
                        className="w-full mb-3"
                      />
                      <div className="flex items-start gap-2 mt-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
                        <svg className="w-3 h-3 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                        </svg>
                        {rate.source_url ? (
                          <a
                            href={rate.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-tight"
                          >
                            {rate.source}
                          </a>
                        ) : (
                          <span className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
                            {rate.source}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {results && (
              <>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                    Campaign Funnel
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-400">Leads to Source</span>
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">
                        {results.leads_to_source.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-400">Valid Emails</span>
                      <span className="text-xl font-semibold text-slate-900 dark:text-white">
                        {results.valid_emails_needed.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-400">Emails to Send</span>
                      <span className="text-xl font-semibold text-slate-900 dark:text-white">
                        {results.emails_to_send.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-400">Expected Replies</span>
                      <span className="text-xl font-semibold text-slate-900 dark:text-white">
                        {results.expected_replies.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-400">Qualified Replies</span>
                      <span className="text-xl font-semibold text-slate-900 dark:text-white">
                        {results.expected_qualified_replies.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Expected Meetings</span>
                      <span className="text-xl font-semibold text-green-600 dark:text-green-400">
                        {results.expected_meetings.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
                  <h2 className="text-2xl font-semibold mb-4">Total Campaign Cost</h2>
                  <div className="text-5xl font-bold mb-6">
                    ${(results.total_cost_with_headcount ?? results.total_cost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-blue-200">Monthly Recurring</div>
                      <div className="text-xl font-semibold">
                        ${results.monthly_recurring.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div>
                      <div className="text-blue-200">Setup Costs</div>
                      <div className="text-xl font-semibold">
                        ${results.setup_costs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                  {results.headcount_cost && (
                    <div className="mt-4 pt-4 border-t border-blue-500">
                      <div className="text-blue-200">SDR Headcount Cost</div>
                      <div className="text-xl font-semibold">
                        ${results.headcount_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t border-blue-500">
                    <div className="text-blue-200">Cost Per Meeting</div>
                    <div className="text-3xl font-bold">
                      ${(results.cost_per_meeting_with_headcount ?? results.cost_per_meeting).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    {results.cost_per_meeting_with_headcount && (
                      <div className="text-xs text-blue-200 mt-1">
                        Tools only: ${results.cost_per_meeting.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Industry Benchmarks */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                    Industry Benchmarks
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Your cost per meeting</span>
                      <span className="text-lg font-semibold text-slate-900 dark:text-white">
                        ${(results.cost_per_meeting_with_headcount ?? results.cost_per_meeting).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Outsourced (low)</span>
                      <span className="text-lg font-semibold text-green-600 dark:text-green-400">$150</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Outsourced (high)</span>
                      <span className="text-lg font-semibold text-orange-600 dark:text-orange-400">$500</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
                    Source: Industry benchmark 2026
                  </p>
                </div>

                {/* Waterfall Analysis Results */}
                {results?.waterfall_analysis && results.waterfall_analysis.length > 0 && (
                  <CollapsibleSection title="Waterfall Analysis" defaultOpen>
                    <WaterfallVisualization analysis={results.waterfall_analysis} />
                  </CollapsibleSection>
                )}

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                    Cost Breakdown
                  </h2>
                  <div className="space-y-3">
                    {results.breakdown.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start pb-3 border-b border-slate-200 dark:border-slate-700 last:border-0">
                        <div className="flex-1">
                          <div className="font-medium text-slate-900 dark:text-white">
                            {item.category} - {item.provider}
                          </div>
                          {item.operation && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {item.operation}
                            </div>
                          )}
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {item.quantity.toLocaleString()} × ${item.unit_cost.toFixed(4)}
                          </div>
                          <a
                            href={item.citation_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            View pricing →
                          </a>
                          {item.notes && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                              {item.notes}
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            ${item.total.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-700">
          {/* GitHub Link */}
          <div className="flex justify-start mb-8">
            <a
              href="https://github.com/getaero-io/gtm-outbound-calculator"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <span>View on GitHub</span>
            </a>
          </div>

          {/* Secondary Info */}
          <div className="text-center text-xs text-slate-500 dark:text-slate-400 mb-8">
            <p>All conversion rates sourced from industry benchmarks (2025-2026)</p>
            <p className="mt-1">Built for GTM teams who need accurate cost estimates</p>
          </div>

          {/* Deepline Logo - Large and Centered */}
          <div className="flex flex-col items-center gap-4 pb-8">
            <a
              href="https://deepline.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
              aria-label="Powered by Deepline"
            >
              <svg width="242" height="56" viewBox="0 0 121 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="dark:invert">
                <path d="M32.6263 22.4428H26.9317V5.63802H32.7412C34.4096 5.63802 35.8429 5.97445 37.0409 6.6473C38.2443 7.31468 39.1688 8.27471 39.8143 9.52742C40.4598 10.7801 40.7826 12.279 40.7826 14.024C40.7826 15.7745 40.4571 17.2788 39.8061 18.537C39.1606 19.7952 38.2279 20.7607 37.008 21.4335C35.7936 22.1064 34.3331 22.4428 32.6263 22.4428ZM29.976 19.8089H32.4786C33.6493 19.8089 34.6257 19.5955 35.408 19.1688C36.1902 18.7367 36.7783 18.0939 37.1721 17.2406C37.566 16.3817 37.7629 15.3095 37.7629 14.024C37.7629 12.7385 37.566 11.6718 37.1721 10.8239C36.7783 9.97051 36.1957 9.33322 35.4244 8.91201C34.6585 8.48532 33.7067 8.27198 32.5689 8.27198H29.976V19.8089Z" fill="black"/>
                <path d="M48.6613 22.689C47.3976 22.689 46.3063 22.4264 45.3873 21.9013C44.4738 21.3706 43.7708 20.6212 43.2785 19.653C42.7862 18.6792 42.54 17.5332 42.54 16.2149C42.54 14.9184 42.7862 13.7806 43.2785 12.8014C43.7763 11.8167 44.471 11.0509 45.3627 10.5039C46.2543 9.95137 47.3019 9.67512 48.5054 9.67512C49.2822 9.67512 50.0152 9.80093 50.7044 10.0526C51.3992 10.2987 52.0118 10.6817 52.5425 11.2013C53.0786 11.721 53.4998 12.3829 53.8061 13.1871C54.1124 13.9857 54.2656 14.9376 54.2656 16.0426V16.9534H43.9349V14.9512H51.4183C51.4128 14.3823 51.2898 13.8763 51.0491 13.4332C50.8084 12.9847 50.472 12.6318 50.0398 12.3747C49.6131 12.1176 49.1153 11.9891 48.5464 11.9891C47.9392 11.9891 47.4058 12.1368 46.9463 12.4322C46.4868 12.7221 46.1285 13.105 45.8714 13.5809C45.6198 14.0514 45.4912 14.5683 45.4858 15.1318V16.8795C45.4858 17.6125 45.6198 18.2416 45.8878 18.7668C46.1559 19.2865 46.5306 19.6858 47.012 19.9648C47.4934 20.2383 48.0568 20.375 48.7023 20.375C49.1345 20.375 49.5256 20.3149 49.8757 20.1945C50.2258 20.0687 50.5294 19.8855 50.7865 19.6448C51.0436 19.4041 51.2378 19.1059 51.3691 18.7504L54.1425 19.0622C53.9675 19.7952 53.6338 20.4352 53.1415 20.9823C52.6546 21.5238 52.031 21.945 51.2706 22.2459C50.5102 22.5413 49.6405 22.689 48.6613 22.689Z" fill="black"/>
                <path d="M61.8961 22.689C60.6325 22.689 59.5412 22.4264 58.6221 21.9013C57.7086 21.3706 57.0057 20.6212 56.5133 19.653C56.021 18.6792 55.7748 17.5332 55.7748 16.2149C55.7748 14.9184 56.021 13.7806 56.5133 12.8014C57.0111 11.8167 57.7059 11.0509 58.5975 10.5039C59.4892 9.95137 60.5367 9.67512 61.7402 9.67512C62.517 9.67512 63.25 9.80093 63.9393 10.0526C64.634 10.2987 65.2467 10.6817 65.7773 11.2013C66.3134 11.721 66.7346 12.3829 67.0409 13.1871C67.3473 13.9857 67.5005 14.9376 67.5005 16.0426V16.9534H57.1698V14.9512H64.6532C64.6477 14.3823 64.5246 13.8763 64.2839 13.4332C64.0432 12.9847 63.7068 12.6318 63.2746 12.3747C62.848 12.1176 62.3502 11.9891 61.7812 11.9891C61.174 11.9891 60.6407 12.1368 60.1812 12.4322C59.7217 12.7221 59.3634 13.105 59.1063 13.5809C58.8546 14.0514 58.7261 14.5683 58.7206 15.1318V16.8795C58.7206 17.6125 58.8546 18.2416 59.1227 18.7668C59.3907 19.2865 59.7654 19.6858 60.2468 19.9648C60.7282 20.2383 61.2917 20.375 61.9371 20.375C62.3693 20.375 62.7604 20.3149 63.1105 20.1945C63.4606 20.0687 63.7642 19.8855 64.0213 19.6448C64.2784 19.4041 64.4726 19.1059 64.6039 18.7504L67.3774 19.0622C67.2023 19.7952 66.8686 20.4352 66.3763 20.9823C65.8894 21.5238 65.2658 21.945 64.5055 22.2459C63.7451 22.5413 62.8753 22.689 61.8961 22.689Z" fill="black"/>
                <path d="M69.5512 27.1692V9.83922H72.4724V11.9234H72.6447C72.7979 11.6171 73.014 11.2916 73.2929 10.947C73.5719 10.5969 73.9494 10.2987 74.4253 10.0526C74.9012 9.80093 75.5084 9.67512 76.2469 9.67512C77.2206 9.67512 78.0986 9.92401 78.8809 10.4218C79.6686 10.9141 80.2922 11.6444 80.7517 12.6127C81.2167 13.5754 81.4492 14.757 81.4492 16.1574C81.4492 17.5414 81.2222 18.7175 80.7681 19.6858C80.3141 20.654 79.6959 21.3925 78.9137 21.9013C78.1314 22.41 77.2452 22.6644 76.2551 22.6644C75.533 22.6644 74.934 22.544 74.4581 22.3033C73.9822 22.0626 73.5993 21.7727 73.3094 21.4335C73.0249 21.0889 72.8033 20.7634 72.6447 20.4571H72.5216V27.1692H69.5512ZM72.4642 16.141C72.4642 16.9561 72.5791 17.67 72.8088 18.2826C73.044 18.8953 73.3805 19.374 73.8181 19.7186C74.2612 20.0578 74.7973 20.2273 75.4264 20.2273C76.0828 20.2273 76.6326 20.0523 77.0757 19.7022C77.5188 19.3466 77.8524 18.8625 78.0767 18.2498C78.3065 17.6317 78.4214 16.9287 78.4214 16.141C78.4214 15.3588 78.3092 14.664 78.0849 14.0568C77.8607 13.4496 77.527 12.9737 77.0839 12.6291C76.6408 12.2845 76.0883 12.1121 75.4264 12.1121C74.7918 12.1121 74.253 12.279 73.8099 12.6127C73.3668 12.9464 73.0304 13.4141 72.8006 14.0158C72.5763 14.6175 72.4642 15.3259 72.4642 16.141Z" fill="black"/>
                <path d="M86.5011 5.63802V22.4428H83.5307V5.63802H86.5011Z" fill="black"/>
                <path d="M89.0935 22.4428V9.83922H92.0639V22.4428H89.0935ZM90.5869 8.05043C90.1164 8.05043 89.7116 7.89453 89.3725 7.58272C89.0333 7.26544 88.8637 6.88526 88.8637 6.44216C88.8637 5.9936 89.0333 5.61341 89.3725 5.3016C89.7116 4.98432 90.1164 4.82568 90.5869 4.82568C91.0628 4.82568 91.4676 4.98432 91.8013 5.3016C92.1404 5.61341 92.31 5.9936 92.31 6.44216C92.31 6.88526 92.1404 7.26544 91.8013 7.58272C91.4676 7.89453 91.0628 8.05043 90.5869 8.05043Z" fill="black"/>
                <path d="M97.6266 15.0579V22.4428H94.6562V9.83922H97.4953V11.9809H97.643C97.9329 11.2752 98.3952 10.7145 99.0297 10.2987C99.6697 9.88299 100.46 9.67512 101.401 9.67512C102.271 9.67512 103.029 9.86111 103.674 10.2331C104.325 10.6051 104.828 11.1439 105.184 11.8496C105.545 12.5552 105.723 13.4113 105.717 14.4179V22.4428H102.747V14.8774C102.747 14.035 102.528 13.3758 102.09 12.8999C101.658 12.4239 101.059 12.186 100.293 12.186C99.7737 12.186 99.3114 12.3009 98.9066 12.5306C98.5073 12.7549 98.1928 13.0804 97.963 13.5071C97.7387 13.9338 97.6266 14.4507 97.6266 15.0579Z" fill="black"/>
                <path d="M113.854 22.689C112.591 22.689 111.499 22.4264 110.58 21.9013C109.667 21.3706 108.964 20.6212 108.472 19.653C107.979 18.6792 107.733 17.5332 107.733 16.2149C107.733 14.9184 107.979 13.7806 108.472 12.8014C108.969 11.8167 109.664 11.0509 110.556 10.5039C111.447 9.95137 112.495 9.67512 113.698 9.67512C114.475 9.67512 115.208 9.80093 115.898 10.0526C116.592 10.2987 117.205 10.6817 117.736 11.2013C118.272 11.721 118.693 12.3829 118.999 13.1871C119.306 13.9857 119.459 14.9376 119.459 16.0426V16.9534H109.128V14.9512H116.611C116.606 14.3823 116.483 13.8763 116.242 13.4332C116.001 12.9847 115.665 12.6318 115.233 12.3747C114.806 12.1176 114.308 11.9891 113.739 11.9891C113.132 11.9891 112.599 12.1368 112.139 12.4322C111.68 12.7221 111.322 13.105 111.065 13.5809C110.813 14.0514 110.684 14.5683 110.679 15.1318V16.8795C110.679 17.6125 110.813 18.2416 111.081 18.7668C111.349 19.2865 111.724 19.6858 112.205 19.9648C112.686 20.2383 113.25 20.375 113.895 20.375C114.328 20.375 114.719 20.3149 115.069 20.1945C115.419 20.0687 115.722 19.8855 115.98 19.6448C116.237 19.4041 116.431 19.1059 116.562 18.7504L119.336 19.0622C119.161 19.7952 118.827 20.4352 118.335 20.9823C117.848 21.5238 117.224 21.945 116.464 22.2459C115.703 22.5413 114.834 22.689 113.854 22.689Z" fill="black"/>
                <path d="M14.8479 11.4035C14.8479 9.57382 13.3311 8.09054 11.4599 8.09054H0.00494977V5.26204H11.4599C14.9286 5.26204 17.7404 8.01166 17.7405 11.4035V22.7888H14.8479V11.4035ZM2.89599 13.4993V19.958H8.89317V22.7865H0.0034555V13.4993H2.89599ZM13.3152 22.7888H10.4226V12.2062H0V9.37757H11.0514C12.3017 9.37759 13.3152 10.3687 13.3152 11.5913V22.7888Z" fill="black"/>
              </svg>
            </a>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              © 2026 Aero AI Labs, Inc. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
