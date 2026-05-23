"use client"

import React, { useEffect, useState } from "react"
import { ADMIN_API } from "@/lib/api"
import { toast } from "sonner"
import { 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Smartphone, 
  HelpCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface StreamerInfo {
  username: string
  avatar_url: string | null
}

interface WhatsappLog {
  id: string
  streamerId: string
  phoneNumber: string
  message: string
  status: "SUCCESS" | "FAILED" | "SIMULATED" | string
  gateway: "SIMULATION" | "FONNTE" | "WABLAS" | string
  errorMessage: string | null
  createdAt: string
  streamer?: StreamerInfo
}

export default function WhatsappLogsTab() {
  const [logs, setLogs] = useState<WhatsappLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await fetch(ADMIN_API.whatsappLogs)
      const data = await response.json()
      if (data.success) {
        setLogs(data.data || [])
      } else {
        toast.error(data.message || "Gagal memuat riwayat pengiriman WhatsApp")
      }
    } catch (err: any) {
      console.error("[Fetch WhatsApp Logs Error]", err)
      toast.error("Gagal terhubung ke server untuk mengambil data log.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const filteredLogs = logs.filter(log => {
    const query = searchQuery.toLowerCase()
    const streamerName = log.streamer?.username?.toLowerCase() || ""
    const phone = log.phoneNumber || ""
    const message = log.message?.toLowerCase() || ""
    const status = log.status?.toLowerCase() || ""
    const gateway = log.gateway?.toLowerCase() || ""

    return (
      streamerName.includes(query) ||
      phone.includes(query) ||
      message.includes(query) ||
      status.includes(query) ||
      gateway.includes(query)
    )
  })

  const toggleExpandLog = (id: string) => {
    if (expandedLogId === id) {
      setExpandedLogId(null)
    } else {
      setExpandedLogId(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filter and Search box */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500">
            <Search className="h-4 w-4" />
          </span>
          <Input
            placeholder="Cari berdasarkan streamer, nomor telepon, pesan, status, atau gateway..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 pr-4 h-12 border border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold text-xs focus-visible:ring-2 focus-visible:ring-[#FFD551] shadow-sm"
          />
        </div>
        <Button 
          onClick={fetchLogs} 
          disabled={loading}
          variant="outline"
          className="h-12 border border-slate-200 font-black italic rounded-2xl px-5 flex items-center gap-2 hover:bg-slate-50 cursor-pointer dark:border-zinc-800 dark:hover:bg-zinc-850 shadow-sm shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Memuat..." : "Refresh Riwayat"}
        </Button>
      </div>

      {/* Logs Database Display */}
      {loading && logs.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 w-full bg-slate-100/60 dark:bg-zinc-900/60 border border-dashed border-slate-200 dark:border-zinc-850 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-dashed border-slate-200 dark:border-zinc-800 rounded-[2rem]">
          <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
          <h3 className="font-black text-base italic text-black dark:text-white">Tidak ada log pengiriman ditemukan</h3>
          <p className="text-xs font-bold text-slate-450 dark:text-zinc-400 mt-1">
            {searchQuery ? "Coba ganti filter kata kunci pencarian Anda." : "Belum ada siaran broadcast alarm live yang dikirimkan."}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id
              const dateStr = new Date(log.createdAt).toLocaleString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
              })

              return (
                <div key={log.id} className="p-4 sm:p-5 flex flex-col gap-3 transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-900/50">
                  {/* Row Header Info */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Streamer Avatar */}
                      <div className="h-10 w-10 bg-slate-100 dark:bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center font-black italic text-slate-700 border border-slate-200 dark:border-zinc-700 shrink-0 shadow-inner">
                        {log.streamer?.avatar_url ? (
                          <img src={log.streamer.avatar_url} alt={log.streamer.username} className="w-full h-full object-cover" />
                        ) : (
                          "⭐"
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-black italic text-black dark:text-[#FFD551] block leading-snug">
                          @{log.streamer?.username || "Unknown Streamer"}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 italic block mt-0.5">
                          Tel: {log.phoneNumber}
                        </span>
                      </div>
                    </div>

                    {/* Status, Gateway, Timestamp */}
                    <div className="flex items-center gap-2">
                      <Badge className="bg-slate-100 text-slate-800 border border-slate-200 text-[9px] px-2 py-0.5 font-black uppercase dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-750">
                        {log.gateway}
                      </Badge>

                      {log.status === "SUCCESS" && (
                        <Badge className="bg-emerald-500 text-white border-none text-[9px] px-2.5 py-0.5 font-black flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> SUCCESS
                        </Badge>
                      )}
                      {log.status === "SIMULATED" && (
                        <Badge className="bg-blue-500 text-white border-none text-[9px] px-2.5 py-0.5 font-black flex items-center gap-1">
                          <Smartphone className="h-3 w-3" /> SIMULATED
                        </Badge>
                      )}
                      {log.status === "FAILED" && (
                        <Badge className="bg-red-500 text-white border-none text-[9px] px-2.5 py-0.5 font-black flex items-center gap-1 animate-pulse">
                          <XCircle className="h-3 w-3" /> FAILED
                        </Badge>
                      )}

                      <span className="text-[10px] font-bold text-slate-455 dark:text-zinc-400 ml-2 hidden sm:inline-block">
                        {dateStr}
                      </span>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleExpandLog(log.id)}
                        className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Date for Mobile */}
                  <div className="sm:hidden text-[9px] font-bold text-slate-450 mt-[-4px]">
                    Kirim: {dateStr}
                  </div>

                  {/* Message Preview */}
                  <div className="p-3 bg-[#FAF9F6] dark:bg-zinc-950 rounded-xl border border-slate-100 dark:border-zinc-900/60">
                    <p className="text-xs font-bold italic text-slate-700 dark:text-zinc-300 leading-relaxed">
                      "{log.message}"
                    </p>
                  </div>

                  {/* Expanded Diagnostics */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-dashed border-slate-200 dark:border-zinc-800 space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Detail Log ID</span>
                          <span className="font-mono text-[10px] font-bold select-all text-black dark:text-white bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                            {log.id}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Status Hubungan</span>
                          <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                            {log.status === "FAILED" ? "Gagal mengirim via gateway API" : "Terkirim & tercatat aman"}
                          </span>
                        </div>
                      </div>

                      {log.status === "FAILED" && log.errorMessage && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl mt-2">
                          <span className="block text-[9px] font-black text-red-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> LAPORAN ERROR GATEWAY
                          </span>
                          <p className="font-mono text-[10px] text-red-650 dark:text-red-400 leading-relaxed select-text">
                            {log.errorMessage}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
