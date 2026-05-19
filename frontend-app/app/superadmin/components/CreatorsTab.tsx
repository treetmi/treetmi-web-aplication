"use client"

import React from "react"
import { toast } from "sonner"
import { 
  Search, 
  UserPlus, 
  Edit2, 
  UserMinus, 
  UserPlus as UserPlusActive 
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface CreatorsTabProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  filteredCreators: any[]
  handleToggleVerified: (id: string, currentVal: boolean) => void
  handleOpenEditModal: (creator: any) => void
  handleToggleSuspend: (id: string, currentStatus: string) => void
  isAddCreatorOpen: boolean
  setIsAddCreatorOpen: (open: boolean) => void
  newUsername: string
  setNewUsername: (username: string) => void
  newEmail: string
  setNewEmail: (email: string) => void
  newRole: string
  setNewRole: (role: string) => void
  newBalance: string
  setNewBalance: (balance: string) => void
  newAvatarUrl: string
  setNewAvatarUrl: (url: string) => void
  handleAddCreatorSubmit: (e: React.FormEvent) => void
  handleOpenVerifyReview: (creator: any) => void
}

export default function CreatorsTab({
  searchQuery,
  setSearchQuery,
  filteredCreators,
  handleToggleVerified,
  handleOpenEditModal,
  handleToggleSuspend,
  isAddCreatorOpen,
  setIsAddCreatorOpen,
  newUsername,
  setNewUsername,
  newEmail,
  setNewEmail,
  newRole,
  setNewRole,
  newBalance,
  setNewBalance,
  newAvatarUrl,
  setNewAvatarUrl,
  handleAddCreatorSubmit,
  handleOpenVerifyReview
}: CreatorsTabProps) {
  return (
    <div className="space-y-6 w-full">
      
      {/* Filter, search and register new creator bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white dark:bg-[#121211] border border-slate-200 dark:border-zinc-800 p-4 rounded-[2rem] shadow-sm w-full">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Cari kreator berdasarkan username, email, atau role..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 pl-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
          />
        </div>

        {/* Integrated Add Creator Dialog Trigger */}
        <Dialog open={isAddCreatorOpen} onOpenChange={setIsAddCreatorOpen}>
          <DialogTrigger 
            render={
              <Button className="bg-[#FFD551] text-black border border-slate-200 dark:border-zinc-800 hover:bg-[#FFC83B] text-xs font-black italic h-11 px-5 rounded-2xl shadow-sm transition-all active:scale-95 w-full sm:w-auto shrink-0 cursor-pointer">
                <UserPlus className="mr-2 h-4 w-4" /> Tambah Kreator Baru
              </Button>
            }
          />
          <DialogContent className="max-w-md bg-[#F8F7F3] rounded-[2rem] border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="font-black text-2xl italic tracking-tighter">Daftarkan Kreator Baru</DialogTitle>
              <DialogDescription className="text-xs font-bold italic text-slate-400">
                Akun kreator akan terdaftar langsung di direktori database sistem
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCreatorSubmit} className="space-y-4 pt-2 text-[#1A1A19]">
              {/* Avatar File Upload Section */}
              <div className="flex flex-col items-center justify-center space-y-2 pb-2">
                <Label className="text-xs font-black italic text-slate-500">Foto Profil / Avatar Kreator</Label>
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full border-3 border-[#FFD551] overflow-hidden bg-white shadow-md flex items-center justify-center text-slate-350 text-2xl font-bold">
                    {newAvatarUrl ? (
                      <img src={newAvatarUrl} alt="Preview Avatar" className="w-full h-full object-cover" />
                    ) : (
                      "➕"
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.gif,.webp,.svg,image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return

                      // 1. Enforce Size Limit: 500KB
                      if (file.size > 500 * 1024) {
                        toast.error("Ukuran foto profil tidak boleh melebihi 500 KB!")
                        return
                      }

                      // 2. Enforce File Format Limit
                      const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/svg+xml"]
                      if (!allowedTypes.includes(file.type)) {
                        toast.error("Format file tidak didukung! Gunakan PNG, JPEG, GIF, Webp, atau SVG.")
                        return
                      }

                      const reader = new FileReader()
                      reader.onload = (event) => {
                        setNewAvatarUrl(event.target?.result as string)
                        toast.success("Foto profil berhasil diunggah!")
                      }
                      reader.readAsDataURL(file)
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="Pilih Foto Profil (Max 500KB)"
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400 italic">Klik lingkaran untuk unggah (PNG/JPG/GIF/SVG/Webp, Max 500KB)</span>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black italic text-slate-500">Username Kreator</Label>
                <Input 
                  required 
                  placeholder="kreatorkeren" 
                  value={newUsername} 
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black italic text-slate-500">Alamat Email</Label>
                <Input 
                  type="email"
                  required 
                  placeholder="kreator@treetmi.id" 
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black italic text-slate-500">Peran Kustom / Label Peran (Role)</Label>
                <Input 
                  placeholder="Contoh: VERIFIED STREAMER & KREATOR" 
                  value={newRole} 
                  onChange={(e) => setNewRole(e.target.value)}
                  className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black italic text-slate-500">Saldo Awal Wallet (Rp)</Label>
                <Input 
                  type="number"
                  placeholder="0" 
                  value={newBalance} 
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold"
                />
              </div>
              <DialogFooter className="pt-2">
                <Button type="submit" className="w-full h-12 bg-black text-[#FFD551] rounded-2xl font-black italic transition-all">
                  Buat Akun Kreator
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Creators Table Card */}
      <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)] bg-white dark:bg-[#121211] overflow-hidden w-full">
        <CardContent className="p-0">
          <Table className="w-full">
            <TableHeader className="bg-[#FAF9F6] dark:bg-[#1E1E1D]/40">
              <TableRow className="border-b border-slate-100 dark:border-zinc-900">
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic px-8">ID</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Username</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Email</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Role</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Saldo Dompet</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Live Status</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Centang Verified</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Status Pengajuan</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Status Sistem</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic text-right px-8">Aksi Moderasi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCreators.map(c => (
                <TableRow key={c.id} className="border-b border-slate-100/60 dark:border-zinc-800/40 hover:bg-slate-50/30">
                  <TableCell className="font-mono text-xs font-bold px-8">{c.id.substring(0, 8)}</TableCell>
                  <TableCell className="font-bold text-xs">
                    <div className="flex items-center gap-2 italic">
                      <div className="w-8 h-8 rounded-full border border-[#FFD551] overflow-hidden bg-white shrink-0 flex items-center justify-center text-xs font-black">
                        {c.avatar_url ? (
                          <img src={c.avatar_url} alt={c.username} className="w-full h-full object-cover" />
                        ) : (
                          c.username.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="font-bold flex items-center gap-1">
                          @{c.username}
                          {c.isVerified && (
                            <img src="/verified.svg" alt="Verified" className="w-4 h-4 shrink-0" />
                          )}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-slate-400">{c.email}</TableCell>
                  <TableCell>
                    <Badge className="bg-slate-50 text-slate-600 border border-slate-100 text-[9px] font-black rounded-lg w-32 justify-center flex shrink-0 py-1">
                      {c.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-black">
                    Rp {c.balance.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <Badge className={`w-16 justify-center flex shrink-0 font-black text-[8px] py-1 rounded-lg border-none ${
                      c.isLive 
                        ? "bg-red-500 text-white animate-pulse"
                        : "bg-slate-100 text-slate-400 font-bold"
                    }`}>
                      {c.isLive ? "LIVE" : "OFFLINE"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch 
                      checked={c.isVerified}
                      onCheckedChange={() => handleToggleVerified(c.id, c.isVerified)}
                    />
                  </TableCell>
                  <TableCell>
                    {c.isVerified ? (
                      <Badge className="bg-emerald-500 text-white font-black text-[8px] tracking-wide border-none px-2 py-0.5 rounded-md">VERIFIED</Badge>
                    ) : c.verification_status === "PENDING" ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge className="bg-amber-500 text-white font-black text-[8px] tracking-wide border-none px-2 py-0.5 rounded-md animate-pulse">PENDING</Badge>
                        <Button
                          size="xs"
                          onClick={() => handleOpenVerifyReview(c)}
                          className="h-6 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black hover:scale-105 active:scale-95 border-none font-black italic text-[8px] px-2 rounded-lg cursor-pointer"
                        >
                          🔍 Tinjau
                        </Button>
                      </div>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-400 font-bold text-[8px] tracking-wide border-none px-2 py-0.5 rounded-md">NONE</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      c.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-lg border-none"
                        : "bg-red-50 text-red-600 text-[9px] font-black rounded-lg border-none"
                    }>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="xs"
                        variant="outline"
                        onClick={() => handleOpenEditModal(c)}
                        className="h-8 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-black italic text-[9px]"
                      >
                        <Edit2 className="h-3 w-3 mr-1" /> Edit
                      </Button>
                      
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleToggleSuspend(c.id, c.status)}
                        className={`h-8 border rounded-xl text-[9px] font-black italic ${
                          c.status === "ACTIVE"
                            ? "text-red-500 border-red-200 hover:bg-red-50"
                            : "text-emerald-500 border-emerald-200 hover:bg-emerald-50"
                        }`}
                      >
                        {c.status === "ACTIVE" ? <UserMinus className="h-3 w-3 mr-1" /> : <UserPlusActive className="h-3 w-3 mr-1" />}
                        {c.status === "ACTIVE" ? "Suspend" : "Aktifkan"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCreators.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-400 text-xs font-bold">
                    Tidak ada kreator yang cocok dengan kata kunci pencarian.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
