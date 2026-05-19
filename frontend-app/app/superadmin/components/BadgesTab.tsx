"use client"

import React, { useState, useEffect, useRef } from "react"
import { Search, Plus, Edit2, Trash2, Award, AlertTriangle, Sparkles, HelpCircle, Upload, FileImage } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ADMIN_API } from "@/lib/api"

export default function BadgesTab() {
  const [badges, setBadges] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // Add form state
  const [newName, setNewName] = useState("")
  const [newMinSupporters, setNewMinSupporters] = useState("0")
  const [newBadgeUrl, setNewBadgeUrl] = useState("")
  const [newBgClass, setNewBgClass] = useState("bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-200")
  const [newGlowClass, setNewGlowClass] = useState("")
  const [newIconClass, setNewIconClass] = useState("h-3.5 w-3.5 object-cover rounded-sm")

  // Edit form state
  const [selectedBadgeId, setSelectedBadgeId] = useState("")
  const [editName, setEditName] = useState("")
  const [editMinSupporters, setEditMinSupporters] = useState("0")
  const [editBadgeUrl, setEditBadgeUrl] = useState("")
  const [editBgClass, setEditBgClass] = useState("bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-200")
  const [editGlowClass, setEditGlowClass] = useState("")
  const [editIconClass, setEditIconClass] = useState("h-3.5 w-3.5 object-cover rounded-sm")

  // Delete state
  const [deleteBadgeId, setDeleteBadgeId] = useState("")
  const [deleteBadgeName, setDeleteBadgeName] = useState("")

  // File input refs
  const addFileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  // Fetch badges from API
  const fetchBadges = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(ADMIN_API.trustBadges)
      const json = await res.json()
      if (json.success) {
        setBadges(json.data || [])
      } else {
        toast.error("Gagal memuat daftar lencana kepercayaan.")
      }
    } catch (err) {
      console.error("Error loading trust badges:", err)
      toast.error("Kesalahan koneksi ke server.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBadges()
  }, [])

  // Handle local file uploads (Base64)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Allowed file types
    const allowedTypes = ["image/gif", "image/svg+xml", "image/png", "image/jpeg", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Format file tidak didukung! Pilih file GIF, SVG, PNG, JPG, atau WEBP.")
      return
    }

    // Size limit (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file terlalu besar! Maksimal 2MB.")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      if (isEdit) {
        setEditBadgeUrl(base64)
      } else {
        setNewBadgeUrl(base64)
      }
      toast.success(`Gambar lencana "${file.name}" berhasil diunggah!`)
    }
    reader.readAsDataURL(file)
  }

  // Quick Preset Handlers
  const applyPreset = (presetType: string, isEdit: boolean) => {
    const presets: Record<string, { url: string, bg: string, glow: string, icon: string }> = {
      rising: {
        url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9InB1cnBsZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5Z29uIHBvaW50cz0iMTIgMiAxNS4wOSA4LjI2IDIyIDkuMjcgMTcgMTQuMTQgMTguMTggMjEuMDIgMTIgMTcuNzcgNS44MiAyMS4wMiA3IDE0LjE0IDIgOS4yNyA4LjkxIDguMjYgMTIgMiIvPjwvc3ZnPg==',
        bg: "from-purple-500/20 to-indigo-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30",
        glow: "shadow-[0_0_8px_rgba(147,51,234,0.2)]",
        icon: "h-4 w-4 animate-pulse"
      },
      trusted: {
        url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImVtZXJhbGQiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjAgMTNjMCA1LTMuNSA3LjUtNy42NiA5LjdhMSAxIDAgMCAxLS42OCAwQzcuNSAyMC41IDQgMTggNCAxM1Y2YTEgMSAwIDAgMS43Ni0uOTdsOC0yYTEgMSAwIDAgMS40OCAwbDggMkExIDEgMCAwIDEgMjAgNnY3eiIvPjxwYXRoIGQ9Im05IDEyIDIgMiA0LTQiLz48L3N2Zz4=',
        bg: "from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
        glow: "shadow-[0_0_10px_rgba(16,185,129,0.25)]",
        icon: "h-4 w-4"
      },
      super: {
        url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXRyb3BoeSI+PHBhdGggZD0iTTUgOUg0LjVhMi41IDIuNSAwIDAgMSAwLTVINSIvPjxwYXRoIGQ9Ik0xOCA5aDEuNWEyLjUgMi41IDAgMCAwIDAtNUgxOCIvPjxwYXRoIGQ9Ik00IDIyaDE2Ii8+PHBhdGggZD0iTTEwIDE0LjY2VjE3YzAgLjU1LS40NSAxLTEgMUg0djJoMTZ2LTJoLTVjLS41NSAwLTEtLjQ1LTEtMXYtMi4zNCIvPjxwYXRoIGQ9Ik0xYiAyYTYgNiAwIDAgMSA2IDZ2MWE2IDYgMCAwIDEtNiA2IDYgNiAwIDAgMS02LTZWOGE2IDYgMCAwIDEgNi02eiIvPjwvc3ZnPg==',
        bg: "from-amber-500/25 to-yellow-500/25 text-amber-700 dark:text-amber-300 border-amber-500/40",
        glow: "shadow-[0_0_12px_rgba(245,158,11,0.35)]",
        icon: "h-4 w-4"
      },
      legend: {
        url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9InJvc2UiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNOC41IDE0LjVBMi41IDIuNSAwIDAgMCAxMSAxMmMwLTEuMzgtLjUtMi0xLTMtMS4wNzItMi4xNDMuMjI0LTQuMDU0IDItNi41IDIuNSAyIDQuOSA0IDYuNSAyIDEuNiAzIDMuNSAzIDUuNWE3IDcgMCAxIDEtMTQgMGMwLTEuMTUzLjQzMy0yLjI5NCAxLTNhMi41IDIuNSAwIDAgMCAyLjUgMi41eiIvPjwvc3ZnPg==',
        bg: "from-rose-500/25 via-pink-500/25 to-purple-500/25 text-rose-600 dark:text-rose-300 border-rose-500/40",
        glow: "shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse",
        icon: "h-4 w-4 animate-bounce"
      }
    }

    const preset = presets[presetType]
    if (!preset) return

    if (isEdit) {
      setEditBadgeUrl(preset.url)
      setEditBgClass(preset.bg)
      setEditGlowClass(preset.glow)
      setEditIconClass(preset.icon)
    } else {
      setNewBadgeUrl(preset.url)
      setNewBgClass(preset.bg)
      setNewGlowClass(preset.glow)
      setNewIconClass(preset.icon)
    }
    toast.info(`Preset styling "${presetType}" sukses diterapkan!`)
  }

  // CRUD: Add Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newBadgeUrl.trim()) {
      toast.error("Nama dan Gambar Badge wajib diisi!")
      return
    }

    try {
      const res = await fetch(ADMIN_API.trustBadges, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          min_supporters: parseInt(newMinSupporters, 10),
          badge_url: newBadgeUrl.trim(),
          bg_class: newBgClass.trim() || "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-200",
          glow_class: newGlowClass.trim(),
          icon_class: newIconClass.trim() || "h-3.5 w-3.5 object-cover rounded-sm"
        })
      })
      const data = await res.json()

      if (data.success) {
        toast.success(`Lencana "${newName}" berhasil dibuat!`)
        setIsAddOpen(false)
        // Reset form
        setNewName("")
        setNewMinSupporters("0")
        setNewBadgeUrl("")
        setNewBgClass("bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-200")
        setNewGlowClass("")
        setNewIconClass("h-3.5 w-3.5 object-cover rounded-sm")
        fetchBadges()
      } else {
        toast.error(data.message || "Gagal menambahkan lencana.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal menghubungkan ke server API.")
    }
  }

  // CRUD: Open Edit Modal
  const openEditModal = (badge: any) => {
    setSelectedBadgeId(badge.id)
    setEditName(badge.name)
    setEditMinSupporters(badge.min_supporters.toString())
    setEditBadgeUrl(badge.badge_url)
    setEditBgClass(badge.bg_class)
    setEditGlowClass(badge.glow_class || "")
    setEditIconClass(badge.icon_class || "")
    setIsEditOpen(true)
  }

  // CRUD: Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editName.trim() || !editBadgeUrl.trim()) {
      toast.error("Nama dan Gambar Badge wajib diisi!")
      return
    }

    try {
      const res = await fetch(ADMIN_API.trustBadgeById(selectedBadgeId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          min_supporters: parseInt(editMinSupporters, 10),
          badge_url: editBadgeUrl.trim(),
          bg_class: editBgClass.trim() || "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-200",
          glow_class: editGlowClass.trim(),
          icon_class: editIconClass.trim() || "h-3.5 w-3.5 object-cover rounded-sm"
        })
      })
      const data = await res.json()

      if (data.success) {
        toast.success("Lencana berhasil diperbarui!")
        setIsEditOpen(false)
        fetchBadges()
      } else {
        toast.error(data.message || "Gagal diperbarui.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal menghubungkan ke server API.")
    }
  }

  // CRUD: Open Delete Confirm Modal
  const openDeleteConfirm = (badge: any) => {
    setDeleteBadgeId(badge.id)
    setDeleteBadgeName(badge.name)
    setIsDeleteOpen(true)
  }

  // CRUD: Delete Submit
  const handleDeleteSubmit = async () => {
    try {
      const res = await fetch(ADMIN_API.trustBadgeById(deleteBadgeId), {
        method: "DELETE"
      })
      const data = await res.json()

      if (data.success) {
        toast.success(`Lencana "${deleteBadgeName}" berhasil dihapus.`)
        setIsDeleteOpen(false)
        fetchBadges()
      } else {
        toast.error(data.message || "Gagal menghapus lencana.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal menghubungkan ke server API.")
    }
  }

  // Filter badges based on search query
  const filteredBadges = badges.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Dynamic Image Renderer
  const RenderBadgeIcon = ({ url, className, name }: { url: string, className?: string, name?: string }) => {
    if (!url) return null
    return (
      <img 
        src={url} 
        alt={name || "Badge"}
        className={`object-contain h-4 w-4 shrink-0 select-none ${className || ""}`}
        onError={(e) => {
          e.currentTarget.style.display = "none"
        }}
      />
    )
  }

  return (
    <div className="space-y-6 w-full text-[#1A1A19] dark:text-[#EAE9E4]">
      {/* Search & Add Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white dark:bg-[#121211] border border-slate-200 dark:border-zinc-800 p-4 rounded-[2rem] shadow-sm w-full">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari lencana berdasarkan nama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 pl-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
          />
        </div>

        {/* Add Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger
            render={
              <Button className="bg-[#FFD551] text-black border border-slate-200 dark:border-zinc-800 hover:bg-[#FFC83B] text-xs font-black italic h-11 px-5 rounded-2xl shadow-sm transition-all active:scale-95 w-full sm:w-auto shrink-0 cursor-pointer">
                <Plus className="mr-1 h-4 w-4" /> Tambah Lencana Baru
              </Button>
            }
          />
          <DialogContent className="max-w-xl bg-[#F8F7F3] dark:bg-[#121211] rounded-[2rem] border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="font-black text-2xl italic tracking-tighter">Tambah Lencana Tingkat</DialogTitle>
              <DialogDescription className="text-xs font-bold italic text-slate-400 dark:text-zinc-500">
                Buat lencana kepercayaan baru dengan mengunggah gambar lencana kustom Anda.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 pt-2 text-[#1A1A19] dark:text-[#EAE9E4]">

              {/* Live Preview Container */}
              <div className="bg-black/95 p-6 rounded-[1.8rem] flex flex-col items-center justify-center text-center space-y-3">
                <span className="text-[9px] font-black tracking-widest text-[#FFD551]/60 uppercase italic">Live Preview</span>
                {newBadgeUrl ? (
                  <img 
                    src={newBadgeUrl} 
                    alt={newName || "Badge Preview"}
                    className="h-16 w-auto object-contain max-w-[200px]"
                    onError={(e) => { e.currentTarget.style.display = "none" }}
                  />
                ) : (
                  <span className="text-[10px] font-bold text-zinc-500 italic">Belum ada gambar</span>
                )}
                <span className="text-[9px] font-bold text-slate-400 italic">Min. {newMinSupporters || "0"} Supporter Unik</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black italic text-slate-500 dark:text-zinc-400">Nama Lencana</Label>
                  <Input
                    required
                    placeholder="Rising Star"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-[#1a1a1a] text-black dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-black italic text-slate-500 dark:text-zinc-400">Min. Supporter Unik</Label>
                  <Input
                    type="number"
                    required
                    placeholder="1"
                    value={newMinSupporters}
                    onChange={(e) => setNewMinSupporters(e.target.value)}
                    className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-[#1a1a1a] text-black dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                  />
                </div>
              </div>

              {/* Premium File Upload */}
              <div className="space-y-1">
                <Label className="text-[10px] font-black italic text-slate-500 dark:text-zinc-400">Unggah Gambar Lencana (GIF, SVG, PNG, JPG, WEBP)</Label>
                <div 
                  onClick={() => addFileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 dark:border-zinc-700 hover:border-[#FFD551] dark:hover:border-[#FFD551] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-white dark:bg-[#1a1a1a] transition-all group"
                >
                  <input
                    type="file"
                    ref={addFileInputRef}
                    onChange={(e) => handleFileChange(e, false)}
                    accept="image/gif, image/svg+xml, image/png, image/jpeg, image/webp"
                    className="hidden"
                  />
                  {newBadgeUrl ? (
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 p-2.5 rounded-xl">
                      <RenderBadgeIcon url={newBadgeUrl} className="h-6 w-6 object-contain" />
                      <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 truncate max-w-[200px]">lencana_terpilih.png</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-slate-400 dark:text-zinc-500 group-hover:text-[#FFD551] transition-colors" />
                      <span className="text-[10px] font-black italic text-slate-500 dark:text-zinc-400">Klik untuk memilih file lencana</span>
                      <span className="text-[8px] font-bold text-slate-400 dark:text-zinc-500">Mendukung format GIF, SVG, PNG, JPG, WEBP (Maks 2MB)</span>
                    </>
                  )}
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="submit" className="w-full h-12 bg-black text-[#FFD551] rounded-2xl font-black italic transition-all cursor-pointer hover:bg-slate-900 border-none">
                  Simpan Lencana Baru
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Badges Grid View */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-56 bg-white dark:bg-[#121211] border border-slate-200 dark:border-zinc-800 rounded-[2rem] p-6 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {filteredBadges.map((badge) => (
              <Card key={badge.id} className="border border-slate-200 dark:border-zinc-800/80 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)] bg-white dark:bg-[#121211] overflow-hidden flex flex-col justify-between group hover:border-[#FFD551] transition-all duration-300">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4">
                  {/* Badge Image Only */}
                  <div className="h-20 flex items-center justify-center">
                    <img 
                      src={badge.badge_url} 
                      alt={badge.name}
                      className="h-14 w-auto object-contain max-w-[160px]"
                      onError={(e) => { e.currentTarget.style.display = "none" }}
                    />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase leading-tight line-clamp-1 italic">{badge.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 italic">Min. Supporters: {badge.min_supporters}</p>
                    <p className="text-[8px] font-mono text-slate-400 truncate max-w-[150px] mt-1">{badge.id}</p>
                  </div>

                  <div className="flex gap-2 w-full pt-2 border-t border-[#F2F0EA] dark:border-zinc-800/50">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(badge)}
                      className="h-8 flex-1 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-xl text-[9px] font-black italic gap-1 cursor-pointer"
                    >
                      <Edit2 className="h-3 w-3" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDeleteConfirm(badge)}
                      className="h-8 border border-red-100 hover:bg-red-50 dark:border-red-950 dark:hover:bg-red-950/20 text-red-500 rounded-xl text-[9px] font-black italic cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredBadges.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-[#121211] border border-slate-200 dark:border-zinc-800 rounded-[2.5rem]">
              <Award className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400 text-xs font-bold italic">Tidak ada lencana yang terdaftar.</p>
            </div>
          )}
        </>
      )}

      {/* Edit Badge Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-xl bg-[#F8F7F3] dark:bg-[#121211] rounded-[2rem] border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="font-black text-2xl italic tracking-tighter">Edit Lencana Tingkat</DialogTitle>
            <DialogDescription className="text-xs font-bold italic text-slate-400 dark:text-zinc-500">
              Perbarui syarat minimal supporter, gambar lencana kustom, dan visual styling untuk lencana ini.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2 text-[#1A1A19] dark:text-[#EAE9E4]">

            {/* Live Preview Container */}
            <div className="bg-black/95 p-6 rounded-[1.8rem] flex flex-col items-center justify-center text-center space-y-3">
              <span className="text-[9px] font-black tracking-widest text-[#FFD551]/60 uppercase italic">Live Preview</span>
              {editBadgeUrl ? (
                <img 
                  src={editBadgeUrl} 
                  alt={editName || "Badge Preview"}
                  className="h-16 w-auto object-contain max-w-[200px]"
                  onError={(e) => { e.currentTarget.style.display = "none" }}
                />
              ) : (
                <span className="text-[10px] font-bold text-zinc-500 italic">Belum ada gambar</span>
              )}
              <span className="text-[9px] font-bold text-slate-400 italic">Min. {editMinSupporters || "0"} Supporter Unik</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] font-black italic text-slate-500 dark:text-zinc-400">Nama Lencana</Label>
                <Input
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-[#1a1a1a] text-black dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-black italic text-slate-500 dark:text-zinc-400">Min. Supporter Unik</Label>
                <Input
                  type="number"
                  required
                  value={editMinSupporters}
                  onChange={(e) => setEditMinSupporters(e.target.value)}
                  className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-[#1a1a1a] text-black dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                />
              </div>
            </div>

            {/* Premium File Upload Edit */}
            <div className="space-y-1">
              <Label className="text-[10px] font-black italic text-slate-500 dark:text-zinc-400">Ganti Gambar Lencana (GIF, SVG, PNG, JPG, WEBP)</Label>
              <div 
                onClick={() => editFileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-zinc-700 hover:border-[#FFD551] dark:hover:border-[#FFD551] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-white dark:bg-[#1a1a1a] transition-all group"
              >
                <input
                  type="file"
                  ref={editFileInputRef}
                  onChange={(e) => handleFileChange(e, true)}
                  accept="image/gif, image/svg+xml, image/png, image/jpeg, image/webp"
                  className="hidden"
                />
                {editBadgeUrl ? (
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 p-2.5 rounded-xl">
                    <RenderBadgeIcon url={editBadgeUrl} className="h-6 w-6 object-contain" />
                    <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 truncate max-w-[200px]">lencana_baru.png</span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-slate-400 dark:text-zinc-500 group-hover:text-[#FFD551] transition-colors" />
                    <span className="text-[10px] font-black italic text-slate-500 dark:text-zinc-400">Klik untuk memilih file lencana</span>
                    <span className="text-[8px] font-bold text-slate-400 dark:text-zinc-500">Mendukung format GIF, SVG, PNG, JPG, WEBP (Maks 2MB)</span>
                  </>
                )}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="submit" className="w-full h-12 bg-black text-[#FFD551] rounded-2xl font-black italic transition-all cursor-pointer hover:bg-slate-900 border-none">
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md bg-[#F8F7F3] dark:bg-[#121211] rounded-[2rem] border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl text-[#1A1A19] dark:text-[#EAE9E4]">
          <DialogHeader>
            <DialogTitle className="font-black text-2xl italic tracking-tighter flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-500 animate-pulse shrink-0" /> Konfirmasi Hapus Lencana
            </DialogTitle>
            <DialogDescription className="text-xs font-bold italic text-slate-400 dark:text-zinc-500">
              Apakah Anda yakin ingin menghapus lencana tingkat ini? Tindakan ini permanen.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-2xl border border-slate-100 dark:border-zinc-800 flex items-center gap-4">
              <div className="h-12 flex items-center justify-center bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 p-2 rounded-xl shrink-0">
                {badges.find(b => b.id === deleteBadgeId) && (
                  <img 
                    src={badges.find(b => b.id === deleteBadgeId)?.badge_url} 
                    alt={deleteBadgeName}
                    className="h-8 w-auto object-contain max-w-[80px]"
                    onError={(e) => { e.currentTarget.style.display = "none" }}
                  />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-black uppercase italic truncate">{deleteBadgeName}</span>
                <span className="text-[9px] font-mono text-slate-400 truncate">{deleteBadgeId}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <div className="flex gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteOpen(false)}
                className="h-12 flex-1 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 rounded-2xl font-black italic text-xs hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleDeleteSubmit}
                className="h-12 flex-1 bg-red-500 text-white hover:bg-red-600 rounded-2xl font-black italic text-xs transition-all cursor-pointer border-none"
              >
                Hapus Lencana
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
