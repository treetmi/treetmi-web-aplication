"use client"

import React from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ShieldCheck, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useLanguage } from "@/components/language-provider"

interface PrivacyContentProps {
  companyName: string
}

export function PrivacyContent({ companyName }: PrivacyContentProps) {
  const { lang } = useLanguage()
  const isIndo = lang === "id"

  return (
    <main className="min-h-screen bg-[#F8F7F3] dark:bg-[#0A0A0A] flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 py-12 max-w-4xl relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-amber-500 transition-colors mb-6">
          <ArrowLeft className="size-4" /> {isIndo ? "Kembali ke Beranda" : "Back to Home"}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 md:p-12 shadow-sm"
        >
          <div className="space-y-4 mb-10 pb-8 border-b border-slate-100 dark:border-zinc-800">
            <div className="h-14 w-14 rounded-2xl bg-[#FFD551]/10 text-[#FFD551] flex items-center justify-center">
              <ShieldCheck className="size-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {isIndo ? "Kebijakan Privasi" : "Privacy Policy"}
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
              {isIndo ? "Pembaruan Terakhir: 19 Mei 2026" : "Last Updated: May 19, 2026"}
            </p>
          </div>

          <div className="space-y-8 text-sm text-slate-650 dark:text-zinc-350 leading-relaxed font-semibold">
            {isIndo ? (
              <>
                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">1. Pendahuluan</h2>
                  <p>
                    Selamat datang di Treetmi.id. Kebijakan Privasi ini menjelaskan bagaimana <strong>{companyName}</strong> ("Kami", "Platform", atau "Treetmi") mengumpulkan, menggunakan, membagikan, dan melindungi informasi pribadi Anda saat Anda menggunakan layanan kami, baik sebagai Kreator maupun Donatur, sesuai dengan Undang-Undang Pelindungan Data Pribadi (UU PDP) No. 27 Tahun 2022 yang berlaku di Indonesia.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">2. Data yang Kami Kumpulkan</h2>
                  <p>Kami hanya mengumpulkan data yang relevan dan diperlukan untuk memfasilitasi transaksi dan layanan platform:</p>
                  <ul className="list-disc pl-5 space-y-1.5 font-medium">
                    <li><strong>Informasi Akun:</strong> Nama, alamat email terverifikasi (via Google/OAuth), dan username.</li>
                    <li><strong>Informasi Profil Kreator:</strong> Bio, tautan sosial media, avatar, dan banner.</li>
                    <li><strong>Data Transaksi:</strong> Riwayat donasi, nominal, pesan publik, ID Game (untuk mabar), serta metode pembayaran yang dipilih (diproses secara aman oleh gateway pembayaran berlisensi PCI-DSS).</li>
                    <li><strong>Data Finansial (Hanya Kreator):</strong> Nomor rekening bank yang digunakan untuk pencairan dana (withdrawal). Kami tidak menyimpan rincian kartu kredit donatur.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">3. Penggunaan Data Pribadi</h2>
                  <p>Data pribadi Anda digunakan untuk tujuan berikut:</p>
                  <ul className="list-disc pl-5 space-y-1.5 font-medium">
                    <li>Memfasilitasi transfer dana escrow dari Donatur ke Kreator.</li>
                    <li>Memverifikasi identitas kreator untuk mencegah penipuan dan pencucian uang (AML/KYC).</li>
                    <li>Menyediakan overlay notifikasi (widget OBS) secara real-time.</li>
                    <li>Menanggapi pertanyaan, keluhan, dan dukungan pelanggan.</li>
                    <li>Mengirimkan pemberitahuan sistem dan pembaruan layanan.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">4. Berbagi Data dengan Pihak Ketiga</h2>
                  <p>
                    Kami sangat menghargai privasi Anda dan <strong>tidak menjual</strong> data Anda kepada pihak manapun. Data Anda hanya dibagikan secara terbatas kepada:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 font-medium">
                    <li><strong>Mitra Pembayaran:</strong> Penyelenggara Jasa Pembayaran (PJP) resmi berlisensi BI untuk memproses transaksi secara aman.</li>
                    <li><strong>Otoritas Hukum:</strong> Kepolisian RI, OJK, atau PPATK jika diwajibkan oleh hukum atau untuk investigasi penipuan/tindak kejahatan.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">5. Hak Pengguna (Sesuai UU PDP)</h2>
                  <p>Sebagai subjek data, Anda berhak untuk:</p>
                  <ul className="list-disc pl-5 space-y-1.5 font-medium">
                    <li>Mengakses data pribadi Anda yang ada di sistem kami.</li>
                    <li>Meminta perbaikan atau pembaruan data yang tidak akurat.</li>
                    <li>Meminta penghapusan data akun Anda (Right to be Forgotten), selama tidak bertentangan dengan kewajiban retensi data transaksi finansial berdasarkan regulasi BI.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">6. Keamanan Data</h2>
                  <p>
                    Kami menerapkan standar keamanan industri, enkripsi transmisi (SSL/TLS), dan kontrol akses ketat untuk melindungi data Anda dari akses yang tidak sah, perubahan, pengungkapan, atau perusakan.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">7. Kontak dan Pertanyaan</h2>
                  <p>
                    Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini atau ingin menggunakan hak-hak privasi Anda, silakan hubungi Data Protection Officer (DPO) kami melalui email di: <strong>privacy@treetmi.id</strong>
                  </p>
                </section>
              </>
            ) : (
              <>
                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">1. Introduction</h2>
                  <p>
                    Welcome to Treetmi.id. This Privacy Policy describes how <strong>{companyName}</strong> ("We", "Platform", or "Treetmi") collects, uses, shares, and protects your personal information when you use our services, both as a Creator and a Donator, in accordance with the Law on Personal Data Protection (UU PDP) No. 27 of 2022 in force in Indonesia.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">2. Data We Collect</h2>
                  <p>We only collect relevant data necessary to facilitate transactions and platform services:</p>
                  <ul className="list-disc pl-5 space-y-1.5 font-medium">
                    <li><strong>Account Information:</strong> Name, verified email address (via Google/OAuth), and username.</li>
                    <li><strong>Creator Profile Info:</strong> Bio, social media links, avatar, and banner.</li>
                    <li><strong>Transaction Data:</strong> Donation history, amount, public message, Game ID (for mabar), and chosen payment method (securely processed by BI licensed/PCI-DSS compliant payment gateways).</li>
                    <li><strong>Financial Data (Creators Only):</strong> Bank account details used for payout (withdrawal). We do not store donator credit card details.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">3. Use of Personal Data</h2>
                  <p>Your personal data is utilized for the following purposes:</p>
                  <ul className="list-disc pl-5 space-y-1.5 font-medium">
                    <li>Facilitating escrow fund transfers from Donator to Creator.</li>
                    <li>Verifying creator identity to prevent fraud and money laundering (AML/KYC).</li>
                    <li>Providing real-time notification overlays (OBS widgets).</li>
                    <li>Responding to questions, complaints, and customer support inquiries.</li>
                    <li>Sending system alerts and service updates.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">4. Data Sharing with Third Parties</h2>
                  <p>
                    We highly value your privacy and <strong>do not sell</strong> your data to any party. Your data is shared only on a limited basis with:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 font-medium">
                    <li><strong>Payment Partners:</strong> Official BI-licensed Payment Service Providers (PJP) to securely process transactions.</li>
                    <li><strong>Legal Authorities:</strong> Indonesian National Police, OJK, or PPATK if required by law or for fraud/criminal investigation purposes.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">5. User Rights (Under UU PDP)</h2>
                  <p>As a data subject, you are entitled to:</p>
                  <ul className="list-disc pl-5 space-y-1.5 font-medium">
                    <li>Access your personal data in our system.</li>
                    <li>Request correction or update of inaccurate data.</li>
                    <li>Request deletion of your account data (Right to be Forgotten), provided it does not conflict with financial transaction retention obligations under Bank Indonesia (BI) regulations.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">6. Data Security</h2>
                  <p>
                    We apply industry-standard security measures, transmission encryption (SSL/TLS), and strict access control to protect your data from unauthorized access, alteration, disclosure, or destruction.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">7. Contact and Inquiries</h2>
                  <p>
                    If you have any questions regarding this Privacy Policy or wish to exercise your privacy rights, please contact our Data Protection Officer (DPO) via email at: <strong>privacy@treetmi.id</strong>
                  </p>
                </section>
              </>
            )}
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  )
}
