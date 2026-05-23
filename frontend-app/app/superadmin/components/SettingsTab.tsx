"use client"

import React, { useState, useRef } from "react"
import { Sliders, Globe, UploadCloud, Search, Eye, Sparkles, RefreshCw, ShieldCheck, Scale, Share2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { convertImageToWebp } from "@/lib/webp"
import { ADMIN_API } from "@/lib/api"

export default function SettingsTab() {
  // Website Settings States
  const [logoText, setLogoText] = useState("treetmi.id")
  const [logoUrl, setLogoUrl] = useState("")
  const [iconUrl, setIconUrl] = useState("")
  const [companyName, setCompanyName] = useState("PT Asosiasi Karya Treetmi")
  const [ahuNumber, setAhuNumber] = useState("")
  const [pseNumber, setPseNumber] = useState("")
  const [nibNumber, setNibNumber] = useState("")
  const [ahuLogo, setAhuLogo] = useState("")
  const [pseLogo, setPseLogo] = useState("")
  const [nibLogo, setNibLogo] = useState("")
  
  // Google SEO States
  const [seoTitle, setSeoTitle] = useState("Treetmi.id - Platform Dukungan Kreator Terbesar di Indonesia")
  const [metaDesc, setMetaDesc] = useState("Beri dukungan langsung berupa donasi, mabar, dan jasa murni kepada streamer, game developer, dan designer favoritmu dengan fee potongan terendah.")
  const [keywords, setKeywords] = useState("donasi, creator platform, streamer, game developer, coder, designer, treetmi, mabar")
  const [discordUrl, setDiscordUrl] = useState("")
  const [xUrl, setXUrl] = useState("")
  const [instagramUrl, setInstagramUrl] = useState("")
  const [tiktokUrl, setTiktokUrl] = useState("")
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [supportWhatsapp, setSupportWhatsapp] = useState("628123456789")
  const [discordReportWebhook, setDiscordReportWebhook] = useState("")

  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingIcon, setIsUploadingIcon] = useState(false)
  const [isUploadingAhuLogo, setIsUploadingAhuLogo] = useState(false)
  const [isUploadingPseLogo, setIsUploadingPseLogo] = useState(false)
  const [isUploadingNibLogo, setIsUploadingNibLogo] = useState(false)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const iconInputRef = useRef<HTMLInputElement>(null)
  const ahuLogoInputRef = useRef<HTMLInputElement>(null)
  const pseLogoInputRef = useRef<HTMLInputElement>(null)
  const nibLogoInputRef = useRef<HTMLInputElement>(null)

  // Handle Logo Upload with real-time WebP conversion
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingLogo(true)
    toast.info("Mengonversi gambar ke format WebP...")

    try {
      const result = await convertImageToWebp(file, 0.8)
      
      const reader = new FileReader()
      reader.readAsDataURL(result.file)
      reader.onloadend = () => {
        const base64Data = reader.result as string
        setLogoUrl(base64Data)
        setIsUploadingLogo(false)
        toast.success(`Logo "${result.file.name}" berhasil dikompresi ke WebP!`);
      }
    } catch (err) {
      console.error(err)
      setIsUploadingLogo(false)
      toast.error("Gagal memproses unggahan gambar.")
    }
  }

  // Handle Icon/Favicon Upload with WebP conversion
  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingIcon(true)
    toast.info("Mengonversi favicon ke format WebP...")

    try {
      const result = await convertImageToWebp(file, 0.9)
      
      const reader = new FileReader()
      reader.readAsDataURL(result.file)
      reader.onloadend = () => {
        const base64Data = reader.result as string
        setIconUrl(base64Data)
        setIsUploadingIcon(false)
        toast.success(`Favicon "${result.file.name}" berhasil dikompresi ke WebP!`);
      }
    } catch (err) {
      console.error(err)
      setIsUploadingIcon(false)
      toast.error("Gagal memproses unggahan favicon.")
    }
  }

  // Handle Legal Logos Uploads with WebP conversion
  const handleAhuLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingAhuLogo(true)
    toast.info("Mengonversi logo AHU ke format WebP...")

    try {
      const result = await convertImageToWebp(file, 0.8)
      const reader = new FileReader()
      reader.readAsDataURL(result.file)
      reader.onloadend = () => {
        setAhuLogo(reader.result as string)
        setIsUploadingAhuLogo(false)
        toast.success("Logo AHU berhasil dikompresi ke WebP!");
      }
    } catch (err) {
      console.error(err)
      setIsUploadingAhuLogo(false)
      toast.error("Gagal memproses unggahan logo AHU.")
    }
  }

  const handlePseLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingPseLogo(true)
    toast.info("Mengonversi logo PSE ke format WebP...")

    try {
      const result = await convertImageToWebp(file, 0.8)
      const reader = new FileReader()
      reader.readAsDataURL(result.file)
      reader.onloadend = () => {
        setPseLogo(reader.result as string)
        setIsUploadingPseLogo(false)
        toast.success("Logo PSE berhasil dikompresi ke WebP!");
      }
    } catch (err) {
      console.error(err)
      setIsUploadingPseLogo(false)
      toast.error("Gagal memproses unggahan logo PSE.")
    }
  }

  const handleNibLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingNibLogo(true)
    toast.info("Mengonversi logo NIB ke format WebP...")

    try {
      const result = await convertImageToWebp(file, 0.8)
      const reader = new FileReader()
      reader.readAsDataURL(result.file)
      reader.onloadend = () => {
        setNibLogo(reader.result as string)
        setIsUploadingNibLogo(false)
        toast.success("Logo NIB berhasil dikompresi ke WebP!");
      }
    } catch (err) {
      console.error(err)
      setIsUploadingNibLogo(false)
      toast.error("Gagal memproses unggahan logo NIB.")
    }
  }

  // Load Settings from Backend API on mount
  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(ADMIN_API.settings)
        const json = await res.json()
        if (json.success && json.data) {
          const data = json.data
          const cleanText = data.logoText || "treetmi"
          const cleanLogo = data.logoUrl && !data.logoUrl.startsWith("blob:") ? data.logoUrl : ""
          const cleanIcon = data.iconUrl && !data.iconUrl.startsWith("blob:") ? data.iconUrl : ""
          const cleanCompany = data.companyName || "PT Asosiasi Karya Treetmi"
          const cleanAhu = data.ahuNumber || ""
          const cleanPse = data.pseNumber || ""
          const cleanNib = data.nibNumber || ""
          const cleanAhuLogo = data.ahuLogo && !data.ahuLogo.startsWith("blob:") ? data.ahuLogo : ""
          const cleanPseLogo = data.pseLogo && !data.pseLogo.startsWith("blob:") ? data.pseLogo : ""
          const cleanNibLogo = data.nibLogo && !data.nibLogo.startsWith("blob:") ? data.nibLogo : ""
          const cleanDiscord = data.discordUrl || ""
          const cleanX = data.xUrl || ""
          const cleanInstagram = data.instagramUrl || ""
          const cleanTiktok = data.tiktokUrl || ""
          
          setLogoText(cleanText)
          setLogoUrl(cleanLogo)
          setIconUrl(cleanIcon)
          setCompanyName(cleanCompany)
          setDiscordUrl(cleanDiscord)
          setXUrl(cleanX)
          setInstagramUrl(cleanInstagram)
          setTiktokUrl(cleanTiktok)
          setShowLeaderboard(data.showLeaderboard !== undefined ? Boolean(data.showLeaderboard) : false)
          setSupportWhatsapp(data.supportWhatsapp || "628123456789")
          setDiscordReportWebhook(data.discordReportWebhook || "")
          setAhuNumber(cleanAhu)
          setPseNumber(cleanPse)
          setNibNumber(cleanNib)
          setAhuLogo(cleanAhuLogo)
          setPseLogo(cleanPseLogo)
          setNibLogo(cleanNibLogo)
          setSeoTitle(data.seoTitle || "Treetmi.id - Platform Dukungan Kreator Terbesar di Indonesia")
          setMetaDesc(data.metaDesc || "Beri dukungan langsung berupa donasi, mabar, dan jasa murni kepada streamer, game developer, dan designer favoritmu dengan fee potongan terendah.")
          setKeywords(data.keywords || "donasi, creator platform, streamer, game developer, coder, designer, treetmi, mabar")

          // Seed localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem("treetmi_logo_text", cleanText)
            localStorage.setItem("treetmi_logo_url", cleanLogo)
            localStorage.setItem("treetmi_icon_url", cleanIcon)
            localStorage.setItem("treetmi_company_name", cleanCompany)
            localStorage.setItem("treetmi_ahu_number", cleanAhu)
            localStorage.setItem("treetmi_pse_number", cleanPse)
            localStorage.setItem("treetmi_nib_number", cleanNib)
            localStorage.setItem("treetmi_ahu_logo", cleanAhuLogo)
            localStorage.setItem("treetmi_pse_logo", cleanPseLogo)
            localStorage.setItem("treetmi_nib_logo", cleanNibLogo)
            localStorage.setItem("treetmi_discord_url", cleanDiscord)
            localStorage.setItem("treetmi_x_url", cleanX)
            localStorage.setItem("treetmi_instagram_url", cleanInstagram)
            localStorage.setItem("treetmi_tiktok_url", cleanTiktok)
            localStorage.setItem("treetmi_show_leaderboard", String(data.showLeaderboard || false))
            localStorage.setItem("treetmi_support_whatsapp", data.supportWhatsapp || "628123456789")
            localStorage.setItem("treetmi_discord_report_webhook", data.discordReportWebhook || "")
            localStorage.setItem("treetmi_seo_title", data.seoTitle || "")
            localStorage.setItem("treetmi_seo_desc", data.metaDesc || "")
            localStorage.setItem("treetmi_seo_keywords", data.keywords || "")
          }
        }
      } catch (err) {
        console.error("Gagal memuat pengaturan dari server, memuat dari penyimpanan lokal:", err)
        if (typeof window !== "undefined") {
          setLogoText(localStorage.getItem("treetmi_logo_text") || "treetmi")
          setCompanyName(localStorage.getItem("treetmi_company_name") || "PT Asosiasi Karya Treetmi")
          
          const cachedLogo = localStorage.getItem("treetmi_logo_url") || ""
          const cachedIcon = localStorage.getItem("treetmi_icon_url") || ""
          
          setLogoUrl(cachedLogo.startsWith("blob:") ? "" : cachedLogo)
          setIconUrl(cachedIcon.startsWith("blob:") ? "" : cachedIcon)
          setAhuNumber(localStorage.getItem("treetmi_ahu_number") || "")
          setPseNumber(localStorage.getItem("treetmi_pse_number") || "")
          setNibNumber(localStorage.getItem("treetmi_nib_number") || "")
          setAhuLogo(localStorage.getItem("treetmi_ahu_logo") || "")
          setPseLogo(localStorage.getItem("treetmi_pse_logo") || "")
          setNibLogo(localStorage.getItem("treetmi_nib_logo") || "")
          setDiscordUrl(localStorage.getItem("treetmi_discord_url") || "")
          setXUrl(localStorage.getItem("treetmi_x_url") || "")
          setInstagramUrl(localStorage.getItem("treetmi_instagram_url") || "")
          setTiktokUrl(localStorage.getItem("treetmi_tiktok_url") || "")
          setShowLeaderboard(localStorage.getItem("treetmi_show_leaderboard") === "true")
          setSupportWhatsapp(localStorage.getItem("treetmi_support_whatsapp") || "628123456789")
          setDiscordReportWebhook(localStorage.getItem("treetmi_discord_report_webhook") || "")
          
          setSeoTitle(localStorage.getItem("treetmi_seo_title") || "Treetmi.id - Platform Dukungan Kreator Terbesar di Indonesia")
          setMetaDesc(localStorage.getItem("treetmi_seo_desc") || "Beri dukungan langsung berupa donasi, mabar, dan jasa murni kepada streamer, game developer, dan designer favoritmu dengan fee potongan terendah.")
          setKeywords(localStorage.getItem("treetmi_seo_keywords") || "donasi, creator platform, streamer, game developer, coder, designer, treetmi, mabar")
        }
      }
    }
    
    fetchSettings()
  }, [])

  // Save Settings Submit Handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    // Fetch system configurations from localStorage so they are not wiped during general settings save
    const paymentGateway = localStorage.getItem("treetmi_payment_gateway") || "MIDTRANS"
    const paymentSandbox = localStorage.getItem("treetmi_payment_sandbox") === "true"
    const midtransMerchantId = localStorage.getItem("treetmi_midtrans_merchant_id") || ""
    const midtransClientKey = localStorage.getItem("treetmi_midtrans_client_key") || ""
    const midtransServerKey = localStorage.getItem("treetmi_midtrans_server_key") || ""
    const xenditApiKey = localStorage.getItem("treetmi_xendit_api_key") || ""
    const whatsappGateway = localStorage.getItem("treetmi_whatsapp_gateway") || "SIMULATION"
    const whatsappApiKey = localStorage.getItem("treetmi_whatsapp_api_key") || ""
    const whatsappSender = localStorage.getItem("treetmi_whatsapp_sender") || ""
    const whatsappTemplate = localStorage.getItem("treetmi_whatsapp_template") || ""
    const feeDonation = Number(localStorage.getItem("treetmi_fee_donation") || 5.00)
    const feeMabar = Number(localStorage.getItem("treetmi_fee_mabar") || 8.00)
    const feeGift = Number(localStorage.getItem("treetmi_fee_gift") || 10.00)

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
          discordUrl,
          xUrl,
          instagramUrl,
          tiktokUrl,
          showLeaderboard: Boolean(showLeaderboard),
          supportWhatsapp,
          discordReportWebhook,
          seoTitle,
          metaDesc,
          keywords,
          feeDonation,
          feeMabar,
          feeGift
        })
      })

      const json = await response.json()
      
      if (json.success) {
        if (typeof window !== "undefined") {
          localStorage.setItem("treetmi_logo_text", logoText)
          localStorage.setItem("treetmi_logo_url", logoUrl)
          localStorage.setItem("treetmi_icon_url", iconUrl)
          localStorage.setItem("treetmi_company_name", companyName)
          localStorage.setItem("treetmi_ahu_number", ahuNumber)
          localStorage.setItem("treetmi_pse_number", pseNumber)
          localStorage.setItem("treetmi_nib_number", nibNumber)
          localStorage.setItem("treetmi_ahu_logo", json.data?.ahuLogo || ahuLogo)
          localStorage.setItem("treetmi_pse_logo", json.data?.pseLogo || pseLogo)
          localStorage.setItem("treetmi_nib_logo", json.data?.nibLogo || nibLogo)
          
          if (json.data?.ahuLogo) setAhuLogo(json.data.ahuLogo)
          if (json.data?.pseLogo) setPseLogo(json.data.pseLogo)
          if (json.data?.nibLogo) setNibLogo(json.data.nibLogo)

          localStorage.setItem("treetmi_discord_url", discordUrl)
          localStorage.setItem("treetmi_x_url", xUrl)
          localStorage.setItem("treetmi_instagram_url", instagramUrl)
          localStorage.setItem("treetmi_tiktok_url", tiktokUrl)
          localStorage.setItem("treetmi_show_leaderboard", String(showLeaderboard))
          localStorage.setItem("treetmi_support_whatsapp", supportWhatsapp)
          localStorage.setItem("treetmi_discord_report_webhook", discordReportWebhook)
          localStorage.setItem("treetmi_seo_title", seoTitle)
          localStorage.setItem("treetmi_seo_desc", metaDesc)
          localStorage.setItem("treetmi_seo_keywords", keywords)
          
          // Inject favicon dynamically
          if (iconUrl) {
            try {
              const existingIcons = document.querySelectorAll("link[rel*='icon']")
              existingIcons.forEach(el => el.remove())
              
              const link = document.createElement("link")
              link.rel = "icon"
              link.type = iconUrl.startsWith("data:") ? "image/webp" : "image/x-icon"
              link.href = iconUrl
              document.getElementsByTagName("head")[0].appendChild(link)
            } catch (e) {
              console.warn("Gagal memperbarui favicon secara dinamis:", e)
            }
          }
        }
        toast.success("Pengaturan website & optimasi Google SEO berhasil disimpan!")
      } else {
        toast.error(json.message || "Gagal menyimpan pengaturan ke server.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal menghubungkan ke backend api server.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full">
      
      {/* LEFT COLUMN: Logo & Website Settings Form */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSaveSettings} className="space-y-6">
          
          {/* Section 1: Branding Assets */}
          <Card className="border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm bg-white dark:bg-[#121211]">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <Sliders className="h-5 w-5 text-[#FFD551]" />
                <div>
                  <h3 className="font-black text-lg italic tracking-tight text-black dark:text-white">Identitas & Branding</h3>
                  <p className="text-xs font-bold italic text-slate-600 dark:text-zinc-400">Konfigurasi visual dasar untuk tampilan utama treetmi.id</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black italic text-slate-500">Teks Logo Utama (Default Text Logo)</Label>
                  <Input 
                    required
                    value={logoText}
                    onChange={(e) => setLogoText(e.target.value)}
                    className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black italic text-slate-500">Nama Perusahaan / PT Legal (Copyright Footer)</Label>
                  <Input 
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                    placeholder="PT Asosiasi Karya Treetmi"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black italic text-slate-500">Status Halaman Top Creator / Leaderboard Publik</Label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setShowLeaderboard(true)}
                      className={`flex-1 py-3 px-4 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        showLeaderboard
                          ? "bg-[#FFD551] text-black border-[#FFD551] shadow-sm"
                          : "bg-transparent text-slate-500 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900"
                      }`}
                    >
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      Aktif (Tampilkan Data Peringkat)
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLeaderboard(false)}
                      className={`flex-1 py-3 px-4 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        !showLeaderboard
                          ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                          : "bg-transparent text-slate-500 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900"
                      }`}
                    >
                      <Eye className="h-4 w-4" />
                      Nonaktif (Tampilkan Coming Soon)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Upload Logo */}
                  <div className="space-y-2">
                    <Label className="text-xs font-black italic text-slate-500">Gambar Logo Utama (WebP Auto-Convert)</Label>
                    <div className="border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center bg-[#FAF9F6] dark:bg-zinc-900/40 relative min-h-36 overflow-hidden">
                      <input 
                        type="file" 
                        accept="image/*"
                        ref={logoInputRef}
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      {isUploadingLogo ? (
                        <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                          <RefreshCw className="h-6 w-6 animate-spin text-[#FFD551]" />
                          <span className="text-[10px] font-bold italic">Mengompresi ke WebP...</span>
                        </div>
                      ) : logoUrl ? (
                        <div className="flex flex-col items-center justify-center space-y-3 w-full">
                          <img 
                            src={logoUrl} 
                            alt="Logo preview" 
                            className="max-h-48 object-contain rounded-lg border border-slate-100"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => logoInputRef.current?.click()}
                            className="h-7 border border-slate-200 text-slate-500 rounded-lg text-[9px] font-black italic hover:bg-slate-100"
                          >
                            Ganti Gambar
                          </Button>
                        </div>
                      ) : (
                        <button 
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          className="flex flex-col items-center justify-center space-y-2 text-slate-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer w-full h-full"
                        >
                          <UploadCloud className="h-8 w-8 text-slate-300" />
                          <span className="text-[10px] font-black italic">Upload Gambar Logo</span>
                          <span className="text-[8px] font-bold text-slate-400">PNG/JPG &rarr; WebP</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Upload Favicon */}
                  <div className="space-y-2">
                    <Label className="text-xs font-black italic text-slate-500">Ikon Favicon Situs (WebP Auto-Convert)</Label>
                    <div className="border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center bg-[#FAF9F6] dark:bg-zinc-900/40 relative min-h-36 overflow-hidden">
                      <input 
                        type="file" 
                        accept="image/*"
                        ref={iconInputRef}
                        onChange={handleIconUpload}
                        className="hidden"
                      />
                      {isUploadingIcon ? (
                        <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                          <RefreshCw className="h-6 w-6 animate-spin text-[#FFD551]" />
                          <span className="text-[10px] font-bold italic">Memproses WebP...</span>
                        </div>
                      ) : iconUrl ? (
                        <div className="flex flex-col items-center justify-center space-y-3 w-full">
                          <img 
                            src={iconUrl} 
                            alt="Favicon preview" 
                            className="h-10 w-10 object-contain rounded-lg border border-slate-100 bg-white"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => iconInputRef.current?.click()}
                            className="h-7 border border-slate-200 text-slate-500 rounded-lg text-[9px] font-black italic hover:bg-slate-100"
                          >
                            Ganti Ikon
                          </Button>
                        </div>
                      ) : (
                        <button 
                          type="button"
                          onClick={() => iconInputRef.current?.click()}
                          className="flex flex-col items-center justify-center space-y-2 text-slate-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer w-full h-full"
                        >
                          <UploadCloud className="h-8 w-8 text-slate-300" />
                          <span className="text-[10px] font-black italic">Upload Favicon</span>
                          <span className="text-[8px] font-bold text-slate-400">1:1 &rarr; WebP</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 1.2: Legalities & Permits */}
          <Card className="border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm bg-white dark:bg-[#121211]">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-[#FFD551]" />
                <div>
                  <h3 className="font-black text-lg italic tracking-tight text-black dark:text-white">Legalitas & Lisensi (Trust Building)</h3>
                  <p className="text-xs font-bold italic text-slate-600 dark:text-zinc-400">Masukkan nomor perizinan resmi untuk membangun reputasi dan kepatuhan hukum</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AHU Kemenkumham */}
                <div className="flex gap-4 items-start">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Scale className="h-3.5 w-3.5 text-amber-500" />
                      <Label className="text-xs font-black italic text-slate-500">No. AHU Kemenkumham (Badan Hukum)</Label>
                    </div>
                    <Input 
                      value={ahuNumber}
                      onChange={(e) => setAhuNumber(e.target.value)}
                      className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                      placeholder="AHU-0012345.AH.01.01.TAHUN 2026"
                    />
                  </div>
                  <div className="w-24 space-y-2">
                    <Label className="text-[10px] font-black italic text-slate-500 text-center block">Logo AHU</Label>
                    <div className="border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl p-2 flex flex-col items-center justify-center bg-[#FAF9F6] dark:bg-zinc-900/40 relative min-h-16 max-h-20 overflow-hidden">
                      <input 
                        type="file" 
                        accept="image/*"
                        ref={ahuLogoInputRef}
                        onChange={handleAhuLogoUpload}
                        className="hidden"
                      />
                      {isUploadingAhuLogo ? (
                        <RefreshCw className="h-4 w-4 animate-spin text-[#FFD551]" />
                      ) : ahuLogo ? (
                        <div className="flex flex-col items-center justify-center space-y-1 w-full">
                          <img src={ahuLogo} alt="AHU" className="h-8 object-contain" />
                          <button type="button" onClick={() => setAhuLogo("")} className="text-[8px] font-black text-rose-500 hover:underline">Hapus</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => ahuLogoInputRef.current?.click()} className="flex flex-col items-center justify-center text-slate-400 py-1 cursor-pointer">
                          <UploadCloud className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* PSE Kominfo */}
                <div className="flex gap-4 items-start">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-blue-500" />
                      <Label className="text-xs font-black italic text-slate-500">No. Tanda Daftar PSE Kominfo</Label>
                    </div>
                    <Input 
                      value={pseNumber}
                      onChange={(e) => setPseNumber(e.target.value)}
                      className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                      placeholder="001234.01/DJAI.PSE/05/2026"
                    />
                  </div>
                  <div className="w-24 space-y-2">
                    <Label className="text-[10px] font-black italic text-slate-500 text-center block">Logo PSE</Label>
                    <div className="border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl p-2 flex flex-col items-center justify-center bg-[#FAF9F6] dark:bg-zinc-900/40 relative min-h-16 max-h-20 overflow-hidden">
                      <input 
                        type="file" 
                        accept="image/*"
                        ref={pseLogoInputRef}
                        onChange={handlePseLogoUpload}
                        className="hidden"
                      />
                      {isUploadingPseLogo ? (
                        <RefreshCw className="h-4 w-4 animate-spin text-[#FFD551]" />
                      ) : pseLogo ? (
                        <div className="flex flex-col items-center justify-center space-y-1 w-full">
                          <img src={pseLogo} alt="PSE" className="h-8 object-contain" />
                          <button type="button" onClick={() => setPseLogo("")} className="text-[8px] font-black text-rose-500 hover:underline">Hapus</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => pseLogoInputRef.current?.click()} className="flex flex-col items-center justify-center text-slate-400 py-1 cursor-pointer">
                          <UploadCloud className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* NIB */}
                <div className="flex gap-4 items-start col-span-1 md:col-span-2">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      <Label className="text-xs font-black italic text-slate-500">No. NIB (OSS BKPM)</Label>
                    </div>
                    <Input 
                      value={nibNumber}
                      onChange={(e) => setNibNumber(e.target.value)}
                      className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                      placeholder="NIB 13-digit"
                    />
                  </div>
                  <div className="w-24 space-y-2">
                    <Label className="text-[10px] font-black italic text-slate-500 text-center block">Logo NIB</Label>
                    <div className="border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl p-2 flex flex-col items-center justify-center bg-[#FAF9F6] dark:bg-zinc-900/40 relative min-h-16 max-h-20 overflow-hidden">
                      <input 
                        type="file" 
                        accept="image/*"
                        ref={nibLogoInputRef}
                        onChange={handleNibLogoUpload}
                        className="hidden"
                      />
                      {isUploadingNibLogo ? (
                        <RefreshCw className="h-4 w-4 animate-spin text-[#FFD551]" />
                      ) : nibLogo ? (
                        <div className="flex flex-col items-center justify-center space-y-1 w-full">
                          <img src={nibLogo} alt="NIB" className="h-8 object-contain" />
                          <button type="button" onClick={() => setNibLogo("")} className="text-[8px] font-black text-rose-500 hover:underline">Hapus</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => nibLogoInputRef.current?.click()} className="flex flex-col items-center justify-center text-slate-400 py-1 cursor-pointer">
                          <UploadCloud className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Google SEO Optimization */}
          <Card className="border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm bg-white dark:bg-[#121211]">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-[#FFD551]" />
                <div>
                  <h3 className="font-black text-lg italic tracking-tight text-black dark:text-white">Optimasi Google SEO</h3>
                  <p className="text-xs font-bold italic text-slate-600 dark:text-zinc-400">Sesuaikan meta tags untuk meningkatkan ranking pencarian Google Search</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-black italic text-slate-500">SEO Meta Title</Label>
                    <span className={`text-[9px] font-black italic ${seoTitle.length > 60 ? "text-amber-500" : "text-emerald-500"}`}>
                      {seoTitle.length} / 60 Karakter
                    </span>
                  </div>
                  <Input 
                    required
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-black italic text-slate-500">SEO Meta Description</Label>
                    <span className={`text-[9px] font-black italic ${metaDesc.length > 160 ? "text-red-500" : metaDesc.length > 150 ? "text-amber-500" : "text-emerald-500"}`}>
                      {metaDesc.length} / 160 Karakter
                    </span>
                  </div>
                  <textarea 
                    required
                    value={metaDesc}
                    onChange={(e) => setMetaDesc(e.target.value)}
                    rows={4}
                    className="flex min-h-[80px] w-full border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551] resize-none leading-relaxed p-4 outline-none text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black italic text-slate-500">SEO Meta Keywords (Pisahkan dengan koma)</Label>
                  <Input 
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="h-11 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black rounded-2xl text-xs font-black italic shadow-sm hover:scale-[1.02] active:scale-95 transition-all w-full md:w-auto px-8 cursor-pointer border-none"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Menyimpan Pengaturan...
                    </>
                  ) : (
                    "Terapkan Konfigurasi Website"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>

      {/* RIGHT COLUMN: Google SERP Preview Card & Socials */}
      <div className="space-y-6">
        <div className="bg-[#FAF9F6] dark:bg-[#121211] border border-slate-200 dark:border-zinc-800 p-6 rounded-[2rem] space-y-3">
          <div className="flex items-center gap-2 text-black dark:text-[#FFD551]">
            <Eye className="h-4 w-4 text-[#FFD551]" />
            <span className="text-[10px] font-black tracking-wider italic">Google Search Result Preview</span>
          </div>
          <p className="text-[10px] text-slate-650 dark:text-zinc-400 leading-normal font-bold">
            Simulasi realtime Google Search Engine Result Page (SERP).
          </p>
        </div>

        <Card className="border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] shadow-md bg-white dark:bg-[#1A1A19] overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <span className="text-[10px] font-black tracking-wider italic text-slate-400 uppercase">Tampilan Google SERP</span>
            </div>

            <div className="space-y-2 p-6 rounded-2xl border border-slate-100 bg-[#FAF9F6] dark:bg-[#121211] dark:border-zinc-800">
              <div className="flex items-center gap-1.5 text-xs text-[#202124] dark:text-[#E8EAED]">
                <div className="h-6 w-6 rounded-full bg-white dark:bg-zinc-800 border border-slate-100 flex items-center justify-center font-bold text-[9px] text-[#202124] shrink-0">
                  {iconUrl ? <img src={iconUrl} alt="Favicon" className="h-3.5 w-3.5 object-contain" /> : "T"}
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[11px] font-black text-slate-800 dark:text-zinc-300">treetmi.id</span>
                  <span className="text-[9px] text-slate-450 italic">https://treetmi.id</span>
                </div>
              </div>

              <h4 className="text-[15px] font-bold text-[#1A0DAB] hover:underline cursor-pointer leading-tight dark:text-[#8AB4F8] pt-1">
                {seoTitle || "Harap Isi SEO Title..."}
              </h4>

              <p className="text-xs text-[#4D5156] dark:text-[#BDC1C6] leading-relaxed break-words font-medium">
                {metaDesc ? (metaDesc.length > 155 ? `${metaDesc.substring(0, 155)}...` : metaDesc) : "Harap Isi SEO Deskripsi..."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Social Medias Card */}
        <Card className="border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] shadow-md bg-white dark:bg-[#1A1A19] overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-[#FFD551]" />
              <span className="text-[10px] font-black tracking-wider italic text-slate-400 uppercase">Pengaturan Media Sosial</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500">Discord URL</Label>
                <Input 
                  value={discordUrl}
                  onChange={(e) => setDiscordUrl(e.target.value)}
                  className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold bg-white text-black dark:bg-[#121211] dark:text-white"
                  placeholder="https://discord.gg/..."
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500">X (Twitter) URL</Label>
                <Input 
                  value={xUrl}
                  onChange={(e) => setXUrl(e.target.value)}
                  className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold bg-white text-black dark:bg-[#121211] dark:text-white"
                  placeholder="https://x.com/..."
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500">Instagram URL</Label>
                <Input 
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold bg-white text-black dark:bg-[#121211] dark:text-white"
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500">TikTok URL</Label>
                <Input 
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold bg-white text-black dark:bg-[#121211] dark:text-white"
                  placeholder="https://tiktok.com/@..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Helpdesk & Report Settings Card */}
        <Card className="border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] shadow-md bg-white dark:bg-[#1A1A19] overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#FFD551]" />
              <span className="text-[10px] font-black tracking-wider italic text-slate-400 uppercase">Bantuan & Laporan</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500">WhatsApp Admin Support</Label>
                <Input 
                  value={supportWhatsapp}
                  onChange={(e) => setSupportWhatsapp(e.target.value)}
                  className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold bg-white text-black dark:bg-[#121211] dark:text-white"
                  placeholder="628123456789"
                />
                <span className="text-[9px] font-bold text-slate-400 leading-relaxed block italic">
                  Nomor tujuan redirect WhatsApp saat pengunjung menekan tombol bantuan di halaman publik.
                </span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500">Discord Report Webhook</Label>
                <Input 
                  type="password"
                  value={discordReportWebhook}
                  onChange={(e) => setDiscordReportWebhook(e.target.value)}
                  className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold bg-white text-black dark:bg-[#121211] dark:text-white font-mono"
                  placeholder="https://discord.com/api/webhooks/..."
                />
                <span className="text-[9px] font-bold text-slate-400 leading-relaxed block italic">
                  Webhook untuk mengirimkan log aduan baru secara otomatis ke Discord.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
