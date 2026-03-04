import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import '../styles/Navigation.css';

/**
 * D3.js based node graph for visualizing story branches
 * Shows story frames as interactive nodes with connecting lines
 * @param {Array} frames - Array of frame objects
 * @param {Function} onNodeClick - Callback when a node is clicked
 * @param {boolean} superpositionMode - Show multiple branches at once
 */
export default function NodeCanvas({
  frames = [],
  onNodeClick,
  superpositionMode = false,
}) {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    if (!svgRef.current || frames.length === 0) return;

    // Build tree structure from frames
    const frameMap = new Map(frames.map((f) => [f.id, f]));
    const rootFrames = frames.filter((f) => !f.parentFrameId);

    const buildHierarchy = (frameId, depth = 0) => {
      const frame = frameMap.get(frameId);
      if (!frame) return null;

      const children = frames
        .filter((f) => f.parentFrameId === frameId)
        .map((f) => buildHierarchy(f.id, depth + 1))
        .filter(Boolean);

      return {
        id: frameId,
        data: frame,
        children: children.length > 0 ? children : undefined,
        x: 0,
        y: 0,
      };
    };

    // Create tree layout
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const treeLayout = d3.tree().size([width - 100, height - 100]);

    // Build data for visualization
    const root = rootFrames[0]
      ? buildHierarchy(rootFrames[0].id)
      : null;

    if (!root) return;

    // Create hierarchy
    const hierarchy = d3.hierarchy(root);
    treeLayout(hierarchy);

    // Select SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous

    const g = svg
      .append('g')
      .attr('transform', 'translate(50, 50)');

    // Add zoom/pan behavior
    const zoom = d3.zoom().on('zoom', (event) => {
      g.attr('transform', event.transform);
    });
    svg.call(zoom);

    // Draw links (edges)
    const links = hierarchy.links();
    g.selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y)
      .attr('class', 'link');

    // Draw nodes
    const nodes = hierarchy.descendants();
    const nodeGroups = g
      .selectAll('g.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', (d) =>
        `node ${d.parent ? '' : 'root'} ${
          superpositionMode && d.depth > 0 ? 'alt-branch' : ''
        }`
      )
      .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        onNodeClick?.(d.data.id);
      })
      .on('mouseenter', (event, d) => {
        setTooltip({
          x: event.pageX,
          y: event.pageY,
          content: d.data.data.content.substring(0, 100) + '...',
        });
      })
      .on('mouseleave', () => {
        setTooltip(null);
      });

    // Add circle for each node
    nodeGroups
      .append('circle')
      .attr('r', (d) => (d.parent ? 8 : 12))
      .attr('class', (d) => (d.parent ? 'child-node' : 'root-node'));

    // Add labels
    nodeGroups
      .append('text')
      .attr('class', 'node-label')
      .attr('dy', 25)
      .attr('text-anchor', 'middle')
      .text((d, i) => `Frame ${i + 1}`);
  }, [frames, superpositionMode, onNodeClick]);

  return (
    <div className="node-canvas-container">
      <svg ref={svgRef} className="node-canvas"></svg>
      {tooltip && (
        <div
          className="tooltip"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
