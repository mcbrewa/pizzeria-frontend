import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import plCommon from '#/locales/pl/common.json'
import enCommon from '#/locales/en/common.json'
import deCommon from '#/locales/de/common.json'

export const SUPPORTED_LANGUAGES = ['pl', 'en', 'de'] as const
export type Language = (typeof SUPPORTED_LANGUAGES)[number]

export function isLanguage(value: unknown): value is Language {
  return SUPPORTED_LANGUAGES.includes(value as Language)
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    lng: 'pl',
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
