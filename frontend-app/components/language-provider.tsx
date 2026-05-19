"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import id from "@/lib/dictionaries/id.json"
import en from "@/lib/dictionaries/en.json"

type Language = "id" | "en"
type Dictionaries = typeof id

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: Dictionaries
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("id")

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Language
    if (saved && (saved === "id" || saved === "en")) {
      setLang(saved)
    }
  }, [])

  const handleSetLang = (newLang: Language) => {
    setLang(newLang)
    localStorage.setItem("lang", newLang)
  }

  const t = lang === "id" ? id : en

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) throw new Error("useLanguage must be used within LanguageProvider")
  return context
}
