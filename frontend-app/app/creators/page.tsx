"use client"

import React, { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { useLanguage } from "@/components/language-provider"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  Gamepad2, 
  Sparkles, 
  Tv, 
  Camera, 
  Users, 
  ArrowRight,
  Code2,
  Music4,
  Palette,
  Globe,
  Loader2,
  ServerOff
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import { API_BASE_URL } from "@/lib/api"

// ─── Types ────────────────────────────────────────────────────────────────────
interface CreatorFromDB {
  username: string
  name: string
  bio: string | null
  role_title: string
  avatar_url: string
  banner_url: string | null
  is_verified: boolean
  is_live: boolean
  status: string
  support_count: number
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

// ─── Loading Skeleton Card ────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-[28px] overflow-hidden min-h-[420px] animate-pulse">
      <div className="h-20 bg-slate-200 dark:bg-zinc-800" />
      <div className="px-5 pb-5 pt-3 space-y-4">
        <div className="w-16 h-16 rounded-[18px] bg-slate-200 dark:bg-zinc-800 -mt-9" />
        <div className="space-y-2 mt-2">
          <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded-full w-3/4" />
          <div className="h-3 bg-slate-100 dark:bg-zinc-700 rounded-full w-1/2" />
        </div>
        <div className="h-12 bg-slate-100 dark:bg-zinc-800 rounded-xl" />
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-slate-100 dark:bg-zinc-800 rounded-md" />
          <div className="h-5 w-24 bg-slate-100 dark:bg-zinc-800 rounded-md" />
        </div>
        <div className="h-px bg-slate-100 dark:bg-zinc-800 mt-4" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-4 bg-slate-100 dark:bg-zinc-800 rounded w-24" />
          <div className="h-8 w-20 bg-slate-200 dark:bg-zinc-700 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CreatorsDirectory() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<Category>("ALL")
  const [creators, setCreators] = useState<CreatorCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    const fetchCreators = async () => {
      setIsLoading(true)
      setFetchError(false)
      try {
        const res = await fetch(`${API_BASE_URL}/users/creators`)
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          setCreators(json.data.map(mapToCard))
        } else {
          setFetchError(true)
        }
      } catch (err) {
        console.error("Gagal mengambil daftar kreator:", err)
        setFetchError(true)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCreators()
  }, [])

  const filteredCreators = creators.filter(c => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.role_title.toLowerCase().includes(q) ||
      c.username.toLowerCase().includes(q)
    const matchesCategory = activeCategory === "ALL" || c.category === activeCategory
    return matchesSearch && matchesCategory
  })

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

      {/* HEADER SECTION */}
      <section className="relative z-10 pt-16 pb-10 text-center container mx-auto px-4 max-w-[1360px]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-[#FFD551] text-black px-4 py-1.5 font-display font-extrabold uppercase text-[10px] rounded-full shadow-sm tracking-wider mb-4"
        >
          <Users className="size-3.5 fill-current" />
          <span>Kreator Terdaftar</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight leading-none text-[#1A1A19] dark:text-[#EAE9E4]"
        >
          Jelajahi <span className="bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">Kreator Favorit</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm md:text-base font-medium text-[#706E68] dark:text-[#A09E96] max-w-2xl mx-auto mt-4 leading-relaxed"
        >
          Temukan dan dukung langsung streamer, pro-gamer, desainer, musisi, &amp; VTuber favorit Anda dengan donasi instan dan antrean Mabar FIFO overlay otomatis!
        </motion.p>
      </section>

      {/* SEARCH AND FILTER */}
      <section className="relative z-10 container mx-auto px-4 max-w-[1360px] mb-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between bg-white dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 rounded-3xl p-6 shadow-xl backdrop-blur-md">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, profesi, atau username..."
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-950/80 border-2 border-slate-100 dark:border-zinc-800 rounded-2xl text-sm font-semibold focus:outline-none focus:border-amber-400 dark:focus:border-[#FFD551] transition-all dark:text-white"
            />
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {([
              { id: "ALL",      label: "Semua",     icon: <Globe    className="size-3.5" /> },
              { id: "GAMING",   label: "Gaming",    icon: <Gamepad2 className="size-3.5" /> },
              { id: "CREATIVE", label: "Creative",  icon: <Palette  className="size-3.5" /> },
              { id: "TECH",     label: "Developer", icon: <Code2    className="size-3.5" /> },
              { id: "MUSIC",    label: "Music & Art",icon: <Music4  className="size-3.5" /> }
            ] as const).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-[#FFD551] text-black shadow-md font-black"
                    : "bg-slate-50 dark:bg-zinc-950/80 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 border border-slate-200/40 dark:border-zinc-800"
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* GRID SECTION */}
      <section className="relative z-10 container mx-auto px-4 max-w-[1360px] flex-1 pb-20">
        
        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error State */}
        {!isLoading && fetchError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 rounded-[32px] p-8 shadow-xl max-w-md mx-auto"
          >
            <div className="size-16 rounded-2xl bg-red-100 dark:bg-zinc-900 text-red-400 flex items-center justify-center mx-auto mb-4">
              <ServerOff className="size-8" />
            </div>
            <h3 className="text-lg font-display font-black text-slate-800 dark:text-[#EAE9E4]">Gagal Memuat Data</h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-[#A09E96] mt-2">
              Tidak dapat terhubung ke server. Pastikan backend berjalan dan coba refresh halaman.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-6 h-10 px-6 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-[#FFD551] dark:text-black hover:opacity-90"
            >
              Refresh Halaman
            </Button>
          </motion.div>
        )}

        {/* Creator Grid */}
        {!isLoading && !fetchError && (
          <AnimatePresence mode="popLayout">
            {filteredCreators.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              >
                {filteredCreators.map((c, i) => (
                  <motion.div
                    key={c.username}
                    layout
                    initial={{ opacity: 0, scale: 0.92, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className={`group bg-white dark:bg-zinc-900 border rounded-[28px] shadow-md overflow-hidden flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 relative min-h-[420px] ${
                      c.status === 'SUSPENDED'
                        ? 'border-red-200/80 dark:border-red-900/40'
                        : 'border-slate-200/80 dark:border-zinc-800'
                    }`}
                  >
                    {/* Banner header — real image from DB, fallback to category gradient */}
                    <div
                      className={`h-20 w-full relative flex-shrink-0 overflow-hidden ${
                        !c.banner_url
                          ? `bg-gradient-to-r ${c.status === 'SUSPENDED' ? 'from-slate-300 to-slate-400 dark:from-zinc-700 dark:to-zinc-600' : c.backgroundColor}`
                          : ''
                      }`}
                    >
                      {/* Real banner image from DB */}
                      {c.banner_url && (
                        <img
                          src={c.banner_url}
                          alt="banner"
                          className={`absolute inset-0 w-full h-full object-cover ${c.status === 'SUSPENDED' ? 'grayscale opacity-50' : ''}`}
                        />
                      )}

                      {/* Subtle dark overlay for readability on top of banner image */}
                      {c.banner_url && c.status !== 'SUSPENDED' && (
                        <div className="absolute inset-0 bg-black/20" />
                      )}

                      {/* SUSPENDED badge */}
                      {c.status === 'SUSPENDED' && (
                        <span className="absolute top-3.5 right-3.5 bg-red-500 text-white font-extrabold text-[8px] uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/50 flex items-center gap-1 z-10">
                          ⛔ SUSPENDED
                        </span>
                      )}
                      {/* LIVE badge — only from real DB is_live, not for suspended */}
                      {c.is_live && c.status !== 'SUSPENDED' && (
                        <span className="absolute top-3.5 right-3.5 bg-red-500 text-white font-extrabold text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full animate-pulse border border-white z-10">
                          LIVE
                        </span>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="px-5 pb-5 relative flex-1 flex flex-col justify-between">

                      {/* Avatar */}
                      <div className="relative -mt-9 mb-3 inline-block z-10 self-start">
                        <div className={`size-[72px] rounded-[20px] bg-slate-100 dark:bg-zinc-800 border-4 flex items-center justify-center shadow-md overflow-hidden relative ${
                          c.status === 'SUSPENDED'
                            ? 'border-red-300/60 dark:border-red-900/60'
                            : 'border-white dark:border-zinc-900'
                        }`}>
                          {c.avatar_url ? (
                            <img
                              src={c.avatar_url}
                              alt={c.name}
                              className={`w-full h-full object-cover ${c.status === 'SUSPENDED' ? 'grayscale' : ''}`}
                            />
                          ) : (
                            <span className={`text-2xl font-black italic bg-gradient-to-r ${c.backgroundColor} bg-clip-text text-transparent`}>
                              {c.avatarChar}
                            </span>
                          )}
                        </div>

                        {/* Live dot — not shown for suspended */}
                        {c.is_live && c.status !== 'SUSPENDED' && (
                          <span className="absolute bottom-0.5 right-0.5 size-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-900 animate-pulse" />
                        )}
                      </div>

                      <div className="space-y-3.5 flex-1">
                        {/* Name + verified badge */}
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className={`text-lg font-display font-black leading-tight transition-colors ${
                              c.status === 'SUSPENDED'
                                ? 'text-slate-400 dark:text-zinc-500'
                                : 'text-slate-800 dark:text-[#EAE9E4] group-hover:text-amber-500 dark:group-hover:text-[#FFD551]'
                            }`}>
                              {c.name}
                            </h3>
                            {c.is_verified && c.status !== 'SUSPENDED' && (
                              <img
                                src="/verified.svg"
                                alt="Verified"
                                className="w-[18px] h-[18px] shrink-0"
                                title="Kreator Terverifikasi"
                              />
                            )}
                          </div>
                          <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest leading-none">
                            @{c.username} • {c.role_title}
                          </p>
                        </div>

                        {/* Suspended notice OR Bio */}
                        {c.status === 'SUSPENDED' ? (
                          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-900/30 rounded-xl p-2.5">
                            <p className="text-[10px] font-bold text-red-500 leading-relaxed">
                              ⛔ Akun ini sedang ditangguhkan. Kreator tidak dapat menerima dukungan atau pesanan saat ini.
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs font-semibold text-slate-500 dark:text-zinc-450 leading-relaxed line-clamp-3">
                            {c.bio || "Dukung saya agar terus semangat membuat karya digital berkualitas!"}
                          </p>
                        )}

                        {/* Category tag — hide for suspended */}
                        {c.status !== 'SUSPENDED' && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <span className={`px-2 py-0.5 text-[8px] font-extrabold uppercase italic tracking-wider rounded-md bg-slate-50 dark:bg-zinc-950/80 border border-slate-100 dark:border-zinc-800 dark:text-[#EAE9E4] ${c.textColor}`}>
                              {c.category === "GAMING"   ? "🎮 Gaming"    :
                               c.category === "CREATIVE" ? "🎨 Creative"  :
                               c.category === "TECH"     ? "💻 Developer" :
                                                           "🎵 Music & Art"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3 mt-4">
                        <div className="text-left">
                          <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider leading-none">Total Dukungan</p>
                          <p className="text-sm font-display font-black text-slate-700 dark:text-[#EAE9E4] mt-1">{c.support_count} Dukungan</p>
                        </div>

                        <Link href={`/${c.username}`} className="flex-shrink-0">
                          {c.status === 'SUSPENDED' ? (
                            <Button className="h-9 px-4 text-xs rounded-xl font-bold bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 gap-1 cursor-pointer border border-red-200/60 dark:border-red-900/30">
                              <span>Lihat Info</span>
                              <ArrowRight className="size-3" />
                            </Button>
                          ) : (
                            <Button className="h-9 px-4 text-xs rounded-xl font-bold bg-[#FFD551] text-black hover:bg-[#FFD551]/90 gap-1 hover:translate-y-[-1px] transition-all">
                              <span>Profil</span>
                              <ArrowRight className="size-3" />
                            </Button>
                          )}
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-white dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 rounded-[32px] p-8 shadow-xl max-w-md mx-auto"
              >
                <div className="size-16 rounded-2xl bg-amber-100 dark:bg-zinc-900 text-amber-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <Search className="size-8" />
                </div>
                <h3 className="text-lg font-display font-black text-slate-800 dark:text-[#EAE9E4]">
                  {searchQuery ? "Kreator Tidak Ditemukan" : "Belum Ada Kreator"}
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-[#A09E96] mt-2">
                  {searchQuery
                    ? `Tidak ada kreator yang cocok dengan "${searchQuery}". Coba kata kunci lainnya!`
                    : "Belum ada kreator yang terdaftar di kategori ini."}
                </p>
                {searchQuery && (
                  <Button
                    onClick={() => { setSearchQuery(""); setActiveCategory("ALL") }}
                    className="mt-6 h-10 px-6 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-[#FFD551] dark:text-black hover:opacity-90"
                  >
                    Reset Filter
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </section>

      {/* FOOTER */}
      <Footer />
    </main>
  )
}
