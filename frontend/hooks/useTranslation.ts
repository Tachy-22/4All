'use client';

import { useEffect } from 'react';
import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useLanguage } from './useProfile';
import i18n from '../lib/i18n';

export function useTranslation() {
  const { t, i18n: i18nInstance } = useI18nTranslation();
  const currentLanguage = useLanguage();

  // Sync i18n language with profile language
  useEffect(() => {
    if (currentLanguage && i18nInstance.language !== currentLanguage) {
      i18nInstance.changeLanguage(currentLanguage);
    }
  }, [currentLanguage, i18nInstance]);

  return { t };
}

export default useTranslation;