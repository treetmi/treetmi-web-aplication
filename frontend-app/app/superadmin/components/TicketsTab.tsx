"use client"

import React, { useState } from "react"
import { MessageSquare, Check, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { API_BASE_URL } from "@/lib/api"

interface TicketsTabProps {
  tickets: any[]
  fetchTickets: () => void
}

export default function TicketsTab({ 
  tickets, 
  fetchTickets 
}: TicketsTabProps) {
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null)
  const [adminReplyText, setAdminReplyText] = useState("")
  const [ticketStatus, setTicketStatus] = useState("DI_BACA")

  const handleOpenRespond = (t: any) => {
    setSelectedTicket(t)
    setAdminReplyText(t.admin_reply || "")
    setTicketStatus(t.status || "DI_BACA")
  }

  const handleRespondSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicket) return

    try {
      const res = await fetch(`${API_BASE_URL}/tickets/admin/${selectedTicket.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: ticketStatus,
          admin_reply: adminReplyText
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Tiket bantuan berhasil ditanggapi!")
        setSelectedTicket(null)
        setAdminReplyText("")
        fetchTickets() // Reload data
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan tanggapan tiket.")
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)] bg-white dark:bg-[#121211] overflow-hidden w-full">
        <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
          <CardTitle className="text-xs font-black tracking-wider text-black dark:text-[#FFD551]">🎫 Daftar Tiket Pengaduan & Bantuan User</CardTitle>
          <CardDescription className="text-xs font-bold italic text-slate-400">Tinjau, ubah status baca, dan kirim tanggapan resmi superadmin ke tiket bantuan kreator</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="w-full">
            <TableHeader className="bg-[#FAF9F6] dark:bg-[#1E1E1D]/40">
              <TableRow className="border-b border-slate-100 dark:border-zinc-900">
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic px-8">ID Tiket</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Kreator</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Kategori</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Subjek / Judul</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Tanggal Masuk</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Status</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic text-right px-8">Aksi Tindakan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map(t => (
                <TableRow key={t.id} className="border-b border-slate-100/60 dark:border-zinc-800/40 hover:bg-slate-50/30">
                  <TableCell className="font-mono text-xs font-bold px-8">{t.id ? t.id.substring(0, 8).toUpperCase() : ""}</TableCell>
                  <TableCell className="text-xs font-bold">
                    <div className="flex items-center gap-2 italic">
                      <div className="w-6 h-6 rounded-full border border-[#FFD551]/30 overflow-hidden bg-white shrink-0 flex items-center justify-center text-[10px] font-black text-black">
                        {t.streamer?.avatar_url ? (
                          <img src={t.streamer.avatar_url} alt={t.streamer.username} className="w-full h-full object-cover" />
                        ) : (
                          t.streamer?.username?.substring(0, 2).toUpperCase() || "US"
                        )}
                      </div>
                      <span>@{t.streamer?.username || "kreator"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-slate-50 text-slate-600 dark:bg-zinc-900 dark:text-zinc-400 border border-slate-200/50 font-black italic text-[9px] rounded-lg px-2">
                      {t.category === "BANK_CHANGE" ? "Ubah Rekening" : t.category === "WITHDRAWAL_ISSUE" ? "Kendala Payout" : "Lainnya"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-bold italic text-slate-900 dark:text-white max-w-[200px] truncate">{t.subject}</TableCell>
                  <TableCell className="text-[10px] font-bold text-slate-400 italic">
                    {new Date(t.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      t.status === "OPEN"
                        ? "bg-blue-50 text-blue-600 border border-blue-200/45 font-black italic text-[9px] rounded-lg px-2 py-0.5 animate-pulse"
                        : t.status === "DI_BACA"
                          ? "bg-amber-50 text-amber-600 border border-amber-200/45 font-black italic text-[9px] rounded-lg px-2 py-0.5"
                          : "bg-green-50 text-green-600 border border-green-200/45 font-black italic text-[9px] rounded-lg px-2 py-0.5"
                    }>
                      {t.status === "OPEN" ? "TERKIRIM" : t.status === "DI_BACA" ? "DIBACA ADMIN" : "DIJAWAB"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <Button 
                      size="xs"
                      onClick={() => handleOpenRespond(t)}
                      className="h-8 bg-black text-[#FFD551] hover:bg-slate-900 dark:bg-[#FFD551] dark:text-black dark:hover:bg-[#FFC83B] rounded-xl text-[9px] font-black italic transition-all px-3.5"
                    >
                      <MessageSquare className="mr-1 h-3.5 w-3.5" /> Tanggapi Tiket
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {tickets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-400 text-xs font-bold italic">
                    Tidak ada tiket bantuan dari user saat ini.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Admin Reply Ticket Dialog */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
          <DialogContent className="max-w-md bg-[#F8F7F3] dark:bg-[#121211] rounded-[2rem] border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-xl font-black italic tracking-tighter text-black dark:text-white">
                Tanggapi Tiket #{selectedTicket.id.substring(0, 8).toUpperCase()}
              </DialogTitle>
              <DialogDescription className="text-xs font-bold italic text-slate-400">
                Kirim tanggapan resmi Anda untuk kreator @{selectedTicket.streamer?.username}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRespondSubmit} className="space-y-4 mt-4 text-[#1A1A19] dark:text-white">
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800/80">
                <h4 className="text-xs font-black italic text-slate-400">Subjek Tiket</h4>
                <p className="text-xs font-bold mt-1 text-black dark:text-white">{selectedTicket.subject}</p>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800/80">
                <h4 className="text-xs font-black italic text-slate-400">Pesan Pengaduan Kreator</h4>
                <p className="text-xs font-semibold leading-relaxed mt-1 text-slate-600 dark:text-zinc-300">{selectedTicket.description}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black italic text-slate-500 dark:text-zinc-400">Update Status Tiket</Label>
                <select
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value)}
                  className="w-full h-11 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 font-bold bg-white dark:bg-zinc-900 text-black dark:text-white text-sm outline-none"
                >
                  <option value="OPEN">Terkirim (Open)</option>
                  <option value="DI_BACA">Sedang Dibaca (Proses)</option>
                  <option value="DI_JAWAB">Dijawab (Selesai)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black italic text-slate-500 dark:text-zinc-400">Tanggapan / Jawaban Admin</Label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tulis tanggapan atau instruksi penyelesaian untuk kreator..."
                  value={adminReplyText}
                  onChange={(e) => setAdminReplyText(e.target.value)}
                  className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white text-xs p-3 focus:outline-none focus:ring-1 focus:ring-[#FFD551] leading-relaxed resize-none font-medium"
                />
              </div>

              <DialogFooter className="pt-2">
                <div className="flex gap-3 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedTicket(null)}
                    className="h-12 flex-1 border border-slate-200 dark:border-zinc-800 text-slate-500 rounded-2xl font-black italic text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="h-12 flex-1 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black rounded-2xl font-black italic text-xs"
                  >
                    Simpan & Tanggapi
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
