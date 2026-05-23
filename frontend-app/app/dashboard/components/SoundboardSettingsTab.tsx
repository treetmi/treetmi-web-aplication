"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { fetchWithRetry, API_BASE_URL } from "@/lib/api"
import { Switch } from "@/components/ui/switch"
import { Loader2, Save, Music, Plus, Trash2, Play, Square, Upload } from "lucide-react"
import { formatNumberInput, parseNumberInput } from "@/lib/utils"

interface SoundItem {
  id?: string
  name: string
  sound_url: string
  price: number
  is_active: boolean
  fileName?: string // client-only info for displaying chosen file
}

export default function SoundboardSettingsTab() {
  const { data: session } = useSession()
  const [sounds, setSounds] = useState<SoundItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [playingId, setPlayingId] = useState<string | number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // @ts-ignore
    if (session?.user?.accessToken) {
      fetchSounds()
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [session])

  const fetchSounds = async () => {
    try {
      // @ts-ignore
      const token = session?.user?.accessToken
      const res = await fetchWithRetry(`${API_BASE_URL}/users/soundboard`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setSounds(json.data)
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal mengambil data Soundboard")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlaySound = (url: string, id: string | number) => {
    if (!url) {
      toast.error("File audio belum diunggah.")
      return
    }

    if (playingId === id) {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      setPlayingId(null)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
    }

    const audio = new Audio(url)
    audioRef.current = audio
    setPlayingId(id)
    audio.volume = 0.6
    audio.play().catch(e => {
      console.warn("Playback error:", e)
      toast.error("Gagal memutar audio.")
      setPlayingId(null)
    })

    audio.onended = () => {
      setPlayingId(null)
    }
  }

  const handleAddSound = () => {
    if (sounds.length >= 15) {
      toast.error("Maksimal 15 item pada Soundboard.")
      return
    }
    setSounds(prev => [
      ...prev,
      { name: "Suara Baru", sound_url: "", price: 2000, is_active: true }
    ])
  }

  const handleRemoveSound = (index: number) => {
    setSounds(prev => prev.filter((_, i) => i !== index))
  }

  const handleSoundChange = (index: number, field: keyof SoundItem, value: any) => {
    setSounds(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
  }

  const handleFileChange = (index: number, file: File) => {
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file audio maksimal adalah 2MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      handleSoundChange(index, "sound_url", base64)
      handleSoundChange(index, "fileName", file.name)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    // Validation
    const invalidSound = sounds.find(s => !s.name.trim() || !s.sound_url)
    if (invalidSound) {
      toast.error("Semua sound harus memiliki nama dan file audio yang diunggah.")
      setIsSaving(false)
      return
    }

    try {
      // @ts-ignore
      const token = session?.user?.accessToken
      const res = await fetchWithRetry(`${API_BASE_URL}/users/soundboard`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          sounds: sounds.map(s => ({
            id: s.id,
            name: s.name.trim(),
            sound_url: s.sound_url,
            price: Number(s.price) || 2000,
            is_active: s.is_active
          }))
        })
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Soundboard berhasil diperbarui!")
        setSounds(json.data)
      } else {
        throw new Error(json.message || "Gagal menyimpan")
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-zinc-500" /></div>
  }

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
        <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
          <CardTitle className="font-black italic text-sm md:text-base tracking-wider text-black dark:text-[#FFD551] flex items-center gap-2">
            <Music className="h-5 w-5 text-[#FFD551]" /> Soundboard Interaktif
          </CardTitle>
          <CardDescription className="font-bold italic text-[11px] md:text-xs text-slate-400">
            Unggah efek suara kustom (meme, sound effect, jingle) yang bisa diputar penonton saat berdonasi.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSave} className="space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-black italic text-sm text-black dark:text-white">Daftar Suara Aktif</Label>
                <p className="text-[10px] font-bold text-slate-400 italic">Maksimal 15 efek suara aktif.</p>
              </div>
              <Button
                type="button"
                onClick={handleAddSound}
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-black italic rounded-xl text-xs px-4 animate-pulse"
              >
                <Plus className="h-4 w-4 mr-1" /> Tambah Suara
              </Button>
            </div>

            {sounds.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 bg-slate-50 dark:bg-zinc-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
                <Music className="h-8 w-8 text-slate-300 dark:text-zinc-700 mb-2" />
                <p className="text-xs font-bold text-slate-400 italic">Belum ada suara ditambahkan.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sounds.map((sound, idx) => (
                  <div key={sound.id || idx} className={`flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-2xl border transition-all ${sound.is_active ? 'bg-[#FAF9F6] dark:bg-[#1E1E1D]/55 border-slate-200/60 dark:border-zinc-800/80' : 'bg-slate-50/50 dark:bg-zinc-900/20 border-slate-100 dark:border-zinc-900 opacity-60'}`}>
                    
                    {/* Play/Stop button */}
                    <div className="shrink-0">
                      <Button
                        type="button"
                        onClick={() => handlePlaySound(sound.sound_url, sound.id || idx)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center p-0 ${playingId === (sound.id || idx) ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-[#FFD551] text-black hover:bg-[#FFC83B]'}`}
                      >
                        {playingId === (sound.id || idx) ? <Square className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-black ml-0.5" />}
                      </Button>
                    </div>

                    {/* Sound Name */}
                    <div className="flex-1 space-y-1">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase italic">Nama Suara</Label>
                      <Input
                        type="text"
                        value={sound.name}
                        onChange={(e) => handleSoundChange(idx, "name", e.target.value)}
                        placeholder="Nama Sound Effect"
                        className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 font-bold"
                      />
                    </div>

                    {/* Sound Price */}
                    <div className="w-full md:w-36 space-y-1">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase italic">Harga Pemicu (Rp)</Label>
                      <Input
                        type="text"
                        value={formatNumberInput(sound.price)}
                        onChange={(e) => handleSoundChange(idx, "price", parseNumberInput(e.target.value) || 2000)}
                        placeholder="2.000"
                        className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 font-bold"
                      />
                    </div>

                    {/* Upload File Input */}
                    <div className="w-full md:w-56 space-y-1">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase italic">Berkas Audio (mp3/wav/ogg)</Label>
                      <div className="relative flex items-center">
                        <Input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileChange(idx, file)
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-300 font-bold justify-start overflow-hidden text-ellipsis whitespace-nowrap"
                        >
                          <Upload className="h-4 w-4 mr-2 text-[#FFD551] shrink-0" />
                          {sound.fileName || (sound.sound_url ? "Ganti Audio (Sudah Ada)" : "Pilih File Audio...")}
                        </Button>
                      </div>
                    </div>

                    {/* Toggle and Delete */}
                    <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs font-bold text-slate-400 italic">Aktif</Label>
                        <Switch
                          checked={sound.is_active}
                          onCheckedChange={(val) => handleSoundChange(idx, "is_active", val)}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleRemoveSound(idx)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10 p-2 h-10 w-10 rounded-xl"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>

                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-zinc-900">
              <Button
                type="submit"
                disabled={isSaving}
                className="h-12 bg-[#FFD551] text-black hover:bg-[#FFC83B] rounded-2xl font-black italic text-xs md:text-sm px-8 shadow-sm transition-all"
              >
                {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                Simpan List Soundboard
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}
