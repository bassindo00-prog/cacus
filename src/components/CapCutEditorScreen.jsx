import React, { useState, useRef } from 'react';
import TemplateRenderer from './templates/TemplateRenderer';
import { 
  ArrowLeft, Download, Play, Pause, SkipBack, SkipForward, 
  RotateCcw, RotateCw, Maximize2, Scissors, Music, Type, 
  Sparkles, Ratio, Bookmark, Eye, EyeOff, Plus, Check, Upload, Palette, Image as ImageIcon, Clock, Calendar
} from 'lucide-react';

export default function CapCutEditorScreen({ 
  selectedTemplate, 
  onBackToLibrary, 
  onOpenExport,
  metadata,
  onUpdateMetadata,
  currentSong,
  onSelectSong,
  isPlaying,
  onTogglePlay,
  progress,
  onSeek,
  canvasRef,
  customAspectRatio,
  onAspectRatioChange
}) {
  const [activeBottomTool, setActiveBottomTool] = useState('edit'); // 'edit' | 'audio' | 'teks' | 'gaya' | 'rasio' | 'preset'
  const [audioError, setAudioError] = useState(null);

  // Utility to format file size in human-readable units
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Convert uploaded image file to Base64 Data URL
  const handleCoverFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdateMetadata({ coverImage: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBgFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdateMetadata({ bgImage: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // iOS-friendly audio file upload handler with extension & MIME fallback
  const handleAudioFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Reset input value so re-selecting same file triggers onChange
    e.target.value = '';

    const filename = file.name || 'Audio Track';
    const ext = (filename.split('.').pop() || '').toLowerCase();
    const rawType = (file.type || '').toLowerCase();

    // Supported audio extensions (common on iOS Files app, iCloud Drive, Downloads)
    const supportedExts = ['mp3', 'm4a', 'aac', 'wav', 'ogg', 'flac', 'aiff', 'aif', 'caf', 'mp4', 'm4r', '3gp', 'amr', 'wma'];
    const isAudioMime = rawType.startsWith('audio/') || 
                        rawType.includes('mp4') || 
                        rawType.includes('mpeg') || 
                        rawType.includes('aac') || 
                        rawType.includes('wav') ||
                        rawType === 'application/octet-stream';

    const isValidExt = supportedExts.includes(ext);
    const isGenuinelyUnsupported = !isValidExt && !isAudioMime;

    if (isGenuinelyUnsupported) {
      setAudioError(`Format file "${filename}" tidak didukung. Gunakan file audio (MP3, M4A, AAC, WAV, FLAC, dll).`);
      return;
    }

    // Validate size limit (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setAudioError(`Ukuran file (${formatFileSize(file.size)}) terlalu besar. Maksimal 100MB.`);
      return;
    }

    setAudioError(null);

    const formattedSize = formatFileSize(file.size);
    const formatLabel = ext ? ext.toUpperCase() : (rawType.split('/')[1] || 'AUDIO').toUpperCase();
    const songTitle = filename.replace(/\.[^/.]+$/, "");

    // Create object URL with DataURL fallback for iOS WebViews
    const updateSongState = (audioUrl) => {
      onSelectSong({
        id: 'custom-' + Date.now(),
        title: songTitle,
        artist: 'Uploaded Audio',
        url: audioUrl,
        filename: filename,
        fileType: `${formatLabel} (${rawType || '.' + ext})`,
        fileSize: formattedSize
      });
      onUpdateMetadata({ songTitle: songTitle });
    };

    try {
      const objectUrl = URL.createObjectURL(file);
      updateSongState(objectUrl);
    } catch (err) {
      // Fallback for iOS WebViews where object URLs are restricted
      const reader = new FileReader();
      reader.onload = (evt) => {
        updateSongState(evt.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const currentRatio = customAspectRatio || selectedTemplate.aspectRatio || '9:16';

  const getNumericRatio = (r) => {
    switch(r) {
      case '1:1': return '1/1';
      case '4:5': return '4/5';
      case '3:4': return '3/4';
      case '16:9': return '16/9';
      case '9:19': return '9/19';
      case '9:16':
      default: return '9/16';
    }
  };

  return (
    <div className="capcut-editor-container">
      {/* Hidden File Inputs */}
      <input 
        ref={coverInputRef}
        type="file" 
        accept="image/*" 
        onChange={handleCoverFileChange} 
        style={{ display: 'none' }} 
      />
      <input 
        ref={bgInputRef}
        type="file" 
        accept="image/*" 
        onChange={handleBgFileChange} 
        style={{ display: 'none' }} 
      />
      <input 
        ref={audioInputRef}
        type="file" 
        accept="audio/*,audio/mpeg,audio/mp4,audio/x-m4a,audio/m4a,audio/aac,audio/wav,audio/x-wav,audio/ogg,audio/flac,.mp3,.m4a,.aac,.wav,.ogg,.flac,.aiff,.caf,.mp4,.m4r,.3gp,.amr"
        onChange={handleAudioFileChange} 
        style={{ display: 'none' }} 
      />

      {/* Top Header Bar */}
      <header className="capcut-editor-header">
        <button className="capcut-icon-btn" onClick={onBackToLibrary}>
          <ArrowLeft size={22} color="#fff" />
        </button>

        <h2 className="capcut-editor-title">{selectedTemplate.name}</h2>

        <button className="capcut-export-btn" onClick={onOpenExport}>
          <Download size={16} />
          <span>Export</span>
        </button>
      </header>

      {/* Main Preview Canvas Viewport */}
      <div className="capcut-canvas-viewport">
        <div 
          ref={canvasRef}
          className="capcut-canvas-stage"
          style={{
            height: '380px',
            maxHeight: '44vh',
            aspectRatio: getNumericRatio(currentRatio),
            margin: '0 auto',
            position: 'relative'
          }}
        >
          <TemplateRenderer 
            template={selectedTemplate}
            metadata={metadata}
            isPlaying={isPlaying}
            onTogglePlay={onTogglePlay}
            progress={progress}
          />
        </div>

        <button className="capcut-expand-btn" title="Expand View">
          <Maximize2 size={16} color="#fff" />
        </button>
      </div>

      {/* Transport Controls Bar */}
      <div className="capcut-transport-bar">
        <div className="capcut-transport-left">
          <button className="capcut-mini-btn" title="Undo"><RotateCcw size={16} /></button>
          <button className="capcut-mini-btn" title="Redo"><RotateCw size={16} /></button>
        </div>

        <div className="capcut-transport-center">
          <button className="capcut-mini-btn" onClick={() => onSeek(0)}><SkipBack size={18} /></button>
          <button 
            className="capcut-play-circle"
            onClick={() => onTogglePlay(!isPlaying)}
          >
            {isPlaying ? <Pause size={20} fill="#000" /> : <Play size={20} fill="#000" style={{ marginLeft: '2px' }} />}
          </button>
          <button className="capcut-mini-btn" onClick={() => onSeek(100)}><SkipForward size={18} /></button>
          <span className="capcut-timecode">00:{Math.floor(progress * 0.15) < 10 ? '0' : ''}{Math.floor(progress * 0.15)} / 00:15</span>
        </div>

        <div className="capcut-transport-right">
          <div className="capcut-diamond-marker">◇</div>
        </div>
      </div>

      {/* CapCut Timeline Multi-Track Area */}
      <div className="capcut-timeline-area">
        {/* Timeline Ruler Header */}
        <div className="capcut-timeline-ruler">
          <span>0s</span>
          <span>5s</span>
          <span>10s</span>
          <span>15s</span>
          <div className="capcut-scrub-needle" style={{ left: `${progress}%` }} />
        </div>

        {/* Multi-Track Layers List */}
        <div className="capcut-tracks-stack">
          {/* Track 1: Foto Sampul */}
          <div className="capcut-track-row" onClick={() => coverInputRef.current && coverInputRef.current.click()} style={{ cursor: 'pointer' }}>
            <div className="capcut-track-meta">
              <Eye size={14} color="#94a3b8" />
              <span>Foto sampul</span>
            </div>
            <div className="capcut-track-content cover-track">
              <div className="capcut-track-clip cover-clip" style={{ width: '100%' }}>
                <img src={metadata.coverImage || selectedTemplate.refImage} alt="cover" />
                <span>Foto sampul (Klik untuk ganti)</span>
              </div>
            </div>
          </div>

          {/* Track 2: Judul Lagu Text Track */}
          <div className="capcut-track-row" onClick={() => setActiveBottomTool('teks')} style={{ cursor: 'pointer' }}>
            <div className="capcut-track-meta">
              <Eye size={14} color="#94a3b8" />
              <span>Judul</span>
            </div>
            <div className="capcut-track-content text-track">
              <div className="capcut-track-clip text-clip" style={{ width: '100%' }}>
                <span>𝘛 Judul: {metadata.songTitle || 'Judul Lagu'}</span>
              </div>
            </div>
          </div>

          {/* Track 3: Artist Text Track */}
          <div className="capcut-track-row" onClick={() => setActiveBottomTool('teks')} style={{ cursor: 'pointer' }}>
            <div className="capcut-track-meta">
              <Eye size={14} color="#94a3b8" />
              <span>Artist</span>
            </div>
            <div className="capcut-track-content artist-track">
              <div className="capcut-track-clip artist-clip" style={{ width: '100%' }}>
                <span>𝘛 Artist: {metadata.artist || 'Nama Artist'}</span>
              </div>
            </div>
          </div>

          {/* Track 4: Audio Track */}
          <div className="capcut-track-row" onClick={() => audioInputRef.current && audioInputRef.current.click()} style={{ cursor: 'pointer' }}>
            <div className="capcut-track-meta">
              <Eye size={14} color="#94a3b8" />
              <span>Audio</span>
            </div>
            <div className="capcut-track-content audio-track">
              <div className="capcut-track-clip audio-clip" style={{ width: '100%' }}>
                <span>🎵 {currentSong.filename || currentSong.title} {currentSong.fileSize ? `(${currentSong.fileSize})` : ''} • Klik ganti</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CapCut Active Tool Inspector Drawer */}
      <div className="capcut-active-panel">
        {activeBottomTool === 'edit' && (
          <div className="capcut-panel-row">
            <button 
              className="capcut-upload-card"
              onClick={() => coverInputRef.current && coverInputRef.current.click()}
              type="button"
            >
              <Upload size={20} color="#a855f7" />
              <span>Ganti Foto Sampul</span>
            </button>

            <button 
              className="capcut-upload-card"
              onClick={() => bgInputRef.current && bgInputRef.current.click()}
              type="button"
            >
              <ImageIcon size={20} color="#38bdf8" />
              <span>Ganti Background</span>
            </button>
          </div>
        )}

        {activeBottomTool === 'audio' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {audioError && (
              <div className="capcut-error-banner">
                {audioError}
              </div>
            )}

            <div className="capcut-audio-meta-card">
              <div className="capcut-audio-meta-header">
                <span className="capcut-audio-meta-title">🎵 {currentSong.filename || currentSong.title}</span>
              </div>
              <div className="capcut-audio-meta-tags">
                <span>Format: {currentSong.fileType || 'Audio'}</span>
                <span>•</span>
                <span>Ukuran: {currentSong.fileSize || 'Standard'}</span>
              </div>
            </div>

            <div className="capcut-panel-row">
              <button 
                className="capcut-upload-card"
                onClick={() => audioInputRef.current && audioInputRef.current.click()}
                type="button"
              >
                <Music size={20} color="#a855f7" />
                <span>Upload MP3 / M4A / WAV Baru</span>
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Full Text Fields Editor (Song Title, Artist, Lock Clock, Date, Badge, Caption, Username) */}
        {activeBottomTool === 'teks' && (
          <div className="capcut-panel-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '120px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div className="capcut-input-group">
                <span className="capcut-input-label">Judul Lagu</span>
                <input 
                  type="text"
                  className="capcut-text-input"
                  value={metadata.songTitle || ''}
                  onChange={(e) => onUpdateMetadata({ songTitle: e.target.value })}
                  placeholder="Judul lagu..."
                />
              </div>
              <div className="capcut-input-group">
                <span className="capcut-input-label">Nama Artist</span>
                <input 
                  type="text"
                  className="capcut-text-input"
                  value={metadata.artist || ''}
                  onChange={(e) => onUpdateMetadata({ artist: e.target.value })}
                  placeholder="Nama artist..."
                />
              </div>
            </div>

            {/* Lockscreen Jam & Tanggal Text Inputs (if available in template) */}
            {(metadata.lockTime !== undefined || metadata.lockDate !== undefined || selectedTemplate.category === 'iOS Lockscreen') && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <div className="capcut-input-group">
                  <span className="capcut-input-label">🕒 Teks Jam Lockscreen</span>
                  <input 
                    type="text"
                    className="capcut-text-input"
                    value={metadata.lockTime || '00:58'}
                    onChange={(e) => onUpdateMetadata({ lockTime: e.target.value })}
                    placeholder="00:58"
                  />
                </div>
                <div className="capcut-input-group">
                  <span className="capcut-input-label">📅 Teks Hari / Tanggal</span>
                  <input 
                    type="text"
                    className="capcut-text-input"
                    value={metadata.lockDate || 'Fri, Feb 20'}
                    onChange={(e) => onUpdateMetadata({ lockDate: e.target.value })}
                    placeholder="Fri, Feb 20"
                  />
                </div>
              </div>
            )}

            {/* Weather & Battery Text Inputs */}
            {(metadata.weatherText !== undefined || selectedTemplate.id === 't17_ios_weather_widget') && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <div className="capcut-input-group">
                  <span className="capcut-input-label">⛅ Teks Cuaca</span>
                  <input 
                    type="text"
                    className="capcut-text-input"
                    value={metadata.weatherText || '18° Nublado'}
                    onChange={(e) => onUpdateMetadata({ weatherText: e.target.value })}
                    placeholder="18° Nublado..."
                  />
                </div>
                <div className="capcut-input-group">
                  <span className="capcut-input-label">🔋 Teks Baterai & Nama</span>
                  <input 
                    type="text"
                    className="capcut-text-input"
                    value={metadata.batteryText || '92% iPhone'}
                    onChange={(e) => onUpdateMetadata({ batteryText: e.target.value })}
                    placeholder="92% iPhone..."
                  />
                </div>
              </div>
            )}

            {/* Profile Username / Caption Inputs */}
            {(metadata.username !== undefined || metadata.caption !== undefined || metadata.quoteText !== undefined) && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <div className="capcut-input-group">
                  <span className="capcut-input-label">👤 Username / Caption</span>
                  <input 
                    type="text"
                    className="capcut-text-input"
                    value={metadata.username || metadata.caption || metadata.quoteText || ''}
                    onChange={(e) => onUpdateMetadata({ username: e.target.value, caption: e.target.value, quoteText: e.target.value })}
                    placeholder="Username atau caption..."
                  />
                </div>
                <div className="capcut-input-group">
                  <span className="capcut-input-label">🏷️ Brand / Badge Logo</span>
                  <input 
                    type="text"
                    className="capcut-text-input"
                    value={metadata.badgeText || 'Spotify'}
                    onChange={(e) => onUpdateMetadata({ badgeText: e.target.value })}
                    placeholder="Spotify, iPhone..."
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeBottomTool === 'gaya' && (
          <div className="capcut-panel-row" style={{ alignItems: 'center', justifyContent: 'space-around' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600' }}>Glow Neon:</span>
              <input 
                type="color"
                className="color-swatch-input"
                value={metadata.glowColor || '#8b5cf6'}
                onChange={(e) => onUpdateMetadata({ glowColor: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600' }}>Warna Jam:</span>
              <input 
                type="color"
                className="color-swatch-input"
                value={metadata.clockColor || '#fed7aa'}
                onChange={(e) => onUpdateMetadata({ clockColor: e.target.value })}
              />
            </div>
          </div>
        )}

        {activeBottomTool === 'rasio' && (
          <div className="capcut-panel-pills">
            {['1:1', '9:16', '9:19', '4:5', '3:4', '16:9'].map(r => (
              <button 
                key={r}
                className={`capcut-ratio-pill ${currentRatio === r ? 'active' : ''}`}
                onClick={() => onAspectRatioChange(r)}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Action Toolbar */}
      <footer className="capcut-bottom-toolbar">
        <button 
          className={`capcut-tool-item ${activeBottomTool === 'edit' ? 'active' : ''}`}
          onClick={() => setActiveBottomTool('edit')}
        >
          <Scissors size={20} />
          <span>Edit</span>
        </button>

        <button 
          className={`capcut-tool-item ${activeBottomTool === 'audio' ? 'active' : ''}`}
          onClick={() => setActiveBottomTool('audio')}
        >
          <Music size={20} />
          <span>Audio</span>
        </button>

        <button 
          className={`capcut-tool-item ${activeBottomTool === 'teks' ? 'active' : ''}`}
          onClick={() => setActiveBottomTool('teks')}
        >
          <Type size={20} />
          <span>Teks</span>
        </button>

        <button 
          className={`capcut-tool-item ${activeBottomTool === 'gaya' ? 'active' : ''}`}
          onClick={() => setActiveBottomTool('gaya')}
        >
          <Sparkles size={20} />
          <span>Gaya</span>
        </button>

        <button 
          className={`capcut-tool-item ${activeBottomTool === 'rasio' ? 'active' : ''}`}
          onClick={() => setActiveBottomTool('rasio')}
        >
          <Ratio size={20} />
          <span>Rasio</span>
        </button>

        <button 
          className="capcut-tool-item"
          onClick={onBackToLibrary}
        >
          <Bookmark size={20} />
          <span>Preset</span>
        </button>
      </footer>
    </div>
  );
}
