import { useState, useMemo } from "react"
import { Link, useParams } from "react-router-dom"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"
import {
  PanelLeftClose,
  Plus,
  Star,
  Search,
  LayoutDashboard,
  Loader2,
  Settings,
  HelpCircle,
  Hash,
  ChevronRight,
  Inbox,
  CheckCircle2,
} from "lucide-react"
import { useProjects } from "@/features/projects/api/projects.queries"

interface AppSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

// Technical palette for project indicators (OKLCH based)
const PROJECT_THEMES = [
  "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "text-violet-400 bg-violet-400/10 border-violet-400/20",
  "text-amber-400 bg-amber-400/10 border-amber-400/20",
  "text-rose-400 bg-rose-400/10 border-rose-400/20",
]

function getProjectTheme(id: number) {
  return PROJECT_THEMES[id % PROJECT_THEMES.length]
}

function NavItem({
  icon: Icon,
  label,
  to,
  active,
  shortcut,
  badge,
}: {
  icon: any
  label: string
  to?: string
  active?: boolean
  shortcut?: string
  badge?: string | number
}) {
  const content = (
    <div
      className={cn(
        "group flex items-center justify-between px-2.5 py-1.5 rounded-md transition-all cursor-pointer",
        active
          ? "bg-white/[0.06] text-white"
          : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon className={cn("h-4 w-4 shrink-0 transition-colors", active ? "text-emerald-400" : "group-hover:text-zinc-300")} />
        <span className="text-[13px] font-medium truncate tracking-tight">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge !== undefined && (
          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            {badge}
          </span>
        )}
        {shortcut && (
          <span className="hidden group-hover:block font-mono text-[10px] text-zinc-600 uppercase tracking-tighter">
            {shortcut}
          </span>
        )}
      </div>
    </div>
  )

  if (to) return <Link to={to} className="block">{content}</Link>
  return content
}

function SectionHeader({
  label,
  open,
  onToggle,
  onAdd,
  count
}: {
  label: string
  open: boolean
  onToggle: () => void
  onAdd?: () => void
  count?: number
}) {
  return (
    <div className="flex items-center justify-between px-2 mb-1 group/header">
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-600 hover:text-zinc-400 transition-colors"
      >
        <ChevronRight className={cn("h-3 w-3 transition-transform duration-200", open && "rotate-90")} />
        {label}
        {count !== undefined && count > 0 && (
          <span className="font-mono text-[9px] text-zinc-700 ml-1">({count})</span>
        )}
      </button>
      {onAdd && (
        <button
          onClick={(e) => { e.preventDefault(); onAdd(); }}
          className="opacity-0 group-hover/header:opacity-100 p-0.5 hover:text-white text-zinc-600 transition-all cursor-pointer"
        >
          <Plus className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

function ProjectItem({
  id,
  name,
  active,
  starred,
  onStar,
}: {
  id: number
  name: string
  active: boolean
  starred: boolean
  onStar: (e: React.MouseEvent) => void
}) {
  const theme = getProjectTheme(id)
  
  return (
    <Link
      to={`/projects/${id}`}
      className={cn(
        "group relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all mx-0.5",
        active 
          ? "bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]" 
          : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
      )}
    >
      <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[9px] font-bold transition-transform group-hover:scale-105", theme)}>
        {name.charAt(0).toUpperCase()}
      </div>
      
      <span className="flex-1 truncate text-[13px] font-medium tracking-tight">{name}</span>
      
      <div className="flex items-center gap-2">
        <button
          onClick={onStar}
          className={cn(
            "p-1 transition-all cursor-pointer",
            starred ? "text-amber-400" : "opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-zinc-500"
          )}
        >
          <Star className={cn("h-3 w-3", starred && "fill-amber-400")} />
        </button>
      </div>
    </Link>
  )
}

function SidebarContent({ inHoverPanel = false, onToggle }: { inHoverPanel?: boolean; onToggle: () => void }) {
  const { data: projects, isLoading } = useProjects()
  const { id: activeProjectId } = useParams()
  const [searchQuery, setSearchQuery] = useState("")
  
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    recents: true,
    favorites: true,
    projects: true,
  })

  const [starred, setStarred] = useState<Set<number>>(() => {
    try {
      const raw = localStorage.getItem("qualive_starred_projects")
      return raw ? new Set(JSON.parse(raw)) : new Set()
    } catch { return new Set() }
  })

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleStar = (e: React.MouseEvent, id: number) => {
    e.preventDefault()
    e.stopPropagation()
    setStarred(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem("qualive_starred_projects", JSON.stringify([...next]))
      return next
    })
  }

  const allProjects = useMemo(() => {
    const list = projects ?? []
    if (!searchQuery) return list
    const query = searchQuery.toLowerCase()
    return list.filter(p => p.name.toLowerCase().includes(query))
  }, [projects, searchQuery])

  const starredProjects = useMemo(
    () => allProjects.filter(p => starred.has(p.id)),
    [allProjects, starred]
  )
  
  const recents = useMemo(() => {
    try {
      const raw = localStorage.getItem("qualive_recent_projects")
      const ids: number[] = raw ? JSON.parse(raw) : []
      const activeId = activeProjectId ? Number(activeProjectId) : null
      
      let list = ids.flatMap(id => projects?.filter(p => p.id === id) ?? [])
      if (activeId && !list.find(p => p.id === activeId)) {
        const activeP = projects?.find(p => p.id === activeId)
        if (activeP) list = [activeP, ...list]
      }
      
      // If searching, filter recents too
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        list = list.filter(p => p.name.toLowerCase().includes(query))
      }
      
      return list.slice(0, 3)
    } catch { return [] }
  }, [projects, activeProjectId, searchQuery])

  return (
    <div className="flex flex-col h-full bg-[#131313]">
      {/* App Branding: Technical & Precise */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-white/[0.04]">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="h-8 w-8 rounded-lg border border-white/[0.08] flex items-center justify-center transition-all group-hover:border-emerald-500/50 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Hash className="h-4 w-4 text-emerald-500 stroke-[2.5px] relative z-10" />
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-black text-white tracking-tight leading-none uppercase">QUALIVE</span>
          </div>
        </Link>
        {!inHoverPanel && (
          <button 
            onClick={onToggle} 
            className="text-zinc-700 hover:text-zinc-400 p-1.5 rounded-md hover:bg-white/[0.03] transition-all cursor-pointer group"
            title="Close sidebar"
          >
            <PanelLeftClose className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          </button>
        )}
      </div>

      {/* Primary Actions: Navigation & Search */}
      <div className="px-3 pt-5 space-y-1">
        <div className="relative group/search mb-4">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/search:text-emerald-500 transition-colors">
            <Search className="h-3.5 w-3.5" />
          </div>
          <input 
            type="text" 
            placeholder="Search projects..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.05] rounded-lg py-1.5 pl-9 pr-3 text-[12px] text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/30 focus:bg-white/[0.05] transition-all"
          />
          {searchQuery ? (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:text-zinc-300 text-zinc-600 transition-colors cursor-pointer"
            >
              <Plus className="h-3 w-3 rotate-45" />
            </button>
          ) : (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[9px] text-zinc-700 border border-white/[0.05] px-1 rounded bg-white/[0.02]">
              /
            </div>
          )}
        </div>
        
        <NavItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" active={!activeProjectId} shortcut="D" />
        <NavItem icon={Inbox} label="Notifications" badge="3" shortcut="I" />
        <NavItem icon={CheckCircle2} label="My Workbench" shortcut="W" />
      </div>

      {/* Categorized Content */}
      <ScrollArea className="flex-1 mt-8">
        <div className="px-2 pb-8 space-y-7">
          
          {/* Favorites: Starred Projects */}
          {starredProjects.length > 0 && (
            <div className="space-y-1">
              <SectionHeader 
                label="Starred" 
                count={starredProjects.length}
                open={openSections.favorites} 
                onToggle={() => toggleSection("favorites")} 
              />
              <AnimatePresence initial={false}>
                {openSections.favorites && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                    className="overflow-hidden space-y-0.5"
                  >
                    {starredProjects.map(p => (
                      <ProjectItem 
                        key={p.id} 
                        {...p} 
                        active={Number(activeProjectId) === p.id} 
                        starred={true}
                        onStar={(e) => toggleStar(e, p.id)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Recents: Dynamic History */}
          {recents.length > 0 && (
            <div className="space-y-1">
              <SectionHeader 
                label="Recents" 
                count={recents.length}
                open={openSections.recents} 
                onToggle={() => toggleSection("recents")} 
              />
              <AnimatePresence initial={false}>
                {openSections.recents && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                    className="overflow-hidden space-y-0.5"
                  >
                    {recents.map(p => (
                      <ProjectItem 
                        key={p.id} 
                        {...p} 
                        active={Number(activeProjectId) === p.id} 
                        starred={starred.has(p.id)}
                        onStar={(e) => toggleStar(e, p.id)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* All Projects: Master List */}
          <div className="space-y-1">
            <SectionHeader 
              label="Projects" 
              count={allProjects.length}
              open={openSections.projects} 
              onToggle={() => toggleSection("projects")}
              onAdd={() => {}}
            />
            <AnimatePresence initial={false}>
              {openSections.projects && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                  className="overflow-hidden space-y-0.5"
                >
                  {isLoading ? (
                    <div className="py-6 flex flex-col items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-zinc-800" />
                      <span className="text-[10px] font-mono text-zinc-800 uppercase tracking-widest">Syncing</span>
                    </div>
                  ) : allProjects.length === 0 ? (
                    <div className="px-4 py-8 text-center border border-dashed border-white/[0.03] rounded-lg mx-2">
                      <p className="text-[11px] text-zinc-600 font-medium">Empty Workspace</p>
                      <button className="mt-3 text-[10px] text-emerald-500/70 hover:text-emerald-400 font-bold uppercase tracking-wider transition-colors">
                        Initialize Project
                      </button>
                    </div>
                  ) : (
                    allProjects.map(p => (
                      <ProjectItem 
                        key={p.id} 
                        {...p} 
                        active={Number(activeProjectId) === p.id} 
                        starred={starred.has(p.id)}
                        onStar={(e) => toggleStar(e, p.id)}
                      />
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </ScrollArea>

      <div className="mt-auto p-3 border-t border-white/[0.04]">
        <div className="space-y-0.5">
          <NavItem icon={Settings} label="System Settings" shortcut="," />
          <NavItem icon={HelpCircle} label="Docs & Support" />
        </div>
      </div>
    </div>
  )
}

export function AppSidebar({ isOpen, onToggle }: AppSidebarProps) {
  const [showHoverPanel, setShowHoverPanel] = useState(false)

  return (
    <>
      {isOpen && (
        <aside className="relative flex w-64 shrink-0 flex-col border-r border-white/[0.05] bg-[#131313] shadow-[1px_0_0_0_rgba(0,0,0,0.5)]">
          <SidebarContent onToggle={onToggle} />
        </aside>
      )}

      {!isOpen && (
        <div
          className="fixed left-0 top-0 z-50 h-full w-2 transition-colors hover:bg-emerald-500/5 cursor-pointer"
          onMouseEnter={() => setShowHoverPanel(true)}
        />
      )}

      {!isOpen && showHoverPanel && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]" 
            onMouseEnter={() => setShowHoverPanel(false)} 
          />
          <motion.aside
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 z-50 flex h-full w-64 shrink-0 flex-col border-r border-white/[0.08] bg-[#131313] shadow-[10px_0_50px_rgba(0,0,0,0.8)]"
            onMouseLeave={() => setShowHoverPanel(false)}
          >
            <SidebarContent inHoverPanel onToggle={onToggle} />
          </motion.aside>
        </>
      )}
    </>
  )
}
