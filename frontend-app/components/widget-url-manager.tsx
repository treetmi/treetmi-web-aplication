"use client"

import { Copy, ExternalLink, Gamepad2, Heart, RefreshCw, ShieldCheck, Target, Trophy, Tv, Coins, Sparkles } from "lucide-react"
import type { ReactNode } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type WidgetUrlManagerProps = {
  widgetToken: string
  originUrl: string
  customDonorsTitle: string
  setCustomDonorsTitle: (value: string) => void
  customDonorsPeriod: string
  setCustomDonorsPeriod: (value: string) => void
  customTickerTitle: string
  setCustomTickerTitle: (value: string) => void
  customTickerPeriod: string
  setCustomTickerPeriod: (value: string) => void
  onResetToken: () => void
}

const periodOptions = [
  { value: "all", label: "Semua Waktu" },
  { value: "weekly", label: "Minggu Ini" },
  { value: "monthly", label: "Bulan Ini" },
]

function copyUrl(url: string, label: string) {
  navigator.clipboard.writeText(url)
  toast.success(`${label} berhasil disalin!`)
}

function UrlRow({ label, url, darkButton = false }: { label: string; url: string; darkButton?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">{label}</Label>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Input
          readOnly
          type="password"
          value={url}
          className="h-10 rounded-xl border-slate-200 bg-slate-50 px-3 font-mono text-xs font-bold dark:border-zinc-800 dark:bg-[#1E1E1D] dark:text-white"
        />
        <Button
          type="button"
          onClick={() => copyUrl(url, label)}
          className={darkButton
            ? "h-10 rounded-xl bg-black px-4 text-[10px] font-black italic text-[#FFD551] hover:bg-zinc-900 dark:bg-zinc-800"
            : "h-10 rounded-xl bg-[#FFD551] px-4 text-[10px] font-black italic text-black hover:bg-[#FFC83B]"
          }
        >
          <Copy className="mr-1.5 h-3.5 w-3.5" /> Salin
        </Button>
      </div>
    </div>
  )
}

function WidgetCard({
  icon,
  title,
  size,
  description,
  children,
}: {
  icon: ReactNode
  title: string
  size: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-[260px] flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 transition-colors hover:border-[#FFD551] dark:border-zinc-800/80 dark:bg-[#121211]">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFD551]/15 text-black dark:text-[#FFD551]">
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-black italic text-black dark:text-white">{title}</h3>
            <p className="mt-1 inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
              {size}
            </p>
          </div>
        </div>
        <p className="text-xs font-bold italic leading-relaxed text-slate-500 dark:text-zinc-400">{description}</p>
      </div>
      <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 dark:border-zinc-900">
        {children}
      </div>
    </div>
  )
}

function WidgetControls({
  title,
  setTitle,
  period,
  setPeriod,
}: {
  title: string
  setTitle: (value: string) => void
  period: string
  setPeriod: (value: string) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200/60 bg-slate-50 p-3 dark:border-zinc-800 dark:bg-[#1C1C1B] sm:grid-cols-2">
      <div className="space-y-1">
        <Label className="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-400">Judul Widget</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: Top Donatur"
          className="h-9 rounded-xl bg-white text-xs font-bold dark:bg-[#121211]"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-400">Periode</Label>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold outline-none dark:border-zinc-800 dark:bg-[#121211] dark:text-white"
        >
          {periodOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default function WidgetUrlManager({
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
  onResetToken,
}: WidgetUrlManagerProps) {
  const alertUrl = `${originUrl}/widget/alert/${widgetToken}`
  const mediaUrl = `${originUrl}/widget/mediashare/${widgetToken}`
  const queueUrl = `${originUrl}/widget/queue/${widgetToken}`
  const targetUrl = `${originUrl}/widget/target/${widgetToken}`
  const donorsUrl = `${originUrl}/widget/donors/${widgetToken}?mode=table${customDonorsTitle.trim() ? `&title=${encodeURIComponent(customDonorsTitle.trim())}` : ""}${customDonorsPeriod !== "all" ? `&period=${customDonorsPeriod}` : ""}`
  const tickerUrl = `${originUrl}/widget/donors/${widgetToken}?mode=ticker${customTickerTitle.trim() ? `&title=${encodeURIComponent(customTickerTitle.trim())}` : ""}${customTickerPeriod !== "all" ? `&period=${customTickerPeriod}` : ""}`

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-[#121211]">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-base font-black italic text-black dark:text-[#FFD551]">
              <Tv className="h-5 w-5" /> Integrasi Overlay OBS
            </h2>
            <p className="max-w-2xl text-xs font-bold italic leading-relaxed text-slate-500 dark:text-zinc-400">
              Salin URL widget sesuai kebutuhan, lalu pasang sebagai Browser Source di OBS atau Streamlabs.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={onResetToken}
            className="h-10 rounded-xl border-slate-200 px-4 text-xs font-black italic text-red-500 hover:bg-red-50 dark:border-zinc-800"
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" /> Reset Token
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <WidgetCard
          icon={<Heart className="h-5 w-5 fill-current" />}
          title="Alert Overlay"
          size="400 x 200px"
          description="Notifikasi donasi, order mabar, panggilan antrean, TTS, sound, dan gift alert."
        >
          <UrlRow label="Gabungan Alert" url={alertUrl} />
          <UrlRow label="Donasi & Mabar Saja" url={`${alertUrl}?excludeCall=true`} darkButton />
          <UrlRow label="Panggilan Mabar Saja" url={`${alertUrl}?onlyCall=true`} />
        </WidgetCard>

        <WidgetCard
          icon={<Tv className="h-5 w-5" />}
          title="Mediashare Overlay"
          size="560 x 400px"
          description="Frame khusus untuk video YouTube, TikTok, dan Reels dari donasi penonton."
        >
          <UrlRow label="URL Browser Source" url={mediaUrl} />
        </WidgetCard>

        <WidgetCard
          icon={<Gamepad2 className="h-5 w-5" />}
          title="Antrean Mabar"
          size="400 x 280px"
          description="HUD antrean mabar yang muncul realtime saat ada order atau pemanggilan pemain."
        >
          <UrlRow label="URL Browser Source" url={queueUrl} />
        </WidgetCard>

        <WidgetCard
          icon={<Target className="h-5 w-5" />}
          title="Target Donasi"
          size="380 x 120px"
          description="Progress bar target donasi aktif lengkap dengan nominal terkumpul."
        >
          <UrlRow label="URL Browser Source" url={targetUrl} />
        </WidgetCard>

        <WidgetCard
          icon={<Sparkles className="h-5 w-5" />}
          title="Gacha Wheel Overlay"
          size="480 x 480px"
          description="Roda gacha interaktif yang berputar otomatis secara realtime ketika target donasi gacha tercapai."
        >
          <UrlRow label="URL Browser Source" url={`${originUrl}/widget/gacha/${widgetToken}`} />
        </WidgetCard>

        <WidgetCard
          icon={<Trophy className="h-5 w-5" />}
          title="Top Donatur"
          size="460 x 500px"
          description="Leaderboard donatur teratas dengan filter judul dan periode."
        >
          <WidgetControls title={customDonorsTitle} setTitle={setCustomDonorsTitle} period={customDonorsPeriod} setPeriod={setCustomDonorsPeriod} />
          <UrlRow label="URL Browser Source" url={donorsUrl} />
        </WidgetCard>

        <WidgetCard
          icon={<Coins className="h-5 w-5" />}
          title="Donors Ticker"
          size="1920 x 60px"
          description="Running text horizontal untuk riwayat donatur terbaru."
        >
          <WidgetControls title={customTickerTitle} setTitle={setCustomTickerTitle} period={customTickerPeriod} setPeriod={setCustomTickerPeriod} />
          <UrlRow label="URL Browser Source" url={tickerUrl} />
        </WidgetCard>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-[#FAF9F6] p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
        <h3 className="flex items-center gap-2 text-sm font-black italic text-black dark:text-[#FFD551]">
          <ShieldCheck className="h-5 w-5 text-emerald-500" /> Panduan Singkat OBS
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          {[
            "Klik Salin pada widget yang ingin dipasang.",
            "Di OBS buka Sources, tambah Browser Source.",
            "Tempel URL, lalu isi width dan height sesuai ukuran widget.",
            "Aktifkan Control audio via OBS untuk alert bersuara.",
          ].map((text, index) => (
            <div key={text} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-[#121211]">
              <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-black text-[10px] font-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black">
                {index + 1}
              </div>
              <p className="text-xs font-bold italic leading-relaxed text-slate-500 dark:text-zinc-400">{text}</p>
            </div>
          ))}
        </div>
        <a
          href="https://obsproject.com/kb/browser-source"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-black italic text-slate-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
        >
          Buka dokumentasi Browser Source <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  )
}
