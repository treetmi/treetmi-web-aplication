"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Loader2, Sliders, Tv, Volume2, Sparkles, Music } from "lucide-react"
import WidgetStudio from "@/components/widget-studio"
import WidgetUrlManager from "@/components/widget-url-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDashboard } from "../context/DashboardContext"
import MediaSettingsTab from "../components/MediaSettingsTab"
import GachaSettingsTab from "../components/GachaSettingsTab"
import SoundboardSettingsTab from "../components/SoundboardSettingsTab"

export default function WidgetsPage() {
  const { data: session } = useSession()
  const {
    widgetToken,
    originUrl,
    customDonorsTitle,
    setCustomDonorsTitle,
    customDonorsPeriod,
    setCustomDonorsPeriod,
    customTickerTitle,
    setCustomTickerTitle,
    customTickerPeriod,
    setCustomTickerPeriod,
    handleResetToken,
  } = useDashboard()

  const [activeTab, setActiveTab] = useState("obs")

  if (!session) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="min-h-14 w-full items-center justify-start overflow-x-auto overflow-y-hidden rounded-2xl border border-slate-200 bg-white p-1.5 dark:border-zinc-800 dark:bg-[#121211]">
          <TabsTrigger value="obs" className="h-11 shrink-0 rounded-xl px-4 text-xs font-black italic data-active:border data-active:border-black data-active:bg-[#FFD551] data-active:text-black data-active:shadow-sm dark:data-active:border-[#FFD551] dark:data-active:bg-[#FFD551] dark:data-active:text-black">
            <Tv className="h-4 w-4" /> Integrasi Overlay OBS
          </TabsTrigger>
          <TabsTrigger value="studio" className="h-11 shrink-0 rounded-xl px-4 text-xs font-black italic data-active:border data-active:border-black data-active:bg-[#FFD551] data-active:text-black data-active:shadow-sm dark:data-active:border-[#FFD551] dark:data-active:bg-[#FFD551] dark:data-active:text-black">
            <Sliders className="h-4 w-4" /> Widget Studio
          </TabsTrigger>
          <TabsTrigger value="media" className="h-11 shrink-0 rounded-xl px-4 text-xs font-black italic data-active:border data-active:border-black data-active:bg-[#FFD551] data-active:text-black data-active:shadow-sm dark:data-active:border-[#FFD551] dark:data-active:bg-[#FFD551] dark:data-active:text-black">
            <Volume2 className="h-4 w-4" /> Media Interaktif & TTS
          </TabsTrigger>
          <TabsTrigger value="gacha" className="h-11 shrink-0 rounded-xl px-4 text-xs font-black italic data-active:border data-active:border-black data-active:bg-[#FFD551] data-active:text-black data-active:shadow-sm dark:data-active:border-[#FFD551] dark:data-active:bg-[#FFD551] dark:data-active:text-black">
            <Sparkles className="h-4 w-4" /> Gacha Wheel (Gamifikasi)
          </TabsTrigger>
          <TabsTrigger value="soundboard" className="h-11 shrink-0 rounded-xl px-4 text-xs font-black italic data-active:border data-active:border-black data-active:bg-[#FFD551] data-active:text-black data-active:shadow-sm dark:data-active:border-[#FFD551] dark:data-active:bg-[#FFD551] dark:data-active:text-black">
            <Music className="h-4 w-4" /> Soundboard Interaktif
          </TabsTrigger>
        </TabsList>

        <TabsContent value="obs" className="mt-6">
          <WidgetUrlManager
            widgetToken={widgetToken}
            originUrl={originUrl}
            customDonorsTitle={customDonorsTitle}
            setCustomDonorsTitle={setCustomDonorsTitle}
            customDonorsPeriod={customDonorsPeriod}
            setCustomDonorsPeriod={setCustomDonorsPeriod}
            customTickerTitle={customTickerTitle}
            setCustomTickerTitle={setCustomTickerTitle}
            customTickerPeriod={customTickerPeriod}
            setCustomTickerPeriod={setCustomTickerPeriod}
            onResetToken={handleResetToken}
          />
        </TabsContent>

        <TabsContent value="studio" className="mt-6">
          <WidgetStudio session={session} widgetToken={widgetToken} />
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          <MediaSettingsTab />
        </TabsContent>

        <TabsContent value="gacha" className="mt-6">
          <GachaSettingsTab />
        </TabsContent>

        <TabsContent value="soundboard" className="mt-6">
          <SoundboardSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
