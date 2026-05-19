"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface TransactionsTabProps {
  transactions: any[]
}

export default function TransactionsTab({ transactions }: TransactionsTabProps) {
  return (
    <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)] bg-white dark:bg-[#121211] overflow-hidden w-full">
      <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
        <CardTitle className="text-xs font-black tracking-wider text-black dark:text-[#FFD551]">Log Aliran Transaksi Masuk Platform</CardTitle>
        <CardDescription className="text-xs font-bold italic text-slate-400">Semua perputaran uang realtime dari penonton beserta rincian pembagian fee komisi pemilik platform</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table className="w-full">
          <TableHeader className="bg-[#FAF9F6] dark:bg-[#1E1E1D]/40">
            <TableRow className="border-b border-slate-100 dark:border-zinc-900">
              <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic px-8">ID Transaksi</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Nama Viewer / Client</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Kreator Target</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Total Kotor (GTV)</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Platform Fee (Owner)</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Net Kreator</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Tipe Dukungan</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic text-right px-8">Status Sistem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map(t => (
              <TableRow key={t.id} className="border-b border-slate-100/60 dark:border-zinc-800/40 hover:bg-slate-50/30">
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
                  <Badge className="bg-[#FFD551]/10 text-black dark:text-white border border-[#FFD551]/20 text-[9px] font-black rounded-lg px-2 py-0.5">
                    {t.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-right px-8">
                  <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-200/45 font-black italic text-[9px] rounded-lg px-2 py-0.5">
                    {t.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-400 text-xs font-bold">
                  Belum ada aliran transaksi masuk.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
