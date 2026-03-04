import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './FrameGraph.css';

/**
 * D3.js powered node graph visualization
 * Shows frames as nodes with connecting branches
 */
export default function FrameGraph({ frames = [], onFrameSelect }) {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    if (!svgRef.current || frames.length === 0) return;

    // Build tree structure
    const frameMap = new Map(frames.map((f) => [f.id, f]));
    const rootFrame = frames.find((f) => !f.parentId);

    if (!rootFrame) return;

    const buildTree = (frameId, depth = 0) => {
      const frame = frameMap.get(frameId);
      if (!frame) return null;

      const children = frames
        .filter((f) => f.parentId === frameId)
        .map((f) => buildTree(f.id, depth + 1))
        .filter(Boolean);

      return {
        id: frameId,
        frame,
        children: children.length > 0 ? children : undefined,
        depth,
      };
    };

    const root = buildTree(rootFrame.id);

    // D3 tree layout
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const treeLayout = d3.tree().size([width - 100, height - 100]);

    const hierarchy = d3.hierarchy(root);
    treeLayout(hierarchy);

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', 'translate(50, 50)');

    // Zoom behavior
    const zoom = d3.zoom().on('zoom', (event) => {
      g.attr('transform', event.transform);
    });
    svg.call(zoom);

    // Draw links
    hierarchy.links().forEach((link) => {
      g.append('line')
        .attr('x1', link.source.x)
        .attr('y1', link.source.y)
        .attr('x2', link.target.x)
        .attr('y2', link.target.y)
        .attr('class', 'branch-line');
    });

    // Draw nodes
    const nodes = hierarchy.descendants();
    const nodeGroups = g
      .selectAll('g.node-group')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', (d) => `node-group ${d.parent ? '' : 'root-node'}`)
      .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        onFrameSelect?.(d.data.id);
      })
      .on('mouseenter', (event, d) => {
        setTooltip({
          x: event.pageX,
          y: event.pageY,
          text: d.data.frame.textContent.substring(0, 80),
        });
      })
      .on('mouseleave', () => {
        setTooltip(null);
      });

    // Add circle
    nodeGroups
      .append('circle')
      .attr('r', (d) => (d.parent ? 10 : 15))
      .attr('class', (d) => (d.parent ? 'branch-node' : 'root-node-circle'));

    // Add frame index label
    nodeGroups
      .append('text')
      .attr('class', 'node-label')
      .attr('dy', 30)
      .attr('text-anchor', 'middle')
      .text((d, i) => `F${i + 1}`);
  }, [frames, onFrameSelect]);

  return (
    <div className="frame-graph-container">
      <h3>🎬 Story Universe Map</h3>
      <svg ref={svgRef} className="frame-graph"></svg>
      {tooltip && (
        <div
          className="tooltip"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
          }}
        >
          {tooltip.text}...
        </div>
      )}
    </div>
  );
}
