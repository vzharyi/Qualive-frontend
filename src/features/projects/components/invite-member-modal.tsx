import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserPlus, Trash2, Crown, Code2, TestTube2, Users } from "lucide-react"
import { useAddMember, useRemoveMember } from "@/features/projects/api/projects.queries"
import type { ProjectMember } from "@/features/projects/types/projects.types"
import { cn } from "@/lib/utils"

const ROLES = [
  { value: "ADMIN", label: "Admin", description: "Full access", icon: Crown },
  { value: "MANAGER", label: "Manager", description: "Project lead", icon: Users },
  { value: "DEVELOPER", label: "Developer", description: "Work on tasks", icon: Code2 },
  { value: "QA", label: "QA", description: "Test & report", icon: TestTube2 },
] as const

type RoleValue = (typeof ROLES)[number]["value"]

interface InviteMemberModalProps {
  open: boolean
  onClose: () => void
  projectId: number
  members?: ProjectMember[]
  currentUserId?: number
}

export function InviteMemberModal({
  open,
  onClose,
  projectId,
  members = [],
  currentUserId,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<RoleValue>("DEVELOPER")
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const addMember = useAddMember()
  const removeMember = useRemoveMember()

  const currentMember = members.find((m) => m.userId === currentUserId)
  const isAdmin = currentMember?.role?.toUpperCase() === "ADMIN"

  const canSubmit = email.trim().includes("@") && !addMember.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    addMember.mutate(
      { projectId, data: { email: email.trim(), role } },
      {
        onSuccess: () => {
          setEmail("")
          setRole("DEVELOPER")
        },
      }
    )
  }

  const handleRemove = (userId: number) => {
    if (confirmDeleteId !== userId) {
      setConfirmDeleteId(userId)
      return
    }
    removeMember.mutate({ projectId, userId }, {
      onSuccess: () => setConfirmDeleteId(null)
    })
  }

  const handleClose = () => {
    if (addMember.isPending) return
    setEmail("")
    setRole("DEVELOPER")
    setConfirmDeleteId(null)
    addMember.reset()
    onClose()
  }

  // Clear states when modal opens
  useEffect(() => {
    if (open) {
      setEmail("")
      setRole("DEVELOPER")
      setConfirmDeleteId(null)
      addMember.reset()
    }
  }, [open])

  const getMemberInitials = (member: ProjectMember) => {
    const u = member.user
    if (!u) return "?"
    const initials = `${u.firstName?.charAt(0) || ""}${u.lastName?.charAt(0) || ""}`
    return (initials || u.login?.charAt(0) || "?").toUpperCase()
  }

  const getMemberName = (member: ProjectMember) => {
    const u = member.user
    if (!u) return `User #${member.userId}`
    if (u.firstName || u.lastName) return `${u.firstName || ""} ${u.lastName || ""}`.trim()
    return u.login || u.email || `User #${member.userId}`
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent
        className="max-w-[520px] w-full p-0 gap-0 overflow-hidden bg-[#181818] border border-white/[0.08] text-zinc-200 shadow-2xl shadow-black/50 rounded-2xl"
      >
        <DialogHeader className="p-6 pb-2 bg-[#181818]">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-white tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.1] shadow-inner">
              <Users className="h-4 w-4 text-zinc-300" />
            </div>
            Team Members
          </DialogTitle>
          <DialogDescription className="hidden" />
        </DialogHeader>

        <div className="flex flex-col bg-[#181818]">
          {/* Current Members List */}
          {members.length > 0 && (
            <div className="px-6 py-4 space-y-2 max-h-[240px] overflow-y-auto">
              {members.map((member) => {
                const isCurrentUser = member.userId === currentUserId
                const memberRole = ROLES.find((r) => r.value === member.role?.toUpperCase())
                const RoleIcon = memberRole?.icon ?? Code2

                return (
                    <div
                      key={member.userId}
                      className="grid grid-cols-[auto_1fr_110px] items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/[0.02] transition-colors group"
                    >
                      <Avatar className="h-8 w-8 ring-1 ring-white/[0.08] shrink-0">
                        {member.user?.avatarUrl && <AvatarImage src={member.user.avatarUrl} />}
                        <AvatarFallback className="bg-white/[0.05] text-zinc-300 text-[11px] font-medium">
                          {getMemberInitials(member)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[13px] font-medium text-white truncate">
                            {getMemberName(member)}
                          </p>
                          {isCurrentUser && (
                            <span className="text-[10px] bg-white/[0.08] text-zinc-300 px-1.5 py-0.5 rounded-full font-medium">you</span>
                          )}
                        </div>
                        {member.user?.email && (
                          <p className="text-[11px] text-zinc-500 truncate">{member.user.email}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-end relative">
                        <div className={cn(
                          "flex items-center gap-1 rounded-md border border-white/[0.05] bg-white/[0.02] px-2 py-0.5 transition-all duration-200",
                          isAdmin && !isCurrentUser ? "group-hover:opacity-0 group-hover:scale-95" : ""
                        )}>
                          <RoleIcon className="h-3 w-3 text-zinc-500" />
                          <span className="text-[11px] font-mono text-zinc-500 uppercase">
                            {memberRole?.label ?? member.role}
                          </span>
                        </div>

                        {isAdmin && !isCurrentUser && (
                          <button
                            onClick={() => handleRemove(member.userId)}
                            disabled={removeMember.isPending}
                            onMouseLeave={() => {
                              if (confirmDeleteId === member.userId) setConfirmDeleteId(null)
                            }}
                            className={cn(
                              "absolute right-0 h-7 flex items-center justify-center gap-1.5 rounded-md transition-all cursor-pointer disabled:pointer-events-none px-2 text-[11px] font-medium",
                              confirmDeleteId === member.userId
                                ? "w-full bg-red-500/20 text-red-400 border border-red-500/20 opacity-100 scale-100"
                                : "w-full text-red-400 bg-red-500/5 border border-red-500/10 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 hover:bg-red-500/10"
                            )}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>
                              {confirmDeleteId === member.userId ? "Confirm?" : "Remove"}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                )
              })}
            </div>
          )}

          {/* Add Member Form — Admin only */}
          {isAdmin ? (
            <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-5">
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-zinc-300">Invite by email</label>
                <Input
                  type="email"
                  autoFocus
                  placeholder="colleague@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-white/[0.02] border border-white/[0.06] text-white text-[14px] rounded-xl focus-visible:ring-1 focus-visible:ring-white/[0.15] focus-visible:border-white/[0.15] placeholder:text-zinc-600 transition-all shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-medium text-zinc-300">Role</label>
                <div className="grid grid-cols-4 gap-2.5">
                  {ROLES.map((r) => {
                    const Icon = r.icon
                    const active = role === r.value
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-lg border px-3 py-2.5 text-center transition-all duration-200 cursor-pointer",
                          active
                            ? "border-white/[0.1] bg-white/[0.08] text-zinc-200 shadow-sm"
                            : "border-transparent bg-white/[0.02] text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300"
                        )}
                      >
                        <Icon className={cn("h-4 w-4", active ? "text-zinc-300" : "opacity-60")} />
                        <span className="text-[12px] font-medium">{r.label}</span>
                        <span className="text-[10px] opacity-50">{r.description}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {addMember.isError && (
                <p className="text-[12px] text-red-400">
                  Failed to add member. Check the email and try again.
                </p>
              )}

              <DialogFooter className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="h-9 px-5 text-[13px] font-medium text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit || addMember.isPending}
                  className="h-9 px-6 text-[13px] font-medium bg-white/[0.08] text-zinc-200 border border-white/[0.05] hover:bg-white/[0.12] hover:text-white disabled:opacity-40 disabled:hover:bg-white/[0.08] rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  {addMember.isPending ? "Inviting..." : "Send Invite"}
                </button>
              </DialogFooter>
            </form>
          ) : (
            // Non-admin: just close button
            <div className="p-6 pt-2">
              <DialogFooter className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="h-9 px-5 text-[13px] font-medium text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
              </DialogFooter>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
