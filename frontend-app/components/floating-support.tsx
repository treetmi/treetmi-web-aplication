"use client"

import React, { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  MessageSquare, 
  X, 
  Send, 
  HelpCircle, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  ChevronRight, 
  Upload, 
  CheckCircle2, 
  Loader2,
  PhoneCall
} from "lucide-react"
import axios from "axios"
import { PUBLIC_API } from "@/lib/api"
import { toast } from "sonner"

export default function FloatingSupport() {
  const pathname = usePathname()
  
  if (pathname && (pathname.startsWith("/superadmin") || pathname.startsWith("/dashboard"))) {
    return null
  }

  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"menu" | "report">("menu")
  
  // Settings state
  const [supportWhatsapp, setSupportWhatsapp] = useState("628123456789")

  // Form states
  const [reporterEmail, setReporterEmail] = useState("")
  const [reporterName, setReporterName] = useState("")
  const [targetUsername, setTargetUsername] = useState("")
  const [category, setCategory] = useState("SCAM")
  const [details, setDetails] = useState("")
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  
  // Request states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch Public WhatsApp Support Config
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await axios.get(PUBLIC_API.publicSettings)
        if (res.data?.success && res.data?.data?.supportWhatsapp) {
          setSupportWhatsapp(res.data.data.supportWhatsapp)
        }
      } catch (err) {
        console.warn("Failed to fetch public settings in support widget:", err)
      }
    }
    fetchSettings()
  }, [])

  // Auto-fill target username based on URL path
  useEffect(() => {
    if (pathname) {
      const parts = pathname.split("/").filter(Boolean)
      if (parts.length === 1) {
        const potential = parts[0]
        const excluded = [
          "login", "register", "dashboard", "superadmin", 
          "creators", "faq", "about", "privacy", "terms", "widget"
        ]
        if (!excluded.includes(potential.toLowerCase())) {
          setTargetUsername(potential)
        } else {
          setTargetUsername("")
        }
      } else {
        setTargetUsername("")
      }
    }
  }, [pathname])

  // Handle image selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Format check
      const allowed = ["image/png", "image/jpg", "image/jpeg", "image/webp"]
      if (!allowed.includes(file.type)) {
        toast.error("Format file tidak didukung! Pilih gambar PNG, JPG, atau WEBP.")
        return
      }

      // Size check (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file terlalu besar! Maksimal batas ukuran adalah 5 MB.")
        return
      }

      setScreenshot(file)

      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reporterEmail) {
      toast.error("Email pelapor wajib diisi.")
      return
    }

    if (!details || details.trim() === "") {
      toast.error("Detail aduan/laporan wajib diisi.")
      return
    }

    if (!screenshot) {
      toast.error("Bukti screenshot laporan wajib diunggah.")
      return
    }

    setIsSubmitting(true)
    
    // Construct Multipart Form Data
    const formData = new FormData()
    formData.append("reporter_email", reporterEmail)
    formData.append("reporter_name", reporterName)
    formData.append("target_username", targetUsername)
    formData.append("category", category)
    formData.append("details", details)
    formData.append("screenshot", screenshot)

    try {
      const res = await axios.post(PUBLIC_API.reports, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      if (res.data?.success) {
        setIsSubmitted(true)
        toast.success("Laporan Anda berhasil dikirim ke admin!")
        // Reset form fields
        setReporterEmail("")
        setReporterName("")
        setDetails("")
        setScreenshot(null)
        setScreenshotPreview(null)
      }
    } catch (err: any) {
      console.error("Report submit error:", err)
      const msg = err.response?.data?.message || "Gagal mengirim laporan. Coba beberapa saat lagi."
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle WhatsApp Support Click
  const handleWhatsAppRedirect = () => {
    const formattedPhone = supportWhatsapp.replace(/[^0-9]/g, "")
    const message = encodeURIComponent("Halo Admin Treetmi, saya butuh bantuan terkait platform Treetmi.id...")
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, "_blank")
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 50 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="absolute bottom-16 right-0 w-[350px] max-w-[calc(100vw-2rem)] rounded-2xl bg-neutral-900/95 border border-yellow-500/25 shadow-2xl backdrop-blur-md overflow-hidden text-neutral-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-500/10 via-neutral-900 to-neutral-900 border-b border-neutral-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-[#FFD551]" />
                <span className="font-bold text-white tracking-wide">Pusat Bantuan Treetmi</span>
              </div>
              <button 
                onClick={() => { setIsOpen(false); setActiveTab("menu"); setIsSubmitted(false); }}
                className="text-neutral-400 hover:text-white transition-colors duration-200 p-1 hover:bg-neutral-800 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Tabs */}
            <div className="p-5 max-h-[450px] overflow-y-auto">
              {activeTab === "menu" ? (
                <div className="space-y-4">
                  <p className="text-sm text-neutral-400 leading-relaxed mb-4">
                    Butuh bantuan atau ingin melaporkan konten / penipuan? Silakan pilih menu di bawah ini.
                  </p>
                  
                  {/* WhatsApp Support Button */}
                  <button
                    onClick={handleWhatsAppRedirect}
                    className="w-full flex items-center justify-between p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform duration-200">
                        <PhoneCall className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">WhatsApp Admin</h4>
                        <p className="text-xs text-neutral-400 mt-0.5">Hubungi customer service Treetmi</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-neutral-500 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>

                  {/* Report Creator Button */}
                  <button
                    onClick={() => setActiveTab("report")}
                    className="w-full flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-xl transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform duration-200">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">Laporkan Kreator</h4>
                        <p className="text-xs text-neutral-400 mt-0.5">Kirim aduan penipuan / pelanggaran</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-neutral-500 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                </div>
              ) : (
                /* Report Form */
                <div>
                  {isSubmitted ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                      <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400">
                        <CheckCircle2 className="h-10 w-10 animate-bounce" />
                      </div>
                      <h3 className="font-bold text-white text-lg">Laporan Terkirim!</h3>
                      <p className="text-sm text-neutral-400 max-w-[260px] leading-relaxed">
                        Terima kasih atas laporan Anda. Kami akan memproses laporan ini dalam waktu 1x24 jam.
                      </p>
                      <button
                        onClick={() => { setIsSubmitted(false); setActiveTab("menu"); }}
                        className="mt-4 px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm transition-colors duration-200"
                      >
                        Kembali ke Menu
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Sub-Header */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Form Pengaduan</span>
                        <button
                          type="button"
                          onClick={() => setActiveTab("menu")}
                          className="text-xs text-neutral-400 hover:text-white"
                        >
                          &larr; Kembali
                        </button>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">Email Anda (Wajib)</label>
                        <input
                          type="email"
                          required
                          value={reporterEmail}
                          onChange={(e) => setReporterEmail(e.target.value)}
                          placeholder="nama@email.com"
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
                        />
                      </div>

                      {/* Name */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">Nama Anda (Opsional)</label>
                        <input
                          type="text"
                          value={reporterName}
                          onChange={(e) => setReporterName(e.target.value)}
                          placeholder="Nama Lengkap"
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
                        />
                      </div>

                      {/* Target Username */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">Username Terlapor</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-neutral-500 text-sm">@</span>
                          <input
                            type="text"
                            value={targetUsername}
                            onChange={(e) => setTargetUsername(e.target.value)}
                            placeholder="username_kreator"
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-7 pr-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
                          />
                        </div>
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">Kategori Aduan</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
                        >
                          <option value="SCAM">Penipuan / Scam</option>
                          <option value="INAPPROPRIATE">Konten Kasar / SARA</option>
                          <option value="HARASSMENT">Pelecehan / Toxic</option>
                          <option value="TECHNICAL">Masalah Teknis</option>
                          <option value="DONATION">Masalah Donasi</option>
                          <option value="OTHER">Lainnya</option>
                        </select>
                      </div>

                      {/* Details */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">Detail Masalah (Wajib)</label>
                        <textarea
                          required
                          rows={3}
                          value={details}
                          onChange={(e) => setDetails(e.target.value)}
                          placeholder="Tulis kronologi atau detail masalah..."
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50 transition-colors resize-none"
                        />
                      </div>

                      {/* Screenshot Proof (MANDATORY) */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">
                          Bukti Screenshot <span className="text-red-400 font-bold">*Wajib</span>
                        </label>
                        
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        
                        {screenshotPreview ? (
                          <div className="relative rounded-lg border border-neutral-800 overflow-hidden bg-neutral-950 flex flex-col items-center justify-center p-2 group">
                            <img
                              src={screenshotPreview}
                              alt="Screenshot Preview"
                              className="max-h-[140px] rounded object-contain"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                              <button
                                type="button"
                                onClick={() => { setScreenshot(null); setScreenshotPreview(null); }}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
                              >
                                Ganti Gambar
                              </button>
                            </div>
                            <span className="text-[10px] text-neutral-400 mt-2 truncate w-full text-center">
                              {screenshot?.name} ({(screenshot!.size / 1024).toFixed(0)} KB)
                            </span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex flex-col items-center justify-center py-6 border border-dashed border-neutral-800 hover:border-yellow-500/35 rounded-lg bg-neutral-950 text-neutral-400 hover:text-neutral-200 transition-all duration-200"
                          >
                            <Upload className="h-6 w-6 mb-2 text-neutral-500" />
                            <span className="text-xs font-semibold">Pilih Screenshot Bukti</span>
                            <span className="text-[10px] text-neutral-500 mt-0.5">PNG, JPG, WEBP (Max 5MB)</span>
                          </button>
                        )}
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={isSubmitting || !screenshot}
                        className={`w-full py-2.5 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-200 ${
                          !screenshot 
                            ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-800" 
                            : "bg-[#FFD551] text-black hover:bg-yellow-400 active:scale-[0.98]"
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Mengirim Aduan...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Kirim Laporan
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`h-12 w-12 rounded-full shadow-2xl flex items-center justify-center border transition-all duration-300 ${
          isOpen
            ? "bg-neutral-950 border-neutral-800 text-neutral-200 rotate-90"
            : "bg-[#FFD551] border-yellow-400 text-black hover:bg-yellow-400 hover:shadow-yellow-500/20"
        }`}
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
      </motion.button>
    </div>
  )
}
