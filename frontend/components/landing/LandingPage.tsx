'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { useVoice } from '../../hooks/useVoice';
import { useProfileStore } from '../../hooks/useProfile';
import { useAdaptiveUI, useAdaptiveClasses } from '../../hooks/useAdaptiveUI';
import { useTranslation } from '../../hooks/useTranslation';
import { ZivaAssistant } from '../ziva/ZivaAssistant';
import { OnboardingWizard } from '../onboarding/OnboardingWizard';
import { Mic, Globe, Accessibility, Heart, Shield, Users } from 'lucide-react';
import { cn } from '../../lib/utils';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'pcm', name: 'Pidgin', nativeName: 'Pidgin English' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá' },
  { code: 'ig', name: 'Igbo', nativeName: 'Igbo' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa' },
];

export function LandingPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [showLanguageSelection, setShowLanguageSelection] = useState(true);
  const [hasRequestedMicPermission, setHasRequestedMicPermission] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);

  const router = useRouter();
  const { speak, startListening, stopListening, transcript, clearTranscript, isSupported: voiceSupported } = useVoice();
  const { setLanguage, setInteractionMode } = useProfileStore();
  const adaptiveUI = useAdaptiveUI();
  const adaptiveClasses = useAdaptiveClasses();
  const { t } = useTranslation();

  // Announcement helper
  const announceToScreenReader = (message: string) => {
    setAnnouncements(prev => [...prev, message]);
    setTimeout(() => {
      setAnnouncements(prev => prev.slice(1));
    }, 1000);
  };

  // Request microphone permission on mount
  useEffect(() => {
    if (voiceSupported && !hasRequestedMicPermission) {
      navigator.mediaDevices?.getUserMedia({ audio: true })
        .then(() => {
          setHasRequestedMicPermission(true);
          // Speak welcome message in detected browser language
          const browserLang = navigator.language.startsWith('en') ? 'en' : 'en';
          const welcomeMessage = getWelcomeMessage(browserLang);
          setTimeout(() => {
            speak(welcomeMessage);
            announceToScreenReader('Welcome to 4All Banking. Voice recognition is available. Use Tab to navigate or voice commands to interact.');
            // Auto-start listening after welcome message
            setTimeout(() => {
              startListening();
              setIsListening(true);
              announceToScreenReader('Voice recognition active. Say your preferred language.');
            }, 3000);
          }, 1000);
        })
        .catch(() => {
          setHasRequestedMicPermission(true);
          announceToScreenReader('Voice recognition not available. Use Tab and Enter to navigate the interface.');
        });
    } else if (!voiceSupported) {
      announceToScreenReader('Welcome to 4All Banking. Use Tab to navigate and Enter to select options.');
    }
  }, [voiceSupported, hasRequestedMicPermission, speak, startListening]);

  // Voice command processing
  useEffect(() => {
    if (transcript && transcript.trim()) {
      const command = transcript.toLowerCase();

      if (showLanguageSelection) {
        // Language voice commands
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
            setIsListening(false);
            if (stopListening) stopListening();
            return;
          }
        }

        // Continue command
        if ((command.includes('continue') || command.includes('next') || command.includes('start')) && selectedLanguage) {
          handleStartExperience();
          clearTranscript();
          setIsListening(false);
          if (stopListening) stopListening();
          return;
        }
      } else {
        // Main page voice commands
        if (command.includes('start') || command.includes('begin') || command.includes('get started')) {
          handleStartExperience();
          clearTranscript();
          setIsListening(false);
          if (stopListening) stopListening();
          return;
        }

        if (command.includes('demo') || command.includes('try demo')) {
          handleDemo();
          clearTranscript();
          setIsListening(false);
          if (stopListening) stopListening();
          return;
        }

        if (command.includes('change language') || command.includes('select language')) {
          setShowLanguageSelection(true);
          clearTranscript();
          speak('Language selection opened. Say English, Pidgin, Yoruba, Igbo, or Hausa.');
          return;
        }

        if (command.includes('features') || command.includes('tell me about features') || command.includes('what features')) {
          announceFeatures();
          clearTranscript();
          return;
        }

        if (command.includes('help') || command.includes('what can i say') || command.includes('commands')) {
          speak('You can say: Start to begin your onboarding, Demo to try the banking features, Features to hear about our capabilities, or Change language to switch languages. Say Help anytime for assistance.');
          clearTranscript();
          return;
        }
      }

      // Universal help command for language selection
      if (command.includes('help') || command.includes('what can i say')) {
        if (showLanguageSelection) {
          speak('You can say: English, Pidgin, Yoruba, Igbo, or Hausa to select a language. Or say Continue to start.');
          clearTranscript();
          return;
        }
      }

      // If command not understood
      if (showLanguageSelection) {
        speak('I didn\'t understand. Say Help to hear what you can say, or choose a language: English, Pidgin, Yoruba, Igbo, or Hausa.');
      } else {
        speak('I didn\'t understand. Say Help for available commands, or try: Start, Demo, Features, or Change language.');
      }
      clearTranscript();
    }
  }, [transcript, selectedLanguage, showLanguageSelection, clearTranscript, stopListening]);

  // Toggle voice listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
      setIsListening(false);
      speak('Voice recognition stopped.');
      announceToScreenReader('Voice recognition stopped. Use Tab to navigate options.');
    } else {
      startListening();
      setIsListening(true);
      if (showLanguageSelection) {
        speak('Listening for language selection. Say English, Pidgin, Yoruba, Igbo, or Hausa.');
        announceToScreenReader('Voice recognition active. Say your preferred language or use Tab and Enter to select.');
      } else {
        speak('Voice recognition active. Say Start, Demo, Features, or Change language.');
        announceToScreenReader('Voice recognition active. Available commands: Start, Demo, Features, Change language.');
      }
    }
  }, [isListening, stopListening, startListening, speak, announceToScreenReader, showLanguageSelection]);

  // Auto-start voice recognition for main page
  useEffect(() => {
    if (!showLanguageSelection && voiceSupported && hasRequestedMicPermission && !isListening) {
      setTimeout(() => {
        startListening();
        setIsListening(true);
        announceToScreenReader('Voice recognition active. Say Start, Demo, Features, or Change language.');
      }, 1000);
    }
  }, [showLanguageSelection, voiceSupported, hasRequestedMicPermission, startListening, isListening, announceToScreenReader]);

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isListening) {
        toggleListening();
      }
      if (e.key === 'h' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (showLanguageSelection) {
          speak('You can say: English, Pidgin, Yoruba, Igbo, or Hausa to select a language. Or say Continue to start.');
        } else {
          speak('You can say: Start to begin, Demo to try it out, Change language, or Features to hear about our features.');
        }
      }
      if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        toggleListening();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isListening, showLanguageSelection, toggleListening, speak]);

  // Announce features function
  const announceFeatures = () => {
    const featureList = content.features.map((f: any) => f.title).join(', ');
    speak(`Our main features are: ${featureList}. Say Start to begin your adaptive banking experience, or Demo to try it out.`);
    announceToScreenReader('Features announced via voice. Use Tab to navigate through feature cards for more details.');
  };

  // This function is now defined above before being used

  const getWelcomeMessage = (lang: string) => {
    const messages: Record<string, string> = {
      en: "Welcome to 4All Banking! Which language would you like to use? You can say English, Pidgin, Yoruba, Igbo, or Hausa.",
      pcm: "Welcome to 4All Banking! Which language you wan use? You fit talk English, Pidgin, Yoruba, Igbo, or Hausa.",
    };
    return messages[lang] || messages.en;
  };

  const getContent = (lang: string) => {
    const content: Record<string, any> = {
      en: {
        title: "Banking for Everyone",
        subtitle: "Voice-first, accessible banking designed for every Nigerian",
        description: "Experience banking that adapts to your needs with voice commands, multiple languages, and accessibility features built for inclusion.",
        cta: "Start Your Adaptive Experience",
        demo: "Try Demo",
        features: [
          { icon: Mic, title: "Voice-First Banking", desc: "Bank with your voice in your preferred language" },
          { icon: Accessibility, title: "Built for Accessibility", desc: "Features designed for visual, motor, and cognitive needs" },
          { icon: Globe, title: "Nigerian Languages", desc: "English, Pidgin, Yoruba, Igbo, and Hausa support" },
          { icon: Shield, title: "Secure & Inclusive", desc: "Bank-grade security with inclusive design" },
          { icon: Users, title: "SME Tools", desc: "Business features for small and medium enterprises" },
          { icon: Heart, title: "Designed with Care", desc: "Built with real user feedback and accessibility experts" },
        ]
      },
      pcm: {
        title: "Banking for Everybody",
        subtitle: "Voice-first banking wey dem design for every Nigerian",
        description: "Experience banking wey go adapt to your needs with voice commands, plenty languages, and accessibility features wey dem build for inclusion.",
        cta: "Start Your Adaptive Experience",
        demo: "Try Demo",
        features: [
          { icon: Mic, title: "Voice-First Banking", desc: "Use your voice make you bank for any language wey you like" },
          { icon: Accessibility, title: "Built for Accessibility", desc: "Features wey dem design for visual, motor, and cognitive needs" },
          { icon: Globe, title: "Nigerian Languages", desc: "English, Pidgin, Yoruba, Igbo, and Hausa support" },
          { icon: Shield, title: "Secure & Inclusive", desc: "Bank-grade security with inclusive design" },
          { icon: Users, title: "SME Tools", desc: "Business features for small and medium enterprises" },
          { icon: Heart, title: "Designed with Care", desc: "Dem build am with real user feedback and accessibility experts" },
        ]
      }
    };
    return content[lang] || content.en;
  };

  const handleLanguageSelect = (langCode: string) => {
    setSelectedLanguage(langCode);
    setLanguage(langCode as any);
    setShowLanguageSelection(false);

    const langName = languages.find(l => l.code === langCode)?.name || 'English';
    announceToScreenReader(`Language changed to ${langName}. Main page is now loading.`);

    // Speak confirmation
    const confirmations: Record<string, string> = {
      en: "Great! You've selected English. Let's get started with your banking experience.",
      pcm: "Nice one! You don select Pidgin. Make we start your banking experience.",
      yo: "Ó dáa! O ti yan Yorùbá. Jẹ́ ká bẹ̀rẹ̀ sí iṣẹ́ banking rẹ.",
      ig: "Ọ dị mma! Ị ahọrọla Igbo. Ka anyị malite ahụmịhe ego gị.",
      ha: "Da kyau! Kun zaɓi Hausa. Bari mu fara aikin banki ku.",
    };

    setTimeout(() => {
      speak(confirmations[langCode] || confirmations.en);
      // Announce page structure for screen readers
      setTimeout(() => {
        announceToScreenReader('Main banking page loaded. Navigation available: Start your experience, Try demo, or change language. Voice commands: Say Start, Demo, Features, or Change language.');
      }, 2000);
    }, 500);
  };

  const handleStartExperience = () => {
    announceToScreenReader('Starting personalized banking onboarding experience.');
    speak('Starting your personalized onboarding. This will help us customize your banking experience.');
    setInteractionMode('voice');

    // Show onboarding wizard directly on landing page
    setTimeout(() => {
      setShowOnboardingWizard(true);
    }, 1500); // Give time for the narration to finish
  };

  const handleDemo = () => {
    announceToScreenReader('Starting demo experience with sample data.');
    speak('Starting demo experience. You can explore features without affecting real data.');
    setInteractionMode('voice');
    setTimeout(() => router.push('/dashboard'), 1000);
  };

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    setShowOnboardingWizard(false);
    announceToScreenReader('Onboarding completed successfully. Redirecting to your personalized dashboard.');
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };

  // Handle onboarding close/cancel
  const handleOnboardingClose = () => {
    setShowOnboardingWizard(false);
    announceToScreenReader('Onboarding cancelled. You can start it again anytime.');
  };

  const content = getContent(selectedLanguage);

  if (showLanguageSelection) {
    return (
      <>
        {/* Skip Links */}
        <nav className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50" role="navigation" aria-label="Skip navigation">
          <Button
            className="bg-primary-red text-white"
            onClick={() => document.getElementById('language-options')?.focus()}
            tabIndex={1}
          >
            Skip to language selection
          </Button>
        </nav>

        <div className="min-h-screen bg-bg-white flex items-center justify-center p-4" role="main" aria-label="Language selection page">
          <div className="w-full max-w-4xl text-center">
            <div className="mb-8">
              <h1 className="text-4xl md:text-6xl font-bold text-primary-red mb-4" aria-label="4All Banking Application">
                4All
              </h1>
              <p className="text-lg md:text-xl text-text mb-2" role="banner">
                Welcome to Inclusive Banking
              </p>
              <p className="text-sm text-muted-gray" aria-describedby="language-instruction">
                Choose your preferred language to continue
              </p>
            </div>

            {/* Voice Interface */}
            <section className="mb-6 space-y-3" aria-labelledby="voice-controls" role="region">
              <h2 id="voice-controls" className="sr-only">Voice Control Interface</h2>
              <div className="flex justify-center">
                <Button
                  onClick={toggleListening}
                  variant={isListening ? "default" : "outline"}
                  size="lg"
                  disabled={!voiceSupported}
                  className={cn(
                    "flex items-center gap-2",
                    isListening && "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                  )}
                  aria-label={isListening ? 'Stop voice recognition' : 'Start voice recognition for language selection'}
                  aria-describedby="voice-status"
                  aria-pressed={isListening}
                >
                  <Mic className="h-5 w-5" aria-hidden="true" />
                  {isListening ? 'Listening...' : 'Use Voice Commands'}
                </Button>
              </div>

              {isListening && (
                <div className="bg-blue-50 rounded-lg p-3 max-w-md mx-auto" role="status" aria-live="polite" id="voice-status">
                  {/* <p className="text-sm text-blue-800 text-center">
                    <span className="sr-only">Microphone active.</span>🎤 Say: "English", "Pidgin", "Yoruba", "Igbo", or "Hausa"
                  </p> */}
                  {transcript && (
                    <p className="text-sm text-blue-600 mt-1 text-center" aria-live="assertive">
                      <span className="sr-only">Voice input detected:</span>You said: "{transcript}"
                    </p>
                  )}
                  <p className="text-xs text-blue-700 mt-2 text-center">
                    Or press Escape to stop listening, Tab to navigate manually
                  </p>
                </div>
              )}

              <p className="text-xs text-muted-gray text-center">
                Voice commands available - just say your language preference
              </p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8" role="group" aria-labelledby="language-options">
              <h2 id="language-options" className="sr-only" tabIndex={-1}>Available Languages</h2>
              {languages.map((lang) => (
                <Card
                  key={lang.code}
                  className={cn(
                    adaptiveClasses.card,
                    "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105",
                    selectedLanguage === lang.code && "ring-2 ring-primary-red bg-primary-red/5"
                  )}
                  onClick={() => handleLanguageSelect(lang.code)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${lang.name} language. ${selectedLanguage === lang.code ? 'Currently selected.' : ''}`}
                  aria-pressed={selectedLanguage === lang.code}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleLanguageSelect(lang.code);
                    }
                    if (e.key === 'Escape' && isListening) {
                      toggleListening();
                    }
                  }}
                >
                  <div className="text-center">
                    <h3 className={cn(adaptiveClasses.heading, "text-primary-red mb-2")}>
                      {lang.nativeName}
                    </h3>
                    <p className={cn(adaptiveClasses.text, "text-muted-gray")}>
                      {lang.name}
                    </p>
                    {lang.code === selectedLanguage && (
                      <Badge className="mt-2 bg-primary-red text-white" aria-label="Currently selected language">
                        Selected
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </section>

            <div className="flex flex-col items-center gap-4" role="region" aria-label="Navigation options">
              {voiceSupported && (
                <div className="flex items-center gap-2 text-sm text-muted-gray" id="language-instruction">
                  <Mic className="w-4 h-4" aria-hidden="true" />
                  <span>Voice commands available - just say your language preference</span>
                </div>
              )}

              <Button
                onClick={() => setShowLanguageSelection(false)}
                className={cn(
                  adaptiveClasses.button,
                  "bg-primary-red text-white hover:bg-primary-red/90"
                )}
                aria-label={`Continue to main page with ${languages.find(l => l.code === selectedLanguage)?.name} language selected`}
              >
                Continue with {languages.find(l => l.code === selectedLanguage)?.name}
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Skip Links */}
      <nav className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50" role="navigation" aria-label="Skip navigation">
        <div className="flex gap-2">
          <Button
            className="bg-primary-red text-white"
            onClick={() => document.getElementById('main-heading')?.focus()}
            tabIndex={1}
          >
            Skip to main content
          </Button>
          <Button
            className="bg-primary-red text-white"
            onClick={() => document.getElementById('main-actions')?.focus()}
            tabIndex={2}
          >
            Skip to main actions
          </Button>
          <Button
            className="bg-primary-red text-white"
            onClick={() => document.getElementById('features-heading')?.focus()}
            tabIndex={3}
          >
            Skip to features
          </Button>
        </div>
      </nav>

      <div className="min-h-screen bg-bg-white">
        {/* Hero Section */}
        <main role="main">
          <section className="pt-20 pb-16 px-4 text-center" aria-labelledby="main-heading">
            <div className="max-w-6xl mx-auto">
              <header className="mb-8">
                <h1 id="main-heading" className="text-5xl md:text-7xl font-bold text-primary-red mb-4" aria-label="4All Banking Application">
                  4All
                </h1>
                <h2 className={cn(adaptiveClasses.heading, "text-3xl md:text-5xl text-text mb-6")}>
                  {content.title}
                </h2>
                <p className={cn(adaptiveClasses.text, "text-xl text-muted-gray mb-4 max-w-3xl mx-auto")} role="doc-subtitle">
                  {content.subtitle}
                </p>
                <p className={cn(adaptiveClasses.text, "text-lg text-text max-w-4xl mx-auto mb-8")} aria-describedby="main-description keyboard-help">
                  {content.description}
                </p>
              </header>

              {/* Voice Interface for Main Page */}
              <section className="mb-6 space-y-3" aria-labelledby="main-voice-controls" role="region">
                <h2 id="main-voice-controls" className="sr-only">Voice Control Interface</h2>
                <div className="flex justify-center">
                  <Button
                    onClick={toggleListening}
                    variant={isListening ? "default" : "outline"}
                    size="lg"
                    disabled={!voiceSupported}
                    className={cn(
                      "flex items-center gap-2",
                      isListening && "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                    )}
                    aria-label={isListening ? 'Stop voice recognition' : 'Start voice recognition for page navigation'}
                    aria-describedby="main-voice-status"
                    aria-pressed={isListening}
                  >
                    <Mic className="h-5 w-5" aria-hidden="true" />
                    {isListening ? 'Listening...' : 'Use Voice Commands'}
                  </Button>
                </div>

                {isListening && (
                  <div className="bg-blue-50 rounded-lg p-3 max-w-md mx-auto" role="status" aria-live="polite" id="main-voice-status">
                    {/* <p className="text-sm text-blue-800 text-center">
                      <span className="sr-only">Microphone active.</span>🎤 Say: "Start", "Demo", "Features", or "Change language"
                    </p> */}
                    {transcript && (
                      <p className="text-sm text-blue-600 mt-1 text-center" aria-live="assertive">
                        <span className="sr-only">Voice input detected:</span>You said: "{transcript}"
                      </p>
                    )}
                    <p className="text-xs text-blue-700 mt-2 text-center">
                      Or press Ctrl+V to stop/start, Escape to stop, Tab to navigate
                    </p>
                  </div>
                )}

                <p className="text-xs text-muted-gray text-center">
                  Voice commands: "Start", "Demo", "Features", "Change language", or press Ctrl+V
                </p>
              </section>

              <nav id="main-actions" className="flex flex-col sm:flex-row gap-4 justify-center mb-12" role="navigation" aria-label="Main actions" tabIndex={-1}>
                <Button
                  onClick={handleStartExperience}
                  className={cn(
                    adaptiveClasses.button,
                    "bg-primary-red text-white hover:bg-primary-red/90 text-lg px-8 py-3"
                  )}
                  aria-label="Start your personalized adaptive banking onboarding experience"
                  aria-describedby="cta-description"
                >
                  <Mic className="w-5 h-5 mr-2" aria-hidden="true" />
                  {content.cta}
                </Button>
                <span id="cta-description" className="sr-only">This will begin the onboarding process to customize banking features for your accessibility needs</span>

                <Button
                  variant="outline"
                  onClick={handleDemo}
                  className={cn(
                    adaptiveClasses.button,
                    "border-primary-red text-primary-red hover:bg-primary-red/10 text-lg px-8 py-3"
                  )}
                  aria-label="Try a demonstration of the banking features without creating an account"
                  aria-describedby="demo-description"
                >
                  {content.demo}
                </Button>
                <span id="demo-description" className="sr-only">Experience the banking interface with sample data</span>
              </nav>

              {/* Language indicator */}
              <aside className="flex items-center justify-center gap-2 mb-8" role="complementary" aria-label="Language settings">
                <Globe className="w-4 h-4 text-muted-gray" aria-hidden="true" />
                <span className="text-sm text-muted-gray" aria-live="polite">
                  Currently in {languages.find(l => l.code === selectedLanguage)?.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLanguageSelection(true)}
                  className="text-primary-red hover:text-primary-red/80"
                  aria-label="Change language from current selection"
                >
                  Change
                </Button>
              </aside>
            </div>
          </section>

          {/* Features Grid */}
          <section className="py-16 px-4 bg-white" aria-labelledby="features-heading" role="region">
            <div className="max-w-6xl mx-auto">
              <h3 id="features-heading" className={cn(adaptiveClasses.heading, "text-3xl text-center text-text mb-12")} tabIndex={-1}>
                Built for Everyone
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="list" aria-label="Banking features">
                {content.features.map((feature: any, index: number) => (
                  <Card key={index} className={cn(adaptiveClasses.card, "text-center hover:shadow-lg transition-shadow")} role="listitem">
                    <feature.icon className="w-12 h-12 text-primary-red mx-auto mb-4" aria-hidden="true" />
                    <h4 className={cn(adaptiveClasses.text, "font-semibold text-text mb-2")}>
                      {feature.title}
                    </h4>
                    <p className={cn(adaptiveClasses.text, "text-muted-gray")}>
                      {feature.desc}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Ziva Assistant */}
        {/* <ZivaAssistant /> */}

        {/* Screen Reader Announcements */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {announcements.map((announcement, index) => (
            <div key={index}>{announcement}</div>
          ))}
        </div>

        {/* Hidden help text */}
        <div className="sr-only">
          <p id="keyboard-help">
            Keyboard shortcuts: Press Ctrl+H or Cmd+H for voice commands help, Ctrl+V to toggle voice recognition, Escape to stop voice recognition, Tab to navigate, Enter or Space to activate buttons.
          </p>
          <p id="main-description">
            This is an accessible banking application with voice commands, multiple Nigerian languages, and adaptive features for users with disabilities. Voice commands available: Say Start to begin onboarding, Demo to try features, Features to hear about capabilities, or Change language to switch languages.
          </p>
        </div>

        {/* Enhanced Live Region for Voice Feedback */}
        <div aria-live="assertive" aria-atomic="false" className="sr-only">
          {isListening && !showLanguageSelection && (
            <div>Voice recognition active. Available commands: Start your experience, Try demo, Hear features, Change language, or say Help for assistance.</div>
          )}
        </div>
      </div>

      {/* Onboarding Wizard Overlay */}
      {showOnboardingWizard && (
        <div className="fixed inset-0 z-50 bg-white bg-opacity-50 flex items-center justify-center p-">
          <div className="w-full max-w-4xl relative">
            <button
              onClick={handleOnboardingClose}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 z-10"
              aria-label="Close onboarding"
            >
              ✕ Close
            </button>
            <OnboardingWizard
              onComplete={handleOnboardingComplete}
              skipWelcome={true}
              initialLanguage={selectedLanguage}
              skipLanguageSelection={true}
            />
          </div>
        </div>
      )}
    </>
  );
}