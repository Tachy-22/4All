'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { useZiva } from '../../hooks/useZiva';
import { useAdaptiveUI, useAdaptiveClasses } from '../../hooks/useAdaptiveUI';
import { useInteractionMode } from '../../hooks/useProfile';
import { Mic, MicOff, Send, MessageCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ZivaAssistantProps {
  className?: string;
  autoInitialize?: boolean;
  showAsWidget?: boolean;
}

export function ZivaAssistant({ 
  className, 
  autoInitialize = true, 
  showAsWidget = true 
}: ZivaAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isVisible] = useState(showAsWidget);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const adaptiveUI = useAdaptiveUI();
  const adaptiveClasses = useAdaptiveClasses();
  const interactionMode = useInteractionMode();
  
  const {
    messages,
    isProcessing,
    isListening,
    processInput,
    handleVoiceInput,
    initializeZiva,
    startListening,
    stopListening,
    getLocalizedResponse,
  } = useZiva();

  // Initialize Ziva on mount
  useEffect(() => {
    if (autoInitialize && messages.length === 0) {
      initializeZiva();
    }
  }, [autoInitialize, initializeZiva, messages.length]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle voice input
  useEffect(() => {
    if (isListening && isExpanded) {
      handleVoiceInput();
    }
  }, [handleVoiceInput, isListening, isExpanded]);

  // Handle text input submission
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      processInput(textInput, false);
      setTextInput('');
    }
  };

  // Handle voice toggle
  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && interactionMode === 'text') {
      inputRef.current?.focus();
    }
  }, [isExpanded, interactionMode]);

  if (!isVisible) return null;

  // Widget mode (collapsed)
  if (showAsWidget && !isExpanded) {
    return (
      <div className={cn('fixed bottom-4 right-4 z-50', className)}>
        <Button
          onClick={() => setIsExpanded(true)}
          className={cn(
            adaptiveClasses.button,
            'rounded-full w-14 h-14 bg-primary-red text-white shadow-lg hover:bg-primary-red/90',
            'flex items-center justify-center',
            isListening && 'animate-pulse bg-danger'
          )}
          aria-label={getLocalizedResponse('open_ziva')}
        >
          <MessageCircle className="w-6 h-6" />
          {(isListening || isProcessing) && (
            <Badge className="absolute -top-1 -right-1 w-3 h-3 p-0 bg-danger border-white" />
          )}
        </Button>
      </div>
    );
  }

  // Full expanded mode
  return (
    <div className={cn('fixed bottom-4 right-4 z-50', className)}>
      <Card 
        className={cn(
          adaptiveClasses.card,
          'w-80 h-96 bg-white shadow-xl border-2',
          adaptiveUI.contrastMode === 'high' && 'border-primary-red'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary-red" />
            <span className={cn(adaptiveClasses.text, 'font-semibold text-primary-red')}>
              Ziva
            </span>
            {isListening && (
              <Badge variant="secondary" className="text-xs bg-danger text-white">
                {getLocalizedResponse('listening')}
              </Badge>
            )}
            {isProcessing && (
              <Badge variant="secondary" className="text-xs bg-warning text-white">
                {getLocalizedResponse('processing')}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            aria-label="Close Ziva"
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-3">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-3 py-2',
                    adaptiveClasses.text,
                    message.type === 'user' 
                      ? 'bg-primary-red text-white' 
                      : 'bg-bg-white text-text border',
                    adaptiveUI.contrastMode === 'high' && message.type !== 'user' && 'border-2'
                  )}
                >
                  {message.content}
                  {message.isVoice && (
                    <Badge className="ml-2 text-xs" variant="outline">
                      🎤
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input */}
        <div className="p-3 border-t">
          <form onSubmit={handleTextSubmit} className="flex gap-2">
            {interactionMode === 'voice' ? (
              <Button
                type="button"
                onClick={handleVoiceToggle}
                className={cn(
                  adaptiveClasses.button,
                  'flex-1',
                  isListening 
                    ? 'bg-danger text-white' 
                    : 'bg-primary-red text-white hover:bg-primary-red/90'
                )}
                aria-label={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span className="ml-2">
                  {isListening ? 'Stop' : 'Speak'}
                </span>
              </Button>
            ) : (
              <>
                <Input
                  ref={inputRef}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={getLocalizedResponse('type_message')}
                  className={cn(adaptiveClasses.input, 'flex-1')}
                  disabled={isProcessing}
                />
                <Button
                  type="submit"
                  disabled={!textInput.trim() || isProcessing}
                  className={cn(
                    adaptiveClasses.button,
                    'bg-primary-red text-white hover:bg-primary-red/90'
                  )}
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </>
            )}
          </form>

          {/* Voice/Text toggle */}
          <div className="flex justify-center mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // This would toggle interaction mode in profile
                console.log('Toggle interaction mode');
              }}
              className="text-xs text-muted-gray"
            >
              Switch to {interactionMode === 'voice' ? 'text' : 'voice'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ZivaAssistant;