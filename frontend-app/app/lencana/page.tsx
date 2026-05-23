"use client"

import React, { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Award, ArrowLeft, ExternalLink, Users, Sparkles, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { PUBLIC_API } from "@/lib/api"
import { useLanguage } from "@/components/language-provider"

export default function LencanaPage() {
  const [badges, setBadges] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { lang } = useLanguage()
  const isIndo = lang === "id"

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await fetch(PUBLIC_API.trustBadges)
        const json = await res.json()
        if (json.success) {
          setBadges(json.data || [])
        }
      } catch (err) {
        console.error("Gagal mengambil data lencana:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBadges()
  }, [])

  // Dynamic Image Renderer
  const RenderBadgeIcon = ({ url, className, name }: { url: string, className?: string, name?: string }) => {
    if (!url) return null
    return (
      <img 
        src={url} 
        alt={name || "Badge"}
        className={`object-contain h-4 w-4 shrink-0 select-none ${className || ""}`}
        onError={(e) => {
          e.currentTarget.style.display = "none"
        }}
      />
    )
  }

  return (
    <main className="min-h-screen bg-[#F8F7F3] dark:bg-[#0A0A0A] flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 py-12 max-w-5xl relative z-10">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-black italic text-slate-500 hover:text-amber-500 transition-colors mb-8 cursor-pointer">
          <ArrowLeft className="size-4" /> {isIndo ? "KEMBALI KE BERANDA" : "BACK TO HOME"}
        </Link>

        {/* Hero Section */}
        <div className="text-center space-y-4 mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex h-16 w-16 rounded-[24px] bg-amber-500/10 text-amber-500 items-center justify-center mb-2 shadow-inner"
          >
            <Award className="size-9 animate-pulse" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-4xl md:text-5xl font-black italic tracking-tighter text-slate-900 dark:text-white"
          >
            {isIndo ? "LENCANA TINGKAT KREATOR" : "CREATOR BADGE TIERS"}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-sm md:text-base text-slate-500 dark:text-zinc-400 font-bold max-w-2xl mx-auto leading-relaxed"
          >
            {isIndo 
              ? "Sistem Lencana Kepercayaan Kreator. Dapatkan dukungan dari supporter unik dan tingkatkan peringkat lencana kreator Anda untuk memancarkan reputasi premium di platform!"
              : "Creator Trust Badge System. Acquire support from unique supporters and level up your creator badge to highlight a premium reputation on the platform!"}
          </motion.p>
        </div>

        {/* Dynamic Badges Display Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-44 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
          >
            {badges.map((badge, idx) => (
              <div 
                key={badge.id}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md hover:border-amber-500/50 transition-all duration-300 flex flex-col sm:flex-row items-center sm:items-start gap-6 group relative overflow-hidden"
              >
                {/* Visual Glow Backdrop */}
                <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-[#FFD551]/5 dark:bg-[#FFD551]/2 rounded-full blur-2xl group-hover:bg-[#FFD551]/10 transition-all duration-500" />
                
                {/* Badge Render Left Box */}
                <div className="h-24 w-24 shrink-0 rounded-[28px] border-2 border-slate-100 dark:border-zinc-800 bg-[#FAF9F5] dark:bg-zinc-950/40 flex items-center justify-center shadow-inner transition-all duration-300 group-hover:scale-105">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase italic shadow-md tracking-wider ${badge.bg_class} ${badge.glow_class || ""}`}>
                    <RenderBadgeIcon url={badge.badge_url} className={badge.icon_class} name={badge.name} />
                    <span>{badge.name}</span>
                  </div>
                </div>

                {/* Details Right Box */}
                <div className="flex-1 space-y-3 text-center sm:text-left">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 italic bg-amber-500/10 px-2 py-0.5 rounded-md">LEVEL {idx + 1}</span>
                      <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 font-mono">#{badge.id.substring(0, 8).toUpperCase()}</span>
                    </div>
                    <h3 className="text-xl font-black italic uppercase text-slate-800 dark:text-white leading-tight">{badge.name}</h3>
                  </div>

                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 leading-relaxed">
                    {isIndo
                      ? "Visual badge eksklusif dengan efek background dinamis dan ikon animasi orisinal untuk mempercantik profile sidebar dan widget dashboard kreator Anda."
                      : "Exclusive visual badge featuring dynamic background effects and original animated icons to embellish your profile sidebar and creator dashboard widgets."}
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs pt-1">
                    <span className="flex items-center gap-1 font-extrabold text-slate-800 dark:text-zinc-300">
                      <Users className="size-4 text-slate-400" /> Min. {badge.min_supporters} {isIndo ? "Supporter Unik" : "Unique Supporters"}
                    </span>
                    <span className="flex items-center gap-1 font-extrabold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-4" /> Live Rendered
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {badges.length === 0 && (
              <div className="col-span-2 text-center py-16 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2.5rem]">
                <Award className="h-12 w-12 text-slate-350 mx-auto mb-2" />
                <p className="text-slate-400 text-xs font-bold italic">
                  {isIndo ? "Tidak ada lencana tingkat kreator terdaftar." : "No creator badge tiers registered."}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Documentation Info & CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-slate-900 to-black dark:from-[#111] dark:to-black text-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-800/40 relative overflow-hidden"
        >
          {/* Light flare */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-[#FFD551]/5 rounded-full blur-3xl" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-4 max-w-2xl text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD551]/10 text-[#FFD551] text-[10px] font-black uppercase italic tracking-widest">
                <Sparkles className="size-3.5" /> {isIndo ? "Platform Panduan Resmi" : "Official Guidebook"}
              </span>
              <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter leading-tight uppercase">
                {isIndo ? "BUTUH PANDUAN INTEGRASI SELENGKAPNYA?" : "NEED COMPLETE INTEGRATION GUIDELINES?"}
              </h2>
              <p className="text-xs md:text-sm font-semibold text-slate-300 leading-relaxed">
                {isIndo 
                  ? "Pelajari rincian lengkap cara mendapatkan pendukung unik secara organic, tips konfigurasi widget studio untuk menampilkan alert lencana, dan panduan optimasi reputasi di platform kami."
                  : "Learn detailed steps on acquiring organic unique supporters, widget studio configuration tips to display badge alerts, and reputation optimization guides on our platform."}
              </p>
            </div>

            <a 
              href="https://docs.treetmi.id" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-[#FFD551] text-black font-black italic hover:bg-[#FFC83B] rounded-2xl h-14 px-8 text-xs shrink-0 cursor-pointer w-full md:w-auto shadow-md flex items-center justify-center gap-2 transition-colors uppercase"
            >
              {isIndo ? "Buka Dokumentasi Resmi" : "Open Official Documentation"} <ExternalLink className="size-4" />
            </a>
          </div>
        </motion.div>

      </div>

      <Footer />
    </main>
  )
}