'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useProfileStore } from '../../hooks/useProfile';
import { useVoice } from '../../hooks/useVoice';
import { useAdaptiveClasses } from '../../hooks/useAdaptiveUI';
import { Mic, Type, Volume2, VolumeX, MessageCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface InteractionPreferenceProps {
  onNext: () => void;
  onBack: () => void;
}

export function InteractionPreference({ onNext, onBack }: InteractionPreferenceProps) {
  const [selectedMode, setSelectedMode] = useState<'voice' | 'text' | null>(null);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  
  const { speak, isSupported: voiceSupported, startListening, stopListening, isListening } = useVoice();
  const adaptiveClasses = useAdaptiveClasses();
  const { updateProfile } = useProfileStore();

  useEffect(() => {
    const message = "Now let's choose how you'd like to interact with your banking app. You can use voice commands, or prefer text-based interactions.";
    setTimeout(() => speak(message), 500);
  }, [speak]);

  const handleModeSelect = (mode: 'voice' | 'text') => {
    setSelectedMode(mode);
    updateProfile({ interactionMode: mode });
    
    if (mode === 'voice') {
      speak("Great choice! Voice banking allows you to control your account hands-free. Would you like to test it now?");
    } else {
      speak("Perfect! Text-based banking gives you precise control with typing and touch. You can always switch to voice later.");
    }
  };

  const testVoiceInteraction = async () => {
    if (!voiceSupported) {
      speak("Voice features are not supported on this device. Please use text mode instead.");
      return;
    }

    setIsTestingVoice(true);
    speak("Let's test your voice. Please say 'Hello Ziva' when you hear the prompt.");
    
    setTimeout(() => {
      startListening();
    }, 3000);

    // Stop listening after 5 seconds
    setTimeout(() => {
      stopListening();
      setIsTestingVoice(false);
      speak("Voice test complete! You can now use voice commands throughout the app.");
    }, 8000);
  };

  const handleContinue = () => {
    if (selectedMode) {
      const message = selectedMode === 'voice' 
        ? "Voice mode selected. Moving to the next step where we'll customize your interface."
        : "Text mode selected. Moving to the next step where we'll customize your interface.";
      speak(message);
      onNext();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <MessageCircle className="w-12 h-12 text-primary-red mx-auto mb-4" />
        <h2 className={cn(adaptiveClasses.heading, "text-2xl text-text mb-4")}>
          How would you like to interact?
        </h2>
        <p className={cn(adaptiveClasses.text, "text-muted-gray max-w-2xl mx-auto")}>
          Choose your preferred way to use 4All Banking. You can always change this later in settings.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Voice Mode */}
        <Card 
          className={cn(
            "p-6 cursor-pointer transition-all duration-200 hover:shadow-lg",
            selectedMode === 'voice' 
              ? "ring-2 ring-primary-red bg-primary-red/5" 
              : "hover:bg-bg-white/50"
          )}
          onClick={() => handleModeSelect('voice')}
          role="button"
          tabIndex={0}
          aria-pressed={selectedMode === 'voice'}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleModeSelect('voice');
            }
          }}
        >
          <div className="text-center">
            <Mic className="w-16 h-16 text-primary-red mx-auto mb-4" />
            <h3 className={cn(adaptiveClasses.text, "text-xl font-semibold text-text mb-3")}>
              Voice-First
            </h3>
            <p className={cn(adaptiveClasses.text, "text-muted-gray mb-4")}>
              Control your banking with voice commands. Perfect for hands-free banking and accessibility.
            </p>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center gap-2 text-success">
                <Volume2 className="w-4 h-4" />
                <span>Hands-free banking</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-success">
                <Mic className="w-4 h-4" />
                <span>Natural language commands</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-success">
                <MessageCircle className="w-4 h-4" />
                <span>Audio feedback</span>
              </div>
              {!voiceSupported && (
                <div className="flex items-center justify-center gap-2 text-warning">
                  <VolumeX className="w-4 h-4" />
                  <span>Not supported on this device</span>
                </div>
              )}
            </div>

            {selectedMode === 'voice' && voiceSupported && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  testVoiceInteraction();
                }}
                disabled={isTestingVoice}
                className={cn(
                  adaptiveClasses.button,
                  "mt-4 bg-primary-red text-white hover:bg-primary-red/90"
                )}
                aria-label="Test voice interaction"
              >
                {isTestingVoice ? 'Testing...' : 'Test Voice'}
              </Button>
            )}
          </div>
        </Card>

        {/* Text Mode */}
        <Card 
          className={cn(
            "p-6 cursor-pointer transition-all duration-200 hover:shadow-lg",
            selectedMode === 'text' 
              ? "ring-2 ring-primary-red bg-primary-red/5" 
              : "hover:bg-bg-white/50"
          )}
          onClick={() => handleModeSelect('text')}
          role="button"
          tabIndex={0}
          aria-pressed={selectedMode === 'text'}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleModeSelect('text');
            }
          }}
        >
          <div className="text-center">
            <Type className="w-16 h-16 text-primary-red mx-auto mb-4" />
            <h3 className={cn(adaptiveClasses.text, "text-xl font-semibold text-text mb-3")}>
              Text & Touch
            </h3>
            <p className={cn(adaptiveClasses.text, "text-muted-gray mb-4")}>
              Traditional banking interface with typing and touch controls. Precise and familiar.
            </p>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center gap-2 text-success">
                <Type className="w-4 h-4" />
                <span>Keyboard navigation</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-success">
                <MessageCircle className="w-4 h-4" />
                <span>Visual interface</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-success">
                <Volume2 className="w-4 h-4" />
                <span>Optional audio assistance</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Voice Testing Status */}
      {isTestingVoice && (
        <Card className="p-4 bg-primary-red/5 border-primary-red">
          <div className="flex items-center justify-center gap-3">
            <Mic className={cn("w-5 h-5 text-primary-red", isListening && "animate-pulse")} />
            <span className={cn(adaptiveClasses.text, "text-primary-red")}>
              {isListening ? "Listening... Please say 'Hello Ziva'" : "Preparing voice test..."}
            </span>
          </div>
        </Card>
      )}

      {/* Comparison Table */}
      <Card className="p-6">
        <h4 className={cn(adaptiveClasses.text, "font-medium text-text mb-4 text-center")}>
          Mode Comparison
        </h4>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h5 className={cn(adaptiveClasses.text, "font-medium text-primary-red mb-2")}>
              Voice-First Benefits
            </h5>
            <ul className={cn(adaptiveClasses.text, "text-muted-gray space-y-1")}>
              <li>• Hands-free operation</li>
              <li>• Natural conversation</li>
              <li>• Accessibility friendly</li>
              <li>• Multitasking enabled</li>
              <li>• Audio confirmations</li>
            </ul>
          </div>
          <div>
            <h5 className={cn(adaptiveClasses.text, "font-medium text-primary-red mb-2")}>
              Text & Touch Benefits
            </h5>
            <ul className={cn(adaptiveClasses.text, "text-muted-gray space-y-1")}>
              <li>• Precise control</li>
              <li>• Visual feedback</li>
              <li>• Silent operation</li>
              <li>• Familiar interface</li>
              <li>• Works everywhere</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className={cn(
            adaptiveClasses.button,
            "border-muted-gray text-muted-gray"
          )}
          aria-label="Go back to previous step"
        >
          Back
        </Button>

        <Button
          onClick={handleContinue}
          disabled={!selectedMode}
          className={cn(
            adaptiveClasses.button,
            "bg-primary-red text-white hover:bg-primary-red/90",
            !selectedMode && "opacity-50 cursor-not-allowed"
          )}
          aria-label="Continue with selected interaction mode"
        >
          Continue
        </Button>
      </div>

      {!selectedMode && (
        <p className={cn(adaptiveClasses.text, "text-xs text-muted-gray text-center")}>
          Please select an interaction mode to continue
        </p>
      )}
    </div>
  );
}