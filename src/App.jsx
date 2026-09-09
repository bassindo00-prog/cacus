import React, { useState, useRef, useEffect } from 'react';
import TemplateLibraryScreen from './components/TemplateLibraryScreen';
import CapCutEditorScreen from './components/CapCutEditorScreen';
import AudioPlayerController from './components/AudioPlayerController';
import ExportModal from './components/ExportModal';
import { TEMPLATES, DEMO_SONGS } from './types/templates';
import { initTelegramWebApp, triggerHaptic, getTelegramUser } from './utils/telegram';
import './App.css';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('library'); // 'library' | 'editor'
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [metadata, setMetadata] = useState(TEMPLATES[0].defaults);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(15);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [customAspectRatio, setCustomAspectRatio] = useState(null);

  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Initialize Telegram WebApp SDK on mount
  useEffect(() => {
    initTelegramWebApp();
    const tgUser = getTelegramUser();
    if (tgUser && tgUser.username) {
      setMetadata(prev => ({
        ...prev,
        username: tgUser.username,
        caption: `By @${tgUser.username}`
      }));
    }
  }, []);

  // When user selects a template from "Pilih Template" screen
  const handleSelectTemplate = (template) => {
    triggerHaptic('medium');
    setSelectedTemplate(template);
    setMetadata({ 
      ...template.defaults,
      songTitle: '',
      artist: ''
    });
    setCurrentSong(null);
    setCustomAspectRatio(template.aspectRatio || '9:16');
    setProgress(0);
    setIsPlaying(false);
    setCurrentScreen('editor');
  };

  const handleUpdateMetadata = (updatedFields) => {
    setMetadata(prev => ({ ...prev, ...updatedFields }));
  };

  // Synchronize HTML5 Audio Playback & Progress Loop
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('Audio play auto-block:', err);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong]);

  // Smooth Progress Animation Tick Loop (15 seconds loop or actual song duration)
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const updateLoop = () => {
      const audio = audioRef.current;
      if (audio && audio.duration && !isNaN(audio.duration)) {
        // Sync progress directly from audio element
        const p = (audio.currentTime / audio.duration) * 100;
        setProgress(p);
      } else {
        // Fallback smooth timer if audio duration is pending
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.2;
        });
      }
      animationFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animationFrameRef.current = requestAnimationFrame(updateLoop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying]);

  // Handle Seeking
  const handleSeek = (newProgressPercent) => {
    setProgress(newProgressPercent);
    const audio = audioRef.current;
    if (audio && audio.duration && !isNaN(audio.duration)) {
      audio.currentTime = (newProgressPercent / 100) * audio.duration;
    }
  };

  return (
    <div className="app-shell">
      {/* SCREEN A: PILIH TEMPLATE (CapCut Library Screen) */}
      {currentScreen === 'library' && (
        <TemplateLibraryScreen 
          onSelectTemplate={handleSelectTemplate}
        />
      )}

      {/* SCREEN B: CAPCUT EDITOR SCREEN (Timeline & Canvas) */}
      {currentScreen === 'editor' && (
        <CapCutEditorScreen 
          selectedTemplate={selectedTemplate}
          onBackToLibrary={() => {
            setIsPlaying(false);
            setCurrentScreen('library');
          }}
          onOpenExport={() => setIsExportOpen(true)}
          metadata={metadata}
          onUpdateMetadata={handleUpdateMetadata}
          currentSong={currentSong}
          onSelectSong={(song) => {
            setCurrentSong(song);
            setProgress(0);
            setIsPlaying(true);
          }}
          isPlaying={isPlaying}
          onTogglePlay={(state) => setIsPlaying(typeof state === 'boolean' ? state : !isPlaying)}
          progress={progress}
          onSeek={handleSeek}
          canvasRef={canvasRef}
          customAspectRatio={customAspectRatio}
          onAspectRatioChange={setCustomAspectRatio}
        />
      )}

      {/* Bottom Hidden Audio Engine */}
      <audio 
        ref={audioRef}
        src={currentSong?.url || ''}
        onEnded={() => setIsPlaying(false)}
      />

      {/* High-Res HD Export Modal */}
      <ExportModal 
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        canvasRef={canvasRef}
        selectedTemplate={selectedTemplate}
        metadata={metadata}
        customAspectRatio={customAspectRatio}
        templateName={selectedTemplate?.name || 'template'}
        audioRef={audioRef}
        isPlaying={isPlaying}
        onTogglePlay={setIsPlaying}
      />
    </div>
  );
}
