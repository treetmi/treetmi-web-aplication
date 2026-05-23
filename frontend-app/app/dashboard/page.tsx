"use client"
import React from "react"
import { useDashboard } from "./context/DashboardContext"
import { useSession } from "next-auth/react"
import { useLanguage } from "@/components/language-provider"
import { useCurrency } from "@/components/currency-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Wallet, CreditCard, ArrowUpRight, Users, Play, Music2, Camera, Mic, Gamepad2, Gift, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { fetchWithRetry } from "@/lib/api"

export default function DashboardPage() {
  const { data: session } = useSession()
  const { lang } = useLanguage()
  const { format, convertFromIdr } = useCurrency()
  
  const {
    profile,
    balance,
    totalGross,
    transactions,
    withdrawals,
    isWithdrawOpen,
    setIsWithdrawOpen,
    withdrawAmount,
    setWithdrawAmount,
    bankName,
    setBankName,
    bankNumber,
    setBankNumber,
    bankHolder,
    setBankHolder,
    handleWithdrawSubmit,
    financeSubTab,
    setFinanceSubTab,
    financeFilter,
    setFinanceFilter,
    financePage,
    setFinancePage,
    feeDonation,
    feeMabar,
    feeGift
  } = useDashboard()

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"

  // Calculate transparent income breakdown from real transaction net_amounts
  const successTxs = transactions.filter((t: any) => t.status === "SUCCESS" && t.type !== "WITHDRAWAL")
  const netRegularDonation = successTxs
    .filter((t: any) => t.type === "DONATION" && !t.gift_id)
    .reduce((sum: number, t: any) => sum + (Number(t.net_amount) || 0), 0)
  const netGiftDonation = successTxs
    .filter((t: any) => t.type === "DONATION" && t.gift_id)
    .reduce((sum: number, t: any) => sum + (Number(t.net_amount) || 0), 0)
  const netMabar = successTxs
    .filter((t: any) => t.type === "MABAR")
    .reduce((sum: number, t: any) => sum + (Number(t.net_amount) || 0), 0)

  const getInteractionMeta = (tx: any) => {
    const mediaType = tx.donation_media?.media_type
    if (mediaType === "YOUTUBE") return { label: "YouTube", icon: Play, className: "bg-red-50 text-red-600 border-red-200/50" }
    if (mediaType === "TIKTOK") return { label: "TikTok", icon: Music2, className: "bg-teal-50 text-teal-600 border-teal-200/50" }
    if (mediaType === "REELS") return { label: "IG Reels", icon: Camera, className: "bg-pink-50 text-pink-600 border-pink-200/50" }
    if (mediaType === "VOICE_NOTE") return { label: "Voice Note", icon: Mic, className: "bg-emerald-50 text-emerald-600 border-emerald-200/50" }
    if (mediaType === "TEBAK_GAMBAR") return { label: "Tebak Gambar", icon: Gamepad2, className: "bg-amber-50 text-amber-600 border-amber-200/50" }
    if (tx.gift) return { label: `Gift: ${tx.gift.name}`, icon: Gift, className: "bg-yellow-50 text-yellow-700 border-yellow-200/50" }
    if (tx.gacha_log) return { label: `Gacha: ${tx.gacha_log.reward_name}`, icon: Sparkles, className: "bg-[#FFD551]/10 text-[#FFD551] border-[#FFD551]/30 dark:bg-[#FFD551]/5" }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Cards Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Balance Wallet */}
        <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden bg-white dark:bg-[#121211]">
          <CardHeader className="bg-[#FFD551] border-b border-slate-200/10 py-5 flex flex-row items-center justify-between text-black">
            <CardTitle className="font-black italic text-sm tracking-widest flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Dompet Saldo
            </CardTitle>
            <ArrowUpRight className="h-5 w-5" />
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-3xl font-black italic tracking-tighter">
              {format(convertFromIdr(balance))}
            </p>
            <p className="text-[9px] font-bold text-muted-foreground italic mt-1.5">
              Komisi per tipe: Donasi {feeDonation}% · Gift Animasi {feeGift}% · Mabar {feeMabar}%
            </p>
            
            <Button
              onClick={() => setIsWithdrawOpen(true)}
              className="w-full h-11 bg-black text-[#FFD551] hover:bg-slate-900 border border-black rounded-2xl font-black italic text-xs transition-all mt-6 shadow-sm active:scale-[0.98]"
            >
              Tarik Dana Sekarang
            </Button>
          </CardContent>
        </Card>

        {/* Card 2: Total Revenue */}
        <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden bg-white dark:bg-[#121211]">
          <CardHeader className="bg-[#FAF9F6] border-b border-slate-200/50 py-5 flex flex-row items-center justify-between text-black dark:bg-[#1E1E1D]/55 dark:text-white dark:border-zinc-800">
            <CardTitle className="font-black italic text-sm tracking-widest flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#FFD551]" /> Total Akumulasi
            </CardTitle>
            <ArrowUpRight className="h-5 w-5 text-slate-400" />
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-3xl font-black italic tracking-tighter">
              {format(convertFromIdr(totalGross))}
            </p>
            <p className="text-[9px] font-bold text-muted-foreground italic mt-1.5">
              Pendapatan kotor sebelum potongan platform
            </p>
            <div className="w-full bg-[#FAF9F6] border border-slate-200/50 rounded-2xl p-3.5 mt-6 flex justify-between items-center dark:bg-zinc-900/55 dark:border-zinc-800/80">
              <span className="text-[9px] font-black italic text-slate-400">Pencapaian:</span>
              <Badge className="bg-[#FFD551]/20 text-black border border-[#FFD551]/30 hover:bg-[#FFD551]/20 font-black italic text-[9px] px-2.5 py-0.5 rounded-lg dark:text-[#FFD551]">
                Verified Creator
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Success Transactions */}
        <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden bg-white dark:bg-[#121211]">
          <CardHeader className="bg-[#FAF9F6] border-b border-slate-200/50 py-5 flex flex-row items-center justify-between text-black dark:bg-[#1E1E1D]/55 dark:text-white dark:border-zinc-800">
            <CardTitle className="font-black italic text-sm tracking-widest flex items-center gap-2">
              <Users className="h-4 w-4 text-[#FFD551]" /> Transaksi Terverifikasi
            </CardTitle>
            <ArrowUpRight className="h-5 w-5 text-slate-400" />
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-3xl font-black italic tracking-tighter">
              {transactions.length} Transaksi
            </p>
            <p className="text-[9px] font-bold text-muted-foreground italic mt-1.5">
              Semua donasi dan pesanan jasa terbayar sukses
            </p>
            <div className="w-full bg-[#FAF9F6] border border-slate-200/50 rounded-2xl p-3.5 mt-6 flex justify-between items-center dark:bg-zinc-900/55 dark:border-zinc-800/80">
              <span className="text-[9px] font-black italic text-slate-400">Status Reputasi:</span>
              <span className="text-xs font-black italic text-amber-500">★★★★★ (5.0)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transparansi Bagi Hasil Finansial */}
      <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
        <CardHeader className="py-4 px-6 bg-gradient-to-r from-[#FFD551]/10 to-amber-50/40 dark:from-[#FFD551]/5 dark:to-amber-900/5 border-b border-slate-100 dark:border-zinc-900">
          <CardTitle className="font-black italic text-xs tracking-wider text-black dark:text-[#FFD551] flex items-center gap-2">
            📊 Transparansi Bagi Hasil Finansial
          </CardTitle>
          <CardDescription className="font-bold italic text-[9px] text-slate-400 mt-0.5">
            Rincian pendapatan bersih Anda berdasarkan tipe transaksi setelah dipotong komisi platform resmi
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-zinc-900">
            {/* Regular Donation */}
            <div className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                <span className="text-[10px] font-black uppercase italic tracking-wider text-slate-500 dark:text-zinc-400">Donasi Langsung</span>
              </div>
              <p className="text-xl font-black italic tracking-tight">
                {format(convertFromIdr(netRegularDonation))}
              </p>
              <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl px-2.5 py-1.5 w-fit">
                <span className="text-[9px] font-black italic text-blue-600 dark:text-blue-400">Setelah potongan komisi platform resmi: {feeDonation}%</span>
              </div>
              <p className="text-[8px] font-bold text-slate-400 italic">Pendapatan bersih dari donasi tanpa gift animasi</p>
            </div>

            {/* Gift Donation */}
            <div className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFD551] shrink-0" />
                <span className="text-[10px] font-black uppercase italic tracking-wider text-slate-500 dark:text-zinc-400">Gift Animasi Live</span>
              </div>
              <p className="text-xl font-black italic tracking-tight">
                {format(convertFromIdr(netGiftDonation))}
              </p>
              <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl px-2.5 py-1.5 w-fit">
                <span className="text-[9px] font-black italic text-amber-700 dark:text-amber-400">Setelah potongan komisi platform resmi: {feeGift}%</span>
              </div>
              <p className="text-[8px] font-bold text-slate-400 italic">Pendapatan bersih dari donasi dengan gift animasi bergerak</p>
            </div>

            {/* Mabar / Services */}
            <div className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-[10px] font-black uppercase italic tracking-wider text-slate-500 dark:text-zinc-400">Jasa Mabar</span>
              </div>
              <p className="text-xl font-black italic tracking-tight">
                {format(convertFromIdr(netMabar))}
              </p>
              <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl px-2.5 py-1.5 w-fit">
                <span className="text-[9px] font-black italic text-emerald-700 dark:text-emerald-400">Setelah potongan komisi platform resmi: {feeMabar}%</span>
              </div>
              <p className="text-[8px] font-bold text-slate-400 italic">Pendapatan bersih dari pesanan main bareng</p>
            </div>
          </div>
          <div className="px-5 py-3 border-t border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/30">
            <p className="text-[8px] font-bold text-slate-400 italic">
              ✅ Semua persentase potongan komisi di atas diambil secara langsung dari konfigurasi database Superadmin yang berlaku saat ini — tidak ada angka yang bersifat hardcoded. Platform Treatme berkomitmen 100% Fair &amp; Transparan.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Unified Transaction History Card */}
      <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
        <CardHeader className="py-5 px-6 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="font-black italic text-xs tracking-wider text-black dark:text-[#FFD551] flex items-center gap-2">
                Data Transaksi Keuangan
              </CardTitle>
              <CardDescription className="font-bold italic text-[9px] text-slate-400 mt-1">
                Riwayat lengkap pemasukan dan pencairan dana Anda
              </CardDescription>
            </div>
            <div className="flex items-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full p-0.5 shadow-sm">
              <button
                onClick={() => { setFinanceSubTab("income"); setFinancePage(1) }}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black italic tracking-wider transition-all ${
                  financeSubTab === "income"
                    ? "bg-[#FFD551] text-black shadow-sm"
                    : "text-slate-400 hover:text-black dark:hover:text-white"
                }`}
              >
                Pemasukan
              </button>
              <button
                onClick={() => { setFinanceSubTab("payout"); setFinancePage(1) }}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black italic tracking-wider transition-all ${
                  financeSubTab === "payout"
                    ? "bg-[#FFD551] text-black shadow-sm"
                    : "text-slate-400 hover:text-black dark:hover:text-white"
                }`}
              >
                Pencairan
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {financeSubTab === "income" ? (
            /* === PEMASUKAN TABLE === */
            <div>
              {/* Category Filter */}
              <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-100 dark:border-zinc-800/60">
                <span className="text-[9px] font-black italic text-slate-400 uppercase tracking-wider">Filter:</span>
                {(["SEMUA", "DONATION", "MABAR"] as const).map((cat) => {
                  const count = cat === "SEMUA" 
                    ? transactions.filter((t: any) => t.type !== "WITHDRAWAL").length
                    : transactions.filter((t: any) => t.type === cat).length
                  return (
                    <button
                      key={cat}
                      onClick={() => { setFinanceFilter(cat); setFinancePage(1) }}
                      className={`px-3 py-1 rounded-lg text-[9px] font-black italic tracking-wider transition-all ${
                        financeFilter === cat
                          ? cat === "DONATION" ? "bg-blue-500 text-white shadow-sm"
                            : cat === "MABAR" ? "bg-amber-500 text-white shadow-sm"
                            : "bg-black text-white shadow-sm"
                          : "bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-500 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {cat === "SEMUA" ? "Semua" : cat === "DONATION" ? "Donasi" : "Mabar"} ({count})
                    </button>
                  )
                })}
              </div>

              {(() => {
                const filtered = financeFilter === "SEMUA" 
                  ? transactions.filter((t: any) => t.type !== "WITHDRAWAL")
                  : transactions.filter((t: any) => t.type === financeFilter)
                const totalPages = Math.max(1, Math.ceil(filtered.length / 25))
                const currentPage = Math.min(financePage, totalPages)
                const paged = filtered.slice((currentPage - 1) * 25, currentPage * 25)
                const totalAmount = filtered.reduce((s: number, t: any) => s + t.amount, 0)

                return (
                  <>
                    <Table>
                      <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/20">
                        <TableRow className="border-b border-slate-100 dark:border-zinc-900">
                          <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm px-6">ID TX</TableHead>
                          <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm">Pengirim</TableHead>
                          <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm">Tipe</TableHead>
                          <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm">Interaksi</TableHead>
                          <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm">Jumlah</TableHead>
                          <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm">Tanggal</TableHead>
                          <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm">Pesan</TableHead>
                          <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm">Status</TableHead>
                          <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm text-center">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paged.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center text-xs font-bold text-slate-400 italic py-12">
                              Belum ada data pemasukan.
                            </TableCell>
                          </TableRow>
                        ) : (
                          paged.map((tx: any, idx: number) => {
                            const interaction = getInteractionMeta(tx)
                            const InteractionIcon = interaction?.icon
                            return (
                            <TableRow key={idx} className="border-b border-slate-100/60 dark:border-zinc-800/40 hover:bg-slate-50/30">
                              <TableCell className="font-mono font-bold text-sm px-6">{tx.id}</TableCell>
                              <TableCell className="font-bold italic text-sm">{tx.sender}</TableCell>
                              <TableCell>
                                <Badge className={
                                  tx.type === "DONATION" 
                                    ? "bg-blue-50 text-blue-600 border border-blue-200/40 font-black italic text-xs rounded-lg px-2.5" 
                                    : "bg-amber-50 text-amber-600 border border-amber-200/40 font-black italic text-xs rounded-lg px-2.5"
                                }>
                                  {tx.type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {interaction && InteractionIcon ? (
                                  <Badge className={`border font-black italic text-[10px] rounded-lg px-2 py-0.5 ${interaction.className}`}>
                                    <InteractionIcon className="mr-1 h-3 w-3" /> {interaction.label}
                                  </Badge>
                                ) : (
                                  <span className="text-xs font-bold italic text-slate-300 dark:text-zinc-600">-</span>
                                )}
                              </TableCell>
                              <TableCell className="font-black italic text-sm text-emerald-600">
                                + {format(convertFromIdr(tx.amount))}
                              </TableCell>
                              <TableCell className="text-sm font-bold text-slate-400 italic">{tx.date}</TableCell>
                              <TableCell className="text-sm max-w-[200px] truncate font-bold text-slate-500 dark:text-[#EAE9E4]/70">
                                {tx.message}
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-200/45 font-black italic text-xs rounded-lg px-2.5">
                                  {tx.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <button
                                  onClick={async () => {
                                    if (!session?.user?.accessToken) return
                                    try {
                                      const res = await fetchWithRetry(`${API_BASE}/widget-settings/test-alert`, {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.user.accessToken}` },
                                        body: JSON.stringify({
                                          type: tx.type,
                                          sender_name: tx.sender || "Anonim",
                                          gross_amount: tx.amount,
                                          message: tx.message || "",
                                          game_name: tx.game_name || "",
                                          mediashare_url: tx.mediashare_url || tx.donation_media?.media_url || null,
                                          donation_media: tx.donation_media || null
                                        })
                                      })
                                      const json = await res.json()
                                      if (json.success) toast.success("Alert dikirim ulang ke overlay!")
                                      else toast.error("Gagal mengirim ulang alert.")
                                    } catch { toast.error("Gagal terhubung ke server.") }
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-purple-50 text-purple-600 border border-purple-200/50 hover:bg-purple-100 transition-all active:scale-95 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-800"
                                >
                                  <Play className="h-3 w-3" /> Replay
                                </button>
                              </TableCell>
                            </TableRow>
                            )
                          })
                        )}
                      </TableBody>
                    </Table>

                    {/* Pagination Footer */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3 border-t border-slate-100 dark:border-zinc-800/60 bg-slate-50/30 dark:bg-zinc-900/20">
                      <div className="flex items-center gap-3 text-[10px] font-black italic text-slate-400">
                        <span>Total: {format(convertFromIdr(totalAmount))}</span>
                        <span className="text-slate-300 dark:text-zinc-600">|</span>
                        <span>{filtered.length} transaksi</span>
                        <span className="text-slate-300 dark:text-zinc-600">|</span>
                        <span>Hal. {currentPage}/{totalPages}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          disabled={currentPage <= 1}
                          onClick={() => setFinancePage(Math.max(1, currentPage - 1))}
                          className="h-7 px-3 rounded-lg text-[10px] font-black italic border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          ← Prev
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum: number
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (currentPage <= 3) {
                            pageNum = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setFinancePage(pageNum)}
                              className={`h-7 w-7 rounded-lg text-[10px] font-black transition-all ${
                                pageNum === currentPage
                                  ? "bg-[#FFD551] text-black shadow-sm"
                                  : "border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-700"
                              }`}
                            >
                              {pageNum}
                            </button>
                          )
                        })}
                        <button
                          disabled={currentPage >= totalPages}
                          onClick={() => setFinancePage(Math.min(totalPages, currentPage + 1))}
                          className="h-7 px-3 rounded-lg text-[10px] font-black italic border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          ) : (
            /* === PENCAIRAN / PAYOUT TABLE === */
            <div>
              {withdrawals.length === 0 ? (
                <div className="p-12 text-center text-xs font-bold text-slate-400 dark:text-zinc-500 italic">
                  Belum ada riwayat penarikan dana yang diajukan.
                </div>
              ) : (
                (() => {
                  const totalPages = Math.max(1, Math.ceil(withdrawals.length / 25))
                  const currentPage = Math.min(financePage, totalPages)
                  const paged = withdrawals.slice((currentPage - 1) * 25, currentPage * 25)
                  const totalWithdrawn = withdrawals.filter((w: any) => w.status === "SUCCESS").reduce((s: number, w: any) => s + Number(w.amount_requested), 0)

                  return (
                    <>
                      <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/20">
                          <TableRow className="border-b border-slate-100 dark:border-zinc-900">
                            <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm px-6">ID WD</TableHead>
                            <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm">Rekening Tujuan</TableHead>
                            <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm">Nominal</TableHead>
                            <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm">Biaya</TableHead>
                            <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm">Diterima</TableHead>
                            <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm">Tanggal</TableHead>
                            <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-sm">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paged.map((wd: any, index: number) => {
                            const amount = Number(wd.amount_requested)
                            const fee = Number(wd.disbursement_fee || 5000)
                            const net = amount - fee
                            return (
                              <TableRow key={index} className="border-b border-slate-100/60 dark:border-zinc-800/40 hover:bg-slate-50/30">
                                <TableCell className="font-mono font-bold text-sm px-6">WD-{wd.id.substring(0, 8).toUpperCase()}</TableCell>
                                <TableCell className="font-bold text-sm italic">{bankName} - {bankNumber.substring(0, 4)}*** ({bankHolder})</TableCell>
                                <TableCell className="font-black italic text-sm text-black dark:text-white">Rp {amount.toLocaleString("id-ID")}</TableCell>
                                <TableCell className="font-bold text-sm text-red-500">- Rp {fee.toLocaleString("id-ID")}</TableCell>
                                <TableCell className="font-black italic text-sm text-emerald-600 dark:text-emerald-400">Rp {net.toLocaleString("id-ID")}</TableCell>
                                <TableCell className="text-sm font-bold text-slate-400 italic">{new Date(wd.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</TableCell>
                                <TableCell>
                                  <Badge className={wd.status === "PENDING" ? "bg-amber-50 text-amber-600 border border-amber-200/45 font-black italic text-xs rounded-lg px-2.5 py-0.5 animate-pulse" : wd.status === "SUCCESS" ? "bg-emerald-50 text-emerald-600 border border-emerald-200/45 font-black italic text-xs rounded-lg px-2.5 py-0.5" : "bg-red-50 text-red-600 border border-red-200/45 font-black italic text-xs rounded-lg px-2.5 py-0.5"}>
                                    {wd.status === "SUCCESS" ? "PAID" : wd.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>

                      {/* Pagination Footer */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3 border-t border-slate-100 dark:border-zinc-800/60 bg-slate-50/30 dark:bg-zinc-900/20">
                        <div className="flex items-center gap-3 text-[10px] font-black italic text-slate-400">
                          <span>Total Dicairkan: Rp {totalWithdrawn.toLocaleString("id-ID")}</span>
                          <span className="text-slate-300 dark:text-zinc-600">|</span>
                          <span>{withdrawals.length} pencairan</span>
                          <span className="text-slate-300 dark:text-zinc-600">|</span>
                          <span>Hal. {currentPage}/{totalPages}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button disabled={currentPage <= 1} onClick={() => setFinancePage(Math.max(1, currentPage - 1))} className="h-7 px-3 rounded-lg text-[10px] font-black italic border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all">← Prev</button>
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pn: number
                            if (totalPages <= 5) pn = i + 1
                            else if (currentPage <= 3) pn = i + 1
                            else if (currentPage >= totalPages - 2) pn = totalPages - 4 + i
                            else pn = currentPage - 2 + i
                            return (
                              <button key={pn} onClick={() => setFinancePage(pn)} className={`h-7 w-7 rounded-lg text-[10px] font-black transition-all ${pn === currentPage ? "bg-[#FFD551] text-black shadow-sm" : "border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-700"}`}>{pn}</button>
                            )
                          })}
                          <button disabled={currentPage >= totalPages} onClick={() => setFinancePage(Math.min(totalPages, currentPage + 1))} className="h-7 px-3 rounded-lg text-[10px] font-black italic border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all">Next →</button>
                        </div>
                      </div>
                    </>
                  )
                })()
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal Form Dialog */}
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="max-w-md bg-[#F8F7F3] dark:bg-[#121211] rounded-2xl border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl">
          <DialogHeader className="space-y-1 text-center">
            <DialogTitle className="text-2xl font-black italic tracking-tighter flex items-center justify-center gap-2 text-black dark:text-[#FFD551]">
              Pencairan Saldo Dompet
            </DialogTitle>
            <DialogDescription className="font-bold italic text-[9px] text-slate-400 tracking-widest">
              TRANSFER AMAN SALDO KREATOR
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleWithdrawSubmit} className="space-y-4 pt-4 text-[#1A1A19] dark:text-white">
            <div className="space-y-2">
              <Label className="font-black italic text-xs text-slate-500">Nama Bank / E-Wallet Payout</Label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full h-11 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 font-bold bg-white dark:bg-zinc-900 text-black dark:text-white text-sm outline-none"
              >
                <option value="BCA">BCA (Bank Central Asia)</option>
                <option value="MANDIRI">MANDIRI (Bank Mandiri)</option>
                <option value="BNI">BNI (Bank Negara Indonesia)</option>
                <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                <option value="GOPAY">GOPAY (E-Wallet Gojek)</option>
                <option value="OVO">OVO (E-Wallet Grab)</option>
                <option value="DANA">DANA (E-Wallet Dana)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="font-black italic text-xs text-slate-500">Nomor Rekening / No. Telepon E-Wallet</Label>
              <Input
                type="text"
                required
                placeholder="Contoh: 8012345678"
                value={bankNumber}
                onChange={(e) => setBankNumber(e.target.value)}
                className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-black italic text-xs text-slate-500">Nama Lengkap Pemilik Rekening</Label>
              <Input
                type="text"
                required
                placeholder="Nama sesuai buku tabungan/akun e-wallet"
                value={bankHolder}
                onChange={(e) => setBankHolder(e.target.value)}
                className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-200/50 dark:border-zinc-800">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                <span>Saldo Tersedia:</span>
                <span className="font-black text-black dark:text-white">Rp {balance.toLocaleString("id-ID")}</span>
              </div>
              <Label className="font-black italic text-xs text-slate-500">Nominal Penarikan (IDR)</Label>
              <Input
                type="number"
                required
                max={balance}
                placeholder="Contoh: 100000"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold"
              />
              <p className="text-[9px] font-bold text-red-500 italic">Potongan biaya transfer admin Rp 5.000 otomatis dipotong dari nominal cair.</p>
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full h-12 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black rounded-2xl font-black italic text-xs transition-all shadow-md">
                Ajukan Penarikan Dana
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
