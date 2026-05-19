"use client"

import React from "react"
import { useParams } from "next/navigation"
import { CreatorProfileView } from "@/components/creator-profile-view"

export default function ProfilePage() {
  const { username } = useParams()

  // Extract username from params
  const activeUsername = typeof username === "string" ? username : Array.isArray(username) ? username[0] : "budigamer"

  return (
    <main className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#141414] transition-colors duration-300">
      <CreatorProfileView username={activeUsername} />
    </main>
  )
}
