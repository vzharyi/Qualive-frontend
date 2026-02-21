import { useState } from "react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PanelLeftClose, Plus, Star, Folder, Settings, HelpCircle, ChevronDown } from "lucide-react"

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
      <div className="flex h-14 items-center justify-between border-b border-white/[0.06] px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-black font-bold text-xs">
            Q
          </div>
          <span className="font-semibold text-white text-[15px] tracking-tight">Qualive</span>
        </div>
        {!inHoverPanel && (
          <button
            onClick={onToggle}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Create button */}
      <div className="p-3 mb-2">
        <button className="w-full flex items-center justify-start gap-2 h-9 px-3 rounded-lg bg-white/[0.04] text-zinc-300 text-[13px] font-medium hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer">
          <Plus className="h-4 w-4" />
          <span>New task</span>
        </button>
      </div>

      <ScrollArea className="flex-1 px-3">
        {/* Favorites */}
        <div className="mb-5">
          <div className="mb-2 flex items-center gap-2 px-2 text-[10px] font-medium uppercase tracking-[0.08em] text-zinc-600">
            <Star className="h-3 w-3" />
            <span>Favorites</span>
          </div>
          <div className="space-y-0.5">
            {favorites.map((item) => (
              <button
                key={item.id}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <span>{item.emoji}</span>
                <span className="truncate">{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Workspaces */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-2 text-[10px] font-medium uppercase tracking-[0.08em] text-zinc-600 mb-2">
            <Folder className="h-3 w-3" />
            <span>Workspaces</span>
          </div>
          {workspaces.map((workspace) => (
            <div key={workspace.id}>
              <button
                onClick={() => toggleWorkspace(workspace.id)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium text-zinc-300 hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-zinc-600 transition-transform duration-200",
                    !expandedWorkspaces.includes(workspace.id) && "-rotate-90",
                  )}
                />
                <span className="truncate">{workspace.name}</span>
              </button>
              {expandedWorkspaces.includes(workspace.id) && (
                <div className="ml-4 mt-0.5 space-y-0.5 border-l border-white/[0.06] pl-2.5">
                  {workspace.boards.map((board) => (
                    <button
                      key={board.id}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300 transition-colors cursor-pointer"
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
