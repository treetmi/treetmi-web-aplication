"use client"

import React, { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Scale, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PUBLIC_API } from "@/lib/api"
import { motion } from "framer-motion"

export default function TermsPage() {
  const [companyName, setCompanyName] = useState("PT Asosiasi Karya Treetmi")

  useEffect(() => {
    fetch(PUBLIC_API.publicSettings)
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data?.companyName) {
          setCompanyName(json.data.companyName)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <main className="min-h-screen bg-[#F8F7F3] dark:bg-[#0A0A0A] flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 py-12 max-w-4xl relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-amber-500 transition-colors mb-6">
          <ArrowLeft className="size-4" /> Kembali ke Beranda
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 md:p-12 shadow-sm"
        >
          <div className="space-y-4 mb-10 pb-8 border-b border-slate-100 dark:border-zinc-800">
            <div className="h-14 w-14 rounded-2xl bg-[#FFD551]/10 text-[#FFD551] flex items-center justify-center">
              <Scale className="size-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Syarat & Ketentuan Layanan
            </h1>
            <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
              Berlaku Efektif: 19 Mei 2026
            </p>
          </div>

          <div className="space-y-8 text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-medium">
            <section className="space-y-3">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">1. Kedudukan Para Pihak</h2>
              <p>
                Platform Treetmi.id dioperasikan oleh <strong>{companyName}</strong> sebagai penyedia layanan portal kreator dan sistem escrow independen. Dalam Syarat & Ketentuan ini, terdapat tiga pihak yang saling mengikat:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Platform (Treetmi):</strong> Fasilitator sistem yang menjembatani transaksi antara Donatur dan Kreator.</li>
                <li><strong>Kreator:</strong> Pengguna terdaftar yang menerima dukungan finansial or menawarkan jasa mabar.</li>
                <li><strong>Donatur/Supporter:</strong> Pengguna yang mengirimkan dukungan finansial atau memesan jasa secara sukarela kepada Kreator.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">2. Sifat Dukungan (Donasi)</h2>
              <p>
                Semua transaksi berlabel "Kirim Dukungan" atau "Donasi" tunduk pada aturan berikut:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Dukungan bersifat <strong>sukarela, hibah bersyarat, dan non-refundable</strong>. Donatur tidak berhak melakukan penarikan dana (chargeback) setelah transaksi berhasil diproses oleh payment gateway.</li>
                <li>Pesan dukungan yang mengandung unsur SARA, kebencian, atau melanggar hukum dapat dihapus oleh Kreator atau Platform tanpa pengembalian dana.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">3. Jasa Mabar & Escrow</h2>
              <p>
                Untuk transaksi berlabel "Mabar" (Main Bareng), kami menerapkan sistem escrow demi keamanan:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Dana donatur akan ditahan sementara oleh sistem Platform hingga sesi bermain selesai atau waktu tunggu (SLA) terpenuhi.</li>
                <li>Kreator wajib memenuhi kewajiban mabar sesuai detail paket yang disepakati. Kegagalan memenuhi kewajiban dapat mengakibatkan penalti hingga penangguhan akun (suspend).</li>
                <li>Jika terjadi sengketa, Donatur dapat mengajukan komplain dalam waktu 1x24 jam sejak transaksi dilakukan. Keputusan superadmin bersifat final.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">4. Biaya Platform (Fee)</h2>
              <p>
                Platform mengenakan potongan biaya (fee) atas transaksi yang berhasil untuk biaya operasional dan gerbang pembayaran. Persentase fee dapat berubah sewaktu-waktu dan akan diinformasikan di halaman profil masing-masing kreator. Transaksi donasi murni dan mabar dapat memiliki tarif potongan yang berbeda.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">5. Penangguhan Akun (Suspend)</h2>
              <p>
                Kami berhak membekukan, menangguhkan, atau menghapus akun Kreator yang terbukti:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Melakukan penipuan atau pencucian uang.</li>
                <li>Menyebarkan konten pornografi, perjudian, atau barang ilegal lainnya.</li>
                <li>Mengabaikan kewajiban jasa mabar secara berulang tanpa alasan logis.</li>
              </ul>
              <p>Selama masa penangguhan, kreator tidak dapat menerima dukungan baru maupun mencairkan dana (withdrawal).</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">6. Batas Tanggung Jawab</h2>
              <p>
                Treetmi bertindak sebagai perantara sistem pembayaran dan tidak bertanggung jawab atas isi konten yang disiarkan Kreator. Segala bentuk perpajakan yang timbul dari pendapatan di platform menjadi tanggung jawab pribadi masing-masing Kreator sesuai ketentuan perundang-undangan perpajakan di Indonesia.
              </p>
            </section>
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  )
}
