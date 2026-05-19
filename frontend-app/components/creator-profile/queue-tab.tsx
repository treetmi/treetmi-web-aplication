"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, Star, Trophy } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { Badge } from "@/components/ui/badge"

interface QueueTabProps {
  creatorDbData: any
}

export function QueueTab({ creatorDbData }: QueueTabProps) {
  const { lang, t } = useLanguage()

  // Helper to mask sender names professionally
  const maskSenderName = (name: string) => {
    if (!name) return "Anonymous"
    if (name.toLowerCase() === "anonymous") return "Anonymous"
    if (name.length <= 2) return name + "**"
    const first = name.charAt(0)
    const last = name.charAt(name.length - 1)
    return `${first}**${last}`
  }

  // Helper to format relative time in Indonesian
  const formatRelativeTime = (dateString: string) => {
    try {
      const now = new Date()
      const past = new Date(dateString)
      const diffMs = now.getTime() - past.getTime()
      const diffSec = Math.floor(diffMs / 1000)
      const diffMin = Math.floor(diffSec / 60)
      const diffHrs = Math.floor(diffMin / 60)
      const diffDays = Math.floor(diffHrs / 24)

      if (diffSec < 60) return "baru saja"
      if (diffMin < 60) return `${diffMin} menit lalu`
      if (diffHrs < 24) return `${diffHrs} jam lalu`
      if (diffDays === 1) return "kemarin"
      if (diffDays < 30) return `${diffDays} hari lalu`
      
      return past.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    } catch (e) {
      return "baru saja"
    }
  }

  // Testimonials state andautoslide
  const [testiIndex, setTestiIndex] = useState(0)
  const dbReviews = creatorDbData?.reviews || []
  const testimonials = dbReviews.length > 0
    ? dbReviews.map((r: any) => ({
        name: maskSenderName(r.sender_name),
        text: r.message || "",
        rating: 5,
        time: formatRelativeTime(r.createdAt)
      }))
    : []

  useEffect(() => {
    if (testimonials.length === 0) return
    const timer = setInterval(() => {
      setTestiIndex((prev) => (prev + 1) % testimonials.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [testimonials.length])

  return (
    <div className="space-y-6">
      
      {/* 1. Mabar/Request FIFO Queue Board */}
      {creatorDbData?.show_queue !== false && (
        <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-3xl space-y-4 dark:bg-zinc-950/20 dark:border-zinc-800">
          <div className="flex justify-between items-center gap-2 pb-2 border-b border-slate-200/50 dark:border-zinc-800">
            <span className="text-xs font-black uppercase italic tracking-widest flex items-center gap-1.5 text-slate-800 dark:text-[#EAE9E4] min-w-0">
              <Clock className="h-4 w-4 text-[#FFD551] shrink-0" /> 
              <span className="truncate">{t.publicProfile?.mabarQueue || "Antrean"} {creatorDbData?.service_btn_title || "Mabar"}</span>
            </span>
            <Badge className="bg-red-500 text-white font-black italic rounded-md text-[8px] animate-pulse shrink-0">
              AKTIF
            </Badge>
          </div>

          <div className="space-y-2">
            {!(creatorDbData?.mabar_queues && creatorDbData.mabar_queues.length > 0) ? (
              <div className="p-5 bg-white rounded-2xl border border-dashed border-slate-200 text-center space-y-1 dark:bg-zinc-900 dark:border-zinc-800">
                <p className="text-[10px] font-black italic text-slate-400 uppercase tracking-wider">Antrean Saat Ini Kosong</p>
                <p className="text-[9px] font-semibold text-slate-400">
                  Kirim dukungan atau pesan slot mabar untuk antre di sini! ⚡
                </p>
              </div>
            ) : (
              <>
                {/* Playing Item */}
                {creatorDbData.mabar_queues.length > 0 && (
                  <div className="flex justify-between items-center p-3 bg-emerald-500/5 border border-emerald-500/30 rounded-2xl dark:bg-emerald-500/5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black italic text-emerald-500">01</span>
                      <div className="flex flex-col">
                        <span className="text-xs font-black italic leading-none text-slate-800 dark:text-[#EAE9E4]">
                          {creatorDbData.mabar_queues[0].ingame_nickname || creatorDbData.mabar_queues[0].transaction?.sender_name || "Donatur"}
                        </span>
                        <span className="text-[8.5px] text-slate-400 font-bold mt-1">
                          {creatorDbData.mabar_queues[0].game_package?.gameName || "Mabar Sesi"}
                        </span>
                      </div>
                    </div>
                    <span className="text-[8px] font-black italic bg-red-500 text-white px-2 py-0.5 rounded-md animate-pulse">
                      {creatorDbData.mabar_queues[0].status}
                    </span>
                  </div>
                )}

                {/* Waiting List Items */}
                {creatorDbData.mabar_queues.slice(1).map((q: any, idx: number) => {
                  const queueNum = String(idx + 2).padStart(2, "0")
                  return (
                    <div key={q.id} className="flex justify-between items-center p-3 bg-white border border-slate-200/80 rounded-2xl dark:bg-zinc-900 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black italic text-slate-400">{queueNum}</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-black italic leading-none text-slate-800 dark:text-[#EAE9E4]">
                            {q.ingame_nickname || q.transaction?.sender_name || "Donatur"}
                          </span>
                          <span className="text-[8.5px] text-slate-400 font-bold mt-1">
                            {q.game_package?.gameName || "Mabar Sesi"}
                          </span>
                        </div>
                      </div>
                      <span className="text-[8px] font-black italic border border-slate-200 text-slate-400 px-2 py-0.5 rounded-md dark:border-zinc-800">
                        {q.status}
                      </span>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </div>
      )}

      {/* 2. Testimonials feedback slider carousel */}
      {creatorDbData?.show_reviews !== false && (
        <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-3xl space-y-3.5 dark:bg-zinc-950/20 dark:border-zinc-800">
          <h3 className="text-xs font-black uppercase tracking-widest italic text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-[#FFD551] fill-current animate-pulse" /> {t.publicProfile?.reviewTitle || "Pesan Dukungan Donatur"}
          </h3>

          <div className="relative h-[86px] overflow-hidden">
            {testimonials.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-1">
                <p className="text-[10px] font-black italic text-slate-400 uppercase tracking-wider">Belum Ada Pesan Dukungan</p>
                <p className="text-[9px] font-semibold text-slate-400">Dukung kreator dan tulis pesan dukungan pertama Anda! 💬</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div 
                  key={testiIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex flex-col justify-between"
                >
                  <p className="text-xs italic leading-relaxed text-slate-500 dark:text-zinc-400 line-clamp-2">
                    "{testimonials[testiIndex].text}"
                  </p>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200/50 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9.5px] font-black italic text-red-500">{testimonials[testiIndex].name}</span>
                      <span className="text-[8.5px] font-bold text-slate-400 dark:text-zinc-600">• {testimonials[testiIndex].time}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: testimonials[testiIndex].rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-amber-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
