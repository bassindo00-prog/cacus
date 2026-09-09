import React, { useState } from 'react';
import { TEMPLATES } from '../types/templates';
import { LayoutGrid, Sparkles } from 'lucide-react';

export default function TemplateLibrary({ selectedTemplate, onSelectTemplate }) {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Cyber & Hologram', 'Futuristic & Airpods', 'Streetwear & Aesthetic', 'Minimal & Polaroid', 'Vinyl & Retro'];

  const filteredTemplates = activeCategory === 'All'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === activeCategory);

  return (
    <div className="sidebar-panel">
      <div className="panel-header">
        <div className="panel-title">
          <LayoutGrid size={18} color="#38bdf8" />
          <span>Template Library</span>
        </div>
        <span className="brand-badge">14 Presets</span>
      </div>

      {/* Category Pills */}
      <div style={{
        display: 'flex',
        gap: '6px',
        padding: '12px 16px',
        overflowX: 'auto',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '4px 10px',
              borderRadius: '20px',
              border: activeCategory === cat ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
              background: activeCategory === cat ? 'rgba(56,189,248,0.15)' : 'transparent',
              color: activeCategory === cat ? '#38bdf8' : '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="panel-content">
        <div className="template-grid">
          {filteredTemplates.map(tmpl => {
            const isSelected = selectedTemplate.id === tmpl.id;
            return (
              <div 
                key={tmpl.id} 
                className={`template-card ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectTemplate(tmpl)}
              >
                <img src={tmpl.refImage} alt={tmpl.name} />
                <div className="template-card-overlay">
                  <div className="template-card-title">{tmpl.name}</div>
                  <div className="template-card-category">{tmpl.category}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
