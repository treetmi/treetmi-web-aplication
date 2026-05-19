"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { ShieldCheck, ArrowLeft, KeyRound, User } from "lucide-react"

export default function PortalLogin() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (typeof window !== "undefined") {
      const active = localStorage.getItem("admin_session") === "true"
      if (active) {
        router.push("/superadmin")
      }
    }
  }, [router])

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate network delay
    setTimeout(() => {
      if (username.trim() === "admin" && password === "admin123") {
        localStorage.setItem("admin_session", "true")
        localStorage.setItem("admin_user", "Administrator")
        
        toast.success("Akses Superadmin Disetujui! Mengalihkan ke Control Panel...")
        
        // Trigger TTS Welcome
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance("Selamat datang, Administrator Utama Treetmi.")
          utterance.lang = "id-ID"
          window.speechSynthesis.speak(utterance)
        }

        router.push("/superadmin")
      } else {
        setIsLoading(false)
        toast.error("Username atau password salah! Akses ditolak.")
      }
    }, 800)
  }

  return (
    <main className="min-h-screen bg-[#F8F7F3] dark:bg-[#0B0B0A] flex flex-col items-center justify-center p-4">
      
      {/* Back button */}
      <Link href="/" className="mb-6 flex items-center gap-2 text-xs font-black italic text-slate-400 hover:text-black dark:text-zinc-500 dark:hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
      </Link>

      <Card className="w-full max-w-md border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#121211] rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
        
        <CardHeader className="bg-[#FFD551] text-black border-b border-slate-200/20 p-8 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="bg-white/90 p-2 rounded-2xl shadow-sm border border-slate-100">
              <ShieldCheck className="h-6 w-6 text-black" />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-widest italic text-black/60">Treetmi.id Secure Node</p>
              <CardTitle className="text-2xl font-black italic tracking-tighter mt-0.5">Superadmin Portal</CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-5">
          <CardDescription className="text-xs font-bold italic text-slate-400 mb-2 leading-relaxed">
            Autentikasi tingkat tinggi diperlukan untuk mengelola finansial dan direktori platform.
          </CardDescription>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-black">
            
            <div className="space-y-2">
              <Label className="text-xs font-black italic flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
                <User className="h-3.5 w-3.5" /> Username Admin
              </Label>
              <Input 
                type="text"
                required
                placeholder="Masukkan username admin..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 border border-slate-200 dark:border-zinc-800 rounded-2xl bg-[#FAF9F6] text-black font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551] focus-visible:ring-offset-0 transition-all px-4"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black italic flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
                <KeyRound className="h-3.5 w-3.5" /> Password
              </Label>
              <Input 
                type="password"
                required
                placeholder="Masukkan password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 border border-slate-200 dark:border-zinc-800 rounded-2xl bg-[#FAF9F6] text-black font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551] focus-visible:ring-offset-0 transition-all px-4"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 bg-black text-[#FFD551] hover:bg-slate-900 border border-black rounded-2xl font-black italic transition-all mt-6 shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-lg active:scale-[0.98]"
            >
              {isLoading ? "Memvalidasi Akses..." : "Masuk ke Control Panel"}
            </Button>

          </form>
        </CardContent>

        <CardFooter className="bg-[#FAF9F6] dark:bg-zinc-900/40 border-t border-slate-100 dark:border-zinc-800/40 p-5 justify-center">
          <p className="text-[10px] font-bold text-slate-400 italic tracking-wider">
            Authorized Personnel Only • IP Logger Active
          </p>
        </CardFooter>

      </Card>
    </main>
  )
}
