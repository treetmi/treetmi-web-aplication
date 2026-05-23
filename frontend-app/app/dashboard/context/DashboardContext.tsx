"use client"
import React, { createContext, useContext, useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { API_BASE_URL, fetchWithRetry } from "@/lib/api"
import { toast } from "sonner"
import { useCurrency } from "@/components/currency-provider"

const DashboardContext = createContext<any>(null)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { format, convertFromIdr } = useCurrency()

  const API_BASE = API_BASE_URL

  // State Declarations
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

  // Active Tab State (Maintained for backward compatible storage check)
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

  // Profile Settings Form
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
  const [feeGift, setFeeGift] = useState(10)
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
  
  // Real Database Lists
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
  
  const [packages, setPackages] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [queues, setQueues] = useState<any[]>([])
  const [selectedActiveIds, setSelectedActiveIds] = useState<string[]>([])
  const [selectedPendingIds, setSelectedPendingIds] = useState<string[]>([])
  const [projects, setProjects] = useState<any[]>([])

  // Modal & Form Toggle States
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const [isAddPackageOpen, setIsAddPackageOpen] = useState(false)
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{type: 'package' | 'project' | 'schedule', id: string, name: string} | null>(null)
  
  // Editing States
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
  
  // Withdraw Payout Form
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [bankName, setBankName] = useState("BCA")
  const [bankNumber, setBankNumber] = useState("")
  const [bankHolder, setBankHolder] = useState("")

  // Form Package Game
  const [selectedGame, setSelectedGame] = useState("")
  const [newPkgName, setNewPkgName] = useState("")
  const [newPkgPrice, setNewPkgPrice] = useState("")
  const [newPkgDesc, setNewPkgDesc] = useState("")

  // Form Project
  const [newProjTitle, setNewProjTitle] = useState("")
  const [newProjDesc, setNewProjDesc] = useState("")
  const [newProjUrl, setNewProjUrl] = useState("")
  const [newProjMinSupport, setNewProjMinSupport] = useState("")

  // Finance DataTable states
  const [financeSubTab, setFinanceSubTab] = useState<"income" | "payout">("income")
  const [financeFilter, setFinanceFilter] = useState<"SEMUA" | "DONATION" | "MABAR">("SEMUA")
  const [financePage, setFinancePage] = useState(1)

  // Bank Lock & Support Ticket
  const [isBankLocked, setIsBankLocked] = useState(false)
  const [tickets, setTickets] = useState<any[]>([])
  const [newTicketTitle, setNewTicketTitle] = useState("")
  const [newTicketMessage, setNewTicketMessage] = useState("")
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null)
  const [newTicketCategory, setNewTicketCategory] = useState("BANK_CHANGE")

  // Fetch all dashboard data from API
  const fetchDashboardData = async () => {
    if (!session?.user?.name) return
    try {
      // Platform Fee settings
      try {
        const settingsRes = await fetchWithRetry(`${API_BASE}/users/settings/public`)
        const settingsJson = await settingsRes.json()
        if (settingsJson.success && settingsJson.data) {
          setFeeDonation(settingsJson.data.feeDonation !== undefined ? parseFloat(settingsJson.data.feeDonation) : 5)
          setFeeMabar(settingsJson.data.feeMabar !== undefined ? parseFloat(settingsJson.data.feeMabar) : 8)
          setFeeGift(settingsJson.data.feeGift !== undefined ? parseFloat(settingsJson.data.feeGift) : 10)
        }
      } catch (err) {
        console.error("Gagal mengambil pengaturan fee platform:", err)
      }

      // Get Profile
      const profileRes = await fetchWithRetry(`${API_BASE}/users/profile/${session.user.name}`)
      const profileJson = await profileRes.json()
      
      if (profileJson.success && profileJson.data) {
        const uData = profileJson.data
        setProfile(uData)
        setBalance(Number(uData.balance))

        // Verification Countdown Timer
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
        
        // Role normalize
        const currentRole = uData.role_title || "GAMER"
        setRole(currentRole)

        // Populate settings input
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

        // Game packages
        const pkgRes = await fetchWithRetry(`${API_BASE}/games/packages/${uData.id}`)
        const pkgJson = await pkgRes.json()
        if (pkgJson.success) {
          setPackages(pkgJson.data || [])
        } else {
          setPackages([])
        }

        // Live Schedules
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

        // Bank Accounts
        if (uData.bank_account) {
          setBankName(uData.bank_account.bank_name)
          setBankNumber(uData.bank_account.account_number)
          setBankHolder(uData.bank_account.account_holder_name)
          setIsBankLocked(!!uData.bank_account.is_locked)
        } else {
          setIsBankLocked(false)
        }

        // Digital projects
        const projRes = await fetchWithRetry(`${API_BASE}/projects/${uData.id}`)
        const projJson = await projRes.json()
        if (projJson.success) {
          setProjects(projJson.data || [])
        }

        // Mabar Queue list
        const queueRes = await fetchWithRetry(`${API_BASE}/queues/streamer?streamerId=${uData.id}`)
        const queueJson = await queueRes.json()
        if (queueJson.success) {
          setQueues(queueJson.data || [])
        }

        // Support Tickets
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

        // Finance Ledgers
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
            
            const successfulTxs = txs.filter((t: any) => t.status === "SUCCESS")
            const calculatedGross = successfulTxs.reduce((sum: number, t: any) => sum + Number(t.gross_amount), 0)
            setTotalGross(calculatedGross)

            const combined = [
              ...txs.map((t: any) => ({
                id: t.id.substring(0, 8).toUpperCase(),
                sender: t.sender_name,
                amount: Number(t.gross_amount),
                net_amount: Number(t.net_amount) || 0,
                gift_id: t.gift_id || null,
                gift: t.gift || null,
                donation_media: t.donation_media || null,
                mediashare_url: t.mediashare_url || null,
                gacha_log: t.gacha_log || null,
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
            ].sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime())

            setTransactions(combined)
          }
        }
      }
    } catch (err: any) {
      console.warn("Error loading dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMasterAvatars = async () => {
    try {
      const res = await fetchWithRetry(`${API_BASE}/users/avatars`)
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
  }, [session, status])

  // Load configuration details
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOriginUrl(window.location.origin)
    }
  }, [])

  // Action Handlers
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

  const handleSaveTargetTitle = async () => {
    if (!session?.user?.accessToken) return
    try {
      const res = await fetchWithRetry(`${API_BASE}/users/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify({ target_title: editTargetTitle })
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Judul Target Donasi berhasil disimpan!")
        fetchDashboardData()
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan judul target.")
    }
  }

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
      fetchDashboardData()
    } catch (err: any) {
      toast.error(err.message || "Gagal memproses penarikan saldo.")
    }
  }

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

  const openEditPackage = (pkg: any) => {
    setEditingPackage(pkg)
    setEditPkgName(pkg.game_name)
    setEditPkgPrice(String(Number(pkg.price_per_slot)))
    setEditPkgGame(pkg.game_name)
    setIsEditPackageOpen(true)
  }

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

  const openEditProject = (proj: any) => {
    setEditingProject(proj)
    setEditProjTitle(proj.title)
    setEditProjDesc(proj.description || "")
    setEditProjUrl(proj.file_url)
    setEditProjMinSupport(String(Number(proj.min_support)))
    setIsEditProjectOpen(true)
  }

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

    setTimeout(() => {
      setCallingCooldowns(prev => ({ ...prev, [id]: false }))
    }, 10000)
  }

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
        fetchDashboardData()
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
          mabar_promo_get: Number(mabarPromoGet) || 0,
          role_title: role
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
    if (!verifyPlatform) {
      toast.error("Pilih platform media sosial yang ingin diverifikasi!")
      return
    }
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

  const value = {
    profile, setProfile,
    loading, setLoading,
    balance, setBalance,
    totalGross, setTotalGross,
    isLive, setIsLive,
    role, setRole,
    widgetToken, setWidgetToken,
    originUrl, setOriginUrl,
    isCopied, setIsCopied,
    isCopiedMedia, setIsCopiedMedia,
    isCopiedQueue, setIsCopiedQueue,
    isCopiedDonors, setIsCopiedDonors,
    isCopiedTarget, setIsCopiedTarget,
    customDonorsTitle, setCustomDonorsTitle,
    customDonorsPeriod, setCustomDonorsPeriod,
    customTickerTitle, setCustomTickerTitle,
    customTickerPeriod, setCustomTickerPeriod,
    customRoleInput, setCustomRoleInput,
    isCustomRoleActive, setIsCustomRoleActive,
    activeTab, setActiveTab,
    callingCooldowns, setCallingCooldowns,
    profileSubTab, setProfileSubTab,
    isAvatarModalOpen, setIsAvatarModalOpen,
    isScanning, setIsScanning,
    scanLogs, setScanLogs,
    scanProgress, setScanProgress,
    verificationCountdown, setVerificationCountdown,
    verifyPlatform, setVerifyPlatform,
    verifyMessage, setVerifyMessage,
    verifyScreenshot, setVerifyScreenshot,
    verifyScreenshotPreview, setVerifyScreenshotPreview,
    isUploadingVerification, setIsUploadingVerification,
    editBio, setEditBio,
    editInstagram, setEditInstagram,
    editYoutube, setEditYoutube,
    editDiscord, setEditDiscord,
    editFacebook, setEditFacebook,
    editTwitch, setEditTwitch,
    editTiktok, setEditTiktok,
    editWebsite, setEditWebsite,
    editTargetTitle, setEditTargetTitle,
    editTargetAmount, setEditTargetAmount,
    feeDonation, setFeeDonation,
    feeMabar, setFeeMabar,
    feeGift, setFeeGift,
    showTarget, setShowTarget,
    showQueue, setShowQueue,
    showReviews, setShowReviews,
    showCalendar, setShowCalendar,
    showServices, setShowServices,
    editServiceBtnTitle, setEditServiceBtnTitle,
    editServiceBtnSubtitle, setEditServiceBtnSubtitle,
    editSupportBtnTitle, setEditSupportBtnTitle,
    editSupportBtnSubtitle, setEditSupportBtnSubtitle,
    editScheduleTitleSetting, setEditScheduleTitleSetting,
    mabarPromoBuy, setMabarPromoBuy,
    mabarPromoGet, setMabarPromoGet,
    schedules, setSchedules,
    newSchedTitle, setNewSchedTitle,
    newSchedCategory, setNewSchedCategory,
    newSchedDate, setNewSchedDate,
    newSchedDesc, setNewSchedDesc,
    isAddSchedOpen, setIsAddSchedOpen,
    masterAvatars, setMasterAvatars,
    isUploadingAvatar, setIsUploadingAvatar,
    isUploadingBanner, setIsUploadingBanner,
    avatarBust, setAvatarBust,
    packages, setPackages,
    transactions, setTransactions,
    withdrawals, setWithdrawals,
    queues, setQueues,
    selectedActiveIds, setSelectedActiveIds,
    selectedPendingIds, setSelectedPendingIds,
    projects, setProjects,
    isWithdrawOpen, setIsWithdrawOpen,
    isAddPackageOpen, setIsAddPackageOpen,
    isAddProjectOpen, setIsAddProjectOpen,
    confirmDelete, setConfirmDelete,
    editingPackage, setEditingPackage,
    isEditPackageOpen, setIsEditPackageOpen,
    editPkgName, setEditPkgName,
    editPkgPrice, setEditPkgPrice,
    editPkgGame, setEditPkgGame,
    editingProject, setEditingProject,
    isEditProjectOpen, setIsEditProjectOpen,
    editProjTitle, setEditProjTitle,
    editProjDesc, setEditProjDesc,
    editProjUrl, setEditProjUrl,
    editProjMinSupport, setEditProjMinSupport,
    withdrawAmount, setWithdrawAmount,
    bankName, setBankName,
    bankNumber, setBankNumber,
    bankHolder, setBankHolder,
    selectedGame, setSelectedGame,
    newPkgName, setNewPkgName,
    newPkgPrice, setNewPkgPrice,
    newPkgDesc, setNewPkgDesc,
    newProjTitle, setNewProjTitle,
    newProjDesc, setNewProjDesc,
    newProjUrl, setNewProjUrl,
    newProjMinSupport, setNewProjMinSupport,
    financeSubTab, setFinanceSubTab,
    financeFilter, setFinanceFilter,
    financePage, setFinancePage,
    isBankLocked, setIsBankLocked,
    tickets, setTickets,
    newTicketTitle, setNewTicketTitle,
    newTicketMessage, setNewTicketMessage,
    isCreateTicketOpen, setIsCreateTicketOpen,
    selectedTicket, setSelectedTicket,
    newTicketCategory, setNewTicketCategory,
    
    // CRUD actions
    fetchDashboardData,
    handleToggleLive,
    handleUpdateRole,
    handleResetToken,
    handleCopyWidget,
    handleCopyMedia,
    handleCopyQueue,
    handleCopyDonors,
    handleCopyTarget,
    handleSaveTargetTitle,
    handleWithdrawSubmit,
    handleAddPackage,
    handleDeletePackage,
    handleToggleActivePackage,
    handleDeactivatePackage,
    handleEditPackage,
    openEditPackage,
    handleEditProject,
    openEditProject,
    handleAddProject,
    handleDeleteProject,
    handleQueueAction,
    handleCallPlayer,
    handleBulkQueueAction,
    handleSelectAvatar,
    handleAvatarUpload,
    handleBannerUpload,
    handleDeleteBanner,
    handleSaveBankAccount,
    handleCreateTicket,
    handleAddSchedule,
    handleDeleteSchedule,
    handleSaveProfile,
    handleApplyVerification
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider")
  }
  return context
}
