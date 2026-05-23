"use client"

import React, { useState, useEffect } from "react"
import { Search, Plus, Edit2, Trash2, Gift, UploadCloud, AlertTriangle, ToggleLeft, ToggleRight, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ADMIN_API } from "@/lib/api"

const ADMIN_GIFTS_API = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/admin/gifts`

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount)
}

export default function GiftsTab() {
  const [gifts, setGifts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // Add form
  const [newName, setNewName] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const [newPrice, setNewPrice] = useState("")
  const [newIsActive, setNewIsActive] = useState(true)

  // Edit form
  const [selectedId, setSelectedId] = useState("")
  const [editName, setEditName] = useState("")
  const [editUrl, setEditUrl] = useState("")
  const [editPrice, setEditPrice] = useState("")
  const [editIsActive, setEditIsActive] = useState(true)

  // Delete
  const [deleteId, setDeleteId] = useState("")
  const [deleteName, setDeleteName] = useState("")

  const getAdminToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin_token") || ""
    }
    return ""
  }

  const fetchGifts = async () => {
    try {
      setIsLoading(true)
      const token = getAdminToken()
      const res = await fetch(ADMIN_GIFTS_API, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const json = await res.json()
      if (json.success) {
        setGifts(json.data || [])
      } else {
        toast.error("Gagal memuat daftar gift.")
      }
    } catch (err) {
      toast.error("Kesalahan koneksi ke server.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGifts()
  }, [])

  // File Upload: base64 reader for GIF
  const handleGifUpload = (e: React.ChangeEvent<HTMLInputElement>, setUrlCallback: (url: string) => void) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file GIF tidak boleh melebihi 2 MB!")
      return
    }

    const allowedTypes = ["image/gif"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Hanya file .gif yang didukung untuk Gift Animasi!")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setUrlCallback(event.target.result as string)
        toast.success("File GIF berhasil dipilih!")
      }
    }
    reader.readAsDataURL(file)
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newUrl || !newPrice) {
      toast.error("Nama, file GIF, dan harga wajib diisi!")
      return
    }
    const priceNum = parseFloat(newPrice)
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Harga harus berupa angka non-negatif.")
      return
    }
    try {
      const token = getAdminToken()
      const res = await fetch(ADMIN_GIFTS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName.trim(), url: newUrl, price: priceNum, isActive: newIsActive })
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Gift baru berhasil ditambahkan!")
        setIsAddOpen(false)
        setNewName(""); setNewUrl(""); setNewPrice(""); setNewIsActive(true)
        fetchGifts()
      } else {
        toast.error(data.message || "Gagal menambahkan gift.")
      }
    } catch {
      toast.error("Gagal menghubungkan ke server API.")
    }
  }

  const openEditModal = (gift: any) => {
    setSelectedId(gift.id)
    setEditName(gift.name)
    setEditUrl(gift.url)
    setEditPrice(String(gift.price))
    setEditIsActive(gift.isActive)
    setIsEditOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editName.trim() || !editPrice) {
      toast.error("Nama dan harga wajib diisi!")
      return
    }
    const priceNum = parseFloat(editPrice)
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Harga harus berupa angka non-negatif.")
      return
    }
    try {
      const token = getAdminToken()
      const payload: any = { name: editName.trim(), price: priceNum, isActive: editIsActive }
      // Only send url if it changed (user uploaded a new one)
      if (editUrl && !editUrl.startsWith("http") && !editUrl.startsWith("/")) {
        payload.url = editUrl
      } else if (editUrl) {
        payload.url = editUrl
      }
      const res = await fetch(`${ADMIN_GIFTS_API}/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Gift berhasil diperbarui!")
        setIsEditOpen(false)
        fetchGifts()
      } else {
        toast.error(data.message || "Gagal memperbarui gift.")
      }
    } catch {
      toast.error("Gagal menghubungkan ke server API.")
    }
  }

  const openDeleteConfirm = (gift: any) => {
    setDeleteId(gift.id)
    setDeleteName(gift.name)
    setIsDeleteOpen(true)
  }

  const handleDeleteSubmit = async () => {
    try {
      const token = getAdminToken()
      const res = await fetch(`${ADMIN_GIFTS_API}/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Gift "${deleteName}" berhasil dihapus.`)
        setIsDeleteOpen(false)
        fetchGifts()
      } else {
        toast.error(data.message || "Gagal menghapus gift.")
      }
    } catch {
      toast.error("Gagal menghubungkan ke server API.")
    }
  }

  const handleToggleActive = async (gift: any) => {
    try {
      const token = getAdminToken()
      const res = await fetch(`${ADMIN_GIFTS_API}/${gift.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !gift.isActive })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Gift "${gift.name}" ${!gift.isActive ? "diaktifkan" : "dinonaktifkan"} secara global.`)
        fetchGifts()
      }
    } catch {
      toast.error("Gagal mengubah status gift.")
    }
  }

  const filteredGifts = gifts.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const GifFormFields = ({
    name, setName, url, setUrl, price, setPrice, isActive, setIsActive,
    onUpload
  }: any) => (
    <div className="space-y-4 pt-2 text-[#1A1A19]">
      {/* GIF Preview & Upload */}
      <div className="flex flex-col items-center justify-center space-y-2 pb-2">
        <Label className="text-xs font-black italic text-slate-500">File GIF Animasi</Label>
        <div className="relative group">
          <div className="w-28 h-28 rounded-[22px] border-2 border-[#FFD551] overflow-hidden bg-white shadow-md flex items-center justify-center cursor-pointer">
            {url ? (
              <img src={url} alt="Preview GIF" className="w-full h-full object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-slate-300">
                <Sparkles className="h-8 w-8" />
                <span className="text-[9px] font-bold">Upload GIF</span>
              </div>
            )}
          </div>
          <input
            type="file"
            accept=".gif,image/gif"
            onChange={(e) => onUpload(e, setUrl)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            title="Pilih file GIF (Maks 2MB)"
          />
        </div>
        <span className="text-[10px] font-bold text-slate-400 italic">Klik untuk upload file .gif (Maks 2 MB)</span>
      </div>

      {/* Name */}
      <div className="space-y-1">
        <Label className="text-xs font-black italic text-slate-500">Nama Gift</Label>
        <Input
          required
          placeholder="Contoh: Coin Drop, Flying Wallet, Star Burst"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-11 border border-slate-200 rounded-xl bg-white text-black font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
        />
      </div>

      {/* Price */}
      <div className="space-y-1">
        <Label className="text-xs font-black italic text-slate-500">Harga Tetap (IDR)</Label>
        <div className="relative">
          <span className="absolute left-4 top-3.5 text-xs font-black text-slate-400">Rp</span>
          <Input
            required
            type="number"
            min={0}
            step={1000}
            placeholder="10000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="h-11 pl-12 border border-slate-200 rounded-xl bg-white text-black font-black focus-visible:ring-2 focus-visible:ring-[#FFD551]"
          />
        </div>
        <p className="text-[9px] font-bold text-slate-400 italic">Harga ini bersifat tetap (fixed) dan digunakan di semua channel kreator yang mengaktifkan gift ini.</p>
      </div>

      {/* Active Toggle */}
      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
        <div>
          <Label className="text-xs font-black italic text-slate-600">Aktifkan Gift Secara Global</Label>
          <p className="text-[9px] font-bold text-slate-400">Gift hanya muncul di halaman donasi jika diaktifkan.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className={`relative h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none ${isActive ? 'bg-[#FFD551]' : 'bg-slate-300'}`}
        >
          <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 w-full text-[#1A1A19] dark:text-[#EAE9E4]">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-[#FFD551]/20 to-amber-100/30 dark:from-[#FFD551]/10 dark:to-amber-900/10 border border-[#FFD551]/30 rounded-[2rem] p-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-[#FFD551] rounded-2xl shrink-0">
            <Gift className="h-5 w-5 text-black" />
          </div>
          <div>
            <h3 className="font-black italic text-sm tracking-tight text-black dark:text-white">Sistem Gift Animasi Live</h3>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
              Kelola koleksi Gift bergerak (.gif) dengan harga tetap (fixed price) yang ditampilkan di halaman donasi kreator. Kreator bisa memilih aktifkan/nonaktifkan masing-masing gift di channel mereka.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Add Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white dark:bg-[#121211] border border-slate-200 dark:border-zinc-800 p-4 rounded-[2rem] shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari gift berdasarkan nama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 pl-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
          />
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button className="bg-[#FFD551] text-black border border-slate-200 dark:border-zinc-800 hover:bg-[#FFC83B] text-xs font-black italic h-11 px-5 rounded-2xl shadow-sm transition-all active:scale-95 w-full sm:w-auto shrink-0 cursor-pointer">
              <Plus className="mr-1 h-4 w-4" /> Tambah Gift Baru
            </Button>
          } />
          <DialogContent className="max-w-md bg-[#F8F7F3] rounded-[2rem] border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="font-black text-2xl italic tracking-tighter flex items-center gap-2">
                <Gift className="h-6 w-6 text-[#FFD551]" /> Tambah Gift Animasi
              </DialogTitle>
              <DialogDescription className="text-xs font-bold italic text-slate-400">
                Upload GIF bergerak, beri nama, dan tentukan harga tetap dalam IDR.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubmit}>
              <GifFormFields
                name={newName} setName={setNewName}
                url={newUrl} setUrl={setNewUrl}
                price={newPrice} setPrice={setNewPrice}
                isActive={newIsActive} setIsActive={setNewIsActive}
                onUpload={handleGifUpload}
              />
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full h-12 bg-black text-[#FFD551] rounded-2xl font-black italic transition-all cursor-pointer">
                  Simpan Gift Baru
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Gifts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-60 bg-white dark:bg-[#121211] border border-slate-200 dark:border-zinc-800 rounded-[2rem] animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {filteredGifts.map((gift) => (
              <Card key={gift.id} className={`border rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col justify-between group transition-all duration-300 ${
                gift.isActive
                  ? "border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#121211] hover:border-[#FFD551]"
                  : "border-slate-200/50 dark:border-zinc-800/40 bg-slate-50/80 dark:bg-zinc-900/50 opacity-60"
              }`}>
                <CardContent className="p-5 flex flex-col items-center text-center space-y-3">
                  {/* GIF Preview */}
                  <div className="w-24 h-24 rounded-[20px] border-2 border-[#FFD551]/40 group-hover:border-[#FFD551] overflow-hidden bg-slate-50 dark:bg-zinc-900 shrink-0 flex items-center justify-center transition-all">
                    <img src={gift.url} alt={gift.name} className="w-full h-full object-contain" />
                  </div>

                  <div className="space-y-1 w-full">
                    <h4 className="text-xs font-black uppercase leading-tight line-clamp-1 italic">{gift.name}</h4>
                    <div className="inline-flex items-center gap-1 bg-[#FFD551]/20 border border-[#FFD551]/30 px-2.5 py-1 rounded-xl">
                      <span className="text-[11px] font-black text-amber-700 dark:text-amber-400">{formatRupiah(parseFloat(gift.price))}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <button
                    onClick={() => handleToggleActive(gift)}
                    className={`w-full py-1 px-3 rounded-xl text-[9px] font-black italic uppercase transition-all border ${
                      gift.isActive
                        ? "bg-green-50 border-green-200 text-green-600 hover:bg-green-100 dark:bg-green-950/30 dark:border-green-900 dark:text-green-400"
                        : "bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200 dark:bg-zinc-800 dark:border-zinc-700"
                    }`}
                  >
                    {gift.isActive ? "✓ Aktif Global" : "✗ Nonaktif Global"}
                  </button>

                  {/* Action Buttons */}
                  <div className="flex gap-2 w-full pt-1 border-t border-slate-100 dark:border-zinc-800/50">
                    <Button size="sm" variant="outline"
                      onClick={() => openEditModal(gift)}
                      className="h-8 flex-1 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-xl text-[9px] font-black italic gap-1"
                    >
                      <Edit2 className="h-3 w-3" /> Edit
                    </Button>
                    <Button size="sm" variant="outline"
                      onClick={() => openDeleteConfirm(gift)}
                      className="h-8 border border-red-100 hover:bg-red-50 dark:border-red-950 dark:hover:bg-red-950/20 text-red-500 rounded-xl text-[9px] font-black italic"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredGifts.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-[#121211] border border-slate-200 dark:border-zinc-800 rounded-[2.5rem]">
              <Gift className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400 text-xs font-bold italic">Belum ada gift yang terdaftar.</p>
              <p className="text-slate-300 text-[10px] font-bold italic mt-1">Klik "Tambah Gift Baru" untuk memulai koleksi gift animasi pertama Anda!</p>
            </div>
          )}
        </>
      )}

      {/* Edit Gift Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md bg-[#F8F7F3] rounded-[2rem] border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-2xl italic tracking-tighter flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-[#FFD551]" /> Edit Gift Animasi
            </DialogTitle>
            <DialogDescription className="text-xs font-bold italic text-slate-400">
              Perbarui nama, harga, atau ganti file GIF animasi gift ini.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <GifFormFields
              name={editName} setName={setEditName}
              url={editUrl} setUrl={setEditUrl}
              price={editPrice} setPrice={setEditPrice}
              isActive={editIsActive} setIsActive={setEditIsActive}
              onUpload={handleGifUpload}
            />
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full h-12 bg-black text-[#FFD551] rounded-2xl font-black italic transition-all cursor-pointer">
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md bg-[#F8F7F3] rounded-[2rem] border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl text-[#1A1A19]">
          <DialogHeader>
            <DialogTitle className="font-black text-2xl italic tracking-tighter flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-500 animate-pulse shrink-0" /> Konfirmasi Hapus Gift
            </DialogTitle>
            <DialogDescription className="text-xs font-bold italic text-slate-400">
              Gift yang dihapus tidak bisa dipulihkan. Semua kreator yang mengaktifkan gift ini akan kehilangan akses.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-2xl border border-slate-100 dark:border-zinc-900 flex items-center gap-4">
              <div className="w-16 h-16 rounded-[14px] border border-[#FFD551] overflow-hidden bg-white shrink-0">
                <img src={gifts.find(g => g.id === deleteId)?.url} alt="Target" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-xs font-black uppercase italic">{deleteName}</span>
                <p className="text-[9px] font-mono text-slate-400 mt-1">{deleteId}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <div className="flex gap-3 w-full">
              <Button type="button" variant="outline"
                onClick={() => setIsDeleteOpen(false)}
                className="h-12 flex-1 border border-slate-200 text-slate-500 rounded-2xl font-black italic text-xs hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </Button>
              <Button type="button"
                onClick={handleDeleteSubmit}
                className="h-12 flex-1 bg-red-500 text-white hover:bg-red-600 rounded-2xl font-black italic text-xs transition-all cursor-pointer border-none"
              >
                Hapus Gift
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
