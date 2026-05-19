"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ShieldCheck, Scale, AlertCircle } from "lucide-react"
import { PUBLIC_API } from "@/lib/api"

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  const [companyName, setCompanyName] = useState("PT Asosiasi Karya Treetmi")

  useEffect(() => {
    if (!isOpen) return
    fetch(PUBLIC_API.publicSettings)
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data?.companyName) {
          setCompanyName(json.data.companyName)
        }
      })
      .catch(() => {}) // silently fallback to default
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          {/* Backdrop closer */}
          <div className="absolute inset-0" onClick={onClose} />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-2xl bg-white dark:bg-[#121211] border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] p-6 md:p-8 shadow-2xl z-10 flex flex-col max-h-[85vh] overflow-hidden text-slate-800 dark:text-[#EAE9E4]"
          >
            {/* Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-zinc-900">
              <div className="space-y-1.5 text-left">
                <h3 className="text-lg md:text-xl font-black italic tracking-tighter text-black dark:text-white flex items-center gap-2">
                  <Scale className="h-5 w-5 text-[#FFD551]" /> Syarat & Ketentuan Layanan (Treetmi)
                </h3>
                <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">
                  PERNYATAAN HUKUM & BATAS TANGGUNG JAWAB TRANSAKSI
                </p>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            {/* Scrollable Legal Body Content */}
            <div className="flex-1 overflow-y-auto py-6 pr-2 space-y-5 text-left text-xs md:text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-200">
              
              <div className="p-4 bg-amber-500/5 border border-[#FFD551]/30 rounded-2xl flex gap-3 items-start">
                <AlertCircle className="h-5 w-5 text-[#FFD551] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-black italic text-xs uppercase tracking-wider text-amber-600 dark:text-[#FFD551]">Pemberitahuan Penting Donatur:</p>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                    Dukungan yang Anda kirimkan bersifat **sukarela, non-refundable (tidak dapat dikembalikan/dibatalkan)**, dan merupakan bentuk apresiasi/hibah langsung kepada kreator untuk pengembangan karya mereka.
                  </p>
                </div>
              </div>

              {/* Pasal 1 */}
              <div className="space-y-2">
                <h4 className="font-black italic text-xs uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#FFD551]" /> 1. KEDUDUKAN & KESEPAKATAN PARA PIHAK
                </h4>
                <p className="text-slate-500 dark:text-zinc-400 font-semibold leading-relaxed">
                  Layanan Treetmi dioperasikan oleh <strong>{companyName}</strong> sebagai penyedia sistem gerbang pembayaran dan escrow independen. Transaksi di platform ini mengikat tiga pihak secara hukum:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-500 dark:text-zinc-400 font-medium">
                  <li><strong>Donatur/Pengirim Dana:</strong> Pihak yang secara sadar, sukarela, dan tanpa paksaan mengirimkan dana sebagai bentuk apresiasi kreativitas atau memesan sesi mabar dari Kreator.</li>
                  <li><strong>Kreator/Penerima Dana:</strong> Pihak penerima apresiasi yang bertanggung jawab penuh atas pemenuhan janji konten, sesi bermain bersama (mabar), atau pengiriman karya digital.</li>
                  <li><strong>Treetmi (Platform):</strong> Fasilitator transfer dana aman berlisensi PJP (Penyelenggara Jasa Pembayaran) Kategori 3 yang bertugas mengamankan transaksi hingga selesai.</li>
                </ul>
              </div>

              {/* Pasal 2 */}
              <div className="space-y-2">
                <h4 className="font-black italic text-xs uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#FFD551]" /> 2. SIFAT DUKUNGAN (DONASI) SUKARELA
                </h4>
                <p className="text-slate-500 dark:text-zinc-400 font-semibold">
                  Semua transaksi berlabel **"Kirim Dukungan" (Donasi)** adalah hibah langsung bersyarat dari donatur kepada kreator:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-500 dark:text-zinc-400 font-medium">
                  <li>Dana ditransfer secara mutlak setelah sukses diproses oleh gerbang pembayaran.</li>
                  <li>Pengirim tidak dapat menuntut pengembalian dana (*chargeback* atau *refund*) dengan alasan apa pun karena transaksi ini bukan transaksi pembelian barang komersial biasa.</li>
                  <li>Treetmi tidak bertanggung jawab atas isi pesan teks atau tautan mediashare yang dikirim oleh donatur. Kreator berhak menyaring atau memblokir pesan yang melanggar norma hukum.</li>
                </ul>
              </div>

              {/* Pasal 3 */}
              <div className="space-y-2">
                <h4 className="font-black italic text-xs uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#FFD551]" /> 3. JASA MABAR & KARYA DIGITAL
                </h4>
                <p className="text-slate-500 dark:text-zinc-400 font-semibold">
                  Semua transaksi berlabel **"Mabar" (Main Bareng) atau "Karya Digital"**:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-500 dark:text-zinc-400 font-medium">
                  <li><strong>Tanggung Jawab Kreator:</strong> Kreator wajib melayani sesi bermain game sesuai dengan game, slot antrean, dan paket yang telah dipesan oleh Donatur.</li>
                  <li><strong>Peran Mediasi Platform:</strong> Dana mabar akan diamankan dalam escrow sistem Treetmi. Pencairan dana mabar ke rekening Kreator akan mengikuti jadwal reguler setelah masa penahanan kliring aman berakhir.</li>
                  <li>Jika Kreator terbukti secara sepihak menolak mabar atau tidak memenuhi kewajibannya tanpa alasan logis, Donatur berhak mengajukan aduan bantuan tiket resmi dalam waktu 24 jam untuk dimediasi oleh superadmin.</li>
                </ul>
              </div>

              {/* Pasal 4 */}
              <div className="space-y-2">
                <h4 className="font-black italic text-xs uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#FFD551]" /> 4. KEPATUHAN HUKUM & ANTI-PENCUCIAN UANG (AML)
                </h4>
                <p className="text-slate-500 dark:text-zinc-400 font-medium">
                  Para pihak dilarang keras menggunakan sistem transfer dana Treetmi untuk tindakan ilegal, termasuk namun tidak terbatas pada pendanaan terorisme, pencucian uang (money laundering), perjudian online, pornografi, prostitusi, atau penipuan. Treetmi bekerja sama dengan aparat penegak hukum Indonesia dan OJK/BI untuk melaporkan transaksi yang mencurigakan secara instan.
                </p>
              </div>

            </div>

            {/* Footer buttons */}
            <div className="pt-4 border-t border-slate-100 dark:border-zinc-900 flex justify-end">
              <Button
                onClick={onClose}
                className="bg-[#FFD551] text-black font-black italic text-xs uppercase tracking-wider h-11 px-6 rounded-2xl hover:bg-[#FFC83B] transition-colors"
              >
                Saya Memahami & Menyetujui
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Small mock Button inline copy for typescript compatibility if imported inside Modal layout
function Button({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl font-bold flex items-center justify-center active:scale-95 transition-all cursor-pointer ${className}`}
    >
      {children}
    </button>
  )
}
