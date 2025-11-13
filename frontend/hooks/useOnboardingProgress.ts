'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { DisabilityType } from '../components/onboarding/DisabilityDisclosureModal';

export interface OnboardingStep {
  id: string;
  title: string;
  completed: boolean;
  data?: any;
}

export interface OnboardingProgress {
  currentStep: number;
  steps: OnboardingStep[];
  startedAt: number;
  lastUpdated: number;
  language: string;
  interactionMode: 'voice' | 'text';
  disabilities: DisabilityType[];
  cognitiveScore?: number;
  accessibilityToggles?: Record<string, boolean>;
  isComplete: boolean;
}

const STORAGE_KEY = '4all-onboarding-progress';
const EXPIRY_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days

const defaultSteps: OnboardingStep[] = [
  { id: 'language', title: 'Language Selection', completed: false },
  { id: 'interaction_mode', title: 'Interaction Mode', completed: false },
  { id: 'disability_disclosure', title: 'Accessibility Preferences', completed: false },
  { id: 'accessibility_toggles', title: 'Quick Setup', completed: false },
  { id: 'cognitive_quiz', title: 'Personalization Quiz', completed: false },
  { id: 'summary', title: 'Setup Complete', completed: false }
];

export function useOnboardingProgress() {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [hasExistingProgress, setHasExistingProgress] = useState(false);
  const isCompletingRef = useRef(false);

  // Load progress from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Check if progress has expired
        const isExpired = Date.now() - parsed.lastUpdated > EXPIRY_TIME;
        
        if (!isExpired && !parsed.isComplete) {
          setProgress(parsed);
          setHasExistingProgress(true);
        } else {
          // Remove expired or completed progress
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        console.error('Failed to parse onboarding progress:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (progress) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...progress,
        lastUpdated: Date.now()
      }));
    }
  }, [progress]);

  const startOnboarding = useCallback((language: string = 'en') => {
    const newProgress: OnboardingProgress = {
      currentStep: 0,
      steps: [...defaultSteps],
      startedAt: Date.now(),
      lastUpdated: Date.now(),
      language,
      interactionMode: 'voice',
      disabilities: [],
      isComplete: false
    };
    
    setProgress(newProgress);
    setHasExistingProgress(false);
  }, []);

  const updateStep = useCallback((stepId: string, data?: any, markCompleted: boolean = true) => {
    setProgress(prev => {
      if (!prev) return null;
      
      const stepIndex = prev.steps.findIndex(step => step.id === stepId);
      if (stepIndex === -1) return prev;
      
      const updatedSteps = [...prev.steps];
      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        completed: markCompleted,
        data
      };
      
      return {
        ...prev,
        steps: updatedSteps,
        lastUpdated: Date.now()
      };
    });
  }, []);

  const setCurrentStep = useCallback((stepIndex: number) => {
    setProgress(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        currentStep: Math.max(0, Math.min(stepIndex, prev.steps.length - 1)),
        lastUpdated: Date.now()
      };
    });
  }, []);

  const nextStep = useCallback(() => {
    setProgress(prev => {
      if (!prev) return null;
      
      const nextStepIndex = Math.min(prev.currentStep + 1, prev.steps.length - 1);
      
      return {
        ...prev,
        currentStep: nextStepIndex,
        lastUpdated: Date.now()
      };
    });
  }, []);

  const prevStep = useCallback(() => {
    setProgress(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        currentStep: Math.max(prev.currentStep - 1, 0),
        lastUpdated: Date.now()
      };
    });
  }, []);

  const updateLanguage = useCallback((language: string) => {
    setProgress(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        language,
        lastUpdated: Date.now()
      };
    });
  }, []);

  const updateInteractionMode = useCallback((mode: 'voice' | 'text') => {
    setProgress(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        interactionMode: mode,
        lastUpdated: Date.now()
      };
    });
  }, []);

  const updateDisabilities = useCallback((disabilities: DisabilityType[]) => {
    setProgress(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        disabilities,
        lastUpdated: Date.now()
      };
    });
  }, []);

  const updateCognitiveScore = useCallback((score: number) => {
    setProgress(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        cognitiveScore: score,
        lastUpdated: Date.now()
      };
    });
  }, []);

  const updateAccessibilityToggles = useCallback((toggles: Record<string, boolean>) => {
    setProgress(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        accessibilityToggles: toggles,
        lastUpdated: Date.now()
      };
    });
  }, []);

  const completeOnboarding = useCallback(async () => {
    if (!progress || progress.isComplete || isCompletingRef.current) {
      console.log('Skipping completion - already complete or in progress:', {
        hasProgress: !!progress,
        isComplete: progress?.isComplete,
        isCompleting: isCompletingRef.current
      });
      return null;
    }
    
    console.log('Starting onboarding completion...');
    isCompletingRef.current = true;
    
    // Generate final profile using Gemini AI
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'profile_generation',
          prompt: 'Generate optimal accessibility profile',
          context: {
            language: progress.language,
            interactionMode: progress.interactionMode,
            disabilities: progress.disabilities,
            cognitiveScore: progress.cognitiveScore,
            accessibilityToggles: progress.accessibilityToggles
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const aiResult = await response.json();
      
      // Handle both successful and fallback responses
      const profileData = aiResult.success ? aiResult.data : aiResult.fallback;
      
      const finalProfile = {
        profileId: `p_${Date.now()}`,
        language: progress.language,
        interactionMode: progress.interactionMode,
        disabilities: progress.disabilities,
        cognitiveScore: progress.cognitiveScore || 5,
        uiComplexity: progress.cognitiveScore && progress.cognitiveScore >= 7 
          ? 'detailed' as const
          : progress.cognitiveScore && progress.cognitiveScore <= 3
          ? 'simplified' as const
          : 'moderate' as const,
        accessibilityPreferences: generateAccessibilityPreferences(progress),
        confirmMode: determineConfirmMode(progress),
        isOnboardingComplete: true
      };

      // Mark onboarding as complete
      const completedProgress = {
        ...progress,
        isComplete: true,
        lastUpdated: Date.now()
      };
      
      setProgress(completedProgress);
      
      return finalProfile;
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      
      // Fallback profile generation
      const fallbackProfile = {
        profileId: `p_${Date.now()}`,
        language: progress.language,
        interactionMode: progress.interactionMode,
        disabilities: progress.disabilities,
        cognitiveScore: progress.cognitiveScore || 5,
        uiComplexity: 'moderate' as const,
        accessibilityPreferences: generateAccessibilityPreferences(progress),
        confirmMode: determineConfirmMode(progress),
        isOnboardingComplete: true
      };
      
      return fallbackProfile;
    } finally {
      isCompletingRef.current = false;
    }
  }, [progress]);

  const clearProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProgress(null);
    setHasExistingProgress(false);
  }, []);

  const resumeFromStep = useCallback((stepId: string) => {
    setProgress(prev => {
      if (!prev) return null;
      
      const stepIndex = prev.steps.findIndex(step => step.id === stepId);
      if (stepIndex === -1) return prev;
      
      return {
        ...prev,
        currentStep: stepIndex,
        lastUpdated: Date.now()
      };
    });
  }, []);

  // Helper functions
  const generateAccessibilityPreferences = (progress: OnboardingProgress) => {
    let fontSize = 16;
    let contrast = 'normal' as 'normal' | 'high';
    let largeTargets = false;
    
    // Adjust based on disabilities
    if (progress.disabilities.includes('visual')) {
      fontSize = Math.max(fontSize, 20);
      contrast = 'high';
      largeTargets = true;
    }
    
    if (progress.disabilities.includes('motor')) {
      largeTargets = true;
    }
    
    if (progress.cognitiveScore && progress.cognitiveScore <= 3) {
      fontSize = Math.max(fontSize, 18);
    }
    
    return {
      fontSize,
      contrast,
      ttsSpeed: 1.0,
      largeTargets,
      captions: progress.disabilities.includes('hearing'),
      font: 'inter' as 'inter' | 'atkinson'
    };
  };

  const determineConfirmMode = (progress: OnboardingProgress) => {
    if (progress.disabilities.includes('motor')) return 'voice';
    if (progress.disabilities.includes('hearing')) return 'pin';
    return 'pin';
  };

  return {
    progress,
    hasExistingProgress,
    startOnboarding,
    updateStep,
    setCurrentStep,
    nextStep,
    prevStep,
    updateLanguage,
    updateInteractionMode,
    updateDisabilities,
    updateCognitiveScore,
    updateAccessibilityToggles,
    completeOnboarding,
    clearProgress,
    resumeFromStep
  };
}