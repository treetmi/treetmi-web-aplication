"use client"
import WidgetStudio from "@/components/widget-studio"
import MediaSettingsTab from "./components/MediaSettingsTab"
import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import { useLanguage } from "@/components/language-provider"
import { API_BASE_URL } from "@/lib/api"
import { useCurrency, CURRENCY_MAP, type CurrencyCode } from "@/components/currency-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { formatNumberInput, parseNumberInput, printPayoutInvoice } from "@/lib/utils"
import { fetchWithRetry } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { 
  LayoutDashboard, 
  Wallet, 
  CreditCard, 
  ArrowUpRight, 
  Plus, 
  Trash2, 
  Settings, 
  Link2, 
  Copy, 
  Check, 
  RefreshCw, 
  Play, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  ShieldCheck, 
  Gamepad2, 
  Terminal, 
  Palette, 
  Tv, 
  Users,
  AlertCircle,
  ChevronRight,
  Sun,
  Moon,
  Languages,
  UserCircle,
  LogOut,
  Coins,
  FolderGit,
  Lock,
  Download,
  UploadCloud,
  ArrowUpCircle,
  Pencil,
  Star,
  Flame,
  Trophy,
  Target,
  Zap,
  Calendar,
  X,
  Megaphone
} from "lucide-react"

const VerifiedBadge = ({ className = "h-4 w-4" }: { className?: string }) => (
  <img
    src="/verified.svg"
    alt="Verified"
    className={`${className} flex-shrink-0`}
  />
)

const TrustBadge = ({ count = 0, dbBadge }: { count: number, dbBadge?: any }) => {
  if (dbBadge) {
    // Render dynamic trust badge image directly without wrapper capsule!
    return (
      <div className="mt-1 flex items-center justify-start select-none">
        <img 
          src={dbBadge.badge_url}
          alt={dbBadge.name}
          className="h-6 w-auto object-contain max-w-[120px] select-none"
          title={`${dbBadge.name} (${count} Pendukung)`}
          onError={(e) => {
            e.currentTarget.style.display = "none"
          }}
        />
      </div>
    )
  }

  return null
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { setTheme } = useTheme()
  const { lang, setLang, t } = useLanguage()
  const { currency, setCurrency, format, convertFromIdr } = useCurrency()
  
  // API URL
  const API_BASE = API_BASE_URL

  // Live Database States
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState(0)
  const [totalGross, setTotalGross] = useState(0)
  const [isLive, setIsLive] = useState(false)
  const [role, setRole] = useState("GAMER") // GAMER | DEVELOPER | DESIGNER
  const [widgetToken, setWidgetToken] = useState("")
  const [originUrl, setOriginUrl] = useState("http://localhost:3000")
  const [isCopied, setIsCopied] = useState(false)
  const [isCopiedMedia, setIsCopiedMedia] = useState(false)
  const [isCopiedQueue, setIsCopiedQueue] = useState(false)
  const [isCopiedDonors, setIsCopiedDonors] = useState(false)
  const [isCopiedTarget, setIsCopiedTarget] = useState(false)
  const [customDonorsTitle, setCustomDonorsTitle] = useState("")
  const [customDonorsPeriod, setCustomDonorsPeriod] = useState("all")
  const [customTickerTitle, setCustomTickerTitle] = useState("")
  const [customTickerPeriod, setCustomTickerPeriod] = useState("all")
  const [customRoleInput, setCustomRoleInput] = useState("")
  const [isCustomRoleActive, setIsCustomRoleActive] = useState(false)

  // Active Tab State
  const [activeTab, setActiveTab] = useState("profile")
  const isInitialMountRef = useRef(true)
  const [callingCooldowns, setCallingCooldowns] = useState<Record<string, boolean>>({})
  const [profileSubTab, setProfileSubTab] = useState("edit")
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)

  // States for Verified Badge Application
  const [isScanning, setIsScanning] = useState(false)
  const [scanLogs, setScanLogs] = useState<string[]>([])
  const [scanProgress, setScanProgress] = useState(0)
  const [verificationCountdown, setVerificationCountdown] = useState(0)
  const [verifyPlatform, setVerifyPlatform] = useState("")
  const [verifyMessage, setVerifyMessage] = useState("")
  const [verifyScreenshot, setVerifyScreenshot] = useState<File | null>(null)
  const [verifyScreenshotPreview, setVerifyScreenshotPreview] = useState<string | null>(null)
  const [isUploadingVerification, setIsUploadingVerification] = useState(false)

  // Form Pengaturan Profil
  const [editBio, setEditBio] = useState("")
  const [editInstagram, setEditInstagram] = useState("")
  const [editYoutube, setEditYoutube] = useState("")
  const [editDiscord, setEditDiscord] = useState("")
  const [editFacebook, setEditFacebook] = useState("")
  const [editTwitch, setEditTwitch] = useState("")
  const [editTiktok, setEditTiktok] = useState("")
  const [editWebsite, setEditWebsite] = useState("")
  const [editTargetTitle, setEditTargetTitle] = useState("")
  const [editTargetAmount, setEditTargetAmount] = useState("")
  const [feeDonation, setFeeDonation] = useState(5)
  const [feeMabar, setFeeMabar] = useState(8)
  const [showTarget, setShowTarget] = useState(true)
  const [showQueue, setShowQueue] = useState(true)
  const [showReviews, setShowReviews] = useState(true)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showServices, setShowServices] = useState(true)
  const [editServiceBtnTitle, setEditServiceBtnTitle] = useState("AJAK MAIN BARENG")
  const [editServiceBtnSubtitle, setEditServiceBtnSubtitle] = useState("(JASA MABAR)")
  const [editSupportBtnTitle, setEditSupportBtnTitle] = useState("KIRIM DUKUNGAN")
  const [editSupportBtnSubtitle, setEditSupportBtnSubtitle] = useState("(DONASI)")
  const [editScheduleTitleSetting, setEditScheduleTitleSetting] = useState("Jadwal Live Streaming")
  const [mabarPromoBuy, setMabarPromoBuy] = useState<number>(0)
  const [mabarPromoGet, setMabarPromoGet] = useState<number>(0)
  
  // Real database schedules list & form states
  const [schedules, setSchedules] = useState<any[]>([])
  const [newSchedTitle, setNewSchedTitle] = useState("")
  const [newSchedCategory, setNewSchedCategory] = useState("")
  const [newSchedDate, setNewSchedDate] = useState("")
  const [newSchedDesc, setNewSchedDesc] = useState("")
  const [isAddSchedOpen, setIsAddSchedOpen] = useState(false)
  
  const [masterAvatars, setMasterAvatars] = useState<any[]>([])
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)
  const [avatarBust, setAvatarBust] = useState(Date.now())
  
  // Lists
  const [packages, setPackages] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [queues, setQueues] = useState<any[]>([])
  const [selectedActiveIds, setSelectedActiveIds] = useState<string[]>([])
  const [selectedPendingIds, setSelectedPendingIds] = useState<string[]>([])
  const [projects, setProjects] = useState<any[]>([])

  // Modal & Form States
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const [isAddPackageOpen, setIsAddPackageOpen] = useState(false)
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{type: 'package' | 'project' | 'schedule', id: string, name: string} | null>(null)
  
  // Edit States
  const [editingPackage, setEditingPackage] = useState<any>(null)
  const [isEditPackageOpen, setIsEditPackageOpen] = useState(false)
  const [editPkgName, setEditPkgName] = useState("")
  const [editPkgPrice, setEditPkgPrice] = useState("")
  const [editPkgGame, setEditPkgGame] = useState("")
  const [editingProject, setEditingProject] = useState<any>(null)
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false)
  const [editProjTitle, setEditProjTitle] = useState("")
  const [editProjDesc, setEditProjDesc] = useState("")
  const [editProjUrl, setEditProjUrl] = useState("")
  const [editProjMinSupport, setEditProjMinSupport] = useState("")
  
  // Withdraw
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [bankName, setBankName] = useState("BCA")
  const [bankNumber, setBankNumber] = useState("")
  const [bankHolder, setBankHolder] = useState("")

  // Form Paket Jasa
  const [selectedGame, setSelectedGame] = useState("")
  const [newPkgName, setNewPkgName] = useState("")
  const [newPkgPrice, setNewPkgPrice] = useState("")
  const [newPkgDesc, setNewPkgDesc] = useState("")

  // Form Proyek Digital
  const [newProjTitle, setNewProjTitle] = useState("")
  const [newProjDesc, setNewProjDesc] = useState("")
  const [newProjUrl, setNewProjUrl] = useState("")
  const [newProjMinSupport, setNewProjMinSupport] = useState("")

  // Finance Data Table States
  const [financeSubTab, setFinanceSubTab] = useState<"income" | "payout">("income")
  const [financeFilter, setFinanceFilter] = useState<"SEMUA" | "DONATION" | "MABAR">("SEMUA")
  const [financePage, setFinancePage] = useState(1)

  // Bank Account Lock & Support Ticket States
  const [isBankLocked, setIsBankLocked] = useState(false)
  const [tickets, setTickets] = useState<any[]>([])
  const [newTicketTitle, setNewTicketTitle] = useState("")
  const [newTicketMessage, setNewTicketMessage] = useState("")
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null)

  // 1. Fetch Profile and Initial Data
  const fetchDashboardData = async () => {
    if (!session?.user?.name) return
    try {
      // Fetch site settings for active platform fees
      try {
        const settingsRes = await fetchWithRetry(`${API_BASE}/admin/settings`)
        const settingsJson = await settingsRes.json()
        if (settingsJson.success && settingsJson.data) {
          setFeeDonation(settingsJson.data.feeDonation !== undefined ? parseFloat(settingsJson.data.feeDonation) : 5)
          setFeeMabar(settingsJson.data.feeMabar !== undefined ? parseFloat(settingsJson.data.feeMabar) : 8)
        }
      } catch (err) {
        console.error("Gagal mengambil pengaturan fee platform:", err)
      }

      // Get profile
      const profileRes = await fetchWithRetry(`${API_BASE}/users/profile/${session.user.name}`)
      const profileJson = await profileRes.json()
      
      if (profileJson.success && profileJson.data) {
        const uData = profileJson.data
        setProfile(uData)
        setBalance(Number(uData.balance))

        // Check verification status timer resumption
        if (uData.verification_status === "PENDING" && uData.verification_submitted_at) {
          const elapsed = Math.floor((Date.now() - new Date(uData.verification_submitted_at).getTime()) / 1000)
          const remaining = 60 - elapsed
          if (remaining > 0) {
            setVerificationCountdown(remaining)
          } else {
            setVerificationCountdown(0)
          }
        } else {
          setVerificationCountdown(0)
        }
        setTotalGross(Number(uData.balance))
        setIsLive(uData.is_live)
        setWidgetToken(uData.widget_token)
        
        // Normalize role_title
        const currentRole = uData.role_title || "GAMER"
        setRole(currentRole)

        // Populate profile settings states
        setEditBio(uData.bio || "")
        setEditInstagram(uData.instagram_url || "")
        setEditYoutube(uData.youtube_url || "")
        setEditDiscord(uData.discord_url || "")
        setEditFacebook(uData.facebook_url || "")
        setEditTwitch(uData.twitch_url || "")
        setEditTiktok(uData.tiktok_url || "")
        setEditWebsite(uData.website_url || "")
        setEditTargetTitle(uData.target_title || "Target Server & Course Gratis")
        setEditTargetAmount(uData.target_amount ? String(Number(uData.target_amount)) : "10000000")
        setShowTarget(uData.show_target !== false)
        setShowQueue(uData.show_queue !== false)
        setShowReviews(uData.show_reviews !== false)
        setShowCalendar(uData.show_calendar === true)
        setShowServices(uData.show_services !== false)
        setEditServiceBtnTitle(uData.service_btn_title || "AJAK MAIN BARENG")
        setEditServiceBtnSubtitle(uData.service_btn_subtitle || "(JASA MABAR)")
        setEditSupportBtnTitle(uData.support_btn_title || "KIRIM DUKUNGAN")
        setEditSupportBtnSubtitle(uData.support_btn_subtitle || "(DONASI)")
        setEditScheduleTitleSetting(uData.schedule_title || "Jadwal Live Streaming")
        setMabarPromoBuy(uData.mabar_promo_buy || 0)
        setMabarPromoGet(uData.mabar_promo_get || 0)

        // Load all associated packages (both active and inactive)
        const pkgRes = await fetchWithRetry(`${API_BASE}/games/packages/${uData.id}`)
        const pkgJson = await pkgRes.json()
        if (pkgJson.success) {
          setPackages(pkgJson.data || [])
        } else {
          setPackages([])
        }

        // Load live schedules list
        if (session.user.accessToken) {
          try {
            const schedRes = await fetchWithRetry(`${API_BASE}/schedules`, {
              headers: {
                "Authorization": `Bearer ${session.user.accessToken}`
              }
            })
            const schedJson = await schedRes.json()
            if (schedJson.success) {
              setSchedules(schedJson.data || [])
            }
          } catch (err) {
            console.error("Gagal mengambil data jadwal live:", err)
          }
        }

        // Load bank account settings if configured
        if (uData.bank_account) {
          setBankName(uData.bank_account.bank_name)
          setBankNumber(uData.bank_account.account_number)
          setBankHolder(uData.bank_account.account_holder_name)
          setIsBankLocked(!!uData.bank_account.is_locked)
        } else {
          setIsBankLocked(false)
        }

        // Fetch creative digital projects
        const projRes = await fetchWithRetry(`${API_BASE}/projects/${uData.id}`)
        const projJson = await projRes.json()
        if (projJson.success) {
          setProjects(projJson.data || [])
        }

        // Fetch active queue list
        const queueRes = await fetchWithRetry(`${API_BASE}/queues/streamer?streamerId=${uData.id}`)
        const queueJson = await queueRes.json()
        if (queueJson.success) {
          setQueues(queueJson.data || [])
        }

        // Fetch support tickets if authenticated
        if (session.user.accessToken) {
          try {
            const ticketRes = await fetchWithRetry(`${API_BASE}/tickets`, {
              headers: {
                "Authorization": `Bearer ${session.user.accessToken}`
              }
            })
            const ticketJson = await ticketRes.json()
            if (ticketJson.success) {
              setTickets(ticketJson.data || [])
            }
          } catch (err) {
            console.error("Gagal mengambil data tiket bantuan:", err)
          }
        }

        // Fetch financial history
        if (session.user.accessToken) {
          const historyRes = await fetchWithRetry(`${API_BASE}/finance/history`, {
            headers: {
              "Authorization": `Bearer ${session.user.accessToken}`
            }
          })
          const historyJson = await historyRes.json()
          if (historyJson.success && historyJson.data) {
            const txs = historyJson.data.transactions || []
            const wds = historyJson.data.withdrawals || []
            setWithdrawals(wds)
            
            // Calculate real gross revenue from successful transactions
            const successfulTxs = txs.filter((t: any) => t.status === "SUCCESS")
            const calculatedGross = successfulTxs.reduce((sum: number, t: any) => sum + Number(t.gross_amount), 0)
            setTotalGross(calculatedGross)

            // Unify into a single chronological financial ledger
            const combined = [
              ...txs.map((t: any) => ({
                id: t.id.substring(0, 8).toUpperCase(),
                sender: t.sender_name,
                amount: Number(t.gross_amount),
                type: t.type,
                status: t.status,
                rawDate: new Date(t.createdAt),
                date: new Date(t.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                }),
                message: t.message || "Tanpa pesan."
              })),
              ...wds.map((w: any) => ({
                id: w.id.substring(0, 8).toUpperCase(),
                sender: "Penarikan Dompet",
                amount: Number(w.amount_requested),
                type: "WITHDRAWAL",
                status: w.status,
                rawDate: new Date(w.createdAt),
                date: new Date(w.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                }),
                message: `Tarik dana ke rekening (Potongan transfer: Rp ${Number(w.disbursement_fee).toLocaleString("id-ID")})`
              }))
            ].sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime()) // Sort by newest first

            setTransactions(combined)
          }
        }
      }
    } catch (err: any) {
      console.warn("Error loading dashboard data (backend mungkin belum siap):", err)
    } finally {
      setLoading(false)
    }
  }

  // Load master avatars from admin API with gorgeous SVG local fallbacks
  const fetchMasterAvatars = async () => {
    try {
      const res = await fetchWithRetry(`${API_BASE}/admin/avatars`)
      const json = await res.json()
      if (json.success && json.data && json.data.length > 0) {
        setMasterAvatars(json.data)
      } else {
        const defaultAvatars = Array.from({ length: 8 }).map((_, i) => ({
          id: `default-${i+1}`,
          name: `Avatar ${i+1}`,
          url: `/avatars/avatar-${i+1}.svg`
        }))
        setMasterAvatars(defaultAvatars)
      }
    } catch (e) {
      console.warn("Failed fetching master avatars, using defaults:", e)
      const defaultAvatars = Array.from({ length: 8 }).map((_, i) => ({
        id: `default-${i+1}`,
        name: `Avatar ${i+1}`,
        url: `/avatars/avatar-${i+1}.svg`
      }))
      setMasterAvatars(defaultAvatars)
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData()
      fetchMasterAvatars()
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [session, status, router])

  // Parse dynamic URL active tab parameter
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get("tab")
      if (tab && ["overview", "services", "projects", "queue", "widget", "profile"].includes(tab)) {
        setActiveTab(tab)
      }
    }
  }, [session, status])

  // Load from localStorage on mount (hydration-safe)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOriginUrl(window.location.origin)
      const saved = localStorage.getItem("streamplay_dashboard_tab")
      if (saved && ["overview", "services", "projects", "queue", "widget", "profile"].includes(saved)) {
        setActiveTab(saved)
      }
      isInitialMountRef.current = false
    }
  }, [])

  // Save to localStorage when changed (only after successfully loaded)
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (isInitialMountRef.current) return
      localStorage.setItem("streamplay_dashboard_tab", activeTab)
    }
  }, [activeTab])

  // 2. Toggles & Settings Updates
  const handleToggleLive = async (checked: boolean) => {
    setIsLive(checked)
    if (!session?.user?.accessToken) return
    try {
      const res = await fetchWithRetry(`${API_BASE}/users/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify({ is_live: checked })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(checked ? "Status disetel LIVE! Widget OBS mulai mendeteksi donasi." : "Status offline.")
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal mengubah status live.")
      setIsLive(!checked)
    }
  }

  const handleUpdateRole = async (targetRole: string) => {
    setRole(targetRole)
    if (!session?.user?.accessToken) return
    try {
      const res = await fetchWithRetry(`${API_BASE}/users/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify({ role_title: targetRole })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Berhasil berpindah peran profesi ke ${targetRole}!`)
        fetchDashboardData()
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menyunting profesi kreator.")
    }
  }

  // OBS Token Reset
  const handleResetToken = async () => {
    if (!session?.user?.accessToken) return
    try {
      const res = await fetchWithRetry(`${API_BASE}/users/reset-token`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.user.accessToken}`
        }
      })
      const data = await res.json()
      if (data.success) {
        setWidgetToken(data.token)
        toast.success("Token Alert OBS berhasil di-reset dengan aman!")
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal mereset token alert OBS.")
    }
  }

  const handleCopyWidget = () => {
    const url = `${originUrl}/widget/alert/${widgetToken}`
    navigator.clipboard.writeText(url)
    setIsCopied(true)
    toast.success("Widget OBS Alert URL berhasil disalin!")
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleCopyMedia = () => {
    const url = `${originUrl}/widget/mediashare/${widgetToken}`
    navigator.clipboard.writeText(url)
    setIsCopiedMedia(true)
    toast.success("Widget OBS Mediashare URL berhasil disalin!")
    setTimeout(() => setIsCopiedMedia(false), 2000)
  }

  const handleCopyQueue = () => {
    const url = `${originUrl}/widget/queue/${widgetToken}`
    navigator.clipboard.writeText(url)
    setIsCopiedQueue(true)
    toast.success("Widget OBS Queue Ticker URL berhasil disalin!")
    setTimeout(() => setIsCopiedQueue(false), 2000)
  }

  const handleCopyDonors = (mode: string) => {
    let url = `${originUrl}/widget/donors/${widgetToken}?mode=${mode}`
    if (mode === "ticker") {
      if (customTickerTitle.trim()) {
        url += `&title=${encodeURIComponent(customTickerTitle.trim())}`
      }
      if (customTickerPeriod !== "all") {
        url += `&period=${customTickerPeriod}`
      }
    } else {
      if (customDonorsTitle.trim()) {
        url += `&title=${encodeURIComponent(customDonorsTitle.trim())}`
      }
      if (customDonorsPeriod !== "all") {
        url += `&period=${customDonorsPeriod}`
      }
    }
    navigator.clipboard.writeText(url)
    setIsCopiedDonors(true)
    toast.success(`Widget OBS Donors List URL (${mode}) berhasil disalin!`)
    setTimeout(() => setIsCopiedDonors(false), 2000)
  }

  const handleCopyTarget = () => {
    const url = `${originUrl}/widget/target/${widgetToken}`
    navigator.clipboard.writeText(url)
    setIsCopiedTarget(true)
    toast.success("Widget OBS Target Donasi URL berhasil disalin!")
    setTimeout(() => setIsCopiedTarget(false), 2000)
  }

  // 3. Financial Actions
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number(withdrawAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Nominal penarikan tidak valid!")
      return
    }

    if (amount > balance) {
      toast.error("Saldo tidak mencukupi untuk melakukan penarikan!")
      return
    }

    if (!session?.user?.accessToken) return

    try {
      // First update bank account details
      const bankRes = await fetchWithRetry(`${API_BASE}/finance/bank-account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify({
          bank_name: bankName,
          account_number: bankNumber,
          account_holder_name: bankHolder
        })
      })
      const bankJson = await bankRes.json()
      if (!bankJson.success) throw new Error(bankJson.message)

      // Trigger withdrawal
      const drawRes = await fetchWithRetry(`${API_BASE}/finance/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify({ amount })
      })
      const drawJson = await drawRes.json()
      if (!drawJson.success) throw new Error(drawJson.message)

      toast.success(`Permintaan penarikan Rp ${amount.toLocaleString("id-ID")} berhasil diajukan!`)
      setIsWithdrawOpen(false)
      setWithdrawAmount("")
      fetchDashboardData() // Reload ledger & balance
    } catch (err: any) {
      toast.error(err.message || "Gagal memproses penarikan saldo.")
    }
  }

  // 4. Creative Services Packages CRUD
  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault()
    const price = Number(newPkgPrice)
    if (!newPkgName || isNaN(price) || price <= 0) {
      toast.error("Form paket jasa tidak valid!")
      return
    }

    if (!session?.user?.accessToken) return

    try {
      const res = await fetchWithRetry(`${API_BASE}/games/packages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify({
          game_name: newPkgName,
          price_per_slot: price,
          status: "ACTIVE"
        })
      })
      const data = await res.json()
      if (data.success) {
        // Deactivate all other active packages to ensure ONLY the new one is ACTIVE
        const newPkg = data.data
        const otherActivePkgs = packages.filter((p: any) => p.status === "ACTIVE" && p.id !== newPkg?.id)
        for (const otherPkg of otherActivePkgs) {
          await fetchWithRetry(`${API_BASE}/games/packages/${otherPkg.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session.user.accessToken}`
            },
            body: JSON.stringify({
              game_name: otherPkg.game_name,
              price_per_slot: Number(otherPkg.price_per_slot),
              status: "INACTIVE"
            })
          })
        }

        toast.success(`Paket jasa "${newPkgName}" berhasil ditambahkan & aktif!`)
        setIsAddPackageOpen(false)
        setSelectedGame("")
        setNewPkgName("")
        setNewPkgPrice("")
        setNewPkgDesc("")
        fetchDashboardData()
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan paket jasa.")
    }
  }

  const handleDeletePackage = async (id: string) => {
    if (!session?.user?.accessToken) return
    try {
      const res = await fetchWithRetry(`${API_BASE}/games/packages/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${session.user.accessToken}`
        }
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Paket jasa berhasil dinonaktifkan!")
        fetchDashboardData()
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus paket jasa.")
    }
  }

  const handleToggleActivePackage = async (targetPkg: any) => {
    if (!session?.user?.accessToken) return

    try {
      // 1. Activate the targeted package
      const res = await fetchWithRetry(`${API_BASE}/games/packages/${targetPkg.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify({
          game_name: targetPkg.game_name,
          price_per_slot: Number(targetPkg.price_per_slot),
          status: "ACTIVE"
        })
      })
      const data = await res.json()
      if (!data.success) {
        throw new Error(data.message || "Gagal mengaktifkan paket.")
      }

      // 2. Deactivate all other packages that are currently "ACTIVE"
      const otherActivePkgs = packages.filter((p: any) => p.id !== targetPkg.id && p.status === "ACTIVE")
      for (const otherPkg of otherActivePkgs) {
        await fetchWithRetry(`${API_BASE}/games/packages/${otherPkg.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.user.accessToken}`
          },
          body: JSON.stringify({
            game_name: otherPkg.game_name,
            price_per_slot: Number(otherPkg.price_per_slot),
            status: "INACTIVE"
          })
        })
      }

      toast.success(`Layanan game "${targetPkg.game_name}" sekarang AKTIF di halaman publik!`)
      fetchDashboardData()
    } catch (err: any) {
      toast.error(err.message || "Gagal mengubah status paket.")
    }
  }

  const handleDeactivatePackage = async (targetPkg: any) => {
    if (!session?.user?.accessToken) return

    try {
      const res = await fetchWithRetry(`${API_BASE}/games/packages/${targetPkg.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify({
          game_name: targetPkg.game_name,
          price_per_slot: Number(targetPkg.price_per_slot),
          status: "INACTIVE"
        })
      })
      const data = await res.json()
      if (!data.success) {
        throw new Error(data.message || "Gagal menonaktifkan paket.")
      }

      toast.success(`Layanan game "${targetPkg.game_name}" berhasil dinonaktifkan!`)
      fetchDashboardData()
    } catch (err: any) {
      toast.error(err.message || "Gagal mengubah status paket.")
    }
  }

  // 4b. Edit Package handler
  const handleEditPackage = async (e: React.FormEvent) => {
    e.preventDefault()
    const price = Number(editPkgPrice)
    if (!editPkgName || isNaN(price) || price <= 0 || !editingPackage) {
      toast.error("Form edit paket jasa tidak valid!")
      return
    }

    if (!session?.user?.accessToken) return

    try {
      const res = await fetchWithRetry(`${API_BASE}/games/packages/${editingPackage.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify({
          game_name: editPkgName,
          price_per_slot: price,
          status: editingPackage.status
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Paket jasa "${editPkgName}" berhasil diperbarui!`)
        setIsEditPackageOpen(false)
        setEditingPackage(null)
        fetchDashboardData()
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui paket jasa.")
    }
  }

  // 4c. Open Edit Package dialog
  const openEditPackage = (pkg: any) => {
    setEditingPackage(pkg)
    setEditPkgName(pkg.game_name)
    setEditPkgPrice(String(Number(pkg.price_per_slot)))
    setEditPkgGame(pkg.game_name)
    setIsEditPackageOpen(true)
  }

  // 5a. Edit Project handler
  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault()
    const minSupport = Number(editProjMinSupport)
    if (!editProjTitle || !editProjUrl || isNaN(minSupport) || minSupport < 0 || !editingProject) {
      toast.error("Form edit proyek digital tidak valid!")
      return
    }

    if (!session?.user?.accessToken) return

    try {
      const res = await fetchWithRetry(`${API_BASE}/projects/${editingProject.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify({
          title: editProjTitle,
          description: editProjDesc,
          file_url: editProjUrl,
          min_support: minSupport
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Proyek digital "${editProjTitle}" berhasil diperbarui!`)
        setIsEditProjectOpen(false)
        setEditingProject(null)
        fetchDashboardData()
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui proyek digital.")
    }
  }

  // 5b. Open Edit Project dialog
  const openEditProject = (proj: any) => {
    setEditingProject(proj)
    setEditProjTitle(proj.title)
    setEditProjDesc(proj.description || "")
    setEditProjUrl(proj.file_url)
    setEditProjMinSupport(String(Number(proj.min_support)))
    setIsEditProjectOpen(true)
  }

  // 5. Digital Rewards Projects CRUD
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault()
    const minSupport = Number(newProjMinSupport)
    if (!newProjTitle || !newProjUrl || isNaN(minSupport) || minSupport < 0) {
      toast.error("Form proyek digital tidak valid!")
      return
    }

    if (!session?.user?.accessToken) return

    try {
      const res = await fetchWithRetry(`${API_BASE}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify({
          title: newProjTitle,
          description: newProjDesc,
          file_url: newProjUrl,
          min_support: minSupport
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Proyek digital "${newProjTitle}" berhasil dibagikan!`)
        setIsAddProjectOpen(false)
        setNewProjTitle("")
        setNewProjDesc("")
        setNewProjUrl("")
        setNewProjMinSupport("")
        fetchDashboardData()
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan proyek digital.")
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (!session?.user?.accessToken) return
    try {
      const res = await fetchWithRetry(`${API_BASE}/projects/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${session.user.accessToken}`
        }
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Proyek digital berhasil dihapus!")
        fetchDashboardData()
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus proyek digital.")
    }
  }

  // 6. Live Stream Queue Control Action
  const handleQueueAction = async (id: string, nextStatus: string) => {
    if (!session?.user?.accessToken) return
    try {
      const res = await fetchWithRetry(`${API_BASE}/queues/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify({ status: nextStatus })
      })
      const data = await res.json()
      if (data.success) {
        const qItem = queues.find(q => q.id === id)
        if (qItem) {
          if (nextStatus === "PLAYING") {
            toast.success(`Sesi bermain bersama ${qItem.ingame_nickname} dimulai! Widget menyuarakan pemanggilan.`)
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(`Antrean berikutnya, silakan bergabung ${qItem.ingame_nickname}`)
              utterance.lang = "id-ID"
              window.speechSynthesis.speak(utterance)
            }
          } else if (nextStatus === "DONE") {
            toast.success(data.message || `Sesi mabar bersama ${qItem.ingame_nickname} telah sukses diselesaikan!`)
          } else if (nextStatus === "SKIPPED") {
            toast.error("Pengguna dilewati di antrean.")
          }
        }
        fetchDashboardData()
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal mengupdate antrean.")
    }
  }

  const handleCallPlayer = async (id: string) => {
    if (!session?.user?.accessToken || callingCooldowns[id]) return
    try {
      setCallingCooldowns(prev => ({ ...prev, [id]: true }))
      const res = await fetchWithRetry(`${API_BASE}/queues/${id}/call`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`
        }
      })
      const data = await res.json()
      if (data.success) {
        const qItem = queues.find(q => q.id === id)
        toast.success(data.message || `Panggilan untuk ${qItem?.ingame_nickname || 'supporter'} berhasil dikirim ke live overlay!`)
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal mengirim panggilan.")
      setCallingCooldowns(prev => ({ ...prev, [id]: false }))
      return
    }

    // Cooldown 10 detik agar tidak spam pemanggilan beruntun
    setTimeout(() => {
      setCallingCooldowns(prev => ({ ...prev, [id]: false }))
    }, 10000)
  }

  // 6.b. Bulk Live Stream Queue Control Action
  const handleBulkQueueAction = async (ids: string[], nextStatus: string) => {
    if (!session?.user?.accessToken || ids.length === 0) return
    try {
      const res = await fetchWithRetry(`${API_BASE}/queues/bulk-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify({ ids, status: nextStatus })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message || `${ids.length} antrean berhasil diupdate!`)
        setSelectedActiveIds([])
        setSelectedPendingIds([])
        fetchDashboardData()
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal mengupdate antrean massal.")
    }
  }

  // 7. Profile Personalization Saving handlers
  const handleSelectAvatar = async (avatarUrl: string) => {
    if (!session?.user?.accessToken) return
    try {
      const res = await fetchWithRetry(`${API_BASE}/users/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify({ avatarUrl })
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Foto profil avatar berhasil diperbarui!")
        setAvatarBust(Date.now())
        fetchDashboardData()
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal mengganti avatar.")
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 2MB size limit
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal adalah 2MB!")
      return
    }

    if (!session?.user?.accessToken) {
      toast.error("Sesi tidak valid, silakan login kembali.")
      return
    }

    setIsUploadingAvatar(true)
    const formData = new FormData()
    formData.append("avatar", file)

    try {
      const res = await fetchWithRetry(`${API_BASE}/users/upload-avatar`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.user.accessToken}`
        },
        body: formData
      })

      const json = await res.json()
      if (json.success) {
        toast.success("Foto profil kustom berhasil diunggah!")
        setAvatarBust(Date.now())
        fetchDashboardData()
      } else {
        throw new Error(json.message)
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunggah foto profil.")
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 2MB size limit
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file banner maksimal adalah 2MB!")
      return
    }

    if (!session?.user?.accessToken) {
      toast.error("Sesi tidak valid, silakan login kembali.")
      return
    }

    setIsUploadingBanner(true)
    const formData = new FormData()
    formData.append("banner", file)

    try {
      const res = await fetchWithRetry(`${API_BASE}/users/upload-banner`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.user.accessToken}`
        },
        body: formData
      })

      const json = await res.json()
      if (json.success) {
        toast.success("Foto banner kustom berhasil diunggah!")
        fetchDashboardData()
      } else {
        throw new Error(json.message)
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunggah banner profil.")
    } finally {
      setIsUploadingBanner(false)
    }
  }

  const handleDeleteBanner = async () => {
    if (!session?.user?.accessToken) return
    try {
      const res = await fetchWithRetry(`${API_BASE}/users/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify({ bannerUrl: null })
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Banner berhasil dihapus! Sekarang halaman profil menggunakan warna profesi default.")
        fetchDashboardData()
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus banner.")
    }
  }

  const handleSaveBankAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.accessToken) return
    try {
      const res = await fetchWithRetry(`${API_BASE}/finance/bank-account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify({
          bank_name: bankName,
          account_number: bankNumber,
          account_holder_name: bankHolder
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Informasi rekening & e-wallet payout berhasil disimpan!")
        fetchDashboardData()
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan data rekening bank.")
    }
  }


  const [newTicketCategory, setNewTicketCategory] = useState("BANK_CHANGE")

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTicketTitle || !newTicketMessage) {
      toast.error("Judul dan pesan tiket harus diisi!")
      return
    }
    if (!session?.user?.accessToken) return
    try {
      const res = await fetchWithRetry(`${API_BASE}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify({
          category: newTicketCategory,
          subject: newTicketTitle,
          description: newTicketMessage
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Tiket bantuan berhasil dibuat! Tim kami akan segera menanggapi.")
        setNewTicketTitle("")
        setNewTicketMessage("")
        setIsCreateTicketOpen(false)
        fetchDashboardData() // Reload ticket list
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat tiket bantuan.")
    }
  }

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSchedTitle || !newSchedCategory || !newSchedDate) {
      toast.error("Form jadwal live tidak valid!")
      return
    }

    if (!session?.user?.accessToken) return

    try {
      const res = await fetchWithRetry(`${API_BASE}/schedules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify({
          title: newSchedTitle,
          category: newSchedCategory,
          date: newSchedDate,
          description: newSchedDesc
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Jadwal live "${newSchedTitle}" berhasil ditambahkan!`)
        setIsAddSchedOpen(false)
        setNewSchedTitle("")
        setNewSchedCategory("")
        setNewSchedDate("")
        setNewSchedDesc("")
        fetchDashboardData()
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan jadwal live.")
    }
  }

  const handleDeleteSchedule = async (id: string) => {
    if (!session?.user?.accessToken) return
    try {
      const res = await fetchWithRetry(`${API_BASE}/schedules/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${session.user.accessToken}`
        }
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Jadwal live berhasil dihapus!")
        fetchDashboardData()
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus jadwal live.")
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.accessToken) return
    try {
      const res = await fetchWithRetry(`${API_BASE}/users/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify({
          bio: editBio,
          instagram_url: editInstagram,
          youtube_url: editYoutube,
          discord_url: editDiscord,
          facebook_url: editFacebook,
          twitch_url: editTwitch,
          tiktok_url: editTiktok,
          website_url: editWebsite,
          target_title: editTargetTitle,
          target_amount: Number(editTargetAmount) || 0,
          show_target: showTarget,
          show_queue: showQueue,
          show_reviews: showReviews,
          show_calendar: showCalendar,
          show_services: showServices,
          service_btn_title: editServiceBtnTitle,
          service_btn_subtitle: editServiceBtnSubtitle,
          support_btn_title: editSupportBtnTitle,
          support_btn_subtitle: editSupportBtnSubtitle,
          schedule_title: editScheduleTitleSetting,
          mabar_promo_buy: Number(mabarPromoBuy) || 0,
          mabar_promo_get: Number(mabarPromoGet) || 0
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Profil & tautan sosial media berhasil disimpan!")
        fetchDashboardData()
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan data profil.")
    }
  }

  const handleApplyVerification = async () => {
    if (!session?.user?.accessToken) return
    
    // Validate platform selection
    if (!verifyPlatform) {
      toast.error("Pilih platform media sosial yang ingin diverifikasi!")
      return
    }
    
    // Validate screenshot upload
    if (!verifyScreenshot) {
      toast.error("Upload screenshot bukti kepemilikan akun wajib!")
      return
    }
    
    setIsUploadingVerification(true)
    
    try {
      const formData = new FormData()
      formData.append("screenshot", verifyScreenshot)
      formData.append("platform", verifyPlatform)
      formData.append("message", verifyMessage)
      
      const res = await fetch(`${API_BASE}/users/verification/apply`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.user.accessToken}`
        },
        body: formData
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Pengajuan verifikasi berhasil dikirim! Tim admin akan meninjau bukti kepemilikan akun Anda.")
        setVerifyScreenshot(null)
        setVerifyScreenshotPreview(null)
        setVerifyPlatform("")
        setVerifyMessage("")
        
        // Refresh profil
        if (session.user.name) {
          const profileRes = await fetch(`${API_BASE}/users/profile/${session.user.name}`)
          const profileJson = await profileRes.json()
          if (profileJson.success && profileJson.data) {
            setProfile(profileJson.data)
          }
        }
      } else {
        toast.error(json.message || "Gagal mengajukan verifikasi.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Terjadi kesalahan jaringan.")
    } finally {
      setIsUploadingVerification(false)
    }
  }

  // Countdown Timer Tick for Verification
  useEffect(() => {
    if (verificationCountdown <= 0) return
    const timer = setInterval(async () => {
      setVerificationCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          // Timer finished, refresh profile to sync verified status from backend!
          if (session?.user?.name) {
            fetch(`${API_BASE}/users/profile/${session.user.name}`)
              .then(res => res.json())
              .then(json => {
                if (json.success && json.data) {
                  setProfile(json.data)
                  setIsScanning(false)
                  if (json.data.is_verified) {
                    toast.success("Selamat! Lencana Verified Anda kini telah aktif! 🎉")
                    if (typeof window !== "undefined" && window.speechSynthesis) {
                      const utterance = new SpeechSynthesisUtterance("Selamat! Akun Anda kini telah resmi terverifikasi di Treetmi!")
                      utterance.lang = "id-ID"
                      window.speechSynthesis.speak(utterance)
                    }
                  }
                }
              })
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [verificationCountdown, session])

  const handleDownloadQRCode = async () => {
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&color=0b0b0a&bgcolor=ffd551&data=${encodeURIComponent(`${originUrl}/${profile?.username}`)}`
      const response = await fetchWithRetry(qrUrl)
      const blob = await response.blob()
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `treetmi-qrcode-${profile?.username}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success("QR Code premium berhasil diunduh!")
    } catch (err) {
      console.error(err)
      toast.error("Gagal mengunduh QR Code.")
    }
  }

  // Verification Form Component (reusable for new & re-apply)
  const VerificationForm = () => {
    // Get available social links for dropdown
    const socialOptions: {value: string, label: string, url: string}[] = []
    if (editYoutube) socialOptions.push({ value: "YOUTUBE", label: "YouTube", url: editYoutube })
    if (editTiktok) socialOptions.push({ value: "TIKTOK", label: "TikTok", url: editTiktok })
    if (editInstagram) socialOptions.push({ value: "INSTAGRAM", label: "Instagram", url: editInstagram })
    if (editTwitch) socialOptions.push({ value: "TWITCH", label: "Twitch", url: editTwitch })
    if (editFacebook) socialOptions.push({ value: "FACEBOOK", label: "Facebook", url: editFacebook })
    if (editDiscord) socialOptions.push({ value: "DISCORD", label: "Discord", url: editDiscord })

    return (
      <div className="space-y-5">
        <div className="bg-blue-500/5 dark:bg-blue-950/10 border border-blue-500/25 p-5 rounded-2xl space-y-3">
          <h4 className="font-extrabold text-xs text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">📋 Cara Verifikasi:</h4>
          <ol className="list-decimal pl-5 text-xs text-slate-500 dark:text-zinc-400 font-semibold space-y-1.5 leading-relaxed">
            <li>Pilih platform media sosial yang ingin diverifikasi</li>
            <li>Upload <strong>screenshot bukti kepemilikan</strong> akun (misal: screenshot YouTube Studio, TikTok settings, dll)</li>
            <li>Klik "Kirim Pengajuan" dan tunggu review admin (1x24 jam kerja)</li>
          </ol>
        </div>

        {/* Platform Select */}
        <div className="space-y-2">
          <Label className="font-black italic text-xs text-slate-500 dark:text-zinc-400">Pilih Platform yang Akan Diverifikasi</Label>
          <select
            value={verifyPlatform}
            onChange={(e) => setVerifyPlatform(e.target.value)}
            className="w-full h-11 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 font-bold bg-white dark:bg-zinc-900 text-black dark:text-white text-sm outline-none"
          >
            <option value="">-- Pilih Platform --</option>
            {socialOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}: {opt.url.length > 40 ? opt.url.substring(0, 40) + "..." : opt.url}</option>
            ))}
          </select>
        </div>

        {/* Screenshot Upload */}
        <div className="space-y-2">
          <Label className="font-black italic text-xs text-slate-500 dark:text-zinc-400">Upload Screenshot Bukti Kepemilikan Akun</Label>
          <div className="relative group">
            <div className="w-full min-h-[120px] rounded-2xl border-2 border-dashed border-slate-300 dark:border-zinc-700 flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-900/60 cursor-pointer hover:border-[#FFD551] hover:bg-[#FFD551]/5 transition-all overflow-hidden">
              <input 
                type="file" 
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error("Ukuran file maksimal 5MB!")
                      return
                    }
                    setVerifyScreenshot(file)
                    setVerifyScreenshotPreview(URL.createObjectURL(file))
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              {verifyScreenshotPreview ? (
                <div className="relative w-full p-3">
                  <img src={verifyScreenshotPreview} alt="Preview" className="w-full max-h-48 object-contain rounded-xl" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setVerifyScreenshot(null)
                      setVerifyScreenshotPreview(null)
                    }}
                    className="absolute top-5 right-5 h-7 w-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-all"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-4 text-slate-400 group-hover:text-[#FFD551] transition-all">
                  <UploadCloud className="h-8 w-8" />
                  <span className="text-xs font-black uppercase italic">Pilih Screenshot</span>
                  <span className="text-[10px] font-semibold">PNG, JPG, WEBP • Maks 5MB</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Optional Message */}
        <div className="space-y-2">
          <Label className="font-black italic text-xs text-slate-500 dark:text-zinc-400">Pesan / Catatan untuk Admin (Opsional)</Label>
          <textarea
            rows={3}
            value={verifyMessage}
            onChange={(e) => setVerifyMessage(e.target.value)}
            maxLength={500}
            placeholder="Contoh: Ini adalah screenshot dari halaman YouTube Studio saya..."
            className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-[#1E1E1D] text-black dark:text-white text-xs p-3 focus:outline-none focus:ring-1 focus:ring-[#FFD551] leading-relaxed resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleApplyVerification}
            disabled={isUploadingVerification}
            className="h-11 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black hover:bg-slate-900 dark:hover:bg-[#FFC83B] rounded-2xl font-black italic text-xs md:text-sm px-8 border border-zinc-900 shadow-md transition-all active:scale-95"
          >
            {isUploadingVerification ? (
              <span className="flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" /> Mengunggah...</span>
            ) : (
              "📤 Kirim Pengajuan Verifikasi"
            )}
          </Button>
        </div>
      </div>
    )
  }

  // Loader Skeleton (Hydration safe)
  if ((status === "loading" || (status === "authenticated" && loading)) && !profile) {
    return (
      <main className="min-h-screen bg-[#F8F7F3] dark:bg-[#0B0B0A] flex flex-col items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-10 w-10 text-[#FFD551] animate-spin" />
          <p className="text-xs font-black italic tracking-wider text-slate-400 dark:text-zinc-500 animate-pulse">
            Sinkronisasi Data Dasbor Kreator...
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F8F7F3] dark:bg-[#0B0B0A] transition-colors duration-200">
      
      {/* INTEGRATED CREATOR SaaS HEADER */}
      <header className="h-14 md:h-16 bg-white dark:bg-[#121211] border-b border-slate-200/80 dark:border-zinc-800/80 px-3 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-50 shadow-sm">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs font-black italic text-slate-500 min-w-0">
          <span className="text-[#FFD551] bg-black px-2 py-0.5 rounded-xl border border-slate-200/40 dark:bg-[#FFD551] dark:text-black text-[10px] md:text-xs shrink-0">{lang === "en" ? "Hub" : "Hub"}</span>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="text-black dark:text-white capitalize truncate">Dashboard</span>
        </div>

        {/* Right: Platform Actions */}
        <div className="flex items-center gap-1.5 md:gap-4 flex-shrink-0">
          
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center h-8 w-8 md:h-9 md:w-9 rounded-xl border border-slate-200 dark:border-zinc-800 bg-[#FAF9F6] dark:bg-zinc-900 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors outline-none cursor-pointer">
              <Languages className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl border border-slate-200 bg-white dark:bg-[#121211] dark:border-zinc-800 p-1.5">
              <DropdownMenuItem onClick={() => setLang("id")} className="font-bold italic cursor-pointer rounded-lg">
                ID {lang === "id" && "✓"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang("en")} className="font-bold italic cursor-pointer rounded-lg">
                EN {lang === "en" && "✓"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Currency Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center gap-1 h-8 md:h-9 px-1.5 md:px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-[#FAF9F6] dark:bg-zinc-900 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors outline-none cursor-pointer text-[10px] md:text-xs font-black italic">
              <Coins className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#FFD551]" />
              <span className="uppercase">{currency}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl border border-slate-200 bg-white dark:bg-[#121211] dark:border-zinc-800 p-1.5">
              {(Object.keys(CURRENCY_MAP) as CurrencyCode[]).map((code) => {
                const cfg = CURRENCY_MAP[code]
                return (
                  <DropdownMenuItem 
                    key={code} 
                    onClick={() => setCurrency(code)} 
                    className="font-bold italic cursor-pointer rounded-lg flex items-center gap-2"
                  >
                    <span className="text-sm">{cfg.flag}</span>
                    <span>{cfg.code} ({cfg.symbol})</span>
                    {currency === code && <span className="ml-auto text-[#FFD551] font-bold">✓</span>}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center h-8 w-8 md:h-9 md:w-9 rounded-xl border border-slate-200 dark:border-zinc-800 bg-[#FAF9F6] dark:bg-zinc-900 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors outline-none relative cursor-pointer">
              <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl border border-slate-200 bg-white dark:bg-[#121211] dark:border-zinc-800 p-1.5">
              <DropdownMenuItem onClick={() => setTheme("light")} className="font-bold italic cursor-pointer rounded-lg">
                {lang === "en" ? "Light" : "Terang"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className="font-bold italic cursor-pointer rounded-lg">
                {lang === "en" ? "Dark" : "Gelap"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Creator profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center h-8 w-8 md:h-9 md:w-9 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-[#FFD551] text-black hover:bg-[#FFC83B] transition-colors outline-none cursor-pointer shadow-sm overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : session?.user?.image ? (
                <img src={session.user.image} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-black italic text-sm uppercase">{(profile?.username || session?.user?.name || "U")[0]}</span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl border border-slate-200 bg-white dark:bg-[#121211] dark:border-zinc-800 p-1.5">
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })} className="font-bold italic text-red-500 cursor-pointer rounded-lg">
                <LogOut className="h-4 w-4 mr-2" />
                {lang === "en" ? "Sign Out" : "Keluar Hub"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </header>

      {/* DASHBOARD WRAPPER */}
      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 max-w-7xl">
        
        {/* HEADER PROFILE PANEL */}
        <div className="bg-white border border-slate-200/80 rounded-2xl md:rounded-2xl p-5 md:p-6 mb-6 md:mb-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 dark:bg-[#121211] dark:border-zinc-800/80 relative overflow-hidden">
          {/* Decorative Pattern Overlay - visible in both light & dark */}
          <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.04] pointer-events-none text-slate-400 dark:text-[#FFD551]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          {/* Decorative SVG Silhouettes */}
          <svg className="absolute -right-8 -top-4 w-48 h-48 opacity-[0.07] dark:opacity-[0.06] pointer-events-none text-slate-400 dark:text-[#FFD551]" viewBox="0 0 200 200" fill="currentColor">
            <circle cx="100" cy="70" r="30" />
            <path d="M40 180c0-33 27-60 60-60s60 27 60 60" />
            <rect x="150" y="40" width="30" height="20" rx="4" />
            <circle cx="165" cy="50" r="5" fill="none" stroke="currentColor" strokeWidth="3" />
          </svg>
          <svg className="absolute right-24 -bottom-6 w-32 h-32 opacity-[0.06] dark:opacity-[0.05] pointer-events-none text-slate-400 dark:text-[#FFD551]" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 10L75 90H25L50 10Z" opacity="0.5" />
            <circle cx="20" cy="80" r="8" />
            <circle cx="80" cy="80" r="8" />
          </svg>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 md:w-18 md:h-18 rounded-[0.75rem] md:rounded-[1.5rem] bg-[#FFD551] border border-slate-200 dark:border-zinc-800 flex items-center justify-center font-black italic text-base md:text-2xl text-black shadow-sm uppercase overflow-hidden">
                {profile?.avatar_url ? (
                  <img 
                    src={
                      profile.avatar_url.includes("googleusercontent.com") || profile.avatar_url.includes("discordapp.com")
                        ? profile.avatar_url
                        : `${profile.avatar_url}${profile.avatar_url.includes("?") ? "&" : "?"}t=${avatarBust}`
                    } 
                    alt={profile.username} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  (profile?.username || session?.user?.name || "c")[0]
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 md:w-5 md:h-5 rounded-full bg-green-500 border-2 border-white dark:border-[#121211]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                <h1 className="text-sm md:text-2xl font-black italic tracking-tighter shrink-0">@{profile?.username || session?.user?.name || "creator"}</h1>
                {profile?.is_verified && <VerifiedBadge className="h-4 w-4 md:h-6 md:w-6 shrink-0" />}
              </div>

              <div className="flex flex-col items-start gap-1 md:gap-1.5 mt-1 md:mt-1.5">
                <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                  {/* Real-time Dynamic Subtext Badge */}
                  <p className="text-[9px] md:text-xs font-black tracking-wider text-slate-500 bg-slate-50 border border-slate-100 px-1.5 md:px-2.5 py-0.5 rounded-lg md:rounded-xl inline-block dark:bg-zinc-900/55 dark:border-zinc-800/80 dark:text-zinc-500 truncate max-w-full">
                    {role === "GAMER" 
                      ? "🎮 Verified Streamer & Creator" 
                      : role === "DEVELOPER" 
                        ? "💻 Software Engineer & Tech Creator" 
                        : role === "DESIGNER"
                          ? "🎨 UI/UX Designer & Creative Artist"
                          : role === "VLOGGER"
                            ? "📹 Vlogger & Content Creator"
                            : role === "MUSICIAN"
                              ? "🎵 Musician & Sound Artist"
                              : role === "PODCASTER"
                                ? "🎙️ Podcaster & Audio Host"
                                : role === "WRITER"
                                  ? "✍️ Writer & Storyteller"
                                  : role === "ANIMATOR"
                                    ? "🎬 Animator & Motion Designer"
                                    : role === "TRADER"
                                      ? "📈 Financial Trader & Analyst"
                                      : role === "MENTOR"
                                        ? "🧠 Mentor & Educator"
                                        : `✨ ${role}`}
                  </p>
                  <TrustBadge count={profile?.unique_supporters || 0} dbBadge={profile?.trust_badge} />
                </div>

                {/* Integrated Profession Selector Select Dropdown */}
                <div className="mt-0.5 md:mt-1 flex flex-wrap items-center gap-1.5 md:gap-2">
                  <select
                    value={["GAMER", "DEVELOPER", "DESIGNER", "VLOGGER", "MUSICIAN", "PODCASTER", "WRITER", "ANIMATOR", "TRADER", "MENTOR"].includes(role) ? role : "CUSTOM"}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "CUSTOM") {
                        setIsCustomRoleActive(true);
                      } else {
                        setIsCustomRoleActive(false);
                        handleUpdateRole(val);
                      }
                    }}
className="h-7 md:h-8 text-[10px] md:text-xs font-bold italic border border-slate-200 dark:border-zinc-800 rounded-lg md:rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white px-2 md:px-3 py-1 outline-none cursor-pointer hover:bg-slate-50 transition-all shadow-sm"
                  >
                    <option value="GAMER">🎮 Gamer</option>
                    <option value="DEVELOPER">💻 Software Dev</option>
                    <option value="DESIGNER">🎨 UI/UX Designer</option>
                    <option value="VLOGGER">📹 Vlogger</option>
                    <option value="MUSICIAN">🎵 Musician</option>
                    <option value="PODCASTER">🎙️ Podcaster</option>
                    <option value="WRITER">✍️ Writer</option>
                    <option value="ANIMATOR">🎬 Animator</option>
                    <option value="TRADER">📈 Trader</option>
                    <option value="MENTOR">🧠 Mentor</option>
                    <option value="CUSTOM">✨ Tambah Lainnya...</option>
                  </select>

                  {/* Inline text input for custom profession */}
                  {(isCustomRoleActive || !["GAMER", "DEVELOPER", "DESIGNER", "VLOGGER", "MUSICIAN", "PODCASTER", "WRITER", "ANIMATOR", "TRADER", "MENTOR"].includes(role)) && (
                    <div className="flex items-center gap-1.5 animate-fadeIn">
                      <Input
                        type="text"
                        placeholder="Ketik profesi..."
                        value={customRoleInput}
                        onChange={(e) => setCustomRoleInput(e.target.value)}
                        className="h-7 md:h-8 border border-slate-200 dark:border-zinc-800 rounded-lg md:rounded-xl bg-white text-[10px] md:text-xs px-2 md:px-3 w-28 md:w-36 dark:bg-zinc-900 dark:text-white"
                      />
                      <Button
                        size="xs"
                        className="h-7 md:h-8 bg-[#FFD551] text-black hover:bg-[#FFC83B] border border-slate-200 dark:border-zinc-800 rounded-lg md:rounded-xl font-black italic text-[10px] md:text-xs px-2.5 md:px-3.5 active:scale-95 transition-all shrink-0"
                        onClick={() => {
                          if (!customRoleInput.trim()) {
                            toast.error("Nama profesi kustom tidak boleh kosong!");
                            return;
                          }
                          handleUpdateRole(customRoleInput.trim());
                          setIsCustomRoleActive(false);
                          setCustomRoleInput("");
                        }}
                      >
                        Simpan
                      </Button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 md:gap-4 w-full md:w-auto">
            <div className="flex items-center gap-1 md:gap-2 border border-slate-200 bg-[#FAF9F6] px-2 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl dark:bg-zinc-900/50 dark:border-zinc-800/80">
              <Tv className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-500 flex-shrink-0" />
              <span className="text-[10px] md:text-sm font-black italic text-slate-500 hidden sm:inline">{lang === "en" ? "Status:" : "Status:"}</span>
              <Badge className={isLive ? "bg-red-500 text-white font-black text-[9px] md:text-xs px-1.5 md:px-2.5 py-0.5 rounded-md md:rounded-lg" : "bg-muted text-muted-foreground text-[9px] md:text-xs px-1.5 md:px-2.5 py-0.5 rounded-md md:rounded-lg"}>
                {isLive ? "Live" : "Offline"}
              </Badge>
              <Switch checked={isLive} onCheckedChange={handleToggleLive} className="scale-75 md:scale-100 ml-0 md:ml-1" />
            </div>

            <Button
              onClick={() => {
                setActiveTab("profile")
                setProfileSubTab("edit")
              }}
              className="h-8 md:h-10 bg-[#FFD551] text-black hover:bg-[#FFC83B] rounded-xl md:rounded-2xl font-black italic text-[10px] md:text-sm px-2.5 md:px-4 border border-slate-200 dark:border-zinc-800 shadow-sm transition-all gap-1 md:gap-1.5 shrink-0"
            >
              <Settings className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden xs:inline">{lang === "en" ? "Edit Profile" : "Edit Profil"}</span><span className="xs:hidden">Edit Profile</span>
            </Button>
            <Button
              onClick={() => setActiveTab("studio")}
              className="h-8 md:h-10 bg-black text-[#FFD551] hover:bg-slate-900 rounded-xl md:rounded-2xl font-black italic text-[10px] md:text-[11px] px-2.5 md:px-4 border border-slate-200 dark:border-[#FFD551]/30 shadow-sm transition-all gap-1 md:gap-1.5 shrink-0"
            >
              🎨 <span className="hidden sm:inline">Widget Studio</span><span className="sm:hidden">Widget Studio</span>
            </Button>
          </div>
        </div>

        {/* CORE INTERACTIVE DASHBOARD TABS (5 COLS GRID) */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="!flex w-full items-center justify-start overflow-x-auto no-scrollbar !h-11 md:!h-12 bg-[#FAF9F6] dark:bg-[#121211] border border-slate-200/80 dark:border-zinc-800/80 !p-1 !rounded-full shadow-sm gap-1">
            <TabsTrigger value="profile" className="!h-full font-black italic text-[11px] md:text-xs tracking-wider !rounded-full shrink-0 !px-3 md:!px-5 data-active:!bg-[#FFD551] data-active:!text-black data-[state=active]:!bg-[#FFD551] data-[state=active]:!text-black data-active:shadow-sm data-[state=active]:shadow-sm transition-all cursor-pointer whitespace-nowrap">
              ⚙️ <span className="hidden sm:inline">{t.dashboard?.settings || "Pengaturan"}</span><span className="sm:hidden">Setting</span>
            </TabsTrigger>
            <TabsTrigger value="overview" className="!h-full font-black italic text-[11px] md:text-xs tracking-wider !rounded-full shrink-0 !px-3 md:!px-5 data-active:!bg-[#FFD551] data-active:!text-black data-[state=active]:!bg-[#FFD551] data-[state=active]:!text-black data-active:shadow-sm data-[state=active]:shadow-sm transition-all cursor-pointer whitespace-nowrap">
              💰 <span className="hidden sm:inline">{t.dashboard?.walletHistory || "Dompet & Riwayat"}</span><span className="sm:hidden">Dompet</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="!h-full font-black italic text-[11px] md:text-xs tracking-wider !rounded-full shrink-0 !px-3 md:!px-5 data-active:!bg-[#FFD551] data-active:!text-black data-[state=active]:!bg-[#FFD551] data-[state=active]:!text-black data-active:shadow-sm data-[state=active]:shadow-sm transition-all cursor-pointer whitespace-nowrap">
              🎮 <span className="hidden sm:inline">{t.dashboard?.mabarServices || "Jasa Mabar"}</span><span className="sm:hidden">Mabar</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="!h-full font-black italic text-[11px] md:text-xs tracking-wider !rounded-full shrink-0 !px-3 md:!px-5 data-active:!bg-[#FFD551] data-active:!text-black data-[state=active]:!bg-[#FFD551] data-[state=active]:!text-black data-active:shadow-sm data-[state=active]:shadow-sm transition-all cursor-pointer whitespace-nowrap">
              🎨 <span className="hidden sm:inline">{t.dashboard?.digitalProjects || "Proyek Digital"}</span><span className="sm:hidden">Proyek</span>
            </TabsTrigger>
            <TabsTrigger value="queue" className="!h-full font-black italic text-[11px] md:text-xs tracking-wider !rounded-full shrink-0 !px-3 md:!px-5 data-active:!bg-[#FFD551] data-active:!text-black data-[state=active]:!bg-[#FFD551] data-[state=active]:!text-black data-active:shadow-sm data-[state=active]:shadow-sm transition-all cursor-pointer whitespace-nowrap">
              ⚡ <span className="hidden sm:inline">{t.dashboard?.liveQueue || "Antrean Live"}</span><span className="sm:hidden">Queue</span>
            </TabsTrigger>
            <TabsTrigger value="widget" className="!h-full font-black italic text-[11px] md:text-xs tracking-wider !rounded-full shrink-0 !px-3 md:!px-5 data-active:!bg-[#FFD551] data-active:!text-black data-[state=active]:!bg-[#FFD551] data-[state=active]:!text-black data-active:shadow-sm data-[state=active]:shadow-sm transition-all cursor-pointer whitespace-nowrap">
              🔌 <span className="hidden sm:inline">{t.dashboard?.obsIntegration || "Integrasi OBS"}</span><span className="sm:hidden">OBS</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: OVERVIEW & WALLET */}
          <TabsContent value="overview" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Balance Wallet */}
              <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden bg-white dark:bg-[#121211]">
                <CardHeader className="bg-[#FFD551] border-b border-slate-200/10 py-5 flex flex-row items-center justify-between text-black">
                  <CardTitle className="font-black italic text-sm tracking-widest flex items-center gap-2">
                    <Wallet className="h-4 w-4" /> Dompet Saldo
                  </CardTitle>
                  <ArrowUpRight className="h-5 w-5" />
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-3xl font-black italic tracking-tighter">
                    {format(convertFromIdr(balance))}
                  </p>
                  <p className="text-[9px] font-bold text-muted-foreground italic mt-1.5">Potongan komisi platform terendah: donasi {feeDonation}%, jasa mabar {feeMabar}%</p>
                  
                  <Button
                    onClick={() => setIsWithdrawOpen(true)}
                    className="w-full h-11 bg-black text-[#FFD551] hover:bg-slate-900 border border-black rounded-2xl font-black italic text-xs transition-all mt-6 shadow-sm active:scale-[0.98]"
                  >
                    Tarik Dana Sekarang
                  </Button>
                </CardContent>
              </Card>

              {/* Card 2: Total Revenue */}
              <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden bg-white dark:bg-[#121211]">
                <CardHeader className="bg-[#FAF9F6] border-b border-slate-200/50 py-5 flex flex-row items-center justify-between text-black dark:bg-[#1E1E1D]/55 dark:text-white dark:border-zinc-800">
                  <CardTitle className="font-black italic text-sm tracking-widest flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-[#FFD551]" /> Total Akumulasi
                  </CardTitle>
                  <ArrowUpRight className="h-5 w-5 text-slate-400" />
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-3xl font-black italic tracking-tighter">
                    {format(convertFromIdr(totalGross))}
                  </p>
                  <p className="text-[9px] font-bold text-muted-foreground italic mt-1.5">Pendapatan kotor sebelum potongan platform</p>
                  <div className="w-full bg-[#FAF9F6] border border-slate-200/50 rounded-2xl p-3.5 mt-6 flex justify-between items-center dark:bg-zinc-900/55 dark:border-zinc-800/80">
                    <span className="text-[9px] font-black italic text-slate-400">Pencapaian:</span>
                    <Badge className="bg-[#FFD551]/20 text-black border border-[#FFD551]/30 hover:bg-[#FFD551]/20 font-black italic text-[9px] px-2.5 py-0.5 rounded-lg dark:text-[#FFD551]">
                      Verified Creator
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Success Transactions */}
              <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden bg-white dark:bg-[#121211]">
                <CardHeader className="bg-[#FAF9F6] border-b border-slate-200/50 py-5 flex flex-row items-center justify-between text-black dark:bg-[#1E1E1D]/55 dark:text-white dark:border-zinc-800">
                  <CardTitle className="font-black italic text-sm tracking-widest flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#FFD551]" /> Transaksi Terverifikasi
                  </CardTitle>
                  <ArrowUpRight className="h-5 w-5 text-slate-400" />
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-3xl font-black italic tracking-tighter">
                    {transactions.length} Transaksi
                  </p>
                  <p className="text-[9px] font-bold text-muted-foreground italic mt-1.5">Semua donasi dan pesanan jasa terbayar sukses</p>
                  <div className="w-full bg-[#FAF9F6] border border-slate-200/50 rounded-2xl p-3.5 mt-6 flex justify-between items-center dark:bg-zinc-900/55 dark:border-zinc-800/80">
                    <span className="text-[9px] font-black italic text-slate-400">Status Reputasi:</span>
                    <span className="text-xs font-black italic text-amber-500">⭐⭐⭐⭐⭐ (5.0)</span>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* UNIFIED DATA TABLE WITH SUB-TABS */}
            <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
              <CardHeader className="py-5 px-6 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="font-black italic text-xs tracking-wider text-black dark:text-[#FFD551] flex items-center gap-2">
                      📊 Data Transaksi Keuangan
                    </CardTitle>
                    <CardDescription className="font-bold italic text-[9px] text-slate-400 mt-1">
                      Riwayat lengkap pemasukan dan pencairan dana Anda
                    </CardDescription>
                  </div>
                  <div className="flex items-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full p-0.5 shadow-sm">
                    <button
                      onClick={() => { setFinanceSubTab("income"); setFinancePage(1) }}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black italic tracking-wider transition-all ${
                        financeSubTab === "income"
                          ? "bg-[#FFD551] text-black shadow-sm"
                          : "text-slate-400 hover:text-black dark:hover:text-white"
                      }`}
                    >
                      📈 Pemasukan
                    </button>
                    <button
                      onClick={() => { setFinanceSubTab("payout"); setFinancePage(1) }}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black italic tracking-wider transition-all ${
                        financeSubTab === "payout"
                          ? "bg-[#FFD551] text-black shadow-sm"
                          : "text-slate-400 hover:text-black dark:hover:text-white"
                      }`}
                    >
                      🏦 Pencairan
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {financeSubTab === "income" ? (
                  /* === PEMASUKAN TABLE === */
                  <div>
                    {/* Category Filter */}
                    <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-100 dark:border-zinc-800/60">
                      <span className="text-[9px] font-black italic text-slate-400 uppercase tracking-wider">Filter:</span>
                      {(["SEMUA", "DONATION", "MABAR"] as const).map((cat) => {
                        const count = cat === "SEMUA" 
                          ? transactions.filter(t => t.type !== "WITHDRAWAL").length
                          : transactions.filter(t => t.type === cat).length
                        return (
                          <button
                            key={cat}
                            onClick={() => { setFinanceFilter(cat); setFinancePage(1) }}
                            className={`px-3 py-1 rounded-lg text-[9px] font-black italic tracking-wider transition-all ${
                              financeFilter === cat
                                ? cat === "DONATION" ? "bg-blue-500 text-white shadow-sm"
                                  : cat === "MABAR" ? "bg-amber-500 text-white shadow-sm"
                                  : "bg-black text-white shadow-sm"
                                : "bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-500 dark:hover:bg-zinc-700"
                            }`}
                          >
                            {cat === "SEMUA" ? "Semua" : cat === "DONATION" ? "❤️ Donasi" : "🎮 Mabar"} ({count})
                          </button>
                        )
                      })}
                    </div>

                    {(() => {
                      const filtered = financeFilter === "SEMUA" 
                        ? transactions.filter(t => t.type !== "WITHDRAWAL")
                        : transactions.filter(t => t.type === financeFilter)
                      const totalPages = Math.max(1, Math.ceil(filtered.length / 25))
                      const currentPage = Math.min(financePage, totalPages)
                      const paged = filtered.slice((currentPage - 1) * 25, currentPage * 25)
                      const totalAmount = filtered.reduce((s, t) => s + t.amount, 0)

                      return (
                        <>
                          <Table>
                            <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/20">
                              <TableRow className="border-b border-slate-100 dark:border-zinc-900">
                                <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm px-6">ID TX</TableHead>
                                <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm">Pengirim</TableHead>
                                <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm">Tipe</TableHead>
                                <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm">Jumlah</TableHead>
                                <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm">Tanggal</TableHead>
                                <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm">Pesan</TableHead>
                                <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm">Status</TableHead>
                                <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm text-center">Aksi</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {paged.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={8} className="text-center text-xs font-bold text-slate-400 italic py-12">
                                    Belum ada data pemasukan.
                                  </TableCell>
                                </TableRow>
                              ) : (
                                paged.map((tx, idx) => (
                                  <TableRow key={idx} className="border-b border-slate-100/60 dark:border-zinc-800/40 hover:bg-slate-50/30">
                                    <TableCell className="font-mono font-bold text-sm px-6">{tx.id}</TableCell>
                                    <TableCell className="font-bold italic text-sm">{tx.sender}</TableCell>
                                    <TableCell>
                                      <Badge className={
                                        tx.type === "DONATION" 
                                          ? "bg-blue-50 text-blue-600 border border-blue-200/40 font-black italic text-xs rounded-lg px-2.5" 
                                          : "bg-amber-50 text-amber-600 border border-amber-200/40 font-black italic text-xs rounded-lg px-2.5"
                                      }>
                                        {tx.type}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="font-black italic text-sm text-emerald-600">
                                      + {format(convertFromIdr(tx.amount))}
                                    </TableCell>
                                    <TableCell className="text-sm font-bold text-slate-400 italic">{tx.date}</TableCell>
                                    <TableCell className="text-sm max-w-[200px] truncate font-bold text-slate-500 dark:text-[#EAE9E4]/70">
                                      {tx.message}
                                    </TableCell>
                                    <TableCell>
                                      <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-200/45 font-black italic text-xs rounded-lg px-2.5">
                                        {tx.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <button
                                        onClick={async () => {
                                          if (!session?.user?.accessToken) return
                                          try {
                                            const res = await fetchWithRetry(`${API_BASE}/widget-settings/test-alert`, {
                                              method: "POST",
                                              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.user.accessToken}` },
                                              body: JSON.stringify({ type: tx.type, sender_name: tx.sender || "Anonim", gross_amount: tx.amount, message: tx.message || "", game_name: tx.game_name || "" })
                                            })
                                            const json = await res.json()
                                            if (json.success) toast.success("🔔 Alert dikirim ulang ke overlay!")
                                            else toast.error("Gagal mengirim ulang alert.")
                                          } catch { toast.error("Gagal terhubung ke server.") }
                                        }}
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-purple-50 text-purple-600 border border-purple-200/50 hover:bg-purple-100 transition-all active:scale-95 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-800"
                                      >
                                        <Play className="h-3 w-3" /> Replay
                                      </button>
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>

                          {/* Pagination Footer */}
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3 border-t border-slate-100 dark:border-zinc-800/60 bg-slate-50/30 dark:bg-zinc-900/20">
                            <div className="flex items-center gap-3 text-[10px] font-black italic text-slate-400">
                              <span>Total: {format(convertFromIdr(totalAmount))}</span>
                              <span className="text-slate-300 dark:text-zinc-600">|</span>
                              <span>{filtered.length} transaksi</span>
                              <span className="text-slate-300 dark:text-zinc-600">|</span>
                              <span>Hal. {currentPage}/{totalPages}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                disabled={currentPage <= 1}
                                onClick={() => setFinancePage(Math.max(1, currentPage - 1))}
                                className="h-7 px-3 rounded-lg text-[10px] font-black italic border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                              >
                                ← Prev
                              </button>
                              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum: number
                                if (totalPages <= 5) {
                                  pageNum = i + 1
                                } else if (currentPage <= 3) {
                                  pageNum = i + 1
                                } else if (currentPage >= totalPages - 2) {
                                  pageNum = totalPages - 4 + i
                                } else {
                                  pageNum = currentPage - 2 + i
                                }
                                return (
                                  <button
                                    key={pageNum}
                                    onClick={() => setFinancePage(pageNum)}
                                    className={`h-7 w-7 rounded-lg text-[10px] font-black transition-all ${
                                      pageNum === currentPage
                                        ? "bg-[#FFD551] text-black shadow-sm"
                                        : "border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-700"
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                )
                              })}
                              <button
                                disabled={currentPage >= totalPages}
                                onClick={() => setFinancePage(Math.min(totalPages, currentPage + 1))}
                                className="h-7 px-3 rounded-lg text-[10px] font-black italic border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                              >
                                Next →
                              </button>
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                ) : (
                  /* === PENCAIRAN / PAYOUT TABLE === */
                  <div>
                    {withdrawals.length === 0 ? (
                      <div className="p-12 text-center text-xs font-bold text-slate-400 dark:text-zinc-500 italic">
                        Belum ada riwayat penarikan dana yang diajukan.
                      </div>
                    ) : (
                      (() => {
                        const totalPages = Math.max(1, Math.ceil(withdrawals.length / 25))
                        const currentPage = Math.min(financePage, totalPages)
                        const paged = withdrawals.slice((currentPage - 1) * 25, currentPage * 25)
                        const totalWithdrawn = withdrawals.filter(w => w.status === "SUCCESS").reduce((s, w) => s + Number(w.amount_requested), 0)

                        return (
                          <>
                            <Table>
                              <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/20">
                                <TableRow className="border-b border-slate-100 dark:border-zinc-900">
                                  <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm px-6">ID WD</TableHead>
                                  <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm">Rekening Tujuan</TableHead>
                                  <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm">Nominal</TableHead>
                                  <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm">Biaya</TableHead>
                                  <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm">Diterima</TableHead>
                                  <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm">Tanggal</TableHead>
                                  <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm">Status</TableHead>
                                  <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm text-center px-6">Invoice</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {paged.map((wd, index) => {
                                  const amount = Number(wd.amount_requested)
                                  const fee = Number(wd.disbursement_fee || 5000)
                                  const net = amount - fee
                                  return (
                                    <TableRow key={index} className="border-b border-slate-100/60 dark:border-zinc-800/40 hover:bg-slate-50/30">
                                      <TableCell className="font-mono font-bold text-sm px-6">WD-{wd.id.substring(0, 8).toUpperCase()}</TableCell>
                                      <TableCell className="font-bold text-sm italic">{bankName} - {bankNumber.substring(0, 4)}*** ({bankHolder})</TableCell>
                                      <TableCell className="font-black italic text-sm text-black dark:text-white">Rp {amount.toLocaleString("id-ID")}</TableCell>
                                      <TableCell className="font-bold text-sm text-red-500">- Rp {fee.toLocaleString("id-ID")}</TableCell>
                                      <TableCell className="font-black italic text-sm text-emerald-600 dark:text-emerald-400">Rp {net.toLocaleString("id-ID")}</TableCell>
                                      <TableCell className="text-sm font-bold text-slate-400 italic">{new Date(wd.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</TableCell>
                                      <TableCell>
                                        <Badge className={wd.status === "PENDING" ? "bg-amber-50 text-amber-600 border border-amber-200/45 font-black italic text-xs rounded-lg px-2.5 py-0.5 animate-pulse" : wd.status === "SUCCESS" ? "bg-emerald-50 text-emerald-600 border border-emerald-200/45 font-black italic text-xs rounded-lg px-2.5 py-0.5" : "bg-red-50 text-red-600 border border-red-200/45 font-black italic text-xs rounded-lg px-2.5 py-0.5"}>
                                          {wd.status === "SUCCESS" ? "PAID" : wd.status}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-center px-6">
                                        <Button onClick={() => printPayoutInvoice(wd, profile)} className="h-7 bg-black text-[#FFD551] hover:bg-slate-900 border border-black rounded-lg font-black italic text-xs transition-all px-3">
                                          🖨️ Cetak
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>

                            {/* Pagination Footer */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3 border-t border-slate-100 dark:border-zinc-800/60 bg-slate-50/30 dark:bg-zinc-900/20">
                              <div className="flex items-center gap-3 text-[10px] font-black italic text-slate-400">
                                <span>Total Dicairkan: Rp {totalWithdrawn.toLocaleString("id-ID")}</span>
                                <span className="text-slate-300 dark:text-zinc-600">|</span>
                                <span>{withdrawals.length} pencairan</span>
                                <span className="text-slate-300 dark:text-zinc-600">|</span>
                                <span>Hal. {currentPage}/{totalPages}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button disabled={currentPage <= 1} onClick={() => setFinancePage(Math.max(1, currentPage - 1))} className="h-7 px-3 rounded-lg text-[10px] font-black italic border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all">← Prev</button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                  let pn: number
                                  if (totalPages <= 5) pn = i + 1
                                  else if (currentPage <= 3) pn = i + 1
                                  else if (currentPage >= totalPages - 2) pn = totalPages - 4 + i
                                  else pn = currentPage - 2 + i
                                  return (
                                    <button key={pn} onClick={() => setFinancePage(pn)} className={`h-7 w-7 rounded-lg text-[10px] font-black transition-all ${pn === currentPage ? "bg-[#FFD551] text-black shadow-sm" : "border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-700"}`}>{pn}</button>
                                  )
                                })}
                                <button disabled={currentPage >= totalPages} onClick={() => setFinancePage(Math.min(totalPages, currentPage + 1))} className="h-7 px-3 rounded-lg text-[10px] font-black italic border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all">Next →</button>
                              </div>
                            </div>
                          </>
                        )
                      })()
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: SERVICES / JASA MABAR */}
          <TabsContent value="services" className="space-y-6 outline-none">
            
            {/* PROMO MABAR CONFIGURATION BLOCK */}
            <Card className="border-2 border-[#FFD551]/60 dark:border-[#FFD551]/40 rounded-2xl shadow-md bg-white dark:bg-[#121211] overflow-hidden p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-black italic tracking-wider flex items-center gap-2 text-black dark:text-white">
                    🎁 Sistem Promosi Jasa Mabar ("Beli X Gratis Y")
                  </h3>
                  <p className="text-sm font-bold text-slate-400 italic">
                    Dorong penonton untuk memesan lebih banyak slot! Setel promosi agar penonton otomatis mendapatkan slot gratis (misal: Beli 5 Gratis 1).
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black italic text-slate-500">Status Promo:</span>
                  <Badge className={mabarPromoBuy > 0 ? "bg-emerald-500 text-white font-black text-[10px] px-2.5 py-1 rounded-lg shadow-sm" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500 text-[10px] px-2.5 py-1 rounded-lg"}>
                    {mabarPromoBuy > 0 ? `Aktif (${mabarPromoBuy} Beli Gratis ${mabarPromoGet})` : "Nonaktif"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                <div className="space-y-1.5">
                  <Label className="font-black italic text-xs text-slate-500">Minimal Beli Slot (X)</Label>
                  <Input 
                    type="number" 
                    min="0"
                    placeholder="Contoh: 5" 
                    value={mabarPromoBuy || ""} 
                    onChange={(e) => setMabarPromoBuy(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-black italic text-xs text-slate-500">Bonus Slot Gratis (Y)</Label>
                  <Input 
                    type="number" 
                    min="0"
                    placeholder="Contoh: 1" 
                    value={mabarPromoGet || ""} 
                    onChange={(e) => setMabarPromoGet(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleSaveProfile}
                    className="w-full h-10 bg-black text-[#FFD551] hover:bg-slate-900 border border-black rounded-xl font-black italic text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    Simpan Aturan Promo
                  </Button>
                </div>
              </div>
            </Card>

            <div className="flex justify-between items-center bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm dark:bg-[#121211] dark:border-zinc-800/80">
              <div>
                <h2 className="text-base font-black italic tracking-widest">
                  🎮 Rincian Jasa Mabar
                </h2>
                <p className="text-[10px] font-bold text-slate-400 italic mt-0.5">
                  Tambahkan menu game mabar yang ingin Anda tawarkan.
                </p>
              </div>

              <Dialog open={isAddPackageOpen} onOpenChange={setIsAddPackageOpen}>
                <DialogTrigger 
                  render={
                    <Button className="bg-[#FFD551] text-black border border-slate-200 dark:border-zinc-800 hover:bg-[#FFC83B] text-xs font-black italic h-10 px-5 rounded-2xl shadow-sm transition-all active:scale-95">
                      <Plus className="mr-2 h-4 w-4" /> Tambah Paket Jasa
                    </Button>
                  }
                />
                <DialogContent className="max-w-md bg-[#F8F7F3] rounded-2xl border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl">
                  <DialogHeader className="space-y-1 text-center">
                    <DialogTitle className="text-2xl font-black italic tracking-tighter flex items-center justify-center gap-2 text-black">
                      <Plus className="h-6 w-6 text-[#FFD551]" /> 
                      Tambah Paket Jasa Mabar
                    </DialogTitle>
                    <DialogDescription className="font-bold italic text-[9px] text-slate-400 tracking-widest">
                      MONETISASI LAYANAN MABAR KREATOR
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddPackage} className="space-y-4 pt-4 text-[#1A1A19]">
                    
                    {/* CATEGORIZED DROPDOWN SELECT */}
                    <div className="space-y-2">
                      <Label className="font-black italic text-xs text-slate-500">
                        Pilih Jenis Layanan / Game
                      </Label>
                      <select 
                        value={selectedGame}
                        onChange={(e) => {
                          setSelectedGame(e.target.value)
                          if (e.target.value !== "Lainnya") {
                            setNewPkgName(e.target.value)
                          } else {
                            setNewPkgName("")
                          }
                        }}
                        className="w-full h-11 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 font-bold bg-white dark:bg-zinc-900 text-black dark:text-white text-sm outline-none"
                      >
                        <option value="">-- Pilih Layanan Game --</option>
                        <option value="Mobile Legends: Bang Bang">Mobile Legends: Bang Bang</option>
                        <option value="PUBG Mobile">PUBG Mobile</option>
                        <option value="Free Fire">Free Fire</option>
                        <option value="Valorant">Valorant</option>
                        <option value="Genshin Impact">Genshin Impact</option>
                        <option value="Dota 2">Dota 2</option>
                        <option value="Minecraft">Minecraft</option>
                        <option value="GTA V / Roleplay">GTA V / Roleplay</option>
                        <option value="Lainnya">Lainnya (Tulis Custom)</option>
                      </select>
                    </div>

                    {selectedGame === "Lainnya" && (
                      <div className="space-y-2">
                        <Label className="font-black italic text-xs text-slate-500">Nama Layanan Custom</Label>
                        <Input 
                          required 
                          placeholder="Masukkan nama layanan/game..." 
                          value={newPkgName} 
                          onChange={(e) => setNewPkgName(e.target.value)}
                          className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="font-black italic text-xs text-slate-500">
                        Tarif / Harga Per Sesi Mabar (Rp)
                      </Label>
                      <Input 
                        type="text" 
                        required 
                        placeholder="25.000" 
                        value={formatNumberInput(newPkgPrice)} 
                        onChange={(e) => setNewPkgPrice(String(parseNumberInput(e.target.value)))}
                        className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                      />
                    </div>
                    <DialogFooter className="pt-4">
                      <Button type="submit" className="w-full h-12 bg-black text-[#FFD551] rounded-2xl font-black italic text-xs transition-all shadow-md">
                        Aktifkan Layanan Mabar
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* SERVICES LIST */}
            {packages.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-xs font-bold text-slate-400 italic dark:bg-[#121211] dark:border-zinc-800/80">
                Belum ada menu jasa mabar yang aktif.
              </div>
            ) : (
              (() => {
                // Find the first active package in the library to treat as the single active package
                const activePkg = packages.find((p: any) => p.status === "ACTIVE");
                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {packages.map((pkg) => {
                      const isActive = activePkg && pkg.id === activePkg.id;
                      return (
                        <Card key={pkg.id} className="border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden bg-white dark:bg-[#121211] dark:border-zinc-800/80 flex flex-col justify-between">
                          <CardHeader className="bg-[#FAF9F6] border-b border-slate-100 p-5 flex flex-row justify-between items-start text-black dark:bg-[#1E1E1D]/55 dark:text-white dark:border-zinc-800">
                            <div>
                              <CardTitle className="font-black italic text-xs tracking-wide">{pkg.game_name}</CardTitle>
                              <CardDescription className="text-sm font-bold italic mt-1 text-slate-400">ID Jasa: {pkg.id.substring(0, 8).toUpperCase()}</CardDescription>
                            </div>
                            
                            <Gamepad2 className="h-5 w-5 text-slate-400" />
                          </CardHeader>
                          <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4">
                            <div>
                              <p className="text-xs font-bold text-slate-500 dark:text-[#EAE9E4]/70 mb-4">
                                Dukungan instan untuk membuka slot antrean streaming bersama kreator.
                              </p>
                              <div className="flex items-baseline gap-1">
                                <span className="text-[9px] font-black italic text-slate-400">Tarif Sesi:</span>
                                <span className="text-base font-black italic text-black dark:text-white">Rp {Number(pkg.price_per_slot).toLocaleString("id-ID")}</span>
                              </div>
                            </div>

                            <div className="flex gap-2 border-t border-[#F2F0EA] dark:border-zinc-800/60 pt-3.5 items-center">
                              {isActive ? (
                                <Button 
                                  onClick={() => handleDeactivatePackage(pkg)}
                                  className="bg-emerald-500 hover:bg-rose-500 hover:text-white text-white border-0 font-black italic text-xs flex-1 justify-center h-11 rounded-2xl shadow-[0_4px_12px_rgba(16,185,129,0.25)] transition-all duration-200 group active:scale-95"
                                >
                                  <span className="group-hover:hidden flex items-center gap-1 justify-center">SEDANG AKTIF ⚡</span>
                                  <span className="hidden group-hover:flex items-center gap-1 justify-center">NONAKTIFKAN JASA ❌</span>
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline"
                                  onClick={() => handleToggleActivePackage(pkg)}
                                  className="bg-[#FAF9F6] text-slate-600 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200/60 text-xs font-black italic flex-1 h-11 rounded-2xl transition-all duration-200 dark:bg-[#1C1C1B] dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-emerald-400"
                                >
                                  Aktifkan Game
                                </Button>
                              )}
                              <Button 
                                size="icon" 
                                variant="outline" 
                                onClick={() => openEditPackage(pkg)}
                                className="h-11 w-11 border border-slate-200 rounded-2xl hover:bg-blue-50 hover:text-blue-500 active:scale-95 transition-all text-slate-400 dark:border-zinc-800"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="outline" 
                                onClick={() => setConfirmDelete({type: 'package', id: pkg.id, name: pkg.game_name})}
                                className="h-11 w-11 border border-slate-200 rounded-2xl hover:bg-red-50 hover:text-red-500 active:scale-95 transition-all text-slate-400 dark:border-zinc-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                );
              })()
            )}

          </TabsContent>

          {/* TAB 3: DIGITAL PROJECTS (GUMROAD STYLE URL REWARDS) */}
          <TabsContent value="projects" className="space-y-6 outline-none">
            <div className="flex justify-between items-center bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm dark:bg-[#121211] dark:border-zinc-800/80">
              <div>
                <h2 className="text-base font-black italic tracking-widest">🎨 Berbagi Proyek & Hadiah Digital</h2>
                <p className="text-sm font-bold text-slate-400 italic mt-0.5">
                  Bagikan file proyek ZIP, desain Figma, atau wallpaper eksklusif dengan minimal donasi saldo.
                </p>
              </div>

              <Dialog open={isAddProjectOpen} onOpenChange={setIsAddProjectOpen}>
                <DialogTrigger 
                  render={
                    <Button className="bg-[#FFD551] text-black border border-slate-200 dark:border-zinc-800 hover:bg-[#FFC83B] text-xs font-black italic h-10 px-5 rounded-2xl shadow-sm transition-all active:scale-95">
                      <Plus className="mr-2 h-4 w-4" /> Proyek Baru
                    </Button>
                  }
                />
                <DialogContent className="max-w-md bg-[#F8F7F3] rounded-2xl border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl">
                  <DialogHeader className="space-y-1 text-center">
                    <DialogTitle className="text-2xl font-black italic tracking-tighter flex items-center justify-center gap-2 text-black">
                      <FolderGit className="h-6 w-6 text-[#FFD551]" /> Proyek Digital Baru
                    </DialogTitle>
                    <DialogDescription className="font-bold italic text-[9px] text-slate-400 tracking-widest">
                      Bagikan Tautan Unduhan Reward Kreatif
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddProject} className="space-y-4 pt-4 text-[#1A1A19]">
                    <div className="space-y-2">
                      <Label className="font-black italic text-xs text-slate-500">Judul Proyek Digital</Label>
                      <Input 
                        required 
                        placeholder={role === "DEVELOPER" ? "Template Next.js Clean Boilerplate" : role === "DESIGNER" ? "3D Minimalist Vector Wallpaper Pack" : "Exclusive Guide & Setup MLBB"} 
                        value={newProjTitle} 
                        onChange={(e) => setNewProjTitle(e.target.value)}
                        className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black italic text-xs text-slate-500">Deskripsi Singkat Proyek</Label>
                      <Input 
                        placeholder="Berikan detail apa yang akan didapatkan pendukung Anda" 
                        value={newProjDesc} 
                        onChange={(e) => setNewProjDesc(e.target.value)}
                        className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black italic text-xs text-slate-500">Tautan File Unduhan (Drive / GitHub / Figma)</Label>
                      <Input 
                        required 
                        placeholder="https://drive.google.com/file/d/..." 
                        value={newProjUrl} 
                        onChange={(e) => setNewProjUrl(e.target.value)}
                        className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black italic text-xs text-slate-500">Minimal Dukungan Donasi Unlocking (Rp)</Label>
                      <Input 
                        type="text" 
                        required 
                        placeholder="20.000" 
                        value={formatNumberInput(newProjMinSupport)} 
                        onChange={(e) => setNewProjMinSupport(String(parseNumberInput(e.target.value)))}
                        className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                      />
                    </div>
                    <DialogFooter className="pt-4">
                      <Button type="submit" className="w-full h-12 bg-black text-[#FFD551] rounded-2xl font-black italic text-xs transition-all shadow-md">
                        Terbitkan Proyek Digital
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* PROJECTS GRID */}
            {projects.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-xs font-bold text-slate-400 italic dark:bg-[#121211] dark:border-zinc-800/80">
                Belum ada proyek digital yang dibagikan.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {projects.map((proj) => (
                  <Card key={proj.id} className="border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden bg-white dark:bg-[#121211] dark:border-zinc-800/80 flex flex-col justify-between">
                    <CardHeader className="bg-[#FAF9F6] border-b border-slate-100 p-5 flex flex-row justify-between items-start text-black dark:bg-[#1E1E1D]/55 dark:text-white dark:border-zinc-800">
                      <div>
                        <CardTitle className="font-black italic text-xs tracking-wide">{proj.title}</CardTitle>
                        <CardDescription className="text-sm font-bold italic mt-1 text-slate-400">Unlocks on donation</CardDescription>
                      </div>
                      <FolderGit className="h-5 w-5 text-[#FFD551]" />
                    </CardHeader>
                    <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-[#EAE9E4]/70 mb-4">
                          {proj.description || "Dapatkan tautan akses file unduhan penuh dengan mendukung kreator."}
                        </p>

                        {/* SECURE DOWNLOAD LINK DISPLAY ON OWNER DASHBOARD (WITH COPY OPTION) */}
                        <div className="w-full bg-[#FAF9F6] border border-slate-200 rounded-xl p-3 mb-4 flex items-center justify-between dark:bg-zinc-900/60 dark:border-zinc-800/80">
                          <div className="flex items-center gap-2 truncate">
                            <Lock className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span className="text-xs font-mono truncate text-emerald-600 font-bold">{proj.file_url}</span>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-slate-400 hover:text-black shrink-0"
                            onClick={() => {
                              navigator.clipboard.writeText(proj.file_url)
                              toast.success("Tautan unduhan proyek berhasil disalin!")
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="flex items-baseline gap-1">
                          <span className="text-xs font-black italic text-slate-400">Minimal Dukungan:</span>
                          <span className="text-sm font-black italic text-black dark:text-white">Rp {Number(proj.min_support).toLocaleString("id-ID")}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 border-t border-[#F2F0EA] dark:border-zinc-800/60 pt-3.5">
                        <Button variant="outline" className="bg-emerald-50 text-emerald-600 border border-emerald-200/40 hover:bg-emerald-100 font-black italic text-xs flex-1 justify-center h-10 rounded-xl gap-1.5">
                          <Download className="h-4 w-4" /> {proj.download_count} Unduhan
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => openEditProject(proj)}
                          className="h-8 w-8 border border-slate-200 rounded-xl hover:bg-blue-50 hover:text-blue-500 active:scale-95 transition-all text-slate-400 dark:border-zinc-800"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setConfirmDelete({type: 'project', id: proj.id, name: proj.title})}
                          className="h-8 w-8 border border-slate-200 rounded-xl hover:bg-red-50 hover:text-red-500 active:scale-95 transition-all text-slate-400 dark:border-zinc-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

          </TabsContent>

          {/* TAB 4: LIVE STREAM QUEUE CONTROL */}
          <TabsContent value="queue" className="space-y-6 outline-none">
            {/* Panduan Aksi Antrean Kreator */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-[#1E1E1D]/20 border border-slate-200/60 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
              <div className="flex gap-3.5 items-start">
                <div className="h-10 w-10 shrink-0 bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center font-black text-sm">📣</div>
                <div>
                  <h4 className="font-extrabold text-xs md:text-sm text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">Tombol Panggil</h4>
                  <p className="text-[11px] md:text-xs text-slate-500 dark:text-zinc-400 font-semibold mt-1">Memutar bel dering & menyebutkan panggilan suara mabar 3 kali langsung ke overlay streaming Anda agar supporter bersiap bergabung.</p>
                </div>
              </div>
              <div className="flex gap-3.5 items-start">
                <div className="h-10 w-10 shrink-0 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-[#FFD551] rounded-xl flex items-center justify-center font-black text-sm">▶️</div>
                <div>
                  <h4 className="font-extrabold text-xs md:text-sm text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">Tombol Main</h4>
                  <p className="text-[11px] md:text-xs text-slate-500 dark:text-zinc-400 font-semibold mt-1">Mengaktifkan status supporter menjadi "PLAYING" dan memposisikannya di bagian paling atas tabel sebagai supporter aktif bermain.</p>
                </div>
              </div>
              <div className="flex gap-3.5 items-start">
                <div className="h-10 w-10 shrink-0 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center font-black text-sm">⏹️</div>
                <div>
                  <h4 className="font-extrabold text-xs md:text-sm text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">Lewati / Selesai</h4>
                  <p className="text-[11px] md:text-xs text-slate-500 dark:text-zinc-400 font-semibold mt-1"><strong>Selesai:</strong> Mengurangi slot match/mengakhiri sesi. <strong>Lewati:</strong> Mengembalikan supporter aktif ke daftar tunggu agar bisa digilir.</p>
                </div>
              </div>
            </div>

            {/* Active Queue Table */}
            <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-md bg-white dark:bg-[#121211] overflow-hidden">
              <CardHeader className="py-6 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="font-extrabold text-base md:text-lg tracking-wide text-black dark:text-[#FFD551] flex items-center gap-2">
                      ⚡ Antrean Sekarang
                    </CardTitle>
                    <CardDescription className="font-semibold text-xs text-slate-500 dark:text-zinc-400 mt-1">
                      Penonton yang sedang aktif menunggu giliran bermain bersama Anda (Urutan otomatis berdasarkan jam order)
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedActiveIds.length > 0 && (
                      <div className="flex gap-2 items-center bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-2xl animate-pulse">
                        <span className="font-black text-xs text-amber-600">
                          {selectedActiveIds.length} Terpilih:
                        </span>
                        <Button
                          size="xs"
                          onClick={() => handleBulkQueueAction(selectedActiveIds, "SKIPPED")}
                          className="h-7 bg-red-500 hover:bg-red-600 text-white rounded-lg font-extrabold text-[10px] md:text-xs px-3 border-none"
                        >
                          Lewati
                        </Button>
                        <Button
                          size="xs"
                          onClick={() => handleBulkQueueAction(selectedActiveIds, "DONE")}
                          className="h-7 bg-black hover:bg-zinc-800 text-[#FFD551] rounded-lg font-extrabold text-[10px] md:text-xs px-3 border border-zinc-800"
                        >
                          Selesai
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => setSelectedActiveIds([])}
                          className="h-7 text-slate-500 hover:text-slate-700 font-extrabold text-[10px] md:text-xs px-2"
                        >
                          Batal
                        </Button>
                      </div>
                    )}
                    <Badge className="bg-red-500/15 text-red-600 border-none font-extrabold tracking-wider text-[10px] px-2.5 py-1 rounded-lg shrink-0">
                      ● Live Active: {queues.filter(q => q.status === "WAITING" || q.status === "PLAYING").length}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {queues.filter(q => q.status === "WAITING" || q.status === "PLAYING").length === 0 ? (
                  <div className="p-16 text-center text-sm font-extrabold text-slate-400 dark:text-zinc-500 italic">
                    Belum ada antrean aktif yang sedang menunggu.
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/20">
                      <TableRow className="border-b border-slate-100 dark:border-zinc-900">
                        <TableHead className="w-[60px] text-center px-4">
                          <input
                            type="checkbox"
                            className="h-4.5 w-4.5 rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                            checked={
                              queues.filter(q => q.status === "WAITING" || q.status === "PLAYING").length > 0 &&
                              selectedActiveIds.length === queues.filter(q => q.status === "WAITING" || q.status === "PLAYING").length
                            }
                            onChange={(e) => {
                              const activeIds = queues.filter(q => q.status === "WAITING" || q.status === "PLAYING").map(q => q.id);
                              if (e.target.checked) {
                                setSelectedActiveIds(activeIds);
                              } else {
                                setSelectedActiveIds([]);
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead className="font-extrabold text-slate-700 dark:text-zinc-300 text-xs md:text-sm tracking-wider px-2 py-4">No. Urut</TableHead>
                        <TableHead className="font-extrabold text-slate-700 dark:text-zinc-300 text-xs md:text-sm tracking-wider py-4">Nama Akun Nickname</TableHead>
                        <TableHead className="font-extrabold text-slate-700 dark:text-zinc-300 text-xs md:text-sm tracking-wider py-4">Menu Game Layanan</TableHead>
                        <TableHead className="font-extrabold text-slate-700 dark:text-zinc-300 text-xs md:text-sm tracking-wider py-4">In-Game / Discord ID</TableHead>
                        <TableHead className="font-extrabold text-slate-700 dark:text-zinc-300 text-xs md:text-sm tracking-wider py-4">Waktu Order</TableHead>
                        <TableHead className="font-extrabold text-slate-700 dark:text-zinc-300 text-xs md:text-sm tracking-wider py-4">Status Sesi</TableHead>
                        <TableHead className="font-extrabold text-slate-700 dark:text-zinc-300 text-xs md:text-sm tracking-wider text-right px-8 py-4">Tindakan Kontrol</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {queues
                        .filter(q => q.status === "WAITING" || q.status === "PLAYING")
                        .map((q, idx) => (
                          <TableRow key={q.id} className="border-b border-slate-100/60 dark:border-zinc-800/40 hover:bg-slate-50/30 transition-colors">
                            <TableCell className="text-center px-4">
                              <input
                                type="checkbox"
                                className="h-4.5 w-4.5 rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                                checked={selectedActiveIds.includes(q.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedActiveIds([...selectedActiveIds, q.id]);
                                  } else {
                                    setSelectedActiveIds(selectedActiveIds.filter(id => id !== q.id));
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell className="font-extrabold text-slate-800 dark:text-zinc-100 text-xs md:text-sm px-2 py-5">{idx + 1}</TableCell>
                            <TableCell className="font-bold text-xs md:text-sm py-5">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-[#1A1A19] dark:text-[#FAF9F6] text-xs md:text-sm">{q.ingame_nickname}</span>
                                {q.slots_count > 0 && (
                                  <Badge className="bg-emerald-500 text-white font-extrabold text-[10px] md:text-xs rounded-md px-2 py-0.5 shrink-0 border-none shadow-sm leading-none">
                                    {q.slots_count} Sesi
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-extrabold text-xs md:text-sm text-amber-600 dark:text-[#FFD551] py-5">@{q.game_package?.game_name || "Mabar"}</TableCell>
                            <TableCell className="font-mono font-bold text-xs md:text-sm text-slate-600 dark:text-zinc-400 py-5">{q.ingame_id}</TableCell>
                            <TableCell className="font-bold text-xs md:text-sm text-slate-500 dark:text-zinc-400 py-5">
                              {new Date(q.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                            </TableCell>
                            <TableCell className="py-5">
                              <Badge className={
                                q.status === "WAITING" 
                                  ? "bg-amber-50 text-amber-600 border border-amber-200/40 font-extrabold text-[10px] md:text-xs rounded-lg px-2.5 py-1"
                                  : "bg-green-50 text-green-600 border border-green-200/40 font-extrabold text-[10px] md:text-xs rounded-lg px-2.5 py-1 animate-pulse"
                              }>
                                {q.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right px-8 py-5">
                              <div className="flex gap-2 justify-end">
                                <Button 
                                  size="xs" 
                                  onClick={() => handleCallPlayer(q.id)} disabled={callingCooldowns[q.id]}
                                  className="h-9 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 disabled:text-purple-100 dark:disabled:bg-purple-950 dark:disabled:text-purple-800 text-white rounded-xl font-extrabold text-[11px] md:text-xs px-3.5 shadow-sm border-none flex items-center gap-1 active:scale-95 transition-all"
                                >
                                  {callingCooldowns[q.id] ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Cooldown</> : <><Megaphone className="h-3.5 w-3.5 animate-bounce" /> Panggil</>}
                                </Button>
                                {q.status === "WAITING" && (
                                  <Button 
                                    size="xs" 
                                    onClick={() => handleQueueAction(q.id, "PLAYING")}
                                    className="h-9 bg-[#FFD551] text-black border border-slate-200 dark:border-zinc-800 hover:bg-[#FFC83B] rounded-xl font-extrabold text-[11px] md:text-xs px-4 shadow-sm"
                                  >
                                    <Play className="mr-1.5 h-3.5 w-3.5" /> Main
                                  </Button>
                                )}
                                {q.status === "PLAYING" && (
                                  <Button 
                                    size="xs" 
                                    onClick={() => handleQueueAction(q.id, "DONE")}
                                    className="h-9 bg-black text-[#FFD551] border border-black hover:bg-slate-900 rounded-xl font-extrabold text-[11px] md:text-xs px-4 shadow-sm"
                                  >
                                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Selesai
                                  </Button>
                                )}
                                <Button 
                                  size="xs" 
                                  variant="outline"
                                  onClick={() => handleQueueAction(q.id, "SKIPPED")}
                                  className="h-9 border border-slate-200 dark:border-zinc-800 text-red-500 hover:text-red-600 rounded-xl font-extrabold text-[11px] md:text-xs px-4 hover:bg-red-50 dark:hover:bg-red-950/20"
                                >
                                  <XCircle className="mr-1.5 h-3.5 w-3.5" /> Lewati
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Pending Queue Table */}
            <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-md bg-white dark:bg-[#121211] overflow-hidden mt-6">
              <CardHeader className="py-6 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="font-extrabold text-base md:text-lg tracking-wide text-black dark:text-[#FFD551] flex items-center gap-2">
                      ⏳ Antrean Pending / Ditunda
                    </CardTitle>
                    <CardDescription className="font-semibold text-xs text-slate-500 dark:text-zinc-400 mt-1">
                      Penonton yang sempat dilewati (AFK / Tidak merespon). Klik 'Up' untuk aktifkan kembali ke antrean sekarang
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedPendingIds.length > 0 && (
                      <div className="flex gap-2 items-center bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-2xl animate-pulse">
                        <span className="font-black text-xs text-blue-600">
                          {selectedPendingIds.length} Terpilih:
                        </span>
                        <Button
                          size="xs"
                          onClick={() => handleBulkQueueAction(selectedPendingIds, "WAITING")}
                          className="h-7 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-extrabold text-[10px] md:text-xs px-3 border-none"
                        >
                          Up / Aktifkan Kembali
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => setSelectedPendingIds([])}
                          className="h-7 text-slate-500 hover:text-slate-700 font-extrabold text-[10px] md:text-xs px-2"
                        >
                          Batal
                        </Button>
                      </div>
                    )}
                    <Badge className="bg-amber-500/15 text-amber-600 border-none font-extrabold tracking-wider text-[10px] px-2.5 py-1 rounded-lg shrink-0">
                      ● Pending: {queues.filter(q => q.status === "SKIPPED").length}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {queues.filter(q => q.status === "SKIPPED").length === 0 ? (
                  <div className="p-16 text-center text-sm font-extrabold text-slate-400 dark:text-zinc-500 italic">
                    Belum ada antrean mabar yang sedang ditangguhkan.
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/20">
                      <TableRow className="border-b border-slate-100 dark:border-zinc-900">
                        <TableHead className="w-[60px] text-center px-4">
                          <input
                            type="checkbox"
                            className="h-4.5 w-4.5 rounded border-slate-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
                            checked={
                              queues.filter(q => q.status === "SKIPPED").length > 0 &&
                              selectedPendingIds.length === queues.filter(q => q.status === "SKIPPED").length
                            }
                            onChange={(e) => {
                              const pendingIds = queues.filter(q => q.status === "SKIPPED").map(q => q.id);
                              if (e.target.checked) {
                                setSelectedPendingIds(pendingIds);
                              } else {
                                setSelectedPendingIds([]);
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead className="font-extrabold text-slate-700 dark:text-zinc-300 text-xs md:text-sm tracking-wider px-2 py-4">No. Urut</TableHead>
                        <TableHead className="font-extrabold text-slate-700 dark:text-zinc-300 text-xs md:text-sm tracking-wider py-4">Nama Akun Nickname</TableHead>
                        <TableHead className="font-extrabold text-slate-700 dark:text-zinc-300 text-xs md:text-sm tracking-wider py-4">Menu Game Layanan</TableHead>
                        <TableHead className="font-extrabold text-slate-700 dark:text-zinc-300 text-xs md:text-sm tracking-wider py-4">In-Game / Discord ID</TableHead>
                        <TableHead className="font-extrabold text-slate-700 dark:text-zinc-300 text-xs md:text-sm tracking-wider py-4">Waktu Order</TableHead>
                        <TableHead className="font-extrabold text-slate-700 dark:text-zinc-300 text-xs md:text-sm tracking-wider py-4">Status Sesi</TableHead>
                        <TableHead className="font-extrabold text-slate-700 dark:text-zinc-300 text-xs md:text-sm tracking-wider text-right px-8 py-4">Tindakan Kontrol</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {queues
                        .filter(q => q.status === "SKIPPED")
                        .map((q, idx) => (
                          <TableRow key={q.id} className="border-b border-slate-100/60 dark:border-zinc-800/40 hover:bg-slate-50/30 transition-colors">
                            <TableCell className="text-center px-4">
                              <input
                                type="checkbox"
                                className="h-4.5 w-4.5 rounded border-slate-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
                                checked={selectedPendingIds.includes(q.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedPendingIds([...selectedPendingIds, q.id]);
                                  } else {
                                    setSelectedPendingIds(selectedPendingIds.filter(id => id !== q.id));
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell className="font-extrabold text-slate-800 dark:text-zinc-100 text-xs md:text-sm px-2 py-5">{idx + 1}</TableCell>
                            <TableCell className="font-bold text-xs md:text-sm py-5">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-[#1A1A19] dark:text-[#FAF9F6] text-xs md:text-sm">{q.ingame_nickname}</span>
                                {q.slots_count > 0 && (
                                  <Badge className="bg-emerald-500 text-white font-extrabold text-[10px] md:text-xs rounded-md px-2 py-0.5 shrink-0 border-none shadow-sm leading-none">
                                    {q.slots_count} Sesi
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-extrabold text-xs md:text-sm text-amber-600 dark:text-[#FFD551] py-5">@{q.game_package?.game_name || "Mabar"}</TableCell>
                            <TableCell className="font-mono font-bold text-xs md:text-sm text-slate-600 dark:text-zinc-400 py-5">{q.ingame_id}</TableCell>
                            <TableCell className="font-bold text-xs md:text-sm text-slate-500 dark:text-zinc-400 py-5">
                              {new Date(q.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                            </TableCell>
                            <TableCell className="py-5">
                              <Badge className="bg-blue-50 text-blue-600 border border-blue-200/40 font-extrabold text-[10px] md:text-xs rounded-lg px-2.5 py-1">
                                {q.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right px-8 py-5">
                              <div className="flex gap-2 justify-end">
                                <Button 
                                  size="xs" 
                                  onClick={() => handleQueueAction(q.id, "WAITING")}
                                  className="h-9 bg-blue-500 text-white border border-blue-600 hover:bg-blue-600 rounded-xl font-extrabold text-[11px] md:text-xs px-4 shadow-sm"
                                >
                                  <ArrowUpCircle className="mr-1.5 h-3.5 w-3.5" /> Up / Aktifkan
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6 outline-none">
            {/* SUB-TABS NAVIGATION BAR */}
            <div className="flex border-b border-slate-200/80 dark:border-zinc-800/80 pb-1 mb-6 gap-2 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setProfileSubTab("edit")}
                className={`font-black italic text-xs md:text-sm tracking-wider pb-3 border-b-3 transition-all px-4 ${
                  profileSubTab === "edit"
                    ? "border-[#FFD551] text-black dark:text-[#FFD551] font-black"
                    : "border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-400"
                }`}
              >
                👤 Edit Profil
              </button>
              <button
                type="button"
                onClick={() => setProfileSubTab("payout")}
                className={`font-black italic text-xs md:text-sm tracking-wider pb-3 border-b-3 transition-all px-4 ${
                  profileSubTab === "payout"
                    ? "border-[#FFD551] text-black dark:text-[#FFD551] font-black"
                    : "border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-400"
                }`}
              >
                🏦 Rekening Payout
              </button>
              <button
                type="button"
                onClick={() => setProfileSubTab("customization")}
                className={`font-black italic text-xs md:text-sm tracking-wider pb-3 border-b-3 transition-all px-4 ${
                  profileSubTab === "customization"
                    ? "border-[#FFD551] text-black dark:text-[#FFD551] font-black"
                    : "border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-400"
                }`}
              >
                ⚙️ Kustomisasi Halaman
              </button>
              <button
                type="button"
                onClick={() => setProfileSubTab("tickets")}
                className={`font-black italic text-xs md:text-sm tracking-wider pb-3 border-b-3 transition-all px-4 ${
                  profileSubTab === "tickets"
                    ? "border-[#FFD551] text-black dark:text-[#FFD551] font-black"
                    : "border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-400"
                }`}
              >
                🎫 Tiket Bantuan
              </button>
              <button
                type="button"
                onClick={() => setProfileSubTab("verified")}
                className={`font-black italic text-xs md:text-sm tracking-wider pb-3 border-b-3 transition-all px-4 ${
                  profileSubTab === "verified"
                    ? "border-[#FFD551] text-black dark:text-[#FFD551] font-black"
                    : "border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-400"
                }`}
              >
                🌟 Ajukan Verified
              </button>
              <button
                type="button"
                onClick={() => setProfileSubTab("media")}
                className={`font-black italic text-xs md:text-sm tracking-wider pb-3 border-b-3 transition-all px-4 ${
                  profileSubTab === "media"
                    ? "border-[#FFD551] text-black dark:text-[#FFD551] font-black"
                    : "border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-400"
                }`}
              >
                🎬 Media & TTS
              </button>
            </div>

            {profileSubTab === "media" && (
              <MediaSettingsTab />
            )}

            {profileSubTab === "edit" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* LEFT & CENTER PANEL: AVATAR & SOCIAL SETTINGS */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 1. AVATAR GALLERY PICKER CARD */}
                <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
                  <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
                    <CardTitle className="font-black italic text-sm md:text-base tracking-wider text-black dark:text-[#FFD551] flex items-center gap-2">
                      🎨 Unggah Foto Profil & Banner Kreator
                    </CardTitle>
                    <CardDescription className="font-bold italic text-[11px] md:text-xs text-slate-400">
                      Sesuaikan foto profil publik dan cover banner Anda agar terlihat premium dan menarik pendukung
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    
                    {/* Compact Active Avatar Indicator & Modal Trigger */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-[#1C1C1B]/40 rounded-2xl border border-slate-200/55 dark:border-zinc-800 mb-6">
                      <div className="flex items-center gap-3.5">
                        <div className="relative w-14 h-14 rounded-2xl border-2 border-[#FFD551] overflow-hidden bg-white dark:bg-zinc-900 shadow-sm flex-shrink-0">
                          {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Current Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-black italic text-slate-450">?</div>
                          )}
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-black uppercase text-black dark:text-white">Avatar Aktif Anda</p>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-550 italic leading-snug">Default premium maskot Treetmi atau foto kustom pilihan Anda</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => setIsAvatarModalOpen(true)}
                        className="h-10 px-4 bg-[#FFD551] text-black border-2 border-black rounded-xl font-black italic uppercase text-[11px] shadow-[2.5px_2.5px_0px_0px_#000000] active:scale-95 hover:bg-[#FFC83B] transition-all dark:border-white dark:shadow-none shrink-0"
                      >
                        🎨 PILIH DARI GALERI DEFAULT
                      </Button>
                    </div>

                    {/* 1b. CUSTOM AVATAR & BANNER UPLOAD ZONE */}
                    <div className="mt-6 border-t border-slate-100 dark:border-zinc-900 pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Custom Avatar Upload */}
                        <div className="space-y-3">
                          <Label className="font-black italic text-xs md:text-sm text-slate-500 dark:text-zinc-400 block">
                            📷 Unggah Foto Profil Kustom Anda
                          </Label>
                          
                          {/* Wide Button */}
                          <div className="relative group w-full">
                            <div className="w-full h-16 rounded-2xl border-2 border-dashed border-slate-350 dark:border-zinc-800 flex items-center justify-center bg-slate-50 dark:bg-zinc-900/60 relative overflow-hidden cursor-pointer hover:border-[#FFD551] hover:bg-[#FFD551]/5 transition-all">
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleAvatarUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                              />
                              <div className="flex items-center gap-2 text-slate-400 group-hover:text-[#FFD551] transition-all">
                                {isUploadingAvatar ? (
                                  <RefreshCw className="h-5 w-5 animate-spin" />
                                ) : (
                                  <>
                                    <UploadCloud className="h-5.5 w-5.5 text-slate-400 dark:text-zinc-500" />
                                    <span className="text-xs font-black uppercase italic">PILIH FOTO PROFIL</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Info Text Below */}
                          <p className="text-[10px] md:text-[11px] font-bold text-slate-400 dark:text-zinc-500 italic mt-2 leading-relaxed text-center sm:text-left">
                            Dimensi Disarankan: **500x500 px (Rasio 1:1)** &bull; Format: PNG, JPG, WEBP &bull; Maksimal 2MB
                          </p>
                        </div>

                        {/* Custom Banner Upload */}
                        <div className="space-y-3 border-t md:border-t-0 md:border-l border-slate-100 dark:border-zinc-900 pt-4 md:pt-0 md:pl-6">
                          <Label className="font-black italic text-xs md:text-sm text-slate-500 dark:text-zinc-400 block">
                            🖼️ Unggah Banner Profil Kustom Anda
                          </Label>
                          
                          {profile?.banner_url ? (
                            <div className="space-y-3">
                              <div className="relative rounded-xl border border-slate-200 dark:border-zinc-800/60 aspect-[3/1] bg-slate-50 overflow-hidden shadow-sm w-full">
                                <img 
                                  src={profile.banner_url} 
                                  alt="Banner Preview" 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex gap-2 w-full">
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={() => {
                                    const input = document.createElement("input")
                                    input.type = "file"
                                    input.accept = "image/*"
                                    input.onchange = (e: any) => handleBannerUpload(e)
                                    input.click()
                                  }}
                                  disabled={isUploadingBanner}
                                  className="h-10 flex-1 border border-slate-200 text-slate-650 hover:bg-slate-100 rounded-xl text-xs font-black italic dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
                                >
                                  {isUploadingBanner ? "Mengunggah..." : "🔄 Ganti Banner"}
                                </Button>
                                <Button 
                                  type="button" 
                                  variant="destructive" 
                                  onClick={handleDeleteBanner}
                                  className="h-10 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-black italic px-4"
                                >
                                  ❌ Hapus
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {/* Wide Button */}
                              <div className="relative group w-full">
                                <div className="w-full h-16 rounded-2xl border-2 border-dashed border-slate-350 dark:border-zinc-800 flex items-center justify-center bg-slate-50 dark:bg-zinc-900/60 relative overflow-hidden cursor-pointer hover:border-[#FFD551] hover:bg-[#FFD551]/5 transition-all">
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleBannerUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                  />
                                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-[#FFD551] transition-all">
                                    {isUploadingBanner ? (
                                      <RefreshCw className="h-5 w-5 animate-spin" />
                                    ) : (
                                      <>
                                        <UploadCloud className="h-5.5 w-5.5 text-slate-400 dark:text-zinc-500" />
                                        <span className="text-xs font-black uppercase italic">PILIH BANNER KUSTOM</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Info Text Below */}
                              <p className="text-[10px] md:text-[11px] font-bold text-slate-400 dark:text-zinc-500 italic mt-2 leading-relaxed text-center sm:text-left">
                                Dimensi Disarankan: **1200x400 px (Rasio 3:1)** &bull; Format: PNG, JPG, WEBP &bull; Maksimal 2MB
                              </p>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 2. BIOGRAPHY & SOCIAL MEDIA LINKS CARD */}
                <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
                  <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
                    <CardTitle className="font-black italic text-sm md:text-base tracking-wider text-black dark:text-[#FFD551] flex items-center gap-2">
                      👤 Informasi Profil & Media Sosial
                    </CardTitle>
                    <CardDescription className="font-bold italic text-[11px] md:text-xs text-slate-400">
                      Edit status misi streaming dan pasang semua link sosial media Anda secara lengkap
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                      
                      {/* Bio status input */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="font-black italic text-xs md:text-sm text-slate-500 dark:text-zinc-400">Status Misi / Bio Publik</Label>
                          <span className="text-[11px] md:text-xs font-bold text-muted-foreground italic">{editBio.length}/500 Karakter</span>
                        </div>
                        <textarea
                          rows={3}
                          value={editBio}
                          maxLength={500}
                          onChange={(e) => setEditBio(e.target.value)}
                          placeholder="Contoh: Misi: Push Rank MLBB Sampai Mythical Glory! Support terus biar semangat live streaming mabar tiap malam. 👾🔥"
                          className="w-full border border-slate-200 dark:border-zinc-800 rounded-2xl bg-[#FAF9F6] text-black text-xs md:text-sm p-4 focus:outline-none focus:ring-1 focus:ring-[#FFD551] transition-all dark:bg-[#1E1E1D] dark:text-white leading-relaxed resize-none"
                        />
                      </div>

                      <div className="border-t border-slate-100 dark:border-zinc-900 pt-4">
                        <Label className="font-black italic text-xs md:text-sm text-slate-500 dark:text-zinc-400 block mb-4">Integrasi Link Sosial Media</Label>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* YouTube Link */}
                          <div className="space-y-2">
                            <Label className="font-bold italic text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                              <svg className="h-4 w-4 fill-red-500" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11C4.482 20.455 12 20.455 12 20.455s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                              Link Saluran YouTube
                            </Label>
                            <Input 
                              type="text"
                              value={editYoutube}
                              onChange={(e) => setEditYoutube(e.target.value)}
                              placeholder="https://youtube.com/c/username"
                              className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-[#FAF9F6] text-black text-xs md:text-sm dark:bg-[#1E1E1D] dark:text-white px-3"
                            />
                          </div>

                          {/* Discord Link */}
                          <div className="space-y-2">
                            <Label className="font-bold italic text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                              <svg className="h-4 w-4 fill-[#5865F2]" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/></svg>
                              Link Discord Server
                            </Label>
                            <Input 
                              type="text"
                              value={editDiscord}
                              onChange={(e) => setEditDiscord(e.target.value)}
                              placeholder="https://discord.gg/invite-code"
                              className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-[#FAF9F6] text-black text-xs md:text-sm dark:bg-[#1E1E1D] dark:text-white px-3"
                            />
                          </div>

                          {/* Instagram Link */}
                          <div className="space-y-2">
                            <Label className="font-bold italic text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                              <svg className="h-4 w-4 fill-pink-500" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                              Link Instagram
                            </Label>
                            <Input 
                              type="text"
                              value={editInstagram}
                              onChange={(e) => setEditInstagram(e.target.value)}
                              placeholder="https://instagram.com/username"
                              className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-[#FAF9F6] text-black text-xs md:text-sm dark:bg-[#1E1E1D] dark:text-white px-3"
                            />
                          </div>

                          {/* TikTok Link */}
                          <div className="space-y-2">
                            <Label className="font-bold italic text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                              <svg className="h-4 w-4 fill-black dark:fill-white" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.52-4.06-1.39-.77-.57-1.39-1.35-1.77-2.24-.07-.15-.12-.3-.17-.46-.03.02-.04.05-.04.08-.02 3.19-.01 6.38-.02 9.57-.02 1.45-.37 2.92-1.07 4.19-1.22 2.28-3.64 3.86-6.26 3.91-3.21.14-6.38-1.92-7.23-5.01-.89-3.13.73-6.66 3.82-7.66 1.11-.38 2.3-.43 3.45-.19v4.08c-.73-.21-1.54-.15-2.21.21-.99.51-1.54 1.68-1.35 2.77.16 1.05 1.11 1.86 2.17 1.81 1.13-.01 2.08-.94 2.09-2.07.02-4.22.01-8.43.02-12.65z"/></svg>
                              Link TikTok
                            </Label>
                            <Input 
                              type="text"
                              value={editTiktok}
                              onChange={(e) => setEditTiktok(e.target.value)}
                              placeholder="https://tiktok.com/@username"
                              className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-[#FAF9F6] text-black text-xs md:text-sm dark:bg-[#1E1E1D] dark:text-white px-3"
                            />
                          </div>

                          {/* Twitch Link */}
                          <div className="space-y-2">
                            <Label className="font-bold italic text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                              <svg className="h-4 w-4 fill-[#9146FF]" viewBox="0 0 24 24"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>
                              Link Twitch
                            </Label>
                            <Input 
                              type="text"
                              value={editTwitch}
                              onChange={(e) => setEditTwitch(e.target.value)}
                              placeholder="https://twitch.tv/username"
                              className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-[#FAF9F6] text-black text-xs md:text-sm dark:bg-[#1E1E1D] dark:text-white px-3"
                            />
                          </div>

                          {/* Facebook Link */}
                          <div className="space-y-2">
                            <Label className="font-bold italic text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                              <svg className="h-4 w-4 fill-[#1877F2]" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                              Link Facebook
                            </Label>
                            <Input 
                              type="text"
                              value={editFacebook}
                              onChange={(e) => setEditFacebook(e.target.value)}
                              placeholder="https://facebook.com/username"
                              className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-[#FAF9F6] text-black text-xs md:text-sm dark:bg-[#1E1E1D] dark:text-white px-3"
                            />
                          </div>

                          {/* Website Link */}
                          <div className="space-y-2 md:col-span-2">
                            <Label className="font-bold italic text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                              <svg className="h-4 w-4 fill-emerald-500" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.25 18.25a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0zm1.75-4.75a.5.5 0 0 1-1 0v-4.5a.5.5 0 0 1 1 0v4.5z"/></svg>
                              Website Utama / Tautan Custom Portfolio
                            </Label>
                            <Input 
                              type="text"
                              value={editWebsite}
                              onChange={(e) => setEditWebsite(e.target.value)}
                              placeholder="https://mywebsite.com"
                              className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-[#FAF9F6] text-black text-xs md:text-sm dark:bg-[#1E1E1D] dark:text-white px-3"
                            />
                          </div>

                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button 
                          type="submit"
                          className="h-12 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black hover:bg-slate-900 dark:hover:bg-[#FFC83B] rounded-2xl font-black italic text-xs md:text-sm px-8 shadow-sm transition-all"
                        >
                          Simpan Perubahan Profil
                        </Button>
                      </div>

                    </form>
                  </CardContent>
                </Card>

              </div>

              {/* RIGHT PANEL: LINK SHARING & TREETMI BRANDED QR CODE */}
              <div className="space-y-6">
                
                {/* 1. TREETMI.ID PUBLIC PROFILE SHARING */}
                <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
                  <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
                    <CardTitle className="font-black italic text-sm md:text-base tracking-wider text-black dark:text-[#FFD551] flex items-center gap-2">
                      🔗 Tautan Halaman Dukungan
                    </CardTitle>
                    <CardDescription className="font-bold italic text-[11px] md:text-xs text-slate-400">
                      Bagikan link ini ke penonton stream atau pasang di media sosial Anda
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Label className="font-black italic text-xs md:text-sm text-slate-500">Link Publik Anda</Label>
                      <div className="flex gap-2">
                        <Input 
                          readOnly 
                          value={`${originUrl}/${profile?.username}`}
                          className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-[#FAF9F6] text-black text-xs md:text-sm flex-1 select-all dark:bg-[#1E1E1D] dark:text-white px-3"
                        />
                        
                        <Button 
                          onClick={() => {
                            navigator.clipboard.writeText(`${originUrl}/${profile?.username}`)
                            toast.success("Link halaman dukungan disalin!")
                          }}
                          size="icon"
                          className="h-10 w-10 bg-[#FFD551] text-black hover:bg-[#FFC83B] rounded-xl flex items-center justify-center shrink-0 border border-slate-200 dark:border-zinc-800"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <a 
                      href={`${originUrl}/${profile?.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center h-10 w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-zinc-900/50 dark:border-zinc-800/80 dark:hover:bg-zinc-800/60 rounded-xl text-xs md:text-sm font-black italic uppercase tracking-wider text-slate-600 dark:text-[#EAE9E4]/80 transition-all gap-1.5"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Lihat Tampilan Publik Profil
                    </a>
                  </CardContent>
                </Card>

                {/* 2. HIGH-FIDELITY TREETMI BRANDED OBS QR CODE */}
                <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
                  <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
                    <CardTitle className="font-black italic text-sm md:text-base tracking-wider text-black dark:text-[#FFD551] flex items-center gap-2">
                      📢 QR Code Dukungan OBS
                    </CardTitle>
                    <CardDescription className="font-bold italic text-[11px] md:text-xs text-slate-400">
                      Tampilkan QR Code premium ini langsung di overlay OBS saat live stream agar fans mudah berdonasi!
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 flex flex-col items-center space-y-6">
                    
                    {/* Visual QR Container */}
                    <div className="relative p-4 bg-[#FFD551] rounded-2xl shadow-md border-2 border-black max-w-[200px] aspect-square flex items-center justify-center select-none overflow-hidden">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=0b0b0a&bgcolor=ffd551&data=${encodeURIComponent(`${originUrl}/${profile?.username}`)}`}
                        alt={`QR Code @${profile?.username}`}
                        className="w-full h-full object-contain rounded-2xl"
                      />
                    </div>

                    <div className="text-center space-y-1.5">
                      <h4 className="text-xs md:text-sm font-black uppercase italic tracking-wider text-black dark:text-white">QR Code Premium @{profile?.username}</h4>
                      <p className="text-[11px] md:text-xs font-medium text-slate-400 italic max-w-[220px] leading-normal">
                        Didesain khusus dengan kontras warna Treetmi untuk OBS. Scan QR langsung menuju form pembayaran instan!
                      </p>
                    </div>

                    <Button 
                      onClick={handleDownloadQRCode}
                      className="h-11 w-full bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black hover:bg-slate-900 dark:hover:bg-[#FFC83B] rounded-xl font-black italic text-xs md:text-sm uppercase tracking-wider gap-1.5 shadow-sm transition-all"
                    >
                      <Download className="h-4 w-4" /> Unduh Gambar QR Code (.PNG)
                    </Button>

                  </CardContent>
                </Card>

              </div>

            </div>
          )}

          {profileSubTab === "payout" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* LEFT & CENTER PANEL */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 1. REKENING SETTINGS */}
                <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
                  <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="font-black italic text-sm md:text-base tracking-wider text-black dark:text-[#FFD551] flex items-center gap-2">
                        🏦 Rekening Bank & E-Wallet Payout
                        {isBankLocked && <span className="text-red-500 font-black flex items-center gap-1 shrink-0 text-[10px] md:text-xs bg-red-500/10 px-2.5 py-0.5 rounded-lg border border-red-500/20">🔒 TERKUNCI</span>}
                      </CardTitle>
                      <CardDescription className="font-bold italic text-[11px] md:text-xs text-slate-400 mt-1">
                        Konfigurasikan rekening bank atau e-wallet Anda untuk menerima penarikan dana (withdrawal) hasil donasi.
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleSaveBankAccount} className="space-y-4">
                      {isBankLocked && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                          <p className="text-xs md:text-sm font-bold text-red-600 dark:text-red-400 italic leading-normal">
                            Rekening Anda telah dikunci untuk keamanan sistem. Untuk mengajukan perubahan rekening, silakan buka tiket bantuan ke tim Support.
                          </p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        {/* 1. Pilih Bank / E-Wallet */}
                        <div className="space-y-2">
                          <Label className="font-black italic text-xs md:text-sm text-slate-500 dark:text-zinc-400">Bank / E-Wallet</Label>
                          <select
                            value={bankName}
                            disabled={isBankLocked}
                            onChange={(e) => setBankName(e.target.value)}
                            className="w-full h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-[#FAF9F6] text-black text-xs md:text-sm dark:bg-[#1E1E1D] dark:text-white px-3 focus:outline-none focus:ring-1 focus:ring-[#FFD551] disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <option value="BCA">BCA (Bank Central Asia)</option>
                            <option value="Mandiri">Bank Mandiri</option>
                            <option value="BNI">BNI (Bank Negara Indonesia)</option>
                            <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                            <option value="GoPay">GoPay (E-Wallet)</option>
                            <option value="OVO">OVO (E-Wallet)</option>
                            <option value="Dana">Dana (E-Wallet)</option>
                            <option value="LinkAja">LinkAja (E-Wallet)</option>
                          </select>
                        </div>

                        {/* 2. Nomor Rekening / HP */}
                        <div className="space-y-2">
                          <Label className="font-black italic text-xs md:text-sm text-slate-500 dark:text-zinc-400">Nomor Rekening / HP</Label>
                          <Input 
                            type="text"
                            required
                            disabled={isBankLocked}
                            value={bankNumber}
                            onChange={(e) => setBankNumber(e.target.value)}
                            placeholder="Contoh: 123-456-789 atau 0812..."
                            className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-[#FAF9F6] text-black text-xs md:text-sm dark:bg-[#1E1E1D] dark:text-white px-3 disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </div>

                        {/* 3. Nama Pemilik Akun */}
                        <div className="space-y-2">
                          <Label className="font-black italic text-xs md:text-sm text-slate-500 dark:text-zinc-400">Nama Pemilik Rekening</Label>
                          <Input 
                            type="text"
                            required
                            disabled={isBankLocked}
                            value={bankHolder}
                            onChange={(e) => setBankHolder(e.target.value)}
                            placeholder="Nama sesuai buku tabungan / e-wallet"
                            className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-[#FAF9F6] text-black text-xs md:text-sm dark:bg-[#1E1E1D] dark:text-white px-3 disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </div>

                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        {isBankLocked ? (
                          <Button 
                            type="button"
                            onClick={() => setProfileSubTab("tickets")}
                            className="h-10 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black hover:bg-slate-900 dark:hover:bg-[#FFC83B] rounded-xl font-black italic text-xs md:text-sm uppercase tracking-wider px-6 shadow-sm transition-all"
                          >
                            🎫 Hubungi Support (Open Tiket)
                          </Button>
                        ) : (
                          <Button 
                            type="submit"
                            className="h-10 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black hover:bg-slate-900 dark:hover:bg-[#FFC83B] rounded-xl font-black italic text-xs md:text-sm uppercase tracking-wider px-6 shadow-sm transition-all"
                          >
                            Simpan Payout Rekening
                          </Button>
                        )}
                      </div>

                    </form>
                  </CardContent>
                </Card>

                {/* 2. WALLET BALANCE CARD FOR EASY ACCESS */}
                <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121211] shadow-sm overflow-hidden">
                  <CardHeader className="py-5 px-8 bg-[#FFD551] border-b border-slate-200/10 flex flex-row items-center justify-between text-black">
                    <CardTitle className="font-black italic text-sm md:text-base tracking-wider flex items-center gap-2">
                      💰 Saldo Dompet Saat Ini
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <p className="text-3xl font-black italic text-black dark:text-white">Rp {balance.toLocaleString("id-ID")}</p>
                      <p className="text-xs md:text-sm font-bold text-slate-400 italic mt-1">
                        Klik tombol untuk langsung ajukan penarikan ke rekening Anda. Lihat riwayat di tab Dompet.
                      </p>
                    </div>
                    <Button 
                      onClick={() => setIsWithdrawOpen(true)}
                      className="h-12 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black hover:bg-slate-900 rounded-2xl font-black italic text-xs md:text-sm px-8 shadow-sm transition-all shrink-0 animate-bounce"
                    >
                      Tarik Dana Sekarang
                    </Button>
                  </CardContent>
                </Card>

              </div>

              {/* RIGHT PANEL: INSTRUCTIONS */}
              <div className="space-y-6">
                <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121211] shadow-sm overflow-hidden">
                  <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
                    <CardTitle className="font-black italic text-sm md:text-base tracking-wider text-black dark:text-[#FFD551] flex items-center gap-2">
                      ℹ️ Panduan Payout
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-3 text-xs md:text-sm font-bold italic text-slate-500 leading-normal">
                      <p className="flex items-start gap-2">
                        <span className="text-[#FFD551]">⚡</span> 
                        <span>Minimal penarikan dana adalah Rp 50.000,-</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-[#FFD551]">⚡</span> 
                        <span>Proses transfer dana memakan waktu maksimal 1-2 hari kerja.</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-[#FFD551]">⚡</span> 
                        <span>Pastikan nama pemilik rekening sama dengan nama pada rekening bank / e-wallet Anda untuk menghindari hambatan verifikasi.</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          )}

          {profileSubTab === "customization" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* LEFT & CENTER PANEL */}
              <div className="lg:col-span-2 space-y-6">
                
                <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
                  <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
                    <CardTitle className="font-black italic text-sm md:text-base tracking-wider text-black dark:text-[#FFD551] flex items-center gap-2">
                      ⚙️ Kustomisasi Tampilan & Target Donasi
                    </CardTitle>
                    <CardDescription className="font-bold italic text-[11px] md:text-xs text-slate-400">
                      Sesuaikan visibilitas sektor, target nominal dukungan, dan teks tombol utama halaman kreator Anda.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                      
                      {/* 1. TARGET GOALS */}
                      <div className="space-y-4">
                        <Label className="font-black italic text-xs md:text-sm text-slate-500 dark:text-zinc-400 block">📊 Pengaturan Target Donasi</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Target Title */}
                          <div className="space-y-2">
                            <Label className="font-bold italic text-xs text-slate-500 dark:text-zinc-400">Nama/Judul Target Dukungan</Label>
                            <Input 
                              type="text"
                              value={editTargetTitle}
                              onChange={(e) => setEditTargetTitle(e.target.value)}
                              placeholder="Contoh: Target Upgrade PC Streaming"
                              className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-[#FAF9F6] text-black text-xs md:text-sm dark:bg-[#1E1E1D] dark:text-white px-3"
                            />
                          </div>

                          {/* Target Amount */}
                          <div className="space-y-2">
                            <Label className="font-bold italic text-xs text-slate-500 dark:text-zinc-400">Target Nominal Pencapaian (Rp)</Label>
                            <Input 
                              type="text"
                              value={formatNumberInput(editTargetAmount)}
                              onChange={(e) => setEditTargetAmount(String(parseNumberInput(e.target.value)))}
                              placeholder="10.000.000"
                              className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-[#FAF9F6] text-black text-xs md:text-sm dark:bg-[#1E1E1D] dark:text-white px-3"
                            />
                          </div>

                          {/* Schedule Title */}
                          <div className="space-y-2 md:col-span-2">
                            <Label className="font-bold italic text-xs text-slate-500 dark:text-zinc-400">Judul Panel Jadwal Live Streaming (Opsional)</Label>
                            <Input 
                              type="text"
                              value={editScheduleTitleSetting}
                              onChange={(e) => setEditScheduleTitleSetting(e.target.value)}
                              placeholder="Contoh: Jadwal Live Speed-Art & UX Review"
                              className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-[#FAF9F6] text-black text-xs md:text-sm dark:bg-[#1E1E1D] dark:text-white px-3"
                            />
                          </div>
                        </div>

                        {/* Visibilities Tactile Buttons */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                          {/* 1. Target Donasi */}
                          <button
                            type="button"
                            onClick={() => setShowTarget(!showTarget)}
                            className={`group relative p-4 rounded-2xl border transition-all duration-200 flex flex-col items-start justify-between min-h-[105px] w-full text-left bg-[#FAF9F6] dark:bg-[#121211] active:scale-[0.97] ${
                              showTarget 
                                ? "border-slate-300 dark:border-zinc-700 shadow-sm" 
                                : "border-slate-200/60 dark:border-zinc-800/60 opacity-60 hover:opacity-80"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                                showTarget
                                  ? "bg-slate-900 dark:bg-zinc-800"
                                  : "bg-slate-100 dark:bg-zinc-900"
                              }`}>
                                <Target className={`h-4.5 w-4.5 transition-colors ${showTarget ? "text-[#FFD551]" : "text-slate-400 dark:text-zinc-500"}`} />
                              </div>
                              <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out flex items-center ${
                                showTarget 
                                  ? "bg-emerald-500" 
                                  : "bg-slate-200 dark:bg-zinc-855"
                              }`}>
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                                  showTarget ? "translate-x-4" : "translate-x-0"
                                }`} />
                              </div>
                            </div>
                            <div className="mt-3">
                              <p className="text-[11px] font-black tracking-wide text-slate-800 dark:text-zinc-200 uppercase leading-none">
                                Target Donasi
                              </p>
                              <span className={`inline-block mt-1 text-[8px] font-extrabold tracking-wider transition-colors uppercase leading-none ${
                                showTarget
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-slate-400 dark:text-zinc-500"
                              }`}>
                                {showTarget ? "Aktif" : "Nonaktif"}
                              </span>
                            </div>
                          </button>

                          {/* 2. Antrean Mabar */}
                          <button
                            type="button"
                            onClick={() => setShowQueue(!showQueue)}
                            className={`group relative p-4 rounded-2xl border transition-all duration-200 flex flex-col items-start justify-between min-h-[105px] w-full text-left bg-[#FAF9F6] dark:bg-[#121211] active:scale-[0.97] ${
                              showQueue 
                                ? "border-slate-300 dark:border-zinc-700 shadow-sm" 
                                : "border-slate-200/60 dark:border-zinc-800/60 opacity-60 hover:opacity-80"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                                showQueue
                                  ? "bg-slate-900 dark:bg-zinc-800"
                                  : "bg-slate-100 dark:bg-zinc-900"
                              }`}>
                                <Zap className={`h-4.5 w-4.5 transition-colors ${showQueue ? "text-[#FFD551]" : "text-slate-400 dark:text-zinc-500"}`} />
                              </div>
                              <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out flex items-center ${
                                showQueue 
                                  ? "bg-emerald-500" 
                                  : "bg-slate-200 dark:bg-zinc-855"
                              }`}>
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                                  showQueue ? "translate-x-4" : "translate-x-0"
                                }`} />
                              </div>
                            </div>
                            <div className="mt-3">
                              <p className="text-[11px] font-black tracking-wide text-slate-800 dark:text-zinc-200 uppercase leading-none">
                                Antrean Mabar
                              </p>
                              <span className={`inline-block mt-1 text-[8px] font-extrabold tracking-wider transition-colors uppercase leading-none ${
                                showQueue
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-slate-400 dark:text-zinc-500"
                              }`}>
                                {showQueue ? "Aktif" : "Nonaktif"}
                              </span>
                            </div>
                          </button>

                          {/* 3. Ulasan Donatur */}
                          <button
                            type="button"
                            onClick={() => setShowReviews(!showReviews)}
                            className={`group relative p-4 rounded-2xl border transition-all duration-200 flex flex-col items-start justify-between min-h-[105px] w-full text-left bg-[#FAF9F6] dark:bg-[#121211] active:scale-[0.97] ${
                              showReviews 
                                ? "border-slate-300 dark:border-zinc-700 shadow-sm" 
                                : "border-slate-200/60 dark:border-zinc-800/60 opacity-60 hover:opacity-80"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                                showReviews
                                  ? "bg-slate-900 dark:bg-zinc-800"
                                  : "bg-slate-100 dark:bg-zinc-900"
                              }`}>
                                <Star className={`h-4.5 w-4.5 transition-colors ${showReviews ? "text-[#FFD551]" : "text-slate-400 dark:text-zinc-655"}`} />
                              </div>
                              <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out flex items-center ${
                                showReviews 
                                  ? "bg-emerald-500" 
                                  : "bg-slate-200 dark:bg-zinc-855"
                              }`}>
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                                  showReviews ? "translate-x-4" : "translate-x-0"
                                }`} />
                              </div>
                            </div>
                            <div className="mt-3">
                              <p className="text-[11px] font-black tracking-wide text-slate-800 dark:text-zinc-200 uppercase leading-none">
                                Ulasan Donatur
                              </p>
                              <span className={`inline-block mt-1 text-[8px] font-extrabold tracking-wider transition-colors uppercase leading-none ${
                                showReviews
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-slate-400 dark:text-zinc-500"
                              }`}>
                                {showReviews ? "Aktif" : "Nonaktif"}
                              </span>
                            </div>
                          </button>

                          {/* 4. Jadwal Live */}
                          <button
                            type="button"
                            onClick={() => setShowCalendar(!showCalendar)}
                            className={`group relative p-4 rounded-2xl border transition-all duration-200 flex flex-col items-start justify-between min-h-[105px] w-full text-left bg-[#FAF9F6] dark:bg-[#121211] active:scale-[0.97] ${
                              showCalendar 
                                ? "border-slate-300 dark:border-zinc-700 shadow-sm" 
                                : "border-slate-200/60 dark:border-zinc-800/60 opacity-60 hover:opacity-80"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                                showCalendar
                                  ? "bg-slate-900 dark:bg-zinc-800"
                                  : "bg-slate-100 dark:bg-zinc-900"
                              }`}>
                                <Calendar className={`h-4.5 w-4.5 transition-colors ${showCalendar ? "text-[#FFD551]" : "text-slate-400 dark:text-zinc-655"}`} />
                              </div>
                              <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out flex items-center ${
                                showCalendar 
                                  ? "bg-emerald-500" 
                                  : "bg-slate-200 dark:bg-zinc-855"
                              }`}>
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                                  showCalendar ? "translate-x-4" : "translate-x-0"
                                }`} />
                              </div>
                            </div>
                            <div className="mt-3">
                              <p className="text-[11px] font-black tracking-wide text-slate-800 dark:text-zinc-200 uppercase leading-none">
                                Jadwal Live
                              </p>
                              <span className={`inline-block mt-1 text-[8px] font-extrabold tracking-wider transition-colors uppercase leading-none ${
                                showCalendar
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-slate-400 dark:text-zinc-500"
                              }`}>
                                {showCalendar ? "Aktif" : "Nonaktif"}
                              </span>
                            </div>
                          </button>

                          {/* 5. Layanan & Jasa */}
                          <button
                            type="button"
                            onClick={() => setShowServices(!showServices)}
                            className={`group relative p-4 rounded-2xl border transition-all duration-200 flex flex-col items-start justify-between min-h-[105px] w-full text-left bg-[#FAF9F6] dark:bg-[#121211] active:scale-[0.97] ${
                              showServices 
                                ? "border-slate-300 dark:border-zinc-700 shadow-sm" 
                                : "border-slate-200/60 dark:border-zinc-800/60 opacity-60 hover:opacity-80"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                                showServices
                                  ? "bg-slate-900 dark:bg-zinc-800"
                                  : "bg-slate-100 dark:bg-zinc-900"
                              }`}>
                                <Gamepad2 className={`h-4.5 w-4.5 transition-colors ${showServices ? "text-[#FFD551]" : "text-slate-400 dark:text-zinc-655"}`} />
                              </div>
                              <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out flex items-center ${
                                showServices 
                                  ? "bg-emerald-500" 
                                  : "bg-slate-200 dark:bg-zinc-855"
                              }`}>
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                                  showServices ? "translate-x-4" : "translate-x-0"
                                }`} />
                              </div>
                            </div>
                            <div className="mt-3">
                              <p className="text-[11px] font-black tracking-wide text-slate-800 dark:text-zinc-200 uppercase leading-none">
                                Layanan & Jasa
                              </p>
                              <span className={`inline-block mt-1 text-[8px] font-extrabold tracking-wider transition-colors uppercase leading-none ${
                                showServices
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-slate-400 dark:text-zinc-500"
                              }`}>
                                {showServices ? "Aktif" : "Nonaktif"}
                              </span>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* 4. CUSTOM CTA BUTTON LABELS */}
                      <div className="border-t border-slate-100 dark:border-zinc-900 pt-6 space-y-4">
                        <Label className="font-black italic text-xs md:text-sm text-slate-500 dark:text-zinc-400 block">💬 Kustomisasi Teks Tombol Utama Profil</Label>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Support Button (Left) */}
                          <div className="p-4 rounded-2xl border border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-[#121211] space-y-3">
                            <Label className="font-black italic text-xs text-amber-500 flex items-center gap-1.5">
                              ❤️ Kustom Tombol Dukungan / Donasi
                            </Label>
                            
                            <div className="space-y-2">
                              <Label className="font-bold italic text-[11px] md:text-xs text-slate-400">Judul Tombol (Atas)</Label>
                              <Input 
                                type="text"
                                value={editSupportBtnTitle}
                                onChange={(e) => setEditSupportBtnTitle(e.target.value)}
                                placeholder="Contoh: KIRIM DUKUNGAN"
                                className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-[#FAF9F6] text-black text-xs md:text-sm dark:bg-[#1E1E1D] dark:text-white px-3"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="font-bold italic text-[11px] md:text-xs text-slate-400">Sub-judul Tombol (Bawah)</Label>
                              <Input 
                                type="text"
                                value={editSupportBtnSubtitle}
                                onChange={(e) => setEditSupportBtnSubtitle(e.target.value)}
                                placeholder="Contoh: (DONASI)"
                                className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-[#FAF9F6] text-black text-xs md:text-sm dark:bg-[#1E1E1D] dark:text-white px-3"
                              />
                            </div>
                          </div>

                          {/* Service Button (Right) */}
                          <div className={`p-4 rounded-2xl border border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-[#121211] space-y-3 transition-all ${!showServices ? "opacity-60" : ""}`}>
                            <div className="flex justify-between items-center">
                              <Label className="font-black italic text-xs text-[#FFD551] flex items-center gap-1.5">
                                🎮 Kustom Tombol Layanan / Jasa Mabar
                              </Label>
                              <button
                                type="button"
                                onClick={() => setShowServices(!showServices)}
                                className={`px-2 py-0.5 rounded-full text-[10px] md:text-xs font-black italic border transition-all active:scale-95 ${
                                  showServices 
                                    ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800/80 dark:text-emerald-400" 
                                    : "bg-slate-100 border-slate-200 text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-500"
                                }`}
                              >
                                {showServices ? "⚡ AKTIF" : "❌ NONAKTIF"}
                              </button>
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="font-bold italic text-[11px] md:text-xs text-slate-400">Judul Tombol (Atas)</Label>
                              <Input 
                                type="text"
                                value={editServiceBtnTitle}
                                onChange={(e) => setEditServiceBtnTitle(e.target.value)}
                                placeholder="Contoh: AJAK MAIN BARENG"
                                disabled={!showServices}
                                className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-[#FAF9F6] text-black text-xs md:text-sm dark:bg-[#1E1E1D] dark:text-white px-3 disabled:opacity-50"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="font-bold italic text-[11px] md:text-xs text-slate-400">Sub-judul Tombol (Bawah)</Label>
                              <Input 
                                type="text"
                                value={editServiceBtnSubtitle}
                                onChange={(e) => setEditServiceBtnSubtitle(e.target.value)}
                                placeholder="Contoh: (JASA MABAR)"
                                disabled={!showServices}
                                className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-[#FAF9F6] text-black text-xs md:text-sm dark:bg-[#1E1E1D] dark:text-white px-3 disabled:opacity-50"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button 
                          type="submit"
                          className="h-12 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black hover:bg-slate-900 dark:hover:bg-[#FFC83B] rounded-2xl font-black italic text-xs md:text-sm px-8 shadow-sm transition-all"
                        >
                          Simpan Perubahan Profil
                        </Button>
                      </div>

                    </form>
                  </CardContent>
                </Card>

                {showCalendar && (
                  <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
                    <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="font-black italic text-sm md:text-base tracking-wider text-black dark:text-[#FFD551] flex items-center gap-2">
                          📅 Kelola Jadwal Live Streaming
                        </CardTitle>
                        <CardDescription className="font-bold italic text-[11px] md:text-xs text-slate-400">
                          Tambahkan jadwal live streaming Anda agar penonton tahu kapan Anda akan online.
                        </CardDescription>
                      </div>
                      <Dialog open={isAddSchedOpen} onOpenChange={setIsAddSchedOpen}>
                        <DialogTrigger 
                          render={
                            <Button className="h-9 bg-[#FFD551] text-black hover:bg-[#FFC83B] rounded-xl font-black italic text-xs gap-1.5 px-4">
                              <Plus className="h-3.5 w-3.5" /> Tambah Jadwal
                            </Button>
                          }
                        />
                        <DialogContent className="bg-white dark:bg-[#121211] border-2 border-black dark:border-zinc-800 rounded-2xl p-6 max-w-md">
                          <DialogHeader>
                            <DialogTitle className="font-black italic text-base text-black dark:text-white">📅 Tambah Jadwal Live Streaming Baru</DialogTitle>
                            <DialogDescription className="font-bold italic text-xs text-slate-400">Buat jadwal stream khusus Anda dengan tema bebas.</DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleAddSchedule} className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <Label className="font-black italic text-xs md:text-sm text-slate-500">Nama/Judul Live Stream</Label>
                              <Input 
                                type="text"
                                required
                                value={newSchedTitle}
                                onChange={(e) => setNewSchedTitle(e.target.value)}
                                placeholder="Contoh: Speed-Art & UX Review"
                                className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 text-xs md:text-sm text-black dark:text-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="font-black italic text-xs md:text-sm text-slate-500">Kategori / Topik Game</Label>
                              <Input 
                                type="text"
                                required
                                value={newSchedCategory}
                                onChange={(e) => setNewSchedCategory(e.target.value)}
                                placeholder="Contoh: Creative, Mobile Legends"
                                className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 text-xs md:text-sm text-black dark:text-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="font-black italic text-xs md:text-sm text-slate-500">Waktu & Tanggal Live</Label>
                              <Input 
                                type="datetime-local"
                                required
                                value={newSchedDate}
                                onChange={(e) => setNewSchedDate(e.target.value)}
                                className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 text-xs md:text-sm text-black dark:text-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="font-black italic text-xs md:text-sm text-slate-500">Deskripsi / Detail Misi</Label>
                              <textarea
                                rows={3}
                                value={newSchedDesc}
                                onChange={(e) => setNewSchedDesc(e.target.value)}
                                placeholder="Tulis rincian apa saja yang akan dimainkan..."
                                className="w-full border border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-[#1C1C1B] text-xs md:text-sm p-3 focus:outline-none focus:ring-1 focus:ring-[#FFD551] text-black dark:text-white"
                              />
                            </div>
                            <DialogFooter className="pt-2">
                              <Button type="submit" className="h-10 bg-[#FFD551] text-black hover:bg-[#FFC83B] rounded-xl font-black italic text-xs md:text-sm w-full">
                                Tambahkan Jadwal 🚀
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </CardHeader>
                    <CardContent className="p-0">
                      {schedules.length === 0 ? (
                        <div className="p-12 text-center text-xs md:text-sm font-bold text-slate-400 dark:text-zinc-500 italic">
                          Belum ada jadwal stream yang ditambahkan. Aktifkan dan tambahkan sekarang!
                        </div>
                      ) : (
                        <Table>
                          <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/20">
                            <TableRow className="border-b border-slate-100 dark:border-zinc-900">
                              <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-xs md:text-sm px-8">Kategori</TableHead>
                              <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-xs md:text-sm">Judul Live Stream</TableHead>
                              <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-xs md:text-sm">Waktu (WIB)</TableHead>
                              <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-xs md:text-sm text-right px-8">Aksi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {schedules.map((sched: any) => {
                              let dateStr = ""
                              try {
                                const d = new Date(sched.date)
                                dateStr = d.toLocaleDateString("id-ID", {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short"
                                }) + " - " + d.toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit"
                                }) + " WIB"
                              } catch (e) {
                                dateStr = sched.date
                              }

                              return (
                                <TableRow key={sched.id} className="border-b border-slate-100/60 dark:border-zinc-800/40">
                                  <TableCell className="font-black italic text-xs md:text-sm px-8">
                                    <Badge className="bg-[#FFD551]/10 text-black border border-black dark:text-[#FFD551] dark:border-[#FFD551]/30 font-black italic text-[10px] px-2 py-0.5 rounded-lg shrink-0">
                                      {sched.category}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="font-bold italic text-xs md:text-sm">
                                    <div>
                                      <p className="text-black dark:text-white leading-tight">{sched.title}</p>
                                      {sched.description && <p className="text-[11px] md:text-xs text-slate-400 font-medium italic truncate max-w-[200px] mt-0.5">{sched.description}</p>}
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-mono text-xs md:text-sm text-slate-500">{dateStr}</TableCell>
                                  <TableCell className="text-right px-8">
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      onClick={() => setConfirmDelete({type: 'schedule', id: sched.id, name: sched.title})}
                                      className="h-8 w-8 text-red-500 hover:bg-red-50 rounded-xl"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                )}

              </div>

              {/* RIGHT PANEL: LINK SHARING & TREETMI BRANDED QR CODE */}
              <div className="space-y-6">
                
                {/* 1. TREETMI.ID PUBLIC PROFILE SHARING */}
                <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
                  <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
                    <CardTitle className="font-black italic text-xs tracking-wider text-black dark:text-[#FFD551] flex items-center gap-2">
                      🔗 Tautan Halaman Dukungan
                    </CardTitle>
                    <CardDescription className="font-bold italic text-[9px] text-slate-400">
                      Bagikan link ini ke penonton stream atau pasang di media sosial Anda
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Label className="font-black italic text-[10px] text-slate-500">Link Publik Anda</Label>
                      <div className="flex gap-2">
                        <Input 
                          readOnly 
                          value={`${originUrl}/${profile?.username}`}
                          className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-[#FAF9F6] text-black text-xs flex-1 select-all dark:bg-[#1E1E1D] dark:text-white px-3"
                        />
                        
                        <Button 
                          onClick={() => {
                            navigator.clipboard.writeText(`${originUrl}/${profile?.username}`)
                            toast.success("Link halaman dukungan disalin!")
                          }}
                          size="icon"
                          className="h-10 w-10 bg-[#FFD551] text-black hover:bg-[#FFC83B] rounded-xl flex items-center justify-center shrink-0 border border-slate-200 dark:border-zinc-800"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <a 
                      href={`${originUrl}/${profile?.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center h-10 w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-zinc-900/50 dark:border-zinc-800/80 dark:hover:bg-zinc-800/60 rounded-xl text-[10px] font-black italic uppercase tracking-wider text-slate-600 dark:text-[#EAE9E4]/80 transition-all gap-1.5"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Lihat Tampilan Publik Profil
                    </a>
                  </CardContent>
                </Card>

                {/* 2. HIGH-FIDELITY TREETMI BRANDED OBS QR CODE */}
                <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
                  <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
                    <CardTitle className="font-black italic text-xs tracking-wider text-black dark:text-[#FFD551] flex items-center gap-2">
                      📢 QR Code Dukungan OBS
                    </CardTitle>
                    <CardDescription className="font-bold italic text-[9px] text-slate-400">
                      Tampilkan QR Code premium ini langsung di overlay OBS saat live stream agar fans mudah berdonasi!
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 flex flex-col items-center space-y-6">
                    
                    {/* Visual QR Container */}
                    <div className="relative p-4 bg-[#FFD551] rounded-2xl shadow-md border-2 border-black max-w-[200px] aspect-square flex items-center justify-center select-none overflow-hidden">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=0b0b0a&bgcolor=ffd551&data=${encodeURIComponent(`${originUrl}/${profile?.username}`)}`}
                        alt={`QR Code @${profile?.username}`}
                        className="w-full h-full object-contain rounded-2xl"
                      />
                    </div>

                    <div className="text-center space-y-1.5">
                      <h4 className="text-xs font-black uppercase italic tracking-wider text-black dark:text-white">QR Code Premium @{profile?.username}</h4>
                      <p className="text-[11px] font-medium text-slate-400 italic max-w-[220px] leading-normal">
                        Didesain khusus dengan kontras warna Treetmi untuk OBS. Scan QR langsung menuju form pembayaran instan!
                      </p>
                    </div>

                    <Button 
                      onClick={handleDownloadQRCode}
                      className="h-11 w-full bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black hover:bg-slate-900 dark:hover:bg-[#FFC83B] rounded-xl font-black italic text-[10px] uppercase tracking-wider gap-1.5 shadow-sm transition-all"
                    >
                      <Download className="h-4 w-4" /> Unduh Gambar QR Code (.PNG)
                    </Button>

                  </CardContent>
                </Card>

              </div>

            </div>
          )}

          {profileSubTab === "tickets" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm dark:bg-[#121211] dark:border-zinc-800/80">
                <div>
                  <h2 className="text-sm md:text-base font-black italic tracking-widest flex items-center gap-2">
                    🎫 Tiket Bantuan & Pengaduan
                  </h2>
                  <p className="text-[11px] md:text-xs font-bold text-slate-400 italic mt-0.5">
                    Ajukan perubahan rekening atau laporkan kendala pencairan dana langsung ke admin.
                  </p>
                </div>

                <Dialog open={isCreateTicketOpen} onOpenChange={setIsCreateTicketOpen}>
                  <DialogTrigger
                    render={
                      <Button className="bg-[#FFD551] text-black border border-slate-200 dark:border-zinc-800 hover:bg-[#FFC83B] text-xs md:text-sm font-black italic h-10 px-5 rounded-2xl shadow-sm transition-all active:scale-95">
                        <Plus className="mr-2 h-4 w-4" /> Buka Tiket Baru
                      </Button>
                    }
                  />
                  <DialogContent className="max-w-md bg-[#F8F7F3] dark:bg-[#121211] rounded-2xl border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl">
                    <DialogHeader className="space-y-1 text-center">
                      <DialogTitle className="text-2xl font-black italic tracking-tighter flex items-center justify-center gap-2 text-black dark:text-white">
                        🎫 Buka Tiket Bantuan Baru
                      </DialogTitle>
                      <DialogDescription className="font-bold italic text-[11px] md:text-xs text-slate-400 tracking-widest">
                        KIRIM PENGADUAN KE SUPERADMIN TREETMI
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateTicket} className="space-y-4 pt-4 text-[#1A1A19] dark:text-white">
                      <div className="space-y-2">
                        <Label className="font-black italic text-xs md:text-sm text-slate-500 dark:text-zinc-400">Kategori Tiket</Label>
                        <select
                          value={newTicketCategory}
                          onChange={(e) => setNewTicketCategory(e.target.value)}
                          className="w-full h-11 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 font-bold bg-white dark:bg-zinc-900 text-black dark:text-white text-xs md:text-sm outline-none"
                        >
                          <option value="BANK_CHANGE">Perubahan Rekening Bank (Locked)</option>
                          <option value="WITHDRAWAL_ISSUE">Kendala Penarikan Saldo</option>
                          <option value="OTHER">Lainnya / Masalah Teknis</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-black italic text-xs md:text-sm text-slate-500 dark:text-zinc-400">Subjek / Judul Tiket</Label>
                        <Input
                          required
                          placeholder="Contoh: Pengajuan Ubah Rekening BCA ke Mandiri"
                          value={newTicketTitle}
                          onChange={(e) => setNewTicketTitle(e.target.value)}
                          className="h-11 border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white text-xs md:text-sm font-bold"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-black italic text-xs md:text-sm text-slate-500 dark:text-zinc-400">Deskripsi / Detail Pesan</Label>
                        <textarea
                          required
                          rows={4}
                          placeholder="Tuliskan detail perubahan rekening atau kendala yang Anda alami secara lengkap..."
                          value={newTicketMessage}
                          onChange={(e) => setNewTicketMessage(e.target.value)}
                          className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white text-xs md:text-sm p-3 focus:outline-none focus:ring-1 focus:ring-[#FFD551] leading-relaxed resize-none"
                        />
                      </div>

                      <DialogFooter className="pt-4">
                        <Button type="submit" className="w-full h-12 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black rounded-2xl font-black italic text-xs md:text-sm transition-all shadow-md">
                          Kirim Tiket Bantuan
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
                <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
                  <CardTitle className="font-black italic text-sm md:text-base tracking-wider text-black dark:text-[#FFD551]">
                    🎫 Riwayat Tiket Bantuan Anda
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {tickets.length === 0 ? (
                    <div className="p-12 text-center text-xs md:text-sm font-bold text-slate-400 dark:text-zinc-500 italic">
                      Belum ada tiket bantuan yang diajukan.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/20">
                        <TableRow className="border-b border-slate-100 dark:border-zinc-900">
                          <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-xs md:text-sm px-8">ID Tiket</TableHead>
                          <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-xs md:text-sm">Judul Tiket</TableHead>
                          <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-xs md:text-sm">Kategori</TableHead>
                          <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-xs md:text-sm">Tanggal</TableHead>
                          <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-xs md:text-sm">Status</TableHead>
                          <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-xs md:text-sm text-right px-8">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tickets.map((t) => (
                          <TableRow key={t.id} className="border-b border-slate-100/60 dark:border-zinc-800/40 hover:bg-slate-50/30">
                            <TableCell className="font-mono font-bold text-xs md:text-sm px-8">#{t.id.substring(0, 8).toUpperCase()}</TableCell>
                            <TableCell className="font-bold italic text-xs md:text-sm text-black dark:text-white">{t.subject}</TableCell>
                            <TableCell>
                              <Badge className="bg-slate-50 text-slate-600 dark:bg-zinc-900 dark:text-zinc-400 border border-slate-200/50 dark:border-zinc-800/50 font-black italic text-[10px] rounded-lg px-2.5 py-0.5">
                                {t.category === "BANK_CHANGE" ? "Ubah Rekening" : t.category === "WITHDRAWAL_ISSUE" ? "Kendala Withdrawal" : "Lainnya"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs md:text-sm font-bold text-slate-400 italic">
                              {new Date(t.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                t.status === "OPEN"
                                  ? "bg-blue-50 text-blue-600 border border-blue-200/40 font-black italic text-[10px] rounded-lg px-2.5 py-0.5"
                                  : t.status === "DI_BACA"
                                    ? "bg-amber-50 text-amber-600 border border-amber-200/40 font-black italic text-[10px] rounded-lg px-2.5 py-0.5"
                                    : "bg-green-50 text-green-600 border border-green-200/40 font-black italic text-[10px] rounded-lg px-2.5 py-0.5"
                              }>
                                {t.status === "OPEN" ? "TERKIRIM" : t.status === "DI_BACA" ? "DIBACA ADMIN" : "DIJAWAB ADMIN"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right px-8">
                              <Button
                                size="xs"
                                onClick={() => setSelectedTicket(t)}
                                className="h-8 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black hover:bg-slate-900 rounded-xl font-black italic text-[10px] md:text-xs px-3.5 shadow-sm"
                              >
                                Detail Tiket
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Ticket Detail Modal */}
              {selectedTicket && (
                <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
                  <DialogContent className="max-w-md bg-[#F8F7F3] dark:bg-[#121211] rounded-2xl border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl">
                    <DialogHeader className="space-y-1">
                      <DialogTitle className="text-xl font-black italic tracking-tighter text-black dark:text-white">
                        Detail Tiket #{selectedTicket.id.substring(0, 8).toUpperCase()}
                      </DialogTitle>
                      <Badge className="w-fit bg-amber-500/10 text-amber-500 border-none font-black italic text-[10px] px-2.5 py-0.5">
                        {selectedTicket.category === "BANK_CHANGE" ? "Perubahan Rekening" : selectedTicket.category === "WITHDRAWAL_ISSUE" ? "Kendala Withdrawal" : "Lainnya"}
                      </Badge>
                    </DialogHeader>
                    <div className="space-y-4 mt-4 text-[#1A1A19] dark:text-white">
                      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800/80">
                        <h4 className="text-xs font-black italic text-slate-400">Judul Tiket</h4>
                        <p className="text-sm md:text-base font-bold mt-1 text-black dark:text-white">{selectedTicket.subject}</p>
                      </div>

                      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800/80">
                        <h4 className="text-xs font-black italic text-slate-400">Deskripsi Masalah</h4>
                        <p className="text-xs md:text-sm font-semibold leading-relaxed mt-1 text-slate-600 dark:text-zinc-300">{selectedTicket.description}</p>
                      </div>

                      <div className="bg-[#FFD551]/10 border border-[#FFD551]/30 p-4 rounded-2xl">
                        <h4 className="text-xs font-black italic text-amber-500">Tanggapan Admin Treetmi</h4>
                        <p className="text-xs md:text-sm font-bold leading-relaxed mt-1.5 text-black dark:text-white">
                          {selectedTicket.admin_reply ? selectedTicket.admin_reply : "⏳ Menunggu tanggapan dari tim Support Treetmi..."}
                        </p>
                      </div>

                      <Button 
                        onClick={() => setSelectedTicket(null)}
                        className="w-full h-11 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black rounded-xl font-black italic text-xs md:text-sm mt-2"
                      >
                        Tutup Detail
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}

          {profileSubTab === "verified" && (
            <div className="space-y-6">
              {profile?.is_verified ? (
                /* CASE 1: VERIFIED SUCCESSFULLY */
                <Card className="border-3 border-[#FFD551] rounded-2xl bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent dark:from-yellow-950/20 dark:to-transparent p-8 md:p-12 text-center relative overflow-hidden shadow-2xl">
                  {/* Decorative spark patterns */}
                  <div className="absolute -top-12 -left-12 w-48 h-48 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="max-w-xl mx-auto space-y-6 relative z-10 flex flex-col items-center">
                    <div className="h-24 w-24 rounded-full bg-amber-500/10 border-2 border-[#FFD551] flex items-center justify-center shadow-lg animate-bounce duration-1000">
                      <VerifiedBadge className="h-16 w-16" />
                    </div>
                    
                    <div className="space-y-2">
                      <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter text-black dark:text-[#FFD551] uppercase">Akun Anda Terverifikasi!</h2>
                      <p className="text-xs md:text-sm font-semibold text-slate-500 dark:text-zinc-400 leading-relaxed">
                        Selamat! Identitas Anda telah resmi divalidasi oleh sistem keamanan Treetmi. Lencana centang hijau kini aktif secara publik pada seluruh profil dan widget overlay Anda.
                      </p>
                    </div>

                    <div className="w-full bg-white dark:bg-[#1E1E1D]/55 border border-slate-200/60 dark:border-zinc-800 p-6 rounded-3xl text-left space-y-4 shadow-sm mt-4">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Saluran Media Sosial Terhubung</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-bold text-slate-700 dark:text-zinc-300">
                        {editYoutube && <div className="flex items-center gap-2">🟢 YouTube: <span className="text-slate-400 truncate max-w-[150px] font-semibold">{editYoutube}</span></div>}
                        {editTiktok && <div className="flex items-center gap-2">🟢 TikTok: <span className="text-slate-400 truncate max-w-[150px] font-semibold">{editTiktok}</span></div>}
                        {editInstagram && <div className="flex items-center gap-2">🟢 Instagram: <span className="text-slate-400 truncate max-w-[150px] font-semibold">{editInstagram}</span></div>}
                        {editTwitch && <div className="flex items-center gap-2">🟢 Twitch: <span className="text-slate-400 truncate max-w-[150px] font-semibold">{editTwitch}</span></div>}
                        {editFacebook && <div className="flex items-center gap-2">🟢 Facebook: <span className="text-slate-400 truncate max-w-[150px] font-semibold">{editFacebook}</span></div>}
                        {editDiscord && <div className="flex items-center gap-2">🟢 Discord: <span className="text-slate-400 truncate max-w-[150px] font-semibold">{editDiscord}</span></div>}
                      </div>
                    </div>
                  </div>
                </Card>
                  ) : profile?.verification_status === "PENDING" ? (
                /* CASE 2: PENDING - Waiting for admin review */
                <Card className="border-2 border-amber-500/50 rounded-2xl bg-gradient-to-br from-amber-500/5 via-transparent to-transparent dark:from-amber-950/10 dark:to-transparent p-8 md:p-12 text-center relative overflow-hidden shadow-lg">
                  <div className="max-w-xl mx-auto space-y-6 relative z-10 flex flex-col items-center">
                    <div className="h-20 w-20 rounded-full bg-amber-500/10 border-2 border-amber-400 flex items-center justify-center shadow-lg">
                      <span className="text-3xl">⏳</span>
                    </div>
                    
                    <div className="space-y-2">
                      <h2 className="text-xl md:text-2xl font-black italic tracking-tighter text-black dark:text-amber-400 uppercase">Menunggu Review Admin</h2>
                      <p className="text-xs md:text-sm font-semibold text-slate-500 dark:text-zinc-400 leading-relaxed">
                        Pengajuan verifikasi Anda sedang ditinjau oleh tim admin kami. Proses ini biasanya memakan waktu 1x24 jam kerja. Kami akan memeriksa bukti kepemilikan akun yang Anda kirimkan.
                      </p>
                    </div>

                    {profile?.verification_platform && (
                      <div className="w-full bg-white dark:bg-[#1E1E1D]/55 border border-slate-200/60 dark:border-zinc-800 p-5 rounded-2xl text-left space-y-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-400">Platform:</span>
                          <Badge className="bg-blue-50 text-blue-600 border border-blue-200/40 font-black italic text-xs px-3 py-0.5 rounded-lg">
                            {profile.verification_platform}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-400">Diajukan:</span>
                          <span className="text-xs font-bold text-slate-600 dark:text-zinc-300">
                            {profile.verification_submitted_at ? new Date(profile.verification_submitted_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ) : profile?.verification_status === "REJECTED" ? (
                /* CASE 2B: REJECTED - Can re-apply */
                <Card className="border-2 border-red-500/50 rounded-2xl bg-gradient-to-br from-red-500/5 via-transparent to-transparent dark:from-red-950/10 dark:to-transparent p-8 md:p-10 space-y-6">
                  <div className="border-b border-red-100 dark:border-zinc-900 pb-4">
                    <h3 className="font-extrabold text-base md:text-lg tracking-wide text-red-600 dark:text-red-400 flex items-center gap-2">
                      ❌ Verifikasi Ditolak
                    </h3>
                    <p className="font-semibold text-xs text-slate-500 dark:text-zinc-400 mt-1">
                      Pengajuan verifikasi Anda ditolak. Anda dapat mengajukan kembali dengan bukti yang lebih jelas.
                    </p>
                  </div>
                  {profile?.verification_reject_reason && (
                    <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-2xl">
                      <h4 className="text-xs font-black text-red-500 mb-1">Alasan Penolakan:</h4>
                      <p className="text-xs text-slate-600 dark:text-zinc-300 font-semibold">{profile.verification_reject_reason}</p>
                    </div>
                  )}
                  {/* Show re-apply form below */}
                  <VerificationForm />
                </Card>
              ) : (
                /* CASE 3: UNVERIFIED - Show Application Form */
                <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-lg bg-white dark:bg-[#121211] overflow-hidden p-8 md:p-10 space-y-6">
                  <div className="border-b border-slate-100 dark:border-zinc-900 pb-4">
                    <h3 className="font-extrabold text-base md:text-lg tracking-wide text-black dark:text-[#FFD551] flex items-center gap-2">
                      🌟 Ajukan Lencana Verified
                    </h3>
                    <p className="font-semibold text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      Upload bukti kepemilikan akun media sosial Anda. Tim admin akan meninjau dan menyetujui pengajuan Anda.
                    </p>
                  </div>

                  {!(editYoutube || editTiktok || editInstagram || editTwitch || editFacebook || editDiscord) ? (
                    /* CASE 3A: No Social Links Connected */
                    <div className="bg-red-500/5 dark:bg-red-950/10 border border-red-500/25 p-6 md:p-8 rounded-2xl text-center space-y-4">
                      <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-950/35 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto text-xl font-bold">⚠️</div>
                      <div className="space-y-1 max-w-lg mx-auto">
                        <h4 className="font-extrabold text-sm md:text-base text-red-700 dark:text-red-400">Belum Ada Media Sosial Terhubung</h4>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold leading-relaxed">
                          Untuk mengajukan Verified, Anda wajib memasang minimal satu tautan media sosial aktif di tab <strong>Edit Profil</strong> terlebih dahulu.
                        </p>
                      </div>
                      <Button
                        onClick={() => setProfileSubTab("edit")}
                        className="h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black italic text-xs md:text-sm px-6 border-none mt-2"
                      >
                        ✏️ Hubungkan Media Sosial Sekarang
                      </Button>
                    </div>
                  ) : (
                    <VerificationForm />
                  )}
                </Card>
              )}
            </div>
          )}
        </TabsContent>

          {/* TAB 5: INTEGRASI WIDGET OBS */}
          <TabsContent value="widget" className="space-y-6 outline-none">
            <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
              <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
                <CardTitle className="font-black italic text-sm md:text-base tracking-wider text-black dark:text-[#FFD551] flex items-center gap-2">
                  🔌 Konfigurasi Integrasi Widget OBS Studio
                </CardTitle>
                <CardDescription className="font-bold italic text-[11px] md:text-xs text-slate-400">
                  Hubungkan notifikasi donasi dan mabar Anda langsung ke OBS Studio sebagai Browser Source
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                {/* WIDGET CONFIGURATION HEADER & TOKEN RESET */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-zinc-900/30 border border-slate-100 dark:border-zinc-800 p-5 rounded-2xl">
                  <div>
                    <h4 className="text-xs md:text-sm font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                      🔑 Token Akses Widget Anda (Rahasia)
                    </h4>
                    <p className="text-[11px] md:text-xs font-bold text-slate-400 italic mt-0.5">
                      Token ini digunakan untuk men-generate semua URL Widget OBS di bawah.
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={handleResetToken}
                    className="h-10 border border-slate-200 text-red-500 rounded-xl font-black italic text-xs md:text-sm px-4 hover:bg-red-50 dark:border-zinc-800 active:scale-95 transition-all shrink-0"
                  >
                    <RefreshCw className="mr-2 h-3.5 w-3.5" /> Reset Token Keamanan
                  </Button>
                </div>

                {/* MULTI WIDGET CARDS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  
                  {/* CARD 1: ALERT OVERLAY */}
                  <div className="bg-white dark:bg-[#121211] border border-slate-200/80 dark:border-zinc-800/80 rounded-3xl p-6 space-y-4 hover:border-[#FFD551] dark:hover:border-[#FFD551] transition-colors relative group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-lg shadow-sm">
                        🔔
                      </div>
                      <div>
                        <h4 className="font-black italic text-xs md:text-sm text-black dark:text-white">🔔 Alert Overlay (Donasi & Mabar)</h4>
                        <span className="text-[10px] font-black tracking-widest text-slate-500 dark:text-zinc-400 uppercase bg-slate-100 dark:bg-zinc-800/80 px-2.5 py-0.5 rounded-md">
                          Rekomendasi OBS: 400 x 200px
                        </span>
                      </div>
                    </div>
                    <p className="text-xs md:text-sm font-bold text-slate-400 italic leading-relaxed">
                      Menampilkan notifikasi donasi biasa, order mabar, serta panggilan antrean mabar secara realtime dengan TTS & sound.
                    </p>
                    <div className="space-y-4 pt-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-400">🔗 Gabungan Alert URL (Bawaan)</Label>
                        <div className="flex gap-2">
                          <Input 
                            readOnly 
                            type="password"
                            value={`${originUrl}/widget/alert/${widgetToken}`} 
                            className="h-9 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 text-black text-xs flex-1 select-all dark:bg-[#1E1E1D] dark:text-white px-3 font-mono"
                          />
                          <Button 
                            onClick={() => {
                              navigator.clipboard.writeText(`${originUrl}/widget/alert/${widgetToken}`)
                              toast.success("Widget Gabungan Alert URL berhasil disalin!")
                            }}
                            className="h-9 bg-[#FFD551] text-black hover:bg-[#FFC83B] rounded-xl font-black italic text-[10px] px-4 shadow-sm active:scale-95 transition-all shrink-0 border-none"
                          >
                            Salin
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-400">🔗 Hanya Donasi & Mabar Alert URL (Terpisah)</Label>
                        <div className="flex gap-2">
                          <Input 
                            readOnly 
                            type="password"
                            value={`${originUrl}/widget/alert/${widgetToken}?excludeCall=true`} 
                            className="h-9 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 text-black text-xs flex-1 select-all dark:bg-[#1E1E1D] dark:text-white px-3 font-mono"
                          />
                          <Button 
                            onClick={() => {
                              navigator.clipboard.writeText(`${originUrl}/widget/alert/${widgetToken}?excludeCall=true`)
                              toast.success("Widget Donasi & Mabar Alert URL berhasil disalin!")
                            }}
                            className="h-9 bg-black hover:bg-zinc-900 text-[#FFD551] dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-[#FFD551] rounded-xl font-black italic text-[10px] px-4 shadow-sm active:scale-95 transition-all shrink-0 border-none"
                          >
                            Salin
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-400">🔗 Hanya Panggilan Mabar Alert URL (Terpisah)</Label>
                        <div className="flex gap-2">
                          <Input 
                            readOnly 
                            type="password"
                            value={`${originUrl}/widget/alert/${widgetToken}?onlyCall=true`} 
                            className="h-9 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 text-black text-xs flex-1 select-all dark:bg-[#1E1E1D] dark:text-white px-3 font-mono"
                          />
                          <Button 
                            onClick={() => {
                              navigator.clipboard.writeText(`${originUrl}/widget/alert/${widgetToken}?onlyCall=true`)
                              toast.success("Widget Panggilan Mabar Alert URL berhasil disalin!")
                            }}
                            className="h-9 bg-[#FFD551] text-black hover:bg-[#FFC83B] rounded-xl font-black italic text-[10px] px-4 shadow-sm active:scale-95 transition-all shrink-0 border-none"
                          >
                            Salin
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: MEDIASHARE OVERLAY */}
                  <div className="bg-white dark:bg-[#121211] border border-slate-200/80 dark:border-zinc-800/80 rounded-3xl p-6 space-y-4 hover:border-[#FFD551] dark:hover:border-[#FFD551] transition-colors relative group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-lg shadow-sm">
                        📺
                      </div>
                      <div>
                        <h4 className="font-black italic text-xs md:text-sm text-black dark:text-white">📺 Dedicated Mediashare Overlay</h4>
                        <span className="text-[10px] font-black tracking-widest text-slate-500 dark:text-zinc-400 uppercase bg-slate-100 dark:bg-zinc-800/80 px-2.5 py-0.5 rounded-md">
                          Rekomendasi OBS: 560 x 400px
                        </span>
                      </div>
                    </div>
                    <p className="text-xs md:text-sm font-bold text-slate-400 italic leading-relaxed">
                      Unified cyber-theme frame terintegrasi untuk video playback YouTube. Pesan, nominal & pengirim menyatu di bawah video.
                    </p>
                    <div className="space-y-1.5 pt-1">
                      <Label className="text-xs font-black uppercase text-slate-500 dark:text-zinc-400">URL Browser Source</Label>
                      <div className="flex gap-2">
                        <Input 
                          readOnly 
                          type="password"
                          value={`${originUrl}/widget/mediashare/${widgetToken}`} 
                          className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 text-black text-xs md:text-sm flex-1 select-all dark:bg-[#1E1E1D] dark:text-white px-3 font-mono"
                        />
                        <Button 
                          onClick={handleCopyMedia}
                          className="h-10 bg-[#FFD551] text-black border border-slate-200 dark:border-zinc-800 hover:bg-[#FFC83B] rounded-xl font-black italic text-xs md:text-sm px-5 shadow-sm active:scale-95 transition-all shrink-0"
                        >
                          {isCopiedMedia ? "Disalin!" : "Salin"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* CARD 3: QUEUE HUD CARD OVERLAY */}
                  <div className="bg-white dark:bg-[#121211] border border-slate-200/80 dark:border-zinc-800/80 rounded-3xl p-6 space-y-4 hover:border-[#FFD551] dark:hover:border-[#FFD551] transition-colors relative group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-lg shadow-sm">
                        🎮
                      </div>
                      <div>
                        <h4 className="font-black italic text-xs md:text-sm text-black dark:text-white">🎮 Antrian Mabar Overlay (HUD Card)</h4>
                        <span className="text-[10px] font-black tracking-widest text-slate-500 dark:text-zinc-400 uppercase bg-slate-100 dark:bg-zinc-800/80 px-2.5 py-0.5 rounded-md">
                          Rekomendasi OBS: 400 x 280px
                        </span>
                      </div>
                    </div>
                    <p className="text-xs md:text-sm font-bold text-slate-400 italic leading-relaxed">
                      Kartu info melayang (HUD Card) merah kedap-kedip di pojok kanan atas dengan sistem auto-hide interaktif 10 detik.
                    </p>
                    <div className="space-y-1.5 pt-1">
                      <Label className="text-xs font-black uppercase text-slate-500 dark:text-zinc-400">URL Browser Source</Label>
                      <div className="flex gap-2">
                        <Input 
                          readOnly 
                          type="password"
                          value={`${originUrl}/widget/queue/${widgetToken}`} 
                          className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 text-black text-xs md:text-sm flex-1 select-all dark:bg-[#1E1E1D] dark:text-white px-3 font-mono"
                        />
                        <Button 
                          onClick={handleCopyQueue}
                          className="h-10 bg-[#FFD551] text-black border border-slate-200 dark:border-zinc-800 hover:bg-[#FFC83B] rounded-xl font-black italic text-xs md:text-sm px-5 shadow-sm active:scale-95 transition-all shrink-0"
                        >
                          {isCopiedQueue ? "Disalin!" : "Salin"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* CARD 5: TARGET OVERLAY */}
                  <div className="bg-white dark:bg-[#121211] border border-slate-200/80 dark:border-zinc-800/80 rounded-3xl p-6 space-y-4 hover:border-[#FFD551] dark:hover:border-[#FFD551] transition-colors relative group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-sky-500/10 flex items-center justify-center text-lg shadow-sm">
                        🎯
                      </div>
                      <div>
                        <h4 className="font-black italic text-xs md:text-sm text-black dark:text-white">🎯 Target Donasi Overlay (Progress Bar)</h4>
                        <span className="text-[10px] font-black tracking-widest text-slate-500 dark:text-zinc-400 uppercase bg-slate-100 dark:bg-zinc-800/80 px-2.5 py-0.5 rounded-md">
                          Rekomendasi OBS: 380 x 120px
                        </span>
                      </div>
                    </div>
                    <p className="text-xs md:text-sm font-bold text-slate-400 italic leading-relaxed">
                      Menampilkan progress bar visual pencapaian target donasi aktif Anda beserta nominal terkumpul vs target secara estetik.
                    </p>
                    <div className="space-y-1.5 pt-1">
                      <Label className="text-xs font-black uppercase text-slate-500 dark:text-zinc-400">URL Browser Source</Label>
                      <div className="flex gap-2">
                        <Input 
                          readOnly 
                          type="password"
                          value={`${originUrl}/widget/target/${widgetToken}`} 
                          className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 text-black text-xs md:text-sm flex-1 select-all dark:bg-[#1E1E1D] dark:text-white px-3 font-mono"
                        />
                        <Button 
                          onClick={handleCopyTarget}
                          className="h-10 bg-[#FFD551] text-black border border-slate-200 dark:border-zinc-800 hover:bg-[#FFC83B] rounded-xl font-black italic text-xs md:text-sm px-5 shadow-sm active:scale-95 transition-all shrink-0"
                        >
                          {isCopiedTarget ? "Disalin!" : "Salin"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* CARD 4A: TOP SULTAN LEADERBOARD OVERLAY (TABLE MODE) */}
                  <div className="bg-white dark:bg-[#121211] border border-slate-200/80 dark:border-zinc-800/80 rounded-3xl p-6 space-y-4 hover:border-[#FFD551] dark:hover:border-[#FFD551] transition-colors relative group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-lg shadow-sm">
                        🏆
                      </div>
                      <div>
                        <h4 className="font-black italic text-xs md:text-sm text-black dark:text-white">🏆 Top Sultan Leaderboard Overlay (Table)</h4>
                        <span className="text-[10px] font-black tracking-widest text-slate-500 dark:text-zinc-400 uppercase bg-slate-100 dark:bg-zinc-800/80 px-2.5 py-0.5 rounded-md">
                          Rekomendasi OBS: 460 x 500px
                        </span>
                      </div>
                    </div>
                    <p className="text-xs md:text-sm font-bold text-slate-400 italic leading-relaxed">
                      Tabel daftar donatur teratas dengan akumulasi nominal, lencana trofi podium juara, serta saringan nama & periode kustom.
                    </p>

                    {/* CUSTOMIZER CONTROLS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-[#1C1C1B] rounded-2xl border border-slate-200/40 dark:border-zinc-800/50">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-400">✏️ Judul Widget</Label>
                        <Input 
                          placeholder="Masukkan judul (ex: TOP DONATUR)" 
                          value={customDonorsTitle} 
                          onChange={(e) => setCustomDonorsTitle(e.target.value)}
                          className="h-8.5 text-xs rounded-xl bg-white dark:bg-[#121211] border border-slate-200 dark:border-zinc-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-400">📅 Saring Periode</Label>
                        <select 
                          value={customDonorsPeriod} 
                          onChange={(e) => setCustomDonorsPeriod(e.target.value)}
                          className="w-full h-8.5 text-xs rounded-xl bg-white dark:bg-[#121211] border border-slate-200 dark:border-zinc-800 px-2 font-bold focus:outline-none dark:text-white"
                        >
                          <option value="all">Semua Waktu (All Time)</option>
                          <option value="weekly">Minggu Ini (Calendar Week)</option>
                          <option value="monthly">Bulan Ini (Calendar Month)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <Label className="text-xs font-black uppercase text-slate-500 dark:text-zinc-400">URL Browser Source</Label>
                      <div className="flex gap-2">
                        <Input 
                          readOnly 
                          type="password"
                          value={`${originUrl}/widget/donors/${widgetToken}?mode=table${customDonorsTitle.trim() ? `&title=${encodeURIComponent(customDonorsTitle.trim())}` : ""}${customDonorsPeriod !== "all" ? `&period=${customDonorsPeriod}` : ""}`} 
                          className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 text-black text-xs md:text-sm flex-1 select-all dark:bg-[#1E1E1D] dark:text-white px-3 font-mono"
                        />
                        <Button 
                          onClick={() => handleCopyDonors("table")}
                          className="h-10 bg-[#FFD551] text-black border border-slate-200 dark:border-zinc-800 hover:bg-[#FFC83B] rounded-xl font-black italic text-xs md:text-sm px-5 shadow-sm active:scale-95 transition-all shrink-0"
                        >
                          {isCopiedDonors ? "Disalin!" : "Salin"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* CARD 4B: RECENT DONORS TICKER OVERLAY (TICKER MODE) */}
                  <div className="bg-white dark:bg-[#121211] border border-slate-200/80 dark:border-zinc-800/80 rounded-3xl p-6 space-y-4 hover:border-[#FFD551] dark:hover:border-[#FFD551] transition-colors relative group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-lg shadow-sm">
                        🏃
                      </div>
                      <div>
                        <h4 className="font-black italic text-xs md:text-sm text-black dark:text-white">🏃 Donors Marquee Ticker (Running Text)</h4>
                        <span className="text-[10px] font-black tracking-widest text-slate-500 dark:text-zinc-400 uppercase bg-slate-100 dark:bg-zinc-800/80 px-2.5 py-0.5 rounded-md">
                          Rekomendasi OBS: 1920 x 60px
                        </span>
                      </div>
                    </div>
                    <p className="text-xs md:text-sm font-bold text-slate-400 italic leading-relaxed">
                      Teks berjalan horizontal (marquee ticker) menampilkan riwayat nama donatur sukses terbaru secara realtime.
                    </p>

                    {/* CUSTOMIZER CONTROLS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-[#1C1C1B] rounded-2xl border border-slate-200/40 dark:border-zinc-800/50">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-400">✏️ Judul Widget</Label>
                        <Input 
                          placeholder="Masukkan judul (ex: DONASI MINGGU INI)" 
                          value={customTickerTitle} 
                          onChange={(e) => setCustomTickerTitle(e.target.value)}
                          className="h-8.5 text-xs rounded-xl bg-white dark:bg-[#121211] border border-slate-200 dark:border-zinc-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-400">📅 Saring Periode</Label>
                        <select 
                          value={customTickerPeriod} 
                          onChange={(e) => setCustomTickerPeriod(e.target.value)}
                          className="w-full h-8.5 text-xs rounded-xl bg-white dark:bg-[#121211] border border-slate-200 dark:border-zinc-800 px-2 font-bold focus:outline-none dark:text-white"
                        >
                          <option value="all">Semua Waktu (All Time)</option>
                          <option value="weekly">Minggu Ini (Calendar Week)</option>
                          <option value="monthly">Bulan Ini (Calendar Month)</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 pt-1">
                      <Label className="text-xs font-black uppercase text-slate-500 dark:text-zinc-400">URL Browser Source</Label>
                      <div className="flex gap-2">
                        <Input 
                          readOnly 
                          type="password"
                          value={`${originUrl}/widget/donors/${widgetToken}?mode=ticker${customTickerTitle.trim() ? `&title=${encodeURIComponent(customTickerTitle.trim())}` : ""}${customTickerPeriod !== "all" ? `&period=${customTickerPeriod}` : ""}`} 
                          className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 text-black text-xs md:text-sm flex-1 select-all dark:bg-[#1E1E1D] dark:text-white px-3 font-mono"
                        />
                        <Button 
                          onClick={() => handleCopyDonors("ticker")}
                          className="h-10 bg-[#FFD551] text-black border border-slate-200 dark:border-zinc-800 hover:bg-[#FFC83B] rounded-xl font-black italic text-xs md:text-sm px-5 shadow-sm active:scale-95 transition-all shrink-0"
                        >
                          {isCopiedDonors ? "Disalin!" : "Salin"}
                        </Button>
                      </div>
                    </div>
                  </div>

                </div>


                {/* OBS INSTRUCTIONS */}
                <div className="border border-slate-200/80 bg-slate-50 dark:bg-zinc-900/40 dark:border-zinc-800/80 rounded-2xl p-8 space-y-6 shadow-inner">
                  <h3 className="text-sm font-black italic tracking-wider flex items-center gap-2 text-black dark:text-[#FFD551]">
                    <ShieldCheck className="h-5 w-5 text-emerald-500 animate-pulse" /> 🚀 Panduan Memasang Widget di OBS Studio (Ukuran Diperbesar):
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      {
                        step: "1",
                        text: (
                          <>
                            Klik tombol <strong className="text-black dark:text-white underline decoration-[#FFD551] decoration-2">Salin URL</strong> di atas untuk menyimpan tautan widget rahasia Anda ke clipboard.
                          </>
                        )
                      },
                      {
                        step: "2",
                        text: (
                          <>
                            Buka aplikasi <strong className="text-black dark:text-[#FFD551]">OBS Studio</strong> di PC atau laptop streaming Anda.
                          </>
                        )
                      },
                      {
                        step: "3",
                        text: (
                          <>
                            Pada panel <strong className="text-black dark:text-white">Sources (Sumber)</strong> di bagian bawah, klik ikon <code className="bg-[#FFD551] text-black px-1.5 py-0.5 rounded-lg font-black dark:text-black text-[11px]">+ (Tambah)</code> lalu pilih opsi <code className="bg-[#FFD551] text-black px-1.5 py-0.5 rounded-lg font-black dark:text-black text-[11px]">Browser (Peramban)</code>.
                          </>
                        )
                      },
                      {
                        step: "4",
                        text: (
                          <>
                            Beri nama sumber widget baru Anda agar rapi, contohnya: <code className="bg-[#FFD551] text-black px-2 py-0.5 rounded-lg font-black italic text-[11px] dark:text-black">Treetmi Alerts</code>.
                          </>
                        )
                      },
                      {
                        step: "5",
                        text: (
                          <>
                            Tempel/Paste URL widget Anda ke kolom <strong className="text-black dark:text-white">URL</strong> pada jendela pengaturan OBS.
                          </>
                        )
                      },
                      {
                        step: "6",
                        text: (
                          <>
                            Ubah resolusi ke layar penuh: Set lebar (<strong className="text-emerald-500">Width</strong>) ke <code className="bg-black text-[#FFD551] dark:bg-zinc-800 dark:text-[#FFD551] px-2 py-0.5 rounded-lg font-black text-xs">1920</code> dan tinggi (<strong className="text-emerald-500">Height</strong>) ke <code className="bg-black text-[#FFD551] dark:bg-zinc-800 dark:text-[#FFD551] px-2 py-0.5 rounded-lg font-black text-xs">1080</code>.
                          </>
                        )
                      },
                      {
                        step: "7",
                        text: (
                          <>
                            Centang opsi <strong className="text-black dark:text-white">Control audio via OBS</strong> untuk mengatur volume notifikasi TTS dan suara alert secara independen.
                          </>
                        )
                      },
                      {
                        step: "8",
                        text: (
                          <>
                            Klik <code className="bg-[#FFD551] text-black px-2 py-0.5 rounded-lg font-black dark:text-black text-[11px]">OK</code>. Selamat! Anda bisa langsung melakukan uji coba simulasi alert di <strong>Widget Studio</strong> untuk mendengarkan TTS & alert animasi visual!
                          </>
                        )
                      }
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-[#121211] border border-slate-100 dark:border-zinc-800/60 shadow-sm hover:scale-[1.01] transition-transform">
                        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black font-black italic text-xs shrink-0 shadow-sm">
                          {item.step}
                        </div>
                        <p className="text-xs md:text-sm font-semibold italic text-slate-500 dark:text-zinc-300 leading-relaxed pt-1">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: WIDGET STUDIO (triggered from header button) */}
          <TabsContent value="studio" className="outline-none">
            <WidgetStudio session={session} widgetToken={widgetToken} />
          </TabsContent>

        </Tabs>

      </div>

      {/* ─── EDIT PACKAGE DIALOG ─── */}
      <Dialog open={isEditPackageOpen} onOpenChange={setIsEditPackageOpen}>
        <DialogContent className="max-w-md bg-[#F8F7F3] dark:bg-[#121211] rounded-2xl border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl">
          <DialogHeader className="space-y-1 text-center">
            <DialogTitle className="text-2xl font-black italic tracking-tighter flex items-center justify-center gap-2 text-black dark:text-white">
              <Pencil className="h-6 w-6 text-[#FFD551]" /> 
              Edit Paket Jasa Mabar
            </DialogTitle>
            <DialogDescription className="font-bold italic text-[9px] text-slate-400 tracking-widest">
              PERBARUI DETAIL LAYANAN MABAR
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditPackage} className="space-y-4 pt-4 text-[#1A1A19] dark:text-white">
            <div className="space-y-2">
              <Label className="font-black italic text-xs text-slate-500 dark:text-zinc-400">Nama Layanan / Game</Label>
              <Input 
                required 
                placeholder="Nama layanan/game..." 
                value={editPkgName} 
                onChange={(e) => setEditPkgName(e.target.value)}
                className="h-11 border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-black italic text-xs text-slate-500 dark:text-zinc-400">Tarif / Harga Per Sesi Mabar (Rp)</Label>
              <Input 
                type="text" 
                required 
                placeholder="25.000" 
                value={formatNumberInput(editPkgPrice)} 
                onChange={(e) => setEditPkgPrice(String(parseNumberInput(e.target.value)))}
                className="h-11 border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full h-12 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black rounded-2xl font-black italic text-xs transition-all shadow-md">
                Simpan Perubahan Paket
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── EDIT PROJECT DIALOG ─── */}
      <Dialog open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
        <DialogContent className="max-w-md bg-[#F8F7F3] dark:bg-[#121211] rounded-2xl border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl">
          <DialogHeader className="space-y-1 text-center">
            <DialogTitle className="text-2xl font-black italic tracking-tighter flex items-center justify-center gap-2 text-black dark:text-white">
              <Pencil className="h-6 w-6 text-[#FFD551]" /> 
              Edit Proyek Digital
            </DialogTitle>
            <DialogDescription className="font-bold italic text-[9px] text-slate-400 tracking-widest">
              PERBARUI DETAIL PROYEK REWARD KREATIF
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditProject} className="space-y-4 pt-4 text-[#1A1A19] dark:text-white">
            <div className="space-y-2">
              <Label className="font-black italic text-xs text-slate-500 dark:text-zinc-400">Judul Proyek Digital</Label>
              <Input 
                required 
                placeholder="Judul proyek..." 
                value={editProjTitle} 
                onChange={(e) => setEditProjTitle(e.target.value)}
                className="h-11 border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-black italic text-xs text-slate-500 dark:text-zinc-400">Deskripsi Singkat Proyek</Label>
              <Input 
                placeholder="Deskripsi proyek..." 
                value={editProjDesc} 
                onChange={(e) => setEditProjDesc(e.target.value)}
                className="h-11 border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-black italic text-xs text-slate-500 dark:text-zinc-400">Tautan File Unduhan (Drive / GitHub / Figma)</Label>
              <Input 
                required 
                placeholder="https://drive.google.com/file/d/..." 
                value={editProjUrl} 
                onChange={(e) => setEditProjUrl(e.target.value)}
                className="h-11 border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-black italic text-xs text-slate-500 dark:text-zinc-400">Minimal Dukungan Donasi Unlocking (Rp)</Label>
              <Input 
                type="text" 
                required 
                placeholder="20.000" 
                value={formatNumberInput(editProjMinSupport)} 
                onChange={(e) => setEditProjMinSupport(String(parseNumberInput(e.target.value)))}
                className="h-11 border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full h-12 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black rounded-2xl font-black italic text-xs transition-all shadow-md">
                Simpan Perubahan Proyek
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── CONFIRM DELETE DIALOG ─── */}
      <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent className="max-w-sm bg-white dark:bg-[#121211] rounded-2xl border border-red-200 dark:border-red-900/50 p-8 shadow-2xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl font-black italic tracking-tighter text-red-600 flex items-center justify-center gap-2">
              <Trash2 className="h-6 w-6" /> Konfirmasi Hapus
            </DialogTitle>
            <DialogDescription className="font-bold text-sm text-slate-500 mt-2">
              Apakah Anda yakin ingin menghapus <strong className="text-black dark:text-white">"{confirmDelete?.name}"</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 pt-4">
            <Button 
              onClick={() => setConfirmDelete(null)}
              className="flex-1 h-11 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-black italic text-xs border-0 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Batal
            </Button>
            <Button 
              onClick={() => {
                if (!confirmDelete) return
                if (confirmDelete.type === 'package') handleDeletePackage(confirmDelete.id)
                else if (confirmDelete.type === 'project') handleDeleteProject(confirmDelete.id)
                else if (confirmDelete.type === 'schedule') handleDeleteSchedule(confirmDelete.id)
                setConfirmDelete(null)
              }}
              className="flex-1 h-11 bg-red-500 text-white hover:bg-red-600 rounded-xl font-black italic text-xs border-0 shadow-sm"
            >
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── GLOBAL WITHDRAWAL DIALOG ─── rendered at main level so it works from ANY tab */}
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="max-w-md bg-[#F8F7F3] dark:bg-[#121211] rounded-2xl border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl">
          <DialogHeader className="space-y-1 text-center">
            <DialogTitle className="text-2xl font-black italic tracking-tighter flex items-center justify-center gap-2 text-black dark:text-white">
              <Wallet className="h-6 w-6 text-[#FFD551]" /> Tarik Saldo Dompet
            </DialogTitle>
            <DialogDescription className="font-bold italic text-[9px] text-slate-400 tracking-widest">
              Penarikan Dana Instan ke Rekening Anda
            </DialogDescription>
          </DialogHeader>

          {/* Saldo info */}
          <div className="flex items-center justify-between bg-[#FFD551]/10 border border-[#FFD551]/30 rounded-2xl px-4 py-3 mt-2">
            <span className="text-[10px] font-black italic text-slate-500">Saldo Tersedia</span>
            <span className="text-lg font-black italic text-black dark:text-white">Rp {balance.toLocaleString("id-ID")}</span>
          </div>

          <form onSubmit={handleWithdrawSubmit} className="space-y-4 pt-2 text-[#1A1A19] dark:text-white">
            <div className="space-y-2">
              <Label className="font-black italic text-xs text-slate-500 dark:text-zinc-400">Nominal Penarikan (Rp)</Label>
              <Input 
                type="text" 
                required 
                placeholder="50.000" 
                value={formatNumberInput(withdrawAmount)} 
                onChange={(e) => setWithdrawAmount(String(parseNumberInput(e.target.value)))}
                className="h-11 border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-black italic text-xs text-slate-500 dark:text-zinc-400">Pilih Bank / E-Wallet</Label>
              <select 
                value={bankName}
                disabled={isBankLocked}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full h-11 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 font-bold bg-white dark:bg-zinc-900 text-black dark:text-white text-sm outline-none disabled:opacity-60"
              >
                <option value="BCA">BCA (Bank Central Asia)</option>
                <option value="Mandiri">Mandiri (Bank Mandiri)</option>
                <option value="BNI">BNI (Bank Negara Indonesia)</option>
                <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                <option value="GoPay">GoPay (E-Wallet)</option>
                <option value="OVO">OVO (E-Wallet)</option>
                <option value="Dana">Dana (E-Wallet)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="font-black italic text-xs text-slate-500 dark:text-zinc-400">Nomor Rekening / No. HP</Label>
              <Input 
                required 
                disabled={isBankLocked}
                placeholder="0812xxxx / 1234567890" 
                value={bankNumber} 
                onChange={(e) => setBankNumber(e.target.value)}
                className="h-11 border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551] disabled:opacity-60"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-black italic text-xs text-slate-500 dark:text-zinc-400">Nama Pemilik Rekening</Label>
              <Input 
                required 
                disabled={isBankLocked}
                placeholder="Budi Saputra" 
                value={bankHolder} 
                onChange={(e) => setBankHolder(e.target.value)}
                className="h-11 border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551] disabled:opacity-60"
              />
            </div>
            {isBankLocked && (
              <p className="text-[9px] font-black italic text-red-500 tracking-wide bg-red-500/10 p-2.5 rounded-xl border border-red-500/20 leading-normal">
                🔒 Rekening Payout Anda terkunci. Penarikan akan diproses secara aman ke rekening terdaftar di atas. Hubungi bantuan jika ingin merubahnya.
              </p>
            )}
            <p className="text-[9px] font-bold text-slate-400 italic">
              ⚡ Minimal penarikan Rp 50.000. Proses transfer 1–2 hari kerja.
            </p>
            <DialogFooter className="pt-2">
              <Button type="submit" className="w-full h-12 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black hover:bg-slate-900 dark:hover:bg-[#FFC83B] rounded-2xl font-black italic text-xs transition-all shadow-md">
                Ajukan Penarikan Dana
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Galeri Avatar Kreator Master */}
      <AnimatePresence>
        {isAvatarModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            {/* Backdrop Closer */}
            <div className="absolute inset-0" onClick={() => setIsAvatarModalOpen(false)} />
            
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#121211] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl z-10 flex flex-col max-h-[85vh] overflow-hidden text-slate-800 dark:text-[#EAE9E4]"
            >
              {/* Header */}
              <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-zinc-900">
                <div className="space-y-1 text-left">
                  <h3 className="text-base md:text-lg font-black italic tracking-tighter text-black dark:text-white flex items-center gap-2">
                    🎨 Pilih Avatar Kreator Master
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-widest italic leading-none">
                    PILIH MASKOT DEFAULT PREMIUM TREETMI
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(false)}
                  className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              </div>

              {/* Content Grid */}
              <div className="py-6 grid grid-cols-4 gap-4">
                {masterAvatars.map((av: any) => {
                  const isActive = profile?.avatar_url === av.url;
                  return (
                    <div 
                      key={av.id}
                      onClick={() => {
                        handleSelectAvatar(av.url)
                        setIsAvatarModalOpen(false)
                        toast.success("Avatar berhasil diganti! 🎉")
                      }}
                      className={`relative aspect-square rounded-2xl overflow-hidden border-3 cursor-pointer active:scale-95 transition-all shadow-sm group ${
                        isActive 
                          ? "border-[#FFD551] shadow-[0_0_15px_rgba(255,213,81,0.25)]" 
                          : "border-transparent hover:border-slate-200 dark:hover:border-zinc-700"
                      }`}
                    >
                      <img 
                        src={av.url} 
                        alt={av.name} 
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Glow on hover */}
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {/* Active badge indicator */}
                      {isActive && (
                        <div className="absolute -bottom-0.5 -right-0.5 bg-[#FFD551] text-black rounded-tl-xl p-1 shadow-sm border-t border-l border-white dark:border-[#121211]">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-zinc-900 flex justify-end">
                <Button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(false)}
                  className="bg-black text-[#FFD551] border border-black dark:border-white font-black italic text-xs uppercase tracking-wider h-10 px-5 rounded-xl hover:bg-slate-900 transition-all"
                >
                  Tutup Galeri
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>

  )
}
