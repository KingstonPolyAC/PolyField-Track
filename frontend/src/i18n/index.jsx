import React, { createContext, useContext, useState, useCallback } from 'react';
import en from './locales/en.json';
import fr from './locales/fr.json';

const translations = { en, fr };

const I18nContext = createContext();

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

function interpolate(str, vars) {
  if (!vars || typeof str !== 'string') return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => (vars[key] !== undefined ? vars[key] : `{{${key}}}`));
}

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState('en');

  const t = useCallback((key, vars) => {
    let value = getNestedValue(translations[language], key);
    if (value === undefined && language !== 'en') {
      value = getNestedValue(translations.en, key);
    }
    if (value === undefined) return key;
    return interpolate(value, vars);
  }, [language]);

  return (
    <I18nContext.Provider value={{ t, language, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return ctx;
}
