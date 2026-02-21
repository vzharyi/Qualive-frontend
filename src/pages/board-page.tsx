import { useState } from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppHeader } from "@/components/layout/app-header"
import { AppToolbar } from "@/components/layout/app-toolbar"
import { KanbanBoard } from "@/features/board/components/kanban-board"

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen overflow-hidden bg-[#181818]">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(true)} />
        <AppToolbar />
        <main className="flex-1 overflow-hidden">
          <KanbanBoard />
        </main>
      </div>
    </div>
  )
}
