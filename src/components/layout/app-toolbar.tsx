import { useState } from "react"
import { Button } from "@/components/ui/button"
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
} from "lucide-react"
import { cn } from "@/lib/utils"

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

  return (
    <div className="flex h-12 items-center justify-between border-b border-border bg-card/50 px-4">
      {/* Left side: View switcher */}
      <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
        {views.map((view) => (
          <Button
            key={view.id}
            variant="ghost"
            size="sm"
            onClick={() => setActiveView(view.id)}
            className={cn(
              "h-7 gap-1.5 px-3 text-muted-foreground",
              activeView === view.id && "bg-background text-foreground shadow-sm",
            )}
          >
            <view.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{view.label}</span>
          </Button>
        ))}
      </div>

      {/* Right side: Filters and settings */}
      <div className="flex items-center gap-2">
        {/* My tasks filter */}
        <Button
          variant={myTasksOnly ? "default" : "outline"}
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => setMyTasksOnly(!myTasksOnly)}
        >
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">My Tasks</span>
        </Button>

        {/* Priority filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 bg-transparent">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Priority</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-destructive" />
                High
              </span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-warning" />
                Medium
              </span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                Low
              </span>
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tags filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 bg-transparent">
              <Tag className="h-4 w-4" />
              <span className="hidden sm:inline">Tags</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Tags</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem>Frontend</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Backend</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Design</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Bug</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Feature</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 bg-transparent">
              <ArrowUpDown className="h-4 w-4" />
              <span className="hidden sm:inline">Sort</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Clock className="mr-2 h-4 w-4" />
              Created Date
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Calendar className="mr-2 h-4 w-4" />
              Due Date
            </DropdownMenuItem>
            <DropdownMenuItem>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Priority
            </DropdownMenuItem>
            <DropdownMenuItem>
              <AlignLeft className="mr-2 h-4 w-4" />
              Name (A-Z)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Board settings */}
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Settings2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
