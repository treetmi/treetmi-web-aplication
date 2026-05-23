"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { io, Socket } from "socket.io-client"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Trophy } from "lucide-react"

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || "https://api-system.treetmi.id/api/v1").replace(/\/api.*$/, "")
import { API_BASE_URL } from "@/lib/api"
const API_BASE = API_BASE_URL

interface GachaItem {
  id: string
  name: string
  weight: number
  color?: string
}

interface GachaRollEvent {
  id: string
  sender_name: string
  gross_amount: number
  message?: string
  gacha: {
    id: string
    winnerIndex: number
    duration_sec: number
    items: GachaItem[]
  }
}

class ConfettiParticle {
  x: number
  y: number
  size: number
  color: string
  speedX: number
  speedY: number
  rotation: number
  rotationSpeed: number

  constructor(canvasWidth: number) {
    this.x = Math.random() * canvasWidth
    this.y = -20
    this.size = Math.random() * 8 + 4
    const colors = ["#FFD551", "#FF5A5F", "#34D399", "#3B82F6", "#A855F7", "#F472B6"]
    this.color = colors[Math.floor(Math.random() * colors.length)]
    this.speedX = Math.random() * 4 - 2
    this.speedY = Math.random() * 5 + 3
    this.rotation = Math.random() * 360
    this.rotationSpeed = Math.random() * 10 - 5
  }

  update() {
    this.x += this.speedX
    this.y += this.speedY
    this.rotation += this.rotationSpeed
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate((this.rotation * Math.PI) / 180)
    ctx.fillStyle = this.color
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size)
    ctx.restore()
  }
}

const defaultItems: GachaItem[] = [
  { id: "d1", name: "Zonk 😢", weight: 20, color: "#1E293B" },
  { id: "d2", name: "Mabar 1 Game 🎮", weight: 15, color: "#10B981" },
  { id: "d3", name: "Follow Back Sosmed 📱", weight: 15, color: "#3B82F6" },
  { id: "d4", name: "Kaos Treetmi 👕", weight: 5, color: "#F59E0B" },
  { id: "d5", name: "Nyanyi 1 Lagu 🎤", weight: 10, color: "#8B5CF6" },
  { id: "d6", name: "VIP Discord Role 👑", weight: 5, color: "#EC4899" },
]

export default function GachaWidgetPage() {
  const params = useParams()
  const searchParams = useSearchParams()

  const token = Array.isArray(params?.token) ? params.token[0] : params?.token
  const scaleStr = searchParams?.get("scale")
  const scale = scaleStr ? parseFloat(scaleStr) : 1.2
  
  // Default to hiding when idle (true unless explicitly set to 'false')
  const hideIdle = searchParams?.get("hideIdle") !== "false"

  const [isConnected, setIsConnected] = useState(false)
  const [audioActivated, setAudioActivated] = useState(false)
  const [streamerInfo, setStreamerInfo] = useState<{ streamer_id: string; username: string } | null>(null)
  
  const [wheelItems, setWheelItems] = useState<GachaItem[]>(defaultItems)
  const [gachaSetting, setGachaSetting] = useState<{ duration_sec: number; min_donation: number } | null>(null)

  const [isSpinning, setIsSpinning] = useState(false)
  const [currentRoll, setCurrentRoll] = useState<GachaRollEvent | null>(null)
  const [activeAlert, setActiveAlert] = useState<GachaRollEvent | null>(null)
  const [showWinnerCard, setShowWinnerCard] = useState(false)
  const [winnerItem, setWinnerItem] = useState<GachaItem | null>(null)
  const [lastGacha, setLastGacha] = useState<{ sender: string; prize: string; color?: string } | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && token) {
      const saved = localStorage.getItem(`last_gacha_${token}`)
      if (saved) {
        try {
          setLastGacha(JSON.parse(saved))
        } catch {}
      }
    }
  }, [token])

  const socketRef = useRef<Socket | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const idleFrameRef = useRef<number | null>(null)
  const confettiFrameRef = useRef<number | null>(null)
  
  const rotationRef = useRef(0)
  const gachaQueueRef = useRef<GachaRollEvent[]>([])
  const isProcessingQueueRef = useRef(false)
  const logoImageRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const img = new Image()
      img.src = localStorage.getItem("treetmi_icon_url") || localStorage.getItem("treetmi_logo_url") || "/favicon.ico"
      img.onload = () => {
        logoImageRef.current = img
      }
    }
  }, [])

  const playTickSound = useCallback(() => {
    if (!audioActivated) return
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) return
      const ctx = new AudioContextClass()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(600, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04)
      gain.gain.setValueAtTime(0.18, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.04)
    } catch {}
  }, [audioActivated])

  const playWinSound = useCallback(() => {
    if (!audioActivated) return
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) return
      const ctx = new AudioContextClass()
      const playNote = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = "triangle"
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start)
        gain.gain.setValueAtTime(0.2, ctx.currentTime + start)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + duration)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(ctx.currentTime + start)
        osc.stop(ctx.currentTime + start + duration)
      }
      playNote(261.63, 0, 0.2) // C4
      playNote(329.63, 0.15, 0.2) // E4
      playNote(392.00, 0.3, 0.2) // G4
      playNote(523.25, 0.45, 0.6) // C5
    } catch {}
  }, [audioActivated])

  // Text-To-Speech function
  const speakText = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    try {
      window.speechSynthesis.cancel()
      const cleanText = text.replace(/\*+/g, " bip ")
      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.lang = "id-ID"
      utterance.rate = 1.0
      utterance.pitch = 1.1
      utterance.volume = 1.0

      const voices = window.speechSynthesis.getVoices()
      const idVoice = voices.find((v) => v.lang.startsWith("id") || v.name.toLowerCase().includes("indonesia")) || voices.find(v => v.lang.startsWith("en")) || voices[0]
      if (idVoice) utterance.voice = idVoice

      window.speechSynthesis.speak(utterance)
    } catch (err) {
      console.warn("TTS failed to speak", err)
    }
  }, [])

  const drawWheel = useCallback((items: GachaItem[], rotationAngle: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) - 20

    ctx.clearRect(0, 0, width, height)

    const numSlices = items.length
    if (numSlices === 0) return
    const sliceAngle = (2 * Math.PI) / numSlices

    ctx.save()
    ctx.shadowBlur = 30
    ctx.shadowColor = "#FFD551"
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius + 10, 0, 2 * Math.PI)
    ctx.fillStyle = "#09090b"
    ctx.strokeStyle = "#FFD551"
    ctx.lineWidth = 10
    ctx.fill()
    ctx.stroke()
    ctx.restore()

    for (let i = 0; i < numSlices; i++) {
      const startAngle = i * sliceAngle + rotationAngle
      const endAngle = (i + 1) * sliceAngle + rotationAngle

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()

      const defaultColors = ["#18181b", "#27272a"]
      ctx.fillStyle = items[i].color || defaultColors[i % defaultColors.length]
      ctx.fill()

      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(startAngle + sliceAngle / 2)
      ctx.textAlign = "right"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "#FFFFFF"
      // Dynamic font size based on text length to prevent clipping & maintain readability
      const text = items[i].name
      let fontSize = 14
      if (text.length > 12) fontSize = 11
      if (text.length > 18) fontSize = 9.5
      ctx.font = `bold ${fontSize}px system-ui`
      
      const displayText = text.length > 25 ? text.substring(0, 25) + ".." : text
      ctx.fillText(displayText, radius - 25, 0)
      ctx.restore()
    }

    ctx.save()
    ctx.beginPath()
    ctx.arc(centerX, centerY, 35, 0, 2 * Math.PI)
    ctx.fillStyle = "#09090b"
    ctx.strokeStyle = "#FFD551"
    ctx.lineWidth = 6
    ctx.fill()
    ctx.stroke()

    const img = logoImageRef.current
    if (img && img.complete) {
      const imgSize = 48
      ctx.save()
      ctx.beginPath()
      ctx.arc(centerX, centerY, 32, 0, 2 * Math.PI)
      ctx.clip()
      ctx.drawImage(img, centerX - imgSize / 2, centerY - imgSize / 2, imgSize, imgSize)
      ctx.restore()
    } else {
      ctx.fillStyle = "#FFD551"
      ctx.font = "bold 16px system-ui"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("🎁", centerX, centerY)
      ctx.restore()
    }
  }, [])

  const startConfetti = useCallback(() => {
    const canvas = confettiCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: ConfettiParticle[] = []
    const maxParticles = 80

    for (let i = 0; i < maxParticles; i++) {
      particles.push(new ConfettiParticle(canvas.width))
    }

    const animateConfetti = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let active = false

      particles.forEach((p) => {
        p.update()
        p.draw(ctx)
        if (p.y < canvas.height) {
          active = true
        }
      })

      if (active) {
        confettiFrameRef.current = requestAnimationFrame(animateConfetti)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    animateConfetti()
  }, [])

  const spinWheelToWinner = useCallback((roll: GachaRollEvent) => {
    const items = roll.gacha.items
    const winnerIndex = roll.gacha.winnerIndex
    const durationMs = (roll.gacha.duration_sec || 5) * 1000

    setIsSpinning(true)
    setCurrentRoll(roll)
    setWinnerItem(null)
    setShowWinnerCard(false)

    if (idleFrameRef.current) {
      cancelAnimationFrame(idleFrameRef.current)
      idleFrameRef.current = null
    }

    const sliceAngle = (2 * Math.PI) / items.length
    const currentStartAngle = rotationRef.current % (2 * Math.PI)

    const targetOffset = -Math.PI / 2 - (winnerIndex + 0.5) * sliceAngle
    const totalSpins = 6 * 2 * Math.PI
    const finalTargetAngle = targetOffset - totalSpins

    const startTime = Date.now()
    let lastSliceCross = Math.floor((-currentStartAngle - Math.PI / 2) / sliceAngle)

    const animateSpin = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / durationMs, 1)

      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentAngle = currentStartAngle + (finalTargetAngle - currentStartAngle) * easeOut
      rotationRef.current = currentAngle

      drawWheel(items, currentAngle)

      const currentSlice = Math.floor((-currentAngle - Math.PI / 2) / sliceAngle)
      if (currentSlice !== lastSliceCross) {
        playTickSound()
        lastSliceCross = currentSlice
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateSpin)
      } else {
        setIsSpinning(false)
        setWinnerItem(items[winnerIndex])
        
        const logData = {
          sender: roll.sender_name,
          prize: items[winnerIndex].name,
          color: items[winnerIndex].color || "#FFD551"
        }
        setLastGacha(logData)
        if (typeof window !== "undefined" && token) {
          localStorage.setItem(`last_gacha_${token}`, JSON.stringify(logData))
        }

        setShowWinnerCard(true)
        playWinSound()
        startConfetti()

        // TTS Speech Synthesis Announcement
        const announcement = `Selamat kepada ${roll.sender_name}! Mendapatkan hadiah: ${items[winnerIndex].name}`
        speakText(announcement)

        setTimeout(() => {
          setShowWinnerCard(false)
          setTimeout(() => {
            setCurrentRoll(null)
            isProcessingQueueRef.current = false
            processNextGachaQueue()
          }, 800)
        }, 7000)
      }
    }

    animateSpin()
  }, [drawWheel, playTickSound, playWinSound, startConfetti, speakText])

  const processNextGachaQueue = useCallback(() => {
    if (isProcessingQueueRef.current || gachaQueueRef.current.length === 0) return
    isProcessingQueueRef.current = true

    const nextRoll = gachaQueueRef.current.shift()!
    setActiveAlert(nextRoll)
    setCurrentRoll(nextRoll) // Show donor details in widget subtext immediately
    
    // Play professional alert chime sound (C5 - E5 - G5 - C6) using Web Audio API
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContextClass) {
        const ctx = new AudioContextClass()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = "sine"
        osc.frequency.setValueAtTime(523.25, ctx.currentTime) // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12) // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24) // G5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.36) // C6
        gain.gain.setValueAtTime(0.25, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.7)
      }
    } catch {}

    // Construct TTS speech text for Gacha Donation
    const sender = nextRoll.sender_name || "Anonymous"
    const amountStr = Number(nextRoll.gross_amount).toLocaleString("id-ID")
    const message = nextRoll.message || ""
    const ttsText = message 
      ? `Ada donasi dari ${sender} sebesar Rp ${amountStr} mengikuti challenge gacha dengan pesan ${message}`
      : `Ada donasi dari ${sender} sebesar Rp ${amountStr} mengikuti challenge gacha!`;

    const triggerSpin = () => {
      setActiveAlert(null)
      spinWheelToWinner(nextRoll)
    }

    // Calculate exact speaking duration mathematically to be 100% stable in OBS Studio browser sources.
    // Google Indonesian TTS speaks at ~12 characters per second.
    // We add 2000ms buffer for sound chime intro, transition slide, and natural pauses.
    const speakDurationMs = Math.max(5000, Math.min(18000, (ttsText.length / 12) * 1000 + 2000))

    // Play TTS inside Gacha Widget
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel()
        const cleanText = ttsText.replace(/\*+/g, " bip ")
        const utterance = new SpeechSynthesisUtterance(cleanText)
        utterance.lang = "id-ID"
        utterance.rate = 1.0
        utterance.pitch = 1.1
        utterance.volume = 1.0

        const voices = window.speechSynthesis.getVoices()
        const idVoice = voices.find((v) => v.lang.startsWith("id") || v.name.toLowerCase().includes("indonesia")) || voices.find(v => v.lang.startsWith("en")) || voices[0]
        if (idVoice) utterance.voice = idVoice

        window.speechSynthesis.speak(utterance)
      } catch (err) {
        console.warn("TTS failed to speak Gacha donation", err)
      }
    }

    // Always trigger spin precisely when the mathematically calculated speaking duration ends!
    // This provides 100% synchronization and completely bypasses OBS browser engine event listener bugs.
    setTimeout(triggerSpin, speakDurationMs)
  }, [spinWheelToWinner])

  const enqueueGachaRoll = useCallback((eventData: GachaRollEvent) => {
    gachaQueueRef.current.push(eventData)
    processNextGachaQueue()
  }, [processNextGachaQueue])

  useEffect(() => {
    // Warm up speech synthesis voices on load
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()
    }

    if (!token) return

    const fetchInfoAndConnect = async () => {
      try {
        const res = await fetch(`${API_BASE}/users/widget/${token}`)
        const json = await res.json()
        if (!json.success) return

        const info = json.data
        setStreamerInfo(info)

        try {
          const profileRes = await fetch(`${API_BASE}/users/profile/${info.username}`)
          const profileJson = await profileRes.json()
          if (profileJson.success && profileJson.data) {
            const creator = profileJson.data
            if (creator.gacha_wheel_items && creator.gacha_wheel_items.length > 0) {
              setWheelItems(creator.gacha_wheel_items)
            }
            if (creator.gacha_setting) {
              setGachaSetting(creator.gacha_setting)
            }
          }
        } catch (profileErr) {
          console.warn("Failed to load custom wheel items, falling back to defaults", profileErr)
        }

        const socket = io(BACKEND_URL, { transports: ["websocket"] })
        socketRef.current = socket

        socket.on("connect", () => {
          setIsConnected(true)
          socket.emit("join-room", `alert:${info.streamer_id}`)
          socket.emit("join-room", `mediashare:${info.streamer_id}`)
        })

        socket.on("disconnect", () => {
          setIsConnected(false)
        })

        const handleIncomingGacha = (data: any) => {
          if (data && data.gacha) {
            enqueueGachaRoll({
              id: data.id || `gacha-${Date.now()}`,
              sender_name: data.sender_name || "Anonymous",
              gross_amount: data.gross_amount || 0,
              message: data.message || "",
              gacha: data.gacha
            })
          }
        }

        socket.on("alert:donation", handleIncomingGacha)
        socket.on("alert:gacha", handleIncomingGacha)
        socket.on("alert:mabar", handleIncomingGacha)
        socket.on("alert:mediashare", handleIncomingGacha)

      } catch (err) {
        console.error("Gacha Widget: Failed to resolve token", err)
      }
    }

    fetchInfoAndConnect()

    return () => {
      socketRef.current?.disconnect()
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (idleFrameRef.current) cancelAnimationFrame(idleFrameRef.current)
      if (confettiFrameRef.current) cancelAnimationFrame(confettiFrameRef.current)
    }
  }, [token, enqueueGachaRoll])

  const activateAudioContext = useCallback(() => {
    if (audioActivated) return
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContextClass) {
        const ctx = new AudioContextClass()
        ctx.resume().then(() => ctx.close())
      }
      
      // Warm up SpeechSynthesis / TTS
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance("")
        u.volume = 0
        window.speechSynthesis.speak(u)
        window.speechSynthesis.cancel()
      }
    } catch {}
    setAudioActivated(true)
  }, [audioActivated])

  useEffect(() => {
    if (isSpinning || currentRoll) {
      if (idleFrameRef.current) cancelAnimationFrame(idleFrameRef.current)
      return
    }

    const animateIdle = () => {
      rotationRef.current += 0.002
      drawWheel(wheelItems, rotationRef.current)
      idleFrameRef.current = requestAnimationFrame(animateIdle)
    }

    animateIdle()

    return () => {
      if (idleFrameRef.current) cancelAnimationFrame(idleFrameRef.current)
    }
  }, [isSpinning, currentRoll, wheelItems, drawWheel])

  // Overlay is completely hidden when idle by default
  const isWidgetVisible = !hideIdle || currentRoll !== null

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center bg-transparent select-none pointer-events-auto"
      style={{ fontFamily: "'Outfit', 'Segoe UI', sans-serif" }}
      onClick={activateAudioContext}
    >
      {/* Klik untuk aktivasi audio — hanya tampil jika belum diaktifkan */}
      {!audioActivated && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
          <button
            onClick={activateAudioContext}
            className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white animate-pulse"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}
          >
            🔊 Klik Di Sini Untuk Aktifkan Audio
          </button>
        </div>
      )}

      <canvas
        ref={confettiCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-40"
      />

      <AnimatePresence>
        {isWidgetVisible && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="relative flex flex-col items-center justify-center"
            style={{ transform: `scale(${scale})` }}
          >
            {activeAlert ? (
              <div
                className="mb-6 p-5 rounded-3xl border-2 border-emerald-500 bg-zinc-950/95 shadow-[0_10px_40px_rgba(16,185,129,0.3)] flex flex-col items-center max-w-[380px] w-full text-center"
              >
                <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30 mb-2">
                  <Sparkles className="h-5 w-5 text-emerald-450 animate-pulse" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-450">CHALLENGE GACHA MULAI!</span>
                <h3 className="text-base font-black text-white mt-1 uppercase tracking-wide">
                  {activeAlert.sender_name}
                </h3>
                <span className="text-sm font-black text-[#FFD551] mt-0.5 bg-zinc-900 px-4 py-1 rounded-full border border-zinc-800">
                  Rp {Number(activeAlert.gross_amount).toLocaleString("id-ID")}
                </span>
                {activeAlert.message && (
                  <p className="mt-2.5 text-xs font-extrabold text-zinc-300 bg-zinc-900/60 px-4 py-2 rounded-2xl border border-zinc-800 italic w-full">
                    "{activeAlert.message}"
                  </p>
                )}
              </div>
            ) : (
              <div className="mb-6 p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800 shadow-2xl flex flex-col items-center gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD551] flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> GACHA WHEEL
                </span>
                <p className="text-xs font-bold text-zinc-300 uppercase text-center mt-1">
                  {currentRoll ? (
                    <>
                      Donasi Gacha <span className="text-emerald-450 font-black">Rp {Number(currentRoll.gross_amount).toLocaleString("id-ID")}</span> dari <span className="text-[#FFD551] font-black">{currentRoll.sender_name}</span>!
                    </>
                  ) : (
                    "Waiting for donations..."
                  )}
                </p>
              </div>
            )}

            <AnimatePresence>
              {!activeAlert && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 18 }}
                  className="relative"
                >
                  <canvas
                    ref={canvasRef}
                    width={440}
                    height={440}
                    className="max-w-full h-auto drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                  />

                  <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-10 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                    <svg width="28" height="38" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 42L0 12L32 12L16 42Z" fill="#FFD551" />
                      <circle cx="16" cy="12" r="10" fill="#FFD551" />
                      <circle cx="16" cy="12" r="5" fill="#09090b" />
                    </svg>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showWinnerCard && winnerItem && (
                <motion.div
                  initial={{ scale: 0, y: 50, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.8, y: -20, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 18 }}
                  className="absolute inset-0 flex items-center justify-center z-50 p-6"
                >
                  <div
                    className="p-8 rounded-3xl border-4 border-[#FFD551] shadow-[0_0_50px_rgba(255,213,81,0.4)] flex flex-col items-center justify-center text-center max-w-[340px] w-full"
                    style={{
                      background: "radial-gradient(circle at center, #18181b 0%, #09090b 100%)"
                    }}
                  >
                    <div className="w-16 h-16 bg-[#FFD551]/10 rounded-full border-2 border-[#FFD551] flex items-center justify-center mb-4 animate-bounce">
                      <Trophy className="h-8 w-8 text-[#FFD551]" />
                    </div>

                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                      SPIN SELESAI
                    </span>

                    <h2 className="text-xl font-black text-white uppercase mt-2 tracking-wide leading-tight">
                      SELAMAT!
                    </h2>

                    <p className="text-xs font-semibold text-zinc-400 mt-2">
                      Hadiah didapatkan oleh:
                    </p>

                    <p className="text-sm font-black text-[#FFD551] mt-1 bg-zinc-900 px-4 py-1.5 rounded-full border border-zinc-800">
                      {currentRoll?.sender_name || "Tester"}
                    </p>

                    <div className="mt-5 p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800 w-full">
                      <span className="text-[9px] font-extrabold uppercase text-zinc-500 tracking-wider">
                        REWARD GACHA:
                      </span>
                      <p className="text-lg font-black text-white uppercase mt-1 leading-snug tracking-wide italic">
                        {winnerItem.name}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
