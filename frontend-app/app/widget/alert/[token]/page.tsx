"use client"

import { useEffect, useRef, useState, useCallback, Suspense } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { io, Socket } from "socket.io-client"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || "https://api-system.treetmi.id/api/v1").replace(/\/api.*$/, "")
import { API_BASE_URL } from "@/lib/api"
const API_BASE = API_BASE_URL

interface AlertItem {
  id: string
  type: "DONATION" | "MABAR" | "QUEUE_CALL"
  sender_name: string
  gross_amount: number
  original_amount?: number
  currency_code?: string
  message: string
  timestamp: Date
  game_name?: string
  mediashare_url?: string | null
  ingame_nickname?: string
  ingame_id?: string
  slots_count?: number
  donation_media?: {
    media_type: "YOUTUBE" | "TIKTOK" | "REELS" | "VOICE_NOTE" | "TEBAK_GAMBAR"
    media_url: string
    duration?: number
    start_time?: number
    volume_multiplier?: number
  } | null
  gift?: {
    id: string
    name: string
    url: string
    price?: number
  } | null
}

interface SoundTier { min: number; max: number | null; prefix: string; sound_key: string; gif_key?: string; gif_url?: string | null }

const BUILTIN_GIFS: Record<string, string> = {
  coin: "/gif/Coin.gif",
  wallet_fly: "/gif/Flying_Wallet_Money.gif",
  wallet_anim: "/gif/Wallet_animation.gif",
  coin_wallet: "/gif/coin_circling_wallet.gif",
}

function getYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

function getTikTokId(url: string | null | undefined): string | null {
  if (!url) return null
  const match = url.match(/\/video\/(\d+)/)
  return match ? match[1] : null
}

function getInstagramReelId(url: string | null | undefined): string | null {
  if (!url) return null
  const match = url.match(/\/(reel|reels|p)\/([A-Za-z0-9_-]+)/)
  return match ? match[2] : null
}

function getMediaType(url: string | null | undefined): "YOUTUBE" | "TIKTOK" | "REELS" | null {
  if (!url) return null
  if (getYouTubeId(url)) return "YOUTUBE"
  if (url.includes("tiktok.com")) return "TIKTOK"
  if (url.includes("instagram.com")) return "REELS"
  return null
}

function parseMabarMessage(message: string | null | undefined) {
  if (!message) return { nickname: "", ingame_id: "", cleanMessage: "" }

  const ignMatch = message.match(/\[IGN:\s*([^\]]+)\]/i)
  const idMatch = message.match(/\[ID:\s*([^\]]+)\]/i)

  const nickname = ignMatch ? ignMatch[1].trim() : ""
  const ingame_id = idMatch ? idMatch[1].trim() : ""

  let cleanMessage = message
    .replace(/\[IGN:\s*[^\]]+\]/gi, "")
    .replace(/\[ID:\s*[^\]]+\]/gi, "")
    .trim()

  if (cleanMessage.startsWith("-")) {
    cleanMessage = cleanMessage.substring(1).trim()
  }

  return { nickname, ingame_id, cleanMessage }
}

function cleanGiftMessage(message: string | null | undefined): string {
  if (!message) return ""
  return message.replace(/\[GIFT:\s*[^\]]+\]/gi, "").trim()
}

function WidgetAlertContent() {
  const params = useParams()
  const searchParams = useSearchParams()

  const token = Array.isArray(params?.token) ? params.token[0] : params?.token
  const scaleStr = searchParams?.get("scale")
  const scale = scaleStr ? parseFloat(scaleStr) : 1.5 // Default to 1.5 for gorgeous large readable rendering
  const themeParam = searchParams?.get("theme") || "dark"
  const isDark = themeParam === "dark"
  const excludeCall = searchParams?.get("excludeCall") === "true"
  const onlyCall = searchParams?.get("onlyCall") === "true"

  const [currentAlert, setCurrentAlert] = useState<AlertItem | null>(null)
  const [streamerInfo, setStreamerInfo] = useState<{ streamer_id: string; username: string } | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [audioActivated, setAudioActivated] = useState(false)
  const [widgetSettings, setWidgetSettings] = useState<any>(null)
  const widgetSettingsRef = useRef<any>(null)
  const [currentGifSrc, setCurrentGifSrc] = useState<string>("")

  const colorDonation = widgetSettings?.color_donation || "#FFD551"
  const colorMabar = widgetSettings?.color_mabar || "#34d399"

  const socketRef = useRef<Socket | null>(null)
  const alertQueueRef = useRef<AlertItem[]>([])
  const isPlayingRef = useRef(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animeFrameRef = useRef<number | null>(null)

  // Web Audio DSP Filter for Voice Notes
  const playVoiceNoteWithFilter = useCallback((audioUrl: string, filterType: string): HTMLAudioElement => {
    const audio = new Audio(audioUrl)
    audio.crossOrigin = "anonymous"
    
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContextClass) {
        const audioCtx = new AudioContextClass()
        const source = audioCtx.createMediaElementSource(audio)
        
        if (filterType === "robot") {
          const ringMod = audioCtx.createGain()
          ringMod.gain.value = 0
          
          const modulator = audioCtx.createOscillator()
          modulator.frequency.value = 50
          modulator.connect(ringMod.gain)
          modulator.start()
          
          const dryGain = audioCtx.createGain()
          dryGain.gain.value = 0.4
          
          source.connect(ringMod)
          source.connect(dryGain)
          
          const output = audioCtx.createGain()
          output.gain.value = 1.8
          
          ringMod.connect(output)
          dryGain.connect(output)
          output.connect(audioCtx.destination)
        } else if (filterType === "monster") {
          const filter = audioCtx.createBiquadFilter()
          filter.type = "lowpass"
          filter.frequency.value = 700
          
          const delay = audioCtx.createDelay()
          delay.delayTime.value = 0.04
          
          const feedback = audioCtx.createGain()
          feedback.gain.value = 0.3
          
          source.connect(filter)
          filter.connect(audioCtx.destination)
          filter.connect(delay)
          delay.connect(feedback)
          feedback.connect(delay)
          delay.connect(audioCtx.destination)
        } else if (filterType === "echo") {
          const delay = audioCtx.createDelay()
          delay.delayTime.value = 0.25
          
          const feedback = audioCtx.createGain()
          feedback.gain.value = 0.4
          
          source.connect(audioCtx.destination)
          source.connect(delay)
          delay.connect(feedback)
          feedback.connect(delay)
          feedback.connect(audioCtx.destination)
        } else {
          source.connect(audioCtx.destination)
        }
      }
    } catch (e) {
      console.warn("Failed to create Web Audio DSP graph, playing raw audio:", e)
    }
    
    audio.play()
    return audio
  }, [])

  // Canvas Engine for Tebak Gambar Game
  const renderTebakGambar = useCallback((canvas: HTMLCanvasElement, imageUrl: string, duration: number) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    if (animeFrameRef.current) {
      cancelAnimationFrame(animeFrameRef.current)
      animeFrameRef.current = null
    }

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = imageUrl
    img.onload = () => {
      let startTime = Date.now()
      const durationMs = duration * 1000
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / durationMs, 1)
        
        const pixelSize = Math.max(1, Math.round(40 * (1 - progress)))
        
        const w = canvas.width
        const h = canvas.height
        ctx.clearRect(0, 0, w, h)
        
        if (pixelSize > 1) {
          const smallW = Math.max(4, Math.round(w / pixelSize))
          const smallH = Math.max(4, Math.round(h / pixelSize))
          
          const offscreen = document.createElement("canvas")
          offscreen.width = smallW
          offscreen.height = smallH
          const offCtx = offscreen.getContext("2d")
          if (offCtx) {
            offCtx.drawImage(img, 0, 0, smallW, smallH)
            
            ctx.imageSmoothingEnabled = false;
            (ctx as any).mozImageSmoothingEnabled = false;
            (ctx as any).webkitImageSmoothingEnabled = false;
            
            ctx.drawImage(offscreen, 0, 0, smallW, smallH, 0, 0, w, h)
          }
        } else {
          ctx.imageSmoothingEnabled = true
          ctx.drawImage(img, 0, 0, w, h)
        }
        
        if (progress < 1) {
          animeFrameRef.current = requestAnimationFrame(animate)
        }
      }
      
      animate()
    }
  }, [])

  // Aktivasi audio context — diperlukan oleh Chrome sebelum bisa putar suara
  const activateAudio = useCallback(() => {
    if (audioActivated) return
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      ctx.resume().then(() => ctx.close())
      // Test TTS
      const u = new SpeechSynthesisUtterance("")
      u.volume = 0
      window.speechSynthesis.speak(u)
      window.speechSynthesis.cancel()
    } catch {}
    setAudioActivated(true)
  }, [audioActivated])

  // ----- TTS: Web Speech API -----
  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        resolve()
        return
      }
      window.speechSynthesis.cancel()
      const cleanText = text.replace(/\*+/g, " bip ")
      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.lang = "id-ID"

      const voices = window.speechSynthesis.getVoices()
      const idVoice = voices.find(v => v.lang.startsWith("id")) || voices.find(v => v.lang.startsWith("en")) || voices[0]
      if (idVoice) utterance.voice = idVoice

      utterance.rate = 1.0
      utterance.pitch = 1.1
      utterance.volume = 1.0
      window.speechSynthesis.speak(utterance)

      // Polling: tunggu TTS benar-benar mulai dan selesai
      let hasStarted = false
      let pollCount = 0
      const check = setInterval(() => {
        pollCount++
        if (window.speechSynthesis.speaking) {
          hasStarted = true
        }
        // TTS selesai: pernah mulai DAN sekarang berhenti
        if (hasStarted && !window.speechSynthesis.speaking) {
          clearInterval(check)
          resolve()
          return
        }
        // Fallback: jika setelah 3 detik (10 polls x 300ms) TTS belum mulai, skip
        if (!hasStarted && pollCount >= 10) {
          clearInterval(check)
          resolve()
          return
        }
      }, 300)

      // Hard fallback: maksimal 60 detik
      setTimeout(() => { clearInterval(check); resolve() }, 60000)
    })
  }, [])

  const playSoundEffect = useCallback((type?: string) => {
    if (typeof window === "undefined") return
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      ctx.resume() // Chrome autoplay policy
      const gain = ctx.createGain()
      gain.connect(ctx.destination)
      gain.gain.setValueAtTime(0.4, ctx.currentTime)
      
      if (type === "call") {
        // High-pitched double notification ring!
        const o1 = ctx.createOscillator()
        o1.type = "triangle"
        o1.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
        o1.frequency.setValueAtTime(880, ctx.currentTime + 0.1) // A5
        o1.connect(gain)
        o1.start()
        o1.stop(ctx.currentTime + 0.25)

        const o2 = ctx.createOscillator()
        o2.type = "sine"
        o2.frequency.setValueAtTime(587.33, ctx.currentTime + 0.3)
        o2.frequency.setValueAtTime(880, ctx.currentTime + 0.4)
        o2.connect(gain)
        o2.start()
        o2.stop(ctx.currentTime + 0.55)
      } else {
        const o = ctx.createOscillator()
        o.type = "sine"
        o.frequency.setValueAtTime(880, ctx.currentTime)
        o.frequency.setValueAtTime(1320, ctx.currentTime + 0.08)
        o.connect(gain)
        o.start()
        o.stop(ctx.currentTime + 0.18)
      }
    } catch {}
  }, [])

  // ----- Alert Queue Processor -----
  const processNextAlert = useCallback(async () => {
    if (isPlayingRef.current || alertQueueRef.current.length === 0) return
    isPlayingRef.current = true

    const alert = alertQueueRef.current.shift()!
    setCurrentAlert(alert)

    // Resolve GIF berdasarkan tier atau custom GIFT tag
    let customGiftKey: string | null = null
    const giftMatch = alert.message?.match(/\[GIFT:\s*([^\]]+)\]/i)
    if (giftMatch) {
      customGiftKey = giftMatch[1].trim()
    }

    if (alert.gift?.url) {
      setCurrentGifSrc(alert.gift.url)
    } else if (customGiftKey && BUILTIN_GIFS[customGiftKey]) {
      setCurrentGifSrc(BUILTIN_GIFS[customGiftKey])
    } else {
      const tiers = (widgetSettingsRef.current?.sound_tiers || []) as SoundTier[]
      const DEFAULT_GIF_KEYS = ['coin', 'wallet_fly', 'wallet_anim', 'coin_wallet']
      const matchedTier = tiers.find((t: SoundTier) => alert.gross_amount >= t.min && (t.max === null || alert.gross_amount < t.max))
      const tierIndex = matchedTier ? tiers.indexOf(matchedTier) : 0
      if (matchedTier && matchedTier.gif_key) {
        if (matchedTier.gif_key === "custom" && matchedTier.gif_url) {
          setCurrentGifSrc(matchedTier.gif_url)
        } else {
          setCurrentGifSrc(BUILTIN_GIFS[matchedTier.gif_key] || BUILTIN_GIFS.coin)
        }
      } else {
        // Fallback: pakai default berdasarkan index tier
        setCurrentGifSrc(BUILTIN_GIFS[DEFAULT_GIF_KEYS[tierIndex]] || BUILTIN_GIFS.coin)
      }
    }

    // Susun kalimat TTS dengan pelafalan mata uang asing asli
    const code = alert.currency_code || "IDR"
    let amountFormatted = ""
    if (code === "IDR" || !alert.original_amount) {
      amountFormatted = `${Number(alert.gross_amount).toLocaleString("id-ID")} rupiah`
    } else {
      const names: Record<string, string> = {
        USD: "dolar",
        MYR: "ringgit",
        SGD: "dolar singapura",
        PHP: "peso",
        THB: "baht"
      }
      amountFormatted = `${Number(alert.original_amount)} ${names[code] || "dolar"}`
    }

    const isVoiceNote = alert.donation_media && alert.donation_media.media_type === "VOICE_NOTE"
    const isTebakGambar = alert.donation_media && alert.donation_media.media_type === "TEBAK_GAMBAR"

    let ttsText = ""
    if (alert.type === "QUEUE_CALL") {
      const displayIgn = alert.ingame_nickname || alert.sender_name
      ttsText = `Panggilan kepada ${displayIgn}! Giliran bermain bersama ${streamerInfo?.username || "kreator"} telah tiba. Silakan bersiap-siap untuk segera bergabung ke dalam permainan!`
    } else if (alert.type === "DONATION") {
      if (isVoiceNote) {
        ttsText = `Halo ${alert.sender_name}! Mengirimkan voice note sebesar ${amountFormatted}.`
      } else if (isTebakGambar) {
        ttsText = `Halo ${alert.sender_name}! Mengirimkan tebak gambar sebesar ${amountFormatted}. Silakan mulai tebak gambarnya!`
      } else {
        ttsText = `Halo ${alert.sender_name}! Terima kasih atas donasi sebesar ${amountFormatted}.`
        const cleanMsg = cleanGiftMessage(alert.message)
        if (cleanMsg.trim()) ttsText += ` Pesan: ${cleanMsg}`
      }
    } else {
      const parsed = parseMabarMessage(alert.message)
      const displayIgn = parsed.nickname || alert.ingame_nickname || alert.sender_name
      const displayGameId = parsed.ingame_id || alert.ingame_id
      const cleanMessage = parsed.cleanMessage

      ttsText = `Antrean mabar baru dari ${alert.sender_name} sebesar ${amountFormatted}. `
      if (displayIgn) {
        ttsText += `dengan ID Game ${displayIgn} `
        if (displayGameId) {
          const cleanServer = displayGameId.replace(/[()]/g, "")
          ttsText += `pada server ${cleanServer}. `
        } else {
          ttsText += `pada server default. `
        }
      } else if (alert.game_name) {
        ttsText += `Game: ${alert.game_name}. `
      }
      if (cleanMessage?.trim()) ttsText += `Pesan: ${cleanMessage}`
    }

    if (alert.type === "QUEUE_CALL") {
      // Loop 3 times for Panggilan Mabar alert
      for (let i = 0; i < 3; i++) {
        playSoundEffect("call")
        await new Promise(r => setTimeout(r, 2000))
        await speak(ttsText)
        if (i < 2) {
          // Pause briefly between repetitions
          await new Promise(r => setTimeout(r, 3000))
        }
      }
      // Show for 3 more seconds before finishing
      await new Promise(r => setTimeout(r, 3000))
    } else {
      // Normal single alert play:
      playSoundEffect()
      await new Promise(r => setTimeout(r, 2000))
      await speak(ttsText)
      
      if (isVoiceNote && alert.donation_media) {
        let filter = "normal"
        const msgLower = alert.message.toLowerCase()
        if (msgLower.includes("robot")) filter = "robot"
        else if (msgLower.includes("monster") || msgLower.includes("seram")) filter = "monster"
        else if (msgLower.includes("echo") || msgLower.includes("gema")) filter = "echo"
        else {
          const filters = ["robot", "monster", "echo", "normal"]
          filter = filters[Math.floor(Math.random() * filters.length)]
        }
        
        try {
          const audioEl = playVoiceNoteWithFilter(alert.donation_media.media_url, filter)
          await new Promise((resolve) => {
            audioEl.onended = () => resolve(true)
            audioEl.onerror = () => resolve(true)
            setTimeout(resolve, 30000) // 30s safety timeout
          })
        } catch (err) {
          console.error("Error playing voice note DSP filter:", err)
        }
      } else if (isTebakGambar && alert.donation_media) {
        const gameDuration = alert.donation_media.duration || 30
        await new Promise(r => setTimeout(r, gameDuration * 1000))
      } else {
        await new Promise(r => setTimeout(r, 5000))
      }
    }

    setCurrentAlert(null)
    setCurrentGifSrc("")
    isPlayingRef.current = false
    setTimeout(processNextAlert, 800)
  }, [speak, playSoundEffect, streamerInfo, playVoiceNoteWithFilter])

  const enqueueAlert = useCallback((alert: AlertItem) => {
    if (alert.type === "QUEUE_CALL") {
      // Bersihkan panggilan antrean sebelumnya agar tidak menumpuk beruntun
      alertQueueRef.current = alertQueueRef.current.filter(item => item.type !== "QUEUE_CALL")
    }
    alertQueueRef.current.push(alert)
    processNextAlert()
  }, [processNextAlert])

  const enqueueAlertRef = useRef(enqueueAlert)
  useEffect(() => {
    enqueueAlertRef.current = enqueueAlert
  }, [enqueueAlert])

  // ----- Resolve Token & Connect Socket -----
  useEffect(() => {
    if (!token) return
    const resolveAndConnect = async () => {
      try {
        const res = await fetch(`${API_BASE}/users/widget/${token}`)
        const json = await res.json()
        if (!json.success) return
        const info = json.data
        setStreamerInfo(info)

        // Fetch widget settings untuk GIF & tier config
        try {
          const settingsRes = await fetch(`${API_BASE}/widget-settings/public/${token}`)
          const settingsJson = await settingsRes.json()
          if (settingsJson.success) {
            setWidgetSettings(settingsJson.data)
            widgetSettingsRef.current = settingsJson.data
          }
        } catch {}
        const socket = io(BACKEND_URL, { transports: ["websocket"] })
        socketRef.current = socket
        socket.on("connect", () => {
          setIsConnected(true)
          socket.emit("join-room", `alert:${info.streamer_id}`)
        })
        socket.on("disconnect", () => setIsConnected(false))
        socket.on("alert:donation", (data: any) => {
          if (onlyCall) return // IGNORE in onlyCall mode
          if (data.gacha) return // GACHA is handled exclusively by Gacha Widget overlay!
          const isVideoMedia = data.donation_media && ["YOUTUBE", "TIKTOK", "REELS"].includes(data.donation_media.media_type)
          if (data.mediashare_url || isVideoMedia) return // Mediashare handled by separate overlay
          enqueueAlertRef.current({ id: `don-${Date.now()}`, type: "DONATION", sender_name: data.sender_name, gross_amount: data.gross_amount, original_amount: data.original_amount, currency_code: data.currency_code, message: data.message || "", timestamp: new Date(data.timestamp), mediashare_url: data.mediashare_url, donation_media: data.donation_media || null, gift: data.gift || null })
        })
        socket.on("alert:mabar", (data: any) => {
          if (onlyCall) return // IGNORE in onlyCall mode
          const isVideoMedia = data.donation_media && ["YOUTUBE", "TIKTOK", "REELS"].includes(data.donation_media.media_type)
          if (data.mediashare_url || isVideoMedia) return // Mediashare handled by separate overlay
          enqueueAlertRef.current({ id: `mab-${Date.now()}`, type: "MABAR", sender_name: data.sender_name, gross_amount: data.gross_amount, original_amount: data.original_amount, currency_code: data.currency_code, message: data.message || "", game_name: data.game_name, ingame_nickname: data.ingame_nickname, ingame_id: data.ingame_id, timestamp: new Date(data.timestamp), mediashare_url: data.mediashare_url, donation_media: data.donation_media || null, gift: data.gift || null })
        })
        socket.on("alert:queue-call", (data: any) => {
          if (excludeCall) return // IGNORE in excludeCall mode
          enqueueAlertRef.current({
            id: `call-${Date.now()}`,
            type: "QUEUE_CALL",
            sender_name: data.sender_name,
            gross_amount: data.gross_amount || 0,
            message: "",
            game_name: data.game_name,
            ingame_nickname: data.ingame_nickname,
            ingame_id: data.ingame_id,
            slots_count: data.slots_count || 1,
            timestamp: new Date(data.timestamp)
          })
        })
      } catch (err) {
        console.error("Widget: gagal resolve token", err)
      }
    }
    resolveAndConnect()
    return () => { socketRef.current?.disconnect() }
  }, [token, excludeCall, onlyCall])

  // Preload voices
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()
    }
  }, [])

  // Hook for Tebak Gambar Canvas
  useEffect(() => {
    if (currentAlert && currentAlert.donation_media?.media_type === "TEBAK_GAMBAR" && canvasRef.current) {
      const duration = currentAlert.donation_media.duration || 30
      renderTebakGambar(canvasRef.current, currentAlert.donation_media.media_url, duration)
    }
    return () => {
      if (animeFrameRef.current) {
        cancelAnimationFrame(animeFrameRef.current)
        animeFrameRef.current = null
      }
    }
  }, [currentAlert, renderTebakGambar])

  const formatCurrency = (amount: number, original_amount?: number, currency_code?: string) => {
    const code = currency_code || "IDR"
    if (code === "IDR" || !original_amount) {
      return `Rp ${Number(amount).toLocaleString("id-ID")}`
    }
    const CURRENCY_SYMBOLS: Record<string, string> = {
      USD: "$",
      MYR: "RM",
      SGD: "S$",
      PHP: "₱",
      THB: "฿"
    }
    const symbol = CURRENCY_SYMBOLS[code] || "$"
    return `${symbol}${Number(original_amount).toFixed(2)}`
  }

  const parsedMabar = currentAlert && currentAlert.type === "MABAR" 
    ? parseMabarMessage(currentAlert.message) 
    : { nickname: "", ingame_id: "", cleanMessage: "" }

  const displayMessage = currentAlert 
    ? cleanGiftMessage(currentAlert.type === "MABAR" ? parsedMabar.cleanMessage : currentAlert.message)
    : ""
  
  const displayNickname = currentAlert 
    ? (currentAlert.type === "MABAR" ? (parsedMabar.nickname || currentAlert.ingame_nickname || currentAlert.sender_name) : "")
    : ""

  const displayIngameId = currentAlert 
    ? (currentAlert.type === "MABAR" ? (parsedMabar.ingame_id || currentAlert.ingame_id) : "")
    : ""

  return (
    <div
      className="fixed inset-0 bg-transparent"
      style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
      onClick={activateAudio}
    >

      {/* Klik untuk aktivasi audio — hanya tampil jika belum diaktifkan */}
      {!audioActivated && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
          <button
            onClick={activateAudio}
            className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white animate-pulse"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}
          >
            🔊 Klik Di Sini Untuk Aktifkan Audio
          </button>
        </div>
      )}

      {/* ALERT POPUP — yang terlihat di OBS */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence>
          {currentAlert && (
            <motion.div
              key={currentAlert.id}
              initial={{ y: 80, opacity: 0, scale: 0.88 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -30, opacity: 0, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="w-[480px] max-w-full px-4"
              style={{ transform: `scale(${scale})`, transformOrigin: "center center" }} // DYNAMIC VIEWPORT SCALING FOR HIGH RESOLUTIONS
            >
              {/* Universal Mediashare Player - Cyberpunk TV monitor style */}
              {currentAlert && getMediaType(currentAlert.mediashare_url) && (
                <motion.div
                  className={cn(
                    "mb-4 overflow-hidden rounded-3xl border shadow-[0_15px_45px_rgba(0,0,0,0.15)]",
                    isDark 
                      ? "border-zinc-800 bg-[#0B0C10]/95 shadow-[0_0_25px_rgba(255,255,255,0.05)]"
                      : "border-[#E5E3DD] bg-[#FAF9F6]"
                  )}
                  initial={{ scale: 0, opacity: 0, y: -20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 18, delay: 0.15 }}
                >
                  <div className={cn(
                    "flex items-center justify-between px-4 py-2 border-b",
                    isDark ? "bg-[#0B0C10]/95 border-zinc-800" : "bg-[#FAF9F6] border-[#E5E3DD]"
                  )}>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest italic flex items-center gap-1",
                      isDark ? "text-zinc-400" : "text-[#706E68]"
                    )}>
                      📺 Treetmi Mediashare ({getMediaType(currentAlert.mediashare_url)})
                    </span>
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-400" />
                      <span className="h-2 w-2 rounded-full bg-yellow-400" />
                      <span className="h-2 w-2 rounded-full bg-green-400" />
                    </div>
                  </div>
                  <div className="relative aspect-video w-full bg-black">
                    {getMediaType(currentAlert.mediashare_url) === "YOUTUBE" && (
                      <iframe
                        src={`https://www.youtube.com/embed/${getYouTubeId(currentAlert.mediashare_url)}?autoplay=1&mute=0&controls=0&modestbranding=1&rel=0&iv_load_policy=3&enablejsapi=1`}
                        className="absolute inset-0 h-full w-full pointer-events-none"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      />
                    )}
                    {getMediaType(currentAlert.mediashare_url) === "TIKTOK" && (
                      <iframe
                        src={`https://www.tiktok.com/embed/v2/${getTikTokId(currentAlert.mediashare_url)}`}
                        className="absolute inset-0 h-full w-full pointer-events-none"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      />
                    )}
                    {getMediaType(currentAlert.mediashare_url) === "REELS" && (
                      <iframe
                        src={`https://www.instagram.com/reel/${getInstagramReelId(currentAlert.mediashare_url)}/embed`}
                        className="absolute inset-0 h-full w-full pointer-events-none"
                        allowFullScreen
                      />
                    )}
                  </div>
                </motion.div>
              )}

              {/* GIF Animation di atas card */}
              {currentGifSrc && (
                <motion.div
                  className="flex justify-center mb-2"
                  initial={{ scale: 0, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <img src={currentGifSrc} alt="" className="w-24 h-24 object-contain drop-shadow-2xl" />
                </motion.div>
              )}

              {currentAlert.type === "QUEUE_CALL" ? (
                <div
                  className={cn(
                    "rounded-3xl overflow-hidden border shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-300",
                    isDark 
                      ? "border-zinc-800 bg-[#0B0C10]/95 backdrop-blur-md shadow-[0_0_30px_rgba(168,85,247,0.25)]" 
                      : "border-[#E5E3DD] bg-[#FAF9F6] shadow-[0_15px_45px_rgba(0,0,0,0.06)]"
                  )}
                >
                  {/* Theme-colored Header bar */}
                  <div 
                    className="px-5 py-2.5 border-b flex items-center justify-between text-white"
                    style={{ background: "linear-gradient(90deg, #7c3aed, #a855f7)", borderColor: isDark ? "rgba(0,0,0,0.08)" : "#E5E3DD" }}
                  >
                    <span className="text-[11px] md:text-xs font-black uppercase tracking-wider italic flex items-center gap-1.5">
                      📢 PANGGILAN MABAR
                    </span>
                    <span className="h-2 w-2 rounded-full bg-white/20 animate-ping" />
                  </div>

                  {/* Body Content */}
                  <div className="p-4.5 flex flex-col items-center text-center">
                    {/* Bouncing Megaphone Emoji inside a nice neon glowing circle */}
                    <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center text-3xl mb-2 border border-purple-500/20 animate-bounce">
                      📣
                    </div>

                    <span className={cn(
                      "font-black text-base md:text-lg uppercase tracking-wide truncate max-w-full text-purple-400 mt-0.5",
                      isDark ? "text-purple-400" : "text-[#7c3aed]"
                    )}>
                      {currentAlert.ingame_nickname || currentAlert.sender_name}
                    </span>
                    
                    <motion.span
                      initial={{ scale: 0, rotate: -5 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.35, type: "spring", stiffness: 400 }}
                      className="font-black text-xl md:text-2xl leading-tight mt-0.5 text-white"
                    >
                      DIPANGGIL MASUK GAME!
                    </motion.span>
                    
                    <p className={cn(
                      "text-[9px] md:text-[10px] font-black uppercase tracking-widest mt-1",
                      isDark ? "text-zinc-400" : "text-[#706E68]"
                    )}>
                      🎮 Game: {currentAlert.game_name || "Mabar"}
                    </p>

                    {/* Metadata box */}
                    {(currentAlert.ingame_nickname || currentAlert.ingame_id) && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className={cn(
                          "mt-2.5 p-2.5 rounded-2xl border-2 border-dashed space-y-1 transition-all w-full",
                          isDark 
                            ? "border-zinc-800 bg-white/5" 
                            : "border-black/5 bg-black/5"
                        )}
                      >
                        <div className="flex justify-between items-center text-[10px] md:text-[11px]">
                          <span className={cn("font-bold italic uppercase tracking-wider", isDark ? "text-zinc-400" : "text-zinc-500")}>ID Akun / Nickname</span>
                          <span className="font-black text-[#FFD551] text-right truncate max-w-[200px]">
                            {currentAlert.ingame_nickname || currentAlert.sender_name}
                          </span>
                        </div>
                        {currentAlert.ingame_id && (
                          <div className="flex justify-between items-center text-[10px] md:text-[11px]">
                            <span className={cn("font-bold italic uppercase tracking-wider", isDark ? "text-zinc-400" : "text-zinc-500")}>User ID & Server</span>
                            <span className={cn("font-mono font-black text-right truncate max-w-[200px]", isDark ? "text-white" : "text-zinc-800")}>
                              {currentAlert.ingame_id}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    )}

                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className={cn(
                        "text-[10px] md:text-[11px] font-black uppercase tracking-wider mt-3.5 text-[#FFD551] animate-pulse w-full text-center"
                      )}
                    >
                      ⚠️ SILAKAN SEGERA BERGABUNG SEKARANG!
                    </motion.p>
                  </div>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="h-0.5 origin-left"
                    style={{ background: `linear-gradient(90deg, #7c3aed, transparent)` }}
                  />
                </div>
              ) : currentAlert.type === "DONATION" ? (
                <div
                  className={cn(
                    "rounded-3xl overflow-hidden border shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-300",
                    isDark 
                      ? "border-zinc-800 bg-[#0B0C10]/95 backdrop-blur-md shadow-[0_0_30px_rgba(255,213,81,0.15)]" 
                      : "border-[#E5E3DD] bg-[#FAF9F6] shadow-[0_15px_45px_rgba(0,0,0,0.06)]"
                  )}
                >
                  {/* Theme-colored Header bar */}
                  <div 
                    className="px-5 py-2.5 border-b flex items-center justify-between text-black"
                    style={{ backgroundColor: colorDonation, borderColor: isDark ? "rgba(0,0,0,0.08)" : "#E5E3DD" }}
                  >
                    <span className="text-[11px] md:text-xs font-black uppercase tracking-wider italic flex items-center gap-1.5">
                      ❤️ NEW DONATION
                    </span>
                    <span className="h-2 w-2 rounded-full bg-black/10" />
                  </div>

                  {/* Body Content */}
                  <div className="p-4.5 flex flex-col items-center text-center">
                    <span className={cn(
                      "font-black text-base md:text-lg uppercase tracking-wide truncate max-w-full",
                      isDark ? "text-white" : "text-[#1A1A19]"
                    )}>
                      {currentAlert.sender_name}
                    </span>
                    <motion.span
                      initial={{ scale: 0, rotate: -5 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.35, type: "spring", stiffness: 400 }}
                      className="font-black text-xl md:text-2xl leading-tight mt-0.5"
                      style={{ color: isDark ? "#FFD551" : (colorDonation === "#FFD551" ? "#B58A00" : colorDonation) }}
                    >
                      {formatCurrency(currentAlert.gross_amount, currentAlert.original_amount, currentAlert.currency_code)}
                    </motion.span>
                    <p className={cn(
                      "text-[9px] md:text-[10px] font-black uppercase tracking-widest mt-1",
                      isDark ? "text-[#FFD551]/80" : "text-[#706E68]"
                    )}>
                      💛 Donasi via StreamPlay
                    </p>
                    {currentAlert.donation_media?.media_type === "TEBAK_GAMBAR" && (
                      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 mt-3 mb-2">
                        <canvas
                          ref={canvasRef}
                          className="w-full h-full object-cover"
                          width={400}
                          height={225}
                        />
                        <div className="absolute top-2 right-2 bg-black/75 px-3 py-1 rounded-full text-[8px] font-black text-[#FFD551] border border-[#FFD551]/30 animate-pulse">
                          ⏱️ REVEALING GAME...
                        </div>
                      </div>
                    )}
                    {currentAlert.donation_media?.media_type === "VOICE_NOTE" && (
                      <div className="flex items-center justify-center gap-2 mt-3 mb-1 p-2 rounded-2xl bg-white/5 border border-white/5 w-full">
                        <span className="text-lg animate-bounce">🔊</span>
                        <div className="flex items-end gap-0.5 h-4">
                          <span className="w-1 bg-[#FFD551] animate-pulse h-2" style={{ animationDelay: "0.1s" }} />
                          <span className="w-1 bg-[#FFD551] animate-pulse h-4" style={{ animationDelay: "0.3s" }} />
                          <span className="w-1 bg-[#FFD551] animate-pulse h-3" style={{ animationDelay: "0.5s" }} />
                          <span className="w-1 bg-[#FFD551] animate-pulse h-1" style={{ animationDelay: "0.2s" }} />
                          <span className="w-1 bg-[#FFD551] animate-pulse h-3" style={{ animationDelay: "0.4s" }} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Playing Voice Note...</span>
                      </div>
                    )}
                    {currentAlert.message && (
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className={cn(
                          "text-[10px] md:text-[11px] font-semibold italic mt-2.5 leading-relaxed border-t pt-2 w-full text-center",
                          isDark 
                            ? "text-zinc-300 border-white/10" 
                            : "text-[#3C3B37] border-[#1A1A19]/10"
                        )}
                      >
                        &ldquo;{currentAlert.message}&rdquo;
                      </motion.p>
                    )}
                  </div>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="h-0.5 origin-left"
                    style={{ background: `linear-gradient(90deg, ${colorDonation}, transparent)` }}
                  />
                </div>
              ) : (
                <div
                  className={cn(
                    "rounded-3xl overflow-hidden border shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-300",
                    isDark 
                      ? "border-zinc-800 bg-[#0B0C10]/95 backdrop-blur-md shadow-[0_0_30px_rgba(52,211,153,0.15)]" 
                      : "border-[#E5E3DD] bg-[#FAF9F6] shadow-[0_15px_45px_rgba(0,0,0,0.06)]"
                  )}
                >
                  {/* Theme-colored Header bar */}
                  <div 
                    className="px-5 py-2.5 border-b flex items-center justify-between text-black"
                    style={{ backgroundColor: colorMabar, borderColor: isDark ? "rgba(0,0,0,0.08)" : "#E5E3DD" }}
                  >
                    <span className="text-[11px] md:text-xs font-black uppercase tracking-wider italic flex items-center gap-1.5">
                      🎮 ORDER MABAR
                    </span>
                    <span className="h-2 w-2 rounded-full bg-black/10" />
                  </div>

                  {/* Body Content */}
                  <div className="p-4.5 flex flex-col items-center text-center">
                    <span className={cn(
                      "font-black text-base md:text-lg uppercase tracking-wide truncate max-w-full",
                      isDark ? "text-white" : "text-[#1A1A19]"
                    )}>
                      {currentAlert.sender_name}
                    </span>
                    <motion.span
                      initial={{ scale: 0, rotate: -5 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.35, type: "spring", stiffness: 400 }}
                      className="font-black text-xl md:text-2xl leading-tight mt-0.5"
                      style={{ color: isDark ? "#34d399" : (colorMabar === "#FFD551" ? "#059669" : colorMabar) }}
                    >
                      {formatCurrency(currentAlert.gross_amount, currentAlert.original_amount, currentAlert.currency_code)}
                    </motion.span>
                    <p className={cn(
                      "text-[9px] md:text-[10px] font-black uppercase tracking-widest mt-1",
                      isDark ? "text-[#34d399]/80" : "text-[#706E68]"
                    )}>
                      🎮 Game · {currentAlert.game_name || "Game"}
                    </p>

                    {/* Game metadata User ID & Server grid box */}
                    {(displayNickname || displayIngameId) && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className={cn(
                          "mt-2.5 p-2.5 rounded-2xl border-2 border-dashed space-y-1 transition-all w-full",
                          isDark 
                            ? "border-zinc-800 bg-white/5" 
                            : "border-black/5 bg-black/5"
                        )}
                      >
                        <div className="flex justify-between items-center text-[10px] md:text-[11px]">
                          <span className={cn("font-bold italic uppercase tracking-wider", isDark ? "text-zinc-400" : "text-zinc-500")}>Nickname Game</span>
                          <span className="font-black text-[#FFD551] text-right truncate max-w-[200px]">
                            {displayNickname || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] md:text-[11px]">
                          <span className={cn("font-bold italic uppercase tracking-wider", isDark ? "text-zinc-400" : "text-zinc-500")}>User ID & Server</span>
                          <span className={cn("font-mono font-black text-right truncate max-w-[200px]", isDark ? "text-white" : "text-zinc-800")}>
                            {displayIngameId || "-"}
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {displayMessage && (
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className={cn(
                          "text-[10px] md:text-[11px] font-semibold italic mt-2.5 leading-relaxed border-t pt-2 w-full text-center",
                          isDark 
                            ? "text-zinc-300 border-white/10" 
                            : "text-[#3C3B37] border-[#1A1A19]/10"
                        )}
                      >
                        &ldquo;{displayMessage}&rdquo;
                      </motion.p>
                    )}
                  </div>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="h-0.5 origin-left"
                    style={{ background: `linear-gradient(90deg, ${colorMabar}, transparent)` }}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function WidgetAlertPage() {
  return (
    <Suspense fallback={<div className="bg-transparent" />}>
      <WidgetAlertContent />
    </Suspense>
  )
}
