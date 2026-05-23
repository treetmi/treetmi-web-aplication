"use client"

import React, { useState, useEffect } from "react"
import { ADMIN_API, PUBLIC_API } from "@/lib/api"
import { toast } from "sonner"
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Eye, 
  ExternalLink,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  UserX,
  UserCheck
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface UserReport {
  id: string
  reporter_name: string | null
  reporter_email: string
  target_user_id: string | null
  target_username: string | null
  category: string
  details: string
  screenshot_url: string
  status: string
  admin_notes: string | null
  createdAt: string
  target_user?: {
    username: string
    avatar_url: string | null
    status: string
  } | null
}

export default function ReportsTab() {
  const [reports, setReports] = useState<UserReport[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("ALL")
  const [filterStatus, setFilterStatus] = useState("ALL")

  // Selected Report for Moderation
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null)
  const [modStatus, setModStatus] = useState("")
  const [modNotes, setModNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Lightbox for screenshot preview
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // Fetch reports
  const fetchReports = async () => {
    try {
      setLoading(true)
      const res = await fetch(ADMIN_API.reports)
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setReports(json.data)
      } else {
        toast.error("Gagal memuat daftar laporan.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Terjadi kesalahan koneksi saat memuat laporan.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  // Action: Update Report status and notes
  const handleUpdateReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReport) return

    setIsSaving(true)
    try {
      const res = await fetch(ADMIN_API.updateReport(selectedReport.id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: modStatus,
          admin_notes: modNotes
        })
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Aduan laporan berhasil diperbarui!")
        setSelectedReport(null)
        fetchReports()
      } else {
        toast.error(json.message || "Gagal memperbarui status laporan.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Terjadi galat saat memperbarui status laporan.")
    } finally {
      setIsSaving(false)
    }
  }

  // Action: Suspend or Reactivate reported Creator
  const handleToggleCreatorSuspend = async (creatorId: string, currentStatus: string, username: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE"
    const confirmMsg = nextStatus === "SUSPENDED" 
      ? `Apakah Anda yakin ingin menangguhkan (SUSPEND) akun @${username}?`
      : `Apakah Anda yakin ingin mengaktifkan kembali akun @${username}?`

    if (!confirm(confirmMsg)) return

    try {
      const res = await fetch(ADMIN_API.creatorById(creatorId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus
        })
      })
      const json = await res.json()
      if (json.success) {
        if (nextStatus === "SUSPENDED") {
          toast.warning(`Akun @${username} telah dinonaktifkan (SUSPENDED).`)
        } else {
          toast.success(`Akun @${username} kembali diaktifkan (ACTIVE).`)
        }
        // Refresh local selected state if open
        if (selectedReport && selectedReport.target_user_id === creatorId) {
          setSelectedReport({
            ...selectedReport,
            target_user: selectedReport.target_user ? {
              ...selectedReport.target_user,
              status: nextStatus
            } : null
          })
        }
        fetchReports()
      } else {
        toast.error(json.message || "Gagal mengubah status moderasi kreator.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal mengubah status suspensi.")
    }
  }

  // Open moderation dialog
  const openModeration = (report: UserReport) => {
    setSelectedReport(report)
    setModStatus(report.status)
    setModNotes(report.admin_notes || "")
  }

  // Calculations for stats
  const totalCount = reports.length
  const pendingCount = reports.filter(r => r.status === "PENDING").length
  const investigatingCount = reports.filter(r => r.status === "INVESTIGATING").length
  const resolvedCount = reports.filter(r => r.status === "RESOLVED").length

  // Filtering reports
  const filteredReports = reports.filter(report => {
    // Search filter
    const matchesSearch = 
      report.reporter_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.reporter_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.target_username || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.details || "").toLowerCase().includes(searchQuery.toLowerCase())

    // Category filter
    const matchesCategory = filterCategory === "ALL" || report.category === filterCategory

    // Status filter
    const matchesStatus = filterStatus === "ALL" || report.status === filterStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Format Helper for dates
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  // Status Badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-red-500/10 text-red-500 border border-red-500/20 text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1.5 w-fit uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Baru
          </Badge>
        )
      case "INVESTIGATING":
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1.5 w-fit uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Investigasi
          </Badge>
        )
      case "RESOLVED":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1.5 w-fit uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Selesai
          </Badge>
        )
      case "DISMISSED":
        return (
          <Badge className="bg-neutral-500/10 text-neutral-400 border border-neutral-500/20 text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1.5 w-fit uppercase">
            Ditolak
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Category Badge styling
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "SCAM":
        return <Badge className="bg-red-500 text-white border-none text-[8px] font-black uppercase rounded">Penipuan</Badge>
      case "HARASSMENT":
        return <Badge className="bg-pink-500 text-white border-none text-[8px] font-black uppercase rounded">Pelecehan</Badge>
      case "DONATION":
        return <Badge className="bg-amber-500 text-black border-none text-[8px] font-black uppercase rounded">Donasi</Badge>
      case "OTHER":
      default:
        return <Badge className="bg-neutral-100 dark:bg-zinc-800 text-neutral-600 dark:text-neutral-300 border-none text-[8px] font-black uppercase rounded">Lainnya</Badge>
    }
  }

  return (
    <div className="space-y-8 w-full">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full">
        <Card className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm rounded-3xl overflow-hidden">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Total Aduan</span>
              <p className="text-2xl font-black italic">{totalCount}</p>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-100 dark:bg-zinc-800 text-neutral-500">
              <MessageSquare className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm rounded-3xl overflow-hidden">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Baru (Pending)</span>
              <p className="text-2xl font-black italic text-red-500">{pendingCount}</p>
            </div>
            <div className="p-3 rounded-2xl bg-red-500/10 text-red-500">
              <Clock className="h-5 w-5 animate-pulse" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm rounded-3xl overflow-hidden">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Investigasi</span>
              <p className="text-2xl font-black italic text-amber-500">{investigatingCount}</p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm rounded-3xl overflow-hidden">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Selesai</span>
              <p className="text-2xl font-black italic text-emerald-500">{resolvedCount}</p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-[#121211] border border-slate-200 dark:border-zinc-800 p-4 rounded-[2rem] shadow-sm w-full">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Cari berdasarkan pelapor, terlapor (creator), rincian..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 pl-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0 font-black italic">
            <Filter className="h-3.5 w-3.5" />
            Kategori:
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-11 px-3 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-white dark:bg-[#121211] text-black dark:text-white font-bold outline-none"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="SCAM">Penipuan (Scam)</option>
            <option value="HARASSMENT">Pelecehan (Harassment)</option>
            <option value="DONATION">Masalah Donasi</option>
            <option value="OTHER">Lainnya</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0 font-black italic ml-2">
            Status:
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-11 px-3 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-white dark:bg-[#121211] text-black dark:text-white font-bold outline-none"
          >
            <option value="ALL">Semua Status</option>
            <option value="PENDING">Baru (Pending)</option>
            <option value="INVESTIGATING">Investigasi</option>
            <option value="RESOLVED">Selesai</option>
            <option value="DISMISSED">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)] bg-white dark:bg-[#121211] overflow-hidden w-full">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center font-bold text-slate-400 dark:text-zinc-550 animate-pulse">
              Sedang memuat data aduan pelapor...
            </div>
          ) : (
            <Table className="w-full">
              <TableHeader className="bg-[#FAF9F6] dark:bg-[#1E1E1D]/40">
                <TableRow className="border-b border-slate-100 dark:border-zinc-900">
                  <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic px-8">Waktu Masuk</TableHead>
                  <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Pengadu (Reporter)</TableHead>
                  <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Terlapor (Creator)</TableHead>
                  <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Kategori</TableHead>
                  <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Bukti (Screenshot)</TableHead>
                  <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Rincian Keluhan</TableHead>
                  <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Status Tiket</TableHead>
                  <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic text-right px-8">Aksi Moderasi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map(r => (
                  <TableRow key={r.id} className="border-b border-slate-100/60 dark:border-zinc-800/40 hover:bg-slate-50/30">
                    <TableCell className="text-xs font-medium text-slate-400 px-8">
                      {formatDate(r.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-xs text-black dark:text-white truncate">
                          {r.reporter_name || "Anonim"}
                        </span>
                        <span className="text-[10px] font-bold text-neutral-400">
                          {r.reporter_email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {r.target_username ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-black dark:text-white">
                            @{r.target_username}
                          </span>
                          {r.target_user_id ? (
                            <Badge className={
                              r.target_user?.status === "SUSPENDED"
                                ? "bg-red-500 text-white text-[8px] font-black border-none"
                                : "bg-emerald-500 text-white text-[8px] font-black border-none"
                            }>
                              {r.target_user?.status || "ACTIVE"}
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-100 text-slate-400 text-[8px] font-medium border-none">
                              Not Registered
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-slate-400 italic">Tidak Disebutkan</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getCategoryBadge(r.category)}
                    </TableCell>
                    <TableCell>
                      {r.screenshot_url ? (
                        <div 
                          className="relative h-10 w-16 border border-neutral-200 dark:border-zinc-800 rounded-lg overflow-hidden cursor-pointer hover:border-[#FFD551] transition-all group shrink-0"
                          onClick={() => setPreviewImage(r.screenshot_url)}
                        >
                          <img 
                            src={r.screenshot_url} 
                            alt="Screenshot Proof" 
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="h-3.5 w-3.5 text-white" />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-red-500 font-bold">No Image</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="text-xs font-medium text-slate-600 dark:text-zinc-350 truncate" title={r.details}>
                        {r.details}
                      </p>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(r.status)}
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => openModeration(r)}
                        className="h-8 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-black italic text-[9px]"
                      >
                        🔍 Moderasi Tiket
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredReports.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-16 text-slate-400 text-xs font-bold">
                      Tidak ada laporan aduan yang cocok dengan kriteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Lightbox Modal */}
      {previewImage && (
        <Dialog open={true} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="max-w-3xl bg-neutral-950 p-2 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="relative w-full aspect-video flex items-center justify-center">
              <img 
                src={previewImage} 
                alt="Screenshot Full Proof" 
                className="max-h-[80vh] w-auto max-w-full object-contain rounded-2xl"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 bg-white/10 text-white hover:bg-white/20 border-none rounded-full h-8 w-8 p-0"
              >
                ✕
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Moderation Action Dialog */}
      {selectedReport && (
        <Dialog open={true} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-lg bg-[#F8F7F3] dark:bg-zinc-900 rounded-[2.5rem] border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="font-black text-2xl italic tracking-tighter flex items-center gap-2">
                <ShieldAlert className="h-6 w-6 text-red-500" />
                Moderasi Aduan Laporan
              </DialogTitle>
              <DialogDescription className="text-xs font-bold italic text-slate-400">
                Pilih status penyelesaian tiket dan lakukan tindakan disiplin pada kreator terlapor.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUpdateReport} className="space-y-5 pt-3">
              {/* Report Summary Capsule */}
              <div className="bg-slate-100/60 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-slate-400">Pelapor:</span>
                  <span className="font-bold">{selectedReport.reporter_name || "Anonim"} ({selectedReport.reporter_email})</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-slate-400">Terlapor:</span>
                  <span className="font-bold">@{selectedReport.target_username || "Tidak ada"}</span>
                </div>
                <div className="flex items-start justify-between text-xs gap-3">
                  <span className="font-black text-slate-400 shrink-0">Keluhan:</span>
                  <span className="font-bold text-right text-slate-700 dark:text-zinc-300 leading-normal">{selectedReport.details}</span>
                </div>
              </div>

              {/* Creator Moderation Actions */}
              {selectedReport.target_user_id && selectedReport.target_username && (
                <div className="border border-neutral-200 dark:border-zinc-800 p-4 rounded-2xl bg-white dark:bg-zinc-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-slate-500">Moderasi Akun Kreator</span>
                    <Badge className={
                      selectedReport.target_user?.status === "SUSPENDED" 
                        ? "bg-red-500 text-white font-black"
                        : "bg-emerald-500 text-white font-black"
                    }>
                      {selectedReport.target_user?.status || "ACTIVE"}
                    </Badge>
                  </div>

                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                    Tangguhkan/suspend akun kreator terlapor secara instan jika terbukti melakukan pelanggaran fatal/scam.
                  </p>

                  <Button
                    type="button"
                    onClick={() => handleToggleCreatorSuspend(
                      selectedReport.target_user_id!, 
                      selectedReport.target_user?.status || "ACTIVE", 
                      selectedReport.target_username!
                    )}
                    className={`w-full h-10 text-xs font-black italic rounded-xl ${
                      selectedReport.target_user?.status === "SUSPENDED"
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                        : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                  >
                    {selectedReport.target_user?.status === "SUSPENDED" ? (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Aktifkan Kembali Akun @{selectedReport.target_username}
                      </>
                    ) : (
                      <>
                        <UserX className="h-4 w-4 mr-2" />
                        Suspend Akun @{selectedReport.target_username}
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Status Selector */}
              <div className="space-y-2">
                <Label className="text-xs font-black italic text-slate-500">Status Tiket Laporan</Label>
                <select
                  value={modStatus}
                  onChange={(e) => setModStatus(e.target.value)}
                  className="w-full h-11 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 text-sm bg-white dark:bg-zinc-900 text-black dark:text-white font-bold outline-none"
                >
                  <option value="PENDING">PENDING (Baru Masuk)</option>
                  <option value="INVESTIGATING">INVESTIGATING (Sedang di-Investigasi)</option>
                  <option value="RESOLVED">RESOLVED (Keluhan Selesai / Ditindaklanjuti)</option>
                  <option value="DISMISSED">DISMISSED (Ditolak / Laporan Palsu)</option>
                </select>
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label className="text-xs font-black italic text-slate-500">Catatan/Keputusan Admin</Label>
                <Textarea
                  placeholder="Berikan alasan atau detail tindakan penyelesaian..."
                  value={modNotes}
                  onChange={(e) => setModNotes(e.target.value)}
                  className="min-h-[80px] rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-medium"
                />
              </div>

              <DialogFooter className="pt-2 gap-2 flex-col sm:flex-row">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setSelectedReport(null)}
                  className="border border-slate-200 rounded-xl text-xs font-black italic h-11"
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black rounded-xl text-xs font-black italic h-11 px-5"
                >
                  {isSaving ? "Menyimpan..." : "Simpan Keputusan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
