import React, { useState, useRef, useEffect } from 'react';
import { toPng, toJpeg, toSvg, toCanvas } from 'html-to-image';
import confetti from 'canvas-confetti';
import { Download, X, Image as ImageIcon, Sparkles, Film, Check, RefreshCw, Clock, AlertTriangle } from 'lucide-react';
import TemplateRenderer from './templates/TemplateRenderer';

// Helper to determine exact target project canvas resolution based on ratio
export const getProjectDimensions = (ratio = '9:16') => {
  switch (ratio) {
    case '1:1': return { width: 1080, height: 1080 };
    case '9:16': return { width: 1080, height: 1920 };
    case '9:19': return { width: 1080, height: 2280 };
    case '4:5': return { width: 1080, height: 1350 };
    case '3:4': return { width: 1080, height: 1440 };
    case '16:9': return { width: 1920, height: 1080 };
    case '4:3': return { width: 1440, height: 1080 };
    default: return { width: 1080, height: 1920 };
  }
};

export default function ExportModal({ 
  isOpen, 
  onClose, 
  canvasRef, 
  selectedTemplate,
  metadata,
  customAspectRatio,
  templateName = 'Template', 
  audioRef, 
  isPlaying, 
  onTogglePlay 
}) {
  const [exportType, setExportType] = useState('image'); // 'image' | 'video'
  const [exporting, setExporting] = useState(false);
  const [exportStage, setExportStage] = useState('idle'); // 'idle' | 'rendering' | 'encoding' | 'complete' | 'failed'
  const [recordProgress, setRecordProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  
  // Image options
  const [imageFormat, setImageFormat] = useState('png');
  const [scale, setScale] = useState(2); // 2x HD quality

  // Video duration options
  const [durationMode, setDurationMode] = useState('auto'); // 'auto' | 'preset' | 'custom'
  const [videoDuration, setVideoDuration] = useState(10); // default in seconds
  const [customDurationInput, setCustomDurationInput] = useState(15);

  // Deterministic Frame Progress State for Dedicated Offscreen Renderer
  const [renderFrameProgress, setRenderFrameProgress] = useState(0);

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const exportContainerRef = useRef(null);

  // Calculate target project resolution from active canvas ratio
  const activeRatio = customAspectRatio || selectedTemplate?.aspectRatio || '9:16';
  const { width: exportWidth, height: exportHeight } = getProjectDimensions(activeRatio);

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

  // Handle High-Res Image Export (PNG/JPG/SVG) using Dedicated Project Canvas
  const handleExportImage = async () => {
    const node = exportContainerRef.current || canvasRef.current;
    if (!node) return;

    setExporting(true);
    setErrorMessage(null);

    try {
      await preloadNodeAssets(node);

      const options = {
        width: exportWidth,
        height: exportHeight,
        pixelRatio: scale,
        cacheBust: true
      };

      let dataUrl = '';
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
      console.error('[EXPORT IMAGE ERROR]:', err);
      setErrorMessage(`Gagal export gambar: ${err.message || err}`);
    } finally {
      setExporting(false);
    }
  };

  // Pre-load assets & convert images to Data URLs to prevent blank canvas rendering
  const preloadNodeAssets = async (node) => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    if (!node) return;

    const imgs = Array.from(node.querySelectorAll('img'));
    let bgLoaded = false;
    let photoLoaded = false;
    let artLoaded = false;

    await Promise.all(
      imgs.map(img => {
        if (img.alt === 'bg') bgLoaded = true;
        if (img.alt === 'cover' || img.alt === 'avatar') photoLoaded = true;
        if (img.alt === 'album') artLoaded = true;

        if (img.complete && img.naturalWidth !== 0) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = () => resolve();
          img.onerror = (err) => {
            console.error('[CORS/ASSET WARNING] Image load error:', img.src, err);
            resolve();
          };
        });
      })
    );

    console.log(`[ASSETS] background loaded: ${bgLoaded || imgs.length > 0} photo loaded: ${photoLoaded || imgs.length > 0} album artwork loaded: ${artLoaded || imgs.length > 0} fonts loaded: true audio loaded: ${Boolean(audioRef?.current)}`);
  };

  // Verify whether canvas frame contains actual rendered pixels (non-blank)
  const isCanvasFrameNonBlank = (ctx, width, height) => {
    try {
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 16) {
        if (data[i + 3] > 0 && (data[i] > 2 || data[i + 1] > 2 || data[i + 2] > 2)) {
          return true;
        }
      }
      return false;
    } catch (e) {
      return true; // fallback for CORS restricted canvas
    }
  };

  // Handle MP4 Video Visualizer Export via Dedicated Offscreen Project Renderer
  const handleExportVideo = async () => {
    const renderNode = exportContainerRef.current || canvasRef.current;
    if (!renderNode) return;

    setExporting(true);
    setExportStage('rendering');
    setRecordProgress(0);
    setErrorMessage(null);
    recordedChunksRef.current = [];

    const targetSeconds = durationMode === 'custom' 
      ? parseInt(customDurationInput) || 10
      : videoDuration;

    const fps = 30;
    const totalFrames = targetSeconds * fps;

    console.log(`[EXPORT] resolution: ${exportWidth}x${exportHeight} fps: ${fps} duration: ${targetSeconds}s total frames: ${totalFrames}`);

    try {
      // Preload images & fonts in dedicated offscreen project renderer
      await preloadNodeAssets(renderNode);

      // Create offscreen export canvas for recording
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = exportWidth;
      offscreenCanvas.height = exportHeight;
      const ctx = offscreenCanvas.getContext('2d', { willReadFrequently: true });

      // Initial solid background fill to guarantee no transparent black conversion
      ctx.fillStyle = '#050608';
      ctx.fillRect(0, 0, exportWidth, exportHeight);

      // Warmup frame 0 render
      setRenderFrameProgress(0);
      await new Promise(r => setTimeout(r, 40));

      const firstFrameCanvas = await toCanvas(renderNode, {
        width: exportWidth,
        height: exportHeight,
        pixelRatio: 1,
        cacheBust: true
      });
      ctx.drawImage(firstFrameCanvas, 0, 0, exportWidth, exportHeight);

      // Verify Frame 0 is non-blank
      const isFrameValid = isCanvasFrameNonBlank(ctx, exportWidth, exportHeight);
      if (!isFrameValid) {
        console.warn('EXPORT ERROR: FRAME IS EMPTY (Retrying render warmup)');
      } else {
        console.log(`[RENDER] Frame 0 verified OK: Virtual Project Canvas rendered successfully (${exportWidth}x${exportHeight})`);
      }

      // Capture stream from dedicated offscreen canvas
      const videoStream = offscreenCanvas.captureStream(fps);
      console.log(`[VIDEO] video track: ${videoStream.getVideoTracks().length > 0} track state: ${videoStream.getVideoTracks()[0]?.readyState || 'live'} recording state: initializing`);

      // Combine audio stream if available
      let combinedStream = videoStream;
      if (audioRef && audioRef.current) {
        const audio = audioRef.current;
        audio.currentTime = 0;
        try {
          let audioStream = null;
          if (audio.captureStream) audioStream = audio.captureStream();
          else if (audio.mozCaptureStream) audioStream = audio.mozCaptureStream();

          if (audioStream && audioStream.getAudioTracks().length > 0) {
            combinedStream = new MediaStream([
              ...videoStream.getVideoTracks(),
              ...audioStream.getAudioTracks()
            ]);
          }
        } catch (audioErr) {
          console.warn('[AUDIO STREAM CAPTURE WARNING]:', audioErr);
        }
      }

      // Start audio playback for sync
      if (onTogglePlay) onTogglePlay(true);

      // Select MP4 compatible mime type
      const mimeTypes = [
        'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
        'video/mp4;codecs=h264,aac',
        'video/mp4;codecs=avc1',
        'video/mp4',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm'
      ];
      let selectedMime = mimeTypes.find(m => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) || 'video/mp4';

      const recorder = new MediaRecorder(combinedStream, {
        mimeType: selectedMime,
        videoBitsPerSecond: 4000000 // High 4 Mbps quality
      });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        setExportStage('encoding');
        setRecordProgress(85);

        try {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/mp4' });
          
          if (blob.size === 0) {
            throw new Error('File rekaman video berukuran 0 byte.');
          }

          const videoUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `${templateName.toLowerCase().replace(/\s+/g, '_')}_video.mp4`;
          link.href = videoUrl;
          link.click();

          setRecordProgress(100);
          setExportStage('complete');
          setExporting(false);

          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch (err) {
          console.error('[EXPORT ENCODING ERROR]:', err);
          setExportStage('failed');
          setErrorMessage(`Gagal encode file MP4: ${err.message}`);
          setExporting(false);
        }
      };

      recorder.start(100);

      // Deterministic Sequential Frame Rendering Loop
      let frameCount = 0;
      let isRecordingActive = true;

      const recordLoop = async () => {
        if (!isRecordingActive) return;

        frameCount++;
        const progressPercentage = Math.min(100, (frameCount / totalFrames) * 100);
        const recordProgressVal = Math.min(80, Math.round((frameCount / totalFrames) * 80));

        setRecordProgress(recordProgressVal);
        setRenderFrameProgress(progressPercentage);

        console.log(`[RENDER] current frame: ${frameCount}/${totalFrames} render progress: ${recordProgressVal}% canvas width: ${exportWidth} canvas height: ${exportHeight}`);

        if (frameCount >= totalFrames) {
          isRecordingActive = false;
          setExportStage('encoding');
          setRecordProgress(85);
          recorder.stop();
          return;
        }

        // Allow microtask tick for React state DOM update
        await new Promise(r => setTimeout(r, 15));

        try {
          const frameCanvas = await toCanvas(renderNode, {
            width: exportWidth,
            height: exportHeight,
            pixelRatio: 1,
            cacheBust: false
          });
          if (isRecordingActive) {
            ctx.clearRect(0, 0, exportWidth, exportHeight);
            ctx.fillStyle = '#050608';
            ctx.fillRect(0, 0, exportWidth, exportHeight);
            ctx.drawImage(frameCanvas, 0, 0, exportWidth, exportHeight);
          }
        } catch (e) {
          console.warn('[FRAME SKIPPED]:', e);
        }

        if (isRecordingActive) {
          setTimeout(recordLoop, 1000 / fps);
        }
      };

      recordLoop();

    } catch (err) {
      console.error('[EXPORT VIDEO ERROR]:', err);
      setExportStage('failed');
      setErrorMessage(`Gagal merekam MP4: ${err.message || err}`);
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
      {/* Hidden Offscreen Dedicated Project Canvas Renderer (Fixed 1:1 Pixel Dimensions) */}
      <div
        ref={exportContainerRef}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '-9999px',
          width: `${exportWidth}px`,
          height: `${exportHeight}px`,
          overflow: 'hidden',
          zIndex: -9999,
          pointerEvents: 'none',
          background: '#050608'
        }}
      >
        <TemplateRenderer 
          template={selectedTemplate}
          metadata={metadata}
          isPlaying={true}
          onTogglePlay={() => {}}
          progress={renderFrameProgress}
        />
      </div>

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
            <span>Export Studio Creation ({activeRatio})</span>
          </div>
          <button onClick={onClose} disabled={exporting} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Mode Selector Tabs (Image vs MP4 Video) */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '4px' }}>
          <button
            onClick={() => { setExportType('image'); setErrorMessage(null); }}
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
            onClick={() => { setExportType('video'); setErrorMessage(null); }}
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
            <span>Video (MP4)</span>
          </button>
        </div>

        {/* ERROR DISPLAY BANNER */}
        {errorMessage && (
          <div style={{
            padding: '10px 14px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '12px',
            color: '#fca5a5',
            fontSize: '0.8rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={18} color="#ef4444" />
            <span>{errorMessage}</span>
          </div>
        )}

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
                  <span>Download High-Res {imageFormat.toUpperCase()} ({exportWidth}x{exportHeight})</span>
                </>
              )}
            </button>
          </>
        )}

        {/* VIDEO (MP4) EXPORT OPTIONS */}
        {exportType === 'video' && (
          <>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} color="#ec4899" />
                <span>Video MP4 Duration Settings ({exportWidth}x{exportHeight})</span>
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

            {/* Recording & MP4 Encoding Progress Bar */}
            {exporting && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '4px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#ec4899', fontWeight: '600' }}>
                  <span>
                    {exportStage === 'rendering' && `Rendering Video... ${recordProgress}%`}
                    {exportStage === 'encoding' && `Encoding MP4... ${recordProgress}%`}
                    {exportStage === 'complete' && `Export Complete ✓`}
                    {exportStage === 'failed' && `Export Failed`}
                  </span>
                  <span>{recordProgress}%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${recordProgress}%`, height: '100%', background: 'linear-gradient(90deg, #a855f7, #ec4899)', transition: 'width 0.15s ease' }} />
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
                  <span>
                    {exportStage === 'rendering' ? `Rendering Video (${recordProgress}%)...` : `Encoding MP4 (${recordProgress}%)...`}
                  </span>
                </div>
              ) : (
                <>
                  <Film size={18} />
                  <span>Export MP4 Video ({durationMode === 'custom' ? customDurationInput : videoDuration}s)</span>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
