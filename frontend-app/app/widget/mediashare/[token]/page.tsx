"use client"

import { useEffect, useRef, useState, useCallback, Suspense } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { io, Socket } from "socket.io-client"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1").replace(/\/api.*$/, "")
import { API_BASE_URL } from "@/lib/api"
const API_BASE = API_BASE_URL

interface MediashareAlert {
  id: string
  sender_name: string
  gross_amount: number
  original_amount?: number
  currency_code?: string
  message: string
  mediashare_url: string
  timestamp: Date
}

function getYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null
  
  // Handle YouTube Shorts specifically
  if (url.includes("/shorts/")) {
    const parts = url.split("/shorts/")
    if (parts.length > 1) {
      const id = parts[1].split(/[?&#]/)[0]
      if (id.length === 11) return id
    }
  }
  
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

function WidgetMediashareContent() {
  const params = useParams()
  const searchParams = useSearchParams()

  const token = Array.isArray(params?.token) ? params.token[0] : params?.token
  const scaleStr = searchParams?.get("scale")
  const scale = scaleStr ? parseFloat(scaleStr) : 1.5 // Default to 1.5 for ultra legibility
  const themeParam = searchParams?.get("theme") || "dark"
  const isDark = themeParam === "dark"

  const [currentAlert, setCurrentAlert] = useState<MediashareAlert | null>(null)
  const [streamerInfo, setStreamerInfo] = useState<{ streamer_id: string; username: string } | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [audioActivated, setAudioActivated] = useState(false)
  const [colorDonation, setColorDonation] = useState("#FFD551") // Default yellow accent

  const socketRef = useRef<Socket | null>(null)
  const queueRef = useRef<MediashareAlert[]>([])
  const isPlayingRef = useRef(false)
  const playerRef = useRef<any>(null)

  // Web Speech API / Audio Context Activation
  const activateAudio = useCallback(() => {
    if (audioActivated) return
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      ctx.resume().then(() => ctx.close())
    } catch {}
    setAudioActivated(true)
  }, [audioActivated])

  // Play entry alert sound effect
  const playSoundEffect = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      ctx.resume()
      const gain = ctx.createGain()
      gain.connect(ctx.destination)
      gain.gain.setValueAtTime(0.4, ctx.currentTime)
      const o = ctx.createOscillator()
      o.type = "sine"
      o.frequency.setValueAtTime(880, ctx.currentTime)
      o.frequency.setValueAtTime(1320, ctx.currentTime + 0.08)
      o.connect(gain)
      o.start()
      o.stop(ctx.currentTime + 0.18)
    } catch {}
  }, [])

  // Process next mediashare item in queue
  const processNextAlert = useCallback(async () => {
    if (isPlayingRef.current || queueRef.current.length === 0) return
    isPlayingRef.current = true

    const alert = queueRef.current.shift()!
    setCurrentAlert(alert)
    playSoundEffect()

    // We will let the YouTube IFrame Player API handle the end state to clear currentAlert
  }, [playSoundEffect])

  const enqueueAlert = useCallback((alert: MediashareAlert) => {
    queueRef.current.push(alert)
    processNextAlert()
  }, [processNextAlert])

  // YouTube API callback when video finishes playing
  const onVideoEnd = useCallback(() => {
    setCurrentAlert(null)
    isPlayingRef.current = false
    // Jeda 1.5 detik sebelum memutar video berikutnya
    setTimeout(processNextAlert, 1500)
  }, [processNextAlert])

  // Load YouTube Player API and attach listener
  useEffect(() => {
    if (!currentAlert) return

    const mediaType = getMediaType(currentAlert.mediashare_url)
    if (mediaType === "TIKTOK" || mediaType === "REELS") {
      // Skip after 30 seconds
      const timer = setTimeout(() => {
        onVideoEnd()
      }, 30000)
      return () => clearTimeout(timer)
    }

    const ytid = getYouTubeId(currentAlert.mediashare_url)
    if (!ytid) {
      // Fallback if URL is invalid: wait 8 seconds then skip
      const timer = setTimeout(() => {
        onVideoEnd()
      }, 8000)
      return () => clearTimeout(timer)
    }

    // Initialize YouTube Iframe Player
    let player: any = null

    const initPlayer = () => {
      player = new (window as any).YT.Player(`yt-player-${currentAlert.id}`, {
        events: {
          onReady: (event: any) => {
            event.target.playVideo()
          },
          onStateChange: (event: any) => {
            // YT.PlayerState.ENDED = 0
            if (event.data === 0) {
              onVideoEnd()
            }
          },
          onError: () => {
            // End on error to avoid hanging
            onVideoEnd()
          }
        }
      })
      playerRef.current = player
    }

    if (!(window as any).YT) {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName("script")[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
      ;(window as any).onYouTubeIframeAPIReady = initPlayer
    } else {
      // Wait for DOM element to mount
      const timeout = setTimeout(initPlayer, 500)
      return () => clearTimeout(timeout)
    }

    return () => {
      if (player && typeof player.destroy === "function") {
        try {
          player.destroy()
        } catch {}
      }
    }
  }, [currentAlert, onVideoEnd])

  // Connect sockets & resolve token
  useEffect(() => {
    if (!token) return
    const resolveAndConnect = async () => {
      try {
        const res = await fetch(`${API_BASE}/users/widget/${token}`)
        const json = await res.json()
        if (!json.success) return
        const info = json.data
        setStreamerInfo(info)

        // Ambil setelan warna untuk tema widget donasi
        try {
          const settingsRes = await fetch(`${API_BASE}/widget-settings/public/${token}`)
          const settingsJson = await settingsRes.json()
          if (settingsJson.success) {
            setColorDonation(settingsJson.data.color_donation || "#FFD551")
          }
        } catch {}

        const socket = io(BACKEND_URL, { transports: ["websocket"] })
        socketRef.current = socket
        socket.on("connect", () => {
          setIsConnected(true)
          socket.emit("join-streamer", info.streamer_id)
          socket.emit("join-room", `mediashare:${info.streamer_id}`)
        })
        socket.on("disconnect", () => setIsConnected(false))
        socket.on("alert:mediashare", (data: any) => {
          enqueueAlert({
            id: `media-${Date.now()}`,
            sender_name: data.sender_name,
            gross_amount: data.gross_amount,
            message: data.message || "",
            mediashare_url: data.mediashare_url,
            timestamp: new Date(data.timestamp)
          })
        })
      } catch (err) {
        console.error("Mediashare Widget: gagal resolve", err)
      }
    }
    resolveAndConnect()
    return () => { socketRef.current?.disconnect() }
  }, [token, enqueueAlert])

  const formatCurrency = (amount: number) => {
    return `Rp ${Number(amount).toLocaleString("id-ID")}`
  }

  const ytid = currentAlert ? getYouTubeId(currentAlert.mediashare_url) : null

  return (
    <div
      className="fixed inset-0 bg-transparent"
      style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
      onClick={activateAudio}
    >
      {/* Audio activation reminder */}
      {!audioActivated && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
          <button
            onClick={activateAudio}
            className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white animate-pulse"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}
          >
            🔊 Klik Di Sini Untuk Aktifkan Audio Mediashare
          </button>
        </div>
      )}

      {/* MEDIASHARE POPUP */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence>
          {currentAlert && (
            <motion.div
              key={currentAlert.id}
              initial={{ y: 80, opacity: 0, scale: 0.85 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -50, opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="w-[560px] max-w-full px-4"
              style={{ transform: `scale(${scale})`, transformOrigin: "center center" }} // DYNAMIC VIEWPORT SCALING
            >
              {/* Single Unified Cyberpunk TV Branded Frame */}
              <div className={cn(
                "overflow-hidden rounded-3xl border shadow-[0_20px_50px_rgba(0,0,0,0.35)]",
                isDark 
                  ? "border-zinc-800 bg-[#0B0C10]/95 backdrop-blur-md shadow-[0_0_30px_rgba(255,213,81,0.15)]"
                  : "border-[#E5E3DD] bg-[#FAF9F6] shadow-[0_15px_45px_rgba(0,0,0,0.06)]"
              )}>
                
                {/* Header Branded Console */}
                <div className={cn(
                  "flex items-center justify-between px-6 py-3 border-b",
                  isDark ? "bg-[#0B0C10]/95 border-zinc-800" : "bg-[#FAF9F6] border-[#E5E3DD]"
                )}>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2",
                    isDark ? "text-zinc-400" : "text-[#706E68]"
                  )}>
                    📺 Treetmi Mediashare Active Player
                  </span>
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    <span className="h-2 w-2 rounded-full bg-yellow-400" />
                    <span className="h-2 w-2 rounded-full bg-green-400" />
                  </div>
                </div>

                {/* Video Playback Container (16:9) */}
                <div className="relative aspect-video w-full bg-black">
                  {getMediaType(currentAlert.mediashare_url) === "YOUTUBE" && ytid ? (
                    <iframe
                      id={`yt-player-${currentAlert.id}`}
                      src={`https://www.youtube.com/embed/${ytid}?enablejsapi=1&autoplay=1&mute=0&controls=0&modestbranding=1&rel=0&iv_load_policy=3`}
                      className="absolute inset-0 h-full w-full pointer-events-none border-none"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  ) : getMediaType(currentAlert.mediashare_url) === "TIKTOK" && getTikTokId(currentAlert.mediashare_url) ? (
                    <iframe
                      src={`https://www.tiktok.com/embed/v2/${getTikTokId(currentAlert.mediashare_url)}`}
                      className="absolute inset-0 h-full w-full pointer-events-none border-none"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  ) : getMediaType(currentAlert.mediashare_url) === "REELS" && getInstagramReelId(currentAlert.mediashare_url) ? (
                    <iframe
                      src={`https://www.instagram.com/reel/${getInstagramReelId(currentAlert.mediashare_url)}/embed`}
                      className="absolute inset-0 h-full w-full pointer-events-none border-none"
                      allowFullScreen
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-black italic text-red-500">
                      Format Link Media Tidak Valid (Dukung YouTube, TikTok, dan Instagram Reels)
                    </div>
                  )}
                </div>

                {/* Integrated Info Bar (Directly Attached Underneath) */}
                <div 
                  className="px-6 py-5 border-t text-black"
                  style={{ backgroundColor: colorDonation, borderColor: isDark ? "rgba(0,0,0,0.08)" : "#E5E3DD" }}
                >
                  <div className="flex items-center justify-between gap-3 text-black">
                    <span className="font-black text-sm md:text-base uppercase tracking-wide truncate">
                      {currentAlert.sender_name}
                    </span>
                    <span className="font-black text-base md:text-lg italic tracking-tight flex-shrink-0">
                      {formatCurrency(currentAlert.gross_amount)}
                    </span>
                  </div>
                  
                  {currentAlert.message && (
                    <p className="text-xs md:text-sm font-semibold italic mt-2.5 leading-relaxed text-black/85 border-t border-black/10 pt-2.5">
                      &ldquo;{currentAlert.message}&rdquo;
                    </p>
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function WidgetMediasharePage() {
  return (
    <Suspense fallback={<div className="bg-transparent" />}>
      <WidgetMediashareContent />
    </Suspense>
  )
}
