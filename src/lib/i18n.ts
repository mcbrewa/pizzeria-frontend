import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import plCommon from '#/locales/pl/common.json'
import enCommon from '#/locales/en/common.json'
import deCommon from '#/locales/de/common.json'

export const SUPPORTED_LANGUAGES = ['pl', 'en', 'de'] as const
export type Language = (typeof SUPPORTED_LANGUAGES)[number]
export const LANG_STORAGE_KEY = 'i18n-lang'

export function isLanguage(value: unknown): value is Language {
  return SUPPORTED_LANGUAGES.includes(value as Language)
}

const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return 'pl'
  const saved = localStorage.getItem(LANG_STORAGE_KEY)
  return isLanguage(saved) ? saved : 'pl'
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    lng: getInitialLanguage(),
    fallbackLng: 'pl',
    ns: ['common'],
    defaultNS: 'common',
    resources: {
      pl: { common: plCommon },
      en: { common: enCommon },
      de: { common: deCommon },
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })
}

export default i18n
