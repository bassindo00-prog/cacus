import React from 'react';
import { Music2, Download, Layers, Sliders, LayoutGrid, Sparkles } from 'lucide-react';

export default function Navbar({ 
  selectedTemplate, 
  onOpenExport, 
  mobileTab, 
  setMobileTab 
}) {
  return (
    <header className="app-navbar">
      <div className="brand-title">
        <Music2 size={24} color="#38bdf8" />
        <span>TemplateStudio</span>
        <span className="brand-badge">Visual Audio</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'none', mdDisplay: 'inline' }}>
          Active: <strong style={{ color: '#fff' }}>{selectedTemplate.name}</strong>
        </span>
      </div>

      <div className="nav-controls">
        <button className="btn-primary" onClick={onOpenExport}>
          <Download size={16} />
          <span>Export HD</span>
        </button>
      </div>
    </header>
  );
}
