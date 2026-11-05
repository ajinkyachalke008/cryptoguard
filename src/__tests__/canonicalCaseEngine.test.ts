import { describe, it, expect } from 'vitest';
import { generateSyntheticCase, projectCaseToGraph } from '../lib/services/canonicalCaseEngine';

describe('CanonicalCaseEngine — 5-Hop BFS Graph Projection', () => {
  const targetAddress = '0x1234567890abcdef1234567890abcdef12345678';
  const testCase = generateSyntheticCase({
    targetAddress,
    chain: 'eth',
    scenarioId: 'nested_mixer'
  });

  it('generates a synthetic case with simulated forensic status', () => {
    expect(testCase.accounts.length).toBeGreaterThan(0);
    expect(testCase.transactions.length).toBeGreaterThan(0);
    expect(testCase.targetAddress.toLowerCase()).toBe(targetAddress.toLowerCase());
    expect(testCase.provenance).toBe('SIMULATED_FORENSIC_CASE');
  });

  it('projects graph accurately within requested hop depth', () => {
    const hop1Graph = projectCaseToGraph(testCase, targetAddress, 1);
    const hop3Graph = projectCaseToGraph(testCase, targetAddress, 3);
    const hop5Graph = projectCaseToGraph(testCase, targetAddress, 5);

    // Hop 1 graph must have fewer or equal nodes than Hop 3, which is <= Hop 5
    expect(hop1Graph.nodes.length).toBeLessThanOrEqual(hop3Graph.nodes.length);
    expect(hop3Graph.nodes.length).toBeLessThanOrEqual(hop5Graph.nodes.length);
    expect(hop1Graph.stats.depth).toBe(1);
    expect(hop5Graph.stats.depth).toBe(5);
  });

  it('clamps BFS depth strictly between 1 and 5', () => {
    const underClamped = projectCaseToGraph(testCase, targetAddress, 0);
    const overClamped = projectCaseToGraph(testCase, targetAddress, 10);

    expect(underClamped.stats.depth).toBe(1);
    expect(overClamped.stats.depth).toBe(5);
  });
});
