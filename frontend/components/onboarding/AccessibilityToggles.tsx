'use client';

import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { useVoice } from '../../hooks/useVoice';
import { useAdaptiveClasses } from '../../hooks/useAdaptiveUI';
import {
  Eye,
  Ear,
  Brain,
  Volume2,
  Contrast,
  ZoomIn,
  MousePointer,
  Vibrate
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { DisabilityType } from './DisabilityDisclosureModal';

interface AccessibilityToggle {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
  relatedDisability: DisabilityType[];
}

interface AccessibilityTogglesProps {
  isOpen: boolean;
  onComplete: (toggles: Record<string, boolean>) => void;
  disabilities: DisabilityType[];
  language: string;
}

const translations = {
  en: {
    title: 'Quick Setup',
    subtitle: 'We\'ve pre-selected some helpful features based on your preferences. You can adjust these anytime in Settings.',
    toggle_on: 'Enabled',
    toggle_off: 'Disabled',
    continue: 'Continue',
    skip: 'Skip for Now',
    all_set: 'All set! These features will help make your banking experience smoother.'
  },
  pcm: {
    title: 'Quick Setup',
    subtitle: 'We don choose some things wey go help you based on wetin you talk. You fit change am anytime for Settings.',
    toggle_on: 'On',
    toggle_off: 'Off',
    continue: 'Continue',
    skip: 'Skip for Now',
    all_set: 'Everything ready! These features go make your banking easy for you.'
  }
};

const allToggles: AccessibilityToggle[] = [
  {
    id: 'screen_reader_support',
    title: 'Screen Reader Support',
    description: 'Enhanced compatibility with screen readers and voice navigation',
    icon: Volume2,
    enabled: false,
    relatedDisability: ['visual']
  },
  {
    id: 'high_contrast',
    title: 'High Contrast Mode',
    description: 'Darker text and borders for better visibility',
    icon: Contrast,
    enabled: false,
    relatedDisability: ['visual']
  },
  {
    id: 'large_text',
    title: 'Larger Text',
    description: 'Increase text size throughout the app',
    icon: ZoomIn,
    enabled: false,
    relatedDisability: ['visual']
  },
  {
    id: 'captions',
    title: 'Voice Captions',
    description: 'Show text for all voice messages and sounds',
    icon: Ear,
    enabled: false,
    relatedDisability: ['hearing']
  },
  {
    id: 'vibration_alerts',
    title: 'Vibration Alerts',
    description: 'Use vibration for important notifications',
    icon: Vibrate,
    enabled: false,
    relatedDisability: ['hearing']
  },
  {
    id: 'visual_notifications',
    title: 'Visual Alerts',
    description: 'Flash the screen for audio notifications',
    icon: Eye,
    enabled: false,
    relatedDisability: ['hearing']
  },
  {
    id: 'large_touch_targets',
    title: 'Larger Touch Targets',
    description: 'Make buttons and links easier to tap',
    icon: MousePointer,
    enabled: false,
    relatedDisability: ['motor']
  },
  {
    id: 'voice_navigation',
    title: 'Voice Navigation',
    description: 'Navigate using voice commands',
    icon: Volume2,
    enabled: false,
    relatedDisability: ['motor']
  },
  {
    id: 'reduced_motion',
    title: 'Reduce Motion',
    description: 'Minimize animations and visual effects',
    icon: Brain,
    enabled: false,
    relatedDisability: ['cognitive']
  },
  {
    id: 'simplified_interface',
    title: 'Simplified Interface',
    description: 'Show fewer options and clearer layouts',
    icon: Brain,
    enabled: false,
    relatedDisability: ['cognitive']
  },
  {
    id: 'focus_indicators',
    title: 'Enhanced Focus',
    description: 'Clearer highlighting of selected items',
    icon: Eye,
    enabled: false,
    relatedDisability: ['cognitive']
  }
];

export function AccessibilityToggles({
  isOpen,
  onComplete,
  disabilities,
  language = 'en'
}: AccessibilityTogglesProps) {
  // Pre-select toggles based on disabilities
  const getInitialToggles = () => {
    const initial: Record<string, boolean> = {};

    allToggles.forEach(toggle => {
      // Enable if any of the user's disabilities match this toggle's related disabilities
      const shouldEnable = toggle.relatedDisability.some(disability =>
        disabilities.includes(disability)
      );
      initial[toggle.id] = shouldEnable;
    });

    return initial;
  };

  const toggleStates = getInitialToggles();
  const { speak } = useVoice();
  const adaptiveClasses = useAdaptiveClasses();
  const t = translations[language as keyof typeof translations] || translations.en;

  // Get relevant toggles based on user's disabilities
  const relevantToggles = allToggles.filter(toggle =>
    toggle.relatedDisability.some(disability => disabilities.includes(disability))
  );

  // Auto-announce when modal opens and then auto-continue
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const enabledToggles = relevantToggles.filter(toggle => toggleStates[toggle.id]);
        const enabledList = enabledToggles.map(toggle => toggle.title).join(', ');
        
        // const announcement = enabledToggles.length > 0 
        //   ? `Analysis complete! Based on your preferences, we've enabled these accessibility features: ${enabledList}. Your interface has been personalized for the best banking experience.`
        //   : `Analysis complete! Your interface has been personalized with standard accessibility settings for the best banking experience.`;

        //speak(announcement);
        
        // Auto-continue after announcement
        setTimeout(() => {
          onComplete(toggleStates);
        }, 3000);
      }, 500);
    }
  }, [isOpen, speak, relevantToggles, toggleStates, onComplete]);



  if (!isOpen) {
    return null;
  }

  return null;
}