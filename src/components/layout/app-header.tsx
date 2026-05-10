import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, ChevronRight, UserPlus, PanelLeft, LogOut, Users, Hash, User } from "lucide-react"
import { useAuth } from "@/features/auth/store/auth.store"
import { InviteMemberModal } from "@/features/projects/components/invite-member-modal"
import { ProfileModal } from "@/features/users/components/profile-modal"
import { useMe } from "@/features/users/api/users.queries"
import type { ProjectMember } from "@/features/projects/types/projects.types"

interface AppHeaderProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
  projectName?: string
  projectId?: number
  members?: ProjectMember[]
}

export function AppHeader({
  sidebarOpen,
  onToggleSidebar,
  projectName,
  projectId,
  members,
}: AppHeaderProps) {
  const { user: authUser, logout } = useAuth()
  const { data: me } = useMe()
  const user = me || authUser
  const navigate = useNavigate()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const userInitials = user
    ? (`${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}` || user.login?.charAt(0) || "?").toUpperCase()
    : "?"

  const userDisplayName = user
    ? user.firstName || user.lastName
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : user.login || "User"
    : "User"

  return (
    <>
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />

      {projectId && (
        <InviteMemberModal
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
          projectId={projectId}
          members={members}
          currentUserId={user?.id}
        />
      )}

      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.03] bg-[#181818]/90 backdrop-blur-xl px-6">
        {/* Left side: Contextual Breadcrumbs */}
        <div className="flex items-center gap-3">
          {!sidebarOpen && (
            <button
              onClick={onToggleSidebar}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-all cursor-pointer border border-transparent hover:border-white/[0.1] shadow-sm"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          )}

          <nav className="flex items-center gap-2 text-[13px]">
            <Link to="/dashboard" className="text-zinc-500 hover:text-zinc-300 transition-colors font-medium">
              Dashboard
            </Link>
            {projectName && (
              <>
                <ChevronRight className="h-3 w-3 text-zinc-700" />
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.05]">
                  <Hash className="h-3 w-3 text-zinc-600" />
                  <span className="text-zinc-200 font-mono font-bold tracking-tight">{projectName.toUpperCase()}</span>
                </div>
              </>
            )}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
        {/* Team / Invite Group */}
        {projectId && (
          <div 
            onClick={() => setInviteOpen(true)}
            className="group flex items-center gap-2 h-9 px-1.5 pl-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.15] transition-all cursor-pointer"
          >
            {/* Avatars Stack */}
            {members && members.length > 0 && (
              <div className="flex items-center -space-x-2 mr-1">
                {members.slice(0, 3).map((m) => {
                  const initials = m.user
                    ? (`${m.user.firstName?.charAt(0) || ""}${m.user.lastName?.charAt(0) || ""}` || m.user.login?.charAt(0) || "?").toUpperCase()
                    : "?"
                  return (
                    <Avatar key={m.userId} className="h-6 w-6 ring-2 ring-[#181818] transition-transform group-hover:scale-105">
                      {m.user?.avatarUrl && <AvatarImage src={m.user.avatarUrl} />}
                      <AvatarFallback className="bg-zinc-800 text-zinc-300 text-[9px] font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  )
                })}
                {members.length > 3 && (
                  <div className="h-6 w-6 rounded-full ring-2 ring-[#181818] bg-zinc-800 flex items-center justify-center text-[9px] text-zinc-400 font-bold group-hover:scale-105 transition-transform">
                    +{members.length - 3}
                  </div>
                )}
              </div>
            )}

            <div className="h-4 w-px bg-white/[0.08] mx-0.5" />

            {/* Label / Invite Button */}
            <div className="flex items-center gap-1.5 px-1.5 py-1">
              {members?.find(m => m.userId === user?.id)?.role?.toUpperCase() === 'ADMIN' ? (
                <>
                  <UserPlus className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="text-[13px] font-medium text-zinc-300 group-hover:text-white transition-colors">Invite</span>
                </>
              ) : (
                <>
                  <Users className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-300" />
                  <span className="text-[13px] font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">Team</span>
                </>
              )}
            </div>
          </div>
        )}

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer">
                <Bell className="h-[18px] w-[18px]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-popover border-border">
              <DropdownMenuLabel className="text-foreground">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <div className="px-2 py-6 text-center text-[13px] text-muted-foreground">
                No new notifications
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-9 w-9 rounded-full p-0 cursor-pointer focus:outline-none">
                <Avatar className="h-9 w-9 ring-1 ring-white/[0.08]">
                  {user?.avatarUrl && <AvatarImage src={user.avatarUrl} />}
                  <AvatarFallback className="bg-zinc-800 text-zinc-300 text-[11px] font-medium">{userInitials}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#1e1e1e] border-white/[0.08] p-1.5 shadow-2xl shadow-black/50 rounded-xl">
              <div className="px-2.5 py-2">
                <p className="text-[13px] font-medium text-white">{userDisplayName}</p>
                {user?.email && <p className="text-[11px] text-zinc-500 font-normal truncate">{user.email}</p>}
              </div>
              <div className="h-px bg-white/[0.04] my-1 mx-1" />
              <DropdownMenuItem 
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-400 focus:bg-white/[0.03] focus:text-zinc-200 cursor-pointer transition-colors"
                onClick={() => setProfileOpen(true)}
              >
                <User className="h-3.5 w-3.5 text-zinc-500" />
                <span className="text-[13px]">Profile</span>
              </DropdownMenuItem>
              <div className="h-px bg-white/[0.04] my-1 mx-1" />
              <DropdownMenuItem
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 focus:bg-red-500/[0.08] focus:text-red-400 cursor-pointer transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="text-[13px]">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  )
}
