"use client"
import React from "react"
import { useDashboard } from "../context/DashboardContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Megaphone, RefreshCw, Users, Play, Check, X, RotateCcw } from "lucide-react"

export default function QueuePage() {
  const {
    queues,
    selectedActiveIds,
    setSelectedActiveIds,
    callingCooldowns,
    handleQueueAction,
    handleCallPlayer,
    handleBulkQueueAction
  } = useDashboard()

  const activeQueues = queues.filter((q: any) => q.status === "WAITING" || q.status === "PLAYING")
  const historyQueues = queues.filter((q: any) => q.status === "DONE" || q.status === "SKIPPED")

  return (
    <div className="space-y-6">
      {/* Informational Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-[#1E1E1D]/20 border border-slate-200/60 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
        <div className="flex gap-3.5 items-start">
          <div className="h-10 w-10 shrink-0 bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center font-black text-sm">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs md:text-sm text-slate-800 dark:text-zinc-200">Tombol Panggil</h4>
            <p className="text-[11px] md:text-xs text-slate-500 dark:text-zinc-400 font-semibold mt-1">
              Memutar bel dering & menyebutkan panggilan suara mabar 3 kali langsung ke overlay streaming Anda agar supporter bersiap bergabung.
            </p>
          </div>
        </div>
        <div className="flex gap-3.5 items-start">
          <div className="h-10 w-10 shrink-0 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-[#FFD551] rounded-xl flex items-center justify-center font-black text-sm">
            <Play className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs md:text-sm text-slate-800 dark:text-zinc-200">Tombol Main</h4>
            <p className="text-[11px] md:text-xs text-slate-500 dark:text-zinc-400 font-semibold mt-1">
              Mengaktifkan status supporter menjadi "PLAYING" dan memposisikannya di bagian paling atas tabel sebagai supporter aktif bermain.
            </p>
          </div>
        </div>
        <div className="flex gap-3.5 items-start">
          <div className="h-10 w-10 shrink-0 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center font-black text-sm">
            <X className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs md:text-sm text-slate-800 dark:text-zinc-200">Lewati / Selesai</h4>
            <p className="text-[11px] md:text-xs text-slate-500 dark:text-zinc-400 font-semibold mt-1">
              <strong>Selesai:</strong> Mengurangi slot match/mengakhiri sesi. <strong>Lewati:</strong> Mengembalikan supporter aktif ke daftar tunggu agar bisa digilir.
            </p>
          </div>
        </div>
      </div>

      {/* Active Queue Table */}
      <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-md bg-white dark:bg-[#121211] overflow-hidden">
        <CardHeader className="py-6 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="font-extrabold text-base md:text-lg tracking-wide text-black dark:text-[#FFD551] flex items-center gap-2">
                Antrean Sekarang
              </CardTitle>
              <CardDescription className="font-semibold text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Penonton yang sedang aktif menunggu giliran bermain bersama Anda (Urutan otomatis berdasarkan jam order)
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {selectedActiveIds.length > 0 && (
                <div className="flex gap-2 items-center bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-2xl animate-pulse">
                  <span className="font-black text-xs text-amber-600">
                    {selectedActiveIds.length} Terpilih:
                  </span>
                  <Button
                    size="xs"
                    onClick={() => handleBulkQueueAction(selectedActiveIds, "SKIPPED")}
                    className="h-7 bg-red-500 hover:bg-red-600 text-white rounded-lg font-extrabold text-[10px] md:text-xs px-3 border-none"
                  >
                    Lewati
                  </Button>
                  <Button
                    size="xs"
                    onClick={() => handleBulkQueueAction(selectedActiveIds, "DONE")}
                    className="h-7 bg-black hover:bg-zinc-800 text-[#FFD551] rounded-lg font-extrabold text-[10px] md:text-xs px-3 border border-zinc-800"
                  >
                    Selesai
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setSelectedActiveIds([])}
                    className="h-7 text-slate-500 hover:text-slate-700 font-extrabold text-[10px] md:text-xs px-2"
                  >
                    Batal
                  </Button>
                </div>
              )}
              <Badge className="bg-red-500/15 text-red-600 border-none font-extrabold tracking-wider text-[10px] px-2.5 py-1 rounded-lg shrink-0">
                Live Active: {activeQueues.length}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {activeQueues.length === 0 ? (
            <div className="p-16 text-center text-sm font-extrabold text-slate-400 dark:text-zinc-500 italic">
              Belum ada antrean aktif yang sedang menunggu.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/20">
                <TableRow className="border-b border-slate-100 dark:border-zinc-900">
                  <TableHead className="w-[60px] text-center px-4">
                    <input
                      type="checkbox"
                      className="h-4.5 w-4.5 rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                      checked={
                        activeQueues.length > 0 &&
                        selectedActiveIds.length === activeQueues.length
                      }
                      onChange={(e) => {
                        const activeIds = activeQueues.map((q: any) => q.id);
                        if (e.target.checked) {
                          setSelectedActiveIds(activeIds);
                        } else {
                          setSelectedActiveIds([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead className="font-extrabold text-slate-700 dark:text-zinc-300 text-xs md:text-sm tracking-wider px-2 py-4">No. Urut</TableHead>
                  <TableHead className="font-extrabold text-slate-700 dark:text-zinc-300 text-xs md:text-sm tracking-wider py-4">Nama Akun Nickname</TableHead>
                  <TableHead className="font-extrabold text-slate-700 dark:text-zinc-300 text-xs md:text-sm tracking-wider py-4">Menu Game Layanan</TableHead>
                  <TableHead className="font-extrabold text-slate-700 dark:text-zinc-300 text-xs md:text-sm tracking-wider py-4">In-Game / Discord ID</TableHead>
                  <TableHead className="font-extrabold text-slate-700 dark:text-zinc-300 text-xs md:text-sm tracking-wider py-4">Waktu Order</TableHead>
                  <TableHead className="font-extrabold text-slate-700 dark:text-zinc-300 text-xs md:text-sm tracking-wider py-4">Status Sesi</TableHead>
                  <TableHead className="font-extrabold text-slate-700 dark:text-zinc-300 text-xs md:text-sm tracking-wider text-right px-8 py-4">Tindakan Kontrol</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeQueues.map((q: any, idx: number) => (
                  <TableRow key={q.id} className="border-b border-slate-100/60 dark:border-zinc-800/40 hover:bg-slate-50/30 transition-colors">
                    <TableCell className="text-center px-4">
                      <input
                        type="checkbox"
                        className="h-4.5 w-4.5 rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                        checked={selectedActiveIds.includes(q.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedActiveIds([...selectedActiveIds, q.id]);
                          } else {
                            setSelectedActiveIds(selectedActiveIds.filter((id: string) => id !== q.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-extrabold text-slate-800 dark:text-zinc-100 text-xs md:text-sm px-2 py-5">{idx + 1}</TableCell>
                    <TableCell className="font-bold text-xs md:text-sm py-5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#1A1A19] dark:text-[#FAF9F6] text-xs md:text-sm">{q.ingame_nickname}</span>
                        {q.slots_count > 0 && (
                          <Badge className="bg-emerald-500 text-white font-extrabold text-[10px] md:text-xs rounded-md px-2 py-0.5 shrink-0 border-none shadow-sm leading-none">
                            {q.slots_count} Sesi
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-extrabold text-xs md:text-sm text-amber-600 dark:text-[#FFD551] py-5">@{q.game_package?.game_name || "Mabar"}</TableCell>
                    <TableCell className="font-mono font-bold text-xs md:text-sm text-slate-600 dark:text-zinc-400 py-5">{q.ingame_id}</TableCell>
                    <TableCell className="font-bold text-xs md:text-sm text-slate-500 dark:text-zinc-400 py-5">
                      {new Date(q.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                    </TableCell>
                    <TableCell className="py-5">
                      <Badge className={
                        q.status === "WAITING" 
                          ? "bg-amber-50 text-amber-600 border border-amber-200/40 font-extrabold text-[10px] md:text-xs rounded-lg px-2.5 py-1"
                          : "bg-green-50 text-green-600 border border-green-200/40 font-extrabold text-[10px] md:text-xs rounded-lg px-2.5 py-1 animate-pulse animate-duration-1000"
                      }>
                        {q.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-8 py-5">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          size="xs" 
                          onClick={() => handleCallPlayer(q.id)} disabled={callingCooldowns[q.id]}
                          className="h-9 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 disabled:text-purple-100 dark:disabled:bg-purple-950 dark:disabled:text-purple-800 text-white rounded-xl font-extrabold text-[11px] md:text-xs px-3.5 shadow-sm border-none flex items-center gap-1 active:scale-95 transition-all"
                        >
                          {callingCooldowns[q.id] ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Cooldown</> : <><Megaphone className="h-3.5 w-3.5" /> Panggil</>}
                        </Button>
                        {q.status === "WAITING" && (
                          <Button 
                            size="xs" 
                            onClick={() => handleQueueAction(q.id, "PLAYING")}
                            className="h-9 bg-[#FFD551] text-black border border-slate-200 dark:border-zinc-800 hover:bg-[#FFC83B] rounded-xl font-extrabold text-[11px] md:text-xs px-4 shadow-sm"
                          >
                            Main
                          </Button>
                        )}
                        {q.status === "PLAYING" && (
                          <>
                            <Button 
                              size="xs" 
                              onClick={() => handleQueueAction(q.id, "DONE")}
                              className="h-9 bg-black hover:bg-zinc-900 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-[#FFD551] rounded-xl font-extrabold text-[11px] md:text-xs px-3.5 border border-zinc-800"
                            >
                              Selesai
                            </Button>
                            <Button 
                              size="xs" 
                              variant="outline"
                              onClick={() => handleQueueAction(q.id, "SKIPPED")}
                              className="h-9 border border-slate-200 rounded-xl font-extrabold text-[11px] md:text-xs px-3 text-slate-500 hover:text-black dark:border-zinc-800"
                            >
                              Lewati
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Queue History Table */}
      <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
        <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
          <CardTitle className="font-extrabold text-sm md:text-base tracking-wider text-black dark:text-[#FFD551]">
            Riwayat Antrean Selesai & Dilewati
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {historyQueues.length === 0 ? (
            <div className="p-12 text-center text-xs md:text-sm font-bold text-slate-400 dark:text-zinc-500 italic">
              Belum ada riwayat antrean sesi sebelumnya.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/20">
                <TableRow className="border-b border-slate-100 dark:border-zinc-900">
                  <TableHead className="font-bold text-slate-500 dark:text-zinc-400 text-xs md:text-sm px-8">Nickname</TableHead>
                  <TableHead className="font-bold text-slate-500 dark:text-zinc-400 text-xs md:text-sm">Game</TableHead>
                  <TableHead className="font-bold text-slate-500 dark:text-zinc-400 text-xs md:text-sm">In-Game / Discord</TableHead>
                  <TableHead className="font-bold text-slate-500 dark:text-zinc-400 text-xs md:text-sm">Waktu Selesai</TableHead>
                  <TableHead className="font-bold text-slate-500 dark:text-zinc-400 text-xs md:text-sm">Status</TableHead>
                  <TableHead className="font-bold text-slate-500 dark:text-zinc-400 text-xs md:text-sm text-right px-8">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyQueues.map((q: any) => (
                  <TableRow key={q.id} className="border-b border-slate-100/60 dark:border-zinc-800/40 hover:bg-slate-50/30">
                    <TableCell className="font-extrabold text-xs md:text-sm px-8">{q.ingame_nickname}</TableCell>
                    <TableCell className="font-bold text-xs md:text-sm text-slate-500">@{q.game_package?.game_name || "Mabar"}</TableCell>
                    <TableCell className="font-mono text-xs md:text-sm text-slate-400">{q.ingame_id}</TableCell>
                    <TableCell className="text-xs md:text-sm font-bold text-slate-400 italic">
                      {new Date(q.updatedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        q.status === "DONE"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200/40 font-extrabold text-[10px] md:text-xs rounded-lg px-2.5 py-0.5"
                          : "bg-red-50 text-red-600 border border-red-200/40 font-extrabold text-[10px] md:text-xs rounded-lg px-2.5 py-0.5"
                      }>
                        {q.status === "DONE" ? "SELESAI" : "DILEWATI"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => handleQueueAction(q.id, "WAITING")}
                        className="h-8 border border-slate-200 dark:border-zinc-800 rounded-xl font-extrabold text-[10px] md:text-xs px-3 text-slate-500 hover:text-black dark:text-zinc-400 hover:bg-slate-50"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" /> Antrekan Kembali
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
