import { useMemo } from 'react';
import { calculateHedging, runComparisonSimulation } from '@/lib/hedging';
import { calculateStats, SimulationStats } from '@/lib/stats';

export interface SimulationResults {
  hedging: {
    shares: number;
    premium: number;
    hedgedOutcomeIfEventTrue: number;
    hedgedOutcomeIfEventFalse: number;
    unhedgedOutcomeIfEventTrue: number;
    unhedgedOutcomeIfEventFalse: number;
  };
  hedgedStats: SimulationStats;
  unhedgedStats: SimulationStats;
  comparison: {
    hedgedBetter: number; // Percentage of times hedging was better
    averageImprovement: number; // Average improvement from hedging
    worstCaseImprovement: number; // How much hedging improves worst case
  };
  histogram: Array<{ bin: string; hedgedCount: number; unhedgedCount: number }>;
}

/**
 * Custom hook for running Monte Carlo hedging simulations with comparison
 * Memoizes results to avoid unnecessary recalculations
 */
export function useSimulation(
  baselineExpense: number,
  adverseExpense: number,
  hedgeRatio: number,
  yesPrice: number,
  months: number,
  feeRate: number = 0.01
): SimulationResults | null {
  return useMemo(() => {
    // Validate inputs
    if (!baselineExpense || baselineExpense <= 0 || 
        !adverseExpense || adverseExpense <= 0 ||
        adverseExpense <= baselineExpense || // Adverse must be higher than baseline
        !hedgeRatio || hedgeRatio < 0 || hedgeRatio > 1 ||
        !yesPrice || yesPrice <= 0 || yesPrice >= 1 ||
        !months || months <= 0) {
      return null;
    }

    // Calculate basic hedging parameters
    const hedging = calculateHedging(baselineExpense, adverseExpense, hedgeRatio, yesPrice, feeRate);
    
    // Run comparison simulation
    const { hedged, unhedged } = runComparisonSimulation(baselineExpense, adverseExpense, hedgeRatio, yesPrice, months, feeRate);
    
    // Calculate statistics for both scenarios
    const hedgedStats = calculateStats(hedged);
    const unhedgedStats = calculateStats(unhedged);

    // Calculate comparison metrics
    const hedgedBetterCount = hedged.filter((h, i) => h > unhedged[i]).length;
    const hedgedBetter = hedgedBetterCount / hedged.length;
    
    const improvements = hedged.map((h, i) => h - unhedged[i]);
    const averageImprovement = improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length;
    
    // Calculate worst-case improvement
    const worstCaseImprovement = hedgedStats.worstCase10 - unhedgedStats.worstCase10;

    // Create combined histogram bins for visualization
    const allResults = [...hedged, ...unhedged];
    const min = Math.min(...allResults);
    const max = Math.max(...allResults);
    const binCount = 20;
    const binSize = (max - min) / binCount;
    
    const bins = Array.from({ length: binCount }, (_, i) => {
      const binStart = min + i * binSize;
      const binEnd = min + (i + 1) * binSize;
      
      const hedgedCount = hedged.filter(result => {
        if (i === binCount - 1) {
          return result >= binStart && result <= binEnd;
        }
        return result >= binStart && result < binEnd;
      }).length;
      
      const unhedgedCount = unhedged.filter(result => {
        if (i === binCount - 1) {
          return result >= binStart && result <= binEnd;
        }
        return result >= binStart && result < binEnd;
      }).length;
      
      return {
        bin: Math.round(binStart).toString(),
        hedgedCount,
        unhedgedCount,
      };
    });

    return {
      hedging,
      hedgedStats,
      unhedgedStats,
      comparison: {
        hedgedBetter,
        averageImprovement,
        worstCaseImprovement,
      },
      histogram: bins,
    };
  }, [baselineExpense, adverseExpense, hedgeRatio, yesPrice, months, feeRate]);
}
