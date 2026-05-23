"use client"

import React, { useEffect } from "react"
import { ADMIN_API, PUBLIC_API } from "@/lib/api"

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. Dynamic favicon helper
      const updateFavicon = (url: string) => {
        if (!url) return
        try {
          // Remove ALL pre-existing icon links to prevent cache/duplicate conflicts
          const existingIcons = document.querySelectorAll("link[rel*='icon']")
          existingIcons.forEach(el => el.remove())
          
          // Create main icon element
          const link = document.createElement("link")
          link.rel = "icon"
          link.type = url.startsWith("data:") ? "image/webp" : "image/x-icon"
          link.href = url
          document.getElementsByTagName("head")[0].appendChild(link)

          // Create shortcut icon element (caching-browser proof)
          const shortcut = document.createElement("link")
          shortcut.rel = "shortcut icon"
          shortcut.type = url.startsWith("data:") ? "image/webp" : "image/x-icon"
          shortcut.href = url
          document.getElementsByTagName("head")[0].appendChild(shortcut)
        } catch (e) {
          console.warn("Gagal memperbarui favicon global:", e)
        }
      }

      // 2. Load cached branding IMMEDIATELY from localStorage (zero flash)
      const cachedIcon = localStorage.getItem("treetmi_icon_url")
      if (cachedIcon && !cachedIcon.startsWith("blob:")) {
        updateFavicon(cachedIcon)
      }
      const cachedSeoTitle = localStorage.getItem("treetmi_seo_title")
      if (cachedSeoTitle) {
        document.title = cachedSeoTitle
      }

      // 3. Fetch fresh settings from public API to keep in sync (no auth needed)
      const fetchBranding = async () => {
        try {
          // Try public endpoint first (no auth required)
          const res = await fetch(PUBLIC_API.publicSettings)
          const json = await res.json()
          if (json.success && json.data) {
            const data = json.data

            // Sync SEO title dynamically — prefer fresh from API, fallback to cached
            const seoTitle = data.seoTitle || localStorage.getItem("treetmi_seo_title")
            if (seoTitle) {
              document.title = seoTitle
              localStorage.setItem("treetmi_seo_title", seoTitle)
            }

            // Inject favicon if available
            const cleanIcon = data.iconUrl && !data.iconUrl.startsWith("blob:") ? data.iconUrl : ""
            if (cleanIcon) {
              updateFavicon(cleanIcon)
              localStorage.setItem("treetmi_icon_url", cleanIcon)
            }

            // Cache company name for footer usage
            if (data.companyName) {
              localStorage.setItem("treetmi_company_name", data.companyName)
            }
          }
        } catch (err) {
          console.warn("Gagal sinkronisasi branding dari public API:", err)
        }
      }

      fetchBranding()
    }
  }, [])

  return <>{children}</>
}
