"use client"

import React from "react"
import { Check, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { printPayoutInvoice } from "@/lib/utils"

interface WithdrawalsTabProps {
  withdrawals: any[]
  triggerWithdrawalConfirm: (id: string, action: "SUCCESS" | "FAILED") => void
}

export default function WithdrawalsTab({ 
  withdrawals, 
  triggerWithdrawalConfirm 
}: WithdrawalsTabProps) {
  return (
    <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)] bg-white dark:bg-[#121211] overflow-hidden w-full">
      <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
        <CardTitle className="text-xs font-black tracking-wider text-black dark:text-[#FFD551]">Daftar Pengajuan Tarik Dana Kreator</CardTitle>
        <CardDescription className="text-xs font-bold italic text-slate-400">Konfirmasi persetujuan transfer saldo dompet kreator ke rekening bank atau dompet digital lokal</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table className="w-full">
          <TableHeader className="bg-[#FAF9F6] dark:bg-[#1E1E1D]/40">
            <TableRow className="border-b border-slate-100 dark:border-zinc-900">
              <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic px-8">ID Request</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Nama Kreator</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Tujuan Bank/E-Wallet</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">No. Rekening</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Nama Pemilik Rekening</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Nominal Penarikan</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Status</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic text-right px-8">Aksi Tindakan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals.map(w => (
              <TableRow key={w.id} className="border-b border-slate-100/60 dark:border-zinc-800/40 hover:bg-slate-50/30">
                <TableCell className="font-mono text-xs font-bold px-8">{w.id ? w.id.substring(0, 8) : ""}</TableCell>
                <TableCell className="text-xs font-bold">
                  <div className="flex items-center gap-2 italic">
                    <div className="w-6 h-6 rounded-full border border-[#FFD551]/30 overflow-hidden bg-white shrink-0 flex items-center justify-center text-[10px] font-black">
                      {w.creator_avatar ? (
                        <img src={w.creator_avatar} alt={w.creator} className="w-full h-full object-cover" />
                      ) : (
                        w.creator.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <span>@{w.creator}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs font-black italic">{w.bankName}</TableCell>
                <TableCell className="font-mono text-xs text-slate-400 font-bold">{w.accountNo}</TableCell>
                <TableCell className="text-xs font-bold italic">{w.holder}</TableCell>
                <TableCell className="text-xs font-black text-slate-900 dark:text-white">
                  Rp {w.amount.toLocaleString("id-ID")}
                </TableCell>
                <TableCell>
                  <Badge className={
                    w.status === "PENDING"
                      ? "bg-amber-50 text-amber-600 border border-amber-200/45 font-black italic text-[9px] rounded-lg px-2 py-0.5 animate-pulse"
                      : w.status === "SUCCESS"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200/45 font-black italic text-[9px] rounded-lg px-2 py-0.5"
                        : "bg-red-50 text-red-600 border border-red-200/45 font-black italic text-[9px] rounded-lg px-2 py-0.5"
                  }>
                    {w.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right px-8">
                  {w.status === "PENDING" ? (
                    <div className="flex gap-2 justify-end items-center">
                      <Button 
                        size="xs"
                        onClick={() => triggerWithdrawalConfirm(w.id, "SUCCESS")}
                        className="h-8 bg-black text-[#FFD551] hover:bg-slate-900 rounded-xl text-[9px] font-black italic transition-all px-3.5"
                      >
                        <Check className="mr-1 h-3.5 w-3.5" /> Setujui
                      </Button>
                      <Button 
                        size="xs"
                        variant="outline"
                        onClick={() => triggerWithdrawalConfirm(w.id, "FAILED")}
                        className="h-8 border border-slate-200 text-red-500 hover:bg-red-50 rounded-xl text-[9px] font-black italic px-3.5"
                      >
                        <X className="mr-1 h-3.5 w-3.5" /> Tolak
                      </Button>
                      <Button 
                        size="xs"
                        onClick={() => printPayoutInvoice(w)}
                        className="h-8 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[9px] font-black italic transition-all px-3"
                      >
                        🖨️ Invoice
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-3 justify-end items-center">
                      <span className="text-[10px] text-slate-400 font-bold italic">{w.date || "Selesai"}</span>
                      <Button 
                        size="xs"
                        onClick={() => printPayoutInvoice(w)}
                        className="h-8 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[9px] font-black italic transition-all px-3"
                      >
                        🖨️ Invoice
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {withdrawals.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-400 text-xs font-bold">
                  Tidak ada pengajuan tarik dana penarikan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
