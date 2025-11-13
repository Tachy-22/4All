'use client';

import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { useVoice } from '../../hooks/useVoice';
import { useAdaptiveClasses } from '../../hooks/useAdaptiveUI';
import { Check, Eye, Ear, Hand, Brain, MessageSquare, X } from 'lucide-react';
import { cn } from '../../lib/utils';

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

  const { speak, startListening, stopListening, transcript, clearTranscript, isListening } = useVoice();
  const adaptiveClasses = useAdaptiveClasses();
  const t = translations[language as keyof typeof translations] || translations.en;

  const handleOptionSelect = (option: 'no' | 'yes' | 'prefer_not_to_say') => {
    setSelectedOption(option);

    if (option === 'yes') {
      setShowDetails(true);
     // speak('Please select the areas where you need assistance. You can say: Vision for sight difficulties, Hearing for sound difficulties, Movement for touch difficulties, Focus for concentration difficulties, or Speech for communication difficulties. You can also say multiple options or none to finish.');
    } else {
      setShowDetails(false);
      setSelectedDisabilities([]);
      if (option === 'no') {
        speak('No assistance needed. You can always change this in settings later.');
      } else {
        speak('No preference selected. We\'ll still offer simplified options when helpful.');
      }
    }
  };
  const handleSubmit = () => {
    const skipAssistance = selectedOption === 'prefer_not_to_say';
    speak('Preferences saved. Moving to next step.');
    onSubmit(selectedDisabilities, skipAssistance);
  };

  const handleDisabilityToggle = (disabilityId: DisabilityType) => {
    const newDisabilities = selectedDisabilities.includes(disabilityId)
      ? selectedDisabilities.filter(id => id !== disabilityId)
      : [...selectedDisabilities, disabilityId];

    setSelectedDisabilities(newDisabilities);

    const option = disabilityOptions.find(opt => opt.id === disabilityId);
    if (option) {
      const action = newDisabilities.includes(disabilityId) ? 'selected' : 'deselected';
      
      // Get remaining unselected options
      const remainingOptions = disabilityOptions
        .filter(opt => !newDisabilities.includes(opt.id))
        .map(opt => opt.label);
      
      const remainingText = remainingOptions.length > 0 
        ? `You can choose another need like ${remainingOptions.join(', ')}, or say Continue when ready.`
        : 'Say Continue when ready.';
      
      speak(`${option.label} ${action}. ${remainingText}`);
    }
  };

  // Voice command processing
  useEffect(() => {
    if (transcript && transcript.trim()) {
      const command = transcript.toLowerCase();
      console.log('Disability modal voice command:', command);

      // Main option selection commands
      if (command.includes('no') || command.includes('no assistance') || command.includes('dont need') || command.includes("don't need")) {
        handleOptionSelect('no');
        clearTranscript();
        return;
      }

      if (command.includes('yes') || command.includes('need assistance') || command.includes('need help')) {
        handleOptionSelect('yes');
        clearTranscript();
        // Give detailed voice guidance after a brief delay
        setTimeout(() => {
          speak('Here are the available assistance areas: Say "Vision" if you need help with seeing or reading text. Say "Hearing" if you need help with sounds or prefer captions. Say "Movement" if you need larger buttons or have difficulty with precise touch. Say "Focus" if you need simplified screens or help with concentration. Say "Speech" if you prefer text over voice. You can select multiple areas or say "none" when finished.');
        }, 2000);
        return;
      }

      if (command.includes('prefer not') || command.includes('dont say') || command.includes("don't say") || command.includes('no preference')) {
        handleOptionSelect('prefer_not_to_say');
        clearTranscript();
        return;
      }

      // Disability selection commands (when showing details)
      if (showDetails) {
        if (command.includes('vision') || command.includes('visual') || command.includes('sight') || command.includes('see')) {
          handleDisabilityToggle('visual');
          clearTranscript();
          return;
        }

        if (command.includes('hearing') || command.includes('audio') || command.includes('deaf') || command.includes('sound')) {
          handleDisabilityToggle('hearing');
          clearTranscript();
          return;
        }

        if (command.includes('motor') || command.includes('movement') || command.includes('mobility') || command.includes('hands')) {
          handleDisabilityToggle('motor');
          clearTranscript();
          return;
        }

        if (command.includes('cognitive') || command.includes('focus') || command.includes('memory') || command.includes('concentration')) {
          handleDisabilityToggle('cognitive');
          clearTranscript();
          return;
        }

        if (command.includes('speech') || command.includes('speaking') || command.includes('voice') || command.includes('communication')) {
          handleDisabilityToggle('speech');
          clearTranscript();
          return;
        }
      }

      // Navigation commands
      if (command.includes('continue') || command.includes('next') || command.includes('proceed')) {
        if (selectedOption) {
          handleSubmit();
          clearTranscript();
          return;
        }
      }

      if (command.includes('back') || command.includes('previous')) {
        onClose();
        clearTranscript();
        return;
      }

      // Help command
      if (command.includes('help') || command.includes('what can i say')) {
        if (!selectedOption) {
          speak('You can say: No for no assistance, Yes for assistance, or Prefer not to say. You can also say Help for this message.');
        } else if (showDetails) {
          speak('You can say: Vision, Hearing, Movement, Focus, or Speech to select assistance areas. Say Continue when ready, or Back to go back.');
        } else {
          speak('Say Continue to proceed, or Back to return to the previous step.');
        }
        clearTranscript();
        return;
      }

      // If command not understood
      if (!selectedOption) {
        speak('I didn\'t understand. Say No for no assistance, Yes for assistance, or Prefer not to say.');
      } else if (showDetails) {
        speak('I didn\'t understand. Try saying: Vision, Hearing, Movement, Focus, or Speech. Or say Continue to proceed.');
      } else {
        speak('I didn\'t understand. Say Continue to proceed or Back to go back.');
      }
      clearTranscript();
    }
  }, [transcript, selectedOption, showDetails, handleOptionSelect, handleSubmit, onClose, speak, clearTranscript]);

  // Auto-start listening and announce when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        speak('Help us personalize your experience. Do you need any assistance using apps? You can say: No, Yes, or Prefer not to say.');
        setTimeout(() => {
          startListening();
        }, 3000);
      }, 1000);
    }

    return () => {
      if (isListening) {
        stopListening();
      }
    };
  }, [isOpen, speak, startListening, stopListening, isListening]);

  if (!isOpen) return null;






  const canContinue = selectedOption !== null &&
    (selectedOption !== 'yes' || selectedDisabilities.length > 0 || showDetails);

  return (
    <div className="fixed inset-0 bg-white flex items-start justify-start z-50 ">
      <Card className="w-screen max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <div className="p-6 space-y-6">
          {/* Voice Control Status */}
          {transcript && isListening && (
            <p className={cn(adaptiveClasses.text, "text-sm text-blue-600 mt-1")} aria-live="assertive">
              <span className="sr-only">Voice input detected:</span>You said: "{transcript}"
            </p>
          )}

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