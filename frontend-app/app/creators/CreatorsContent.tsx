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
  Globe
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ADMIN_API } from "@/lib/api"

interface CreatorCard {
  username: string
  name: string
  role: string
  category: "GAMING" | "CREATIVE" | "TECH" | "MUSIC"
  bio: string
  followerCount: string
  activeServices: string[]
  backgroundColor: string
  textColor: string
  borderColor: string
  avatarChar: string
  avatarUrl?: string
  liveBadge: boolean
  supportCount: number
  isVerified?: boolean
}

const MOCK_CREATORS = [
  {
    username: "budigamer",
    name: "Budi Gamer",
    role: "Pro Player & MLBB Streamer",
    category: "GAMING" as const,
    bio: "Push Rank MLBB sampai Mythical Glory! Mabar FIFO otomatis dengan overlay OBS.",
    followerCount: "128K",
    activeServices: ["Jasa Mabar", "Donasi Alert"],
    backgroundColor: "from-amber-400 to-[#FFD551]",
    textColor: "text-amber-500",
    borderColor: "border-amber-400/40",
    avatarChar: "B",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200",
    liveBadge: true,
    supportCount: 242
  },
  {
    username: "sarah_art",
    name: "Sarah Creative",
    role: "UI/UX Designer & Artist",
    category: "CREATIVE" as const,
    bio: "Desain portofolio UX, logo minimalis, & custom anime avatar untuk sosial media Anda.",
    followerCount: "63K",
    activeServices: ["Anime Avatar", "UI/UX Review"],
    backgroundColor: "from-purple-400 to-indigo-500",
    textColor: "text-purple-500",
    borderColor: "border-purple-400/40",
    avatarChar: "S",
    avatarUrl: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&q=80&w=200&h=200",
    liveBadge: false,
    supportCount: 112
  },
  {
    username: "andidev",
    name: "Andi Wijaya",
    role: "Software Engineer & Tech Creator",
    category: "TECH" as const,
    bio: "Bahas coding tutorial Next.js, React, & tips tembus interview kerja startup tier-1.",
    followerCount: "42K",
    activeServices: ["Code Review", "1-on-1 Mentoring"],
    backgroundColor: "from-emerald-400 to-teal-500",
    textColor: "text-emerald-500",
    borderColor: "border-emerald-400/40",
    avatarChar: "A",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200",
    liveBadge: true,
    supportCount: 88
  },
  {
    username: "lunavtuber",
    name: "Luna Ch.",
    role: "Virtual YouTuber & Singer",
    category: "MUSIC" as const,
    bio: "Virtual Idol retro nyanyi lagu anime classic & pop jepang request langsung lewat donasi!",
    followerCount: "95K",
    activeServices: ["Request Lagu", "Mabar Santai"],
    backgroundColor: "from-cyan-400 to-blue-500",
    textColor: "text-cyan-500",
    borderColor: "border-cyan-400/40",
    avatarChar: "L",
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200&h=200",
    liveBadge: true,
    supportCount: 310
  },
  {
    username: "fadhils",
    name: "Fadhil Streamer",
    role: "Valorant & Variety Streamer",
    category: "GAMING" as const,
    bio: "Live streaming seru-seruan tiap malam! Titip lagu jedag-jedug, curhat tipis, & setup OBS.",
    followerCount: "84K",
    activeServices: ["Donasi Alert", "Request Song"],
    backgroundColor: "from-rose-400 to-pink-500",
    textColor: "text-rose-500",
    borderColor: "border-rose-400/40",
    avatarChar: "F",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200&h=200",
    liveBadge: false,
    supportCount: 154
  },
  {
    username: "rianmusic",
    name: "Rian Acoustic",
    role: "Indie Singer & Guitarist",
    category: "MUSIC" as const,
    bio: "Cover gitar akustik santai. Request lagu favoritmu langsung dimainkan live on stream!",
    followerCount: "31K",
    activeServices: ["Request Song", "Donasi Alert"],
    backgroundColor: "from-orange-400 to-amber-500",
    textColor: "text-orange-500",
    borderColor: "border-orange-400/40",
    avatarChar: "R",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200",
    liveBadge: false,
    supportCount: 45
  }
]

const getAvatarUrl = (username: string, customAvatarUrl?: string) => {
  if (customAvatarUrl && customAvatarUrl.trim() !== "" && !customAvatarUrl.includes("unsplash.com")) {
    return customAvatarUrl;
  }
  
  let sum = 0;
  const cleanUsername = username.toLowerCase();
  for (let i = 0; i < cleanUsername.length; i++) {
    sum += cleanUsername.charCodeAt(i);
  }
  const avatarIndex = (sum % 8) + 1;
  return `/avatars/avatar-${avatarIndex}.svg`;
}

export default function CreatorsContent() {
  const { lang } = useLanguage()
  const isIndo = lang === "id"
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<"ALL" | "GAMING" | "CREATIVE" | "TECH" | "MUSIC">("ALL")
  const [creators, setCreators] = useState<CreatorCard[]>(MOCK_CREATORS)

  // Real database fetch fallback
  useEffect(() => {
    const fetchRealCreators = async () => {
      try {
        const res = await fetch(ADMIN_API.creators)
        const json = await res.json()

        if (json.success && json.data && json.data.length > 0) {
          const mapped: CreatorCard[] = json.data.map((user: any) => {
            const roleL = (user.role_title || "").toLowerCase()
            let cat: CreatorCard["category"] = "GAMING"
            let bg = "from-amber-400 to-[#FFD551]"
            let txt = "text-amber-500"
            let border = "border-amber-400/40"

            if (roleL.includes("dev") || roleL.includes("code") || roleL.includes("tech") || roleL.includes("programmer")) {
              cat = "TECH"
              bg = "from-emerald-400 to-teal-500"
              txt = "text-emerald-500"
              border = "border-emerald-400/40"
            } else if (roleL.includes("design") || roleL.includes("art") || roleL.includes("artist") || roleL.includes("draw")) {
              cat = "CREATIVE"
              bg = "from-purple-400 to-indigo-500"
              txt = "text-purple-500"
              border = "border-purple-400/40"
            } else if (roleL.includes("sing") || roleL.includes("song") || roleL.includes("music") || roleL.includes("vtuber")) {
              cat = "MUSIC"
              bg = "from-cyan-400 to-blue-500"
              txt = "text-cyan-500"
              border = "border-cyan-400/40"
            }

            return {
              username: user.username,
              name: user.name || user.username,
              role: user.role_title || "Creator",
              isVerified: user.is_verified,
              category: cat,
              bio: user.bio || (isIndo ? "Dukung saya agar terus semangat membuat karya digital berkualitas!" : "Support me so I can keep creating high-quality digital content!"),
              followerCount: "10K+",
              activeServices: user.show_services !== false 
                ? [isIndo ? "Jasa Mabar" : "Play Session", isIndo ? "Donasi Alert" : "Donation Alert"] 
                : [isIndo ? "Donasi Alert" : "Donation Alert"],
              backgroundColor: bg,
              textColor: txt,
              borderColor: border,
              avatarChar: (user.name || user.username).charAt(0).toUpperCase(),
              avatarUrl: getAvatarUrl(user.username, user.avatar_url),
              liveBadge: false,
              supportCount: user.project_assets?.length * 5 + 10 || 12
            }
          })

          setCreators(mapped)
        }
      } catch (err) {
        console.warn("Backend offline, no mock data used:", err)
        setCreators([])
      }
    }

    fetchRealCreators()
  }, [isIndo])

  const filteredCreators = creators.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.username.toLowerCase().includes(searchQuery.toLowerCase())
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
      <section className="relative z-10 pt-16 pb-10 text-center container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-[#FFD551] text-black px-4 py-1.5 font-display font-extrabold uppercase text-[10px] rounded-full shadow-sm tracking-wider mb-4"
        >
          <Users className="size-3.5 fill-current" />
          <span>{isIndo ? "Kreator Terdaftar" : "Registered Creators"}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight leading-none text-[#1A1A19] dark:text-[#EAE9E4]"
        >
          {isIndo ? "Jelajahi" : "Explore"}{" "}
          <span className="bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">
            {isIndo ? "Kreator Favorit" : "Favorite Creators"}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm md:text-base font-medium text-[#706E68] dark:text-[#A09E96] max-w-xl mx-auto mt-4 leading-relaxed"
        >
          {isIndo
            ? "Temukan dan dukung langsung streamer, pro-gamer, desainer, musisi, & VTuber favorit Anda dengan donasi instan dan antrean Mabar FIFO overlay otomatis!"
            : "Discover and support your favorite streamers, pro-gamers, designers, musicians, & VTubers with instant donations and FIFO overlay play sessions!"}
        </motion.p>
      </section>

      {/* SEARCH AND FILTER WORKSPACE */}
      <section className="relative z-10 container mx-auto px-4 max-w-6xl mb-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between bg-white dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 rounded-3xl p-6 shadow-xl backdrop-blur-md">
          
          {/* Real-time search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isIndo ? "Cari nama, role, atau username..." : "Search name, role, or username..."}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-950/80 border-2 border-slate-100 dark:border-zinc-800 rounded-2xl text-sm font-semibold focus:outline-none focus:border-amber-400 dark:focus:border-[#FFD551] transition-all dark:text-white"
            />
          </div>

          {/* Slick Categories Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {([
              { id: "ALL", label: isIndo ? "Semua" : "All", icon: <Globe className="size-3.5" /> },
              { id: "GAMING", label: "Gaming", icon: <Gamepad2 className="size-3.5" /> },
              { id: "CREATIVE", label: "Creative", icon: <Palette className="size-3.5" /> },
              { id: "TECH", label: isIndo ? "Developer" : "Tech", icon: <Code2 className="size-3.5" /> },
              { id: "MUSIC", label: isIndo ? "Music & Art" : "Music", icon: <Music4 className="size-3.5" /> }
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

      {/* GRID LAYOUT SECTION */}
      <section className="relative z-10 container mx-auto px-4 max-w-6xl flex-1 pb-20">
        <AnimatePresence mode="popLayout">
          {filteredCreators.length > 0 ? (
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredCreators.map((c, i) => (
                <motion.div
                  key={c.username}
                  layout
                  initial={{ opacity: 0, scale: 0.92, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="group bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-[32px] shadow-lg overflow-hidden flex flex-col justify-between hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 relative min-h-[440px]"
                >
                  {/* Decorative colorful banner header */}
                  <div className={`h-24 w-full bg-gradient-to-r ${c.backgroundColor} relative flex-shrink-0`}>
                    {c.liveBadge && (
                      <span className="absolute top-4 right-4 bg-red-500 text-white font-extrabold text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full animate-pulse border border-white">
                        LIVE
                      </span>
                    )}
                  </div>

                  {/* Creator details space */}
                  <div className="px-6 pb-6 relative flex-1 flex flex-col justify-between">
                    
                    {/* Avatar box floating over banner */}
                    <div className="relative -mt-10 mb-4 inline-block z-10 self-start">
                      <div className="size-20 rounded-[24px] bg-slate-100 dark:bg-zinc-800 border-4 border-white dark:border-zinc-900 flex items-center justify-center shadow-md overflow-hidden relative">
                        {c.avatarUrl ? (
                          <img 
                            src={c.avatarUrl} 
                            alt={c.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className={`text-3xl font-black italic bg-gradient-to-r ${c.backgroundColor} bg-clip-text text-transparent`}>
                            {c.avatarChar}
                          </span>
                        )}
                      </div>
                      
                      {c.liveBadge && (
                        <span className="absolute bottom-0 right-0 size-4 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-900 animate-pulse" />
                      )}
                    </div>

                    <div className="space-y-4 flex-1">
                      {/* Name & verification check */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xl font-display font-black text-slate-800 dark:text-[#EAE9E4] group-hover:text-amber-500 dark:group-hover:text-[#FFD551] transition-colors leading-tight">
                            {c.name}
                          </h3>
                          {c.isVerified && (
                            <img src="/verified.svg" alt="Verified" className="w-5 h-5 inline-block align-middle shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-widest leading-none">
                          @{c.username} • {c.role}
                        </p>
                      </div>

                      {/* Bio preview */}
                      <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 leading-relaxed line-clamp-3">
                        {c.bio}
                      </p>

                      {/* Bullet service tags */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {c.activeServices.map((srv, idx) => (
                          <span 
                            key={idx} 
                            className="px-2.5 py-1 text-[9px] font-extrabold uppercase italic tracking-wider rounded-lg bg-slate-50 dark:bg-zinc-950/80 border border-slate-100 dark:border-zinc-800 dark:text-[#EAE9E4]"
                          >
                            {srv}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer call to action */}
                    <div className="pt-6 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-4 mt-6">
                      <div className="text-left">
                        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider leading-none">
                          {isIndo ? "Total Dukungan" : "Total Support"}
                        </p>
                        <p className="text-base font-display font-black text-slate-700 dark:text-[#EAE9E4] mt-1">
                          {c.supportCount} {isIndo ? "Dukungan" : "Supports"}
                        </p>
                      </div>

                      <Link href={`/${c.username}`} className="flex-shrink-0">
                        <Button className="h-10 px-5 text-xs rounded-xl font-bold bg-[#FFD551] text-black hover:bg-[#FFD551]/90 gap-1 hover:translate-y-[-1px] transition-all">
                          <span>{isIndo ? "Profil" : "Profile"}</span>
                          <ArrowRight className="size-3.5" />
                        </Button>
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
                {isIndo ? "Kreator Tidak Ditemukan" : "Creator Not Found"}
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-[#A09E96] mt-2">
                {isIndo
                  ? `Tidak ada kreator yang cocok dengan filter pencarian "${searchQuery}". Coba kata kunci lainnya!`
                  : `No creators match search query "${searchQuery}". Try other keywords!`}
              </p>
              <Button 
                onClick={() => { setSearchQuery(""); setActiveCategory("ALL"); }}
                className="mt-6 h-10 px-6 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-[#FFD551] dark:text-black hover:opacity-90"
              >
                {isIndo ? "Reset Filter" : "Reset Filters"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* FOOTER */}
      <footer className="py-10 border-t border-[#EAE9E4] bg-white dark:bg-[#0A0A0A] dark:border-[#262626] z-10 relative mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 max-w-6xl">
          <p className="font-extrabold text-2xl tracking-tight">
            Treetmi <span className="text-[#FFD551]">.id</span>
          </p>
          <div className="flex gap-6 text-xs font-semibold text-muted-foreground dark:text-[#A09E96]">
            <Link href="#" className="hover:text-[#FFD551]">Legal</Link>
            <Link href="#" className="hover:text-[#FFD551]">Privacy Policy</Link>
            <Link href="#" className="hover:text-[#FFD551]">Contact Support</Link>
          </div>
          <p className="text-[10px] font-semibold text-slate-400 dark:text-[#A09E96]">© 2026 Treetmi.id. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}