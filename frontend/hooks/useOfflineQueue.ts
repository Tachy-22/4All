'use client';

import { useState, useEffect, useCallback } from 'react';
import { useVoice } from './useVoice';

interface QueuedAction {
  id: string;
  type: 'transfer' | 'bill_payment' | 'profile_update';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  requiresConfirmation?: boolean;
}

interface OfflineQueueState {
  isOnline: boolean;
  queuedActions: QueuedAction[];
  isProcessingQueue: boolean;
  lastSyncTime?: number;
}

export function useOfflineQueue() {
  const [state, setState] = useState<OfflineQueueState>({
    isOnline: navigator.onLine,
    queuedActions: [],
    isProcessingQueue: false
  });

  const { speak } = useVoice();

  // Load queued actions from localStorage on mount
  useEffect(() => {
    const savedQueue = localStorage.getItem('4all-offline-queue');
    if (savedQueue) {
      try {
        const parsed = JSON.parse(savedQueue);
        setState(prev => ({
          ...prev,
          queuedActions: parsed.queuedActions || []
        }));
      } catch (error) {
        console.error('Failed to parse offline queue:', error);
      }
    }
  }, []);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('4all-offline-queue', JSON.stringify({
      queuedActions: state.queuedActions,
      lastSyncTime: state.lastSyncTime
    }));
  }, [state.queuedActions, state.lastSyncTime]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      speak("Connection restored. Processing queued actions...");
      processQueue();
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
      speak("You're offline. Don't worry, I'll save your actions and process them when you're back online.");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [speak]);

  // Add action to queue
  const queueAction = useCallback((
    type: QueuedAction['type'],
    data: any,
    options: { 
      requiresConfirmation?: boolean;
      maxRetries?: number;
    } = {}
  ): string => {
    const actionId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const queuedAction: QueuedAction = {
      id: actionId,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: options.maxRetries || 3,
      status: 'queued',
      requiresConfirmation: options.requiresConfirmation || false
    };

    setState(prev => ({
      ...prev,
      queuedActions: [...prev.queuedActions, queuedAction]
    }));

    // Provide feedback based on network status
    if (state.isOnline) {
      speak("Action queued and will be processed shortly.");
      processQueue();
    } else {
      speak("You're offline. Action saved and will be processed when connection is restored.");
    }

    return actionId;
  }, [state.isOnline, speak]);

  // Process queued actions
  const processQueue = useCallback(async () => {
    if (!state.isOnline || state.isProcessingQueue || state.queuedActions.length === 0) {
      return;
    }

    setState(prev => ({ ...prev, isProcessingQueue: true }));

    const pendingActions = state.queuedActions.filter(
      action => action.status === 'queued' && action.retryCount < action.maxRetries
    );

    for (const action of pendingActions) {
      try {
        // Mark as processing
        setState(prev => ({
          ...prev,
          queuedActions: prev.queuedActions.map(a =>
            a.id === action.id ? { ...a, status: 'processing' } : a
          )
        }));

        // Process based on action type
        let success = false;
        switch (action.type) {
          case 'transfer':
            success = await processTransfer(action.data);
            break;
          case 'bill_payment':
            success = await processBillPayment(action.data);
            break;
          case 'profile_update':
            success = await processProfileUpdate(action.data);
            break;
          default:
            console.warn('Unknown action type:', action.type);
        }

        if (success) {
          // Mark as completed
          setState(prev => ({
            ...prev,
            queuedActions: prev.queuedActions.map(a =>
              a.id === action.id ? { ...a, status: 'completed' } : a
            )
          }));
          
          speak(`${getActionDescription(action)} completed successfully.`);
        } else {
          throw new Error('Action processing failed');
        }

      } catch (error) {
        // Increment retry count or mark as failed
        setState(prev => ({
          ...prev,
          queuedActions: prev.queuedActions.map(a =>
            a.id === action.id 
              ? {
                  ...a,
                  retryCount: a.retryCount + 1,
                  status: a.retryCount + 1 >= a.maxRetries ? 'failed' : 'queued'
                }
              : a
          )
        }));

        if (action.retryCount + 1 >= action.maxRetries) {
          speak(`${getActionDescription(action)} failed after ${action.maxRetries} attempts. Please try manually.`);
        }
      }
    }

    setState(prev => ({ 
      ...prev, 
      isProcessingQueue: false,
      lastSyncTime: Date.now()
    }));
  }, [state.isOnline, state.isProcessingQueue, state.queuedActions, speak]);

  // Process individual action types
  const processTransfer = async (data: any): Promise<boolean> => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      return result.success;
    } catch (error) {
      return false;
    }
  };

  const processBillPayment = async (data: any): Promise<boolean> => {
    try {
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      return result.success;
    } catch (error) {
      return false;
    }
  };

  const processProfileUpdate = async (data: any): Promise<boolean> => {
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  // Get human-readable action description
  const getActionDescription = (action: QueuedAction): string => {
    switch (action.type) {
      case 'transfer':
        return `Money transfer to ${action.data.recipient || 'recipient'}`;
      case 'bill_payment':
        return `Bill payment to ${action.data.provider || 'provider'}`;
      case 'profile_update':
        return 'Profile update';
      default:
        return 'Action';
    }
  };

  // Remove action from queue
  const removeAction = useCallback((actionId: string) => {
    setState(prev => ({
      ...prev,
      queuedActions: prev.queuedActions.filter(a => a.id !== actionId)
    }));
  }, []);

  // Clear completed actions
  const clearCompleted = useCallback(() => {
    setState(prev => ({
      ...prev,
      queuedActions: prev.queuedActions.filter(a => a.status !== 'completed')
    }));
  }, []);

  // Get queue statistics
  const getQueueStats = useCallback(() => {
    const total = state.queuedActions.length;
    const queued = state.queuedActions.filter(a => a.status === 'queued').length;
    const processing = state.queuedActions.filter(a => a.status === 'processing').length;
    const completed = state.queuedActions.filter(a => a.status === 'completed').length;
    const failed = state.queuedActions.filter(a => a.status === 'failed').length;

    return { total, queued, processing, completed, failed };
  }, [state.queuedActions]);

  return {
    // State
    isOnline: state.isOnline,
    queuedActions: state.queuedActions,
    isProcessingQueue: state.isProcessingQueue,
    lastSyncTime: state.lastSyncTime,
    
    // Actions
    queueAction,
    processQueue,
    removeAction,
    clearCompleted,
    
    // Utilities
    getQueueStats,
    getActionDescription
  };
}