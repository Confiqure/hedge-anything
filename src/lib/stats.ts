/**
 * Statistical utility functions for simulation analysis
 */

/**
 * Calculate percentile from sorted array using linear interpolation
 * 
 * @param arr - Array of numbers to calculate percentile from
 * @param p - Percentile to calculate (0-100)
 * @returns The value at the specified percentile
 */
export function percentile(arr: number[], p: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  
  if (index === Math.floor(index)) {
    return sorted[index];
  }
  
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Statistics summary for simulation results
 */
export interface SimulationStats {
  mean: number;
  median: number;
  worstCase10: number;
  probabilityPositive: number;
}

/**
 * Calculate comprehensive statistics from simulation results
 * 
 * @param results - Array of simulation outcome values
 * @returns Statistical summary including mean, median, worst case, and probability of positive outcome
 */
export function calculateStats(results: number[]): SimulationStats {
  if (results.length === 0) {
    throw new Error('Cannot calculate statistics for empty results array');
  }

  const mean = results.reduce((sum, val) => sum + val, 0) / results.length;
  const median = percentile(results, 50);
  const worstCase10 = percentile(results, 10);
  const positiveCount = results.filter(val => val > 0).length;
  const probabilityPositive = positiveCount / results.length;
  
  return {
    mean,
    median,
    worstCase10,
    probabilityPositive,
  };
}
