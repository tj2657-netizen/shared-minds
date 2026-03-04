import React, { useState } from 'react';
import NodeCanvas from './NodeCanvas';
import '../styles/Navigation.css';

/**
 * Story graph component - manages story visualization and navigation
 * @param {Array} frames - Array of story frames
 * @param {Function} onFrameSelect - Callback when a frame is selected
 */
export default function StoryGraph({ frames = [], onFrameSelect }) {
  const [selectedFrameId, setSelectedFrameId] = useState(null);
  const [superpositionMode, setSuperpositionMode] = useState(false);

  const handleNodeClick = (frameId) => {
    setSelectedFrameId(frameId);
    onFrameSelect?.(frameId);
  };

  return (
    <div className="story-graph">
      <div className="graph-header">
        <h3>🌌 Story Universe Map</h3>
        <button
          className={`btn-superposition ${superpositionMode ? 'active' : ''}`}
          onClick={() => setSuperpositionMode(!superpositionMode)}
          title="Superposition Mode: View multiple alternate branches simultaneously"
        >
          {superpositionMode ? '✨ Superposition ON' : '✨ Superposition OFF'}
        </button>
      </div>

      <NodeCanvas
        frames={frames}
        onNodeClick={handleNodeClick}
        superpositionMode={superpositionMode}
      />

      {selectedFrameId && (
        <div className="graph-footer">
          <p>📍 Viewing frame: {selectedFrameId}</p>
        </div>
      )}
    </div>
  );
}
