"use client"

import React from "react"
import { useParams } from "next/navigation"
import { CreatorProfileView } from "@/components/creator-profile-view"

export default function ProfilePage() {
  const { username } = useParams()

  return (
    <main className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#141414] transition-colors duration-300">
      <CreatorProfileView username={username} />
    </main>
  )
}
