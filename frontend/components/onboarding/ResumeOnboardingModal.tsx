'use client';

import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useVoice } from '../../hooks/useVoice';
import { useAdaptiveClasses } from '../../hooks/useAdaptiveUI';
import { Clock, RotateCcw, Play } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ResumeOnboardingModalProps {
  isOpen: boolean;
  onResume: () => void;
  onStartOver: () => void;
  progressStep: string;
  language: string;
}

const translations = {
  en: {
    title: 'Welcome Back!',
    subtitle: 'Do you want to continue where you left off?',
    last_step: 'You were on: {step}',
    resume_button: 'Continue Setup',
    start_over_button: 'Start Over',
    time_saved: 'This will save you time by keeping your previous choices.'
  },
  pcm: {
    title: 'Welcome Back!',
    subtitle: 'You wan continue from where you stop?',
    last_step: 'You been dey here: {step}',
    resume_button: 'Continue Setup',
    start_over_button: 'Start Again',
    time_saved: 'This one go save your time, e go keep all your previous choices.'
  }
};

const stepNames = {
  en: {
    language: 'Language Selection',
    interaction_mode: 'Interaction Mode',
    disability_disclosure: 'Accessibility Preferences',
    accessibility_toggles: 'Quick Setup',
    cognitive_quiz: 'Personalization Quiz',
    summary: 'Setup Complete'
  },
  pcm: {
    language: 'Choose Language',
    interaction_mode: 'How You Wan Talk',
    disability_disclosure: 'Accessibility Settings',
    accessibility_toggles: 'Quick Setup',
    cognitive_quiz: 'Small Quiz',
    summary: 'Setup Finish'
  }
};

export function ResumeOnboardingModal({
  isOpen,
  onResume,
  onStartOver,
  progressStep,
  language = 'en'
}: ResumeOnboardingModalProps) {
  const { speak } = useVoice();
  const adaptiveClasses = useAdaptiveClasses();
  const t = translations[language as keyof typeof translations] || translations.en;
  const steps = stepNames[language as keyof typeof stepNames] || stepNames.en;

  if (!isOpen) return null;

  const handleResume = () => {
    speak('Continuing from where you left off.');
    onResume();
  };

  const handleStartOver = () => {
    speak('Starting fresh setup.');
    onStartOver();
  };

  const stepDisplayName = steps[progressStep as keyof typeof steps] || progressStep;

  return (
    <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </div>

            <h2 className={cn(adaptiveClasses.heading, "text-xl font-semibold text-text")}>
              {t.title}
            </h2>

            <p className={cn(adaptiveClasses.text, "text-muted-gray")}>
              {t.subtitle}
            </p>
          </div>

          {/* Progress Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-primary" />
              <span className={cn(adaptiveClasses.text, "text-sm font-medium text-text")}>
                {t.last_step.replace('{step}', stepDisplayName)}
              </span>
            </div>

            <p className={cn(adaptiveClasses.text, "text-xs text-muted-gray")}>
              {t.time_saved}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleResume}
              className={cn(adaptiveClasses.button, "w-full")}
              size="lg"
            >
              <Play className="h-4 w-4 mr-2" />
              {t.resume_button}
            </Button>

            <Button
              variant="outline"
              onClick={handleStartOver}
              className={cn(adaptiveClasses.button, "w-full")}
              size="lg"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {t.start_over_button}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}