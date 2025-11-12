'use client';

import { useEffect, useCallback } from 'react';
import { useProfile, useLanguage, useInteractionMode, useDisabilities } from './useProfile';

interface AnalyticsEvent {
  eventType: string;
  userId?: string;
  sessionId: string;
  profileId?: string;
  timestamp: number;
  metadata: Record<string, any>;
  deviceInfo: {
    userAgent: string;
    language: string;
    screen: { width: number; height: number };
    timezone: string;
  };
}

interface AccessibilityMetrics {
  voiceInteractions: number;
  textInteractions: number;
  adaptiveUIChanges: number;
  assistiveTechDetected: boolean;
  frictionPoints: string[];
  completionTimes: Record<string, number>;
}

class AnalyticsService {
  private sessionId: string;
  private events: AnalyticsEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private accessibilityMetrics: AccessibilityMetrics = {
    voiceInteractions: 0,
    textInteractions: 0,
    adaptiveUIChanges: 0,
    assistiveTechDetected: false,
    frictionPoints: [],
    completionTimes: {}
  };

  constructor() {
    this.sessionId = this.generateSessionId();
    this.detectAssistiveTech();
    this.startFlushTimer();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private detectAssistiveTech(): void {
    // Detect screen readers and other assistive technologies
    const hasScreenReader = !!(
      // @ts-ignore
      window.speechSynthesis ||
      // @ts-ignore 
      window.navigator.userAgent.includes('NVDA') ||
      // @ts-ignore
      window.navigator.userAgent.includes('JAWS') ||
      // @ts-ignore
      window.navigator.userAgent.includes('VoiceOver')
    );

    this.accessibilityMetrics.assistiveTechDetected = hasScreenReader;
  }

  private getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      screen: {
        width: window.screen.width,
        height: window.screen.height
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  track(eventType: string, metadata: Record<string, any> = {}, profile?: any): void {
    const event: AnalyticsEvent = {
      eventType,
      userId: profile?.userId,
      profileId: profile?.profileId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      metadata: {
        ...metadata,
        url: window.location.pathname,
        referrer: document.referrer,
        ...this.getAccessibilityContext(profile)
      },
      deviceInfo: this.getDeviceInfo()
    };

    this.events.push(event);
    
    // Update accessibility metrics
    this.updateAccessibilityMetrics(eventType, metadata);

    // Immediate flush for critical events
    if (this.isCriticalEvent(eventType)) {
      this.flush();
    }
  }

  private getAccessibilityContext(profile?: any) {
    if (!profile) return {};

    return {
      language: profile.language || 'en',
      interactionMode: profile.interactionMode || 'voice',
      disabilities: profile.disabilities || [],
      uiComplexity: profile.uiComplexity || 'moderate',
      accessibilityPreferences: profile.accessibilityPreferences || {},
      adaptiveUIEnabled: profile.disabilities?.length > 0 || false
    };
  }

  private updateAccessibilityMetrics(eventType: string, metadata: any): void {
    switch (eventType) {
      case 'voice_interaction':
        this.accessibilityMetrics.voiceInteractions++;
        break;
      case 'text_interaction':
        this.accessibilityMetrics.textInteractions++;
        break;
      case 'adaptive_ui_change':
        this.accessibilityMetrics.adaptiveUIChanges++;
        break;
      case 'friction_detected':
        if (metadata.frictionPoint && !this.accessibilityMetrics.frictionPoints.includes(metadata.frictionPoint)) {
          this.accessibilityMetrics.frictionPoints.push(metadata.frictionPoint);
        }
        break;
      case 'task_completed':
        if (metadata.taskType && metadata.duration) {
          this.accessibilityMetrics.completionTimes[metadata.taskType] = metadata.duration;
        }
        break;
    }
  }

  private isCriticalEvent(eventType: string): boolean {
    const criticalEvents = [
      'onboarding_completed',
      'transfer_failed',
      'payment_failed',
      'accessibility_error',
      'voice_recognition_failed'
    ];
    return criticalEvents.includes(eventType);
  }

  private startFlushTimer(): void {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000); // Flush every 30 seconds
  }

  private async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToFlush = [...this.events];
    this.events = [];

    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          events: eventsToFlush,
          accessibilityMetrics: this.accessibilityMetrics,
          sessionId: this.sessionId
        })
      });
    } catch (error) {
      console.warn('Failed to send analytics:', error);
      // Re-add events to queue for retry
      this.events.unshift(...eventsToFlush);
    }
  }

  getAccessibilityMetrics(): AccessibilityMetrics {
    return { ...this.accessibilityMetrics };
  }

  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

let analyticsInstance: AnalyticsService | null = null;

export function useAnalytics() {
  const profile = useProfile();
  const language = useLanguage();
  const interactionMode = useInteractionMode();
  const disabilities = useDisabilities();

  // Initialize analytics service
  useEffect(() => {
    if (typeof window !== 'undefined' && !analyticsInstance) {
      analyticsInstance = new AnalyticsService();
    }

    return () => {
      if (analyticsInstance) {
        analyticsInstance.destroy();
        analyticsInstance = null;
      }
    };
  }, []);

  // Track page views
  useEffect(() => {
    if (analyticsInstance) {
      analyticsInstance.track('page_view', {
        page: window.location.pathname
      }, profile);
    }
  }, [profile]);

  // Track interaction mode changes
  useEffect(() => {
    if (analyticsInstance && profile?.isOnboardingComplete) {
      analyticsInstance.track('interaction_mode_changed', {
        newMode: interactionMode,
        language
      }, profile);
    }
  }, [interactionMode, language, profile, analyticsInstance]);

  // Track accessibility preference changes
  useEffect(() => {
    if (analyticsInstance && profile?.isOnboardingComplete && disabilities.length > 0) {
      analyticsInstance.track('accessibility_mode_toggled', {
        disabilities,
        adaptiveFeatures: profile.accessibilityPreferences
      }, profile);
    }
  }, [disabilities, profile, analyticsInstance]);

  // Tracking functions
  const trackEvent = useCallback((eventType: string, metadata: Record<string, any> = {}) => {
    if (analyticsInstance) {
      analyticsInstance.track(eventType, metadata, profile);
    }
  }, [profile]);

  const trackVoiceInteraction = useCallback((action: string, successful: boolean = true) => {
    trackEvent('voice_interaction', {
      action,
      successful,
      language,
      interactionMode: 'voice'
    });
  }, [trackEvent, language]);

  const trackTextInteraction = useCallback((action: string, inputMethod: string = 'keyboard') => {
    trackEvent('text_interaction', {
      action,
      inputMethod,
      interactionMode: 'text'
    });
  }, [trackEvent]);

  const trackTransaction = useCallback((type: 'transfer' | 'bill_payment', status: 'initiated' | 'confirmed' | 'completed' | 'failed', metadata: any = {}) => {
    trackEvent(`${type}_${status}`, {
      transactionType: type,
      status,
      confirmationMethod: profile?.confirmMode,
      ...metadata
    });
  }, [trackEvent, profile?.confirmMode]);

  const trackFriction = useCallback((location: string, action: string, details: any = {}) => {
    trackEvent('friction_detected', {
      frictionPoint: `${location}:${action}`,
      location,
      action,
      userProfile: {
        disabilities,
        uiComplexity: profile?.uiComplexity,
        interactionMode
      },
      ...details
    });
  }, [trackEvent, disabilities, profile?.uiComplexity, interactionMode]);

  const trackTaskCompletion = useCallback((taskType: string, duration: number, successful: boolean = true) => {
    trackEvent('task_completed', {
      taskType,
      duration,
      successful,
      completionRate: successful ? 1 : 0
    });
  }, [trackEvent]);

  const trackZivaInteraction = useCallback((userMessage: string, zivaResponse: string, sentiment?: 'positive' | 'neutral' | 'negative') => {
    trackEvent('ziva_interaction', {
      userMessage: userMessage.substring(0, 100), // Limit for privacy
      responseLength: zivaResponse.length,
      sentiment,
      language,
      interactionMode
    });
  }, [trackEvent, language, interactionMode]);

  const trackAccessibilityError = useCallback((errorType: string, context: any = {}) => {
    trackEvent('accessibility_error', {
      errorType,
      context,
      disabilities,
      assistiveFeatures: profile?.accessibilityPreferences
    });
  }, [trackEvent, disabilities, profile?.accessibilityPreferences]);

  const getMetrics = useCallback(() => {
    return analyticsInstance?.getAccessibilityMetrics() || null;
  }, []);

  return {
    // General tracking
    trackEvent,
    
    // Specific tracking functions
    trackVoiceInteraction,
    trackTextInteraction,
    trackTransaction,
    trackFriction,
    trackTaskCompletion,
    trackZivaInteraction,
    trackAccessibilityError,
    
    // Utilities
    getMetrics
  };
}