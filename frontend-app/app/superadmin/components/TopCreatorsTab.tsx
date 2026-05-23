"use client"

import React, { useState, useMemo } from "react"
import { Crown, Trophy, Star, Search, ArrowUpRight, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Creator {
  id: string
  username: string
  role: string
  avatar_url?: string
  isVerified: boolean
}

interface Transaction {
  creator: string
  amount: number
  status: string
}

interface TopCreatorsTabProps {
  creators: Creator[]
  transactions: Transaction[]
}

export default function TopCreatorsTab({ creators, transactions }: TopCreatorsTabProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Calculate metrics: total GTV (successful transactions amount sum) and successful transaction counts
  const creatorsMetrics = useMemo(() => {
    return creators
      .map((creator) => {
        const creatorTxs = transactions.filter(
          (t) =>
            t.creator.toLowerCase() === creator.username.toLowerCase() &&
            t.status === "SUCCESS"
        )
        const gtv = creatorTxs.reduce((sum, t) => sum + t.amount, 0)
        const txCount = creatorTxs.length

        return {
          ...creator,
          gtv,
          txCount,
        }
      })
      .sort((a, b) => b.gtv - a.gtv)
  }, [creators, transactions])

  // Get absolute top 3 for the podium
  const podiumCreators = useMemo(() => {
    return creatorsMetrics.slice(0, 3)
  }, [creatorsMetrics])

  // Filter creators for the list table
  const filteredCreators = useMemo(() => {
    return creatorsMetrics.filter((c) =>
      c.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [creatorsMetrics, searchQuery])

  // Arrange podium: Rank 2 on the left, Rank 1 in the middle, Rank 3 on the right
  const arrangedPodium = useMemo(() => {
    const result = [null, null, null] as (typeof creatorsMetrics[number] | null)[]
    if (podiumCreators[1]) result[0] = podiumCreators[1] // Rank 2
    if (podiumCreators[0]) result[1] = podiumCreators[0] // Rank 1
    if (podiumCreators[2]) result[2] = podiumCreators[2] // Rank 3
    return result
  }, [podiumCreators])

  return (
    <div className="space-y-8 w-full">
      {/* PODIUM SECTION */}
      {podiumCreators.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8 pb-4">
          {/* Rank 2 (Silver) */}
          {arrangedPodium[0] ? (
            <div className="flex flex-col items-center group order-2 md:order-1">
              <div className="relative mb-3 transition-transform duration-300 group-hover:scale-105">
                <div className="w-18 h-18 rounded-full border-4 border-slate-300 overflow-hidden bg-white shadow-lg flex items-center justify-center">
                  {arrangedPodium[0].avatar_url ? (
                    <img
                      src={arrangedPodium[0].avatar_url}
                      alt={arrangedPodium[0].username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-bold text-slate-500 text-lg">
                      {arrangedPodium[0].username.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="absolute -top-3 -right-2 bg-slate-300 text-slate-900 w-7 h-7 rounded-full flex items-center justify-center font-black shadow-md border-2 border-white dark:border-[#121211] text-xs">
                  2
                </div>
              </div>
              
              <div className="w-full text-center p-5 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200/50 dark:from-zinc-900/60 dark:to-zinc-900/20 border border-slate-200 dark:border-zinc-800 shadow-md">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Trophy className="h-4 w-4 text-slate-400 animate-pulse" />
                  <span className="font-black italic text-xs text-slate-500 uppercase tracking-wider">
                    Silver Tier
                  </span>
                </div>
                <h3 className="font-black italic text-sm text-slate-800 dark:text-[#EAE9E4] flex items-center justify-center gap-1">
                  @{arrangedPodium[0].username}
                  {arrangedPodium[0].isVerified && (
                    <img src="/verified.svg" alt="Verified" className="w-4 h-4 shrink-0" />
                  )}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase italic mt-0.5">
                  {arrangedPodium[0].role}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-zinc-800/40">
                  <div className="text-sm font-black text-slate-800 dark:text-[#FFD551]">
                    Rp {arrangedPodium[0].gtv.toLocaleString("id-ID")}
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 italic">
                    {arrangedPodium[0].txCount} Dukungan Sukses
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden md:block order-2 md:order-1" />
          )}

          {/* Rank 1 (Gold) - Taller & Highlighted */}
          {arrangedPodium[1] ? (
            <div className="flex flex-col items-center group order-1 md:order-2 -mt-4">
              <div className="relative mb-3 transition-transform duration-300 group-hover:scale-105">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                  <Crown className="h-8 w-8 drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)] fill-amber-500" />
                </div>
                <div className="w-22 h-22 rounded-full border-4 border-amber-400 overflow-hidden bg-white shadow-xl flex items-center justify-center">
                  {arrangedPodium[1].avatar_url ? (
                    <img
                      src={arrangedPodium[1].avatar_url}
                      alt={arrangedPodium[1].username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-bold text-amber-600 text-xl">
                      {arrangedPodium[1].username.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="absolute -top-3 -right-2 bg-amber-400 text-amber-950 w-7 h-7 rounded-full flex items-center justify-center font-black shadow-md border-2 border-white dark:border-[#121211] text-xs">
                  1
                </div>
              </div>

              <div className="w-full text-center p-6 rounded-[2.5rem] bg-gradient-to-br from-amber-50 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-950/5 border border-amber-300/60 dark:border-amber-500/20 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400/5 dark:bg-amber-400/2 rounded-bl-full pointer-events-none" />
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Crown className="h-4 w-4 text-amber-500" />
                  <span className="font-black italic text-xs text-amber-600 uppercase tracking-widest">
                    Champion
                  </span>
                </div>
                <h3 className="font-black italic text-base text-slate-800 dark:text-[#EAE9E4] flex items-center justify-center gap-1">
                  @{arrangedPodium[1].username}
                  {arrangedPodium[1].isVerified && (
                    <img src="/verified.svg" alt="Verified" className="w-4.5 h-4.5 shrink-0" />
                  )}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase italic mt-0.5">
                  {arrangedPodium[1].role}
                </p>
                <div className="mt-4 pt-3 border-t border-amber-200/50 dark:border-amber-500/10">
                  <div className="text-base font-black text-amber-600 dark:text-[#FFD551]">
                    Rp {arrangedPodium[1].gtv.toLocaleString("id-ID")}
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 italic">
                    {arrangedPodium[1].txCount} Dukungan Sukses
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden md:block order-1 md:order-2" />
          )}

          {/* Rank 3 (Bronze) */}
          {arrangedPodium[2] ? (
            <div className="flex flex-col items-center group order-3">
              <div className="relative mb-3 transition-transform duration-300 group-hover:scale-105">
                <div className="w-18 h-18 rounded-full border-4 border-orange-400 overflow-hidden bg-white shadow-lg flex items-center justify-center">
                  {arrangedPodium[2].avatar_url ? (
                    <img
                      src={arrangedPodium[2].avatar_url}
                      alt={arrangedPodium[2].username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-bold text-orange-600 text-lg">
                      {arrangedPodium[2].username.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="absolute -top-3 -right-2 bg-orange-400 text-orange-950 w-7 h-7 rounded-full flex items-center justify-center font-black shadow-md border-2 border-white dark:border-[#121211] text-xs">
                  3
                </div>
              </div>

              <div className="w-full text-center p-5 rounded-3xl bg-gradient-to-br from-orange-50 to-orange-100/30 dark:from-orange-950/10 dark:to-orange-950/5 border border-orange-200 dark:border-orange-850 shadow-md">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="h-4 w-4 text-orange-400 animate-pulse" />
                  <span className="font-black italic text-xs text-orange-600 uppercase tracking-wider">
                    Bronze Tier
                  </span>
                </div>
                <h3 className="font-black italic text-sm text-slate-800 dark:text-[#EAE9E4] flex items-center justify-center gap-1">
                  @{arrangedPodium[2].username}
                  {arrangedPodium[2].isVerified && (
                    <img src="/verified.svg" alt="Verified" className="w-4 h-4 shrink-0" />
                  )}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase italic mt-0.5">
                  {arrangedPodium[2].role}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-zinc-800/40">
                  <div className="text-sm font-black text-slate-800 dark:text-[#FFD551]">
                    Rp {arrangedPodium[2].gtv.toLocaleString("id-ID")}
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 italic">
                    {arrangedPodium[2].txCount} Dukungan Sukses
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden md:block order-3" />
          )}
        </div>
      )}

      {/* FILTER & SEARCH */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white dark:bg-[#121211] border border-slate-200 dark:border-zinc-800 p-4 rounded-[2rem] shadow-sm w-full">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari berdasarkan username kreator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 pl-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
          />
        </div>
      </div>

      {/* LIST TABLE CARD */}
      <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)] bg-white dark:bg-[#121211] overflow-hidden w-full">
        <CardContent className="p-0">
          <Table className="w-full">
            <TableHeader className="bg-[#FAF9F6] dark:bg-[#1E1E1D]/40">
              <TableRow className="border-b border-slate-100 dark:border-zinc-900">
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic px-8 w-24">Posisi</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Kreator</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Role / Peran</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Total GTV (Dukungan)</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic">Volume Transaksi</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 dark:text-zinc-400 italic text-right px-8">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCreators.map((c, index) => {
                const globalRank = creatorsMetrics.findIndex((m) => m.id === c.id) + 1
                return (
                  <TableRow key={c.id} className="border-b border-slate-100/60 dark:border-zinc-800/40 hover:bg-slate-50/30">
                    <TableCell className="px-8">
                      <div className="flex items-center justify-start">
                        {globalRank === 1 ? (
                          <Badge className="bg-amber-400 text-amber-950 font-black border-none rounded-lg text-[10px] w-8 h-8 flex items-center justify-center">
                            1st
                          </Badge>
                        ) : globalRank === 2 ? (
                          <Badge className="bg-slate-300 text-slate-900 font-black border-none rounded-lg text-[10px] w-8 h-8 flex items-center justify-center">
                            2nd
                          </Badge>
                        ) : globalRank === 3 ? (
                          <Badge className="bg-orange-400 text-orange-950 font-black border-none rounded-lg text-[10px] w-8 h-8 flex items-center justify-center">
                            3rd
                          </Badge>
                        ) : (
                          <span className="font-mono text-xs font-black text-slate-400 pl-2">
                            #{globalRank}
                          </span>
                        )}
                      </div>
                    </TableCell>
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
                    <TableCell>
                      <Badge className="bg-slate-50 text-slate-600 border border-slate-100 text-[9px] font-black rounded-lg w-36 justify-center flex shrink-0 py-1">
                        {c.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-black">
                      Rp {c.gtv.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-xs font-black text-slate-400 italic">
                      {c.txCount} Dukungan Sukses
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <a
                        href={`/${c.username}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-black italic bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black px-3 py-1.5 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm"
                      >
                        Profil <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredCreators.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400 text-xs font-bold">
                    Tidak ada data kreator yang cocok dengan kata kunci pencarian.
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
