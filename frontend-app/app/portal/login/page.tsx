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
import { ADMIN_API } from "@/lib/api"
import { useLanguage } from "@/components/language-provider"

export default function PortalLogin() {
  const router = useRouter()
  const { lang } = useLanguage()
  const isIndo = lang === "id"

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [otpToken, setOtpToken] = useState("")
  const [requires2FA, setRequires2FA] = useState(false)
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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (requires2FA) {
        // Langkah 2: Verifikasi OTP 2FA
        const res = await fetch(ADMIN_API.login2FA, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: username.trim(),
            token: otpToken
          })
        })
        const data = await res.json()

        if (data.success) {
          localStorage.setItem("admin_session", "true")
          localStorage.setItem("admin_user", data.adminUser || "Administrator")
          localStorage.setItem("admin_token", data.token) // JWT token

          toast.success(isIndo ? "Akses Superadmin Disetujui! Mengalihkan ke Control Panel..." : "Superadmin Access Granted! Redirecting to Control Panel...")

          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(isIndo ? "Selamat datang, Administrator Utama Treetmi." : "Welcome, Treetmi Chief Administrator.")
            utterance.lang = isIndo ? "id-ID" : "en-US"
            window.speechSynthesis.speak(utterance)
          }

          router.push("/superadmin")
        } else {
          setIsLoading(false)
          toast.error(data.message || (isIndo ? "Kode OTP 2FA salah atau kadaluarsa!" : "2FA OTP code is incorrect or expired!"))
        }
      } else {
        // Langkah 1: Cek Username & Password
        const res = await fetch(ADMIN_API.login, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: username.trim(),
            password: password
          })
        })
        const data = await res.json()

        if (data.success) {
          if (data.requires2FA) {
            setRequires2FA(true)
            setIsLoading(false)
            toast.info(isIndo 
              ? "Password disetujui! Silakan masukkan kode OTP dari aplikasi Google Authenticator Anda." 
              : "Password approved! Please enter the OTP code from your Google Authenticator app.")
          } else {
            localStorage.setItem("admin_session", "true")
            localStorage.setItem("admin_user", data.adminUser || "Administrator")
            localStorage.setItem("admin_token", data.token) // JWT token

            toast.success(isIndo ? "Akses Superadmin Disetujui! Mengalihkan ke Control Panel..." : "Superadmin Access Granted! Redirecting to Control Panel...")

            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(isIndo ? "Selamat datang, Administrator Utama Treetmi." : "Welcome, Treetmi Chief Administrator.")
              utterance.lang = isIndo ? "id-ID" : "en-US"
              window.speechSynthesis.speak(utterance)
            }

            router.push("/superadmin")
          }
        } else {
          setIsLoading(false)
          toast.error(data.message || (isIndo ? "Username atau password salah! Akses ditolak." : "Incorrect username or password! Access denied."))
        }
      }
    } catch (err) {
      setIsLoading(false)
      toast.error(isIndo ? "Terjadi kesalahan koneksi ke server." : "A connection error occurred with the server.")
    }
  }

  return (
    <main className="min-h-screen bg-[#F8F7F3] dark:bg-[#0B0B0A] flex flex-col items-center justify-center p-4">
      
      {/* Back button */}
      <Link href="/" className="mb-6 flex items-center gap-2 text-xs font-black italic text-slate-400 hover:text-black dark:text-zinc-500 dark:hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> {isIndo ? "Kembali ke Beranda" : "Back to Home"}
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
            {requires2FA
              ? (isIndo
                  ? "Masukkan 6-digit kode OTP dari Google Authenticator atau Authy Anda untuk memverifikasi identitas."
                  : "Enter the 6-digit OTP code from your Google Authenticator or Authy to verify identity.")
              : (isIndo
                  ? "Autentikasi tingkat tinggi diperlukan untuk mengelola finansial dan direktori platform."
                  : "High-level authentication is required to manage platform financials and directory.")}
          </CardDescription>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-black">
            
            {!requires2FA ? (
              <>
                <div className="space-y-2">
                  <Label className="text-xs font-black italic flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
                    <User className="h-3.5 w-3.5" /> {isIndo ? "Username Admin" : "Admin Username"}
                  </Label>
                  <Input 
                    type="text"
                    required
                    placeholder={isIndo ? "Masukkan username admin..." : "Enter admin username..."}
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
                    placeholder={isIndo ? "Masukkan password..." : "Enter password..."}
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
                  {isLoading 
                    ? (isIndo ? "Memvalidasi Akses..." : "Validating Access...") 
                    : (isIndo ? "Masuk ke Control Panel" : "Access Control Panel")}
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="text-xs font-black italic flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
                    <KeyRound className="h-3.5 w-3.5" /> {isIndo ? "Kode OTP 2FA (6-Digit)" : "2FA OTP Code (6-Digit)"}
                  </Label>
                  <Input 
                    type="text"
                    required
                    maxLength={6}
                    placeholder={isIndo ? "Contoh: 123456" : "Example: 123456"}
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ""))}
                    className="h-12 border border-slate-200 dark:border-zinc-800 rounded-2xl bg-[#FAF9F6] text-black font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551] focus-visible:ring-offset-0 text-center text-xl tracking-[0.5em] transition-all px-4"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 bg-[#FFD551] text-black hover:bg-[#ffe282] border border-[#FFD551] rounded-2xl font-black italic transition-all mt-6 shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-lg active:scale-[0.98]"
                >
                  {isLoading ? (isIndo ? "Memverifikasi..." : "Verifying...") : (isIndo ? "Verifikasi & Masuk" : "Verify & Login")}
                </Button>

                <Button 
                  type="button" 
                  onClick={() => {
                    setRequires2FA(false)
                    setOtpToken("")
                  }}
                  className="w-full h-10 bg-transparent text-slate-500 hover:text-black dark:text-zinc-500 dark:hover:text-white rounded-2xl font-bold transition-all mt-2"
                >
                  {isIndo ? "Kembali ke Password" : "Back to Password"}
                </Button>
              </>
            )}

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
