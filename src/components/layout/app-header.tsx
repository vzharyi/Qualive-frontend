import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Bell, ChevronRight, UserPlus, Pencil, Check, X, PanelLeft } from "lucide-react"

const boardMembers = [
  { id: "1", name: "Alex K.", avatar: "/man-face-avatar-1.jpg" },
  { id: "2", name: "Maria S.", avatar: "/woman-face-avatar-1.jpg" },
  { id: "3", name: "Dmitry V.", avatar: "/man-face-avatar-2.jpg" },
  { id: "4", name: "Anna P.", avatar: "/woman-face-avatar-2.png" },
]

interface AppHeaderProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function AppHeader({ sidebarOpen, onToggleSidebar }: AppHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [boardTitle, setBoardTitle] = useState("SMM Campaigns")
  const [tempTitle, setTempTitle] = useState(boardTitle)

  const handleSaveTitle = () => {
    setBoardTitle(tempTitle)
    setIsEditingTitle(false)
  }

  const handleCancelEdit = () => {
    setTempTitle(boardTitle)
    setIsEditingTitle(false)
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-white/[0.04] bg-[#181818]/90 backdrop-blur-md px-4">
      {/* Left side */}
      <div className="flex items-center gap-2">
        {!sidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="mr-2 flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        )}

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-sm">
          <span className="text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors">Workspace</span>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-700" />
          <span className="text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors">Marketing</span>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-700" />
        </nav>

        {/* Editable title */}
        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <input
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              className="h-8 w-48 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 text-base font-semibold text-white focus:outline-none focus:border-emerald-500/40 transition-colors"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveTitle()
                if (e.key === "Escape") handleCancelEdit()
              }}
            />
            <button onClick={handleSaveTitle} className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-white/[0.04] transition-colors cursor-pointer">
              <Check className="h-4 w-4 text-emerald-400" />
            </button>
            <button onClick={handleCancelEdit} className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-white/[0.04] transition-colors cursor-pointer">
              <X className="h-4 w-4 text-zinc-500" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditingTitle(true)}
            className="group flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <h1 className="text-base font-semibold text-white">{boardTitle}</h1>
            <Pencil className="h-3 w-3 text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
          <input
            placeholder="Search tasks..."
            className="h-9 w-56 rounded-lg border border-white/[0.07] bg-white/[0.03] pl-9 pr-3 text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/40 focus:bg-white/[0.05] transition-all"
          />
        </div>

        {/* Board members */}
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {boardMembers.slice(0, 4).map((member) => (
              <Avatar key={member.id} className="h-7 w-7 border-2 border-[#181818] ring-1 ring-white/[0.04]">
                <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                <AvatarFallback className="text-[10px] bg-zinc-800 text-zinc-400">{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <button className="ml-2 flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-white/[0.07] bg-transparent text-[13px] text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300 transition-colors cursor-pointer">
            <UserPlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Invite</span>
          </button>
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-colors cursor-pointer">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-black">
                3
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-[#1e1e1e] border-white/[0.07]">
            <DropdownMenuLabel className="text-zinc-300">Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/[0.06]" />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 focus:bg-white/[0.04]">
              <span className="font-medium text-zinc-200">New comment</span>
              <span className="text-[13px] text-zinc-500">Maria commented on "Banner Design"</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 focus:bg-white/[0.04]">
              <span className="font-medium text-zinc-200">Deadline approaching</span>
              <span className="text-[13px] text-zinc-500">"Prepare report" is due tomorrow</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 focus:bg-white/[0.04]">
              <span className="font-medium text-zinc-200">Task assigned</span>
              <span className="text-[13px] text-zinc-500">You were assigned "Code Review"</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-9 w-9 rounded-full p-0 cursor-pointer">
              <Avatar className="h-9 w-9 ring-1 ring-white/[0.08]">
                <AvatarImage src="/professional-man-avatar.png" />
                <AvatarFallback className="bg-zinc-800 text-zinc-400">AK</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#1e1e1e] border-white/[0.07]">
            <DropdownMenuLabel className="text-zinc-300">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/[0.06]" />
            <DropdownMenuItem className="text-zinc-400 focus:bg-white/[0.04] focus:text-zinc-200">Profile</DropdownMenuItem>
            <DropdownMenuItem className="text-zinc-400 focus:bg-white/[0.04] focus:text-zinc-200">Settings</DropdownMenuItem>
            <DropdownMenuItem className="text-zinc-400 focus:bg-white/[0.04] focus:text-zinc-200">Billing</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/[0.06]" />
            <DropdownMenuItem className="text-red-400 focus:bg-red-500/10 focus:text-red-300">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
