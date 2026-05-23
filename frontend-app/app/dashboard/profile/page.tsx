"use client"
import React, { useState, useEffect } from "react"
import { useDashboard } from "../context/DashboardContext"
import { useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import { useLanguage } from "@/components/language-provider"
import { API_BASE_URL } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { formatNumberInput, parseNumberInput } from "@/lib/utils"
import MediaSettingsTab from "../components/MediaSettingsTab"
import { 
  User, 
  Landmark, 
  Sliders, 
  Ticket, 
  ShieldCheck, 
  Volume2,
  UploadCloud,
  RefreshCw,
  Copy,
  ExternalLink,
  Download,
  AlertCircle,
  Plus,
  Trash2,
  Calendar,
  Lock,
  Target,
  Zap,
  Star,
  Gamepad2,
  XCircle,
  X
} from "lucide-react"

const VerifiedBadge = ({ className = "h-4 w-4" }: { className?: string }) => (
  <img
    src="/verified.svg"
    alt="Verified"
    className={`${className} flex-shrink-0`}
  />
)

export default function ProfilePage() {
  const { data: session } = useSession()
  const { lang } = useLanguage()

  const {
    profile,
    role,
    setRole,
    originUrl,
    balance,
    profileSubTab,
    setProfileSubTab,
    isAvatarModalOpen,
    setIsAvatarModalOpen,
    verificationCountdown,
    verifyPlatform,
    setVerifyPlatform,
    verifyMessage,
    setVerifyMessage,
    verifyScreenshot,
    setVerifyScreenshot,
    verifyScreenshotPreview,
    setVerifyScreenshotPreview,
    isUploadingVerification,
    setIsUploadingVerification,
    editBio,
    setEditBio,
    editInstagram,
    setEditInstagram,
    editYoutube,
    setEditYoutube,
    editDiscord,
    setEditDiscord,
    editFacebook,
    setEditFacebook,
    editTwitch,
    setEditTwitch,
    editTiktok,
    setEditTiktok,
    editWebsite,
    setEditWebsite,
    editTargetTitle,
    setEditTargetTitle,
    editTargetAmount,
    setEditTargetAmount,
    showTarget,
    setShowTarget,
    showQueue,
    setShowQueue,
    showReviews,
    setShowReviews,
    showCalendar,
    setShowCalendar,
    showServices,
    setShowServices,
    editServiceBtnTitle,
    setEditServiceBtnTitle,
    editServiceBtnSubtitle,
    setEditServiceBtnSubtitle,
    editSupportBtnTitle,
    setEditSupportBtnTitle,
    editSupportBtnSubtitle,
    setEditSupportBtnSubtitle,
    editScheduleTitleSetting,
    setEditScheduleTitleSetting,
    schedules,
    newSchedTitle,
    setNewSchedTitle,
    newSchedCategory,
    setNewSchedCategory,
    newSchedDate,
    setNewSchedDate,
    newSchedDesc,
    setNewSchedDesc,
    isAddSchedOpen,
    setIsAddSchedOpen,
    masterAvatars,
    isUploadingAvatar,
    isUploadingBanner,
    avatarBust,
    setIsWithdrawOpen,
    confirmDelete,
    setConfirmDelete,
    bankName,
    setBankName,
    bankNumber,
    setBankNumber,
    bankHolder,
    setBankHolder,
    isBankLocked,
    tickets,
    newTicketTitle,
    setNewTicketTitle,
    newTicketMessage,
    setNewTicketMessage,
    isCreateTicketOpen,
    setIsCreateTicketOpen,
    selectedTicket,
    setSelectedTicket,
    newTicketCategory,
    setNewTicketCategory,

    // Actions
    fetchDashboardData,
    handleSelectAvatar,
    handleAvatarUpload,
    handleBannerUpload,
    handleDeleteBanner,
    handleSaveBankAccount,
    handleCreateTicket,
    handleAddSchedule,
    handleDeleteSchedule,
    handleSaveProfile,
    handleApplyVerification,
    handleCopyMedia,
    isCopiedMedia
  } = useDashboard()

  const [targetCardTitle, setTargetCardTitle] = useState("TARGET DONASI")
  const [targetCanvasTransparent, setTargetCanvasTransparent] = useState(false)
  const [targetHeaderBg, setTargetHeaderBg] = useState("#FFD551")
  const [targetHeaderTextColor, setTargetHeaderTextColor] = useState("#000000")
  const [targetBodyBg, setTargetBodyBg] = useState("#1c1c1c")
  const [targetBodyTextColor, setTargetBodyTextColor] = useState("#ffffff")
  const [targetProgressColor, setTargetProgressColor] = useState("#FFD551")
  const [loadingWidgetSettings, setLoadingWidgetSettings] = useState(false)

  useEffect(() => {
    const fetchWidgetSettings = async () => {
      if (!session?.user?.accessToken) return
      setLoadingWidgetSettings(true)
      try {
        const res = await fetch(`${API_BASE_URL}/widget-settings`, {
          headers: { "Authorization": `Bearer ${session.user.accessToken}` }
        })
        const json = await res.json()
        if (json.success && json.data) {
          const d = json.data
          if (d.target_card_title !== undefined) setTargetCardTitle(d.target_card_title || "TARGET DONASI")
          if (d.target_canvas_transparent !== undefined) setTargetCanvasTransparent(!!d.target_canvas_transparent)
          if (d.target_header_bg !== undefined) setTargetHeaderBg(d.target_header_bg || "#FFD551")
          if (d.target_header_text_color !== undefined) setTargetHeaderTextColor(d.target_header_text_color || "#000000")
          if (d.target_body_bg !== undefined) setTargetBodyBg(d.target_body_bg || "#1c1c1c")
          if (d.target_body_text_color !== undefined) setTargetBodyTextColor(d.target_body_text_color || "#ffffff")
          if (d.target_progress_color !== undefined) setTargetProgressColor(d.target_progress_color || "#FFD551")
        }
      } catch (err) {
        console.error("Gagal memuat kustomisasi widget target:", err)
      } finally {
        setLoadingWidgetSettings(false)
      }
    }
    fetchWidgetSettings()
  }, [session])

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Call the standard profile save logic from context
    await handleSaveProfile(e)
    
    // Also save the target overlay widget settings
    if (!session?.user?.accessToken) return
    try {
      const res = await fetch(`${API_BASE_URL}/widget-settings`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${session.user.accessToken}` 
        },
        body: JSON.stringify({
          target_card_title: targetCardTitle,
          target_canvas_transparent: targetCanvasTransparent,
          target_header_bg: targetHeaderBg,
          target_header_text_color: targetHeaderTextColor,
          target_body_bg: targetBodyBg,
          target_body_text_color: targetBodyTextColor,
          target_progress_color: targetProgressColor
        })
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Kustomisasi Target Donasi Overlay berhasil disimpan!")
      } else {
        toast.error("Gagal menyimpan kustomisasi widget: " + json.message)
      }
    } catch (err) {
      console.error("Gagal menyimpan kustomisasi widget:", err)
      toast.error("Gagal menyimpan kustomisasi widget.")
    }
  }

  const handleDownloadQRCode = async () => {
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&color=0b0b0a&bgcolor=ffd551&data=${encodeURIComponent(`${originUrl}/${profile?.username}`)}`
      const response = await fetch(qrUrl)
      const blob = await response.blob()
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `treatme-qrcode-${profile?.username}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success("QR Code premium berhasil diunduh!")
    } catch (err) {
      console.error(err)
      toast.error("Gagal mengunduh QR Code.")
    }
  }

  // Verification Form Component
  const VerificationForm = () => {
    const socialOptions: { value: string; label: string; url: string }[] = []
    if (editYoutube) socialOptions.push({ value: "YOUTUBE", label: "YouTube", url: editYoutube })
    if (editTiktok) socialOptions.push({ value: "TIKTOK", label: "TikTok", url: editTiktok })
    if (editInstagram) socialOptions.push({ value: "INSTAGRAM", label: "Instagram", url: editInstagram })
    if (editTwitch) socialOptions.push({ value: "TWITCH", label: "Twitch", url: editTwitch })
    if (editFacebook) socialOptions.push({ value: "FACEBOOK", label: "Facebook", url: editFacebook })
    if (editDiscord) socialOptions.push({ value: "DISCORD", label: "Discord", url: editDiscord })

    return (
      <div className="space-y-5">
        <div className="bg-blue-500/5 dark:bg-blue-950/10 border border-blue-500/25 p-5 rounded-2xl space-y-3">
          <h4 className="font-extrabold text-xs text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
            Cara Verifikasi:
          </h4>
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
            {socialOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}: {opt.url.length > 40 ? opt.url.substring(0, 40) + "..." : opt.url}
              </option>
            ))}
          </select>
        </div>

        {/* Screenshot Upload */}
        <div className="space-y-2">
          <Label className="font-black italic text-xs text-slate-500 dark:text-zinc-400">Upload Screenshot Bukti Kepemilikan Akun</Label>
          <div className="relative group">
            <div className="w-full min-h-[120px] rounded-2xl border-2 border-dashed border-slate-350 dark:border-zinc-700 flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-900/60 cursor-pointer hover:border-[#FFD551] hover:bg-[#FFD551]/5 transition-all overflow-hidden">
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
                  <span className="text-[10px] font-semibold">PNG, JPG, WEBP &bull; Maks 5MB</span>
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
            placeholder="Tulis informasi tambahan atau catatan jika ada..."
            className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-[#1E1E1D] text-xs p-3 focus:outline-none focus:ring-1 focus:ring-[#FFD551] text-black dark:text-white"
          />
        </div>

        <Button
          type="button"
          onClick={handleApplyVerification}
          disabled={isUploadingVerification}
          className="w-full h-11 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black hover:bg-slate-900 rounded-xl font-black italic text-xs uppercase tracking-wider gap-1.5 shadow-sm transition-all"
        >
          {isUploadingVerification ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" /> Mengirimkan...
            </>
          ) : (
            "Kirim Pengajuan Verifikasi"
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* SUB-TABS NAVIGATION BAR */}
      <div className="flex border-b border-slate-200/80 dark:border-zinc-800/80 pb-1 mb-6 gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: "edit", label: "Edit Profil", icon: User },
          { id: "customization", label: "Kustomisasi Halaman", icon: Sliders },
          { id: "verified", label: "Ajukan Verified", icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = profileSubTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setProfileSubTab(tab.id)}
              className={`flex items-center gap-2 font-black italic text-xs md:text-sm tracking-wider pb-3 border-b-2 transition-all px-4 ${
                isActive
                  ? "border-[#FFD551] text-black dark:text-[#FFD551] font-black"
                  : "border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-400"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {profileSubTab === "edit" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT & CENTER PANEL: AVATAR & SOCIAL SETTINGS */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. AVATAR GALLERY PICKER CARD */}
            <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
              <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
                <CardTitle className="font-black italic text-sm md:text-base tracking-wider text-black dark:text-[#FFD551] flex items-center gap-2">
                  Unggah Foto Profil & Banner Kreator
                </CardTitle>
                <CardDescription className="font-bold italic text-[11px] md:text-xs text-slate-400">
                  Sesuaikan foto profil publik dan cover banner Anda agar terlihat premium dan menarik pendukung
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                
                {/* Compact Active Avatar Indicator & Modal Trigger */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-[#1C1C1B]/40 rounded-2xl border border-slate-200/55 dark:border-zinc-800 mb-6">
                  <div className="flex items-center gap-3.5 flex-1 w-full">
                    <div className="relative w-14 h-14 rounded-2xl border-2 border-[#FFD551] overflow-hidden bg-white dark:bg-zinc-900 shadow-sm flex-shrink-0">
                      {profile?.avatar_url ? (
                        <img src={`${profile.avatar_url}?bust=${avatarBust}`} alt="Current Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black italic text-slate-400">?</div>
                      )}
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-xs font-black uppercase text-black dark:text-white">Avatar Aktif Anda</p>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 italic leading-snug truncate">Default premium maskot Treatme atau foto kustom pilihan Anda</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="h-10 px-4 bg-[#FFD551] text-black border border-[#FFC83B] rounded-xl font-black italic uppercase text-[11px] active:scale-95 hover:bg-[#FFC83B] transition-all dark:border-transparent shrink-0 w-full sm:w-auto"
                  >
                    PILIH DARI GALERI DEFAULT
                  </Button>
                </div>

                {/* 1b. CUSTOM AVATAR & BANNER UPLOAD ZONE */}
                <div className="mt-6 border-t border-slate-100 dark:border-zinc-900 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Custom Avatar Upload */}
                    <div className="space-y-3">
                      <Label className="font-black italic text-xs md:text-sm text-slate-500 dark:text-zinc-400 block">
                        Unggah Foto Profil Kustom Anda
                      </Label>
                      
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
                                <UploadCloud className="h-5 w-5 text-slate-450 dark:text-zinc-500" />
                                <span className="text-xs font-black uppercase italic">PILIH FOTO PROFIL</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-[10px] md:text-[11px] font-bold text-slate-400 dark:text-zinc-500 italic mt-2 leading-relaxed text-center sm:text-left">
                        Dimensi Disarankan: 500x500 px (Rasio 1:1) &bull; Format: PNG, JPG, WEBP &bull; Maksimal 2MB
                      </p>
                    </div>

                    {/* Custom Banner Upload */}
                    <div className="space-y-3 border-t md:border-t-0 md:border-l border-slate-100 dark:border-zinc-900 pt-4 md:pt-0 md:pl-6">
                      <Label className="font-black italic text-xs md:text-sm text-slate-500 dark:text-zinc-400 block">
                        Unggah Banner Profil Kustom Anda
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
                              className="h-10 flex-1 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-black italic dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
                            >
                              {isUploadingBanner ? "Mengunggah..." : "Ganti Banner"}
                            </Button>
                            <Button 
                              type="button" 
                              variant="destructive" 
                              onClick={handleDeleteBanner}
                              className="h-10 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-black italic px-4"
                            >
                              Hapus
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
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
                                    <UploadCloud className="h-5 w-5 text-slate-450 dark:text-zinc-500" />
                                    <span className="text-xs font-black uppercase italic">PILIH BANNER KUSTOM</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <p className="text-[10px] md:text-[11px] font-bold text-slate-400 dark:text-zinc-500 italic mt-2 leading-relaxed text-center sm:text-left">
                            Dimensi Disarankan: 1200x400 px (Rasio 3:1) &bull; Format: PNG, JPG, WEBP &bull; Maksimal 2MB
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
                  Informasi Profil & Media Sosial
                </CardTitle>
                <CardDescription className="font-bold italic text-[11px] md:text-xs text-slate-400">
                  Edit status misi streaming dan pasang semua link sosial media Anda secara lengkap
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  
                  {/* Role / Profession Input */}
                  <div className="space-y-2">
                    <Label className="font-black italic text-xs md:text-sm text-slate-500 dark:text-zinc-400">
                      Profesi / Jenis Kreator (Role Badge)
                    </Label>
                    <Input 
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Contoh: STREAMER & KREATOR, PROFESSIONAL GAMER, ARTIST, dll."
                      className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-[#FAF9F6] text-black text-xs md:text-sm dark:bg-[#1E1E1D] dark:text-white px-3 font-bold"
                    />
                  </div>

                  {/* Bio status input */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="font-black italic text-xs md:text-sm text-slate-500 dark:text-zinc-400">Status Misi / Bio Publik</Label>
                      <span className="text-[11px] md:text-xs font-bold text-muted-foreground italic">{editBio?.length || 0}/500 Karakter</span>
                    </div>
                    <textarea
                      rows={3}
                      value={editBio}
                      maxLength={500}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="Contoh: Misi: Push Rank MLBB Sampai Mythical Glory! Support terus biar semangat live streaming mabar tiap malam."
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

          {/* RIGHT PANEL: LINK SHARING & QR CODE */}
          <div className="space-y-6">
            
            {/* 1. PUBLIC PROFILE SHARING */}
            <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
              <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
                <CardTitle className="font-black italic text-sm md:text-base tracking-wider text-black dark:text-[#FFD551] flex items-center gap-2">
                  Tautan Halaman Dukungan
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

            {/* 2. HIGH-FIDELITY BRANDED OBS QR CODE */}
            <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
              <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
                <CardTitle className="font-black italic text-sm md:text-base tracking-wider text-black dark:text-[#FFD551] flex items-center gap-2">
                  QR Code Dukungan OBS
                </CardTitle>
                <CardDescription className="font-bold italic text-[11px] md:text-xs text-slate-400">
                  Tampilkan QR Code premium ini langsung di overlay OBS saat live stream agar fans mudah berdonasi!
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 flex flex-col items-center space-y-6">
                
                {/* Visual QR Container */}
                <div className="relative p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 max-w-[200px] aspect-square flex items-center justify-center select-none overflow-hidden">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=0b0b0a&bgcolor=ffd551&data=${encodeURIComponent(`${originUrl}/${profile?.username}`)}`}
                    alt={`QR Code @${profile?.username}`}
                    className="w-full h-full object-contain rounded-2xl"
                  />
                </div>

                <div className="text-center space-y-1.5">
                  <h4 className="text-xs md:text-sm font-black uppercase italic tracking-wider text-black dark:text-white">QR Code Premium @{profile?.username}</h4>
                  <p className="text-[11px] md:text-xs font-medium text-slate-400 italic max-w-[220px] leading-normal">
                    Didesain khusus dengan kontras warna Treatme untuk OBS. Scan QR langsung menuju form pembayaran instan!
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



      {profileSubTab === "customization" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT & CENTER PANEL */}
          <div className="lg:col-span-2 space-y-6">
            
            <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
              <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
                <CardTitle className="font-black italic text-sm md:text-base tracking-wider text-black dark:text-[#FFD551] flex items-center gap-2">
                  Kustomisasi Tampilan & Target Donasi
                </CardTitle>
                <CardDescription className="font-bold italic text-[11px] md:text-xs text-slate-400">
                  Sesuaikan visibilitas sektor, target nominal dukungan, dan teks tombol utama halaman kreator Anda.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmitProfile} className="space-y-6">
                  
                  {/* 1. TARGET GOALS */}
                  <div className="space-y-4">
                    <Label className="font-black italic text-xs md:text-sm text-slate-500 dark:text-zinc-400 block">Pengaturan Target Donasi</Label>
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

                      {/* --- LIVE OVERLAY WIDGET STYLING --- */}
                      <div className="md:col-span-2 border-t border-slate-100 dark:border-zinc-900 pt-4 mt-2 space-y-4">
                        <Label className="font-black italic text-xs md:text-sm text-[#FFD551] block uppercase tracking-wider">
                          🎨 KUSTOMISASI LIVE OVERLAY TARGET DONASI (OBS)
                        </Label>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Title Card Overlay */}
                          <div className="space-y-2">
                            <Label className="font-bold italic text-xs text-slate-500 dark:text-zinc-400">Judul Card di Overlay (Custom Title)</Label>
                            <Input 
                              type="text"
                              value={targetCardTitle}
                              onChange={(e) => setTargetCardTitle(e.target.value)}
                              placeholder="Contoh: TARGET DONASI atau Bisa Kali Bulan Ini"
                              className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-[#FAF9F6] text-black text-xs md:text-sm dark:bg-[#1E1E1D] dark:text-white px-3"
                            />
                          </div>

                          {/* Canvas Transparent Switch */}
                          <div className="flex items-center justify-between p-3 border border-slate-200/60 dark:border-zinc-800 rounded-xl bg-slate-50/50 dark:bg-zinc-900/40">
                            <div className="space-y-0.5">
                              <Label className="font-bold italic text-xs text-slate-500 dark:text-zinc-400">Mode Transparan</Label>
                              <p className="text-[10px] font-semibold text-slate-400">Sembunyikan background card & border</p>
                            </div>
                            <Switch 
                              checked={targetCanvasTransparent} 
                              onCheckedChange={setTargetCanvasTransparent} 
                            />
                          </div>
                        </div>

                        {!targetCanvasTransparent && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border border-slate-200/50 dark:border-zinc-800/80 rounded-2xl bg-slate-50/20 dark:bg-zinc-900/20">
                            {/* Header Background */}
                            <div className="space-y-1.5">
                              <Label className="font-bold italic text-[11px] text-slate-500 dark:text-zinc-400">BG Header</Label>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="color" 
                                  value={targetHeaderBg} 
                                  onChange={e => setTargetHeaderBg(e.target.value)} 
                                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent" 
                                />
                                <span className="text-[11px] font-bold text-slate-550 dark:text-zinc-400 font-mono">{targetHeaderBg}</span>
                              </div>
                            </div>

                            {/* Header Text Color */}
                            <div className="space-y-1.5">
                              <Label className="font-bold italic text-[11px] text-slate-500 dark:text-zinc-400">Teks Header</Label>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="color" 
                                  value={targetHeaderTextColor} 
                                  onChange={e => setTargetHeaderTextColor(e.target.value)} 
                                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent" 
                                />
                                <span className="text-[11px] font-bold text-slate-550 dark:text-zinc-400 font-mono">{targetHeaderTextColor}</span>
                              </div>
                            </div>

                            {/* Body Background */}
                            <div className="space-y-1.5">
                              <Label className="font-bold italic text-[11px] text-slate-500 dark:text-zinc-400">BG Body</Label>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="color" 
                                  value={targetBodyBg} 
                                  onChange={e => setTargetBodyBg(e.target.value)} 
                                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent" 
                                />
                                <span className="text-[11px] font-bold text-slate-550 dark:text-zinc-400 font-mono">{targetBodyBg}</span>
                              </div>
                            </div>

                            {/* Body Text Color */}
                            <div className="space-y-1.5">
                              <Label className="font-bold italic text-[11px] text-slate-500 dark:text-zinc-400">Teks Body</Label>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="color" 
                                  value={targetBodyTextColor} 
                                  onChange={e => setTargetBodyTextColor(e.target.value)} 
                                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent" 
                                />
                                <span className="text-[11px] font-bold text-slate-550 dark:text-zinc-400 font-mono">{targetBodyTextColor}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Progress Bar & Goal Color */}
                        <div className="space-y-2">
                          <Label className="font-bold italic text-xs text-slate-500 dark:text-zinc-400">Warna Progress Bar & Nominal Target</Label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="color" 
                              value={targetProgressColor} 
                              onChange={e => setTargetProgressColor(e.target.value)} 
                              className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent" 
                            />
                            <span className="text-[11px] font-bold text-slate-550 dark:text-zinc-400 font-mono">{targetProgressColor}</span>
                          </div>
                        </div>
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
                            <Target className={`h-4.5 w-4.5 transition-colors ${showTarget ? "text-[#FFD551]" : "text-slate-400 dark:text-zinc-555"}`} />
                          </div>
                          <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out flex items-center ${
                            showTarget 
                              ? "bg-emerald-500" 
                              : "bg-slate-200 dark:bg-zinc-800"
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
                            <Zap className={`h-4.5 w-4.5 transition-colors ${showQueue ? "text-[#FFD551]" : "text-slate-400 dark:text-zinc-555"}`} />
                          </div>
                          <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out flex items-center ${
                            showQueue 
                              ? "bg-emerald-500" 
                              : "bg-slate-200 dark:bg-zinc-800"
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
                            <Star className={`h-4.5 w-4.5 transition-colors ${showReviews ? "text-[#FFD551]" : "text-slate-400 dark:text-zinc-555"}`} />
                          </div>
                          <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out flex items-center ${
                            showReviews 
                              ? "bg-emerald-500" 
                              : "bg-slate-200 dark:bg-zinc-800"
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
                            <Calendar className={`h-4.5 w-4.5 transition-colors ${showCalendar ? "text-[#FFD551]" : "text-slate-400 dark:text-zinc-555"}`} />
                          </div>
                          <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out flex items-center ${
                            showCalendar 
                              ? "bg-emerald-500" 
                              : "bg-slate-200 dark:bg-zinc-800"
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
                            <Gamepad2 className={`h-4.5 w-4.5 transition-colors ${showServices ? "text-[#FFD551]" : "text-slate-400 dark:text-zinc-555"}`} />
                          </div>
                          <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out flex items-center ${
                            showServices 
                              ? "bg-emerald-500" 
                              : "bg-slate-200 dark:bg-zinc-800"
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
                    <Label className="font-black italic text-xs md:text-sm text-slate-500 dark:text-zinc-400 block">Kustomisasi Teks Tombol Utama Profil</Label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Support Button (Left) */}
                      <div className="p-4 rounded-2xl border border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-[#121211] space-y-3">
                        <Label className="font-black italic text-xs text-amber-500 flex items-center gap-1.5">
                          Kustom Tombol Dukungan / Donasi
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
                            Kustom Tombol Layanan / Jasa Mabar
                          </Label>
                          <button
                            type="button"
                            onClick={() => setShowServices(!showServices)}
                            className={`px-2 py-0.5 rounded-full text-[10px] md:text-xs font-black italic border transition-all active:scale-95 ${
                              showServices 
                                ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800/80 dark:text-emerald-400" 
                                : "bg-slate-100 border-slate-200 text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-505"
                            }`}
                          >
                            {showServices ? "AKTIF" : "NONAKTIF"}
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
                      Kelola Jadwal Live Streaming
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
                    <DialogContent className="bg-white dark:bg-[#121211] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md">
                      <DialogHeader>
                        <DialogTitle className="font-black italic text-base text-black dark:text-white">Tambah Jadwal Live Streaming Baru</DialogTitle>
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
                            Tambahkan Jadwal
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="p-0">
                  {schedules?.length === 0 ? (
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
                        {schedules?.map((sched: any) => {
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
                                <Badge className="bg-[#FFD551]/10 text-black border border-[#FFD551]/30 dark:text-[#FFD551] dark:border-[#FFD551]/30 font-black italic text-[10px] px-2 py-0.5 rounded-lg shrink-0">
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

          {/* RIGHT PANEL: LINK SHARING & QR CODE */}
          <div className="space-y-6">
            
            {/* 1. PUBLIC PROFILE SHARING */}
            <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
              <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
                <CardTitle className="font-black italic text-xs tracking-wider text-black dark:text-[#FFD551] flex items-center gap-2">
                  Tautan Halaman Dukungan
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

            {/* 2. HIGH-FIDELITY BRANDED OBS QR CODE */}
            <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
              <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
                <CardTitle className="font-black italic text-xs tracking-wider text-black dark:text-[#FFD551] flex items-center gap-2">
                  QR Code Dukungan OBS
                </CardTitle>
                <CardDescription className="font-bold italic text-[9px] text-slate-400">
                  Tampilkan QR Code premium ini langsung di overlay OBS saat live stream agar fans mudah berdonasi!
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 flex flex-col items-center space-y-6">
                
                {/* Visual QR Container */}
                <div className="relative p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 max-w-[200px] aspect-square flex items-center justify-center select-none overflow-hidden">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=0b0b0a&bgcolor=ffd551&data=${encodeURIComponent(`${originUrl}/${profile?.username}`)}`}
                    alt={`QR Code @${profile?.username}`}
                    className="w-full h-full object-contain rounded-2xl"
                  />
                </div>

                <div className="text-center space-y-1.5">
                  <h4 className="text-xs font-black uppercase italic tracking-wider text-black dark:text-white">QR Code Premium @{profile?.username}</h4>
                  <p className="text-[11px] font-medium text-slate-400 italic max-w-[220px] leading-normal">
                    Didesain khusus dengan kontras warna Treatme untuk OBS. Scan QR langsung menuju form pembayaran instan!
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



      {profileSubTab === "verified" && (
        <div className="space-y-6">
          {profile?.is_verified ? (
            /* CASE 1: VERIFIED SUCCESSFULLY */
            <Card className="border-3 border-[#FFD551] rounded-2xl bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent dark:from-yellow-950/20 dark:to-transparent p-8 md:p-12 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
              
              <div className="max-w-xl mx-auto space-y-6 relative z-10 flex flex-col items-center">
                <div className="h-24 w-24 rounded-full bg-amber-500/10 border-2 border-[#FFD551] flex items-center justify-center shadow-lg animate-bounce duration-1000">
                  <VerifiedBadge className="h-16 w-16" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter text-black dark:text-[#FFD551] uppercase">Akun Anda Terverifikasi!</h2>
                  <p className="text-xs md:text-sm font-semibold text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Selamat! Identitas Anda telah resmi divalidasi oleh sistem keamanan Treatme. Lencana centang hijau kini aktif secara publik pada seluruh profil dan widget overlay Anda.
                  </p>
                </div>

                <div className="w-full bg-white dark:bg-[#1E1E1D]/55 border border-slate-200/60 dark:border-zinc-800 p-6 rounded-3xl text-left space-y-4 shadow-sm mt-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Saluran Media Sosial Terhubung</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-bold text-slate-700 dark:text-zinc-300">
                    {editYoutube && <div className="flex items-center gap-2">YouTube: <span className="text-slate-400 truncate max-w-[150px] font-semibold">{editYoutube}</span></div>}
                    {editTiktok && <div className="flex items-center gap-2">TikTok: <span className="text-slate-400 truncate max-w-[150px] font-semibold">{editTiktok}</span></div>}
                    {editInstagram && <div className="flex items-center gap-2">Instagram: <span className="text-slate-400 truncate max-w-[150px] font-semibold">{editInstagram}</span></div>}
                    {editTwitch && <div className="flex items-center gap-2">Twitch: <span className="text-slate-400 truncate max-w-[150px] font-semibold">{editTwitch}</span></div>}
                    {editFacebook && <div className="flex items-center gap-2">Facebook: <span className="text-slate-400 truncate max-w-[150px] font-semibold">{editFacebook}</span></div>}
                    {editDiscord && <div className="flex items-center gap-2">Discord: <span className="text-slate-400 truncate max-w-[150px] font-semibold">{editDiscord}</span></div>}
                  </div>
                </div>
              </div>
            </Card>
          ) : profile?.verification_status === "PENDING" ? (
            /* CASE 2: PENDING - Waiting for admin review */
            <Card className="border-2 border-amber-500/50 rounded-2xl bg-gradient-to-br from-amber-500/5 via-transparent to-transparent dark:from-amber-950/10 dark:to-transparent p-8 md:p-12 text-center relative overflow-hidden shadow-lg">
              <div className="max-w-xl mx-auto space-y-6 relative z-10 flex flex-col items-center">
                <div className="h-20 w-20 rounded-full bg-amber-500/10 border-2 border-amber-400 flex items-center justify-center shadow-lg">
                  <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
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
                  Verifikasi Ditolak
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
                  Ajukan Lencana Verified
                </h3>
                <p className="font-semibold text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Upload bukti kepemilikan akun media sosial Anda. Tim admin akan meninjau dan menyetujui pengajuan Anda.
                </p>
              </div>

              {!(editYoutube || editTiktok || editInstagram || editTwitch || editFacebook || editDiscord) ? (
                /* CASE 3A: No Social Links Connected */
                <div className="bg-red-500/5 dark:bg-red-950/10 border border-red-500/25 p-6 md:p-8 rounded-2xl text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-950/35 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto text-xl font-bold">
                    <AlertCircle className="h-6 w-6" />
                  </div>
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
                    Hubungkan Media Sosial Sekarang
                  </Button>
                </div>
              ) : (
                <VerificationForm />
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
