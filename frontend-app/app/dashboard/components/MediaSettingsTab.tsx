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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save, Mic, Gamepad2, Volume2, Gift, Sparkles } from "lucide-react"
import { formatNumberInput, parseNumberInput } from "@/lib/utils"

const API_BASE = API_BASE_URL

export default function MediaSettingsTab() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Gift Animasi States
  const [systemGifts, setSystemGifts] = useState<any[]>([])
  const [giftSaving, setGiftSaving] = useState<Record<string, boolean>>({})

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
      // After loading main settings, also load gift settings
      fetchGiftSettings()
    }
  }

  const fetchGiftSettings = async () => {
    try {
      // @ts-ignore
      const token = session?.user?.accessToken
      if (!token) return
      const res = await fetchWithRetry(`${API_BASE}/users/my-gifts`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const json = await res.json()
      if (json.success && json.data) {
        setSystemGifts(json.data)
      }
    } catch (err) {
      console.error('[fetchGiftSettings]', err)
    }
  }

  const handleToggleGift = async (giftId: string, currentValue: boolean) => {
    setGiftSaving(prev => ({ ...prev, [giftId]: true }))
    try {
      // @ts-ignore
      const token = session?.user?.accessToken
      const res = await fetchWithRetry(`${API_BASE}/users/my-gifts/${giftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isEnabled: !currentValue })
      })
      const json = await res.json()
      if (json.success) {
        setSystemGifts(prev => prev.map(g => g.id === giftId ? { ...g, isEnabled: !currentValue } : g))
        toast.success(json.message)
      } else {
        toast.error(json.message || 'Gagal mengubah status gift.')
      }
    } catch {
      toast.error('Gagal menghubungkan ke server.')
    } finally {
      setGiftSaving(prev => ({ ...prev, [giftId]: false }))
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
    // IG Reels saat ini Coming Soon → jangan pernah update state dari UI
    if (field === 'reels_toggle') return
    setSettings((prev: any) => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-zinc-500" /></div>
  }

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
        <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
          <CardTitle className="font-black italic text-sm md:text-base tracking-wider text-black dark:text-[#FFD551] flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-[#FFD551]" /> Pengaturan Media Interaktif
          </CardTitle>
          <CardDescription className="font-bold italic text-[11px] md:text-xs text-slate-400">
            Konfigurasikan notifikasi media, voice note, dan mini-games di overlay layar stream Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="media" className="w-full">
            <TabsList className="mb-6 h-11 w-full justify-start rounded-2xl bg-slate-100 p-1 dark:bg-zinc-900">
              <TabsTrigger value="media" className="h-9 rounded-xl px-4 text-[11px] font-black uppercase italic">
                <Volume2 className="h-4 w-4" /> Media Interaktif
              </TabsTrigger>
              <TabsTrigger value="gifts" className="h-9 rounded-xl px-4 text-[11px] font-black uppercase italic">
                <Gift className="h-4 w-4" /> Gift Animasi
              </TabsTrigger>
            </TabsList>

            <TabsContent value="media">
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
                {/* Fitur Mediashare Link */}
                <div className="p-5 bg-slate-50 dark:bg-zinc-900/40 rounded-3xl border border-slate-200 dark:border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-black italic text-xs md:text-sm text-black dark:text-white">Fitur Mediashare Link</Label>
                      <p className="text-[10px] font-bold text-slate-400 italic">Izinkan fans menyertakan link video (YouTube / TikTok / Reels) saat berdonasi</p>
                    </div>
                    <Switch
                      checked={settings.mediashare_enabled}
                      onCheckedChange={(val) => handleChange('mediashare_enabled', val)}
                    />
                  </div>
                  {settings.mediashare_enabled && (
                    <div className="space-y-2 pt-2 border-t border-slate-200/50 dark:border-zinc-800">
                      <Label className="font-bold text-xs md:text-sm">Minimal Donasi untuk Mediashare (Rp)</Label>
                      <Input
                        type="text"
                        value={formatNumberInput(settings.mediashare_min_donation ?? 0)}
                        onChange={(e) => handleChange('mediashare_min_donation', parseNumberInput(e.target.value) || 0)}
                        placeholder="15.000"
                        className="bg-[#FAF9F6] dark:bg-[#1E1E1D] font-bold"
                      />
                      <p className="text-[9px] font-bold text-slate-400 uppercase italic">Fans hanya bisa menyertakan link video jika nominal donasi sama dengan atau melebihi batas ini.</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-2xl border border-slate-200 dark:border-zinc-800">
                  <div className="space-y-1">
                    <Label className="font-black italic text-sm text-black dark:text-white">Filter Kata Kasar (Profanity Filter)</Label>
                    <p className="text-[11px] font-bold text-slate-400">Otomatis mensensor kata tidak pantas di TTS.</p>
                  </div>
                  <Switch
                    checked={settings.profanity_filter}
                    onCheckedChange={(val) => handleChange('profanity_filter', val)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-zinc-900 pt-4">
                  {/* YouTube Toggle */}
                  <div className="flex items-center justify-between p-4 bg-[#FAF9F6] dark:bg-[#1E1E1D]/55 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 hover:border-[#FFD551]/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500/10 rounded-xl shrink-0">
                        <img src="/icon/youtube-icon.svg" className="h-6 w-6 object-contain" alt="YouTube" />
                      </div>
                      <div>
                        <Label className="font-black italic text-xs md:text-sm text-black dark:text-white cursor-pointer">Video YouTube</Label>
                        <p className="text-[10px] font-bold text-slate-400 italic">Putar link YouTube yang didonasikan fans</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.youtube_toggle}
                      onCheckedChange={(val) => handleChange('youtube_toggle', val)}
                    />
                  </div>

                  {/* TikTok Toggle */}
                  <div className="flex items-center justify-between p-4 bg-[#FAF9F6] dark:bg-[#1E1E1D]/55 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 hover:border-[#FFD551]/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-teal-500/10 rounded-xl shrink-0">
                        <img src="/icon/tiktok-icon.svg" className="h-6 w-6 object-contain" alt="TikTok" />
                      </div>
                      <div>
                        <Label className="font-black italic text-xs md:text-sm text-black dark:text-white cursor-pointer">Video TikTok</Label>
                        <p className="text-[10px] font-bold text-slate-400 italic">Tampilkan video TikTok terpopuler di stream</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.tiktok_toggle}
                      onCheckedChange={(val) => handleChange('tiktok_toggle', val)}
                    />
                  </div>

                  {/* Reels Toggle */}
                  <div className="flex items-center justify-between p-4 bg-[#FAF9F6] dark:bg-[#1E1E1D]/55 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-500/10 rounded-xl shrink-0 relative">
                        <img src="/icon/instagram-icon.svg" className="h-6 w-6 object-contain" alt="Instagram Reels" />
                        <span className="absolute -top-2 -right-2 text-[9px] font-black px-2 py-0.5 rounded-full bg-pink-500 text-white shadow-sm">Coming</span>
                      </div>
                      <div>
                        <Label className="font-black italic text-xs md:text-sm text-black/70 dark:text-white/70">IG Reels</Label>
                        <p className="text-[10px] font-bold text-slate-400 italic">Coming Soon — IG Reels belum bisa diaktifkan</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black italic bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-200/60 dark:border-pink-900/40 px-2.5 py-1 rounded-full">
                        Coming Soon
                      </span>
                      <Switch checked={false} disabled />
                    </div>
                  </div>

                  {/* Tebak Gambar Toggle */}
                  <div className="flex items-center justify-between p-4 bg-[#FAF9F6] dark:bg-[#1E1E1D]/55 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 hover:border-[#FFD551]/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                        <Gamepad2 className="h-5 w-5" />
                      </div>
                      <div>
                        <Label className="font-black italic text-xs md:text-sm text-black dark:text-white cursor-pointer">Tebak Gambar</Label>
                        <p className="text-[10px] font-bold text-slate-400 italic">Aktifkan mini-game tebak gambar interaktif</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.tebak_gambar_toggle}
                      onCheckedChange={(val) => handleChange('tebak_gambar_toggle', val)}
                    />
                  </div>

                  {/* Voice Note Toggle */}
                  <div className="flex items-center justify-between p-4 bg-[#FAF9F6] dark:bg-[#1E1E1D]/55 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 hover:border-[#FFD551]/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                        <Mic className="h-5 w-5" />
                      </div>
                      <div>
                        <Label className="font-black italic text-xs md:text-sm text-black dark:text-white cursor-pointer">Voice Note Audio</Label>
                        <p className="text-[10px] font-bold text-slate-400 italic">Putar pesan suara (VN) yang dikirim penonton</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.voice_note_toggle}
                      onCheckedChange={(val) => handleChange('voice_note_toggle', val)}
                    />
                  </div>

                  {/* Gift Toggle */}
                  <div className="flex items-center justify-between p-4 bg-[#FAF9F6] dark:bg-[#1E1E1D]/55 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 hover:border-[#FFD551]/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[#FFD551]/20 text-amber-500 shrink-0">
                        <Gift className="h-5 w-5" />
                      </div>
                      <div>
                        <Label className="font-black italic text-xs md:text-sm text-black dark:text-white cursor-pointer">Gift Animasi Live</Label>
                        <p className="text-[10px] font-bold text-slate-400 italic">Tampilkan pilihan gift animasi di halaman donasi</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.gift_toggle ?? true}
                      onCheckedChange={(val) => handleChange('gift_toggle', val)}
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
            </TabsContent>

            <TabsContent value="gifts" className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#FFD551]/20 rounded-xl shrink-0">
                  <Gift className="h-4 w-4 text-[#FFD551]" />
                </div>
                <div>
                  <Label className="font-black italic text-xs md:text-sm text-black dark:text-white">Pengaturan Gift Animasi Live</Label>
                  <p className="text-[10px] font-bold text-slate-400 italic">Aktifkan atau nonaktifkan gift animasi GIF di halaman donasi channel Anda.</p>
                </div>
              </div>

              {systemGifts.length === 0 ? (
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-2xl border border-slate-200 dark:border-zinc-800">
                  <Sparkles className="h-5 w-5 text-slate-300" />
                  <p className="text-[10px] font-bold text-slate-400 italic">Belum ada gift animasi yang ditambahkan oleh admin platform.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {systemGifts.map(gift => (
                    <div key={gift.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${gift.isEnabled ? 'bg-[#FAF9F6] dark:bg-[#1E1E1D]/55 border-slate-200/60 dark:border-zinc-800/80 hover:border-[#FFD551]/30' : 'bg-slate-50/50 dark:bg-zinc-900/40 border-slate-100 dark:border-zinc-900 opacity-60'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-[14px] border border-[#FFD551]/30 bg-white dark:bg-zinc-900 overflow-hidden shrink-0 flex items-center justify-center">
                          <img src={gift.url} alt={gift.name} className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <Label className="font-black italic text-xs text-black dark:text-white cursor-pointer">{gift.name}</Label>
                          <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Rp {gift.price.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                      <Switch
                        checked={gift.isEnabled}
                        disabled={giftSaving[gift.id]}
                        onCheckedChange={() => handleToggleGift(gift.id, gift.isEnabled)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
