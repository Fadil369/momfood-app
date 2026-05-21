import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type Lang = 'ar' | 'en'

interface LanguageContextValue {
  lang: Lang
  dir: 'rtl' | 'ltr'
  toggle: () => void
  setLang: (l: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

const STORAGE_KEY = 'loqma-yummah-lang'

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'ar'
    const stored = window.localStorage.getItem(STORAGE_KEY) as Lang | null
    return stored === 'en' || stored === 'ar' ? stored : 'ar'
  })

  const dir: 'rtl' | 'ltr' = lang === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
      document.documentElement.dir = dir
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* ignore */
    }
  }, [lang, dir])

  const setLang = (l: Lang) => setLangState(l)
  const toggle = () => setLangState((prev) => (prev === 'ar' ? 'en' : 'ar'))

  return (
    <LanguageContext.Provider value={{ lang, dir, toggle, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
