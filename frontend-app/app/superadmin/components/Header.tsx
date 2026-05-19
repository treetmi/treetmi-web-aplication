"use client"

import React from "react"
import { 
  ChevronRight, 
  Languages, 
  Sun, 
  Moon, 
  UserCircle, 
  LogOut,
  Menu
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  activeTab: string
  adminUser: string
  handleAdminLogout: () => void
  lang: any
  setLang: (lang: any) => void
  setTheme: (theme: string) => void
  onToggleSidebar?: () => void
}

export default function Header({ 
  activeTab, 
  adminUser, 
  handleAdminLogout, 
  lang, 
  setLang, 
  setTheme,
  onToggleSidebar
}: HeaderProps) {
  return (
    <header className="h-16 bg-white dark:bg-[#121211] border-b border-slate-200/80 dark:border-zinc-800/80 px-4 md:px-8 flex items-center justify-between shrink-0">
      {/* Left: Mobile hamburger menu & Title/Breadcrumbs */}
      <div className="flex items-center gap-3 text-xs font-black italic text-slate-400">
        <button 
          onClick={onToggleSidebar}
          className="lg:hidden flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 dark:border-zinc-800 bg-[#FAF9F6] dark:bg-zinc-900 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors outline-none cursor-pointer shrink-0"
        >
          <Menu className="h-4 w-4" />
        </button>

        <span className="lg:hidden text-black dark:text-[#FFD551] font-black text-xs uppercase tracking-tight italic bg-[#FFD551]/10 px-2 py-0.5 rounded-lg border border-[#FFD551]/20">
          {activeTab === "overview" && "Ringkasan"}
          {activeTab === "creators" && "Kreator"}
          {activeTab === "withdrawals" && "Withdrawal"}
          {activeTab === "transactions" && "Transaksi"}
          {activeTab === "profile" && "Profil"}
          {activeTab === "settings" && "Settings"}
        </span>

        <div className="hidden lg:flex items-center gap-2">
          <span>Portal</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-black dark:text-[#FFD551] bg-[#FAF9F6] dark:bg-zinc-900 px-3 py-1 rounded-2xl border border-slate-200/60 dark:border-zinc-800/60">Admin Panel</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-black dark:text-white capitalize">
            {activeTab === "overview" && "Ringkasan Finansial"}
            {activeTab === "creators" && "Direktori Kreator"}
            {activeTab === "withdrawals" && "Persetujuan Withdraw"}
            {activeTab === "transactions" && "Transaksi Log"}
            {activeTab === "profile" && "Profil Admin"}
            {activeTab === "settings" && "Pengaturan Website"}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        
        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 dark:border-zinc-800 bg-[#FAF9F6] dark:bg-zinc-900 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors outline-none cursor-pointer">
            <Languages className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl border border-slate-200 bg-white dark:bg-[#121211] dark:border-zinc-800 p-1.5">
            <DropdownMenuItem onClick={() => setLang("id")} className="font-bold uppercase italic cursor-pointer rounded-lg">
              ID {lang === "id" && "✓"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLang("en")} className="font-bold uppercase italic cursor-pointer rounded-lg">
              EN {lang === "en" && "✓"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 dark:border-zinc-800 bg-[#FAF9F6] dark:bg-zinc-900 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors outline-none relative cursor-pointer">
            <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl border border-slate-200 bg-white dark:bg-[#121211] dark:border-zinc-800 p-1.5">
            <DropdownMenuItem onClick={() => setTheme("light")} className="font-bold uppercase italic cursor-pointer rounded-lg">
              Terang
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")} className="font-bold uppercase italic cursor-pointer rounded-lg">
              Gelap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Admin profile user dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 h-9 px-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-[#FFD551] text-black hover:bg-[#FFC83B] transition-all outline-none text-xs font-black italic cursor-pointer shadow-sm">
            <UserCircle className="h-4 w-4" />
            {adminUser}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl border border-slate-200 bg-white dark:bg-[#121211] dark:border-zinc-800 p-1.5">
            <DropdownMenuItem onClick={handleAdminLogout} className="font-bold uppercase italic text-red-500 cursor-pointer rounded-lg">
              <LogOut className="h-4 w-4 mr-2" />
              Keluar Portal
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  )
}
