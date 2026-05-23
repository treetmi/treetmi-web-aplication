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
  
  // Custom target styling settings loaded from database
  const [targetSettings, setTargetSettings] = useState({
    target_card_title: "TARGET DONASI",
    target_canvas_transparent: false,
    target_header_bg: "#FFD551",
    target_header_text_color: "#000000",
    target_body_bg: "#1c1c1c",
    target_body_text_color: "#ffffff",
    target_progress_color: "#FFD551"
  })

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

      // Fetch customization styling from database
      try {
        const settingsRes = await fetchWithRetry(`${API_BASE}/widget-settings/public/${token}`)
        const settingsJson = await settingsRes.json()
        if (settingsJson.success && settingsJson.data) {
          const s = settingsJson.data
          setTargetSettings({
            target_card_title: s.target_card_title || "TARGET DONASI",
            target_canvas_transparent: s.target_canvas_transparent ?? false,
            target_header_bg: s.target_header_bg || s.color_donation || "#FFD551",
            target_header_text_color: s.target_header_text_color || "#000000",
            target_body_bg: s.target_body_bg || (isDark ? "#1c1c1c" : "#ffffff"),
            target_body_text_color: s.target_body_text_color || (isDark ? "#ffffff" : "#1A1A19"),
            target_progress_color: s.target_progress_color || s.color_donation || "#FFD551"
          })
        }
      } catch (err) {
        console.warn("Target Widget styling fetch error:", err)
      }
    }

    init()

    // Polling every 25 seconds
    const interval = setInterval(fetchTargetData, 25000)
    return () => clearInterval(interval)
  }, [token, fetchTargetData, isDark])

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
      <div 
        className="overflow-hidden rounded-2xl transition-all duration-300"
        style={{
          border: targetSettings.target_canvas_transparent ? "none" : `1px solid ${isDark ? "rgba(63, 63, 70, 0.4)" : "rgba(229, 227, 221, 0.8)"}`,
          backgroundColor: targetSettings.target_canvas_transparent ? "transparent" : targetSettings.target_body_bg,
          color: targetSettings.target_body_text_color,
          boxShadow: targetSettings.target_canvas_transparent ? "none" : "0 15px 40px rgba(0,0,0,0.25)"
        }}
      >
        
        {/* Header Section */}
        <div 
          className="px-4 py-3 flex items-center justify-between"
          style={{ 
            backgroundColor: targetSettings.target_canvas_transparent ? "transparent" : targetSettings.target_header_bg,
            color: targetSettings.target_header_text_color,
            borderBottom: (targetSettings.target_canvas_transparent || !targetSettings.target_header_bg) ? "none" : `1px solid ${isDark ? "rgba(63, 63, 70, 0.2)" : "rgba(229, 227, 221, 0.4)"}`
          }}
        >
          <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: targetSettings.target_header_text_color }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" style={{ fill: targetSettings.target_header_text_color }}>
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm.53 5.47a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.72-1.72v5.69a.75.75 0 001.5 0v-5.69l1.72 1.72a.75.75 0 101.06-1.06l-3-3z" clipRule="evenodd" />
            </svg>
            {targetSettings.target_card_title}
          </span>
          <span className="text-[9px] font-black tracking-widest px-2 py-0.5 rounded italic bg-black/15" style={{ color: targetSettings.target_header_text_color }}>
            {data.percentage}%
          </span>
        </div>

        {/* Body Section */}
        <div className="p-4 space-y-3.5 text-left">
          
          {/* Title */}
          <h4 
            className="text-xs md:text-sm font-black uppercase tracking-wide truncate leading-tight"
            style={{ color: targetSettings.target_body_text_color }}
          >
            {data.title}
          </h4>

          {/* Progress Bar Track */}
          <div className={cn(
            "h-3.5 w-full rounded-full overflow-hidden relative p-[1px] border shadow-inner",
            isDark ? "bg-black/40 border-zinc-800/50" : "bg-zinc-200/50 border-zinc-300/40"
          )}>
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: `${cappedPercentage}%`, 
                background: `linear-gradient(90deg, ${targetSettings.target_progress_color}dd 0%, ${targetSettings.target_progress_color} 100%)`,
                boxShadow: `0 0 8px ${targetSettings.target_progress_color}bb`
              }}
            />
          </div>

          {/* Bottom Details (Collected vs Target) */}
          <div className="flex justify-between items-center text-[10px] font-black italic">
            <span style={{ color: targetSettings.target_body_text_color }}>
              {formatCurrency(data.collected_amount)}
            </span>
            <span className="text-zinc-500 opacity-60">/</span>
            <span style={{ color: targetSettings.target_progress_color }}>
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
