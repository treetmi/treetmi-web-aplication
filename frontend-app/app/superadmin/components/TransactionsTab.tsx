"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Calendar, 
  User, 
  MessageSquare, 
  DollarSign, 
  Hash,
  ArrowUpDown
} from "lucide-react"

interface TransactionsTabProps {
  transactions: any[]
  creators?: any[]
}

export default function TransactionsTab({ transactions, creators = [] }: TransactionsTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [creatorFilter, setCreatorFilter] = useState("ALL")
  const [sortBy, setSortBy] = useState("DATE_DESC")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [selectedTx, setSelectedTx] = useState<any | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // Filter transactions based on search query, type filter, and creator filter
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // 1. Search Query Filter (covers ID, Sender, Creator, Message)
      const matchesSearch = 
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.reference_id && t.reference_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.message && t.message.toLowerCase().includes(searchQuery.toLowerCase()))

      // 2. Type Dropdown Filter (matches rawType: DONATION, MABAR, GACHA, GIFT)
      const matchesType = typeFilter === "ALL" || t.rawType === typeFilter

      // 3. Creator Dropdown Filter (matches creator username)
      const matchesCreator = creatorFilter === "ALL" || t.creator.toLowerCase() === creatorFilter.toLowerCase()

      return matchesSearch && matchesType && matchesCreator
    })
  }, [transactions, searchQuery, typeFilter, creatorFilter])

  // Sort transactions based on selected option
  const sortedTransactions = useMemo(() => {
    const list = [...filteredTransactions]

    // Date parsing helper for Indonesian formats like "22 Mei 2026 15:30"
    const parseIndonesianDate = (dateStr: string) => {
      try {
        const months: { [key: string]: number } = {
          jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, jun: 5,
          jul: 6, agt: 7, sep: 8, okt: 9, nov: 10, des: 11
        }
        const parts = dateStr.toLowerCase().split(/\s+/)
        if (parts.length >= 4) {
          const day = parseInt(parts[0], 10)
          const monthStr = parts[1].substring(0, 3)
          const month = months[monthStr] !== undefined ? months[monthStr] : 0
          const year = parseInt(parts[2], 10)
          const timeParts = parts[3].split(":")
          const hour = parseInt(timeParts[0], 10)
          const minute = parseInt(timeParts[1], 10)
          return new Date(year, month, day, hour, minute).getTime()
        }
      } catch (e) {
        console.error("Failed to parse date string:", dateStr, e)
      }
      return 0
    }

    if (sortBy === "DATE_DESC") {
      list.sort((a, b) => parseIndonesianDate(b.time) - parseIndonesianDate(a.time))
    } else if (sortBy === "DATE_ASC") {
      list.sort((a, b) => parseIndonesianDate(a.time) - parseIndonesianDate(b.time))
    } else if (sortBy === "AMOUNT_DESC") {
      list.sort((a, b) => b.amount - a.amount)
    } else if (sortBy === "AMOUNT_ASC") {
      list.sort((a, b) => a.amount - b.amount)
    } else if (sortBy === "FEE_DESC") {
      list.sort((a, b) => b.fee - a.fee)
    } else if (sortBy === "NET_DESC") {
      list.sort((a, b) => b.net - a.net)
    }

    return list
  }, [filteredTransactions, sortBy])

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, typeFilter, creatorFilter, sortBy])

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(sortedTransactions.length / itemsPerPage))
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedTransactions.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedTransactions, currentPage])

  // Open details modal
  const handleOpenDetails = (tx: any) => {
    setSelectedTx(tx)
    setIsDetailsOpen(true)
  }

  return (
    <div className="space-y-6 w-full">
      {/* FILTER & SEARCH BAR */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 bg-white dark:bg-[#121211] border border-slate-200 dark:border-zinc-800 p-4 rounded-[2rem] shadow-sm w-full">
        {/* Real-time search */}
        <div className="relative col-span-1 xl:col-span-2 w-full">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Cari transaksi berdasarkan ID, pengirim, kreator, atau pesan..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 pl-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
          />
        </div>

        {/* Creator filter dropdown */}
        <div className="relative w-full flex items-center gap-2">
          <User className="h-4 w-4 text-slate-400 shrink-0" />
          <select 
            value={creatorFilter}
            onChange={(e) => setCreatorFilter(e.target.value)}
            className="w-full h-11 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 text-xs bg-white text-black dark:bg-[#121211] dark:text-white font-bold outline-none focus:ring-2 focus:ring-[#FFD551]"
          >
            <option value="ALL">Semua Kreator Target</option>
            {creators.map((c) => (
              <option key={c.id} value={c.username}>
                @{c.username}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter & Sort by Grid */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {/* Type Filter */}
          <div className="relative flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full h-11 border border-slate-200 dark:border-zinc-800 rounded-xl px-2 text-[10px] bg-white text-black dark:bg-[#121211] dark:text-white font-bold outline-none focus:ring-2 focus:ring-[#FFD551]"
            >
              <option value="ALL">Semua Tipe</option>
              <option value="DONATION">Donasi</option>
              <option value="MABAR">Mabar</option>
              <option value="GIFT">Gift</option>
              <option value="GACHA">Gacha</option>
            </select>
          </div>

          {/* Sort By Selector */}
          <div className="relative flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-11 border border-slate-200 dark:border-zinc-800 rounded-xl px-2 text-[10px] bg-white text-black dark:bg-[#121211] dark:text-white font-bold outline-none focus:ring-2 focus:ring-[#FFD551]"
            >
              <option value="DATE_DESC">Terbaru (Waktu)</option>
              <option value="DATE_ASC">Terlama (Waktu)</option>
              <option value="AMOUNT_DESC">GTV Tertinggi</option>
              <option value="AMOUNT_ASC">GTV Terendah</option>
              <option value="FEE_DESC">Fee Tertinggi</option>
              <option value="NET_DESC">Net Tertinggi</option>
            </select>
          </div>
        </div>
      </div>

      {/* DATATABLE */}
      <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)] bg-white dark:bg-[#121211] overflow-hidden w-full">
        <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-xs font-black tracking-wider text-black dark:text-[#FFD551]">Log Aliran Transaksi Masuk Platform</CardTitle>
              <CardDescription className="text-xs font-bold italic text-slate-400">Semua perputaran uang realtime dari penonton beserta rincian pembagian fee komisi pemilik platform</CardDescription>
            </div>
            <Badge className="bg-black text-[#FFD551] dark:bg-[#FFD551]/10 dark:text-[#FFD551] border-none text-[9px] font-black rounded-lg py-1 px-2.5 w-fit">
              {sortedTransactions.length} Log Ditemukan
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="w-full">
            <TableHeader className="bg-[#FAF9F6] dark:bg-[#1E1E1D]/40">
              <TableRow className="border-b border-slate-100 dark:border-zinc-900">
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic px-8">ID Transaksi</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Nama Viewer</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Kreator Target</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Total Kotor (GTV)</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Platform Fee</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Net Kreator</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Tipe Dukungan</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Pesan Dukungan</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic text-right px-8">Rincian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.map((t) => (
                <TableRow key={t.id} className="border-b border-slate-100/60 dark:border-zinc-800/40 hover:bg-slate-50/30">
                  <TableCell className="font-mono text-xs font-bold px-8">
                    <span className="text-slate-500">{t.id ? t.id.substring(0, 8) : ""}</span>
                  </TableCell>
                  <TableCell className="text-xs font-bold italic">{t.sender}</TableCell>
                  <TableCell className="text-xs font-bold">
                    <div className="flex items-center gap-2 italic text-indigo-500 dark:text-indigo-400">
                      <div className="w-6 h-6 rounded-full border border-[#FFD551]/30 overflow-hidden bg-white shrink-0 flex items-center justify-center text-[10px] font-black text-black">
                        {t.creator_avatar ? (
                          <img src={t.creator_avatar} alt={t.creator} className="w-full h-full object-cover" />
                        ) : (
                          t.creator.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <span>@{t.creator}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-black text-slate-900 dark:text-white">
                    Rp {t.amount.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="text-xs font-black text-emerald-500">
                    + Rp {t.fee.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="text-xs font-black text-[#FFC83B]">
                    Rp {t.net.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <Badge className={`border text-[9px] font-black rounded-lg px-2 py-0.5 border-none ${
                      t.rawType === "MABAR"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                        : t.rawType === "GIFT"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                        : t.rawType === "GACHA"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                    }`}>
                      {t.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[150px] truncate text-[11px] font-bold text-slate-500 italic bg-[#FAF9F6] dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800 rounded-lg px-2 py-1 relative group cursor-help" title={t.message}>
                      {t.message || "Dukungan untuk kreator!"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <Button 
                      size="xs"
                      onClick={() => handleOpenDetails(t)}
                      className="h-7 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black hover:scale-105 active:scale-95 border-none font-black italic text-[9px] px-3 rounded-lg cursor-pointer"
                    >
                      <Eye className="h-3 w-3 mr-1" /> Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-400 text-xs font-bold">
                    Tidak ada log transaksi yang cocok dengan kriteria filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* PAGINATION CONTROL BAR */}
          <div className="flex items-center justify-between px-8 py-4 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-t border-slate-100 dark:border-zinc-900">
            <span className="text-[10px] font-bold text-slate-400 italic">
              Menampilkan {Math.min(sortedTransactions.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(sortedTransactions.length, currentPage * itemsPerPage)} dari {sortedTransactions.length} transaksi
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="xs"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="h-8 border border-slate-200 rounded-xl px-2 text-[10px] font-bold"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-0.5" /> Prev
              </Button>
              <span className="text-[10px] font-black italic px-2">
                Page {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="xs"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="h-8 border border-slate-200 rounded-xl px-2 text-[10px] font-bold"
              >
                Next <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ITEMIZED DETAILS MODAL */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-lg bg-[#F8F7F3] rounded-[2rem] border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl text-[#1A1A19]">
          <DialogHeader>
            <DialogTitle className="font-black text-2xl italic tracking-tighter flex items-center gap-2">
              <span>💳</span> Rincian Komisi Transaksi
            </DialogTitle>
            <DialogDescription className="text-xs font-bold italic text-slate-450">
              Breakdown lengkap pembagian pendapatan kotor dan bersih platform.
            </DialogDescription>
          </DialogHeader>

          {selectedTx && (
            <div className="space-y-6 pt-4">
              {/* Top Summary Bento Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-zinc-900/60 p-4 rounded-2xl border border-slate-200/55 dark:border-zinc-800 flex flex-col justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase italic">GTV (Gross Amount)</span>
                  <span className="text-lg font-black text-black dark:text-[#FFD551] mt-1">
                    Rp {selectedTx.amount.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="bg-[#FFD551]/10 p-4 rounded-2xl border border-[#FFD551]/30 flex flex-col justify-between">
                  <span className="text-[10px] font-black text-amber-600 uppercase italic">Platform Commission (Owner)</span>
                  <span className="text-lg font-black text-emerald-500 mt-1">
                    + Rp {selectedTx.fee.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Data Properties List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs py-2 border-b border-slate-200/50 dark:border-zinc-800/40">
                  <span className="font-bold text-slate-400 flex items-center gap-1.5"><Hash className="h-3.5 w-3.5" /> ID Transaksi</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-zinc-300">{selectedTx.id}</span>
                </div>

                {selectedTx.reference_id && (
                  <div className="flex items-center justify-between text-xs py-2 border-b border-slate-200/50 dark:border-zinc-800/40">
                    <span className="font-bold text-slate-400 flex items-center gap-1.5"><Hash className="h-3.5 w-3.5" /> Ref ID (Xendit/Midtrans)</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-zinc-300">{selectedTx.reference_id}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs py-2 border-b border-slate-200/50 dark:border-zinc-800/40">
                  <span className="font-bold text-slate-400 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Tanggal & Waktu</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-300">{selectedTx.time}</span>
                </div>

                <div className="flex items-center justify-between text-xs py-2 border-b border-slate-200/50 dark:border-zinc-800/40">
                  <span className="font-bold text-slate-400 flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Pengirim (Viewer)</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-300 italic">{selectedTx.sender}</span>
                </div>

                <div className="flex items-center justify-between text-xs py-2 border-b border-slate-200/50 dark:border-zinc-800/40">
                  <span className="font-bold text-slate-400 flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Kreator Penerima</span>
                  <span className="font-bold text-indigo-500 dark:text-indigo-400">@{selectedTx.creator}</span>
                </div>

                <div className="flex items-center justify-between text-xs py-2 border-b border-slate-200/50 dark:border-zinc-800/40">
                  <span className="font-bold text-slate-400 flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5" /> Tipe & Komisi</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-300">{selectedTx.type}</span>
                </div>

                {selectedTx.gift_name && (
                  <div className="flex items-center justify-between text-xs py-2 border-b border-slate-200/50 dark:border-zinc-800/40">
                    <span className="font-bold text-slate-400 flex items-center gap-1.5">🎁 Item Gift Animasi</span>
                    <span className="font-black text-rose-500 uppercase">{selectedTx.gift_name}</span>
                  </div>
                )}
              </div>

              {/* Message Bubble Card */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-450 uppercase italic flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> Pesan Dukungan</span>
                <div className="bg-white dark:bg-zinc-900/60 p-4 rounded-2xl border border-slate-200/55 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-350 italic font-bold leading-relaxed">
                  "{selectedTx.message || "Dukungan untuk kreator!"}"
                </div>
              </div>

              {/* Final Net Creator Block */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-between shadow-md">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-wider opacity-90">Net Creator Share</span>
                  <span className="text-xs opacity-75 font-medium italic mt-0.5">Sudah dipotong komisi platform</span>
                </div>
                <span className="text-xl font-black">
                  Rp {selectedTx.net.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
