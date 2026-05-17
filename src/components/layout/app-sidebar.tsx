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
  Settings2,
  HelpCircle,
  ChevronRight,
  Inbox,
  CheckCircle2,
  Pin,
} from "lucide-react"
import { useProjects } from "@/features/projects/api/projects.queries"
import { ProjectSettingsModal } from "@/features/projects/components/project-settings-modal"
import type { Project } from "@/features/projects/types/projects.types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AppSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

// Technical palette for project indicators (OKLCH based)
const PROJECT_COLORS = [
    { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
    { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
    { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
    { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400', border: 'border-fuchsia-500/20' },
]

const getProjectColor = (id: string | number) => {
    const str = String(id);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return PROJECT_COLORS[Math.abs(hash) % PROJECT_COLORS.length];
}

function getProjectTheme(id: number) {
  const color = getProjectColor(id);
  return `${color.text} ${color.bg} ${color.border}`;
}

function NavItem({
  icon: Icon,
  label,
  to,
  active,
  badge,
}: {
  icon: any
  label: string
  to?: string
  active?: boolean
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
        <Icon className={cn("h-4 w-4 shrink-0 transition-colors", active ? "text-white" : "text-zinc-500 group-hover:text-zinc-300")} />
        <span className="text-[13px] font-medium truncate tracking-tight">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge !== undefined && (
          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] text-white border border-white/[0.1]">
            {badge}
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
  onSettings,
  avatarUrl,
}: {
  id: number
  name: string
  active: boolean
  starred: boolean
  onStar: (e: React.MouseEvent) => void
  onSettings: (e: React.MouseEvent) => void
  avatarUrl?: string | null
}) {
  const theme = getProjectTheme(id)
  
  return (
    <Link
      to={`/projects/${id}`}
      className={cn(
        "group relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all mx-0.5 w-full min-w-0",
        active 
          ? "bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]" 
          : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
      )}
    >
      <Avatar className="h-5 w-5 rounded shrink-0 overflow-hidden">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={name} className="object-cover" />}
        <AvatarFallback className={cn("h-full w-full flex items-center justify-center rounded border text-[9px] font-bold transition-transform group-hover:scale-105", theme)}>
          {name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <span className="flex-1 truncate text-[13px] font-medium tracking-tight min-w-0">
        {name.length > 20 ? `${name.slice(0, 17)}...` : name}
      </span>
      
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onSettings}
          className="p-1 opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-zinc-400 transition-all cursor-pointer"
          title="Project settings"
        >
          <Settings2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onStar}
          className={cn(
            "p-1 transition-all cursor-pointer",
            starred ? "text-amber-400" : "opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-zinc-500"
          )}
        >
          <Star className={cn("h-3.5 w-3.5", starred && "fill-amber-400")} />
        </button>
      </div>
    </Link>
  )
}

function SidebarContent({ inHoverPanel = false, onToggle }: { inHoverPanel?: boolean; onToggle: () => void }) {
  const { data: projects, isLoading } = useProjects()
  const { id: activeProjectId } = useParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [settingsProject, setSettingsProject] = useState<Project | null>(null)
  
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
  
  const displayAllProjects = useMemo(() => {
    return allProjects.filter(p => !starred.has(p.id))
  }, [allProjects, starred])

  return (
    <div className="flex flex-col h-full bg-[#131313]">
      {/* App Branding: Technical & Precise */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-white/[0.04]">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="h-8 w-8 rounded-lg border border-white/[0.08] flex items-center justify-center transition-all group-hover:border-zinc-500/50 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.02)] relative overflow-hidden">
            <img src="/logo.png" alt="Qualive Logo" className="w-6 h-6 object-contain transition-transform duration-200 group-hover:scale-110" />
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-black text-white tracking-tight leading-none uppercase">QUALIVE</span>
          </div>
        </Link>
        <button 
          onClick={onToggle} 
          className="text-zinc-700 hover:text-zinc-400 p-1.5 rounded-md hover:bg-white/[0.03] transition-all cursor-pointer group"
          title={inHoverPanel ? "Pin sidebar" : "Close sidebar"}
        >
          {inHoverPanel ? (
            <Pin className="h-4 w-4 transition-transform group-hover:scale-110" />
          ) : (
            <PanelLeftClose className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          )}
        </button>
      </div>

      {/* Primary Actions: Navigation & Search */}
      <div className="px-3 pt-5 space-y-1">
        <div className="relative group/search mb-4">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/search:text-white transition-colors">
            <Search className="h-3.5 w-3.5" />
          </div>
          <input 
            type="text" 
            placeholder="Search projects..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/[0.04] rounded-lg py-1.5 pl-9 pr-3 text-[12px] text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-white/[0.15] focus:bg-white/[0.04] transition-all"
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
        
        <NavItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" active={!activeProjectId} />
        <NavItem icon={Inbox} label="Notifications" badge="3" />
        <NavItem icon={CheckCircle2} label="My Workbench" />
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
                        onSettings={(e) => { e.preventDefault(); e.stopPropagation(); setSettingsProject(p) }}
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
              count={displayAllProjects.length}
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
                  ) : displayAllProjects.length === 0 ? (
                    <div className="px-4 py-8 text-center border border-dashed border-white/[0.03] rounded-lg mx-2">
                      <p className="text-[11px] text-zinc-600 font-medium">Empty Workspace</p>
                      <button className="mt-3 text-[10px] text-emerald-500/70 hover:text-emerald-400 font-bold uppercase tracking-wider transition-colors">
                        Initialize Project
                      </button>
                    </div>
                  ) : (
                    displayAllProjects.map(p => (
                      <ProjectItem 
                        key={p.id} 
                        {...p} 
                        active={Number(activeProjectId) === p.id} 
                        starred={starred.has(p.id)}
                        onStar={(e) => toggleStar(e, p.id)}
                        onSettings={(e) => { e.preventDefault(); e.stopPropagation(); setSettingsProject(p) }}
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
          <NavItem icon={Settings} label="System Settings" />
          <NavItem icon={HelpCircle} label="Docs & Support" />
        </div>
      </div>

      {settingsProject && (
        <ProjectSettingsModal
          open={true}
          onClose={() => setSettingsProject(null)}
          project={settingsProject}
        />
      )}
    </div>
  )
}

export function AppSidebar({ isOpen, onToggle }: AppSidebarProps) {
  const [showHoverPanel, setShowHoverPanel] = useState(false)
  const [isPinning, setIsPinning] = useState(false)

  // We no longer use useEffect to reset isPinning, to avoid race conditions during unmount
  
  return (
    <>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.aside 
            initial={isPinning ? { width: 256, opacity: 1 } : { width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={isPinning ? { duration: 0 } : { duration: 0.2, ease: "easeInOut" }}
            className="relative flex shrink-0 flex-col border-r border-white/[0.05] bg-[#131313] shadow-[1px_0_0_0_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="w-64 h-full flex flex-col">
              <SidebarContent onToggle={onToggle} />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {!isOpen && (
        <div
          className="fixed left-0 top-0 z-50 h-full w-2 transition-colors hover:bg-white/[0.03] cursor-pointer"
          onMouseEnter={() => {
            setIsPinning(false)
            setShowHoverPanel(true)
          }}
        />
      )}

      <AnimatePresence>
        {!isOpen && showHoverPanel && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30" 
              onMouseEnter={() => {
                setIsPinning(false)
                setShowHoverPanel(false)
              }} 
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={isPinning ? { opacity: 0, transition: { duration: 0 } } : { x: -260, transition: { duration: 0.2, ease: "easeInOut" } }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 flex h-full w-64 shrink-0 flex-col border-r border-white/[0.08] bg-[#131313] shadow-[10px_0_50px_rgba(0,0,0,0.8)]"
              onMouseLeave={() => {
                if (!isPinning) setShowHoverPanel(false)
              }}
            >
              <SidebarContent 
                inHoverPanel 
                onToggle={() => {
                  setIsPinning(true)
                  onToggle()
                }} 
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
