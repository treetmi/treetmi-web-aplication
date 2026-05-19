"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { fetchWithRetry } from "@/lib/api"
import { cn } from "@/lib/utils"

import { API_BASE_URL } from "@/lib/api"
const API_BASE = API_BASE_URL

interface TargetData {
  title: string
  target_amount: number
  collected_amount: number
  percentage: number
  show_target: boolean
}

function WidgetTargetContent() {
  const params = useParams()
  const searchParams = useSearchParams()

  const token = Array.isArray(params?.token) ? params.token[0] : params?.token
  const scaleStr = searchParams?.get("scale")
  const scale = scaleStr ? parseFloat(scaleStr) : 1.5 // Default to 1.5 for ultra legibility
  const themeParam = searchParams?.get("theme") || "dark"
  const isDark = themeParam === "dark"

  const [data, setData] = useState<TargetData | null>(null)
  const [colorDonation, setColorDonation] = useState("#FFD551") // Yellow accent default

  const fetchTargetData = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetchWithRetry(`${API_BASE}/users/target-overlay/${token}`)
      const json = await res.json()
      if (json.success && json.data) {
        setData(json.data)
      }
    } catch (err) {
      console.warn("Target Widget: gagal ambil data (backend mungkin belum siap)", err)
    }
  }, [token])

  useEffect(() => {
    if (!token) return

    const init = async () => {
      await fetchTargetData()

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

    // Polling every 25 seconds
    const interval = setInterval(fetchTargetData, 25000)
    return () => clearInterval(interval)
  }, [token, fetchTargetData])

  if (!data || !data.show_target) {
    return <div className="bg-transparent" />
  }

  const formatCurrency = (amount: number) => {
    return `Rp ${Number(amount).toLocaleString("id-ID")}`
  }

  // Ensure percentage is capped at 100 for visual bar
  const cappedPercentage = Math.min(data.percentage, 100)

  return (
    <div 
      className="p-4 w-[460px] max-w-full"
      style={{ 
        transform: `scale(${scale})`, 
        transformOrigin: "top left"
      }}
    >
      <div className={cn(
        "overflow-hidden rounded-2xl border transition-all duration-300 shadow-[0_15px_40px_rgba(0,0,0,0.25)]",
        isDark 
          ? "border-zinc-800/40 bg-zinc-900/45 backdrop-blur-md text-white" 
          : "border-[#E5E3DD]/80 bg-white/70 backdrop-blur-md text-[#1A1A19]"
      )}>
        
        {/* Header Section - Colored Background (First Color) */}
        <div 
          className="px-4 py-3 flex items-center justify-between text-black"
          style={{ backgroundColor: colorDonation }}
        >
          <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-black">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm.53 5.47a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.72-1.72v5.69a.75.75 0 001.5 0v-5.69l1.72 1.72a.75.75 0 101.06-1.06l-3-3z" clipRule="evenodd" />
            </svg>
            TARGET DONASI
          </span>
          <span className="text-[9px] font-black tracking-widest px-2 py-0.5 rounded italic bg-black/15 text-black">
            {data.percentage}%
          </span>
        </div>

        {/* Body Section - Frosted Glass Background (Second Color) */}
        <div className="p-4 space-y-3.5">
          
          {/* Title */}
          <h4 className={cn(
            "text-xs md:text-sm font-black uppercase tracking-wide truncate leading-tight text-center",
            isDark ? "text-zinc-100" : "text-zinc-900"
          )}>
            {data.title}
          </h4>

          {/* High-Tech Progress Bar Track */}
          <div className={cn(
            "h-3.5 w-full rounded-full overflow-hidden relative p-[1px] border shadow-inner",
            isDark ? "bg-black/40 border-zinc-800/50" : "bg-zinc-200/50 border-zinc-300/40"
          )}>
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: `${cappedPercentage}%`, 
                background: `linear-gradient(90deg, ${colorDonation}dd 0%, ${colorDonation} 100%)`,
                boxShadow: `0 0 8px ${colorDonation}bb`
              }}
            />
          </div>

          {/* Bottom Details (Collected vs Target) */}
          <div className="flex justify-between items-center text-[10px] font-black italic">
            <span className={isDark ? "text-zinc-200" : "text-zinc-700"}>
              {formatCurrency(data.collected_amount)}
            </span>
            <span className="text-zinc-500 opacity-60">/</span>
            <span style={{ color: colorDonation === "#FFD551" ? (isDark ? "#FFD551" : "#B58A00") : colorDonation }}>
              {formatCurrency(data.target_amount)}
            </span>
          </div>

        </div>

      </div>
    </div>
  )
}

export default function WidgetTargetPage() {
  return (
    <Suspense fallback={<div className="bg-transparent" />}>
      <WidgetTargetContent />
    </Suspense>
  )
}
