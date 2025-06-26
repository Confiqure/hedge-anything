import { describe, it, expect } from 'vitest';
import { calculateHedging, runMonteCarloSimulation, runComparisonSimulation, findOptimalHedgeRatio } from '../src/lib/hedging';
import { calculateStats } from '../src/lib/stats';

describe('Hedging calculations', () => {
  it('should calculate shares and premium correctly', () => {
    const baselineExpense = 100;
    const adverseExpense = 120; // $20 additional expense
    const hedgeRatio = 0.8; // Hedge 80% of the additional expense
    const yesPrice = 0.35;
    const feeRate = 0.02; // 2% fee (payout = 0.98)
    
    const result = calculateHedging(baselineExpense, adverseExpense, hedgeRatio, yesPrice, feeRate);
    
    // Additional expense = 120 - 100 = 20
    // Amount to hedge = 20 * 0.8 = 16
    // shares = 16 / 0.98 ≈ 16.3265
    expect(result.shares).toBeCloseTo(16.3265, 3);
    
    // premium = 16.3265 * 0.35 ≈ 5.714
    expect(result.premium).toBeCloseTo(5.714, 3);
    
    // hedgedOutcomeIfEventTrue = -120 - 5.714 + 16.3265 * 0.98 ≈ -120 - 5.714 + 16.00 = -109.714
    expect(result.hedgedOutcomeIfEventTrue).toBeCloseTo(-109.714, 2);
    
    // hedgedOutcomeIfEventFalse = -100 - 5.714 = -105.714
    expect(result.hedgedOutcomeIfEventFalse).toBeCloseTo(-105.714, 2);
    
    // unhedgedOutcomeIfEventTrue = -120
    expect(result.unhedgedOutcomeIfEventTrue).toBe(-120);
    
    // unhedgedOutcomeIfEventFalse = -100
    expect(result.unhedgedOutcomeIfEventFalse).toBe(-100);
  });

  it('should handle edge cases', () => {
    // Zero hedge ratio
    const result1 = calculateHedging(100, 120, 0, 0.5);
    expect(result1.shares).toBe(0);
    expect(result1.premium).toBe(0);
    
    // High yes price
    const result2 = calculateHedging(100, 200, 1, 0.99); // Hedge 100% of $100 additional expense at high price
    const payout = 0.99; // 1% fee
    expect(result2.shares).toBeCloseTo(100 / payout, 2);
    expect(result2.premium).toBeCloseTo((100 / payout) * 0.99, 2);
  });

  it('should run monte carlo simulation', () => {
    const results = runMonteCarloSimulation(100, 180, 0.8, 0.35, 1, 0.01, 1000);
    
    expect(results).toHaveLength(1000);
    expect(results.every(r => typeof r === 'number')).toBe(true);
    
    // Results should be within reasonable range
    const hedging = calculateHedging(100, 180, 0.8, 0.35, 0.01);
    results.forEach(result => {
      expect(
        Math.abs(result - hedging.hedgedOutcomeIfEventTrue) < 0.01 ||
        Math.abs(result - hedging.hedgedOutcomeIfEventFalse) < 0.01
      ).toBe(true);
    });
  });

  it('should run comparison simulation', () => {
    const comparison = runComparisonSimulation(100, 180, 0.8, 0.35, 1, 0.01, 1000);
    
    expect(comparison.hedged).toHaveLength(1000);
    expect(comparison.unhedged).toHaveLength(1000);
    expect(comparison.hedged.every(r => typeof r === 'number')).toBe(true);
    expect(comparison.unhedged.every(r => typeof r === 'number')).toBe(true);
    
    // Unhedged results should reflect either baseline expense or adverse expense
    comparison.unhedged.forEach(result => {
      expect(result === -100 || result === -180).toBe(true);
    });
  });

  it('should calculate statistics correctly', () => {
    const testData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const stats = calculateStats(testData);
    
    expect(stats.mean).toBe(5.5);
    expect(stats.median).toBe(5.5);
    expect(stats.worstCase10).toBeCloseTo(1.9, 1);
    expect(stats.probabilityPositive).toBe(1); // All values are positive
  });

  it('should handle negative values in statistics', () => {
    const testData = [-5, -3, -1, 1, 3, 5];
    const stats = calculateStats(testData);
    
    expect(stats.mean).toBe(0);
    expect(stats.median).toBe(0);
    expect(stats.probabilityPositive).toBe(0.5); // Half are positive
  });

  it('should show hedging reduces worst-case scenarios', () => {
    const baselineExpense = 100;
    const adverseExpense = 220; // Large increase
    const hedgeRatio = 0.8;
    const yesPrice = 0.35;
    const months = 12;
    
    const comparison = runComparisonSimulation(baselineExpense, adverseExpense, hedgeRatio, yesPrice, months, 0.01, 1000);
    const hedgedStats = calculateStats(comparison.hedged);
    const unhedgedStats = calculateStats(comparison.unhedged);
    
    // Hedging should generally reduce the worst-case scenario
    expect(hedgedStats.worstCase10).toBeGreaterThan(unhedgedStats.worstCase10);
  });

  it('should find optimal hedge ratio with risk metrics', () => {
    const baselineExpense = 100;
    const adverseExpense = 150;
    const yesPrice = 0.3; // Undervalued event
    const months = 6;
    const feeRate = 0.01;
    
    const optimal = findOptimalHedgeRatio(baselineExpense, adverseExpense, yesPrice, months, feeRate, 5, 500);
    
    expect(optimal.optimalRatio).toBeGreaterThanOrEqual(0);
    expect(optimal.optimalRatio).toBeLessThanOrEqual(1);
    expect(optimal.winPercentage).toBeGreaterThanOrEqual(0);
    expect(optimal.winPercentage).toBeLessThanOrEqual(100);
    expect(typeof optimal.worstCaseImprovement).toBe('number');
    expect(typeof optimal.volatilityReduction).toBe('number');
    expect(typeof optimal.sharpeRatio).toBe('number');
    expect(typeof optimal.maxDrawdownReduction).toBe('number');
    expect(typeof optimal.riskScore).toBe('number');
    
    // Worst case improvement should be positive (improvement)
    expect(optimal.worstCaseImprovement).toBeGreaterThanOrEqual(0);
    
    // Sharpe ratio should not be extreme
    expect(Math.abs(optimal.sharpeRatio)).toBeLessThan(1000);
  });

  it('should have consistent math between optimization and simulation', () => {
    const baselineExpense = 150;
    const adverseExpense = 300;
    const hedgeRatio = 0.8;
    const yesPrice = 0.2;
    const months = 12;
    const feeRate = 0.01;
    
    // Run simulation directly
    const simulation = runComparisonSimulation(baselineExpense, adverseExpense, hedgeRatio, yesPrice, months, feeRate, 1000);
    const hedgedStats = calculateStats(simulation.hedged);
    const unhedgedStats = calculateStats(simulation.unhedged);
    
    // The worst case improvement should be positive and reasonable
    const directWorstCaseImprovement = hedgedStats.worstCase10 - unhedgedStats.worstCase10;
    expect(directWorstCaseImprovement).toBeGreaterThanOrEqual(0);
    expect(Math.abs(directWorstCaseImprovement)).toBeLessThan(1000); // Should be reasonable
  });

  // Additional critical test cases for production readiness
  it('should handle extreme market conditions', () => {
    // Very low probability event
    const lowProbResult = calculateHedging(100, 500, 0.5, 0.01, 0.01);
    expect(lowProbResult.shares).toBeGreaterThan(0);
    expect(lowProbResult.premium).toBeLessThan(lowProbResult.shares); // Premium should be low
    
    // Very high probability event
    const highProbResult = calculateHedging(100, 500, 0.5, 0.95, 0.01);
    expect(highProbResult.shares).toBeGreaterThan(0);
    expect(highProbResult.premium).toBeCloseTo(highProbResult.shares * 0.95, 1); // Premium = shares * yesPrice
  });

  it('should validate input parameters correctly', () => {
    // Test that adverse expense must be higher than baseline
    const comparison1 = runComparisonSimulation(200, 100, 0.5, 0.3, 6, 0.01, 100);
    // Should still run but with negative additional expense (which doesn't make sense)
    expect(comparison1.hedged.length).toBe(100);
    
    // Test zero additional expense scenario
    const comparison2 = runComparisonSimulation(100, 100, 0.5, 0.3, 6, 0.01, 100);
    expect(comparison2.hedged.length).toBe(100);
    // All hedged results should equal unhedged results since no additional expense to hedge
    for (let i = 0; i < comparison2.hedged.length; i++) {
      expect(Math.abs(comparison2.hedged[i] - comparison2.unhedged[i])).toBeLessThan(0.01);
    }
  });

  it('should handle different fee structures', () => {
    const baselineExpense = 100;
    const adverseExpense = 200;
    const hedgeRatio = 0.8;
    const yesPrice = 0.3;

    // No fee scenario
    const noFeeResult = calculateHedging(baselineExpense, adverseExpense, hedgeRatio, yesPrice, 0);
    
    // High fee scenario (5%)
    const highFeeResult = calculateHedging(baselineExpense, adverseExpense, hedgeRatio, yesPrice, 0.05);
    
    // High fees should require more shares for same hedge
    expect(highFeeResult.shares).toBeGreaterThan(noFeeResult.shares);
    
    // But premium difference should reflect the efficiency loss
    expect(highFeeResult.premium).toBeGreaterThan(noFeeResult.premium);
  });

  it('should demonstrate hedging effectiveness across time horizons', () => {
    const baselineExpense = 120;
    const adverseExpense = 180;
    const hedgeRatio = 0.7;
    const yesPrice = 0.25;
    const feeRate = 0.01;

    // Compare 1 month vs 12 months
    const shortTerm = runComparisonSimulation(baselineExpense, adverseExpense, hedgeRatio, yesPrice, 1, feeRate, 1000);
    const longTerm = runComparisonSimulation(baselineExpense, adverseExpense, hedgeRatio, yesPrice, 12, feeRate, 1000);
    
    const shortStats = calculateStats(shortTerm.hedged);
    const longStats = calculateStats(longTerm.hedged);
    
    // Longer time horizons should have more variable outcomes
    const shortRange = Math.abs(Math.max(...shortTerm.hedged) - Math.min(...shortTerm.hedged));
    const longRange = Math.abs(Math.max(...longTerm.hedged) - Math.min(...longTerm.hedged));
    
    expect(longRange).toBeGreaterThan(shortRange);
    
    // Long-term mean should be roughly 12x the short-term mean
    expect(Math.abs(longStats.mean / shortStats.mean)).toBeCloseTo(12, 0);
  });

  it('should optimize hedge ratios for different risk profiles', () => {
    const baselineExpense = 100;
    const adverseExpense = 300; // 200% increase - high risk scenario
    const yesPrice = 0.2; // Low probability but severe impact
    const months = 12;
    const feeRate = 0.01;

    const optimal = findOptimalHedgeRatio(baselineExpense, adverseExpense, yesPrice, months, feeRate, 10, 500);
    
    // For severe risk scenarios, should recommend significant hedging
    expect(optimal.optimalRatio).toBeGreaterThan(0.3); // At least 30% hedging
    
    // Risk score should be meaningful
    expect(optimal.riskScore).toBeGreaterThan(0);
    
    // Worst case improvement should be substantial for high-risk scenarios
    expect(optimal.worstCaseImprovement).toBeGreaterThan(50); // At least $50 improvement
  });

  it('should handle statistical edge cases in percentile calculation', () => {
    // Test with very small datasets
    const smallData = [-100, -50];
    const smallStats = calculateStats(smallData);
    expect(smallStats.mean).toBe(-75);
    expect(smallStats.median).toBe(-75);
    expect(typeof smallStats.worstCase10).toBe('number');
    
    // Test with identical values
    const identicalData = [-100, -100, -100, -100, -100];
    const identicalStats = calculateStats(identicalData);
    expect(identicalStats.mean).toBe(-100);
    expect(identicalStats.median).toBe(-100);
    expect(identicalStats.worstCase10).toBe(-100);
    expect(identicalStats.probabilityPositive).toBe(0);
  });
});
