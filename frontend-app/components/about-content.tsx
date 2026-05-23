"use client"

import React from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Users, ArrowLeft, Target, Heart, Zap } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useLanguage } from "@/components/language-provider"

interface AboutContentProps {
  companyName: string
}

export function AboutContent({ companyName }: AboutContentProps) {
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
          <div className="space-y-4 mb-10 pb-8 border-b border-slate-100 dark:border-zinc-800 text-center md:text-left">
            <div className="h-14 w-14 rounded-2xl bg-[#FFD551]/10 text-[#FFD551] flex items-center justify-center mx-auto md:mx-0">
              <Users className="size-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {isIndo ? "Tentang Kami" : "About Us"}
            </h1>
            <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">
              {isIndo 
                ? "Platform dukungan kreator terbesar dan teraman di Indonesia." 
                : "The largest and most secure creator support platform in Indonesia."}
            </p>
          </div>

          <div className="space-y-12">
            {/* Visi Misi */}
            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {isIndo ? "Visi & Misi" : "Vision & Mission"}
              </h2>
              <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-medium">
                {isIndo ? (
                  <>
                    Kami di <strong>{companyName}</strong> membangun Treetmi.id dengan satu tujuan sederhana: <strong>Memberdayakan Kreator Indonesia</strong>. 
                    <br /><br />
                    Kami percaya bahwa karya digital, baik itu <em>live streaming</em>, desain grafis, <em>coding</em>, maupun karya musik, layak mendapatkan apresiasi yang sepadan. Melalui Treetmi, kami menjembatani para kreator dengan komunitas pendukungnya (Donatur) secara aman, transparan, dan mudah.
                  </>
                ) : (
                  <>
                    We at <strong>{companyName}</strong> built Treetmi.id with one simple goal: <strong>Empowering Indonesian Creators</strong>. 
                    <br /><br />
                    We believe that digital creations, whether it is <em>live streaming</em>, graphic design, <em>coding</em>, or music, deserve proper appreciation. Through Treetmi, we bridge creators with their supporting community (Donators) in a secure, transparent, and easy way.
                  </>
                )}
              </p>
            </section>

            {/* Core Values */}
            <section className="space-y-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {isIndo ? "Nilai Inti Kami" : "Our Core Values"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-amber-50 dark:bg-zinc-950 border border-amber-100 dark:border-zinc-800 space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center">
                    <Heart className="size-5" />
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-zinc-200">
                    {isIndo ? "Apresiasi Karya" : "Creative Appreciation"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    {isIndo 
                      ? "Membangun ekosistem yang sehat di mana setiap dukungan adalah bentuk penghargaan murni atas kreativitas." 
                      : "Building a healthy ecosystem where every support is a pure token of appreciation for creativity."}
                  </p>
                </div>
                
                <div className="p-5 rounded-2xl bg-green-50 dark:bg-zinc-950 border border-green-100 dark:border-zinc-800 space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-500/20 text-green-500 flex items-center justify-center">
                    <Target className="size-5" />
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-zinc-200">
                    {isIndo ? "Aman & Terpercaya" : "Safe & Trusted"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    {isIndo 
                      ? "Melindungi kreator dan donatur dengan sistem Escrow mutakhir dan payment gateway berlisensi BI." 
                      : "Protecting creators and supporters with a state-of-the-art Escrow system and BI-licensed payment gateway."}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-blue-50 dark:bg-zinc-950 border border-blue-100 dark:border-zinc-800 space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-500 flex items-center justify-center">
                    <Zap className="size-5" />
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-zinc-200">
                    {isIndo ? "Cepat & Real-time" : "Fast & Real-time"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    {isIndo 
                      ? "Teknologi notifikasi overlay langsung (OBS widget) agar interaksi live streaming terasa hidup dan instan." 
                      : "Live notification overlay technology (OBS widget) to make live streaming interactions feel lively and instant."}
                  </p>
                </div>
              </div>
            </section>

            {/* Perusahaan */}
            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {isIndo ? "Legalitas Perusahaan" : "Company Legality"}
              </h2>
              <div className="p-6 bg-slate-50 dark:bg-zinc-950/50 rounded-2xl border border-slate-100 dark:border-zinc-800 text-sm font-medium text-slate-600 dark:text-zinc-400">
                <p><strong>{isIndo ? "Nama Entitas Hukum:" : "Legal Entity Name:"}</strong> {companyName}</p>
                <p className="mt-2 text-xs leading-relaxed">
                  {isIndo 
                    ? "Seluruh transaksi pembayaran yang terjadi di dalam Treetmi.id telah diawasi dan bekerjasama dengan Penyelenggara Jasa Pembayaran (PJP) resmi yang mematuhi standar Bank Indonesia (BI) dan Otoritas Jasa Keuangan (OJK)." 
                    : "All payment transactions occurring within Treetmi.id are supervised and conducted in cooperation with official Payment Service Providers (PJP) adhering to the standards of Bank Indonesia (BI) and the Financial Services Authority (OJK)."}
                </p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  )
}
