"use client"

import React from "react"
import { motion } from "framer-motion"
import { 
  ShieldAlert, 
  Scale, 
  Coins, 
  Gamepad2, 
  FolderGit, 
  Tv, 
  CheckCircle,
  HelpCircle,
  FileText,
  AlertCircle
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TermsAndConditionsPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  }

  const features = [
    {
      title: "1. Fitur Challenge Gacha",
      icon: Tv,
      badge: "Gacha Challenge",
      color: "from-amber-500 to-yellow-500",
      bgLight: "bg-amber-500/5",
      borderCol: "border-amber-500/20",
      accent: "text-amber-500",
      rules: [
        "Murni ditujukan sebagai media interaksi hiburan kreatif antara penonton dan streamer.",
        "Dilarang keras menyalahgunakan sistem sebagai ajang perjudian, taruhan uang, atau undian komersial yang menjanjikan keuntungan finansial spekulatif.",
        "Streamer bertanggung jawab penuh atas penyediaan, kelayakan, dan penyelesaian hadiah fisik/digital kreatif yang dijanjikan."
      ]
    },
    {
      title: "2. Jasa Main Bareng (Mabar)",
      icon: Gamepad2,
      badge: "Mabar Services",
      color: "from-emerald-500 to-green-500",
      bgLight: "bg-emerald-500/5",
      borderCol: "border-emerald-500/20",
      accent: "text-emerald-500",
      rules: [
        "Semua transaksi mabar wajib diselesaikan secara sportif, profesional, dan menyenangkan.",
        "Dilarang menawarkan jasa joki/boosting akun ilegal yang melanggar aturan pengembang game (Terms of Service game).",
        "Streamer wajib menjadwalkan dan memenuhi durasi/jumlah game mabar yang telah dibeli oleh donatur dengan jujur."
      ]
    },
    {
      title: "3. Donasi & Dukungan Overlay",
      icon: Coins,
      badge: "Donation Alerts",
      color: "from-indigo-500 to-purple-500",
      bgLight: "bg-indigo-500/5",
      borderCol: "border-indigo-500/20",
      accent: "text-indigo-500",
      rules: [
        "Dukungan finansial adalah kontribusi sukarela dari penonton untuk mendukung keberlangsungan konten kreator.",
        "Dilarang melakukan pencucian uang (money laundering) atau mendonasikan dana dari sumber ilegal.",
        "Pesan suara (TTS) dan media overlay dilarang mengandung unsur SARA, pornografi, ancaman kekerasan, atau ujaran kebencian."
      ]
    },
    {
      title: "4. Proyek & Karya Digital",
      icon: FolderGit,
      badge: "Digital Products",
      color: "from-rose-500 to-pink-500",
      bgLight: "bg-rose-500/5",
      borderCol: "border-rose-500/20",
      accent: "text-rose-500",
      rules: [
        "Karya/file digital yang dijual harus merupakan hak cipta murni milik kreator atau memiliki lisensi distribusi resmi.",
        "Dilarang mendistribusikan file berbahaya (malware/virus) atau materi bajakan milik pihak lain tanpa izin.",
        "Kreator wajib memberikan jaminan file dapat diunduh dan berfungsi sesuai dengan deskripsi produk yang dicantumkan."
      ]
    }
  ]

  return (
    <div className="space-y-8 select-none">
      
      {/* Top Welcome Title Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 md:p-8 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white rounded-3xl border-2 border-zinc-850 dark:border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.25)] relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-black tracking-widest text-[#FFD551] uppercase italic">
            <ShieldAlert className="h-5 w-5 animate-pulse" /> Ketentuan Penggunaan Platform
          </div>
          <h1 className="text-xl md:text-3xl font-black italic tracking-tight leading-none uppercase">
            SYARAT & KETENTUAN LAYANAN
          </h1>
          <p className="text-xs md:text-sm font-bold text-zinc-400 italic max-w-3xl leading-relaxed">
            Halaman panduan resmi mengenai kepatuhan hukum, transparansi fitur, dan etika penggunaan seluruh fasilitas interaktif treatme.id bagi kreator dan pendukung.
          </p>
        </div>
      </motion.div>

      {/* Main Grid Collection */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {features.map((feature, idx) => {
          const Icon = feature.icon
          return (
            <motion.div key={idx} variants={itemVariants}>
              <Card className="h-full border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                <CardHeader className={`py-5 px-6 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900 flex flex-row items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${feature.color} text-white shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="font-black italic text-sm md:text-base tracking-wide text-black dark:text-white">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="font-bold text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">
                        Aturan & Tata Tertib Kepatuhan
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-zinc-900 dark:bg-zinc-800 text-[#FFD551] border-none font-black italic text-[9px] rounded-lg px-2 py-0.5 shadow-sm">
                    {feature.badge}
                  </Badge>
                </CardHeader>
                <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3.5">
                    {feature.rules.map((rule, rIdx) => (
                      <div key={rIdx} className="flex gap-2.5 items-start">
                        <CheckCircle className={`h-4.5 w-4.5 ${feature.accent} shrink-0 mt-0.5`} />
                        <span className="text-xs font-bold text-slate-650 dark:text-zinc-300 leading-relaxed italic">
                          {rule}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Global General Compliance Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 bg-amber-500/5 dark:bg-amber-500/10 border-2 border-amber-500/20 rounded-3xl space-y-3 text-left relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-2 h-full bg-amber-500" />
        <div className="flex items-center gap-2 text-xs md:text-sm font-black uppercase tracking-wider text-amber-600 dark:text-amber-450 italic">
          <Scale className="h-5 w-5 animate-bounce shrink-0" />
          <span>⚖️ KOMITMEN KEPATUHAN & ETIKA PLATFORM (GENERAL COMPLIANCE)</span>
        </div>
        <div className="space-y-2 text-xs font-bold text-slate-700 dark:text-zinc-300 leading-relaxed italic">
          <p>
            Platform <span className="font-black text-black dark:text-white">treatme.id</span> berkomitmen penuh dalam menyediakan ekosistem interaktif live streaming yang aman, transparan, sehat, dan legal di bawah yurisdiksi Republik Indonesia. Kami secara tegas melarang seluruh tindakan pencucian uang, penyediaan reward ilegal yang melanggar hukum, serta segala bentuk aktivitas judi terselubung dengan dalih apapun.
          </p>
          <p>
            Kreator yang melanggar Syarat & Ketentuan di atas akan dikenakan sanksi penangguhan akun secara permanen, pembekuan dompet digital payout (payout lock), serta pelaporan ke otoritas yang berwajib jika terbukti melakukan pelanggaran hukum pidana yang merugikan masyarakat luas. Mari bersama kita bangun ekosistem konten kreator Indonesia yang jujur, suportif, dan inspiratif!
          </p>
        </div>
      </motion.div>

    </div>
  )
}
