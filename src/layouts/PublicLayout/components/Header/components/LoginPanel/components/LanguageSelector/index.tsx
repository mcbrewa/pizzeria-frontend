import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '../../data'
import { LANG_STORAGE_KEY } from '#/lib/i18n'
import type { LanguageSelectorProps } from './types'
import style from './style.module.scss'

const FLAG: Record<(typeof LANGUAGES)[number]['code'], string> = {
  pl: '🇵🇱',
  en: '🇬🇧',
  de: '🇩🇪',
}

const LanguageSelector = ({ variant = 'dropdown' }: LanguageSelectorProps) => {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const activeLang = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0]

  const handleSelect = (code: (typeof LANGUAGES)[number]['code']) => {
    i18n.changeLanguage(code)
    localStorage.setItem(LANG_STORAGE_KEY, code)
    setIsOpen(false)
  }

  if (variant === 'flags') {
    return (
      <div className={style.flagsRow}>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            className={`${style.flagBtn}${lang.code === activeLang.code ? ` ${style.flagBtnActive}` : ''}`}
            onClick={() => handleSelect(lang.code)}
            aria-pressed={lang.code === activeLang.code}
          >
            {FLAG[lang.code]}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={style.wrapper}>
      <button
        type="button"
        className={style.trigger}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{FLAG[activeLang.code]}</span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className={isOpen ? style.chevronOpen : style.chevron}
        />
      </button>
      {isOpen && (
        <ul className={style.dropdown} role="listbox">
          {LANGUAGES.map((lang) => (
            <li key={lang.code} role="option" aria-selected={lang.code === activeLang.code}>
              <button
                type="button"
                className={`${style.option}${lang.code === activeLang.code ? ` ${style.optionActive}` : ''}`}
                onClick={() => handleSelect(lang.code)}
              >
                <span>{FLAG[lang.code]}</span>
                <span>{lang.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default LanguageSelector
