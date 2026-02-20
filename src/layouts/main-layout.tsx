import React from "react"
import "../index.css"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="font-sans antialiased bg-background text-foreground min-h-screen">
      {children}
    </div>
  )
}
