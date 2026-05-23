"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { PUBLIC_API } from "@/lib/api"

export type CurrencyCode = "IDR" | "USD" | "MYR" | "SGD" | "PHP" | "THB"

export interface CurrencyConfig {
  code: CurrencyCode
  symbol: string
  locale: string
  name: string
  flag: string
}

export const CURRENCY_MAP: Record<CurrencyCode, CurrencyConfig> = {
  IDR: { code: "IDR", symbol: "Rp", locale: "id-ID", name: "Rupiah", flag: "🇮🇩" },
  USD: { code: "USD", symbol: "$", locale: "en-US", name: "Dollar", flag: "🇺🇸" },
  MYR: { code: "MYR", symbol: "RM", locale: "ms-MY", name: "Ringgit", flag: "🇲🇾" },
  SGD: { code: "SGD", symbol: "S$", locale: "en-SG", name: "Singapore Dollar", flag: "🇸🇬" },
  PHP: { code: "PHP", symbol: "₱", locale: "en-PH", name: "Peso", flag: "🇵🇭" },
  THB: { code: "THB", symbol: "฿", locale: "th-TH", name: "Baht", flag: "🇹🇭" }
}

// Fallback exchange rates against IDR base currency (1 Unit of Foreign = X IDR)
export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  IDR: 1,
  USD: 16000,
  MYR: 3400,
  SGD: 11800,
  PHP: 280,
  THB: 440
}

interface CurrencyContextType {
  currency: CurrencyCode
  setCurrency: (currency: CurrencyCode) => void
  convertFromIdr: (amountInIdr: number, target?: CurrencyCode) => number
  convertToIdr: (amountInForeign: number, source?: CurrencyCode) => number
  format: (amount: number, code?: CurrencyCode) => string
  config: CurrencyConfig
  rates: Record<CurrencyCode, number>
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("IDR")
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(EXCHANGE_RATES)

  useEffect(() => {
    const saved = localStorage.getItem("treetmi_currency") as CurrencyCode
    if (saved && EXCHANGE_RATES[saved]) {
      setCurrencyState(saved)
    }

    const fetchRates = async () => {
      try {
        const res = await fetch(PUBLIC_API.publicSettings)
        const json = await res.json()
        if (json.success && json.data && json.data.rates) {
          const loadedRates = {
            IDR: 1,
            USD: Number(json.data.rates.USD) || EXCHANGE_RATES.USD,
            MYR: Number(json.data.rates.MYR) || EXCHANGE_RATES.MYR,
            SGD: Number(json.data.rates.SGD) || EXCHANGE_RATES.SGD,
            PHP: Number(json.data.rates.PHP) || EXCHANGE_RATES.PHP,
            THB: Number(json.data.rates.THB) || EXCHANGE_RATES.THB
          }
          setRates(loadedRates)
        }
      } catch (err) {
        console.error("Gagal memuat kurs mata uang dinamis dari server:", err)
      }
    }
    fetchRates()
  }, [])

  const setCurrency = (newCurrency: CurrencyCode) => {
    if (EXCHANGE_RATES[newCurrency]) {
      setCurrencyState(newCurrency)
      localStorage.setItem("treetmi_currency", newCurrency)
    }
  }

  // Convert IDR to Target Foreign Currency (e.g. 15000 IDR -> 0.93 USD)
  const convertFromIdr = (amountInIdr: number, target: CurrencyCode = currency): number => {
    const rate = rates[target] || EXCHANGE_RATES[target] || 1
    return amountInIdr / rate
  }

  // Convert Foreign Currency back to IDR (e.g. 2.00 USD -> 32000 IDR)
  const convertToIdr = (amountInForeign: number, source: CurrencyCode = currency): number => {
    const rate = rates[source] || EXCHANGE_RATES[source] || 1
    return amountInForeign * rate
  }

  // Format currency with proper symbols and decimal places
  const format = (amount: number, code: CurrencyCode = currency): string => {
    const cfg = CURRENCY_MAP[code] || CURRENCY_MAP.IDR
    
    return new Intl.NumberFormat(cfg.locale, {
      style: "currency",
      currency: cfg.code,
      minimumFractionDigits: cfg.code === "IDR" ? 0 : 2,
      maximumFractionDigits: cfg.code === "IDR" ? 0 : 2
    })
      .format(amount)
      .replace(/\s+/g, " ")
  }

  const config = CURRENCY_MAP[currency] || CURRENCY_MAP.IDR

  return (
    <CurrencyContext.Provider 
      value={{ 
        currency, 
        setCurrency, 
        convertFromIdr, 
        convertToIdr, 
        format, 
        config,
        rates
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (!context) throw new Error("useCurrency must be used within CurrencyProvider")
  return context
}
