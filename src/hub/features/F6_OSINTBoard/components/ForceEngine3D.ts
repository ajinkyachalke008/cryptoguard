// src/hub/features/F6_OSINTBoard/components/ForceEngine3D.ts
import * as d3 from 'd3-force-3d';

export class ForceEngine3D {
  private simulation: any;

  constructor(nodes: any[], edges: any[]) {
    this.simulation = d3.forceSimulation(nodes, 3)
      .force('link', d3.forceLink(edges).id((d: any) => d.id).distance(50).strength(0.7))
      .force('charge', d3.forceManyBody().strength(-120).distanceMax(300))
      .force('center', d3.forceCenter(0, 0, 0).strength(0.05))
      .alphaDecay(0.02)
      .velocityDecay(0.4);
  }

  public updateNodes(nodes: any[], edges: any[]) {
    this.simulation.nodes(nodes);
    this.simulation.force('link').links(edges);
    this.simulation.alpha(0.3).restart();
  }

  public tick() {
    // Usually d3 handles ticks internally, but we can call it if needed
  }

  public stop() {
    this.simulation.stop();
  }
}
