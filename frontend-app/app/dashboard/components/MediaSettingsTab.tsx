"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { fetchWithRetry, API_BASE_URL } from "@/lib/api"
import { Switch } from "@/components/ui/switch"
import { Loader2, Save } from "lucide-react"

const API_BASE = API_BASE_URL

export default function MediaSettingsTab() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // @ts-ignore
    if (session?.user?.accessToken) {
      fetchSettings()
    }
  }, [session])

  const fetchSettings = async () => {
    try {
      // @ts-ignore
      const res = await fetchWithRetry(`${API_BASE}/users/media-settings`, {
        // @ts-ignore
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      const json = await res.json()
      if (json.success && json.data) {
        setSettings(json.data)
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal mengambil data pengaturan media")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetchWithRetry(`${API_BASE}/users/media-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // @ts-ignore
          Authorization: `Bearer ${session?.user?.accessToken}`
        },
        body: JSON.stringify(settings)
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Pengaturan media berhasil disimpan!")
        setSettings(json.data)
      } else {
        throw new Error(json.message || "Gagal menyimpan")
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan")
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-zinc-500" /></div>
  }

  if (!settings) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
          <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
            <CardTitle className="font-black italic text-sm md:text-base tracking-wider text-black dark:text-[#FFD551] flex items-center gap-2">
              🎬 Pengaturan Media Interaktif
            </CardTitle>
            <CardDescription className="font-bold italic text-[11px] md:text-xs text-slate-400">
              Konfigurasikan notifikasi media, voice note, dan mini-games di overlay layar stream Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Saklar Utama */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-2xl border border-slate-200 dark:border-zinc-800">
                <div className="space-y-1">
                  <Label className="font-black italic text-sm text-black dark:text-white">Global ON/OFF (Semua Media)</Label>
                  <p className="text-[11px] font-bold text-slate-400">Mematikan/menghidupkan seluruh fitur media interaktif (termasuk VN dan TTS).</p>
                </div>
                <Switch 
                  checked={settings.global_toggle}
                  onCheckedChange={(val) => handleChange('global_toggle', val)}
                />
              </div>

              {settings.global_toggle && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-zinc-900 pt-4">
                    {/* YouTube Toggle */}
                    <div className="flex items-center justify-between p-3 bg-[#FAF9F6] dark:bg-[#1E1E1D] rounded-xl border border-slate-200 dark:border-zinc-800">
                      <Label className="font-bold text-xs md:text-sm">Video YouTube</Label>
                      <Switch 
                        checked={settings.youtube_toggle}
                        onCheckedChange={(val) => handleChange('youtube_toggle', val)}
                      />
                    </div>

                    {/* TikTok Toggle */}
                    <div className="flex items-center justify-between p-3 bg-[#FAF9F6] dark:bg-[#1E1E1D] rounded-xl border border-slate-200 dark:border-zinc-800">
                      <Label className="font-bold text-xs md:text-sm">Video TikTok</Label>
                      <Switch 
                        checked={settings.tiktok_toggle}
                        onCheckedChange={(val) => handleChange('tiktok_toggle', val)}
                      />
                    </div>

                    {/* Reels Toggle */}
                    <div className="flex items-center justify-between p-3 bg-[#FAF9F6] dark:bg-[#1E1E1D] rounded-xl border border-slate-200 dark:border-zinc-800">
                      <Label className="font-bold text-xs md:text-sm">IG Reels</Label>
                      <Switch 
                        checked={settings.reels_toggle}
                        onCheckedChange={(val) => handleChange('reels_toggle', val)}
                      />
                    </div>

                    {/* Tebak Gambar Toggle */}
                    <div className="flex items-center justify-between p-3 bg-[#FAF9F6] dark:bg-[#1E1E1D] rounded-xl border border-slate-200 dark:border-zinc-800">
                      <Label className="font-bold text-xs md:text-sm">Tebak Gambar</Label>
                      <Switch 
                        checked={settings.tebak_gambar_toggle}
                        onCheckedChange={(val) => handleChange('tebak_gambar_toggle', val)}
                      />
                    </div>

                    {/* Voice Note Toggle */}
                    <div className="flex items-center justify-between p-3 bg-[#FAF9F6] dark:bg-[#1E1E1D] rounded-xl border border-slate-200 dark:border-zinc-800">
                      <Label className="font-bold text-xs md:text-sm">Voice Note Audio</Label>
                      <Switch 
                        checked={settings.voice_note_toggle}
                        onCheckedChange={(val) => handleChange('voice_note_toggle', val)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-zinc-900 pt-4">
                    <div className="space-y-2">
                      <Label className="font-bold text-xs md:text-sm">Max Durasi Video (Detik)</Label>
                      <Input 
                        type="number"
                        min={10}
                        max={600}
                        value={settings.max_duration}
                        onChange={(e) => handleChange('max_duration', parseInt(e.target.value))}
                        className="bg-[#FAF9F6] dark:bg-[#1E1E1D]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="font-bold text-xs md:text-sm">Min Donasi per Detik Video (Rp)</Label>
                      <Input 
                        type="number"
                        min={0}
                        value={settings.min_amount_per_second}
                        onChange={(e) => handleChange('min_amount_per_second', parseFloat(e.target.value))}
                        className="bg-[#FAF9F6] dark:bg-[#1E1E1D]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-2xl border border-slate-200 dark:border-zinc-800 border-t border-slate-100 dark:border-zinc-900 mt-4">
                    <div className="space-y-1">
                      <Label className="font-black italic text-sm text-black dark:text-white">Filter Kata Kasar (Profanity Filter)</Label>
                      <p className="text-[11px] font-bold text-slate-400">Otomatis mensensor kata tidak pantas di TTS.</p>
                    </div>
                    <Switch 
                      checked={settings.profanity_filter}
                      onCheckedChange={(val) => handleChange('profanity_filter', val)}
                    />
                  </div>

                  {/* ElevenLabs API */}
                  <div className="space-y-3 border-t border-slate-100 dark:border-zinc-900 pt-4 mt-4">
                    <div className="flex items-center justify-between">
                      <Label className="font-black italic text-xs md:text-sm">Kloning Suara Premium (ElevenLabs)</Label>
                      <Switch 
                        checked={settings.use_elevenlabs}
                        onCheckedChange={(val) => handleChange('use_elevenlabs', val)}
                      />
                    </div>
                    {settings.use_elevenlabs && (
                      <div className="space-y-2">
                        <Label className="font-bold text-[11px] md:text-xs text-slate-500">API Key ElevenLabs (Opsional)</Label>
                        <Input 
                          type="password"
                          placeholder="Kunci API ElevenLabs Anda..."
                          value={settings.elevenlabs_api_key || ""}
                          onChange={(e) => handleChange('elevenlabs_api_key', e.target.value)}
                          className="bg-[#FAF9F6] dark:bg-[#1E1E1D]"
                        />
                        <p className="text-[10px] text-slate-400 italic">Isi API key Anda jika ingin menggunakan suara ElevenLabs Anda sendiri. Jika kosong, akan menggunakan Edge-TTS bawaan gratis.</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit"
                  disabled={isSaving}
                  className="h-12 bg-[#FFD551] text-black hover:bg-[#FFC83B] rounded-2xl font-black italic text-xs md:text-sm px-8 shadow-sm transition-all"
                >
                  {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                  Simpan Pengaturan
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
