"use client"

import React, { useState, useEffect } from "react"
import { Search, Plus, Edit2, Trash2, CreditCard, UploadCloud, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { API_BASE_URL } from "@/lib/api"

export default function PaymentChannelsTab() {
  const [channels, setChannels] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // Add form state
  const [newName, setNewName] = useState("")
  const [newCode, setNewCode] = useState("")
  const [newMinFee, setNewMinFee] = useState("0")
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null)
  const [newLogoPreview, setNewLogoPreview] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Edit form state
  const [selectedChannelId, setSelectedChannelId] = useState("")
  const [editName, setEditName] = useState("")
  const [editCode, setEditCode] = useState("")
  const [editMinFee, setEditMinFee] = useState("0")
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null)
  const [editLogoPreview, setEditLogoPreview] = useState<string>("")

  // Delete state
  const [deleteChannelId, setDeleteChannelId] = useState("")
  const [deleteChannelName, setDeleteChannelName] = useState("")

  // Fetch payment channels from API
  const fetchChannels = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`${API_BASE_URL}/payment-channels/admin/list`)
      const json = await res.json()
      if (json.success) {
        setChannels(json.data || [])
      } else {
        toast.error("Gagal memuat daftar metode pembayaran.")
      }
    } catch (err) {
      console.error("Error loading payment channels:", err)
      toast.error("Kesalahan koneksi ke server API.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchChannels()
  }, [])

  // File Upload Helper
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFileCallback: (file: File | null) => void,
    setPreviewCallback: (url: string) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 1. Enforce size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file tidak boleh melebihi 5 MB!")
      return
    }

    // 2. Format validation
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/svg+xml"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Format file tidak didukung! Gunakan PNG, JPEG, GIF, WebP, atau SVG.")
      return
    }

    setFileCallback(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setPreviewCallback(event.target.result as string)
        toast.success("Logo bank berhasil dipilih!")
      }
    }
    reader.readAsDataURL(file)
  }

  // CRUD: Add Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newCode.trim()) {
      toast.error("Nama dan Kode metode pembayaran wajib diisi!")
      return
    }
    if (!newLogoFile) {
      toast.error("Logo metode pembayaran wajib diunggah!")
      return
    }

    try {
      setIsSubmitting(true)
      const formData = new FormData()
      formData.append("name", newName.trim())
      formData.append("code", newCode.trim().toLowerCase())
      formData.append("minFee", newMinFee)
      formData.append("logo", newLogoFile)
      formData.append("isActive", "true")

      const res = await fetch(`${API_BASE_URL}/payment-channels/admin/create`, {
        method: "POST",
        body: formData
      })
      const data = await res.json()

      if (data.success) {
        toast.success("Metode pembayaran baru berhasil ditambahkan!")
        setIsAddOpen(false)
        // Reset Form
        setNewName("")
        setNewCode("")
        setNewMinFee("0")
        setNewLogoFile(null)
        setNewLogoPreview("")
        fetchChannels()
      } else {
        toast.error(data.message || "Gagal menambahkan metode pembayaran.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal menghubungkan ke server API.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // CRUD: Toggle status ON/OFF
  const handleToggleActive = async (id: string, currentVal: boolean) => {
    try {
      const res = await fetch(`${API_BASE_URL}/payment-channels/admin/toggle/${id}`, {
        method: "PUT"
      })
      const data = await res.json()

      if (data.success) {
        setChannels(prev =>
          prev.map(c => (c.id === id ? { ...c, isActive: !currentVal } : c))
        )
        toast.success(
          `Metode pembayaran berhasil ${!currentVal ? "diaktifkan 🟢" : "dinonaktifkan 🔴"}`
        )
      } else {
        toast.error("Gagal memperbarui status metode pembayaran.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Kesalahan jaringan.")
    }
  }

  // CRUD: Open Edit Modal
  const openEditModal = (channel: any) => {
    setSelectedChannelId(channel.id)
    setEditName(channel.name)
    setEditCode(channel.code)
    setEditMinFee(channel.minFee.toString())
    setEditLogoFile(null)
    setEditLogoPreview(`${API_BASE_URL.replace('/api/v1', '')}${channel.logoUrl}`)
    setIsEditOpen(true)
  }

  // CRUD: Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editName.trim() || !editCode.trim()) {
      toast.error("Nama dan Kode metode pembayaran wajib diisi!")
      return
    }

    try {
      setIsSubmitting(true)
      const formData = new FormData()
      formData.append("name", editName.trim())
      formData.append("code", editCode.trim().toLowerCase())
      formData.append("minFee", editMinFee)
      if (editLogoFile) {
        formData.append("logo", editLogoFile)
      }

      const res = await fetch(`${API_BASE_URL}/payment-channels/admin/update/${selectedChannelId}`, {
        method: "PUT",
        body: formData
      })
      const data = await res.json()

      if (data.success) {
        toast.success("Metode pembayaran berhasil diperbarui!")
        setIsEditOpen(false)
        fetchChannels()
      } else {
        toast.error(data.message || "Gagal memperbarui metode pembayaran.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal menghubungkan ke server API.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // CRUD: Open Delete Confirm Modal
  const openDeleteConfirm = (channel: any) => {
    setDeleteChannelId(channel.id)
    setDeleteChannelName(channel.name)
    setIsDeleteOpen(true)
  }

  // CRUD: Delete Submit
  const handleDeleteSubmit = async () => {
    try {
      setIsSubmitting(true)
      const res = await fetch(`${API_BASE_URL}/payment-channels/admin/delete/${deleteChannelId}`, {
        method: "DELETE"
      })
      const data = await res.json()

      if (data.success) {
        toast.success(`Metode pembayaran "${deleteChannelName}" berhasil dihapus.`)
        setIsDeleteOpen(false)
        fetchChannels()
      } else {
        toast.error(data.message || "Gagal menghapus metode pembayaran.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal menghubungkan ke server API.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter channels based on search query
  const filteredChannels = channels.filter(
    c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getFullLogoUrl = (urlPath: string) => {
    if (urlPath.startsWith("http")) return urlPath
    return `${API_BASE_URL.replace('/api/v1', '')}${urlPath}`
  }

  return (
    <div className="space-y-6 w-full text-[#1A1A19] dark:text-[#EAE9E4]">
      {/* Search & Add New Channel Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white dark:bg-[#121211] border border-slate-200 dark:border-zinc-800 p-4 rounded-[2rem] shadow-sm w-full">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari metode pembayaran berdasarkan nama atau kode..."
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
                <Plus className="mr-1 h-4 w-4" /> Tambah Pembayaran Baru
              </Button>
            }
          />
          <DialogContent className="max-w-md bg-[#F8F7F3] rounded-[2rem] border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl text-[#1A1A19]">
            <DialogHeader>
              <DialogTitle className="font-black text-2xl italic tracking-tighter uppercase">Tambah Metode Pembayaran</DialogTitle>
              <DialogDescription className="text-xs font-bold italic text-slate-500">
                Tambahkan logo bank, kode integrasi gateway, serta status aktifasi saluran pembayaran.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
              {/* Image upload selector */}
              <div className="flex flex-col items-center justify-center space-y-2 pb-2">
                <Label className="text-xs font-black italic text-slate-500">Logo Pembayaran (SVG/PNG/WebP)</Label>
                <div className="relative group">
                  <div className="w-24 h-24 rounded-[22px] border border-slate-200 overflow-hidden bg-white shadow-sm flex items-center justify-center text-slate-350 text-3xl font-bold cursor-pointer hover:bg-slate-50">
                    {newLogoPreview ? (
                      <img src={newLogoPreview} alt="Preview Logo" className="w-full h-full object-contain p-2" />
                    ) : (
                      <UploadCloud className="h-8 w-8 text-slate-400" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.gif,.webp,.svg,image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
                    onChange={(e) => handleFileChange(e, setNewLogoFile, setNewLogoPreview)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="Pilih Logo Pembayaran (Max 5MB)"
                  />
                </div>
                <span className="text-[9px] font-bold text-slate-400 italic">Klik box untuk pilih file logo bank (Maksimal 5MB)</span>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-black italic text-slate-500">Nama Saluran (Contoh: Bank BCA, Gopay)</Label>
                <Input
                  required
                  placeholder="Contoh: BCA"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-11 border border-slate-200 rounded-xl bg-white text-black font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-black italic text-slate-500">Kode Gateway (Contoh: bca, gopay)</Label>
                <Input
                  required
                  placeholder="Contoh: bca"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="h-11 border border-slate-200 rounded-xl bg-white text-black font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-black italic text-slate-500">Fee Minimum / Potongan Tambahan (Rp, Opsional)</Label>
                <Input
                  type="number"
                  placeholder="Contoh: 0"
                  value={newMinFee}
                  onChange={(e) => setNewMinFee(e.target.value)}
                  className="h-11 border border-slate-200 rounded-xl bg-white text-black font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-black text-[#FFD551] rounded-2xl font-black italic transition-all cursor-pointer">
                  {isSubmitting ? "Menyimpan..." : "Simpan Metode Pembayaran"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid List View */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-52 bg-white dark:bg-[#121211] border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] p-6 animate-pulse flex flex-col justify-between" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 w-full">
            {filteredChannels.map((channel) => (
              <Card key={channel.id} className="border border-slate-200 dark:border-zinc-800/80 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)] bg-white dark:bg-[#121211] overflow-hidden flex flex-col justify-between group hover:border-[#FFD551] transition-all duration-300">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4">
                  {/* Absolute active badge */}
                  <div className="w-full flex justify-between items-center pb-2 border-b border-[#F2F0EA] dark:border-zinc-800/50">
                    <span className="text-[9px] font-mono text-slate-400 dark:text-zinc-500">
                      Code: {channel.code}
                    </span>
                    <button
                      onClick={() => handleToggleActive(channel.id, channel.isActive)}
                      className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                      title={channel.isActive ? "Nonaktifkan metode" : "Aktifkan metode"}
                    >
                      {channel.isActive ? (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-emerald-200/50 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 text-[8px] font-black italic">
                          ACTIVE 🟢
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-rose-200/50 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 text-[8px] font-black italic">
                          INACTIVE 🔴
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Logo Container (No hard backgrounds, directly rendered) */}
                  <div className="w-20 h-20 rounded-[20px] border border-slate-100 dark:border-zinc-850 overflow-hidden bg-slate-50 dark:bg-zinc-900 shrink-0 flex items-center justify-center shadow-inner transition-all duration-300">
                    <img 
                      src={getFullLogoUrl(channel.logoUrl)} 
                      alt={channel.name} 
                      className={`w-full h-full object-contain p-2 transition-all ${
                        channel.isActive 
                          ? "filter-none" 
                          : "filter grayscale contrast-75 opacity-40"
                      }`} 
                    />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase leading-tight line-clamp-1 italic text-black dark:text-white">{channel.name}</h4>
                    {channel.minFee > 0 ? (
                      <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 italic">
                        Min. Fee: Rp {parseFloat(channel.minFee).toLocaleString("id-ID")}
                      </p>
                    ) : (
                      <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 italic">
                        No Min. Fee
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 w-full pt-2 border-t border-[#F2F0EA] dark:border-zinc-800/50">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(channel)}
                      className="h-8 flex-1 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-xl text-[9px] font-black italic gap-1"
                    >
                      <Edit2 className="h-3 w-3" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDeleteConfirm(channel)}
                      className="h-8 border border-red-100 hover:bg-red-50 dark:border-red-950 dark:hover:bg-red-950/20 text-red-500 rounded-xl text-[9px] font-black italic"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredChannels.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-[#121211] border border-slate-200 dark:border-zinc-800 rounded-[2.5rem]">
              <CreditCard className="h-10 w-10 text-slate-350 mx-auto mb-2" />
              <p className="text-slate-400 text-xs font-bold italic">Belum ada metode pembayaran yang terdaftar.</p>
            </div>
          )}
        </>
      )}

      {/* Edit Channel Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md bg-[#F8F7F3] rounded-[2rem] border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl text-[#1A1A19]">
          <DialogHeader>
            <DialogTitle className="font-black text-2xl italic tracking-tighter uppercase">Edit Metode Pembayaran</DialogTitle>
            <DialogDescription className="text-xs font-bold italic text-slate-500">
              Perbarui logo, nama, kode integrasi gateway, atau fee tambahan dari metode pembayaran.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div className="flex flex-col items-center justify-center space-y-2 pb-2">
              <Label className="text-xs font-black italic text-slate-500">Logo Pembayaran (SVG/PNG/WebP)</Label>
              <div className="relative group">
                <div className="w-24 h-24 rounded-[22px] border border-slate-200 overflow-hidden bg-white shadow-sm flex items-center justify-center text-slate-350 text-2xl font-bold cursor-pointer hover:bg-slate-50">
                  {editLogoPreview ? (
                    <img src={editLogoPreview} alt="Preview Logo" className="w-full h-full object-contain p-2" />
                  ) : (
                    <UploadCloud className="h-8 w-8 text-slate-400" />
                  )}
                </div>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.gif,.webp,.svg,image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
                  onChange={(e) => handleFileChange(e, setEditLogoFile, setEditLogoPreview)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Pilih Gambar Logo (Max 5MB)"
                />
              </div>
              <span className="text-[9px] font-bold text-slate-400 italic">Klik box untuk ganti berkas logo (Maksimal 5MB)</span>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-black italic text-slate-500">Nama Saluran</Label>
              <Input
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-11 border border-slate-200 rounded-xl bg-white text-black font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-black italic text-slate-500">Kode Gateway</Label>
              <Input
                required
                value={editCode}
                onChange={(e) => setEditCode(e.target.value)}
                className="h-11 border border-slate-200 rounded-xl bg-white text-black font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-black italic text-slate-500">Fee Minimum / Potongan Tambahan (Rp)</Label>
              <Input
                type="number"
                value={editMinFee}
                onChange={(e) => setEditMinFee(e.target.value)}
                className="h-11 border border-slate-200 rounded-xl bg-white text-black font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-black text-[#FFD551] rounded-2xl font-black italic transition-all cursor-pointer">
                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md bg-[#F8F7F3] rounded-[2rem] border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl text-[#1A1A19]">
          <DialogHeader>
            <DialogTitle className="font-black text-2xl italic tracking-tighter uppercase flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-500 animate-pulse shrink-0" /> Hapus Pembayaran
            </DialogTitle>
            <DialogDescription className="text-xs font-bold italic text-slate-500">
              Apakah Anda yakin ingin menghapus metode pembayaran ini secara permanen dari server?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
              <div className="w-16 h-16 rounded-[14px] border border-[#FFD551] overflow-hidden bg-white shrink-0 flex items-center justify-center">
                <img 
                  src={getFullLogoUrl(channels.find(c => c.id === deleteChannelId)?.logoUrl || "")} 
                  alt="Target Delete" 
                  className="w-full h-full object-contain p-1" 
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-black uppercase italic truncate">{deleteChannelName}</span>
                <span className="text-[9px] font-mono text-slate-400 truncate">{deleteChannelId}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <div className="flex gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteOpen(false)}
                className="h-12 flex-1 border border-slate-200 text-slate-500 rounded-2xl font-black italic text-xs hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteSubmit}
                className="h-12 flex-1 bg-red-500 text-white hover:bg-red-600 rounded-2xl font-black italic text-xs transition-all cursor-pointer border-none"
              >
                {isSubmitting ? "Menghapus..." : "Hapus Permanen"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
