"use client"

import React, { useState, useRef, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { API_BASE_URL } from "@/lib/api"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Video, User, Loader2, ArrowRight, ShieldCheck, Timer } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: Login Request, 2: OTP Verification
  const [username, setUsername] = useState("") // email or username input
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // OTP Input States
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const [timer, setTimer] = useState(900) // 15 minutes
  const [targetEmail, setTargetEmail] = useState("")

  // Countdown timer effect
  useEffect(() => {
    if (step !== 2) return
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [step])

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const s = secs % 60
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const handleLoginRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!username) {
      setError("Email atau Username wajib diisi!")
      return
    }

    const cleanUsername = username.trim().toLowerCase()
    setIsLoading(true)
    try {
      const apiBaseUrl = API_BASE_URL
      const res = await fetch(`${apiBaseUrl}/users/login-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cleanUsername
        })
      })

      const json = await res.json()
      if (json.success && json.data) {
        setTargetEmail(json.data.email)
        toast.success(json.message || "Kode OTP berhasil dikirim!")
        setStep(2)
        setTimer(900) // reset timer
      } else {
        setError(json.message || "Gagal mengirim kode OTP masuk.")
      }
    } catch (err: any) {
      console.error(err)
      setError("Akun dengan Email/Username tersebut tidak ditemukan.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle OTP focus shifting
  const handleOtpChange = (val: string, index: number) => {
    if (isNaN(Number(val))) return
    const newOtp = [...otp]
    newOtp[index] = val.slice(-1) // keep last digit only
    setOtp(newOtp)

    // Shift focus to next input
    if (val !== "" && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        otpRefs.current[index - 1]?.focus()
      }
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const otpCode = otp.join("")
    if (otpCode.length < 6) {
      setError("Masukkan 6-digit kode OTP lengkap!")
      return
    }

    setIsLoading(true)
    try {
      const apiBaseUrl = API_BASE_URL
      const res = await fetch(`${apiBaseUrl}/users/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrUsername: username.trim().toLowerCase(),
          otp: otpCode
        })
      })

      const json = await res.json()
      if (json.success && json.token) {
        // Authorize into NextAuth
        const result = await signIn("credentials", {
          id: json.data.id,
          username: json.data.username,
          email: json.data.email,
          token: json.token,
          action: "login_verified",
          redirect: false,
        })

        if (result?.error) {
          setError(result.error)
        } else {
          toast.success("Selamat datang kembali di Treetmi Hub!")
          router.push("/dashboard")
        }
      } else {
        setError(json.message || "Kode OTP salah atau telah kedaluwarsa.")
      }
    } catch (err) {
      console.error(err)
      setError("Gagal memverifikasi kode OTP masuk.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (err) {
      toast.error("Gagal memulai login dengan Google.")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#F8F7F3] dark:bg-[#0B0B0A] transition-colors duration-200">
      <Navbar />
      
      {/* Scrollable Content Wrapper with isolated overflow-hidden to allow sticky Navbar */}
      <div className="flex-grow flex flex-col relative overflow-hidden">
        {/* Decorative Silhouette */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 opacity-[0.03] dark:opacity-[0.05] pointer-events-none hidden lg:block">
        <Video className="size-[450px] text-black dark:text-white" />
      </div>

      <div className="container mx-auto px-4 flex-grow py-12 md:py-16 flex flex-col items-center justify-center relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="-mb-12 relative z-30 flex justify-center w-full pointer-events-none"
        >
          <img 
            src="/auth/auth_image.webp" 
            alt="Welcome to Treetmi" 
            className="w-full max-w-[280px] md:max-w-[340px] h-auto object-contain drop-shadow-2xl"
          />
        </motion.div>

        <div className="w-full max-w-md">
          {mounted ? (
            <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="w-full border-2 border-slate-200/80 rounded-[2.5rem] shadow-xl bg-white dark:bg-[#121211] dark:border-zinc-800/80 overflow-hidden">
                  <CardHeader className="text-center space-y-2 pt-8">
                    <div className="mx-auto w-16 h-16 bg-[#FFD551] rounded-3xl flex items-center justify-center mb-2 border border-slate-200/60 shadow-md">
                      <Video className="text-black h-8 w-8" />
                    </div>
                    <CardTitle className="text-4xl font-black italic tracking-tighter text-black dark:text-white">
                      Masuk Hub
                    </CardTitle>
                    <CardDescription className="font-bold italic text-xs tracking-wider text-slate-500 dark:text-zinc-400">
                      Akses Dashboard Kreator Anda
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6 px-8 pb-8 pt-2">
                    <form onSubmit={handleLoginRequestSubmit} className="space-y-4">
                      {error && (
                        <div className="bg-destructive/10 border-2 border-destructive/20 text-destructive text-xs font-bold italic p-3 rounded-2xl flex items-center gap-2 animate-in fade-in duration-300">
                          <span className="text-sm">⚠️</span>
                          <span>{error}</span>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-xs font-black italic text-slate-500 dark:text-zinc-400">
                          Alamat Email / Username Anda
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            id="username"
                            type="text"
                            placeholder="contoh: budi@gmail.com atau budigamer"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="pl-10 h-12 border border-slate-200 rounded-2xl bg-[#FAF9F6] text-black font-bold outline-none focus:ring-2 focus:ring-[#FFD551] dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-white"
                            disabled={isLoading || isGoogleLoading}
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 text-sm font-black italic bg-[#FFD551] text-black hover:bg-[#FFC83B] transition-all rounded-2xl border-b-4 border-black/20 pt-1 gap-2 mt-2 flex items-center justify-center"
                        disabled={isLoading || isGoogleLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            Minta Kode OTP <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>

                    <div className="relative flex items-center justify-center my-2">
                      <span className="absolute w-full h-[1px] bg-slate-200 dark:bg-zinc-800" />
                      <span className="relative px-3 text-[10px] font-black italic bg-white dark:bg-[#121211] text-slate-400">
                        atau
                      </span>
                    </div>

                    <Button
                      onClick={handleGoogleSignIn}
                      className="w-full h-12 text-sm font-black bg-[#FAF9F6] text-black hover:bg-slate-100 transition-all rounded-2xl border border-slate-200 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-white dark:hover:bg-zinc-900 gap-3"
                      disabled={isLoading || isGoogleLoading}
                    >
                      {isGoogleLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                          Hubungkan dengan Google
                        </>
                      )}
                    </Button>

                    <p className="text-center text-xs font-bold text-slate-500 dark:text-zinc-400 mt-4">
                      Belum memiliki akun?{" "}
                      <Link href="/register" className="text-black dark:text-[#FFD551] font-black underline italic">
                        Daftar Baru
                      </Link>
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="w-full border-2 border-slate-200/80 rounded-[2.5rem] shadow-xl bg-white dark:bg-[#121211] dark:border-zinc-800/80 overflow-hidden">
                  <CardHeader className="text-center space-y-2 pt-8">
                    <div className="mx-auto w-16 h-16 bg-[#FFD551] rounded-3xl flex items-center justify-center mb-2 border border-slate-200/60 shadow-md">
                      <ShieldCheck className="text-black h-8 w-8" />
                    </div>
                    <CardTitle className="text-4xl font-black italic tracking-tighter text-black dark:text-white">
                      Verifikasi Masuk
                    </CardTitle>
                    <CardDescription className="font-bold text-[10px] tracking-wider text-slate-500 dark:text-zinc-400">
                      Masukkan 6 digit kode yang dikirim ke <br />
                      <span className="text-black dark:text-white lowercase italic font-black">{targetEmail}</span>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6 px-8 pb-8">
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                      {error && (
                        <div className="bg-destructive/10 border-2 border-destructive/20 text-destructive text-xs font-bold italic p-3 rounded-2xl flex items-center gap-2 animate-in fade-in duration-300">
                          <span className="text-sm">⚠️</span>
                          <span>{error}</span>
                        </div>
                      )}
                      <div className="flex justify-between gap-2 my-2">
                        {otp.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={(el) => { otpRefs.current[idx] = el }}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(e.target.value, idx)}
                            onKeyDown={(e) => handleKeyDown(e, idx)}
                            className="w-12 h-14 text-center text-2xl font-black bg-[#FAF9F6] border-2 border-slate-200 rounded-2xl outline-none focus:border-[#FFD551] focus:ring-2 focus:ring-[#FFD551] dark:bg-zinc-900/40 dark:border-zinc-800 dark:text-white"
                          />
                        ))}
                      </div>

                      <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 dark:text-zinc-400">
                        <Timer className="h-4 w-4" />
                        Masa berlaku kode:{" "}
                        <span className="font-black text-black dark:text-white">
                          {formatTime(timer)}
                        </span>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 text-sm font-black italic bg-[#FFD551] text-black hover:bg-[#FFC83B] transition-all rounded-2xl border-b-4 border-black/20 pt-1 gap-2 flex items-center justify-center"
                        disabled={isLoading || timer === 0}
                      >
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            Verifikasi & Masuk <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>

                    <p className="text-center text-xs font-bold text-slate-500 dark:text-zinc-400">
                      Tidak menerima kode?{" "}
                      <button
                        type="button"
                        onClick={handleLoginRequestSubmit}
                        className="text-black dark:text-[#FFD551] font-black underline italic"
                      >
                        Kirim Ulang OTP
                      </button>
                    </p>

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full text-center text-xs font-black uppercase italic text-slate-400 hover:text-black dark:hover:text-white transition-all underline"
                    >
                      Kembali ke Form Masuk
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
          ) : (
            // Premium layout placeholder card during server rendering and hydration
            <div className="w-full border-2 border-slate-200/80 rounded-[2.5rem] bg-white/90 dark:bg-[#121211]/90 dark:border-zinc-800/80 p-8 space-y-6 h-[480px] animate-pulse flex flex-col justify-center items-center">
              <div className="w-16 h-16 bg-slate-200/60 dark:bg-zinc-800/60 rounded-3xl" />
              <div className="h-8 w-48 bg-slate-200/60 dark:bg-zinc-800/60 rounded-lg" />
              <div className="h-4 w-32 bg-slate-200/60 dark:bg-zinc-800/60 rounded-lg" />
              <div className="w-full space-y-4 pt-6">
                <div className="h-10 bg-slate-200/60 dark:bg-zinc-800/60 rounded-xl w-full" />
                <div className="h-10 bg-slate-200/60 dark:bg-zinc-800/60 rounded-xl w-full" />
                <div className="h-12 bg-slate-200/60 dark:bg-zinc-800/60 rounded-xl w-full" />
              </div>
            </div>
          )}
        </div>
      </div>
      </div>

      <Footer />
    </main>
  )
}
