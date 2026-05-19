"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-5 shrink-0" strokeWidth={2.5} />,
        info: <InfoIcon className="size-5 shrink-0" strokeWidth={2.5} />,
        warning: <TriangleAlertIcon className="size-5 shrink-0" strokeWidth={2.5} />,
        error: <OctagonXIcon className="size-5 shrink-0" strokeWidth={2.5} />,
        loading: <Loader2Icon className="size-5 shrink-0 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-white group-[.toaster]:text-[#0a0a0a] group-[.toaster]:border-slate-200/80 group-[.toaster]:shadow-lg dark:group-[.toaster]:bg-[#141414] dark:group-[.toaster]:text-[#ededed] dark:group-[.toaster]:border-zinc-800/60 font-bold italic text-[13px] leading-snug border py-3.5 px-5 rounded-2xl flex items-center gap-3",
          description: "group-[.toast]:text-current/70 text-[11px] font-semibold not-italic mt-0.5 leading-relaxed opacity-70",
          actionButton: "group-[.toast]:bg-[#FFD551] group-[.toast]:text-black font-black italic rounded-xl px-3.5 py-1.5 text-[10px] shadow-sm hover:brightness-110 active:scale-95 transition-all border border-[#FFD551]/50",
          cancelButton: "group-[.toast]:bg-white/50 dark:group-[.toast]:bg-white/10 group-[.toast]:text-current font-bold rounded-xl px-3.5 py-1.5 text-[10px] border border-current/10",
          success: "!bg-emerald-600 !text-white !border-emerald-700",
          error: "!bg-red-600 !text-white !border-red-700",
          warning: "!bg-amber-500 !text-black !border-amber-600",
          info: "!bg-[#FFD551] !text-black !border-[#FFC83B]",
          closeButton: "!bg-white/20 !border-white/30 !text-white hover:!bg-white/30 !right-1 !top-1/2 !-translate-y-1/2 !left-auto !rounded-lg !size-6",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }