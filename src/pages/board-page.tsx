import { useState } from "react"
import { useParams, Navigate } from "react-router-dom"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppHeader } from "@/components/layout/app-header"
import { AppToolbar } from "@/components/layout/app-toolbar"
import { KanbanBoard } from "@/features/board/components/kanban-board"
import { useProject } from "@/features/projects/api/projects.queries"
import { Loader2 } from "lucide-react"

export default function BoardPage() {
  const { id } = useParams()
  const projectId = Number(id)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { data: project, isLoading, isError } = useProject(projectId)

  if (!id || isNaN(projectId)) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#181818]">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(true)} />
        <AppToolbar />
        <main className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 text-zinc-600 animate-spin" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <p className="text-[14px] text-zinc-400">Project not found</p>
              <p className="text-[12px] text-zinc-600">This project doesn't exist or you don't have access</p>
            </div>
          ) : (
            <KanbanBoard project={project!} />
          )}
        </main>
      </div>
    </div>
  )
}
