"use client"

import React, { useState } from "react"
import { ShieldCheck, Mail, Lock, User, RefreshCw, KeyRound } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

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

  // Profile update submit
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayName.trim() || !email.trim()) {
      toast.error("Nama dan Email tidak boleh kosong!")
      return
    }

    setIsSavingProfile(true)
    
    // Simulate API round-trip delay
    setTimeout(() => {
      setIsSavingProfile(false)
      setAdminUser(displayName)
      if (typeof window !== "undefined") {
        localStorage.setItem("admin_user", displayName)
      }
      toast.success("Informasi profil superadmin berhasil diperbarui!")
    }, 800)
  }

  // Password update submit
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

    // Simulate API secure crypt delay
    setTimeout(() => {
      setIsSavingPassword(false)
      setCurrPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success("Kata sandi berhasil diperbarui dengan aman (Crypt Hash Sync)!")
    }, 1200)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full">
      
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
