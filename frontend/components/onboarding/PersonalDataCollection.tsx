'use client';

import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useVoice } from '../../hooks/useVoice';
import { useAdaptiveClasses } from '../../hooks/useAdaptiveUI';
import { useProfileStore } from '../../hooks/useProfile';
import { User, Mail, Phone, Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import Image from 'next/image';

interface PersonalDataCollectionProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; phone: string }) => void;
  language: string;
}

const translations = {
  en: {
    title: 'Complete Your Profile',
    subtitle: 'Help us personalize your banking experience with a few details.',
    disclaimer: 'Your information is encrypted and secure. We use this to customize your experience.',
    fields: {
      name: 'Full Name',
      namePlaceholder: 'Enter your full name',
      email: 'Email Address',
      emailPlaceholder: 'Enter your email address',
      phone: 'Phone Number',
      phonePlaceholder: 'Enter your phone number'
    },
    validation: {
      nameRequired: 'Please enter your full name',
      emailRequired: 'Please enter your email address',
      emailInvalid: 'Please enter a valid email address',
      phoneRequired: 'Please enter your phone number',
      phoneInvalid: 'Please enter a valid phone number'
    },
    continue: 'Complete Setup',
    back: 'Back',
    optional: '(Optional)',
    required: '*'
  },
  pcm: {
    title: 'Complete Your Profile',
    subtitle: 'Help us make your banking better with small details.',
    disclaimer: 'Your information dey safe. We use am to make your experience better.',
    fields: {
      name: 'Your Full Name',
      namePlaceholder: 'Write your full name',
      email: 'Email Address',
      emailPlaceholder: 'Write your email address',
      phone: 'Phone Number',
      phonePlaceholder: 'Write your phone number'
    },
    validation: {
      nameRequired: 'Please write your full name',
      emailRequired: 'Please write your email address',
      emailInvalid: 'Please write correct email address',
      phoneRequired: 'Please write your phone number',
      phoneInvalid: 'Please write correct phone number'
    },
    continue: 'Finish Setup',
    back: 'Back',
    optional: '(No be must)',
    required: '*'
  }
};

export function PersonalDataCollection({
  isOpen,
  onClose,
  onSubmit,
  language = 'en'
}: PersonalDataCollectionProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { speak, startListening, stopListening, transcript, clearTranscript, isListening } = useVoice();
  const adaptiveClasses = useAdaptiveClasses();
  const { updateProfile } = useProfileStore();
  const t = translations[language as keyof typeof translations] || translations.en;

  // Voice command processing
  useEffect(() => {
    if (transcript && transcript.trim()) {
      const command = transcript.toLowerCase();
      console.log('PersonalData voice command:', command);

      // Field focus commands
      if (command.includes('name field') || command.includes('enter name') || command.includes('fill name')) {
        document.getElementById('name-field')?.focus();
        speak('Name field focused. Please speak your full name.');
        clearTranscript();
        return;
      }

      if (command.includes('email field') || command.includes('enter email') || command.includes('fill email')) {
        document.getElementById('email-field')?.focus();
        speak('Email field focused. Please speak your email address.');
        clearTranscript();
        return;
      }

      if (command.includes('phone field') || command.includes('enter phone') || command.includes('fill phone')) {
        document.getElementById('phone-field')?.focus();
        speak('Phone field focused. Please speak your phone number.');
        clearTranscript();
        return;
      }

      // Fill current focused field with voice input
      if (focusedField && transcript.length > 3) {
        const cleanedInput = transcript.trim();
        
        if (focusedField === 'name') {
          setFormData(prev => ({ ...prev, name: cleanedInput }));
          setErrors(prev => ({ ...prev, name: '' }));
          // Blur the field to remove focus
          document.getElementById('name-field')?.blur();
          setFocusedField(null);
          speak(`Name entered: ${cleanedInput}. Say "email field" to continue or "continue" to proceed.`);
        } else if (focusedField === 'email') {
          // Clean email input (remove spaces)
          const emailInput = cleanedInput.replace(/\s+/g, '');
          setFormData(prev => ({ ...prev, email: emailInput }));
          setErrors(prev => ({ ...prev, email: '' }));
          // Blur the field to remove focus
          document.getElementById('email-field')?.blur();
          setFocusedField(null);
          speak(`Email entered: ${emailInput}. Say "phone field" to continue or "continue" to proceed.`);
        } else if (focusedField === 'phone') {
          // Clean phone input (remove non-numeric characters except +)
          const phoneInput = cleanedInput.replace(/[^\d+\-\s()]/g, '');
          setFormData(prev => ({ ...prev, phone: phoneInput }));
          setErrors(prev => ({ ...prev, phone: '' }));
          // Blur the field to remove focus
          document.getElementById('phone-field')?.blur();
          setFocusedField(null);
          speak(`Phone number entered: ${phoneInput}. Say "continue" to complete setup.`);
        }
        
        clearTranscript();
        return;
      }

      // Navigation commands
      if (command.includes('continue') || command.includes('submit') || command.includes('complete')) {
        handleSubmit();
        clearTranscript();
        return;
      }

      if (command.includes('back') || command.includes('previous')) {
        onClose();
        clearTranscript();
        return;
      }

      // Help command
      if (command.includes('help') || command.includes('what can i say')) {
        speak('You can say: "name field", "email field", or "phone field" to focus on a field. Then speak your information. Say "continue" to complete setup or "back" to go back.');
        clearTranscript();
        return;
      }

      // If command not understood and no field focused
      if (!focusedField) {
        speak('I didn\'t understand. Try saying: "name field", "email field", "phone field", "continue", or "help".');
      } else {
        speak(`Please speak your ${focusedField} or say "help" for assistance.`);
      }
      clearTranscript();
    }
  }, [transcript, focusedField, onClose, speak, clearTranscript]);

  // Auto-start listening and announce when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        speak('Complete your profile to finish setup. You can fill the form manually or use voice commands. Say "name field" to start with your name, or "help" for assistance.');
        setTimeout(() => {
          startListening();
        }, 4000);
      }, 1000);
    }

    return () => {
      if (isListening) {
        stopListening();
      }
    };
  }, [isOpen, speak, startListening, stopListening, isListening]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFocus = (field: string) => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      phone: ''
    };

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = t.validation.nameRequired;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = t.validation.emailRequired;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = t.validation.emailInvalid;
      }
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = t.validation.phoneRequired;
    } else {
      // Basic phone validation (at least 10 digits)
      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        newErrors.phone = t.validation.phoneInvalid;
      }
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Update profile store immediately
      updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        // Note: email is stored separately in the profile
      });

      speak('Profile completed successfully! Setting up your personalized dashboard.');
      onSubmit({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim()
      });
    } else {
      const firstError = Object.entries(errors).find(([_, error]) => error !== '');
      if (firstError) {
        speak(`Please fix the error: ${firstError[1]}`);
        // Focus on the field with error
        document.getElementById(`${firstError[0]}-field`)?.focus();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white flex items-start justify-center z-50 overflow-y-auto">
      <Card className="w-full max-w-2xl max-h-[90vh] h-full border-none shadow-none overflow-y-auto">
        <div className={cn(adaptiveClasses.card, adaptiveClasses.container)}>
          {/* Voice Control Status */}
          {transcript && isListening && (
            <p className={cn(adaptiveClasses.text, "text-sm text-blue-600 mt-1")} aria-live="assertive">
              <span className="sr-only">Voice input detected:</span>You said: "{transcript}"
            </p>
          )}

          {/* Header */}
          <div className="flex justify-center mb-6 max-h-32">
            <Image
              src="/logo.png"
              alt="4All Banking Logo"
              width={1000}
              height={1000}
              className="rounded-xl w-60 h-full object-contain"
            />
          </div>

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

          {/* Form Fields */}
          <div className={cn("space-y-6", adaptiveClasses.container)}>
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name-field" className={cn(adaptiveClasses.text, "font-medium flex items-center gap-2")}>
                <User className="h-4 w-4" />
                {t.fields.name}
                <span className="text-red-500">{t.required}</span>
              </Label>
              <Input
                id="name-field"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onFocus={() => handleFocus('name')}
                onBlur={handleBlur}
                placeholder={t.fields.namePlaceholder}
                className={cn(
                  adaptiveClasses.input,
                  errors.name ? 'border-red-500 focus:ring-red-500' : '',
                  focusedField === 'name' ? 'ring-2 ring-primary' : ''
                )}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p id="name-error" className={cn(adaptiveClasses.text, "text-sm text-red-600")}>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email-field" className={cn(adaptiveClasses.text, "font-medium flex items-center gap-2")}>
                <Mail className="h-4 w-4" />
                {t.fields.email}
                <span className="text-red-500">{t.required}</span>
              </Label>
              <Input
                id="email-field"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onFocus={() => handleFocus('email')}
                onBlur={handleBlur}
                placeholder={t.fields.emailPlaceholder}
                className={cn(
                  adaptiveClasses.input,
                  errors.email ? 'border-red-500 focus:ring-red-500' : '',
                  focusedField === 'email' ? 'ring-2 ring-primary' : ''
                )}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className={cn(adaptiveClasses.text, "text-sm text-red-600")}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone-field" className={cn(adaptiveClasses.text, "font-medium flex items-center gap-2")}>
                <Phone className="h-4 w-4" />
                {t.fields.phone}
                <span className="text-red-500">{t.required}</span>
              </Label>
              <Input
                id="phone-field"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                onFocus={() => handleFocus('phone')}
                onBlur={handleBlur}
                placeholder={t.fields.phonePlaceholder}
                className={cn(
                  adaptiveClasses.input,
                  errors.phone ? 'border-red-500 focus:ring-red-500' : '',
                  focusedField === 'phone' ? 'ring-2 ring-primary' : ''
                )}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
              />
              {errors.phone && (
                <p id="phone-error" className={cn(adaptiveClasses.text, "text-sm text-red-600")}>
                  {errors.phone}
                </p>
              )}
            </div>
          </div>

          {/* Voice Help */}
          <div className="text-center border-t pt-4">
            <p className={cn(adaptiveClasses.text, "text-xs text-muted-gray")}>
              💡 Voice commands: "name field", "email field", "phone field" to focus. Speak your info when focused. Say "continue" or "help"
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
              className={cn(adaptiveClasses.button, "flex-1 flex items-center justify-center gap-2")}
            >
              <Check className="h-4 w-4" />
              {t.continue}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}