import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Settings2,
  Trash2,
  TriangleAlert,
  Loader2,
  Camera,
} from "lucide-react"
import { useUpdateProject, useDeleteProject, useUploadProjectAvatar } from "@/features/projects/api/projects.queries"
import type { Project } from "@/features/projects/types/projects.types"
import { cn } from "@/lib/utils"

interface ProjectSettingsModalProps {
  open: boolean
  onClose: () => void
  project: Project
}

type Tab = "general" | "danger"

export function ProjectSettingsModal({ open, onClose, project }: ProjectSettingsModalProps) {
  const navigate = useNavigate()
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()
  const uploadProjectAvatar = useUploadProjectAvatar()

  // General fields
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description ?? "")
  const [avatarUrl, setAvatarUrl] = useState(project.avatarUrl ?? "")
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Tab
  const [tab, setTab] = useState<Tab>("general")

  // Delete confirmation
  const [deleteConfirmName, setDeleteConfirmName] = useState("")
  const [isDeleteMode, setIsDeleteMode] = useState(false)

  useEffect(() => {
    if (open) {
      setName(project.name)
      setDescription(project.description ?? "")
      setAvatarUrl(project.avatarUrl ?? "")
      setTab("general")
      setDeleteConfirmName("")
      setIsDeleteMode(false)
    }
  }, [open, project])

  const isDirty =
    name.trim() !== project.name ||
    (description.trim() || undefined) !== (project.description ?? undefined) ||
    (avatarUrl.trim() || undefined) !== (project.avatarUrl ?? undefined)

  const canSave = name.trim().length > 0 && isDirty && !updateProject.isPending

  const handleSave = () => {
    if (!canSave) return
    updateProject.mutate(
      {
        id: project.id,
        data: {
          name: name.trim(),
          description: description.trim() || undefined,
          avatarUrl: avatarUrl.trim() || undefined,
        },
      },
      { onSuccess: onClose }
    )
  }

  const handleDelete = () => {
    if (deleteConfirmName !== project.name) return
    deleteProject.mutate(project.id, {
      onSuccess: () => {
        onClose()
        navigate("/dashboard")
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        size="wide"
        className="max-w-[680px] w-full h-[450px] flex flex-col p-0 gap-0 overflow-hidden bg-[#181818] border border-white/[0.08] text-zinc-200 shadow-2xl shadow-black/60 rounded-2xl"
      >
        <DialogDescription className="hidden" />

        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-0">
          <DialogTitle className="flex items-center gap-3 text-[17px] font-semibold text-white tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.1]">
              <Settings2 className="h-4 w-4 text-zinc-300" />
            </div>
            Project Settings
          </DialogTitle>
        </DialogHeader>

        {/* Tab bar */}
        <div className="flex gap-0 px-6 mt-5 border-b border-white/[0.06]">
          {(["general", "danger"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-2 text-[13px] font-medium transition-colors cursor-pointer border-b-2 -mb-px",
                tab === t
                  ? "text-white border-white/60"
                  : "text-zinc-500 border-transparent hover:text-zinc-300"
              )}
            >
              {t === "danger" ? "Advanced" : "General"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-6 bg-[#181818] flex-1 overflow-auto">
          {tab === "general" && (
            <div className="flex gap-6">
              {/* Left Side: Avatar */}
              <div className="w-[120px] flex flex-col items-center gap-3">
                <label className="text-[13px] font-medium text-zinc-300 self-start">Photo</label>
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Avatar className="h-24 w-24 ring-4 ring-[#181818] bg-zinc-800 shadow-xl rounded-2xl">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt="Project Avatar" className="object-cover" />}
                    <AvatarFallback className="text-3xl font-medium text-zinc-300 rounded-2xl">
                      {project.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center transition-opacity border border-white/10 opacity-0 group-hover:opacity-100",
                    uploadProjectAvatar.isPending && "opacity-100 cursor-not-allowed"
                  )}>
                    {uploadProjectAvatar.isPending ? (
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    ) : (
                      <Camera className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      
                      if (file.size > 5 * 1024 * 1024) {
                        alert("File is too large. Max size is 5MB.")
                        return
                      }
                      
                      uploadProjectAvatar.mutate(
                        { id: project.id, file },
                        {
                          onSuccess: (data) => {
                            setAvatarUrl(data.avatarUrl ?? "")
                            if (fileInputRef.current) fileInputRef.current.value = ""
                          }
                        }
                      )
                    }} 
                    accept="image/jpeg,image/png,image/gif,image/webp" 
                    className="hidden" 
                  />
                </div>
              </div>

              {/* Right Side: Fields */}
              <div className="flex-1 space-y-5">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-[13px] font-medium text-zinc-300">Project name</label>
                  <Input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Core API Rewrite"
                    className="h-10 bg-white/[0.02] border border-white/[0.06] text-white text-[14px] rounded-xl focus-visible:ring-1 focus-visible:ring-white/[0.15] focus-visible:border-white/[0.15] placeholder:text-zinc-600 transition-all"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-[13px] font-medium text-zinc-300 flex justify-between">
                    Description
                    <span className="text-zinc-600 font-normal">Optional</span>
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide context for your team..."
                    className="flex w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[14px] text-white placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/[0.15] focus-visible:border-white/[0.15] resize-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {tab === "danger" && (
            <div className="space-y-5">
              {!isDeleteMode ? (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20">
                      <Trash2 className="h-4 w-4 text-rose-400" />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-rose-300">Delete this project</p>
                      <p className="text-[13px] text-zinc-500 mt-1 leading-relaxed">
                        This will permanently delete <span className="text-zinc-300 font-medium">"{project.name}"</span> along with all its tasks, columns, and member data. This action{" "}
                        <span className="text-rose-400 font-medium">cannot be undone</span>.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDeleteMode(true)}
                    className="w-full h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[13px] font-medium hover:bg-rose-500/20 hover:text-rose-300 transition-all cursor-pointer"
                  >
                    I want to delete this project
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.06] p-5 space-y-4">
                  <div className="flex items-center gap-2 text-rose-400">
                    <TriangleAlert className="h-4 w-4 shrink-0" />
                    <p className="text-[13px] font-semibold">Confirm deletion</p>
                  </div>
                  <p className="text-[13px] text-zinc-400 leading-relaxed">
                    Type the project name{" "}
                    <span className="font-mono font-semibold text-white bg-white/[0.06] px-1.5 py-0.5 rounded-md border border-white/[0.08]">
                      {project.name}
                    </span>{" "}
                    to confirm.
                  </p>
                  <Input
                    autoFocus
                    value={deleteConfirmName}
                    onChange={(e) => setDeleteConfirmName(e.target.value)}
                    placeholder={project.name}
                    className="h-10 bg-white/[0.02] border border-rose-500/20 text-white text-[14px] rounded-xl focus-visible:ring-1 focus-visible:ring-rose-500/30 focus-visible:border-rose-500/30 placeholder:text-zinc-700 transition-all"
                  />
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => { setIsDeleteMode(false); setDeleteConfirmName("") }}
                      className="flex-1 h-9 rounded-lg text-[13px] font-medium text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleteConfirmName !== project.name || deleteProject.isPending}
                      className="flex-1 h-9 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[13px] font-medium hover:bg-rose-500/30 hover:text-rose-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {deleteProject.isPending ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete Project
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer (only on General tab) */}
        {tab === "general" && (
          <div className="px-6 pb-5 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="h-9 px-5 text-[13px] font-medium text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="h-9 px-6 text-[13px] font-medium bg-white/[0.08] text-zinc-200 border border-white/[0.05] hover:bg-white/[0.12] hover:text-white disabled:opacity-35 disabled:cursor-not-allowed rounded-lg transition-all cursor-pointer flex items-center gap-2"
            >
              {updateProject.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
