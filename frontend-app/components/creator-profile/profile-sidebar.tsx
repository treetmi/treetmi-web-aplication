"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { TrendingUp, Calendar, Clock, Sparkles, Trophy, Coins, Heart } from "lucide-react"
import { useCurrency } from "@/components/currency-provider"
import { useLanguage } from "@/components/language-provider"

interface ProfileSidebarProps {
  creatorDbData: any
  displayUsername: string
  config: any
  dbSchedules: any[]
  dbScheduleTitle: string
}

function SidebarGachaWheel({ items }: { items: any[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rotationRef = useRef(0)
  const animFrameRef = useRef<number | null>(null)
  const logoImageRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const img = new Image()
      img.src = localStorage.getItem("treetmi_icon_url") || localStorage.getItem("treetmi_logo_url") || "/favicon.ico"
      img.onload = () => {
        logoImageRef.current = img
      }
    }
  }, [])

  const drawWheel = useCallback((wheelItems: any[], angle: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) - 10

    ctx.clearRect(0, 0, width, height)

    const numSlices = wheelItems.length
    if (numSlices === 0) return
    const sliceAngle = (2 * Math.PI) / numSlices

    // Outer gold border with shadow
    ctx.save()
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius + 4, 0, 2 * Math.PI)
    ctx.fillStyle = "#18181b"
    ctx.strokeStyle = "#FFD551"
    ctx.lineWidth = 4
    ctx.fill()
    ctx.stroke()
    ctx.restore()

    for (let i = 0; i < numSlices; i++) {
      const startAngle = i * sliceAngle + angle
      const endAngle = (i + 1) * sliceAngle + angle

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()

      // Default fallback colors
      const defaultColors = ["#18181b", "#27272a"]
      ctx.fillStyle = wheelItems[i].color || defaultColors[i % defaultColors.length]
      ctx.fill()

      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
      ctx.lineWidth = 1
      ctx.stroke()

      // Small text labels
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(startAngle + sliceAngle / 2)
      ctx.textAlign = "right"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "#FFFFFF"
      // Dynamic font size based on text length to prevent clipping & maintain readability
      const name = wheelItems[i].name
      let fontSize = 8
      if (name.length > 8) fontSize = 7
      if (name.length > 12) fontSize = 6
      ctx.font = `bold ${fontSize}px system-ui`
      
      const displayText = name.length > 15 ? name.substring(0, 15) + ".." : name
      ctx.fillText(displayText, radius - 12, 0)
      ctx.restore()
    }

    // Center peg
    ctx.save()
    ctx.beginPath()
    ctx.arc(centerX, centerY, 14, 0, 2 * Math.PI)
    ctx.fillStyle = "#18181b"
    ctx.strokeStyle = "#FFD551"
    ctx.lineWidth = 2.5
    ctx.fill()
    ctx.stroke()
    
    const img = logoImageRef.current
    if (img && img.complete) {
      const imgSize = 20
      ctx.save()
      ctx.beginPath()
      ctx.arc(centerX, centerY, 12, 0, 2 * Math.PI)
      ctx.clip()
      ctx.drawImage(img, centerX - imgSize / 2, centerY - imgSize / 2, imgSize, imgSize)
      ctx.restore()
    } else {
      ctx.fillStyle = "#FFD551"
      ctx.font = "bold 9px system-ui"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("🎁", centerX, centerY)
      ctx.restore()
    }
  }, [])

  useEffect(() => {
    const animate = () => {
      rotationRef.current += 0.003
      drawWheel(items, rotationRef.current)
      animFrameRef.current = requestAnimationFrame(animate)
    }
    animate()
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [items, drawWheel])

  return (
    <div className="relative flex flex-col items-center justify-center py-2">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={180}
          height={180}
          className="max-w-full h-auto drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
        />
        {/* Pointer at the top */}
        <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 z-10 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
          <svg width="14" height="20" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 42L0 12L32 12L16 42Z" fill="#FFD551" />
            <circle cx="16" cy="12" r="10" fill="#FFD551" />
            <circle cx="16" cy="12" r="5" fill="#18181b" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export function ProfileSidebar({
  creatorDbData,
  displayUsername,
  config,
  dbSchedules,
  dbScheduleTitle
}: ProfileSidebarProps) {
  const { currency, convertFromIdr, format: formatCurrency } = useCurrency()
  const { lang, t } = useLanguage()
  const isIndo = lang === "id"
  const [leaderboardTab, setLeaderboardTab] = useState<"TOP_ALL" | "TOP_MONTH" | "RECENT">("TOP_ALL")

  const accumulated = creatorDbData
    ? (creatorDbData.target_collected !== undefined ? Number(creatorDbData.target_collected) : parseFloat(creatorDbData.balance))
    : 4500000
  const targetGoal = creatorDbData?.target_amount ? parseFloat(creatorDbData.target_amount) : 10000000
  const percent = targetGoal > 0 ? Math.min(100, Math.round((accumulated / targetGoal) * 100)) : 0
  const widgetTitle = creatorDbData?.widget_setting?.target_card_title || (isIndo ? "TARGET DONASI" : "DONATION GOAL")
  const targetName = creatorDbData?.target_title || config.targetTitle || (isIndo ? "Target Donasi" : "Donation Goal")

  return (
    <div className="space-y-4">
      {/* Target Progress Bar Widget */}
      {creatorDbData?.show_target !== false && (
        <div className="p-5 bg-[#FAF8F2] dark:bg-[#181818] border border-zinc-950 dark:border-zinc-800 rounded-2xl space-y-3 shadow-[3px_3px_0px_#1a1a1a] dark:shadow-[3px_3px_0px_#000000]">
          <div className="flex justify-between items-end pb-1 border-b border-zinc-950/20 dark:border-zinc-800/50">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-black dark:text-[#FFD551]" />
              <span className="text-[10px] font-black uppercase italic tracking-widest text-slate-800 dark:text-[#FFD551]">{widgetTitle}</span>
            </div>
            <span className="text-[10px] font-black italic text-red-600 dark:text-red-400">{percent}%</span>
          </div>

          {/* Nama Target */}
          <div className="text-[11px] font-black uppercase tracking-wide text-slate-700 dark:text-zinc-300 truncate pt-1 text-left">
            {targetName}
          </div>
          
          {/* Progress bar container */}
          <div className="h-4 w-full bg-[#FAF9F6] rounded-lg overflow-hidden p-0.5 border border-zinc-950 dark:bg-[#1E1E1E] dark:border-zinc-800 shadow-[1px_1px_0px_#1a1a1a] dark:shadow-none">
            <div className="h-full bg-[#FFD551] rounded-md border-r border-amber-400 transition-all duration-500" style={{ width: `${percent}%` }} />
          </div>
          
          <div className="flex justify-between text-[9px] font-extrabold text-slate-600 uppercase italic dark:text-[#C8C6BC] leading-none">
            <span>{formatCurrency(accumulated)}</span>
            <span>{t.publicProfile?.target || (isIndo ? "Target" : "Goal")}: {formatCurrency(targetGoal)}</span>
          </div>
        </div>
      )}

      {/* Sidebar Gacha Wheel Preview Widget */}
      {creatorDbData?.gacha_setting?.is_enabled && (
        <div className="p-5 bg-[#FAF8F2] dark:bg-[#181818] border border-zinc-950 dark:border-zinc-800 rounded-2xl space-y-3 text-center shadow-[3px_3px_0px_#1a1a1a] dark:shadow-[3px_3px_0px_#000000]">
          <div className="flex flex-col gap-0.5 pb-2 border-b border-zinc-950/20 dark:border-zinc-800/60 items-start">
            <span className="text-[10px] font-black uppercase italic tracking-widest flex items-center gap-1.5 text-slate-800 dark:text-[#EAE9E4]">
              <Sparkles className="h-4 w-4 text-[#FFD551]" /> {isIndo ? "Gacha Challenge Aktif" : "Gacha Challenge Active"}
            </span>
          </div>

          <SidebarGachaWheel items={creatorDbData.gacha_wheel_items || []} />

          <div className="space-y-1.5 mt-2">
            <p className="text-[9px] font-extrabold uppercase text-slate-700 dark:text-zinc-300">
              {isIndo ? "Min. Dukungan Gacha:" : "Min. Gacha Support:"}
            </p>
            <p className="text-sm font-black text-black bg-[#FFD551] border border-zinc-950 py-1.5 px-4 rounded-xl inline-block leading-none shadow-[2px_2px_0px_#1a1a1a] dark:text-black dark:border-zinc-950">
              Rp {Number(creatorDbData.gacha_setting.min_donation).toLocaleString("id-ID")}
            </p>
            <p className="text-[9px] font-bold text-slate-600 dark:text-zinc-400 italic mt-1.5 leading-normal pb-2 border-b border-zinc-950/20 dark:border-zinc-800/40">
              {isIndo 
                ? "Kirim dukungan minimal sebesar batas di atas untuk memutar roda hadiah langsung di layar stream!" 
                : "Send minimum support of the amount above to spin the prize wheel live on the stream screen!"}
            </p>
          </div>

          {/* Recent Gacha Rolls History */}
          {creatorDbData.gacha_logs && creatorDbData.gacha_logs.length > 0 && (
            <div className="pt-2 text-left space-y-2">
              <span className="text-[9px] font-black uppercase italic tracking-wider text-slate-700 dark:text-[#EAE9E4] flex items-center gap-1">
                {isIndo ? "5 PUTARAN TERAKHIR:" : "LAST 5 ROLLS:"}
              </span>
              <div className="overflow-hidden border border-zinc-950 dark:border-zinc-800 rounded-xl bg-[#FAF9F5]/30 dark:bg-zinc-950/30 shadow-[1.5px_1.5px_0px_#1a1a1a] dark:shadow-[1.5px_1.5px_0px_#000000]">
                <div className="max-h-[140px] overflow-y-auto divide-y divide-zinc-950/20 dark:divide-zinc-800/20">
                  {creatorDbData.gacha_logs.slice(0, 5).map((log: any, idx: number) => {
                    const matchedItem = (creatorDbData.gacha_wheel_items || []).find(
                      (it: any) => it.name.toLowerCase() === log.reward_name.toLowerCase()
                    )
                    const prizeColor = matchedItem?.color || "#FFD551"
                    return (
                      <div key={log.id || idx} className="flex justify-between items-center py-3 px-3.5 text-xs font-bold leading-tight">
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="text-zinc-950 dark:text-white font-black truncate max-w-[105px] text-xs md:text-sm">
                            {log.donor_name}
                          </span>
                          <span className="text-[10px] md:text-xs text-slate-700 dark:text-zinc-300 font-extrabold italic">
                            Rp {Number(log.amount).toLocaleString("id-ID")}
                          </span>
                        </div>
                        <span 
                          className="px-2 py-0.5 text-[9px] md:text-[10px] font-black uppercase italic rounded-md flex items-center gap-1.5 max-w-[120px] truncate border text-zinc-900 dark:text-white"
                          style={{
                            backgroundColor: `${prizeColor}15`,
                            borderColor: `${prizeColor}35`
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: prizeColor }} />
                          {log.reward_name}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top Supporters / Donation History Leaderboard Widget */}
      {creatorDbData && (
        <div className="p-5 bg-[#FAF8F2] dark:bg-[#181818] border border-zinc-950 dark:border-zinc-800 rounded-2xl space-y-3.5 shadow-[3px_3px_0px_#1a1a1a] dark:shadow-[3px_3px_0px_#000000]">
          {/* Header tabs selector */}
          <div className="flex bg-[#FAF9F6] border border-zinc-950 p-1 rounded-xl dark:bg-zinc-950/40 dark:border-zinc-800 text-[9px] font-black uppercase italic shadow-[1px_1px_0px_#1a1a1a] dark:shadow-none">
            <button
              type="button"
              onClick={() => setLeaderboardTab("TOP_ALL")}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
                leaderboardTab === "TOP_ALL"
                  ? "bg-[#FFD551] text-black border border-zinc-950 shadow-[1px_1px_0px_#1a1a1a] dark:shadow-none"
                  : "text-slate-700 hover:text-black dark:text-zinc-300 dark:hover:text-white"
              }`}
            >
              SULTAN ALL-TIME
            </button>
            <button
              type="button"
              onClick={() => setLeaderboardTab("TOP_MONTH")}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
                leaderboardTab === "TOP_MONTH"
                  ? "bg-[#FFD551] text-black border border-zinc-950 shadow-[1px_1px_0px_#1a1a1a] dark:shadow-none"
                  : "text-slate-700 hover:text-black dark:text-zinc-300 dark:hover:text-white"
              }`}
            >
              {isIndo ? "BULAN INI" : "THIS MONTH"}
            </button>
            <button
              type="button"
              onClick={() => setLeaderboardTab("RECENT")}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
                leaderboardTab === "RECENT"
                  ? "bg-[#FFD551] text-black border border-zinc-950 shadow-[1px_1px_0px_#1a1a1a] dark:shadow-none"
                  : "text-slate-700 hover:text-black dark:text-zinc-300 dark:hover:text-white"
              }`}
            >
              {isIndo ? "TERAKHIR" : "RECENT"}
            </button>
          </div>

          {/* Tab 1: Top Sultan All-Time */}
          {leaderboardTab === "TOP_ALL" && (
            <div className="space-y-2 text-left">
              <span className="text-[10px] font-black uppercase italic tracking-wider text-slate-700 dark:text-[#EAE9E4] flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-[#FFD551] fill-current" /> {isIndo ? "10 TOP SULTAN (ALL-TIME)" : "10 TOP SULTANS (ALL-TIME)"}
              </span>
              {creatorDbData.top_supporters_all_time && creatorDbData.top_supporters_all_time.length > 0 ? (
                <div className="overflow-hidden border border-zinc-950 dark:border-zinc-800 rounded-xl bg-[#FAF9F5]/30 dark:bg-zinc-950/30 shadow-[1.5px_1.5px_0px_#1a1a1a] dark:shadow-[1.5px_1.5px_0px_#000000]">
                  <div className="divide-y divide-zinc-950/20 dark:divide-zinc-800/20 max-h-[220px] overflow-y-auto">
                    {creatorDbData.top_supporters_all_time.map((sup: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center py-2.5 px-3.5 text-xs font-bold leading-tight">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[9px] font-black border border-slate-200 ${
                            idx === 0 ? "bg-[#FFD551] text-zinc-950 animate-pulse" :
                            idx === 1 ? "bg-slate-300 text-zinc-950" :
                            idx === 2 ? "bg-amber-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400"
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="text-zinc-950 dark:text-white font-black truncate max-w-[120px]">
                            {sup.sender_name}
                          </span>
                        </div>
                        <span className="text-black bg-[#FFD551] border border-zinc-950 py-0.5 px-2 rounded-md text-[10px] shadow-[1px_1px_0px_#1a1a1a] dark:text-black dark:border-zinc-950 shrink-0 font-black italic">
                          Rp {Number(sup.gross_amount).toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 italic text-center py-4">{isIndo ? "Belum ada donatur." : "No supporters yet."}</p>
              )}
            </div>
          )}

          {/* Tab 2: Top Sultan This Month */}
          {leaderboardTab === "TOP_MONTH" && (
            <div className="space-y-2 text-left">
              <span className="text-[10px] font-black uppercase italic tracking-wider text-slate-700 dark:text-[#EAE9E4] flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-[#FFD551] fill-current" /> {isIndo ? "10 TOP SULTAN BULAN INI" : "10 TOP SULTANS THIS MONTH"}
              </span>
              {creatorDbData.top_supporters_month && creatorDbData.top_supporters_month.length > 0 ? (
                <div className="overflow-hidden border border-zinc-950 dark:border-zinc-800 rounded-xl bg-[#FAF9F5]/30 dark:bg-zinc-950/30 shadow-[1.5px_1.5px_0px_#1a1a1a] dark:shadow-[1.5px_1.5px_0px_#000000]">
                  <div className="divide-y divide-zinc-950/20 dark:divide-zinc-800/20 max-h-[220px] overflow-y-auto">
                    {creatorDbData.top_supporters_month.map((sup: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center py-2.5 px-3.5 text-xs font-bold leading-tight">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[9px] font-black border border-slate-200 ${
                            idx === 0 ? "bg-[#FFD551] text-zinc-950 animate-pulse" :
                            idx === 1 ? "bg-slate-300 text-zinc-950" :
                            idx === 2 ? "bg-amber-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400"
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="text-zinc-950 dark:text-white font-black truncate max-w-[120px]">
                            {sup.sender_name}
                          </span>
                        </div>
                        <span className="text-black bg-[#FFD551] border border-zinc-950 py-0.5 px-2 rounded-md text-[10px] shadow-[1px_1px_0px_#1a1a1a] dark:text-black dark:border-zinc-950 shrink-0 font-black italic">
                          Rp {Number(sup.gross_amount).toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 italic text-center py-4">{isIndo ? "Belum ada donatur bulan ini." : "No supporters this month."}</p>
              )}
            </div>
          )}

          {/* Tab 3: Recent Donations */}
          {leaderboardTab === "RECENT" && (
            <div className="space-y-2 text-left">
              <span className="text-[10px] font-black uppercase italic tracking-wider text-slate-700 dark:text-[#EAE9E4] flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-red-500 fill-current" /> {isIndo ? "5 DUKUNGAN TERAKHIR" : "5 LATEST SUPPORTS"}
              </span>
              {creatorDbData.recent_donations && creatorDbData.recent_donations.length > 0 ? (
                <div className="overflow-hidden border border-zinc-950 dark:border-zinc-800 rounded-xl bg-[#FAF9F5]/30 dark:bg-zinc-950/30 shadow-[1.5px_1.5px_0px_#1a1a1a] dark:shadow-[1.5px_1.5px_0px_#000000]">
                  <div className="divide-y divide-zinc-950/20 dark:divide-zinc-800/20 max-h-[220px] overflow-y-auto">
                    {creatorDbData.recent_donations.map((don: any, idx: number) => (
                      <div key={don.id || idx} className="py-2.5 px-3.5 space-y-1">
                        <div className="flex justify-between items-center text-xs font-bold leading-tight">
                          <span className="text-zinc-950 dark:text-white font-black truncate max-w-[130px]">
                            {don.sender_name}
                          </span>
                          <span className="text-black bg-[#FFD551] border border-zinc-950 py-0.5 px-2 rounded-md text-[10px] shadow-[1px_1px_0px_#1a1a1a] dark:text-black dark:border-zinc-950 shrink-0 font-black italic">
                            Rp {Number(don.gross_amount).toLocaleString("id-ID")}
                          </span>
                        </div>
                        {don.message && (
                          <p className="text-[10px] font-medium text-slate-700 dark:text-zinc-300 leading-normal italic bg-white/40 dark:bg-zinc-900/20 p-2 rounded-lg border border-zinc-950/10">
                            "{don.message}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 italic text-center py-4">{isIndo ? "Belum ada donasi masuk." : "No donations received yet."}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Jadwal Live Streaming Calendar Timeline */}
      {creatorDbData?.show_calendar === true && (
        <div className="p-5 bg-[#FAF8F2] dark:bg-[#181818] border border-zinc-950 dark:border-zinc-800 rounded-2xl space-y-3.5 shadow-[3px_3px_0px_#1a1a1a] dark:shadow-[3px_3px_0px_#000000]">
          <div className="flex flex-col gap-0.5 pb-2 border-b border-zinc-950/20 dark:border-zinc-800/60">
            <span className="text-[10px] font-black uppercase italic tracking-widest flex items-center gap-1.5 text-slate-800 dark:text-[#EAE9E4]">
              <Calendar className="h-4 w-4 text-[#FFD551] fill-current" /> {dbScheduleTitle}
            </span>
          </div>

          {dbSchedules.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {dbSchedules.map((event: any, idx: number) => {
                let formattedDate = ""
                try {
                  const d = new Date(event.date)
                  formattedDate = d.toLocaleDateString(isIndo ? "id-ID" : "en-US", {
                    weekday: "short",
                    day: "numeric",
                    month: "short"
                  }) + " - " + d.toLocaleTimeString(isIndo ? "id-ID" : "en-US", {
                    hour: "2-digit",
                    minute: "2-digit"
                  }) + (isIndo ? " WIB" : " GMT+7")
                } catch (e) {
                  formattedDate = event.date
                }

                return (
                  <div 
                    key={event.id || idx}
                    className="p-4 bg-[#FAF9F5] border border-zinc-950 rounded-xl space-y-2 dark:bg-[#1E1E1E] transition-all hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-[1.5px_1.5px_0px_#1a1a1a] dark:shadow-[1.5px_1.5px_0px_#000000]"
                  >
                    <div className="flex flex-col gap-1.5 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-block text-[10px] font-black uppercase italic bg-[#FFD551] text-black px-2 py-1 rounded border border-[#FFC83B] leading-none shadow-sm">
                          {event.category}
                        </span>
                        <span className="text-[11px] font-extrabold text-red-500 italic flex items-center gap-1 dark:text-red-450">
                          <Clock className="h-3.5 w-3.5" /> {formattedDate}
                        </span>
                      </div>
                      <span className="text-xs md:text-sm font-black uppercase italic leading-tight text-slate-850 dark:text-[#EAE9E4]">
                        {event.title}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-6 text-center space-y-2">
              <Calendar className="h-5 w-5 text-slate-400 mx-auto" />
              <p className="text-[10px] font-extrabold italic text-slate-400 dark:text-zinc-500">
                {isIndo ? "Belum ada jadwal stream." : "No stream schedule yet."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}