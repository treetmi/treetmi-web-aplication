"use client"

import React from "react"
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  FileSpreadsheet,
  Zap,
  Plus,
  UserCircle,
  Sliders,
  Smile,
  Coins,
  MessageSquare,
  CreditCard,
  Award,
  Handshake,
  Ban,
  Gift,
  Crown,
  ShieldCheck
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatNumberInput, parseNumberInput } from "@/lib/utils"

interface SidebarNavProps {
  activeTab: string
  handleTabChange: (tab: string) => void
  pendingWithdrawalsCount: number
  adminUser: string
  
  // Sandbox states and handlers
  isSimulateTxOpen: boolean
  setIsSimulateTxOpen: (open: boolean) => void
  txSender: string
  setTxSender: (sender: string) => void
  txCreator: string
  setTxCreator: (creator: string) => void
  txAmount: string
  setTxAmount: (amount: string) => void
  txType: string
  setTxType: (type: string) => void
  txMessage: string
  setTxMessage: (message: string) => void
  creators: any[]
  handleSimulateTxSubmit: (e: React.FormEvent) => void
  feeDonation?: number
  feeMabar?: number
}

export default function SidebarNav({ 
  activeTab, 
  handleTabChange, 
  pendingWithdrawalsCount, 
  adminUser,
  isSimulateTxOpen,
  setIsSimulateTxOpen,
  txSender,
  setTxSender,
  txCreator,
  setTxCreator,
  txAmount,
  setTxAmount,
  txType,
  setTxType,
  txMessage,
  setTxMessage,
  creators,
  handleSimulateTxSubmit,
  feeDonation = 5,
  feeMabar = 8
}: SidebarNavProps) {
  const [logoText, setLogoText] = React.useState("")
  const [logoUrl, setLogoUrl] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setLogoText(localStorage.getItem("treetmi_logo_text") || "treetmi")
      
      const cachedUrl = localStorage.getItem("treetmi_logo_url") || ""
      setLogoUrl(cachedUrl.startsWith("blob:") ? "" : cachedUrl)
      
      setIsLoading(false)
    }
  }, [])

  return (
    <aside className="w-80 border-r border-slate-200/80 dark:border-zinc-800/80 flex flex-col bg-[#FAF9F6] dark:bg-[#121211] shrink-0 min-h-screen lg:min-h-full h-full">
      {/* Brand logo header */}
      <div className="h-24 flex items-center px-8 border-b border-slate-200/80 dark:border-zinc-800/80">
        {isLoading && !logoText && !logoUrl ? (
          <div className="h-12 w-32 bg-slate-200/40 dark:bg-zinc-800/40 animate-pulse rounded-lg" />
        ) : logoUrl ? (
          <img 
            src={logoUrl} 
            alt={logoText} 
            className="h-18 max-w-[240px] object-contain rounded-lg transition-all"
          />
        ) : (
          <span className="font-black text-2xl italic tracking-tighter text-black dark:text-[#FFD551]">
            {logoText || "treetmi"}.id
          </span>
        )}
        <Badge className="ml-2 bg-black text-[#FFD551] dark:bg-[#FFD551]/10 dark:text-[#FFD551] border-none text-[8px] font-black rounded-lg uppercase py-0.5 px-1.5">
          Owner
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* User profile capsule */}
        <div className="flex items-center gap-3 p-4 bg-[#F1EFEB] dark:bg-zinc-900/60 rounded-[2rem] border border-slate-200/40 dark:border-zinc-800/40">
          <div className="h-10 w-10 bg-black rounded-full flex items-center justify-center font-black italic text-[#FFD551] text-sm shrink-0">
            {adminUser ? adminUser.substring(0, 2).toUpperCase() : "AD"}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-black italic text-slate-800 dark:text-[#EAE9E4] truncate">
              {adminUser}
            </span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 italic">
              Super Administrator
            </span>
          </div>
        </div>

        {/* Sidebar Nav link collection */}
        <nav className="space-y-5">
          {/* Category 1: Dashboard & Finansial */}
          <div className="space-y-1.5">
            <div className="px-4 py-0.5 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 italic select-none">
              Dashboard & Finansial
            </div>
            <div className="space-y-1">
              <button 
                onClick={() => handleTabChange("overview")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-black italic transition-all border ${
                  activeTab === "overview" 
                    ? "bg-[#FFD551] text-black border-[#FFD551] shadow-sm font-black" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-black border-transparent dark:text-zinc-400 dark:hover:bg-zinc-900"
                }`}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                Sistem Ringkasan
              </button>

              <button 
                onClick={() => handleTabChange("transactions")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-black italic transition-all border ${
                  activeTab === "transactions" 
                    ? "bg-[#FFD551] text-black border-[#FFD551] shadow-sm font-black" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-black border-transparent dark:text-zinc-400 dark:hover:bg-zinc-900"
                }`}
              >
                <FileSpreadsheet className="h-4 w-4 shrink-0" />
                Arus Transaksi Global
              </button>

              <button 
                onClick={() => handleTabChange("withdrawals")}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-black italic transition-all border ${
                  activeTab === "withdrawals" 
                    ? "bg-[#FFD551] text-black border-[#FFD551] shadow-sm font-black" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-black border-transparent dark:text-zinc-400 dark:hover:bg-zinc-900"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Wallet className="h-4 w-4 shrink-0" />
                  Approval Tarik Dana
                </span>
                {pendingWithdrawalsCount > 0 && (
                  <Badge className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse border-none">
                    {pendingWithdrawalsCount}
                  </Badge>
                )}
              </button>
            </div>
          </div>

          {/* Category 2: Manajemen Kreator */}
          <div className="space-y-1.5">
            <div className="px-4 py-0.5 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 italic select-none">
              Manajemen Kreator
            </div>
            <div className="space-y-1">
              <button 
                onClick={() => handleTabChange("creators")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-black italic transition-all border ${
                  activeTab === "creators" 
                    ? "bg-[#FFD551] text-black border-[#FFD551] shadow-sm font-black" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-black border-transparent dark:text-zinc-400 dark:hover:bg-zinc-900"
                }`}
              >
                <Users className="h-4 w-4 shrink-0" />
                Direktori Kreator
              </button>

              <button 
                onClick={() => handleTabChange("top_creators")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-black italic transition-all border relative group overflow-hidden ${
                  activeTab === "top_creators" 
                    ? "bg-[#FFD551] text-black border-[#FFD551] shadow-sm font-black" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-black border-transparent dark:text-zinc-400 dark:hover:bg-zinc-900"
                }`}
              >
                <Crown className={`h-4 w-4 shrink-0 transition-all duration-300 ${activeTab === "top_creators" ? "animate-bounce text-amber-600" : "text-amber-500 group-hover:scale-110"}`} />
                Top Kreator Teraktif
                {activeTab !== "top_creators" && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#FFD551] rounded-full animate-ping opacity-75"></span>
                )}
              </button>

              <button 
                onClick={() => handleTabChange("tickets")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-black italic transition-all border ${
                  activeTab === "tickets" 
                    ? "bg-[#FFD551] text-black border-[#FFD551] shadow-sm font-black" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-black border-transparent dark:text-zinc-400 dark:hover:bg-zinc-900"
                }`}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                Tiket Bantuan
              </button>

              <button 
                onClick={() => handleTabChange("reports")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-black italic transition-all border ${
                  activeTab === "reports" 
                    ? "bg-[#FFD551] text-black border-[#FFD551] shadow-sm font-black" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-black border-transparent dark:text-zinc-400 dark:hover:bg-zinc-900"
                }`}
              >
                <ShieldCheck className="h-4 w-4 shrink-0 text-red-500" />
                Laporan Kreator
              </button>
            </div>
          </div>

          {/* Category 3: Interaksi & Fitur */}
          <div className="space-y-1.5">
            <div className="px-4 py-0.5 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 italic select-none">
              Interaksi & Fitur
            </div>
            <div className="space-y-1">
              <button 
                onClick={() => handleTabChange("gifts")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-black italic transition-all border ${
                  activeTab === "gifts" 
                    ? "bg-[#FFD551] text-black border-[#FFD551] shadow-sm font-black" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-black border-transparent dark:text-zinc-400 dark:hover:bg-zinc-900"
                }`}
              >
                <Gift className="h-4 w-4 shrink-0" />
                Sistem Gift Animasi
              </button>

              <button 
                onClick={() => handleTabChange("badges")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-black italic transition-all border ${
                   activeTab === "badges" 
                    ? "bg-[#FFD551] text-black border-[#FFD551] shadow-sm font-black" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-black border-transparent dark:text-zinc-400 dark:hover:bg-zinc-900"
                }`}
              >
                <Award className="h-4 w-4 shrink-0" />
                Lencana Level
              </button>

              <button 
                onClick={() => handleTabChange("avatars")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-black italic transition-all border ${
                   activeTab === "avatars" 
                    ? "bg-[#FFD551] text-black border-[#FFD551] shadow-sm font-black" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-black border-transparent dark:text-zinc-400 dark:hover:bg-zinc-900"
                }`}
              >
                <Smile className="h-4 w-4 shrink-0" />
                Manajemen Avatar
              </button>

              <button 
                onClick={() => handleTabChange("filter_words")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-black italic transition-all border ${
                  activeTab === "filter_words" 
                    ? "bg-[#FFD551] text-black border-[#FFD551] shadow-sm font-black" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-black border-transparent dark:text-zinc-400 dark:hover:bg-zinc-900"
                }`}
              >
                <Ban className="h-4 w-4 shrink-0" />
                Filter Kata Sensor
              </button>
            </div>
          </div>

          {/* Category 4: Sistem & Konfigurasi */}
          <div className="space-y-1.5">
            <div className="px-4 py-0.5 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 italic select-none">
              Sistem & Konfigurasi
            </div>
            <div className="space-y-1">
              <button 
                onClick={() => handleTabChange("payment_channels")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-black italic transition-all border ${
                  activeTab === "payment_channels" 
                    ? "bg-[#FFD551] text-black border-[#FFD551] shadow-sm font-black" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-black border-transparent dark:text-zinc-400 dark:hover:bg-zinc-900"
                }`}
              >
                <CreditCard className="h-4 w-4 shrink-0" />
                Metode Pembayaran
              </button>

              <button 
                onClick={() => handleTabChange("rates")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-black italic transition-all border ${
                  activeTab === "rates" 
                    ? "bg-[#FFD551] text-black border-[#FFD551] shadow-sm font-black" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-black border-transparent dark:text-zinc-400 dark:hover:bg-zinc-900"
                }`}
              >
                <Coins className="h-4 w-4 shrink-0" />
                Kurs Mata Uang
              </button>

              <button 
                onClick={() => handleTabChange("partners")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-black italic transition-all border ${
                  activeTab === "partners" 
                    ? "bg-[#FFD551] text-black border-[#FFD551] shadow-sm font-black" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-black border-transparent dark:text-zinc-400 dark:hover:bg-zinc-900"
                }`}
              >
                <Handshake className="h-4 w-4 shrink-0" />
                Manajemen Partner
              </button>

              <button 
                onClick={() => handleTabChange("settings")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-black italic transition-all border ${
                  activeTab === "settings" 
                    ? "bg-[#FFD551] text-black border-[#FFD551] shadow-sm font-black" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-black border-transparent dark:text-zinc-400 dark:hover:bg-zinc-900"
                }`}
              >
                <Sliders className="h-4 w-4 shrink-0" />
                Pengaturan Website
              </button>

              <button 
                onClick={() => handleTabChange("system_configs")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-black italic transition-all border ${
                  activeTab === "system_configs" 
                    ? "bg-[#FFD551] text-black border-[#FFD551] shadow-sm font-black" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-black border-transparent dark:text-zinc-400 dark:hover:bg-zinc-900"
                }`}
              >
                <Sliders className="h-4 w-4 shrink-0 text-amber-500 animate-pulse" />
                Konfigurasi Gateway & Biaya
              </button>

              <button 
                onClick={() => handleTabChange("whatsapp_logs")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-black italic transition-all border ${
                  activeTab === "whatsapp_logs" 
                    ? "bg-[#FFD551] text-black border-[#FFD551] shadow-sm font-black" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-black border-transparent dark:text-zinc-400 dark:hover:bg-zinc-900"
                }`}
              >
                <MessageSquare className="h-4 w-4 shrink-0 text-emerald-500" />
                Log Pengiriman WhatsApp
              </button>

              <button 
                onClick={() => handleTabChange("profile")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-black italic transition-all border ${
                  activeTab === "profile" 
                    ? "bg-[#FFD551] text-black border-[#FFD551] shadow-sm font-black" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-black border-transparent dark:text-zinc-400 dark:hover:bg-zinc-900"
                }`}
              >
                <UserCircle className="h-4 w-4 shrink-0" />
                Profil Admin
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Sandbox Control Block (Bento Rounding) */}
      <div className="p-6 border-t border-slate-200/80 dark:border-zinc-800/80">
        <div className="bg-[#F1EFEB] dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 p-5 rounded-3xl space-y-3">
          <div className="flex items-center gap-2 text-black dark:text-[#FFD551]">
            <Zap className="h-4 w-4 text-amber-500 animate-pulse" />
            <span className="text-[10px] font-black tracking-wider italic">Quick Sandbox</span>
          </div>
          <p className="text-[10px] text-slate-600 dark:text-zinc-450 leading-normal font-bold">Simulasikan penonton membayar donasi/jasa langsung ke kreator pilihan.</p>
          
          <Dialog open={isSimulateTxOpen} onOpenChange={setIsSimulateTxOpen}>
            <DialogTrigger 
              render={
                <Button size="sm" className="w-full text-xs font-black italic h-9 bg-[#FFD551] hover:bg-[#FFC83B] text-black border border-[#FFC83B] rounded-xl dark:border-transparent transition-all cursor-pointer">
                  <Plus className="mr-1 h-3.5 w-3.5" /> Transaksi Baru
                </Button>
              }
            />
            <DialogContent className="max-w-md bg-[#F8F7F3] rounded-[2rem] border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="font-black text-2xl italic tracking-tighter">Simulasi Transaksi Donasi / Jasa</DialogTitle>
                <DialogDescription className="text-xs font-bold italic text-slate-500 dark:text-zinc-400">
                  Bagi Hasil & Komisi Potongan Platform Terkalkulasi Instan
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSimulateTxSubmit} className="space-y-4 pt-2 text-[#1A1A19]">
                <div className="space-y-2">
                  <Label className="text-xs font-black italic text-slate-500">Nama Pengirim (Viewer)</Label>
                  <Input 
                    required 
                    placeholder="ViewerBudiman" 
                    value={txSender} 
                    onChange={(e) => setTxSender(e.target.value)}
                    className="h-11 border border-slate-200 rounded-xl bg-white text-black font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black italic text-slate-500">Kreator Penerima</Label>
                  <select 
                    value={txCreator}
                    onChange={(e) => setTxCreator(e.target.value)}
                    className="w-full h-11 border border-slate-200 rounded-xl px-3 text-sm bg-white text-black font-bold outline-none"
                    required
                  >
                    <option value="">-- Pilih Kreator --</option>
                    {creators.map(c => (
                      <option key={c.id} value={c.username}>@{c.username} ({c.role})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black italic text-slate-500">Tipe Transaksi</Label>
                  <select 
                    value={txType}
                    onChange={(e) => setTxType(e.target.value)}
                    className="w-full h-11 border border-slate-200 rounded-xl px-3 text-sm bg-white text-black font-bold outline-none"
                  >
                    <option value="MABAR">Order Jasa Mabar (Fee Potongan {feeMabar}%)</option>
                    <option value="DONATION">Donasi Murni Instan (Fee Potongan {feeDonation}%)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black italic text-slate-500">Nominal Transaksi (Rp)</Label>
                  <Input 
                    type="text" 
                    required 
                    placeholder="100.000" 
                    value={formatNumberInput(txAmount)} 
                    onChange={(e) => setTxAmount(String(parseNumberInput(e.target.value)))}
                    className="h-11 border border-slate-200 rounded-xl bg-white text-black font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black italic text-slate-500">Pesan Dukungan (Opsional)</Label>
                  <Input 
                    placeholder="Simulasi pesan dukungan dari viewer..." 
                    value={txMessage} 
                    onChange={(e) => setTxMessage(e.target.value)}
                    className="h-11 border border-slate-200 rounded-xl bg-white text-black font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                  />
                </div>
                <DialogFooter className="pt-2">
                  <Button type="submit" className="w-full h-12 bg-black text-[#FFD551] rounded-2xl font-black italic transition-all shadow-md cursor-pointer">
                    Kirim Transaksi Simulasi
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </aside>
  )
}
