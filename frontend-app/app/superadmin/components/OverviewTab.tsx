"use client"

import React from "react"
import { 
  ArrowUpRight, 
  Coins, 
  Users, 
  Wallet, 
  Zap 
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface OverviewTabProps {
  totalGtv: number
  platformRevenue: number
  creators: any[]
  pendingWithdrawalsCount: number
  transactions: any[]
  feeDonation?: number
  feeMabar?: number
}

export default function OverviewTab({ 
  totalGtv, 
  platformRevenue, 
  creators, 
  pendingWithdrawalsCount, 
  transactions,
  feeDonation = 5,
  feeMabar = 8
}: OverviewTabProps) {
  return (
    <div className="space-y-8 w-full">
      
      {/* Financial cards row (BENTO SYSTEM) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
        
        <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)] bg-white dark:bg-[#121211] overflow-hidden">
          <CardHeader className="pb-2 py-5 px-6">
            <CardDescription className="text-xs font-black tracking-wider text-slate-400 italic">Total volume transaksi (GTV)</CardDescription>
            <CardTitle className="text-2xl font-black flex items-center justify-between mt-2">
              Rp {totalGtv.toLocaleString("id-ID")}
              <div className="bg-[#FAF9F6] dark:bg-zinc-900 p-1.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                <ArrowUpRight className="h-5 w-5 text-black dark:text-white" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-4 px-6 border-t border-slate-50 dark:border-zinc-900/60">
            <p className="text-[10px] font-black text-emerald-500 flex items-center gap-1 tracking-wider">
              📈 Platform Growth: 100% Valid
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)] bg-[#FFD551] text-black overflow-hidden">
          <CardHeader className="pb-2 py-5 px-6">
            <CardDescription className="text-xs font-black tracking-wider text-black/60 italic">Platform Revenue (Profit Owner)</CardDescription>
            <CardTitle className="text-2xl font-black flex items-center justify-between mt-2">
              Rp {platformRevenue.toLocaleString("id-ID")}
              <div className="bg-white/20 p-1.5 rounded-xl border border-white/10">
                <Coins className="h-5 w-5 text-black" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-4 px-6 border-t border-black/5 bg-black/[0.02]">
            <p className="text-[10px] font-black text-black/70 flex items-center gap-1 tracking-wider">
              💵 Potongan Fee {feeDonation}% & {feeMabar}% Bersih
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)] bg-white dark:bg-[#121211] overflow-hidden">
          <CardHeader className="pb-2 py-5 px-6">
            <CardDescription className="text-xs font-black tracking-wider text-slate-400 italic">Kreator Terdaftar</CardDescription>
            <CardTitle className="text-2xl font-black flex items-center justify-between mt-2">
              {creators.length} Akun
              <div className="bg-[#FAF9F6] dark:bg-zinc-900 p-1.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                <Users className="h-5 w-5 text-black dark:text-white" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-4 px-6 border-t border-slate-50 dark:border-zinc-900/60">
            <p className="text-[10px] font-black text-slate-400 flex items-center gap-1 tracking-wider">
              👥 Gamer, Dev, & Desainer
            </p>
          </CardContent>
        </Card>

        <Card className={`border rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)] overflow-hidden ${
          pendingWithdrawalsCount > 0 
            ? "border-red-300 bg-red-50/10 dark:bg-red-950/5" 
            : "border-slate-200/80 bg-white dark:bg-[#121211] dark:border-zinc-800/80"
        }`}>
          <CardHeader className="pb-2 py-5 px-6">
            <CardDescription className="text-xs font-black tracking-wider text-slate-400 italic">Pending Withdrawal</CardDescription>
            <CardTitle className={`text-2xl font-black flex items-center justify-between mt-2 ${
              pendingWithdrawalsCount > 0 ? "text-red-500" : "text-black dark:text-white"
            }`}>
              {pendingWithdrawalsCount} Request
              <div className={`p-1.5 rounded-xl border ${
                pendingWithdrawalsCount > 0 ? "bg-red-500/10 border-red-500/10" : "bg-[#FAF9F6] dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
              }`}>
                <Wallet className="h-5 w-5" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-4 px-6 border-t border-slate-50 dark:border-zinc-900/60">
            <p className={`text-[10px] font-black tracking-wider ${
              pendingWithdrawalsCount > 0 ? "text-red-500 animate-pulse" : "text-slate-400"
            }`}>
              {pendingWithdrawalsCount > 0 ? "⚠️ Butuh Tindakan Approval!" : "✓ Seluruh Transfer Beres"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sandbox Header Block (Curved Sleek Bento) */}
      <div className="bg-[#FAF9F6] dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/80 rounded-[2.5rem] p-8 text-black dark:text-white flex items-center justify-between shadow-sm">
        <div className="space-y-2">
          <Badge className="bg-black text-[#FFD551] hover:bg-black font-black italic tracking-wider text-[9px] border-none rounded-lg px-2.5 py-1 dark:bg-[#FFD551] dark:text-black">
            ★ Treatme Sandbox Control
          </Badge>
          <h3 className="text-xl font-black italic tracking-tight">Keleluasaan Pengujian Fitur Sandbox Platform</h3>
          <p className="text-xs font-bold text-slate-400 leading-relaxed dark:text-zinc-500 max-w-2xl">
            Anda bisa bebas menambah kreator baru, mengubah saldo dompet mereka, menyetujui penarikan, serta menyimulasikan transaksi masuk. Semua kalkulasi profit terpotong secara realtime.
          </p>
        </div>
        <Zap className="h-16 w-16 text-[#FFD551]/60 hidden md:block animate-pulse shrink-0" />
      </div>

      {/* Quick Table Logs */}
      <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)] bg-white dark:bg-[#121211] overflow-hidden">
        <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
          <CardTitle className="text-xs font-black tracking-wider text-black dark:text-[#FFD551]">Aktivitas Transaksi Terbaru</CardTitle>
          <CardDescription className="text-[10px] font-bold italic text-slate-400">Menampilkan log transaksi keuangan masuk terbaru di website</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="w-full">
            <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/20">
              <TableRow className="border-b border-slate-100 dark:border-zinc-900">
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic px-8">ID</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Viewer</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Kreator Target</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Total Kotor</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Platform Fee</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Bersih Kreator</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Tipe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.slice(0, 4).map(t => (
                <TableRow key={t.id} className="border-b border-slate-100/60 dark:border-zinc-800/40 hover:bg-slate-50/30 px-8">
                  <TableCell className="font-mono text-xs font-bold px-8">{t.id ? t.id.substring(0, 8) : ""}</TableCell>
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
                  <TableCell className="text-xs font-black">Rp {t.amount.toLocaleString("id-ID")}</TableCell>
                  <TableCell className="text-xs font-black text-emerald-500 font-mono">+Rp {t.fee.toLocaleString("id-ID")}</TableCell>
                  <TableCell className="text-xs font-black text-[#FFC83B]">Rp {t.net.toLocaleString("id-ID")}</TableCell>
                  <TableCell>
                    <Badge className="bg-[#FFD551]/10 text-black dark:text-white border border-[#FFD551]/20 text-[9px] font-black rounded-lg px-2 py-0.5">
                      {t.type}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400 text-xs font-bold">
                    Belum ada riwayat aktivitas transaksi.
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
