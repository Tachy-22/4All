'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useProfile, useLanguage, useInteractionMode } from './useProfile';

interface VoiceOptions {
  language?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionError extends Event {
  error: string;
  message?: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  addEventListener(type: 'result', listener: (event: SpeechRecognitionEvent) => void): void;
  addEventListener(type: 'error', listener: (event: SpeechRecognitionError) => void): void;
  addEventListener(type: 'start', listener: () => void): void;
  addEventListener(type: 'end', listener: () => void): void;
  removeEventListener(type: string, listener: any): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

export function useVoice() {
  const language = useLanguage();
  const interactionMode = useInteractionMode();
  const profile = useProfile();
  
  const recognition = useRef<ISpeechRecognition | null>(null);
  const synthesis = useRef<SpeechSynthesis | null>(null);
  
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Language mapping for speech recognition
  const getLanguageCode = useCallback((lang: string): string => {
    const langMap: Record<string, string> = {
      'en': 'en-US',
      'pcm': 'en-NG', // Pidgin uses Nigerian English
      'yo': 'yo-NG',
      'ig': 'ig-NG', 
      'ha': 'ha-NG'
    };
    return langMap[lang] || 'en-US';
  }, []);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for speech recognition support
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognition.current = new SpeechRecognition();
        recognition.current.continuous = true;
        recognition.current.interimResults = true;
        recognition.current.lang = getLanguageCode(language);
        setIsSupported(true);
      }

      // Check for speech synthesis support
      if ('speechSynthesis' in window) {
        synthesis.current = window.speechSynthesis;
      }
    }
  }, [language, getLanguageCode]);

  // Setup recognition event handlers
  useEffect(() => {
    if (!recognition.current) return;

    const handleResult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setTranscript(finalTranscript);
      setInterimTranscript(interimTranscript);
    };

    const handleError = (event: SpeechRecognitionError) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    const handleStart = () => {
      setIsListening(true);
      setError(null);
    };

    const handleEnd = () => {
      setIsListening(false);
    };

    recognition.current.addEventListener('result', handleResult);
    recognition.current.addEventListener('error', handleError);
    recognition.current.addEventListener('start', handleStart);
    recognition.current.addEventListener('end', handleEnd);

    return () => {
      if (recognition.current) {
        recognition.current.removeEventListener('result', handleResult);
        recognition.current.removeEventListener('error', handleError);
        recognition.current.removeEventListener('start', handleStart);
        recognition.current.removeEventListener('end', handleEnd);
      }
    };
  }, []);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognition.current || !isSupported) {
      setError('Speech recognition not supported');
      return;
    }

    if (interactionMode === 'text') {
      setError('Voice input disabled in text-only mode');
      return;
    }

    try {
      recognition.current.lang = getLanguageCode(language);
      recognition.current.start();
    } catch (err) {
      setError('Failed to start speech recognition');
    }
  }, [isSupported, interactionMode, language, getLanguageCode]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognition.current && isListening) {
      recognition.current.stop();
    }
  }, [isListening]);

  // Speak text
  const speak = useCallback((
    text: string, 
    options: VoiceOptions = {}
  ) => {
    if (!synthesis.current || interactionMode === 'text') {
      return;
    }

    // Cancel any ongoing speech
    synthesis.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply user preferences
    utterance.lang = getLanguageCode(options.language || language);
    utterance.rate = profile?.accessibilityPreferences.ttsSpeed || options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    // Find appropriate voice
    const voices = synthesis.current.getVoices();
    const voice = voices.find(v => v.lang.startsWith(utterance.lang.split('-')[0])) || voices[0];
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      setError('Speech synthesis error');
    };

    synthesis.current.speak(utterance);
  }, [synthesis, interactionMode, language, profile, getLanguageCode]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (synthesis.current) {
      synthesis.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    // State
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    isSupported,
    error,
    
    // Actions
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    clearTranscript,
  };
}