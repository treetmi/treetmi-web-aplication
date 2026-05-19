"use client"

import React, { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import { API_BASE_URL } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { CreatorProfileView } from "@/components/creator-profile-view"
import {
  Rocket,
  ShieldCheck,
  Zap,
  Gamepad2,
  ArrowRight,
  CheckCircle2,
  Users,
  TrendingUp,
  Cpu,
  Monitor,
  Code,
  Music,
  Palette,
  Sparkles,
  DollarSign,
  Volume2,
  Tv,
  Smartphone,
  Play,
  Heart,
  MessageCircle,
  HelpCircle,
  Check,
  Camera,
  Headphones,
  Coins
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export default function Home() {
  const { t } = useLanguage()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    setMounted(true)
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const updateVoices = () => {
        setVoices(window.speechSynthesis.getVoices())
      }
      updateVoices()
      window.speechSynthesis.onvoiceschanged = updateVoices
    }
  }, [])

  // Simulation states for OBS overlay
  const [simulatedAlerts, setSimulatedAlerts] = useState<Array<{
    id: string
    name: string
    amount: number
    message: string
    type: "donation" | "mabar"
    gameNick?: string
    gameId?: string
  }>>([])

  // Custom simulator inputs
  const [simName, setSimName] = useState("Fadhil Streamer")
  const [simAmount, setSimAmount] = useState("50.000")
  const [simMessage, setSimMessage] = useState("Bang mabar kuy, gila gameplay lu jago bgt malam ini!")
  const [simType, setSimType] = useState<"donation" | "mabar">("donation")
  const [simGameNick, setSimGameNick] = useState("BudiGamer#1234")
  const [simGameId, setSimGameId] = useState("Valorant - Asia")

  // Dynamic active payment logos state with robust local fallbacks
  const [paymentLogos, setPaymentLogos] = useState<Array<{ name: string; url: string }>>([
    { name: "QRIS", url: "/payment-logos/qris.png" },
    { name: "BCA", url: "/payment-logos/bca.png" },
    { name: "Mandiri", url: "/payment-logos/mandiri.png" },
    { name: "Gopay", url: "/payment-logos/gopay.png" },
    { name: "OVO", url: "/payment-logos/ovo.png" },
    { name: "Dana", url: "/payment-logos/dana.png" },
  ])

  useEffect(() => {
    const fetchActivePaymentLogos = async () => {
      try {
        const baseUrl = API_BASE_URL.replace(/\/api.*$/, "")

        const res = await fetch(`${baseUrl}/api/v1/payment-channels`)
        const json = await res.json()
        if (json.success && json.data && json.data.length > 0) {
          const mapped = json.data.map((c: any) => ({
            name: c.name,
            url: c.logoUrl.startsWith("http") ? c.logoUrl : `${baseUrl}${c.logoUrl}`
          }))
          setPaymentLogos(mapped)
        }
      } catch (err) {
        console.error("Gagal mengambil data logo pembayaran dinamis:", err)
      }
    }
    fetchActivePaymentLogos()
  }, [])


  // Web Audio API custom retro 8-bit coin synthesizer
  const playAlertSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) return
      const ctx = new AudioContextClass()
      const now = ctx.currentTime

      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()

      osc.type = "square" // Beautiful 8-bit retro arcade texture

      // Mario arcade coin sound sequence:
      // Note 1: B5 (987.77 Hz) for 0.08 seconds
      // Note 2: E6 (1318.51 Hz) decaying for 0.45 seconds
      osc.frequency.setValueAtTime(987.77, now)
      osc.frequency.setValueAtTime(1318.51, now + 0.08)

      gainNode.gain.setValueAtTime(0.08, now)
      gainNode.gain.setValueAtTime(0.08, now + 0.08)
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5)

      osc.connect(gainNode)
      gainNode.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.5)
    } catch (e) {
      console.warn("Audio Context blocked: ", e)
    }
  }

  // Browser Web Speech Synthesis TTS
  const playTTS = (text: string, onEndCallback: () => void) => {
    try {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        onEndCallback()
        return
      }
      window.speechSynthesis.cancel() // Stop any previous speech

      const utterance = new SpeechSynthesisUtterance(text)

      // Look for Indonesian voice from preloaded voices
      const idVoice = voices.find(voice =>
        voice.lang.toLowerCase().startsWith("id") ||
        voice.lang.toLowerCase().includes("id")
      )

      if (idVoice) {
        utterance.voice = idVoice
        utterance.lang = "id-ID"
      } else {
        utterance.lang = "id-ID" // force indonesian rendering engine
      }

      utterance.rate = 1.05
      utterance.pitch = 1.0
      utterance.volume = 0.95

      utterance.onend = () => {
        onEndCallback()
      }
      utterance.onerror = () => {
        onEndCallback()
      }

      window.speechSynthesis.speak(utterance)
    } catch (e) {
      console.warn("TTS Synthesis failed: ", e)
      onEndCallback()
    }
  }

  // Trigger simulated alert helper
  const triggerAlert = (name: string, amtStr: string, msg: string, type: "donation" | "mabar", gameNick?: string, gameId?: string) => {
    const cleanAmt = parseInt(amtStr.replace(/\./g, "")) || 15000
    const alertId = Date.now().toString()
    const newAlert = {
      id: alertId,
      name: name || "Donatur Baik",
      amount: cleanAmt,
      message: msg || "Semangat terus live streamingnya!",
      type,
      gameNick,
      gameId
    }

    // Add to alerts list instantly
    setSimulatedAlerts((prev) => [...prev, newAlert])

    // Play arcade coin sound instantly
    playAlertSound()

    // Play support text-to-speech after the coin sound finishes completely
    setTimeout(() => {
      const speechLabel = type === "donation" ? "Donasi Baru dari" : "Antrean Mabar Baru dari"
      let speechText = `${speechLabel} ${newAlert.name} sebesar ${newAlert.amount.toLocaleString("id-ID")} Rupiah.`
      if (type === "mabar" && gameNick) {
        speechText += ` dengan ID Game ${gameNick} pada server ${gameId || "default"}.`
      }
      speechText += ` Pesan: ${newAlert.message}`

      playTTS(speechText, () => {
        // Wait exactly 3 seconds AFTER TTS speech finishes before removing from screen
        setTimeout(() => {
          setSimulatedAlerts((prev) => prev.filter((a) => a.id !== alertId))
        }, 3000)
      })
    }, 550)
  }

  // Pre-configured simulation trigger from Mobile preview clicks
  const triggerPhoneAction = (actionType: "donation" | "mabar") => {
    if (actionType === "donation") {
      triggerAlert(
        "Rian Donatur",
        "100.000",
        "Mantap Budi! Titip lagu jedag-jedug ya 🚀🔥",
        "donation"
      )
    } else {
      triggerAlert(
        "Kurnia Gamer",
        "50.000",
        "Request slot Mabar push rank ke Mythic malam ini ya bang!",
        "mabar",
        "KurniaGamer#1234",
        "Valorant - Asia"
      )
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F8F7F3] dark:bg-[#0A0A0A] flex flex-col items-center justify-center font-sans">
        <div className="space-y-4 text-center">
          <div className="h-10 w-48 bg-slate-200/60 dark:bg-zinc-800/60 animate-pulse rounded-lg mx-auto" />
          <div className="h-6 w-32 bg-slate-200/40 dark:bg-zinc-800/40 animate-pulse rounded-lg mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#F8F7F3] selection:bg-[#FFD551] selection:text-black flex flex-col font-sans transition-colors duration-300 dark:bg-[#0A0A0A] dark:selection:bg-[#FFD551] dark:selection:text-black relative">
      <Navbar />

      {/* DYNAMIC RADIAL GRADIENT GLOWS IN BACKGROUND */}
      <div className="absolute top-[10%] left-[25%] -translate-x-1/2 w-[40vw] h-[40vw] rounded-full bg-[#FFD551]/5 dark:bg-[#FFD551]/2 blur-[100px] pointer-events-none z-0" />
      <div className="absolute top-[40%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-emerald-500/5 dark:bg-emerald-500/2 blur-[120px] pointer-events-none z-0" />

      {/* HERO SECTION WITH DUAL STREAMER SIMULATOR */}
      <section className="relative flex-1 py-12 lg:py-20 overflow-hidden z-10">
        {/* Floating Background Ornaments */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 opacity-[0.03] dark:opacity-[0.06]">
          {/* Gamepad */}
          <motion.div
            animate={{ y: [0, -25, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[10%] left-[2%] text-[#1A1A19] dark:text-[#EAE9E4]"
          >
            <Gamepad2 className="w-48 h-48" strokeWidth={1} />
          </motion.div>

          {/* Camera / Webcam */}
          <motion.div
            animate={{ y: [0, 25, 0], rotate: [0, -15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-[20%] right-[4%] text-[#1A1A19] dark:text-[#EAE9E4]"
          >
            <Camera className="w-40 h-40" strokeWidth={1} />
          </motion.div>

          {/* Sparkles / Creator */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[15%] left-[5%] text-[#1A1A19] dark:text-[#EAE9E4]"
          >
            <Sparkles className="w-36 h-36" strokeWidth={1} />
          </motion.div>

          {/* Tv / Screen */}
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, -8, 0] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-[20%] right-[8%] text-[#1A1A19] dark:text-[#EAE9E4]"
          >
            <Tv className="w-48 h-48" strokeWidth={1} />
          </motion.div>

          {/* Coins / Donasi */}
          <motion.div
            animate={{ y: [0, 30, 0], rotate: [0, 12, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-[45%] left-[40%] text-[#1A1A19] dark:text-[#EAE9E4]"
          >
            <Coins className="w-32 h-32" strokeWidth={1} />
          </motion.div>

          {/* Headphones */}
          <motion.div
            animate={{ y: [0, 20, 0], rotate: [0, 15, 0] }}
            transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
            className="absolute bottom-[5%] left-[28%] text-[#1A1A19] dark:text-[#EAE9E4]"
          >
            <Headphones className="w-44 h-44" strokeWidth={1} />
          </motion.div>
        </div>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* LEFT COLUMN: BRANDING & CALL-TO-ACTIONS */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 bg-slate-900 text-[#FFD551] dark:bg-[#FFD551] dark:text-black px-4 py-1.5 font-display font-extrabold uppercase text-[10px] rounded-full shadow-sm tracking-wider"
              >
                <Rocket className="size-3.5 fill-current" />
                <span>{t.home.badge}</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl lg:text-5xl font-display font-black tracking-tight leading-[1.15] text-[#1A1A19] dark:text-[#EAE9E4]"
              >
                {t.home.heroTitlePart1} <br />
                <span className="relative inline-block bg-[#FFD551] text-[#1a1a19] px-6 py-2.5 mt-4 rounded-2xl border-2 border-zinc-950 shadow-[4px_4px_0px_#1a1a1a] dark:shadow-[4px_4px_0px_#000000] font-display font-black uppercase italic">
                  {t.home.heroTitlePart2} {t.home.heroTitle2}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm md:text-base text-[#706E68] max-w-2xl lg:max-w-3xl font-medium leading-relaxed mx-auto lg:mx-0 dark:text-[#A09E96]"
              >
                {t.home.heroSubtitle}
              </motion.p>

              {/* Bullet key benefits */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left max-w-lg mx-auto lg:mx-0 text-xs font-semibold text-[#1A1A19] dark:text-[#EAE9E4]"
              >
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-500/10 border border-green-500 text-green-500 flex items-center justify-center">
                    <CheckCircle2 className="size-3.5 fill-current" />
                  </div>
                  <span>{t.home.benefits.fee}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-500/10 border border-green-500 text-green-500 flex items-center justify-center">
                    <CheckCircle2 className="size-3.5 fill-current" />
                  </div>
                  <span>{t.home.benefits.widget}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-500/10 border border-green-500 text-green-500 flex items-center justify-center">
                    <CheckCircle2 className="size-3.5 fill-current" />
                  </div>
                  <span>{t.home.benefits.payment}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-500/10 border border-green-500 text-green-500 flex items-center justify-center">
                    <CheckCircle2 className="size-3.5 fill-current" />
                  </div>
                  <span>{t.home.benefits.mockup}</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4"
              >
                <Link href="/register">
                  <Button className="h-14 px-8 text-lg bg-[#FFD551] text-black font-display font-black rounded-2xl border-2 border-zinc-950 shadow-[4px_4px_0px_#1a1a1a] dark:shadow-[4px_4px_0px_#000000] hover:shadow-[5px_5px_0px_#1a1a1a] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_#000000] transition-all dark:border-2 dark:border-zinc-800 cursor-pointer">
                    {t.common.getStarted} <ArrowRight className="ml-2 size-5" />
                  </Button>
                </Link>
                <Link href="/creators">
                  <Button variant="outline" className="h-14 px-8 text-lg rounded-2xl border-2 border-zinc-950 bg-[#FAF8F2] text-black font-display font-black shadow-[4px_4px_0px_#1a1a1a] dark:shadow-[4px_4px_0px_#000000] hover:shadow-[5px_5px_0px_#1a1a1a] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_#000000] transition-all dark:bg-[#1C1C1C] dark:text-white dark:border-zinc-800 cursor-pointer">
                    {t.common.browseCreators}
                  </Button>
                </Link>
              </motion.div>

              {/* Real-time stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="pt-6 grid grid-cols-3 gap-4 border-t border-[#EAE9E4] dark:border-[#262626] max-w-md mx-auto lg:mx-0"
              >
                <div>
                  <h4 className="text-xl md:text-2xl font-display font-black text-[#1A1A19] dark:text-[#EAE9E4]">10K+</h4>
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider dark:text-[#A09E96]">{t.home.stats.creators}</p>
                </div>
                <div>
                  <h4 className="text-xl md:text-2xl font-display font-black text-[#1A1A19] dark:text-[#EAE9E4]">Rp 5M+</h4>
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider dark:text-[#A09E96]">{t.home.stats.donations}</p>
                </div>
                <div>
                  <h4 className="text-xl md:text-2xl font-display font-black text-[#1A1A19] dark:text-[#EAE9E4]">100K+</h4>
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider dark:text-[#A09E96]">{t.home.stats.matches}</p>
                </div>
              </motion.div>
            </div>

            {/* RIGHT COLUMN: HIGH-END UPLOADED HERO IMAGE PREVIEW */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.2 }}
              className="lg:col-span-6 flex justify-center lg:justify-end pr-0 lg:pr-6"
            >
              <img
                src="/hero/hero_section.webp"
                alt="Treetmi Hero Mockup"
                className="w-full max-w-[720px] h-auto object-contain hover:scale-[1.02] transition-transform duration-500 block"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* DEDICATED TWO-COLUMN WORKSPACE SANDBOX SECTION */}
      <section className="py-16 bg-[#FAF9F6] border-y border-slate-200/60 dark:bg-[#0C0C0C] dark:border-zinc-900/60 z-10 relative">
        <div className="container mx-auto px-4 max-w-7xl">

          <div className="space-y-4 text-center lg:text-left mb-10">
            <div className="inline-flex items-center gap-2 text-amber-500 font-bold text-xs justify-center lg:justify-start">
              <Play className="size-4 fill-current animate-pulse" /> {t.home.sandbox.badge}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-[#EAE9E4]">
              {t.home.sandbox.title}
            </h2>
            <p className="text-sm font-medium text-[#706E68] dark:text-[#A09E96] max-w-2xl leading-relaxed">
              {t.home.sandbox.desc}
            </p>
          </div>

          {/* DUAL COLUMN WORKSPACE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

            {/* COLUMN LEFT: FORM TEST (5/12 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between p-7 bg-[#FAF8F2] dark:bg-[#181818] border-2 border-zinc-950 dark:border-zinc-800 rounded-3xl shadow-[4px_4px_0px_#1a1a1a] dark:shadow-[4px_4px_0px_#000000] space-y-4 text-left relative overflow-hidden">
              <div className="space-y-4">

                {/* PREMIUM TAB MENU */}
                <div className="flex gap-2 p-1.5 bg-[#FAF6EE]/80 dark:bg-zinc-950 rounded-2xl border-2 border-zinc-950 dark:border-zinc-800 relative">
                  <button
                    onClick={() => setSimType("donation")}
                    className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase italic ${simType === "donation"
                      ? "bg-[#FFD551] text-black border-2 border-zinc-950 shadow-[2px_2px_0px_#1a1a1a] dark:shadow-[2px_2px_0px_#000000]"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200"
                      }`}
                  >
                    {t.home.sandbox.tabDonation}
                  </button>
                  <button
                    onClick={() => setSimType("mabar")}
                    className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase italic ${simType === "mabar"
                      ? "bg-[#FFD551] text-black border-2 border-zinc-950 shadow-[2px_2px_0px_#1a1a1a] dark:shadow-[2px_2px_0px_#000000]"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200"
                      }`}
                  >
                    {t.home.sandbox.tabMabar}
                  </button>
                </div>

                {/* DYNAMIC FIELDS BASED ON SELECTED TAB */}
                {simType === "donation" ? (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-wider italic">{t.home.sandbox.donatorName}</label>
                      <input
                        type="text"
                        value={simName}
                        onChange={(e) => setSimName(e.target.value)}
                        placeholder={t.home.sandbox.donatorNamePh}
                        className="w-full h-11 px-3.5 border-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-950 dark:text-white rounded-xl text-sm font-bold shadow-[2px_2px_0px_#1a1a1a] dark:shadow-[2px_2px_0px_#000000] transition-all outline-none focus:border-[#FFD551]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-wider italic">{t.home.sandbox.amount}</label>
                      <input
                        type="text"
                        value={simAmount}
                        onChange={(e) => setSimAmount(e.target.value)}
                        placeholder={t.home.sandbox.amountPh}
                        className="w-full h-11 px-3.5 border-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-950 dark:text-white rounded-xl text-sm font-bold shadow-[2px_2px_0px_#1a1a1a] dark:shadow-[2px_2px_0px_#000000] transition-all outline-none focus:border-[#FFD551]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-wider italic">{t.home.sandbox.message}</label>
                      <textarea
                        value={simMessage}
                        onChange={(e) => setSimMessage(e.target.value)}
                        placeholder={t.home.sandbox.messagePh}
                        rows={3}
                        className="w-full p-3.5 border-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-950 dark:text-white rounded-xl text-sm font-bold shadow-[2px_2px_0px_#1a1a1a] dark:shadow-[2px_2px_0px_#000000] transition-all outline-none resize-none focus:border-[#FFD551]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-wider italic">{t.home.sandbox.playerName}</label>
                      <input
                        type="text"
                        value={simName}
                        onChange={(e) => setSimName(e.target.value)}
                        placeholder={t.home.sandbox.playerNamePh}
                        className="w-full h-11 px-3.5 border-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-950 dark:text-white rounded-xl text-sm font-bold shadow-[2px_2px_0px_#1a1a1a] dark:shadow-[2px_2px_0px_#000000] transition-all outline-none focus:border-[#FFD551]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-black uppercase text-slate-500 tracking-wider italic">{t.home.sandbox.gameId}</label>
                        <input
                          type="text"
                          value={simGameNick}
                          onChange={(e) => setSimGameNick(e.target.value)}
                          placeholder={t.home.sandbox.gameIdPh}
                          className="w-full h-11 px-3.5 border-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-950 dark:text-white rounded-xl text-sm font-bold shadow-[2px_2px_0px_#1a1a1a] dark:shadow-[2px_2px_0px_#000000] transition-all outline-none focus:border-[#FFD551]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-black uppercase text-slate-500 tracking-wider italic">{t.home.sandbox.gameServer}</label>
                        <input
                          type="text"
                          value={simGameId}
                          onChange={(e) => setSimGameId(e.target.value)}
                          placeholder={t.home.sandbox.gameServerPh}
                          className="w-full h-11 px-3.5 border-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-950 dark:text-white rounded-xl text-sm font-bold shadow-[2px_2px_0px_#1a1a1a] dark:shadow-[2px_2px_0px_#000000] transition-all outline-none focus:border-[#FFD551]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-wider italic">{t.home.sandbox.mabarFee}</label>
                      <input
                        type="text"
                        value={simAmount}
                        onChange={(e) => setSimAmount(e.target.value)}
                        placeholder={t.home.sandbox.mabarFeePh}
                        className="w-full h-11 px-3.5 border-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-950 dark:text-white rounded-xl text-sm font-bold shadow-[2px_2px_0px_#1a1a1a] dark:shadow-[2px_2px_0px_#000000] transition-all outline-none focus:border-[#FFD551]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-wider italic">{t.home.sandbox.mabarReq}</label>
                      <textarea
                        value={simMessage}
                        onChange={(e) => setSimMessage(e.target.value)}
                        placeholder={t.home.sandbox.mabarReqPh}
                        rows={2}
                        className="w-full p-3.5 border-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-950 dark:text-white rounded-xl text-sm font-bold shadow-[2px_2px_0px_#1a1a1a] dark:shadow-[2px_2px_0px_#000000] transition-all outline-none resize-none focus:border-[#FFD551]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => triggerAlert(simName, simAmount, simMessage, simType, simType === "mabar" ? simGameNick : undefined, simType === "mabar" ? simGameId : undefined)}
                className="w-full py-3.5 bg-[#FFD551] text-black font-black text-xs uppercase italic rounded-xl border-2 border-zinc-950 shadow-[4px_4px_0px_#1a1a1a] dark:shadow-[4px_4px_0px_#000000] hover:shadow-[5px_5px_0px_#1a1a1a] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_#000000] transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <Play className="size-3.5 fill-current animate-pulse" /> {t.home.sandbox.simulateBtn}
              </button>
            </div>

            {/* COLUMN RIGHT: LAYAR MONITOR OBS BESAR (7/12 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="w-full aspect-[16/9.5] bg-[#121212] rounded-3xl p-3 border-2 border-zinc-950 shadow-[4px_4px_0px_#1a1a1a] dark:shadow-[4px_4px_0px_#000000] relative flex flex-col overflow-hidden">
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-t-lg z-0" />

                {/* Monitor Header Panel */}
                <div className="flex items-center justify-between px-3 py-1.5 bg-black/60 rounded-t-lg text-[10px] font-bold tracking-wide text-slate-400 border-b border-zinc-900">
                  <div className="flex items-center gap-1">
                    <div className="size-2 rounded-full bg-red-600 animate-ping" />
                    <span className="text-red-500">{t.home.sandbox.obsTitle}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Tv className="size-3.5 text-[#FFD551]" />
                    <span>{t.home.sandbox.obsFeed}</span>
                  </div>
                </div>

                {/* OBS Canvas Screen */}
                <div className="flex-1 rounded-b-lg relative overflow-hidden bg-slate-900 bg-cover bg-center flex flex-col items-center justify-center p-4 select-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-zinc-900 to-slate-950 z-0" />
                  <div className="absolute inset-0 bg-black/30 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_3px,3px_100%] pointer-events-none z-10" />

                  {/* TTS status visual */}
                  <div className="absolute bottom-2 left-3 bg-black/60 px-2 py-1 border border-black/40 rounded text-[9px] font-semibold text-white flex items-center gap-1 z-20">
                    <Volume2 className="size-3 text-[#FFD551] animate-pulse" />
                    <span>{t.home.sandbox.ttsActive}</span>
                  </div>

                  {/* Pop-up dynamic alert card */}
                  <AnimatePresence>
                    {simulatedAlerts.map((alert) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, scale: 0.8, y: -40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 40 }}
                        transition={{ type: "spring", stiffness: 120, damping: 14 }}
                        className="bg-slate-950/90 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 shadow-[0_0_20px_rgba(255,213,81,0.15)] w-full max-w-[300px] z-50 text-center relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-amber-400 to-[#FFD551]" />
                        <Sparkles className="absolute top-1.5 right-1.5 size-4 text-[#FFD551] animate-spin" />

                        <div className="space-y-1">
                          <h4 className="text-[10px] font-bold tracking-wider text-[#FFD551]">
                            {alert.type === "donation" ? t.home.sandbox.newDonation : t.home.sandbox.newMabar}
                          </h4>
                          <h5 className="text-[12px] font-bold text-white truncate leading-none">
                            {alert.name}
                          </h5>
                          <h6 className="text-[13px] font-bold text-emerald-400 leading-none mt-0.5">
                            Rp {alert.amount.toLocaleString("id-ID")}
                          </h6>
                          {alert.type === "mabar" && alert.gameNick && (
                            <div className="mt-1.5 p-1.5 bg-slate-900/60 border border-zinc-800/80 rounded-lg text-left text-[9px] font-semibold text-slate-300 space-y-0.5">
                              <div className="flex justify-between">
                                <span className="text-slate-500">ID Game:</span>
                                <span className="text-[#FFD551] font-bold">{alert.gameNick}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Game/Server:</span>
                                <span>{alert.gameId || "Valorant - Asia"}</span>
                              </div>
                            </div>
                          )}
                          <div className="mt-1.5 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-left">
                            <p className="text-[10px] font-medium text-slate-200 leading-relaxed break-words">
                              "{alert.message}"
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Empty alert notice */}
                  {simulatedAlerts.length === 0 && (
                    <div className="text-center space-y-1.5 z-10 animate-pulse">
                      <div className="size-10 rounded-full bg-black/40 border border-white/10 mx-auto flex items-center justify-center text-slate-500">
                        <Tv className="size-5" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 tracking-wider leading-none">
                        {t.home.sandbox.waiting}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* HIGHLIGHT FEATURES GLASSMORPHIC GRID */}
      <section className="pt-8 pb-24 bg-[#F8F7F3] dark:bg-[#0A0A0A] z-10 relative overflow-hidden">
        {/* Ambient high-end soft glows */}
        <div className="absolute top-1/4 left-10 size-[35rem] rounded-full bg-[#FFD551]/5 dark:bg-[#FFD551]/2 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 size-[35rem] rounded-full bg-indigo-500/5 dark:bg-indigo-500/2 blur-[120px] pointer-events-none" />
        
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-60 dark:opacity-40" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col items-center">
            <div className="w-full max-w-[330px] md:max-w-[380px] mb-0 relative z-0 flex justify-center">
              <img 
                src="/section/image_section_top_title.webp" 
                alt="Elite Streamer Character" 
                className="w-full h-auto object-contain drop-shadow-xl translate-y-1.5"
              />
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-800 dark:text-[#EAE9E4] italic uppercase relative z-10 drop-shadow-sm">
              {t.home.eliteSuite.title}
            </h2>
            <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400 max-w-lg mt-3 leading-relaxed relative z-10">
              {t.home.eliteSuite.desc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Feature 1 - Zap */}
            <div className="p-5 bg-[#FAF8F2] dark:bg-[#181818] border-2 border-zinc-950 dark:border-zinc-800 rounded-3xl shadow-[4px_4px_0px_#1a1a1a] dark:shadow-[4px_4px_0px_#000000] hover:shadow-[5px_5px_0px_#1a1a1a] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_#1a1a1a] transition-all duration-200 flex flex-col justify-between min-h-[170px] text-left relative overflow-hidden group">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="size-10 rounded-2xl bg-[#FFD551] text-black border-2 border-zinc-950 shadow-[1.5px_1.5px_0px_#1a1a1a] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <Zap className="size-4.5" />
                  </div>
                  <span className="text-[8px] font-black tracking-widest text-black bg-[#FFD551] px-2 py-0.5 rounded-full uppercase leading-none border border-zinc-950 shadow-[1px_1px_0px_#1a1a1a] font-display italic">
                    {t.home.eliteSuite.feat1}
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black italic dark:text-[#EAE9E4] uppercase tracking-wide">{t.home.features.engine}</h3>
                  <p className="text-xs font-semibold leading-relaxed text-slate-500 dark:text-zinc-400">{t.home.features.engineDesc}</p>
                </div>
              </div>
            </div>

            {/* Feature 2 - Mabar */}
            <div className="p-5 bg-[#FAF8F2] dark:bg-[#181818] border-2 border-zinc-950 dark:border-zinc-800 rounded-3xl shadow-[4px_4px_0px_#1a1a1a] dark:shadow-[4px_4px_0px_#000000] hover:shadow-[5px_5px_0px_#1a1a1a] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_#1a1a1a] transition-all duration-200 flex flex-col justify-between min-h-[170px] text-left relative overflow-hidden group">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="size-10 rounded-2xl bg-indigo-400 text-black border-2 border-zinc-950 shadow-[1.5px_1.5px_0px_#1a1a1a] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <Gamepad2 className="size-4.5" />
                  </div>
                  <span className="text-[8px] font-black tracking-widest text-black bg-indigo-400 px-2 py-0.5 rounded-full uppercase leading-none border border-zinc-950 shadow-[1px_1px_0px_#1a1a1a] font-display italic">
                    {t.home.eliteSuite.feat2}
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black italic dark:text-[#EAE9E4] uppercase tracking-wide">{t.home.features.mabar}</h3>
                  <p className="text-xs font-semibold leading-relaxed text-slate-500 dark:text-zinc-400">{t.home.features.mabarDesc}</p>
                </div>
              </div>
            </div>

            {/* Feature 3 - Trust */}
            <div className="p-5 bg-[#FAF8F2] dark:bg-[#181818] border-2 border-zinc-950 dark:border-zinc-800 rounded-3xl shadow-[4px_4px_0px_#1a1a1a] dark:shadow-[4px_4px_0px_#000000] hover:shadow-[5px_5px_0px_#1a1a1a] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_#1a1a1a] transition-all duration-200 flex flex-col justify-between min-h-[170px] text-left relative overflow-hidden group">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="size-10 rounded-2xl bg-green-400 text-black border-2 border-zinc-950 shadow-[1.5px_1.5px_0px_#1a1a1a] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <ShieldCheck className="size-4.5" />
                  </div>
                  <span className="text-[8px] font-black tracking-widest text-black bg-green-400 px-2 py-0.5 rounded-full uppercase leading-none border border-zinc-950 shadow-[1px_1px_0px_#1a1a1a] font-display italic">
                    {t.home.eliteSuite.feat3}
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black italic dark:text-[#EAE9E4] uppercase tracking-wide">{t.home.features.secure}</h3>
                  <p className="text-xs font-semibold leading-relaxed text-slate-500 dark:text-zinc-400">{t.home.features.secureDesc}</p>
                </div>
              </div>
            </div>

            {/* Feature 4 - Stats */}
            <div className="p-5 bg-[#FAF8F2] dark:bg-[#181818] border-2 border-zinc-950 dark:border-zinc-800 rounded-3xl shadow-[4px_4px_0px_#1a1a1a] dark:shadow-[4px_4px_0px_#000000] hover:shadow-[5px_5px_0px_#1a1a1a] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_#1a1a1a] transition-all duration-200 flex flex-col justify-between min-h-[170px] text-left relative overflow-hidden group">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="size-10 rounded-2xl bg-amber-400 text-black border-2 border-zinc-950 shadow-[1.5px_1.5px_0px_#1a1a1a] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <TrendingUp className="size-4.5" />
                  </div>
                  <span className="text-[8px] font-black tracking-widest text-black bg-amber-400 px-2 py-0.5 rounded-full uppercase leading-none border border-zinc-950 shadow-[1px_1px_0px_#1a1a1a] font-display italic">
                    {t.home.eliteSuite.feat4}
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black italic dark:text-[#EAE9E4] uppercase tracking-wide">{t.home.features.stats}</h3>
                  <p className="text-xs font-semibold leading-relaxed text-slate-500 dark:text-zinc-400">{t.home.features.statsDesc}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SUPPORTED PAYMENT CHANNEL INFINITE MARQUEE */}
      <section className="bg-white pt-6 pb-4 border-y border-[#EAE9E4] dark:bg-[#0A0A0A] dark:border-[#222] relative overflow-hidden z-10">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee-infinite {
            animation: marquee 25s linear infinite;
          }
          .animate-marquee-infinite:hover {
            animation-play-state: paused;
          }
        `}} />


        <div className="relative w-full overflow-hidden mt-3 py-2 flex items-center">
          {/* Left & Right premium gradients for faded look */}
          <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-white to-transparent dark:from-[#0A0A0A] dark:to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-white to-transparent dark:from-[#0A0A0A] dark:to-transparent z-10 pointer-events-none" />
          
          <div className="flex w-max animate-marquee-infinite gap-20 items-center">
            {/* Duplicated arrays to guarantee a perfect seamless marquee loop */}
            {[...paymentLogos, ...paymentLogos, ...paymentLogos].map((logo, i) => (
              <div
                key={i}
                className="flex items-center justify-center min-w-[130px] px-6 group transition-all duration-300 cursor-pointer"
              >
                <img
                  src={logo.url}
                  alt={logo.name}
                  className="h-8 md:h-10 w-auto object-contain transition-all duration-500 filter grayscale opacity-50 hover:grayscale-0 hover:opacity-100 hover:scale-115 dark:invert-[1] dark:sepia-[1] dark:saturate-[1000%] dark:hue-rotate-[15deg] dark:brightness-[1.4] dark:contrast-[1.2] dark:opacity-70 hover:dark:opacity-100 hover:dark:brightness-[1.8]"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </main>
  )
}
