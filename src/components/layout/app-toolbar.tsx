import { useState } from "react"
import { useParams } from "react-router-dom"
import {
  Search,
  User,
  AlertTriangle,
  ArrowUpDown,
  Github,
  X,
  Clock,
  AlignLeft,
  Settings2,
  Link2,
  Check,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { RepositoryPanel } from "@/features/repositories/components/repository-panel"
import { useProjectRepositories } from "@/features/repositories/api/repositories.queries"
import { useProject } from "@/features/projects/api/projects.queries"
import { useAuth } from "@/features/auth/store/auth.store"
import type { ProjectMember } from "@/features/projects/types/projects.types"

type ViewType = "kanban" | "list" | "calendar"

interface AppToolbarProps {
  members?: ProjectMember[]
  searchQuery: string
  onSearchChange: (query: string) => void
  myTasksOnly: boolean
  onMyTasksChange: (only: boolean) => void
  priorityFilter: string | null
  onPriorityChange: (priority: string | null) => void
  sortBy: string | null
  onSortChange: (sort: string | null) => void
  contentWidth?: number | null
  viewMode: ViewType
  onViewModeChange: (view: ViewType) => void
}

const views: { id: ViewType; label: string; icon: any }[] = [
  { id: "kanban", label: "Board", icon: AlignLeft },
  { id: "list", label: "List", icon: AlignLeft },
]

export function AppToolbar({
  members,
  searchQuery,
  onSearchChange,
  myTasksOnly,
  onMyTasksChange,
  priorityFilter,
  onPriorityChange,
  sortBy,
  onSortChange,
  contentWidth,
  viewMode,
  onViewModeChange,
}: AppToolbarProps) {
  const [repoPanelOpen, setRepoPanelOpen] = useState(false)
  const [isSearchHovered, setIsSearchHovered] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const { id } = useParams()
  const { user } = useAuth()
  
  const { data: project } = useProject(Number(id))
  const { data: repositories } = useProjectRepositories(Number(id))
  const isConnected = repositories && repositories.length > 0
  const firstRepo = repositories?.[0]

  const currentMember = members?.find(m => m.userId === user?.id)
  const role = currentMember?.role?.toUpperCase()
  const isOwner = project?.ownerId === user?.id
  const canManageRepo = isOwner || role === 'ADMIN' || role === 'MANAGER'

  return (
    <>
      {id && (
        <RepositoryPanel
          open={repoPanelOpen}
          onClose={() => setRepoPanelOpen(false)}
          projectId={Number(id)}
          members={members}
        />
      )}
      <div className="border-b border-white/[0.04] bg-[#181818]/80 backdrop-blur-sm overflow-hidden">
        <motion.div 
          layout
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex h-11 items-center justify-between mx-auto px-12"
          style={{ maxWidth: contentWidth ? `${contentWidth}px` : "100%" }}
        >
          {/* Left side: View switcher */}
        <div className="flex items-center gap-0.5 rounded-lg bg-white/[0.03] border border-white/[0.06] p-0.5">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => onViewModeChange(view.id)}
              className={cn(
                "flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[13px] transition-all cursor-pointer",
                viewMode === view.id
                  ? "bg-white/[0.08] text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]",
              )}
            >
              <view.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{view.label}</span>
            </button>
          ))}
        </div>

        {/* Right side: Filters and settings */}
        <div className="flex items-center gap-3">
          {/* Active Filters Group */}
          <div className="flex items-center gap-1.5 pr-3 border-r border-white/[0.06]">
            {/* Search */}
            <motion.div 
              className={cn(
                "relative flex items-center overflow-hidden border-b transition-colors cursor-pointer",
                (isSearchHovered || isSearchFocused || searchQuery) ? "border-white/[0.15] focus-within:border-white/[0.3]" : "border-transparent"
              )}
              onMouseEnter={() => setIsSearchHovered(true)}
              onMouseLeave={() => setIsSearchHovered(false)}
              initial={false}
              animate={{ width: (isSearchHovered || isSearchFocused || searchQuery) ? 160 : 32 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Search className={cn(
                "absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 transition-colors duration-300 pointer-events-none",
                (isSearchHovered || isSearchFocused || searchQuery) ? "text-zinc-600" : "text-zinc-300"
              )} />
              <input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={cn(
                  "h-8 w-full bg-transparent pl-8 pr-6 text-[12px] text-white placeholder:text-zinc-600 focus:outline-none transition-all",
                  !(isSearchHovered || isSearchFocused || searchQuery) && "opacity-0"
                )}
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-1 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-md text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.05] transition-colors cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </motion.div>
          </div>

          {/* Integration & Settings Group */}
          <div className="flex items-center gap-1.5">
            {/* Repositories */}
            <button
              onClick={() => setRepoPanelOpen(true)}
              className={cn(
                "flex h-8 items-center gap-2 px-2.5 rounded-lg transition-all cursor-pointer text-[12px] font-medium",
                isConnected
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20"
                  : canManageRepo
                    ? "bg-white/[0.03] border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.15]"
                    : "hidden"
              )}
              title={isConnected ? `GitHub ID: ${firstRepo?.githubRepoId}` : "Connect GitHub Repository"}
            >
              {isConnected ? (
                <>
                  <div className="relative">
                    <Github className="h-3.5 w-3.5" />
                    <div className="absolute -right-1.5 -top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  </div>
                  <span className="hidden lg:inline">GitHub Linked</span>
                </>
              ) : (
                <>
                  <Link2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Connect Repository</span>
                </>
              )}
            </button>

            {/* Board settings */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "flex h-8 items-center justify-center rounded-lg transition-all cursor-pointer border",
                  (myTasksOnly || priorityFilter || sortBy)
                    ? "px-2.5 gap-2 bg-white/[0.08] text-white border-white/[0.15] shadow-sm"
                    : "w-8 bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.15]"
                )}>
                  <Settings2 className="h-4 w-4" />
                  {(myTasksOnly || priorityFilter || sortBy) && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-px h-3 bg-white/20" />
                      <span className="text-[10px] font-bold font-mono uppercase tracking-wider">
                        {[myTasksOnly, !!priorityFilter, !!sortBy].filter(Boolean).length}
                      </span>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 bg-[#1e1e1e] border-white/[0.07] p-1.5">
                {(myTasksOnly || priorityFilter || sortBy) && (
                  <>
                    <div className="p-1">
                      <DropdownMenuItem
                        onClick={() => {
                          onMyTasksChange(false);
                          onPriorityChange(null);
                          onSortChange(null);
                        }}
                        onSelect={(e) => e.preventDefault()}
                        className="flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer group bg-red-500/[0.08] text-red-400 border border-red-500/20 hover:bg-red-500/15 focus:bg-red-500/15 focus:text-red-400"
                      >
                        <div className="flex items-center gap-3">
                          <X className="h-3.5 w-3.5" />
                          <span className="text-[11px] font-bold uppercase tracking-wider">Reset Filters</span>
                        </div>
                        <span className="text-[9px] font-mono opacity-60">ESC</span>
                      </DropdownMenuItem>
                    </div>
                    <div className="h-px bg-white/[0.04] my-1 mx-1" />
                  </>
                )}
                <div className="flex flex-col gap-1 p-1">
                  <div className="flex items-center justify-between px-2.5 py-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] font-mono">Tasks & Filters</span>
                    <div className="h-px flex-1 ml-4 bg-white/[0.04]" />
                  </div>
                  
                  <DropdownMenuItem
                    onClick={() => onMyTasksChange(!myTasksOnly)}
                    onSelect={(e) => e.preventDefault()}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer group border",
                      myTasksOnly 
                        ? "border-white/[0.1] bg-white/[0.08] text-zinc-200 shadow-sm focus:bg-white/[0.08] focus:text-zinc-200" 
                        : "border-transparent text-zinc-400 hover:bg-white/[0.03] focus:bg-white/[0.03] hover:text-zinc-200 focus:text-zinc-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-6 w-6 items-center justify-center rounded border transition-colors",
                        myTasksOnly ? "border-white/30 bg-white/10" : "border-white/[0.08] bg-white/[0.02] group-hover:border-white/[0.12]"
                      )}>
                        <User className={cn("h-3 w-3", myTasksOnly ? "text-white" : "text-zinc-500")} />
                      </div>
                      <span className="text-[13px] font-medium">Show Only My Tasks</span>
                    </div>
                    {myTasksOnly ? (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white text-[#181818]">ON</span>
                    ) : (
                      <span className="text-[9px] font-mono text-zinc-600 group-hover:text-zinc-400 px-1.5">OFF</span>
                    )}
                  </DropdownMenuItem>
                </div>

                <div className="flex flex-col gap-1 p-1">
                  <div className="flex items-center justify-between px-2.5 py-2 mt-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] font-mono">Priority Filter</span>
                    <div className="h-px flex-1 ml-4 bg-white/[0.04]" />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-1">
                    {[
                      { id: null, label: "All Priorities", icon: null },
                      { id: "HIGH", label: "High Priority", color: "bg-red-500" },
                      { id: "MEDIUM", label: "Medium Priority", color: "bg-amber-500" },
                      { id: "LOW", label: "Low Priority", color: "bg-zinc-500" },
                    ].map((p) => (
                      <DropdownMenuItem
                        key={String(p.id)}
                        onClick={() => onPriorityChange(p.id)}
                        onSelect={(e) => e.preventDefault()}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer group border",
                          priorityFilter === p.id 
                            ? "border-white/[0.1] bg-white/[0.08] text-zinc-200 shadow-sm focus:bg-white/[0.08] focus:text-zinc-200" 
                            : "border-transparent text-zinc-400 hover:bg-white/[0.03] focus:bg-white/[0.03] hover:text-zinc-200 focus:text-zinc-200"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "flex h-2 w-2 rounded-full",
                            p.color || (priorityFilter === p.id ? "bg-white" : "bg-zinc-700")
                          )} />
                          <span className="text-[13px] font-medium">{p.label}</span>
                        </div>
                        {priorityFilter === p.id && (
                          <div className="flex items-center h-4 w-4 justify-center rounded-full bg-white/20 border border-white/30">
                            <Check className="h-2.5 w-2.5 text-white" />
                          </div>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1 p-1">
                  <div className="flex items-center justify-between px-2.5 py-2 mt-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] font-mono">Sorting</span>
                    <div className="h-px flex-1 ml-4 bg-white/[0.04]" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { id: null, label: "Default", icon: ArrowUpDown },
                      { id: "created", label: "Date", icon: Clock },
                      { id: "priority", label: "Priority", icon: AlertTriangle },
                      { id: "name", label: "A-Z Name", icon: AlignLeft },
                    ].map((s) => (
                      <DropdownMenuItem
                        key={String(s.id)}
                        onClick={() => onSortChange(s.id)}
                        onSelect={(e) => e.preventDefault()}
                        className={cn(
                          "flex flex-col items-start justify-between p-3 rounded-lg transition-all cursor-pointer group border gap-2",
                          sortBy === s.id 
                            ? "border-white/[0.1] bg-white/[0.08] text-zinc-200 shadow-sm focus:bg-white/[0.08] focus:text-zinc-200" 
                            : "border-transparent text-zinc-400 hover:bg-white/[0.03] focus:bg-white/[0.03] hover:text-zinc-200 focus:text-zinc-200"
                        )}
                      >
                        <s.icon className={cn("h-4 w-4", sortBy === s.id ? "text-white" : "text-zinc-500 group-hover:text-zinc-400")} />
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold uppercase tracking-wider">{s.label}</span>
                          {sortBy === s.id ? (
                            <span className="text-[9px] font-mono text-white/70">ACTIVE</span>
                          ) : (
                            <span className="text-[9px] font-mono text-zinc-600 group-hover:text-zinc-500 uppercase">Order</span>
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}
