"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { formatNumberInput, parseNumberInput } from "@/lib/utils"
import { Zap, Eye, CheckCircle2, XCircle, ExternalLink } from "lucide-react"
import { ADMIN_API, API_BASE_URL } from "@/lib/api"

// Import Modular Components
import SidebarNav from "./components/SidebarNav"
import Header from "./components/Header"
import OverviewTab from "./components/OverviewTab"
import CreatorsTab from "./components/CreatorsTab"
import WithdrawalsTab from "./components/WithdrawalsTab"
import TransactionsTab from "./components/TransactionsTab"
import ProfileTab from "./components/ProfileTab"
import SettingsTab from "./components/SettingsTab"
import AvatarsTab from "./components/AvatarsTab"
import RatesTab from "./components/RatesTab"
import TicketsTab from "./components/TicketsTab"
import PaymentChannelsTab from "./components/PaymentChannelsTab"
import BadgesTab from "./components/BadgesTab"
import PartnersTab from "./components/PartnersTab"

export default function SuperadminDashboard() {
  const router = useRouter()
  const { setTheme } = useTheme()
  const { lang, setLang } = useLanguage()

  // Security Auth Guard State
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminUser, setAdminUser] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const active = localStorage.getItem("admin_session") === "true"
      if (!active) {
        toast.error("Akses Ditolak! Silakan login di Portal Superadmin terlebih dahulu.")
        router.push("/portal/login")
      } else {
        setAdminUser(localStorage.getItem("admin_user") || "Administrator")
        setIsAuthenticated(true)
      }
    }
  }, [router])

  // Navigation State
  const [activeTab, setActiveTab] = useState("overview") // overview | creators | withdrawals | transactions
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Read tab parameter from URL on load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get("tab")
      if (tabParam && ["overview", "creators", "withdrawals", "transactions", "profile", "avatars", "settings", "rates", "tickets", "payment_channels", "badges", "partners"].includes(tabParam)) {
        setActiveTab(tabParam)
      }
    }
  }, [])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `/superadmin?tab=${tab}`)
    }
  }
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("")

  // Secure Withdrawal Confirmation State
  const [isConfirmWithdrawOpen, setIsConfirmWithdrawOpen] = useState(false)
  const [confirmWithdrawId, setConfirmWithdrawId] = useState("")
  const [confirmWithdrawAction, setConfirmWithdrawAction] = useState<"SUCCESS" | "FAILED">("SUCCESS")
  const [confirmWithdrawText, setConfirmWithdrawText] = useState("")

  // Financial Stats (dynamic states fetched from DB)
  const [totalGtv, setTotalGtv] = useState(0)
  const [platformRevenue, setPlatformRevenue] = useState(0)
  const [activeDonationFee, setActiveDonationFee] = useState(5.00)
  const [activeMabarFee, setActiveMabarFee] = useState(8.00)
  
  // Creators list (fetched from DB)
  const [creators, setCreators] = useState<any[]>([])

  // Withdrawal Requests (fetched from DB)
  const [withdrawals, setWithdrawals] = useState<any[]>([])

  // Global Transactions (fetched from DB)
  const [transactions, setTransactions] = useState<any[]>([])

  // Support Tickets (fetched from DB)
  const [adminTickets, setAdminTickets] = useState<any[]>([])

  // Fetch Dashboard data from Postgres DB
  const fetchDashboardData = async () => {
    try {
      // 0. Fetch active fee settings from backend
      let activeDonationFee = 5.00
      let activeMabarFee = 8.05
      try {
        const settingsRes = await fetch(ADMIN_API.settings)
        const settingsJson = await settingsRes.json()
        if (settingsJson.success && settingsJson.data) {
          const dFee = settingsJson.data.feeDonation !== undefined ? parseFloat(settingsJson.data.feeDonation) : 5.00
          const mFee = settingsJson.data.feeMabar !== undefined ? parseFloat(settingsJson.data.feeMabar) : 8.00
          setActiveDonationFee(dFee)
          setActiveMabarFee(mFee)
          activeDonationFee = dFee
          activeMabarFee = mFee
        }
      } catch (err) {
        console.error("Gagal memuat persentase komisi aktif, menggunakan fallback default:", err)
      }

      // 1. Fetch creators
      const creatorsRes = await fetch(ADMIN_API.creators)
      const creatorsJson = await creatorsRes.json()
      if (creatorsJson.success) {
        const mappedCreators = creatorsJson.data.map((c: any) => ({
          id: c.id,
          username: c.username,
          role: c.role_title || "STREAMER & KREATOR",
          email: c.email,
          balance: c.balance,
          isVerified: c.isVerified !== undefined ? c.isVerified : (c.is_verified || false),
          status: c.status || "ACTIVE",
          isLive: c.is_live,
          avatar_url: c.avatar_url,
          verification_status: c.verification_status || "NONE",
          verification_platform: c.verification_platform || null,
          verification_screenshot_url: c.verification_screenshot_url || null,
          verification_message: c.verification_message || null,
          verification_submitted_at: c.verification_submitted_at || null,
          verification_reject_reason: c.verification_reject_reason || null
        }))
        setCreators(mappedCreators)
      }

      // 2. Fetch withdrawals
      const withdrawalsRes = await fetch(ADMIN_API.withdrawals)
      const withdrawalsJson = await withdrawalsRes.json()
      if (withdrawalsJson.success) {
        setWithdrawals(withdrawalsJson.data)
      }

      // 3. Fetch transactions
      const transactionsRes = await fetch(ADMIN_API.transactions)
      const transactionsJson = await transactionsRes.json()
      if (transactionsJson.success) {
        const mappedTransactions = transactionsJson.data.map((t: any) => {
          const isMabar = t.type === "MABAR"
          const feePercent = isMabar ? activeMabarFee : activeDonationFee
          const calculatedFee = t.amount * (feePercent / 100)
          const calculatedNet = t.amount - calculatedFee

          return {
            id: t.id,
            sender: t.sender,
            creator: t.creator,
            creator_avatar: t.creator_avatar,
            amount: t.amount,
            fee: calculatedFee,
            net: calculatedNet,
            type: isMabar ? `Mabar (${feePercent}%)` : `Donasi (${feePercent}%)`,
            status: t.status,
            time: t.date
          }
        })
        setTransactions(mappedTransactions)

        // Calculate Stats dynamically
        const total = transactionsJson.data.reduce((acc: number, t: any) => acc + t.amount, 0)
        const totalFee = mappedTransactions.reduce((acc: number, t: any) => acc + t.fee, 0)
        setTotalGtv(total)
        setPlatformRevenue(totalFee)
      }

      // 4. Fetch Support Tickets for admin
      try {
        const ticketsRes = await fetch(`${API_BASE_URL}/tickets/admin`)
        const ticketsJson = await ticketsRes.json()
        if (ticketsJson.success) {
          setAdminTickets(ticketsJson.data || [])
        }
      } catch (err) {
        console.error("Gagal mengambil daftar tiket superadmin:", err)
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
    }
  }

  // Trigger fetch when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData()
    }
  }, [isAuthenticated])

  // Modals Open States
  const [isAddCreatorOpen, setIsAddCreatorOpen] = useState(false)
  const [isEditCreatorOpen, setIsEditCreatorOpen] = useState(false)
  const [isSimulateTxOpen, setIsSimulateTxOpen] = useState(false)

  // Add Creator Form States
  const [newUsername, setNewUsername] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newRole, setNewRole] = useState("STREAMER & KREATOR")
  const [newBalance, setNewBalance] = useState("")
  const [newAvatarUrl, setNewAvatarUrl] = useState("")

  // Edit Creator Form States
  const [selectedCreatorId, setSelectedCreatorId] = useState("")
  const [editUsername, setEditUsername] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editRole, setEditRole] = useState("STREAMER & KREATOR")
  const [editBalance, setEditBalance] = useState("")
  const [editAvatarUrl, setEditAvatarUrl] = useState("")

  // Verification Review State
  const [isVerifyReviewOpen, setIsVerifyReviewOpen] = useState(false)
  const [verifyReviewCreator, setVerifyReviewCreator] = useState<any>(null)
  const [rejectReason, setRejectReason] = useState("")

  // Simulate Transaction Form States
  const [txSender, setTxSender] = useState("")
  const [txCreator, setTxCreator] = useState("")
  const [txAmount, setTxAmount] = useState("")
  const [txType, setTxType] = useState("MABAR") // MABAR or DONATION
  const [txMessage, setTxMessage] = useState("")

  // Count helper
  const pendingWithdrawalsCount = withdrawals.filter(w => w.status === "PENDING").length

  // -- CRUD: ADD CREATOR --
  const handleAddCreatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUsername || !newEmail) {
      toast.error("Username dan Email wajib diisi!")
      return
    }

    const usernameClean = newUsername.trim().replace("@", "")
    const initialBal = newBalance ? Number(newBalance) : 0

    try {
      const res = await fetch(ADMIN_API.creators, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameClean,
          email: newEmail.trim(),
          balance: initialBal,
          avatarUrl: newAvatarUrl, // base64 payload
          roleTitle: newRole
        })
      })
      const data = await res.json()

      if (data.success) {
        await fetchDashboardData()
        setIsAddCreatorOpen(false)
        toast.success(`Kreator baru @${usernameClean} berhasil ditambahkan!`)

        // Reset Form
        setNewUsername("")
        setNewEmail("")
        setNewRole("STREAMER & KREATOR")
        setNewBalance("")
        setNewAvatarUrl("")
      } else {
        toast.error(data.message || "Gagal menambahkan kreator baru.")
      }
    } catch (err) {
      console.error("Error creating creator:", err)
      toast.error("Terjadi kesalahan jaringan.")
    }
  }

  // -- CRUD: EDIT CREATOR --
  const handleOpenEditModal = (creator: any) => {
    setSelectedCreatorId(creator.id)
    setEditUsername(creator.username)
    setEditEmail(creator.email)
    setEditRole(creator.role)
    setEditBalance(creator.balance.toString())
    setEditAvatarUrl(creator.avatar_url || "")
    setIsEditCreatorOpen(true)
  }

  const handleEditCreatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanUsername = editUsername.trim().replace("@", "")
    try {
      const res = await fetch(ADMIN_API.creatorById(selectedCreatorId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cleanUsername,
          email: editEmail.trim(),
          balance: Number(editBalance),
          avatarUrl: editAvatarUrl, // base64 payload
          roleTitle: editRole
        })
      })
      const data = await res.json()

      if (data.success) {
        await fetchDashboardData()
        setIsEditCreatorOpen(false)
        toast.success(`Data kreator @${cleanUsername} sukses diperbarui!`)
      } else {
        toast.error(data.message || "Gagal memperbarui data kreator.")
      }
    } catch (err) {
      console.error("Error editing creator:", err)
      toast.error("Terjadi kesalahan jaringan.")
    }
  }

  // -- CRUD: TOGGLE VERIFIED STATUS --
  const handleToggleVerified = async (id: string, currentVal: boolean) => {
    const nextVal = !currentVal
    try {
      const res = await fetch(ADMIN_API.creatorById(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isVerified: nextVal
        })
      })
      const data = await res.json()
      if (data.success) {
        setCreators(prev => prev.map(c => c.id === id ? { ...c, isVerified: nextVal } : c))
        toast.success(`Verifikasi diubah ke: ${nextVal ? "VERIFIED" : "UNVERIFIED"}`)
      } else {
        toast.error(data.message || "Gagal mengubah status verifikasi.")
      }
    } catch (err) {
      console.error("Error toggling verification status:", err)
      toast.error("Terjadi kesalahan jaringan.")
    }
  }

  // -- CRUD: TOGGLE SUSPEND STATUS --
  const handleToggleSuspend = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE"
    try {
      const creator = creators.find(c => c.id === id)
      if (!creator) return

      const res = await fetch(ADMIN_API.creatorById(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus
        })
      })
      const data = await res.json()

      if (data.success) {
        await fetchDashboardData()
        if (nextStatus === "SUSPENDED") {
          toast.warning(`Akun @${creator.username} telah dinonaktifkan!`)
        } else {
          toast.success(`Akun @${creator.username} kembali diaktifkan!`)
        }
      }
    } catch (err) {
      console.error("Error toggling suspend:", err)
    }
  }

  // -- SANDBOX: SIMULATE TRANSACTION --
  const handleSimulateTxSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!txSender || !txCreator || !txAmount) {
      toast.error("Seluruh kolom wajib diisi!")
      return
    }

    const amount = Number(txAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Nominal transaksi tidak valid!")
      return
    }

    try {
      const cleanUsername = txCreator.trim().replace("@", "")
      const res = await fetch(ADMIN_API.simulateTransaction, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorUsername: cleanUsername,
          senderName: txSender.trim(),
          amount: amount,
          type: txType,
          message: txMessage || "Simulasi dukungan dari superadmin sandbox!"
        })
      })
      const data = await res.json()

      if (data.success) {
        await fetchDashboardData()
        setIsSimulateTxOpen(false)

        const rate = txType === "DONATION" ? (activeDonationFee / 100) : (activeMabarFee / 100)
        const fee = Math.round(amount * rate)

        toast.success(`Simulasi donasi Rp ${amount.toLocaleString("id-ID")} dari ${txSender} ke @${cleanUsername} sukses! Komisi owner +Rp ${fee.toLocaleString("id-ID")} masuk ke kas platform.`)

        // Reset Form
        setTxSender("")
        setTxCreator("")
        setTxAmount("")
        setTxType("MABAR")
        setTxMessage("")

        // TTS Callout
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(`Notifikasi masuk, Rp ${amount.toLocaleString("id-ID")} berhasil disimulasikan!`)
          utterance.lang = "id-ID"
          window.speechSynthesis.speak(utterance)
        }
      } else {
        toast.error(data.message || "Gagal memproses simulasi.")
      }
    } catch (err) {
      console.error("Error simulating transaction:", err)
      toast.error("Terjadi kesalahan jaringan.")
    }
  }

  // -- APPROVALS: WITHDRAWAL ACC/REJECT --
  const handleWithdrawalAction = async (id: string, action: "SUCCESS" | "FAILED") => {
    try {
      const endpoint = action === "SUCCESS"
        ? ADMIN_API.approveWithdrawal(id)
        : ADMIN_API.rejectWithdrawal(id)

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })
      const data = await res.json()

      if (data.success) {
        const req = withdrawals.find(w => w.id === id)
        await fetchDashboardData()

        if (req) {
          if (action === "SUCCESS") {
            toast.success(`Pencairan dana ${id} sebesar Rp ${req.amount.toLocaleString("id-ID")} sukses disetujui! Dana dikirim ke ${req.bankName}.`)
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance("Pencairan dana kreator telah sukses ditransfer.")
              utterance.lang = "id-ID"
              window.speechSynthesis.speak(utterance)
            }
          } else {
            toast.error(`Pencairan dana ${id} ditolak. Saldo Rp ${req.amount.toLocaleString("id-ID")} dikembalikan ke dompet @${req.creator}.`)
          }
        }
      } else {
        toast.error(data.message || "Gagal memproses penarikan dana.")
      }
    } catch (err) {
      console.error("Error processing withdrawal action:", err)
      toast.error("Terjadi kesalahan jaringan.")
    }
  }

  // -- SECURE WITHDRAWAL TRIGGER --
  const triggerWithdrawalConfirm = (id: string, action: "SUCCESS" | "FAILED") => {
    setConfirmWithdrawId(id)
    setConfirmWithdrawAction(action)
    setConfirmWithdrawText("")
    setIsConfirmWithdrawOpen(true)
  }

  // -- VERIFICATION REVIEW --
  const handleOpenVerifyReview = (creator: any) => {
    setVerifyReviewCreator(creator)
    setRejectReason("")
    setIsVerifyReviewOpen(true)
  }

  const handleApproveVerification = async (userId: string) => {
    try {
      const res = await fetch(ADMIN_API.approveVerification(userId), {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })
      const data = await res.json()
      if (data.success) {
        await fetchDashboardData()
        setIsVerifyReviewOpen(false)
        toast.success("Verifikasi berhasil disetujui!")
      } else {
        toast.error(data.message || "Gagal menyetujui verifikasi.")
      }
    } catch (err) {
      console.error("Error approving verification:", err)
      toast.error("Terjadi kesalahan jaringan.")
    }
  }

  const handleRejectVerification = async (userId: string) => {
    if (!rejectReason.trim()) {
      toast.error("Alasan penolakan wajib diisi!")
      return
    }
    try {
      const res = await fetch(ADMIN_API.rejectVerification(userId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason.trim() })
      })
      const data = await res.json()
      if (data.success) {
        await fetchDashboardData()
        setIsVerifyReviewOpen(false)
        toast.success("Verifikasi berhasil ditolak.")
      } else {
        toast.error(data.message || "Gagal menolak verifikasi.")
      }
    } catch (err) {
      console.error("Error rejecting verification:", err)
      toast.error("Terjadi kesalahan jaringan.")
    }
  }

  // -- AUTH: LOGOUT PORTAL --
  const handleAdminLogout = () => {
    localStorage.removeItem("admin_session")
    localStorage.removeItem("admin_user")
    toast.success("Berhasil keluar dari Portal Superadmin.")
    router.push("/portal/login")
  }

  // Filtering creators based on search query
  const filteredCreators = creators.filter(c => 
    c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8F7F3] dark:bg-[#0B0B0A] flex flex-col items-center justify-center font-black uppercase italic text-black dark:text-white">
        <Zap className="h-10 w-10 animate-bounce mb-3 text-[#FFD551]" />
        Memvalidasi Akses Portal...
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#F8F7F3] dark:bg-[#0B0B0A] text-[#1A1A19] dark:text-[#EAE9E4] transition-colors duration-200 flex flex-col">

      <div className="flex flex-1 w-full relative">
        
        {/* ================= LEFT SIDEBAR (STICKY - BENTO SLEEK) ================= */}
        {/* Mobile Sidebar Dim Backdrop Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className={`
          fixed inset-y-0 left-0 z-50 transform lg:transform-none lg:static lg:flex flex-col shrink-0 h-full lg:h-auto lg:self-stretch transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          <SidebarNav 
            activeTab={activeTab}
            handleTabChange={(tab) => {
              handleTabChange(tab)
              setIsSidebarOpen(false) // Auto-close drawer on mobile tab tap!
            }}
            pendingWithdrawalsCount={pendingWithdrawalsCount}
            adminUser={adminUser}
            isSimulateTxOpen={isSimulateTxOpen}
            setIsSimulateTxOpen={setIsSimulateTxOpen}
            txSender={txSender}
            setTxSender={setTxSender}
            txCreator={txCreator}
            setTxCreator={setTxCreator}
            txAmount={txAmount}
            setTxAmount={setTxAmount}
            txType={txType}
            setTxType={setTxType}
            txMessage={txMessage}
            setTxMessage={setTxMessage}
            creators={creators}
            handleSimulateTxSubmit={handleSimulateTxSubmit}
            feeDonation={activeDonationFee}
            feeMabar={activeMabarFee}
          />
        </div>

        {/* ================= MAIN CONTENT AREA ================= */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* ================= INTEGRATED SaaS HEADER (HAIRLINE BORDERS) ================= */}
          <Header 
            activeTab={activeTab}
            adminUser={adminUser}
            handleAdminLogout={handleAdminLogout}
            lang={lang}
            setLang={setLang}
            setTheme={setTheme}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          {/* ================= MAIN PANEL ================= */}
          <div className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
            
            {/* HEADER TOP TITLE */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-black tracking-tight italic text-black dark:text-[#FFD551] flex items-center gap-2">
                  <span>👑</span>
                  {activeTab === "overview" && "Sistem Ringkasan & Finansial"}
                  {activeTab === "creators" && "Manajemen Direktori Kreator"}
                  {activeTab === "withdrawals" && "Persetujuan Tarik Dana"}
                  {activeTab === "transactions" && "Global Transactions Flow"}
                  {activeTab === "tickets" && "Manajemen Tiket Bantuan & Pengaduan"}
                  {activeTab === "profile" && "Pengaturan Profil Superadmin"}
                  {activeTab === "avatars" && "Manajemen Master Avatar"}
                  {activeTab === "settings" && "Konfigurasi Website & Google SEO"}
                  {activeTab === "rates" && "Konfigurasi Kurs Mata Uang (Exchange Rates)"}
                  {activeTab === "payment_channels" && "Manajemen Metode Pembayaran Platform"}
                  {activeTab === "badges" && "Manajemen Lencana Kepercayaan (Trust Badges)"}
                  {activeTab === "partners" && "Manajemen Partner & Brand Mitra"}
                </h1>
                <p className="text-xs text-slate-400 dark:text-zinc-400 tracking-wider font-black italic mt-0.5">
                  {activeTab === "overview" && "Statistik perputaran dana dan volume transaksi platform"}
                  {activeTab === "creators" && "Kelola status verifikasi, suspensi, dan edit saldo kreator"}
                  {activeTab === "withdrawals" && "Tinjau pengajuan transfer penarikan dana dari kreator"}
                  {activeTab === "transactions" && "Catatan log keuangan penonton ke kreator secara realtime"}
                  {activeTab === "tickets" && "Tanggapi dan selesaikan tiket pengaduan serta perubahan rekening dari kreator"}
                  {activeTab === "profile" && "Amankan kredensial pemilik platform dan perbarui kunci akses"}
                  {activeTab === "avatars" && "Tambah, edit, dan hapus koleksi gambar avatar untuk profil user baru"}
                  {activeTab === "settings" && "Kelola brand logo teks, tab favicon icon, dan tag meta SEO"}
                  {activeTab === "rates" && "Atur nilai konversi mata uang asing terhadap mata uang dasar rupiah"}
                  {activeTab === "payment_channels" && "Unggah logo bank/e-wallet, atur biaya transfer, dan toggle status aktif"}
                  {activeTab === "badges" && "Atur nama lencana, syarat minimal supporter unik, raw SVG, dan visual styling"}
                  {activeTab === "partners" && "Kelola logo partner, tautan eksternal, urutan tayang, dan visibilitas footer"}
                </p>
              </div>
            </div>

            {/* ================= MODULAR TABS ================= */}
            {activeTab === "overview" && (
              <OverviewTab 
                totalGtv={totalGtv}
                platformRevenue={platformRevenue}
                creators={creators}
                pendingWithdrawalsCount={pendingWithdrawalsCount}
                transactions={transactions}
                feeDonation={activeDonationFee}
                feeMabar={activeMabarFee}
              />
            )}

            {activeTab === "creators" && (
              <CreatorsTab 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filteredCreators={filteredCreators}
                handleToggleVerified={handleToggleVerified}
                handleOpenEditModal={handleOpenEditModal}
                handleToggleSuspend={handleToggleSuspend}
                isAddCreatorOpen={isAddCreatorOpen}
                setIsAddCreatorOpen={setIsAddCreatorOpen}
                newUsername={newUsername}
                setNewUsername={setNewUsername}
                newEmail={newEmail}
                setNewEmail={setNewEmail}
                newRole={newRole}
                setNewRole={setNewRole}
                newBalance={newBalance}
                setNewBalance={setNewBalance}
                newAvatarUrl={newAvatarUrl}
                setNewAvatarUrl={setNewAvatarUrl}
                handleAddCreatorSubmit={handleAddCreatorSubmit}
                handleOpenVerifyReview={handleOpenVerifyReview}
              />
            )}

            {activeTab === "withdrawals" && (
              <WithdrawalsTab 
                withdrawals={withdrawals}
                triggerWithdrawalConfirm={triggerWithdrawalConfirm}
              />
            )}

            {activeTab === "transactions" && (
              <TransactionsTab 
                transactions={transactions}
              />
            )}

            {activeTab === "profile" && (
              <ProfileTab 
                adminUser={adminUser}
                setAdminUser={setAdminUser}
              />
            )}

            {activeTab === "avatars" && (
              <AvatarsTab />
            )}

            {activeTab === "settings" && (
              <SettingsTab />
            )}

            {activeTab === "rates" && (
              <RatesTab />
            )}

            {activeTab === "tickets" && (
              <TicketsTab tickets={adminTickets} fetchTickets={fetchDashboardData} />
            )}

            {activeTab === "payment_channels" && (
              <PaymentChannelsTab />
            )}

            {activeTab === "badges" && (
              <BadgesTab />
            )}

            {activeTab === "partners" && (
              <PartnersTab />
            )}

            {/* ================= GLOBAL FLOATING MODALS ================= */}

            {/* Edit Creator Dialog */}
            <Dialog open={isEditCreatorOpen} onOpenChange={setIsEditCreatorOpen}>
              <DialogContent className="max-w-md bg-[#F8F7F3] rounded-[2rem] border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="font-black text-2xl italic tracking-tighter">Edit Data Kreator @{editUsername}</DialogTitle>
                  <DialogDescription className="text-xs font-bold italic text-slate-400">
                    Ubah data profil, genre role, atau atur nominal saldo dompet kreator secara langsung
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEditCreatorSubmit} className="space-y-4 pt-2 text-[#1A1A19]">
                  {/* Edit Avatar File Upload Section */}
                  <div className="flex flex-col items-center justify-center space-y-2 pb-2">
                    <Label className="text-xs font-black italic text-slate-500">Foto Profil / Avatar Kreator</Label>
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-full border-3 border-[#FFD551] overflow-hidden bg-white shadow-md flex items-center justify-center text-slate-350 text-2xl font-bold">
                        {editAvatarUrl ? (
                          <img src={editAvatarUrl} alt="Preview Avatar" className="w-full h-full object-cover" />
                        ) : (
                          "➕"
                        )}
                      </div>
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.gif,.webp,.svg,image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return

                          // 1. Enforce Size Limit: 500KB
                          if (file.size > 500 * 1024) {
                            toast.error("Ukuran foto profil tidak boleh melebihi 500 KB!")
                            return
                          }

                          // 2. Enforce File Format Limit
                          const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/svg+xml"]
                          if (!allowedTypes.includes(file.type)) {
                            toast.error("Format file tidak didukung! Gunakan PNG, JPEG, GIF, Webp, atau SVG.")
                            return
                          }

                          const reader = new FileReader()
                          reader.onload = (event) => {
                            setEditAvatarUrl(event.target?.result as string)
                            toast.success("Foto profil berhasil diunggah!")
                          }
                          reader.readAsDataURL(file)
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Pilih Foto Profil (Max 500KB)"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 italic">Klik lingkaran untuk ubah (PNG/JPG/GIF/SVG/Webp, Max 500KB)</span>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-black italic text-slate-500">Username Kreator</Label>
                    <Input 
                      required 
                      value={editUsername} 
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black italic text-slate-500">Alamat Email</Label>
                    <Input 
                      type="email"
                      required 
                      value={editEmail} 
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black italic text-slate-500">Peran Kustom / Label Peran (Role)</Label>
                    <Input 
                      placeholder="Contoh: VERIFIED STREAMER & KREATOR" 
                      value={editRole} 
                      onChange={(e) => setEditRole(e.target.value)}
                      className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black italic text-slate-500">Atur Saldo Wallet (Rp)</Label>
                    <Input 
                      type="text"
                      value={formatNumberInput(editBalance)} 
                      onChange={(e) => setEditBalance(String(parseNumberInput(e.target.value)))}
                      className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold"
                    />
                  </div>
                  <DialogFooter className="pt-2">
                    <Button type="submit" className="w-full h-12 bg-black text-[#FFD551] rounded-2xl font-black italic transition-all cursor-pointer">
                      Simpan Perubahan Data
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Secure Withdrawal Confirmation Dialog */}
            <Dialog open={isConfirmWithdrawOpen} onOpenChange={setIsConfirmWithdrawOpen}>
              <DialogContent className="max-w-md bg-[#F8F7F3] rounded-[2rem] border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="font-black text-2xl italic tracking-tighter">
                    {confirmWithdrawAction === "SUCCESS" ? "⚠️ Konfirmasi Pencairan Dana" : "⚠️ Konfirmasi Penolakan Dana"}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-bold italic text-slate-400">
                    {confirmWithdrawAction === "SUCCESS"
                      ? "Anda akan menyetujui transfer saldo ke rekening kreator. Tindakan ini tidak dapat dibatalkan."
                      : "Anda akan menolak pengajuan transfer saldo dan mengembalikan dana ke dompet kreator."}
                  </DialogDescription>
                </DialogHeader>

                {(() => {
                  const req = withdrawals.find(w => w.id === confirmWithdrawId)
                  if (!req) return null
                  const targetWord = confirmWithdrawAction === "SUCCESS" ? "SETUJU" : "TOLAK"

                  return (
                    <div className="space-y-4 pt-2 text-[#1A1A19] dark:text-[#EAE9E4]">
                      <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-2xl border border-slate-100 dark:border-zinc-900 space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-400">ID Request:</span>
                          <span className="font-mono">{req.id ? req.id.substring(0, 8) : ""}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-400">Kreator:</span>
                          <span>@{req.creator}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-400">Tujuan Bank:</span>
                          <span>{req.bankName} - {req.accountNo}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-400">Pemilik Rekening:</span>
                          <span>{req.holder}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold pt-1.5 border-t border-slate-100 dark:border-zinc-900">
                          <span className="text-slate-400">Total Transfer:</span>
                          <span className="text-sm font-black text-[#FFD551] bg-black dark:bg-[#1E1E1D] px-2 py-0.5 rounded-lg">
                            Rp {req.amount.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-black italic text-slate-500 dark:text-zinc-400">
                          Ketik <span className="highlight bg-red-500 text-white rounded-lg px-1.5 py-0.5 font-bold uppercase">{targetWord}</span> untuk memverifikasi tindakan aman:
                        </Label>
                        <Input
                          required
                          placeholder={`Ketik '${targetWord}' untuk melanjutkan...`}
                          value={confirmWithdrawText}
                          onChange={(e) => setConfirmWithdrawText(e.target.value)}
                          className="h-12 border border-slate-200 dark:border-zinc-800 rounded-2xl bg-white text-black dark:bg-[#1E1E1D] dark:text-white px-4 font-bold text-center text-sm uppercase tracking-wider focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                        />
                      </div>

                      <DialogFooter className="pt-2">
                        <div className="flex gap-3 w-full">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsConfirmWithdrawOpen(false)}
                            className="h-12 flex-1 border border-slate-200 dark:border-zinc-800 text-slate-500 rounded-2xl font-black italic text-xs hover:bg-slate-50 cursor-pointer"
                          >
                            Batal
                          </Button>
                          <Button
                            type="button"
                            disabled={confirmWithdrawText.toUpperCase() !== targetWord}
                            onClick={() => {
                              handleWithdrawalAction(confirmWithdrawId, confirmWithdrawAction)
                              setIsConfirmWithdrawOpen(false)
                            }}
                            className={`h-12 flex-1 rounded-2xl font-black italic text-xs transition-all cursor-pointer ${
                              confirmWithdrawAction === "SUCCESS"
                                ? "bg-black text-[#FFD551] hover:bg-slate-900 disabled:opacity-30 disabled:bg-slate-200 disabled:text-slate-400"
                                : "bg-red-500 text-white hover:bg-red-600 disabled:opacity-30 disabled:bg-slate-200 disabled:text-slate-400"
                            }`}
                          >
                            {confirmWithdrawAction === "SUCCESS" ? "Proses Transfer" : "Proses Tolak"}
                          </Button>
                        </div>
                      </DialogFooter>
                    </div>
                  )
                })()}
              </DialogContent>
            </Dialog>

            {/* Verification Review Dialog */}
            <Dialog open={isVerifyReviewOpen} onOpenChange={setIsVerifyReviewOpen}>
              <DialogContent className="max-w-2xl bg-[#F8F7F3] rounded-[2rem] border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle className="font-black text-2xl italic tracking-tighter flex items-center gap-2">
                    🔍 Tinjau Bukti Pengajuan Verifikasi
                  </DialogTitle>
                  <DialogDescription className="text-xs font-bold italic text-slate-450">
                    Periksa kebenaran bukti kepemilikan akun sosial media yang diajukan oleh kreator.
                  </DialogDescription>
                </DialogHeader>

                {verifyReviewCreator && (
                  <div className="space-y-6 pt-4 text-[#1A1A19] dark:text-[#EAE9E4]">
                    {/* User Profile Summary */}
                    <div className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900/50 rounded-2xl border border-slate-100 dark:border-zinc-900 shadow-sm">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-850 overflow-hidden flex items-center justify-center text-xl font-black italic shadow-inner border border-slate-200 dark:border-zinc-700 shrink-0">
                        {verifyReviewCreator.avatar_url ? (
                          <img src={verifyReviewCreator.avatar_url} alt={verifyReviewCreator.username} className="w-full h-full object-cover" />
                        ) : (
                          verifyReviewCreator.username.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-base truncate text-black dark:text-white">@{verifyReviewCreator.username}</h4>
                        <p className="text-xs font-bold text-slate-400 truncate">{verifyReviewCreator.email}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="inline-block text-[9px] font-black uppercase italic bg-[#FFD551] text-black px-2.5 py-1 rounded-lg">
                          {verifyReviewCreator.role_title || "KREATOR"}
                        </span>
                      </div>
                    </div>

                    {/* Metadata & Platform details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 dark:bg-zinc-900/30 rounded-xl border border-slate-100 dark:border-zinc-900">
                        <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Platform</span>
                        <span className="text-xs font-black italic text-[#FFD551] bg-black px-2.5 py-1 rounded-md inline-block mt-1">
                          {verifyReviewCreator.verification_platform || "TIDAK DIKETAHUI"}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-zinc-900/30 rounded-xl border border-slate-100 dark:border-zinc-900">
                        <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Tanggal Pengajuan</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mt-1">
                          {verifyReviewCreator.verification_submitted_at
                            ? new Date(verifyReviewCreator.verification_submitted_at).toLocaleString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              }) + " WIB"
                            : "-"}
                        </span>
                      </div>
                    </div>

                    {/* Verification message / token */}
                    <div className="space-y-2">
                      <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Pesan Pengajuan & Token</span>
                      <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-2">
                        {verifyReviewCreator.verification_token && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="font-bold text-slate-450">Token:</span>
                            <span className="font-mono bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-red-500 font-bold select-all">
                              {verifyReviewCreator.verification_token}
                            </span>
                          </div>
                        )}
                        <p className="text-xs font-bold italic text-slate-650 dark:text-zinc-300 leading-relaxed bg-[#FAF9F6] dark:bg-zinc-950 p-3 rounded-xl border border-slate-105 dark:border-zinc-900/50 text-black dark:text-zinc-300">
                          "{verifyReviewCreator.verification_message || "Kreator tidak menulis pesan khusus."}"
                        </p>
                      </div>
                    </div>

                    {/* Verification Screenshot Proof */}
                    <div className="space-y-2">
                      <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Screenshot Bukti Kepemilikan</span>
                      {verifyReviewCreator.verification_screenshot_url ? (
                        <div className="relative group rounded-2xl overflow-hidden border border-slate-250 dark:border-zinc-800 shadow-md bg-black max-h-[300px] flex items-center justify-center">
                          <img 
                            src={verifyReviewCreator.verification_screenshot_url} 
                            alt="Bukti Verifikasi" 
                            className="w-full h-auto max-h-[300px] object-contain transition-all duration-300 group-hover:scale-102" 
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                            <a 
                              href={verifyReviewCreator.verification_screenshot_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-[#FFD551] text-black font-black italic text-xs rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Buka Fullscreen
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 text-center bg-slate-100 dark:bg-zinc-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800">
                          <p className="text-xs font-bold italic text-slate-400">Bukti screenshot tidak diunggah.</p>
                        </div>
                      )}
                    </div>

                    {/* Actions and Reject Input */}
                    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-zinc-850">
                      <div className="space-y-2">
                        <Label className="text-xs font-black italic text-slate-500 dark:text-zinc-400">
                          Alasan Penolakan <span className="text-red-500">* Wajib diisi jika menolak pengajuan</span>
                        </Label>
                        <textarea
                          placeholder="Masukkan alasan penolakan di sini... (Contoh: Token di deskripsi profil tidak cocok / Bukti screenshot tidak valid)"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="w-full h-20 px-4 py-3 border border-slate-250 dark:border-zinc-800 rounded-2xl bg-white text-black dark:bg-[#1E1E1D] dark:text-white font-bold text-xs focus-visible:ring-2 focus-visible:ring-[#FFD551] outline-none leading-relaxed resize-none"
                        />
                      </div>

                      <DialogFooter className="pt-2">
                        <div className="flex gap-3 w-full">
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => handleRejectVerification(verifyReviewCreator.id)}
                            className="h-12 flex-1 rounded-2xl font-black italic text-xs transition-all cursor-pointer bg-red-600 hover:bg-red-700 text-white border-none"
                          >
                            ❌ Tolak Pengajuan
                          </Button>
                          <Button
                            type="button"
                            onClick={() => handleApproveVerification(verifyReviewCreator.id)}
                            className="h-12 flex-1 rounded-2xl font-black italic text-xs transition-all cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                          >
                            ✅ Setujui Verifikasi
                          </Button>
                        </div>
                      </DialogFooter>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

          </div>
        </div>
      </div>
    </main>
  )
}
