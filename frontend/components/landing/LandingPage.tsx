'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { useVoice } from '../../hooks/useVoice';
import { useProfileStore } from '../../hooks/useProfile';
import { useAdaptiveUI, useAdaptiveClasses } from '../../hooks/useAdaptiveUI';
import { useTranslation } from '../../hooks/useTranslation';
import { ZivaAssistant } from '../ziva/ZivaAssistant';
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
  
  const router = useRouter();
  const { speak, startListening, isSupported: voiceSupported } = useVoice();
  const { setLanguage, setInteractionMode } = useProfileStore();
  const adaptiveUI = useAdaptiveUI();
  const adaptiveClasses = useAdaptiveClasses();
  const { t } = useTranslation();

  // Request microphone permission on mount
  useEffect(() => {
    if (voiceSupported && !hasRequestedMicPermission) {
      navigator.mediaDevices?.getUserMedia({ audio: true })
        .then(() => {
          setHasRequestedMicPermission(true);
          // Speak welcome message in detected browser language
          const browserLang = navigator.language.startsWith('en') ? 'en' : 'en';
          const welcomeMessage = getWelcomeMessage(browserLang);
          setTimeout(() => speak(welcomeMessage), 1000);
        })
        .catch(() => {
          setHasRequestedMicPermission(true);
        });
    }
  }, [voiceSupported, hasRequestedMicPermission, speak]);

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
    
    // Speak confirmation
    const confirmations: Record<string, string> = {
      en: "Great! You've selected English. Let's get started with your banking experience.",
      pcm: "Nice one! You don select Pidgin. Make we start your banking experience.",
      yo: "Ó dáa! O ti yan Yorùbá. Jẹ́ ká bẹ̀rẹ̀ sí iṣẹ́ banking rẹ.",
      ig: "Ọ dị mma! Ị ahọrọla Igbo. Ka anyị malite ahụmịhe ego gị.",
      ha: "Da kyau! Kun zaɓi Hausa. Bari mu fara aikin banki ku.",
    };
    
    setTimeout(() => speak(confirmations[langCode] || confirmations.en), 500);
  };

  const handleStartExperience = () => {
    setInteractionMode('voice');
    router.push('/onboarding');
  };

  const handleDemo = () => {
    setInteractionMode('voice');
    router.push('/dashboard');
  };

  const content = getContent(selectedLanguage);

  if (showLanguageSelection) {
    return (
      <div className="min-h-screen bg-bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-4xl text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-red mb-4">
              4All
            </h1>
            <p className="text-lg md:text-xl text-text mb-2">
              Welcome to Inclusive Banking
            </p>
            <p className="text-sm text-muted-gray">
              Choose your preferred language to continue
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
                aria-label={`Select ${lang.name} language`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleLanguageSelect(lang.code);
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
                    <Badge className="mt-2 bg-primary-red text-white">
                      Selected
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="flex flex-col items-center gap-4">
            {voiceSupported && (
              <div className="flex items-center gap-2 text-sm text-muted-gray">
                <Mic className="w-4 h-4" />
                <span>Voice commands available - just say your language preference</span>
              </div>
            )}
            
            <Button
              onClick={() => setShowLanguageSelection(false)}
              className={cn(
                adaptiveClasses.button,
                "bg-primary-red text-white hover:bg-primary-red/90"
              )}
            >
              Continue with {languages.find(l => l.code === selectedLanguage)?.name}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 text-center">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-primary-red mb-4">
              4All
            </h1>
            <h2 className={cn(adaptiveClasses.heading, "text-3xl md:text-5xl text-text mb-6")}>
              {content.title}
            </h2>
            <p className={cn(adaptiveClasses.text, "text-xl text-muted-gray mb-4 max-w-3xl mx-auto")}>
              {content.subtitle}
            </p>
            <p className={cn(adaptiveClasses.text, "text-lg text-text max-w-4xl mx-auto mb-8")}>
              {content.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              onClick={handleStartExperience}
              className={cn(
                adaptiveClasses.button,
                "bg-primary-red text-white hover:bg-primary-red/90 text-lg px-8 py-3"
              )}
              aria-label="Start adaptive banking experience"
            >
              <Mic className="w-5 h-5 mr-2" />
              {content.cta}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleDemo}
              className={cn(
                adaptiveClasses.button,
                "border-primary-red text-primary-red hover:bg-primary-red/10 text-lg px-8 py-3"
              )}
              aria-label="Try demo experience"
            >
              {content.demo}
            </Button>
          </div>

          {/* Language indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Globe className="w-4 h-4 text-muted-gray" />
            <span className="text-sm text-muted-gray">
              Currently in {languages.find(l => l.code === selectedLanguage)?.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLanguageSelection(true)}
              className="text-primary-red hover:text-primary-red/80"
            >
              Change
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className={cn(adaptiveClasses.heading, "text-3xl text-center text-text mb-12")}>
            Built for Everyone
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.features.map((feature: any, index: number) => (
              <Card key={index} className={cn(adaptiveClasses.card, "text-center hover:shadow-lg transition-shadow")}>
                <feature.icon className="w-12 h-12 text-primary-red mx-auto mb-4" />
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

      {/* Ziva Assistant */}
      <ZivaAssistant />
    </div>
  );
}