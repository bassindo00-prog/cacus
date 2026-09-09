import React, { useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Disc } from 'lucide-react';

export default function AudioPlayerController({ 
  currentSong, 
  isPlaying, 
  onTogglePlay, 
  progress, 
  onSeek,
  audioRef 
}) {
  const [duration, setDuration] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [volume, setVolume] = React.useState(0.8);
  const [isMuted, setIsMuted] = React.useState(false);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const cur = audioRef.current.currentTime;
      const dur = audioRef.current.duration || 1;
      setCurrentTime(cur);
      setDuration(dur);
      onSeek((cur / dur) * 100);
    }
  };

  const handleSliderChange = (e) => {
    const newPercent = parseFloat(e.target.value);
    onSeek(newPercent);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (newPercent / 100) * audioRef.current.duration;
    }
  };

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="audio-player-bar">
      {/* Hidden Audio Tag */}
      <audio 
        ref={audioRef}
        src={currentSong.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => onTogglePlay(false)}
      />

      {/* Left Track Info */}
      <div className="track-meta">
        <div style={{ position: 'relative' }}>
          <img 
            src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80" 
            alt="track" 
            className="track-thumb"
          />
          {isPlaying && (
            <Disc 
              size={18} 
              color="#38bdf8" 
              className="spin-slow" 
              style={{ position: 'absolute', inset: 0, margin: 'auto' }}
            />
          )}
        </div>
        <div>
          <div className="track-title">{currentSong.title}</div>
          <div className="track-artist">{currentSong.artist}</div>
        </div>
      </div>

      {/* Center Controls & Seekbar */}
      <div className="player-controls-center">
        <div className="control-buttons">
          <button 
            className="icon-btn" 
            onClick={() => {
              if (audioRef.current) audioRef.current.currentTime = 0;
            }}
          >
            <SkipBack size={18} color="#f8fafc" />
          </button>
          <button 
            className="play-pause-btn"
            onClick={() => onTogglePlay(!isPlaying)}
          >
            {isPlaying ? <Pause size={20} fill="#000" /> : <Play size={20} fill="#000" style={{ marginLeft: '2px' }} />}
          </button>
          <button 
            className="icon-btn"
            onClick={() => {
              if (audioRef.current) audioRef.current.currentTime = audioRef.current.duration - 1;
            }}
          >
            <SkipForward size={18} color="#f8fafc" />
          </button>
        </div>

        <div className="seek-bar-container">
          <span>{formatTime(currentTime)}</span>
          <input 
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={handleSliderChange}
            className="seek-slider"
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right Volume Control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '140px' }}>
        <button 
          className="icon-btn"
          onClick={() => {
            setIsMuted(!isMuted);
            if (audioRef.current) audioRef.current.muted = !isMuted;
          }}
        >
          {isMuted ? <VolumeX size={18} color="#ef4444" /> : <Volume2 size={18} color="#94a3b8" />}
        </button>
        <input 
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          style={{ width: '80px', accentColor: '#38bdf8', cursor: 'pointer' }}
        />
      </div>
    </div>
  );
}
