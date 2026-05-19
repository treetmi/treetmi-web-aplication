"use client"

import React, { useState, useEffect } from "react"
import { Coins, RefreshCw, Sliders } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ADMIN_API } from "@/lib/api"
import { formatNumberInput, parseNumberInput } from "@/lib/utils"

export default function RatesTab() {
  // Dynamic Exchange Rates
  const [rateUsd, setRateUsd] = useState(16000)
  const [rateMyr, setRateMyr] = useState(3400)
  const [rateSgd, setRateSgd] = useState(11800)
  const [ratePhp, setRatePhp] = useState(280)
  const [rateThb, setRateThb] = useState(440)

  // Website Settings (to preserve them on save)
  const [logoText, setLogoText] = useState("treetmi.id")
  const [logoUrl, setLogoUrl] = useState("")
  const [iconUrl, setIconUrl] = useState("")
  const [seoTitle, setSeoTitle] = useState("Treetmi.id - Platform Dukungan Kreator Terbesar di Indonesia")
  const [metaDesc, setMetaDesc] = useState("")
  const [keywords, setKeywords] = useState("")
  const [feeDonation, setFeeDonation] = useState(5.00)
  const [feeMabar, setFeeMabar] = useState(8.00)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Load Settings and Rates from Backend API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(ADMIN_API.settings)
        const json = await res.json()
        if (json.success && json.data) {
          const data = json.data
          setLogoText(data.logoText || "treetmi")
          setLogoUrl(data.logoUrl || "")
          setIconUrl(data.iconUrl || "")
          setSeoTitle(data.seoTitle || "Treetmi.id - Platform Dukungan Kreator Terbesar di Indonesia")
          setMetaDesc(data.metaDesc || "")
          setKeywords(data.keywords || "")
          setFeeDonation(data.feeDonation !== undefined ? parseFloat(data.feeDonation) : 5.00)
          setFeeMabar(data.feeMabar !== undefined ? parseFloat(data.feeMabar) : 8.00)

          if (data.rates) {
            setRateUsd(data.rates.USD !== undefined ? Number(data.rates.USD) : 16000)
            setRateMyr(data.rates.MYR !== undefined ? Number(data.rates.MYR) : 3400)
            setRateSgd(data.rates.SGD !== undefined ? Number(data.rates.SGD) : 11800)
            setRatePhp(data.rates.PHP !== undefined ? Number(data.rates.PHP) : 280)
            setRateThb(data.rates.THB !== undefined ? Number(data.rates.THB) : 440)
          }
        }
      } catch (err) {
        console.error("Gagal memuat pengaturan kurs dari server:", err)
        // Fallback from localStorage
        if (typeof window !== "undefined") {
          setRateUsd(Number(localStorage.getItem("treetmi_rate_usd") || 16000))
          setRateMyr(Number(localStorage.getItem("treetmi_rate_myr") || 3400))
          setRateSgd(Number(localStorage.getItem("treetmi_rate_sgd") || 11800))
          setRatePhp(Number(localStorage.getItem("treetmi_rate_php") || 280))
          setRateThb(Number(localStorage.getItem("treetmi_rate_thb") || 440))
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSettings()
  }, [])

  // Save Exchange Rates only
  const handleSaveRates = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      const response = await fetch(ADMIN_API.settings, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          logoText,
          logoUrl,
          iconUrl,
          seoTitle,
          metaDesc,
          keywords,
          feeDonation: Number(feeDonation),
          feeMabar: Number(feeMabar),
          rates: {
            USD: Number(rateUsd),
            MYR: Number(rateMyr),
            SGD: Number(rateSgd),
            PHP: Number(ratePhp),
            THB: Number(rateThb)
          }
        })
      })

      const json = await response.json()
      
      if (json.success) {
        // Sync local storage for instant client-side rendering
        if (typeof window !== "undefined") {
          localStorage.setItem("treetmi_rate_usd", String(rateUsd))
          localStorage.setItem("treetmi_rate_myr", String(rateMyr))
          localStorage.setItem("treetmi_rate_sgd", String(rateSgd))
          localStorage.setItem("treetmi_rate_php", String(ratePhp))
          localStorage.setItem("treetmi_rate_thb", String(rateThb))
        }
        toast.success("Konfigurasi kurs mata uang berhasil disimpan dan disinkronkan!")
      } else {
        toast.error("Gagal menyimpan kurs mata uang ke database server.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal menghubungkan ke backend API server.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400 font-bold italic text-xs">
        <RefreshCw className="h-6 w-6 animate-spin text-[#FFD551] mb-2" />
        Memuat pengaturan kurs...
      </div>
    )
  }

  return (
    <form onSubmit={handleSaveRates} className="space-y-6">
      <Card className="border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm bg-white dark:bg-[#121211]">
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center gap-3">
            <Coins className="h-5 w-5 text-[#FFD551]" />
            <div>
              <h3 className="font-black text-lg italic tracking-tight text-black dark:text-white">Konfigurasi Kurs Mata Uang (Exchange Rates)</h3>
              <p className="text-xs font-bold italic text-slate-600 dark:text-zinc-400">Atur nilai konversi mata uang asing terhadap mata uang dasar rupiah (1 Unit Asing = X Rupiah)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* USD Rate */}
            <div className="space-y-2">
              <Label className="text-xs font-black italic text-slate-500">Kurs USD (🇺🇸 Dollar ke Rp)</Label>
              <Input 
                type="text"
                required
                value={formatNumberInput(rateUsd)}
                onChange={(e) => setRateUsd(parseNumberInput(e.target.value))}
                className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
              />
              <p className="text-[9px] text-slate-400 dark:text-zinc-500 italic font-bold">1 USD = Rp {rateUsd.toLocaleString("id-ID")}</p>
            </div>

            {/* SGD Rate */}
            <div className="space-y-2">
              <Label className="text-xs font-black italic text-slate-500">Kurs SGD (🇸🇬 S$ ke Rp)</Label>
              <Input 
                type="text"
                required
                value={formatNumberInput(rateSgd)}
                onChange={(e) => setRateSgd(parseNumberInput(e.target.value))}
                className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
              />
              <p className="text-[9px] text-slate-400 dark:text-zinc-500 italic font-bold">1 SGD = Rp {rateSgd.toLocaleString("id-ID")}</p>
            </div>

            {/* MYR Rate */}
            <div className="space-y-2">
              <Label className="text-xs font-black italic text-slate-500">Kurs MYR (🇲🇾 Ringgit ke Rp)</Label>
              <Input 
                type="text"
                required
                value={formatNumberInput(rateMyr)}
                onChange={(e) => setRateMyr(parseNumberInput(e.target.value))}
                className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
              />
              <p className="text-[9px] text-slate-400 dark:text-zinc-500 italic font-bold">1 MYR = Rp {rateMyr.toLocaleString("id-ID")}</p>
            </div>

            {/* PHP Rate */}
            <div className="space-y-2">
              <Label className="text-xs font-black italic text-slate-500">Kurs PHP (🇵🇭 Peso ke Rp)</Label>
              <Input 
                type="text"
                required
                value={formatNumberInput(ratePhp)}
                onChange={(e) => setRatePhp(parseNumberInput(e.target.value))}
                className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
              />
              <p className="text-[9px] text-slate-400 dark:text-zinc-500 italic font-bold">1 PHP = Rp {ratePhp.toLocaleString("id-ID")}</p>
            </div>

            {/* THB Rate */}
            <div className="space-y-2">
              <Label className="text-xs font-black italic text-slate-500">Kurs THB (🇹🇭 Baht ke Rp)</Label>
              <Input 
                type="text"
                required
                value={formatNumberInput(rateThb)}
                onChange={(e) => setRateThb(parseNumberInput(e.target.value))}
                className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
              />
              <p className="text-[9px] text-slate-400 dark:text-zinc-500 italic font-bold">1 THB = Rp {rateThb.toLocaleString("id-ID")}</p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex justify-end">
            <Button 
              type="submit" 
              disabled={isSaving}
              className="h-11 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black rounded-2xl text-xs font-black italic shadow-sm hover:scale-[1.02] active:scale-95 transition-all w-full md:w-auto px-8 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Menyimpan Kurs Mata Uang...
                </>
              ) : (
                "Terapkan Konfigurasi Kurs Mata Uang"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
