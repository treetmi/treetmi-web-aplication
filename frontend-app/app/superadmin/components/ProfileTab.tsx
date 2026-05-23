"use client"

import React, { useState, useEffect } from "react"
import { ShieldCheck, Mail, Lock, User, RefreshCw, KeyRound, QrCode, Smartphone } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ADMIN_API } from "@/lib/api"

interface ProfileTabProps {
  adminUser: string;
  setAdminUser: (user: string) => void;
}

export default function ProfileTab({ adminUser, setAdminUser }: ProfileTabProps) {
  // Account Information form states
  const [displayName, setDisplayName] = useState(adminUser)
  const [email, setEmail] = useState("admin@treetmi.id")
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Password Security form states
  const [currPassword, setCurrPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  // Two-Factor Authentication (2FA) states
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [isLoading2FA, setIsLoading2FA] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [setupSecret, setSetupSecret] = useState("")
  const [setupQrCode, setSetupQrCode] = useState("")
  const [setupCode, setSetupCode] = useState("")
  const [isVerifying2FA, setIsVerifying2FA] = useState(false)

  // Fetch 2FA Status on mount
  useEffect(() => {
    const fetch2FAStatus = async () => {
      try {
        const res = await fetch(ADMIN_API.status2FA)
        const json = await res.json()
        if (json.success) {
          setIs2FAEnabled(json.enabled)
        }
      } catch (err) {
        console.error("Gagal mengambil status 2FA:", err)
      }
    }
    fetch2FAStatus()
  }, [])

  // Profile update submit
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayName.trim() || !email.trim()) {
      toast.error("Nama dan Email tidak boleh kosong!")
      return
    }

    setIsSavingProfile(true)
    
    // Simulate API round-trip delay for profile metadata update
    setTimeout(() => {
      setIsSavingProfile(false)
      setAdminUser(displayName)
      if (typeof window !== "undefined") {
        localStorage.setItem("admin_user", displayName)
      }
      toast.success("Informasi profil superadmin berhasil diperbarui!")
    }, 800)
  }

  // Password update submit (Database backend integration)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currPassword) {
      toast.error("Password saat ini wajib diisi!")
      return
    }
    if (newPassword.length < 6) {
      toast.error("Password baru minimal terdiri dari 6 karakter!")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password baru tidak cocok!")
      return
    }

    setIsSavingPassword(true)

    try {
      const res = await fetch(ADMIN_API.changePassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currPassword,
          newPassword: newPassword
        })
      })
      const data = await res.json()

      setIsSavingPassword(false)

      if (data.success) {
        setCurrPassword("")
        setNewPassword("")
        setConfirmPassword("")
        toast.success("Kata sandi berhasil diperbarui secara aman di database!")
      } else {
        toast.error(data.message || "Gagal memperbarui kata sandi.")
      }
    } catch (err) {
      setIsSavingPassword(false)
      toast.error("Gagal menghubungi server untuk mengubah password.")
    }
  }

  // Generate 2FA Secret & QR Code
  const handleInit2FA = async () => {
    setIsLoading2FA(true)
    try {
      const res = await fetch(ADMIN_API.setup2FA, { method: "POST" })
      const data = await res.json()
      setIsLoading2FA(false)

      if (data.success) {
        setSetupSecret(data.secret)
        setSetupQrCode(data.qrCodeUrl)
        setShowSetup(true)
      } else {
        toast.error("Gagal mempersiapkan kunci 2FA.")
      }
    } catch (err) {
      setIsLoading2FA(false)
      toast.error("Terjadi kesalahan jaringan saat setup 2FA.")
    }
  }

  // Verify and Enable 2FA
  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    if (setupCode.length !== 6) {
      toast.error("Kode OTP harus terdiri dari 6 digit!")
      return
    }

    setIsVerifying2FA(true)
    try {
      const res = await fetch(ADMIN_API.enable2FA, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: setupSecret,
          otpToken: setupCode
        })
      })
      const data = await res.json()
      setIsVerifying2FA(false)

      if (data.success) {
        setIs2FAEnabled(true)
        setShowSetup(false)
        setSetupCode("")
        setSetupSecret("")
        setSetupQrCode("")
        toast.success("Two-Factor Authentication (2FA) berhasil diaktifkan!")
      } else {
        toast.error(data.message || "Kode verifikasi salah! Gagal mengaktifkan 2FA.")
      }
    } catch (err) {
      setIsVerifying2FA(false)
      toast.error("Terjadi kesalahan verifikasi kode 2FA.")
    }
  }

  // Disable 2FA
  const handleDisable2FA = async () => {
    if (!confirm("Apakah Anda yakin ingin menonaktifkan Two-Factor Authentication? Keamanan akun Anda akan berkurang.")) {
      return
    }

    setIsLoading2FA(true)
    try {
      const res = await fetch(ADMIN_API.disable2FA, { method: "POST" })
      const data = await res.json()
      setIsLoading2FA(false)

      if (data.success) {
        setIs2FAEnabled(false)
        toast.success("2FA dinonaktifkan. Akun kembali menggunakan autentikasi password saja.")
      } else {
        toast.error("Gagal menonaktifkan 2FA.")
      }
    } catch (err) {
      setIsLoading2FA(false)
      toast.error("Terjadi kesalahan menonaktifkan 2FA.")
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full text-black">
      
      {/* LEFT COLUMN: Profile Overview Bento & Account Info Form */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Profile Card Bento Banner */}
        <div className="bg-[#FAF9F6] dark:bg-[#121211] border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-sm flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-40 w-40 bg-[#FFD551]/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Avatar sphere */}
          <div className="h-20 w-20 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black rounded-full flex items-center justify-center font-black italic text-3xl shadow-md border-2 border-slate-100 dark:border-zinc-800 shrink-0 select-none">
            {displayName ? displayName.substring(0, 2).toUpperCase() : "AD"}
          </div>

          <div className="flex-1 text-center md:text-left space-y-2 min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h2 className="font-black text-2xl italic tracking-tighter text-black dark:text-white truncate">
                {displayName}
              </h2>
              <Badge className="bg-black text-[#FFD551] dark:bg-[#FFD551]/10 dark:text-[#FFD551] border-none text-[8px] font-black rounded-lg uppercase py-0.5 px-2">
                Super Owner
              </Badge>
            </div>
            <p className="text-xs font-bold text-slate-600 dark:text-zinc-400 italic">
              Portal Super Administrator &bull; Treetmi System Control
            </p>
            <div className="flex items-center justify-center md:justify-start gap-1 text-[10px] font-black italic text-emerald-500 dark:text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" /> Akses Terenkripsi Penuh (SSL/TLS Active)
            </div>
          </div>
        </div>

        {/* Account Info Form Card */}
        <Card className="border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div>
              <h3 className="font-black text-lg italic tracking-tight text-black dark:text-white">Detail Kredensial Portal</h3>
              <p className="text-xs font-bold italic text-slate-600 dark:text-zinc-400">Ubah informasi identitas dan login untuk konsol pemilik platform</p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black italic text-slate-500">Nama Admin / Display Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <Input 
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="h-11 pl-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black italic text-slate-500">Alamat Email Kredensial</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <Input 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 pl-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSavingProfile}
                  className="h-11 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black rounded-2xl text-xs font-black italic shadow-sm hover:scale-[1.02] active:scale-95 transition-all w-full md:w-auto px-6 cursor-pointer"
                >
                  {isSavingProfile ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Menyimpan Profil...
                    </>
                  ) : (
                    "Simpan Perubahan Kredensial"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Two-Factor Authentication (2FA) Management Card */}
        <Card className="border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-black dark:text-white" />
                  <h3 className="font-black text-lg italic tracking-tight text-black dark:text-white">Two-Factor Authentication (2FA)</h3>
                </div>
                <p className="text-xs font-bold italic text-slate-600 dark:text-zinc-400 mt-1">
                  Amankan akun admin dengan Google Authenticator atau aplikasi TOTP lainnya.
                </p>
              </div>
              <Badge className={`border-none text-[9px] font-black rounded-lg uppercase py-1 px-3 ${
                is2FAEnabled ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
              }`}>
                {is2FAEnabled ? "AKTIF" : "TIDAK AKTIF"}
              </Badge>
            </div>

            {!showSetup ? (
              <div className="bg-[#FAF9F6] dark:bg-[#1c1c1a]/50 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs font-bold text-slate-600 dark:text-zinc-400 italic max-w-md">
                  {is2FAEnabled 
                    ? "Setiap kali Anda masuk ke portal superadmin, Anda wajib memasukkan kode OTP 6-digit dinamis dari perangkat authenticator Anda."
                    : "Sangat disarankan untuk mengaktifkan 2FA agar konsol Anda terlindungi dari pembajakan akun dan aman saat diaudit PSE Kominfo."}
                </p>
                {is2FAEnabled ? (
                  <Button
                    onClick={handleDisable2FA}
                    disabled={isLoading2FA}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl px-6 h-11 text-xs shrink-0 transition-all cursor-pointer"
                  >
                    {isLoading2FA ? "Memproses..." : "Nonaktifkan 2FA"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleInit2FA}
                    disabled={isLoading2FA}
                    className="bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black font-black italic rounded-2xl px-6 h-11 text-xs shrink-0 transition-all cursor-pointer"
                  >
                    {isLoading2FA ? "Menghubungkan..." : "Aktifkan 2FA Sekarang"}
                  </Button>
                )}
              </div>
            ) : (
              <form onSubmit={handleEnable2FA} className="space-y-6 bg-[#FAF9F6] dark:bg-[#1c1c1a]/50 p-6 rounded-3xl">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  {/* QR Code Container */}
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shrink-0">
                    {setupQrCode ? (
                      <img src={setupQrCode} alt="2FA QR Code" className="h-40 w-40" />
                    ) : (
                      <div className="h-40 w-40 flex items-center justify-center">
                        <RefreshCw className="h-8 w-8 animate-spin text-slate-300" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 text-xs font-bold text-slate-600 dark:text-zinc-400 italic">
                    <p className="text-black dark:text-white font-black text-sm">Langkah-langkah Aktivasi:</p>
                    <p>1. Scan QR Code di samping menggunakan Google Authenticator atau Authy Anda.</p>
                    <p>2. Atau masukkan Kunci Pengaturan manual berikut: <span className="font-mono bg-slate-200 dark:bg-zinc-800 text-black dark:text-white px-2 py-0.5 rounded text-xs select-all font-bold tracking-widest">{setupSecret}</span></p>
                    <p>3. Masukkan 6-digit kode OTP yang tampil di aplikasi Anda ke dalam kolom di bawah untuk memverifikasi.</p>
                  </div>
                </div>

                <div className="space-y-2 max-w-xs">
                  <Label className="text-xs font-black italic text-slate-500">Kode OTP Verifikasi (6-Digit)</Label>
                  <Input 
                    required
                    maxLength={6}
                    placeholder="Contoh: 123456"
                    value={setupCode}
                    onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, ""))}
                    className="h-11 text-center font-bold text-lg tracking-[0.3em] border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button 
                    type="button"
                    onClick={() => {
                      setShowSetup(false)
                      setSetupCode("")
                    }}
                    className="bg-transparent text-slate-500 hover:text-black font-bold h-11 px-5 rounded-2xl cursor-pointer"
                  >
                    Batal
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isVerifying2FA}
                    className="bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black font-black italic h-11 px-6 rounded-2xl cursor-pointer"
                  >
                    {isVerifying2FA ? "Memverifikasi..." : "Verifikasi & Aktifkan"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN: Change Password Security Card */}
      <div className="space-y-6">
        
        {/* Security Rules Box */}
        <div className="bg-[#FAF9F6] dark:bg-[#121211] border border-slate-200 dark:border-zinc-800 p-6 rounded-[2rem] space-y-3">
          <div className="flex items-center gap-2 text-black dark:text-[#FFD551]">
            <KeyRound className="h-4 w-4 text-[#FFD551]" />
            <span className="text-[10px] font-black tracking-wider italic">Proteksi Sandbox & DB</span>
          </div>
          <p className="text-[10px] text-slate-600 dark:text-zinc-400 leading-normal font-bold">
            Kata sandi superadmin digunakan untuk otentikasi login konsol utama, serta memvalidasi otorisasi pembayaran creator live. Pastikan Anda menggunakan kombinasi karakter unik.
          </p>
        </div>

        {/* Change Password Form */}
        <Card className="border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div>
              <h3 className="font-black text-lg italic tracking-tight text-black dark:text-white">Ubah Kata Sandi</h3>
              <p className="text-xs font-bold italic text-slate-600 dark:text-zinc-400">Amankan konsol kendali dengan kunci akses baru</p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-black italic text-slate-500">Password Saat Ini</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <Input 
                    type="password"
                    required
                    placeholder="••••••••"
                    value={currPassword}
                    onChange={(e) => setCurrPassword(e.target.value)}
                    className="h-11 pl-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black italic text-slate-500">Password Baru</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <Input 
                    type="password"
                    required
                    placeholder="Minimal 6 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-11 pl-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black italic text-slate-500">Konfirmasi Password Baru</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <Input 
                    type="password"
                    required
                    placeholder="Ulangi password baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11 pl-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={isSavingPassword}
                  className="h-11 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black rounded-2xl text-xs font-black italic shadow-sm hover:scale-[1.02] active:scale-95 transition-all w-full cursor-pointer"
                >
                  {isSavingPassword ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Mengenkripsi Kunci...
                    </>
                  ) : (
                    "Terapkan Kunci Baru"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
