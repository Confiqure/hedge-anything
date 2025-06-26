'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { findOptimalHedgeRatio } from '@/lib/hedging';

export interface FormData {
  expenseName: string;
  baselineExpense: number;
  adverseExpense: number;
  hedgeCoverage: number;
  yesPrice: number;
  monthsToHedge: number;
  feeRate: number;
  marketId?: string;
}

interface ExpenseFormProps {
  onSubmit: (data: FormData) => void;
}

export function ExpenseForm({ onSubmit }: ExpenseFormProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      expenseName: '',
      baselineExpense: 100,
      adverseExpense: 300, // 200% increase - extremely dramatic scenario  
      hedgeCoverage: 80,
      yesPrice: 0.15, // Much lower price - market severely undervaluing risk
      monthsToHedge: 12,
      feeRate: 1, // 1% fee
      marketId: '',
    },
  });

  const hedgeCoverage = watch('hedgeCoverage');
  const baselineExpense = watch('baselineExpense');
  const adverseExpense = watch('adverseExpense');
  
  const expenseIncrease = baselineExpense && adverseExpense 
    ? ((adverseExpense - baselineExpense) / baselineExpense * 100)
    : 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">🎯 Configure Your Hedge</h2>
      
      {/* Workflow Reminder */}
      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 Quick Workflow Reminder</h3>
        <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <p>1. Fill in all the required fields below</p>
          <p>2. Click &quot;Optimize for Risk Protection&quot; to find ideal settings</p>
          <p>3. Review and click &quot;Simulate Hedging&quot; to see results</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Expense Name */}
        <div>
          <label htmlFor="expenseName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Expense Name
          </label>
          <input
            id="expenseName"
            type="text"
            placeholder="e.g., Gas, Groceries, etc."
            {...register('expenseName', { required: 'Expense name is required' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.expenseName && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.expenseName.message}</p>
          )}
        </div>

        {/* Baseline Monthly Expense */}
        <div>
          <label htmlFor="baselineExpense" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Baseline Monthly Expense ($)
          </label>
          <input
            id="baselineExpense"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Normal monthly amount"
            {...register('baselineExpense', { 
              required: 'Baseline expense is required',
              valueAsNumber: true,
              min: { value: 0.01, message: 'Must be greater than 0' }
            })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.baselineExpense && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.baselineExpense.message}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your typical monthly expense when the event doesn&apos;t occur</p>
        </div>

        {/* Adverse Monthly Expense */}
        <div>
          <label htmlFor="adverseExpense" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Adverse Monthly Expense ($)
            {expenseIncrease > 0 && (
              <span className="text-red-600 dark:text-red-400 font-normal text-xs ml-2">
                (+{expenseIncrease.toFixed(1)}% increase)
              </span>
            )}
          </label>
          <input
            id="adverseExpense"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Higher expense if event occurs"
            {...register('adverseExpense', { 
              required: 'Adverse expense is required',
              valueAsNumber: true,
              min: { value: 0.01, message: 'Must be greater than 0' }
            })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.adverseExpense && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.adverseExpense.message}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your monthly expense when the Polymarket event occurs</p>
        </div>

        {/* Hedge Coverage Slider */}
        <div>
          <label htmlFor="hedgeCoverage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Hedge Coverage: {hedgeCoverage}%
          </label>
          <input
            id="hedgeCoverage"
            type="range"
            min="0"
            max="100"
            {...register('hedgeCoverage', { valueAsNumber: true })}
            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* YES Price */}
        <div>
          <label htmlFor="yesPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Polymarket YES Price (0.01 - 0.99)
          </label>
          <input
            id="yesPrice"
            type="number"
            step="0.01"
            min="0.01"
            max="0.99"
            placeholder="e.g., 0.35"
            {...register('yesPrice', { 
              required: 'YES price is required',
              valueAsNumber: true,
              min: { value: 0.01, message: 'Must be at least 0.01' },
              max: { value: 0.99, message: 'Must be less than 1.00' }
            })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.yesPrice && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.yesPrice.message}</p>
          )}
        </div>

        {/* Fee Rate */}
        <div>
          <label htmlFor="feeRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Polymarket Fee (%)
          </label>
          <input
            id="feeRate"
            type="number"
            step="0.1"
            min="0"
            max="10"
            placeholder="1.0"
            {...register('feeRate', { 
              required: 'Fee rate is required',
              valueAsNumber: true,
              min: { value: 0, message: 'Fee cannot be negative' },
              max: { value: 10, message: 'Fee must be less than 10%' }
            })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.feeRate && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.feeRate.message}</p>
          )}
        </div>

        {/* Months to Hedge */}
        <div>
          <label htmlFor="monthsToHedge" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Months to Hedge (1-24)
          </label>
          <input
            id="monthsToHedge"
            type="number"
            min="1"
            max="24"
            {...register('monthsToHedge', { 
              required: 'Months to hedge is required',
              valueAsNumber: true,
              min: { value: 1, message: 'Must be at least 1 month' },
              max: { value: 24, message: 'Must be no more than 24 months' }
            })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.monthsToHedge && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.monthsToHedge.message}</p>
          )}
        </div>

        {/* Market ID (Optional) */}
        <div>
          <label htmlFor="marketId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Market ID (optional)
          </label>
          <input
            id="marketId"
            type="text"
            placeholder="Polymarket market ID for deep-link"
            {...register('marketId')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Optimization Help Text */}
        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Risk-Optimized Hedging:</strong> The optimizer finds the hedge ratio that maximizes protection against worst-case scenarios and reduces volatility, rather than just trying to win more often than not.
          </p>
        </div>

        {/* Action Buttons Section with Workflow */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center">📋 Action Steps</h3>
          
          {/* Step 1: Optimize Button */}
          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 mr-2">
                  STEP 1
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">Find Optimal Settings</span>
              </div>
              <div className="text-green-600 dark:text-green-400 text-sm">Recommended</div>
            </div>
            
            {/* Optimize Button */}
            <button
              type="button"
              onClick={async () => {
                const baselineExpense = watch('baselineExpense');
                const adverseExpense = watch('adverseExpense');
                const yesPrice = watch('yesPrice');
                const monthsToHedge = watch('monthsToHedge');
                const feeRate = watch('feeRate');
                
                if (!baselineExpense || !adverseExpense || !yesPrice || !monthsToHedge || feeRate === undefined) {
                  alert('Please fill in all required fields first');
                  return;
                }
                
                if (adverseExpense <= baselineExpense) {
                  alert('Adverse expense must be higher than baseline expense');
                  return;
                }
                
                setIsOptimizing(true);
                
                // Use setTimeout to allow UI to update
                setTimeout(() => {
                  try {
                    const optimal = findOptimalHedgeRatio(
                      baselineExpense,
                      adverseExpense,
                      yesPrice,
                      monthsToHedge,
                      feeRate / 100 // Convert percentage to decimal
                    );
                    
                    // Update the form value
                    setValue('hedgeCoverage', optimal.optimalRatio * 100);
                    
                    // Show comprehensive results
                    const resultMessage = `🎯 Optimal Hedge Ratio: ${(optimal.optimalRatio * 100).toFixed(0)}%

�️ Risk Protection Benefits:
• Worst-case improvement: $${optimal.worstCaseImprovement.toFixed(2)}
• Volatility reduction: ${optimal.volatilityReduction.toFixed(1)}%
• Max drawdown reduction: ${optimal.maxDrawdownReduction.toFixed(1)}%
• Overall risk score: ${optimal.riskScore.toFixed(1)}

� Traditional metrics:
• Win percentage: ${optimal.winPercentage.toFixed(1)}%
• Risk-adjusted return: ${optimal.sharpeRatio.toFixed(3)}

💡 Remember: Hedging is insurance, not investment. Focus on the downside protection!`;
                    
                    alert(resultMessage);
                  } catch (error) {
                    alert('Error optimizing hedge ratio. Please check your inputs.');
                    console.error('Optimization error:', error);
                  } finally {
                    setIsOptimizing(false);
                  }
                }, 10);
              }}
              disabled={isOptimizing}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition duration-200 font-medium disabled:cursor-not-allowed shadow-lg"
            >
              {isOptimizing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Optimizing for Risk Reduction...
                </span>
              ) : (
                '🎯 Optimize for Risk Protection'
              )}
            </button>
          </div>

          {/* Step 2: Submit Button */}
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 mr-2">
                  STEP 2
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">Run Simulation</span>
              </div>
              {hedgeCoverage && (
                <div className="text-blue-600 dark:text-blue-400 text-sm">
                  Current: {hedgeCoverage.toFixed(0)}% hedge
                </div>
              )}
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition duration-200 font-medium shadow-lg"
            >
              📊 Simulate Hedging
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
