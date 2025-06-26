'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { SimulationResults } from '@/hooks/useSimulation';

// Dynamically import Recharts components to avoid SSR issues
const BarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), { ssr: false });

interface ResultsProps {
  results: SimulationResults;
  marketId?: string;
}

export function Results({ results, marketId }: ResultsProps) {
  const [isClient, setIsClient] = useState(false);
  const { hedging, hedgedStats, unhedgedStats, comparison, histogram } = results;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">📊 Risk Analysis Results</h2>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Shares to Buy</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">{hedging.shares.toFixed(2)}</p>
          <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">YES shares needed</p>
        </div>
        
        <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">Up-front Cost</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-300">{formatCurrency(hedging.premium)}</p>
          <p className="text-sm text-green-700 dark:text-green-200 mt-1">Total premium to pay</p>
        </div>
      </div>

      {/* Hedged vs Unhedged Comparison */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Hedged vs Unhedged Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Hedged Scenario Stats */}
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">With Hedging</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-200">Mean outcome:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(hedgedStats.mean)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-200">Median outcome:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(hedgedStats.median)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-200">10% worst case:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(hedgedStats.worstCase10)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-200">Probability positive:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{formatPercentage(hedgedStats.probabilityPositive)}</span>
              </div>
            </div>
          </div>

          {/* Unhedged Scenario Stats */}
          <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
            <h4 className="font-semibold text-red-900 dark:text-red-100 mb-3">Without Hedging</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-red-700 dark:text-red-200">Mean outcome:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(unhedgedStats.mean)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-700 dark:text-red-200">Median outcome:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(unhedgedStats.median)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-700 dark:text-red-200">10% worst case:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(unhedgedStats.worstCase10)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-700 dark:text-red-200">Probability positive:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{formatPercentage(unhedgedStats.probabilityPositive)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Reduction Analysis */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 p-6 rounded-lg border-2 border-green-200 dark:border-green-700">
          <h4 className="font-bold text-green-900 dark:text-green-100 mb-4 text-lg">🛡️ Risk Protection Analysis</h4>
          
          {/* Primary Risk Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <h5 className="font-semibold text-green-800 dark:text-green-200 mb-2">Worst-Case Protection</h5>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300 mb-1">
                ${Math.abs(unhedgedStats.worstCase10 - hedgedStats.worstCase10).toFixed(2)}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                {(((Math.abs(unhedgedStats.worstCase10 - hedgedStats.worstCase10)) / Math.abs(unhedgedStats.worstCase10)) * 100).toFixed(1)}% improvement in 10% worst case
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Volatility Reduction</h5>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-1">
                {(() => {
                  // Estimate volatility reduction based on range reduction
                  const hedgedRange = Math.abs(hedgedStats.worstCase10 - hedgedStats.mean);
                  const unhedgedRange = Math.abs(unhedgedStats.worstCase10 - unhedgedStats.mean);
                  const volatilityReduction = Math.max(0, ((unhedgedRange - hedgedRange) / unhedgedRange) * 100);
                  
                  return `${volatilityReduction.toFixed(1)}%`;
                })()}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                Less volatile outcomes
              </div>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm border-t border-green-200 dark:border-green-700 pt-4">
            <div className="text-center">
              <div className="font-medium text-gray-700 dark:text-gray-300">Win Frequency</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatPercentage(comparison.hedgedBetter)}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Times hedging performs better</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-700 dark:text-gray-300">Average Cost</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(Math.abs(comparison.averageImprovement))}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Price of protection</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-700 dark:text-gray-300">Max Protection</div>
              <div className="text-lg font-semibold text-green-700 dark:text-green-300">{formatCurrency(Math.abs(unhedgedStats.worstCase10 - hedgedStats.worstCase10))}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Maximum downside reduction</div>
            </div>
          </div>

          {/* Educational Note */}
          <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-lg border border-blue-300 dark:border-blue-600">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>💡 Remember:</strong> Hedging is insurance, not an investment. The goal is to reduce severe losses, 
              not to be profitable most of the time. A small average cost is normal and worth paying for significant downside protection.
            </p>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Monthly Outcome Analysis</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 dark:border-gray-600 rounded-lg">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b dark:border-gray-600">
                  Scenario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b dark:border-gray-600">
                  Net Impact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b dark:border-gray-600">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  Event Occurs (YES wins)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600 dark:text-red-400">
                  {formatCurrency(hedging.hedgedOutcomeIfEventTrue)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  Higher expense offset by share payout
                </td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  Event Does Not Occur (NO wins)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600 dark:text-red-400">
                  {formatCurrency(hedging.hedgedOutcomeIfEventFalse)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  Normal expense, lose premium paid
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Combined Histogram */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Distribution Comparison (5,000 simulations)
        </h3>
        <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {isClient ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogram} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="bin" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  stroke="#6b7280"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value} simulations`, 
                    name === 'hedgedCount' ? 'With Hedging' : 'Without Hedging'
                  ]}
                  labelFormatter={(label) => `Range: ${formatCurrency(Number(label))}`}
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '0.375rem',
                    color: 'var(--color-foreground)',
                  }}
                />
                <Bar dataKey="hedgedCount" fill="#3b82f6" name="hedgedCount" radius={[2, 2, 0, 0]} />
                <Bar dataKey="unhedgedCount" fill="#ef4444" name="unhedgedCount" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Loading chart...</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-center mt-4 space-x-6 text-sm text-gray-900 dark:text-gray-100">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span>With Hedging</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
            <span>Without Hedging</span>
          </div>
        </div>
      </div>

      {/* Summary Statistics - Updated to use hedged stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Hedged Scenario Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Mean Outcome</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(hedgedStats.mean)}</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Median Outcome</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(hedgedStats.median)}</p>
          </div>
          
          <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg text-center">
            <p className="text-sm text-red-600 dark:text-red-300 mb-1">10% Worst Case</p>
            <p className="text-lg font-semibold text-red-700 dark:text-red-400">{formatCurrency(hedgedStats.worstCase10)}</p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg text-center">
            <p className="text-sm text-green-600 dark:text-green-300 mb-1">Probability Positive</p>
            <p className="text-lg font-semibold text-green-700 dark:text-green-400">{formatPercentage(hedgedStats.probabilityPositive)}</p>
          </div>
        </div>
      </div>

      {/* Polymarket Link */}
      {marketId && marketId.trim() && (
        <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
          <a
            href={`https://polymarket.com/market/${marketId.trim()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-purple-600 dark:bg-purple-700 text-white font-medium rounded-lg hover:bg-purple-700 dark:hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition duration-200"
          >
            Open Market on Polymarket
            <svg 
              className="ml-2 w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
              />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}
