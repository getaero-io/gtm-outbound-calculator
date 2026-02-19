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
                      <option key={p.id} value={p.id}>{p.name}</option>
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
                      <option key={p.id} value={p.id}>{p.name}</option>
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
                      <option key={p.id} value={p.id}>{p.name}</option>
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
                    {emailSendingProviders.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
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
      </div>
    </div>
  );
}
