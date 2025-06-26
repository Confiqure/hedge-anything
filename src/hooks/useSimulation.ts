import { useMemo } from 'react';
import { calculateHedging, runComparisonSimulation, calculateEmotionalHedging } from '@/lib/hedging';
import { calculateStats, SimulationStats } from '@/lib/stats';

export interface SimulationResults {
  hedgeMode: 'expense' | 'emotion';
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
  feeRate: number = 0.01,
  hedgeMode: 'expense' | 'emotion' = 'expense'
): SimulationResults | null {
  return useMemo(() => {
    // Validate inputs
    if (!baselineExpense || baselineExpense <= 0 || 
        !adverseExpense || adverseExpense <= 0 ||
        !hedgeRatio || hedgeRatio < 0 || hedgeRatio > 1 ||
        !yesPrice || yesPrice <= 0 || yesPrice >= 1 ||
        !months || months <= 0) {
      return null;
    }

    if (hedgeMode === 'expense') {
      // Expense hedging validation
      if (adverseExpense <= baselineExpense) {
        return null;
      }
      
      // Calculate basic hedging parameters
      const hedging = calculateHedging(baselineExpense, adverseExpense, hedgeRatio, yesPrice, feeRate);
      
      // Run comparison simulation
      const { hedged, unhedged } = runComparisonSimulation(
        baselineExpense,
        adverseExpense,
        hedgeRatio,
        yesPrice,
        months,
        feeRate
      );

      // Calculate statistics for both scenarios
      const hedgedStats = calculateStats(hedged);
      const unhedgedStats = calculateStats(unhedged);

      // Calculate comparison metrics
      let hedgedBetter = 0;
      let totalImprovement = 0;
      
      for (let i = 0; i < hedged.length; i++) {
        if (hedged[i] > unhedged[i]) {
          hedgedBetter++;
        }
        totalImprovement += hedged[i] - unhedged[i];
      }

      const hedgedBetterPercent = hedgedBetter / hedged.length;
      const averageImprovement = totalImprovement / hedged.length;
      const worstCaseImprovement = hedgedStats.worstCase10 - unhedgedStats.worstCase10;

      // Create histogram
      const allValues = [...hedged, ...unhedged];
      const min = Math.min(...allValues);
      const max = Math.max(...allValues);
      const binCount = 20;
      const binSize = (max - min) / binCount;

      const histogram = [];
      for (let i = 0; i < binCount; i++) {
        const binStart = min + i * binSize;
        const binEnd = binStart + binSize;
        const binLabel = binStart.toFixed(0);
        
        const hedgedCount = hedged.filter(v => v >= binStart && v < binEnd).length;
        const unhedgedCount = unhedged.filter(v => v >= binStart && v < binEnd).length;
        
        histogram.push({
          bin: binLabel,
          hedgedCount,
          unhedgedCount
        });
      }

      return {
        hedgeMode: 'expense',
        hedging: {
          shares: hedging.shares,
          premium: hedging.premium,
          hedgedOutcomeIfEventTrue: hedging.hedgedOutcomeIfEventTrue,
          hedgedOutcomeIfEventFalse: hedging.hedgedOutcomeIfEventFalse,
          unhedgedOutcomeIfEventTrue: hedging.unhedgedOutcomeIfEventTrue,
          unhedgedOutcomeIfEventFalse: hedging.unhedgedOutcomeIfEventFalse,
        },
        hedgedStats,
        unhedgedStats,
        comparison: {
          hedgedBetter: hedgedBetterPercent,
          averageImprovement,
          worstCaseImprovement,
        },
        histogram,
      };
    } else {
      // Emotional hedging - single event simulation
      const emotionalHedging = calculateEmotionalHedging(baselineExpense, adverseExpense, hedgeRatio, yesPrice, feeRate);
      
      // For emotional hedging, simulate binary outcomes (team wins/loses)
      const numSimulations = 5000;
      const hedged: number[] = [];
      const unhedged: number[] = [];
      
      for (let i = 0; i < numSimulations; i++) {
        const teamLoses = Math.random() < yesPrice; // yesPrice = probability team loses
        
        if (teamLoses) {
          // Team loses = YES wins = consolation payout
          hedged.push(emotionalHedging.outcomeIfTeamLoses);
          unhedged.push(emotionalHedging.unhedgedOutcomeIfTeamLoses);
        } else {
          // Team wins = NO wins = just lost premium
          hedged.push(emotionalHedging.outcomeIfTeamWins);
          unhedged.push(emotionalHedging.unhedgedOutcomeIfTeamWins);
        }
      }

      // Calculate statistics
      const hedgedStats = calculateStats(hedged);
      const unhedgedStats = calculateStats(unhedged);

      // Calculate comparison metrics
      let hedgedBetter = 0;
      let totalImprovement = 0;
      
      for (let i = 0; i < hedged.length; i++) {
        if (hedged[i] > unhedged[i]) {
          hedgedBetter++;
        }
        totalImprovement += hedged[i] - unhedged[i];
      }

      const hedgedBetterPercent = hedgedBetter / hedged.length;
      const averageImprovement = totalImprovement / hedged.length;
      const worstCaseImprovement = hedgedStats.worstCase10 - unhedgedStats.worstCase10;

      // Create simple histogram for binary outcomes
      const histogram = [
        {
          bin: 'Team Wins',
          hedgedCount: hedged.filter(v => v === emotionalHedging.outcomeIfTeamWins).length,
          unhedgedCount: unhedged.filter(v => v === emotionalHedging.unhedgedOutcomeIfTeamWins).length,
        },
        {
          bin: 'Team Loses',
          hedgedCount: hedged.filter(v => v === emotionalHedging.outcomeIfTeamLoses).length,
          unhedgedCount: unhedged.filter(v => v === emotionalHedging.unhedgedOutcomeIfTeamLoses).length,
        }
      ];

      return {
        hedgeMode: 'emotion',
        hedging: {
          shares: emotionalHedging.shares,
          premium: emotionalHedging.premium,
          hedgedOutcomeIfEventTrue: emotionalHedging.outcomeIfTeamLoses, // "Your Team Loses (YES wins)" = consolation
          hedgedOutcomeIfEventFalse: emotionalHedging.outcomeIfTeamWins, // "Your Team Wins (NO wins)" = just premium loss
          unhedgedOutcomeIfEventTrue: emotionalHedging.unhedgedOutcomeIfTeamLoses,
          unhedgedOutcomeIfEventFalse: emotionalHedging.unhedgedOutcomeIfTeamWins,
        },
        hedgedStats,
        unhedgedStats,
        comparison: {
          hedgedBetter: hedgedBetterPercent,
          averageImprovement,
          worstCaseImprovement,
        },
        histogram,
      };
    }
  }, [baselineExpense, adverseExpense, hedgeRatio, yesPrice, months, feeRate, hedgeMode]);
}
