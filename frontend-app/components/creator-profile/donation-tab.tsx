"use client"

import React, { useState, useEffect } from "react"
import { Send, ShieldCheck, Mail, AlertCircle, Lock, Unlock, Gamepad2, Mic, CheckCircle2, Loader2, Music, Sparkles, Video } from "lucide-react"
import { useCurrency } from "@/components/currency-provider"
import { useLanguage } from "@/components/language-provider"
import { toast } from "sonner"
import { formatNumberInput, parseNumberInput } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { API_BASE_URL } from "@/lib/api"
import { TermsModal } from "./terms-modal"

interface PaymentMethod {
  id: string
  name: string
  logo: string
  fee: string
  feeAmount: number  // numeric value for calculation
  feeType: 'fixed' | 'percent'  // fixed = Rp, percent = %
}

interface ActiveGift {
  id: string
  name: string
  url: string
  price: number
}

interface MediaCheckResult {
  valid: boolean
  rawUrl: string
  normalizedUrl: string
  mediaUrl: string
  mediaType: "YOUTUBE" | "TIKTOK" | "REELS"
  autoplaySupported: boolean
  playbackMode: string
  message: string
  cacheExpiresAt?: string
  importError?: string
}

interface DonationTabProps {
  creatorDbData: any
  displayUsername: string
  config: any
  onDonationSubmit: (donationData: {
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
  }) => Promise<void>
}

export function DonationTab({
  creatorDbData,
  displayUsername,
  config,
  onDonationSubmit
}: DonationTabProps) {
  const { currency, convertFromIdr, convertToIdr, format: formatCurrency, config: currencyCfg } = useCurrency()
  const { lang, t } = useLanguage()
  const isIndo = lang === "id"

  // Form states
  const [donationAmount, setDonationAmount] = useState<string>("")
  const [senderName, setSenderName] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [senderContact, setSenderContact] = useState("")
  const [senderMessage, setSenderMessage] = useState("")
  const [mediashareUrl, setMediashareUrl] = useState("")
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null)
  const [showPaymentSelection, setShowPaymentSelection] = useState(false)
  const [activeGifts, setActiveGifts] = useState<ActiveGift[]>([])
  const [isGachaSelected, setIsGachaSelected] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTermsConfirmed, setIsTermsConfirmed] = useState(false)
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)
  const [selectedMediaType, setSelectedMediaType] = useState<"YOUTUBE" | "TIKTOK" | "REELS" | "TEBAK_GAMBAR" | "VOICE_NOTE" | null>(null)
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null)
  const [selectedSoundboardItemId, setSelectedSoundboardItemId] = useState<string | null>(null)
  const [mediaCheck, setMediaCheck] = useState<MediaCheckResult | null>(null)
  const [mediaCheckError, setMediaCheckError] = useState("")
  const [isCheckingMedia, setIsCheckingMedia] = useState(false)
  const [globalMediashareUrl, setGlobalMediashareUrl] = useState("")
  const [globalMediaCheck, setGlobalMediaCheck] = useState<MediaCheckResult | null>(null)
  const [globalMediaCheckError, setGlobalMediaCheckError] = useState("")
  const [isCheckingGlobalMedia, setIsCheckingGlobalMedia] = useState(false)
  const [isMediashareSelected, setIsMediashareSelected] = useState(false)
  const [isInteractiveSelected, setIsInteractiveSelected] = useState(false)

  // Calculations
  const mediaSetting = creatorDbData?.creator_media_setting

  // IG Reels saat ini Coming Soon → jangan izinkan dari halaman Donasi
  const isMediashareEnabled = (creatorDbData?.widget_setting?.mediashare_enabled ?? true) && (!mediaSetting || mediaSetting.global_toggle)
  const isInteractiveEnabled = (!mediaSetting || mediaSetting.global_toggle)
  const isGiftEnabled = (!mediaSetting || mediaSetting.global_toggle) && (mediaSetting?.gift_toggle ?? true)

  const minMediashareDonation = creatorDbData?.widget_setting?.mediashare_min_donation ? parseFloat(creatorDbData.widget_setting.mediashare_min_donation) : 15000
  const isLocked = Number(donationAmount || 0) < convertFromIdr(minMediashareDonation)

  // Deselect Gacha if the user manually lowers the donation amount below min_donation
  useEffect(() => {
    if (isGachaSelected) {
      const gachaMinPrice = creatorDbData?.gacha_setting?.min_donation ? Number(creatorDbData.gacha_setting.min_donation) : 0
      const currentAmountIdr = convertToIdr(Number(donationAmount || 0))
      if (currentAmountIdr < gachaMinPrice) {
        setIsGachaSelected(false)
        toast.info(isIndo
          ? "Gacha Challenge dinonaktifkan karena nominal dukungan di bawah batas minimal."
          : "Gacha Challenge disabled because the support amount is below the minimum limit.", { duration: 3000 })
      }
    }
  }, [donationAmount, isGachaSelected, creatorDbData, convertToIdr, isIndo])

  // Deselect Media Share if the user manually lowers the donation amount below min_donation
  useEffect(() => {
    if (isMediashareSelected) {
      const minMediashareConverted = convertFromIdr(minMediashareDonation)
      if (Number(donationAmount || 0) < minMediashareConverted) {
        setIsMediashareSelected(false)
        setGlobalMediashareUrl("")
        setGlobalMediaCheck(null)
        setGlobalMediaCheckError("")
        toast.info(isIndo
          ? "Media Share dinonaktifkan karena nominal dukungan di bawah batas minimal."
          : "Media Share disabled because the support amount is below the minimum limit.", { duration: 3000 })
      }
    }
  }, [donationAmount, isMediashareSelected, minMediashareDonation, convertFromIdr, isIndo])

  // Fetch active payment channels from API
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/payment-channels/`)
        const json = await res.json()
        if (json.success && json.data) {
          const methods: PaymentMethod[] = json.data.map((ch: any) => {
            const feeVal = ch.minFee || 0
            const isPercent = feeVal > 0 && feeVal < 100
            return {
              id: ch.code || ch.id,
              name: ch.name,
              logo: ch.logoUrl.startsWith("http") ? ch.logoUrl : `${API_BASE_URL.replace('/api/v1', '')}${ch.logoUrl}`,
              fee: feeVal > 0 ? (isPercent ? `${feeVal}%` : `Rp ${feeVal.toLocaleString("id-ID")}`) : (isIndo ? "Gratis" : "Free"),
              feeAmount: feeVal,
              feeType: isPercent ? 'percent' : 'fixed'
            }
          })
          // Sort: QRIS first, then alphabetically
          methods.sort((a, b) => {
            if (a.id === 'qris') return -1
            if (b.id === 'qris') return 1
            return a.name.localeCompare(b.name)
          })
          setPaymentMethods(methods)
          if (methods.length > 0) {
            setSelectedPayment(methods[0])
          }
        }
      } catch (err) {
        console.warn("Gagal memuat metode pembayaran:", err)
      }
    }
    fetchPaymentMethods()
  }, [isIndo])

  useEffect(() => {
    const fetchActiveGifts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/public/gifts/${displayUsername}`)
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          setActiveGifts(json.data)
        } else {
          setActiveGifts([])
        }
      } catch (err) {
        console.warn("Gagal memuat gift animasi:", err)
        setActiveGifts([])
      }
    }
    fetchActiveGifts()
  }, [displayUsername])


  // Fee calculation
  const donationAmountNum = Number(donationAmount || 0)
  const idrAmount = convertToIdr(donationAmountNum)
  const paymentFee = selectedPayment
    ? selectedPayment.feeType === 'fixed'
      ? selectedPayment.feeAmount
      : Math.ceil(idrAmount * (selectedPayment.feeAmount / 100))
    : 0
  const totalWithFee = idrAmount + paymentFee

  const quickAmounts = [
    { amount: Math.round(convertFromIdr(5000) * 100) / 100, label: `${formatCurrency(convertFromIdr(5000))}`, tier: isIndo ? "Gamer Pemula" : "Novice Gamer" },
    { amount: Math.round(convertFromIdr(10000) * 100) / 100, label: `${formatCurrency(convertFromIdr(10000))}`, tier: isIndo ? "Player Elite" : "Elite Player" },
    { amount: Math.round(convertFromIdr(50000) * 100) / 100, label: `${formatCurrency(convertFromIdr(50000))}`, tier: isIndo ? "Dukungan Super" : "Super Support" },
    { amount: Math.round(convertFromIdr(100000) * 100) / 100, label: `${formatCurrency(convertFromIdr(100000))}`, tier: isIndo ? "Sponsor Utama" : "Main Sponsor" },
  ]

  const selectMediaType = (type: "YOUTUBE" | "TIKTOK" | "REELS" | "TEBAK_GAMBAR" | "VOICE_NOTE") => {
    if (type === 'REELS') return

    const isSelected = selectedMediaType === type
    setSelectedMediaType(isSelected ? null : type)
    setMediashareUrl("")
    setMediaCheck(null)
    setMediaCheckError("")

    if (!isSelected) {
      // Mutual exclusion: deselect others to prevent double overlays
      setIsGachaSelected(false)
      setSelectedGiftId(null)
      setSelectedSoundboardItemId(null)
      setGlobalMediashareUrl("")
      setGlobalMediaCheck(null)
      setGlobalMediaCheckError("")
    }
  }

  const checkMediaUrl = async () => {
    if (!selectedMediaType || !["YOUTUBE", "TIKTOK", "REELS"].includes(selectedMediaType)) return null
    const rawUrl = mediashareUrl.trim()
    if (!rawUrl) {
      setMediaCheck(null)
      setMediaCheckError(isIndo ? "Masukkan link media terlebih dahulu." : "Please enter the media link first.")
      return null
    }

    setIsCheckingMedia(true)
    setMediaCheckError("")
    try {
      const res = await fetch(`${API_BASE_URL}/users/media/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: rawUrl, mediaType: selectedMediaType, importToCache: selectedMediaType === "REELS" })
      })
      const json = await res.json()
      if (!json.success) {
        setMediaCheck(null)
        setMediaCheckError(json.message || (isIndo ? "Link media tidak valid." : "Invalid media link."))
        return null
      }

      const result: MediaCheckResult = {
        valid: true,
        rawUrl,
        normalizedUrl: json.data.normalizedUrl,
        mediaUrl: json.data.mediaUrl || json.data.cachedUrl || json.data.normalizedUrl,
        mediaType: json.data.mediaType,
        autoplaySupported: !!json.data.autoplaySupported,
        playbackMode: json.data.playbackMode,
        message: json.data.message,
        cacheExpiresAt: json.data.cacheExpiresAt,
        importError: json.data.importError
      }
      setMediaCheck(result)
      setMediashareUrl(result.normalizedUrl)
      return result
    } catch {
      setMediaCheck(null)
      setMediaCheckError(isIndo ? "Gagal cek link media. Coba lagi sebentar." : "Failed to check media link. Please try again in a moment.")
      return null
    } finally {
      setIsCheckingMedia(false)
    }
  }

  const checkGlobalMediaUrl = async () => {
    const rawUrl = globalMediashareUrl.trim()
    if (!rawUrl) {
      setGlobalMediaCheck(null)
      setGlobalMediaCheckError(isIndo ? "Masukkan link video terlebih dahulu." : "Please enter the video link first.")
      return null
    }

    setIsCheckingGlobalMedia(true)
    setGlobalMediaCheckError("")
    try {
      const res = await fetch(`${API_BASE_URL}/users/media/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: rawUrl, mediaType: "YOUTUBE" })
      })
      const json = await res.json()
      if (!json.success) {
        setGlobalMediaCheck(null)
        setGlobalMediaCheckError(json.message || (isIndo ? "Link video tidak valid." : "Invalid video link."))
        return null
      }

      const result: MediaCheckResult = {
        valid: true,
        rawUrl,
        normalizedUrl: json.data.normalizedUrl,
        mediaUrl: json.data.mediaUrl || json.data.cachedUrl || json.data.normalizedUrl,
        mediaType: json.data.mediaType,
        autoplaySupported: !!json.data.autoplaySupported,
        playbackMode: json.data.playbackMode,
        message: json.data.message,
        cacheExpiresAt: json.data.cacheExpiresAt,
        importError: json.data.importError
      }
      setGlobalMediaCheck(result)
      setGlobalMediashareUrl(result.normalizedUrl)
      return result
    } catch {
      setGlobalMediaCheck(null)
      setGlobalMediaCheckError(isIndo ? "Gagal cek link video. Coba lagi sebentar." : "Failed to check video link. Please try again in a moment.")
      return null
    } finally {
      setIsCheckingGlobalMedia(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      let resolvedGlobalUrl = ""
      if (isMediashareSelected && globalMediashareUrl.trim() && !isLocked) {
        let checkedGlobal = globalMediaCheck
        if (!checkedGlobal || checkedGlobal.normalizedUrl !== globalMediashareUrl.trim()) {
          checkedGlobal = await checkGlobalMediaUrl()
        }
        if (!checkedGlobal) return
        resolvedGlobalUrl = checkedGlobal.mediaUrl || checkedGlobal.normalizedUrl || globalMediashareUrl.trim()
      }

      const isVideo = selectedMediaType && ["YOUTUBE", "TIKTOK", "REELS"].includes(selectedMediaType)
      let checkedMedia = mediaCheck
      if (isInteractiveSelected && selectedMediaType && !isLocked) {
        if (["YOUTUBE", "TIKTOK", "TEBAK_GAMBAR", "VOICE_NOTE"].includes(selectedMediaType)) {
          if (!checkedMedia || checkedMedia.normalizedUrl !== mediashareUrl.trim()) {
            if (isVideo) {
              checkedMedia = await checkMediaUrl()
            } else {
              checkedMedia = {
                valid: true,
                rawUrl: mediashareUrl.trim(),
                normalizedUrl: mediashareUrl.trim(),
                mediaUrl: mediashareUrl.trim(),
                mediaType: selectedMediaType as any,
                autoplaySupported: true,
                playbackMode: "NORMAL",
                message: ""
              }
            }
          }
          if (!checkedMedia) return
        }
      }

      const finalMediashareUrl = isMediashareSelected ? resolvedGlobalUrl : ""

      await onDonationSubmit({
        amount: donationAmount,
        senderName,
        isAnonymous,
        senderContact,
        senderMessage,
        mediashareUrl: finalMediashareUrl,
        giftId: isGiftEnabled ? selectedGiftId : null,
        soundboardItemId: selectedSoundboardItemId,
        donationMedia: (isInteractiveSelected && selectedMediaType) ? {
          media_type: selectedMediaType,
          media_url: (checkedMedia?.mediaUrl || checkedMedia?.normalizedUrl || mediashareUrl)
        } : null
      })
      // Clear forms on success
      setDonationAmount("")
      setSenderName("")
      setSenderContact("")
      setSenderMessage("")
      setMediashareUrl("")
      setGlobalMediashareUrl("")
      setSelectedMediaType(null)
      setSelectedGiftId(null)
      setSelectedSoundboardItemId(null)
      setMediaCheck(null)
      setGlobalMediaCheck(null)
      setMediaCheckError("")
      setGlobalMediaCheckError("")
      setIsGachaSelected(false)
      setIsMediashareSelected(false)
      setIsInteractiveSelected(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7 flex-1 flex flex-col justify-between">

      {/* Nominal Input Row */}
      <div className="space-y-1.5">
        <Label htmlFor="donationAmount" className="text-[10px] font-black uppercase tracking-widest italic text-slate-500 dark:text-[#A09E96]">
          {t.common.supportAmount || (isIndo ? "Jumlah Dukungan" : "Support Amount")} ({currency})
        </Label>
        <div className="relative">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black text-zinc-500 dark:text-zinc-400 italic select-none">{currencyCfg.symbol}</span>
          <Input
            id="donationAmount"
            type="text"
            required
            value={formatNumberInput(donationAmount)}
            onChange={(e) => setDonationAmount(String(parseNumberInput(e.target.value)))}
            placeholder={currency === "IDR" ? "10.000" : "5"}
            className="pl-16 h-16 rounded-2xl border border-slate-200 font-black italic text-3xl md:text-3xl shadow-sm focus-visible:ring-0 focus:border-[#FFD551] dark:border-zinc-800 dark:bg-[#1E1E1E] text-black dark:text-white"
          />
        </div>
      </div>

      {/* Quick Amount Pills Choice */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {quickAmounts.map((q) => (
          <button
            key={q.amount}
            type="button"
            onClick={() => setDonationAmount(String(q.amount))}
            className={`p-2.5 rounded-xl flex flex-col items-center justify-center active:scale-[0.96] transition-all duration-200 ${Number(donationAmount) === q.amount
              ? "bg-[#FFD551] border border-[#FFD551] text-zinc-950 font-black italic shadow-sm"
              : "bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-[#FFD551] dark:hover:border-zinc-700 shadow-sm"
              }`}
          >
            <span className="text-xs font-black">{q.label}</span>
            <span className={`text-[8px] font-black leading-none mt-1 uppercase tracking-wider ${Number(donationAmount) === q.amount
              ? "text-zinc-850/80 dark:text-zinc-900/90"
              : "text-zinc-500 dark:text-zinc-400"
              }`}>{q.tier}</span>
          </button>
        ))}
      </div>      {/* Feature Selector Cards (Mutually Exclusive) */}
      <div className="space-y-4">
        {/* Gacha Challenge Info Card */}
        {creatorDbData?.gacha_setting?.is_enabled && (
          <div className={`p-6 bg-slate-50/60 dark:bg-zinc-900/40 border rounded-3xl flex flex-col md:flex-row md:items-center md:justify-between gap-5 shadow-sm text-left select-none transition-all duration-200 ${
            isGachaSelected
              ? "border-[#FFD551] dark:border-[#FFD551] bg-[#FFD551]/5 shadow-[0_0_15px_rgba(255,213,81,0.1)] scale-[1.01]"
              : "border-slate-200/80 dark:border-zinc-800 opacity-75 hover:opacity-100"
          }`}>
            <div className="space-y-2.5 flex-1">
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-amber-600 dark:text-[#FFD551]">
                <Sparkles className="h-5 w-5 text-[#FFD551] animate-bounce shrink-0" /> {isIndo ? "GACHA CHALLENGE STREAMER AKTIF!" : "ACTIVE STREAMER GACHA CHALLENGE!"}
              </div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-zinc-200 leading-relaxed">
                {isIndo
                  ? `Dukungan minimal `
                  : `A minimum support of `}
                <span className="font-black text-black dark:text-white bg-[#FFD551]/20 dark:bg-[#FFD551]/10 px-2 py-0.5 rounded border border-[#FFD551]/30">Rp {Number(creatorDbData.gacha_setting.min_donation).toLocaleString("id-ID")}</span>
                {isIndo
                  ? ` akan memicu putaran Gacha Wheel langsung di layar stream secara Live!`
                  : ` will trigger a Gacha Wheel spin directly live on the stream screen!`}
              </p>
              {creatorDbData.gacha_wheel_items && creatorDbData.gacha_wheel_items.length > 0 && (() => {
                const totalWeight = creatorDbData.gacha_wheel_items.reduce((sum: number, i: any) => sum + (Number(i.weight) || 1), 0)

                return (
                  <div className="flex flex-col gap-1.5 pt-2.5 border-t border-slate-200/65 dark:border-zinc-800/80">
                    <span className="text-[9px] font-black uppercase text-slate-500 dark:text-zinc-400 tracking-wider">{isIndo ? "Hadiah yang bisa Anda dapatkan:" : "Prizes you can win:"}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {creatorDbData.gacha_wheel_items.map((item: any) => {
                        const getContrastColor = (colorHex: string) => {
                          if (!colorHex) return "#FFFFFF"
                          const cleanHex = colorHex.replace("#", "")
                          if (cleanHex.length !== 6) return "#FFFFFF"
                          const r = parseInt(cleanHex.substring(0, 2), 16)
                          const g = parseInt(cleanHex.substring(2, 4), 16)
                          const b = parseInt(cleanHex.substring(4, 6), 16)
                          const yiq = (r * 299 + g * 587 + b * 114) / 1000
                          return yiq >= 160 ? "#000000" : "#FFFFFF"
                        }
                        const badgeColor = item.color || "#FFD551"
                        const textColor = getContrastColor(badgeColor)
                        const itemWeight = Number(item.weight) || 1
                        const percentage = totalWeight > 0 ? ((itemWeight / totalWeight) * 100).toFixed(0) : "0"

                        return (
                          <span
                            key={item.id}
                            className="text-[9.5px] font-black uppercase px-3 py-1.5 rounded-xl border leading-none shadow-[1.5px_1.5px_0px_rgba(0,0,0,0.15)] transition-transform hover:scale-105 duration-150 flex items-center gap-1.5"
                            style={{
                              backgroundColor: badgeColor,
                              borderColor: badgeColor,
                              color: textColor
                            }}
                          >
                            <span>{item.name}</span>
                            <span
                              className="text-[8px] font-extrabold px-1 py-0.5 rounded bg-black/10 dark:bg-white/10"
                              style={{ color: textColor }}
                            >
                              {percentage}%
                            </span>
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}
            </div>
            <button
              type="button"
              onClick={() => {
                const newGachaState = !isGachaSelected
                setIsGachaSelected(newGachaState)

                if (newGachaState) {
                  setIsMediashareSelected(false)
                  setIsInteractiveSelected(false)
                  setGlobalMediashareUrl("")
                  setGlobalMediaCheck(null)
                  setGlobalMediaCheckError("")
                  setSelectedGiftId(null)
                  setSelectedSoundboardItemId(null)
                  setSelectedMediaType(null)
                  setMediashareUrl("")
                  setMediaCheck(null)
                  setMediaCheckError("")
                  
                  const gachaMinPriceConverted = convertFromIdr(Number(creatorDbData.gacha_setting.min_donation))
                  if (Number(donationAmount || 0) < gachaMinPriceConverted) {
                    setDonationAmount(String(gachaMinPriceConverted))
                  }
                  
                  toast.success(isIndo
                    ? `Gacha Challenge diaktifkan! Dukungan diset ke nominal minimal.`
                    : `Gacha Challenge activated! Support set to the minimum amount.`, { duration: 3000 })
                } else {
                  toast.success(isIndo ? `Gacha Challenge dinonaktifkan.` : `Gacha Challenge deactivated.`, { duration: 3000 })
                }
              }}
              className={`shrink-0 h-12 px-6 rounded-2xl text-xs md:text-sm font-black uppercase tracking-wider border shadow-sm transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 ${
                isGachaSelected
                  ? "bg-emerald-500 hover:bg-emerald-600 border-emerald-600 text-white animate-pulse"
                  : "bg-[#FFD551] border-slate-200 hover:bg-[#ffe07d] text-zinc-950 dark:border-zinc-800"
              }`}
            >
              {isGachaSelected
                ? (isIndo ? "GACHA AKTIF" : "GACHA ACTIVE")
                : (isIndo ? "IKUT GACHA" : "JOIN GACHA")}
            </button>
          </div>
        )}

        {/* Media Share Info Card */}
        {isMediashareEnabled && (
          <div className={`p-6 bg-slate-50/60 dark:bg-zinc-900/40 border rounded-3xl flex flex-col md:flex-row md:items-center md:justify-between gap-5 shadow-sm text-left select-none transition-all duration-200 ${
            isMediashareSelected
              ? "border-[#FFD551] dark:border-[#FFD551] bg-[#FFD551]/5 shadow-[0_0_15px_rgba(255,213,81,0.1)] scale-[1.01]"
              : "border-slate-200/80 dark:border-zinc-800 opacity-75 hover:opacity-100"
          }`}>
            <div className="space-y-2.5 flex-1">
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-amber-600 dark:text-[#FFD551]">
                <Video className="h-5 w-5 text-[#FFD551] shrink-0" /> {isIndo ? "MEDIA SHARE VIDEO STREAMER AKTIF!" : "ACTIVE STREAMER MEDIA SHARE!"}
              </div>
              <p className="text-xs font-extrabold text-slate-650 dark:text-zinc-300 leading-relaxed">
                {isIndo
                  ? `Dukungan minimal `
                  : `A minimum support of `}
                <span className="font-black text-black dark:text-white bg-[#FFD551]/20 dark:bg-[#FFD551]/10 px-2 py-0.5 rounded border border-[#FFD551]/30">Rp {Number(minMediashareDonation).toLocaleString("id-ID")}</span>
                {isIndo
                  ? ` akan memutar video landscape pilihan Anda di layar stream secara Live!`
                  : ` will play your landscape video of choice live on the stream screen!`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const newMediaShareState = !isMediashareSelected
                setIsMediashareSelected(newMediaShareState)

                if (newMediaShareState) {
                  setIsGachaSelected(false)
                  setIsInteractiveSelected(false)
                  setSelectedGiftId(null)
                  setSelectedSoundboardItemId(null)
                  setSelectedMediaType(null)
                  setMediashareUrl("")
                  setMediaCheck(null)
                  setMediaCheckError("")

                  const minMediaShareConverted = convertFromIdr(minMediashareDonation)
                  if (Number(donationAmount || 0) < minMediaShareConverted) {
                    setDonationAmount(String(minMediaShareConverted))
                  }

                  toast.success(isIndo
                    ? `Media Share diaktifkan! Dukungan diset ke nominal minimal.`
                    : `Media Share activated! Support set to the minimum amount.`, { duration: 3000 })
                } else {
                  setGlobalMediashareUrl("")
                  setGlobalMediaCheck(null)
                  setGlobalMediaCheckError("")
                  toast.success(isIndo ? `Media Share dinonaktifkan.` : `Media Share deactivated.`, { duration: 3000 })
                }
              }}
              className={`shrink-0 h-12 px-6 rounded-2xl text-xs md:text-sm font-black uppercase tracking-wider border shadow-sm transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 ${
                isMediashareSelected
                  ? "bg-emerald-500 hover:bg-emerald-600 border-emerald-600 text-white animate-pulse"
                  : "bg-[#FFD551] border-slate-200 hover:bg-[#ffe07d] text-zinc-950 dark:border-zinc-800"
              }`}
            >
              {isMediashareSelected
                ? (isIndo ? "MEDIA SHARE AKTIF" : "MEDIA SHARE ACTIVE")
                : (isIndo ? "PUTAR VIDEO" : "PLAY VIDEO")}
            </button>
          </div>
        )}

        {/* Fitur Interaktif Overlay Card */}
        {isInteractiveEnabled && (
          <div className={`p-6 bg-slate-50/60 dark:bg-zinc-900/40 border rounded-3xl flex flex-col md:flex-row md:items-center md:justify-between gap-5 shadow-sm text-left select-none transition-all duration-200 ${
            isInteractiveSelected
              ? "border-[#FFD551] dark:border-[#FFD551] bg-[#FFD551]/5 shadow-[0_0_15px_rgba(255,213,81,0.1)] scale-[1.01]"
              : "border-slate-200/80 dark:border-zinc-800 opacity-75 hover:opacity-100"
          }`}>
            <div className="space-y-2.5 flex-1">
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-amber-600 dark:text-[#FFD551]">
                <Gamepad2 className="h-5 w-5 text-[#FFD551] shrink-0" /> {isIndo ? "FITUR INTERAKTIF OVERLAY AKTIF!" : "ACTIVE INTERACTIVE OVERLAY WIDGET!"}
              </div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-zinc-200 leading-relaxed">
                {isIndo
                  ? `Kirim YouTube Shorts, TikTok Portrait, Tebak Gambar, atau Voice Note interaktif langsung ke siaran langsung!`
                  : `Send YouTube Shorts, TikTok Portrait, Guess the Picture, or Interactive Voice Notes directly onto the live stream!`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const newInteractiveState = !isInteractiveSelected
                setIsInteractiveSelected(newInteractiveState)

                if (newInteractiveState) {
                  setIsGachaSelected(false)
                  setIsMediashareSelected(false)
                  setGlobalMediashareUrl("")
                  setGlobalMediaCheck(null)
                  setGlobalMediaCheckError("")
                  setSelectedGiftId(null)
                  setSelectedSoundboardItemId(null)
                  setSelectedMediaType(null)
                  setMediashareUrl("")
                  setMediaCheck(null)
                  setMediaCheckError("")

                  toast.success(isIndo
                    ? `Fitur Interaktif diaktifkan! Silakan pilih jenis widget di bawah.`
                    : `Interactive Features activated! Please select a widget type below.`, { duration: 3000 })
                } else {
                  setSelectedMediaType(null)
                  setMediashareUrl("")
                  setMediaCheck(null)
                  setMediaCheckError("")
                  toast.success(isIndo ? `Fitur Interaktif dinonaktifkan.` : `Interactive Features deactivated.`, { duration: 3000 })
                }
              }}
              className={`shrink-0 h-12 px-6 rounded-2xl text-xs md:text-sm font-black uppercase tracking-wider border shadow-sm transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 ${
                isInteractiveSelected
                  ? "bg-emerald-500 hover:bg-emerald-600 border-emerald-600 text-white animate-pulse"
                  : "bg-[#FFD551] border-slate-200 hover:bg-[#ffe07d] text-zinc-950 dark:border-zinc-800"
              }`}
            >
              {isInteractiveSelected
                ? (isIndo ? "INTERAKTIF AKTIF" : "INTERACTIVE ACTIVE")
                : (isIndo ? "PILIH FITUR" : "SELECT FEATURE")}
            </button>
          </div>
        )}
      </div>


      {/* Sender Information Input Fields */}
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <Label htmlFor="senderName" className="text-[10px] font-black uppercase tracking-widest italic text-slate-700 dark:text-[#C8C6BC]">
            {t.publicProfile?.senderName || (isIndo ? "Nama Pengirim" : "Sender Name")}
          </Label>
          <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase italic cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-3 w-3 cursor-pointer"
            />
            {isIndo ? "Anonim" : "Anonymous"}
          </label>
        </div>

        {!isAnonymous && (
          <Input
            id="senderName"
            type="text"
            required
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder={t.publicProfile?.senderNamePlaceholder || (isIndo ? "BudiGamer / Nama Kerenmu" : "BudiGamer / Your Awesome Name")}
            className="h-12 rounded-xl border border-slate-200 font-extrabold text-xs dark:bg-zinc-900 dark:border-zinc-800 shadow-sm focus-visible:ring-0 focus-visible:border-[#FFD551]"
          />
        )}

        <div className="space-y-1.5 text-left">
          <Label htmlFor="senderContact" className="text-[10px] font-black uppercase tracking-widest italic text-slate-700 dark:text-[#C8C6BC]">
            {t.publicProfile?.senderContact || (isIndo ? "No. WhatsApp / Email (Opsional)" : "WhatsApp No. / Email (Optional)")}
          </Label>
          <Input
            id="senderContact"
            type="text"
            value={senderContact}
            onChange={(e) => setSenderContact(e.target.value)}
            placeholder={isIndo ? "0812xxxxxx / Untuk receipt donasi" : "0812xxxxxx / For donation receipt"}
            className="h-12 rounded-xl border border-slate-200 font-bold text-xs dark:bg-zinc-900 dark:border-zinc-800 shadow-sm focus-visible:ring-0 focus-visible:border-[#FFD551]"
          />
        </div>

        <div className="space-y-2 text-left">
          <Label htmlFor="senderMessage" className="text-[10px] font-black uppercase tracking-widest italic text-slate-700 dark:text-[#C8C6BC]">
            {t.publicProfile?.supportMessage || (isIndo ? "Pesan Dukungan" : "Support Message")}
          </Label>
          <textarea
            id="senderMessage"
            rows={2}
            value={senderMessage}
            onChange={(e) => setSenderMessage(e.target.value)}
            placeholder={isIndo ? "Tulis pesan semangat untuk live stream..." : "Write support message for live stream..."}
            className="w-full p-3 rounded-xl border border-slate-200 font-semibold text-xs dark:bg-[#1E1E1E] dark:border-zinc-800 dark:text-zinc-300 outline-none focus:border-[#FFD551] focus:ring-0 mb-2 shadow-sm"
          />
        </div>

        {isGiftEnabled && activeGifts.length > 0 && (
          <div className="space-y-3.5 bg-slate-50/50 dark:bg-zinc-900/30 p-5 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80">
            <div className="flex justify-between items-center w-full">
              <span className="text-[9.5px] font-black text-slate-400 dark:text-[#A09E96] uppercase tracking-widest block text-left">
                {isIndo ? "PILIH EFEK GIFT ANIMASI LIVE (OPSIONAL):" : "SELECT LIVE ANIMATED GIFT EFFECT (OPTIONAL):"}
              </span>
              {selectedGiftId && (
                <button
                  type="button"
                  onClick={() => setSelectedGiftId(null)}
                  className="text-[9px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest"
                >
                  {isIndo ? "Batal" : "Cancel"}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {activeGifts.map((gift) => (
                <button
                  key={gift.id}
                  type="button"
                  onClick={() => {
                    const isSelected = selectedGiftId === gift.id
                    setSelectedGiftId(isSelected ? null : gift.id)
                    if (!isSelected) {
                      setIsGachaSelected(false)
                      setSelectedMediaType(null)
                      setMediashareUrl("")
                      setMediaCheck(null)
                      setMediaCheckError("")
                      setSelectedSoundboardItemId(null)
                      
                      const giftPriceConverted = convertFromIdr(gift.price)
                      if (Number(donationAmount || 0) < giftPriceConverted) {
                        setDonationAmount(String(giftPriceConverted))
                      }
                    }
                  }}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all select-none duration-250 cursor-pointer ${selectedGiftId === gift.id
                    ? "border-2 border-amber-500 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.15)] scale-[1.03] text-amber-600 dark:text-amber-400 font-black"
                    : "bg-white/40 dark:bg-zinc-900/40 border-slate-200/80 dark:border-zinc-800 opacity-70 hover:opacity-100 hover:scale-[1.01] font-bold text-slate-500 dark:text-zinc-400"
                    }`}
                >
                  <div className="h-12 w-12 flex items-center justify-center bg-amber-500/5 rounded-full overflow-hidden shrink-0">
                    <img src={gift.url} className="h-10 w-10 object-contain" alt={gift.name} />
                  </div>
                  <span className="text-[9.5px] uppercase tracking-wider text-center leading-tight">{gift.name}</span>
                  <span className="text-[8.5px] font-black text-amber-600 dark:text-amber-400">Rp {gift.price.toLocaleString("id-ID")}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Soundboard Selector block */}
        {creatorDbData?.soundboard_items && creatorDbData.soundboard_items.length > 0 && (
          <div className="space-y-3.5 bg-slate-50/50 dark:bg-zinc-900/30 p-5 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80">
            <div className="flex justify-between items-center w-full">
              <span className="text-[9.5px] font-black text-slate-400 dark:text-[#A09E96] uppercase tracking-widest block text-left flex items-center gap-1.5">
                <Music className="h-3.5 w-3.5 text-[#FFD551]" /> {isIndo ? "PILIH PEMICU EFEK SUARA (SOUNDBOARD) (OPSIONAL):" : "SELECT SOUND EFFECT TRIGGER (SOUNDBOARD) (OPTIONAL):"}
              </span>
              {selectedSoundboardItemId && (
                <button
                  type="button"
                  onClick={() => setSelectedSoundboardItemId(null)}
                  className="text-[9px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest"
                >
                  {isIndo ? "Batal" : "Cancel"}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {creatorDbData.soundboard_items.map((sound: any) => {
                const isSelected = selectedSoundboardItemId === sound.id
                return (
                  <button
                    key={sound.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedSoundboardItemId(null)
                      } else {
                        setSelectedSoundboardItemId(sound.id)
                        setIsGachaSelected(false)
                        setSelectedMediaType(null)
                        setMediashareUrl("")
                        setMediaCheck(null)
                        setMediaCheckError("")
                        setSelectedGiftId(null)

                        const soundPriceConverted = convertFromIdr(sound.price)
                        if (Number(donationAmount) < soundPriceConverted) {
                          setDonationAmount(String(soundPriceConverted))
                        }
                      }
                    }}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-between text-center gap-2 transition-all select-none duration-250 cursor-pointer min-h-[90px] ${isSelected
                      ? "border-2 border-emerald-500 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.15)] scale-[1.03] text-emerald-600 dark:text-emerald-400 font-black"
                      : "bg-white/40 dark:bg-zinc-900/40 border-slate-200/80 dark:border-zinc-800 opacity-75 hover:opacity-100 hover:scale-[1.01] font-bold text-slate-600 dark:text-zinc-300"
                      }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Music className={`h-4 w-4 shrink-0 ${isSelected ? "text-emerald-500 animate-bounce" : "text-slate-400"}`} />
                      <span className="text-[10px] uppercase tracking-wider line-clamp-2 leading-tight">{sound.name}</span>
                    </div>
<span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400">Rp {sound.price.toLocaleString("id-ID")}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}        {/* Conditional forms based on selected feature card */}
        {isGachaSelected && (
          <div className="w-full p-5 bg-emerald-500/10 border-2 border-dashed border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_15px_rgba(16,185,129,0.08)] text-left">
            <div className="flex items-center gap-2.5 text-xs font-black text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-4.5 w-4.5 text-emerald-500 animate-spin shrink-0" />
              {isIndo ? "GACHA CHALLENGE SEDANG AKTIF!" : "GACHA CHALLENGE IS ACTIVE!"}
            </div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 text-center sm:text-left leading-tight flex-1">
              {isIndo
                ? "Fitur Media Share & Media Interaktif lainnya dinonaktifkan sementara untuk menghindari tabrakan overlay."
                : "Media Share & other Interactive Media features are temporarily disabled to avoid overlay collisions."}
            </p>
            <button
              type="button"
              onClick={() => setIsGachaSelected(false)}
              className="shrink-0 text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest bg-rose-500/5 hover:bg-rose-500/10 px-3.5 py-1.5 rounded-xl border border-rose-500/25 active:scale-95 transition-all"
            >
              {isIndo ? "Matikan Gacha" : "Disable Gacha"}
            </button>
          </div>
        )}

        {isMediashareSelected && isMediashareEnabled && (
          <div className="space-y-3">
            <div className="p-5 bg-slate-50/60 dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800 rounded-3xl shadow-sm text-left transition-all duration-200 space-y-3.5">
              <div className="flex justify-between items-center w-full">
                <span className="text-[9.5px] font-black text-slate-500 dark:text-[#A09E96] uppercase tracking-widest block text-left">
                  {isIndo ? "LINK VIDEO MEDIA SHARE (WIDE SCREEN / LANDSCAPE) (OPSIONAL):" : "MEDIA SHARE VIDEO LINK (WIDE SCREEN / LANDSCAPE) (OPTIONAL):"}
                </span>
                {globalMediashareUrl && (
                  <button
                    type="button"
                    onClick={() => { setGlobalMediashareUrl(""); setGlobalMediaCheck(null); setGlobalMediaCheckError(""); }}
                    className="text-[9.5px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest"
                  >
                    {isIndo ? "Batal" : "Cancel"}
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="globalMediashareUrl" className="text-[9.5px] font-black uppercase tracking-widest italic text-slate-400 dark:text-zinc-500">
                    {isIndo ? "Masukkan Link Video YouTube / Landscape Link" : "Enter YouTube Video / Landscape Link"}
                  </Label>
                  {isLocked ? (
                    <span className="text-[9px] font-black uppercase tracking-wider bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/50 px-2.5 py-0.5 rounded-full leading-none flex items-center gap-1 shrink-0">
                      {isIndo ? "Donasi Kurang" : "Low Donation"} <Lock className="h-3 w-3" />
                    </span>
                  ) : (
                    <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-50 border border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/50 px-2.5 py-0.5 rounded-full leading-none flex items-center gap-1 shrink-0">
                      {isIndo ? "Media Aktif" : "Media Active"} <Unlock className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="globalMediashareUrl"
                    type="text"
                    disabled={isLocked}
                    value={globalMediashareUrl}
                    onChange={(e) => {
                      setGlobalMediashareUrl(e.target.value)
                      setGlobalMediaCheck(null)
                      setGlobalMediaCheckError("")
                      // Clear interactive selections for mutual exclusion
                      setSelectedMediaType(null)
                      setMediashareUrl("")
                      setMediaCheck(null)
                      setMediaCheckError("")
                      setIsGachaSelected(false)
                      setSelectedGiftId(null)
                      setSelectedSoundboardItemId(null)
                    }}
                    placeholder={
                      isLocked
                        ? (isIndo
                          ? `Minimal donasi ${formatCurrency(convertFromIdr(minMediashareDonation))} untuk putar media`
                          : `Minimum donation of ${formatCurrency(convertFromIdr(minMediashareDonation))} to play media`)
                        : (isIndo ? "Contoh: https://www.youtube.com/watch?v=dQw4w9WgXcQ" : "Example: https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                    }
                    className={`min-w-0 flex-1 h-10 px-3.5 rounded-xl border font-bold text-xs placeholder:text-slate-400 outline-none transition-all ${isLocked
                      ? "bg-slate-100 border-slate-200 text-slate-400 dark:bg-zinc-800 dark:border-zinc-700"
                      : globalMediaCheck
                        ? "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/10 dark:border-emerald-900/60"
                        : "border-slate-200 focus:border-[#FFD551] dark:bg-zinc-900 dark:border-zinc-800"
                      }`}
                  />
                  <button
                    type="button"
                    disabled={isLocked || isCheckingGlobalMedia || !globalMediashareUrl.trim()}
                    onClick={checkGlobalMediaUrl}
                    className="h-10 shrink-0 rounded-xl border border-slate-200 bg-[#FFD551] px-4 text-[10px] font-black uppercase tracking-wider text-black shadow-sm transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCheckingGlobalMedia ? (
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 animate-spin rounded-full border border-black border-t-transparent" />
                        {isIndo ? "Proses..." : "Checking..."}
                      </span>
                    ) : (
                      isIndo ? "Validasi Link" : "Validate Link"
                    )}
                  </button>
                </div>
                {globalMediaCheckError && (
                  <p className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[9.5px] font-extrabold uppercase italic leading-snug text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/20 dark:text-rose-300">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {globalMediaCheckError}
                  </p>
                )}
                {isLocked && (
                  <p className="text-[9px] font-extrabold text-amber-600 dark:text-amber-500 leading-normal uppercase italic mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{isIndo ? `Naikkan donasi ke ${formatCurrency(convertFromIdr(minMediashareDonation))} untuk menyertakan video di live overlay!` : `Increase donation to ${formatCurrency(convertFromIdr(minMediashareDonation))} to include video in the live overlay!`}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {isInteractiveSelected && isInteractiveEnabled && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 p-5 bg-slate-50/60 dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800 rounded-3xl shadow-sm text-left transition-all duration-200">
              <div className="flex justify-between items-center w-full mb-1.5">
                <span className="text-[9.5px] font-black text-slate-500 dark:text-[#A09E96] uppercase tracking-widest block text-left">
                  {isIndo ? "PILIH FITUR INTERAKTIF OVERLAY (OPSIONAL):" : "SELECT INTERACTIVE OVERLAY WIDGET (OPTIONAL):"}
                </span>
                {selectedMediaType && (
                  <button
                    type="button"
                    onClick={() => { setSelectedMediaType(null); setMediashareUrl(""); setMediaCheck(null); setMediaCheckError(""); }}
                    className="text-[9.5px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest"
                  >
                    {isIndo ? "Batal" : "Cancel"}
                  </button>
                )}
              </div>

              {/* YouTube Shorts */}
              {(!mediaSetting || mediaSetting.youtube_toggle) && (
                <button
                  type="button"
                  onClick={() => selectMediaType("YOUTUBE")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9.5px] font-black uppercase transition-all select-none outline-none duration-200 ${selectedMediaType === "YOUTUBE"
                    ? "border-2 border-red-500 bg-red-500/10 text-red-650 dark:text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)] scale-[1.04]"
                    : "bg-red-500/5 border border-red-500/10 text-red-650 dark:text-red-400 opacity-70 hover:opacity-100 hover:scale-[1.02] cursor-pointer"
                    }`}
                >
                  <img src="/icon/youtube-icon.svg" className="h-4 w-4 object-contain shrink-0" alt="" />
                  YouTube Shorts
                </button>
              )}

              {/* TikTok Video */}
              {(!mediaSetting || mediaSetting.tiktok_toggle) && (
                <button
                  type="button"
                  onClick={() => selectMediaType("TIKTOK")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9.5px] font-black uppercase transition-all select-none outline-none duration-200 ${selectedMediaType === "TIKTOK"
                    ? "border-2 border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400 shadow-[0_0_12px_rgba(20,184,166,0.2)] scale-[1.04]"
                    : "bg-teal-500/5 border border-teal-500/10 text-teal-600 dark:text-teal-400 opacity-70 hover:opacity-100 hover:scale-[1.02] cursor-pointer"
                    }`}
                >
                  <img src="/icon/tiktok-icon.svg" className="h-4 w-4 object-contain shrink-0" alt="" />
                  TikTok Video
                </button>
              )}

              {/* Tebak Gambar */}
              {(!mediaSetting || mediaSetting.tebak_gambar_toggle) && (
                <button
                  type="button"
                  onClick={() => selectMediaType("TEBAK_GAMBAR")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9.5px] font-black uppercase transition-all select-none outline-none duration-200 ${selectedMediaType === "TEBAK_GAMBAR"
                    ? "border-2 border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-450 shadow-[0_0_12px_rgba(245,158,11,0.2)] scale-[1.04]"
                    : "bg-amber-500/5 border border-amber-500/10 text-amber-650 dark:text-amber-450 opacity-70 hover:opacity-100 hover:scale-[1.02] cursor-pointer"
                    }`}
                >
                  <Gamepad2 className="h-4 w-4 shrink-0 text-amber-500" />
                  Tebak Gambar
                </button>
              )}

              {/* Voice Note */}
              {(!mediaSetting || mediaSetting.voice_note_toggle) && (
                <button
                  type="button"
                  onClick={() => selectMediaType("VOICE_NOTE")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9.5px] font-black uppercase transition-all select-none outline-none duration-200 ${selectedMediaType === "VOICE_NOTE"
                    ? "border-2 border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)] scale-[1.04]"
                    : "bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400 opacity-70 hover:opacity-100 hover:scale-[1.02] cursor-pointer"
                    }`}
                >
                  <Mic className="h-4 w-4 shrink-0 text-emerald-500" />
                  Voice Note
                </button>
              )}
            </div>

            {/* Video Mediashare forms (Portrait: YouTube Shorts / TikTok) */}
            {selectedMediaType && ["YOUTUBE", "TIKTOK", "REELS"].includes(selectedMediaType) && (
              <div className="p-3.5 bg-slate-50/50 dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800 rounded-2xl space-y-2 shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="mediashareUrl" className="text-[9.5px] font-black uppercase tracking-widest italic text-slate-500 dark:text-zinc-400">
                      {selectedMediaType === "YOUTUBE" && (isIndo ? "Masukkan Link Video YouTube Shorts" : "Enter YouTube Shorts Link")}
                      {selectedMediaType === "TIKTOK" && (isIndo ? "Masukkan Link Video TikTok" : "Enter TikTok Video Link")}
                    </Label>
                    <div className="flex items-center gap-1.5 ml-1">
                      {selectedMediaType === "YOUTUBE" && (
                        <img src="/icon/youtube-icon.svg" className="h-3.5 w-3.5 object-contain" alt="YouTube" />
                      )}
                      {selectedMediaType === "TIKTOK" && (
                        <img src="/icon/tiktok-icon.svg" className="h-3.5 w-3.5 object-contain" alt="TikTok" />
                      )}
                    </div>
                  </div>
                  {isLocked ? (
                    <span className="text-[9px] font-black uppercase tracking-wider bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/50 px-2.5 py-0.5 rounded-full leading-none flex items-center gap-1 shrink-0">
                      {isIndo ? "Donasi Kurang" : "Low Donation"} <Lock className="h-3 w-3" />
                    </span>
                  ) : (
                    <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-50 border border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/50 px-2.5 py-0.5 rounded-full leading-none flex items-center gap-1 shrink-0">
                      {isIndo ? "Media Aktif" : "Media Active"} <Unlock className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="mediashareUrl"
                    type="text"
                    disabled={isLocked}
                    value={mediashareUrl}
                    onChange={(e) => {
                      setMediashareUrl(e.target.value)
                      setMediaCheck(null)
                      setMediaCheckError("")
                    }}
                    placeholder={
                      isLocked
                        ? (isIndo
                          ? `Minimal donasi ${formatCurrency(convertFromIdr(minMediashareDonation))} untuk putar media`
                          : `Minimum donation of ${formatCurrency(convertFromIdr(minMediashareDonation))} to play media`)
                        : selectedMediaType === "YOUTUBE"
                          ? "Contoh: https://youtube.com/shorts/dQw4w9WgXcQ"
                          : "Contoh: https://www.tiktok.com/@username/video/12345678"
                    }
                    className={`min-w-0 flex-1 h-10 px-3.5 rounded-xl border font-bold text-xs placeholder:text-slate-400 outline-none transition-all ${isLocked
                      ? "bg-slate-100 border-slate-200 text-slate-400 dark:bg-zinc-800 dark:border-zinc-700"
                      : mediaCheck
                        ? "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/10 dark:border-emerald-900/60"
                        : "border-slate-200 focus:border-[#FFD551] dark:bg-zinc-900 dark:border-zinc-800"
                      }`}
                  />
                  <button
                    type="button"
                    disabled={isLocked || isCheckingMedia || !mediashareUrl.trim()}
                    onClick={checkMediaUrl}
                    className="h-10 shrink-0 rounded-xl border border-slate-200 bg-[#FFD551] px-4 text-[10px] font-black uppercase tracking-wider text-black shadow-sm transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCheckingMedia ? (
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 animate-spin rounded-full border border-black border-t-transparent" />
                        {isIndo ? "Proses..." : "Checking..."}
                      </span>
                    ) : (
                      isIndo ? "Validasi Link" : "Validate Link"
                    )}
                  </button>
                </div>
                {mediaCheckError && (
                  <p className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[9.5px] font-extrabold uppercase italic leading-snug text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/20 dark:text-rose-300">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {mediaCheckError}
                  </p>
                )}
                {isLocked && (
                  <p className="text-[9px] font-extrabold text-amber-600 dark:text-amber-500 leading-normal uppercase italic mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{isIndo ? `Naikkan donasi ke ${formatCurrency(convertFromIdr(minMediashareDonation))} untuk menyertakan video di live overlay!` : `Increase donation to ${formatCurrency(convertFromIdr(minMediashareDonation))} to include video in the live overlay!`}</span>
                  </p>
                )}
              </div>
            )}

            {/* Tebak Gambar Form */}
            {selectedMediaType === "TEBAK_GAMBAR" && (
              <div className="p-3.5 bg-slate-50/50 dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800 rounded-2xl space-y-2 shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="mediashareUrl" className="text-[9.5px] font-black uppercase tracking-widest italic text-slate-500 dark:text-zinc-400">
                      {isIndo ? "Masukkan Link Gambar Tebak Gambar (JPG/PNG)" : "Enter Guess the Picture Link (JPG/PNG)"}
                    </Label>
                    <Gamepad2 className="h-4 w-4 text-amber-500 animate-pulse shrink-0" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-50 border border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/50 px-2.5 py-0.5 rounded-full leading-none flex items-center gap-1 shrink-0">
                    {isIndo ? "Tebak Gambar Aktif" : "Guess the Picture Active"} <Unlock className="h-3 w-3" />
                  </span>
                </div>
                <input
                  id="mediashareUrl"
                  type="text"
                  value={mediashareUrl}
                  onChange={(e) => setMediashareUrl(e.target.value)}
                  placeholder="Contoh: https://i.imgur.com/example.png"
                  className="w-full h-10 px-3.5 rounded-xl border font-bold text-xs placeholder:text-slate-400 outline-none transition-all border-slate-200 focus:border-[#FFD551] dark:bg-zinc-900 dark:border-zinc-800"
                />
                <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 leading-normal uppercase italic mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{isIndo ? "Gambar akan tampil ter-pikselasi di OBS stream alert untuk ditebak chat!" : "The image will appear pixelated on the OBS stream alert for the chat to guess!"}</span>
                </p>
              </div>
            )}

            {/* Voice Note Form */}
            {selectedMediaType === "VOICE_NOTE" && (
              <div className="p-3.5 bg-slate-50/50 dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800 rounded-2xl space-y-2 shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="mediashareUrl" className="text-[9.5px] font-black uppercase tracking-widest italic text-slate-500 dark:text-zinc-400">
                      {isIndo ? "Masukkan Link File Audio Voice Note (MP3/WAV)" : "Enter Voice Note Audio Link (MP3/WAV)"}
                    </Label>
                    <Mic className="h-4 w-4 text-emerald-500 animate-pulse shrink-0" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-50 border border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/50 px-2.5 py-0.5 rounded-full leading-none flex items-center gap-1 shrink-0">
                    {isIndo ? "Voice Note Aktif" : "Voice Note Active"} <Unlock className="h-3 w-3" />
                  </span>
                </div>
                <input
                  id="mediashareUrl"
                  type="text"
                  value={mediashareUrl}
                  onChange={(e) => setMediashareUrl(e.target.value)}
                  placeholder="Contoh: https://example.com/audio-note.mp3"
                  className="w-full h-10 px-3.5 rounded-xl border font-bold text-xs placeholder:text-slate-400 outline-none transition-all border-slate-200 focus:border-[#FFD551] dark:bg-zinc-900 dark:border-zinc-800"
                />
                <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 leading-normal uppercase italic mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{isIndo ? "Pesan audio suara Anda akan diputar dengan Voice DSP filter robot/monster/echo di OBS stream!" : "Your voice message will play with a voice DSP filter robot/monster/echo on the OBS stream!"}</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transaction Action Button */}
      <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-4">
        {/* Payment Method Selector block */}
        <div className="space-y-2 text-left">
          <Label className="text-[10px] font-black uppercase tracking-widest italic text-slate-700 dark:text-[#C8C6BC]">
            {t.publicProfile?.paymentMethod || (isIndo ? "Metode Pembayaran" : "Payment Method")}
          </Label>

          {!showPaymentSelection && selectedPayment ? (
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between dark:bg-zinc-900 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <img src={selectedPayment.logo} alt={selectedPayment.name} className="h-8 w-auto object-contain" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-extrabold uppercase italic leading-none">{selectedPayment.name}</span>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 mt-1 uppercase">Fee: {selectedPayment.fee}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentSelection(true)}
                className="text-[10px] font-black uppercase italic bg-[#FFD551] text-black px-3 py-1.5 rounded-xl border border-black shadow-[1px_1px_0px_0px_#000] active:scale-95 transition-transform"
              >
                {isIndo ? "Ubah" : "Change"}
              </button>
            </div>
          ) : showPaymentSelection && paymentMethods.length > 0 ? (
            <div className="p-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl grid grid-cols-2 gap-2 dark:bg-zinc-900 dark:border-zinc-800">
              {paymentMethods.map((pm) => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => {
                    setSelectedPayment(pm)
                    setShowPaymentSelection(false)
                  }}
                  className={`p-2.5 bg-white dark:bg-zinc-900 rounded-lg border flex flex-col items-center justify-center hover:border-black active:scale-95 transition-transform ${selectedPayment?.id === pm.id ? "border-[#FFD551] bg-[#FFD551]/5 dark:bg-[#FFD551]/10" : "border-slate-200 dark:border-zinc-800"
                    }`}
                >
                  <img src={pm.logo} alt={pm.name} className="h-6 w-auto object-contain" />
                  <span className="text-[8px] font-black text-slate-400 dark:text-zinc-500 uppercase leading-none mt-1.5">{pm.fee} Fee</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center py-4 dark:bg-zinc-900 dark:border-zinc-800">
              <p className="text-[10px] font-bold text-slate-400 italic">{isIndo ? "Belum ada metode pembayaran tersedia." : "No payment methods available."}</p>
            </div>
          )}
        </div>

        {/* Checkbox Konfirmasi Syarat & Ketentuan */}
        <div className="p-3 bg-amber-500/5 border border-[#FFD551]/20 rounded-2xl">
          <label className="flex items-start gap-3 text-xs font-semibold text-slate-800 dark:text-[#D4D2C9] cursor-pointer select-none leading-relaxed text-left">
            <input
              type="checkbox"
              required
              checked={isTermsConfirmed}
              onChange={(e) => setIsTermsConfirmed(e.target.checked)}
              className="h-4.5 w-4.5 rounded border-slate-300 dark:border-zinc-700 text-[#FFD551] focus:ring-[#FFD551] mt-0.5 cursor-pointer"
            />
            {isIndo ? (
              <span>
                Saya menyatakan telah berusia **minimal 18 tahun** (atau didampingi orang tua/wali), menyetujui <button type="button" onClick={() => setIsTermsModalOpen(true)} className="text-amber-500 font-black italic underline hover:text-amber-600 transition-colors">Syarat & Ketentuan Layanan</button>, serta menyatakan dukungan ini bersifat **sukarela (apresiasi/hibah)**, non-refundable, dan bebas dari tindakan cuci uang.
              </span>
            ) : (
              <span>
                I declare that I am at least **18 years old** (or accompanied by a parent/guardian), agree to the <button type="button" onClick={() => setIsTermsModalOpen(true)} className="text-amber-500 font-black italic underline hover:text-amber-600 transition-colors">Terms & Conditions of Service</button>, and declare this support is **voluntary (appreciation/grant)**, non-refundable, and free from money laundering activities.
              </span>
            )}
          </label>
        </div>

        {/* Fee Breakdown */}
        {donationAmountNum > 0 && selectedPayment && paymentFee > 0 && (
          <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1 text-[9.5px] font-bold text-slate-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-[#C8C6BC]">
            <div className="flex justify-between items-center">
              <span>{isIndo ? "Dukungan:" : "Support:"}</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{formatCurrency(donationAmountNum)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>{isIndo ? "Biaya" : "Fee"} {selectedPayment.name}:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{formatCurrency(convertFromIdr(paymentFee))}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-zinc-700 text-[10px] font-black text-black dark:text-white">
              <span>{isIndo ? "Total Bayar:" : "Total Payment:"}</span>
              <span className="font-mono text-[#FFD551]">{formatCurrency(convertFromIdr(totalWithFee))}</span>
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting || !isTermsConfirmed}
          className={`w-full h-14 text-black border-2 border-black rounded-xl font-black italic uppercase shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] text-base dark:shadow-none dark:border-zinc-800 ${isTermsConfirmed
            ? "bg-[#FFD551] hover:bg-[#FFC83B]"
            : "bg-slate-200 border-slate-300 cursor-not-allowed hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700"
            }`}
        >
          {isSubmitting
            ? (isIndo ? "Memproses..." : "Processing...")
            : `${t.common.sendSupport || (isIndo ? "KIRIM DUKUNGAN" : "SEND SUPPORT")} ${formatCurrency(convertFromIdr(totalWithFee))}`}
          <Send className="ml-2 h-4 w-4" />
        </Button>

        <div className="mt-2 text-center flex items-center justify-center gap-1 text-[9px] font-extrabold text-slate-400 uppercase italic">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 fill-current" /> {isIndo ? "Pembayaran Aman & Terverifikasi Otomatis" : "Secure Payment & Automatically Verified"}
        </div>
      </div>

      <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
    </form>
  )
}
