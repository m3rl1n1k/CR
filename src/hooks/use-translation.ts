
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

// Define the shape of the context value
interface TranslationContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, options?: Record<string, string>) => string;
  isLoaded: boolean;
}

// Create the context with a default value
const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: ReactNode;
}

// This function should only be called on the client side
const getInitialLanguage = (): string => {
    // On the server, always default to 'en'.
    if (typeof window === 'undefined') {
        return 'en';
    }
    // On the client, try to get from localStorage.
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && ['en', 'pl', 'uk'].includes(savedLanguage)) {
        return savedLanguage;
    }
    return 'en'; // Default language
};

export const TranslationProvider = ({ children }: TranslationProviderProps) => {
  // Initialize state with a function to ensure it's only called on the client.
  const [language, setLanguageState] = useState<string>(getInitialLanguage); 
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Effect for setting the initial language from localStorage on mount
  useEffect(() => {
    setLanguageState(getInitialLanguage());
  }, []);

  // Effect to fetch translations when the language changes
  useEffect(() => {
    let isMounted = true;
    const fetchTranslations = async () => {
      // Don't set isLoaded to false here, to avoid flashing content
      try {
        const response = await fetch(`/locales/${language}.json`);
        if (!response.ok) {
          throw new Error(`Could not load translations for ${language}`);
        }
        const data = await response.json();
        if (isMounted) {
          setTranslations(data);
        }
      } catch (error) {
        console.error('Failed to fetch translations:', error);
        // Fallback to English if the desired language fails
        if (language !== 'en' && isMounted) {
            setLanguageState('en');
        } else if (isMounted) {
             setTranslations({}); // Empty translations on error with English
        }
      } finally {
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    };

    fetchTranslations();

    return () => {
      isMounted = false;
    };
  }, [language]);

  // Function to set a new language and save it to localStorage
  const setLanguage = (lang: string) => {
    if (['en', 'pl', 'uk'].includes(lang)) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', lang);
      }
      setIsLoaded(false); // Set loading state while new translations are fetched
      setLanguageState(lang);
    }
  };

  // The translation function `t`
  const t = useCallback((key: string, options?: Record<string, string>) => {
    let translation = translations[key] || key;
    if (options) {
      Object.keys(options).forEach((k) => {
        translation = translation.replace(new RegExp(`{{${k}}}`, 'g'), options[k]);
      });
    }
    return translation;
  }, [translations]);

  // The value to be provided by the context
  const value = { language, setLanguage, t, isLoaded };

  return React.createElement(TranslationContext.Provider, { value: value }, isLoaded ? children : null);
};

// Custom hook to use the translation context
export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
