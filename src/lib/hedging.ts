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

export interface EmotionalHedgingCalculation {
  shares: number;
  premium: number;
  outcomeIfTeamWins: number; // Net cost when team wins (just premium)
  outcomeIfTeamLoses: number; // Net outcome when team loses (consolation - premium)
  unhedgedOutcomeIfTeamWins: number; // Just the ticket cost
  unhedgedOutcomeIfTeamLoses: number; // Just the ticket cost (no consolation)
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

/**
 * Calculate emotional hedging for sports or single events
 * 
 * @param ticketCost - Cost of tickets/entry regardless of outcome
 * @param desiredConsolation - Total amount desired if team loses
 * @param hedgeRatio - Percentage of consolation to hedge (0-1)
 * @param teamLossProbability - Probability team loses (0-1)
 * @param feeRate - Polymarket fee rate (default 0.01 = 1%)
 * @returns Emotional hedging calculation results
 */
export function calculateEmotionalHedging(
  ticketCost: number,
  desiredConsolation: number,
  hedgeRatio: number,
  yesPrice: number, // Market price for YES shares (team loses)
  feeRate: number = 0.01
): EmotionalHedgingCalculation {
  // Calculate the payout after fees
  const payout = 1 - feeRate;
  
  // Calculate how much consolation we want to hedge (applied to desired consolation amount)
  const targetConsolation = desiredConsolation * hedgeRatio;
  
  // Calculate shares needed to get target consolation when team loses
  const shares = targetConsolation / payout;
  
  // Calculate up-front premium: shares * market price for YES shares
  const premium = shares * yesPrice;
  
  // Calculate outcomes
  const outcomeIfTeamWins = -ticketCost - premium; // Lost ticket cost and premium, but team won!
  const outcomeIfTeamLoses = -ticketCost + (shares * payout) - premium; // Lost ticket but got consolation payout minus premium
  const unhedgedOutcomeIfTeamWins = -ticketCost; // Just paid for tickets
  const unhedgedOutcomeIfTeamLoses = -ticketCost; // Paid for tickets, team lost, no consolation
  
  return {
    shares,
    premium,
    outcomeIfTeamWins,
    outcomeIfTeamLoses,
    unhedgedOutcomeIfTeamWins,
    unhedgedOutcomeIfTeamLoses,
  };
}

/**
 * Find optimal hedge ratio for emotional hedging
 * Focuses on maximizing emotional protection while minimizing cost
 */
export function findOptimalEmotionalHedgeRatio(
  ticketCost: number,
  desiredConsolation: number,
  yesPrice: number, // Market price for YES shares (team loses)
  feeRate: number = 0.01
): {
  optimalRatio: number;
  worstCaseImprovement: number;
  volatilityReduction: number;
  maxDrawdownReduction: number;
  riskScore: number;
  winPercentage: number;
  sharpeRatio: number;
} {
  let bestRatio = 0.5;
  let bestScore = -Infinity;
  let bestMetrics = {
    worstCaseImprovement: 0,
    volatilityReduction: 0,
    maxDrawdownReduction: 0,
    winPercentage: 0,
    sharpeRatio: 0,
  };

  // Derive team loss probability from market price (approximately)
  const teamLossProbability = yesPrice;

  // Test different hedge ratios
  for (let ratio = 0.1; ratio <= 1.0; ratio += 0.05) {
    const hedging = calculateEmotionalHedging(ticketCost, desiredConsolation, ratio, yesPrice, feeRate);
    
    // Simulate outcomes
    const numSims = 1000;
    const hedgedOutcomes: number[] = [];
    const unhedgedOutcomes: number[] = [];
    
    for (let i = 0; i < numSims; i++) {
      const teamLoses = Math.random() < teamLossProbability;
      
      if (teamLoses) {
        hedgedOutcomes.push(hedging.outcomeIfTeamLoses);
        unhedgedOutcomes.push(hedging.unhedgedOutcomeIfTeamLoses);
      } else {
        hedgedOutcomes.push(hedging.outcomeIfTeamWins);
        unhedgedOutcomes.push(hedging.unhedgedOutcomeIfTeamWins);
      }
    }
    
    const hedgedStats = calculateStats(hedgedOutcomes);
    const unhedgedStats = calculateStats(unhedgedOutcomes);
    
    // Calculate metrics
    const worstCaseImprovement = hedgedStats.worstCase10 - unhedgedStats.worstCase10;
    const hedgedStdDev = Math.sqrt(hedgedOutcomes.reduce((sum, v) => sum + Math.pow(v - hedgedStats.mean, 2), 0) / hedgedOutcomes.length);
    const unhedgedStdDev = Math.sqrt(unhedgedOutcomes.reduce((sum, v) => sum + Math.pow(v - unhedgedStats.mean, 2), 0) / unhedgedOutcomes.length);
    const volatilityReduction = Math.max(0, ((unhedgedStdDev - hedgedStdDev) / unhedgedStdDev) * 100);
    
    const winPercentage = (hedgedOutcomes.filter((h, i) => h > unhedgedOutcomes[i]).length / hedgedOutcomes.length) * 100;
    const maxDrawdownReduction = Math.max(0, Math.abs(unhedgedStats.worstCase10) - Math.abs(hedgedStats.worstCase10));
    const sharpeRatio = hedgedStats.mean / (hedgedStdDev || 1);
    
    // Scoring function that prioritizes emotional protection over profit
    const riskScore = (
      worstCaseImprovement * 0.4 +      // 40% weight on worst-case protection
      volatilityReduction * 0.3 +       // 30% weight on volatility reduction  
      maxDrawdownReduction * 0.2 +      // 20% weight on drawdown protection
      (sharpeRatio * 10) * 0.1          // 10% weight on risk-adjusted returns
    ) - (hedging.premium * 0.1);        // Small penalty for premium cost
    
    if (riskScore > bestScore) {
      bestScore = riskScore;
      bestRatio = ratio;
      bestMetrics = {
        worstCaseImprovement,
        volatilityReduction,
        maxDrawdownReduction,
        winPercentage,
        sharpeRatio,
      };
    }
  }

  return {
    optimalRatio: bestRatio,
    riskScore: bestScore,
    ...bestMetrics,
  };
}
