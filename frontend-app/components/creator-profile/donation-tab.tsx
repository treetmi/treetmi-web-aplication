"use client"

import React, { useState, useEffect } from "react"
import { Send, ShieldCheck, Mail, AlertCircle } from "lucide-react"
import { useCurrency } from "@/components/currency-provider"
import { useLanguage } from "@/components/language-provider"
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
              fee: feeVal > 0 ? (isPercent ? `${feeVal}%` : `Rp ${feeVal.toLocaleString("id-ID")}`) : "Gratis",
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
  }, [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTermsConfirmed, setIsTermsConfirmed] = useState(false)
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)

  // Calculations
  const mediaSetting = creatorDbData?.creator_media_setting
  const isMediashareEnabled = mediaSetting 
    ? (mediaSetting.global_toggle && (mediaSetting.youtube_toggle || mediaSetting.tiktok_toggle || mediaSetting.reels_toggle))
    : (creatorDbData?.widget_setting?.mediashare_enabled ?? true)
  const minMediashareDonation = creatorDbData?.widget_setting?.mediashare_min_donation ? parseFloat(creatorDbData.widget_setting.mediashare_min_donation) : 15000
  const isLocked = Number(donationAmount || 0) < convertFromIdr(minMediashareDonation)

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
    { amount: Math.round(convertFromIdr(5000) * 100) / 100, label: `👾 ${formatCurrency(convertFromIdr(5000))}`, tier: "Gamer Pemula" },
    { amount: Math.round(convertFromIdr(10000) * 100) / 100, label: `🎮 ${formatCurrency(convertFromIdr(10000))}`, tier: "Player Elite" },
    { amount: Math.round(convertFromIdr(50000) * 100) / 100, label: `🚀 ${formatCurrency(convertFromIdr(50000))}`, tier: "Dukungan Super" },
    { amount: Math.round(convertFromIdr(100000) * 100) / 100, label: `💎 ${formatCurrency(convertFromIdr(100000))}`, tier: "Sponsor Utama" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onDonationSubmit({
        amount: donationAmount,
        senderName,
        isAnonymous,
        senderContact,
        senderMessage,
        mediashareUrl: (isMediashareEnabled && !isLocked) ? mediashareUrl : ""
      })
      // Clear forms on success
      setDonationAmount("")
      setSenderName("")
      setSenderContact("")
      setSenderMessage("")
      setMediashareUrl("")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col justify-between">
      
      {/* Nominal Input Row */}
      <div className="space-y-1.5">
        <Label htmlFor="donationAmount" className="text-[10px] font-black uppercase tracking-widest italic text-slate-500 dark:text-[#A09E96]">
          {t.common.supportAmount || "Jumlah Dukungan"} ({currency})
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
            className="pl-16 h-16 rounded-2xl border-2 border-zinc-950 font-black italic text-3xl md:text-3xl shadow-sm focus:border-[#FFD551] dark:border-zinc-800 dark:bg-[#1E1E1E] text-black dark:text-white"
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
            className={`p-2.5 rounded-xl flex flex-col items-center justify-center active:scale-[0.96] transition-all ${
              Number(donationAmount) === q.amount 
                ? "bg-[#FFD551] border-2 border-zinc-950 text-zinc-950 font-black italic shadow-[2px_2px_0px_#000000] dark:border-zinc-700 dark:shadow-none" 
                : "bg-white dark:bg-zinc-900/60 border border-zinc-950/15 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 hover:border-zinc-950 dark:hover:border-zinc-700"
            }`}
          >
            <span className="text-xs font-black">{q.label}</span>
            <span className={`text-[8px] font-black leading-none mt-1 uppercase tracking-wider ${
              Number(donationAmount) === q.amount 
                ? "text-zinc-850/80 dark:text-zinc-900/90" 
                : "text-zinc-500 dark:text-zinc-400"
            }`}>{q.tier}</span>
          </button>
        ))}
      </div>

      {/* Payment Method Selector block */}
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest italic text-slate-500 dark:text-[#A09E96]">
          {t.publicProfile?.paymentMethod || "Metode Pembayaran"}
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
              Ubah 💳
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
                className={`p-2.5 bg-white dark:bg-zinc-900 rounded-lg border flex flex-col items-center justify-center hover:border-black active:scale-95 transition-transform ${
                  selectedPayment?.id === pm.id ? "border-[#FFD551] bg-[#FFD551]/5 dark:bg-[#FFD551]/10" : "border-slate-200 dark:border-zinc-800"
                }`}
              >
                <img src={pm.logo} alt={pm.name} className="h-6 w-auto object-contain" />
                <span className="text-[8px] font-black text-slate-400 dark:text-zinc-500 uppercase leading-none mt-1.5">{pm.fee} Fee</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center py-4 dark:bg-zinc-900 dark:border-zinc-800">
            <p className="text-[10px] font-bold text-slate-400 italic">Belum ada metode pembayaran tersedia.</p>
          </div>
        )}
      </div>

      {/* Sender Information Input Fields */}
      <div className="space-y-3.5">
        <div className="flex justify-between items-center">
          <Label htmlFor="senderName" className="text-[10px] font-black uppercase tracking-widest italic text-slate-500 dark:text-[#A09E96]">
            {t.publicProfile?.senderName || "Nama Pengirim"}
          </Label>
          <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase italic cursor-pointer">
            <input 
              type="checkbox" 
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-3 w-3 cursor-pointer"
            />
            {t.publicProfile?.anonymous || "Anonim"}
          </label>
        </div>
        
        {!isAnonymous && (
          <Input 
            id="senderName"
            type="text" 
            required
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder={t.publicProfile?.senderNamePlaceholder || "BudiGamer / Nama Kerenmu"} 
            className="h-10 rounded-xl border border-slate-200 font-bold text-xs dark:bg-zinc-800 dark:border-zinc-700"
          />
        )}

        <div className="space-y-1.5">
          <Label htmlFor="senderContact" className="text-[10px] font-black uppercase tracking-widest italic text-slate-500 dark:text-[#A09E96]">
            {t.publicProfile?.senderContact || "No. WhatsApp / Email (Opsional)"}
          </Label>
          <Input 
            id="senderContact"
            type="text" 
            value={senderContact}
            onChange={(e) => setSenderContact(e.target.value)}
            placeholder="0812xxxxxx / Untuk receipt receipt donasi" 
            className="h-10 rounded-xl border border-slate-200 font-bold text-xs dark:bg-zinc-800 dark:border-zinc-700"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="senderMessage" className="text-[10px] font-black uppercase tracking-widest italic text-slate-500 dark:text-[#A09E96]">
            {t.publicProfile?.supportMessage || "Pesan Dukungan"}
          </Label>
          <textarea 
            id="senderMessage"
            rows={2}
            value={senderMessage}
            onChange={(e) => setSenderMessage(e.target.value)}
            placeholder="Tulis pesan semangat untuk live stream..." 
            className="w-full p-3 rounded-xl border border-slate-200 font-semibold text-xs dark:bg-[#1E1E1E] dark:border-zinc-800 dark:text-zinc-300 outline-none focus:border-[#FFD551]"
          />
        </div>

        {/* YouTube Mediashare Card block */}
        {isMediashareEnabled && (
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl dark:bg-zinc-900 dark:border-zinc-800 space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="mediashareUrl" className="text-[9.5px] font-black uppercase tracking-widest italic text-slate-500 dark:text-zinc-400">
                Sertakan Link Video ({[
                  (!mediaSetting || mediaSetting.youtube_toggle) && "YouTube",
                  (mediaSetting?.tiktok_toggle) && "TikTok",
                  (mediaSetting?.reels_toggle) && "Reels"
                ].filter(Boolean).join(" / ") || "Mediashare"})
              </Label>
              {isLocked ? (
                <span className="text-[9px] font-black uppercase tracking-wider bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/50 px-2.5 py-0.5 rounded-full leading-none flex items-center shrink-0">
                  DONASI KURANG 🔒
                </span>
              ) : (
                <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-50 border border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/50 px-2.5 py-0.5 rounded-full leading-none flex items-center shrink-0">
                  MEDIA AKTIF 🔓
                </span>
              )}
            </div>
            <input 
              id="mediashareUrl"
              type="text" 
              disabled={isLocked}
              value={mediashareUrl}
              onChange={(e) => setMediashareUrl(e.target.value)}
              placeholder={isLocked ? `Minimal donasi ${formatCurrency(convertFromIdr(minMediashareDonation))} untuk putar media` : "Contoh: youtube.com/watch?v=..."} 
              className={`w-full h-10 px-3.5 rounded-xl border font-bold text-xs placeholder:text-slate-400 outline-none transition-all ${
                isLocked 
                  ? "bg-slate-100 border-slate-200 text-slate-400 dark:bg-zinc-800 dark:border-zinc-700" 
                  : "border-slate-200 focus:border-[#FFD551] dark:bg-zinc-900 dark:border-zinc-800"
              }`}
            />
            {isLocked && (
              <p className="text-[9px] font-extrabold text-amber-600 dark:text-amber-500 leading-normal uppercase italic mt-1 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>Naikkan donasi ke {formatCurrency(convertFromIdr(minMediashareDonation))} untuk menyertakan video di live overlay!</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Transaction Action Button */}
      <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-4">
        {/* Checkbox Konfirmasi Syarat & Ketentuan */}
        <div className="p-3 bg-amber-500/5 border border-[#FFD551]/20 rounded-2xl">
          <label className="flex items-start gap-3 text-xs font-semibold text-slate-600 dark:text-[#A09E96] cursor-pointer select-none leading-relaxed text-left">
            <input 
              type="checkbox" 
              required
              checked={isTermsConfirmed}
              onChange={(e) => setIsTermsConfirmed(e.target.checked)}
              className="h-4.5 w-4.5 rounded border-slate-300 dark:border-zinc-700 text-[#FFD551] focus:ring-[#FFD551] mt-0.5 cursor-pointer"
            />
            <span>
              Saya menyetujui <button type="button" onClick={() => setIsTermsModalOpen(true)} className="text-amber-500 font-black italic underline hover:text-amber-600 transition-colors">Syarat & Ketentuan Layanan</button>. Saya menyatakan dukungan ini bersifat **sukarela (apresiasi/hibah)**, non-refundable, dan bebas dari tindakan cuci uang.
            </span>
          </label>
        </div>

        {/* Fee Breakdown */}
        {donationAmountNum > 0 && selectedPayment && paymentFee > 0 && (
          <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1 text-[9.5px] font-bold text-slate-400 dark:bg-zinc-900 dark:border-zinc-800 dark:text-[#A09E96]">
            <div className="flex justify-between items-center">
              <span>Dukungan:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{formatCurrency(donationAmountNum)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Biaya {selectedPayment.name}:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{formatCurrency(convertFromIdr(paymentFee))}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-zinc-700 text-[10px] font-black text-black dark:text-white">
              <span>Total Bayar:</span>
              <span className="font-mono text-[#FFD551]">{formatCurrency(convertFromIdr(totalWithFee))}</span>
            </div>
          </div>
        )}

        <Button 
          type="submit"
          disabled={isSubmitting || !isTermsConfirmed}
          className={`w-full h-14 text-black border-2 border-black rounded-xl font-black italic uppercase shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] text-base dark:shadow-none dark:border-zinc-800 ${
            isTermsConfirmed 
              ? "bg-[#FFD551] hover:bg-[#FFC83B]" 
              : "bg-slate-200 border-slate-300 cursor-not-allowed hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700"
          }`}
        >
          {isSubmitting ? "Memproses..." : `${t.common.sendSupport || "KIRIM DUKUNGAN"} ${formatCurrency(convertFromIdr(totalWithFee))}`}
          <Send className="ml-2 h-4 w-4" />
        </Button>
        
        <div className="mt-2 text-center flex items-center justify-center gap-1 text-[9px] font-extrabold text-slate-400 uppercase italic">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 fill-current" /> Pembayaran Aman & Terverifikasi Otomatis
        </div>
      </div>

      <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
    </form>
  )
}
