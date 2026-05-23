"use client"
import React from "react"
import { useDashboard } from "../context/DashboardContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Gamepad2, Plus, Pencil, Trash2 } from "lucide-react"
import { formatNumberInput, parseNumberInput } from "@/lib/utils"

export default function ServicesPage() {
  const {
    packages,
    mabarPromoBuy,
    setMabarPromoBuy,
    mabarPromoGet,
    setMabarPromoGet,
    isAddPackageOpen,
    setIsAddPackageOpen,
    selectedGame,
    setSelectedGame,
    newPkgName,
    setNewPkgName,
    newPkgPrice,
    setNewPkgPrice,
    handleAddPackage,
    handleDeactivatePackage,
    handleToggleActivePackage,
    openEditPackage,
    isEditPackageOpen,
    setIsEditPackageOpen,
    editPkgName,
    setEditPkgName,
    editPkgPrice,
    setEditPkgPrice,
    handleEditPackage,
    confirmDelete,
    setConfirmDelete,
    handleDeletePackage,
    handleSaveProfile
  } = useDashboard()

  const activePkg = packages.find((p: any) => p.status === "ACTIVE")

  return (
    <div className="space-y-6">
      {/* Promo settings */}
      <Card className="border-2 border-[#FFD551]/60 dark:border-[#FFD551]/40 rounded-2xl shadow-md bg-white dark:bg-[#121211] overflow-hidden p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black italic tracking-wider flex items-center gap-2 text-black dark:text-white">
              Sistem Promosi Jasa Mabar ("Beli X Gratis Y")
            </h3>
            <p className="text-sm font-bold text-slate-400 italic">
              Dorong penonton untuk memesan lebih banyak slot! Setel promosi agar penonton otomatis mendapatkan slot gratis (misal: Beli 5 Gratis 1).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black italic text-slate-500">Status Promo:</span>
            <Badge className={mabarPromoBuy > 0 ? "bg-emerald-500 text-white font-black text-[10px] px-2.5 py-1 rounded-lg shadow-sm" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500 text-[10px] px-2.5 py-1 rounded-lg"}>
              {mabarPromoBuy > 0 ? `Aktif (${mabarPromoBuy} Beli Gratis ${mabarPromoGet})` : "Nonaktif"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
          <div className="space-y-1.5">
            <Label className="font-black italic text-xs text-slate-500">Minimal Beli Slot (X)</Label>
            <Input 
              type="number" 
              min="0"
              placeholder="Contoh: 5" 
              value={mabarPromoBuy || ""} 
              onChange={(e) => setMabarPromoBuy(Math.max(0, parseInt(e.target.value) || 0))}
              className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="font-black italic text-xs text-slate-500">Bonus Slot Gratis (Y)</Label>
            <Input 
              type="number" 
              min="0"
              placeholder="Contoh: 1" 
              value={mabarPromoGet || ""} 
              onChange={(e) => setMabarPromoGet(Math.max(0, parseInt(e.target.value) || 0))}
              className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold"
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={handleSaveProfile}
              className="w-full h-10 bg-black text-[#FFD551] hover:bg-slate-900 border border-black rounded-xl font-black italic text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Simpan Aturan Promo
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex justify-between items-center bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm dark:bg-[#121211] dark:border-zinc-800/80">
        <div>
          <h2 className="text-base font-black italic tracking-widest">
            Rincian Jasa Mabar
          </h2>
          <p className="text-[10px] font-bold text-slate-400 italic mt-0.5">
            Tambahkan menu game mabar yang ingin Anda tawarkan.
          </p>
        </div>

        <Dialog open={isAddPackageOpen} onOpenChange={setIsAddPackageOpen}>
          <DialogTrigger
            render={
              <Button className="bg-[#FFD551] text-black border border-slate-200 dark:border-zinc-800 hover:bg-[#FFC83B] text-xs font-black italic h-10 px-5 rounded-2xl shadow-sm transition-all active:scale-95">
                <Plus className="mr-2 h-4 w-4" /> Tambah Paket Jasa
              </Button>
            }
          />
          <DialogContent className="max-w-md bg-[#F8F7F3] dark:bg-[#121211] rounded-2xl border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl">
            <DialogHeader className="space-y-1 text-center">
              <DialogTitle className="text-2xl font-black italic tracking-tighter flex items-center justify-center gap-2 text-black dark:text-white">
                <Plus className="h-6 w-6 text-[#FFD551]" /> 
                Tambah Paket Jasa Mabar
              </DialogTitle>
              <DialogDescription className="font-bold italic text-[9px] text-slate-400 tracking-widest">
                MONETISASI LAYANAN MABAR KREATOR
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPackage} className="space-y-4 pt-4 text-[#1A1A19] dark:text-white">
              <div className="space-y-2">
                <Label className="font-black italic text-xs text-slate-500">
                  Pilih Jenis Layanan / Game
                </Label>
                <select 
                  value={selectedGame}
                  onChange={(e) => {
                    setSelectedGame(e.target.value)
                    if (e.target.value !== "Lainnya") {
                      setNewPkgName(e.target.value)
                    } else {
                      setNewPkgName("")
                    }
                  }}
                  className="w-full h-11 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 font-bold bg-white dark:bg-zinc-900 text-black dark:text-white text-sm outline-none"
                >
                  <option value="">-- Pilih Layanan Game --</option>
                  <option value="Mobile Legends: Bang Bang">Mobile Legends: Bang Bang</option>
                  <option value="PUBG Mobile">PUBG Mobile</option>
                  <option value="Free Fire">Free Fire</option>
                  <option value="Valorant">Valorant</option>
                  <option value="Genshin Impact">Genshin Impact</option>
                  <option value="Dota 2">Dota 2</option>
                  <option value="Minecraft">Minecraft</option>
                  <option value="GTA V / Roleplay">GTA V / Roleplay</option>
                  <option value="Lainnya">Lainnya (Tulis Custom)</option>
                </select>
              </div>

              {selectedGame === "Lainnya" && (
                <div className="space-y-2">
                  <Label className="font-black italic text-xs text-slate-500">Nama Layanan Custom</Label>
                  <Input 
                    required 
                    placeholder="Masukkan nama layanan/game..." 
                    value={newPkgName} 
                    onChange={(e) => setNewPkgName(e.target.value)}
                    className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="font-black italic text-xs text-slate-500">
                  Tarif / Harga Per Sesi Mabar (Rp)
                </Label>
                <Input 
                  type="text" 
                  required 
                  placeholder="25.000" 
                  value={formatNumberInput(newPkgPrice)} 
                  onChange={(e) => setNewPkgPrice(String(parseNumberInput(e.target.value)))}
                  className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold"
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full h-12 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black rounded-2xl font-black italic text-xs transition-all shadow-md">
                  Aktifkan Layanan Mabar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Packages Grid */}
      {packages.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-xs font-bold text-slate-400 italic dark:bg-[#121211] dark:border-zinc-800/80">
          Belum ada menu jasa mabar yang aktif.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg: any) => {
            const isActive = activePkg && pkg.id === activePkg.id
            return (
              <Card key={pkg.id} className="border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden bg-white dark:bg-[#121211] dark:border-zinc-800/80 flex flex-col justify-between">
                <CardHeader className="bg-[#FAF9F6] border-b border-slate-100 p-5 flex flex-row justify-between items-start text-black dark:bg-[#1E1E1D]/55 dark:text-white dark:border-zinc-800">
                  <div>
                    <CardTitle className="font-black italic text-xs tracking-wide">{pkg.game_name}</CardTitle>
                    <CardDescription className="text-sm font-bold italic mt-1 text-slate-400">ID Jasa: {pkg.id.substring(0, 8).toUpperCase()}</CardDescription>
                  </div>
                  <Gamepad2 className="h-5 w-5 text-slate-400" />
                </CardHeader>
                <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-[#EAE9E4]/70 mb-4">
                      Dukungan instan untuk membuka slot antrean streaming bersama kreator.
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[9px] font-black italic text-slate-400">Tarif Sesi:</span>
                      <span className="text-base font-black italic text-black dark:text-white">Rp {Number(pkg.price_per_slot).toLocaleString("id-ID")}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-[#F2F0EA] dark:border-zinc-800/60 pt-3.5 items-center">
                    {isActive ? (
                      <Button 
                        onClick={() => handleDeactivatePackage(pkg)}
                        className="bg-emerald-500 hover:bg-rose-500 hover:text-white text-white border-0 font-black italic text-xs flex-1 justify-center h-11 rounded-2xl shadow-[0_4px_12px_rgba(16,185,129,0.25)] transition-all duration-200 group active:scale-95"
                      >
                        <span className="group-hover:hidden flex items-center gap-1 justify-center">SEDANG AKTIF</span>
                        <span className="hidden group-hover:flex items-center gap-1 justify-center">NONAKTIFKAN JASA</span>
                      </Button>
                    ) : (
                      <Button 
                        variant="outline"
                        onClick={() => handleToggleActivePackage(pkg)}
                        className="bg-[#FAF9F6] text-slate-600 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200/60 text-xs font-black italic flex-1 h-11 rounded-2xl transition-all duration-200 dark:bg-[#1C1C1B] dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-emerald-400"
                      >
                        Aktifkan Game
                      </Button>
                    )}
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={() => openEditPackage(pkg)}
                      className="h-11 w-11 border border-slate-200 rounded-2xl hover:bg-blue-50 hover:text-blue-500 active:scale-95 transition-all text-slate-400 dark:border-zinc-800"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={() => setConfirmDelete({type: 'package', id: pkg.id, name: pkg.game_name})}
                      className="h-11 w-11 border border-slate-200 rounded-2xl hover:bg-red-50 hover:text-red-500 active:scale-95 transition-all text-slate-400 dark:border-zinc-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Edit Package Modal */}
      <Dialog open={isEditPackageOpen} onOpenChange={setIsEditPackageOpen}>
        <DialogContent className="max-w-md bg-[#F8F7F3] dark:bg-[#121211] rounded-2xl border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl">
          <DialogHeader className="space-y-1 text-center">
            <DialogTitle className="text-2xl font-black italic tracking-tighter flex items-center justify-center gap-2 text-black dark:text-white">
              Sunting Paket Mabar
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditPackage} className="space-y-4 pt-4 text-[#1A1A19] dark:text-white">
            <div className="space-y-2">
              <Label className="font-black italic text-xs text-slate-500">Nama Layanan Game</Label>
              <Input 
                required 
                value={editPkgName} 
                onChange={(e) => setEditPkgName(e.target.value)}
                className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-black italic text-xs text-slate-500 font-bold">Tarif / Harga Per Sesi Mabar (Rp)</Label>
              <Input 
                type="text" 
                required 
                value={formatNumberInput(editPkgPrice)} 
                onChange={(e) => setEditPkgPrice(String(parseNumberInput(e.target.value)))}
                className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full h-12 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black rounded-2xl font-black italic text-xs transition-all shadow-md">
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      {confirmDelete && confirmDelete.type === 'package' && (
        <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
          <DialogContent className="max-w-md bg-[#F8F7F3] dark:bg-[#121211] rounded-2xl border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl">
            <DialogHeader className="text-center">
              <DialogTitle className="text-xl font-black italic text-red-500">Hapus Paket Jasa?</DialogTitle>
              <DialogDescription className="text-xs font-bold text-slate-400 mt-2">
                Tindakan ini akan menonaktifkan dan menghapus paket game "{confirmDelete.name}" secara permanen dari sistem.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-4 flex gap-2">
              <Button onClick={() => setConfirmDelete(null)} variant="outline" className="flex-1 rounded-xl h-11">
                Batal
              </Button>
              <Button onClick={() => { handleDeletePackage(confirmDelete.id); setConfirmDelete(null) }} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl h-11 border-none font-black italic">
                Hapus Permanen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
