import React from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Heart, Bookmark, Shuffle, Repeat, Radio, UserPlus, 
  MoreHorizontal, Plus, ChevronDown, Check, Sliders,
  Cloud, BatteryCharging, Headphones, Camera, Zap
} from 'lucide-react';

export default function TemplateRenderer({ 
  template, 
  metadata, 
  isPlaying = false, 
  onTogglePlay = () => {},
  progress = 30
}) {
  if (!template) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6', background: '#090a0f' }}>
        <span>Pilih Template...</span>
      </div>
    );
  }

  const data = { ...(template.defaults || {}), ...(metadata || {}) };

  // SVG Data URI placeholder if image loading fails or is empty
  const defaultPlaceholderCover = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%233b82f6'/%3E%3Cstop offset='100%25' stop-color='%238b5cf6'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='400' fill='url(%23g)'/%3E%3Cpath d='M200 130 v100 a35 35 0 1 1 -30 -34.5 v-65.5 l70 -15 v60 a35 35 0 1 1 -30 -34.5 v-50 z' fill='%23ffffff' opacity='0.9'/%3E%3C/svg%3E";

  const displayTitle = (data.songTitle && data.songTitle.trim() !== '') ? data.songTitle : 'Judul Lagu';
  const displayArtist = (data.artist && data.artist.trim() !== '') ? data.artist : 'Nama Artist';
  const displayCover = data.coverImage || template.defaults?.coverImage || defaultPlaceholderCover;

  const handleImgError = (e) => {
    e.target.src = defaultPlaceholderCover;
  };

  // Calculate current seek time display string based on progress percentage
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const totalSecs = 210; // 3 min 30s default
  const currentSecs = Math.floor((progress / 100) * totalSecs);
  const currentTimeStr = formatTime(currentSecs);
  const durationStr = formatTime(totalSecs);

  // Dynamic title styling for 100% full readability without cutoff
  const getTitleStyle = (baseSize = '0.9rem') => ({
    fontSize: displayTitle.length > 28 ? '0.74rem' : displayTitle.length > 18 ? '0.82rem' : baseSize,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: '1.25',
    wordBreak: 'break-word',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    margin: 0
  });

  const getArtistStyle = (baseSize = '0.75rem', color = '#93c5fd') => ({
    fontSize: baseSize,
    fontWeight: '500',
    color: color,
    lineHeight: '1.2',
    wordBreak: 'break-word',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    margin: '2px 0 0 0'
  });

  switch (template.id) {
    // -------------------------------------------------------------
    // TEMPLATE 1: Holographic Neon Profile Card (6127691152321352178_121.jpg)
    // -------------------------------------------------------------
    case 't1_holographic_profile':
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', background: '#040508', boxSizing: 'border-box', overflow: 'hidden' }}>
          {data.bgImage && <img src={data.bgImage} alt="bg" onError={handleImgError} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }} />}
          <div style={{ position: 'relative', width: '100%', maxWidth: '340px', maxHeight: '92%', background: 'rgba(12, 14, 24, 0.85)', backdropFilter: 'blur(20px)', borderRadius: '20px', padding: '14px', border: `2px solid ${data.glowColor || '#8b5cf6'}`, boxShadow: `0 0 25px ${data.glowColor || '#8b5cf6'}aa`, color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px', boxSizing: 'border-box', overflow: 'hidden', margin: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Plus size={18} />
              <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>{data.username || 'galib______786'}</div>
              <MoreHorizontal size={16} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={displayCover} alt="avatar" onError={handleImgError} style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${data.accentColor || '#ec4899'}` }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={getTitleStyle('0.85rem')}>{displayArtist}</div>
                <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>{data.followers || '66'} followers</div>
              </div>
            </div>
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // TEMPLATE 2: Cyber Earbud Light Stream (6127691152321352179_121.jpg)
    // -------------------------------------------------------------
    case 't2_earbud_hologram':
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#090b10', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', boxSizing: 'border-box', overflow: 'hidden' }}>
          {data.bgImage && <img src={data.bgImage} alt="bg" onError={handleImgError} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
          <div style={{ position: 'relative', width: '92%', maxWidth: '340px', maxHeight: '88%', padding: '14px', background: 'rgba(15, 23, 42, 0.82)', backdropFilter: 'blur(16px)', borderRadius: '20px', border: `2px solid ${data.glowColor || '#38bdf8'}`, boxShadow: `0 0 25px ${data.glowColor || '#38bdf8'}aa`, color: '#fff', boxSizing: 'border-box', margin: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <img src={displayCover} alt="album" onError={handleImgError} style={{ width: '56px', height: '56px', minWidth: '56px', borderRadius: '8px', objectFit: 'cover' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={getTitleStyle('0.88rem')}>{displayTitle}</h3>
                <p style={getArtistStyle('0.72rem', '#cbd5e1')}>{displayArtist}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                  <SkipBack size={14} fill="#fff" style={{ cursor: 'pointer' }} />
                  <button onClick={onTogglePlay} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                    {isPlaying ? <Pause size={16} fill="#fff" /> : <Play size={16} fill="#fff" />}
                  </button>
                  <SkipForward size={14} fill="#fff" style={{ cursor: 'pointer' }} />
                </div>
              </div>
            </div>
            <div>
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}><div style={{ width: `${progress}%`, height: '100%', background: data.glowColor || '#38bdf8' }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#94a3b8', marginTop: '2px' }}><span>{currentTimeStr}</span><span>-{durationStr}</span></div>
            </div>
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // TEMPLATE 3: Airpods Blue Neon Case Screen (6127691152321352180_121.jpg)
    // -------------------------------------------------------------
    case 't3_airpods_blue':
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', boxSizing: 'border-box', overflow: 'hidden' }}>
          {data.bgImage && <img src={data.bgImage} alt="bg" onError={handleImgError} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
          <div style={{ position: 'relative', width: '92%', maxWidth: '340px', maxHeight: '90%', background: 'rgba(2, 6, 23, 0.92)', borderRadius: '20px', border: `2px solid ${data.glowColor || '#2563eb'}`, boxShadow: `0 0 30px ${data.glowColor || '#2563eb'}ff`, padding: '12px', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px', boxSizing: 'border-box', overflow: 'hidden', margin: 'auto' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', overflow: 'hidden' }}>
              <img src={displayCover} alt="cover" onError={handleImgError} style={{ width: '48px', height: '48px', minWidth: '48px', borderRadius: '8px', objectFit: 'cover' }} />
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <h4 style={getTitleStyle('0.88rem')}>{displayTitle}</h4>
                <p style={getArtistStyle('0.72rem', '#93c5fd')}>{displayArtist}</p>
              </div>
            </div>
            <div>
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}><div style={{ width: `${progress}%`, height: '100%', background: '#ffffff' }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#93c5fd', marginTop: '2px' }}><span>{currentTimeStr}</span><span>-{durationStr}</span></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <SkipBack size={15} fill="#fff" style={{ cursor: 'pointer' }} />
                <button onClick={onTogglePlay} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  {isPlaying ? <Pause size={17} fill="#fff" /> : <Play size={17} fill="#fff" stroke="none" />}
                </button>
                <SkipForward size={15} fill="#fff" style={{ cursor: 'pointer' }} />
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#1db954', whiteSpace: 'nowrap' }}>{data.badgeText || 'Spotify'}</span>
            </div>
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // TEMPLATE 4: Airpods Amber Neon Case Screen (6127691152321352181_121.jpg)
    // -------------------------------------------------------------
    case 't4_airpods_orange':
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0c0400', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px', boxSizing: 'border-box', overflow: 'hidden' }}>
          {data.bgImage && <img src={data.bgImage} alt="bg" onError={handleImgError} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
          <div style={{ position: 'relative', width: '90%', maxWidth: '340px', maxHeight: '90%', background: 'rgba(24, 9, 2, 0.88)', backdropFilter: 'blur(12px)', borderRadius: '22px', border: `2px solid ${data.glowColor || '#f97316'}`, boxShadow: `0 0 30px ${data.glowColor || '#f97316'}dd`, padding: '12px', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px', boxSizing: 'border-box', overflow: 'hidden', margin: 'auto' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: '600', color: '#ffedd5', wordBreak: 'break-word' }}>
              {data.caption || 'La Misión para la racha, porque es un temazo.'}
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', overflow: 'hidden' }}>
              <img src={displayCover} alt="cover" onError={handleImgError} style={{ width: '48px', height: '48px', minWidth: '48px', borderRadius: '8px', objectFit: 'cover' }} />
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <h4 style={getTitleStyle('0.88rem')}>{displayTitle}</h4>
                <p style={getArtistStyle('0.72rem', '#fdba74')}>{displayArtist}</p>
              </div>
            </div>
            <div>
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}><div style={{ width: `${progress}%`, height: '100%', background: '#ffffff' }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#fdba74', marginTop: '2px' }}><span>{currentTimeStr}</span><span>-{durationStr}</span></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <SkipBack size={15} fill="#fff" style={{ cursor: 'pointer' }} />
                <button onClick={onTogglePlay} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  {isPlaying ? <Pause size={17} fill="#fff" /> : <Play size={17} fill="#fff" />}
                </button>
                <SkipForward size={15} fill="#fff" style={{ cursor: 'pointer' }} />
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#1db954', whiteSpace: 'nowrap' }}>{data.badgeText || 'Spotify'}</span>
            </div>
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // TEMPLATE 5: Airpods Noir White Glow Case (6127691152321352182_121.jpg)
    // -------------------------------------------------------------
    case 't5_airpods_monochrome':
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', boxSizing: 'border-box', overflow: 'hidden' }}>
          {data.bgImage && <img src={data.bgImage} alt="bg" onError={handleImgError} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
          <div style={{ position: 'relative', width: '90%', maxWidth: '320px', maxHeight: '88%', background: 'rgba(10, 10, 10, 0.92)', borderRadius: '20px', border: '2px solid #ffffff', boxShadow: '0 0 30px rgba(255, 255, 255, 0.8)', padding: '12px', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px', boxSizing: 'border-box', overflow: 'hidden', margin: 'auto' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', overflow: 'hidden' }}>
              <img src={displayCover} alt="cover" onError={handleImgError} style={{ width: '46px', height: '46px', minWidth: '46px', borderRadius: '6px', objectFit: 'cover', filter: 'grayscale(100%)' }} />
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <h4 style={getTitleStyle('0.85rem')}>{displayTitle}</h4>
                <p style={getArtistStyle('0.7rem', '#94a3b8')}>{displayArtist}</p>
              </div>
            </div>
            <div>
              <div style={{ height: '2px', background: 'rgba(255,255,255,0.25)', borderRadius: '2px' }}><div style={{ width: `${progress}%`, height: '100%', background: '#ffffff' }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#94a3b8', marginTop: '2px' }}><span>{currentTimeStr}</span><span>-{durationStr}</span></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <SkipBack size={14} fill="#fff" style={{ cursor: 'pointer' }} />
                <button onClick={onTogglePlay} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  {isPlaying ? <Pause size={16} fill="#fff" /> : <Play size={16} fill="#fff" />}
                </button>
                <SkipForward size={14} fill="#fff" style={{ cursor: 'pointer' }} />
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap' }}>{data.badgeText || 'Spotify'}</span>
            </div>
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // TEMPLATE 6: Album Rug / Floor Mat Player (6127691152321352183_121.jpg)
    // -------------------------------------------------------------
    case 't6_floor_mat_rug':
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#1c1917', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', boxSizing: 'border-box', overflow: 'hidden' }}>
          {data.bgImage && <img src={data.bgImage} alt="bg" onError={handleImgError} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
          <div style={{ position: 'relative', width: '90%', maxWidth: '320px', maxHeight: '90%', background: data.rugColor || '#880808', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.8)', padding: '14px', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px', boxSizing: 'border-box', overflow: 'hidden', margin: 'auto' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#dc2626', letterSpacing: '-0.04em', fontFamily: 'Montserrat, sans-serif' }}>
              {data.albumHeader || 'DAMN.'}
            </div>
            <div style={{ textAlign: 'center' }}>
              <img src={displayCover} alt="album" onError={handleImgError} style={{ width: '100px', height: '100px', borderRadius: '10px', objectFit: 'cover', margin: '0 auto', display: 'block' }} />
            </div>
            <div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h3 style={getTitleStyle('0.98rem')}>{displayTitle}</h3>
                <p style={getArtistStyle('0.75rem', '#f8fafc')}>{displayArtist}</p>
              </div>
              <div style={{ marginTop: '6px' }}>
                <div style={{ height: '3px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }}><div style={{ width: `${progress}%`, height: '100%', background: '#ffffff' }} /></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', opacity: 0.8, marginTop: '2px' }}><span>{currentTimeStr}</span><span>-{durationStr}</span></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '6px' }}>
                <SkipBack size={16} fill="#fff" style={{ cursor: 'pointer' }} />
                <button 
                  onClick={onTogglePlay} 
                  style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#fff', border: 'none', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  {isPlaying ? <Pause size={16} fill="#000" /> : <Play size={16} fill="#000" style={{ marginLeft: '2px' }} />}
                </button>
                <SkipForward size={16} fill="#fff" style={{ cursor: 'pointer' }} />
              </div>
            </div>
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // TEMPLATE 7: Silk Glass Airpods Floating Widget (6127691152321352184_121.jpg)
    // -------------------------------------------------------------
    case 't7_silk_glass_widget':
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#042f2e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px', boxSizing: 'border-box', overflow: 'hidden' }}>
          {data.bgImage && <img src={data.bgImage} alt="bg" onError={handleImgError} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
          <div style={{ position: 'relative', width: '90%', maxWidth: '320px', maxHeight: '88%', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '20px', border: `1.5px solid ${data.glowColor || '#06b6d4'}`, boxShadow: `0 0 25px ${data.glowColor || '#06b6d4'}66`, padding: '12px', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px', boxSizing: 'border-box', overflow: 'hidden', margin: 'auto' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '500', color: '#e0f2fe', wordBreak: 'break-word' }}>
              {data.quoteText || 'A veces querer mucho tampoco es suficiente'}
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', overflow: 'hidden' }}>
              <img src={displayCover} alt="cover" onError={handleImgError} style={{ width: '46px', height: '46px', minWidth: '46px', borderRadius: '8px', objectFit: 'cover' }} />
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <h4 style={getTitleStyle('0.85rem')}>{displayTitle}</h4>
                <p style={getArtistStyle('0.7rem', '#94a3b8')}>{displayArtist}</p>
              </div>
              <Bookmark size={15} color="#94a3b8" style={{ flexShrink: 0 }} />
            </div>
            <div>
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}><div style={{ width: `${progress}%`, height: '100%', background: '#ffffff' }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#94a3b8', marginTop: '2px' }}><span>{currentTimeStr}</span><span>{durationStr}</span></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <SkipBack size={15} fill="#fff" style={{ cursor: 'pointer' }} />
              <button onClick={onTogglePlay} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                {isPlaying ? <Pause size={17} fill="#fff" /> : <Play size={17} fill="#fff" opacity={1} />}
              </button>
              <SkipForward size={15} fill="#fff" style={{ cursor: 'pointer' }} />
            </div>
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // TEMPLATE 8: Selfie Story Overlay Player (6127691152321352185_120.jpg)
    // -------------------------------------------------------------
    case 't8_selfie_story_overlay':
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#090a0f', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden', boxSizing: 'border-box' }}>
          {data.bgImage && <img src={data.bgImage} alt="selfie bg" onError={handleImgError} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
          <div style={{ position: 'relative', marginTop: 'auto', marginBottom: '8%', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 10 }}>
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.4)', borderRadius: '2px' }}><div style={{ width: `${progress}%`, height: '100%', background: '#ffffff' }} /></div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '18px' }}>
              <Shuffle size={15} color="#fff" style={{ cursor: 'pointer' }} />
              <SkipBack size={17} fill="#fff" style={{ cursor: 'pointer' }} />
              <button 
                onClick={onTogglePlay} 
                style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#ffffff', color: '#000000', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                {isPlaying ? <Pause size={18} fill="#000" /> : <Play size={18} fill="#000" style={{ marginLeft: '2px' }} />}
              </button>
              <SkipForward size={17} fill="#fff" style={{ cursor: 'pointer' }} />
              <Repeat size={15} color="#fff" style={{ cursor: 'pointer' }} />
            </div>
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // TEMPLATE 9: Neon Portrait Glass Frame (6127691152321352186_121.jpg)
    // -------------------------------------------------------------
    case 't9_glass_portrait_glow':
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', boxSizing: 'border-box', overflow: 'hidden' }}>
          {data.bgImage && <img src={data.bgImage} alt="bg" onError={handleImgError} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
          <div style={{ position: 'relative', width: '90%', maxWidth: '320px', maxHeight: '88%', border: '2px solid rgba(255, 255, 255, 0.85)', borderRadius: '20px', boxShadow: '0 0 20px rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(4px)', padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', color: '#fff', boxSizing: 'border-box', overflow: 'hidden', margin: 'auto' }}>
            <h3 style={getTitleStyle('0.98rem')}>{displayTitle}</h3>
            <p style={getArtistStyle('0.72rem', '#94a3b8')}>{displayArtist}</p>
            <div>
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }}><div style={{ width: `${progress}%`, height: '100%', background: '#ffffff' }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#cbd5e1', marginTop: '2px' }}><span>{currentTimeStr}</span><span>{durationStr}</span></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
              <Heart size={15} color="#fff" />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <SkipBack size={16} fill="#fff" style={{ cursor: 'pointer' }} />
                <button 
                  onClick={onTogglePlay} 
                  style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  {isPlaying ? <Pause size={16} fill="#000" /> : <Play size={16} fill="#000" style={{ marginLeft: '2px' }} />}
                </button>
                <SkipForward size={16} fill="#fff" style={{ cursor: 'pointer' }} />
              </div>
              <Heart size={15} color="#fff" />
            </div>
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // TEMPLATE 10: Holographic Vertical Glass Touchscreen (6127691152321352187_121.jpg)
    // -------------------------------------------------------------
    case 't10_vertical_transparent_glass':
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#090a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', boxSizing: 'border-box', overflow: 'hidden' }}>
          {data.bgImage && <img src={data.bgImage} alt="bg" onError={handleImgError} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
          <div style={{ position: 'relative', width: '54%', maxWidth: '240px', maxHeight: '90%', background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(16px)', borderRadius: '18px', border: '1.5px solid rgba(255, 255, 255, 0.25)', padding: '10px', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', overflow: 'hidden', marginRight: 'auto' }}>
            <div style={{ fontSize: '0.58rem', fontWeight: '700', letterSpacing: '0.06em', color: '#94a3b8' }}>{data.headerCategory || 'UNDERGROUND BOOM BAP'}</div>
            <div>
              <div style={getTitleStyle('0.75rem')}>{displayTitle}</div>
              <div style={getArtistStyle('0.62rem', '#94a3b8')}>{displayArtist}</div>
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', marginTop: '4px' }}><div style={{ width: `${progress}%`, height: '100%', background: '#ffffff' }} /></div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '4px' }}>
                <SkipBack size={13} fill="#fff" style={{ cursor: 'pointer' }} />
                <button onClick={onTogglePlay} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  {isPlaying ? <Pause size={15} fill="#fff" /> : <Play size={15} fill="#fff" />}
                </button>
                <SkipForward size={13} fill="#fff" style={{ cursor: 'pointer' }} />
              </div>
            </div>
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // TEMPLATE 11: Minimalist Retro Polaroid Card (6127691152321352188_121.jpg)
    // -------------------------------------------------------------
    case 't11_retro_polaroid':
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#d6d3d1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', boxSizing: 'border-box', overflow: 'hidden' }}>
          {data.bgImage && <img src={data.bgImage} alt="bg" onError={handleImgError} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
          <div style={{ position: 'relative', width: '90%', maxWidth: '280px', maxHeight: '90%', background: data.cardBg || '#a8a29e', borderRadius: '18px', padding: '12px', color: '#1c1917', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px', boxSizing: 'border-box', overflow: 'hidden', margin: 'auto' }}>
            <img src={displayCover} alt="polaroid photo" onError={handleImgError} style={{ width: '100%', maxHeight: '60%', objectFit: 'cover', borderRadius: '8px' }} />
            <div>
              <h3 style={getTitleStyle('0.92rem')}>{displayTitle}</h3>
              <p style={getArtistStyle('0.72rem', '#44403c')}>{displayArtist}</p>
            </div>
            <div>
              <div style={{ position: 'relative', height: '3px', background: 'rgba(0,0,0,0.2)', borderRadius: '2px' }}><div style={{ width: `${progress}%`, height: '100%', background: '#000000' }} /></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Shuffle size={14} color="#000" />
              <SkipBack size={16} fill="#000" />
              <button 
                onClick={onTogglePlay} 
                style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#000', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                {isPlaying ? <Pause size={16} fill="#fff" /> : <Play size={16} fill="#fff" style={{ marginLeft: '2px' }} />}
              </button>
              <SkipForward size={16} fill="#000" />
              <Repeat size={14} color="#000" />
            </div>
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // TEMPLATE 12: Vinyl Disk Popout Sleeve Card (6127691152321352189_121.jpg)
    // -------------------------------------------------------------
    case 't12_vinyl_popout':
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#ede9fe', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px', boxSizing: 'border-box', overflow: 'hidden' }}>
          {data.bgImage && <img src={data.bgImage} alt="bg" onError={handleImgError} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
          <div style={{ position: 'relative', width: '220px', height: '240px', margin: 'auto' }}>
            <div style={{ position: 'absolute', top: '12px', right: '-38px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, #334155 0%, #0f172a 40%, #000000 100%)', border: '2px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className={isPlaying ? 'spin-slow' : 'spin-slow-paused'}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#f59e0b', border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#000' }} /></div>
            </div>
            <div style={{ position: 'absolute', inset: 0, background: data.sleeveColor || '#581c87', borderRadius: '18px', padding: '12px', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 5, boxSizing: 'border-box', overflow: 'hidden' }}>
              <img src={displayCover} alt="cover" onError={handleImgError} style={{ width: '100%', height: '120px', borderRadius: '10px', objectFit: 'cover' }} />
              <div>
                <h4 style={getTitleStyle('0.82rem')}>{displayTitle}</h4>
                <p style={getArtistStyle('0.68rem', '#e9d5ff')}>{displayArtist}</p>
              </div>
              <div>
                <div style={{ height: '3px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }}><div style={{ width: `${progress}%`, height: '100%', background: '#ffffff' }} /></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                <Shuffle size={13} color="#fff" />
                <SkipBack size={15} fill="#fff" />
                <button 
                  onClick={onTogglePlay} 
                  style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fff', border: 'none', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  {isPlaying ? <Pause size={14} fill="#000" /> : <Play size={14} fill="#000" style={{ marginLeft: '2px' }} />}
                </button>
                <SkipForward size={15} fill="#fff" />
                <Repeat size={13} color="#fff" />
              </div>
            </div>
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // TEMPLATE 13: Classic iPod / iPhone Dark Frame (6127691152321352190_121.jpg)
    // -------------------------------------------------------------
    case 't13_classic_ipod':
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#090a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', boxSizing: 'border-box', overflow: 'hidden' }}>
          {data.bgImage && <img src={data.bgImage} alt="bg" onError={handleImgError} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
          <div style={{ position: 'relative', width: '88%', maxWidth: '280px', maxHeight: '90%', background: data.frameColor || '#09090b', borderRadius: '26px', border: '2px solid rgba(255, 255, 255, 0.15)', padding: '12px', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px', boxSizing: 'border-box', overflow: 'hidden', margin: 'auto' }}>
            <div style={{ width: '40px', height: '3px', background: '#27272a', borderRadius: '2px', margin: '0 auto' }} />
            <img src={displayCover} alt="viewport artwork" onError={handleImgError} style={{ width: '100%', maxHeight: '55%', borderRadius: '12px', objectFit: 'cover' }} />
            <div>
              <h4 style={getTitleStyle('0.85rem')}>{displayTitle}</h4>
              <p style={getArtistStyle('0.7rem', '#a1a1aa')}>{displayArtist}</p>
            </div>
            <div>
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}><div style={{ width: `${progress}%`, height: '100%', background: '#ffffff' }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#a1a1aa', marginTop: '2px' }}><span>{currentTimeStr}</span><span>-{durationStr}</span></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '18px' }}>
              <SkipBack size={16} fill="#fff" style={{ cursor: 'pointer' }} />
              <button onClick={onTogglePlay} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                {isPlaying ? <Pause size={18} fill="#fff" /> : <Play size={18} fill="#fff" />}
              </button>
              <SkipForward size={16} fill="#fff" style={{ cursor: 'pointer' }} />
            </div>
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // TEMPLATE 14: iOS Dark Now Playing Lockscreen (6127691152321352191_121.jpg)
    // -------------------------------------------------------------
    case 't14_ios_lockscreen':
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#090a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', boxSizing: 'border-box', overflow: 'hidden' }}>
          {data.bgImage && <img src={data.bgImage} alt="bg" onError={handleImgError} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
          <div style={{ position: 'relative', width: '90%', maxWidth: '290px', maxHeight: '90%', background: 'rgba(24, 24, 27, 0.9)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px', boxSizing: 'border-box', overflow: 'hidden', margin: 'auto' }}>
            <img src={displayCover} alt="cover" onError={handleImgError} style={{ width: '100%', maxHeight: '55%', borderRadius: '14px', objectFit: 'cover' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h4 style={getTitleStyle('0.88rem')}>{displayTitle}</h4>
                <p style={getArtistStyle('0.7rem', '#a1a1aa')}>{displayArtist}</p>
              </div>
              <MoreHorizontal size={16} color="#71717a" style={{ flexShrink: 0 }} />
            </div>
            <div>
              <div style={{ height: '3px', background: '#27272a', borderRadius: '2px' }}><div style={{ width: `${progress}%`, height: '100%', background: '#a1a1aa', borderRadius: '2px' }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#71717a', marginTop: '2px' }}><span>{currentTimeStr}</span><span>-{durationStr}</span></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
              <SkipBack size={18} fill="#fff" style={{ cursor: 'pointer' }} />
              <button onClick={onTogglePlay} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                {isPlaying ? <Pause size={20} fill="#fff" /> : <Play size={20} fill="#fff" />}
              </button>
              <SkipForward size={18} fill="#fff" style={{ cursor: 'pointer' }} />
            </div>
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // TEMPLATE 15: iOS 16 Spotify Lockscreen Card (New Image 1)
    // -------------------------------------------------------------
    case 't15_ios_lockscreen_spotify':
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#2d1f18', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px', boxSizing: 'border-box', overflow: 'hidden' }}>
          {data.bgImage && <img src={data.bgImage} alt="bg" onError={handleImgError} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
          <div style={{ position: 'relative', textAlign: 'center', zIndex: 10, marginTop: '12px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: data.clockColor || '#fed7aa' }}>{data.lockDate || 'Fri, Feb 20'}</div>
            <div style={{ fontSize: '4.2rem', fontWeight: '800', color: data.clockColor || '#fed7aa', fontFamily: 'Outfit, sans-serif', lineHeight: '1' }}>{data.lockTime || '00:58'}</div>
          </div>
          <div style={{ position: 'relative', width: '92%', maxWidth: '340px', background: 'rgba(34, 28, 24, 0.88)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '14px', color: '#fff', display: 'flex', flexDirection: 'column', gap: '8px', margin: '0 auto 10px auto', boxSizing: 'border-box', zIndex: 10, boxShadow: '0 15px 35px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <img src={displayCover} alt="cover" onError={handleImgError} style={{ width: '52px', height: '52px', minWidth: '52px', borderRadius: '10px', objectFit: 'cover' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={getTitleStyle('0.92rem')}>{displayTitle}</h4>
                <p style={getArtistStyle('0.75rem', '#d1d5db')}>{displayArtist}</p>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#1db954', whiteSpace: 'nowrap' }}>{data.badgeText || 'Spotify'}</span>
            </div>
            <div>
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}><div style={{ width: `${progress}%`, height: '100%', background: '#ffffff' }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#d1d5db', marginTop: '3px' }}><span>{currentTimeStr}</span><span>{durationStr}</span></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Radio size={16} color="#d1d5db" />
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <SkipBack size={16} fill="#fff" style={{ cursor: 'pointer' }} />
                <button 
                  onClick={onTogglePlay} 
                  style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  {isPlaying ? <Pause size={16} fill="#000" /> : <Play size={16} fill="#000" style={{ marginLeft: '2px' }} />}
                </button>
                <SkipForward size={16} fill="#fff" style={{ cursor: 'pointer' }} />
              </div>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={12} color="#fff" /></div>
            </div>
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // TEMPLATE 16: iOS 17 Depth Clock Visualizer (New Image 2)
    // -------------------------------------------------------------
    case 't16_ios_depth_clock':
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#ea580c', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px', boxSizing: 'border-box', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '16px', left: 0, right: 0, textAlign: 'center', zIndex: 5 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: data.clockColor || '#ffedd5' }}>{data.lockDate || 'Wed 26 Aug'}</div>
            <div style={{ fontSize: '4.4rem', fontWeight: '800', color: data.clockColor || '#ffedd5', fontFamily: 'Outfit, sans-serif', lineHeight: '1' }}>{data.lockTime || '21:06'}</div>
          </div>
          {data.bgImage && <img src={data.bgImage} alt="bg" onError={handleImgError} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 8 }} />}
          <div style={{ position: 'relative', width: '92%', maxWidth: '340px', background: 'rgba(18, 18, 20, 0.85)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '14px', color: '#fff', display: 'flex', flexDirection: 'column', gap: '8px', margin: 'auto auto 12px auto', boxSizing: 'border-box', zIndex: 15, boxShadow: '0 15px 35px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <img src={displayCover} alt="cover" onError={handleImgError} style={{ width: '48px', height: '48px', minWidth: '48px', borderRadius: '8px', objectFit: 'cover', filter: 'grayscale(100%)' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={getTitleStyle('0.9rem')}>{displayTitle}</h4>
                <p style={getArtistStyle('0.72rem', '#94a3b8')}>{displayArtist}</p>
              </div>
            </div>
            <div>
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}><div style={{ width: `${progress}%`, height: '100%', background: '#ffffff' }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#94a3b8', marginTop: '2px' }}><span>{currentTimeStr}</span><span>-{durationStr}</span></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
              <SkipBack size={18} fill="#fff" style={{ cursor: 'pointer' }} />
              <button onClick={onTogglePlay} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                {isPlaying ? <Pause size={22} fill="#fff" /> : <Play size={22} fill="#fff" />}
              </button>
              <SkipForward size={18} fill="#fff" style={{ cursor: 'pointer' }} />
            </div>
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // TEMPLATE 17: iOS Cyan Weather & Music Lockscreen (New Image 3)
    // -------------------------------------------------------------
    case 't17_ios_weather_widget':
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#090a0f', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px', boxSizing: 'border-box', overflow: 'hidden' }}>
          {data.bgImage && <img src={data.bgImage} alt="bg" onError={handleImgError} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
          <div style={{ position: 'relative', zIndex: 10, marginTop: '8px', color: data.clockColor || '#38bdf8' }}>
            <div style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: '600' }}>{data.lockDate || 'terça-feira, 24 de setembro'}</div>
            <div style={{ textAlign: 'center', fontSize: '4.2rem', fontWeight: '800', fontFamily: 'Outfit, sans-serif', lineHeight: '1', marginTop: '2px' }}>{data.lockTime || '09:14'}</div>
            <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.68rem', fontWeight: '600', marginTop: '6px', color: data.clockColor || '#38bdf8', padding: '0 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Cloud size={12} /><span>{data.weatherText || '18° Nublado Mâx:23° Mín:15°'}</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><BatteryCharging size={12} /><span>{data.batteryText || '92% iPhone de Joyce'}</span></div>
            </div>
          </div>
          <div style={{ position: 'relative', width: '92%', maxWidth: '340px', background: 'rgba(24, 24, 28, 0.85)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '14px', color: '#fff', display: 'flex', flexDirection: 'column', gap: '8px', margin: '0 auto 10px auto', boxSizing: 'border-box', zIndex: 10, boxShadow: '0 15px 35px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <img src={displayCover} alt="cover" onError={handleImgError} style={{ width: '48px', height: '48px', minWidth: '48px', borderRadius: '8px', objectFit: 'cover' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={getTitleStyle('0.9rem')}>{displayTitle}</h4>
                <p style={getArtistStyle('0.72rem', '#94a3b8')}>{displayArtist}</p>
              </div>
            </div>
            <div>
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}><div style={{ width: `${progress}%`, height: '100%', background: '#ffffff' }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#94a3b8', marginTop: '2px' }}><span>{currentTimeStr}</span><span>-{durationStr}</span></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
              <SkipBack size={18} fill="#fff" style={{ cursor: 'pointer' }} />
              <button onClick={onTogglePlay} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                {isPlaying ? <Pause size={22} fill="#fff" /> : <Play size={22} fill="#fff" />}
              </button>
              <SkipForward size={18} fill="#fff" style={{ cursor: 'pointer' }} />
            </div>
          </div>
        </div>
      );

    // Default fallback
    default:
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: '#12141d' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: '700', fontSize: '1rem' }}>{displayTitle}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{displayArtist}</div>
          </div>
        </div>
      );
  }
}
