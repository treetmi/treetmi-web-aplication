"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { fetchWithRetry, API_BASE_URL } from "@/lib/api"
import { Switch } from "@/components/ui/switch"
import { Loader2, Save, Sparkles, Plus, Trash2, HelpCircle, Play, Trophy, Volume2, ClipboardList, AlertTriangle } from "lucide-react"
import { formatNumberInput, parseNumberInput } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const COLOR_PRESETS = [
  "#FFD551", // Gold
  "#FF5555", // Red
  "#4ADE80", // Green
  "#60A5FA", // Blue
  "#C084FC", // Purple
  "#2DD4BF", // Teal
  "#FB923C", // Orange
  "#F43F5E", // Pink
]

interface GachaItem {
  id?: string
  name: string
  weight: number
  color: string
}

export default function GachaSettingsTab() {
  const { data: session } = useSession()
  const [isEnabled, setIsEnabled] = useState(false)
  const [minDonation, setMinDonation] = useState(10000)
  const [durationSec, setDurationSec] = useState(5)
  const [items, setItems] = useState<GachaItem[]>([
    { name: "Terima Kasih 💛", weight: 10, color: "#FFD551" },
    { name: "Zonk / Coba Lagi 😢", weight: 10, color: "#FF5555" },
    { name: "Follow Back Sosmed 📱", weight: 5, color: "#4ADE80" },
    { name: "Mabar 1 Game 🎮", weight: 2, color: "#60A5FA" },
  ])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [gachaLogs, setGachaLogs] = useState<any[]>([])

  // Simulation State
  const [isSpinning, setIsSpinning] = useState(false)
  const [audioActivated, setAudioActivated] = useState(false)
  const [winnerItem, setWinnerItem] = useState<GachaItem | null>(null)
  const [showWinnerDialog, setShowWinnerDialog] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rotationRef = useRef(0)
  const animationFrameRef = useRef<number | null>(null)
  const idleFrameRef = useRef<number | null>(null)
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

  // Dynamic Audio Synth
  const playTickSound = useCallback((force = false) => {
    if (!audioActivated && !force) return
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) return
      const ctx = new AudioContextClass()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(600, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04)
      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.04)
    } catch {}
  }, [audioActivated])

  const playWinSound = useCallback((force = false) => {
    if (!audioActivated && !force) return
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) return
      const ctx = new AudioContextClass()
      const playNote = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = "triangle"
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start)
        gain.gain.setValueAtTime(0.18, ctx.currentTime + start)
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
      const utterance = new SpeechSynthesisUtterance(text)
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

  // Canvas Drawing
  const drawWheel = useCallback((wheelItems: GachaItem[], rotationAngle: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) - 15

    ctx.clearRect(0, 0, width, height)

    const numSlices = wheelItems.length
    if (numSlices === 0) return
    const sliceAngle = (2 * Math.PI) / numSlices

    // Draw outer frame
    ctx.save()
    ctx.shadowBlur = 15
    ctx.shadowColor = "#FFD551"
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius + 5, 0, 2 * Math.PI)
    ctx.fillStyle = "#18181b"
    ctx.strokeStyle = "#FFD551"
    ctx.lineWidth = 6
    ctx.fill()
    ctx.stroke()
    ctx.restore()

    // Slices
    for (let i = 0; i < numSlices; i++) {
      const startAngle = i * sliceAngle + rotationAngle
      const endAngle = (i + 1) * sliceAngle + rotationAngle

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()

      ctx.fillStyle = wheelItems[i].color || COLOR_PRESETS[i % COLOR_PRESETS.length]
      ctx.fill()

      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)"
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Slice labels
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(startAngle + sliceAngle / 2)
      ctx.textAlign = "right"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "#FFFFFF"
      // Dynamic font size based on text length to prevent clipping & maintain readability
      const text = wheelItems[i].name
      let fontSize = 11
      if (text.length > 12) fontSize = 9
      if (text.length > 16) fontSize = 7.5
      ctx.font = `bold ${fontSize}px system-ui`
      
      const displayText = text.length > 22 ? text.substring(0, 22) + ".." : text
      ctx.fillText(displayText, radius - 15, 0)
      ctx.restore()
    }

    // Center peg
    ctx.save()
    ctx.beginPath()
    ctx.arc(centerX, centerY, 22, 0, 2 * Math.PI)
    ctx.fillStyle = "#18181b"
    ctx.strokeStyle = "#FFD551"
    ctx.lineWidth = 4
    ctx.fill()
    ctx.stroke()

    const img = logoImageRef.current
    if (img && img.complete) {
      const imgSize = 30
      ctx.save()
      ctx.beginPath()
      ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI)
      ctx.clip()
      ctx.drawImage(img, centerX - imgSize / 2, centerY - imgSize / 2, imgSize, imgSize)
      ctx.restore()
    } else {
      ctx.fillStyle = "#FFD551"
      ctx.font = "bold 11px system-ui"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("🎁", centerX, centerY)
      ctx.restore()
    }
  }, [])

  // Idle rotate when not spinning
  useEffect(() => {
    if (isSpinning) {
      if (idleFrameRef.current) cancelAnimationFrame(idleFrameRef.current)
      return
    }

    const animateIdle = () => {
      rotationRef.current += 0.003
      drawWheel(items, rotationRef.current)
      idleFrameRef.current = requestAnimationFrame(animateIdle)
    }

    animateIdle()

    return () => {
      if (idleFrameRef.current) cancelAnimationFrame(idleFrameRef.current)
    }
  }, [isSpinning, items, drawWheel])

  useEffect(() => {
    // @ts-ignore
    if (session?.user?.accessToken) {
      fetchSettings()
    }
  }, [session])

  const fetchLogs = async () => {
    try {
      // @ts-ignore
      const token = session?.user?.accessToken
      const res = await fetchWithRetry(`${API_BASE_URL}/users/gacha-logs`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const json = await res.json()
      if (json.success && json.data) {
        setGachaLogs(json.data)
      }
    } catch (err) {
      console.error("Gagal mengambil log gacha:", err)
    }
  }

  const fetchSettings = async () => {
    try {
      // @ts-ignore
      const token = session?.user?.accessToken
      const res = await fetchWithRetry(`${API_BASE_URL}/users/gacha-settings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const json = await res.json()
      if (json.success && json.data) {
        setIsEnabled(json.data.settings?.is_enabled ?? false)
        setMinDonation(json.data.settings?.min_donation ?? 10000)
        setDurationSec(json.data.settings?.duration_sec ?? 5)
        if (json.data.items && json.data.items.length > 0) {
          setItems(json.data.items)
        }
      }
      await fetchLogs()
    } catch (err) {
      console.error(err)
      toast.error("Gagal mengambil data pengaturan Gacha")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddItem = () => {
    if (items.length >= 12) {
      toast.error("Maksimal 12 item pada roda Gacha.")
      return
    }
    const nextColor = COLOR_PRESETS[items.length % COLOR_PRESETS.length]
    setItems(prev => [
      ...prev,
      { name: `Hadiah Baru`, weight: 1, color: nextColor }
    ])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length <= 2) {
      toast.error("Minimal harus ada 2 item pada roda Gacha.")
      return
    }
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: keyof GachaItem, value: any) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      // @ts-ignore
      const token = session?.user?.accessToken
      const res = await fetchWithRetry(`${API_BASE_URL}/users/gacha-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          is_enabled: isEnabled,
          min_donation: minDonation,
          duration_sec: durationSec,
          items: items.map(item => ({
            name: item.name.trim(),
            weight: Number(item.weight) || 1,
            color: item.color
          }))
        })
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Pengaturan Gacha berhasil disimpan!")
        setIsEnabled(json.data.settings.is_enabled)
        setMinDonation(json.data.settings.min_donation)
        setDurationSec(json.data.settings.duration_sec)
        setItems(json.data.items)
      } else {
        throw new Error(json.message || "Gagal menyimpan")
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan")
    } finally {
      setIsSaving(false)
    }
  }

  // Dashboard manual test spin logic
  const handleTestSpin = () => {
    if (isSpinning || items.length === 0) return
    
    // Auto resume/enable audio context on user click
    if (!audioActivated) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
        if (AudioContextClass) {
          const ctx = new AudioContextClass()
          ctx.resume().then(() => ctx.close())
        }
      } catch {}
      setAudioActivated(true)
    }

    setIsSpinning(true)
    setWinnerItem(null)
    setShowWinnerDialog(false)

    // Calculate a weighted random winner from the current list
    const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0)
    let randomVal = Math.random() * totalWeight
    let winnerIdx = 0

    for (let i = 0; i < items.length; i++) {
      randomVal -= (items[i].weight || 1)
      if (randomVal <= 0) {
        winnerIdx = i
        break
      }
    }

    const durationMs = durationSec * 1000
    const sliceAngle = (2 * Math.PI) / items.length
    const currentStartAngle = rotationRef.current % (2 * Math.PI)

    // Stopping pointer is at 12 o'clock (-Math.PI / 2)
    const targetOffset = -Math.PI / 2 - (winnerIdx + 0.5) * sliceAngle
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
        // Force play tick sound to bypass asynchronous state checks on first user click
        playTickSound(true)
        lastSliceCross = currentSlice
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateSpin)
      } else {
        setIsSpinning(false)
        setWinnerItem(items[winnerIdx])
        setShowWinnerDialog(true)
        
        // Force play win sound to bypass asynchronous state checks
        playWinSound(true)

        // Read out the TTS announcement
        const announcement = `Selamat kepada Budi Gamer! Mendapatkan hadiah: ${items[winnerIdx].name}`
        speakText(announcement)
      }
    }

    animateSpin()
  }

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-zinc-500" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
            <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
              <CardTitle className="font-black italic text-sm md:text-base tracking-wider text-black dark:text-[#FFD551] flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#FFD551]" /> Gacha Wheel Settings
              </CardTitle>
              <CardDescription className="font-bold italic text-[11px] md:text-xs text-slate-400">
                Konfigurasikan item hadiah dan probabilitas Gacha Wheel untuk target donasi channel Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSave} className="space-y-6">
                
                {/* Switch enable */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-2xl border border-slate-200 dark:border-zinc-800">
                  <div className="space-y-1">
                    <Label className="font-black italic text-sm text-black dark:text-white">Aktifkan Fitur Gacha Wheel</Label>
                    <p className="text-[11px] font-bold text-slate-400">Roda Gacha akan muncul otomatis jika penonton donasi di atas minimal threshold.</p>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={setIsEnabled}
                  />
                </div>

                {isEnabled && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Min Donation */}
                      <div className="space-y-2">
                        <Label className="font-black italic text-xs md:text-sm">Batas Minimal Donasi Gacha (Rp)</Label>
                        <Input
                          type="text"
                          value={formatNumberInput(minDonation)}
                          onChange={(e) => setMinDonation(parseNumberInput(e.target.value) || 10000)}
                          placeholder="10.000"
                          className="bg-[#FAF9F6] dark:bg-[#1E1E1D] font-bold"
                        />
                        <p className="text-[9px] font-bold text-slate-400 uppercase italic">
                          Hanya donasi minimal sebesar batas ini yang memicu putaran Gacha di overlay stream.
                        </p>
                      </div>

                      {/* Spin Duration */}
                      <div className="space-y-2">
                        <Label className="font-black italic text-xs md:text-sm">Durasi Animasi Putaran (Detik)</Label>
                        <Input
                          type="number"
                          min={3}
                          max={15}
                          value={durationSec}
                          onChange={(e) => setDurationSec(parseInt(e.target.value) || 5)}
                          placeholder="5"
                          className="bg-[#FAF9F6] dark:bg-[#1E1E1D] font-bold"
                        />
                        <p className="text-[9px] font-bold text-slate-400 uppercase italic">
                          Durasi roda berputar hingga berhenti (3 - 15 detik).
                        </p>
                      </div>
                    </div>

                    {/* Tip Otomatisasi Mabar */}
                    <div className="p-3.5 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-2.5 items-start">
                      <HelpCircle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-450 tracking-wider">💡 Integrasi Antrian Mabar Otomatis</p>
                        <p className="text-[9.5px] font-bold text-slate-500 dark:text-zinc-400">
                          Jika Anda menambahkan item hadiah dengan nama mengandung kata <span className="bg-amber-500/10 text-amber-700 dark:text-amber-450 px-1 py-0.5 rounded font-black italic">"Mabar"</span> atau <span className="bg-amber-500/10 text-amber-700 dark:text-amber-450 px-1 py-0.5 rounded font-black italic">"Main Bareng"</span> (contoh: <span className="italic font-bold">"Mabar 3 Game"</span> atau <span className="italic font-bold">"Main Bareng 1 Game"</span>), penonton yang memenangkan hadiah tersebut akan **secara otomatis masuk ke daftar Antrian Mabar** Anda secara instan!
                        </p>
                      </div>
                    </div>

                    {/* Wheel Items List */}
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-zinc-900">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-black italic text-sm text-black dark:text-white">Item & Probabilitas Hadiah</Label>
                          <p className="text-[10px] font-bold text-slate-400 italic">Gunakan "Bobot" lebih besar agar peluang hadiah tersebut terpilih meningkat.</p>
                        </div>
                        <Button
                          type="button"
                          onClick={handleAddItem}
                          size="sm"
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-black italic rounded-xl text-xs px-4"
                        >
                          <Plus className="h-4 w-4 mr-1" /> Tambah Hadiah
                        </Button>
                      </div>

                      <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                        {items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-zinc-900/40 rounded-2xl border border-slate-200 dark:border-zinc-800">
                            {/* Color picker box */}
                            <div className="relative shrink-0 w-8 h-8 rounded-full border border-slate-300 dark:border-zinc-700 flex items-center justify-center overflow-hidden" style={{ backgroundColor: item.color }}>
                              <input
                                type="color"
                                value={item.color}
                                onChange={(e) => handleItemChange(idx, "color", e.target.value)}
                                className="absolute opacity-0 w-full h-full cursor-pointer"
                              />
                            </div>

                            {/* Name input */}
                            <div className="flex-1 min-w-0">
                              <Input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                                placeholder={`Hadiah ${idx + 1}`}
                                className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 font-bold"
                              />
                            </div>

                            {/* Weight input */}
                            <div className="w-24 shrink-0 flex items-center gap-2">
                              <Label className="text-xs text-slate-400 font-black italic">Bobot</Label>
                              <Input
                                type="number"
                                min={1}
                                max={100}
                                value={item.weight}
                                onChange={(e) => handleItemChange(idx, "weight", parseInt(e.target.value) || 1)}
                                className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 font-bold text-center"
                              />
                            </div>

                            {/* Trash action */}
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-500/10 p-2 h-10 w-10 rounded-xl"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-zinc-900">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="h-12 bg-[#FFD551] text-black hover:bg-[#FFC83B] rounded-2xl font-black italic text-xs md:text-sm px-8 shadow-sm transition-all"
                  >
                    {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                    Simpan Konfigurasi Gacha
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Interactive Wheel Preview */}
        <div className="space-y-6">
          <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden sticky top-6">
            <CardHeader className="py-5 px-6 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-black italic text-sm tracking-wider text-black dark:text-[#FFD551]">
                  Live Wheel Preview
                </CardTitle>
                <CardDescription className="font-bold italic text-[10px] text-slate-400">
                  Visualisasi roda real-time.
                </CardDescription>
              </div>
              <button
                type="button"
                onClick={() => setAudioActivated(p => !p)}
                className={`p-1.5 rounded-lg border ${audioActivated ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-zinc-500/10 border-zinc-300 text-zinc-400 dark:border-zinc-800'}`}
                title="Aktifkan Suara Preview"
              >
                <Volume2 className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center justify-center">
              
              {/* Canvas Wheel Rendering Container */}
              <div className="relative my-4">
                <canvas
                  ref={canvasRef}
                  width={280}
                  height={280}
                  className="max-w-full h-auto"
                />
                
                {/* Pointer peg */}
                <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 z-10 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                  <svg width="20" height="28" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 42L0 12L32 12L16 42Z" fill="#FFD551" />
                    <circle cx="16" cy="12" r="10" fill="#FFD551" />
                    <circle cx="16" cy="12" r="5" fill="#18181b" />
                  </svg>
                </div>
              </div>

              {/* Simulation action button */}
              <Button
                type="button"
                onClick={handleTestSpin}
                disabled={isSpinning || items.length === 0}
                className="mt-4 w-full h-11 bg-black text-[#FFD551] border border-zinc-800 hover:bg-zinc-900 dark:bg-zinc-800 dark:text-[#FFD551] rounded-xl font-black italic text-xs tracking-wider"
              >
                <Play className="h-4 w-4 mr-1.5 fill-current" /> UJI COBA PUTARAN DI SINI
              </Button>

              {/* Disclaimer Syarat & Ketentuan */}
              <div className="mt-5 p-4 bg-amber-500/5 dark:bg-amber-500/10 border-2 border-amber-500/20 rounded-2xl space-y-2.5 text-left relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-450 italic">
                  <AlertTriangle className="h-4 w-4 text-amber-500 animate-pulse shrink-0" />
                  <span>⚖️ SYARAT & KETENTUAN FITUR GACHA</span>
                </div>
                <div className="space-y-2 text-xs font-bold text-slate-650 dark:text-zinc-300 leading-relaxed italic">
                  <p>
                    • Fitur ini murni ditujukan sebagai <span className="font-black text-amber-750 dark:text-[#FFD551]">sarana interaktif & hiburan (Gacha Challenge)</span> guna menyemarakkan live streaming serta meningkatkan interaksi positif antara kreator dan penonton.
                  </p>
                  <p>
                    • <span className="font-black text-red-600 dark:text-red-400 underline">DILARANG KERAS</span> menyalahgunakan fitur ini sebagai media perjudian, taruhan komersial, atau mencari keuntungan sepihak secara ilegal.
                  </p>
                  <p>
                    • Pastikan semua reward yang didaftarkan bersifat wajar, kreatif, menyenangkan, serta patuh sepenuhnya pada hukum dan norma yang berlaku.
                  </p>
                </div>
              </div>

              {/* Winner Dialog Card inside widget view */}
              <AnimatePresence>
                {showWinnerDialog && winnerItem && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="mt-6 p-4 rounded-2xl border border-[#FFD551] bg-[#FFD551]/5 w-full text-center space-y-2"
                  >
                    <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase text-[#FFD551]">
                      <Trophy className="h-4 w-4 text-[#FFD551]" /> HASIL UJI COBA
                    </div>
                    <p className="text-xs font-bold text-slate-400">Roda berhenti di segmen:</p>
                    <p className="text-sm font-black text-black dark:text-white uppercase tracking-wider bg-slate-100 dark:bg-zinc-900 py-1.5 px-3 rounded-lg">
                      {winnerItem.name}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowWinnerDialog(false)}
                      className="text-[10px] text-zinc-500 font-extrabold uppercase hover:bg-transparent h-6"
                    >
                      Tutup
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

             </CardContent>
          </Card>
        </div>

      </div>

      {/* Gacha Logs History Section */}
      <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden mt-6">
        <CardHeader className="py-5 px-6 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900 flex items-center justify-between">
          <div>
            <CardTitle className="font-black italic text-xs tracking-wider text-black dark:text-[#FFD551] flex items-center gap-2">
              <ClipboardList className="h-4.5 w-4.5" /> Riwayat Tantangan Gacha (Live Logs)
            </CardTitle>
            <CardDescription className="font-bold italic text-[9px] text-slate-400 mt-1">
              Daftar putar tantangan/hadiah yang didapatkan oleh penonton Anda secara live.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {gachaLogs.length === 0 ? (
            <div className="p-12 text-center text-xs font-bold text-slate-400 dark:text-zinc-500 italic">
              Belum ada riwayat putaran Gacha.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/20">
                <TableRow className="border-b border-slate-100 dark:border-zinc-900">
                  <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-xs md:text-sm px-6">Tanggal & Waktu</TableHead>
                  <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-xs md:text-sm">Pendonasi</TableHead>
                  <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-xs md:text-sm">Jumlah Dukungan</TableHead>
                  <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-xs md:text-sm">Hadiah Gacha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gachaLogs.map((log: any, idx: number) => {
                  // Find matching reward color
                  const matchedItem = items.find(it => it.name.toLowerCase() === log.reward_name.toLowerCase())
                  const dotColor = matchedItem?.color || "#FFD551"

                  return (
                    <TableRow key={log.id || idx} className="border-b border-slate-100/60 dark:border-zinc-800/40 hover:bg-slate-50/30">
                      <TableCell className="text-xs md:text-sm font-bold text-slate-450 italic px-6">
                        {new Date(log.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                        })} WIB
                      </TableCell>
                      <TableCell className="font-bold italic text-xs md:text-sm text-black dark:text-white">
                        {log.donor_name}
                      </TableCell>
                      <TableCell className="font-mono font-bold text-xs md:text-sm text-emerald-600">
                        Rp {Number(log.amount).toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className="bg-zinc-950 text-white border-none font-black italic text-[10px] rounded-lg px-2.5 py-1 flex items-center gap-1.5 w-fit shadow-sm"
                          style={{
                            borderLeft: `4px solid ${dotColor}`
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: dotColor }} />
                          {log.reward_name}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
