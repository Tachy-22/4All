'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Card } from '../ui/card';
import { useProfileStore } from '../../hooks/useProfile';
import { useVoice } from '../../hooks/useVoice';
import { useAdaptiveClasses } from '../../hooks/useAdaptiveUI';
import { Eye, Ear, HandIcon as Hand, Brain, Mic2, Heart } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DisabilityDisclosureProps {
  onNext: () => void;
}

const disabilityOptions = [
  {
    id: 'visual',
    name: 'Visual',
    icon: Eye,
    description: 'Vision-related needs like screen readers, high contrast, or large text',
    examples: ['Blindness', 'Low vision', 'Color blindness']
  },
  {
    id: 'hearing',
    name: 'Hearing',
    icon: Ear,
    description: 'Hearing-related needs like captions or visual alerts',
    examples: ['Deafness', 'Hard of hearing', 'Auditory processing']
  },
  {
    id: 'motor',
    name: 'Motor',
    icon: Hand,
    description: 'Movement or dexterity needs like voice control or larger touch targets',
    examples: ['Limited mobility', 'Tremors', 'Missing limbs']
  },
  {
    id: 'cognitive',
    name: 'Cognitive',
    icon: Brain,
    description: 'Thinking or learning preferences like simplified layouts or clear instructions',
    examples: ['Autism', 'ADHD', 'Learning differences', 'Memory challenges']
  },
  {
    id: 'speech',
    name: 'Speech',
    icon: Mic2,
    description: 'Communication needs with alternative input methods',
    examples: ['Speech impediments', 'Vocal cord issues', 'Selective mutism']
  }
];

export function DisabilityDisclosure({ onNext }: DisabilityDisclosureProps) {
  const [selectedDisabilities, setSelectedDisabilities] = useState<string[]>([]);
  const [hasDisclosed, setHasDisclosed] = useState<'yes' | 'no' | 'prefer-not-to-say' | null>(null);
  
  const { speak } = useVoice();
  const adaptiveClasses = useAdaptiveClasses();
  const { updateProfile } = useProfileStore();

  useEffect(() => {
    const message = "Let's talk about accessibility. Do you have any accessibility needs we can help with? This information helps us provide a better experience for you.";
    setTimeout(() => speak(message), 500);
  }, [speak]);

  const handleDisclosureChoice = (choice: 'yes' | 'no' | 'prefer-not-to-say') => {
    setHasDisclosed(choice);
    
    if (choice === 'no' || choice === 'prefer-not-to-say') {
      setSelectedDisabilities([]);
      updateProfile({ disabilities: [] });
      
      const message = choice === 'no' 
        ? "Great! We'll still provide accessibility features by default."
        : "That's perfectly fine. You can always update these preferences later.";
      speak(message);
    } else {
      speak("Please select any accessibility needs that apply to you. You can choose multiple options or none if you prefer.");
    }
  };

  const handleDisabilityToggle = (disabilityId: string) => {
    const isSelected = selectedDisabilities.includes(disabilityId);
    let newSelection;
    
    if (isSelected) {
      newSelection = selectedDisabilities.filter(id => id !== disabilityId);
    } else {
      newSelection = [...selectedDisabilities, disabilityId];
    }
    
    setSelectedDisabilities(newSelection);
    updateProfile({ disabilities: newSelection as any });
    
    // Voice feedback
    const option = disabilityOptions.find(opt => opt.id === disabilityId);
    if (option) {
      speak(isSelected ? `${option.name} deselected` : `${option.name} selected, you can select another, or say continue`);
    }
  };

  const handleContinue = () => {
    updateProfile({ 
      disabilities: hasDisclosed === 'yes' ? selectedDisabilities as any : [] 
    });
    
    speak(`Moving to the next step. Your selections have been saved.`);
    onNext();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <Heart className="w-12 h-12 text-primary-red mx-auto mb-4" />
        <h2 className={cn(adaptiveClasses.heading, "text-2xl text-text mb-4")}>
          Accessibility & Inclusion
        </h2>
        <p className={cn(adaptiveClasses.text, "text-muted-gray max-w-2xl mx-auto")}>
          We believe banking should work for everyone. Sharing your accessibility needs helps us 
          provide you with the best possible experience. This information is completely optional 
          and private.
        </p>
      </div>

      <div className="space-y-6">
        {/* Initial Disclosure Question */}
        <div className="text-center space-y-4">
          <h3 className={cn(adaptiveClasses.text, "font-medium text-text")}>
            Do you use assistive features or have any accessibility needs?
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {[
              { value: 'yes', label: 'Yes, I do', color: 'bg-primary-red' },
              { value: 'no', label: 'No, I don\'t', color: 'bg-muted-gray' },
              { value: 'prefer-not-to-say', label: 'Prefer not to say', color: 'bg-muted-gray' }
            ].map((option) => (
              <Button
                key={option.value}
                onClick={() => handleDisclosureChoice(option.value as any)}
                className={cn(
                  adaptiveClasses.button,
                  "text-white hover:opacity-90",
                  hasDisclosed === option.value ? option.color : 'bg-muted-gray/50 hover:bg-muted-gray'
                )}
                variant={hasDisclosed === option.value ? "default" : "outline"}
                aria-pressed={hasDisclosed === option.value}
                aria-label={`Select ${option.label}`}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Detailed Options - Only show if user selected "Yes" */}
        {hasDisclosed === 'yes' && (
          <div className="space-y-4">
            <h4 className={cn(adaptiveClasses.text, "font-medium text-text text-center")}>
              Please select any that apply to you:
            </h4>
            
            <div className="grid gap-4 md:grid-cols-2">
              {disabilityOptions.map((option) => (
                <Card 
                  key={option.id}
                  className={cn(
                    "p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
                    selectedDisabilities.includes(option.id) 
                      ? "ring-2 ring-primary-red bg-primary-red/5" 
                      : "hover:bg-bg-white/50"
                  )}
                  onClick={() => handleDisabilityToggle(option.id)}
                  role="checkbox"
                  aria-checked={selectedDisabilities.includes(option.id)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleDisabilityToggle(option.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={selectedDisabilities.includes(option.id)}
                      onChange={() => handleDisabilityToggle(option.id)}
                      className="mt-1"
                      aria-label={`Select ${option.name} accessibility needs`}
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <option.icon className="w-5 h-5 text-primary-red" />
                        <h5 className={cn(adaptiveClasses.text, "font-medium text-text")}>
                          {option.name}
                        </h5>
                      </div>
                      
                      <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray mb-2")}>
                        {option.description}
                      </p>
                      
                      <p className={cn(adaptiveClasses.text, "text-xs text-muted-gray")}>
                        Examples: {option.examples.join(', ')}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="bg-bg-white p-4 rounded-lg border">
          <h4 className={cn(adaptiveClasses.text, "font-medium text-text mb-2")}>
            Privacy & Control
          </h4>
          <ul className={cn(adaptiveClasses.text, "text-sm text-muted-gray space-y-1")}>
            <li>• This information is used only to improve your banking experience</li>
            <li>• You can update or remove these preferences anytime in settings</li>
            <li>• We never share accessibility information with third parties</li>
            <li>• All adaptive features work without requiring disclosure</li>
          </ul>
        </div>

        {/* Continue Button */}
        <div className="text-center pt-4">
          <Button
            onClick={handleContinue}
            disabled={hasDisclosed === null}
            className={cn(
              adaptiveClasses.button,
              "bg-primary-red text-white hover:bg-primary-red/90 px-8",
              hasDisclosed === null && "opacity-50 cursor-not-allowed"
            )}
            aria-label="Continue to next step"
          >
            Continue
          </Button>
          
          {hasDisclosed === null && (
            <p className={cn(adaptiveClasses.text, "text-xs text-muted-gray mt-2")}>
              Please make a selection to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}