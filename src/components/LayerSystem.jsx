import React from 'react';
import { Layers, Eye, EyeOff, Lock, Unlock, ArrowUp, ArrowDown } from 'lucide-react';

export default function LayerSystem({ layers, onToggleVisibility, onToggleLock, onMoveLayer }) {
  return (
    <div style={{ padding: '16px', background: 'rgba(18,21,30,0.5)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '0.85rem', fontWeight: '700', color: '#f8fafc' }}>
        <Layers size={16} color="#38bdf8" />
        <span>Layer Stack Hierarchy</span>
      </div>

      <div className="layer-list">
        {layers.map((layer, index) => (
          <div key={layer.id} className={`layer-item ${layer.active ? 'active' : ''}`}>
            <div className="layer-info">
              <span>{layer.name}</span>
            </div>

            <div className="layer-actions">
              <button 
                className="icon-btn"
                onClick={() => onMoveLayer(index, -1)}
                disabled={index === 0}
                title="Move Up"
              >
                <ArrowUp size={14} />
              </button>
              <button 
                className="icon-btn"
                onClick={() => onMoveLayer(index, 1)}
                disabled={index === layers.length - 1}
                title="Move Down"
              >
                <ArrowDown size={14} />
              </button>
              <button 
                className="icon-btn"
                onClick={() => onToggleVisibility(layer.id)}
                title={layer.visible ? 'Hide Layer' : 'Show Layer'}
              >
                {layer.visible ? <Eye size={14} color="#38bdf8" /> : <EyeOff size={14} color="#64748b" />}
              </button>
              <button 
                className="icon-btn"
                onClick={() => onToggleLock(layer.id)}
                title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
              >
                {layer.locked ? <Lock size={14} color="#f59e0b" /> : <Unlock size={14} color="#64748b" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
