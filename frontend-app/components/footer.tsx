"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { PUBLIC_API } from "@/lib/api"
import { useLanguage } from "@/components/language-provider"

export function Footer() {
  const { lang } = useLanguage()
  const isIndo = lang === "id"
  const currentYear = new Date().getFullYear()
  const [permits, setPermits] = useState({ ahu: "", pse: "", nib: "", ahuLogo: "", pseLogo: "", nibLogo: "" })
  const [logoText, setLogoText] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [partners, setPartners] = useState<any[]>([])
  const [socials, setSocials] = useState({ discord: "", x: "", instagram: "", tiktok: "" })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cachedText = localStorage.getItem("treetmi_logo_text")
      const cachedUrl = localStorage.getItem("treetmi_logo_url")
      if (cachedText) setLogoText(cachedText)
      if (cachedUrl) setLogoUrl(cachedUrl)
    }

    // Fetch site settings
    fetch(PUBLIC_API.publicSettings)
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          setPermits({
            ahu: json.data.ahuNumber || "",
            pse: json.data.pseNumber || "",
            nib: json.data.nibNumber || "",
            ahuLogo: json.data.ahuLogo || "",
            pseLogo: json.data.pseLogo || "",
            nibLogo: json.data.nibLogo || ""
          })
          setCompanyName(json.data.companyName || "PT Karya Putri Cikal")
          setSocials({
            discord: json.data.discordUrl || "",
            x: json.data.xUrl || "",
            instagram: json.data.instagramUrl || "",
            tiktok: json.data.tiktokUrl || ""
          })
        }
      })
      .catch(() => { })

    // Fetch partners
    fetch(PUBLIC_API.partners)
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          setPartners(json.data.filter((p: any) => p.isActive))
        }
      })
      .catch(err => console.error("Error loading partners for footer:", err))
  }, [])

  return (
    <footer className="w-full bg-background text-slate-500 dark:text-[#A09E96] py-16 border-t border-[#EAE9E4] dark:border-[#262626] relative z-10">
      <div className="container mx-auto px-6 md:px-12 max-w-[1360px] space-y-12 flex flex-col items-center">

        {/* Brand Logo, Description, and Permits (Centered & Theme-Safe) */}
        <div className="w-full flex flex-col items-center text-center space-y-4 max-w-2xl">
          <Link href="/" className="inline-block">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={logoText || "Treetmi"}
                className="h-10 md:h-12 w-auto object-contain"
              />
            ) : (
              <span className="text-3xl font-black italic uppercase tracking-tighter text-black dark:text-white">
                {logoText || "treetmi"}<span className="text-[#FFD551] dark:text-[#FFD551]">.id</span>
              </span>
            )}
          </Link>

          <p className="text-sm md:text-base text-slate-650 dark:text-[#A09E96] leading-relaxed font-bold">
            {isIndo
              ? "Platform Dukungan Kreator Terbesar di Indonesia. Kirim donasi instan, request mabar, dan dukung kreator favoritmu secara langsung dengan fee potongan terendah."
              : "The Largest Creator Support Platform in Indonesia. Send instant donations, request play sessions, and support your favorite creators directly with the lowest transaction fees."}
          </p>

          {/* Legal Permits (Horizontal Centered Row) */}
          {(permits.ahu || permits.pse || permits.nib) && (
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs md:text-sm font-black text-slate-450 dark:text-zinc-550 uppercase tracking-wider pt-1 items-center">
              {permits.ahu && (
                <span className="flex items-center gap-1.5">
                  {permits.ahuLogo ? (
                    <img src={permits.ahuLogo} alt="AHU Logo" className="h-5 w-auto object-contain inline-block rounded-sm" />
                  ) : (
                    <span>⚖️</span>
                  )}
                  <span>AHU:</span> <span className="text-slate-600 dark:text-[#A09E96] normal-case font-bold">{permits.ahu}</span>
                </span>
              )}
              {permits.nib && (
                <span className="flex items-center gap-1.5">
                  {permits.nibLogo ? (
                    <img src={permits.nibLogo} alt="NIB Logo" className="h-5 w-auto object-contain inline-block rounded-sm" />
                  ) : (
                    <span>🏢</span>
                  )}
                  <span>NIB:</span> <span className="text-slate-600 dark:text-[#A09E96] normal-case font-bold">{permits.nib}</span>
                </span>
              )}
              {permits.pse && (
                <span className="flex items-center gap-1.5">
                  {permits.pseLogo ? (
                    <img src={permits.pseLogo} alt="PSE Logo" className="h-5 w-auto object-contain inline-block rounded-sm" />
                  ) : (
                    <span>💻</span>
                  )}
                  <span>PSE:</span> <span className="text-slate-600 dark:text-[#A09E96] normal-case font-bold">{permits.pse}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Horizontal Navigation List (Theme-Safe Row) */}
        <div className="w-full flex flex-wrap gap-6 md:gap-8 justify-center text-center text-sm md:text-base font-bold text-slate-600 dark:text-[#A09E96]">
          <Link href="/about" className="hover:text-black dark:hover:text-white transition-colors">{isIndo ? "Tentang Kami" : "About Us"}</Link>
          <Link href="/terms" className="hover:text-black dark:hover:text-white transition-colors">{isIndo ? "Syarat & Ketentuan" : "Terms & Conditions"}</Link>
          <Link href="/privacy" className="hover:text-black dark:hover:text-white transition-colors">{isIndo ? "Kebijakan Privasi" : "Privacy Policy"}</Link>
          <Link href="/faq" className="hover:text-black dark:hover:text-white transition-colors">FAQ</Link>
        </div>

        {/* Partners Grid (Centered & Theme-Safe Cards) */}
        {partners.length > 0 && (
          <div className="w-full flex flex-col items-center space-y-4">
            <div className="flex flex-wrap gap-4 items-center justify-center">
              {partners.map((partner) => {
                const partnerUrl = partner.logo_url.startsWith("http")
                  ? partner.logo_url
                  : `${PUBLIC_API.partners.replace('/partners', '')}${partner.logo_url}`
                const content = (
                  <div
                    key={partner.id}
                    className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-[#FFD551] dark:hover:border-[#FFD551] transition-all p-3 rounded-2xl h-14 w-32 flex items-center justify-center cursor-pointer group shadow-sm"
                    title={partner.name}
                  >
                    <img
                      src={partnerUrl}
                      alt={partner.name}
                      className="max-h-full max-w-full object-contain filter dark:brightness-95 group-hover:scale-105 transition-all"
                    />
                  </div>
                )
                return partner.link_url ? (
                  <a href={partner.link_url} key={partner.id} target="_blank" rel="noopener noreferrer">
                    {content}
                  </a>
                ) : (
                  content
                )
              })}
            </div>
          </div>
        )}

        {/* Socials & Copyright (Centered Stack) */}
        <div className="w-full flex flex-col items-center gap-8 pt-8 border-t border-[#EAE9E4] dark:border-[#262626]">

          {/* Social Links Circle Buttons */}
          <div className="flex items-center justify-center gap-6">
            {/* Discord */}
            <a
              href={socials.discord || "https://discord.gg"}
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 w-12 rounded-full bg-[#FFD551] text-black border-2 border-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[3px_3px_0px_#000]"
              title="Discord"
            >
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
              </svg>
            </a>
            {/* X (Twitter) */}
            <a
              href={socials.x || "https://x.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 w-12 rounded-full bg-[#FFD551] text-black border-2 border-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[3px_3px_0px_#000]"
              title="X"
            >
              <svg className="h-5.5 w-5.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* Instagram */}
            <a
              href={socials.instagram || "https://instagram.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 w-12 rounded-full bg-[#FFD551] text-black border-2 border-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[3px_3px_0px_#000]"
              title="Instagram"
            >
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
            </a>
            {/* TikTok */}
            <a
              href={socials.tiktok || "https://tiktok.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 w-12 rounded-full bg-[#FFD551] text-[#000000] border-2 border-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[3px_3px_0px_#000]"
              title="TikTok"
            >
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.54-3.99-1.52A7.95 7.95 0 0 1 17 6.45v10.95c.07 4.1-2.9 8.01-7.07 8.53a8.55 8.55 0 0 1-8.52-5.46c-.95-2.73-.24-6.07 1.84-8.08a8.67 8.67 0 0 1 7.27-2.31v4.06c-1.22-.38-2.61-.17-3.63.63a4.52 4.52 0 0 0-1.43 4.88c.55 2.21 2.89 3.75 5.16 3.39a4.53 4.53 0 0 0 3.34-3.41c.21-1.07.13-2.18.13-3.28V.02z" />
              </svg>
            </a>
          </div>

          {/* Copyright text */}
          <div className="text-center space-y-2 flex flex-col items-center">
            <p className="text-xs md:text-sm font-semibold text-slate-500 dark:text-[#A09E96]">
              © {currentYear} {companyName || "PT Karya Putri Cikal"}. {isIndo ? "Hak Cipta Dilindungi Undang-Undang." : "All Rights Reserved."}
            </p>
            <p className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-[#EAE9E4]">
              Powered by <span className="text-[#FFD551]">Treetmi.id</span>
            </p>
            
            {/* Build ID Badge directly inside the block */}
            <div className="pt-1.5">
              <span className="inline-block text-[9px] font-bold font-mono tracking-wider bg-[#FFD551] text-black border border-black px-3 py-1 uppercase select-none">
                BUILD ID: treetmi-v2.6.4-prod
              </span>
            </div>

            <p className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-zinc-650 italic pt-1">
              {isIndo
                ? `Merek dagang dari ${companyName || "PT Karya Putri Cikal"}, perusahaan terdaftar di Indonesia`
                : `Trademarks of ${companyName || "PT Karya Putri Cikal"}, a registered company in Indonesia`}
            </p>
          </div>

        </div>

      </div>
    </footer>
  )
}