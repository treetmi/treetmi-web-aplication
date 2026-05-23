"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShieldCheck, Heart, Sparkles, HelpCircle } from "lucide-react"
import axios from "axios"
import { PUBLIC_API } from "@/lib/api"
import { usePathname } from "next/navigation"

interface FeedItem {
  id: string
  sender_name: string
  amount: number
  type: string
  streamer_username: string
  streamer_avatar: string | null
  createdAt: string
}

export default function LiveDonationFeed() {
  const pathname = usePathname()
  
  if (pathname && (pathname.startsWith("/superadmin") || pathname.startsWith("/dashboard"))) {
    return null
  }

  const [feedList, setFeedList] = useState<FeedItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentItem, setCurrentItem] = useState<FeedItem | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Fetch recent donation feed periodically
  useEffect(() => {
    async function fetchFeed() {
      try {
        const res = await axios.get(PUBLIC_API.recentFeed)
        if (res.data?.success && Array.isArray(res.data?.data)) {
          const list = res.data.data
          setFeedList(list)
          if (list.length > 0) {
            // Pick first item if not currently showing
            if (!currentItem) {
              setCurrentItem(list[0])
              setCurrentIndex(0)
              setIsVisible(true)
            }
          } else {
            setIsVisible(false)
            setCurrentItem(null)
          }
        }
      } catch (err) {
        console.warn("Failed to fetch recent donation feed:", err)
      }
    }

    fetchFeed()
    const interval = setInterval(fetchFeed, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [currentItem])

  // Cycle through feed items
  useEffect(() => {
    if (feedList.length <= 1) return

    const cycleInterval = setInterval(() => {
      setIsVisible(false) // Trigger exit animation

      setTimeout(() => {
        const nextIndex = (currentIndex + 1) % feedList.length
        setCurrentIndex(nextIndex)
        setCurrentItem(feedList[nextIndex])
        setIsVisible(true) // Trigger enter animation
      }, 800) // Wait for exit animation to complete

    }, 8000) // Stay on screen for 8s

    return () => clearInterval(cycleInterval)
  }, [feedList, currentIndex])

  // Formatter for Currency
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num)
  }

  // Formatter for Relative Time
  const getRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMin = Math.floor(diffMs / 60000)

      if (diffMin < 1) return "baru saja"
      if (diffMin < 60) return `${diffMin}m yang lalu`

      const diffHrs = Math.floor(diffMin / 60)
      if (diffHrs < 24) return `${diffHrs}j yang lalu`

      const diffDays = Math.floor(diffHrs / 24)
      return `${diffDays} hari yang lalu`
    } catch (e) {
      return "baru saja"
    }
  }

  if (!currentItem) return null

  // Helper for type message
  const getTypeMessage = (type: string) => {
    if (type === "MABAR") return "berlangganan mabar"
    if (type === "GIFT") return "mengirimkan gift"
    return "mendukung"
  }

  // Creator avatar fallback
  let creatorAvatar = currentItem.streamer_avatar
  if (!creatorAvatar) {
    let sum = 0
    for (let i = 0; i < currentItem.streamer_username.length; i++) {
      sum += currentItem.streamer_username.charCodeAt(i)
    }
    creatorAvatar = `/avatars/avatar-${(sum % 8) + 1}.svg`
  }

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-[340px] select-none pointer-events-none">
      <AnimatePresence>
        {isVisible && currentItem && (
          <motion.div
            initial={{ x: -100, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-950/90 border border-neutral-800/80 shadow-2xl backdrop-blur-md relative overflow-hidden group hover:border-[#FFD551]/30 transition-all duration-300"
          >
            {/* Glowing left strip */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#FFD551] to-yellow-600 shadow-[0_0_10px_#FFD551]" />

            {/* Creator Avatar */}
            <div className="relative flex-shrink-0 h-10 w-10 rounded-xl border border-neutral-800 overflow-hidden bg-neutral-900 flex items-center justify-center">
              <img
                src={creatorAvatar}
                alt="Creator Avatar"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/avatars/avatar-1.svg"
                }}
              />
            </div>

            {/* Notification Details */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-bold text-[#FFD551] tracking-wider uppercase">Social Proof</span>
                <span className="text-[9px] text-neutral-500">•</span>
                <span className="text-[9px] text-neutral-400 capitalize">{getRelativeTime(currentItem.createdAt)}</span>
              </div>
              <p className="text-xs text-neutral-200 leading-normal font-medium">
                <span className="font-bold text-white tracking-wide">{currentItem.sender_name}</span>{" "}
                {getTypeMessage(currentItem.type)}{" "}
                <span className="font-bold text-[#FFD551]">@{currentItem.streamer_username}</span>
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs font-bold text-white">
                  {formatIDR(currentItem.amount)}
                </span>
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Verified by Treetmi</span>
                </div>
              </div>
            </div>

            {/* Heart Decor */}
            <div className="absolute right-2 top-2 opacity-10 text-[#FFD551]">
              <Heart className="h-4 w-4 fill-current" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
