"use client"

import { useEffect, useRef, useState, useCallback, Suspense } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { io, Socket } from "socket.io-client"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || "https://api-system.treetmi.id/api/v1").replace(/\/api.*$/, "")
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
  donation_media?: {
    media_type?: "YOUTUBE" | "TIKTOK" | "REELS" | "VOICE_NOTE" | "TEBAK_GAMBAR"
    media_url?: string | null
  } | null
  timestamp: Date
}

interface WidgetSettings {
  tts_enabled?: boolean
  tts_speed?: number
  tts_pitch?: number
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

function isYouTubeShort(url: string | null | undefined): boolean {
  return !!url && url.includes("/shorts/")
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

function isDirectVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false
  return /\.(mp4|webm|mov)(\?|#|$)/i.test(url) || url.includes("/uploads/mediashare-cache/")
}

function toPlayableUrl(url: string | null | undefined): string {
  if (!url) return ""
  if (url.startsWith("/uploads/")) return `${BACKEND_URL}${url}`
  return url
}

function getMediaType(url: string | null | undefined, explicitType?: string | null): "YOUTUBE" | "TIKTOK" | "REELS" | null {
  if (explicitType && ["YOUTUBE", "TIKTOK", "REELS"].includes(explicitType)) return explicitType as "YOUTUBE" | "TIKTOK" | "REELS"
  if (!url) return null
  if (isDirectVideoUrl(url)) return "REELS"
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
  const widgetSettingsRef = useRef<WidgetSettings>({ tts_enabled: true, tts_speed: 1, tts_pitch: 1.1 })

  // Web Speech API / Audio Context Activation
  const activateAudio = useCallback(() => {
    if (audioActivated) return
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      ctx.resume().then(() => ctx.close())
      const utterance = new SpeechSynthesisUtterance("")
      utterance.volume = 0
      window.speechSynthesis.speak(utterance)
      window.speechSynthesis.cancel()
    } catch {}
    setAudioActivated(true)
  }, [audioActivated])

  const speak = useCallback((text: string) => {
    return new Promise<void>((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis || !text.trim()) {
        resolve()
        return
      }

      const settings = widgetSettingsRef.current
      if (settings.tts_enabled === false) {
        resolve()
        return
      }

      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "id-ID"

      const voices = window.speechSynthesis.getVoices()
      const idVoice = voices.find(v => v.lang.startsWith("id")) || voices.find(v => v.lang.startsWith("en")) || voices[0]
      if (idVoice) utterance.voice = idVoice

      utterance.rate = settings.tts_speed || 1
      utterance.pitch = settings.tts_pitch || 1.1
      utterance.volume = 1
      utterance.onend = () => resolve()
      utterance.onerror = () => resolve()
      window.speechSynthesis.speak(utterance)

      setTimeout(resolve, 30000)
    })
  }, [])

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
    const mediaType = getMediaType(alert.mediashare_url, alert.donation_media?.media_type)
    const mediaLabel = mediaType === "TIKTOK" ? "video TikTok" : mediaType === "REELS" ? "Instagram Reels" : "video YouTube"
    const amountFormatted = `${Number(alert.gross_amount).toLocaleString("id-ID")} rupiah`
    const messageText = alert.message?.trim() ? ` Pesan: ${alert.message.trim()}` : ""
    const ttsText = `Halo ${alert.sender_name}! Mengirimkan ${mediaLabel} sebesar ${amountFormatted}.${messageText}`
    setTimeout(() => {
      speak(ttsText)
    }, 900)

    // We will let the YouTube IFrame Player API handle the end state to clear currentAlert
  }, [playSoundEffect, speak])

  const enqueueAlert = useCallback((alert: MediashareAlert) => {
    queueRef.current.push(alert)
    processNextAlert()
  }, [processNextAlert])

  // YouTube API callback when video finishes playing
  const onVideoEnd = useCallback(() => {
    setCurrentAlert(null)
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    isPlayingRef.current = false
    // Jeda 1.5 detik sebelum memutar video berikutnya
    setTimeout(processNextAlert, 1500)
  }, [processNextAlert])

  // Load YouTube Player API and attach listener
  useEffect(() => {
    if (!currentAlert) return

    const mediaType = getMediaType(currentAlert.mediashare_url, currentAlert.donation_media?.media_type)
    if (mediaType === "TIKTOK" || mediaType === "REELS") {
      // TikTok/Reels embeds do not expose a reliable ended event, so use a short overlay window.
      const timer = setTimeout(() => {
        onVideoEnd()
      }, 20000)
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
            widgetSettingsRef.current = {
              tts_enabled: settingsJson.data.tts_enabled ?? true,
              tts_speed: settingsJson.data.tts_speed ?? 1,
              tts_pitch: settingsJson.data.tts_pitch ?? 1.1
            }
          }
        } catch {}

        const socket = io(BACKEND_URL, { transports: ["websocket"] })
        socketRef.current = socket
        socket.on("connect", () => {
          setIsConnected(true)
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
            donation_media: data.donation_media || null,
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

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()
    }
  }, [])

  const formatCurrency = (amount: number) => {
    return `Rp ${Number(amount).toLocaleString("id-ID")}`
  }

  const ytid = currentAlert ? getYouTubeId(currentAlert.mediashare_url) : null
  const mediaType = currentAlert ? getMediaType(currentAlert.mediashare_url, currentAlert.donation_media?.media_type) : null
  const isPortraitMedia = mediaType === "TIKTOK" || mediaType === "REELS" || isYouTubeShort(currentAlert?.mediashare_url)
  const isNativeVideo = currentAlert ? isDirectVideoUrl(currentAlert.mediashare_url) : false

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
              className={cn("pointer-events-auto max-w-full px-4", isPortraitMedia ? "w-[390px]" : "w-[560px]")}
              style={{ transform: `scale(${scale})`, transformOrigin: "center center" }} // DYNAMIC VIEWPORT SCALING
            >
              <div className="space-y-4">
                {/* Video Playback Container */}
                <div className={cn(
                  "relative mx-auto overflow-hidden border bg-black shadow-[0_18px_45px_rgba(0,0,0,0.35)]",
                  isPortraitMedia ? "aspect-[9/16] w-[min(330px,82vw)] rounded-[28px]" : "aspect-video w-full rounded-3xl",
                  isDark ? "border-zinc-800" : "border-[#1A1A19]/15"
                )}>
                  {isNativeVideo ? (
                    <video
                      src={toPlayableUrl(currentAlert.mediashare_url)}
                      className="absolute inset-0 h-full w-full object-cover"
                      autoPlay
                      playsInline
                      controls={false}
                      onCanPlay={(event) => {
                        const video = event.currentTarget
                        video.muted = false
                        video.volume = 1
                        video.play().catch(() => {
                          video.muted = true
                          video.play().catch(() => {})
                        })
                      }}
                      onEnded={onVideoEnd}
                    />
                  ) : mediaType === "YOUTUBE" && ytid ? (
                    <iframe
                      id={`yt-player-${currentAlert.id}`}
                      src={`https://www.youtube.com/embed/${ytid}?enablejsapi=1&autoplay=1&mute=0&controls=0&modestbranding=1&rel=0&iv_load_policy=3`}
                      className="absolute inset-0 h-full w-full border-none"
                      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  ) : mediaType === "TIKTOK" && getTikTokId(currentAlert.mediashare_url) ? (
                    <iframe
                      src={`https://www.tiktok.com/player/v1/${getTikTokId(currentAlert.mediashare_url)}?autoplay=1&controls=0&progress_bar=1&play_button=1&volume_control=0&fullscreen_button=0&timestamp=0&music_info=0&description=0&rel=0&native_context_menu=0&muted=0`}
                      className="absolute inset-0 h-full w-full border-none"
                      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                      allowFullScreen
                      onLoad={(event) => {
                        const frame = event.currentTarget
                        const unMute = () => frame.contentWindow?.postMessage({ type: "unMute", "x-tiktok-player": true }, "https://www.tiktok.com")
                        const play = () => frame.contentWindow?.postMessage({ type: "play", "x-tiktok-player": true }, "https://www.tiktok.com")
                        const start = () => {
                          unMute()
                          play()
                        }
                        setTimeout(start, 250)
                        setTimeout(start, 900)
                        setTimeout(start, 1800)
                      }}
                    />
                  ) : mediaType === "REELS" && getInstagramReelId(currentAlert.mediashare_url) ? (
                    <div className="absolute inset-0 overflow-hidden bg-black">
                      <iframe
                        src={`https://www.instagram.com/reel/${getInstagramReelId(currentAlert.mediashare_url)}/embed?autoplay=1&mute=1&muted=1`}
                        className="absolute left-1/2 top-[-78px] h-[calc(100%+180px)] w-full origin-top -translate-x-1/2 scale-[1.45] border-none"
                        allow="autoplay; encrypted-media; fullscreen; picture-in-picture; web-share"
                        allowFullScreen
                        scrolling="no"
                        onLoad={(event) => {
                          const frame = event.currentTarget
                          const play = () => frame.contentWindow?.postMessage({ type: "play" }, "https://www.instagram.com")
                          setTimeout(play, 300)
                          setTimeout(play, 1000)
                          setTimeout(play, 2000)
                        }}
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-black italic text-red-500">
                      Format Link Media Tidak Valid (Dukung YouTube, TikTok, dan Instagram Reels)
                    </div>
                  )}
                </div>

                {/* Broadcast-style lower third */}
                <div className={cn(
                  "mx-auto text-center",
                  isPortraitMedia ? "w-[min(330px,82vw)]" : "w-full max-w-[520px]"
                )}>
                  <div
                    className="grid grid-cols-[minmax(0,1fr)_auto] overflow-hidden rounded-[24px] border-2 border-black shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
                    style={{ backgroundColor: colorDonation }}
                  >
                    <div className="min-w-0 px-5 py-2.5 text-left">
                      <p className="text-[8px] font-black uppercase tracking-[0.22em] text-black/50">
                        Dari
                      </p>
                      <p className="truncate text-sm md:text-base font-black uppercase tracking-wide text-black">
                        {currentAlert.sender_name}
                      </p>
                    </div>
                    <div className="flex items-center rounded-l-[22px] bg-black px-4 md:px-5">
                      <span
                        className="whitespace-nowrap text-base md:text-lg font-black italic tracking-tight"
                        style={{ color: colorDonation }}
                      >
                        {formatCurrency(currentAlert.gross_amount)}
                      </span>
                    </div>
                  </div>
                  {currentAlert.message && (
                    <div
                      className="relative mt-2 overflow-hidden rounded-[20px] border-2 border-black px-5 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.16)]"
                      style={{ backgroundColor: colorDonation }}
                    >
                      <div className="pointer-events-none absolute inset-y-0 left-0 w-2 bg-black" />
                      <p className="text-sm md:text-base font-black italic leading-snug tracking-wide text-black">
                        &ldquo;{currentAlert.message}&rdquo;
                      </p>
                    </div>
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
