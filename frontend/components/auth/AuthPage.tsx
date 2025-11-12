'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useProfile, useLanguage, useInteractionMode, useProfileStore } from '@/hooks/useProfile';
import { useVoice } from '@/hooks/useVoice';
import { useAdaptiveUI } from '@/hooks/useAdaptiveUI';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Eye, EyeOff } from 'lucide-react';

interface AuthPageProps {
  mode?: 'login' | 'register';
}

export function AuthPage({ mode = 'login' }: AuthPageProps) {
  const [isListening, setIsListening] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    email: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const profile = useProfile();
  const { updateProfile } = useProfileStore();
  const language = useLanguage();
  const interactionMode = useInteractionMode();
  const { speak, startListening, stopListening, isSupported, transcript, clearTranscript } = useVoice();
  const { trackEvent, trackVoiceInteraction, trackTextInteraction, trackFriction } = useAnalytics();
  const { t } = useTranslation();
  const adaptiveUI = useAdaptiveUI();

  const isRegisterMode = mode === 'register';

  // Handle voice recognition results
  useEffect(() => {
    if (transcript && isListening) {
      // Find which field was being filled
      const currentField = Object.keys(formData).find(key => 
        formData[key as keyof typeof formData] === '' && isListening
      );
      
      if (currentField) {
        setFormData(prev => ({ ...prev, [currentField]: transcript }));
        setIsListening(false);
        speak(`Got it: ${transcript.substring(0, 20)}...`);
        trackVoiceInteraction('form_input', true);
        clearTranscript();
      }
    }
  }, [transcript, isListening, formData, speak, trackVoiceInteraction, clearTranscript]);

  useEffect(() => {
    // Welcome message based on mode
    if (profile?.isOnboardingComplete) {
      const welcomeMessage = isRegisterMode 
        ? getLocalizedText('registerWelcome')
        : getLocalizedText('loginWelcome');
      speak(welcomeMessage);
    }

    trackEvent('auth_page_view', { mode, language, interactionMode });
  }, [mode, language, interactionMode, speak, profile?.isOnboardingComplete, trackEvent]);

  const getLocalizedText = (key: string): string => {
    const texts: Record<string, Record<string, string>> = {
      registerWelcome: {
        en: "Welcome! Let's create your 4All account. I can help you fill out the form using voice commands.",
        pcm: "Welcome! Make we create your 4All account. I fit help you fill the form with voice command.",
        yo: "Káàbọ̀! Jẹ́ ká ṣẹ̀dá àkáǹtì 4All rẹ. Mo lè ràn ọ́ lọ́wọ́ láti fi ohùn kún fọ́ọ̀mù náà.",
        ig: "Nnọọ! Ka mee akaụntụ 4All gị. Enwere m ike inyere gị aka iji olu mejupụta fọm ahụ.",
        ha: "Maraba! Mu halicci asusun 4All naku. Zan iya taimaka maku cika fom din da murya."
      },
      loginWelcome: {
        en: "Welcome back! Please sign in to your 4All account. Say your phone number to get started.",
        pcm: "Welcome back! Abeg sign in to your 4All account. Talk your phone number make we start.",
        yo: "Káàbọ̀ padà! Jọ̀wọ́ wọlé sí àkáǹtì 4All rẹ. Sọ nọ́mbà fóònù rẹ kí a tó bẹ̀rẹ̀.",
        ig: "Nnọọ ọzọ! Biko banye na akaụntụ 4All gị. Kwuo nọmba ekwentị gị ka anyị malite.",
        ha: "Maraba da komowa! Da fatan za ku shiga asusun 4All naku. Faɗa lambar wayar ku mu fara."
      },
      phonePrompt: {
        en: "Please say your phone number",
        pcm: "Abeg talk your phone number",
        yo: "Jọ̀wọ́ sọ nọ́mbà fóònù rẹ",
        ig: "Biko kwuo nọmba ekwentị gị",
        ha: "Da fatan za ku faɗa lambar wayar ku"
      },
      passwordPrompt: {
        en: "Please say your password",
        pcm: "Abeg talk your password",
        yo: "Jọ̀wọ́ sọ ọ̀rọ̀ aṣínà rẹ",
        ig: "Biko kwuo okwuntụghe gị",
        ha: "Da fatan za ku faɗa kalmar sirrin ku"
      }
    };

    return texts[key]?.[language] || texts[key]?.en || '';
  };

  const handleVoiceInput = (field: string) => {
    if (!isSupported) {
      speak("Voice input is not supported on this device. Please use the text input.");
      trackFriction('auth_form', 'voice_not_supported');
      return;
    }

    setIsListening(true);
    speak(getLocalizedText(`${field}Prompt`));

    startListening();
    
    // Set timeout to stop listening after 10 seconds
    setTimeout(() => {
      if (isListening) {
        stopListening();
        setIsListening(false);
      }
    }, 10000);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(formData.phone.replace(/[^\d]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isRegisterMode) {
      // Additional fields for registration
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      
      // Confirm password
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      const errorMessage = `Please fix the following errors: ${Object.values(newErrors).join(', ')}`;
      speak(errorMessage);
      trackFriction('auth_form', 'validation_errors', { errors: newErrors });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      trackEvent(isRegisterMode ? 'registration_attempt' : 'login_attempt', {
        method: 'form',
        hasVoiceInput: isListening
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success
      const success = Math.random() > 0.1; // 90% success rate for demo
      
      if (success) {
        trackEvent(isRegisterMode ? 'registration_success' : 'login_success');
        speak(isRegisterMode ? "Account created successfully! Welcome to 4All!" : "Welcome back! Redirecting to your dashboard...");
        
        // Update profile with basic info if registering
        if (isRegisterMode) {
          updateProfile({
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            phone: formData.phone,
          });
        }
        
        router.push('/dashboard');
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      trackEvent(isRegisterMode ? 'registration_failed' : 'login_failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      speak("Authentication failed. Please check your details and try again.");
      setErrors({ submit: 'Authentication failed. Please try again.' });
      trackFriction('auth_form', 'authentication_failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' })); // Clear field error
    trackTextInteraction('form_input');
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4"
      style={{ 
        fontSize: adaptiveUI.fontSize.base,
        minHeight: `${adaptiveUI.touchTarget.min}px` 
      }}
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle 
            className="text-2xl font-bold"
            style={{ fontSize: adaptiveUI.fontSize.xl }}
          >
            4All Banking
          </CardTitle>
          <CardDescription style={{ fontSize: adaptiveUI.fontSize.sm }}>
            {isRegisterMode ? 'Create your account' : 'Welcome back'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode && (
              <>
                {/* First Name */}
                <div>
                  <label 
                    htmlFor="firstName" 
                    className="block text-sm font-medium mb-2"
                    style={{ fontSize: adaptiveUI.fontSize.sm }}
                  >
                    First Name
                  </label>
                  <div className="relative">
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={errors.firstName ? 'border-red-500' : ''}
                      style={{ 
                        minHeight: `${adaptiveUI.touchTarget.min}px`,
                        fontSize: adaptiveUI.fontSize.base 
                      }}
                      aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                      autoComplete="given-name"
                    />
                    {interactionMode === 'voice' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => handleVoiceInput('firstName')}
                        disabled={isListening}
                        aria-label="Voice input for first name"
                        style={{ minHeight: `${adaptiveUI.touchTarget.min}px` }}
                      >
                        {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                      </Button>
                    )}
                  </div>
                  {errors.firstName && (
                    <p id="firstName-error" className="text-red-500 text-sm mt-1" role="alert">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label 
                    htmlFor="lastName" 
                    className="block text-sm font-medium mb-2"
                    style={{ fontSize: adaptiveUI.fontSize.sm }}
                  >
                    Last Name
                  </label>
                  <div className="relative">
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={errors.lastName ? 'border-red-500' : ''}
                      style={{ 
                        minHeight: `${adaptiveUI.touchTarget.min}px`,
                        fontSize: adaptiveUI.fontSize.base 
                      }}
                      aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                      autoComplete="family-name"
                    />
                    {interactionMode === 'voice' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => handleVoiceInput('lastName')}
                        disabled={isListening}
                        aria-label="Voice input for last name"
                        style={{ minHeight: `${adaptiveUI.touchTarget.min}px` }}
                      >
                        {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                      </Button>
                    )}
                  </div>
                  {errors.lastName && (
                    <p id="lastName-error" className="text-red-500 text-sm mt-1" role="alert">
                      {errors.lastName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label 
                    htmlFor="email" 
                    className="block text-sm font-medium mb-2"
                    style={{ fontSize: adaptiveUI.fontSize.sm }}
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={errors.email ? 'border-red-500' : ''}
                      style={{ 
                        minHeight: `${adaptiveUI.touchTarget.min}px`,
                        fontSize: adaptiveUI.fontSize.base 
                      }}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      autoComplete="email"
                    />
                    {interactionMode === 'voice' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => handleVoiceInput('email')}
                        disabled={isListening}
                        aria-label="Voice input for email"
                        style={{ minHeight: `${adaptiveUI.touchTarget.min}px` }}
                      >
                        {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                      </Button>
                    )}
                  </div>
                  {errors.email && (
                    <p id="email-error" className="text-red-500 text-sm mt-1" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Phone Number */}
            <div>
              <label 
                htmlFor="phone" 
                className="block text-sm font-medium mb-2"
                style={{ fontSize: adaptiveUI.fontSize.sm }}
              >
                Phone Number
              </label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={errors.phone ? 'border-red-500' : ''}
                  style={{ 
                    minHeight: `${adaptiveUI.touchTarget.min}px`,
                    fontSize: adaptiveUI.fontSize.base 
                  }}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                  autoComplete="tel"
                />
                {interactionMode === 'voice' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => handleVoiceInput('phone')}
                    disabled={isListening}
                    aria-label="Voice input for phone number"
                    style={{ minHeight: `${adaptiveUI.touchTarget.min}px` }}
                  >
                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  </Button>
                )}
              </div>
              {errors.phone && (
                <p id="phone-error" className="text-red-500 text-sm mt-1" role="alert">
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium mb-2"
                style={{ fontSize: adaptiveUI.fontSize.sm }}
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={errors.password ? 'border-red-500' : ''}
                  style={{ 
                    minHeight: `${adaptiveUI.touchTarget.min}px`,
                    fontSize: adaptiveUI.fontSize.base 
                  }}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{ minHeight: `${adaptiveUI.touchTarget.min}px` }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                  {interactionMode === 'voice' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleVoiceInput('password')}
                      disabled={isListening}
                      aria-label="Voice input for password"
                      style={{ minHeight: `${adaptiveUI.touchTarget.min}px` }}
                    >
                      {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                    </Button>
                  )}
                </div>
              </div>
              {errors.password && (
                <p id="password-error" className="text-red-500 text-sm mt-1" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password for Registration */}
            {isRegisterMode && (
              <div>
                <label 
                  htmlFor="confirmPassword" 
                  className="block text-sm font-medium mb-2"
                  style={{ fontSize: adaptiveUI.fontSize.sm }}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                    style={{ 
                      minHeight: `${adaptiveUI.touchTarget.min}px`,
                      fontSize: adaptiveUI.fontSize.base 
                    }}
                    aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                    autoComplete="new-password"
                  />
                  {interactionMode === 'voice' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => handleVoiceInput('confirmPassword')}
                      disabled={isListening}
                      aria-label="Voice input for confirm password"
                      style={{ minHeight: `${adaptiveUI.touchTarget.min}px` }}
                    >
                      {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                    </Button>
                  )}
                </div>
                {errors.confirmPassword && (
                  <p id="confirmPassword-error" className="text-red-500 text-sm mt-1" role="alert">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <p className="text-red-500 text-sm text-center" role="alert">
                {errors.submit}
              </p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              style={{ 
                minHeight: `${adaptiveUI.touchTarget.min}px`,
                fontSize: adaptiveUI.fontSize.base 
              }}
            >
              {isLoading ? 'Processing...' : (isRegisterMode ? 'Create Account' : 'Sign In')}
            </Button>

            {/* Mode Toggle */}
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => router.push(isRegisterMode ? '/login' : '/register')}
                style={{ fontSize: adaptiveUI.fontSize.sm }}
              >
                {isRegisterMode ? 'Already have an account? Sign in' : "Don't have an account? Register"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}