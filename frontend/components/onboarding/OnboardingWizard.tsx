'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { useProfileStore, UserProfile } from '../../hooks/useProfile';
import { useVoice } from '../../hooks/useVoice';
import { useAdaptiveClasses } from '../../hooks/useAdaptiveUI';
import { useOnboardingProgress } from '../../hooks/useOnboardingProgress';
import { DisabilityDisclosureModal, DisabilityType } from './DisabilityDisclosureModal';
import { NeurodivergentQuiz } from './NeurodivergentQuiz';
import { AccessibilityToggles } from './AccessibilityToggles';
import { Globe, Mic, MessageSquare, ArrowRight, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  icon: string;
}

const languages: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', icon: '🇺🇸' },
  { code: 'pcm', name: 'Nigerian Pidgin', nativeName: 'Pidgin', icon: '🇳🇬' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', icon: '🇳🇬' },
  { code: 'ig', name: 'Igbo', nativeName: 'Igbo', icon: '🇳🇬' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', icon: '🇳🇬' }
];

const translations = {
  en: {
    welcome_title: 'Welcome to 4All Banking',
    language_subtitle: 'Pick how you want to speak and read — we\'ll use this everywhere.',
    interaction_title: 'How would you like to interact?',
    interaction_subtitle: 'Choose your preferred way to use the app',
    voice_option: 'Voice First',
    voice_description: 'We\'ll talk to you — you can always switch to text.',
    text_option: 'Text Only',
    text_description: 'You chose text-only. You can change this later in Settings.',
    continue: 'Continue',
    back: 'Back',
    get_started: 'Get Started',
    setup_complete: 'Setup Complete!',
    welcome_message: 'Welcome to your personalized banking experience.',
    proceed_to_dashboard: 'Go to Dashboard'
  },
  pcm: {
    welcome_title: 'Welcome to 4All Banking',
    language_subtitle: 'Choose how you wan talk and read — we go use am everywhere.',
    interaction_title: 'How you wan dey use am?',
    interaction_subtitle: 'Choose how you wan dey use the app',
    voice_option: 'Voice First',
    voice_description: 'We go dey talk to you — you fit change am to text anytime.',
    text_option: 'Text Only',
    text_description: 'You choose text only. You fit change am later for Settings.',
    continue: 'Continue',
    back: 'Back',
    get_started: 'Start',
    setup_complete: 'Setup Don Finish!',
    welcome_message: 'Welcome to your own banking experience.',
    proceed_to_dashboard: 'Go to Dashboard'
  }
};

interface OnboardingWizardProps {
  onComplete?: () => void;
  skipWelcome?: boolean;
  initialLanguage?: string;
  skipLanguageSelection?: boolean;
}

export function OnboardingWizard({ onComplete, skipWelcome = false, initialLanguage, skipLanguageSelection = false }: OnboardingWizardProps = {}) {
  const router = useRouter();
  const { speak, isListening, startListening, stopListening, transcript, clearTranscript } = useVoice();
  const adaptiveClasses = useAdaptiveClasses();
  const { updateProfile } = useProfileStore();

  const {
    progress,
    startOnboarding,
    updateStep,
    nextStep,
    updateLanguage,
    updateInteractionMode,
    updateDisabilities,
    updateCognitiveScore,
    updateAccessibilityToggles,
    completeOnboarding,
    clearProgress
  } = useOnboardingProgress();

  // Component state
  const [showDisabilityModal, setShowDisabilityModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showTogglesModal, setShowTogglesModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage || 'en');

  // Get current step name for UI - defined early to avoid hoisting issues
  const getCurrentStepName = () => {
    if (!progress) return skipLanguageSelection ? 'interaction_mode' : 'language';
    const stepId = progress.steps[progress.currentStep]?.id || 'language';

    // If we're skipping language selection and we're on the language step, 
    // treat it as interaction_mode step
    if (skipLanguageSelection && stepId === 'language') {
      return 'interaction_mode';
    }

    return stepId;
  };

  const t = translations[selectedLanguage as keyof typeof translations] || translations.en;

  // Always start fresh - clear any existing progress and start from beginning
  useEffect(() => {
    if (skipLanguageSelection && initialLanguage) {
      // Clear any existing progress and start fresh
      clearProgress();
      // Start onboarding with the provided language
      startOnboarding(initialLanguage);
      setTimeout(() => {
        // Mark language step as completed and move to interaction mode
        updateStep('language', { language: initialLanguage }, true);
        nextStep(); // Move to interaction_mode step (step 1)
        setTimeout(() => {
          speak('How would you like to interact with the banking app? You can choose voice-first interaction or text-only.');
        }, 100);
      }, 500);
    } else if (!skipLanguageSelection) {
      // Clear any existing progress and start fresh for language selection
      clearProgress();
      startOnboarding(selectedLanguage);
    }
  }, [skipLanguageSelection, initialLanguage, selectedLanguage, clearProgress, startOnboarding, updateStep, nextStep, speak]);

  // Voice command processing for all steps
  useEffect(() => {
    if (transcript && transcript.trim()) {
      const command = transcript.toLowerCase();
      const currentStepName = getCurrentStepName();

      console.log('Voice command debug:', {
        transcript: transcript,
        command: command,
        currentStep: currentStepName,
        isInteractionMode: currentStepName === 'interaction_mode'
      });

      // Language selection commands (if not skipped)
      if (currentStepName === 'language' && !skipLanguageSelection) {
        const languageCommands = [
          { patterns: ['english', 'select english', 'choose english'], code: 'en' },
          { patterns: ['pidgin', 'nigerian pidgin', 'select pidgin', 'choose pidgin'], code: 'pcm' },
          { patterns: ['yoruba', 'yorùbá', 'select yoruba', 'choose yoruba'], code: 'yo' },
          { patterns: ['igbo', 'select igbo', 'choose igbo'], code: 'ig' },
          { patterns: ['hausa', 'select hausa', 'choose hausa'], code: 'ha' }
        ];

        for (const langCommand of languageCommands) {
          if (langCommand.patterns.some(pattern => command.includes(pattern))) {
            handleLanguageSelect(langCommand.code);
            clearTranscript();
            return;
          }
        }

        if ((command.includes('continue') || command.includes('next') || command.includes('proceed')) && selectedLanguage) {
          handleContinueFromLanguage();
          clearTranscript();
          return;
        }
      }

      if (command.includes('voice') || command.includes('voice first') || command.includes('speak') || command.includes('talk')) {
        console.log('Voice command matched, calling handleInteractionModeSelect("voice")');
        handleInteractionModeSelect('voice');
        clearTranscript();
        return;
      }

      if (command.includes('text') || command.includes('text only') || command.includes('typing') || command.includes('keyboard')) {
        console.log('Text command matched, calling handleInteractionModeSelect("text")');
        handleInteractionModeSelect('text');
        clearTranscript();
        return;
      }


      // Interaction mode selection commands
      if (currentStepName === 'disability_disclosure') {
        console.log('Processing interaction mode command:', command);

        if (command.includes('voice') || command.includes('voice first') || command.includes('speak') || command.includes('talk')) {
          console.log('Voice command matched, calling handleInteractionModeSelect("voice")');
          handleInteractionModeSelect('voice');
          clearTranscript();
          return;
        }

        if (command.includes('text') || command.includes('text only') || command.includes('typing') || command.includes('keyboard')) {
          console.log('Text command matched, calling handleInteractionModeSelect("text")');
          handleInteractionModeSelect('text');
          clearTranscript();
          return;
        }

        // Help command for interaction mode
        if (command.includes('help') || command.includes('what can i say')) {
          speak('You can say: Voice first to use voice commands, or Text only to use text input. You can also say Voice or Text for short.');
          clearTranscript();
          return;
        }

        // If command not understood
        speak('I didn\'t understand. Say Voice first for voice interaction, or Text only for text interaction.');
        clearTranscript();
        return;
      }

      // Universal help command
      if (command.includes('help') || command.includes('what can i say')) {
        if (currentStepName === 'language') {
          speak('You can say: English, Pidgin, Yoruba, Igbo, or Hausa to select a language. Or say Continue if you\'re ready to proceed.');
        } else if (currentStepName === 'interaction_mode') {
          speak('You can say: Voice first to use voice commands, or Text only to use text input.');
        } else {
          speak('Say Help for available commands, or use Tab and Enter to navigate through options.');
        }
        clearTranscript();
        return;
      }

      // If no command matched
      if (currentStepName === 'language') {
        speak('I didn\'t understand. Try saying the name of a language like English, Pidgin, Yoruba, Igbo, or Hausa.');
      } else if (currentStepName === 'interaction_mode') {
        speak('I didn\'t understand. Say Voice first for voice interaction, or Text only for text interaction.');
      } else {
        speak('I didn\'t understand that command. Say Help for available options.');
      }
      clearTranscript();
    }
  }, [transcript, selectedLanguage, isListening, skipLanguageSelection]);

  // Auto-announce options when step loads and auto-start listening
  useEffect(() => {
    const currentStepName = getCurrentStepName();

    if (currentStepName === 'language' && !skipWelcome && !skipLanguageSelection) {
      setTimeout(() => {
        speak('Welcome to 4All Banking! Please select your language. You can click on a language or say its name. Available languages are: English, Pidgin, Yoruba, Igbo, and Hausa.');
        setTimeout(() => {
          startListening();
        }, 3000);
      }, 1000);
    }

    if (currentStepName === 'interaction_mode' || (currentStepName === 'language' && skipLanguageSelection)) {
      setTimeout(() => {
        // Auto-start listening for interaction mode
        startListening();
      }, 1000);
    }
  }, [getCurrentStepName(), speak, skipWelcome, startListening, skipLanguageSelection]);

  // Debug voice support
  useEffect(() => {
    console.log('Voice debugging:', {
      isListening,
      transcript,
      currentStep: getCurrentStepName(),
      speechRecognitionSupported: typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    });
  }, [isListening, transcript, getCurrentStepName()]);


  // Language selection
  const handleLanguageSelect = (langCode: string) => {
    setSelectedLanguage(langCode);
    if (!progress) {
      startOnboarding(langCode);
    } else {
      updateLanguage(langCode);
    }
    updateStep('language', { language: langCode });
    speak(`Language set to ${languages.find(l => l.code === langCode)?.name}. Say continue to proceed, or choose a different language.`);
  };

  // Continue from language selection
  const handleContinueFromLanguage = () => {
    if (!selectedLanguage) {
      speak('Please select a language first.');
      return;
    }

    nextStep();
    speak('Moving to interaction preferences.');
  };

  // Toggle voice listening for language selection
  const toggleLanguageListening = () => {
    console.log('Toggle voice listening clicked. Currently listening:', isListening);

    if (isListening) {
      stopListening();
      speak('Voice recognition stopped.');
    } else {
      console.log('Starting voice recognition...');
      startListening();
      speak('Listening... Say the name of your preferred language.');
    }
  };

  // Check if speech recognition is supported
  const isSpeechSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Interaction mode selection
  const handleInteractionModeSelect = (mode: 'voice' | 'text') => {
    console.log('handleInteractionModeSelect called with mode:', mode);
    console.log('Current progress state before interaction selection:', {
      currentStep: progress?.currentStep,
      stepId: progress?.steps[progress?.currentStep]?.id,
      totalSteps: progress?.steps.length
    });

    updateInteractionMode(mode);
    updateStep('interaction_mode', { interactionMode: mode });

    if (mode === 'voice') {
      speak('Voice interaction enabled. You can always switch to text later.');
    } else {
      speak('Text interaction selected. You can change this in settings later.');
    }

    // Move to disability disclosure
    setTimeout(() => {
      console.log('About to advance to disability disclosure step');
      console.log('Progress before nextStep:', {
        currentStep: progress?.currentStep,
        stepId: progress?.steps[progress?.currentStep]?.id
      });

      setShowDisabilityModal(true);
      // Only call nextStep once - this will move to the disability_disclosure step
      nextStep();
    }, 1500);
  };

  // Disability disclosure
  const handleDisabilityDisclosure = (disabilities: DisabilityType[], skipAssistance: boolean) => {
    setShowDisabilityModal(false);
    updateDisabilities(disabilities);
    updateStep('disability_disclosure', { disabilities, skipAssistance });

    // If cognitive difficulty is selected or we need a quiz, show it
    const needsQuiz = disabilities.includes('cognitive') || (!skipAssistance && disabilities.length > 0);

    if (needsQuiz && !skipAssistance) {
      setTimeout(() => {
        setShowQuizModal(true);
        nextStep();
      }, 500);
    } else {
      // Skip quiz, move to toggles
      setTimeout(() => {
        setShowTogglesModal(true);
        nextStep();
        nextStep(); // Skip quiz step
      }, 500);
    }
  };

  // Quiz completion
  const handleQuizComplete = (score: number, responses: any[], recommendations: string[]) => {
    setShowQuizModal(false);
    updateCognitiveScore(score);
    updateStep('cognitive_quiz', { score, responses, recommendations });

    // Move to accessibility toggles
    setTimeout(() => {
      setShowTogglesModal(true);
      nextStep();
    }, 500);
  };

  // Accessibility toggles
  const handleTogglesComplete = (toggles: Record<string, boolean>) => {
    setShowTogglesModal(false);
    updateAccessibilityToggles(toggles);
    updateStep('accessibility_toggles', { toggles });

    // Complete onboarding
    handleCompleteOnboarding();
  };

  // Complete onboarding
  const handleCompleteOnboarding = async () => {
    try {
      const finalProfile = await completeOnboarding();

      if (finalProfile) {
        // Save to profile store
        updateProfile(finalProfile as Partial<UserProfile>);

        speak('Setup complete! Welcome to your personalized banking experience.');

        // Call the parent's onComplete callback if provided
        if (onComplete) {
          onComplete();
        } else {
          // Navigate to dashboard (fallback behavior)
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      speak('Setup completed with basic settings. You can customize more in Settings.');
      if (onComplete) {
        onComplete();
      } else {
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    }
  };

  // Function moved above to avoid hoisting issues

  const currentStep = getCurrentStepName();
  const stepProgress = progress ? ((progress.currentStep + 1) / progress.steps.length) * 100 : 0;

  // Debug current step
  useEffect(() => {
    console.log('Current step debug:', {
      currentStep,
      progress: progress?.currentStep,
      stepId: progress?.steps[progress?.currentStep]?.id,
      skipLanguageSelection
    });
  }, [currentStep, progress, skipLanguageSelection]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white flex items-center justify-center p-4">

      {/* Disability Disclosure Modal */}
      <DisabilityDisclosureModal
        isOpen={showDisabilityModal}
        onClose={() => setShowDisabilityModal(false)}
        onSubmit={handleDisabilityDisclosure}
        language={selectedLanguage}
      />

      {/* Neurodivergent Quiz Modal */}
      <NeurodivergentQuiz
        isOpen={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        onComplete={handleQuizComplete}
        language={selectedLanguage}
      />

      {/* Accessibility Toggles Modal */}
      <AccessibilityToggles
        isOpen={showTogglesModal}
        onClose={() => setShowTogglesModal(false)}
        onComplete={handleTogglesComplete}
        disabilities={progress?.disabilities || []}
        language={selectedLanguage}
      />

      {/* Main Content */}
      <Card className="w-full max-w-2xl bg-white shadow-xl">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1"></div>
              <h1 className={cn(adaptiveClasses.heading, "text-3xl font-bold text-primary")}>
                {t.welcome_title}
              </h1>
              <div className="flex-1 flex justify-end">
                <Button
                  onClick={toggleLanguageListening}
                  variant={isListening ? "default" : "outline"}
                  size="sm"
                  disabled={!isSpeechSupported}
                  className={cn(
                    "flex items-center gap-2",
                    isListening && "bg-red-500 hover:bg-red-600 text-white"
                  )}
                  aria-label={isListening ? 'Stop voice recognition' : 'Start voice recognition'}
                  title={isListening ? 'Stop voice recognition' : 'Start voice recognition'}
                >
                  <Mic className={cn(
                    "h-4 w-4",
                    isListening && "animate-pulse"
                  )} />
                  {isListening ? 'ON' : 'OFF'}
                </Button>
              </div>
            </div>

            {progress && (
              <div className="space-y-2">
                <Progress value={stepProgress} className="w-full h-3" />
                <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
                  Step {progress.currentStep + 1} of {progress.steps.length}
                </p>
              </div>
            )}
          </div>

          {/* Language Selection Step */}
          {currentStep === 'language' && !skipLanguageSelection && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <Globe className="h-12 w-12 text-primary mx-auto" />
                <p className={cn(adaptiveClasses.text, "text-muted-gray")}>
                  {t.language_subtitle}
                </p>

                {/* Voice Control */}
                <div className="space-y-3">
                  <div className="flex justify-center gap-3">
                    <Button
                      onClick={toggleLanguageListening}
                      variant={isListening ? "default" : "outline"}
                      size="lg"
                      disabled={!isSpeechSupported}
                      className={cn(
                        adaptiveClasses.button,
                        "flex items-center gap-2",
                        isListening && "bg-red-500 hover:bg-red-600 text-white"
                      )}
                    >
                      <Mic className={cn(
                        "h-5 w-5",
                        isListening && "animate-pulse"
                      )} />
                      {isListening ? 'Listening...' : 'Use Voice'}
                    </Button>
                  </div>

                  {/* Speech Support Status */}
                  {!isSpeechSupported && (
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <p className={cn(adaptiveClasses.text, "text-sm text-yellow-800")}>
                        ⚠️ Voice recognition not supported in this browser. Please use Chrome, Safari, or Edge.
                      </p>
                    </div>
                  )}

                  {/* Debug info */}
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className={cn(adaptiveClasses.text, "text-xs text-gray-600")}>
                      Debug: Speech={isSpeechSupported ? '✓' : '✗'} | Listening={isListening ? '✓' : '✗'} | Step={getCurrentStepName()}
                    </p>
                  </div>
                </div>

                {(isListening || transcript) && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    {/* <p className={cn(adaptiveClasses.text, "text-sm text-blue-800")}>
                      🎤 Say: "English", "Pidgin", "Yoruba", "Igbo", or "Hausa"
                    </p> */}
                    {transcript && (
                      <p className={cn(adaptiveClasses.text, "text-sm text-blue-600 mt-1")}>
                        You said: "{transcript}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid gap-3">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageSelect(language.code)}
                    className={cn(
                      "p-4 rounded-lg border-2 text-left transition-all",
                      adaptiveClasses.button,
                      selectedLanguage === language.code
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{language.icon}</span>
                      <div className="flex-1">
                        <div className={cn(adaptiveClasses.text, "font-medium text-text")}>
                          {language.name}
                        </div>
                        <div className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
                          {language.nativeName}
                        </div>
                      </div>
                      {selectedLanguage === language.code && (
                        <CheckCircle className="h-6 w-6 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {selectedLanguage && (
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={handleContinueFromLanguage}
                    className={adaptiveClasses.button}
                    size="lg"
                  >
                    {t.continue}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}

              {/* Voice Help */}
              <div className="text-center">
                <p className={cn(adaptiveClasses.text, "text-xs text-muted-gray")}>
                  💡 You can click on a language or use voice commands
                </p>
              </div>
            </div>
          )}

          {/* Interaction Mode Selection Step - Show if current step is interaction_mode OR if we skipped language and step is language */}
          {(currentStep === 'disability_disclosure' || currentStep === 'interaction_mode' || (currentStep === 'language' && skipLanguageSelection)) && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className={cn(adaptiveClasses.heading, "text-xl font-semibold text-text")}>
                  {t.interaction_title}
                </h2>
                <p className={cn(adaptiveClasses.text, "text-muted-gray")}>
                  {t.interaction_subtitle}
                </p>
              </div>

              {/* Voice Control Status */}
              {transcript && isListening && (
                <p className={cn(adaptiveClasses.text, "text-sm text-blue-600 mt-1")} aria-live="assertive">
                  <span className="sr-only">Voice input detected:</span>You said: "{transcript}"
                </p>
              )}

              <div className="space-y-4">
                {/* Voice Option */}
                <button
                  onClick={() => handleInteractionModeSelect('voice')}
                  className={cn(
                    "w-full p-6 rounded-lg border-2 text-left transition-all",
                    adaptiveClasses.button,
                    'border-gray-200 hover:border-primary hover:bg-primary/5'
                  )}
                >
                  <div className="flex items-start gap-4">
                    <Mic className="h-8 w-8 text-primary shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className={cn(adaptiveClasses.text, "text-lg font-medium text-text")}>
                        {t.voice_option}
                      </h3>
                      {/* <p className={cn(adaptiveClasses.text, "text-muted-gray")}>
                        {t.voice_description}
                      </p> */}
                    </div>
                  </div>
                </button>

                {/* Text Option */}
                <button
                  onClick={() => handleInteractionModeSelect('text')}
                  className={cn(
                    "w-full p-6 rounded-lg border-2 text-left transition-all",
                    adaptiveClasses.button,
                    'border-gray-200 hover:border-primary hover:bg-primary/5'
                  )}
                >
                  <div className="flex items-start gap-4">
                    <MessageSquare className="h-8 w-8 text-primary shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className={cn(adaptiveClasses.text, "text-lg font-medium text-text")}>
                        {t.text_option}
                      </h3>
                      {/* <p className={cn(adaptiveClasses.text, "text-muted-gray")}>
                        {t.text_description}
                      </p> */}
                    </div>
                  </div>
                </button>
              </div>

              {/* Voice Help for Interaction Mode */}
              {/* <div className="text-center">
                <p className={cn(adaptiveClasses.text, "text-xs text-muted-gray")}>
                  💡 You can click on an option or say "Voice first" or "Text only"
                </p>
              </div> */}
            </div>
          )}

          {/* Completion Step */}
          {currentStep === 'summary' && (
            <div className="text-center space-y-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className={cn(adaptiveClasses.heading, "text-2xl font-semibold text-text")}>
                {t.setup_complete}
              </h2>
              <p className={cn(adaptiveClasses.text, "text-muted-gray")}>
                {t.welcome_message}
              </p>

              <Button
                onClick={handleCompleteOnboarding}
                size="lg"
                className={cn(adaptiveClasses.button, "w-full max-w-sm")}
              >
                {t.proceed_to_dashboard}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}