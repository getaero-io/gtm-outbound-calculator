'use client';

import { useState } from 'react';
import type { WaterfallConfig, WaterfallStep } from '@/lib/types';
import { providers } from '@/data/provider-pricing';

interface WaterfallBuilderProps {
  waterfalls: WaterfallConfig[];
  onChange: (waterfalls: WaterfallConfig[]) => void;
}

export function WaterfallBuilder({ waterfalls, onChange }: WaterfallBuilderProps) {
  const [activeCategory, setActiveCategory] = useState<'email_finding' | 'phone_finding' | 'email_verification'>('email_finding');

  const addWaterfall = () => {
    const newWaterfall: WaterfallConfig = {
      id: `waterfall-${Date.now()}`,
      name: `${activeCategory.replace('_', ' ')} Waterfall`,
      category: activeCategory,
      enabled: true,
      steps: [],
    };
    onChange([...waterfalls, newWaterfall]);
  };

  const removeWaterfall = (id: string) => {
    onChange(waterfalls.filter((w) => w.id !== id));
  };

  const addStepToWaterfall = (waterfallId: string, providerId: string) => {
    onChange(
      waterfalls.map((w) => {
        if (w.id !== waterfallId) return w;

        const newStep: WaterfallStep = {
          id: `step-${Date.now()}`,
          provider_id: providerId,
          order: w.steps.length + 1,
          expected_coverage_rate: 0.6, // Default 60% coverage
        };

        return { ...w, steps: [...w.steps, newStep] };
      })
    );
  };

  const removeStepFromWaterfall = (waterfallId: string, stepId: string) => {
    onChange(
      waterfalls.map((w) => {
        if (w.id !== waterfallId) return w;

        const newSteps = w.steps
          .filter((s) => s.id !== stepId)
          .map((s, index) => ({ ...s, order: index + 1 })); // Reorder

        return { ...w, steps: newSteps };
      })
    );
  };

  const updateStepCoverage = (waterfallId: string, stepId: string, coverage: number) => {
    onChange(
      waterfalls.map((w) => {
        if (w.id !== waterfallId) return w;

        return {
          ...w,
          steps: w.steps.map((s) =>
            s.id === stepId ? { ...s, expected_coverage_rate: coverage / 100 } : s
          ),
        };
      })
    );
  };

  const toggleWaterfall = (id: string) => {
    onChange(
      waterfalls.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
  };

  const getProvidersForCategory = (category: WaterfallConfig['category']) => {
    const categoryMap = {
      email_finding: 'email_finding',
      phone_finding: 'phone_finding',
      email_verification: 'email_verification',
    };
    return providers.filter((p) => p.category === categoryMap[category]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Waterfall Enrichment</h3>
          <p className="text-sm text-neutral-600 mt-1">
            Configure sequential provider fallback to maximize coverage
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value as any)}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
          >
            <option value="email_finding">Email Finding</option>
            <option value="phone_finding">Phone Finding</option>
            <option value="email_verification">Email Verification</option>
          </select>
          <button
            onClick={addWaterfall}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            + Add Waterfall
          </button>
        </div>
      </div>

      {waterfalls.length === 0 ? (
        <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center">
          <p className="text-neutral-600">
            No waterfalls configured. Click "Add Waterfall" to create your first sequential enrichment flow.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {waterfalls.map((waterfall) => (
            <div
              key={waterfall.id}
              className="border border-neutral-200 rounded-lg p-5 bg-neutral-50"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={waterfall.enabled}
                    onChange={() => toggleWaterfall(waterfall.id)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <h4 className="font-medium text-neutral-900">{waterfall.name}</h4>
                    <p className="text-xs text-neutral-500 capitalize">
                      {waterfall.category.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeWaterfall(waterfall.id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-3">
                {waterfall.steps.map((step, index) => {
                  const provider = providers.find((p) => p.id === step.provider_id);
                  return (
                    <div
                      key={step.id}
                      className="flex items-center gap-3 bg-white p-3 rounded border border-neutral-200"
                    >
                      <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                        {step.order}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{provider?.name || 'Unknown'}</p>
                        <p className="text-xs text-neutral-500">
                          Expected coverage: {(step.expected_coverage_rate * 100).toFixed(0)}%
                        </p>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={(step.expected_coverage_rate * 100).toFixed(0)}
                        onChange={(e) =>
                          updateStepCoverage(waterfall.id, step.id, parseInt(e.target.value) || 60)
                        }
                        className="w-20 px-2 py-1 border border-neutral-300 rounded text-sm"
                      />
                      <span className="text-xs text-neutral-500">%</span>
                      <button
                        onClick={() => removeStepFromWaterfall(waterfall.id, step.id)}
                        className="text-red-600 hover:text-red-700 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}

                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addStepToWaterfall(waterfall.id, e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white"
                  defaultValue=""
                >
                  <option value="" disabled>
                    + Add provider to sequence
                  </option>
                  {getProvidersForCategory(waterfall.category).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 text-sm mb-2">How Waterfalls Work</h4>
        <p className="text-xs text-blue-800">
          Each step in a waterfall processes contacts that failed in previous steps. For example:
          if Step 1 (Apollo) finds 600/1000 emails (60%), Step 2 (Hunter) will process the
          remaining 400 contacts. This maximizes coverage while controlling costs.
        </p>
      </div>
    </div>
  );
}
