"use client"

import { useEffect, useRef, useState, useCallback, Suspense } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { io, Socket } from "socket.io-client"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || "https://api-system.treetmi.id/api/v1").replace(/\/api.*$/, "")
import { API_BASE_URL } from "@/lib/api"
const API_BASE = API_BASE_URL

interface PlayingItem {
  name: string
  game: string
  ingame_nickname: string
}

interface QueueItem {
  name: string
  ingame_nickname: string
  position: number
}

function WidgetQueueContent() {
  const params = useParams()
  const searchParams = useSearchParams()

  const token = Array.isArray(params?.token) ? params.token[0] : params?.token
  const scaleStr = searchParams?.get("scale")
  const scale = scaleStr ? parseFloat(scaleStr) : 1.2 // Compact default scale for corner HUD
  const themeParam = searchParams?.get("theme") || "dark"
  const isDark = themeParam === "dark"

  const [playing, setPlaying] = useState<PlayingItem[]>([])
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [streamerInfo, setStreamerInfo] = useState<{ streamer_id: string; username: string } | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isListVisible, setIsListVisible] = useState(true)

  const socketRef = useRef<Socket | null>(null)

  const fetchTickerData = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/queues/ticker/${token}`)
      const json = await res.json()
      if (json.success) {
        setPlaying(json.playing || [])
        setQueue(json.queue || [])
      }
    } catch (err) {
      console.error("Queue Widget: gagal fetch data ticker", err)
    }
  }, [token])

  // Timer to toggle visibility every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsListVisible(prev => !prev)
    }, 10000) // 10 seconds interval
    return () => clearInterval(interval)
  }, [])

  // Connect socket and fetch initially
  useEffect(() => {
    if (!token) return

    const init = async () => {
      // 1. Ambil data awal
      await fetchTickerData()

      // 2. Ambil data streamer untuk username
      try {
        const res = await fetch(`${API_BASE}/users/widget/${token}`)
        const json = await res.json()
        if (json.success) {
          const info = json.data
          setStreamerInfo(info)

          // 3. Hubungkan socket.io untuk realtime update
          const socket = io(BACKEND_URL, { transports: ["websocket"] })
          socketRef.current = socket
          socket.on("connect", () => {
            setIsConnected(true)
            socket.emit("join-streamer", info.streamer_id)
          })
          socket.on("disconnect", () => setIsConnected(false))
          socket.on("queue:update", () => {
            fetchTickerData()
          })
        }
      } catch (err) {
        console.error("Queue Widget: gagal inisialisasi", err)
      }
    }

    init()

    // Polling fallback every 8 seconds
    const interval = setInterval(fetchTickerData, 8000)

    return () => {
      socketRef.current?.disconnect()
      clearInterval(interval)
    }
  }, [token, fetchTickerData])

  return (
    <div 
      className="p-4 fixed top-4 right-4 w-[380px] max-w-full"
      style={{ 
        transform: `scale(${scale})`, 
        transformOrigin: "top right"
      }}
    >
      <div className={cn(
        "overflow-hidden rounded-xl border-4 border-black transition-all duration-300 p-3.5",
        isDark 
          ? "bg-zinc-900 shadow-[8px_8px_0px_#000000]" 
          : "bg-white shadow-[8px_8px_0px_#000000]"
      )}>
        
        {/* Header HUD - ANTRIAN MABAR @username */}
        <div className="flex items-center justify-between border-b-4 border-black pb-2.5 mb-3">
          <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5" style={{ color: isDark ? "white" : "#1A1A19" }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-red-600">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
            </svg>
            ANTRIAN MABAR {streamerInfo?.username ? `@${streamerInfo.username}` : ""}
          </span>
          <span className="flex items-center gap-1.5 select-none bg-red-600 text-white px-2 py-0.5 rounded-md border-2 border-black font-black text-[8px] tracking-widest shadow-[2px_2px_0px_#000000]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
            </span>
            LIVE
          </span>
        </div>

        {/* Collapsible Content Body using Framer Motion */}
        <AnimatePresence initial={false}>
          {isListVisible && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              {playing.length === 0 && queue.length === 0 ? (
                <div className="py-6 text-center text-[10px] font-black italic text-zinc-500 uppercase">
                  Antrean Kosong
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  
                  {/* 1. Playing Now section */}
                  {playing.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[9px] font-black uppercase tracking-wider flex items-center gap-1 text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                          <path d="M4.5 3.75a3 3 0 00-3 3v10.5a3 3 0 003 3h15a3 3 0 003-3V6.75a3 3 0 00-3-3h-15zm.75 6.75a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5zm6 0a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5zm6 0a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5zm-12 3a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5zm6 0a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5zm6 0a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5z" />
                        </svg>
                        SEDANG MAIN
                      </div>
                      {playing.map((p, idx) => (
                        <div 
                          key={idx} 
                          className={cn(
                            "border-2 border-black rounded-xl p-2.5 flex items-center justify-between gap-2.5 transition-all duration-300 shadow-[3px_3px_0px_#000000]",
                            isDark ? "bg-zinc-800 text-white" : "bg-slate-50 text-[#1A1A19]"
                          )}
                        >
                          <div className="min-w-0">
                            <div className={cn("text-[11px] font-black truncate", isDark ? "text-white" : "text-[#1A1A19]")}>
                              {p.name}
                            </div>
                            <div className="text-[9px] font-bold text-zinc-400 truncate">
                              ID: {p.ingame_nickname}
                            </div>
                          </div>
                          <span className="text-[8px] font-black text-white px-1.5 py-0.5 rounded border border-black italic uppercase shrink-0 shadow-sm bg-red-600">
                            {p.game}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 2. Waiting Queue section */}
                  {queue.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[9px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                        </svg>
                        SELANJUTNYA ({queue.length})
                      </div>
                      <div className="space-y-2">
                        {queue.slice(0, 3).map((q, idx) => (
                          <div 
                            key={idx} 
                            className={cn(
                              "flex items-center justify-between text-[10px] px-2.5 py-1.5 rounded-lg border-2 border-black transition-all duration-300 shadow-[3px_3px_0px_#000000]",
                              isDark ? "bg-zinc-800 text-zinc-300" : "bg-slate-50 text-zinc-700"
                            )}
                          >
                            <span className="font-bold truncate">{q.name}</span>
                            <span className="font-black text-[9px] shrink-0 text-red-600 bg-red-100 dark:bg-red-950/40 px-1 py-0.5 rounded border border-black">
                              #{q.position}
                            </span>
                          </div>
                        ))}
                        
                        {queue.length > 3 && (
                          <div className="text-right text-[8px] font-bold text-zinc-500 uppercase italic pt-0.5">
                            +{queue.length - 3} PLAYER LAINNYA
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function WidgetQueuePage() {
  return (
    <Suspense fallback={<div className="bg-transparent" />}>
      <WidgetQueueContent />
    </Suspense>
  )
}
