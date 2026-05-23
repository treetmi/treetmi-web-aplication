"use client"
import React from "react"
import { useDashboard } from "../context/DashboardContext"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Landmark, Download, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function PayoutPage() {
  const { data: session } = useSession()
  const {
    balance,
    bankName,
    setBankName,
    bankNumber,
    setBankNumber,
    bankHolder,
    setBankHolder,
    isBankLocked,
    handleSaveBankAccount,
    setIsWithdrawOpen
  } = useDashboard()

  if (!session) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm dark:bg-[#121211] dark:border-zinc-800/80">
        <div>
          <h2 className="text-sm md:text-base font-black italic tracking-widest flex items-center gap-2 text-black dark:text-[#FFD551]">
            <Landmark className="h-5 w-5" /> Pengaturan Payout Rekening
          </h2>
          <p className="text-[11px] md:text-xs font-bold text-slate-400 italic mt-1">
            Kelola akun bank atau e-wallet Anda untuk pencairan pendapatan secara otomatis dan aman.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT & CENTER PANEL */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. REKENING SETTINGS */}
          <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
            <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-black italic text-sm md:text-base tracking-wider text-black dark:text-[#FFD551] flex items-center gap-2">
                  Rekening Bank & E-Wallet Payout
                  {isBankLocked && (
                    <span className="text-red-500 font-black flex items-center gap-1 shrink-0 text-[10px] md:text-xs bg-red-500/10 px-2.5 py-0.5 rounded-lg border border-red-500/20">
                      TERKUNCI
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="font-bold italic text-[11px] md:text-xs text-slate-400 mt-1">
                  Konfigurasikan rekening bank atau e-wallet Anda untuk menerima penarikan dana (withdrawal) hasil donasi.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSaveBankAccount} className="space-y-4">
                {isBankLocked && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                    <p className="text-xs md:text-sm font-bold text-red-600 dark:text-red-400 italic leading-normal">
                      Rekening Anda telah dikunci untuk keamanan sistem. Untuk mengajukan perubahan rekening, silakan buka tiket bantuan ke tim Support di menu Tiket Bantuan.
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 1. Pilih Bank / E-Wallet */}
                  <div className="space-y-2">
                    <Label className="font-black italic text-xs md:text-sm text-slate-500 dark:text-zinc-400">Bank / E-Wallet</Label>
                    <select
                      value={bankName}
                      disabled={isBankLocked}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-[#FAF9F6] text-black text-xs md:text-sm dark:bg-[#1E1E1D] dark:text-white px-3 focus:outline-none focus:ring-1 focus:ring-[#FFD551] disabled:opacity-60 disabled:cursor-not-allowed font-bold"
                    >
                      <option value="BCA">BCA (Bank Central Asia)</option>
                      <option value="Mandiri">Bank Mandiri</option>
                      <option value="BNI">BNI (Bank Negara Indonesia)</option>
                      <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                      <option value="GoPay">GoPay (E-Wallet)</option>
                      <option value="OVO">OVO (E-Wallet)</option>
                      <option value="Dana">Dana (E-Wallet)</option>
                      <option value="LinkAja">LinkAja (E-Wallet)</option>
                    </select>
                  </div>

                  {/* 2. Nomor Rekening / HP */}
                  <div className="space-y-2">
                    <Label className="font-black italic text-xs md:text-sm text-slate-500 dark:text-zinc-400">Nomor Rekening / HP</Label>
                    <Input 
                      type="text"
                      required
                      disabled={isBankLocked}
                      value={bankNumber}
                      onChange={(e) => setBankNumber(e.target.value)}
                      placeholder="Contoh: 123-456-789 atau 0812..."
                      className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-[#FAF9F6] text-black text-xs md:text-sm dark:bg-[#1E1E1D] dark:text-white px-3 disabled:opacity-60 disabled:cursor-not-allowed font-bold"
                    />
                  </div>

                  {/* 3. Nama Pemilik Akun */}
                  <div className="space-y-2">
                    <Label className="font-black italic text-xs md:text-sm text-slate-500 dark:text-zinc-400">Nama Pemilik Rekening</Label>
                    <Input 
                      type="text"
                      required
                      disabled={isBankLocked}
                      value={bankHolder}
                      onChange={(e) => setBankHolder(e.target.value)}
                      placeholder="Nama sesuai buku tabungan / e-wallet"
                      className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl bg-[#FAF9F6] text-black text-xs md:text-sm dark:bg-[#1E1E1D] dark:text-white px-3 disabled:opacity-60 disabled:cursor-not-allowed font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  {!isBankLocked && (
                    <Button 
                      type="submit"
                      className="h-10 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black hover:bg-slate-900 dark:hover:bg-[#FFC83B] rounded-xl font-black italic text-xs md:text-sm uppercase tracking-wider px-6 shadow-sm transition-all"
                    >
                      Simpan Payout Rekening
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* 2. WALLET BALANCE CARD FOR EASY ACCESS */}
          <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121211] shadow-sm overflow-hidden">
            <CardHeader className="py-5 px-8 bg-[#FFD551] border-b border-slate-200/10 flex flex-row items-center justify-between text-black">
              <CardTitle className="font-black italic text-sm md:text-base tracking-wider flex items-center gap-2">
                Saldo Dompet Saat Ini
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-3xl font-black italic text-black dark:text-white">Rp {balance?.toLocaleString("id-ID") || 0}</p>
                <p className="text-xs md:text-sm font-bold text-slate-400 italic mt-1">
                  Klik tombol untuk langsung ajukan penarikan ke rekening Anda.
                </p>
              </div>
              <Button 
                onClick={() => setIsWithdrawOpen(true)}
                className="h-12 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black hover:bg-slate-900 rounded-2xl font-black italic text-xs md:text-sm px-8 shadow-sm transition-all shrink-0 active:scale-95"
              >
                Tarik Dana Sekarang
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT PANEL: INSTRUCTIONS */}
        <div className="space-y-6">
          <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121211] shadow-sm overflow-hidden">
            <CardHeader className="py-5 px-8 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900">
              <CardTitle className="font-black italic text-sm md:text-base tracking-wider text-black dark:text-[#FFD551] flex items-center gap-2">
                Panduan Payout
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3 text-xs md:text-sm font-bold italic text-slate-500 leading-normal">
                <p className="flex items-start gap-2">
                  <span className="text-[#FFD551]">&bull;</span> 
                  <span>Minimal penarikan dana adalah Rp 50.000,-</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-[#FFD551]">&bull;</span> 
                  <span>Proses transfer dana memakan waktu maksimal 1-2 hari kerja.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-[#FFD551]">&bull;</span> 
                  <span>Pastikan nama pemilik rekening sama dengan nama pada rekening bank / e-wallet Anda untuk menghindari hambatan verifikasi.</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
