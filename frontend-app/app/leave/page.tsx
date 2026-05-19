"use client"

import React, { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, ExternalLink, Shield, X } from "lucide-react"

function LeaveContent() {
  const searchParams = useSearchParams()
  const url = searchParams.get("url") || ""

  // Parse display info from URL
  let displayHost = ""
  let displayUrl = ""
  let displayProtocol = ""
  try {
    if (url) {
      const u = new URL(url)
      displayHost = u.hostname.replace("www.", "")
      displayUrl = u.hostname + u.pathname
      displayProtocol = u.protocol.replace(":", "").toUpperCase()
    }
  } catch {
    displayUrl = url
  }

  const handleProceed = () => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const handleGoBack = () => {
    window.close()
    // Fallback jika window.close() tidak diizinkan browser
    window.location.href = "/"
  }

  if (!url) {
    return (
      <div className="min-h-screen bg-[#F8F7F3] dark:bg-[#0A0A0A] flex items-center justify-center p-4 selection:bg-[#FFD551] selection:text-black dark:selection:bg-[#FFD551] dark:selection:text-black">
        <div className="max-w-md w-full bg-white dark:bg-[#151515] border-2 md:border-[3px] border-black rounded-[2.5rem] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8 text-center space-y-5">
          <div className="size-14 rounded-2xl bg-slate-100 dark:bg-zinc-900 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mx-auto">
            <X className="size-6 text-slate-400" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight text-[#1A1A19] dark:text-[#EAE9E4]">
            Link Tidak Ditemukan
          </h1>
          <p className="text-xs font-semibold text-[#706E68] dark:text-[#A09E96] leading-relaxed">
            Link tujuan tidak valid atau sudah kadaluarsa. Silakan kembali ke halaman utama.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 dark:bg-[#FFD551] text-white dark:text-black text-xs font-black uppercase italic tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <ArrowLeft className="size-4" /> Kembali ke Beranda
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F7F3] dark:bg-[#0A0A0A] flex items-center justify-center p-4 selection:bg-[#FFD551] selection:text-black dark:selection:bg-[#FFD551] dark:selection:text-black relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/3 size-[30rem] rounded-full bg-[#FFD551]/5 dark:bg-[#FFD551]/2 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 size-[25rem] rounded-full bg-amber-500/5 dark:bg-amber-500/2 blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full bg-white dark:bg-[#151515] border-2 md:border-[3px] border-black rounded-[2.5rem] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative z-10 overflow-hidden">
        
        {/* Yellow top accent bar */}
        <div className="h-2 bg-[#FFD551]" />

        <div className="p-8 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="size-14 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
              <Shield className="size-7 text-amber-500" />
            </div>
            
            <div className="space-y-1.5">
              <h1 className="text-xl font-black uppercase tracking-tight text-[#1A1A19] dark:text-[#EAE9E4]">
                Kamu Akan Keluar dari Treetmi
              </h1>
              <p className="text-xs font-semibold text-[#706E68] dark:text-[#A09E96] leading-relaxed max-w-[320px] mx-auto">
                Link ini mengarah ke website eksternal yang bukan bagian dari treetmi.id. Pastikan kamu mempercayai link ini sebelum melanjutkan.
              </p>
            </div>
          </div>

          {/* Destination URL Card */}
          <div className="p-4 bg-slate-50 dark:bg-zinc-900 border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest italic bg-[#FFD551] text-black px-2.5 py-1 rounded-full border border-black leading-none">
                Tujuan Link
              </span>
              {displayProtocol && (
                <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  {displayProtocol}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-white dark:bg-zinc-800 border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center shrink-0">
                <ExternalLink className="size-5 text-slate-500 dark:text-zinc-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-[#1A1A19] dark:text-[#EAE9E4] truncate">
                  {displayHost || "External Link"}
                </p>
                <p className="text-[10px] font-semibold text-[#706E68] dark:text-[#A09E96] truncate">
                  {displayUrl}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleProceed}
              className="flex items-center justify-center gap-2 w-full h-14 rounded-xl bg-[#FFD551] text-black text-sm font-black uppercase italic tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
            >
              <ExternalLink className="size-4" /> Lanjut ke Website
            </button>
            
            <button
              onClick={handleGoBack}
              className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-white dark:bg-zinc-900 text-[#1A1A19] dark:text-[#EAE9E4] text-xs font-black uppercase italic tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
            >
              <ArrowLeft className="size-4" /> Kembali ke Treetmi
            </button>
          </div>

          {/* Safety Notice */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-900/40 rounded-xl text-center">
            <p className="text-[9px] font-bold text-amber-700 dark:text-amber-400 leading-relaxed uppercase tracking-wider">
              🔒 Tips: Jangan pernah membagikan password, kode OTP, atau data pribadi di website eksternal yang tidak kamu kenali.
            </p>
          </div>

          {/* Footer */}
          <p className="text-[8px] font-bold text-slate-300 dark:text-zinc-600 uppercase tracking-widest text-center italic">
            © 2026 Treetmi.id — Keamanan pengguna adalah prioritas kami
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LeavePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F7F3] dark:bg-[#0A0A0A] flex items-center justify-center">
          <div className="space-y-4 text-center">
            <div className="h-10 w-48 bg-slate-200/60 dark:bg-zinc-800/60 animate-pulse rounded-lg mx-auto" />
            <div className="h-6 w-32 bg-slate-200/40 dark:bg-zinc-800/40 animate-pulse rounded-lg mx-auto" />
          </div>
        </div>
      }
    >
      <LeaveContent />
    </Suspense>
  )
}