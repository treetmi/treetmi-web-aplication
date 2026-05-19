"use client"

import React from "react"
import { TrendingUp, Calendar, Clock } from "lucide-react"
import { useCurrency } from "@/components/currency-provider"
import { useLanguage } from "@/components/language-provider"

interface ProfileSidebarProps {
  creatorDbData: any
  displayUsername: string
  config: any
  dbSchedules: any[]
  dbScheduleTitle: string
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

  const accumulated = creatorDbData
    ? (creatorDbData.target_collected !== undefined ? Number(creatorDbData.target_collected) : parseFloat(creatorDbData.balance))
    : 4500000
  const targetGoal = creatorDbData?.target_amount ? parseFloat(creatorDbData.target_amount) : 10000000
  const percent = targetGoal > 0 ? Math.min(100, Math.round((accumulated / targetGoal) * 100)) : 0
  const targetTitle = creatorDbData?.target_title || config.targetTitle

  return (
    <div className="space-y-4">
      {/* Target Progress Bar Widget */}
      {creatorDbData?.show_target !== false && (
        <div className="p-5 bg-[#FAF8F2] dark:bg-[#181818] border-2 border-zinc-950 dark:border-zinc-800 rounded-2xl space-y-3 shadow-[4px_4px_0px_#1a1a1a] dark:shadow-[4px_4px_0px_#000000]">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-black dark:text-white" />
              <span className="text-[10px] font-black uppercase italic tracking-widest text-slate-800 dark:text-[#EAE9E4]">{targetTitle}</span>
            </div>
            <span className="text-[10px] font-black italic text-red-600 dark:text-red-400">{percent}%</span>
          </div>
          
          {/* Progress bar container */}
          <div className="h-4 w-full bg-[#FAF9F6] rounded-lg overflow-hidden p-0.5 border border-zinc-950 dark:bg-[#1E1E1E]">
            <div className="h-full bg-[#FFD551] rounded-md border-r border-zinc-950 transition-all duration-500" style={{ width: `${percent}%` }} />
          </div>
          
          <div className="flex justify-between text-[9px] font-extrabold text-slate-400 uppercase italic dark:text-[#A09E96] leading-none">
            <span>{formatCurrency(accumulated)}</span>
            <span>{t.publicProfile?.target || "Target"}: {formatCurrency(targetGoal)}</span>
          </div>
        </div>
      )}

      {/* Jadwal Live Streaming Calendar Timeline */}
      {creatorDbData?.show_calendar === true && (
        <div className="p-5 bg-[#FAF8F2] dark:bg-[#181818] border-2 border-zinc-950 dark:border-zinc-800 rounded-2xl space-y-3.5 shadow-[4px_4px_0px_#1a1a1a] dark:shadow-[4px_4px_0px_#000000]">
          <div className="flex flex-col gap-0.5 pb-2 border-b border-zinc-950/60 dark:border-zinc-800/60">
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
                  formattedDate = d.toLocaleDateString("id-ID", {
                    weekday: "short",
                    day: "numeric",
                    month: "short"
                  }) + " - " + d.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit"
                  }) + " WIB"
                } catch (e) {
                  formattedDate = event.date
                }

                return (
                  <div 
                    key={event.id || idx}
                    className="p-3 bg-[#FAF9F5] border border-zinc-950/40 rounded-xl space-y-1.5 dark:bg-[#1E1E1E] transition-all hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-[1.5px_1.5px_0px_rgba(0,0,0,0.85)]"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-start gap-1.5 flex-wrap">
                        <span className="inline-block text-[8px] font-black uppercase italic bg-[#FFD551] text-black px-1.5 py-0.5 rounded border border-zinc-950 leading-none shadow-[1px_1px_0px_rgba(0,0,0,0.8)]">
                          {event.category}
                        </span>
                        <span className="text-[8.5px] font-extrabold text-red-500 italic flex items-center gap-1 dark:text-red-450">
                          <Clock className="h-3 w-3" /> {formattedDate}
                        </span>
                      </div>
                      <span className="text-[10px] font-black uppercase italic leading-tight text-slate-850 dark:text-[#EAE9E4]">
                        {event.title}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-6 text-center space-y-1">
              <span className="text-xl block">📅</span>
              <p className="text-[10px] font-extrabold italic text-slate-400 dark:text-zinc-500">
                Belum ada jadwal stream.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}