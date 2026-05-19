"use client"
import { useState, useCallback, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Gamepad2, Heart, Save, Play, Upload, Volume2, VolumeX, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { formatNumberInput, parseNumberInput } from "@/lib/utils"

import { API_BASE_URL } from "@/lib/api"
const API_BASE = API_BASE_URL
const BACKEND_URL = API_BASE.replace(/\/api.*$/, "")

interface SoundTier { min: number; max: number | null; prefix: string; sound_key: string; gif_key: string; gif_url?: string | null }
interface WidgetSettings {
  color_donation: string; color_mabar: string
  tts_enabled: boolean; tts_speed: number; tts_pitch: number; alert_duration_sec: number
  sound_tiers: SoundTier[]; coin_sound_key: string; coin_sound_url?: string
  mediashare_enabled?: boolean; mediashare_min_donation?: number
}

const BUILTIN_GIFS = [
  { key: "coin", label: "🪙 Coin", file: "/gif/Coin.gif" },
  { key: "wallet_fly", label: "💸 Flying Wallet", file: "/gif/Flying_Wallet_Money.gif" },
  { key: "wallet_anim", label: "👛 Wallet Animasi", file: "/gif/Wallet_animation.gif" },
  { key: "coin_wallet", label: "💰 Coin & Wallet", file: "/gif/coin_circling_wallet.gif" },
  { key: "none", label: "🚫 Tanpa GIF", file: "" },
]

const DEFAULT_SETTINGS: WidgetSettings = {
  color_donation: "#FFD551", color_mabar: "#34d399",
  tts_enabled: true, tts_speed: 1.0, tts_pitch: 1.1, alert_duration_sec: 5,
  sound_tiers: [
    { min: 0, max: 25000, prefix: "", sound_key: "coin", gif_key: "coin" },
    { min: 25000, max: 100000, prefix: "Wow", sound_key: "bell", gif_key: "wallet_fly" },
    { min: 100000, max: 1000000, prefix: "Mantap Bro", sound_key: "fanfare", gif_key: "wallet_anim" },
    { min: 1000000, max: null, prefix: "Gile Bro", sound_key: "epic", gif_key: "coin_wallet" },
  ],
  coin_sound_key: "coin",
  mediashare_enabled: true,
  mediashare_min_donation: 10000
}

const BUILTIN_SOUNDS = [
  { key: "coin", label: "🪙 Coin", emoji: "🪙" },
  { key: "bell", label: "🔔 Bell", emoji: "🔔" },
  { key: "fanfare", label: "🎺 Fanfare", emoji: "🎺" },
  { key: "epic", label: "🎆 Epic", emoji: "🎆" },
  { key: "none", label: "🔇 Tidak Ada", emoji: "🔇" },
]

// Helper: tunggu voices siap lalu ambil voice Indonesia
function getIdVoice(): Promise<SpeechSynthesisVoice | null> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      resolve(voices.find(v => v.lang.startsWith("id")) || voices.find(v => v.lang.startsWith("en")) || voices[0])
      return
    }
    // Voices belum dimuat — tunggu event
    window.speechSynthesis.onvoiceschanged = () => {
      const v = window.speechSynthesis.getVoices()
      resolve(v.find(x => x.lang.startsWith("id")) || v.find(x => x.lang.startsWith("en")) || v[0])
    }
    // Timeout fallback 500ms
    setTimeout(() => resolve(null), 500)
  })
}

// Generate sound via Web Audio API
function playBuiltinSound(key: string) {
  if (typeof window === "undefined" || key === "none") return
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
  const gain = ctx.createGain()
  gain.connect(ctx.destination)
  gain.gain.setValueAtTime(0.4, ctx.currentTime)

  if (key === "coin") {
    const o = ctx.createOscillator(); o.type = "sine"
    o.frequency.setValueAtTime(880, ctx.currentTime)
    o.frequency.setValueAtTime(1320, ctx.currentTime + 0.08)
    o.connect(gain); o.start(); o.stop(ctx.currentTime + 0.18)
  } else if (key === "bell") {
    const o = ctx.createOscillator(); o.type = "sine"
    o.frequency.setValueAtTime(660, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
    o.connect(gain); o.start(); o.stop(ctx.currentTime + 0.8)
  } else if (key === "fanfare") {
    [523, 659, 784, 1047].forEach((freq, i) => {
      const o = ctx.createOscillator(); o.type = "square"
      o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12)
      const g = ctx.createGain(); g.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.12)
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.12 + 0.1)
      o.connect(g); g.connect(ctx.destination)
      o.start(ctx.currentTime + i * 0.12); o.stop(ctx.currentTime + i * 0.12 + 0.15)
    })
  } else if (key === "epic") {
    [220, 277, 330, 440, 554, 660].forEach((freq, i) => {
      const o = ctx.createOscillator(); o.type = "sawtooth"
      o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1)
      const g = ctx.createGain(); g.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.1)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.4)
      o.connect(g); g.connect(ctx.destination)
      o.start(ctx.currentTime + i * 0.1); o.stop(ctx.currentTime + i * 0.1 + 0.45)
    })
  }
}

// Alert Preview Card
function AlertPreviewCard({ type, color, name, amount, message, game, gifSrc }: any) {
  const isD = type === "DONATION"
  const border = isD ? color : color
  const glow = isD ? `rgba(${parseInt(color.slice(1,3),16)},${parseInt(color.slice(3,5),16)},${parseInt(color.slice(5,7),16)},0.35)` : `rgba(${parseInt(color.slice(1,3),16)},${parseInt(color.slice(3,5),16)},${parseInt(color.slice(5,7),16)},0.25)`
  return (
    <div className="flex flex-col items-center gap-2">
      {/* GIF Animation di atas card */}
      {gifSrc && (
        <motion.img
          src={gifSrc}
          alt="Alert GIF"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
          className="w-20 h-20 object-contain drop-shadow-lg"
        />
      )}
      {/* Card alert */}
      <div className="w-full rounded-2xl overflow-hidden shadow-2xl" style={{ border: `2px solid ${border}`, background: isD ? "linear-gradient(135deg,#1a1200,#2d2000)" : "linear-gradient(135deg,#001a0a,#002d15)", boxShadow: `0 0 40px ${glow}` }}>
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg,${color},${isD?"#FF6B35":color},${color})` }} />
        <div className="px-5 py-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0" style={{ background: `linear-gradient(135deg,${color},${isD?"#FF6B35":color})` }}>
            {isD ? "❤️" : "🎮"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-white font-black text-sm uppercase truncate">{name}</span>
              <span className="font-black text-sm flex-shrink-0" style={{ color }}>Rp {Number(amount).toLocaleString("id-ID")}</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest mt-0.5" style={{ color: `${color}bb` }}>
              {isD ? "💛 Donasi via Treetmi" : `🎮 Order Mabar · ${game || "Game"}`}
            </p>
            {message && <p className="text-[11px] text-white/60 italic mt-1.5 line-clamp-2">"{message}"</p>}
          </div>
        </div>
        <div className="h-0.5 origin-left" style={{ background: `linear-gradient(90deg,${color},transparent)` }} />
      </div>
    </div>
  )
}

interface Props { session: any; widgetToken: string }

export default function WidgetStudio({ session, widgetToken }: Props) {
  const [settings, setSettings] = useState<WidgetSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [previewType, setPreviewType] = useState<"DONATION" | "MABAR">("DONATION")
  const [previewName, setPreviewName] = useState("Budi Gamer")
  const [previewAmount, setPreviewAmount] = useState("75000")
  const [previewMsg, setPreviewMsg] = useState("Mantap streamnya bro! 🔥")
  const [previewGame, setPreviewGame] = useState("Mobile Legends")
  const [showAlert, setShowAlert] = useState(false)
  const uploadRef = useRef<HTMLInputElement>(null)

  const widgetUrl = `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/widget/alert/${widgetToken}`

  // Preload suara TTS saat komponen pertama kali dimuat
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()
    }
  }, [])

  // Fetch saved settings dari database saat mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (!session?.user?.accessToken) return
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/widget-settings`, {
          headers: { "Authorization": `Bearer ${session.user.accessToken}` }
        })
        const json = await res.json()
        if (json.success && json.data) {
          const d = json.data
          setSettings({
            color_donation: d.color_donation || DEFAULT_SETTINGS.color_donation,
            color_mabar: d.color_mabar || DEFAULT_SETTINGS.color_mabar,
            tts_enabled: d.tts_enabled ?? DEFAULT_SETTINGS.tts_enabled,
            tts_speed: d.tts_speed ?? DEFAULT_SETTINGS.tts_speed,
            tts_pitch: d.tts_pitch ?? DEFAULT_SETTINGS.tts_pitch,
            alert_duration_sec: d.alert_duration_sec ?? DEFAULT_SETTINGS.alert_duration_sec,
            sound_tiers: (d.sound_tiers && d.sound_tiers.length > 0)
              ? d.sound_tiers.map((t: any, i: number) => ({
                  ...DEFAULT_SETTINGS.sound_tiers[i],
                  ...t,
                  gif_key: t.gif_key || DEFAULT_SETTINGS.sound_tiers[i]?.gif_key || "coin",
                }))
              : DEFAULT_SETTINGS.sound_tiers,
            coin_sound_key: d.coin_sound_key || DEFAULT_SETTINGS.coin_sound_key,
            coin_sound_url: d.coin_sound_url || undefined,
            mediashare_enabled: d.mediashare_enabled ?? true,
            mediashare_min_donation: d.mediashare_min_donation !== undefined ? parseFloat(d.mediashare_min_donation) : 10000,
          })
        }
      } catch {}
      setLoading(false)
    }
    fetchSettings()
  }, [session])

  const handleSave = async () => {
    if (!session?.user?.accessToken) return
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/widget-settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.user.accessToken}` },
        body: JSON.stringify(settings)
      })
      const json = await res.json()
      if (json.success) toast.success("Pengaturan widget berhasil disimpan!")
      else toast.error("Gagal menyimpan: " + json.message)
    } catch { toast.error("Gagal terhubung ke server.") }
    setSaving(false)
  }

  const handlePreview = useCallback(() => {
    const amount = parseInt(previewAmount) || 50000
    const tier = settings.sound_tiers.find(t => amount >= t.min && (t.max === null || amount < t.max)) || settings.sound_tiers[0]

    // 1. Tampilkan card + bunyikan sound effect
    setShowAlert(true)
    playBuiltinSound(tier.sound_key)

    // Kirim test alert ke overlay via backend socket
    if (session?.user?.accessToken) {
      fetch(`${API_BASE}/widget-settings/test-alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.user.accessToken}` },
        body: JSON.stringify({
          type: previewType,
          sender_name: previewName || "Test User",
          gross_amount: amount,
          message: previewMsg,
          game_name: previewType === "MABAR" ? previewGame : undefined
        })
      }).catch(() => {})
    }

    // 2. Setelah 2 detik (sound selesai), mulai TTS
    setTimeout(() => {
      if (settings.tts_enabled && typeof window !== "undefined") {
        const prefix = tier.prefix ? `${tier.prefix}! ` : ""
        const text = previewType === "DONATION"
          ? `${prefix}Halo ${previewName}! Terima kasih atas donasi Rp ${Number(amount).toLocaleString("id-ID")}.${previewMsg ? ` Pesan: ${previewMsg}` : ""}`
          : `${prefix}Order mabar baru dari ${previewName}! Game: ${previewGame}. Harga Rp ${Number(amount).toLocaleString("id-ID")}.`
        const u = new SpeechSynthesisUtterance(text)
        u.lang = "id-ID"
        const voices = window.speechSynthesis.getVoices()
        const idVoice = voices.find(v => v.lang.startsWith("id")) || voices.find(v => v.lang.startsWith("en")) || voices[0]
        if (idVoice) u.voice = idVoice
        u.rate = settings.tts_speed
        u.pitch = settings.tts_pitch
        window.speechSynthesis.speak(u)

        // Polling: cek setiap 300ms, max 5 detik tunggu TTS mulai
        let started = false
        let polls = 0
        const iv = setInterval(() => {
          polls++
          if (window.speechSynthesis.speaking) started = true
          // TTS sudah selesai bicara
          if (started && !window.speechSynthesis.speaking) {
            clearInterval(iv)
            setTimeout(() => setShowAlert(false), (settings.alert_duration_sec || 5) * 1000)
          }
          // TTS gagal start dalam 5 detik → langsung hide
          if (!started && polls > 16) {
            clearInterval(iv)
            setTimeout(() => setShowAlert(false), (settings.alert_duration_sec || 5) * 1000)
          }
        }, 300)
      } else {
        setTimeout(() => setShowAlert(false), (settings.alert_duration_sec || 5) * 1000)
      }
    }, 2000)
  }, [previewType, previewName, previewAmount, previewMsg, previewGame, settings, session])

  const handleUploadSound = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const formData = new FormData(); formData.append("sound", file)
    try {
      const res = await fetch(`${API_BASE}/widget-settings/upload-sound`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${session?.user?.accessToken}` },
        body: formData
      })
      const json = await res.json()
      if (json.success) {
        setSettings(s => ({ ...s, coin_sound_key: "custom", coin_sound_url: `${BACKEND_URL}${json.url}` }))
        toast.success("Sound berhasil diupload!")
      }
    } catch { toast.error("Gagal upload sound.") }
  }

  const updateTier = (i: number, field: keyof SoundTier, value: any) => {
    setSettings(s => {
      const tiers = [...(s.sound_tiers as SoundTier[])]
      tiers[i] = { ...tiers[i], [field]: value }
      return { ...s, sound_tiers: tiers }
    })
  }

  const cls = "!h-full font-black italic !text-xs tracking-wider !rounded-2xl shrink-0 !px-8 data-active:!bg-[#FFD551] data-active:!text-black data-[state=active]:!bg-[#FFD551] data-[state=active]:!text-black transition-all cursor-pointer"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black italic uppercase tracking-tighter">🎨 Widget Studio</h2>
          <p className="text-xs text-slate-500 font-bold mt-0.5 dark:text-zinc-400">Kustomisasi tampilan & suara alert OBS overlay Anda</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-black text-[#FFD551] font-black italic text-xs h-10 px-6 rounded-xl hover:bg-slate-900 dark:bg-[#FFD551] dark:text-black">
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1.5" /> Simpan Semua</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT — Settings */}
        <div className="space-y-5">

          {/* 1. Alert Colors */}
          <div className="p-5 bg-white border border-slate-200/80 rounded-3xl space-y-4 dark:bg-[#1C1C1C] dark:border-zinc-800">
            <p className="font-black italic text-xs uppercase tracking-widest text-slate-600 dark:text-zinc-400">🎨 Warna Alert Card</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Warna Donasi</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={settings.color_donation} onChange={e => setSettings(s => ({ ...s, color_donation: e.target.value }))} className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent" />
                  <span className="text-xs font-bold text-slate-500">{settings.color_donation}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Warna Mabar</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={settings.color_mabar} onChange={e => setSettings(s => ({ ...s, color_mabar: e.target.value }))} className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent" />
                  <span className="text-xs font-bold text-slate-500">{settings.color_mabar}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. TTS Settings */}
          <div className="p-5 bg-white border border-slate-200/80 rounded-3xl space-y-4 dark:bg-[#1C1C1C] dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <p className="font-black italic text-xs uppercase tracking-widest text-slate-600 dark:text-zinc-400">🔊 Bot TTS (Text-to-Speech)</p>
              <Switch checked={settings.tts_enabled} onCheckedChange={v => setSettings(s => ({ ...s, tts_enabled: v }))} />
            </div>
            {settings.tts_enabled && (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Kecepatan Bicara</Label>
                    <span className="text-[10px] font-black text-slate-400">{settings.tts_speed.toFixed(1)}x</span>
                  </div>
                  <input type="range" min="0.5" max="2" step="0.1" value={settings.tts_speed} onChange={e => setSettings(s => ({ ...s, tts_speed: parseFloat(e.target.value) }))} className="w-full accent-black dark:accent-[#FFD551]" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pitch Suara</Label>
                    <span className="text-[10px] font-black text-slate-400">{settings.tts_pitch.toFixed(1)}</span>
                  </div>
                  <input type="range" min="0.5" max="2" step="0.1" value={settings.tts_pitch} onChange={e => setSettings(s => ({ ...s, tts_pitch: parseFloat(e.target.value) }))} className="w-full accent-black dark:accent-[#FFD551]" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Durasi Alert Setelah TTS (detik)</Label>
                    <span className="text-[10px] font-black text-slate-400">{settings.alert_duration_sec}s</span>
                  </div>
                  <input type="range" min="2" max="15" step="1" value={settings.alert_duration_sec} onChange={e => setSettings(s => ({ ...s, alert_duration_sec: parseInt(e.target.value) }))} className="w-full accent-black dark:accent-[#FFD551]" />
                </div>
              </div>
            )}
          </div>

          {/* 3. Fitur Mediashare Settings */}
          <div className="p-5 bg-white border border-slate-200/80 rounded-3xl space-y-4 dark:bg-[#1C1C1C] dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <p className="font-black italic text-xs uppercase tracking-widest text-slate-600 dark:text-zinc-400">📺 Fitur Mediashare (YouTube Video)</p>
              <Switch checked={settings.mediashare_enabled} onCheckedChange={v => setSettings(s => ({ ...s, mediashare_enabled: v }))} />
            </div>
            {settings.mediashare_enabled && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Minimal Donasi untuk Mediashare (Rp)</Label>
                  <input 
                    type="text"
                    value={formatNumberInput(settings.mediashare_min_donation ?? 0)}
                    onChange={e => setSettings(s => ({ ...s, mediashare_min_donation: parseNumberInput(e.target.value) || 0 }))}
                    placeholder="15.000"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-bold dark:bg-[#262626] dark:border-zinc-700 dark:text-white outline-none bg-transparent"
                  />
                  <p className="text-[9px] font-bold text-slate-400 uppercase italic">Fans hanya bisa menyertakan link video YouTube jika nominal donasi sama dengan atau melebihi batas ini.</p>
                </div>
              </div>
            )}
          </div>

          {/* 3. Sound Tiers */}
          <div className="p-5 bg-white border border-slate-200/80 rounded-3xl space-y-4 dark:bg-[#1C1C1C] dark:border-zinc-800">
            <p className="font-black italic text-xs uppercase tracking-widest text-slate-600 dark:text-zinc-400">💰 Tier Suara Berdasarkan Nominal</p>
            <div className="space-y-3">
              {(settings.sound_tiers as SoundTier[]).map((tier, i) => (
                <div key={i} className="p-3 rounded-2xl border border-slate-100 dark:border-zinc-800 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 w-14 flex-shrink-0">Tier {i + 1}</span>
                    <span className="text-[10px] font-bold text-slate-500">
                      Rp {tier.min.toLocaleString("id-ID")} – {tier.max ? `Rp ${tier.max.toLocaleString("id-ID")}` : "∞"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Kata Pembuka</Label>
                      <input value={tier.prefix} onChange={e => updateTier(i, "prefix", e.target.value)} placeholder={i === 0 ? "(kosong)" : "Wow"} className="w-full h-8 px-2.5 rounded-xl border border-slate-200 text-xs font-bold dark:bg-[#262626] dark:border-zinc-700 dark:text-white outline-none" />
                    </div>
                    <div>
                      <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Sound</Label>
                      <select value={tier.sound_key} onChange={e => updateTier(i, "sound_key", e.target.value)} className="w-full h-8 px-2 rounded-xl border border-slate-200 text-xs font-bold dark:bg-[#262626] dark:border-zinc-700 dark:text-white outline-none bg-white">
                        {BUILTIN_SOUNDS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">GIF Alert</Label>
                      <select value={tier.gif_key || "coin"} onChange={e => updateTier(i, "gif_key", e.target.value)} className="w-full h-8 px-2 rounded-xl border border-slate-200 text-xs font-bold dark:bg-[#262626] dark:border-zinc-700 dark:text-white outline-none bg-white">
                        {BUILTIN_GIFS.map(g => <option key={g.key} value={g.key}>{g.label}</option>)}
                        {tier.gif_url && <option value="custom">🖼️ Custom Upload</option>}
                      </select>
                    </div>
                  </div>
                  {/* GIF Preview + Upload Custom */}
                  {(() => {
                    const gifSrc = tier.gif_key === "custom" && tier.gif_url
                      ? tier.gif_url
                      : BUILTIN_GIFS.find(g => g.key === (tier.gif_key || "coin"))?.file
                    return (
                      <div className="flex items-center gap-3 flex-wrap">
                        {gifSrc && (
                          <img src={gifSrc} alt="GIF Preview" className="w-14 h-14 object-contain rounded-xl bg-black/5 dark:bg-white/5 border border-slate-200/50 dark:border-zinc-700 p-1" />
                        )}
                        <div className="flex flex-col gap-1.5">
                          <button onClick={() => playBuiltinSound(tier.sound_key)} className="flex items-center gap-1 text-[9px] font-black uppercase text-slate-400 hover:text-black active:scale-95 transition-all">
                            <Play className="h-2.5 w-2.5" /> Test Suara
                          </button>
                          {/* Upload custom GIF per tier */}
                          <label className="flex items-center gap-1 text-[9px] font-black uppercase text-purple-500 hover:text-purple-700 cursor-pointer active:scale-95 transition-all">
                            <Upload className="h-2.5 w-2.5" /> Upload GIF Custom
                            <input type="file" accept=".gif,.png,.webp" className="hidden" onChange={async (e) => {
                              const file = e.target.files?.[0]; if (!file) return
                              if (file.size > 5 * 1024 * 1024) { toast.error("File terlalu besar! Max 5MB."); return }
                              const formData = new FormData(); formData.append("gif", file)
                              try {
                                const res = await fetch(`${API_BASE}/widget-settings/upload-gif`, {
                                  method: "POST",
                                  headers: { "Authorization": `Bearer ${session?.user?.accessToken}` },
                                  body: formData
                                })
                                const json = await res.json()
                                if (json.success) {
                                  const fullUrl = `${BACKEND_URL}${json.url}`
                                  setSettings(s => {
                                    const tiers = [...(s.sound_tiers as SoundTier[])]
                                    tiers[i] = { ...tiers[i], gif_key: "custom", gif_url: fullUrl }
                                    return { ...s, sound_tiers: tiers }
                                  })
                                  toast.success(`GIF Tier ${i + 1} berhasil diupload!`)
                                }
                              } catch { toast.error("Gagal upload GIF.") }
                              e.target.value = ""
                            }} />
                          </label>
                        </div>
                        {tier.gif_key === "custom" && tier.gif_url && (
                          <button
                            onClick={() => {
                              setSettings(s => {
                                const tiers = [...(s.sound_tiers as SoundTier[])]
                                tiers[i] = { ...tiers[i], gif_key: DEFAULT_SETTINGS.sound_tiers[i]?.gif_key || "coin", gif_url: null }
                                return { ...s, sound_tiers: tiers }
                              })
                              toast.success("GIF direset ke default.")
                            }}
                            className="flex items-center gap-1 text-[9px] font-black uppercase text-red-400 hover:text-red-600 active:scale-95 transition-all"
                          >
                            <RefreshCw className="h-2.5 w-2.5" /> Reset
                          </button>
                        )}
                      </div>
                    )
                  })()}
                </div>
              ))}
            </div>

            {/* Upload Custom Sound */}
            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Upload Sound Custom (.mp3/.wav, max 3MB)</p>
              <input ref={uploadRef} type="file" accept=".mp3,.wav,.ogg" onChange={handleUploadSound} className="hidden" />
              <Button variant="outline" onClick={() => uploadRef.current?.click()} className="h-9 rounded-xl text-xs font-black italic border-dashed">
                <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload Sound
              </Button>
              {settings.coin_sound_url && (
                <p className="text-[9px] text-emerald-500 font-bold mt-1.5">✓ Sound custom terupload</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — Live Preview */}
        <div className="space-y-5">
          <div className="p-5 bg-white border border-slate-200/80 rounded-3xl space-y-4 dark:bg-[#1C1C1C] dark:border-zinc-800">
            <p className="font-black italic text-xs uppercase tracking-widest text-slate-600 dark:text-zinc-400">👁️ Preview Real-time</p>

            {/* Type toggle */}
            <div className="flex rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-700">
              {(["DONATION", "MABAR"] as const).map(t => (
                <button key={t} onClick={() => setPreviewType(t)} className="flex-1 py-2 text-[10px] font-black uppercase transition-all"
                  style={{ background: previewType === t ? "#000" : "transparent", color: previewType === t ? "#FFD551" : undefined }}>
                  {t === "DONATION" ? "💛 Donasi" : "🎮 Mabar"}
                </button>
              ))}
            </div>

            {/* Preview form */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Nama</Label>
                <input value={previewName} onChange={e => setPreviewName(e.target.value)} className="w-full h-8 px-2.5 rounded-xl border border-slate-200 text-xs font-bold dark:bg-[#262626] dark:border-zinc-700 dark:text-white outline-none" />
              </div>
              <div>
                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Nominal (Rp)</Label>
                <input type="number" value={previewAmount} onChange={e => setPreviewAmount(e.target.value)} className="w-full h-8 px-2.5 rounded-xl border border-slate-200 text-xs font-bold dark:bg-[#262626] dark:border-zinc-700 dark:text-white outline-none" />
              </div>
              {previewType === "MABAR" && (
                <div>
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Game</Label>
                  <input value={previewGame} onChange={e => setPreviewGame(e.target.value)} className="w-full h-8 px-2.5 rounded-xl border border-slate-200 text-xs font-bold dark:bg-[#262626] dark:border-zinc-700 dark:text-white outline-none" />
                </div>
              )}
              <div className={previewType === "MABAR" ? "" : "col-span-2"}>
                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Pesan</Label>
                <input value={previewMsg} onChange={e => setPreviewMsg(e.target.value)} className="w-full h-8 px-2.5 rounded-xl border border-slate-200 text-xs font-bold dark:bg-[#262626] dark:border-zinc-700 dark:text-white outline-none" />
              </div>
            </div>

            {/* Tier info */}
            {(() => {
              const amt = parseInt(previewAmount) || 0
              const tier = (settings.sound_tiers as SoundTier[]).find(t => amt >= t.min && (t.max === null || amt < t.max))
              return tier ? (
                <div className="px-3 py-2 rounded-xl text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  💰 Tier aktif: {tier.prefix ? `"${tier.prefix}!"` : "(tanpa pembuka)"} · Sound: {BUILTIN_SOUNDS.find(s => s.key === tier.sound_key)?.label}
                </div>
              ) : null
            })()}

            {/* Live card preview — animasi muncul/hilang */}
            <div className="min-h-[100px] flex items-center justify-center">
              {showAlert ? (
                <motion.div
                  initial={{ y: 30, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -20, opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="w-full"
                >
                  <AlertPreviewCard
                    type={previewType}
                    color={previewType === "DONATION" ? settings.color_donation : settings.color_mabar}
                    name={previewName} amount={parseInt(previewAmount) || 50000}
                    message={previewMsg} game={previewGame}
                    gifSrc={(() => {
                      const amt = parseInt(previewAmount) || 0
                      const tier = (settings.sound_tiers as SoundTier[]).find(t => amt >= t.min && (t.max === null || amt < t.max))
                      if (!tier) return BUILTIN_GIFS[0]?.file
                      if (tier.gif_key === "custom" && tier.gif_url) return tier.gif_url
                      return BUILTIN_GIFS.find(g => g.key === (tier.gif_key || "coin"))?.file || ""
                    })()}
                  />
                </motion.div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-[10px] text-slate-400 font-bold italic">Klik tombol test di bawah untuk melihat preview alert</p>
                </div>
              )}
            </div>

            <Button onClick={handlePreview} disabled={showAlert} className="w-full h-11 rounded-2xl font-black italic text-xs bg-black text-[#FFD551] hover:bg-slate-900 dark:bg-[#FFD551] dark:text-black disabled:opacity-50">
              <Play className="h-4 w-4 mr-2" /> {showAlert ? "⏳ Sedang memutar..." : "Test Alert + Suara + TTS"}
            </Button>
          </div>

          {/* OBS URL */}
          <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-3xl space-y-4 dark:bg-zinc-900/40 dark:border-zinc-800/80 shadow-inner">
            <p className="font-black italic text-xs uppercase tracking-wider text-black dark:text-[#FFD551] flex items-center gap-1.5">
              🔌 URL Widget OBS Studio
            </p>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-400">🔗 Gabungan Alert URL (Bawaan)</Label>
                <div className="flex gap-2">
                  <input 
                    readOnly 
                    value={widgetUrl} 
                    className="flex-1 h-9 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 bg-white dark:bg-[#262626] dark:border-zinc-700 dark:text-zinc-300 outline-none select-all font-mono" 
                  />
                  <Button 
                    size="sm" 
                    onClick={() => { navigator.clipboard.writeText(widgetUrl); toast.success("Widget Gabungan Alert URL berhasil disalin!") }} 
                    className="h-9 px-4 rounded-xl font-black italic text-[10px] bg-[#FFD551] text-black hover:bg-[#FFC83B] transition-all shadow-sm shrink-0 border-none"
                  >
                    Salin
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-400">🔗 Hanya Donasi & Mabar Alert URL (Terpisah)</Label>
                <div className="flex gap-2">
                  <input 
                    readOnly 
                    value={`${widgetUrl}?excludeCall=true`} 
                    className="flex-1 h-9 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 bg-white dark:bg-[#262626] dark:border-zinc-700 dark:text-zinc-300 outline-none select-all font-mono" 
                  />
                  <Button 
                    size="sm" 
                    onClick={() => { navigator.clipboard.writeText(`${widgetUrl}?excludeCall=true`); toast.success("Widget Donasi & Mabar Alert URL berhasil disalin!") }} 
                    className="h-9 px-4 rounded-xl font-black italic text-[10px] bg-black hover:bg-zinc-900 text-[#FFD551] dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-[#FFD551] transition-all shadow-sm shrink-0 border-none"
                  >
                    Salin
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-400">🔗 Hanya Panggilan Mabar Alert URL (Terpisah)</Label>
                <div className="flex gap-2">
                  <input 
                    readOnly 
                    value={`${widgetUrl}?onlyCall=true`} 
                    className="flex-1 h-9 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 bg-white dark:bg-[#262626] dark:border-zinc-700 dark:text-zinc-300 outline-none select-all font-mono" 
                  />
                  <Button 
                    size="sm" 
                    onClick={() => { navigator.clipboard.writeText(`${widgetUrl}?onlyCall=true`); toast.success("Widget Panggilan Mabar Alert URL berhasil disalin!") }} 
                    className="h-9 px-4 rounded-xl font-black italic text-[10px] bg-[#FFD551] text-black hover:bg-[#FFC83B] transition-all shadow-sm shrink-0 border-none"
                  >
                    Salin
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-2.5 pt-2 border-t border-slate-200/60 dark:border-zinc-800/80">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Langkah Pemasangan OBS:</p>
              <div className="space-y-2 text-xs font-semibold italic text-slate-500 dark:text-zinc-400 leading-normal">
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-md bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black font-black text-[9px] shrink-0">1</span>
                  <span>Salin URL widget di atas dengan menekan tombol <strong className="text-black dark:text-white">Salin</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-md bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black font-black text-[9px] shrink-0">2</span>
                  <span>Buka <strong className="text-black dark:text-white">OBS Studio</strong> &rarr; klik ikon <code className="bg-[#FFD551] text-black px-1.5 py-0.5 rounded font-black dark:text-black text-[10px]">+</code> &rarr; pilih <code className="bg-[#FFD551] text-black px-1.5 py-0.5 rounded font-black dark:text-black text-[10px]">Browser Source</code>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-md bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black font-black text-[9px] shrink-0">3</span>
                  <span>Paste URL ke kolom URL &rarr; Set lebar (<strong className="text-emerald-500">Width</strong>) ke <code className="bg-black/5 px-1 py-0.5 rounded font-black text-[10px]">1920</code> & tinggi (<strong className="text-emerald-500">Height</strong>) ke <code className="bg-black/5 px-1 py-0.5 rounded font-black text-[10px]">1080</code>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-md bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black font-black text-[9px] shrink-0">4</span>
                  <span>Centang <strong className="text-black dark:text-white">Control audio via OBS</strong> / pastikan volume source di-unmute agar suara TTS terdengar jelas!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
