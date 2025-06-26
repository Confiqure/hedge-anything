/**
 * Core hedging calculations for Polymarket YES shares
 * Based on the specification from the implementation brief
 */

import { calculateStats } from './stats';

export interface HedgingCalculation {
  shares: number;
  premium: number;
  hedgedOutcomeIfEventTrue: number; // Total cost when hedged and event occurs
  hedgedOutcomeIfEventFalse: number; // Total cost when hedged and event doesn't occur
  unhedgedOutcomeIfEventTrue: number; // Total cost when unhedged and event occurs
  unhedgedOutcomeIfEventFalse: number; // Total cost when unhedged and event doesn't occur
}

export interface ComparisonResults {
  hedged: number[];
  unhedged: number[];
}

/**
 * Calculate hedging parameters for realistic expense scenarios
 * 
 * @param baselineExpense - Normal monthly expense when event doesn't occur
 * @param adverseExpense - Higher monthly expense when event occurs
 * @param hedgeRatio - Percentage of additional expense to hedge (0-1)
 * @param yesPrice - Current YES price on Polymarket (0-1)
 * @param feeRate - Polymarket fee rate (default 0.01 = 1%)
 * @returns Hedging calculation results
 */
export function calculateHedging(
  baselineExpense: number,
  adverseExpense: number,
  hedgeRatio: number,
  yesPrice: number,
  feeRate: number = 0.01
): HedgingCalculation {
  // Calculate the payout after fees
  const payout = 1 - feeRate;
  
  // Calculate the additional expense exposure when event occurs
  const additionalExpense = adverseExpense - baselineExpense;
  
  // Calculate shares needed to hedge the additional expense: (additionalExpense * hedgeRatio) / payout
  const shares = (additionalExpense * hedgeRatio) / payout;
  
  // Calculate up-front premium: shares * yesPrice
  const premium = shares * yesPrice;
  
  // Hedged outcomes (including premium cost)
  const hedgedOutcomeIfEventTrue = -adverseExpense - premium + shares * payout;
  const hedgedOutcomeIfEventFalse = -baselineExpense - premium;
  
  // Unhedged outcomes (baseline comparison)
  const unhedgedOutcomeIfEventTrue = -adverseExpense;
  const unhedgedOutcomeIfEventFalse = -baselineExpense;
  
  return {
    shares,
    premium,
    hedgedOutcomeIfEventTrue,
    hedgedOutcomeIfEventFalse,
    unhedgedOutcomeIfEventTrue,
    unhedgedOutcomeIfEventFalse,
  };
}

/**
 * Run Monte Carlo simulation comparing hedged vs unhedged scenarios
 * 
 * @param baselineExpense - Normal monthly expense when event doesn't occur
 * @param adverseExpense - Higher monthly expense when event occurs
 * @param hedgeRatio - Percentage of additional expense to hedge (0-1)
 * @param yesPrice - Current YES price on Polymarket (0-1)
 * @param months - Number of months to simulate
 * @param feeRate - Polymarket fee rate (default 0.01 = 1%)
 * @param runs - Number of simulation runs (default: 5000)
 * @returns Object with both hedged and unhedged simulation results
 */
export function runComparisonSimulation(
  baselineExpense: number,
  adverseExpense: number,
  hedgeRatio: number,
  yesPrice: number,
  months: number,
  feeRate: number = 0.01,
  runs: number = 5000
): ComparisonResults {
  const hedgedResults: number[] = [];
  const unhedgedResults: number[] = [];
  
  for (let run = 0; run < runs; run++) {
    let hedgedTotal = 0;
    let unhedgedTotal = 0;
    
    // Simulate each month independently
    for (let month = 0; month < months; month++) {
      const eventOccurs = Math.random() < yesPrice;
      
      const {
        hedgedOutcomeIfEventTrue,
        hedgedOutcomeIfEventFalse,
        unhedgedOutcomeIfEventTrue,
        unhedgedOutcomeIfEventFalse,
      } = calculateHedging(baselineExpense, adverseExpense, hedgeRatio, yesPrice, feeRate);
      
      if (eventOccurs) {
        hedgedTotal += hedgedOutcomeIfEventTrue;
        unhedgedTotal += unhedgedOutcomeIfEventTrue;
      } else {
        hedgedTotal += hedgedOutcomeIfEventFalse;
        unhedgedTotal += unhedgedOutcomeIfEventFalse;
      }
    }
    
    hedgedResults.push(hedgedTotal);
    unhedgedResults.push(unhedgedTotal);
  }
  
  return {
    hedged: hedgedResults,
    unhedged: unhedgedResults,
  };
}

/**
 * Run Monte Carlo simulation for multiple months (updated for new expense model)
 * 
 * @param baselineExpense - Normal monthly expense when event doesn't occur
 * @param adverseExpense - Higher monthly expense when event occurs
 * @param hedgeRatio - Percentage of additional expense to hedge (0-1)
 * @param yesPrice - Current YES price on Polymarket (0-1)
 * @param months - Number of months to simulate
 * @param runs - Number of simulation runs (default: 5000)
 * @returns Array of total hedged outcomes across all simulation runs
 */
export function runMonteCarloSimulation(
  baselineExpense: number,
  adverseExpense: number,
  hedgeRatio: number,
  yesPrice: number,
  months: number,
  feeRate: number = 0.01,
  runs: number = 5000
): number[] {
  const comparison = runComparisonSimulation(baselineExpense, adverseExpense, hedgeRatio, yesPrice, months, feeRate, runs);
  return comparison.hedged;
}

/**
 * Find the optimal hedge ratio using risk-adjusted evaluation metrics
 * 
 * @param baselineExpense - Normal monthly expense when event doesn't occur
 * @param adverseExpense - Higher monthly expense when event occurs
 * @param yesPrice - Current YES price on Polymarket (0-1)
 * @param months - Number of months to simulate
 * @param feeRate - Polymarket fee rate (default 0.01 = 1%)
 * @param steps - Number of ratios to test (default 20 = 0%, 5%, 10%...100%)
 * @param runs - Simulations per step (default 5000 for consistency)
 * @returns Object with optimal ratio and comprehensive risk metrics
 */
export function findOptimalHedgeRatio(
  baselineExpense: number,
  adverseExpense: number,
  yesPrice: number,
  months: number,
  feeRate: number = 0.01,
  steps: number = 20,
  runs: number = 5000
): { 
  optimalRatio: number;
  winPercentage: number;
  worstCaseImprovement: number;
  volatilityReduction: number;
  sharpeRatio: number;
  maxDrawdownReduction: number;
  riskScore: number; // Overall risk-adjusted score
} {
  let bestRatio = 0;
  let bestRiskScore = -Infinity;
  let bestMetrics = {
    winPercentage: 0,
    worstCaseImprovement: 0,
    volatilityReduction: 0,
    sharpeRatio: -Infinity,
    maxDrawdownReduction: 0
  };
  
  // Get baseline (unhedged) simulation for comparison
  const unhedgedResults = runComparisonSimulation(
    baselineExpense,
    adverseExpense,
    0, // No hedging
    yesPrice,
    months,
    feeRate,
    runs
  ).unhedged;
  
  const unhedgedStats = calculateStats(unhedgedResults);
  
  // Test hedge ratios from 0 to 1 in steps
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    
    // Run simulation with this ratio
    const results = runComparisonSimulation(
      baselineExpense,
      adverseExpense,
      ratio,
      yesPrice,
      months,
      feeRate,
      runs
    );
    
    const hedgedStats = calculateStats(results.hedged);
    
    // Calculate win percentage (traditional metric)
    let wins = 0;
    for (let j = 0; j < results.hedged.length; j++) {
      if (results.hedged[j] > results.unhedged[j]) {
        wins++;
      }
    }
    const winPercentage = (wins / runs) * 100;
    
    // Calculate risk-adjusted metrics
    
    // 1. Worst-case improvement (what hedging really protects against)
    // Since expenses are negative, improvement means hedged worst case is less negative
    // Calculate as positive improvement: how much hedging reduces the worst case loss
    const worstCaseImprovement = hedgedStats.worstCase10 - unhedgedStats.worstCase10;
    
    // 2. Volatility reduction (standard deviation reduction)
    const hedgedStdDev = Math.sqrt(
      results.hedged.reduce((sum, val) => sum + Math.pow(val - hedgedStats.mean, 2), 0) / runs
    );
    const unhedgedStdDev = Math.sqrt(
      unhedgedResults.reduce((sum, val) => sum + Math.pow(val - unhedgedStats.mean, 2), 0) / runs
    );
    const volatilityReduction = unhedgedStdDev > 0 ? Math.max(0, ((unhedgedStdDev - hedgedStdDev) / unhedgedStdDev) * 100) : 0;
    
    // 3. Sharpe ratio (risk-adjusted return) - using 0 as risk-free rate
    const excessReturn = hedgedStats.mean - unhedgedStats.mean;
    // Add minimum threshold to prevent extreme values from tiny standard deviations
    const sharpeRatio = hedgedStdDev > 0.01 ? excessReturn / hedgedStdDev : 0;
    
    // 4. Maximum drawdown reduction - ensure it's always positive
    const hedgedRange = Math.max(...results.hedged) - Math.min(...results.hedged);
    const unhedgedRange = Math.max(...unhedgedResults) - Math.min(...unhedgedResults);
    const maxDrawdownReduction = unhedgedRange > 0 ? Math.max(0, ((unhedgedRange - hedgedRange) / unhedgedRange) * 100) : 0;
    
    // 5. Composite risk score (weighted combination of metrics)
    // Normalize worst-case improvement to be percentage-based for fair comparison
    const worstCaseImprovementPct = Math.abs(unhedgedStats.worstCase10) > 0 ? 
      (worstCaseImprovement / Math.abs(unhedgedStats.worstCase10)) * 100 : 0;
    
    // Heavily prioritize worst-case protection since that's the primary purpose of hedging
    const riskScore = 
      worstCaseImprovementPct * 0.7 +        // 70% weight on worst-case protection (percentage-based)
      volatilityReduction * 0.2 +            // 20% weight on volatility reduction  
      maxDrawdownReduction * 0.1;            // 10% weight on drawdown protection
    
    // Update best ratio if this one has better risk score
    if (riskScore > bestRiskScore) {
      bestRiskScore = riskScore;
      bestRatio = ratio;
      bestMetrics = {
        winPercentage,
        worstCaseImprovement,
        volatilityReduction,
        sharpeRatio,
        maxDrawdownReduction
      };
    }
  }
  
  return { 
    optimalRatio: bestRatio,
    riskScore: bestRiskScore,
    ...bestMetrics
  };
}
