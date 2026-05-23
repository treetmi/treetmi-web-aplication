"use client"

import React, { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HelpCircle, ArrowLeft, ChevronDown } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/components/language-provider"

const FAQ_DATA_ID = [
  {
    category: "Donasi & Pembayaran",
    items: [
      { q: "Apakah donasi bisa dibatalkan atau di-refund?", a: "Tidak. Sesuai dengan Syarat & Ketentuan kami, semua dukungan bersifat sukarela dan non-refundable (tidak dapat dikembalikan). Pastikan nominal sudah benar sebelum mengonfirmasi pembayaran." },
      { q: "Metode pembayaran apa saja yang didukung?", a: "Kami mendukung berbagai metode pembayaran termasuk QRIS (langsung cair), transfer bank virtual account (BCA, Mandiri, BNI, BRI), dan e-wallet (Gopay, OVO, Dana, ShopeePay)." },
      { q: "Berapa potongan biaya (fee) platform?", a: "Treetmi membebankan potongan terendah di industri untuk biaya operasional server dan payment gateway. Rincian persentase fee bisa berbeda antara donasi biasa dan jasa mabar, dan selalu ditampilkan secara transparan di dashboard kreator." }
    ]
  },
  {
    category: "Jasa Mabar (Main Bareng)",
    items: [
      { q: "Bagaimana cara kerja antrean Mabar?", a: "Saat Anda memesan slot mabar, dana Anda akan diamankan (escrow). Nama Anda akan masuk ke antrean kreator. Kreator wajib mengundang Anda ke dalam game sesuai jadwal." },
      { q: "Kreator tidak mengajak saya mabar, bagaimana nasib dana saya?", a: "Jika kreator terbukti menolak atau tidak merespons pesanan mabar tanpa alasan logis, Anda dapat melaporkan hal ini ke support kami dalam waktu 1x24 jam untuk dilakukan mediasi." }
    ]
  },
  {
    category: "Untuk Kreator",
    items: [
      { q: "Bagaimana cara menarik dana (withdrawal)?", a: "Anda dapat menarik dana ke rekening bank yang terdaftar melalui menu 'Withdrawal' di Dashboard. Proses pencairan biasanya memakan waktu 1-2 hari kerja." },
      { q: "Bagaimana cara memasang notifikasi donasi di OBS?", a: "Setelah mendaftar, masuk ke menu 'Widget Studio' di Dashboard. Copy URL overlay unik Anda dan tambahkan sebagai 'Browser Source' di aplikasi OBS/Streamlabs Anda." },
      { q: "Mengapa akun saya ditangguhkan (suspended)?", a: "Akun dapat ditangguhkan jika terdeteksi adanya pelanggaran seperti pencucian uang, penipuan, atau mengabaikan antrean mabar berulang kali. Hubungi tim support untuk klarifikasi." }
    ]
  }
]

const FAQ_DATA_EN = [
  {
    category: "Donations & Payments",
    items: [
      { q: "Can donations be canceled or refunded?", a: "No. In accordance with our Terms & Conditions, all support is voluntary and non-refundable. Please make sure the amount is correct before confirming payment." },
      { q: "What payment methods are supported?", a: "We support various payment methods including QRIS (instant clearance), virtual account bank transfers (BCA, Mandiri, BNI, BRI), and e-wallets (Gopay, OVO, Dana, ShopeePay)." },
      { q: "How much is the platform commission fee?", a: "Treetmi charges the lowest commission in the industry to cover server operations and payment gateway costs. The fee percentage details may differ between standard donations and play session (mabar) services, and are always displayed transparently in the creator dashboard." }
    ]
  },
  {
    category: "Play Session (Mabar) Services",
    items: [
      { q: "How does the Mabar queue work?", a: "When you book a play session slot, your funds will be held in escrow. Your name will enter the creator's queue. The creator is required to invite you into the game according to schedule." },
      { q: "The creator did not play with me, what happens to my funds?", a: "If the creator is proven to reject or ignore the play session request without a logical reason, you can report this to our support team within 24 hours for mediation." }
    ]
  },
  {
    category: "For Creators",
    items: [
      { q: "How do I withdraw my funds?", a: "You can withdraw funds to your registered bank account via the 'Withdrawal' menu in the Dashboard. The processing time typically takes 1-2 business days." },
      { q: "How do I setup donation alerts on OBS?", a: "After registering, go to the 'Widget Studio' menu in the Dashboard. Copy your unique overlay URL and add it as a 'Browser Source' in your OBS/Streamlabs application." },
      { q: "Why was my account suspended?", a: "Accounts can be suspended if violations such as money laundering, fraud, or repeatedly neglecting the play session queue are detected. Please contact support for clarification." }
    ]
  }
]

function FaqItem({ q, a }: { q: string, a: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-slate-100 dark:border-zinc-800 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left font-bold text-slate-800 dark:text-zinc-200 hover:text-amber-500 transition-colors"
      >
        <span>{q}</span>
        <ChevronDown className={`size-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-amber-500" : "text-slate-400"}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm font-semibold text-slate-500 dark:text-zinc-400 leading-relaxed">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FaqPage() {
  const { lang } = useLanguage()
  const isIndo = lang === "id"
  const faqData = isIndo ? FAQ_DATA_ID : FAQ_DATA_EN

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
          <div className="space-y-4 mb-10 pb-8 border-b border-slate-100 dark:border-zinc-800 text-center md:text-left">
            <div className="h-14 w-14 rounded-2xl bg-[#FFD551]/10 text-[#FFD551] flex items-center justify-center mx-auto md:mx-0">
              <HelpCircle className="size-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {isIndo ? "Pertanyaan yang Sering Diajukan (FAQ)" : "Frequently Asked Questions (FAQ)"}
            </h1>
            <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">
              {isIndo 
                ? "Temukan jawaban cepat untuk pertanyaan seputar platform Treetmi."
                : "Find quick answers to questions about the Treetmi platform."}
            </p>
          </div>

          <div className="space-y-10">
            {faqData.map((category, idx) => (
              <section key={idx} className="space-y-3">
                <h2 className="text-xl font-black text-[#FFD551] uppercase tracking-wider italic">
                  {category.category}
                </h2>
                <div className="bg-slate-50 dark:bg-zinc-950/50 rounded-2xl p-2 px-6 border border-slate-100 dark:border-zinc-800">
                  {category.items.map((item, itemIdx) => (
                    <FaqItem key={itemIdx} q={item.q} a={item.a} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12 p-6 bg-slate-900 dark:bg-[#121212] rounded-2xl text-center text-white border border-slate-800">
            <h3 className="font-black text-lg mb-2">
              {isIndo ? "Masih butuh bantuan?" : "Still need help?"}
            </h3>
            <p className="text-xs text-slate-400 font-semibold mb-4">
              {isIndo ? "Tim support kami siap membantu Anda 24/7." : "Our support team is ready to help you 24/7."}
            </p>
            <a href="mailto:support@treetmi.id" className="inline-block px-6 py-2.5 bg-[#FFD551] text-black font-black rounded-xl text-sm hover:bg-[#FFC83B] transition-colors uppercase italic">
              {isIndo ? "Hubungi Support" : "Contact Support"}
            </a>
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  )
}
