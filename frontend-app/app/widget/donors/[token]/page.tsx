"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { fetchWithRetry } from "@/lib/api"
import { cn } from "@/lib/utils"

import { API_BASE_URL } from "@/lib/api"
const API_BASE = API_BASE_URL

interface DonorItem {
  name: string
  amount: number
  currency: string
  message: string
  createdAt: string
}

function WidgetDonorsContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  
  const token = Array.isArray(params?.token) ? params.token[0] : params?.token
  const mode = searchParams?.get("mode") || "table" // table or ticker
  const scaleStr = searchParams?.get("scale")
  const scale = scaleStr ? parseFloat(scaleStr) : 1.5 // Default to 1.5 for ultra readability on high-DPI screens
  const themeParam = searchParams?.get("theme") || "dark"
  const isDark = themeParam === "dark"
  const period = searchParams?.get("period") || "all" // all, weekly, monthly
  
  // Set the title automatically based on the mode and period
  const titleParam = searchParams?.get("title")
  let customTitle = titleParam
  if (!customTitle) {
    if (mode === "ticker") {
      if (period === "weekly") customTitle = "DONASI MINGGU INI"
      else if (period === "monthly") customTitle = "DONASI BULAN INI"
      else customTitle = "DONATUR TERBARU"
    } else {
      if (period === "weekly") customTitle = "SULTAN MINGGU INI"
      else if (period === "monthly") customTitle = "SULTAN BULAN INI"
      else customTitle = "TOP SULTAN"
    }
  }

  const [donors, setDonors] = useState<DonorItem[]>([])
  const [colorDonation, setColorDonation] = useState("#FFD551") // Yellow accent default

  const fetchDonors = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetchWithRetry(`${API_BASE}/finance/donors-overlay/${token}?limit=100`)
      const json = await res.json()
      if (json.success) {
        setDonors(json.data || [])
      }
    } catch (err) {
      console.warn("Donors Widget: gagal ambil data (backend mungkin belum siap)", err)
    }
  }, [token])

  useEffect(() => {
    if (!token) return
    
    const init = async () => {
      await fetchDonors()

      // Fetch color setting
      try {
        const settingsRes = await fetchWithRetry(`${API_BASE}/widget-settings/public/${token}`)
        const settingsJson = await settingsRes.json()
        if (settingsJson.success) {
          setColorDonation(settingsJson.data.color_donation || "#FFD551")
        }
      } catch {}
    }

    init()

    // Polling every 12 seconds
    const interval = setInterval(fetchDonors, 12000)
    return () => clearInterval(interval)
  }, [token, fetchDonors])

  const formatCurrency = (amount: number, code: string) => {
    if (code === "IDR") {
      return `Rp ${Number(amount).toLocaleString("id-ID")}`
    }
    const CURRENCY_SYMBOLS: Record<string, string> = {
      USD: "$",
      MYR: "RM",
      SGD: "S$",
      PHP: "₱",
      THB: "฿"
    }
    const symbol = CURRENCY_SYMBOLS[code] || "$"
    return `${symbol}${Number(amount).toFixed(2)}`
  }

  // Filter donors by period (shared between table mode and ticker mode)
  const filteredDonors = donors.filter(d => {
    if (period === "all") return true
    if (!d.createdAt) return true
    
    const donorDate = new Date(d.createdAt)
    const now = new Date()
    
    if (period === "monthly") {
      return donorDate.getMonth() === now.getMonth() && donorDate.getFullYear() === now.getFullYear()
    }
    
    if (period === "weekly") {
      const startOfWeek = new Date(now)
      const day = now.getDay()
      const diff = now.getDate() - day + (day === 0 ? -6 : 1)
      startOfWeek.setDate(diff)
      startOfWeek.setHours(0, 0, 0, 0)
      return donorDate >= startOfWeek
    }
    
    return true
  })

  // Render Ticker Item inside Loop
  const renderTickerContent = () => {
    if (filteredDonors.length === 0) {
      return (
        <span className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#FFD551] animate-pulse shrink-0">
            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
          </svg>
          BELUM ADA DONATUR BARU UNTUK PERIODE INI. DUKUNG KREATOR FAVORIT ANDA!
        </span>
      )
    }

    return (
      <span className="flex items-center gap-8">
        {filteredDonors.map((d, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="font-black text-white text-xs md:text-sm">
              {d.name}
            </span>
            <span className="font-black text-xs md:text-sm" style={{ color: colorDonation }}>
              {formatCurrency(d.amount, d.currency)}
            </span>
            {i < filteredDonors.length - 1 && (
              <span className="text-zinc-700 font-bold ml-4 select-none">•</span>
            )}
          </span>
        ))}
      </span>
    )
  }

  // --- MODE TICKER ---
  if (mode === "ticker") {
    return (
      <div 
        className={cn(
          "fixed inset-x-0 bottom-0 h-12 backdrop-blur-md flex items-center overflow-hidden shadow-lg transition-all duration-300",
          isDark 
            ? "bg-zinc-900/80 border-t-2 border-[#FFD551]" 
            : "bg-white/90 border-t border-[#E5E3DD]"
        )}
        style={{ 
          transform: `scale(${scale})`, 
          transformOrigin: "bottom left",
          width: `${100 / scale}%`
        }}
      >
        <div 
          className={cn(
            "px-4 h-full flex items-center justify-center shrink-0 font-black italic text-[10px] uppercase border-r text-black transition-all duration-300 gap-1.5 shadow-sm",
            isDark ? "border-zinc-800" : "border-[#E5E3DD]"
          )}
          style={{ backgroundColor: colorDonation }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
          {customTitle}
        </div>
        <div className="flex-1 overflow-hidden relative w-full h-full flex items-center">
          <div className="flex w-max animate-marquee space-x-16 whitespace-nowrap px-4 items-center">
            {renderTickerContent()}
            {renderTickerContent()}
            {renderTickerContent()}
          </div>
        </div>
        <style jsx global>{`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-33.33%); }
          }
          .animate-marquee {
            animation: marquee 20s linear infinite;
          }
        `}</style>
      </div>
    )
  }

  // --- MODE TABLE (GLASSMORPHISM PANEL) ---

  // Group donors by name and sum their donation amounts
  const aggregatedDonors = Object.values(
    filteredDonors.reduce((acc, current) => {
      const key = current.name.trim().toLowerCase()
      if (!acc[key]) {
        acc[key] = { ...current }
      } else {
        acc[key].amount += current.amount
      }
      return acc
    }, {} as Record<string, typeof donors[0]>)
  ).sort((a, b) => b.amount - a.amount)

  const displayedDonors = aggregatedDonors.slice(0, 15)

  return (
    <div 
      className="p-2 w-[460px] max-w-full"
      style={{ 
        transform: `scale(${scale})`, 
        transformOrigin: "top left"
      }}
    >
      <div className={cn(
        "overflow-hidden rounded-xl border-4 border-black transition-all duration-300",
        isDark 
          ? "bg-zinc-900/90 shadow-[8px_8px_0px_#000000]" 
          : "bg-white shadow-[8px_8px_0px_#000000]"
      )}>
        
        {/* Header bar */}
        <div 
          className="px-4 py-2.5 border-b-4 border-black flex items-center justify-center text-black font-black uppercase tracking-wider italic text-[11px] gap-1.5 text-center"
          style={{ backgroundColor: colorDonation }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
            <path fillRule="evenodd" d="M5.166 2.621A1 1 0 016 3v1.077a44.478 44.478 0 0112 0V3a1 1 0 011.834-.485A4.75 4.75 0 0122 7.25c0 1.954-1.17 3.636-2.833 4.382a44.606 44.606 0 01-4.667 7.777 3.586 3.586 0 01-3.25 1.591h-2.5a3.586 3.586 0 01-3.25-1.59 44.604 44.604 0 01-4.667-7.778C2.17 10.886 1 9.204 1 7.25a4.75 4.75 0 013.166-4.629L5.166 2.62zM3 7.25a2.75 2.75 0 002.44 2.73 45.968 45.968 0 001.06 4.908c.51 1.484 1.144 2.9 1.886 4.225.204.364.498.665.864.856A1.586 1.586 0 0010 20.25h4c.3 0 .584-.083.834-.231a1.586 1.586 0 00.864-.856c.742-1.325 1.376-2.741 1.886-4.225a45.971 45.971 0 001.06-4.907A2.75 2.75 0 0021 7.25a2.75 2.75 0 00-2.75-2.75c-.2 0-.396.015-.589.044a46.216 46.216 0 00-11.322 0A2.75 2.75 0 003 7.25z" clipRule="evenodd" />
          </svg>
          {customTitle}
        </div>

        {/* Content list */}
        <div className="p-1.5 space-y-0.5 max-h-[260px] overflow-y-auto no-scrollbar">
          {displayedDonors.length === 0 ? (
            <div className="py-8 text-center text-[9px] font-black italic text-[#706E68] uppercase">
              Belum ada donatur masuk.
            </div>
          ) : (
            displayedDonors.map((d, index) => {
              const isTop3 = index < 3
              return (
                <div 
                  key={index} 
                  className={cn(
                    "flex items-center gap-2 p-1 border rounded-md transition-all duration-300",
                    isDark 
                      ? "bg-white/5 border-zinc-800/40 hover:bg-white/10" 
                      : "bg-white border-[#E5E3DD]/40 hover:bg-zinc-50"
                  )}
                >
                  {/* Rank Display: Direct raw number without No. prefix or icons */}
                  <div className={cn(
                    "font-black italic text-[9.5px] shrink-0 min-w-[18px] text-center",
                    index === 0 && "text-yellow-500",
                    index === 1 && "text-zinc-300",
                    index === 2 && "text-amber-600",
                    index > 2 && "text-zinc-500"
                  )}>
                    {index + 1}.
                  </div>

                  {/* Name & Amount */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-1">
                      <span className={cn(
                        "font-black italic text-[8.5px] md:text-[9.5px] truncate transition-colors",
                        isDark ? "text-white" : "text-[#1A1A19]"
                      )}>
                        {d.name}
                      </span>
                      <span className="font-black text-[8.5px] md:text-[9.5px] shrink-0" style={{ color: isDark ? colorDonation : (colorDonation === "#FFD551" ? "#B58A00" : colorDonation) }}>
                        {formatCurrency(d.amount, d.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default function WidgetDonorsPage() {
  return (
    <Suspense fallback={<div className="bg-transparent" />}>
      <WidgetDonorsContent />
    </Suspense>
  )
}
