"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { useLanguage } from "@/components/language-provider"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Trophy, 
  Crown, 
  Star, 
  Search, 
  Gamepad2, 
  Sparkles, 
  Tv, 
  Camera, 
  ArrowRight,
  ArrowUpRight,
  Code2,
  Music4,
  Palette,
  Globe,
  Loader2,
  ServerOff,
  Lock,
  Hourglass
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Footer } from "@/components/footer"
import { API_BASE_URL, PUBLIC_API } from "@/lib/api"

// ─── Types ────────────────────────────────────────────────────────────────────
interface CreatorFromDB {
  id: string
  username: string
  name: string
  bio: string | null
  role_title: string
  avatar_url: string
  banner_url: string | null
  is_verified: boolean
  is_live: boolean
  status: string
  gtv: number
  support_count: number
  supporter_count: number
}

type Category = "ALL" | "GAMING" | "CREATIVE" | "TECH" | "MUSIC"

interface CreatorCard extends CreatorFromDB {
  category: Category
  backgroundColor: string
  textColor: string
  borderColor: string
  avatarChar: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function detectCategory(roleTitle: string): Category {
  const r = roleTitle.toLowerCase()
  if (r.includes("dev") || r.includes("code") || r.includes("tech") || r.includes("programmer") || r.includes("engineer") || r.includes("software")) return "TECH"
  if (r.includes("design") || r.includes("art") || r.includes("artist") || r.includes("draw") || r.includes("creative") || r.includes("ui") || r.includes("ux")) return "CREATIVE"
  if (r.includes("sing") || r.includes("song") || r.includes("music") || r.includes("vtuber") || r.includes("vocal") || r.includes("acoustic")) return "MUSIC"
  return "GAMING"
}

function getCategoryStyle(cat: Category): { bg: string; text: string; border: string } {
  switch (cat) {
    case "TECH":     return { bg: "from-emerald-400 to-teal-500",  text: "text-emerald-500", border: "border-emerald-400/40" }
    case "CREATIVE": return { bg: "from-purple-400 to-indigo-500", text: "text-purple-500",  border: "border-purple-400/40" }
    case "MUSIC":    return { bg: "from-cyan-400 to-blue-500",     text: "text-cyan-500",    border: "border-cyan-400/40" }
    default:         return { bg: "from-amber-400 to-[#FFD551]",   text: "text-amber-500",   border: "border-amber-400/40" }
  }
}

function mapToCard(user: CreatorFromDB): CreatorCard {
  const cat = detectCategory(user.role_title)
  const style = getCategoryStyle(cat)
  return {
    ...user,
    category: cat,
    backgroundColor: style.bg,
    textColor: style.text,
    borderColor: style.border,
    avatarChar: (user.name || user.username).charAt(0).toUpperCase()
  }
}

export default function PublicLeaderboard() {
  const { lang } = useLanguage()
  const isIndo = lang === "id"

  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [creators, setCreators] = useState<CreatorCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<Category>("ALL")

  useEffect(() => {
    const loadPageData = async () => {
      setIsLoading(true)
      setFetchError(false)
      try {
        // 1. Fetch public settings to check toggle
        const settingsRes = await fetch(PUBLIC_API.publicSettings)
        const settingsJson = await settingsRes.json()
        const configShow = settingsJson.success && settingsJson.data?.showLeaderboard === true
        setShowLeaderboard(configShow)

        // 2. Fetch public creators
        const creatorsRes = await fetch(`${API_BASE_URL}/users/creators`)
        const creatorsJson = await creatorsRes.json()

        if (creatorsJson.success && Array.isArray(creatorsJson.data)) {
          // Filter out suspended creators and map cards
          const activeCreators = creatorsJson.data
            .filter((c: CreatorFromDB) => c.status !== "SUSPENDED")
            .map(mapToCard)
          setCreators(activeCreators)
        } else {
          setFetchError(true)
        }
      } catch (err) {
        console.error("Gagal mengambil data leaderboard:", err)
        setFetchError(true)
      } finally {
        setIsLoading(false)
      }
    }
    loadPageData()
  }, [])

  // Calculate filtered rankings sorted by GTV descending
  const rankedCreators = useMemo(() => {
    return [...creators].sort((a, b) => b.gtv - a.gtv)
  }, [creators])

  // Get absolute top 3 for the podium
  const podiumCreators = useMemo(() => {
    return rankedCreators.slice(0, 3)
  }, [rankedCreators])

  // Filter creators for the list table & podium categories
  const filteredCreators = useMemo(() => {
    return rankedCreators.filter((c) => {
      const matchesSearch = c.username.toLowerCase().includes(searchQuery.toLowerCase()) || c.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = activeCategory === "ALL" || c.category === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [rankedCreators, searchQuery, activeCategory])

  // Arrange podium: Rank 2 on the left, Rank 1 in the middle, Rank 3 on the right
  const arrangedPodium = useMemo(() => {
    const result = [null, null, null] as (CreatorCard | null)[]
    if (podiumCreators[1]) result[0] = podiumCreators[1] // Rank 2
    if (podiumCreators[0]) result[1] = podiumCreators[0] // Rank 1
    if (podiumCreators[2]) result[2] = podiumCreators[2] // Rank 3
    return result
  }, [podiumCreators])

  return (
    <main className="min-h-screen bg-[#F8F7F3] selection:bg-[#FFD551] selection:text-black flex flex-col font-sans transition-colors duration-300 dark:bg-[#0A0A0A] dark:selection:bg-[#FFD551] dark:selection:text-black relative overflow-hidden">
      <Navbar />

      {/* BACKGROUND FLOATING DECORATIONS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 opacity-[0.03] dark:opacity-[0.06]">
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 12, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[12%] left-[3%] text-[#1A1A19] dark:text-[#EAE9E4]"
        >
          <Gamepad2 className="w-48 h-48" strokeWidth={1} />
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[25%] right-[5%] text-[#1A1A19] dark:text-[#EAE9E4]"
        >
          <Camera className="w-40 h-40" strokeWidth={1} />
        </motion.div>

        <motion.div 
          animate={{ scale: [1, 1.12, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[15%] left-[6%] text-[#1A1A19] dark:text-[#EAE9E4]"
        >
          <Sparkles className="w-36 h-36" strokeWidth={1} />
        </motion.div>

        <motion.div 
          animate={{ y: [0, -15, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-[22%] right-[10%] text-[#1A1A19] dark:text-[#EAE9E4]"
        >
          <Tv className="w-48 h-48" strokeWidth={1} />
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center relative z-10 w-full pt-0">
        {isLoading ? (
          // BEAUTIFUL LOADING SCREEN
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="h-10 w-10 text-[#FFD551] animate-spin" />
            <p className="text-xs font-black italic uppercase tracking-wider text-slate-500 dark:text-zinc-550">
              {isIndo ? "Memuat Papan Peringkat..." : "Loading Leaderboard..."}
            </p>
          </div>
        ) : fetchError ? (
          // ERROR SCREEN
          <div className="text-center py-20 px-4 max-w-md mx-auto">
            <div className="size-16 rounded-2xl bg-red-100 dark:bg-zinc-900 text-red-550 flex items-center justify-center mx-auto mb-4 border border-red-200/50">
              <ServerOff className="size-8" />
            </div>
            <h3 className="text-lg font-display font-black text-slate-800 dark:text-[#EAE9E4]">
              {isIndo ? "Gagal Memuat Data" : "Failed to Load Data"}
            </h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-[#A09E96] mt-2">
              {isIndo
                ? "Tidak dapat terhubung ke server. Pastikan backend berjalan dan coba kembali."
                : "Unable to retrieve leaderboard stats. Please check connection and try again."}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-6 h-11 px-6 rounded-xl text-xs font-black italic bg-slate-900 text-white dark:bg-[#FFD551] dark:text-black hover:opacity-90"
            >
              {isIndo ? "Coba Lagi" : "Try Again"}
            </Button>
          </div>
        ) : !showLeaderboard ? (
          // PREMIUM BENTO CARD SPLASH "COMING SOON" PAGE
          <section className="container mx-auto px-4 max-w-[1200px] pt-0 pb-16 flex flex-col items-center">
            {/* Hero Banner Image */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-[900px] mb-2 -mt-40"
            >
              <img 
                src="/hero/hero-section-leaderboard.webp" 
                alt="Treetmi Leaderboard Hero" 
                className="w-full h-auto rounded-[3rem]"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="w-full max-w-[900px] grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Main Bento Hero Card */}
              <div className="md:col-span-2 bg-white dark:bg-[#121211] border-3 border-black rounded-[3rem] p-8 md:p-12 shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.05)] flex flex-col justify-between min-h-[350px] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD551]/10 rounded-bl-full pointer-events-none" />
                
                <div>
                  <div className="inline-flex items-center gap-2 bg-[#FFD551] text-black px-4 py-1.5 font-display font-black uppercase text-[10px] rounded-full border-2 border-black tracking-wider mb-6">
                    <Hourglass className="size-3.5 fill-current animate-spin" />
                    <span>{isIndo ? "SEGERA HADIR" : "COMING SOON"}</span>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight leading-none text-black dark:text-white uppercase italic">
                    Top Creator <br />
                    <span className="bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">Leaderboard</span>
                  </h1>
                  
                  <p className="text-sm font-bold text-slate-500 dark:text-zinc-400 mt-6 leading-relaxed max-w-md">
                    {isIndo
                      ? "Papan Peringkat Kreator Teratas sedang dalam persiapan! Kami sedang mengumpulkan data dukungan dan volume transaksi dari kreator-kreator hebat kami. Papan peringkat akan diaktifkan segera setelah kami mencapai minimal 10 kreator aktif."
                      : "The Top Creators Leaderboard is currently in preparation! We are accumulating transaction volumes and community support stats. The leaderboard page will be activated once we reach at least 10 active creators."}
                  </p>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link href="/creators" className="w-full sm:w-auto">
                    <Button className="w-full h-12 px-6 rounded-2xl font-black uppercase italic bg-[#FFD551] text-black border-2 border-black hover:bg-[#FFC83B] flex items-center justify-center gap-2 group transition-all">
                      <span>{isIndo ? "Jelajahi Kreator" : "Explore Creators"}</span>
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/" className="w-full sm:w-auto">
                    <Button className="w-full h-12 px-6 rounded-2xl font-black uppercase italic bg-transparent text-slate-700 dark:text-white border-2 border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-900 flex items-center justify-center cursor-pointer transition-colors">
                      {isIndo ? "Kembali Ke Beranda" : "Back to Home"}
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Side Bento Card 1: Features Spotlight */}
              <div className="bg-[#FFD551] border-3 border-black rounded-[3rem] p-8 shadow-[4px_4px_0px_#000000] text-black flex flex-col justify-between min-h-[350px]">
                <div className="space-y-4">
                  <div className="bg-black text-[#FFD551] w-12 h-12 rounded-2xl flex items-center justify-center font-black border-2 border-black shadow-sm shrink-0">
                    <Trophy className="size-6 text-[#FFD551]" />
                  </div>
                  <h3 className="font-display font-black text-xl uppercase italic leading-tight">
                    {isIndo ? "Sistem Peringkat Transparan" : "Transparent Rankings"}
                  </h3>
                  <p className="text-xs font-bold text-black/75 leading-relaxed">
                    {isIndo
                      ? "Peringkat dihitung secara adil berdasarkan volume transaksi (GTV) sukses. Kreator dengan dukungan terbanyak berhak menduduki Podium Emas!"
                      : "Rankings are formulated directly from completed gross transaction volumes (GTV). The creators with the highest community support command the Gold Podium!"}
                  </p>
                </div>

                <div className="pt-4 border-t border-black/10 flex items-center gap-2">
                  <Sparkles className="size-4 text-black animate-pulse" />
                  <span className="text-[10px] font-black uppercase italic tracking-wider">
                    {isIndo ? "PEMBARUAN REAL-TIME" : "REAL-TIME SYNCED"}
                  </span>
                </div>
              </div>

              {/* Side Bento Card 2: Safe Badges */}
              <div className="bg-[#FFD551] border-3 border-black rounded-[3rem] p-8 shadow-[4px_4px_0px_#000000] text-black flex flex-col justify-between min-h-[220px]">
                <div className="space-y-2">
                  <div className="bg-black text-[#FFD551] w-12 h-12 rounded-2xl flex items-center justify-center font-black border-2 border-black shadow-sm shrink-0 mb-2">
                    <Crown className="size-6 text-[#FFD551]" />
                  </div>
                  <h4 className="font-display font-black text-base uppercase italic text-black">
                    {isIndo ? "Lencana Terverifikasi" : "Verified Badge"}
                  </h4>
                  <p className="text-[11px] font-semibold text-black/85 leading-relaxed">
                    {isIndo
                      ? "Hanya kreator aktif dengan profil resmi yang lolos verifikasi Superadmin yang akan ditampilkan."
                      : "Only creators with active channels and valid Superadmin verifications will occupy the leaderboard."}
                  </p>
                </div>
              </div>

              {/* Side Bento Card 3: Locked Badge preview */}
              <div className="md:col-span-2 bg-gradient-to-br from-zinc-900 to-zinc-950 border-3 border-black rounded-[3rem] p-8 shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.05)] text-white flex flex-col sm:flex-row items-center justify-between gap-6 min-h-[220px]">
                <div className="space-y-4 max-w-md">
                  <div className="inline-flex items-center gap-2 bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-zinc-700">
                    <Lock className="size-3 text-red-400" />
                    <span>{isIndo ? "KUNCI PENGATURAN" : "TOGGLE LOCKED"}</span>
                  </div>
                  <h3 className="font-display font-black text-2xl uppercase italic leading-none">
                    {isIndo ? "Menunggu Verifikasi" : "Awaiting Activation"}
                  </h3>
                  <p className="text-xs font-bold text-zinc-400 leading-relaxed">
                    {isIndo
                      ? "Saat ini fitur ini dinonaktifkan sementara oleh pemilik sistem karena masih dalam fase peluncuran awal."
                      : "Currently this feature is deactivated by system administration during initial bootstrap phases."}
                  </p>
                </div>

                <div className="w-20 h-20 rounded-3xl bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center shadow-lg shrink-0">
                  <Lock className="size-8 text-zinc-400" />
                </div>
              </div>
            </motion.div>
          </section>
        ) : (
          // FULL LEADERBOARD VIEW
          <section className="container mx-auto px-4 max-w-[1360px] py-16 relative">
            
            {/* Title Header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-[#FFD551] text-black px-4 py-1.5 font-display font-black uppercase text-[10px] rounded-full border-2 border-black tracking-wider mb-4 shadow-sm"
              >
                <Trophy className="size-3.5 fill-current" />
                <span>{isIndo ? "PAPAN PERINGKAT KREATOR" : "CREATOR LEADERBOARD"}</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight leading-none text-[#1A1A19] dark:text-[#EAE9E4] uppercase italic"
              >
                {isIndo ? "Kreator Teratas" : "Top Creators"}{" "}
                <span className="bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">{isIndo ? "Treetmi" : "Treetmi"}</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm font-semibold text-[#706E68] dark:text-[#A09E96] max-w-2xl mx-auto mt-4 leading-relaxed"
              >
                {isIndo
                  ? "Daftar kreator berprestasi dengan akumulasi dukungan finansial terbanyak dari komunitas penggemar!"
                  : "Rankings of high-performing creators computed directly from volume of community support."}
              </motion.p>
            </div>

            {/* PODIUM SECTION */}
            {podiumCreators.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end pt-8 pb-12 max-w-[1000px] mx-auto">
                
                {/* Rank 2 (Silver) */}
                {arrangedPodium[0] ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex flex-col items-center group order-2 md:order-1"
                  >
                    <div className="relative mb-3 transition-transform duration-300 group-hover:scale-105">
                      <div className="w-20 h-20 rounded-full border-4 border-slate-300 overflow-hidden bg-white shadow-lg flex items-center justify-center">
                        {arrangedPodium[0].avatar_url ? (
                          <img
                            src={arrangedPodium[0].avatar_url}
                            alt={arrangedPodium[0].username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-bold text-slate-500 text-lg">
                            {arrangedPodium[0].username.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="absolute -top-3 -right-2 bg-slate-300 text-slate-900 w-7 h-7 rounded-full flex items-center justify-center font-black shadow-md border-2 border-white dark:border-[#0A0A0A] text-xs">
                        2
                      </div>
                    </div>
                    
                    <div className="w-full text-center p-5 rounded-[2.5rem] bg-white dark:bg-[#121211] border-3 border-black shadow-[3px_3px_0px_#000000] dark:shadow-[3px_3px_0px_rgba(255,255,255,0.05)]">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Trophy className="h-4 w-4 text-slate-400 animate-pulse" />
                        <span className="font-black italic text-[10px] text-slate-400 uppercase tracking-wider">
                          Silver Tier
                        </span>
                      </div>
                      <h3 className="font-black italic text-sm text-slate-800 dark:text-[#EAE9E4] flex items-center justify-center gap-1">
                        @{arrangedPodium[0].username}
                        {arrangedPodium[0].is_verified && (
                          <img src="/verified.svg" alt="Verified" className="w-4 h-4 shrink-0" />
                        )}
                      </h3>
                      <p className="text-[9px] text-slate-400 dark:text-zinc-550 font-bold uppercase italic mt-0.5">
                        {arrangedPodium[0].role_title}
                      </p>
                      <div className="mt-4 pt-3 border-t-2 border-slate-100 dark:border-zinc-800/40">
                        <div className="text-sm font-black text-slate-800 dark:text-[#FFD551]">
                          {arrangedPodium[0].supporter_count || 0} {isIndo ? "Pendukung" : "Supporters"}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 italic mt-0.5">
                          {arrangedPodium[0].support_count || 0} {isIndo ? "Kali Dukungan" : "Supports"}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="hidden md:block order-2 md:order-1" />
                )}

                {/* Rank 1 (Gold) - Highlighted */}
                {arrangedPodium[1] ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0 }}
                    className="flex flex-col items-center group order-1 md:order-2 -mt-4"
                  >
                    <div className="relative mb-3 transition-transform duration-300 group-hover:scale-105">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                        <Crown className="h-8 w-8 drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)] fill-amber-500" />
                      </div>
                      <div className="w-24 h-24 rounded-full border-4 border-amber-400 overflow-hidden bg-white shadow-xl flex items-center justify-center">
                        {arrangedPodium[1].avatar_url ? (
                          <img
                            src={arrangedPodium[1].avatar_url}
                            alt={arrangedPodium[1].username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-bold text-amber-600 text-xl">
                            {arrangedPodium[1].username.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="absolute -top-3 -right-2 bg-amber-400 text-amber-950 w-8 h-8 rounded-full flex items-center justify-center font-black shadow-md border-2 border-white dark:border-[#0A0A0A] text-xs">
                        1
                      </div>
                    </div>

                    <div className="w-full text-center p-6 rounded-[2.5rem] bg-white dark:bg-[#121211] border-3 border-black shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.05)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400/5 rounded-bl-full pointer-events-none" />
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Crown className="h-4 w-4 text-amber-500" />
                        <span className="font-black italic text-[10px] text-amber-600 uppercase tracking-widest">
                          Champion
                        </span>
                      </div>
                      <h3 className="font-black italic text-base text-slate-800 dark:text-[#EAE9E4] flex items-center justify-center gap-1">
                        @{arrangedPodium[1].username}
                        {arrangedPodium[1].is_verified && (
                          <img src="/verified.svg" alt="Verified" className="w-4.5 h-4.5 shrink-0" />
                        )}
                      </h3>
                      <p className="text-[9px] text-slate-400 dark:text-zinc-550 font-bold uppercase italic mt-0.5">
                        {arrangedPodium[1].role_title}
                      </p>
                      <div className="mt-4 pt-3 border-t-2 border-slate-100 dark:border-zinc-800/40">
                        <div className="text-base font-black text-amber-600 dark:text-[#FFD551]">
                          {arrangedPodium[1].supporter_count || 0} {isIndo ? "Pendukung" : "Supporters"}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-550 italic mt-0.5">
                          {arrangedPodium[1].support_count || 0} {isIndo ? "Kali Dukungan" : "Supports"}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="hidden md:block order-1 md:order-2" />
                )}

                {/* Rank 3 (Bronze) */}
                {arrangedPodium[2] ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex flex-col items-center group order-3"
                  >
                    <div className="relative mb-3 transition-transform duration-300 group-hover:scale-105">
                      <div className="w-20 h-20 rounded-full border-4 border-orange-400 overflow-hidden bg-white shadow-lg flex items-center justify-center">
                        {arrangedPodium[2].avatar_url ? (
                          <img
                            src={arrangedPodium[2].avatar_url}
                            alt={arrangedPodium[2].username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-bold text-orange-600 text-lg">
                            {arrangedPodium[2].username.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="absolute -top-3 -right-2 bg-orange-400 text-orange-950 w-7 h-7 rounded-full flex items-center justify-center font-black shadow-md border-2 border-white dark:border-[#0A0A0A] text-xs">
                        3
                      </div>
                    </div>

                    <div className="w-full text-center p-5 rounded-[2.5rem] bg-white dark:bg-[#121211] border-3 border-black shadow-[3px_3px_0px_#000000] dark:shadow-[3px_3px_0px_rgba(255,255,255,0.05)]">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Star className="h-4 w-4 text-orange-400 animate-pulse" />
                        <span className="font-black italic text-[10px] text-orange-500 uppercase tracking-wider">
                          Bronze Tier
                        </span>
                      </div>
                      <h3 className="font-black italic text-sm text-slate-800 dark:text-[#EAE9E4] flex items-center justify-center gap-1">
                        @{arrangedPodium[2].username}
                        {arrangedPodium[2].is_verified && (
                          <img src="/verified.svg" alt="Verified" className="w-4 h-4 shrink-0" />
                        )}
                      </h3>
                      <p className="text-[9px] text-slate-400 dark:text-zinc-550 font-bold uppercase italic mt-0.5">
                        {arrangedPodium[2].role_title}
                      </p>
                      <div className="mt-4 pt-3 border-t-2 border-slate-100 dark:border-zinc-800/40">
                        <div className="text-sm font-black text-slate-800 dark:text-[#FFD551]">
                          {arrangedPodium[2].supporter_count || 0} {isIndo ? "Pendukung" : "Supporters"}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 italic mt-0.5">
                          {arrangedPodium[2].support_count || 0} {isIndo ? "Kali Dukungan" : "Supports"}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="hidden md:block order-3" />
                )}
              </div>
            )}

            {/* SEARCH AND FILTER BAR */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-[#121211] border-3 border-black p-4 rounded-[2.5rem] shadow-[3px_3px_0px_#000000] dark:shadow-[3px_3px_0px_rgba(255,255,255,0.05)] mb-8 max-w-[1100px] mx-auto">
              
              {/* Search input */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-450" />
                <Input
                  placeholder={isIndo ? "Cari nama atau username kreator..." : "Search creator name or username..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 pl-11 border-2 border-slate-105 dark:border-zinc-800 rounded-2xl bg-slate-50 text-black dark:bg-[#0A0A0A] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551] outline-none"
                />
              </div>

              {/* Category selector */}
              <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
                {([
                  { id: "ALL",      label: isIndo ? "Semua" : "All",     icon: <Globe className="size-3.5" /> },
                  { id: "GAMING",   label: "Gaming",    icon: <Gamepad2 className="size-3.5" /> },
                  { id: "CREATIVE", label: "Creative",  icon: <Palette className="size-3.5" /> },
                  { id: "TECH",     label: "Developer", icon: <Code2 className="size-3.5" /> },
                  { id: "MUSIC",    label: "Music",     icon: <Music4 className="size-3.5" /> }
                ] as const).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-2 border-transparent ${
                      activeCategory === cat.id
                        ? "bg-[#FFD551] text-black border-black shadow-sm"
                        : "bg-slate-50 dark:bg-zinc-950 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 border-slate-100 dark:border-zinc-800"
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* LEADERBOARD LIST TABLE */}
            <div className="max-w-[1100px] mx-auto">
              <Card className="border-3 border-black rounded-[3rem] shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.05)] bg-white dark:bg-[#121211] overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table className="w-full">
                      <TableHeader className="bg-slate-50 dark:bg-zinc-950/40 border-b-3 border-black">
                        <TableRow className="border-none hover:bg-transparent">
                          <TableHead className="text-xs font-black text-black dark:text-white uppercase italic px-8 py-4 w-28">Posisi</TableHead>
                          <TableHead className="text-xs font-black text-black dark:text-white uppercase italic py-4">Kreator</TableHead>
                          <TableHead className="text-xs font-black text-black dark:text-white uppercase italic py-4">Kategori</TableHead>
                          <TableHead className="text-xs font-black text-black dark:text-white uppercase italic py-4">{isIndo ? "Pendukung" : "Supporters"}</TableHead>
                          <TableHead className="text-xs font-black text-black dark:text-white uppercase italic py-4">{isIndo ? "Kali Dukungan" : "Total Supports"}</TableHead>
                          <TableHead className="text-xs font-black text-black dark:text-white uppercase italic text-right px-8 py-4 w-32">Profil</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCreators.map((c, index) => {
                          const globalRank = rankedCreators.findIndex((m) => m.id === c.id) + 1
                          return (
                            <TableRow key={c.id} className="border-b-2 border-slate-100 dark:border-zinc-900/60 hover:bg-slate-50/50 dark:hover:bg-zinc-900/20">
                              <TableCell className="px-8 py-4">
                                <div className="flex items-center justify-start">
                                  {globalRank === 1 ? (
                                    <Badge className="bg-amber-400 text-amber-950 border-2 border-black font-black rounded-xl text-[10px] w-8 h-8 flex items-center justify-center shrink-0">
                                      1st
                                    </Badge>
                                  ) : globalRank === 2 ? (
                                    <Badge className="bg-slate-300 text-slate-900 border-2 border-black font-black rounded-xl text-[10px] w-8 h-8 flex items-center justify-center shrink-0">
                                      2nd
                                    </Badge>
                                  ) : globalRank === 3 ? (
                                    <Badge className="bg-orange-400 text-orange-950 border-2 border-black font-black rounded-xl text-[10px] w-8 h-8 flex items-center justify-center shrink-0">
                                      3rd
                                    </Badge>
                                  ) : (
                                    <span className="font-mono text-xs font-black text-slate-400 dark:text-zinc-500 pl-2">
                                      #{globalRank}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="font-bold text-xs py-4">
                                <div className="flex items-center gap-3 italic">
                                  <div className="w-9 h-9 rounded-2xl border-2 border-black overflow-hidden bg-white shrink-0 flex items-center justify-center text-xs font-black relative">
                                    {c.avatar_url ? (
                                      <img src={c.avatar_url} alt={c.username} className="w-full h-full object-cover" />
                                    ) : (
                                      c.username.substring(0, 2).toUpperCase()
                                    )}
                                    {c.is_live && (
                                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
                                    )}
                                  </div>
                                  <div className="flex flex-col justify-center">
                                    <span className="font-black text-slate-800 dark:text-white flex items-center gap-1">
                                      @{c.username}
                                      {c.is_verified && (
                                        <img src="/verified.svg" alt="Verified" className="w-4 h-4 shrink-0" />
                                      )}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-450 dark:text-zinc-550 leading-normal uppercase">
                                      {c.role_title}
                                    </span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <span className={`px-2 py-1 text-[8px] font-black uppercase italic tracking-wider rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 flex items-center gap-1 w-max`}>
                                  {c.category === "GAMING"   ? <><Gamepad2 className="size-3 text-amber-500" /> Gaming</>    :
                                   c.category === "CREATIVE" ? <><Palette className="size-3 text-purple-500" /> Creative</>  :
                                   c.category === "TECH"     ? <><Code2 className="size-3 text-emerald-500" /> Developer</> :
                                                               <><Music4 className="size-3 text-cyan-500" /> Music</>}
                                </span>
                              </TableCell>
                              <TableCell className="text-xs font-black py-4 text-black dark:text-[#FFD551]">
                                {c.supporter_count || 0} {isIndo ? "Orang" : "People"}
                              </TableCell>
                              <TableCell className="text-xs font-bold text-slate-450 dark:text-[#706E68] italic py-4">
                                {c.support_count || 0} {isIndo ? "Kali" : "Times"}
                              </TableCell>
                              <TableCell className="text-right px-8 py-4">
                                <Link
                                  href={`/${c.username}`}
                                  className="inline-flex items-center gap-1 text-[10px] font-black italic bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black border-2 border-black px-3.5 py-2 rounded-xl hover:translate-y-[-1px] transition-all shadow-sm shrink-0"
                                >
                                  Profil <ArrowUpRight className="h-3.5 w-3.5" />
                                </Link>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                        {filteredCreators.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12 text-slate-400 text-xs font-bold italic">
                              {isIndo
                                ? "Tidak ada data kreator yang cocok dengan filter pencarian."
                                : "No creators found matching the query."}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

          </section>
        )}
      </div>

      <Footer />
    </main>
  )
}
