"use client"

import React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useSession, signIn, signOut } from "next-auth/react"
import { useLanguage } from "@/components/language-provider"
import { useCurrency, CURRENCY_MAP, CurrencyCode } from "@/components/currency-provider"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Moon, Sun, Languages, LayoutDashboard, UserCircle, LogOut, Video, Settings, Coins, Compass, Trophy } from "lucide-react"
import { ADMIN_API, PUBLIC_API } from "@/lib/api"

export function Navbar() {
  const { setTheme } = useTheme()
  const { lang, setLang, t } = useLanguage()
  const { currency, setCurrency } = useCurrency()
  const { data: session } = useSession()
  const [logoText, setLogoText] = React.useState("")
  const [logoUrl, setLogoUrl] = React.useState("")
  const [iconUrl, setIconUrl] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(true)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. Instantly load from cache to avoid ANY delay or flash
      const cachedText = localStorage.getItem("treetmi_logo_text")
      const cachedUrl = localStorage.getItem("treetmi_logo_url")
      const cachedIcon = localStorage.getItem("treetmi_icon_url")
      
      if (cachedText) setLogoText(cachedText)
      if (cachedUrl && !cachedUrl.startsWith("blob:")) setLogoUrl(cachedUrl)
      if (cachedIcon && !cachedIcon.startsWith("blob:")) setIconUrl(cachedIcon)

      // Dynamic favicon helper that cleans up any existing icons to prevent cache/duplicate conflicts
      const updateFavicon = (url: string) => {
        if (!url) return
        try {
          // Remove ALL pre-existing icon links (rel="icon", rel="shortcut icon", rel="apple-touch-icon", etc.)
          const existingIcons = document.querySelectorAll("link[rel*='icon']")
          existingIcons.forEach(el => el.remove())
          
          // Create main icon element
          const link = document.createElement("link")
          link.rel = "icon"
          link.type = url.startsWith("data:") ? "image/webp" : "image/x-icon"
          link.href = url
          document.getElementsByTagName("head")[0].appendChild(link)

          // Create shortcut icon element (caching-browser proof)
          const shortcut = document.createElement("link")
          shortcut.rel = "shortcut icon"
          shortcut.type = url.startsWith("data:") ? "image/webp" : "image/x-icon"
          shortcut.href = url
          document.getElementsByTagName("head")[0].appendChild(shortcut)
        } catch (e) {
          console.warn("Gagal memperbarui favicon:", e)
        }
      }

      if (cachedIcon && !cachedIcon.startsWith("blob:")) {
        updateFavicon(cachedIcon)
      }

      // 2. Fetch fresh settings from the Backend API or local JSON mirror
      const loadSettings = async () => {
        try {
          // Fetch settings from server database
          const res = await fetch(PUBLIC_API.publicSettings)
          const json = await res.json()
          
          if (json.success && json.data) {
            const data = json.data
            const cleanText = data.logoText || "treetmi"
            const cleanLogo = data.logoUrl && !data.logoUrl.startsWith("blob:") ? data.logoUrl : ""
            const cleanIcon = data.iconUrl && !data.iconUrl.startsWith("blob:") ? data.iconUrl : ""

            setLogoText(cleanText)
            setLogoUrl(cleanLogo)
            setIconUrl(cleanIcon)
            
            // Sync with local cache
            localStorage.setItem("treetmi_logo_text", cleanText)
            localStorage.setItem("treetmi_logo_url", cleanLogo)
            localStorage.setItem("treetmi_icon_url", cleanIcon)
            
            if (cleanIcon) {
              updateFavicon(cleanIcon)
            }
          }
        } catch (err) {
          console.warn("Backend offline. Menggunakan penyimpanan lokal:", err)
          // Complete fallback to treetmi text only if offline and cache is empty
          if (!cachedText) {
            setLogoText("treetmi")
          }
        } finally {
          setIsLoading(false)
        }
      }

      loadSettings()
    }
  }, [])

  return (
    <nav className="sticky top-0 z-50 w-full border-b-[3px] border-[#FFD551] bg-background shadow-sm">
      <div className="container flex h-16 md:h-20 items-center justify-between mx-auto px-3 md:px-4">
        <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
          <Link href="/" className="flex items-center space-x-1">
            {isLoading && !logoText && !logoUrl ? (
              <div className="h-8 w-24 md:h-10 md:w-32 bg-slate-200/60 dark:bg-zinc-800/60 animate-pulse rounded-lg" />
            ) : logoUrl ? (
              <img 
                src={logoUrl} 
                alt={logoText} 
                className="h-10 md:h-14 max-w-[140px] md:max-w-[360px] object-contain rounded-lg transition-all duration-300"
              />
            ) : (
              <>
                <span className="text-lg md:text-2xl font-black italic uppercase tracking-tighter bg-[#FFD551] text-black px-1.5 py-0.5 md:px-2 animate-in fade-in duration-300">
                  {logoText || "treetmi"}
                </span>
                <span className="text-lg md:text-2xl font-black italic uppercase tracking-tighter ml-0.5 text-black dark:text-white">
                  .id
                </span>
              </>
            )}
          </Link>
        </div>

        <div className="flex items-center gap-1 md:gap-4 flex-shrink-0">
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-4 mr-3">
            <Link 
              href="/creators" 
              className="text-xs font-black uppercase italic text-slate-600 dark:text-zinc-400 hover:text-[#FFD551] dark:hover:text-[#FFD551] transition-colors flex items-center gap-1.5"
            >
              <Compass className="h-[1.15rem] w-[1.15rem]" />
              <span>{lang === "id" ? "Jelajahi" : "Explore"}</span>
            </Link>
            <Link 
              href="/leaderboard" 
              className="text-xs font-black uppercase italic text-slate-600 dark:text-zinc-400 hover:text-[#FFD551] dark:hover:text-[#FFD551] transition-colors flex items-center gap-1.5"
            >
              <Trophy className="h-[1.15rem] w-[1.15rem]" />
              <span>{lang === "id" ? "Top Creator" : "Top Creators"}</span>
            </Link>
          </div>

          {mounted ? (
            <>
              {/* Dashboard Link removed to avoid duplication with dropdown */}

              {/* Superadmin Link — desktop only */}
              {session && (session.user?.name?.toLowerCase().includes("admin") || session.user?.email?.toLowerCase().includes("admin")) && (
                <Link 
                  href="/superadmin"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden md:flex gap-2 font-bold uppercase italic bg-[#FFD551]/20 hover:bg-[#FFD551] hover:text-black dark:bg-[#FFD551]/10 dark:hover:bg-[#FFD551] dark:hover:text-black border border-black/10 transition-all")}
                >
                  <span>👑</span> Superadmin
                </Link>
              )}

              {/* Language Toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center justify-center h-8 w-8 md:h-9 md:w-9 rounded-none hover:bg-accent hover:text-accent-foreground transition-colors outline-none border-2 border-transparent hover:border-primary cursor-pointer">
                  <Languages className="h-[1.35rem] w-[1.35rem] md:h-6 md:w-6" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-none border-2 border-border">
                  <DropdownMenuItem onClick={() => setLang("id")} className="font-bold uppercase italic">
                    ID {lang === "id" && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLang("en")} className="font-bold uppercase italic">
                    EN {lang === "en" && "✓"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Currency Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center justify-center gap-0.5 h-8 md:h-9 px-1.5 md:px-2 hover:bg-accent hover:text-accent-foreground transition-colors outline-none border-2 border-transparent hover:border-primary cursor-pointer">
                  <Coins className="h-[1.35rem] w-[1.35rem] md:h-6 md:w-6 text-[#FFD551]" />
                  <span className="text-[10px] md:text-xs font-black uppercase italic">{currency}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-none border-2 border-border">
                  {(Object.keys(CURRENCY_MAP) as CurrencyCode[]).map((code) => {
                    const cfg = CURRENCY_MAP[code]
                    return (
                      <DropdownMenuItem 
                        key={code} 
                        onClick={() => setCurrency(code)} 
                        className="font-bold uppercase italic cursor-pointer flex items-center gap-2"
                      >
                        <span className="text-sm">{cfg.flag}</span>
                        <span>{cfg.code} ({cfg.symbol})</span>
                        {currency === code && <span className="ml-auto">✓</span>}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme Toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center justify-center h-8 w-8 md:h-9 md:w-9 rounded-none hover:bg-accent hover:text-accent-foreground transition-colors outline-none border-2 border-transparent hover:border-primary relative cursor-pointer">
                  <Sun className="h-[1.35rem] w-[1.35rem] md:h-6 md:w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.35rem] w-[1.35rem] md:h-6 md:w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-none border-2 border-border">
                  <DropdownMenuItem onClick={() => setTheme("light")} className="font-bold uppercase italic">
                    {t.common.light}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")} className="font-bold uppercase italic">
                    {t.common.dark}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")} className="font-bold uppercase italic">
                    {t.common.system}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Login/User Button */}
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center justify-center h-8 w-8 md:h-9 md:w-9 rounded-xl md:rounded-2xl border-2 border-border bg-[#FFD551] text-black hover:bg-[#FFC83B] hover:border-primary transition-colors outline-none cursor-pointer overflow-hidden">
                    {session.user?.image ? (
                      <img src={session.user.image} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-black italic text-sm uppercase">{(session.user?.name || session.user?.email || "U")[0]}</span>
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-none border-2 border-border min-w-[170px]">
                    <Link href="/dashboard?tab=overview" passHref>
                      <DropdownMenuItem className="font-bold italic cursor-pointer flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4 text-slate-500" />
                        {lang === "id" ? "Dashboard" : "Dashboard"}
                      </DropdownMenuItem>
                    </Link>
                    
                    <Link href="/dashboard?tab=profile" passHref>
                      <DropdownMenuItem className="font-bold italic cursor-pointer flex items-center gap-2">
                        <Settings className="h-4 w-4 text-[#FFD551]" />
                        {lang === "id" ? "Pengaturan Profil" : "Profile Settings"}
                      </DropdownMenuItem>
                    </Link>

                    {session && (session.user?.name?.toLowerCase().includes("admin") || session.user?.email?.toLowerCase().includes("admin")) && (
                      <>
                        <div className="h-[1px] bg-slate-100 my-1 dark:bg-zinc-800" />
                        <Link href="/superadmin" passHref>
                          <DropdownMenuItem className="font-bold italic cursor-pointer flex items-center gap-2 bg-[#FFD551]/10 text-black dark:text-[#FFD551] hover:bg-[#FFD551] hover:text-black">
                            <span>👑</span> Superadmin
                          </DropdownMenuItem>
                        </Link>
                      </>
                    )}
                    
                    <div className="h-[1px] bg-slate-100 my-1 dark:bg-zinc-800" />
                    
                    <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })} className="font-bold italic cursor-pointer flex items-center gap-2 text-red-500 hover:text-red-650">
                      <LogOut className="h-4 w-4 text-red-500" />
                      {t.common.logout}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link 
                  href="/login"
                  className={cn(buttonVariants(), "bg-primary text-primary-foreground font-black uppercase italic rounded-none border-b-4 border-black/20 gap-1.5 h-8 md:h-9 px-3 md:px-4 text-xs md:text-sm")}
                >
                  <UserCircle className="h-[1.35rem] w-[1.35rem] md:h-6 md:w-6" />
                  <span className="hidden sm:inline">{t.common.login}</span>
                  <span className="sm:hidden">{t.common.login}</span>
                </Link>
              )}
            </>
          ) : (
            // Skeleton placeholder
            <div className="flex items-center gap-1.5 md:gap-3">
              <div className="h-8 w-8 bg-slate-200/60 dark:bg-zinc-800/60 animate-pulse rounded-none" />
              <div className="h-8 w-8 bg-slate-200/60 dark:bg-zinc-800/60 animate-pulse rounded-none" />
              <div className="h-8 w-8 bg-slate-200/60 dark:bg-zinc-800/60 animate-pulse rounded-none" />
              <div className="h-8 w-20 bg-slate-200/60 dark:bg-zinc-800/60 animate-pulse rounded-none" />
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
