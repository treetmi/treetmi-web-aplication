"use client"
import React from "react"
import { useDashboard } from "../context/DashboardContext"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Ticket, Loader2 } from "lucide-react"

export default function SupportPage() {
  const { data: session } = useSession()
  const {
    tickets,
    newTicketTitle,
    setNewTicketTitle,
    newTicketMessage,
    setNewTicketMessage,
    isCreateTicketOpen,
    setIsCreateTicketOpen,
    selectedTicket,
    setSelectedTicket,
    newTicketCategory,
    setNewTicketCategory,
    handleCreateTicket
  } = useDashboard()

  if (!session) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm dark:bg-[#121211] dark:border-zinc-800/80">
        <div>
          <h2 className="text-sm md:text-base font-black italic tracking-widest flex items-center gap-2 text-black dark:text-[#FFD551]">
            <Ticket className="h-5 w-5" /> Tiket Bantuan & Pengaduan
          </h2>
          <p className="text-[11px] md:text-xs font-bold text-slate-400 italic mt-0.5">
            Ajukan perubahan rekening atau laporkan kendala teknis dan pencairan dana langsung ke admin.
          </p>
        </div>

        <Dialog open={isCreateTicketOpen} onOpenChange={setIsCreateTicketOpen}>
          <DialogTrigger
            render={
              <Button className="bg-[#FFD551] text-black border border-slate-200 dark:border-zinc-800 hover:bg-[#FFC83B] text-xs md:text-sm font-black italic h-10 px-5 rounded-2xl shadow-sm transition-all active:scale-95">
                <Plus className="mr-2 h-4 w-4" /> Buka Tiket Baru
              </Button>
            }
          />
          <DialogContent className="max-w-md bg-[#F8F7F3] dark:bg-[#121211] rounded-2xl border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl">
            <DialogHeader className="space-y-1 text-center">
              <DialogTitle className="text-2xl font-black italic tracking-tighter flex items-center justify-center gap-2 text-black dark:text-white">
                Buka Tiket Bantuan Baru
              </DialogTitle>
              <DialogDescription className="font-bold italic text-[11px] md:text-xs text-slate-400 tracking-widest">
                KIRIM PENGADUAN KE SUPERADMIN TREATME
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTicket} className="space-y-4 pt-4 text-[#1A1A19] dark:text-white">
              <div className="space-y-2">
                <Label className="font-black italic text-xs md:text-sm text-slate-500 dark:text-zinc-400">Kategori Tiket</Label>
                <select
                  value={newTicketCategory}
                  onChange={(e) => setNewTicketCategory(e.target.value)}
                  className="w-full h-11 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 font-bold bg-white dark:bg-zinc-900 text-black dark:text-white text-xs md:text-sm outline-none"
                >
                  <option value="BANK_CHANGE">Perubahan Rekening Bank (Locked)</option>
                  <option value="WITHDRAWAL_ISSUE">Kendala Penarikan Saldo</option>
                  <option value="OTHER">Lainnya / Masalah Teknis</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="font-black italic text-xs md:text-sm text-slate-500 dark:text-zinc-400">Subjek / Judul Tiket</Label>
                <Input
                  required
                  placeholder="Contoh: Pengajuan Ubah Rekening BCA ke Mandiri"
                  value={newTicketTitle}
                  onChange={(e) => setNewTicketTitle(e.target.value)}
                  className="h-11 border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white text-xs md:text-sm font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-black italic text-xs md:text-sm text-slate-500 dark:text-zinc-400">Deskripsi / Detail Pesan</Label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tuliskan detail perubahan rekening atau kendala yang Anda alami secara lengkap..."
                  value={newTicketMessage}
                  onChange={(e) => setNewTicketMessage(e.target.value)}
                  className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white text-xs md:text-sm p-3 focus:outline-none focus:ring-1 focus:ring-[#FFD551] leading-relaxed resize-none font-semibold"
                />
              </div>

              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full h-12 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black rounded-2xl font-black italic text-xs md:text-sm transition-all shadow-md">
                  Kirim Tiket Bantuan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
        <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
          <CardTitle className="font-black italic text-sm md:text-base tracking-wider text-black dark:text-[#FFD551]">
            Riwayat Tiket Bantuan Anda
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {tickets?.length === 0 ? (
            <div className="p-12 text-center text-xs md:text-sm font-bold text-slate-400 dark:text-zinc-500 italic">
              Belum ada tiket bantuan yang diajukan.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/20">
                <TableRow className="border-b border-slate-100 dark:border-zinc-900">
                  <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-xs md:text-sm px-8">ID Tiket</TableHead>
                  <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-xs md:text-sm">Judul Tiket</TableHead>
                  <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-xs md:text-sm">Kategori</TableHead>
                  <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-xs md:text-sm">Tanggal</TableHead>
                  <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-xs md:text-sm">Status</TableHead>
                  <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-xs md:text-sm text-right px-8">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets?.map((t: any) => (
                  <TableRow key={t.id} className="border-b border-slate-100/60 dark:border-zinc-800/40 hover:bg-slate-50/30">
                    <TableCell className="font-mono font-bold text-xs md:text-sm px-8">#{t.id.substring(0, 8).toUpperCase()}</TableCell>
                    <TableCell className="font-bold italic text-xs md:text-sm text-black dark:text-white">{t.subject}</TableCell>
                    <TableCell>
                      <Badge className="bg-slate-50 text-slate-600 dark:bg-zinc-900 dark:text-zinc-400 border border-slate-200/50 dark:border-zinc-800/50 font-black italic text-[10px] rounded-lg px-2.5 py-0.5">
                        {t.category === "BANK_CHANGE" ? "Ubah Rekening" : t.category === "WITHDRAWAL_ISSUE" ? "Kendala Withdrawal" : "Lainnya"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs md:text-sm font-bold text-slate-400 italic">
                      {new Date(t.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        t.status === "OPEN"
                          ? "bg-blue-50 text-blue-600 border border-blue-200/40 font-black italic text-[10px] rounded-lg px-2.5 py-0.5"
                          : t.status === "DI_BACA"
                            ? "bg-amber-50 text-amber-600 border border-amber-200/40 font-black italic text-[10px] rounded-lg px-2.5 py-0.5"
                            : "bg-green-50 text-green-600 border border-green-200/40 font-black italic text-[10px] rounded-lg px-2.5 py-0.5"
                      }>
                        {t.status === "OPEN" ? "TERKIRIM" : t.status === "DI_BACA" ? "DIBACA ADMIN" : "DIJAWAB ADMIN"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <Button
                        onClick={() => setSelectedTicket(t)}
                        className="h-8 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black hover:bg-slate-900 rounded-xl font-black italic text-[10px] md:text-xs px-3.5 shadow-sm"
                      >
                        Detail Tiket
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
          <DialogContent className="max-w-md bg-[#F8F7F3] dark:bg-[#121211] rounded-2xl border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-xl font-black italic tracking-tighter text-black dark:text-white">
                Detail Tiket #{selectedTicket.id.substring(0, 8).toUpperCase()}
              </DialogTitle>
              <Badge className="w-fit bg-amber-500/10 text-amber-500 border-none font-black italic text-[10px] px-2.5 py-0.5">
                {selectedTicket.category === "BANK_CHANGE" ? "Perubahan Rekening" : selectedTicket.category === "WITHDRAWAL_ISSUE" ? "Kendala Withdrawal" : "Lainnya"}
              </Badge>
            </DialogHeader>
            <div className="space-y-4 mt-4 text-[#1A1A19] dark:text-white">
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800/80">
                <h4 className="text-xs font-black italic text-slate-400">Judul Tiket</h4>
                <p className="text-sm md:text-base font-bold mt-1 text-black dark:text-white">{selectedTicket.subject}</p>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800/80">
                <h4 className="text-xs font-black italic text-slate-400">Deskripsi Masalah</h4>
                <p className="text-xs md:text-sm font-semibold leading-relaxed mt-1 text-slate-600 dark:text-zinc-300">{selectedTicket.description}</p>
              </div>

              <div className="bg-[#FFD551]/10 border border-[#FFD551]/30 p-4 rounded-2xl">
                <h4 className="text-xs font-black italic text-amber-500">Tanggapan Admin Treatme</h4>
                <p className="text-xs md:text-sm font-bold leading-relaxed mt-1.5 text-black dark:text-white">
                  {selectedTicket.admin_reply ? selectedTicket.admin_reply : "Menunggu tanggapan dari tim Support Treatme..."}
                </p>
              </div>

              <Button 
                onClick={() => setSelectedTicket(null)}
                className="w-full h-11 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black rounded-xl font-black italic text-xs md:text-sm mt-2"
              >
                Tutup Detail
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
