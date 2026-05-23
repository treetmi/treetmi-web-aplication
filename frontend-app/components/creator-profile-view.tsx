"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Heart, Gamepad2, Trophy, Clock, Loader2, Globe, Laptop, Share2, Bell, Coins, Activity, Sparkles, Unlock
} from "lucide-react"
import { useCurrency } from "@/components/currency-provider"
import { useLanguage } from "@/components/language-provider"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { PUBLIC_API, API_BASE_URL } from "@/lib/api"
import { connectSocket, disconnectSocket } from "@/lib/socket"

// Import modular components
import { ProfileSidebar } from "./creator-profile/profile-sidebar"
import { DonationTab } from "./creator-profile/donation-tab"
import { MabarTab } from "./creator-profile/mabar-tab"
import { QueueTab } from "./creator-profile/queue-tab"
import { WhatsappAlertModal } from "./creator-profile/whatsapp-alert-modal"

// SVG custom icons for socials
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
    <polygon points="10 15 15 12 10 9" />
  </svg>
)

const DiscordIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 8a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V8Z" />
    <circle cx="10" cy="12" r="1" />
    <circle cx="14" cy="12" r="1" />
  </svg>
)

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const TwitchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9H9V6h2v5zm4 0h-2V6h2v5z" />
  </svg>
)

const TiktokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
)

const getBannerGradient = (roleTitle: string) => {
  const norm = (roleTitle || "").toLowerCase()
  if (norm.includes("dev") || norm.includes("code") || norm.includes("programmer") || norm.includes("software") || norm.includes("tech") || norm.includes("engineer")) {
    return "from-slate-700 to-slate-900 dark:from-zinc-800 dark:to-zinc-950"
  }
  if (norm.includes("design") || norm.includes("art") || norm.includes("artist") || norm.includes("creative") || norm.includes("sketch") || norm.includes("ui") || norm.includes("ux")) {
    return "from-violet-600 to-fuchsia-500 dark:from-purple-900 dark:to-fuchsia-800"
  }
  if (norm.includes("write") || norm.includes("edit") || norm.includes("story") || norm.includes("author") || norm.includes("poet") || norm.includes("jurnal")) {
    return "from-teal-500 to-cyan-500 dark:from-teal-800 dark:to-cyan-900"
  }
  return "from-amber-400 to-[#FFD551]/60 dark:from-[#FFD551]/40 dark:to-[#FFD551]/10"
}

const externalLink = (url: string) => `/leave?url=${encodeURIComponent(url)}`

export function getGameIcon(gameName: string): string {
  const name = gameName.toLowerCase()
  if (name.includes("mobile legend") || name.includes("mlbb") || name.includes("legend")) {
    return "https://img.utdstc.com/icon/829/dbf/829dbfa0b94323215286b51e067c29e1c015b6d9be76e01a88cfd3d0f0c0f4f9:200"
  }
  if (name.includes("pubg") || name.includes("battleground")) {
    return "https://img.utdstc.com/icon/479/9f8/4799f8d8a7f1fa70b92db2c9a1a2b0e6df29ba04f762a04a0e10bdfa3c10a40f:200"
  }
  if (name.includes("free fire") || name.includes("ff")) {
    return "https://img.utdstc.com/icon/b7d/a7d/b7da7d59b2b2bbfbe9ebbf4c063cf4eb4e15ba6a04a0e10bdfa3c10a40f:200"
  }
  if (name.includes("valo") || name.includes("valorant")) {
    return "https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?q=80&w=200&auto=format&fit=crop"
  }
  if (name.includes("genshin") || name.includes("impact")) {
    return "https://img.utdstc.com/icon/e07/689/e07689d0bbf1fa70b92db2c9a1a2b0e6df29ba04f762a04a0e10bdfa3c10a40f:200"
  }
  if (name.includes("roblox")) {
    return "https://img.utdstc.com/icon/db1/008/db1008f8a7f1fa70b92db2c9a1a2b0e6df29ba04f762a04a0e10bdfa3c10a40f:200"
  }
  if (name.includes("honor of kings") || name.includes("hok")) {
    return "https://img.utdstc.com/icon/e6b/f6e/e6bf6eb4b94323215286b51e067c29e1c015b6d9be76e01a88cfd3d0f0c0f4f9:200"
  }
  if (name.includes("fifa") || name.includes("efootball") || name.includes("pes") || name.includes("bola") || name.includes("soccer")) {
    return "https://img.utdstc.com/icon/a67/0bf/a670bff8a7f1fa70b92db2c9a1a2b0e6df29ba04f762a04a0e10bdfa3c10a40f:200"
  }
  if (name.includes("minecraft")) {
    return "https://images.unsplash.com/photo-1605899435973-ca2d1a8861cf?q=80&w=200&auto=format&fit=crop"
  }
  return "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=200&auto=format&fit=crop"
}

interface MabarPackage {
  id: string
  gameName: string
  packageName: string
  price: number
  originalPrice: number
  category: string
  isPopular?: boolean
  image: string
}

interface ScheduleEvent {
  day: number
  title: string
  time: string
  desc: string
  game: string
}

interface QueueItem {
  id: string
  name: string
  detail: string
  status: "PLAYING" | "REVIEWING" | "WAITING"
}

interface CreatorConfig {
  role: string
  bio: string
  avatarChar: string
  ctaTitle: string
  ctaSubTitle: string
  ctaIcon: React.ReactNode
  targetTitle: string
  mabarTitle: string
  mabarIcon: React.ReactNode
  packages: MabarPackage[]
  eventsTitle: string
  eventsIcon: React.ReactNode
  events: Record<number, ScheduleEvent>
  queueTitle: string
  queueIcon: React.ReactNode
  queue: QueueItem[]
  drawerTitle: string
  drawerSubTitle: string
  formIgnLabel: string
  formIdLabel: string
  formIgnPlaceholder: string
  formIdPlaceholder: string
}

// Default config — all real data comes from database (creatorDbData)
export function getCreatorConfig(username: string): CreatorConfig {
  return {
    role: "",
    bio: "",
    avatarChar: username.charAt(0).toUpperCase(),
    ctaTitle: "KIRIM DUKUNGAN",
    ctaSubTitle: "(DONASI)",
    ctaIcon: null,
    targetTitle: "",
    mabarTitle: "Layanan & Karya",
    mabarIcon: null,
    packages: [],
    eventsTitle: "Jadwal Live Streaming",
    eventsIcon: null,
    events: {},
    queueTitle: "Antrean",
    queueIcon: null,
    queue: [],
    drawerTitle: "Pesan Layanan",
    drawerSubTitle: "Sewa slot bermain bersama",
    formIgnLabel: "Nickname In-Game (IGN)",
    formIdLabel: "Game ID / Server ID",
    formIgnPlaceholder: "Faker#ID",
    formIdPlaceholder: "1234567 (8910)"
  }
}

interface CreatorProfileViewProps {
  username?: string | string[]
  isPreview?: boolean
}

export function CreatorProfileView({ username = "budigamer", isPreview = false }: CreatorProfileViewProps) {
  const displayUsername = Array.isArray(username) ? username[0] : username
  const { currency, convertFromIdr, convertToIdr, format: formatCurrency } = useCurrency()
  const { lang, setLang, t } = useLanguage()
  const isIndo = lang === "id"
  const { theme, setTheme } = useTheme()
  
  // Real Database Profile States
  const [creatorDbData, setCreatorDbData] = useState<any>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isSuspended, setIsSuspended] = useState(false)
  const [dbSchedules, setDbSchedules] = useState<any[]>([])
  const [dbScheduleTitle, setDbScheduleTitle] = useState<string>("Jadwal Live Streaming")
  const [rawgGameImages, setRawgGameImages] = useState<Record<string, string>>({})

  // Branding states synced from DB/localStorage
  const [logoUrl, setLogoUrl] = useState("")
  const [logoText, setLogoText] = useState("treetmi.id")
  const [companyName, setCompanyName] = useState("PT Asosiasi Karya Treetmi")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLogoUrl(localStorage.getItem("treetmi_logo_url") || "")
      setLogoText(localStorage.getItem("treetmi_logo_text") || "treetmi.id")
      setCompanyName(localStorage.getItem("treetmi_company_name") || "PT Asosiasi Karya Treetmi")
    }
  }, [])

  // Active Hub Tab Selection state
  const [activeTab, setActiveTab] = useState<"DUKUNG" | "MABAR" | "KARYA" | "ANTREAN">("DUKUNG")
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false)

  // Dynamic Game Image Fetching from RAWG.io API using developer API key
  useEffect(() => {
    if (!creatorDbData?.game_packages?.length) return

    const fetchGameImages = async () => {
      const newImages: Record<string, string> = { ...rawgGameImages }
      let hasUpdates = false

      for (const pkg of creatorDbData.game_packages) {
        const gameName = pkg.game_name
        if (!gameName || newImages[gameName]) continue

        try {
          const res = await fetch(`https://api.rawg.io/api/games?search=${encodeURIComponent(gameName)}&key=75b6f6dad7834b7ca30b140ad3ddab3a&page_size=1`)
          const json = await res.json()
          if (json.results && json.results.length > 0) {
            const imgUrl = json.results[0].background_image
            if (imgUrl) {
              newImages[gameName] = imgUrl
              hasUpdates = true
            }
          }
        } catch (e) {
          console.warn(`Gagal mencari cover game dari RAWG.io untuk ${gameName}:`, e)
        }
      }

      if (hasUpdates) {
        setRawgGameImages(newImages)
      }
    }

    fetchGameImages()
  }, [creatorDbData?.game_packages])

  const config = getCreatorConfig(displayUsername)

  // Map real packages from database if available
  const dbPackages = creatorDbData?.game_packages?.map((pkg: any) => {
    const priceNum = parseFloat(pkg.price_per_slot)
    return {
      id: pkg.id,
      gameName: pkg.game_name,
      packageName: creatorDbData?.service_btn_title || "Layanan Mabar & Sesi",
      price: convertFromIdr(priceNum),
      originalPrice: convertFromIdr(priceNum * 1.3),
      category: pkg.game_name,
      isPopular: true,
      image: rawgGameImages[pkg.game_name] || getGameIcon(pkg.game_name),
      type: "MABAR",
      status: pkg.status
    }
  }) || []

  // Map real project assets from database if available
  const dbProjects = creatorDbData?.project_assets?.map((proj: any) => {
    const priceNum = parseFloat(proj.min_support)
    let emoji = "📦"
    const lowerTitle = proj.title.toLowerCase()
    if (lowerTitle.includes("guide") || lowerTitle.includes("panduan") || lowerTitle.includes("book")) {
      emoji = "📚"
    } else if (lowerTitle.includes("source") || lowerTitle.includes("code") || lowerTitle.includes("template")) {
      emoji = "💻"
    } else if (lowerTitle.includes("design") || lowerTitle.includes("sketch") || lowerTitle.includes("art")) {
      emoji = "🎨"
    }
    return {
      id: proj.id,
      gameName: proj.title,
      packageName: proj.description || `Karya / Produk Digital: ${proj.title}`,
      price: convertFromIdr(priceNum),
      originalPrice: convertFromIdr(priceNum * 1.3),
      category: "KARYA DIGITAL",
      isPopular: false,
      image: emoji,
      type: "PROJECT"
    }
  }) || []

  const combinedDbServices = [...dbPackages, ...dbProjects]
  const unfilteredPackages = combinedDbServices.filter((pkg: any) => {
    if (pkg.type === "MABAR") {
      return creatorDbData?.show_services !== false
    }
    return true
  })

  // Sort active products first
  const visiblePackages = [...unfilteredPackages].sort((a: any, b: any) => {
    const aActive = a.type === "PROJECT" || a.status === "ACTIVE"
    const bActive = b.type === "PROJECT" || b.status === "ACTIVE"
    if (aActive && !bActive) return -1
    if (!aActive && bActive) return 1
    return 0
  })

  const socialLinks = [
    { url: creatorDbData?.instagram_url, icon: <InstagramIcon className="h-5 w-5" />, label: "Instagram" },
    { url: creatorDbData?.youtube_url, icon: <YoutubeIcon className="h-5 w-5" />, label: "YouTube" },
    { url: creatorDbData?.discord_url, icon: <DiscordIcon className="h-5 w-5" />, label: "Discord" },
    { url: creatorDbData?.facebook_url, icon: <FacebookIcon className="h-5 w-5" />, label: "Facebook" },
    { url: creatorDbData?.twitch_url, icon: <TwitchIcon className="h-5 w-5" />, label: "Twitch" },
    { url: creatorDbData?.tiktok_url, icon: <TiktokIcon className="h-5 w-5" />, label: "TikTok" },
    { url: creatorDbData?.website_url, icon: <Globe className="h-5 w-5" />, label: "Website" },
  ]

  const fetchCreatorProfile = async () => {
    try {
      const res = await fetch(PUBLIC_API.profile(displayUsername))
      const json = await res.json()
      if (json.success && json.data) {
        // Cek flag suspended dari backend (dua cara: flag eksplisit atau field status)
        const isSuspendedUser =
          json.is_suspended === true ||
          json.data.status === 'SUSPENDED'

        setCreatorDbData(json.data)

        if (isSuspendedUser) {
          setIsSuspended(true)
          setIsLoadingProfile(false)
          return
        }
        setIsSuspended(false)
      }
      
      // Fetch schedules
      try {
        const schedRes = await fetch(`${API_BASE_URL}/schedules/${displayUsername}`)
        const schedJson = await schedRes.json()
        if (schedJson.success) {
          setDbSchedules(schedJson.data || [])
          setDbScheduleTitle(schedJson.schedule_title || (isIndo ? "Jadwal Live Streaming" : "Live Streaming Schedule"))
        }
      } catch (err) {
        console.warn("Gagal mengambil jadwal live dari db:", err)
      }
    } catch (e) {
      console.warn("Gagal sinkronisasi data riil kreator:", e)
    } finally {
      setIsLoadingProfile(false)
    }
  }

  useEffect(() => {
    fetchCreatorProfile()
  }, [displayUsername])

  // Real-time Socket.io: listen for profile updates from dashboard
  useEffect(() => {
    if (!creatorDbData?.id) return

    const socket = connectSocket()

    // Join the creator's room using their DB user ID
    socket.emit("join-streamer", creatorDbData.id)

    // When dashboard changes profile, refetch data
    const handleUpdate = () => {
      fetchCreatorProfile()
    }

    socket.on("profile:updated", handleUpdate)

    return () => {
      socket.off("profile:updated", handleUpdate)
    }
  }, [creatorDbData?.id])

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      toast.success(isIndo ? "Link profil disalin ke clipboard!" : "Profile link copied to clipboard!", {
        description: isIndo ? "Bagikan ke teman-temanmu agar mendukung kreator ini." : "Share it with your friends to support this creator.",
      })
    } else {
      toast.info((isIndo ? "Link profil: " : "Profile link: ") + window.location.href)
    }
  }

  // Submit support transaction simulated into database
  const onDonationSubmit = async (donationData: {
    amount: string
    senderName: string
    isAnonymous: boolean
    senderContact: string
    senderMessage: string
    mediashareUrl: string
    giftId?: string | null
    soundboardItemId?: string | null
    donationMedia?: {
      media_type: "YOUTUBE" | "TIKTOK" | "REELS" | "VOICE_NOTE" | "TEBAK_GAMBAR"
      media_url: string
    } | null
  }) => {
    const amountInIdr = convertToIdr(Number(donationData.amount))
    if (!donationData.amount || amountInIdr < 5000) {
      toast.error(isIndo ? `Minimal dukungan adalah ${formatCurrency(convertFromIdr(5000))}` : `Minimum support is ${formatCurrency(convertFromIdr(5000))}`, { duration: 3000 })
      return
    }

    const finalSender = donationData.isAnonymous ? (isIndo ? "Hamba Allah" : "Anonymous") : donationData.senderName || (isIndo ? "Anonim" : "Anonymous")
    
    try {
      const response = await fetch(PUBLIC_API.simulateTransaction, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          creatorUsername: displayUsername,
          senderName: finalSender,
          senderEmail: donationData.senderContact && donationData.senderContact.includes("@") ? donationData.senderContact : null,
          amount: amountInIdr,
          originalAmount: Number(donationData.amount),
          currencyCode: currency,
          type: "DONATION",
          message: donationData.senderMessage || `Dukungan untuk @${displayUsername}!`,
          mediashareUrl: donationData.mediashareUrl || null,
          giftId: donationData.giftId || null,
          soundboardItemId: donationData.soundboardItemId || null,
          donation_media: donationData.donationMedia || null
        })
      })

      const json = await response.json()
      if (json.success) {
        toast.success(isIndo ? `Dukungan sebesar ${formatCurrency(Number(donationData.amount))} berhasil dikirim!` : `Support of ${formatCurrency(Number(donationData.amount))} successfully sent!`, {
          description: isIndo 
            ? `Uang donasi dari ${finalSender} berhasil disimulasikan aman ke sub-account kreator.`
            : `Donation from ${finalSender} successfully simulated safely to creator's sub-account.`,
          duration: 6000
        })
        fetchCreatorProfile()
      } else {
        toast.error(isIndo ? "Gagal memproses transaksi." : "Failed to process transaction.")
      }
    } catch (err) {
      console.error(err)
      toast.error(isIndo ? "Gagal menghubungi server API." : "Failed to connect to API server.")
    }
  }

  // Submit mabar slot transaction simulated into database
  const onMabarSubmit = async (mabarData: {
    packageId: string
    ign: string
    gameId: string
    quantity: number
    message: string
  }) => {
    const pkg = visiblePackages.find((p) => p.id === mabarData.packageId)
    const basePriceIdr = convertToIdr(pkg?.price || 15000)
    const totalAmountIdr = basePriceIdr * mabarData.quantity

    try {
      const response = await fetch(PUBLIC_API.simulateTransaction, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          creatorUsername: displayUsername,
          senderName: mabarData.ign,
          amount: Number(totalAmountIdr),
          type: "MABAR",
          message: `[IGN: ${mabarData.ign}] [ID: ${mabarData.gameId}]${mabarData.message ? ` - ${mabarData.message}` : ""}`,
          packageId: mabarData.packageId,
          ingameId: mabarData.gameId,
          quantity: mabarData.quantity
        })
      })

      const json = await response.json()
      if (json.success) {
        toast.success(isIndo ? `Slot antrean Mabar ${pkg?.gameName} Berhasil Dipesan!` : `Mabar slot queue for ${pkg?.gameName} successfully ordered!`, {
          description: isIndo
            ? `Checkout aman terkirim ke Xendit. Nomor antrean Anda terupdate di papan aktivitas!`
            : `Secure checkout sent to Xendit. Your queue number has been updated in the activity board!`,
          duration: 6000
        })
        fetchCreatorProfile()
      } else {
        toast.error(isIndo ? "Gagal memproses antrean mabar." : "Failed to process mabar queue.")
      }
    } catch (err) {
      console.error(err)
      toast.error(isIndo ? "Gagal menghubungi server API." : "Failed to connect to the API server.")
    }
  }

  // Submit digital creations checkout transaction simulated into database
  const onProjectSubmit = async (projectData: {
    projectId: string
    title: string
    amount: string
    email: string
    name: string
    message: string
  }) => {
    await onDonationSubmit({
      amount: projectData.amount,
      senderName: projectData.name || (isIndo ? "Hamba Allah" : "Anonymous"),
      isAnonymous: !projectData.name,
      senderContact: projectData.email,
      senderMessage: `[KARYA: ${projectData.projectId}] ${projectData.message}`,
      mediashareUrl: ""
    })
  }

  // Show premium spinner while loading DB records
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0A0A0A] flex flex-col items-center justify-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 rounded-full border-4 border-dashed border-[#FFD551] animate-spin" />
          <span className="absolute text-xl">👾</span>
        </div>
        <p className="text-xs font-black uppercase italic tracking-widest text-[#706E68] dark:text-[#A09E96]">
          {isIndo ? "Sinkronisasi Arena Treetmi..." : "Synchronizing Treetmi Arena..."}
        </p>
      </div>
    )
  }

  // Profile normal — jika suspended, render di belakang overlay frosted glass
  return (
    <div className="relative">

    {/* ── SUSPENDED OVERLAY ──────────────────────────────────────────────── */}
    {isSuspended && (
      <div className="fixed inset-0 z-[999] flex items-center justify-center px-4"
           style={{ backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', background: 'rgba(0,0,0,0.45)' }}>
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/50 rounded-3xl p-8 shadow-2xl text-center space-y-5">
          {/* Avatar */}
          <div className="relative inline-flex">
            <div className="w-20 h-20 rounded-[20px] bg-slate-100 dark:bg-zinc-800 border-4 border-red-300 dark:border-red-800 overflow-hidden flex items-center justify-center mx-auto">
              {creatorDbData?.avatar_url ? (
                <img src={creatorDbData.avatar_url} alt={displayUsername} className="w-full h-full object-cover grayscale" />
              ) : (
                <span className="text-3xl font-black text-slate-400">{displayUsername.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <span className="absolute -top-1 -right-1 text-2xl">⛔</span>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <h1 className="text-lg font-black uppercase tracking-tight text-red-500">{isIndo ? "Akun Ditangguhkan" : "Account Suspended"}</h1>
            <p className="text-sm font-bold text-slate-600 dark:text-zinc-300">@{displayUsername}</p>
          </div>

          {/* Info */}
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-2xl p-4 text-left space-y-1.5">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-red-500">{isIndo ? "Kenapa ini terjadi?" : "Why did this happen?"}</p>
            <p className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 leading-relaxed">
              {isIndo ? (
                <>
                  Akun kreator ini sedang <strong>dinonaktifkan sementara</strong> oleh tim admin.
                  Selama masa penangguhan, kreator <strong>tidak dapat menerima donasi, pesanan mabar, atau layanan apapun.</strong>
                </>
              ) : (
                <>
                  This creator account is currently <strong>temporarily disabled</strong> by the admin team.
                  During the suspension, the creator <strong>cannot receive donations, play requests (mabar), or any services.</strong>
                </>
              )}
            </p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-2">
            {[
              isIndo ? "❌ Donasi Diblokir" : "❌ Donations Blocked",
              isIndo ? "❌ Mabar Diblokir" : "❌ Play Blocked",
              isIndo ? "❌ Layanan Nonaktif" : "❌ Services Inactive"
            ].map((item) => (
              <span key={item} className="px-3 py-1 text-[9px] font-extrabold uppercase italic tracking-wider rounded-full bg-red-100 dark:bg-red-950/50 text-red-500 border border-red-200 dark:border-red-900/40">
                {item}
              </span>
            ))}
          </div>

          {/* Back button */}
          <a
            href="/creators"
            className="inline-flex items-center justify-center gap-2 w-full h-11 rounded-2xl bg-slate-900 dark:bg-[#FFD551] text-white dark:text-black text-xs font-black uppercase italic tracking-wider hover:opacity-90 transition-all"
          >
            {isIndo ? "🔍 Temukan Kreator Lain" : "🔍 Find Other Creators"}
          </a>

          <p className="text-[9px] font-semibold text-slate-400 dark:text-zinc-650 uppercase tracking-wider">
            {isIndo 
              ? "© 2026 Treetmi.id — Jika Anda pemilik akun ini, hubungi support." 
              : "© 2026 Treetmi.id — If you are the owner of this account, contact support."}
          </p>
        </div>
      </div>
    )}

    {/* ── PROFILE CONTENT (non-interactive if suspended) ─────────────────── */}
    <div className={isSuspended ? 'pointer-events-none select-none grayscale opacity-75' : ''}>
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#141414] py-6 px-4 flex flex-col justify-start items-center gap-4 relative overflow-hidden">
      
      {/* Dynamic slow-floating decorative background game/art-inspired SVGs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-[0.06] dark:opacity-[0.1] select-none">
        {/* Game Controller */}
        <motion.div
          className="absolute text-slate-800 dark:text-[#EAE9E4] w-48 h-48 opacity-[0.3]"
          style={{ top: "15%", left: "3%" }}
          animate={{
            y: [0, -25, 0],
            rotate: [0, 10, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full">
            <rect x="2" y="6" width="20" height="12" rx="3" />
            <path d="M6 12h4M8 10v4M15 11h.01M18 13h.01" />
          </svg>
        </motion.div>

        {/* Paint Brush / Art outlines */}
        <motion.div
          className="absolute text-slate-800 dark:text-[#EAE9E4] w-40 h-40 opacity-[0.3]"
          style={{ top: "55%", right: "2%" }}
          animate={{
            y: [0, 20, 0],
            rotate: [0, -15, 0]
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full">
            <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3Z" />
            <path d="M3 21h18" />
            <path d="M9 12H3m6-4H5m4 8H7" />
          </svg>
        </motion.div>

        {/* Stars */}
        <motion.div
          className="absolute text-slate-800 dark:text-[#EAE9E4] w-36 h-36 opacity-[0.3]"
          style={{ top: "35%", right: "12%" }}
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </motion.div>

        {/* Headphones */}
        <motion.div
          className="absolute text-slate-800 dark:text-[#EAE9E4] w-44 h-44 opacity-[0.3]"
          style={{ bottom: "8%", left: "25%" }}
          animate={{
            y: [0, 20, 0],
            rotate: [0, 15, 0]
          }}
          transition={{
            duration: 8.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full">
            <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
          </svg>
        </motion.div>
      </div>
      
      {/* 1. TOP HEADER BRANDING NAVBAR */}
      <div className="max-w-[1200px] w-full mx-auto flex justify-between items-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-6 py-4 shadow-sm relative z-10">
        <div className="flex items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt={logoText} className="h-12 object-contain max-w-[240px]" />
          ) : (
            <span className="text-2xl font-black italic tracking-tighter text-[#1A1A19] dark:text-white flex items-center gap-1 leading-none uppercase">
              {logoText.split('.')[0]}<span className="text-[#FFD551]">.{logoText.split('.')[1] || 'id'}</span>
            </span>
          )}
          <span className="text-[8px] font-black uppercase tracking-widest bg-[#FFD551] text-black px-2 py-0.5 rounded italic leading-none shrink-0 select-none">
            ARENA
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-black uppercase italic text-slate-400 select-none">
            <Laptop className="h-3.5 w-3.5" /> SECURE ESCROW PROTECTION
          </span>

          {/* Theme & Language Selector Controls */}
          <div className="flex items-center gap-2.5 border-l border-slate-200 dark:border-zinc-800 pl-3.5">
            {/* Language Selector Pill */}
            <div className="flex bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl border border-slate-200/40 dark:border-zinc-800">
              <button 
                type="button"
                onClick={() => setLang("id")}
                className={`px-2.5 py-1 text-[9px] font-extrabold uppercase rounded-lg transition-all cursor-pointer ${
                  lang === "id" 
                    ? "bg-[#FFD551] text-black shadow-sm" 
                    : "text-slate-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                ID
              </button>
              <button 
                type="button"
                onClick={() => setLang("en")}
                className={`px-2.5 py-1 text-[9px] font-extrabold uppercase rounded-lg transition-all cursor-pointer ${
                  lang === "en" 
                    ? "bg-[#FFD551] text-black shadow-sm" 
                    : "text-slate-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                EN
              </button>
            </div>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center justify-center h-8 px-3 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-[#FFD551] active:scale-95 transition-all text-[9px] font-extrabold uppercase italic gap-1.5 cursor-pointer"
            >
              {theme === "dark" ? (
                <>☀️ <span className="hidden sm:inline">LIGHT</span></>
              ) : (
                <>🌙 <span className="hidden sm:inline">DARK</span></>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* 2. DYNAMIC HEADER COVER BANNER (FULL WIDTH OF THE PROFILE AREA) */}
      <div className="max-w-[1200px] w-full mx-auto bg-[#FAF8F2] dark:bg-[#181818] border-2 border-zinc-950 dark:border-zinc-800 rounded-2xl shadow-[4px_4px_0px_#1a1a1a] dark:shadow-[4px_4px_0px_#000000] relative overflow-hidden z-10 mb-4">
        {/* Dynamic Header Cover Image / Gradient */}
        {creatorDbData?.banner_url ? (
          <div 
            className="w-full h-40 sm:h-52 md:h-60 bg-cover bg-center border-b-2 border-zinc-950 dark:border-zinc-800" 
            style={{ backgroundImage: `url(${creatorDbData.banner_url})` }}
          />
        ) : (
          <div className={`w-full h-40 sm:h-52 md:h-60 bg-gradient-to-r ${getBannerGradient(creatorDbData?.role_title || config.role || "")} border-b-2 border-zinc-950 dark:border-zinc-800`} />
        )}

        {/* Live indicator bubble floating top left inside Banner */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white dark:bg-[#1D1D1D] px-3 py-1.5 rounded-full border border-slate-200 dark:border-zinc-800 shadow-sm z-20">
          {creatorDbData && !creatorDbData.is_live ? (
            <>
              <div className="h-2 w-2 rounded-full bg-zinc-400 animate-pulse" />
              <span className="text-[9px] font-black tracking-widest uppercase italic text-zinc-400">OFFLINE</span>
            </>
          ) : (
            <>
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </div>
              <span className="text-[9px] font-black tracking-widest uppercase italic text-red-650 dark:text-red-450">LIVE</span>
            </>
          )}
        </div>

        {/* Floating Controls Overlay inside Banner */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
          {/* Share */}
          <button 
            onClick={handleShare}
            className="flex items-center justify-center h-9 w-9 rounded-xl bg-white border border-[#E5E3DD] shadow-sm hover:bg-[#F8F7F3] active:scale-[0.93] transition-all dark:bg-[#1D1D1D] dark:border-[#2E2E2E] dark:hover:bg-[#262626] cursor-pointer"
            aria-label="Share Profile"
          >
            <Share2 className="h-4 w-4 text-[#706E68] dark:text-[#A09E96]" />
          </button>
          
          {/* Bell Notification */}
          <button 
            onClick={() => setIsAlertModalOpen(true)}
            className="flex items-center justify-center h-9 w-9 rounded-xl bg-white border border-[#E5E3DD] shadow-sm hover:bg-[#F8F7F3] active:scale-[0.93] transition-all dark:bg-[#1D1D1D] dark:border-[#2E2E2E] dark:hover:bg-[#262626] relative cursor-pointer"
            aria-label="Stream Alerts"
          >
            <Bell className="h-4 w-4 text-[#706E68] dark:text-[#A09E96]" />
            <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-[#FFD551] border-2 border-white rounded-full dark:border-[#141414]" />
          </button>
        </div>

        {/* Identity Section that overlaps the banner */}
        <div className="px-6 pb-6 pt-4 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-5 relative z-10 text-center md:text-left">
            {/* Avatar Rounded Square */}
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-white border-4 border-zinc-950 dark:border-zinc-800 overflow-hidden flex items-center justify-center text-4xl font-black italic shadow-[4px_4px_0px_#1a1a1a] dark:shadow-[4px_4px_0px_#000000] dark:bg-[#1C1C1C] shrink-0 -mt-16 md:-mt-20 relative z-10">
              {creatorDbData?.avatar_url ? (
                <img src={creatorDbData.avatar_url} alt={displayUsername} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-slate-400 select-none uppercase">{displayUsername.charAt(0)}</span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-1.5 justify-center md:justify-start leading-none text-slate-800 dark:text-[#EAE9E4]">
                  @{displayUsername}
                  {creatorDbData?.is_verified && (
                    <img src="/verified.svg" alt="Verified" className="w-[24px] h-[24px] shrink-0" />
                  )}
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="text-[10px] font-black text-[#A07800] dark:text-[#FFD551] uppercase tracking-wider bg-[#FFD551]/10 dark:bg-[#FFD551]/15 border border-[#FFD551]/40 dark:border-[#FFD551]/20 px-2.5 py-0.5 rounded-lg italic shadow-sm shrink-0">
                    {creatorDbData?.role_title || config.role || "CREATOR"}
                  </span>
                  {creatorDbData?.trust_badge && (
                    <img 
                      src={creatorDbData.trust_badge.badge_url}
                      alt={creatorDbData.trust_badge.name}
                      className="h-6 w-auto object-contain max-w-[100px] select-none"
                      title={`${creatorDbData.trust_badge.name} (${creatorDbData.unique_supporters || 0} Pendukung)`}
                    />
                  )}
                </div>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400 max-w-[750px] leading-relaxed">
                {creatorDbData?.bio || config.bio || (isIndo ? "Belum ada bio." : "No biography written yet.")}
              </p>
            </div>
          </div>

          {/* Social Icons row */}
          <div className="flex flex-wrap justify-center gap-2.5 md:pb-1">
            {socialLinks.map((social, index) => {
              // In dev or preview, show dummy links for Instagram, YouTube, Discord if none are configured in database
              const fallbackUrls: Record<string, string> = {
                Instagram: "https://instagram.com",
                YouTube: "https://youtube.com",
                Discord: "https://discord.com"
              }
              const targetUrl = social.url || fallbackUrls[social.label]
              if (!targetUrl) return null

              return (
                <a 
                  key={index}
                  href={externalLink(targetUrl)} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#FFD551] text-black border-2 border-zinc-950 shadow-[2px_2px_0px_#1a1a1a] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#ffe082] hover:translate-y-[-1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#1a1a1a] transition-all cursor-pointer"
                  title={social.label}
                >
                  {social.icon}
                </a>
              )
            })}
          </div>
        </div>
      </div>

      {/* 3. SPLIT GRID ARENA WORKSPACE */}
      <div className="max-w-[1200px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 items-start relative z-10">
        
        {/* Left Side: Identity & Sidebar (col-span-4) */}
        <div className="lg:col-span-4">
          <ProfileSidebar 
            creatorDbData={creatorDbData}
            displayUsername={displayUsername}
            config={config}
            dbSchedules={dbSchedules}
            dbScheduleTitle={dbScheduleTitle}
          />
        </div>

        {/* Right Side: Action Arena & Tab interactive Hub (col-span-8) */}
        <div className="lg:col-span-8 bg-[#FAF8F2] dark:bg-[#181818] border-2 border-zinc-950 dark:border-zinc-800 rounded-2xl p-6 shadow-[4px_4px_0px_#1a1a1a] dark:shadow-[4px_4px_0px_#000000] space-y-6">
          {/* Custom high-end Tab selector buttons */}
          <div className="flex bg-[#FAF9F6] border border-[#E5E3DD] p-1.5 rounded-2xl dark:bg-zinc-950/40 dark:border-zinc-800 flex-wrap sm:flex-nowrap gap-1">
            <button
              onClick={() => setActiveTab("DUKUNG")}
              className={`flex-1 py-3 text-[11px] font-black uppercase italic rounded-xl transition-all cursor-pointer ${
                activeTab === "DUKUNG"
                  ? "bg-[#FFD551] text-black border-2 border-zinc-950 shadow-[2px_2px_0px_#1a1a1a] dark:shadow-[2px_2px_0px_#000000]"
                  : "text-slate-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Heart className="h-3.5 w-3.5 fill-[#FFD551]" /> {isIndo ? "Dukung" : "Support"}
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab("MABAR")}
              className={`flex-1 py-3 text-[11px] font-black uppercase italic rounded-xl transition-all cursor-pointer ${
                activeTab === "MABAR"
                  ? "bg-[#FFD551] text-black border-2 border-zinc-950 shadow-[2px_2px_0px_#1a1a1a] dark:shadow-[2px_2px_0px_#000000]"
                  : "text-slate-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Gamepad2 className="h-3.5 w-3.5" /> {creatorDbData?.service_btn_title || "Mabar"}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("KARYA")}
              className={`flex-1 py-3 text-[11px] font-black uppercase italic rounded-xl transition-all cursor-pointer ${
                activeTab === "KARYA"
                  ? "bg-[#FFD551] text-black border-2 border-zinc-950 shadow-[2px_2px_0px_#1a1a1a] dark:shadow-[2px_2px_0px_#000000]"
                  : "text-slate-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Unlock className="h-3.5 w-3.5" /> {isIndo ? "Karya" : "Creations"}
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab("ANTREAN")}
              className={`flex-1 py-3 text-[11px] font-black uppercase italic rounded-xl transition-all cursor-pointer ${
                activeTab === "ANTREAN"
                  ? "bg-[#FFD551] text-black border-2 border-zinc-950 shadow-[2px_2px_0px_#1a1a1a] dark:shadow-[2px_2px_0px_#000000]"
                  : "text-slate-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Activity className="h-3.5 w-3.5" /> {isIndo ? "Aktivitas" : "Activity"}
              </span>
            </button>
          </div>

          {/* Tab area — fully disabled if suspended via outer pointer-events-none */}

          {/* Active Tab Screen Content Injection */}
          <div className="min-h-[640px] flex flex-col justify-between">
            {activeTab === "DUKUNG" && (
              <DonationTab 
                creatorDbData={creatorDbData}
                displayUsername={displayUsername}
                config={config}
                onDonationSubmit={onDonationSubmit}
              />
            )}

            {activeTab === "MABAR" && (
              <MabarTab 
                mode="MABAR"
                creatorDbData={creatorDbData}
                displayUsername={displayUsername}
                config={config}
                visiblePackages={visiblePackages.filter((pkg: any) => pkg.type === "MABAR")}
                onMabarSubmit={onMabarSubmit}
              />
            )}

            {activeTab === "KARYA" && (
              <MabarTab 
                mode="KARYA"
                creatorDbData={creatorDbData}
                displayUsername={displayUsername}
                config={config}
                visiblePackages={visiblePackages.filter((pkg: any) => pkg.type === "PROJECT")}
                onMabarSubmit={onMabarSubmit}
                onProjectSubmit={onProjectSubmit}
              />
            )}

            {activeTab === "ANTREAN" && (
              <QueueTab 
                creatorDbData={creatorDbData}
              />
            )}
          </div>

        </div>

      </div>

      {/* 3. FOOTER COPYRIGHT — Minimal, only PT name + Powered by */}
      <div className="max-w-[1200px] w-full mx-auto mt-auto pt-8 pb-4 text-center relative z-10 space-y-2 flex flex-col items-center">
        <p className="text-[10px] font-extrabold uppercase italic tracking-widest text-slate-400 dark:text-zinc-500">
          © {new Date().getFullYear()} {companyName}
        </p>
        <p className="text-[8px] font-bold italic text-slate-300 dark:text-zinc-650 tracking-wider">
          Powered by Treetmi.id
        </p>
        <div className="pt-1">
          <span className="inline-block text-[9px] font-bold font-mono tracking-wider bg-[#FFD551] text-black border border-black px-2.5 py-0.5 uppercase select-none">
            BUILD ID: treetmi-v2.6.4-prod
          </span>
        </div>
      </div>

      {/* WhatsApp Alerts Dialog Modal */}
      <WhatsappAlertModal 
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        username={displayUsername}
      />

    </div>
  </div>
  </div>
  )
}
