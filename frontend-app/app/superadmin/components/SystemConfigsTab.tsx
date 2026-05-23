"use client"

import React, { useState, useEffect } from "react"
import { ADMIN_API } from "@/lib/api"
import { toast } from "sonner"
import { 
  Sliders, 
  ShieldCheck, 
  Scale, 
  CreditCard, 
  MessageSquare, 
  Phone,
  RefreshCw,
  Eye,
  Lock,
  SmartphoneNfc
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export default function SystemConfigsTab() {
  // Configs States
  const [paymentGateway, setPaymentGateway] = useState("MIDTRANS")
  const [paymentSandbox, setPaymentSandbox] = useState(true)
  const [midtransMerchantId, setMidtransMerchantId] = useState("")
  const [midtransClientKey, setMidtransClientKey] = useState("")
  const [midtransServerKey, setMidtransServerKey] = useState("")
  const [xenditApiKey, setXenditApiKey] = useState("")
  
  // WhatsApp Settings States
  const [whatsappGateway, setWhatsappGateway] = useState("SIMULATION")
  const [whatsappApiKey, setWhatsappApiKey] = useState("")
  const [whatsappSender, setWhatsappSender] = useState("")
  const [whatsappTemplate, setWhatsappTemplate] = useState("Halo! 👾 Kreator favoritmu {creator} sekarang sedang LIVE streaming di Treetmi! Yuk nonton dan dukung di: {url}")
  
  // Support & Security Settings
  const [supportWhatsapp, setSupportWhatsapp] = useState("628123456789")
  const [discordReportWebhook, setDiscordReportWebhook] = useState("")
  
  // Platform Commission Fees
  const [feeDonation, setFeeDonation] = useState(5.00)
  const [feeMabar, setFeeMabar] = useState(8.00)
  const [feeGift, setFeeGift] = useState(10.00)

  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // Password fields visibility toggles
  const [showMidtransServer, setShowMidtransServer] = useState(false)
  const [showXenditApi, setShowXenditApi] = useState(false)
  const [showWaApi, setShowWaApi] = useState(false)
  const [showDiscordWebhook, setShowDiscordWebhook] = useState(false)

  // Fetch configs on mount
  useEffect(() => {
    const fetchConfigs = async () => {
      setLoading(true)
      try {
        const res = await fetch(ADMIN_API.settings)
        const json = await res.json()
        if (json.success && json.data) {
          const data = json.data
          setPaymentGateway(data.paymentGateway || "MIDTRANS")
          setPaymentSandbox(data.paymentSandbox !== undefined ? Boolean(data.paymentSandbox) : true)
          setMidtransMerchantId(data.midtransMerchantId || "")
          setMidtransClientKey(data.midtransClientKey || "")
          setMidtransServerKey(data.midtransServerKey || "")
          setXenditApiKey(data.xenditApiKey || "")
          setWhatsappGateway(data.whatsappGateway || "SIMULATION")
          setWhatsappApiKey(data.whatsappApiKey || "")
          setWhatsappSender(data.whatsappSender || "")
          setWhatsappTemplate(data.whatsappTemplate || "Halo! 👾 Kreator favoritmu {creator} sekarang sedang LIVE streaming di Treetmi! Yuk nonton dan dukung di: {url}")
          setSupportWhatsapp(data.supportWhatsapp || "628123456789")
          setDiscordReportWebhook(data.discordReportWebhook || "")
          setFeeDonation(data.feeDonation !== undefined ? parseFloat(data.feeDonation) : 5.00)
          setFeeMabar(data.feeMabar !== undefined ? parseFloat(data.feeMabar) : 8.00)
          setFeeGift(data.feeGift !== undefined ? parseFloat(data.feeGift) : 10.00)
        }
      } catch (err) {
        console.error("Gagal memuat konfigurasi dari API, memuat dari localstorage fallback:", err)
        if (typeof window !== "undefined") {
          setPaymentGateway(localStorage.getItem("treetmi_payment_gateway") || "MIDTRANS")
          setPaymentSandbox(localStorage.getItem("treetmi_payment_sandbox") === "false" ? false : true)
          setMidtransMerchantId(localStorage.getItem("treetmi_midtrans_merchant_id") || "")
          setMidtransClientKey(localStorage.getItem("treetmi_midtrans_client_key") || "")
          setMidtransServerKey(localStorage.getItem("treetmi_midtrans_server_key") || "")
          setXenditApiKey(localStorage.getItem("treetmi_xendit_api_key") || "")
          setWhatsappGateway(localStorage.getItem("treetmi_whatsapp_gateway") || "SIMULATION")
          setWhatsappApiKey(localStorage.getItem("treetmi_whatsapp_api_key") || "")
          setWhatsappSender(localStorage.getItem("treetmi_whatsapp_sender") || "")
          setWhatsappTemplate(localStorage.getItem("treetmi_whatsapp_template") || "Halo! 👾 Kreator favoritmu {creator} sekarang sedang LIVE streaming di Treetmi! Yuk nonton dan dukung di: {url}")
          setSupportWhatsapp(localStorage.getItem("treetmi_support_whatsapp") || "628123456789")
          setDiscordReportWebhook(localStorage.getItem("treetmi_discord_report_webhook") || "")
          setFeeDonation(Number(localStorage.getItem("treetmi_fee_donation") || 5.00))
          setFeeMabar(Number(localStorage.getItem("treetmi_fee_mabar") || 8.00))
          setFeeGift(Number(localStorage.getItem("treetmi_fee_gift") || 10.00))
        }
      } finally {
        setLoading(false)
      }
    }

    fetchConfigs()
  }, [])

  const handleSaveConfigs = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Load visual settings from local storage to merge and save atomically
    const logoText = localStorage.getItem("treetmi_logo_text") || "treetmi"
    const logoUrl = localStorage.getItem("treetmi_logo_url") || ""
    const iconUrl = localStorage.getItem("treetmi_icon_url") || ""
    const companyName = localStorage.getItem("treetmi_company_name") || "PT Asosiasi Karya Treetmi"
    const ahuNumber = localStorage.getItem("treetmi_ahu_number") || ""
    const pseNumber = localStorage.getItem("treetmi_pse_number") || ""
    const nibNumber = localStorage.getItem("treetmi_nib_number") || ""
    const ahuLogo = localStorage.getItem("treetmi_ahu_logo") || ""
    const pseLogo = localStorage.getItem("treetmi_pse_logo") || ""
    const nibLogo = localStorage.getItem("treetmi_nib_logo") || ""
    const seoTitle = localStorage.getItem("treetmi_seo_title") || ""
    const metaDesc = localStorage.getItem("treetmi_seo_desc") || ""
    const keywords = localStorage.getItem("treetmi_seo_keywords") || ""
    const discordUrl = localStorage.getItem("treetmi_discord_url") || ""
    const xUrl = localStorage.getItem("treetmi_x_url") || ""
    const instagramUrl = localStorage.getItem("treetmi_instagram_url") || ""
    const tiktokUrl = localStorage.getItem("treetmi_tiktok_url") || ""
    const showLeaderboard = localStorage.getItem("treetmi_show_leaderboard") === "true"

    try {
      const response = await fetch(ADMIN_API.settings, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          logoText,
          logoUrl,
          iconUrl,
          companyName,
          ahuNumber,
          pseNumber,
          nibNumber,
          ahuLogo,
          pseLogo,
          nibLogo,
          paymentGateway,
          paymentSandbox,
          midtransMerchantId,
          midtransClientKey,
          midtransServerKey,
          xenditApiKey,
          whatsappGateway,
          whatsappApiKey,
          whatsappSender,
          whatsappTemplate,
          supportWhatsapp,
          discordReportWebhook,
          discordUrl,
          xUrl,
          instagramUrl,
          tiktokUrl,
          showLeaderboard,
          seoTitle,
          metaDesc,
          keywords,
          feeDonation: Number(feeDonation),
          feeMabar: Number(feeMabar),
          feeGift: Number(feeGift)
        })
      })

      const json = await response.json()
      if (json.success) {
        toast.success("Konfigurasi sistem & gateway berhasil disimpan!")
        
        // Sync local storage
        if (typeof window !== "undefined") {
          localStorage.setItem("treetmi_payment_gateway", paymentGateway)
          localStorage.setItem("treetmi_payment_sandbox", String(paymentSandbox))
          localStorage.setItem("treetmi_midtrans_merchant_id", midtransMerchantId)
          localStorage.setItem("treetmi_midtrans_client_key", midtransClientKey)
          localStorage.setItem("treetmi_midtrans_server_key", midtransServerKey)
          localStorage.setItem("treetmi_xendit_api_key", xenditApiKey)
          localStorage.setItem("treetmi_whatsapp_gateway", whatsappGateway)
          localStorage.setItem("treetmi_whatsapp_api_key", whatsappApiKey)
          localStorage.setItem("treetmi_whatsapp_sender", whatsappSender)
          localStorage.setItem("treetmi_whatsapp_template", whatsappTemplate)
          localStorage.setItem("treetmi_support_whatsapp", supportWhatsapp)
          localStorage.setItem("treetmi_discord_report_webhook", discordReportWebhook)
          localStorage.setItem("treetmi_fee_donation", String(feeDonation))
          localStorage.setItem("treetmi_fee_mabar", String(feeMabar))
          localStorage.setItem("treetmi_fee_gift", String(feeGift))
        }
      } else {
        toast.error(json.message || "Gagal menyimpan konfigurasi.")
      }
    } catch (err: any) {
      console.error(err)
      toast.error("Terjadi galat saat menyimpan konfigurasi sistem.")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200/40 dark:bg-zinc-800/40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-850" />
        <div className="h-64 bg-slate-200/40 dark:bg-zinc-800/40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-850" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSaveConfigs} className="space-y-8">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 columns: Config Cards */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card 1: Platform commission schema */}
          <Card className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm rounded-3xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-zinc-800 bg-[#FAF9F6] dark:bg-zinc-900 flex items-center gap-2">
              <Scale className="h-5 w-5 text-[#FFD551] shrink-0" />
              <h3 className="font-black text-xs italic tracking-widest text-black dark:text-white uppercase">
                1. Skema Persentase Komisi Platform (%)
              </h3>
            </div>
            <CardContent className="p-6 space-y-4">
              <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 italic leading-relaxed">
                Potongan persen komisi ini langsung dipotong secara otomatis saat transaksi penonton berstatus sukses (SUCCESS).
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Komisi Donasi Murni (%)</Label>
                  <div className="relative">
                    <Input 
                      type="number"
                      step="0.1"
                      required
                      value={feeDonation}
                      onChange={(e) => setFeeDonation(parseFloat(e.target.value) || 0)}
                      className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-xs text-slate-400">%</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Komisi Jasa Mabar (%)</Label>
                  <div className="relative">
                    <Input 
                      type="number"
                      step="0.1"
                      required
                      value={feeMabar}
                      onChange={(e) => setFeeMabar(parseFloat(e.target.value) || 0)}
                      className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-xs text-slate-400">%</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Komisi Gift Animasi (%)</Label>
                  <div className="relative">
                    <Input 
                      type="number"
                      step="0.1"
                      required
                      value={feeGift}
                      onChange={(e) => setFeeGift(parseFloat(e.target.value) || 0)}
                      className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-xs text-slate-400">%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Payment Gateway Credentials */}
          <Card className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm rounded-3xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-zinc-800 bg-[#FAF9F6] dark:bg-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#FFD551] shrink-0" />
                <h3 className="font-black text-xs italic tracking-widest text-black dark:text-white uppercase">
                  2. Integrasi API Payment Gateway
                </h3>
              </div>
              <Badge className="bg-black text-[#FFD551] dark:bg-[#FFD551]/10 dark:text-[#FFD551] border-none text-[8px] font-black uppercase tracking-widest">
                API Security
              </Badge>
            </div>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Penyedia Gerbang Utama</Label>
                  <select 
                    value={paymentGateway}
                    onChange={(e) => setPaymentGateway(e.target.value)}
                    className="w-full h-11 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 text-xs bg-white dark:bg-zinc-900 text-black dark:text-white font-bold outline-none"
                  >
                    <option value="MIDTRANS">MIDTRANS (Default Indonesia)</option>
                    <option value="XENDIT">XENDIT GATEWAY</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Mode Sandbox / Pengujian</Label>
                  <select 
                    value={String(paymentSandbox)}
                    onChange={(e) => setPaymentSandbox(e.target.value === "true")}
                    className="w-full h-11 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 text-xs bg-white dark:bg-zinc-900 text-black dark:text-white font-bold outline-none"
                  >
                    <option value="true">AKTIF (Sandbox - Simulasi Pembayaran Virtual)</option>
                    <option value="false">NON-AKTIF (Production - Pembayaran Uang Asli)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Credential Render */}
              {paymentGateway === "MIDTRANS" ? (
                <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-zinc-900">
                  <h4 className="text-[10px] font-black text-amber-600 dark:text-[#FFD551] tracking-widest uppercase">Kredensial Midtrans Indonesia</h4>
                  
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Midtrans Merchant ID</Label>
                    <Input 
                      placeholder="G-XXXXXX atau M-XXXXXX"
                      value={midtransMerchantId}
                      onChange={(e) => setMidtransMerchantId(e.target.value)}
                      className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Midtrans Client Key (Public Key)</Label>
                    <Input 
                      placeholder="SB-Mid-client-XXXXXXXXX"
                      value={midtransClientKey}
                      onChange={(e) => setMidtransClientKey(e.target.value)}
                      className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Midtrans Server Key (Secret Key)</Label>
                    <div className="relative">
                      <Input 
                        type={showMidtransServer ? "text" : "password"}
                        placeholder="SB-Mid-server-XXXXXXXXX"
                        value={midtransServerKey}
                        onChange={(e) => setMidtransServerKey(e.target.value)}
                        className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold font-mono pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowMidtransServer(!showMidtransServer)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black cursor-pointer dark:hover:text-white"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-zinc-900">
                  <h4 className="text-[10px] font-black text-amber-600 dark:text-[#FFD551] tracking-widest uppercase">Kredensial Xendit Gateway</h4>
                  
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Xendit Secret API Key</Label>
                    <div className="relative">
                      <Input 
                        type={showXenditApi ? "text" : "password"}
                        placeholder="xnd_development_XXXXXXXXXXXX"
                        value={xenditApiKey}
                        onChange={(e) => setXenditApiKey(e.target.value)}
                        className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold font-mono pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowXenditApi(!showXenditApi)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black cursor-pointer dark:hover:text-white"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 column: WhatsApp Configuration */}
        <div className="space-y-8">
          <Card className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm rounded-3xl overflow-hidden h-full">
            <div className="p-5 border-b border-slate-200 dark:border-zinc-800 bg-[#FAF9F6] dark:bg-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-[#FFD551] shrink-0" />
                <h3 className="font-black text-xs italic tracking-widest text-black dark:text-white uppercase">
                  3. Whatsapp Alerts
                </h3>
              </div>
              <Badge className="bg-black text-[#FFD551] dark:bg-[#FFD551]/10 dark:text-[#FFD551] border-none text-[8px] font-black uppercase tracking-widest">
                Gateway
              </Badge>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500">Penyedia Layanan (Gateway)</Label>
                <select 
                  value={whatsappGateway}
                  onChange={(e) => setWhatsappGateway(e.target.value)}
                  className="w-full h-11 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 text-xs bg-white dark:bg-zinc-900 text-black dark:text-white font-bold outline-none"
                >
                  <option value="SIMULATION">SIMULASI SISTEM (Gratis & Aman)</option>
                  <option value="FONNTE">FONNTE (Fonnte.com API)</option>
                  <option value="WABLAS">WABLAS GATEWAY</option>
                </select>
              </div>

              {whatsappGateway !== "SIMULATION" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-500">API Key / Token Otentikasi</Label>
                    <div className="relative">
                      <Input 
                        type={showWaApi ? "text" : "password"}
                        placeholder="Masukkan token dari penyedia gateway..."
                        value={whatsappApiKey}
                        onChange={(e) => setWhatsappApiKey(e.target.value)}
                        className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold font-mono pr-12 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowWaApi(!showWaApi)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black cursor-pointer dark:hover:text-white"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Nomor Pengirim (Device ID / Sender)</Label>
                    <Input 
                      placeholder="Contoh: 628XXXXXXXXXX"
                      value={whatsappSender}
                      onChange={(e) => setWhatsappSender(e.target.value)}
                      className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1.5 pt-2">
                <Label className="text-[10px] font-black uppercase text-slate-500">Format Template Pesan Alarm Live</Label>
                <textarea 
                  rows={4}
                  required
                  value={whatsappTemplate}
                  onChange={(e) => setWhatsappTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-white dark:bg-zinc-900 text-black dark:text-white font-bold outline-none leading-relaxed resize-none"
                  placeholder="Gunakan parameter tag {creator} dan {url} untuk pemformatan otomatis..."
                />
                <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-550 leading-relaxed block italic">
                  💡 *Tips:* Gunakan tag <code className="bg-slate-100 dark:bg-zinc-800 text-red-500 px-1 rounded font-mono">{`{creator}`}</code> untuk menyisipkan username kreator dan <code className="bg-slate-100 dark:bg-zinc-800 text-red-500 px-1 rounded font-mono">{`{url}`}</code> untuk link profil live mereka.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          disabled={isSaving}
          className="h-11 bg-[#FFD551] hover:bg-[#FFC83B] text-black border border-[#FFC83B] rounded-2xl text-xs font-black italic shadow-sm hover:scale-[1.02] active:scale-95 transition-all w-full md:w-auto px-8 cursor-pointer dark:border-transparent"
        >
          {isSaving ? "Menyimpan..." : "Simpan Semua Parameter"}
        </Button>
      </div>
    </form>
  )
}
