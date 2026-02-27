import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PanelLeftClose, Plus, Folder, Settings, HelpCircle, LayoutDashboard, Loader2 } from "lucide-react"
import { useProjects } from "@/features/projects/api/projects.queries"

interface AppSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function AppSidebar({ isOpen, onToggle }: AppSidebarProps) {
  const [showHoverPanel, setShowHoverPanel] = useState(false)
  const { data: projects, isLoading } = useProjects()
  const { id: activeProjectId } = useParams()

  const SidebarContent = ({ inHoverPanel = false }: { inHoverPanel?: boolean }) => (
    <>
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b border-white/[0.06] px-4">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-black font-bold text-xs">
            Q
          </div>
          <span className="font-semibold text-white text-[15px] tracking-tight">Qualive</span>
        </Link>
        {!inHoverPanel && (
          <button
            onClick={onToggle}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dashboard link */}
      <div className="p-3 mb-1">
        <Link
          to="/dashboard"
          className="w-full flex items-center gap-2 h-9 px-3 rounded-lg text-zinc-400 text-[13px] font-medium hover:bg-white/[0.04] hover:text-white transition-all"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3">
        {/* Projects */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 mb-2">
            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.08em] text-zinc-600">
              <Folder className="h-3 w-3" />
              <span>Projects</span>
            </div>
            <Link
              to="/dashboard"
              className="flex h-5 w-5 items-center justify-center rounded text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04] transition-colors"
              title="Create project"
            >
              <Plus className="h-3 w-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 text-zinc-600 animate-spin" />
            </div>
          ) : projects && projects.length > 0 ? (
            projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors",
                  activeProjectId && Number(activeProjectId) === project.id
                    ? "bg-white/[0.06] text-white"
                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200",
                )}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-emerald-400/20 to-violet-500/20 text-[10px] font-bold text-white shrink-0">
                  {project.name.charAt(0).toUpperCase()}
                </div>
                <span className="truncate">{project.name}</span>
              </Link>
            ))
          ) : (
            <p className="px-2.5 py-3 text-[12px] text-zinc-600 text-center">
              No projects yet
            </p>
          )}
        </div>
      </ScrollArea>

      {/* Bottom section */}
      <div className="border-t border-white/[0.06] p-3">
        <div className="space-y-0.5">
          <button className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300 transition-colors cursor-pointer">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
          <button className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300 transition-colors cursor-pointer">
            <HelpCircle className="h-4 w-4" />
            <span>Help</span>
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      {isOpen && (
        <aside className="relative flex w-64 flex-col border-r border-white/[0.04] bg-[#131313]">
          <SidebarContent />
        </aside>
      )}

      {!isOpen && <div className="fixed left-0 top-0 z-50 h-full w-2" onMouseEnter={() => setShowHoverPanel(true)} />}

      {!isOpen && showHoverPanel && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40 bg-black/30" onMouseEnter={() => setShowHoverPanel(false)} />
          {/* Panel */}
          <aside
            className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-white/[0.04] bg-[#131313] shadow-2xl shadow-black/50"
            onMouseLeave={() => setShowHoverPanel(false)}
          >
            <SidebarContent inHoverPanel />
          </aside>
        </>
      )}
    </>
  )
}
