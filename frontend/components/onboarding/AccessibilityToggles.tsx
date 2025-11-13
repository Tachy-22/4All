'use client';

import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { useVoice } from '../../hooks/useVoice';
import { useAdaptiveClasses } from '../../hooks/useAdaptiveUI';
import { 
  Eye, 
  Ear, 
  Hand, 
  Brain,
  Volume2,
  VolumeX,
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
  onClose: () => void;
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
  onClose, 
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

  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>(getInitialToggles);
  const { speak, transcript, startListening, clearTranscript } = useVoice();
  const adaptiveClasses = useAdaptiveClasses();
  const t = translations[language as keyof typeof translations] || translations.en;

  // Get relevant toggles based on user's disabilities
  const relevantToggles = allToggles.filter(toggle =>
    toggle.relatedDisability.some(disability => disabilities.includes(disability))
  );

  // Auto-announce when modal opens
  useEffect(() => {
    if (isOpen && relevantToggles.length > 0) {
      setTimeout(() => {
        const togglesList = relevantToggles.map(toggle => {
          const status = toggleStates[toggle.id] ? 'enabled' : 'disabled';
          return `${toggle.title}: ${status}. ${toggle.description}`;
        }).join('. ');
        
        speak(`${t.title}. ${t.subtitle} Here are your accessibility settings: ${togglesList}. You can say the name of any setting to toggle it, or say Continue to proceed, or Skip to use defaults.`);
        setTimeout(() => {
          startListening();
        }, 2000);
      }, 1000);
    }
  }, [isOpen, speak, startListening, t.title, t.subtitle, relevantToggles, toggleStates]);

  // Define functions before the voice command useEffect
  const handleToggle = (toggleId: string) => {
    const newState = !toggleStates[toggleId];
    setToggleStates(prev => ({ ...prev, [toggleId]: newState }));
    
    const toggle = allToggles.find(t => t.id === toggleId);
    if (toggle) {
      const status = newState ? t.toggle_on : t.toggle_off;
      speak(`${toggle.title} ${status}`);
    }
  };

  const handleContinue = () => {
    speak(t.all_set);
    onComplete(toggleStates);
  };

  const handleSkip = () => {
    // Disable all toggles when skipping
    const skippedToggles: Record<string, boolean> = {};
    allToggles.forEach(toggle => {
      skippedToggles[toggle.id] = false;
    });
    
    speak('Settings skipped. You can change these later in Settings.');
    onComplete(skippedToggles);
  };

  // Voice command handling - moved before conditional return
  useEffect(() => {
    if (!transcript || !isOpen) return;

    const command = transcript.toLowerCase().trim();
    console.log('Accessibility toggles voice command:', command);

    // Navigation commands
    if (command.includes('continue') || command.includes('next') || command.includes('proceed')) {
      handleContinue();
      clearTranscript();
      return;
    }

    if (command.includes('skip') || command.includes('skip for now') || command.includes('use defaults')) {
      handleSkip();
      clearTranscript();
      return;
    }

    // Toggle commands - check each toggle's title for matches
    relevantToggles.forEach(toggle => {
      const titleWords = toggle.title.toLowerCase().split(' ');
      const hasMatch = titleWords.some(word => command.includes(word)) || 
                     command.includes(toggle.title.toLowerCase());

      if (hasMatch) {
        handleToggle(toggle.id);
        clearTranscript();
        return;
      }
    });

    // If no matches found, provide help
    if (transcript.length > 3) { // Avoid triggering on very short inputs
      speak('I didn\'t understand. Try saying the name of a setting to toggle it, or say Continue or Skip.');
      clearTranscript();
    }
  }, [transcript, isOpen, relevantToggles, speak, clearTranscript, handleToggle, handleContinue, handleSkip]);

  if (!isOpen || relevantToggles.length === 0) {
    // If no relevant toggles, skip this step
    if (isOpen) {
      onComplete(toggleStates);
    }
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className={cn(adaptiveClasses.heading, "text-2xl font-semibold text-text")}>
              {t.title}
            </h2>
            <p className={cn(adaptiveClasses.text, "text-muted-gray leading-relaxed")}>
              {t.subtitle}
            </p>
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            {relevantToggles.map((toggle) => {
              const Icon = toggle.icon;
              const isEnabled = toggleStates[toggle.id];
              
              return (
                <div
                  key={toggle.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="shrink-0 mt-1">
                    <Icon className={cn(
                      "h-6 w-6",
                      isEnabled ? "text-primary" : "text-gray-400"
                    )} />
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={cn(adaptiveClasses.text, "font-medium text-text")}>
                          {toggle.title}
                        </h3>
                        <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
                          {toggle.description}
                        </p>
                      </div>
                      
                      <div className="shrink-0 ml-4">
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={() => handleToggle(toggle.id)}
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        adaptiveClasses.text,
                        "text-xs",
                        isEnabled ? "text-primary font-medium" : "text-gray-500"
                      )}>
                        {isEnabled ? t.toggle_on : t.toggle_off}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleSkip}
              className={adaptiveClasses.button}
            >
              {t.skip}
            </Button>
            
            <Button
              onClick={handleContinue}
              className={cn(adaptiveClasses.button, "flex-1")}
            >
              {t.continue}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}