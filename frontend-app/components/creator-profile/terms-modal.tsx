"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ShieldCheck, Scale, AlertCircle } from "lucide-react"
import { PUBLIC_API } from "@/lib/api"
import { useLanguage } from "@/components/language-provider"

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  const { lang } = useLanguage()
  const isIndo = lang === "id"
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
                  <Scale className="h-5 w-5 text-[#FFD551]" /> {isIndo ? "Syarat & Ketentuan Layanan (Treetmi)" : "Terms & Conditions of Service (Treetmi)"}
                </h3>
                <p className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">
                  {isIndo ? "PERNYATAAN HUKUM & BATAS TANGGUNG JAWAB TRANSAKSI" : "LEGAL STATEMENT & LIMITATION OF TRANSACTION LIABILITY"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            {/* Scrollable Legal Body Content */}
            <div className="flex-1 overflow-y-auto py-6 pr-2 space-y-5 text-left text-xs md:text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-200">
              
              <div className="p-4 bg-amber-500/5 border border-[#FFD551]/30 rounded-2xl flex gap-3 items-start">
                <AlertCircle className="h-5 w-5 text-[#FFD551] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-black italic text-xs uppercase tracking-wider text-amber-600 dark:text-[#FFD551]">{isIndo ? "Pemberitahuan Penting Donatur:" : "Important Donor Notice:"}</p>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                    {isIndo ? (
                      <>
                        Dukungan yang Anda kirimkan bersifat <span className="font-extrabold text-black dark:text-white bg-amber-500/10 px-1 py-0.5 rounded">sukarela, non-refundable (tidak dapat dikembalikan/dibatalkan)</span>, dan merupakan bentuk apresiasi/hibah langsung kepada kreator untuk pengembangan karya mereka.
                      </>
                    ) : (
                      <>
                        The support you send is <span className="font-extrabold text-black dark:text-white bg-amber-500/10 px-1 py-0.5 rounded">voluntary, non-refundable (cannot be returned/cancelled)</span>, and is a direct appreciation/grant to the creator for their creative work development.
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Pasal 1 */}
              <div className="space-y-2">
                <h4 className="font-black italic text-xs uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#FFD551]" /> {isIndo ? "1. KEDUDUKAN & KESEPAKATAN PARA PIHAK" : "1. POSITION & AGREEMENT OF THE PARTIES"}
                </h4>
                <p className="text-slate-500 dark:text-zinc-400 font-semibold leading-relaxed">
                  {isIndo ? (
                    <>Layanan Treetmi dioperasikan oleh <strong>{companyName}</strong> sebagai penyedia sistem gerbang pembayaran dan escrow independen. Transaksi di platform ini mengikat tiga pihak secara hukum:</>
                  ) : (
                    <>Treetmi services are operated by <strong>{companyName}</strong> as an independent payment gateway and escrow system provider. Transactions on this platform legally bind three parties:</>
                  )}
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-500 dark:text-zinc-400 font-medium">
                  {isIndo ? (
                    <>
                      <li><strong>Donatur/Pengirim Dana:</strong> Pihak yang secara sadar, sukarela, dan tanpa paksaan mengirimkan dana sebagai bentuk apresiasi kreativitas atau memesan sesi mabar dari Kreator.</li>
                      <li><strong>Kreator/Penerima Dana:</strong> Pihak penerima apresiasi yang bertanggung jawab penuh atas pemenuhan janji konten, sesi bermain bersama (mabar), atau pengiriman karya digital.</li>
                      <li><strong>Treetmi (Platform):</strong> Fasilitator transfer dana aman berlisensi PJP (Penyelenggara Jasa Pembayaran) Kategori 3 yang bertugas mengamankan transaksi hingga selesai.</li>
                    </>
                  ) : (
                    <>
                      <li><strong>Donor/Sender of Funds:</strong> The party who consciously, voluntarily, and without coercion sends funds as a form of creative appreciation or orders a play session (mabar) from the Creator.</li>
                      <li><strong>Creator/Receiver of Funds:</strong> The receiving party of the appreciation who is fully responsible for fulfilling content promises, play sessions (mabar), or delivering digital creations.</li>
                      <li><strong>Treetmi (Platform):</strong> Secure fund transfer facilitator licensed as a Category 3 Payment Service Provider (PJP) tasked with securing transactions until completion.</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Pasal 2 */}
              <div className="space-y-2">
                <h4 className="font-black italic text-xs uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#FFD551]" /> {isIndo ? "2. SIFAT DUKUNGAN (DONASI) SUKARELA" : "2. NATURE OF VOLUNTARY SUPPORT (DONATION)"}
                </h4>
                <p className="text-slate-500 dark:text-zinc-400 font-semibold">
                  {isIndo ? (
                    <>Semua transaksi berlabel <span className="font-extrabold">"Kirim Dukungan" (Donasi)</span> adalah hibah apresiasi sukarela langsung dari donatur kepada kreator:</>
                  ) : (
                    <>All transactions labeled <span className="font-extrabold">"Send Support" (Donation)</span> are voluntary appreciation grants directly from donors to creators:</>
                  )}
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-500 dark:text-zinc-400 font-medium">
                  {isIndo ? (
                    <>
                      <li>Dana ditransfer secara mutlak setelah sukses diproses oleh gerbang pembayaran.</li>
                      <li>Pengirim tidak dapat menuntut pengembalian dana (<em>chargeback</em> atau <em>refund</em>) dengan alasan apa pun karena transaksi ini bukan transaksi pembelian barang komersial biasa.</li>
                      <li>Treetmi tidak bertanggung jawab atas isi pesan teks atau tautan mediashare yang dikirim oleh donatur. Kreator berhak menyaring atau memblokir pesan yang melanggar norma hukum.</li>
                    </>
                  ) : (
                    <>
                      <li>Funds are transferred absolutely once successfully processed by the payment gateway.</li>
                      <li>The sender cannot demand a refund (<em>chargeback</em> or <em>refund</em>) for any reason as this is not a regular commercial purchase transaction.</li>
                      <li>Treetmi is not responsible for the content of text messages or mediashare links sent by donors. Creators reserve the right to filter or block messages violating legal norms.</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Pasal 3 */}
              <div className="space-y-2">
                <h4 className="font-black italic text-xs uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#FFD551]" /> {isIndo ? "3. JASA MABAR & KARYA DIGITAL" : "3. PLAY SESSIONS & DIGITAL CREATIONS"}
                </h4>
                <p className="text-slate-500 dark:text-zinc-400 font-semibold">
                  {isIndo ? (
                    <>Semua transaksi berlabel <span className="font-extrabold">"Mabar" (Main Bareng) atau "Karya Digital"</span>:</>
                  ) : (
                    <>All transactions labeled <span className="font-extrabold">"Mabar" (Play Session) or "Digital Creation"</span>:</>
                  )}
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-500 dark:text-zinc-400 font-medium">
                  {isIndo ? (
                    <>
                      <li><strong>Tanggung Jawab Kreator:</strong> Kreator wajib melayani sesi bermain game sesuai dengan game, slot antrean, dan paket yang telah dipesan oleh Donatur.</li>
                      <li><strong>Peran Mediasi Platform:</strong> Dana mabar akan diamankan dalam escrow sistem Treetmi. Pencairan dana mabar ke rekening Kreator akan mengikuti jadwal reguler setelah masa penahanan kliring aman berakhir.</li>
                      <li>Jika Kreator terbukti secara sepihak menolak mabar atau tidak memenuhi kewajibannya tanpa alasan logis, Donatur berhak mengajukan aduan aduan bantuan tiket resmi dalam waktu 24 jam untuk dimediasi oleh superadmin.</li>
                    </>
                  ) : (
                    <>
                      <li><strong>Creator's Responsibility:</strong> The creator is obliged to serve game play sessions in accordance with the game, queue slot, and package ordered by the Donor.</li>
                      <li><strong>Platform Mediation Role:</strong> Mabar funds will be secured in Treetmi escrow system. Payout of mabar funds to the Creator's account will follow the regular schedule after the safe clearing hold period ends.</li>
                      <li>If the Creator is proven to unilaterally reject mabar or fail to fulfill obligations without logical reasons, the Donor is entitled to file a formal support ticket complaint within 24 hours to be mediated by the superadmin.</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Pasal 4 */}
              <div className="space-y-2">
                <h4 className="font-black italic text-xs uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#FFD551]" /> {isIndo ? "4. FITUR GACHA CHALLENGE & ANTI-PERJUDIAN" : "4. GACHA CHALLENGE & ANTI-GAMBLING"}
                </h4>
                <p className="text-slate-500 dark:text-zinc-400 font-semibold">
                  {isIndo ? (
                    <>Layanan Gacha Challenge (Roda Gacha Interaktif) murni berfungsi sebagai sarana interaktif, apresiasi hiburan, dan peningkatan keterlibatan (viewer engagement) yang menyenangkan:</>
                  ) : (
                    <>Gacha Challenge Service (Interactive Gacha Wheel) purely functions as a fun tool for interaction, entertainment appreciation, and viewer engagement:</>
                  )}
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-500 dark:text-zinc-400 font-medium">
                  {isIndo ? (
                    <>
                      <li><span className="font-extrabold text-black dark:text-white">Murni Sarana Hiburan Kreatif:</span> Gacha Challenge ini sama sekali bukan merupakan sarana undian berhadiah komersial, taruhan uang, spekulasi finansial, ataupun bentuk perjudian dalam hukum positif Indonesia.</li>
                      <li><span className="font-extrabold text-black dark:text-white">Larangan Keras Judi:</span> Dilarang keras menyalahgunakan fitur gacha untuk perjudian online atau taruhan komersial spekulatif bermotif finansial.</li>
                      <li><span className="font-extrabold text-black dark:text-white">Isi Segmen Hadiah:</span> Hadiah/reward yang didaftarkan wajib bersifat kreatif, wajar, non-finansial, dan tidak bertentangan dengan kesusilaan serta hukum positif yang berlaku.</li>
                    </>
                  ) : (
                    <>
                      <li><span className="font-extrabold text-black dark:text-white">Purely Creative Entertainment:</span> This Gacha Challenge is by no means a commercial prize draw, monetary betting, financial speculation, or any form of gambling under positive Indonesian law.</li>
                      <li><span className="font-extrabold text-black dark:text-white">Strict Gambling Prohibition:</span> It is strictly forbidden to misuse the gacha feature for online gambling or speculative commercial betting with financial motives.</li>
                      <li><span className="font-extrabold text-black dark:text-white">Prize Segment Content:</span> Registered prizes/rewards must be creative, reasonable, non-financial, and not conflict with morality or applicable positive law.</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Pasal 5 */}
              <div className="space-y-2">
                <h4 className="font-black italic text-xs uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#FFD551]" /> {isIndo ? "5. KEPATUHAN PENYELENGGARA SISTEM ELEKTRONIK (PSE) KOMDIGI" : "5. ELECTRONIC SYSTEM OPERATOR (PSE) COMPLIANCE"}
                </h4>
                <p className="text-slate-500 dark:text-zinc-400 font-medium font-semibold">
                  {isIndo ? (
                    <>Treetmi bertindak sebagai PSE Lingkup Privat resmi yang terdaftar dan patuh terhadap regulasi Kementerian Komunikasi dan Digital (Komdigi/Kominfo) RI. Seluruh transaksi dipantau secara otomatis oleh sistem sensor kata kustom demi mencegah pornografi, promosi perjudian, SARA, dan ujaran kebencian. Kami siap berkolaborasi penuh dengan aparat penegak hukum (Polri, PPATK, dan Komdigi) untuk memproses penyalahgunaan sistem donasi secara ilegal.</>
                  ) : (
                    <>Treetmi acts as an official Private Scope PSE registered and compliant with regulations of the Ministry of Communication and Digital (Komdigi/Kominfo) RI. All transactions are automatically monitored by custom keyword filtering systems to prevent pornography, gambling promotion, hate speech, and intolerance. We are ready to collaborate fully with law enforcement agencies to prosecute illegal donation system abuse.</>
                  )}
                </p>
              </div>

              {/* Pasal 6 */}
              <div className="space-y-2">
                <h4 className="font-black italic text-xs uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#FFD551]" /> {isIndo ? "6. KEPATUHAN HUKUM & ANTI-PENCUCIAN UANG (AML/APU-PPT)" : "6. LEGAL COMPLIANCE & ANTI-MONEY LAUNDERING (AML/CFT)"}
                </h4>
                <p className="text-slate-500 dark:text-zinc-400 font-medium font-semibold">
                  {isIndo ? (
                    <>Para pihak dilarang keras menggunakan sistem transfer dana Treetmi untuk tindakan ilegal, termasuk namun tidak terbatas pada pendanaan terorisme, pencucian uang (money laundering), perjudian online, pornografi, prostitusi, atau penipuan. Treetmi bekerja sama dengan aparat penegak hukum Indonesia dan PPATK untuk melaporkan transaksi yang mencurigakan secara instan demi menjaga sistem keuangan yang bersih dan tepercaya.</>
                  ) : (
                    <>The parties are strictly prohibited from using the Treetmi fund transfer system for illegal activities, including but not limited to terrorism financing, money laundering, online gambling, pornography, prostitution, or fraud. Treetmi cooperates with Indonesian law enforcement agencies and PPATK to report suspicious transactions instantly in order to maintain a clean and trusted financial system.</>
                  )}
                </p>
              </div>

            </div>

            {/* Footer buttons */}
            <div className="pt-4 border-t border-slate-100 dark:border-zinc-900 flex justify-end">
              <Button
                onClick={onClose}
                className="bg-[#FFD551] text-black font-black italic text-xs uppercase tracking-wider h-11 px-6 rounded-2xl hover:bg-[#FFC83B] transition-colors cursor-pointer"
              >
                {isIndo ? "Saya Memahami & Menyetujui" : "I Understand & Agree"}
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
