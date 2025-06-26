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
    formData?.monthsToHedge || 0,
    (formData?.feeRate || 1) / 100
  );

  const handleFormSubmit = (data: FormData) => {
    setFormData(data);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🛡️ Hedge Anything
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Calculate precise Polymarket hedging positions for everyday expense volatility.
            Advanced Monte Carlo simulations and risk-optimized strategies for sophisticated risk management.
          </p>
        </header>

        {/* Educational Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">🛡️</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Understanding Hedging as Risk Management</h3>
              <p className="text-gray-700 mb-3">
                Hedging isn&apos;t designed to be profitable most of the time—it&apos;s insurance against severe financial losses. 
                A good hedge typically costs a small premium but provides significant protection during adverse events.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Reduces worst-case scenarios</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Lowers volatility</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Provides peace of mind</span>
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
              />
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4" role="img" aria-label="Chart icon">
                    📊
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Ready to Simulate</h3>
                  <p>Fill out the form and click &quot;Simulate Hedging&quot; to see your results.</p>
                </div>
              </div>
            )}
          </section>
        </main>

        {/* How It Works Section */}
        <section className="mt-12 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Set Your Parameters</h3>
              <p>Enter your monthly expense amount, desired hedge coverage percentage, and the current Polymarket YES price.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Calculate Hedge</h3>
              <p>We calculate the exact number of YES shares needed to offset your expense if the adverse event occurs.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Simulate Outcomes</h3>
              <p>Run 5,000 Monte Carlo simulations to see the distribution of outcomes over your chosen time horizon.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
