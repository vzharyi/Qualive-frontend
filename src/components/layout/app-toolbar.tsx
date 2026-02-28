import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  Kanban,
  List,
  Calendar,
  GanttChart,
  ArrowUpDown,
  Settings2,
  User,
  AlertTriangle,
  Tag,
  Clock,
  AlignLeft,
  Github,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useParams } from "react-router-dom"
import { RepositoryPanel } from "@/features/repositories/components/repository-panel"

type ViewType = "kanban" | "list" | "calendar" | "gantt"

const views = [
  { id: "kanban" as ViewType, label: "Kanban", icon: Kanban },
  { id: "list" as ViewType, label: "List", icon: List },
  { id: "calendar" as ViewType, label: "Calendar", icon: Calendar },
  { id: "gantt" as ViewType, label: "Gantt", icon: GanttChart },
]

export function AppToolbar() {
  const [activeView, setActiveView] = useState<ViewType>("kanban")
  const [myTasksOnly, setMyTasksOnly] = useState(false)
  const [repoPanelOpen, setRepoPanelOpen] = useState(false)
  const { id } = useParams()

  return (
    <>
      {id && (
        <RepositoryPanel
          open={repoPanelOpen}
          onClose={() => setRepoPanelOpen(false)}
          projectId={Number(id)}
        />
      )}
      <div className="flex h-11 items-center justify-between border-b border-white/[0.04] bg-[#181818]/80 px-4">
        {/* Left side: View switcher */}
        <div className="flex items-center gap-0.5 rounded-lg bg-white/[0.03] border border-white/[0.06] p-0.5">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={cn(
                "flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[13px] transition-all cursor-pointer",
                activeView === view.id
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
        <div className="flex items-center gap-1.5">
          {/* My tasks filter */}
          <button
            onClick={() => setMyTasksOnly(!myTasksOnly)}
            className={cn(
              "flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer",
              myTasksOnly
                ? "bg-white/[0.08] text-white font-medium"
                : "border border-white/[0.05] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]",
            )}
          >
            <User className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">My Tasks</span>
          </button>

          {/* Priority filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-white/[0.07] text-[13px] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-all cursor-pointer">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Priority</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1e1e1e] border-white/[0.07]">
              <DropdownMenuLabel className="text-zinc-300">Filter by Priority</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              <DropdownMenuCheckboxItem checked className="text-zinc-300 focus:bg-white/[0.04]">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  High
                </span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked className="text-zinc-300 focus:bg-white/[0.04]">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Medium
                </span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked className="text-zinc-300 focus:bg-white/[0.04]">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-zinc-500" />
                  Low
                </span>
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tags filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-white/[0.07] text-[13px] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-all cursor-pointer">
                <Tag className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Tags</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1e1e1e] border-white/[0.07]">
              <DropdownMenuLabel className="text-zinc-300">Filter by Tags</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              <DropdownMenuCheckboxItem className="text-zinc-300 focus:bg-white/[0.04]">Frontend</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem className="text-zinc-300 focus:bg-white/[0.04]">Backend</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem className="text-zinc-300 focus:bg-white/[0.04]">Design</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem className="text-zinc-300 focus:bg-white/[0.04]">Bug</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem className="text-zinc-300 focus:bg-white/[0.04]">Feature</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-white/[0.07] text-[13px] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-all cursor-pointer">
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sort</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1e1e1e] border-white/[0.07]">
              <DropdownMenuLabel className="text-zinc-300">Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              <DropdownMenuItem className="text-zinc-300 focus:bg-white/[0.04]">
                <Clock className="mr-2 h-4 w-4 text-zinc-500" />
                Created Date
              </DropdownMenuItem>
              <DropdownMenuItem className="text-zinc-300 focus:bg-white/[0.04]">
                <Calendar className="mr-2 h-4 w-4 text-zinc-500" />
                Due Date
              </DropdownMenuItem>
              <DropdownMenuItem className="text-zinc-300 focus:bg-white/[0.04]">
                <AlertTriangle className="mr-2 h-4 w-4 text-zinc-500" />
                Priority
              </DropdownMenuItem>
              <DropdownMenuItem className="text-zinc-300 focus:bg-white/[0.04]">
                <AlignLeft className="mr-2 h-4 w-4 text-zinc-500" />
                Name (A-Z)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Repositories */}
          <button
            onClick={() => setRepoPanelOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
            title="GitHub Repositories"
          >
            <Github className="h-4 w-4" />
          </button>

          {/* Board settings */}
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04] transition-colors cursor-pointer">
            <Settings2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  )
}
