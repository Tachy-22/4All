'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { useProfileStore } from '../../hooks/useProfile';
import { useVoice } from '../../hooks/useVoice';
import { useAdaptiveClasses } from '../../hooks/useAdaptiveUI';
import { useTranslation } from '../../hooks/useTranslation';
import { DisabilityDisclosure } from './DisabilityDisclosure';
import { InteractionPreference } from './InteractionPreference';
import { CognitiveMicroTest } from './CognitiveMicroTest';
import { AccessibilityCalibration } from './AccessibilityCalibration';
import { RegistrationForm } from './RegistrationForm';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const router = useRouter();
  
  const { speak } = useVoice();
  const adaptiveClasses = useAdaptiveClasses();
  const { profile, updateProfile } = useProfileStore();
  const { t } = useTranslation();

  const steps = [
    { id: 'disability', title: t('onboarding.accessibilityNeeds'), required: true },
    { id: 'interaction', title: t('onboarding.interactionPreference'), required: true },
    { id: 'cognitive', title: t('onboarding.uiSetup'), required: true },
    { id: 'calibration', title: t('onboarding.accessibilityCalibration'), required: false },
    { id: 'registration', title: t('onboarding.createAccount'), required: true },
  ];

  const stepProgress = ((currentStep + 1) / steps.length) * 100;

  useEffect(() => {
    // Speak welcome message for onboarding
    const welcomeMessage = t('onboarding.welcomeMessage', { stepCount: steps.length });
    setTimeout(() => speak(welcomeMessage), 1000);
  }, [speak, t, steps.length]);

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      // Announce next step
      const nextStepTitle = steps[currentStep + 1].title;
      speak(`Moving to step ${currentStep + 2}: ${nextStepTitle}`);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      const prevStepTitle = steps[currentStep - 1].title;
      speak(`Back to step ${currentStep}: ${prevStepTitle}`);
    }
  };

  const handleComplete = () => {
    updateProfile({ isOnboardingComplete: true });
    speak(t('onboarding.completeMessage'));
    setTimeout(() => router.push('/dashboard'), 2000);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Disability disclosure
        return true; // Always can proceed (optional disclosure)
      case 1: // Interaction preference
        return profile?.interactionMode !== undefined;
      case 2: // Cognitive test
        return profile?.uiComplexity !== undefined;
      case 3: // Accessibility calibration
        return true; // Optional step
      case 4: // Registration
        return profile?.name && profile?.phone;
      default:
        return false;
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <DisabilityDisclosure onNext={handleNext} />;
      case 1:
        return <InteractionPreference onNext={handleNext} onBack={handleBack} />;
      case 2:
        return <CognitiveMicroTest onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <AccessibilityCalibration onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <RegistrationForm onComplete={handleComplete} onBack={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={cn(adaptiveClasses.heading, "text-4xl text-primary-red mb-4")}>
            {t('onboarding.title')}
          </h1>
          <p className={cn(adaptiveClasses.text, "text-muted-gray")}>
            {t('onboarding.subtitle')}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
              {t('onboarding.stepProgress', { current: currentStep + 1, total: steps.length })}
            </span>
            <span className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
              {t('onboarding.percentComplete', { percent: Math.round(stepProgress) })}
            </span>
          </div>
          
          <Progress 
            value={stepProgress} 
            className="h-2 mb-4" 
            aria-label={`Progress: ${Math.round(stepProgress)}% complete`}
          />
          
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className="flex flex-col items-center flex-1"
                role="progressbar"
                aria-valuenow={index <= currentStep ? 100 : 0}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div 
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 transition-colors",
                    index === currentStep 
                      ? "bg-primary-red text-white" 
                      : completedSteps.has(index)
                      ? "bg-success text-white"
                      : "bg-muted-gray text-white"
                  )}
                  aria-label={`Step ${index + 1}: ${step.title} - ${
                    completedSteps.has(index) 
                      ? 'Completed' 
                      : index === currentStep 
                      ? 'Current' 
                      : 'Pending'
                  }`}
                >
                  {completedSteps.has(index) ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={cn(
                  "text-xs text-center hidden sm:block",
                  index === currentStep ? "text-primary-red font-medium" : "text-muted-gray"
                )}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <Card className={cn(adaptiveClasses.card, "min-h-[400px]")}>
          {renderCurrentStep()}
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className={cn(
              adaptiveClasses.button,
              "border-muted-gray text-muted-gray",
              currentStep === 0 && "opacity-50 cursor-not-allowed"
            )}
            aria-label="Go back to previous step"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-center">
            <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
              {currentStep < steps.length - 1 
                ? `${steps.length - currentStep - 1} steps remaining`
                : 'Ready to complete setup'
              }
            </p>
          </div>

          {currentStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className={cn(
                adaptiveClasses.button,
                "bg-primary-red text-white hover:bg-primary-red/90",
                !canProceed() && "opacity-50 cursor-not-allowed"
              )}
              aria-label="Continue to next step"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canProceed()}
              className={cn(
                adaptiveClasses.button,
                "bg-success text-white hover:bg-success/90",
                !canProceed() && "opacity-50 cursor-not-allowed"
              )}
              aria-label="Complete onboarding"
            >
              Complete Setup
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Accessibility Info */}
        <div className="mt-8 text-center">
          <p className={cn(adaptiveClasses.text, "text-xs text-muted-gray")}>
            Need help? You can use voice commands or keyboard navigation.
            Press the Space bar to activate buttons, Tab to navigate, and Escape to go back.
          </p>
        </div>
      </div>
    </div>
  );
}