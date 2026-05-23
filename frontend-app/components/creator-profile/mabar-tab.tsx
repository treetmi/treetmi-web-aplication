"use client"

import React, { useState, useEffect } from "react"
import { 
  Gamepad2, ShieldCheck, Mail, Download, Loader2, ArrowLeft, Plus, Minus, Flame, Coins, Lock, Unlock, Sparkles
} from "lucide-react"
import { useCurrency } from "@/components/currency-provider"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { PUBLIC_API, API_BASE_URL } from "@/lib/api"
import { TermsModal } from "./terms-modal"

interface PaymentMethod {
  id: string
  name: string
  logo: string
  fee: string
  feeAmount: number
  feeType: 'fixed' | 'percent'
}

interface MabarTabProps {
  mode?: "MABAR" | "KARYA"
  creatorDbData: any
  displayUsername: string
  config: any
  visiblePackages: any[]
  onMabarSubmit: (mabarData: {
    packageId: string
    ign: string
    gameId: string
    quantity: number
    message: string
  }) => Promise<void>
  onProjectSubmit?: (projectData: {
    projectId: string
    title: string
    amount: string
    email: string
    name: string
    message: string
  }) => Promise<void>
}

export function MabarTab({
  mode = "MABAR",
  creatorDbData,
  displayUsername,
  config,
  visiblePackages,
  onMabarSubmit,
  onProjectSubmit
}: MabarTabProps) {
  const { currency, convertFromIdr, convertToIdr, format: formatCurrency } = useCurrency()
  const { lang, t } = useLanguage()
  const isIndo = lang === "id"

  // Selected package states
  const [selectedPkg, setSelectedPkg] = useState<any | null>(null)
  
  // Checkout Form states
  const [mabarIgn, setMabarIgn] = useState("")
  const [mabarId, setMabarId] = useState("")
  const [mabarMessage, setMabarMessage] = useState("")
  const [mabarQuantity, setMabarQuantity] = useState<number>(1)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null)
  const [showPaymentSelection, setShowPaymentSelection] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTermsConfirmed, setIsTermsConfirmed] = useState(false)
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)

  // Project Checkout states
  const [projectEmail, setProjectEmail] = useState("")
  const [projectName, setProjectName] = useState("")
  const [projectMessage, setProjectMessage] = useState("")

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

  // Digital Asset states
  const [unlockEmail, setUnlockEmail] = useState("")
  const [unlockedProjects, setUnlockedProjects] = useState<any[]>([])
  const [totalSupported, setTotalSupported] = useState<number>(0)
  const [isCheckingAccess, setIsCheckingAccess] = useState(false)
  const [hasCheckedAccess, setHasCheckedAccess] = useState(false)

  const handleUnlockAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!unlockEmail || !creatorDbData?.id) {
      toast.error(isIndo ? "Masukkan alamat email Anda." : "Please enter your email address.")
      return
    }

    setIsCheckingAccess(true)
    setHasCheckedAccess(false)

    try {
      const res = await fetch(PUBLIC_API.checkProjectAccess(unlockEmail, creatorDbData.id))
      const json = await res.json()

      if (json.success && json.data) {
        setUnlockedProjects(json.data.projects || [])
        setTotalSupported(json.data.totalSupported || 0)
        setHasCheckedAccess(true)

        const unlockedCount = (json.data.projects || []).filter((p: any) => p.unlocked).length
        if (unlockedCount > 0) {
          toast.success(isIndo 
            ? `${unlockedCount} karya digital berhasil dibuka! 🎉` 
            : `${unlockedCount} digital creations successfully unlocked! 🎉`)
        } else {
          toast.info(isIndo 
            ? "Belum ada karya yang terbuka. Kirim dukungan untuk mengakses file!" 
            : "No unlocked creations yet. Send support to access the files!")
        }
      } else {
        toast.error(json.message || (isIndo ? "Gagal memverifikasi akses." : "Failed to verify access."))
      }
    } catch (err) {
      console.error(err)
      toast.error(isIndo ? "Gagal menghubungi server." : "Failed to connect to the server.")
    } finally {
      setIsCheckingAccess(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mabarIgn || !mabarId) {
      toast.error(isIndo ? "Mohon isi Nickname dan ID game Anda!" : "Please fill in your Nickname and Game ID!")
      return
    }

    setIsSubmitting(true)
    try {
      await onMabarSubmit({
        packageId: selectedPkg.id,
        ign: mabarIgn,
        gameId: mabarId,
        quantity: mabarQuantity,
        message: mabarMessage
      })
      // Clear forms
      setMabarIgn("")
      setMabarId("")
      setMabarMessage("")
      setMabarQuantity(1)
      setSelectedPkg(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectEmail) {
      toast.error(isIndo ? "Mohon isi Email Anda!" : "Please fill in your Email!")
      return
    }

    setIsSubmitting(true)
    try {
      if (onProjectSubmit) {
        await onProjectSubmit({
          projectId: selectedPkg.id,
          title: selectedPkg.gameName,
          amount: selectedPkg.price.toString(),
          email: projectEmail,
          name: projectName,
          message: projectMessage
        })
      }
      setProjectEmail("")
      setProjectName("")
      setProjectMessage("")
      setSelectedPkg(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasOnlyProjects = visiblePackages.length > 0 && visiblePackages.every((pkg: any) => pkg.type === "PROJECT")
  if (selectedPkg) {
    const isProject = selectedPkg.type === "PROJECT"

    const buyThreshold = creatorDbData?.mabar_promo_buy || 0
    const freeBonus = creatorDbData?.mabar_promo_get || 0
    
    let bonusSlots = 0
    if (!isProject && buyThreshold > 0 && freeBonus > 0 && mabarQuantity >= buyThreshold) {
      bonusSlots = Math.floor(mabarQuantity / buyThreshold) * freeBonus
    }
    const totalSlots = isProject ? 1 : mabarQuantity + bonusSlots
    const paidTotalVal = selectedPkg.price * (isProject ? 1 : mabarQuantity)

    // Fee calculation for mabar / project
    const mabarFee = selectedPayment
      ? selectedPayment.feeType === 'fixed'
        ? selectedPayment.feeAmount
        : Math.ceil(paidTotalVal * (selectedPayment.feeAmount / 100))
      : 0
    const mabarTotalWithFee = paidTotalVal + mabarFee

    return (
      <form onSubmit={isProject ? handleProjectSubmit : handleSubmit} className="space-y-4 animate-fadeIn">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => setSelectedPkg(null)}
          className="flex items-center gap-1.5 text-xs font-black uppercase italic text-slate-500 hover:text-black transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> {isIndo ? (isProject ? "Kembali ke Katalog Karya" : "Kembali ke Katalog Layanan") : "Back to Catalog"}
        </button>

        {/* Selected Package Header summary */}
        <div className="p-3.5 bg-[#FFD551]/5 border border-[#FFD551] rounded-2xl flex items-center justify-between dark:bg-[#FFD551]/5">
          <div className="flex items-center gap-3">
            {selectedPkg.image && (selectedPkg.image.startsWith("http") || selectedPkg.image.startsWith("/")) ? (
              <img 
                src={selectedPkg.image} 
                alt={selectedPkg.gameName} 
                className="h-10 w-10 rounded-xl object-cover border border-[#FFD551]/20 shadow-sm"
              />
            ) : (
              <span className="text-2xl shrink-0">{selectedPkg.image || <Gamepad2 className="h-6 w-6 text-[#FFD551]" />}</span>
            )}
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase italic leading-none">{selectedPkg.packageName}</span>
              <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase mt-1 leading-none">{selectedPkg.gameName}</span>
            </div>
          </div>
          <span className="text-sm font-black italic text-red-500 shrink-0">{formatCurrency(selectedPkg.price)}</span>
        </div>

        {/* Quantity Slot Selector (Only for Mabar) */}
        {!isProject ? (
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl dark:bg-zinc-900 dark:border-zinc-800 space-y-3.5 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="space-y-0.5 text-left">
                <Label className="text-[10px] font-black uppercase tracking-widest italic text-slate-500 dark:text-[#A09E96]">
                  {isIndo ? "Jumlah Slot Game" : "Number of Game Slots"}
                </Label>
                <p className="text-[9px] font-semibold text-slate-400 italic">{isIndo ? "Tentukan berapa kali mabar" : "Determine how many play sessions"}</p>
              </div>
              
              {/* counter */}
              <div className="flex items-center gap-3 bg-white border border-slate-200 p-1.5 rounded-xl dark:bg-zinc-900 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setMabarQuantity(Math.max(1, mabarQuantity - 1))}
                  className="w-7 h-7 bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-black rounded-lg active:scale-95 transition-all text-xs dark:bg-zinc-800"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="text-xs font-black w-6 text-center">{mabarQuantity}</span>
                <button
                  type="button"
                  onClick={() => setMabarQuantity(mabarQuantity + 1)}
                  className="w-7 h-7 bg-[#FFD551] hover:bg-[#FFC83B] flex items-center justify-center font-black rounded-lg active:scale-95 transition-all text-xs text-black"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Promotion Banner */}
            <div className="space-y-2 pt-2.5 border-t border-slate-200 dark:border-zinc-800 text-left">
              {buyThreshold > 0 && freeBonus > 0 && (
                <div className={`p-2 rounded-lg flex items-center gap-2 border text-[9px] font-black italic uppercase leading-none ${
                  bonusSlots > 0 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200 animate-bounce" 
                    : "bg-amber-50 text-amber-600 border-amber-200"
                }`}>
                  <Flame className="h-3.5 w-3.5 shrink-0" />
                  <div>
                    {bonusSlots > 0 ? (
                      <span>{isIndo ? `PROMO BONUS AKTIF! +${bonusSlots} GAME GRATIS DIDAPATKAN!` : `PROMO BONUS ACTIVE! +${bonusSlots} FREE GAMES UNLOCKED!`}</span>
                    ) : (
                      <span>{isIndo 
                        ? `PROMO: BELI ${buyThreshold} LAYANAN GRATIS ${freeBonus}! (KURANG ${buyThreshold - mabarQuantity} SLOT LAGI)` 
                        : `PROMO: BUY ${buyThreshold} GET ${freeBonus} FREE! (${buyThreshold - mabarQuantity} MORE SLOTS NEEDED)`}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Bill Info */}
              <div className="space-y-1.5 text-[9.5px] font-bold text-slate-400 dark:text-[#A09E96]">
                <div className="flex justify-between items-center">
                  <span>{isIndo ? "Harga Per Slot:" : "Price Per Slot:"}</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{formatCurrency(selectedPkg.price)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{isIndo ? "Biaya Utama:" : "Main Cost:"} ({mabarQuantity} Slot):</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{formatCurrency(paidTotalVal)}</span>
                </div>
                {bonusSlots > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                    <span>{isIndo ? "Bonus Free Game:" : "Bonus Free Game:"}</span>
                    <span>+{bonusSlots} {isIndo ? "Sesi Gratis" : "Free Sessions"}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1.5 border-t border-slate-100 dark:border-zinc-800 text-[10px] font-black text-black dark:text-white italic">
                  <span>{isIndo ? "Total Antrean Terdaftar:" : "Total Registered Queue:"}</span>
                  <span className="text-[#FFD551] bg-black px-2.5 py-0.5 rounded-lg border border-slate-800 text-[9px] shrink-0">{totalSlots} {isIndo ? "Game Slot" : "Game Slots"}</span>
                </div>
                {selectedPayment && mabarFee > 0 && (
                  <>
                    <div className="flex justify-between items-center text-[9.5px] font-bold text-slate-400 dark:text-[#A09E96]">
                      <span>{isIndo ? "Biaya" : "Fee"} {selectedPayment.name} ({selectedPayment.fee}):</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">Rp {mabarFee.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1.5 border-t border-slate-100 dark:border-zinc-800 text-[10px] font-black text-black dark:text-white italic">
                      <span>{isIndo ? "Total Bayar:" : "Total Payment:"}</span>
                      <span className="font-mono text-[#FFD551]">Rp {mabarTotalWithFee.toLocaleString("id-ID")}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl dark:bg-zinc-900 dark:border-zinc-800 space-y-3.5 shadow-sm text-left">
            {/* Bill Info for project */}
            <div className="space-y-1.5 text-[9.5px] font-bold text-slate-400 dark:text-[#A09E96]">
              <div className="flex justify-between items-center">
                <span>{isIndo ? "Dukungan Karya:" : "Creation Support:"}</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{formatCurrency(selectedPkg.price)}</span>
              </div>
              {selectedPayment && mabarFee > 0 && (
                <>
                  <div className="flex justify-between items-center text-[9.5px] font-bold text-slate-400 dark:text-[#A09E96]">
                    <span>{isIndo ? "Biaya" : "Fee"} {selectedPayment.name} ({selectedPayment.fee}):</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">Rp {mabarFee.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-slate-100 dark:border-zinc-800 text-[10px] font-black text-black dark:text-white italic">
                    <span>{isIndo ? "Total Bayar:" : "Total Payment:"}</span>
                    <span className="font-mono text-[#FFD551]">Rp {mabarTotalWithFee.toLocaleString("id-ID")}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Credentials nickname IGN and Game ID / Email & Name */}
        {!isProject ? (
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="space-y-1.5">
              <Label htmlFor="mabarIgn" className="text-[9.5px] font-black uppercase tracking-widest italic text-slate-700 dark:text-[#C8C6BC]">
                {isIndo ? "Nickname Game (IGN)" : "Game Nickname (IGN)"}
              </Label>
              <Input 
                id="mabarIgn"
                type="text" 
                required
                value={mabarIgn}
                onChange={(e) => setMabarIgn(e.target.value)}
                placeholder="Contoh: Faker#ID" 
                className="h-12 rounded-xl border-2 border-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 font-extrabold text-xs shadow-sm focus-visible:ring-0 focus-visible:border-[#FFD551]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mabarId" className="text-[9.5px] font-black uppercase tracking-widest italic text-slate-700 dark:text-[#C8C6BC]">
                {isIndo ? "ID Game / Server" : "Game ID / Server"}
              </Label>
              <Input 
                id="mabarId"
                type="text" 
                required
                value={mabarId}
                onChange={(e) => setMabarId(e.target.value)}
                placeholder="Contoh: 1234567 (8910)" 
                className="h-12 rounded-xl border-2 border-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 font-extrabold text-xs shadow-sm focus-visible:ring-0 focus-visible:border-[#FFD551]"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="space-y-1.5">
              <Label htmlFor="projectName" className="text-[9.5px] font-black uppercase tracking-widest italic text-slate-700 dark:text-[#C8C6BC]">
                {isIndo ? "Nama Pengirim (Opsional)" : "Sender Name (Optional)"}
              </Label>
              <Input 
                id="projectName"
                type="text" 
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder={isIndo ? "Contoh: Hamba Allah" : "e.g. Anonymous"} 
                className="h-12 rounded-xl border-2 border-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 font-extrabold text-xs shadow-sm focus-visible:ring-0 focus-visible:border-[#FFD551]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="projectEmail" className="text-[9.5px] font-black uppercase tracking-widest italic text-slate-700 dark:text-[#C8C6BC]">
                {isIndo ? "Email Checkout (Wajib)" : "Checkout Email (Required)"}
              </Label>
              <Input 
                id="projectEmail"
                type="email" 
                required
                value={projectEmail}
                onChange={(e) => setProjectEmail(e.target.value)}
                placeholder="email@anda.com" 
                className="h-12 rounded-xl border-2 border-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 font-extrabold text-xs shadow-sm focus-visible:ring-0 focus-visible:border-[#FFD551]"
              />
            </div>
            <div className="col-span-2">
              <p className="text-[9.5px] font-bold text-slate-600 italic">
                {isIndo 
                  ? "Penting! Gunakan email ini saat memverifikasi akses unduh file setelah pembayaran berhasil."
                  : "Important! Use this email to verify your download link access after successful payment."}
              </p>
            </div>
          </div>
        )}

        {/* Payment Selector block */}
        <div className="space-y-2 text-left">
          <Label className="text-[10px] font-black uppercase tracking-widest italic text-slate-700 dark:text-[#C8C6BC]">
            {isIndo ? "Metode Pembayaran" : "Payment Method"}
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
              <p className="text-[10px] font-bold text-slate-400 italic">{isIndo ? "Belum ada metode pembayaran tersedia." : "No payment methods available."}</p>
            </div>
          )}
        </div>

        {/* Optional Request message */}
        <div className="space-y-1.5 text-left">
          <Label htmlFor="mabarMessage" className="text-[9.5px] font-black uppercase tracking-widest italic text-slate-700 dark:text-[#C8C6BC]">
            {isProject ? (isIndo ? "Pesan Dukungan (Opsional)" : "Support Message (Optional)") : (isIndo ? "Catatan / Request (Opsional)" : "Notes / Requests (Optional)")}
          </Label>
          <textarea 
            id="mabarMessage"
            rows={2}
            value={isProject ? projectMessage : mabarMessage}
            onChange={(e) => isProject ? setProjectMessage(e.target.value) : setMabarMessage(e.target.value)}
            placeholder={isProject ? (isIndo ? "Contoh: Terima kasih atas karyanya, sangat bermanfaat!" : "e.g. Thanks for the creation, very useful!") : (isIndo ? "Contoh: Request mabar ranked MLBB, saya user Core..." : "Example: Request MLBB ranked mabar, I am a Core user...")} 
            className="w-full p-3 rounded-xl border-2 border-zinc-950 font-semibold text-xs outline-none focus:border-[#FFD551] focus:ring-0 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 shadow-sm"
          />
        </div>

        {/* Submit button */}
        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-4">
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
                  Saya menyetujui <button type="button" onClick={() => setIsTermsModalOpen(true)} className="text-amber-500 font-black italic underline hover:text-amber-600 transition-colors">Syarat & Ketentuan Layanan</button>. Saya menyatakan pembayaran {isProject ? "karya digital" : "slot mabar"} ini dilakukan secara **sukarela**, non-refundable, dan mengikuti ketentuan escrow Treetmi.
                </span>
              ) : (
                <span>
                  I agree to the <button type="button" onClick={() => setIsTermsModalOpen(true)} className="text-amber-500 font-black italic underline hover:text-amber-600 transition-colors">Terms & Conditions of Service</button>. I declare this {isProject ? "digital creation" : "mabar slot"} order is made **voluntarily**, non-refundable, and follows Treetmi escrow terms.
                </span>
              )}
            </label>
          </div>

          <Button 
            type="submit"
            disabled={isSubmitting || !isTermsConfirmed}
            className={`w-full h-14 text-[#FFD551] border-2 border-black rounded-xl font-black italic uppercase shadow-[3px_3px_0px_0px_#FFD551] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#FFD551] text-base dark:shadow-none dark:border-zinc-800 ${
              isTermsConfirmed 
                ? "bg-black hover:bg-slate-900" 
                : "bg-slate-200 border-slate-300 cursor-not-allowed hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700"
            }`}
          >
            {isSubmitting 
              ? (isIndo ? (isProject ? "Memproses dukungan..." : "Memproses antrean...") : (isProject ? "Processing support..." : "Processing queue...")) 
              : (isIndo 
                  ? (isProject ? `DUKUNG KARYA Rp ${mabarTotalWithFee.toLocaleString("id-ID")}` : `PESAN SLOT MABAR Rp ${mabarTotalWithFee.toLocaleString("id-ID")}`) 
                  : (isProject ? `SUPPORT CREATION Rp ${mabarTotalWithFee.toLocaleString("id-ID")}` : `ORDER MABAR SLOT Rp ${mabarTotalWithFee.toLocaleString("id-ID")}`)) }
            {isProject ? <Download className="ml-2 h-4 w-4" /> : <Gamepad2 className="ml-2 h-4 w-4" />}
          </Button>
          
          <div className="mt-2 text-center flex items-center justify-center gap-1 text-[9px] font-extrabold text-slate-400 uppercase italic">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 fill-current" /> {isIndo ? "Order diproses FIFO oleh Treetmi Engine" : "Orders processed FIFO by Treetmi Engine"}
          </div>
        </div>

        <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
      </form>
    )
  }

  // Otherwise, render catalog
  return (
    <div className="space-y-6">
      
      {/* 1. Services catalogs showcase */}
      {visiblePackages.length > 0 ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            {visiblePackages.map((pkg: any) => (
              <div 
                key={pkg.id}
                onClick={() => {
                  if (pkg.type === "MABAR" && pkg.status !== "ACTIVE") {
                    toast.error(isIndo ? "Kreator sedang tidak ON (tidak Live stream) untuk game ini." : "Creator is not live streaming for this game right now.")
                    return
                  }
                  setSelectedPkg(pkg)
                }}
                className={`relative bg-white dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800 rounded-3xl p-4 sm:p-4.5 cursor-pointer hover:border-amber-400 dark:hover:border-amber-500/80 hover:shadow-lg hover:shadow-slate-100/50 dark:hover:shadow-none transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm ${
                  pkg.type === "MABAR" && pkg.status !== "ACTIVE"
                    ? "opacity-60 grayscale-[35%] cursor-not-allowed hover:border-slate-100 hover:shadow-sm"
                    : ""
                }`}
              >
                {/* Popular Badge */}
                {pkg.isPopular && pkg.status === "ACTIVE" && (
                  <span className="absolute -top-2.5 left-5 bg-amber-500/10 dark:bg-[#FFD551]/10 text-amber-600 dark:text-[#FFD551] font-extrabold rounded-full text-[8.5px] uppercase tracking-wider px-2.5 py-0.5 border border-amber-500/20 dark:border-[#FFD551]/20 leading-none z-10 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-500 dark:text-[#FFD551] fill-current animate-pulse" />
                    {isIndo ? "POPULER" : "POPULAR"}
                  </span>
                )}

                <div className="flex items-center gap-3.5 min-w-0 text-left">
                  {pkg.image && (pkg.image.startsWith("http") || pkg.image.startsWith("/")) ? (
                    <img 
                      src={pkg.image} 
                      alt={pkg.gameName} 
                      className="h-14 w-14 rounded-2xl object-cover border border-slate-100 dark:border-zinc-800 shadow-sm shrink-0"
                    />
                  ) : (
                    <span className="text-3xl shrink-0 p-2 bg-[#FFD551]/5 rounded-2xl border border-dashed border-[#FFD551]/20 flex items-center justify-center h-14 w-14">
                      {pkg.image || <Gamepad2 className="h-6.5 w-6.5 text-[#FFD551]" />}
                    </span>
                  )}
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-sm font-black uppercase leading-tight text-slate-800 dark:text-[#EAE9E4] truncate">
                      {pkg.gameName}
                    </h4>
                    <p className="text-[9.5px] font-black text-slate-700 dark:text-[#C8C6BC] uppercase tracking-widest leading-none truncate italic flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-[#FFD551]" /> {pkg.packageName}
                    </p>
                    
                    {/* Promo badge */}
                    {pkg.type === "MABAR" && creatorDbData?.mabar_promo_buy > 0 && pkg.status === "ACTIVE" && (
                      <div className="pt-0.5">
                        <span className="inline-flex bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold rounded-lg text-[8.5px] uppercase tracking-wider px-2 py-0.5 shadow-sm leading-none shrink-0 items-center gap-1">
                          <Flame className="h-3 w-3 text-emerald-500 animate-bounce" />
                          {isIndo 
                            ? `MABAR ${creatorDbData.mabar_promo_buy} GRATIS ${creatorDbData.mabar_promo_get}` 
                            : `BUY ${creatorDbData.mabar_promo_buy} GET ${creatorDbData.mabar_promo_get} FREE`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Right side Price Tag */}
                <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0 sm:pl-2 w-full sm:w-auto border-t sm:border-t-0 border-slate-50 dark:border-zinc-800/80 pt-2.5 sm:pt-0">
                  <div className="flex flex-col text-left sm:text-right">
                    {pkg.originalPrice && (
                      <span className="text-[10px] line-through text-slate-600 dark:text-zinc-500 font-bold leading-none">
                        {formatCurrency(pkg.originalPrice)}
                      </span>
                    )}
                    <span className="text-sm font-black text-rose-600 dark:text-rose-400 italic leading-tight">
                      {formatCurrency(pkg.price)}
                    </span>
                  </div>
                  {pkg.type === "MABAR" && pkg.status !== "ACTIVE" ? (
                    <span className="text-[9px] font-black uppercase italic bg-slate-100 text-slate-400 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-500">
                      Offline
                    </span>
                  ) : (
                    <span className="h-9 px-4 bg-[#FFD551] hover:bg-[#FFC83B] text-black rounded-xl font-black uppercase italic text-[10px] tracking-wider transition-all shadow-sm hover:shadow active:scale-95 flex items-center justify-center shrink-0">
                      {pkg.type === "PROJECT" ? (isIndo ? "Karya" : "Creation") : "Order"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-6 bg-slate-50 border border-dashed rounded-xl text-center space-y-1.5 dark:bg-zinc-950/20 dark:border-zinc-800">
          <p className="text-xs font-black italic text-slate-400 uppercase tracking-widest">
            {isIndo 
              ? (mode === "KARYA" ? "Katalog Karya Kosong" : "Katalog Layanan Kosong") 
              : (mode === "KARYA" ? "Creations Catalog Empty" : "Services Catalog Empty")}
          </p>
          <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
            {isIndo 
              ? (mode === "KARYA" ? "Belum ada karya digital yang dikonfigurasikan." : "Belum ada mabar game yang dikonfigurasikan.") 
              : (mode === "KARYA" ? "No digital creations configured yet." : "No mabar games configured yet.")}
          </p>
        </div>
      )}

      {/* 2. Unified Digital Asset File Unlocker */}
      {mode === "KARYA" && creatorDbData?.project_assets && creatorDbData.project_assets.length > 0 && (
        <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-3xl space-y-4 dark:bg-zinc-950/20 dark:border-zinc-800">
          <div className="flex flex-col gap-0.5 pb-2 border-b border-slate-200/50 dark:border-zinc-800 text-left">
            <span className="text-xs font-black uppercase italic tracking-widest flex items-center gap-1.5 text-slate-800 dark:text-[#EAE9E4]">
              <Unlock className="h-4 w-4 text-[#FFD551]" /> {isIndo ? "Akses File Karya Digital Anda" : "Access Your Digital Creation Files"}
            </span>
            <span className="text-[9.5px] font-bold text-slate-600 dark:text-zinc-400 italic">
              {isIndo ? "Masukkan email checkout Anda untuk mengunduh karya digital yang didukung" : "Enter your checkout email to download supported digital creations"}
            </span>
          </div>

          <form onSubmit={handleUnlockAccess} className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1 text-left">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  required
                  value={unlockEmail}
                  onChange={(e) => setUnlockEmail(e.target.value)}
                  placeholder="email@anda.com"
                  className="h-10 pl-10 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-black dark:text-white font-bold text-xs"
                />
              </div>
              <Button
                type="submit"
                disabled={isCheckingAccess}
                className="h-10 px-4 bg-[#FFD551] text-black border-2 border-black rounded-xl font-black italic uppercase text-[9px] shadow-[2px_2px_0px_0px_#000000] active:scale-95 transition-all shrink-0"
              >
                {isCheckingAccess ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  (isIndo ? "Verifikasi" : "Verify")
                )}
              </Button>
            </div>
          </form>

          {/* Unlock files result rendering */}
          {hasCheckedAccess && (
            <div className="space-y-2.5 animate-fadeIn">
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center dark:bg-zinc-900 dark:border-zinc-800">
                <span className="text-[9px] font-black uppercase italic text-slate-600">{isIndo ? "Total Dukungan Terdeteksi" : "Total Support Detected"}</span>
                <span className="text-xs font-black italic text-[#FFD551] bg-black px-2.5 py-0.5 rounded-lg border border-zinc-800">
                  {formatCurrency(convertFromIdr(totalSupported))}
                </span>
              </div>

              {unlockedProjects.map((project: any) => (
                <div
                  key={project.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    project.unlocked
                      ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/10 dark:border-emerald-900/50"
                      : "bg-white border-slate-200 dark:bg-zinc-900 dark:border-zinc-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 text-left">
                    <span className="text-lg shrink-0">
                      {project.unlocked ? (
                        <Unlock className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Lock className="h-4 w-4 text-slate-400" />
                      )}
                    </span>
                    <div className="min-w-0 space-y-0.5">
                      <h4 className="text-[10px] font-black uppercase leading-tight truncate text-slate-800 dark:text-zinc-350">{project.title}</h4>
                      <span className="text-[8px] font-extrabold text-slate-400 block leading-none">
                        {isIndo ? "Min. Dukungan:" : "Min. Support:"} {formatCurrency(convertFromIdr(project.min_support))}
                      </span>
                    </div>
                  </div>
                  {project.unlocked ? (
                    <a
                      href={project.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-black uppercase italic bg-emerald-500 text-white px-3 py-1.5 rounded-lg border border-emerald-600 hover:bg-emerald-600 transition-all shrink-0 flex items-center gap-1 shadow-sm"
                    >
                      <Download className="h-3.5 w-3.5 shrink-0" /> {isIndo ? "Unduh" : "Download"}
                    </a>
                  ) : (
                    <span className="text-[8px] font-black uppercase italic text-slate-400 shrink-0">
                      {isIndo ? "Terkunci" : "Locked"}
                    </span>
                  )}
                </div>
              ))}

              {unlockedProjects.length === 0 && (
                <p className="text-[9.5px] text-center text-slate-400 italic py-2">{isIndo ? "Belum ada karya digital terdaftar." : "No digital creations registered yet."}</p>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  )
}
