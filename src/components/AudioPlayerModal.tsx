import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, X, Sparkles } from 'lucide-react';
import { useDocumentContext } from '../context/DocumentContext';
import { getLanguage } from '../data/languages';

interface AudioPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  verdict: string;
  takeaways: string[];
}

export const AudioPlayerModal: React.FC<AudioPlayerModalProps> = ({
  isOpen,
  onClose,
  title,
  verdict,
  takeaways,
}) => {
  const { selectedLanguage } = useDocumentContext();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState('');
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fullSummaryText = `${title}. Verdict: ${verdict}. Key takeaways include: ${takeaways.join('. ')}`;

  useEffect(() => {
    if (isOpen) {
      startSpeech();
    } else {
      stopSpeech();
    }
    return () => {
      stopSpeech();
    };
  }, [isOpen]);

  const startSpeech = async () => {
    stopSpeech();
    setIsLoadingAudio(true);
    setAudioError('');

    try {
      // First attempt Gemini TTS API
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullSummaryText, outputLanguage: getLanguage(selectedLanguage) }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.audioBase64) {
          // Play audio from base64
          const snd = new Audio(`data:${json.mimeType || 'audio/wav'};base64,${json.audioBase64}`);
          audioRef.current = snd;
          snd.onended = () => setIsPlaying(false);
          await snd.play();
          setIsPlaying(true);
          setIsLoadingAudio(false);
          return;
        }
      }
    } catch {
      audioRef.current = null;
      console.warn('Gemini TTS endpoint unavailable, falling back to Web Speech API');
    }

    // Fallback to Web Speech API
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(fullSummaryText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => {
        setIsPlaying(false);
        setIsLoadingAudio(false);
      };

      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
      setIsLoadingAudio(false);
    } else {
      setIsLoadingAudio(false);
      setAudioError('Text-to-speech is not supported on this device browser.');
    }
  };

  const stopSpeech = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else void audioRef.current.play();
      setIsPlaying((playing) => !playing);
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.pause();
        setIsPlaying(false);
      } else {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
          setIsPlaying(true);
        } else {
          startSpeech();
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="audio-dialog-title" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 id="audio-dialog-title" className="font-bold text-slate-900 dark:text-white text-base">
              Audio Walkthrough
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close audio walkthrough"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate mb-4">
          {title}
        </p>

        {/* Audio Visualizer Graphic */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5 mb-5 flex items-center justify-between border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayPause}
              disabled={isLoadingAudio}
              className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
            </button>
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {isLoadingAudio ? 'Generating Voice...' : isPlaying ? 'Playing Walkthrough' : 'Paused'}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                AI Voice Summary
              </p>
            </div>
          </div>

          {/* Equalizer waves */}
          <div className="flex items-center gap-1 h-6">
            <div className={`w-1 bg-blue-600 rounded-full transition-all duration-300 ${isPlaying ? 'h-6 animate-bounce' : 'h-2'}`} />
            <div className={`w-1 bg-blue-500 rounded-full transition-all duration-300 delay-75 ${isPlaying ? 'h-4 animate-bounce' : 'h-2'}`} />
            <div className={`w-1 bg-blue-600 rounded-full transition-all duration-300 delay-150 ${isPlaying ? 'h-5 animate-bounce' : 'h-2'}`} />
            <div className={`w-1 bg-blue-400 rounded-full transition-all duration-300 delay-200 ${isPlaying ? 'h-3 animate-bounce' : 'h-2'}`} />
          </div>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-300 bg-blue-50/50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-100 dark:border-blue-900/50 leading-relaxed mb-4">
          "{verdict}"
        </div>

        {audioError && <p className="text-xs text-red-500 mb-3">{audioError}</p>}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-200 transition-colors"
        >
          Close Audio Walkthrough
        </button>
      </div>
    </div>
  );
};
