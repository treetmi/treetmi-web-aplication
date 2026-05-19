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
  const [paymentGateway, setPaymentGateway] = useState("MIDTRANS")
  const [paymentSandbox, setPaymentSandbox] = useState(true)
  const [midtransMerchantId, setMidtransMerchantId] = useState("")
  const [midtransClientKey, setMidtransClientKey] = useState("")
  const [midtransServerKey, setMidtransServerKey] = useState("")
  const [xenditApiKey, setXenditApiKey] = useState("")
  
  // Google SEO States
  const [seoTitle, setSeoTitle] = useState("Treetmi.id - Platform Dukungan Kreator Terbesar di Indonesia")
  const [metaDesc, setMetaDesc] = useState("Beri dukungan langsung berupa donasi, mabar, dan jasa murni kepada streamer, game developer, dan designer favoritmu dengan fee potongan terendah.")
  const [keywords, setKeywords] = useState("donasi, creator platform, streamer, game developer, coder, designer, treetmi, mabar")
  const [discordUrl, setDiscordUrl] = useState("")
  const [xUrl, setXUrl] = useState("")
  const [instagramUrl, setInstagramUrl] = useState("")
  const [tiktokUrl, setTiktokUrl] = useState("")

  // Platform Commission Fees
  const [feeDonation, setFeeDonation] = useState(5.00)
  const [feeMabar, setFeeMabar] = useState(8.00)

  // Dynamic Exchange Rates (IDR equivalents for 1 unit of foreign currency)
  const [rateUsd, setRateUsd] = useState(16000)
  const [rateMyr, setRateMyr] = useState(3400)
  const [rateSgd, setRateSgd] = useState(11800)
  const [ratePhp, setRatePhp] = useState(280)
  const [rateThb, setRateThb] = useState(440)

  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingIcon, setIsUploadingIcon] = useState(false)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const iconInputRef = useRef<HTMLInputElement>(null)

  // Handle Logo Upload with real-time WebP conversion
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingLogo(true)
    toast.info("Mengonversi gambar ke format WebP...")

    try {
      // 1. Transcode image file to optimized .webp on client side
      const result = await convertImageToWebp(file, 0.8)
      
      // 2. Read as Base64 Data URL for permanent database persistence
      const reader = new FileReader()
      reader.readAsDataURL(result.file)
      reader.onloadend = () => {
        const base64Data = reader.result as string
        setLogoUrl(base64Data)
        setIsUploadingLogo(false)
        toast.success(`Logo "${result.file.name}" berhasil dikompresi ke WebP dan siap disimpan! Sisa ukuran: ${Math.round(result.file.size / 1024)} KB.`);
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
      const result = await convertImageToWebp(file, 0.9) // Higher quality for tiny icons
      
      // 2. Read as Base64 Data URL for permanent database persistence
      const reader = new FileReader()
      reader.readAsDataURL(result.file)
      reader.onloadend = () => {
        const base64Data = reader.result as string
        setIconUrl(base64Data)
        setIsUploadingIcon(false)
        toast.success(`Favicon "${result.file.name}" berhasil dikompresi ke WebP dan siap disimpan!`);
      }
    } catch (err) {
      console.error(err)
      setIsUploadingIcon(false)
      toast.error("Gagal memproses unggahan favicon.")
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
          const cleanGateway = data.paymentGateway || "MIDTRANS"
          const cleanSandbox = data.paymentSandbox !== undefined ? Boolean(data.paymentSandbox) : true
          const cleanMidtransMerchant = data.midtransMerchantId || ""
          const cleanMidtransClient = data.midtransClientKey || ""
          const cleanMidtransServer = data.midtransServerKey || ""
          const cleanXenditApi = data.xenditApiKey || ""
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
          setAhuNumber(cleanAhu)
          setPseNumber(cleanPse)
          setNibNumber(cleanNib)
          setPaymentGateway(cleanGateway)
          setPaymentSandbox(cleanSandbox)
          setMidtransMerchantId(cleanMidtransMerchant)
          setMidtransClientKey(cleanMidtransClient)
          setMidtransServerKey(cleanMidtransServer)
          setXenditApiKey(cleanXenditApi)
          setSeoTitle(data.seoTitle || "Treetmi.id - Platform Dukungan Kreator Terbesar di Indonesia")
          setMetaDesc(data.metaDesc || "Beri dukungan langsung berupa donasi, mabar, dan jasa murni kepada streamer, game developer, dan designer favoritmu dengan fee potongan terendah.")
          setKeywords(data.keywords || "donasi, creator platform, streamer, game developer, coder, designer, treetmi, mabar")
          setFeeDonation(data.feeDonation !== undefined ? parseFloat(data.feeDonation) : 5.00)
          setFeeMabar(data.feeMabar !== undefined ? parseFloat(data.feeMabar) : 8.00)
          
          if (data.rates) {
            setRateUsd(data.rates.USD !== undefined ? Number(data.rates.USD) : 16000)
            setRateMyr(data.rates.MYR !== undefined ? Number(data.rates.MYR) : 3400)
            setRateSgd(data.rates.SGD !== undefined ? Number(data.rates.SGD) : 11800)
            setRatePhp(data.rates.PHP !== undefined ? Number(data.rates.PHP) : 280)
            setRateThb(data.rates.THB !== undefined ? Number(data.rates.THB) : 440)
          }

          // Seed localStorage so client-side components sync instantly
          if (typeof window !== "undefined") {
            localStorage.setItem("treetmi_logo_text", cleanText)
            localStorage.setItem("treetmi_logo_url", cleanLogo)
            localStorage.setItem("treetmi_icon_url", cleanIcon)
            localStorage.setItem("treetmi_company_name", cleanCompany)
            localStorage.setItem("treetmi_ahu_number", cleanAhu)
            localStorage.setItem("treetmi_pse_number", cleanPse)
            localStorage.setItem("treetmi_nib_number", cleanNib)
            localStorage.setItem("treetmi_payment_gateway", cleanGateway)
            localStorage.setItem("treetmi_payment_sandbox", String(cleanSandbox))
            localStorage.setItem("treetmi_midtrans_merchant_id", cleanMidtransMerchant)
            localStorage.setItem("treetmi_midtrans_client_key", cleanMidtransClient)
            localStorage.setItem("treetmi_midtrans_server_key", cleanMidtransServer)
            localStorage.setItem("treetmi_xendit_api_key", cleanXenditApi)
            localStorage.setItem("treetmi_discord_url", cleanDiscord)
            localStorage.setItem("treetmi_x_url", cleanX)
            localStorage.setItem("treetmi_instagram_url", cleanInstagram)
            localStorage.setItem("treetmi_tiktok_url", cleanTiktok)
            localStorage.setItem("treetmi_seo_title", data.seoTitle || "")
            localStorage.setItem("treetmi_seo_desc", data.metaDesc || "")
            localStorage.setItem("treetmi_seo_keywords", data.keywords || "")
            localStorage.setItem("treetmi_fee_donation", String(data.feeDonation || 5.00))
            localStorage.setItem("treetmi_fee_mabar", String(data.feeMabar || 8.00))
            if (data.rates) {
              localStorage.setItem("treetmi_rate_usd", String(data.rates.USD || 16000))
              localStorage.setItem("treetmi_rate_myr", String(data.rates.MYR || 3400))
              localStorage.setItem("treetmi_rate_sgd", String(data.rates.SGD || 11800))
              localStorage.setItem("treetmi_rate_php", String(data.rates.PHP || 280))
              localStorage.setItem("treetmi_rate_thb", String(data.rates.THB || 440))
            }
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
          setPaymentGateway(localStorage.getItem("treetmi_payment_gateway") || "MIDTRANS")
          setPaymentSandbox(localStorage.getItem("treetmi_payment_sandbox") === "false" ? false : true)
          setMidtransMerchantId(localStorage.getItem("treetmi_midtrans_merchant_id") || "")
          setMidtransClientKey(localStorage.getItem("treetmi_midtrans_client_key") || "")
          setMidtransServerKey(localStorage.getItem("treetmi_midtrans_server_key") || "")
          setXenditApiKey(localStorage.getItem("treetmi_xendit_api_key") || "")
          setDiscordUrl(localStorage.getItem("treetmi_discord_url") || "")
          setXUrl(localStorage.getItem("treetmi_x_url") || "")
          setInstagramUrl(localStorage.getItem("treetmi_instagram_url") || "")
          setTiktokUrl(localStorage.getItem("treetmi_tiktok_url") || "")
          
          setSeoTitle(localStorage.getItem("treetmi_seo_title") || "Treetmi.id - Platform Dukungan Kreator Terbesar di Indonesia")
          setMetaDesc(localStorage.getItem("treetmi_seo_desc") || "Beri dukungan langsung berupa donasi, mabar, dan jasa murni kepada streamer, game developer, dan designer favoritmu dengan fee potongan terendah.")
          setKeywords(localStorage.getItem("treetmi_seo_keywords") || "donasi, creator platform, streamer, game developer, coder, designer, treetmi, mabar")
          setFeeDonation(Number(localStorage.getItem("treetmi_fee_donation") || 5.00))
          setFeeMabar(Number(localStorage.getItem("treetmi_fee_mabar") || 8.00))
        }
      }
    }
    
    fetchSettings()
  }, [])

  // Save Settings Submit Handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
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
          paymentGateway,
          paymentSandbox: Boolean(paymentSandbox),
          midtransMerchantId,
          midtransClientKey,
          midtransServerKey,
          xenditApiKey,
          discordUrl,
          xUrl,
          instagramUrl,
          tiktokUrl,
          seoTitle,
          metaDesc,
          keywords,
          feeDonation: Number(feeDonation),
          feeMabar: Number(feeMabar),
          rates: {
            USD: Number(rateUsd),
            MYR: Number(rateMyr),
            SGD: Number(rateSgd),
            PHP: Number(ratePhp),
            THB: Number(rateThb)
          }
        })
      })

      const json = await response.json()
      
      if (json.success) {
        // Sync local storage for instant client-side rendering
        if (typeof window !== "undefined") {
          localStorage.setItem("treetmi_logo_text", logoText)
          localStorage.setItem("treetmi_logo_url", logoUrl)
          localStorage.setItem("treetmi_icon_url", iconUrl)
          localStorage.setItem("treetmi_company_name", companyName)
          localStorage.setItem("treetmi_ahu_number", ahuNumber)
          localStorage.setItem("treetmi_pse_number", pseNumber)
          localStorage.setItem("treetmi_nib_number", nibNumber)
          localStorage.setItem("treetmi_payment_gateway", paymentGateway)
          localStorage.setItem("treetmi_payment_sandbox", String(paymentSandbox))
          localStorage.setItem("treetmi_midtrans_merchant_id", midtransMerchantId)
          localStorage.setItem("treetmi_midtrans_client_key", midtransClientKey)
          localStorage.setItem("treetmi_midtrans_server_key", midtransServerKey)
          localStorage.setItem("treetmi_xendit_api_key", xenditApiKey)
          localStorage.setItem("treetmi_discord_url", discordUrl)
          localStorage.setItem("treetmi_x_url", xUrl)
          localStorage.setItem("treetmi_instagram_url", instagramUrl)
          localStorage.setItem("treetmi_tiktok_url", tiktokUrl)
          localStorage.setItem("treetmi_seo_title", seoTitle)
          localStorage.setItem("treetmi_fee_donation", String(feeDonation))
          localStorage.setItem("treetmi_fee_mabar", String(feeMabar))
          localStorage.setItem("treetmi_seo_desc", metaDesc)
          localStorage.setItem("treetmi_seo_keywords", keywords)
          localStorage.setItem("treetmi_rate_usd", String(rateUsd))
          localStorage.setItem("treetmi_rate_myr", String(rateMyr))
          localStorage.setItem("treetmi_rate_sgd", String(rateSgd))
          localStorage.setItem("treetmi_rate_php", String(ratePhp))
          localStorage.setItem("treetmi_rate_thb", String(rateThb))
          
          // Inject favicon dynamically with robust multi-tag purge/append
          if (iconUrl) {
            try {
              const existingIcons = document.querySelectorAll("link[rel*='icon']")
              existingIcons.forEach(el => el.remove())
              
              const link = document.createElement("link")
              link.rel = "icon"
              link.type = iconUrl.startsWith("data:") ? "image/webp" : "image/x-icon"
              link.href = iconUrl
              document.getElementsByTagName("head")[0].appendChild(link)

              const shortcut = document.createElement("link")
              shortcut.rel = "shortcut icon"
              shortcut.type = iconUrl.startsWith("data:") ? "image/webp" : "image/x-icon"
              shortcut.href = iconUrl
              document.getElementsByTagName("head")[0].appendChild(shortcut)
            } catch (e) {
              console.warn("Gagal memperbarui favicon secara dinamis:", e)
            }
          }
        }
        toast.success("Pengaturan website & optimasi Google SEO berhasil disimpan ke file backend & frontend!")
      } else {
        toast.error("Gagal menyimpan pengaturan ke database server.")
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
                {/* Logo Text Input */}
                <div className="space-y-2">
                  <Label className="text-xs font-black italic text-slate-500">Teks Logo Utama (Default Text Logo)</Label>
                  <Input 
                    required
                    value={logoText}
                    onChange={(e) => setLogoText(e.target.value)}
                    className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                  />
                </div>

                {/* Company Name / PT Input */}
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

                {/* Grid Logo & Favicon Upload */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Upload Logo Zone */}
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
                          <span className="text-[8px] font-bold text-slate-400">PNG/JPG &rarr; WebP otomatis</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Upload Favicon Zone */}
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
                          <span className="text-[10px] font-black italic">Upload Favicon / Tab Icon</span>
                          <span className="text-[8px] font-bold text-slate-400">1:1 Aspect ratio &rarr; WebP</span>
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
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Scale className="h-3.5 w-3.5 text-amber-500" />
                    <Label className="text-xs font-black italic text-slate-500">No. AHU Kemenkumham (Badan Hukum)</Label>
                  </div>
                  <Input 
                    value={ahuNumber}
                    onChange={(e) => setAhuNumber(e.target.value)}
                    className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                    placeholder="Contoh: AHU-0012345.AH.01.01.TAHUN 2026"
                  />
                  <p className="text-[9px] text-slate-400 dark:text-zinc-500 font-bold leading-normal italic">
                    Pengesahan Pendirian Badan Hukum Perseroan Terbatas dari Kemenkumham RI.
                  </p>
                </div>

                {/* PSE Kominfo */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-blue-500" />
                    <Label className="text-xs font-black italic text-slate-500">No. Tanda Daftar PSE Kominfo</Label>
                  </div>
                  <Input 
                    value={pseNumber}
                    onChange={(e) => setPseNumber(e.target.value)}
                    className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                    placeholder="Contoh: 001234.01/DJAI.PSE/05/2026"
                  />
                  <p className="text-[9px] text-slate-400 dark:text-zinc-500 font-bold leading-normal italic">
                    Tanda Daftar Penyelenggara Sistem Elektronik resmi dari Ditjen Aptika Kominfo RI.
                  </p>
                </div>

                {/* NIB (Nomor Induk Berusaha) */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <Label className="text-xs font-black italic text-slate-500">No. NIB / Nomor Induk Berusaha (OSS)</Label>
                  </div>
                  <Input 
                    value={nibNumber}
                    onChange={(e) => setNibNumber(e.target.value)}
                    className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                    placeholder="Contoh: 1234567890123"
                  />
                  <p className="text-[9px] text-slate-400 dark:text-zinc-500 font-bold leading-normal italic">
                    Nomor Induk Berusaha dari sistem Online Single Submission (OSS) Kementerian Investasi/BKPM RI.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-100/50 dark:border-amber-500/20 text-[10px] text-slate-600 dark:text-zinc-400 font-semibold leading-relaxed">
                💡 <strong>Tips Meningkatkan Trust:</strong> Pengisian nomor izin di atas bersifat opsional. Jika Anda mengisinya, sistem akan secara otomatis memunculkan baris kredensial legalitas transparan di bagian footer semua halaman website. Pengguna & Donatur akan merasa jauh lebih aman bertransaksi jika mengetahui platform ini terdaftar secara sah secara hukum.
              </div>
            </CardContent>
          </Card>

          {/* Section 1.3: Payment Gateway Configurations */}
          <Card className="border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm bg-white dark:bg-[#121211]">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <Sliders className="h-5 w-5 text-[#FFD551]" />
                <div>
                  <h3 className="font-black text-lg italic tracking-tight text-black dark:text-white">Integrasi Gerbang Pembayaran (Midtrans / Xendit)</h3>
                  <p className="text-xs font-bold italic text-slate-600 dark:text-zinc-400">Atur kredensial merchant dan API key dari gerbang pembayaran aktif</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gateway Selection */}
                <div className="space-y-2">
                  <Label className="text-xs font-black italic text-slate-500">Payment Gateway Aktif</Label>
                  <select 
                    value={paymentGateway}
                    onChange={(e) => setPaymentGateway(e.target.value)}
                    className="flex h-11 w-full border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FFD551] cursor-pointer"
                  >
                    <option value="MIDTRANS">MIDTRANS (Rekomendasi Indonesia)</option>
                    <option value="XENDIT">XENDIT (Sangat Populer)</option>
                  </select>
                </div>

                {/* Sandbox Toggle */}
                <div className="space-y-2">
                  <Label className="text-xs font-black italic text-slate-500">Mode Sistem Transaksi</Label>
                  <select 
                    value={paymentSandbox ? "true" : "false"}
                    onChange={(e) => setPaymentSandbox(e.target.value === "true")}
                    className="flex h-11 w-full border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FFD551] cursor-pointer"
                  >
                    <option value="true">SANDBOX / SIMULASI (Mode Pengujian)</option>
                    <option value="false">PRODUCTION / LIVE (Uang Asli Nyata)</option>
                  </select>
                </div>
              </div>

              {paymentGateway === "MIDTRANS" ? (
                <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-zinc-800/60">
                  <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider italic">Konfigurasi Merchant Midtrans</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-slate-500">Midtrans Merchant ID</Label>
                      <Input 
                        value={midtransMerchantId}
                        onChange={(e) => setMidtransMerchantId(e.target.value)}
                        className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold"
                        placeholder="Contoh: G123456789"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-slate-500">Midtrans Client Key</Label>
                      <Input 
                        value={midtransClientKey}
                        onChange={(e) => setMidtransClientKey(e.target.value)}
                        className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold"
                        placeholder="Contoh: SB-Mid-client-XXXXXXXX"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-slate-500">Midtrans Server Key (Rahasia)</Label>
                      <Input 
                        type="password"
                        value={midtransServerKey}
                        onChange={(e) => setMidtransServerKey(e.target.value)}
                        className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold"
                        placeholder="••••••••••••••••••••••••••••"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-zinc-800/60">
                  <h4 className="text-xs font-black uppercase text-blue-500 tracking-wider italic">Konfigurasi Merchant Xendit</h4>
                  
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Xendit Secret API Key (Secret Key)</Label>
                    <Input 
                      type="password"
                      value={xenditApiKey}
                      onChange={(e) => setXenditApiKey(e.target.value)}
                      className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold"
                      placeholder="Contoh: xnd_development_XXXXXXXXXXXX"
                    />
                  </div>
                </div>
              )}

              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/20 text-[10px] text-slate-600 dark:text-zinc-400 font-semibold leading-relaxed">
                ℹ️ <strong>Metode Integrasi Core API:</strong> Treetmi menggunakan pemrosesan langsung via Core API. Pembayaran QRIS akan menghasilkan gambar kode QR dinamis langsung di halaman kreator, sedangkan Virtual Account akan langsung memunculkan nomor rekening bayar virtual. Supporter tidak akan dialihkan ke halaman luar, menciptakan konversi donasi yang jauh lebih tinggi dan terlihat eksklusif.
              </div>
            </CardContent>
          </Card>

          {/* Section 1.5: Platform Commission / Fees */}
          <Card className="border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm bg-white dark:bg-[#121211]">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <Sliders className="h-5 w-5 text-[#FFD551]" />
                <div>
                  <h3 className="font-black text-lg italic tracking-tight text-black dark:text-white">Skema Potongan / Fee Platform</h3>
                  <p className="text-xs font-bold italic text-slate-600 dark:text-zinc-400">Atur besaran potongan komisi platform untuk setiap tipe transaksi dukungan</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Donation Fee */}
                <div className="space-y-2">
                  <Label className="text-xs font-black italic text-slate-500">Potongan Donasi Langsung (%)</Label>
                  <div className="relative">
                    <Input 
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      required
                      value={feeDonation}
                      onChange={(e) => setFeeDonation(Number(e.target.value))}
                      className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551] pr-10"
                    />
                    <span className="absolute right-4 top-3 text-xs font-black text-slate-400 dark:text-zinc-500">%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 italic font-bold">Default: 5% (Dikenakan saat donasi langsung)</p>
                </div>

                {/* Mabar Fee */}
                <div className="space-y-2">
                  <Label className="text-xs font-black italic text-slate-500">Potongan Mabar & Jasa Kreator (%)</Label>
                  <div className="relative">
                    <Input 
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      required
                      value={feeMabar}
                      onChange={(e) => setFeeMabar(Number(e.target.value))}
                      className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551] pr-10"
                    />
                    <span className="absolute right-4 top-3 text-xs font-black text-slate-400 dark:text-zinc-500">%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 italic font-bold">Default: 8% (Dikenakan saat main bareng & jasa)</p>
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
                {/* Meta Title */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-black italic text-slate-500">SEO Meta Title</Label>
                    <span className={`text-[9px] font-black italic ${seoTitle.length > 60 ? "text-amber-500" : "text-emerald-500"}`}>
                      {seoTitle.length} / 60 Karakter (Rekomendasi)
                    </span>
                  </div>
                  <Input 
                    required
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                  />
                </div>

                {/* Meta Description */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-black italic text-slate-500">SEO Meta Description</Label>
                    <span className={`text-[9px] font-black italic ${metaDesc.length > 160 ? "text-red-500" : metaDesc.length > 150 ? "text-amber-500" : "text-emerald-500"}`}>
                      {metaDesc.length} / 160 Karakter (Maksimal Google)
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

                {/* Meta Keywords */}
                <div className="space-y-2">
                  <Label className="text-xs font-black italic text-slate-500">SEO Meta Keywords (Pisahkan dengan koma)</Label>
                  <Input 
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="h-11 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black rounded-2xl text-xs font-black italic shadow-sm hover:scale-[1.02] active:scale-95 transition-all w-full md:w-auto px-8 cursor-pointer"
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

      {/* RIGHT COLUMN: Google Search Engine Result Preview Card */}
      <div className="space-y-6">
        
        {/* SERP Intro */}
        <div className="bg-[#FAF9F6] dark:bg-[#121211] border border-slate-200 dark:border-zinc-800 p-6 rounded-[2rem] space-y-3">
          <div className="flex items-center gap-2 text-black dark:text-[#FFD551]">
            <Eye className="h-4 w-4 text-[#FFD551]" />
            <span className="text-[10px] font-black tracking-wider italic">Google Search Result Preview</span>
          </div>
          <p className="text-[10px] text-slate-600 dark:text-zinc-400 leading-normal font-bold">
            Simulasi realtime Google Search Engine Result Page (SERP). Visualisasi di bawah menunjukkan bagaimana pengguna melihat situs Anda di halaman Google.
          </p>
        </div>

        {/* Realtime SERP Card */}
        <Card className="border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] shadow-md bg-white dark:bg-[#1A1A19] overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <span className="text-[10px] font-black tracking-wider italic text-slate-400 uppercase">Tampilan Google SERP</span>
            </div>

            {/* Google Search Mockup Box */}
            <div className="space-y-2 p-6 rounded-2xl border border-slate-100 bg-[#FAF9F6] dark:bg-[#121211] dark:border-zinc-800">
              
              {/* Google URL Line */}
              <div className="flex items-center gap-1.5 text-xs text-[#202124] dark:text-[#E8EAED]">
                <div className="h-6 w-6 rounded-full bg-white dark:bg-zinc-800 border border-slate-100 flex items-center justify-center font-bold text-[9px] text-[#202124] shrink-0">
                  {iconUrl ? (
                    <img src={iconUrl} alt="Favicon google preview" className="h-3.5 w-3.5 object-contain" />
                  ) : (
                    "T"
                  )}
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[11px] font-black text-slate-800 dark:text-zinc-300">treetmi.id</span>
                  <span className="text-[9px] text-slate-400 italic">https://treetmi.id</span>
                </div>
              </div>

              {/* Google Title Line */}
              <h4 className="text-[15px] font-bold text-[#1A0DAB] hover:underline cursor-pointer leading-tight dark:text-[#8AB4F8] pt-1">
                {seoTitle || "Harap Isi SEO Title..."}
              </h4>

              {/* Google Description Line */}
              <p className="text-xs text-[#4D5156] dark:text-[#BDC1C6] leading-relaxed break-words font-medium">
                {metaDesc ? (
                  metaDesc.length > 155 ? `${metaDesc.substring(0, 155)}...` : metaDesc
                ) : (
                  "Harap Isi SEO Deskripsi..."
                )}
              </p>

            </div>

            {/* SEO Optimization Rating */}
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between text-[10px] font-black italic">
              <span className="text-slate-400">Status SEO Tag:</span>
              {seoTitle.length >= 40 && seoTitle.length <= 60 && metaDesc.length >= 100 && metaDesc.length <= 160 ? (
                <span className="text-emerald-500 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 animate-pulse" /> Luar Biasa (Optimal)
                </span>
              ) : (
                <span className="text-amber-500">Butuh Penyesuaian</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* NEW CARD: Social Media Settings Card */}
        <Card className="border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] shadow-md bg-white dark:bg-[#1A1A19] overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-[#FFD551]" />
              <span className="text-[10px] font-black tracking-wider italic text-slate-400 uppercase">Pengaturan Media Sosial</span>
            </div>

            <div className="space-y-4">
              {/* Discord Link */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500">Discord URL</Label>
                <Input 
                  value={discordUrl}
                  onChange={(e) => setDiscordUrl(e.target.value)}
                  className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold bg-white text-black dark:bg-[#121211] dark:text-white"
                  placeholder="https://discord.gg/..."
                />
              </div>

              {/* X (Twitter) Link */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500">X (Twitter) URL</Label>
                <Input 
                  value={xUrl}
                  onChange={(e) => setXUrl(e.target.value)}
                  className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold bg-white text-black dark:bg-[#121211] dark:text-white"
                  placeholder="https://x.com/..."
                />
              </div>

              {/* Instagram Link */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500">Instagram URL</Label>
                <Input 
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold bg-white text-black dark:bg-[#121211] dark:text-white"
                  placeholder="https://instagram.com/..."
                />
              </div>

              {/* TikTok Link */}
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
            
            <p className="text-[9px] text-slate-400 dark:text-zinc-500 font-bold italic leading-normal">
              * Tautan media sosial ini akan otomatis terhubung ke tombol ikon di bagian footer situs treetmi.id. Biarkan kosong untuk menggunakan default.
            </p>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
