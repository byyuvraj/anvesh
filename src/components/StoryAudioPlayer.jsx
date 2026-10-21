import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, Sparkles, FastForward, Radio } from 'lucide-react';

export default function StoryAudioPlayer({ title, summary, content }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [ambientActive, setAmbientActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ttsSupported, setTtsSupported] = useState(true);

  const utteranceRef = useRef(null);
  const audioCtxRef = useRef(null);
  const ambientGainRef = useRef(null);
  const progressTimerRef = useRef(null);
  const totalLengthRef = useRef(0);

  // Initialize TTS & Web Audio Context
  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setTtsSupported(false);
    }

    return () => {
      stopPlayback();
      stopAmbient();
    };
  }, []);

  // Web Audio Synthesizer for Ambient Soundscape
  const startAmbient = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      // Generate soft pink noise + gentle harmonic drone
      const ctx = audioCtxRef.current;
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.03; // Gentle breeze
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 450; // Warm muffled sound

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      ambientGainRef.current = gain;

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start();

      setAmbientActive(true);
    } catch (e) {
      console.warn("Ambient audio context not permitted yet", e);
    }
  };

  const stopAmbient = () => {
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
    setAmbientActive(false);
  };

  const toggleAmbient = () => {
    if (ambientActive) {
      stopAmbient();
    } else {
      startAmbient();
    }
  };

  // Extract clean text to speak
  const getNarrativeText = () => {
    const cleanContent = (content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (summary) {
      return `Story overview for ${title}. ${summary}. Full journal: ${cleanContent.substring(0, 1200)}`;
    }
    return `Story titled ${title}. ${cleanContent.substring(0, 1500)}`;
  };

  const startPlayback = () => {
    if (!window.speechSynthesis) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();

    const text = getNarrativeText();
    totalLengthRef.current = text.length;
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Pick best English voice
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (naturalVoice) utterance.voice = naturalVoice;

    let charCount = 0;
    utterance.onboundary = (e) => {
      if (e.name === 'word' || e.charIndex) {
        charCount = e.charIndex;
        const pct = Math.min(100, Math.round((charCount / totalLengthRef.current) * 100));
        setProgress(pct);
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      clearInterval(progressTimerRef.current);
    };

    utterance.onerror = (e) => {
      console.warn("TTS ended or interrupted", e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const pausePlayback = () => {
    if (window.speechSynthesis && isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const stopPlayback = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
  };

  const cycleSpeed = () => {
    const nextRate = rate === 1 ? 1.25 : rate === 1.25 ? 1.5 : 1;
    setRate(nextRate);
    if (isPlaying && utteranceRef.current) {
      // Re-trigger with new rate
      startPlayback();
    }
  };

  if (!ttsSupported) return null;

  return (
    <div className="w-full bg-stone-100/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800 rounded-3xl p-4 sm:p-5 mb-8 shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left: Indicator & Title */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
              isPlaying ? 'bg-[#c8ff00] text-stone-900 shadow-lg shadow-[#c8ff00]/30' : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
            }`}>
              <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
            </div>
            {isPlaying && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c8ff00] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#c8ff00]"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest uppercase text-[#8ab836] dark:text-[#c8ff00]">
                Audio Narrative
              </span>
              <span className="text-[10px] bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-2 py-0.5 rounded-full font-bold">
                Speech AI
              </span>
            </div>
            <h4 className="text-sm font-black text-stone-900 dark:text-white truncate max-w-xs sm:max-w-md">
              {isPlaying ? "Narrating story..." : isPaused ? "Paused" : "Listen to this story out loud"}
            </h4>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          
          {/* Ambient soundscape toggle */}
          <button 
            type="button"
            onClick={toggleAmbient}
            title={ambientActive ? "Turn off ambient mountain breeze" : "Play ambient travel soundscape"}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all border ${
              ambientActive 
                ? 'bg-[#c8ff00]/20 text-[#8ab836] dark:text-[#c8ff00] border-[#c8ff00]/50' 
                : 'bg-stone-200/50 dark:bg-stone-800/50 text-stone-600 dark:text-stone-400 border-stone-300 dark:border-stone-700 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Soundscape</span>
          </button>

          {/* Speed Toggle */}
          <button 
            type="button"
            onClick={cycleSpeed}
            className="px-2.5 py-1.5 rounded-full text-xs font-bold bg-stone-200/50 dark:bg-stone-800/50 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700 hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors"
          >
            {rate}x
          </button>

          {/* Main Play / Pause Button */}
          {isPlaying ? (
            <button 
              type="button"
              onClick={pausePlayback}
              className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 w-9 h-9 rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-md"
            >
              <Pause className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button 
              type="button"
              onClick={startPlayback}
              className="bg-[#c8ff00] hover:bg-[#b8f200] text-stone-900 w-9 h-9 rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-md"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </button>
          )}

          {(isPlaying || isPaused) && (
            <button 
              type="button"
              onClick={stopPlayback}
              className="p-2 text-stone-400 hover:text-red-500 transition-colors rounded-full"
              title="Stop"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {(isPlaying || isPaused || progress > 0) && (
        <div className="w-full bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full mt-3 overflow-hidden">
          <div 
            className="bg-[#c8ff00] h-full transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
