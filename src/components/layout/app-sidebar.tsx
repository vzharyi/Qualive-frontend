import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PanelLeftClose, Plus, Star, Folder, Settings, HelpCircle, LayoutDashboard, ChevronDown } from "lucide-react"

const workspaces = [
  {
    id: "1",
    name: "Marketing",
    boards: [
      { id: "1-1", name: "SMM Campaigns", emoji: "📱" },
      { id: "1-2", name: "Content Plan", emoji: "📝" },
      { id: "1-3", name: "Analytics", emoji: "📊" },
    ],
  },
  {
    id: "2",
    name: "Development",
    boards: [
      { id: "2-1", name: "Sprint #24", emoji: "🚀" },
      { id: "2-2", name: "Bugs", emoji: "🐛" },
    ],
  },
  {
    id: "3",
    name: "Design",
    boards: [
      { id: "3-1", name: "UI Kit", emoji: "🎨" },
      { id: "3-2", name: "Rebranding", emoji: "✨" },
    ],
  },
]

const favorites = [
  { id: "fav-1", name: "Sprint #24", emoji: "🚀" },
  { id: "fav-2", name: "SMM Campaigns", emoji: "📱" },
]

interface AppSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function AppSidebar({ isOpen, onToggle }: AppSidebarProps) {
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<string[]>(["1"])
  const [showHoverPanel, setShowHoverPanel] = useState(false)

  const toggleWorkspace = (id: string) => {
    setExpandedWorkspaces((prev) => (prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]))
  }

  const SidebarContent = ({ inHoverPanel = false }: { inHoverPanel?: boolean }) => (
    <>
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sidebar-foreground">TaskFlow</span>
        </div>
        {!inHoverPanel && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={onToggle}
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Create button */}
      <div className="p-3">
        <Button className="w-full justify-start gap-2" variant="default">
          <Plus className="h-4 w-4" />
          <span>Create</span>
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3">
        {/* Favorites */}
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Star className="h-3 w-3" />
            <span>Favorites</span>
          </div>
          <div className="space-y-1">
            {favorites.map((item) => (
              <button
                key={item.id}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <span>{item.emoji}</span>
                <span className="truncate">{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Workspaces */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Folder className="h-3 w-3" />
            <span>Workspaces</span>
          </div>
          {workspaces.map((workspace) => (
            <div key={workspace.id}>
              <button
                onClick={() => toggleWorkspace(workspace.id)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    !expandedWorkspaces.includes(workspace.id) && "-rotate-90",
                  )}
                />
                <span className="truncate">{workspace.name}</span>
              </button>
              {expandedWorkspaces.includes(workspace.id) && (
                <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-2">
                  {workspace.boards.map((board) => (
                    <button
                      key={board.id}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    >
                      <span>{board.emoji}</span>
                      <span className="truncate">{board.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Bottom section */}
      <div className="border-t border-sidebar-border p-3">
        <div className="space-y-1">
          <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
          <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground">
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
        <aside className="relative flex w-64 flex-col border-r border-sidebar-border bg-sidebar">
          <SidebarContent />
        </aside>
      )}

      {!isOpen && <div className="fixed left-0 top-0 z-50 h-full w-2" onMouseEnter={() => setShowHoverPanel(true)} />}

      {!isOpen && showHoverPanel && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40 bg-black/20" onMouseEnter={() => setShowHoverPanel(false)} />
          {/* Panel */}
          <aside
            className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar shadow-2xl"
            onMouseLeave={() => setShowHoverPanel(false)}
          >
            <SidebarContent inHoverPanel />
          </aside>
        </>
      )}
    </>
  )
}
