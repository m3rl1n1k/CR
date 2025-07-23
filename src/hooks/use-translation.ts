
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface TranslationContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, options?: Record<string, string>) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: React.ReactNode;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState('en');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && ['en', 'pl', 'uk'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    } else {
      // Keep 'en' as default if nothing is saved or value is invalid
      setLanguageState('en');
    }
  }, []);

  useEffect(() => {
    const fetchTranslations = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/locales/${language}.json`);
        if (!response.ok) {
          console.error(`Could not load translations for ${language}`);
          // Attempt to load fallback English translations if the desired one fails
          if (language !== 'en') {
             const fallbackResponse = await fetch(`/locales/en.json`);
             const fallbackData = await fallbackResponse.json();
             setTranslations(fallbackData);
          } else {
             setTranslations({}); // No translations found for English, use keys as fallback
          }
          return;
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error('Failed to fetch translations:', error);
        setTranslations({}); // On error, use keys as fallback
      } finally {
        setLoading(false);
      }
    };

    fetchTranslations();
  }, [language]);

  const setLanguage = (lang: string) => {
    if (['en', 'pl', 'uk'].includes(lang)) {
      localStorage.setItem('language', lang);
      setLanguageState(lang);
    }
  };

  const t = useCallback((key: string, options?: Record<string, string>) => {
    let translation = translations[key] || key;
    if (options) {
      Object.keys(options).forEach((k) => {
        translation = translation.replace(new RegExp(`{{${k}}}`, 'g'), options[k]);
      });
    }
    return translation;
  }, [translations]);

  const value = { language, setLanguage, t };

  if (loading) {
    // Render nothing or a loading indicator while translations are loading
    // to prevent a flash of untranslated content.
    return null;
  }

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
