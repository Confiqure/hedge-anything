'use client';

import React, { useState } from 'react';
import { ExpenseForm, FormData } from '@/components/ExpenseForm';
import { Results } from '@/components/Results';
import { useSimulation } from '@/hooks/useSimulation';

export default function Home() {
  const [formData, setFormData] = useState<FormData | null>(null);
  
  const simulationResults = useSimulation(
    formData?.baselineExpense || 0,
    formData?.adverseExpense || 0,
    (formData?.hedgeCoverage || 0) / 100,
    formData?.yesPrice || 0,
    formData?.monthsToHedge || 1,
    (formData?.feeRate || 1) / 100,
    formData?.hedgeMode || 'expense'
  );

  const handleFormSubmit = (data: FormData) => {
    setFormData(data);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🛡️ Hedge Anything
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Calculate precise Polymarket hedging positions for everyday expense volatility.
            Advanced Monte Carlo simulations and risk-optimized strategies for sophisticated risk management.
          </p>
        </header>

        {/* How It Works Section - Moved to top */}
        <section className="mb-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">How It Works</h2>
          
          {/* Workflow Overview */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">🎯</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Simple Two-Step Process</h3>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p className="flex items-center"><span className="font-semibold text-blue-600 dark:text-blue-400 mr-2">1.</span> Fill in your expense details and market parameters</p>
                  <p className="flex items-center"><span className="font-semibold text-green-600 dark:text-green-400 mr-2">2.</span> Click &quot;Analyze Protection Strategy&quot; for comprehensive results</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 ml-6">
                    <em>Advanced users can access optimization tools in the Advanced Options section</em>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Limitations Notice */}
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">Current Data Requirements</h3>
                <p className="text-amber-800 dark:text-amber-200 mb-3">
                  <strong>Manual Input Required:</strong> You currently need to estimate Polymarket prices manually. 
                  Visit <a href="https://polymarket.com" target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-400 underline">Polymarket.com</a> to check current YES share prices for relevant markets.
                </p>
                <div className="bg-amber-100 dark:bg-amber-900 rounded-lg p-3">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    🚀 <strong>Coming Soon:</strong> Real-time Polymarket data integration will automatically populate current prices and enable live market tracking.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-center">Configure Parameters</h3>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>• <strong>Expense Details:</strong> Enter your normal and adverse-scenario monthly costs</p>
                <p>• <strong>Market Data:</strong> Find and enter the current YES price from Polymarket</p>
                <p>• <strong>Time Horizon:</strong> Set how many months you want to hedge</p>
                <p>• <strong>Optional:</strong> Add market ID for direct links</p>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-950 p-6 rounded-lg border border-green-200 dark:border-green-800">
              <div className="w-12 h-12 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-center">Get Maximum Protection</h3>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>• Click <strong>&quot;Analyze Protection Strategy&quot;</strong> for comprehensive analysis</p>
                <p>• Defaults to 100% coverage for maximum protection</p>
                <p>• Runs 5,000 Monte Carlo simulations</p>
                <p>• Shows detailed risk reduction metrics</p>
              </div>
            </div>
          </div>

          {/* Advanced Features Note */}
          <div className="mt-6 bg-purple-50 dark:bg-purple-950 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-start space-x-3">
              <div className="text-lg">🔧</div>
              <div>
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Advanced Features</h4>
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  Power users can access <strong>Advanced Options</strong> in the form to fine-tune coverage ratios and use AI-powered optimization to find cost-efficient protection strategies.
                </p>
              </div>
            </div>
          </div>

          {/* Key Concepts */}
          <div className="mt-8 bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Key Concepts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">🛡️ Hedging as Insurance</h4>
                <p className="text-gray-700 dark:text-gray-300">Hedging protects against adverse events. Like insurance, it typically costs money but provides crucial protection when you need it most.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">📊 Risk-First Optimization</h4>
                <p className="text-gray-700 dark:text-gray-300">Our optimizer prioritizes downside protection and volatility reduction over profit frequency, following modern portfolio theory.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">🎲 Monte Carlo Analysis</h4>
                <p className="text-gray-700 dark:text-gray-300">Thousands of simulations reveal the full range of possible outcomes, helping you understand both typical and extreme scenarios.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">💰 Polymarket Integration</h4>
                <p className="text-gray-700 dark:text-gray-300">Use prediction market prices to hedge real-world expenses. Markets often price risks more accurately than traditional insurance.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Educational Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">🛡️</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Understanding Hedging as Risk Management</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Hedging isn&apos;t designed to be profitable most of the time—it&apos;s insurance against severe financial losses. 
                A good hedge typically costs a small premium but provides significant protection during adverse events.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">Reduces worst-case scenarios</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">Lowers volatility</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">Provides peace of mind</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <section>
            <ExpenseForm onSubmit={handleFormSubmit} />
          </section>
          
          {/* Results Section */}
          <section>
            {simulationResults && formData ? (
              <Results 
                results={simulationResults} 
                marketId={formData.marketId}
                hedgeMode={formData.hedgeMode}
              />
            ) : (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <div className="text-6xl mb-4" role="img" aria-label="Chart icon">
                    📊
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Ready to Analyze</h3>
                  <p>Fill out the form and click &quot;Analyze Protection Strategy&quot; to see your results.</p>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
