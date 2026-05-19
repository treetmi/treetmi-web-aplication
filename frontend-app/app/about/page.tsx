import React from "react"
import { Metadata } from "next"
import { AboutContent } from "@/components/about-content"
import { PUBLIC_API } from "@/lib/api"

export const metadata: Metadata = {
  title: "Tentang Kami - Treetmi.id | Platform Dukungan Kreator Terbesar Indonesia",
  description: "Kenali Treetmi.id (PT Asosiasi Karya Treetmi), platform all-in-one terpercaya untuk donasi, jasa mabar, dan monetisasi karya digital streamer, gamer, dan artis di Indonesia.",
  keywords: "tentang treetmi, profile treetmi, creator platform indonesia, pt asosiasi karya treetmi, donasi streamer, mabar indonesia",
  openGraph: {
    title: "Tentang Kami - Treetmi.id | Platform Dukungan Kreator Terbesar Indonesia",
    description: "Kenali Treetmi.id (PT Asosiasi Karya Treetmi), platform all-in-one terpercaya untuk donasi, jasa mabar, dan monetisasi karya digital streamer, gamer, dan artis di Indonesia.",
    type: "website",
    url: "https://treetmi.id/about",
    siteName: "Treetmi.id",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tentang Kami - Treetmi.id | Platform Dukungan Kreator Terbesar Indonesia",
    description: "Kenali Treetmi.id (PT Asosiasi Karya Treetmi), platform all-in-one terpercaya untuk donasi, jasa mabar, dan monetisasi karya digital streamer, gamer, dan artis di Indonesia.",
  }
}

async function getCompanyName() {
  try {
    const res = await fetch(PUBLIC_API.publicSettings, { next: { revalidate: 3600 } })
    const json = await res.json()
    if (json.success && json.data?.companyName) {
      return json.data.companyName
    }
  } catch (e) {
    console.error("Error fetching companyName on server side:", e)
  }
  return "PT Asosiasi Karya Treetmi"
}

export default async function AboutPage() {
  const companyName = await getCompanyName()

  return <AboutContent companyName={companyName} />
}
