'use client';

import { useState, useEffect } from 'react';
import { calculateCampaignCosts } from '@/lib/calculator';
import { providers } from '@/data/provider-pricing';
import { conversionRates as defaultConversionRates } from '@/data/conversion-rates';
import type { CalculatorInput, CalculatorOutput, EnrichmentConfig } from '@/lib/types';

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
  const [results, setResults] = useState<CalculatorOutput | null>(null);

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
    };

    const output = calculateCampaignCosts(input);
    setResults(output);
  }, [meetingsNeeded, selectedProviders, conversionRates, enrichments]);

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
                            Cost per unit: ${enrichment.cost_per_unit.toFixed(4)}
                          </label>
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

            {/* Advanced Settings */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex justify-between items-center text-left"
              >
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Conversion Rate Assumptions
                </h2>
                <span className="text-slate-500">
                  {showAdvanced ? '▼' : '▶'}
                </span>
              </button>
              {showAdvanced && (
                <div className="mt-6 space-y-4">
                  {defaultConversionRates.map((rate) => (
                    <div key={rate.id}>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {rate.name}
                        </label>
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
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
                        className="w-full"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {rate.description}
                      </p>
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
                    ${results.total_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  <div className="mt-4 pt-4 border-t border-blue-500">
                    <div className="text-blue-200">Cost Per Meeting</div>
                    <div className="text-3xl font-bold">
                      ${results.cost_per_meeting.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

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
