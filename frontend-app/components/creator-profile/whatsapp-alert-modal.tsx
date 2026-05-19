"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface WhatsappAlertModalProps {
  isOpen: boolean
  onClose: () => void
  username: string
}

export function WhatsappAlertModal({ isOpen, onClose, username }: WhatsappAlertModalProps) {
  const [alertPhone, setAlertPhone] = useState("")
  const [alertCountry, setAlertCountry] = useState("+62")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!alertPhone) {
      toast.error("Masukkan nomor handphone Anda!", { duration: 3000 })
      return
    }

    toast.success("Alarm Live Berhasil Diaktifkan! 🔔", {
      description: `Anda akan menerima notifikasi otomatis via WhatsApp ke ${alertCountry}${alertPhone} setiap kali @${username} melakukan Live Stream!`,
      duration: 5000
    })

    setAlertPhone("")
    onClose()
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
              className="absolute top-3 right-3 h-7 w-7 rounded-full bg-[#FAF9F6] border border-[#E5E3DD] flex items-center justify-center hover:bg-[#F2F0EA] dark:bg-[#262626] dark:border-[#333]"
            >
              <X className="h-3 w-3" />
            </button>

            <div className="text-center pt-2">
              <Bell className="h-10 w-10 text-[#FFD551] mx-auto fill-current animate-bounce mb-1" />
              <h3 className="text-sm font-black uppercase italic tracking-tighter text-[#1A1A19] dark:text-[#EAE9E4]">
                Set Alarm Live Stream
              </h3>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider italic mt-0.5">
                Dapatkan Notifikasi WhatsApp Saat Live!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="alertPhone" className="text-[8px] font-black uppercase tracking-widest italic text-muted-foreground dark:text-[#A09E96]">
                  Nomor Handphone (WhatsApp)
                </Label>
                <div className="flex gap-2">
                  {/* Country Code dropdown */}
                  <div className="relative">
                    <select 
                      value={alertCountry}
                      onChange={(e) => setAlertCountry(e.target.value)}
                      className="h-10 rounded-xl border border-[#E5E3DD] text-xs font-bold px-2 bg-[#FAF9F6] outline-none cursor-pointer dark:bg-[#262626] dark:border-[#333] select-none"
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
                    className="flex-1 h-10 rounded-xl border border-[#E5E3DD] font-bold text-xs dark:bg-[#262626] dark:border-[#333]"
                  />
                </div>
                <p className="text-[7.5px] leading-tight text-muted-foreground uppercase font-bold italic dark:text-[#888]">
                  * Kami hanya akan mengirimkan notifikasi live stream, tidak ada spam.
                </p>
              </div>

              <Button 
                type="submit"
                className="w-full h-11 bg-[#FFD551] text-black border-2 border-black rounded-xl font-black italic uppercase shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000000] text-xs hover:bg-[#FFC83B] dark:shadow-none dark:border-zinc-800"
              >
                Aktifkan Alarm 🔔
              </Button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
