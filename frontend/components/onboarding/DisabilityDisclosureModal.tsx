'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { useVoice } from '../../hooks/useVoice';
import { useAdaptiveClasses } from '../../hooks/useAdaptiveUI';
import { useProfileStore } from '../../hooks/useProfile';
import { Check, Eye, Ear, Hand, Brain, MessageSquare, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import Image from 'next/image';

export type DisabilityType = 'visual' | 'hearing' | 'motor' | 'cognitive' | 'speech';

interface DisabilityOption {
  id: DisabilityType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  examples: string[];
}

interface DisabilityDisclosureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (disabilities: DisabilityType[], skipAssistance: boolean) => void;
  language: string;
}

const disabilityOptions: DisabilityOption[] = [
  {
    id: 'visual',
    label: 'Vision',
    description: 'Difficulty seeing or reading text',
    icon: Eye,
    examples: ['Blindness', 'Low vision', 'Color blindness', 'Need larger text']
  },
  {
    id: 'hearing',
    label: 'Hearing',
    description: 'Difficulty hearing sounds or speech',
    icon: Ear,
    examples: ['Deafness', 'Hard of hearing', 'Need captions', 'Prefer visual alerts']
  },
  {
    id: 'motor',
    label: 'Movement',
    description: 'Difficulty with precise movements or touch',
    icon: Hand,
    examples: ['Limited mobility', 'Tremors', 'Need larger buttons', 'Voice preferred']
  },
  {
    id: 'cognitive',
    label: 'Focus',
    description: 'Difficulty with concentration or memory',
    icon: Brain,
    examples: ['ADHD', 'Memory issues', 'Need simplified screens', 'Prefer step-by-step']
  },
  {
    id: 'speech',
    label: 'Speech',
    description: 'Difficulty with spoken communication',
    icon: MessageSquare,
    examples: ['Speech impairments', 'Prefer text input', 'Need voice alternatives']
  }
];

const translations = {
  en: {
    title: 'Help Us Personalize Your Experience',
    subtitle: 'Do you have any difficulty using apps? This helps us tailor the experience just for you.',
    disclaimer: 'This information is private and only used to improve your banking experience.',
    options: {
      no: 'No, I don\'t need any assistance',
      yes: 'Yes, I would like assistance with:',
      prefer_not_to_say: 'I prefer not to say'
    },
    examples_label: 'Examples:',
    continue: 'Continue',
    back: 'Back'
  },
  pcm: {
    title: 'Help Us Make Am Better for You',
    subtitle: 'You get any problem to dey use app? This one go help us adjust am for you.',
    disclaimer: 'This information na private and we only use am to make your banking better.',
    options: {
      no: 'No, I no need any help',
      yes: 'Yes, I need help with:',
      prefer_not_to_say: 'I no wan talk am'
    },
    examples_label: 'Like:',
    continue: 'Continue',
    back: 'Back'
  }
};

export function DisabilityDisclosureModal({
  isOpen,
  onClose,
  onSubmit,
  language = 'en'
}: DisabilityDisclosureModalProps) {
  const [selectedOption, setSelectedOption] = useState<'no' | 'yes' | 'prefer_not_to_say' | null>(null);
  const [selectedDisabilities, setSelectedDisabilities] = useState<DisabilityType[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const hasInitializedRef = useRef(false);

  const { speak, startListening, stopListening, transcript, clearTranscript, isListening } = useVoice();
  const adaptiveClasses = useAdaptiveClasses();
  const { setDisabilities, updateProfile } = useProfileStore();
  const t = translations[language as keyof typeof translations] || translations.en;

  const handleOptionSelect = (option: 'no' | 'yes' | 'prefer_not_to_say') => {
    setSelectedOption(option);

    if (option === 'yes') {
      setShowDetails(true);
      setTimeout(() => {
        speak('Here are the available assistance areas: Say "Vision" if you need help with seeing or reading text. Say "Hearing" if you need help with sounds or prefer captions. Say "Movement" if you need larger buttons or have difficulty with precise touch. Say "Focus" if you need simplified screens or help with concentration. Say "Speech" if you prefer text over voice. You can select multiple areas or say "Continue" when finished.');
        setTimeout(() => startListening(), 8000);
      }, 500);
    } else {
      setShowDetails(false);
      setSelectedDisabilities([]);
      if (option === 'no') {
        speak('No assistance needed. You can always change this in settings later.');
      } else {
        speak('No preference selected. We\'ll still offer simplified options when helpful.');
      }
      setTimeout(() => startListening(), 3000);
    }
  };
  const handleSubmit = () => {
    const skipAssistance = selectedOption === 'prefer_not_to_say';
    speak('Preferences saved. Moving to next step.');
    onSubmit(selectedDisabilities, skipAssistance);
  };

  const handleDisabilityToggle = (disabilityId: DisabilityType) => {
    console.log('handleDisabilityToggle called with:', disabilityId);
    console.log('Current selectedDisabilities:', selectedDisabilities);
    
    const newDisabilities = selectedDisabilities.includes(disabilityId)
      ? selectedDisabilities.filter(id => id !== disabilityId)
      : [...selectedDisabilities, disabilityId];

    console.log('Calculated newDisabilities:', newDisabilities);
    
    setSelectedDisabilities(newDisabilities);

    // Immediately update the profile store to trigger UI adaptations
    setDisabilities(newDisabilities);
    
    // For visual impairment, immediately apply enhanced accessibility preferences
    if (disabilityId === 'visual' && newDisabilities.includes('visual')) {
      updateProfile({
        disabilities: newDisabilities,
        accessibilityPreferences: {
          fontSize: 20,
          contrast: 'high',
          ttsSpeed: 1,
          largeTargets: true,
          captions: true,
          font: 'atkinson',
        },
        uiComplexity: 'simplified'
      });
    } else if (disabilityId === 'visual' && !newDisabilities.includes('visual')) {
      // Reset to moderate settings if visual is deselected
      updateProfile({
        disabilities: newDisabilities,
        accessibilityPreferences: {
          fontSize: 16,
          contrast: 'normal',
          ttsSpeed: 1,
          largeTargets: false,
          captions: false,
          font: 'inter',
        },
        uiComplexity: 'moderate'
      });
    } else {
      // Update just the disabilities for other types
      updateProfile({
        disabilities: newDisabilities
      });
    }

    const option = disabilityOptions.find(opt => opt.id === disabilityId);
    if (option) {
      const action = newDisabilities.includes(disabilityId) ? 'selected' : 'deselected';

      // If selecting (not deselecting), automatically proceed to next step
      if (newDisabilities.includes(disabilityId)) {
        // Special message for visual impairment
        if (disabilityId === 'visual') {
          speak(`${option.label} ${action}. Your interface is now optimized for visual accessibility. Moving to next step.`);
        } else {
          speak(`${option.label} ${action}. Moving to next step.`);
        }
        
        // Capture the disabilities in a local variable to avoid closure issues
        const disabilitiesToSubmit = [...newDisabilities];
        console.log('About to auto-submit with disabilities:', disabilitiesToSubmit);
        
        // Auto-submit after 2 seconds with the current disabilities
        setTimeout(() => {
          console.log('Auto-submit timeout fired, submitting with:', disabilitiesToSubmit);
          speak('Preferences saved. Moving to next step.');
          onSubmit(disabilitiesToSubmit, false); // Use captured array
        }, 2000);
      } else {
        // If deselecting, give option to select another or continue
        speak(`${option.label} ${action}. You can select another area or say Continue.`);
        setTimeout(() => {
          if (!isListening) {
            startListening();
          }
        }, 3000);
      }
    }
  };

  // Voice command processing
  useEffect(() => {
    if (!transcript || !transcript.trim()) return;
    
    const command = transcript.toLowerCase();
    console.log('Disability modal voice command:', command);

    // Stop listening immediately to prevent re-triggers
    if (isListening) {
      stopListening();
    }
    clearTranscript();

    // Main option selection commands
    if (!selectedOption) {
      if (command.includes('no') || command.includes('no assistance') || command.includes('dont need') || command.includes("don't need")) {
        handleOptionSelect('no');
        return;
      }

      if (command.includes('yes') || command.includes('need assistance') || command.includes('need help')) {
        handleOptionSelect('yes');
        return;
      }

      if (command.includes('prefer not') || command.includes('dont say') || command.includes("don't say") || command.includes('no preference')) {
        handleOptionSelect('prefer_not_to_say');
        return;
      }

      // Help command
      if (command.includes('help') || command.includes('what can i say')) {
        speak('You can say: No for no assistance, Yes for assistance, or Prefer not to say. You can also say Help for this message.');
        setTimeout(() => startListening(), 3000);
        return;
      }

      // If command not understood
      speak('I didn\'t understand. Say No for no assistance, Yes for assistance, or Prefer not to say.');
      setTimeout(() => startListening(), 3000);
      return;
    }

    // Disability selection commands (when showing details)
    if (showDetails && selectedOption === 'yes') {
      if (command.includes('vision') || command.includes('visual') || command.includes('sight') || command.includes('see')) {
        handleDisabilityToggle('visual');
        return;
      }

      if (command.includes('hearing') || command.includes('audio') || command.includes('deaf') || command.includes('sound')) {
        handleDisabilityToggle('hearing');
        return;
      }

      if (command.includes('motor') || command.includes('movement') || command.includes('mobility') || command.includes('hands')) {
        handleDisabilityToggle('motor');
        return;
      }

      if (command.includes('cognitive') || command.includes('focus') || command.includes('memory') || command.includes('concentration')) {
        handleDisabilityToggle('cognitive');
        return;
      }

      if (command.includes('speech') || command.includes('speaking') || command.includes('voice') || command.includes('communication')) {
        handleDisabilityToggle('speech');
        return;
      }

      // Help command for details screen
      if (command.includes('help') || command.includes('what can i say')) {
        speak('You can say: Vision, Hearing, Movement, Focus, or Speech to select assistance areas. Say Continue when ready, or Back to go back.');
        setTimeout(() => startListening(), 3000);
        return;
      }

      // If command not understood in details
      speak('I didn\'t understand. Try saying: Vision, Hearing, Movement, Focus, or Speech. Or say Continue to proceed.');
      setTimeout(() => startListening(), 3000);
      return;
    }

    // Navigation commands (available after selection)
    if (selectedOption) {
      if (command.includes('continue') || command.includes('next') || command.includes('proceed')) {
        handleSubmit();
        return;
      }

      if (command.includes('back') || command.includes('previous')) {
        onClose();
        return;
      }

      // Help command for selected state
      if (command.includes('help') || command.includes('what can i say')) {
        speak('Say Continue to proceed, or Back to return to the previous step.');
        setTimeout(() => startListening(), 3000);
        return;
      }

      // If command not understood after selection
      speak('I didn\'t understand. Say Continue to proceed or Back to go back.');
      setTimeout(() => startListening(), 3000);
      return;
    }
  }, [transcript]);

  // Auto-start listening and announce when modal opens - only run once when modal opens
  useEffect(() => {
    if (isOpen && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      const timer1 = setTimeout(() => {
        speak('Help us personalize your experience. Do you need any assistance using apps? You can say: No, Yes, or Prefer not to say.');
        const timer2 = setTimeout(() => {
          startListening();
        }, 3000);
        return () => clearTimeout(timer2);
      }, 1000);

      return () => {
        clearTimeout(timer1);
      };
    }
  }, [isOpen]); // Only depend on isOpen to prevent re-triggering

  // Reset initialization flag when modal closes
  useEffect(() => {
    if (!isOpen) {
      hasInitializedRef.current = false;
    }
  }, [isOpen]);

  // Cleanup when modal closes
  useEffect(() => {
    return () => {
      if (isListening) {
        stopListening();
      }
    };
  }, [isListening, stopListening]);

  if (!isOpen) return null;






  const canContinue = selectedOption !== null &&
    (selectedOption !== 'yes' || selectedDisabilities.length > 0 || showDetails);

  return (
    <div className="fixed inset-0 bg-white flex items-start justify-start z-50 ">
      <Card className="w-screen max-w-2xl max-h-[90vh]  h-full border-none shadow-none overflow-y-auto ">
       
        <div className="p-6 space-y-6">
          {/* Voice Control Status */}
          {transcript && isListening && (
            <p className={cn(adaptiveClasses.text, "text-sm text-blue-600 mt-1")} aria-live="assertive">
              <span className="sr-only">Voice input detected:</span>You said: "{transcript}"
            </p>
          )}

 <div className="flex justify-center mb-6 max-h-[8rem]">
          <Image
            src="/logo.png"
            alt="4All Banking Logo"
            width={1000}
            height={1000}
            className="rounded-xl w-[15rem] h-full object-contain"
          />
        </div>
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <h2 className={cn(adaptiveClasses.heading, "text-2xl font-semibold text-text")}>
                {t.title}
              </h2>
              <p className={cn(adaptiveClasses.text, "text-muted-gray leading-relaxed")}>
                {t.subtitle}
              </p>
              <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray/80 italic")}>
                {t.disclaimer}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="shrink-0 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Main Options */}
          <div className="space-y-4">
            {/* No Assistance Option */}
            <button
              onClick={() => handleOptionSelect('no')}
              className={cn(
                "w-full p- rounded-lg border-2 text-left transition-all",
                adaptiveClasses.button,
                selectedOption === 'no'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                  selectedOption === 'no' ? 'border-primary bg-primary' : 'border-gray-300'
                )}>
                  {selectedOption === 'no' && <Check className="h-4 w-4 text-white" />}
                </div>
                <span className={cn(adaptiveClasses.text, "font-medium")}>
                  {t.options.no}
                </span>
              </div>
            </button>

            {/* Need Assistance Option */}
            <button
              onClick={() => handleOptionSelect('yes')}
              className={cn(
                "w-full p- rounded-lg border-2 text-left transition-all",
                adaptiveClasses.button,
                selectedOption === 'yes'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                  selectedOption === 'yes' ? 'border-primary bg-primary' : 'border-gray-300'
                )}>
                  {selectedOption === 'yes' && <Check className="h-4 w-4 text-white" />}
                </div>
                <span className={cn(adaptiveClasses.text, "font-medium")}>
                  {t.options.yes}
                </span>
              </div>
            </button>

            {/* Prefer Not to Say Option */}
            <button
              onClick={() => handleOptionSelect('prefer_not_to_say')}
              className={cn(
                "w-full p- rounded-lg border-2 text-left transition-all",
                adaptiveClasses.button,
                selectedOption === 'prefer_not_to_say'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                  selectedOption === 'prefer_not_to_say' ? 'border-primary bg-primary' : 'border-gray-300'
                )}>
                  {selectedOption === 'prefer_not_to_say' && <Check className="h-4 w-4 text-white" />}
                </div>
                <span className={cn(adaptiveClasses.text, "font-medium")}>
                  {t.options.prefer_not_to_say}
                </span>
              </div>
            </button>
          </div>

          {/* Disability Details */}
          {showDetails && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className={cn(adaptiveClasses.text, "font-medium text-text")}>
                Select areas where you need assistance:
              </h3>

              <div className="grid gap-3">
                {disabilityOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedDisabilities.includes(option.id);

                  return (
                    <div key={option.id} className="space-y-2">
                      <button
                        onClick={() => handleDisabilityToggle(option.id)}
                        className={cn(
                          "w-full p- rounded-lg border-2 text-left transition-all",
                          adaptiveClasses.button,
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-6 h-6 rounded-sm border-2 flex items-center justify-center shrink-0 mt-0.5",
                            isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                          )}>
                            {isSelected && <Check className="h-4 w-4 text-white" />}
                          </div>

                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <Icon className="h-5 w-5 text-gray-600" />
                              <span className={cn(adaptiveClasses.text, "font-medium")}>
                                {option.label}
                              </span>
                            </div>
                            {/* <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
                              {option.description}
                            </p> */}
                          </div>
                        </div>
                      </button>

                      {isSelected && (
                        <div className="ml-9 p-3 bg-blue-50 rounded-md">
                          <p className={cn(adaptiveClasses.text, "text-sm font-medium text-blue-800 mb-1")}>
                            {t.examples_label}
                          </p>
                          <ul className={cn(adaptiveClasses.text, "text-sm text-blue-700 space-y-0.5")}>
                            {option.examples.map((example, idx) => (
                              <li key={idx}>• {example}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Voice Help */}
          <div className="text-center border-t pt-4">
            <p className={cn(adaptiveClasses.text, "text-xs text-muted-gray")}>
              💡 You can use voice commands: {!selectedOption ? '"Yes", "No", or "Prefer not to say"' :
                showDetails ? '"Vision", "Hearing", "Movement", "Focus", "Speech", or "Continue"' :
                  '"Continue" or "Back"'} | Say "Help" for assistance
            </p>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className={adaptiveClasses.button}
            >
              {t.back}
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={!canContinue}
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