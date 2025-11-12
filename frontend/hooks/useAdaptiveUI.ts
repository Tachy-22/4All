'use client';

import { useMemo, useState, useEffect } from 'react';
import { useProfile, useAccessibilityPreferences, useUIComplexity, useDisabilities } from './useProfile';

interface AdaptiveUIConfig {
  layoutDensity: 'compact' | 'cozy' | 'simplified';
  fontSizeBase: number;
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
  };
  touchTarget: {
    min: number;
  };
  contrastMode: 'normal' | 'high';
  primaryInteraction: 'voice' | 'text' | 'gesture';
  confirmMode: 'pin' | 'voice' | 'biometric';
  cardSpacing: string;
  buttonSize: string;
  inputSize: string;
  navigationStyle: 'full' | 'simplified' | 'minimal';
  contentDensity: 'high' | 'medium' | 'low';
  animationEnabled: boolean;
  showHelp: boolean;
  voicePrompts: boolean;
}

export function useAdaptiveUI(): AdaptiveUIConfig {
  const profile = useProfile();
  const preferences = useAccessibilityPreferences();
  const complexity = useUIComplexity();
  const disabilities = useDisabilities();
  
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Handle prefers-reduced-motion media query
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handleChange);
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  return useMemo(() => {
    const isVisuallyImpaired = disabilities.includes('visual');
    const isMotorImpaired = disabilities.includes('motor');
    const isCognitiveSupport = disabilities.includes('cognitive');
    const isHearingImpaired = disabilities.includes('hearing');

    // Determine layout density based on cognitive load and complexity preference
    let layoutDensity: 'compact' | 'cozy' | 'simplified' = 'cozy';
    if (complexity === 'simplified' || isCognitiveSupport || isVisuallyImpaired) {
      layoutDensity = 'simplified';
    } else if (complexity === 'detailed' && !isMotorImpaired) {
      layoutDensity = 'compact';
    }

    // Font size adjustments
    let fontSizeBase = preferences.fontSize;
    if (isVisuallyImpaired || preferences.fontSize > 18) {
      fontSizeBase = Math.max(fontSizeBase, 20);
    }

    // Contrast mode
    const contrastMode = preferences.contrast === 'high' || isVisuallyImpaired ? 'high' : 'normal';

    // Primary interaction mode
    const primaryInteraction = profile?.interactionMode || 'voice';

    // Confirm mode based on abilities and preferences
    let confirmMode = profile?.confirmMode || 'pin';
    if (isVisuallyImpaired && primaryInteraction === 'voice') {
      confirmMode = 'voice';
    }

    // Spacing and sizing adjustments
    const cardSpacing = layoutDensity === 'simplified' ? 'p-6' : 
                       layoutDensity === 'cozy' ? 'p-4' : 'p-3';
    
    const buttonSize = isMotorImpaired || preferences.largeTargets ? 'h-12 px-6' : 
                      layoutDensity === 'simplified' ? 'h-11 px-4' : 'h-9 px-3';
    
    const inputSize = isMotorImpaired || preferences.largeTargets ? 'h-12' : 
                     layoutDensity === 'simplified' ? 'h-11' : 'h-9';

    // Navigation complexity
    const navigationStyle = complexity === 'simplified' || isCognitiveSupport ? 'simplified' :
                           complexity === 'detailed' ? 'full' : 'minimal';

    // Content density
    const contentDensity = layoutDensity === 'simplified' ? 'low' :
                          layoutDensity === 'compact' ? 'high' : 'medium';

    // Animation preferences
    const animationEnabled = !isCognitiveSupport && !prefersReducedMotion;

    // Help and guidance
    const showHelp = isCognitiveSupport || complexity === 'simplified' || !profile?.isOnboardingComplete;
    
    // Voice prompts
    const voicePrompts = primaryInteraction === 'voice' && !isHearingImpaired;

    // Font size scale
    const fontSize = {
      xs: `${Math.round(fontSizeBase * 0.75)}px`,
      sm: `${Math.round(fontSizeBase * 0.875)}px`,
      base: `${fontSizeBase}px`,
      lg: `${Math.round(fontSizeBase * 1.125)}px`,
      xl: `${Math.round(fontSizeBase * 1.25)}px`,
    };

    // Touch target sizes
    const touchTarget = {
      min: isMotorImpaired || preferences.largeTargets ? 48 : 44,
    };

    return {
      layoutDensity,
      fontSizeBase,
      fontSize,
      touchTarget,
      contrastMode,
      primaryInteraction,
      confirmMode,
      cardSpacing,
      buttonSize,
      inputSize,
      navigationStyle,
      contentDensity,
      animationEnabled,
      showHelp,
      voicePrompts,
    };
  }, [profile, preferences, complexity, disabilities, prefersReducedMotion]);
}

// CSS class generators based on adaptive UI
export function useAdaptiveClasses() {
  const config = useAdaptiveUI();

  return useMemo(() => {
    const baseClasses = {
      card: `rounded-2xl ${config.cardSpacing} ${config.contrastMode === 'high' ? 'border-2' : 'border'}`,
      button: `${config.buttonSize} rounded-2xl font-medium transition-all duration-${config.animationEnabled ? '150' : '0'}`,
      input: `${config.inputSize} rounded-lg border px-3 focus:outline-none focus:ring-3 focus:ring-highlight-blue`,
      text: `text-[${config.fontSizeBase}px] leading-accessibility`,
      heading: `text-[${Math.round(config.fontSizeBase * 1.5)}px] font-semibold leading-accessibility`,
      container: config.contentDensity === 'low' ? 'space-y-6' : 
                config.contentDensity === 'high' ? 'space-y-2' : 'space-y-4',
    };

    // High contrast adjustments
    if (config.contrastMode === 'high') {
      baseClasses.button += ' border-2 border-primary-red';
      baseClasses.input += ' border-2';
    }

    // Large target adjustments
    if (config.layoutDensity === 'simplified') {
      baseClasses.button += ' min-w-[88px] min-h-[88px]';
    }

    return baseClasses;
  }, [config]);
}

// Utility function to get adaptive styling
export function getAdaptiveStyle(
  element: 'card' | 'button' | 'input' | 'text' | 'heading' | 'container'
) {
  const { useAdaptiveClasses: getClasses } = require('./useAdaptiveUI');
  const classes = getClasses();
  return classes[element] || '';
}