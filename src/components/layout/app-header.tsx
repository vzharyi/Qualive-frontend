import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      {/* Left side: Toggle button, Breadcrumbs and title */}
      <div className="flex items-center gap-2">
        {!sidebarOpen && (
          <Button variant="ghost" size="icon" className="mr-2 h-8 w-8" onClick={onToggleSidebar}>
            <PanelLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-sm">
          <span className="text-muted-foreground hover:text-foreground cursor-pointer">Workspace</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground hover:text-foreground cursor-pointer">Marketing</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </nav>

        {/* Editable title */}
        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <Input
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              className="h-8 w-48 text-lg font-semibold"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveTitle()
                if (e.key === "Escape") handleCancelEdit()
              }}
            />
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSaveTitle}>
              <Check className="h-4 w-4 text-primary" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCancelEdit}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditingTitle(true)}
            className="group flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent"
          >
            <h1 className="text-lg font-semibold">{boardTitle}</h1>
            <Pencil className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        )}
      </div>

      {/* Right side: Search, members, notifications, profile */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search tasks..." className="h-9 w-64 bg-secondary pl-9" />
        </div>

        {/* Board members */}
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {boardMembers.slice(0, 4).map((member) => (
              <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <Button size="sm" variant="outline" className="ml-2 h-8 gap-1 bg-transparent">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Invite</span>
          </Button>
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">New comment</span>
              <span className="text-sm text-muted-foreground">Maria commented on "Banner Design"</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">Deadline approaching</span>
              <span className="text-sm text-muted-foreground">"Prepare report" is due tomorrow</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">Task assigned</span>
              <span className="text-sm text-muted-foreground">You were assigned "Code Review"</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
              <Avatar className="h-9 w-9">
                <AvatarImage src="/professional-man-avatar.png" />
                <AvatarFallback>AK</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
