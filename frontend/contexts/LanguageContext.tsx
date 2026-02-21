"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { en } from "@/locales/en"
import { tr } from "@/locales/tr"

type Language = "en" | "tr"

type Dictionary = typeof tr

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string, variables?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const dictionaries = {
    en,
    tr,
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("tr")

    useEffect(() => {
        // Check if there is a saved language in localStorage
        const savedLang = localStorage.getItem("app_language") as Language
        if (savedLang && (savedLang === "en" || savedLang === "tr")) {
            setLanguageState(savedLang)
        }
    }, [])

    const setLanguage = (lang: Language) => {
        setLanguageState(lang)
        localStorage.setItem("app_language", lang)
    }

    const t = (key: string, variables?: Record<string, string | number>): string => {
        const keys = key.split(".")
        let current: any = dictionaries[language]

        for (const k of keys) {
            if (current[k] === undefined) {
                console.warn(`Translation key not found: ${key}`)
                return key
            }
            current = current[k]
        }

        let text = current as string

        // Replace variables if provided
        if (variables) {
            Object.keys(variables).forEach((varKey) => {
                text = text.replace(new RegExp(`{${varKey}}`, "g"), String(variables[varKey]))
            })
        }

        return text
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider")
    }
    return context
}
