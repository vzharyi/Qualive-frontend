import React from "react"
import "../index.css"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="font-sans antialiased bg-[#181818] text-white min-h-screen">
      {children}
    </div>
  )
}
