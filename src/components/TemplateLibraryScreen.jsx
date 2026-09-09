import React, { useState } from 'react';
import { TEMPLATES } from '../types/templates';
import { Sparkles, Search, ArrowRight, Folder, LayoutGrid } from 'lucide-react';

export default function TemplateLibraryScreen({ onSelectTemplate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('template'); // 'draft' | 'template'

  const filteredTemplates = TEMPLATES.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="capcut-screen">
      {/* Top CapCut Header */}
      <header className="capcut-header">
        <div>
          <div className="capcut-subbadge">
            <Sparkles size={14} color="#a855f7" />
            <span>KOLEKSI TEMPLATE</span>
          </div>
          <h1 className="capcut-title">Pilih Template</h1>
          <p className="capcut-subtitle">Tinggal isi foto & audio, sisanya udah beres</p>
        </div>

        <button className="capcut-search-btn" title="Cari Template">
          <Search size={20} color="#f8fafc" />
        </button>
      </header>

      {/* Main Template Grid */}
      <main className="capcut-grid-container">
        <div className="capcut-grid">
          {filteredTemplates.map(t => (
            <div key={t.id} className="capcut-card">
              {/* Duration Tag Badge Top Right */}
              <div className="capcut-card-duration">
                {t.durationTag || '0:15'}
              </div>

              {/* Cover Image Thumbnail */}
              <div className="capcut-card-img-wrapper">
                <img src={t.refImage} alt={t.name} />
              </div>

              {/* Card Footer Info */}
              <div className="capcut-card-body">
                <h3 className="capcut-card-title">{t.name}</h3>
                <div className="capcut-card-used">
                  <span>🖼️ {t.usedCount || '28 kali digunakan'}</span>
                </div>

                <div className="capcut-card-actions">
                  <button 
                    className="capcut-btn-use"
                    onClick={() => onSelectTemplate(t)}
                  >
                    <span>Gunakan</span>
                    <div className="capcut-arrow-pill">
                      <ArrowRight size={16} color="#fff" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Bottom CapCut Navigation Bar */}
      <footer className="capcut-bottom-nav">
        <button 
          className={`capcut-nav-item ${activeTab === 'draft' ? 'active' : ''}`}
          onClick={() => setActiveTab('draft')}
        >
          <Folder size={18} />
          <span>Draft Project</span>
        </button>

        <button 
          className={`capcut-nav-item active-pill`}
          onClick={() => setActiveTab('template')}
        >
          <LayoutGrid size={18} />
          <span>Template</span>
        </button>
      </footer>
    </div>
  );
}
