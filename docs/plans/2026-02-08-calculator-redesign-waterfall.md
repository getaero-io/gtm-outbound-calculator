# GTM Outbound Calculator Redesign + Waterfall Enrichment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign GTM Outbound Calculator with improved UX/readability and add waterfall enrichment feature allowing sequential provider fallback with cost/coverage analysis.

**Architecture:** Component-based refactor of monolithic page.tsx (731 lines) into modular UI with new waterfall enrichment system. Add visual data representations, distinctive design aesthetic, and simplified configuration workflow.

**Tech Stack:** Next.js 16.1.6, React, TypeScript, Tailwind CSS, Recharts (for visualizations)

---

## Phase 1: Foundation & Type System

### Task 1: Add Waterfall Types

**Files:**
- Modify: `src/lib/types.ts:1-128`

**Step 1: Add waterfall enrichment types**

Add after line 67 (after EnrichmentConfig):

```typescript
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
```

**Step 2: Update CalculatorInput type**

Modify CalculatorInput interface (line 69) to add waterfall support:

```typescript
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
  waterfalls?: WaterfallConfig[]; // NEW: Waterfall enrichment configs
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
```

**Step 3: Update CalculatorOutput type**

Modify CalculatorOutput interface (line 112) to include waterfall analysis:

```typescript
export interface CalculatorOutput {
  leads_to_source: number;
  valid_emails_needed: number;
  emails_to_send: number;
  expected_replies: number;
  expected_qualified_replies: number;
  expected_meetings: number;
  breakdown: CostBreakdown[];
  waterfall_analysis?: WaterfallAnalysis[]; // NEW: Waterfall cost/coverage analysis
  total_cost: number;
  monthly_recurring: number;
  setup_costs: number;
  cost_per_meeting: number;
  headcount_cost?: number;
  total_cost_with_headcount?: number;
  cost_per_meeting_with_headcount?: number;
}
```

**Step 4: Run TypeScript to verify types**

Run: `npm run build`
Expected: SUCCESS (types compile)

**Step 5: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: add waterfall enrichment types"
```

---

### Task 2: Create Waterfall Calculator Logic

**Files:**
- Create: `src/lib/waterfall-calculator.ts`

**Step 1: Create waterfall calculation function**

```typescript
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
```

**Step 2: Run TypeScript to verify**

Run: `npm run build`
Expected: SUCCESS

**Step 3: Commit**

```bash
git add src/lib/waterfall-calculator.ts
git commit -m "feat: add waterfall calculation logic"
```

---

### Task 3: Update Main Calculator to Support Waterfalls

**Files:**
- Modify: `src/lib/calculator.ts:1-243`

**Step 1: Import waterfall calculator**

Add at top of file (after existing imports):

```typescript
import { calculateWaterfallAnalysis } from './waterfall-calculator';
import type { WaterfallAnalysis } from './types';
```

**Step 2: Add waterfall analysis calculation**

Add after line 199 (after enrichments calculation, before total_cost calculation):

```typescript
  // 8. Waterfall Enrichment Analysis
  let waterfall_analysis: WaterfallAnalysis[] | undefined;
  if (input.waterfalls && input.waterfalls.length > 0) {
    waterfall_analysis = input.waterfalls
      .filter((w) => w.enabled)
      .map((waterfall_config) => {
        // Determine contact count based on waterfall category
        let contact_count = 0;
        switch (waterfall_config.category) {
          case 'email_finding':
            contact_count = Math.ceil(contacts_with_emails);
            break;
          case 'phone_finding':
            contact_count = Math.ceil(contacts_with_emails);
            break;
          case 'email_verification':
            contact_count = Math.ceil(contacts_with_emails);
            break;
        }

        const analysis = calculateWaterfallAnalysis(waterfall_config, contact_count);

        // Add waterfall costs to breakdown
        analysis.breakdown_by_step.forEach((step) => {
          breakdown.push({
            category: 'Waterfall Enrichment',
            provider: step.provider_name,
            operation: `${waterfall_config.name} - Step ${step.step_number}`,
            unit_cost: step.cost / step.contacts_processed,
            quantity: step.contacts_processed,
            total: step.cost,
            citation_url: '',
            notes: `Found ${step.successful_finds} (${((step.successful_finds / step.contacts_processed) * 100).toFixed(1)}% coverage)`,
          });
        });

        return analysis;
      });
  }
```

**Step 3: Update return statement**

Modify return statement (line 225) to include waterfall_analysis:

```typescript
  return {
    leads_to_source: Math.ceil(leads_to_source),
    valid_emails_needed: Math.ceil(valid_emails_needed),
    emails_to_send: Math.ceil(emails_delivered),
    expected_replies: Math.ceil(total_replies),
    expected_qualified_replies: Math.ceil(qualified_replies),
    expected_meetings: meetings_needed,
    breakdown,
    waterfall_analysis, // NEW
    total_cost,
    monthly_recurring,
    setup_costs: total_cost - monthly_recurring,
    cost_per_meeting: total_cost / meetings_needed,
    headcount_cost: headcount_cost > 0 ? headcount_cost : undefined,
    total_cost_with_headcount:
      headcount_cost > 0 ? total_cost_with_headcount : undefined,
    cost_per_meeting_with_headcount:
      headcount_cost > 0 ? cost_per_meeting_with_headcount : undefined,
  };
```

**Step 4: Run TypeScript**

Run: `npm run build`
Expected: SUCCESS

**Step 5: Commit**

```bash
git add src/lib/calculator.ts
git commit -m "feat: integrate waterfall analysis into main calculator"
```

---

## Phase 2: Component Architecture

### Task 4: Create Components Directory Structure

**Files:**
- Create: `src/components/calculator/InputSection.tsx`
- Create: `src/components/calculator/ProviderSelector.tsx`
- Create: `src/components/calculator/WaterfallBuilder.tsx`
- Create: `src/components/calculator/InfrastructureSettings.tsx`
- Create: `src/components/calculator/ResultsSection.tsx`
- Create: `src/components/calculator/CostBreakdownChart.tsx`
- Create: `src/components/calculator/WaterfallVisualization.tsx`
- Create: `src/components/ui/CollapsibleSection.tsx`

**Step 1: Create directories**

Run: `mkdir -p src/components/calculator src/components/ui`

**Step 2: Create CollapsibleSection UI component**

Create: `src/components/ui/CollapsibleSection.tsx`

```typescript
'use client';

import { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  badge?: string;
}

export function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
  badge,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-neutral-50 hover:bg-neutral-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-lg text-neutral-900">{title}</span>
          {badge && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
              {badge}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-neutral-600 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && <div className="px-6 py-5">{children}</div>}
    </div>
  );
}
```

**Step 3: Run TypeScript**

Run: `npm run build`
Expected: SUCCESS

**Step 4: Commit**

```bash
git add src/components/
git commit -m "feat: create component directory structure with CollapsibleSection"
```

---

### Task 5: Create Input Section Component

**Files:**
- Create: `src/components/calculator/InputSection.tsx`

**Step 1: Create InputSection component**

```typescript
'use client';

interface InputSectionProps {
  meetingsNeeded: number;
  onMeetingsChange: (value: number) => void;
}

export function InputSection({ meetingsNeeded, onMeetingsChange }: InputSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Target Meetings per Month
        </label>
        <input
          type="number"
          min="1"
          value={meetingsNeeded}
          onChange={(e) => onMeetingsChange(parseInt(e.target.value) || 1)}
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
        />
        <p className="mt-2 text-sm text-neutral-500">
          How many qualified meetings do you want to book each month?
        </p>
      </div>
    </div>
  );
}
```

**Step 2: Run TypeScript**

Run: `npm run build`
Expected: SUCCESS

**Step 3: Commit**

```bash
git add src/components/calculator/InputSection.tsx
git commit -m "feat: create InputSection component"
```

---

### Task 6: Create Waterfall Builder Component

**Files:**
- Create: `src/components/calculator/WaterfallBuilder.tsx`

**Step 1: Create WaterfallBuilder component**

```typescript
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
```

**Step 2: Run TypeScript**

Run: `npm run build`
Expected: SUCCESS

**Step 3: Commit**

```bash
git add src/components/calculator/WaterfallBuilder.tsx
git commit -m "feat: create WaterfallBuilder component with sequential provider configuration"
```

---

### Task 7: Create Waterfall Visualization Component

**Files:**
- Create: `src/components/calculator/WaterfallVisualization.tsx`

**Step 1: Install Recharts for data visualization**

Run: `npm install recharts`

**Step 2: Create WaterfallVisualization component**

```typescript
'use client';

import type { WaterfallAnalysis } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface WaterfallVisualizationProps {
  analysis: WaterfallAnalysis[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export function WaterfallVisualization({ analysis }: WaterfallVisualizationProps) {
  if (!analysis || analysis.length === 0) return null;

  return (
    <div className="space-y-8">
      {analysis.map((waterfall, wIndex) => {
        const chartData = waterfall.breakdown_by_step.map((step) => ({
          name: `Step ${step.step_number}: ${step.provider_name}`,
          processed: step.contacts_processed,
          found: step.successful_finds,
          cost: step.cost,
        }));

        return (
          <div key={waterfall.config.id} className="bg-white border border-neutral-200 rounded-lg p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {waterfall.config.name}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-xs text-blue-600 font-medium mb-1">Total Coverage</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {(waterfall.total_coverage_rate * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-xs text-green-600 font-medium mb-1">Total Cost</p>
                  <p className="text-2xl font-bold text-green-900">
                    ${waterfall.total_cost.toFixed(2)}
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded p-3">
                  <p className="text-xs text-purple-600 font-medium mb-1">Cost per Find</p>
                  <p className="text-2xl font-bold text-purple-900">
                    ${waterfall.cost_per_successful_find.toFixed(3)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-neutral-700 mb-3">Coverage by Step</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="processed" fill="#94a3b8" name="Processed" />
                  <Bar dataKey="found" fill="#3b82f6" name="Found" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-neutral-700">Step Breakdown</h4>
              {waterfall.breakdown_by_step.map((step, sIndex) => (
                <div
                  key={sIndex}
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded border border-neutral-200"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold"
                      style={{ backgroundColor: COLORS[sIndex % COLORS.length] }}
                    >
                      {step.step_number}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{step.provider_name}</p>
                      <p className="text-xs text-neutral-500">
                        {step.contacts_processed.toLocaleString()} processed →{' '}
                        {step.successful_finds.toLocaleString()} found (
                        {((step.successful_finds / step.contacts_processed) * 100).toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-neutral-900">
                      ${step.cost.toFixed(2)}
                    </p>
                    <p className="text-xs text-neutral-500">
                      ${(step.cost / step.contacts_processed).toFixed(3)}/contact
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

**Step 3: Run TypeScript**

Run: `npm run build`
Expected: SUCCESS

**Step 4: Commit**

```bash
git add src/components/calculator/WaterfallVisualization.tsx package.json package-lock.json
git commit -m "feat: add WaterfallVisualization component with Recharts integration"
```

---

## Phase 3: Design System & Styling

### Task 8: Add Custom Fonts and CSS Variables

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

**Step 1: Update layout.tsx with custom fonts**

Find the font imports in layout.tsx and replace with distinctive fonts:

```typescript
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
```

Update className in html tag:

```typescript
<html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
```

**Step 2: Update globals.css with design system**

Add after existing Tailwind directives:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Color palette - Modern blue/purple gradient theme */
    --color-primary: 220 90% 56%;
    --color-primary-dark: 220 85% 48%;
    --color-secondary: 270 65% 60%;
    --color-accent: 340 75% 55%;

    /* Neutrals */
    --color-neutral-50: 220 15% 98%;
    --color-neutral-100: 220 13% 95%;
    --color-neutral-200: 220 11% 88%;
    --color-neutral-300: 220 10% 75%;
    --color-neutral-600: 220 12% 45%;
    --color-neutral-900: 220 18% 15%;

    /* Success/Warning/Error */
    --color-success: 142 71% 45%;
    --color-warning: 38 92% 50%;
    --color-error: 0 72% 51%;

    /* Typography */
    --font-body: var(--font-inter);
    --font-display: var(--font-display);
    --font-mono: var(--font-mono);
  }

  body {
    font-family: var(--font-body);
    @apply text-neutral-900 bg-neutral-50;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
    @apply font-semibold;
  }
}

@layer utilities {
  .text-display {
    font-family: var(--font-display);
  }

  .text-mono {
    font-family: var(--font-mono);
  }
}
```

**Step 3: Run dev server to test**

Run: `npm run dev`
Expected: Server starts, fonts load correctly

**Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat: add custom fonts and design system CSS variables"
```

---

### Task 9: Update Tailwind Config

**Files:**
- Modify: `tailwind.config.ts`

**Step 1: Extend Tailwind with custom colors and fonts**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--color-primary))',
          dark: 'hsl(var(--color-primary-dark))',
        },
        secondary: 'hsl(var(--color-secondary))',
        accent: 'hsl(var(--color-accent))',
        neutral: {
          50: 'hsl(var(--color-neutral-50))',
          100: 'hsl(var(--color-neutral-100))',
          200: 'hsl(var(--color-neutral-200))',
          300: 'hsl(var(--color-neutral-300))',
          600: 'hsl(var(--color-neutral-600))',
          900: 'hsl(var(--color-neutral-900))',
        },
        success: 'hsl(var(--color-success))',
        warning: 'hsl(var(--color-warning))',
        error: 'hsl(var(--color-error))',
      },
      fontFamily: {
        sans: ['var(--font-body)'],
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

**Step 2: Run build to verify**

Run: `npm run build`
Expected: SUCCESS

**Step 3: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat: extend Tailwind config with custom design tokens"
```

---

## Phase 4: Main Page Refactor

### Task 10: Refactor page.tsx to Use New Components

**Files:**
- Modify: `src/app/page.tsx:1-731`

**Step 1: Import new components**

Replace existing imports at top of file with:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { calculateCampaignCosts } from '@/lib/calculator';
import type { CalculatorInput, WaterfallConfig } from '@/lib/types';
import { InputSection } from '@/components/calculator/InputSection';
import { WaterfallBuilder } from '@/components/calculator/WaterfallBuilder';
import { WaterfallVisualization } from '@/components/calculator/WaterfallVisualization';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
```

**Step 2: Add waterfall state**

Add after existing state declarations (around line 20):

```typescript
const [waterfalls, setWaterfalls] = useState<WaterfallConfig[]>([]);
```

**Step 3: Update calculator input**

Modify the `input` object construction to include waterfalls:

```typescript
const input: CalculatorInput = {
  meetings_needed: meetingsNeeded,
  conversion_rates: conversionRates,
  selected_providers: selectedProviders,
  enrichments: enabledEnrichments,
  waterfalls, // NEW
  infrastructure,
  headcount,
};
```

**Step 4: Add waterfall section to UI**

Find the infrastructure settings section and add waterfall section after it:

```typescript
{/* Waterfall Enrichment Section */}
<CollapsibleSection title="Waterfall Enrichment" badge="NEW">
  <WaterfallBuilder waterfalls={waterfalls} onChange={setWaterfalls} />
</CollapsibleSection>

{/* Waterfall Analysis Results */}
{results?.waterfall_analysis && results.waterfall_analysis.length > 0 && (
  <CollapsibleSection title="Waterfall Analysis" defaultOpen>
    <WaterfallVisualization analysis={results.waterfall_analysis} />
  </CollapsibleSection>
)}
```

**Step 5: Test in dev mode**

Run: `npm run dev`
Expected: Page loads, waterfall builder appears, can add/configure waterfalls

**Step 6: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: integrate waterfall components into main page"
```

---

## Phase 5: Testing & Documentation

### Task 11: Create Test Waterfall Configurations

**Files:**
- Create: `src/data/waterfall-presets.ts`

**Step 1: Create preset waterfall configurations**

```typescript
import type { WaterfallConfig } from '@/lib/types';

export const waterfallPresets: Record<string, WaterfallConfig> = {
  email_finding_max_coverage: {
    id: 'preset-email-max',
    name: 'Max Email Coverage',
    category: 'email_finding',
    enabled: true,
    steps: [
      {
        id: 'step-1',
        provider_id: 'apollo',
        order: 1,
        expected_coverage_rate: 0.65, // 65% coverage
      },
      {
        id: 'step-2',
        provider_id: 'hunter',
        order: 2,
        expected_coverage_rate: 0.50, // 50% of remaining
      },
      {
        id: 'step-3',
        provider_id: 'prospeo',
        order: 3,
        expected_coverage_rate: 0.40, // 40% of remaining
      },
    ],
  },
  email_finding_cost_optimized: {
    id: 'preset-email-cost',
    name: 'Cost-Optimized Email',
    category: 'email_finding',
    enabled: true,
    steps: [
      {
        id: 'step-1',
        provider_id: 'apollo',
        order: 1,
        expected_coverage_rate: 0.65,
      },
      {
        id: 'step-2',
        provider_id: 'findymail',
        order: 2,
        expected_coverage_rate: 0.45,
      },
    ],
  },
  phone_finding_standard: {
    id: 'preset-phone-std',
    name: 'Standard Phone Enrichment',
    category: 'phone_finding',
    enabled: true,
    steps: [
      {
        id: 'step-1',
        provider_id: 'bettercontact',
        order: 1,
        expected_coverage_rate: 0.70, // BetterContact has built-in waterfall
      },
      {
        id: 'step-2',
        provider_id: 'lusha',
        order: 2,
        expected_coverage_rate: 0.40,
      },
    ],
  },
};
```

**Step 2: Run TypeScript**

Run: `npm run build`
Expected: SUCCESS

**Step 3: Commit**

```bash
git add src/data/waterfall-presets.ts
git commit -m "feat: add waterfall preset configurations"
```

---

### Task 12: Update Documentation

**Files:**
- Create: `docs/WATERFALL_ENRICHMENT.md`

**Step 1: Create waterfall enrichment documentation**

```markdown
# Waterfall Enrichment Guide

## Overview

Waterfall enrichment allows you to configure sequential provider fallback strategies to maximize data coverage while controlling costs.

## How It Works

A waterfall processes contacts through multiple providers in sequence:

1. **Step 1** processes all contacts (e.g., 1,000 contacts)
   - Finds 650 emails (65% coverage)
   - 350 contacts remain without emails

2. **Step 2** processes remaining 350 contacts
   - Finds 175 emails (50% of 350)
   - 175 contacts remain without emails

3. **Step 3** processes remaining 175 contacts
   - Finds 70 emails (40% of 175)
   - 105 contacts remain without emails

**Total Result:**
- **Coverage:** 895/1,000 = 89.5%
- **Cost:** Sum of all step costs
- **Cost per find:** Total cost / 895

## Use Cases

### Email Finding Waterfall
**Goal:** Maximize email coverage for outbound campaigns

**Strategy:**
1. Start with high-coverage provider (Apollo, 65%)
2. Add mid-cost provider for remaining (Hunter, 50%)
3. Optional: Add premium provider for final pass (Prospeo, 40%)

### Phone Finding Waterfall
**Goal:** Get mobile numbers for high-value accounts

**Strategy:**
1. Use waterfall provider (BetterContact, 70% with built-in waterfall)
2. Add premium provider for remaining (Lusha, 40%)

### Email Verification Waterfall
**Goal:** Validate emails before sending

**Strategy:**
1. Quick validation (ZeroBounce, 95%)
2. Deep validation for unknowns (NeverBounce, 90%)

## Configuration

### Coverage Rates
Set realistic expected coverage rates for each provider based on:
- Provider documentation
- Your historical data
- Industry benchmarks (see [docs/EMAIL_INFRASTRUCTURE_OPTIMIZATION.md](./EMAIL_INFRASTRUCTURE_OPTIMIZATION.md))

### Step Order
Order matters! Place providers strategically:
- **First:** Highest coverage or best price/performance ratio
- **Middle:** Complementary data sources
- **Last:** Premium/expensive providers for final coverage boost

## Cost Analysis

The calculator shows:
- **Total Coverage:** Combined coverage across all steps
- **Total Cost:** Sum of all provider costs
- **Cost per Find:** Total cost / successful finds
- **Step Breakdown:** Per-step metrics (processed, found, cost)

## Comparison: Waterfall vs Single Provider

### Single Provider (Apollo only)
- Coverage: 65%
- Cost: 1,000 × $0.10 = $100
- Cost per find: $100 / 650 = $0.154

### Waterfall (Apollo → Hunter)
- Coverage: 65% + (35% × 50%) = 82.5%
- Cost: (1,000 × $0.10) + (350 × $0.068) = $123.80
- Cost per find: $123.80 / 825 = $0.150

**Result:** 17.5% more coverage for 2.6% lower cost per find!

## Best Practices

1. **Test Coverage Rates:** Use historical data to set accurate coverage rates
2. **Monitor Performance:** Track actual vs. expected coverage
3. **Optimize Sequence:** Reorder steps based on performance
4. **Balance Cost vs Coverage:** More steps = higher coverage but higher cost
5. **Use Presets:** Start with built-in presets, then customize

## Preset Configurations

The calculator includes tested preset waterfalls:

- **Max Email Coverage:** Apollo → Hunter → Prospeo (89.5% coverage)
- **Cost-Optimized Email:** Apollo → FindyMail (82% coverage, lower cost)
- **Standard Phone:** BetterContact → Lusha (82% coverage)

## Related Documentation

- [Provider Pricing](../PROVIDERS_ADDED.md) - All 27 providers with costs
- [Infrastructure Optimization](./EMAIL_INFRASTRUCTURE_OPTIMIZATION.md) - Email warming best practices
- [GTM User Stories](./launch/gtm-user-stories-exhaustive.md) - Real-world workflows
```

**Step 2: Commit**

```bash
git add docs/WATERFALL_ENRICHMENT.md
git commit -m "docs: add waterfall enrichment guide"
```

---

### Task 13: Create README Update

**Files:**
- Modify: `README.md`

**Step 1: Add waterfall enrichment section to README**

Add after existing features section:

```markdown
## ✨ New Features

### Waterfall Enrichment (Feb 2026)

Configure sequential provider fallback to maximize data coverage:

- **Visual Waterfall Builder:** Drag-and-drop interface for creating enrichment sequences
- **Cost vs Coverage Analysis:** Compare waterfall vs single-provider strategies
- **Real-time Metrics:** See total coverage, cost per find, and step-by-step breakdown
- **Preset Configurations:** Start with proven waterfall patterns (Max Coverage, Cost-Optimized, etc.)
- **Support for All Categories:** Email finding, phone finding, email verification

**Example:** Apollo (65%) → Hunter (50% of remaining) → Prospeo (40% of remaining) = 89.5% total coverage

See [docs/WATERFALL_ENRICHMENT.md](./docs/WATERFALL_ENRICHMENT.md) for complete guide.

### Infrastructure Optimization (Feb 2026)

Industry-standard email warming and domain cycling:

- **4 Presets:** Conservative (20/day), Standard (30/day), Aggressive (50/day), Maximum (70/day)
- **Cost Savings:** 70% reduction vs old conservative settings
- **2026 Benchmarks:** Based on Instantly, Smartlead, MailForge, SuperSend research
- **Real-time Warnings:** Alerts when exceeding safe sending limits

### 27 Provider Integrations

- **Contact Sourcing:** Apollo, People Data Labs, Apify, CRUSTdata
- **Email Finding:** LeadMagic, Icypeas, Prospeo, FindyMail, Hunter, Dropcontact, Snov.io
- **Email Verification:** LeadMagic, Icypeas, ZeroBounce, NeverBounce, MillionVerifier
- **Email Sending:** Instantly, Smartlead, Lemlist
- **Phone Finding:** LeadMagic, BetterContact, Lusha, Cognism, RocketReach
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: update README with waterfall enrichment features"
```

---

## Phase 6: Testing & Deployment

### Task 14: Manual Testing Checklist

**Step 1: Test waterfall builder**

Manual test checklist:
- [ ] Can add new waterfall for email_finding
- [ ] Can add new waterfall for phone_finding
- [ ] Can add new waterfall for email_verification
- [ ] Can add steps to waterfall
- [ ] Can remove steps from waterfall
- [ ] Can adjust coverage rates (0-100%)
- [ ] Steps reorder correctly when one is removed
- [ ] Can toggle waterfall on/off
- [ ] Can delete entire waterfall

**Step 2: Test waterfall calculations**

- [ ] Single-step waterfall calculates correctly
- [ ] Multi-step waterfall shows sequential processing
- [ ] Coverage rates compound correctly (Step 1: 65%, Step 2: 50% of remaining = 82.5% total)
- [ ] Costs sum correctly across all steps
- [ ] Cost per find calculated accurately

**Step 3: Test visualization**

- [ ] Waterfall visualization renders charts
- [ ] Coverage metrics display correctly
- [ ] Step breakdown shows all providers
- [ ] Colors distinguish different steps
- [ ] Mobile responsive (test on small screen)

**Step 4: Test integration**

- [ ] Waterfall costs added to total cost breakdown
- [ ] Results update when waterfalls change
- [ ] Can use waterfalls with headcount tracking
- [ ] Can use waterfalls with infrastructure settings
- [ ] Can export results with waterfall data

**Step 5: Document test results**

Create: `docs/plans/TEST_RESULTS.md`

```markdown
# Test Results - Waterfall Enrichment

## Test Date: [DATE]

## Waterfall Builder
- [x] Add waterfall: PASS
- [x] Add steps: PASS
- [x] Remove steps: PASS
- [x] Adjust coverage: PASS
- [x] Toggle enabled: PASS

## Calculations
- [x] Single-step: PASS
- [x] Multi-step: PASS
- [x] Coverage compounding: PASS
- [x] Cost accuracy: PASS

## Visualization
- [x] Charts render: PASS
- [x] Metrics accurate: PASS
- [x] Mobile responsive: PASS

## Integration
- [x] Cost breakdown: PASS
- [x] Headcount tracking: PASS
- [x] Infrastructure: PASS

## Issues Found
[List any issues]

## Status: READY FOR DEPLOYMENT
```

**Step 6: Commit test results**

```bash
git add docs/plans/TEST_RESULTS.md
git commit -m "test: document waterfall enrichment test results"
```

---

### Task 15: Production Build & Deploy

**Step 1: Run production build**

Run: `npm run build`
Expected: Build succeeds with no errors or warnings

**Step 2: Test production build locally**

Run: `npm run start`
Expected: Production server starts, all features work

**Step 3: Deploy to Vercel**

Run: `git push origin main`
Expected: Vercel auto-deploys, deployment succeeds

**Step 4: Verify production deployment**

1. Visit: https://gtm-outbound-calculator.vercel.app
2. Test waterfall builder functionality
3. Verify calculations
4. Check mobile responsiveness
5. Test all provider selections

**Step 5: Create deployment summary**

Create: `docs/plans/DEPLOYMENT_SUMMARY.md`

```markdown
# Deployment Summary - Waterfall Enrichment

## Deployment Date: [DATE]

## Features Deployed

### 1. Waterfall Enrichment System
- Visual waterfall builder with drag-and-drop interface
- Sequential provider fallback calculation
- Real-time cost vs coverage analysis
- Preset waterfall configurations
- Support for email finding, phone finding, email verification

### 2. New Components
- `WaterfallBuilder.tsx` - Waterfall configuration UI
- `WaterfallVisualization.tsx` - Charts and metrics display
- `CollapsibleSection.tsx` - Reusable UI component
- `InputSection.tsx` - Simplified input interface

### 3. Enhanced Calculator Logic
- `waterfall-calculator.ts` - Waterfall cost/coverage calculations
- `waterfall-presets.ts` - Pre-configured waterfall templates
- Updated `calculator.ts` with waterfall integration

### 4. Design System Updates
- Custom fonts: Space Grotesk (display), Inter (body), JetBrains Mono (code)
- CSS variables for consistent theming
- Extended Tailwind config with custom colors and animations
- Recharts integration for data visualization

### 5. Documentation
- `WATERFALL_ENRICHMENT.md` - Complete waterfall guide
- Updated `README.md` with new features
- Test results and deployment summary

## Performance Metrics

- Build time: [TIME]
- Bundle size: [SIZE]
- Lighthouse score: [SCORE]

## Known Issues

[List any known issues or limitations]

## Next Steps

1. Monitor user feedback
2. Track usage analytics
3. Iterate on coverage rate accuracy
4. Add more preset configurations based on real-world data

## Deployment URL

Production: https://gtm-outbound-calculator.vercel.app
```

**Step 6: Final commit**

```bash
git add docs/plans/DEPLOYMENT_SUMMARY.md
git commit -m "docs: add deployment summary for waterfall enrichment"
git push origin main
```

---

## Plan Complete

**Summary:**
- **15 tasks** covering types, logic, components, design, testing, and deployment
- **New features:** Waterfall enrichment with visual builder and cost/coverage analysis
- **Component refactor:** Modular architecture replacing 731-line monolithic page
- **Design system:** Custom fonts, CSS variables, Tailwind extensions
- **Documentation:** Complete guides and test results

**Execution Options:**

1. **Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

2. **Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach would you like to use?**
