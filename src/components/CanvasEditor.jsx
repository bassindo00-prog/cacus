import React, { useState, useRef, useEffect } from 'react';
import TemplateRenderer from './templates/TemplateRenderer';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Grid, Ratio, SlidersHorizontal } from 'lucide-react';

export default function CanvasEditor({ 
  selectedTemplate, 
  metadata, 
  isPlaying, 
  onTogglePlay,
  progress,
  canvasRef,
  customAspectRatio,
  onAspectRatioChange,
  customWidth,
  customHeight,
  onDimensionsChange
}) {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1, rotate: 0 });
  const [showGrid, setShowGrid] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialTransformRef = useRef({ x: 0, y: 0 });

  // Reset transform when template changes
  useEffect(() => {
    setTransform({ x: 0, y: 0, scale: 1, rotate: 0 });
  }, [selectedTemplate.id]);

  // Touch and Mouse Drag Handlers
  const handlePointerDown = (e) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = { x: clientX, y: clientY };
    initialTransformRef.current = { x: transform.x, y: transform.y };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;
    setTransform(prev => ({
      ...prev,
      x: initialTransformRef.current.x + dx,
      y: initialTransformRef.current.y + dy
    }));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setTransform(prev => ({ ...prev, scale: Math.min(2.5, prev.scale + 0.15) }));
  const handleZoomOut = () => setTransform(prev => ({ ...prev, scale: Math.max(0.4, prev.scale - 0.15) }));
  const handleRotate = () => setTransform(prev => ({ ...prev, rotate: (prev.rotate + 90) % 360 }));
  const handleReset = () => setTransform({ x: 0, y: 0, scale: 1, rotate: 0 });

  // Calculate canvas stage dimensions based on chosen ratio / custom size
  const getAspectRatioDimensions = () => {
    const ratio = customAspectRatio || selectedTemplate.aspectRatio || '3:4';
    if (ratio === 'custom') {
      return { width: `${customWidth || 340}px`, height: `${customHeight || 450}px` };
    }
    switch (ratio) {
      case '1:1': return { width: '360px', height: '360px' };
      case '9:16': return { width: '310px', height: '550px' };
      case '9:19': return { width: '310px', height: '650px' };
      case '4:5': return { width: '340px', height: '425px' };
      case '16:9': return { width: '480px', height: '270px' };
      case '3:4':
      default: return { width: '330px', height: '440px' };
    }
  };

  const stageDimensions = getAspectRatioDimensions();

  const ratiosList = ['1:1', '9:16', '9:19', '4:5', '3:4', '16:9', 'custom'];

  return (
    <div 
      className="canvas-container"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    >
      {/* Aspect Ratio Header Controls */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        zIndex: 35,
        background: 'rgba(18, 21, 30, 0.85)',
        backdropFilter: 'blur(12px)',
        padding: '6px 12px',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.12)'
      }}>
        <Ratio size={14} color="#38bdf8" />
        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#cbd5e1', marginRight: '4px' }}>Aspect Ratio:</span>
        {ratiosList.map(r => (
          <button
            key={r}
            onClick={() => onAspectRatioChange(r)}
            style={{
              padding: '3px 8px',
              borderRadius: '12px',
              border: (customAspectRatio || selectedTemplate.aspectRatio) === r ? '1px solid #38bdf8' : 'none',
              background: (customAspectRatio || selectedTemplate.aspectRatio) === r ? 'rgba(56,189,248,0.2)' : 'transparent',
              color: (customAspectRatio || selectedTemplate.aspectRatio) === r ? '#38bdf8' : '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Floating Canvas Transform Toolbar */}
      <div className="canvas-toolbar">
        <button className="tool-btn" onClick={handleZoomIn} title="Zoom In">
          <ZoomIn size={16} />
        </button>
        <button className="tool-btn" onClick={handleZoomOut} title="Zoom Out">
          <ZoomOut size={16} />
        </button>
        <button className="tool-btn" onClick={handleRotate} title="Rotate 90°">
          <RotateCcw size={16} />
        </button>
        <button className="tool-btn" onClick={handleReset} title="Reset Position">
          <Maximize2 size={16} />
        </button>
        <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />
        <button 
          className={`tool-btn ${showGrid ? 'active' : ''}`} 
          onClick={() => setShowGrid(!showGrid)} 
          title="Toggle Grid Overlay"
        >
          <Grid size={16} />
          <span>Grid</span>
        </button>
      </div>

      {/* Main Canvas Transform Stage */}
      <div 
        className="canvas-wrapper"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale}) rotate(${transform.rotate}deg)`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onPointerDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        {/* Rendered Template Box */}
        <div 
          ref={canvasRef}
          className="canvas-stage"
          style={{
            ...stageDimensions,
            position: 'relative',
            transition: 'width 0.2s ease, height 0.2s ease'
          }}
        >
          <TemplateRenderer 
            template={selectedTemplate} 
            metadata={metadata} 
            isPlaying={isPlaying}
            onTogglePlay={onTogglePlay}
            progress={progress}
          />

          {/* Grid Overlay */}
          {showGrid && (
            <div style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              backgroundImage: 'linear-gradient(to right, rgba(56,189,248,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(56,189,248,0.15) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              zIndex: 40
            }} />
          )}
        </div>

        {/* Touch Handle Box Border */}
        <div className="touch-overlay-handle">
          <div className="touch-corner-node nw" />
          <div className="touch-corner-node ne" />
          <div className="touch-corner-node sw" />
          <div className="touch-corner-node se" />
        </div>
      </div>
    </div>
  );
}
