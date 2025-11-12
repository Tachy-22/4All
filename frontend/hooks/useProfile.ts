import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useMemo } from 'react';

export interface UserProfile {
  profileId?: string;
  userId?: string;
  name?: string;
  phone?: string;
  language: 'en' | 'pcm' | 'yo' | 'ig' | 'ha';
  interactionMode: 'voice' | 'text';
  disabilities: ('visual' | 'hearing' | 'motor' | 'cognitive' | 'speech')[];
  cognitiveScore: number;
  uiComplexity: 'simplified' | 'moderate' | 'detailed';
  accessibilityPreferences: {
    fontSize: number;
    contrast: 'normal' | 'high';
    ttsSpeed: number;
    largeTargets: boolean;
    captions: boolean;
    font: 'inter' | 'atkinson';
  };
  confirmMode: 'pin' | 'voice' | 'biometric';
  isOnboardingComplete: boolean;
}

interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setLanguage: (language: UserProfile['language']) => void;
  setInteractionMode: (mode: UserProfile['interactionMode']) => void;
  setDisabilities: (disabilities: UserProfile['disabilities']) => void;
  setAccessibilityPreferences: (preferences: Partial<UserProfile['accessibilityPreferences']>) => void;
  clearProfile: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const defaultProfile: UserProfile = {
  language: 'en',
  interactionMode: 'voice',
  disabilities: [],
  cognitiveScore: 0,
  uiComplexity: 'moderate',
  accessibilityPreferences: {
    fontSize: 16,
    contrast: 'normal',
    ttsSpeed: 1,
    largeTargets: false,
    captions: false,
    font: 'inter',
  },
  confirmMode: 'pin',
  isOnboardingComplete: false,
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      isLoading: false,
      error: null,

      setProfile: (profile) => set({ profile, error: null }),
      
      updateProfile: (updates) => set((state) => ({
        profile: state.profile ? { ...state.profile, ...updates } : { ...defaultProfile, ...updates }
      })),
      
      setLanguage: (language) => set((state) => ({
        profile: state.profile ? { ...state.profile, language } : { ...defaultProfile, language }
      })),
      
      setInteractionMode: (interactionMode) => set((state) => ({
        profile: state.profile ? { ...state.profile, interactionMode } : { ...defaultProfile, interactionMode }
      })),
      
      setDisabilities: (disabilities) => set((state) => ({
        profile: state.profile ? { ...state.profile, disabilities } : { ...defaultProfile, disabilities }
      })),
      
      setAccessibilityPreferences: (preferences) => set((state) => ({
        profile: state.profile ? {
          ...state.profile,
          accessibilityPreferences: { ...state.profile.accessibilityPreferences, ...preferences }
        } : {
          ...defaultProfile,
          accessibilityPreferences: { ...defaultProfile.accessibilityPreferences, ...preferences }
        }
      })),
      
      clearProfile: () => set({ profile: null, error: null }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
    }),
    {
      name: '4all-profile-storage',
      partialize: (state) => ({ profile: state.profile }),
    }
  )
);

// Selectors for easy access
export const useProfile = () => useProfileStore((state) => state.profile);
export const useLanguage = () => useProfileStore((state) => state.profile?.language || 'en');
export const useInteractionMode = () => useProfileStore((state) => state.profile?.interactionMode || 'voice');

export const useDisabilities = () => {
  const disabilities = useProfileStore((state) => state.profile?.disabilities);
  return useMemo(() => disabilities || [], [disabilities]);
};

export const useUIComplexity = () => useProfileStore((state) => state.profile?.uiComplexity || 'moderate');

export const useAccessibilityPreferences = () => {
  const preferences = useProfileStore((state) => state.profile?.accessibilityPreferences);
  return useMemo(() => preferences || defaultProfile.accessibilityPreferences, [preferences]);
};