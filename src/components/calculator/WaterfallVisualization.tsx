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
