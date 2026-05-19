import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Treetmi Widget Alert",
  description: "OBS Browser Source Alert Overlay",
}

export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ margin: 0, padding: 0, background: "transparent", overflow: "hidden", position: "fixed", inset: 0 }}>
      {children}
    </div>
  )
}
