import React from "react"
import { Metadata } from "next"
import { PrivacyContent } from "@/components/privacy-content"
import { PUBLIC_API } from "@/lib/api"

export const metadata: Metadata = {
  title: "Kebijakan Privasi - Treetmi.id | Komitmen Perlindungan Data UU PDP",
  description: "Kebijakan Privasi resmi Treetmi.id (PT Asosiasi Karya Treetmi) sesuai ketentuan UU PDP No. 27 Tahun 2022. Perlindungan data donasi, mabar, dan informasi akun dijamin aman.",
  keywords: "kebijakan privasi treetmi, perlindungan data uu pdp, privasi donasi, aman data, pt asosiasi karya treetmi, data pribadi aman",
  openGraph: {
    title: "Kebijakan Privasi - Treetmi.id | Komitmen Perlindungan Data UU PDP",
    description: "Kebijakan Privasi resmi Treetmi.id (PT Asosiasi Karya Treetmi) sesuai ketentuan UU PDP No. 27 Tahun 2022. Perlindungan data donasi, mabar, dan informasi akun dijamin aman.",
    type: "website",
    url: "https://treetmi.id/privacy",
    siteName: "Treetmi.id",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kebijakan Privasi - Treetmi.id | Komitmen Perlindungan Data UU PDP",
    description: "Kebijakan Privasi resmi Treetmi.id (PT Asosiasi Karya Treetmi) sesuai ketentuan UU PDP No. 27 Tahun 2022. Perlindungan data donasi, mabar, dan informasi akun dijamin aman.",
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

export default async function PrivacyPage() {
  const companyName = await getCompanyName()

  return <PrivacyContent companyName={companyName} />
}
