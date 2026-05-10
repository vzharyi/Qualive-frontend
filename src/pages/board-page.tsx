import { useState } from "react"
import { useParams, Navigate, useSearchParams } from "react-router-dom"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppHeader } from "@/components/layout/app-header"
import { AppToolbar } from "@/components/layout/app-toolbar"
import { KanbanBoard } from "@/features/board/components/kanban-board"
import { useProject } from "@/features/projects/api/projects.queries"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/features/auth/store/auth.store"

export default function BoardPage() {
  const { id } = useParams()
  const projectId = Number(id)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: project, isLoading, isError } = useProject(projectId)
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [myTasksOnly, setMyTasksOnly] = useState(false)
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string | null>(null)
  const [boardContentWidth, setBoardContentWidth] = useState<number | null>(null)

  // Handle GitHub App redirect statuses
  useEffect(() => {
    if (searchParams.get("github") === "connected") {
      toast({
        title: "GitHub App connected!",
        description: "Your repositories are now available to link.",
      })
      // Clean up URL
      setSearchParams(new URLSearchParams())
    } else if (searchParams.get("error")) {
      const error = searchParams.get("error")
      toast({
        title: "GitHub Connection Failed",
        description: error === "missing_state"
          ? "Invalid request state."
          : "Could not connect to GitHub. Please try again.",
      })
      // Clean up URL
      setSearchParams(new URLSearchParams())
    }
  }, [searchParams, setSearchParams, toast])

  // Track recently visited projects
  useEffect(() => {
    if (!projectId || isNaN(projectId)) return
    try {
      const raw = localStorage.getItem("qualive_recent_projects")
      const prev: number[] = raw ? JSON.parse(raw) : []
      const next = [projectId, ...prev.filter((r) => r !== projectId)].slice(0, 5)
      localStorage.setItem("qualive_recent_projects", JSON.stringify(next))
    } catch {}
  }, [projectId])

  if (!id || isNaN(projectId)) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#181818]">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(true)}
          projectName={project?.name}
          projectId={project?.id}
          members={project?.members}
        />
        <AppToolbar
          members={project?.members}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          myTasksOnly={myTasksOnly}
          onMyTasksChange={setMyTasksOnly}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          contentWidth={boardContentWidth}
        />
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
            <KanbanBoard
              project={project!}
              searchQuery={searchQuery}
              myTasksOnly={myTasksOnly}
              priorityFilter={priorityFilter}
              sortBy={sortBy}
              currentUserId={user?.id}
              onWidthChange={setBoardContentWidth}
            />
          )}
        </main>
      </div>
    </div>
  )
}
