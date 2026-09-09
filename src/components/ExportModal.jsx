import React, { useState, useRef, useEffect } from 'react';
import { toPng, toJpeg, toSvg, toCanvas } from 'html-to-image';
import confetti from 'canvas-confetti';
import { Download, X, Image as ImageIcon, Sparkles, Film, Play, Check, RefreshCw, Clock } from 'lucide-react';

export default function ExportModal({ isOpen, onClose, canvasRef, templateName, audioRef, isPlaying, onTogglePlay }) {
  const [exportType, setExportType] = useState('image'); // 'image' | 'video'
  const [exporting, setExporting] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  
  // Image options
  const [imageFormat, setImageFormat] = useState('png');
  const [scale, setScale] = useState(2); // 2x HD quality

  // Video duration options
  const [durationMode, setDurationMode] = useState('auto'); // 'auto' | 'preset' | 'custom'
  const [videoDuration, setVideoDuration] = useState(10); // default in seconds
  const [customDurationInput, setCustomDurationInput] = useState(15);

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Auto detect actual audio duration when modal opens or audio loads
  const getAudioDuration = () => {
    if (audioRef && audioRef.current && !isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
      return Math.round(audioRef.current.duration);
    }
    return 30; // 30s default fallback
  };

  const actualAudioDuration = getAudioDuration();

  useEffect(() => {
    if (durationMode === 'auto') {
      setVideoDuration(actualAudioDuration);
    }
  }, [durationMode, actualAudioDuration, isOpen]);

  if (!isOpen) return null;

  // Handle HD Image Export
  const handleExportImage = async () => {
    if (!canvasRef.current) return;
    setExporting(true);

    try {
      const node = canvasRef.current;
      let dataUrl = '';

      const options = {
        pixelRatio: scale,
        cacheBust: true
      };

      if (imageFormat === 'png') {
        dataUrl = await toPng(node, options);
      } else if (imageFormat === 'jpeg') {
        dataUrl = await toJpeg(node, { ...options, quality: 0.95 });
      } else if (imageFormat === 'svg') {
        dataUrl = await toSvg(node, options);
      }

      const link = document.createElement('a');
      link.download = `${templateName.toLowerCase().replace(/\s+/g, '_')}_design.${imageFormat}`;
      link.href = dataUrl;
      link.click();

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Image export error:', err);
    } finally {
      setExporting(false);
    }
  };

  // Handle Animated Video Visualizer Export
  const handleExportVideo = async () => {
    if (!canvasRef.current) return;
    setExporting(true);
    setRecordProgress(0);
    recordedChunksRef.current = [];

    // Final duration to record
    const targetSeconds = durationMode === 'custom' 
      ? parseInt(customDurationInput) || 10
      : videoDuration;

    try {
      const node = canvasRef.current;
      const rect = node.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);

      // Create offscreen recording canvas with 1.5x resolution for speed & HD quality
      const scaleFactor = 1.5;
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = Math.round(width * scaleFactor);
      offscreenCanvas.height = Math.round(height * scaleFactor);
      const ctx = offscreenCanvas.getContext('2d');

      // Warm up fonts & images once so frames are NEVER blank
      try {
        const warmup = await toCanvas(node, { pixelRatio: scaleFactor, cacheBust: true });
        ctx.drawImage(warmup, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
      } catch (e) {
        console.warn('Warmup frame warning:', e);
      }

      // Capture canvas stream at 24 FPS (cinematic & fast)
      const videoStream = offscreenCanvas.captureStream(24);

      // Audio stream capture
      let combinedStream = videoStream;
      try {
        if (audioRef && audioRef.current) {
          const audio = audioRef.current;
          audio.currentTime = 0;
          if (audio.captureStream) {
            const audioStream = audio.captureStream();
            combinedStream = new MediaStream([
              ...videoStream.getVideoTracks(),
              ...audioStream.getAudioTracks()
            ]);
          } else if (audio.mozCaptureStream) {
            const audioStream = audio.mozCaptureStream();
            combinedStream = new MediaStream([
              ...videoStream.getVideoTracks(),
              ...audioStream.getAudioTracks()
            ]);
          }
        }
      } catch (audioErr) {
        console.warn('Audio stream capture fallback:', audioErr);
      }

      // Start audio playback
      if (onTogglePlay) onTogglePlay(true);

      // Determine iOS / Android / Desktop compatible video MIME type
      const mimeTypes = [
        'video/mp4;codecs=h264,aac',
        'video/mp4',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm'
      ];
      let selectedMime = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || 'video/webm';
      const fileExt = selectedMime.includes('mp4') ? 'mp4' : 'webm';

      const recorder = new MediaRecorder(combinedStream, { 
        mimeType: selectedMime,
        videoBitsPerSecond: 2500000 // 2.5 Mbps crisp video quality
      });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: selectedMime });
        const videoUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.download = `${templateName.toLowerCase().replace(/\s+/g, '_')}_video.${fileExt}`;
        link.href = videoUrl;
        link.click();

        setExporting(false);
        setRecordProgress(100);

        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      };

      recorder.start(100);

      // Sequential Frame Rendering Loop (Guarantees fast, non-blank frames)
      const startTime = Date.now();
      const totalDurationMs = targetSeconds * 1000;
      let isRecordingActive = true;

      const recordLoop = async () => {
        if (!isRecordingActive) return;

        const elapsed = Date.now() - startTime;
        const currentProgress = Math.min(99, Math.round((elapsed / totalDurationMs) * 100));
        setRecordProgress(currentProgress);

        if (elapsed >= totalDurationMs) {
          isRecordingActive = false;
          setRecordProgress(100);
          recorder.stop();
          return;
        }

        try {
          // Render frame synchronously & draw to offscreen canvas
          const frameCanvas = await toCanvas(node, { pixelRatio: scaleFactor, cacheBust: false });
          if (isRecordingActive) {
            ctx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
            ctx.drawImage(frameCanvas, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
          }
        } catch (e) {
          console.warn('Frame render skipped:', e);
        }

        // Schedule next frame immediately after current frame finishes
        if (isRecordingActive) {
          setTimeout(recordLoop, 1000 / 24); // 24 FPS target
        }
      };

      recordLoop();

    } catch (err) {
      console.error('Video export error:', err);
      setExporting(false);
    }
  };

  const formatSecs = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justify: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: '#12151e',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '24px',
        padding: '24px',
        color: '#fff',
        boxShadow: '0 25px 50px rgba(0,0,0,0.8)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: '800' }}>
            <Sparkles size={20} color="#38bdf8" />
            <span>Export Template Creation</span>
          </div>
          <button onClick={onClose} disabled={exporting} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Mode Selector Tabs (Image vs Video) */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '4px' }}>
          <button
            onClick={() => setExportType('image')}
            disabled={exporting}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: '10px',
              border: 'none',
              background: exportType === 'image' ? 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)' : 'transparent',
              color: '#fff',
              fontSize: '0.88rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <ImageIcon size={16} />
            <span>Image (PNG/JPG)</span>
          </button>
          <button
            onClick={() => setExportType('video')}
            disabled={exporting}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: '10px',
              border: 'none',
              background: exportType === 'video' ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' : 'transparent',
              color: '#fff',
              fontSize: '0.88rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Film size={16} />
            <span>Video (MP4/WebM)</span>
          </button>
        </div>

        {/* IMAGE EXPORT OPTIONS */}
        {exportType === 'image' && (
          <>
            <div className="form-group">
              <label className="form-label">Image File Format</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['png', 'jpeg', 'svg'].map(f => (
                  <button
                    key={f}
                    onClick={() => setImageFormat(f)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '12px',
                      border: imageFormat === f ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                      background: imageFormat === f ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.04)',
                      color: imageFormat === f ? '#38bdf8' : '#94a3b8',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      cursor: 'pointer'
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Image Resolution</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { label: 'Standard (1x)', val: 1 },
                  { label: 'HD Quality (2x)', val: 2 },
                  { label: 'Ultra 4K (3x)', val: 3 }
                ].map(s => (
                  <button
                    key={s.val}
                    onClick={() => setScale(s.val)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '10px',
                      border: scale === s.val ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.1)',
                      background: scale === s.val ? 'rgba(168,85,247,0.15)' : 'transparent',
                      color: scale === s.val ? '#a855f7' : '#94a3b8',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <button 
              className="btn-primary" 
              onClick={handleExportImage}
              disabled={exporting}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '0.95rem' }}
            >
              {exporting ? (
                <span>Rendering High-Res Image...</span>
              ) : (
                <>
                  <Download size={18} />
                  <span>Download High-Res {imageFormat.toUpperCase()}</span>
                </>
              )}
            </button>
          </>
        )}

        {/* VIDEO EXPORT OPTIONS */}
        {exportType === 'video' && (
          <>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} color="#ec4899" />
                <span>Video Duration Settings</span>
              </label>

              {/* Automatic Song Duration Button */}
              <button
                onClick={() => {
                  setDurationMode('auto');
                  setVideoDuration(actualAudioDuration);
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: durationMode === 'auto' ? '2px solid #ec4899' : '1px solid rgba(255,255,255,0.1)',
                  background: durationMode === 'auto' ? 'rgba(236,72,153,0.2)' : 'rgba(255,255,255,0.04)',
                  color: durationMode === 'auto' ? '#fff' : '#cbd5e1',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <span>🎵 Auto Full Song Duration ({formatSecs(actualAudioDuration)})</span>
                {durationMode === 'auto' && <Check size={16} color="#ec4899" />}
              </button>

              {/* Quick Presets */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                {[5, 10, 15, 30].map(secs => (
                  <button
                    key={secs}
                    onClick={() => {
                      setDurationMode('preset');
                      setVideoDuration(secs);
                    }}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '10px',
                      border: durationMode === 'preset' && videoDuration === secs ? '1.5px solid #a855f7' : '1px solid rgba(255,255,255,0.1)',
                      background: durationMode === 'preset' && videoDuration === secs ? 'rgba(168,85,247,0.25)' : 'transparent',
                      color: durationMode === 'preset' && videoDuration === secs ? '#a855f7' : '#94a3b8',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {secs}s
                  </button>
                ))}
                <button
                  onClick={() => setDurationMode('custom')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '10px',
                    border: durationMode === 'custom' ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                    background: durationMode === 'custom' ? 'rgba(56,189,248,0.2)' : 'transparent',
                    color: durationMode === 'custom' ? '#38bdf8' : '#94a3b8',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Custom
                </button>
              </div>

              {/* Custom Seconds Input */}
              {durationMode === 'custom' && (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Duration in Seconds:</span>
                  <input 
                    type="number"
                    className="form-input"
                    value={customDurationInput}
                    onChange={(e) => setCustomDurationInput(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max="600"
                    style={{ width: '90px' }}
                  />
                  <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>secs</span>
                </div>
              )}
            </div>

            {/* Recording Progress Bar */}
            {exporting && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '4px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#ec4899', fontWeight: '600' }}>
                  <span>Recording Video Visualizer Animation & Music...</span>
                  <span>{recordProgress}%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${recordProgress}%`, height: '100%', background: 'linear-gradient(90deg, #a855f7, #ec4899)', transition: 'width 0.1s linear' }} />
                </div>
              </div>
            )}

            <button 
              className="btn-primary" 
              onClick={handleExportVideo}
              disabled={exporting}
              style={{
                width: '100%',
                justify: 'center',
                padding: '14px',
                fontSize: '0.95rem',
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                boxShadow: '0 4px 15px rgba(236,72,153,0.4)'
              }}
            >
              {exporting ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RefreshCw size={18} className="spin-slow" />
                  <span>Recording Animated Video ({recordProgress}%)...</span>
                </div>
              ) : (
                <>
                  <Film size={18} />
                  <span>Record Video ({durationMode === 'custom' ? customDurationInput : videoDuration}s)</span>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
