"use client"
import React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import { useLanguage } from "@/components/language-provider"
import { 
  LayoutDashboard, 
  Wallet, 
  Gamepad2, 
  FolderGit, 
  Users, 
  Tv, 
  Settings, 
  ShieldAlert,
  Sun,
  Moon,
  LogOut,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Landmark,
  Ticket
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DashboardProvider, useDashboard } from "./context/DashboardContext"

function SidebarContent() {
  const pathname = usePathname()
  const { profile, isLive, handleToggleLive, role, setRole, handleUpdateRole } = useDashboard()
  const { data: session } = useSession()

  return (
    <div className="flex flex-col h-full bg-[#FAF9F6] dark:bg-[#121211] border-r border-slate-200/80 dark:border-zinc-800/80 w-72 shrink-0">
      {/* Brand logo header */}
      <div className="h-20 flex items-center px-6 border-b border-slate-200/80 dark:border-zinc-800/80">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-black text-xl italic tracking-tighter text-black dark:text-[#FFD551]">
            treatme.id
          </span>
          <Badge className="bg-black text-[#FFD551] dark:bg-[#FFD551]/10 dark:text-[#FFD551] border-none text-[8px] font-black rounded-lg uppercase py-0.5 px-1.5">
            Creator
          </Badge>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* User profile capsule */}
        <div className="flex items-center gap-3 p-3 bg-[#F1EFEB] dark:bg-zinc-900/60 rounded-2xl border border-slate-200/40 dark:border-zinc-800/40">
          <div className="h-9 w-9 bg-[#FFD551] rounded-xl flex items-center justify-center font-black italic text-black text-xs shrink-0 overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              (profile?.username || session?.user?.name || "C")[0].toUpperCase()
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-black italic text-slate-800 dark:text-[#EAE9E4] truncate">
                @{profile?.username || session?.user?.name || "creator"}
              </span>
              {profile?.is_verified && (
                <img src="/verified.svg" alt="Verified" className="h-3 w-3 flex-shrink-0" />
              )}
            </div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 italic truncate">
              {role === "GAMER" ? "Verified Streamer" : role}
            </span>
          </div>
        </div>

        {/* Sidebar Nav link collection grouped by sections */}
        <nav className="space-y-5">
          {/* UTAMA & KEUANGAN */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-black tracking-widest text-slate-400 dark:text-zinc-500 uppercase px-4 italic">
              Utama & Keuangan
            </h4>
            <div className="space-y-1">
              {[
                { href: "/dashboard", label: "Ringkasan & Dompet", icon: Wallet },
                { href: "/dashboard/payout", label: "Rekening Payout", icon: Landmark }
              ].map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-black italic transition-all border ${
                      isActive 
                        ? "bg-[#FFD551] text-black border-[#FFD551] shadow-sm" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-black border-transparent dark:text-zinc-400 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* LAYANAN KREATOR */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-black tracking-widest text-slate-400 dark:text-zinc-500 uppercase px-4 italic">
              Layanan Kreator
            </h4>
            <div className="space-y-1">
              {[
                { href: "/dashboard/services", label: "Jasa Mabar", icon: Gamepad2 },
                { href: "/dashboard/projects", label: "Proyek Digital", icon: FolderGit },
                { href: "/dashboard/queue", label: "Antrean Mabar", icon: Users }
              ].map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-black italic transition-all border ${
                      isActive 
                        ? "bg-[#FFD551] text-black border-[#FFD551] shadow-sm" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-black border-transparent dark:text-zinc-400 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* INTEGRASI STREAMING */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-black tracking-widest text-slate-400 dark:text-zinc-500 uppercase px-4 italic">
              Integrasi Streaming
            </h4>
            <div className="space-y-1">
              {[
                { href: "/dashboard/widgets", label: "Integrasi OBS", icon: Tv },
                { href: "/dashboard/filter-words", label: "Sensor Kata Kustom", icon: ShieldAlert }
              ].map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-black italic transition-all border ${
                      isActive 
                        ? "bg-[#FFD551] text-black border-[#FFD551] shadow-sm" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-black border-transparent dark:text-zinc-400 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* BANTUAN & PENGATURAN */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-black tracking-widest text-slate-400 dark:text-zinc-500 uppercase px-4 italic">
              Bantuan & Pengaturan
            </h4>
            <div className="space-y-1">
              {[
                { href: "/dashboard/profile", label: "Pengaturan Profil", icon: Settings },
                { href: "/dashboard/terms", label: "Syarat & Ketentuan", icon: ShieldAlert },
                { href: "/dashboard/support", label: "Tiket Bantuan", icon: Ticket }
              ].map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-black italic transition-all border ${
                      isActive 
                        ? "bg-[#FFD551] text-black border-[#FFD551] shadow-sm" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-black border-transparent dark:text-zinc-400 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </nav>
      </div>

      {/* Sidebar Footer Live Status Switch */}
      <div className="p-4 border-t border-slate-200/80 dark:border-zinc-800/80">
        <div className="flex items-center justify-between p-3 bg-[#F1EFEB] dark:bg-zinc-900/60 rounded-xl border border-slate-200/40 dark:border-zinc-800/40">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500">
              Status Siaran
            </span>
            <span className={`text-[11px] font-black italic ${isLive ? 'text-red-500' : 'text-slate-400 dark:text-zinc-500'}`}>
              {isLive ? "LIVE STREAMING" : "OFFLINE"}
            </span>
          </div>
          <Switch checked={isLive} onCheckedChange={handleToggleLive} className="scale-90" />
        </div>
      </div>
    </div>
  )
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useDashboard()
  const { data: session, status } = useSession()
  const { theme, setTheme } = useTheme()
  const { lang } = useLanguage()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0b0b0a] flex flex-col items-center justify-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-slate-200 dark:border-zinc-800 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-[#FFD551] rounded-full animate-spin" />
        </div>
        <p className="text-xs font-black italic tracking-wider text-slate-400 dark:text-zinc-500">MEMUAT DASHBOARD...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0b0b0a] flex text-black dark:text-[#EAE9E4]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <SidebarContent />
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-72 h-full flex flex-col animate-slide-in">
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-full flex items-center justify-center shadow-md z-50 text-slate-800 dark:text-zinc-200"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Horizontal Top Header */}
        <header className="h-20 border-b border-slate-200/80 dark:border-zinc-800/80 px-4 md:px-8 flex items-center justify-between bg-[#FAF9F6] dark:bg-[#0b0b0a] sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden h-10 w-10 border border-slate-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors bg-white dark:bg-zinc-950"
            >
              <Menu className="h-4 w-4 text-slate-800 dark:text-zinc-200" />
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-zinc-500 italic">
              <span>Dasbor</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-slate-800 dark:text-[#EAE9E4]">Kreator</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Public Page Link */}
            {profile?.username && (
              <a
                href={`/${profile.username}`}
                target="_blank"
                rel="noreferrer"
                className="h-9 border border-slate-200 dark:border-zinc-800 rounded-2xl flex items-center gap-2 px-4 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all text-xs font-black italic bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-200"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Lihat Halaman</span>
              </a>
            )}

            {/* Dark Mode Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger className="h-9 w-9 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors flex items-center justify-center outline-none bg-white dark:bg-zinc-950 cursor-pointer shadow-sm relative">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl border border-slate-200 bg-white dark:bg-[#121211] dark:border-zinc-800 p-1.5 z-50">
                <DropdownMenuItem onClick={() => setTheme("light")} className="font-bold italic cursor-pointer rounded-lg">
                  {lang === "en" ? "Light" : "Terang"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="font-bold italic cursor-pointer rounded-lg">
                  {lang === "en" ? "Dark" : "Gelap"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Signout Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-center h-9 w-9 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-[#FFD551] text-black hover:bg-[#FFC83B] transition-colors outline-none cursor-pointer shadow-sm overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-black italic text-sm uppercase">{(profile?.username || session?.user?.name || "U")[0]}</span>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl border border-slate-200 bg-white dark:bg-[#121211] dark:border-zinc-800 p-1.5 z-50">
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })} className="font-bold italic text-red-500 cursor-pointer rounded-lg">
                  <LogOut className="h-4 w-4 mr-2" />
                  {lang === "en" ? "Sign Out" : "Keluar Hub"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProvider>
  )
}
