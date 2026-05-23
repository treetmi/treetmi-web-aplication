"use client"

import React, { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Scale, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PUBLIC_API } from "@/lib/api"
import { motion } from "framer-motion"
import { useLanguage } from "@/components/language-provider"

export default function TermsPage() {
  const [companyName, setCompanyName] = useState("PT Asosiasi Karya Treetmi")
  const { lang } = useLanguage()
  const isIndo = lang === "id"

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
          <ArrowLeft className="size-4" /> {isIndo ? "Kembali ke Beranda" : "Back to Home"}
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
              {isIndo ? "Syarat & Ketentuan Layanan" : "Terms of Service"}
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
              {isIndo ? "Berlaku Efektif: 19 Mei 2026" : "Effective Date: May 19, 2026"}
            </p>
          </div>

          <div className="space-y-8 text-sm text-slate-650 dark:text-zinc-350 leading-relaxed font-semibold">
            {isIndo ? (
              <>
                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">1. Kedudukan Para Pihak</h2>
                  <p>
                    Platform Treetmi.id dioperasikan oleh <strong>{companyName}</strong> sebagai penyedia layanan portal kreator dan sistem escrow independen. Dalam Syarat & Ketentuan ini, terdapat tiga pihak yang saling mengikat:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 font-medium text-slate-600 dark:text-zinc-400">
                    <li><strong>Platform (Treetmi):</strong> Fasilitator sistem yang menyediakan gerbang transaksi pembayaran dan escrow yang aman antara Donatur dan Kreator.</li>
                    <li><strong>Kreator:</strong> Pengguna terdaftar yang menerima dukungan finansial sukarela, menawarkan jasa mabar, atau mengaktifkan fitur tantangan interaktif.</li>
                    <li><strong>Donatur/Supporter:</strong> Pengguna yang mengirimkan dukungan finansial sukarela atau memesan slot jasa secara sukarela kepada Kreator demi apresiasi konten kreatif.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">2. Sifat Dukungan (Donasi)</h2>
                  <p>
                    Semua transaksi berlabel "Kirim Dukungan" atau "Donasi" tunduk pada aturan berikut:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 font-medium text-slate-600 dark:text-zinc-400">
                    <li>Dukungan bersifat <strong>sukarela, hibah apresiasi, dan non-refundable</strong>. Donatur tidak berhak melakukan penarikan dana (chargeback) setelah transaksi berhasil diproses oleh payment gateway eksternal.</li>
                    <li>Pesan dukungan yang dikirimkan donatur dilarang mengandung unsur SARA, ujaran kebencian, pornografi, ancaman, atau hal-hal yang melanggar hukum positif Indonesia.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">3. Jasa Mabar & Escrow</h2>
                  <p>
                    Untuk transaksi berlabel "Mabar" (Main Bareng), kami menerapkan sistem escrow demi keamanan bersama:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 font-medium text-slate-600 dark:text-zinc-400">
                    <li>Dana donatur akan ditahan sementara oleh sistem Platform hingga sesi bermain selesai atau waktu tunggu (SLA) terpenuhi.</li>
                    <li>Kreator wajib memenuhi kewajiban mabar sesuai detail paket dengan menjunjung sportivitas dan profesionalisme. Kegagalan berulang dapat mengakibatkan sanksi penangguhan akun.</li>
                    <li>Jika terjadi perselisihan, donatur dapat mengajukan sanggahan dalam waktu 1x24 jam sejak transaksi dilakukan. Keputusan superadmin bersifat final.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">4. Fitur Challenge Gacha & Kebijakan Anti-Perjudian (Anti-Gambling Policy)</h2>
                  <p>
                    Platform menyediakan fitur <strong>Gacha Challenge (Roda Gacha Interaktif)</strong> yang ditujukan semata-mata sebagai instrumen keterlibatan (viewer engagement) dan interaksi kreatif yang menyenangkan antara Donatur dan Kreator. Dalam penggunaannya, pihak-pihak yang terlibat tunduk pada kepatuhan hukum berikut:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 font-medium text-slate-600 dark:text-zinc-400">
                    <li><strong>Murni Media Interaktif & Hiburan:</strong> Fitur ini sama sekali bukan merupakan sarana undian berhadiah komersial, spekulasi finansial, taruhan, ataupun bentuk perjudian dalam definisi hukum positif Republik Indonesia (Pasal 303 KUHP & Pasal 27 ayat 2 UU ITE).</li>
                    <li><strong>Larangan Keras Perjudian:</strong> Seluruh pengguna (Kreator dan Donatur) dilarang keras menyalahgunakan fitur ini sebagai media perjudian online, taruhan komersial, undian spekulatif bermotif finansial, atau media memutar uang haram.</li>
                    <li><strong>Hadiah Kreatif Non-Finansial:</strong> Hadiah/reward yang dimasukkan ke dalam segmen Gacha Wheel wajib bersifat non-finansial, kreatif, dan wajar (seperti <em>follow back instagram</em>, <em>mabar bersama</em>, <em>request lagu</em>, atau konten hiburan sejenis) serta tidak melanggar hukum, kesusilaan, dan norma sosial.</li>
                    <li><strong>Tanggung Jawab Kreator:</strong> Kreator bertanggung jawab secara penuh, mandiri, dan hukum atas penyediaan, orisinalitas, dan pemenuhan reward yang dicantumkan dalam Gacha Wheel.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">5. Kebijakan Anti-Pencucian Uang & Pencegahan Pendanaan Terorisme (APU-PPT)</h2>
                  <p>
                    Sesuai dengan ketentuan regulasi perbankan Indonesia dan pengawasan transaksi keuangan nasional:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 font-medium text-slate-600 dark:text-zinc-400">
                    <li>Pengguna dilarang keras memanfaatkan gerbang donasi Treetmi.id untuk menyamarkan hasil kejahatan, pencucian uang (money laundering), atau mendanai aktivitas terorisme/organisasi terlarang.</li>
                    <li>Platform berhak melakukan verifikasi identitas (Know Your Customer / KYC) tambahan, menangguhkan penarikan dana (withdrawal lock), serta melaporkan transaksi mencurigakan kepada Pusat Pelaporan dan Analisis Transaksi Keuangan (PPATK) jika mendeteksi adanya indikasi pelanggaran keuangan.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">6. Kepatuhan Penyelenggara Sistem Elektronik (PSE) Komdigi RI</h2>
                  <p>
                    Sebagai Penyelenggara Sistem Elektronik (PSE) Lingkup Privat yang patuh terhadap Kementerian Komunikasi dan Digital (Komdigi/Kominfo) Republik Indonesia:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 font-medium text-slate-600 dark:text-zinc-400">
                    <li>Treetmi berkomitmen menjaga ruang digital Indonesia yang bersih, aman, sehat, dan patuh terhadap regulasi nasional.</li>
                    <li>Kami secara aktif dan berkala memantau konten, nama hadiah gacha, serta pesan donatur di seluruh portal kreator menggunakan sistem sensor otomatis dan moderasi manual.</li>
                    <li>Kami siap bekerja sama secara penuh dengan instansi kepolisian, OJK, Bappebti, PPATK, dan Komdigi untuk memproses hukum pihak-pihak yang menyalahgunakan platform untuk aktivitas ilegal.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">7. Biaya Platform (Fee)</h2>
                  <p>
                    Platform mengenakan potongan biaya (fee) atas transaksi yang berhasil untuk biaya operasional dan gerbang pembayaran. Persentase fee dapat berubah sewaktu-waktu dan diinformasikan secara transparan. Transaksi donasi apresiasi murni dan transaksi jasa mabar/gacha dapat memiliki tarif potongan yang berbeda.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">8. Penangguhan Akun (Suspend & Payout Lock)</h2>
                  <p>
                    Kami berhak membekukan, menangguhkan, atau menghapus akun Kreator serta memblokir saldo payout (withdrawal lock) yang terbukti:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 font-medium text-slate-600 dark:text-zinc-400">
                    <li>Melakukan penipuan, pencucian uang, atau manipulasi sistem donasi.</li>
                    <li>Menyebarkan konten pornografi, mempromosikan judi online, atau barang/jasa ilegal lainnya.</li>
                    <li>Mengabaikan kewajiban pemenuhan jasa mabar atau reward gacha secara berulang tanpa alasan logis.</li>
                  </ul>
                  <p className="mt-2">Selama masa penangguhan, kreator tidak dapat menerima dukungan baru maupun mencairkan dana (withdrawal).</p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">9. Batas Tanggung Jawab</h2>
                  <p>
                    Treetmi bertindak sebagai penyedia teknologi gerbang pembayaran dan tidak bertanggung jawab atas isi konten siaran live streaming Kreator. Segala bentuk kewajiban perpajakan yang timbul dari pendapatan di platform menjadi tanggung jawab pribadi masing-masing Kreator sesuai ketentuan perundang-undangan perpajakan di Indonesia.
                  </p>
                </section>
              </>
            ) : (
              <>
                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">1. Status of the Parties</h2>
                  <p>
                    Treetmi.id platform is operated by <strong>{companyName}</strong> as a creator portal service provider and independent escrow system provider. Under these Terms of Service, there are three mutually binding parties:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 font-medium text-slate-650 dark:text-zinc-400">
                    <li><strong>Platform (Treetmi):</strong> System facilitator providing a secure payment transaction gateway and escrow between Donator and Creator.</li>
                    <li><strong>Creator:</strong> Registered user receiving voluntary financial support, offering mabar services, or activating interactive challenge features.</li>
                    <li><strong>Donator/Supporter:</strong> User sending voluntary financial support or booking service slots voluntarily to Creators in appreciation of creative content.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">2. Nature of Support (Donation)</h2>
                  <p>
                    All transactions labeled "Send Support" or "Donation" are subject to the following rules:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 font-medium text-slate-650 dark:text-zinc-400">
                    <li>Support is <strong>voluntary, an appreciative grant, and non-refundable</strong>. Donators are not entitled to request chargebacks after the transaction is successfully processed by the external payment gateway.</li>
                    <li>Support messages sent by donators must not contain SARA (ethnic, religious, racial bias), hate speech, pornography, threats, or anything violating the positive laws of the Republic of Indonesia.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">3. Mabar Services & Escrow</h2>
                  <p>
                    For transactions labeled "Mabar" (Play Together), we apply an escrow system for mutual safety:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 font-medium text-slate-650 dark:text-zinc-400">
                    <li>Donator funds will be temporarily held by the Platform's system until the play session is completed or the SLA duration is met.</li>
                    <li>Creators must fulfill their play session obligations in accordance with package details, upholding sportsmanship and professionalism. Repeated failures may lead to account suspension.</li>
                    <li>In the event of a dispute, donators may submit an appeal within 24 hours of the transaction. Superadmin decisions are final.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">4. Gacha Challenge Feature & Anti-Gambling Policy</h2>
                  <p>
                    The Platform provides the <strong>Gacha Challenge (Interactive Gacha Wheel)</strong> feature intended solely as a viewer engagement and creative interaction tool between Donator and Creator. In its usage, the involved parties are subject to the following legal compliance:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 font-medium text-slate-650 dark:text-zinc-400">
                    <li><strong>Pure Interactive Media & Entertainment:</strong> This feature is in no way a means of commercial sweepstakes, financial speculation, betting, or any form of gambling under the positive law of the Republic of Indonesia (Article 303 of the Penal Code & Article 27 paragraph 2 of the ITE Law).</li>
                    <li><strong>Strict Prohibition of Gambling:</strong> All users (Creators and Donators) are strictly prohibited from abusing this feature as online gambling media, commercial betting, speculative sweepstakes with financial motives, or money laundering vehicles.</li>
                    <li><strong>Non-Financial Creative Rewards:</strong> Rewards entered in the Gacha Wheel segments must be non-financial, creative, and reasonable (such as <em>instagram follow-back</em>, <em>play together</em>, <em>song requests</em>, or similar entertainment content) and must not violate law, morality, and social norms.</li>
                    <li><strong>Creator's Responsibility:</strong> Creators assume full, independent, and legal responsibility for the provision, originality, and fulfillment of rewards listed on the Gacha Wheel.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">5. Anti-Money Laundering & Counter-Terrorism Financing Policy (AML-CTF)</h2>
                  <p>
                    In accordance with Indonesian banking regulations and national financial transaction monitoring guidelines:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 font-medium text-slate-650 dark:text-zinc-400">
                    <li>Users are strictly prohibited from utilizing the Treetmi.id donation gateway to conceal crime proceeds, engage in money laundering, or finance terrorism/illicit organizations.</li>
                    <li>The Platform reserves the right to perform additional identity verification (KYC), suspend payouts (withdrawal lock), and report suspicious transactions to the PPATK if indications of financial irregularities are detected.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">6. Compliance with Komdigi RI Electronic System Operator (PSE)</h2>
                  <p>
                    As a Private Scope Electronic System Operator (PSE) compliant with the Ministry of Communication and Digital (Komdigi/Kominfo) of the Republic of Indonesia:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 font-medium text-slate-650 dark:text-zinc-400">
                    <li>Treetmi is committed to maintaining a clean, safe, healthy, and compliant Indonesian digital space.</li>
                    <li>We actively and periodically monitor content, gacha reward names, and donator messages across creator portals using automatic filtering and manual moderation.</li>
                    <li>We stand ready to cooperate fully with police forces, OJK, Bappebti, PPATK, and Komdigi to prosecute parties misusing the platform for illegal activities.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">7. Platform Fee</h2>
                  <p>
                    The Platform charges a fee on successful transactions for operational costs and payment gateway fees. Fee percentages may change periodically and will be communicated transparently. Pure appreciation donations and mabar/gacha transactions may have different fee rates.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">8. Account Suspension (Suspend & Payout Lock)</h2>
                  <p>
                    We reserve the right to freeze, suspend, or delete Creator accounts and block payout balances (withdrawal lock) proven to:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 font-medium text-slate-650 dark:text-zinc-400">
                    <li>Engage in fraud, money laundering, or donation system manipulation.</li>
                    <li>Distribute pornography, promote online gambling, or other illegal goods/services.</li>
                    <li>Repeatedly neglect play session obligations or gacha rewards without logical justification.</li>
                  </ul>
                  <p className="mt-2">During the suspension period, creators cannot receive new support or withdraw funds.</p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">9. Limitation of Liability</h2>
                  <p>
                    Treetmi acts as a payment gateway technology provider and is not responsible for the live stream content of Creators. Any tax obligations arising from income generated on the platform are the sole responsibility of individual Creators in accordance with Indonesian tax laws.
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
