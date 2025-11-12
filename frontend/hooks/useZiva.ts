'use client';

import { useCallback, useState } from 'react';
import { useVoice } from './useVoice';
import { useProfile, useLanguage, useInteractionMode } from './useProfile';

interface ZivaResponse {
  message: string;
  action?: string;
  data?: any;
  suggestions?: string[];
}

interface ZivaMessage {
  id: string;
  type: 'user' | 'ziva';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
}

export function useZiva() {
  const { speak, transcript, clearTranscript, isListening, startListening, stopListening } = useVoice();
  const language = useLanguage();
  const interactionMode = useInteractionMode();
  const profile = useProfile();
  
  const [messages, setMessages] = useState<ZivaMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentContext, setCurrentContext] = useState<string>('general');

  // Language-specific responses
  const getLocalizedResponse = useCallback((key: string, values?: Record<string, string>) => {
    const responses: Record<string, Record<string, string>> = {
      en: {
        greeting: "Hello! I'm Ziva, your banking assistant. How can I help you today?",
        language_prompt: "Which language would you prefer? Say 'English', 'Pidgin', 'Yoruba', 'Igbo', or 'Hausa'.",
        voice_or_text: "Would you like to use voice or text to interact with me?",
        listening: "I'm listening...",
        processing: "Processing your request...",
        error: "I'm sorry, I didn't understand that. Could you please try again?",
        transfer_confirm: `I heard 'Send ₦${values?.amount} to ${values?.recipient}'. Which account should I debit? Say 'savings' or 'current'.`,
        transfer_pending: "Your transfer is being processed. I'll notify you when it's complete.",
        transfer_failed: "Your transfer couldn't be completed due to network issues. I'll retry automatically.",
        help: "I can help you with transfers, bill payments, account balance, and more. What would you like to do?",
      },
      pcm: {
        greeting: "How far! I be Ziva, your banking helper. Wetin you wan do today?",
        language_prompt: "Which language you wan use? Talk 'English', 'Pidgin', 'Yoruba', 'Igbo', or 'Hausa'.",
        voice_or_text: "You wan use voice or you wan type am?",
        listening: "I dey listen...",
        processing: "I dey work on am...",
        error: "Sorry o, I no understand wetin you talk. Try again abeg.",
        transfer_confirm: `I hear say you wan send ₦${values?.amount} give ${values?.recipient}. Which account I go use? Talk 'savings' or 'current'.`,
        transfer_pending: "Your money dey go. I go tell you when e finish.",
        transfer_failed: "The money no go through because of network wahala. I go try again.",
        help: "I fit help you send money, pay bills, check balance, and plenty things. Wetin you wan do?",
      },
      // Add more languages as needed
    };

    return responses[language]?.[key] || responses['en'][key] || key;
  }, [language]);

  // Add message to conversation
  const addMessage = useCallback((content: string, type: 'user' | 'ziva', isVoice: boolean = false) => {
    const message: ZivaMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      isVoice,
    };
    setMessages(prev => [...prev, message]);
    return message;
  }, []);

  // Process user input (voice or text)
  const processInput = useCallback(async (input: string, isVoice: boolean = false) => {
    if (!input.trim()) return;

    setIsProcessing(true);
    addMessage(input, 'user', isVoice);

    try {
      // Simple rule-based responses for demo
      let response = await generateResponse(input, currentContext);
      
      // Add Ziva's response
      addMessage(response.message, 'ziva');
      
      // Speak response if voice mode
      if (interactionMode === 'voice') {
        speak(response.message);
      }

      // Handle actions
      if (response.action) {
        handleAction(response.action, response.data);
      }

    } catch (error) {
      const errorMsg = getLocalizedResponse('error');
      addMessage(errorMsg, 'ziva');
      if (interactionMode === 'voice') {
        speak(errorMsg);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [addMessage, currentContext, interactionMode, speak, getLocalizedResponse]);

  // Generate response based on input
  const generateResponse = useCallback(async (input: string, context: string): Promise<ZivaResponse> => {
    const lowercaseInput = input.toLowerCase();

    // Language detection
    if (lowercaseInput.includes('english') || lowercaseInput.includes('pidgin') || 
        lowercaseInput.includes('yoruba') || lowercaseInput.includes('igbo') || 
        lowercaseInput.includes('hausa')) {
      return {
        message: getLocalizedResponse('voice_or_text'),
        action: 'set_language',
        data: { language: extractLanguage(lowercaseInput) }
      };
    }

    // Voice/text preference
    if (lowercaseInput.includes('voice') || lowercaseInput.includes('text')) {
      return {
        message: getLocalizedResponse('greeting'),
        action: 'set_interaction_mode',
        data: { mode: lowercaseInput.includes('voice') ? 'voice' : 'text' }
      };
    }

    // Transfer requests
    if (lowercaseInput.includes('send') || lowercaseInput.includes('transfer')) {
      const amount = extractAmount(input);
      const recipient = extractRecipient(input);
      
      if (amount && recipient) {
        return {
          message: getLocalizedResponse('transfer_confirm', { amount, recipient }),
          action: 'initiate_transfer',
          data: { amount, recipient }
        };
      }
    }

    // Balance inquiry
    if (lowercaseInput.includes('balance') || lowercaseInput.includes('account')) {
      return {
        message: `Your current balance is ₦25,480.50. Would you like to see recent transactions?`,
        action: 'show_balance',
        data: { balance: '25,480.50' }
      };
    }

    // Help request
    if (lowercaseInput.includes('help') || lowercaseInput.includes('what can you do')) {
      return {
        message: getLocalizedResponse('help'),
        suggestions: ['Check balance', 'Send money', 'Pay bills', 'View transactions']
      };
    }

    // Default response
    return {
      message: getLocalizedResponse('help'),
      suggestions: ['Check balance', 'Send money', 'Pay bills', 'View transactions']
    };
  }, [getLocalizedResponse]);

  // Handle actions
  const handleAction = useCallback((action: string, data?: any) => {
    switch (action) {
      case 'set_language':
        // This would update the profile language
        console.log('Setting language:', data.language);
        break;
      case 'set_interaction_mode':
        // This would update the interaction mode
        console.log('Setting interaction mode:', data.mode);
        break;
      case 'initiate_transfer':
        setCurrentContext('transfer');
        break;
      case 'show_balance':
        setCurrentContext('account');
        break;
      default:
        break;
    }
  }, []);

  // Utility functions
  const extractAmount = (input: string): string | null => {
    const amountMatch = input.match(/₦?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    return amountMatch ? amountMatch[1] : null;
  };

  const extractRecipient = (input: string): string | null => {
    const words = input.split(' ');
    const toIndex = words.findIndex(word => word.toLowerCase() === 'to');
    return toIndex !== -1 && toIndex + 1 < words.length ? words[toIndex + 1] : null;
  };

  const extractLanguage = (input: string): string => {
    if (input.includes('pidgin')) return 'pcm';
    if (input.includes('yoruba')) return 'yo';
    if (input.includes('igbo')) return 'ig';
    if (input.includes('hausa')) return 'ha';
    return 'en';
  };

  // Ziva greeting on mount
  const initializeZiva = useCallback(() => {
    if (!profile?.isOnboardingComplete) {
      const greeting = getLocalizedResponse('language_prompt');
      addMessage(greeting, 'ziva');
      if (interactionMode === 'voice') {
        speak(greeting);
      }
    } else {
      const greeting = getLocalizedResponse('greeting');
      addMessage(greeting, 'ziva');
      if (interactionMode === 'voice') {
        speak(greeting);
      }
    }
  }, [profile, interactionMode, speak, addMessage, getLocalizedResponse]);

  // Process voice input when transcript changes
  const handleVoiceInput = useCallback(() => {
    if (transcript) {
      processInput(transcript, true);
      clearTranscript();
    }
  }, [transcript, processInput, clearTranscript]);

  return {
    // State
    messages,
    isProcessing,
    isListening,
    currentContext,
    
    // Actions
    processInput,
    handleVoiceInput,
    initializeZiva,
    speak,
    startListening,
    stopListening,
    setCurrentContext,
    
    // Utilities
    getLocalizedResponse,
  };
}