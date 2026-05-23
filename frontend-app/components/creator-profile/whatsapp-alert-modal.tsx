"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/components/language-provider"
import { toast } from "sonner"
import { PUBLIC_API } from "@/lib/api"

interface WhatsappAlertModalProps {
  isOpen: boolean
  onClose: () => void
  username: string
}

export function WhatsappAlertModal({ isOpen, onClose, username }: WhatsappAlertModalProps) {
  const { lang } = useLanguage()
  const isIndo = lang === "id"
  const [alertPhone, setAlertPhone] = useState("")
  const [alertCountry, setAlertCountry] = useState("+62")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!alertPhone) {
      toast.error(isIndo ? "Masukkan nomor handphone Anda!" : "Please enter your phone number!", { duration: 3000 })
      return
    }

    setIsSubmitting(true)
    try {
      const fullNumber = `${alertCountry.replace("+", "")}${alertPhone}`
      const response = await fetch(PUBLIC_API.whatsappAlarm(username), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ phoneNumber: fullNumber })
      })

      const data = await response.json()
      if (data.success) {
        toast.success(isIndo ? "Alarm Live Berhasil Diaktifkan! 🔔" : "Live Alarm Activated Successfully! 🔔", {
          description: isIndo 
            ? `Anda akan menerima notifikasi otomatis via WhatsApp ke ${alertCountry}${alertPhone} setiap kali @${username} melakukan Live Stream!`
            : `You will receive automatic notifications via WhatsApp to ${alertCountry}${alertPhone} every time @${username} goes live!`,
          duration: 5000
        })
        setAlertPhone("")
        onClose()
      } else {
        toast.error(data.message || (isIndo ? "Gagal mengaktifkan alarm WhatsApp." : "Failed to activate WhatsApp alarm."))
      }
    } catch (err) {
      console.error(err)
      toast.error(isIndo ? "Kesalahan jaringan saat mengaktifkan alarm." : "Network error while activating alarm.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60"
          />
          
          {/* Centered Modal Body */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-[340px] bg-white rounded-3xl border-2 border-black p-5 shadow-[5px_5px_0px_0px_#000000] space-y-4 z-50 dark:bg-[#1C1C1C] dark:border-zinc-800 dark:shadow-none"
          >
            {/* Close Icon */}
            <button 
              onClick={onClose}
              className="absolute top-3 right-3 h-7 w-7 rounded-full bg-[#FAF9F6] border border-[#E5E3DD] flex items-center justify-center hover:bg-[#F2F0EA] dark:bg-[#262626] dark:border-[#333] cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>

            <div className="text-center pt-2">
              <Bell className="h-10 w-10 text-[#FFD551] mx-auto fill-current animate-bounce mb-1" />
              <h3 className="text-sm font-black uppercase italic tracking-tighter text-[#1A1A19] dark:text-[#EAE9E4]">
                {isIndo ? "Set Alarm Live Stream" : "Set Live Stream Alarm"}
              </h3>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider italic mt-0.5">
                {isIndo ? "Dapatkan Notifikasi WhatsApp Saat Live!" : "Get WhatsApp Notifications When Live!"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <Label htmlFor="alertPhone" className="text-[8px] font-black uppercase tracking-widest italic text-muted-foreground dark:text-[#A09E96]">
                  {isIndo ? "Nomor Handphone (WhatsApp)" : "Mobile Number (WhatsApp)"}
                </Label>
                <div className="flex gap-2">
                  {/* Country Code dropdown */}
                  <div className="relative">
                    <select 
                      value={alertCountry}
                      onChange={(e) => setAlertCountry(e.target.value)}
                      className="h-12 rounded-xl border border-slate-200 text-xs font-black px-2 bg-[#FAF9F6] outline-none cursor-pointer dark:bg-[#262626] dark:border-zinc-800 shadow-sm"
                    >
                      <option value="+62">🇮🇩 +62</option>
                      <option value="+60">🇲🇾 +60</option>
                      <option value="+65">🇸🇬 +65</option>
                    </select>
                  </div>
                  
                  {/* Phone Number Input */}
                  <Input 
                    id="alertPhone"
                    type="tel"
                    required
                    value={alertPhone}
                    onChange={(e) => setAlertPhone(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="81234567xxx" 
                    className="flex-1 h-12 rounded-xl border border-slate-200 font-extrabold text-xs dark:bg-[#262626] dark:border-zinc-800 shadow-sm focus-visible:ring-0 focus-visible:border-[#FFD551]"
                  />
                </div>
                <p className="text-[7.5px] leading-tight text-muted-foreground uppercase font-bold italic dark:text-[#888]">
                  {isIndo 
                    ? "* Kami hanya akan mengirimkan notifikasi live stream, tidak ada spam." 
                    : "* We will only send live stream notifications, no spam."}
                </p>
              </div>

              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-[#FFD551] text-black border border-[#FFC83B] rounded-xl font-black italic uppercase shadow-sm active:scale-[0.98] text-xs hover:bg-[#FFC83B] dark:shadow-none dark:border-zinc-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting 
                  ? (isIndo ? "Memproses... ⏳" : "Processing... ⏳")
                  : (isIndo ? "Aktifkan Alarm 🔔" : "Activate Alarm 🔔")
                }
              </Button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
