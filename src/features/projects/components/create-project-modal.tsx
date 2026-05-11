import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Flag,
  Users,
  CalendarRange,
  UserCircle2,
  Plus,
  X,
  Kanban,
  Camera,
} from "lucide-react"
import { useCreateProject, useUploadProjectAvatar } from "@/features/projects/api/projects.queries"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

import { COLUMN_COLORS } from "@/features/projects/constants/colors"

interface CreateProjectModalProps {
  open: boolean
  onClose: () => void
}

type FeatureKey =
  | "priority"
  | "team"
  | "dates"
  | "assignee"

interface FeatureToggle {
  id: FeatureKey
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const featureToggles: FeatureToggle[] = [
  { id: "priority", label: "Priority", icon: Flag },
  { id: "team", label: "Team", icon: Users },
  { id: "dates", label: "Dates", icon: CalendarRange },
  { id: "assignee", label: "Assignee", icon: UserCircle2 },
]

interface ColumnConfig {
  id: string
  title: string
  color: string
}

const defaultColumns: ColumnConfig[] = [
  { id: "todo", title: "To Do", color: "#94a3b8" },
  { id: "in-progress", title: "In Progress", color: "#fbbf24" },
  { id: "review", title: "In Review", color: "#c084fc" },
  { id: "done", title: "Done", color: "#34d399" },
]

export function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [enabledFeatures, setEnabledFeatures] = useState<FeatureKey[]>([
    "priority",
    "team",
    "dates",
    "assignee",
  ])
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns)

  const createProject = useCreateProject()
  const uploadProjectAvatar = useUploadProjectAvatar()

  const canCreate = name.trim().length > 0 && columns.length > 0

  const handleToggleFeature = (id: FeatureKey) => {
    setEnabledFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    )
  }

  const handleChangeColumnTitle = (id: string, value: string) => {
    setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, title: value } : c)))
  }

  const handleChangeColumnColor = (id: string, value: string) => {
    setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, color: value } : c)))
  }

  const handleAddColumn = () => {
    const index = columns.length + 1
    setColumns((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        title: `Column ${index}`,
        color: "#94a3b8",
      },
    ])
  }

  const handleRemoveColumn = (id: string) => {
    if (columns.length <= 1) return
    setColumns((prev) => prev.filter((c) => c.id !== id))
  }

  const resetState = () => {
    setName("")
    setDescription("")
    setEnabledFeatures(["priority", "team", "dates", "assignee"])
    setColumns(defaultColumns)
  }

  const handleClose = () => {
    if (createProject.isPending) return
    onClose()
    resetState()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canCreate || createProject.isPending) return

    createProject.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        columns: columns.map((c) => ({ name: c.title, color: c.color })),
      },
      {
        onSuccess: (data: any) => {
          if (avatarFile && data?.id) {
            uploadProjectAvatar.mutate(
              { id: data.id, file: avatarFile },
              {
                onSuccess: () => {
                  handleClose()
                },
                onError: () => {
                  alert("Project created, but avatar upload failed.")
                  handleClose()
                }
              }
            )
          } else {
            handleClose()
          }
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent
        size="wide"
        className="max-w-[910px] w-full p-0 gap-0 overflow-hidden bg-[#181818] border border-white/[0.08] text-zinc-200 shadow-2xl shadow-black/50 rounded-2xl"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-[590px]">
          {/* Header */}
          <DialogHeader className="p-6 pb-2 bg-[#181818]">
            <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-white tracking-tight">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.1] shadow-inner">
                <Kanban className="h-4 w-4 text-zinc-300" />
              </div>
              Create New Project
            </DialogTitle>
            <DialogDescription className="hidden" />
          </DialogHeader>

          <div className="flex flex-1 min-h-0 bg-[#181818]">
            {/* Left Column: Basic Details */}
            <ScrollArea className="flex-3">
              <div className="space-y-6 p-6">
                <div className="flex gap-4 items-center">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Avatar className="h-16 w-16 bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                      {avatarPreview && <AvatarImage src={avatarPreview} alt="Preview" className="object-cover" />}
                      <AvatarFallback className="text-xl font-medium text-zinc-500">
                        {name ? name.charAt(0).toUpperCase() : <Plus className="h-5 w-5 text-zinc-600" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                      <Camera className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2.5">
                    <label className="text-[13px] font-medium text-zinc-300">Project name</label>
                    <Input
                      autoFocus
                      placeholder="e.g. Core API Rewrite"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11 bg-white/[0.02] border border-white/[0.06] text-white text-[14px] rounded-xl focus-visible:ring-1 focus-visible:ring-white/[0.15] focus-visible:border-white/[0.15] placeholder:text-zinc-600 transition-all shadow-inner"
                    />
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
                      
                      setAvatarFile(file)
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        setAvatarPreview(reader.result as string)
                      }
                      reader.readAsDataURL(file)
                    }} 
                    accept="image/jpeg,image/png,image/gif,image/webp" 
                    className="hidden" 
                  />
                </div>

                <div className="space-y-2.5">
                  <label className="text-[13px] font-medium text-zinc-300 flex items-center justify-between">
                    Description
                    <span className="text-zinc-600 font-normal">Optional</span>
                  </label>
                  <textarea
                    rows={4}
                    className="flex w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[14px] text-white placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/[0.15] focus-visible:border-white/[0.15] resize-none transition-all shadow-inner"
                    placeholder="Context for your team..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-medium text-zinc-300">
                      Task properties
                    </label>
                    <span className="text-[12px] font-mono text-zinc-600 bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/[0.05]">
                      {enabledFeatures.length}/{featureToggles.length}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {featureToggles.map((feature) => {
                      const Icon = feature.icon
                      const active = enabledFeatures.includes(feature.id)
                      return (
                        <button
                          key={feature.id}
                          type="button"
                          onClick={() => handleToggleFeature(feature.id)}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-all duration-200 cursor-pointer",
                            active
                              ? "border-white/[0.1] bg-white/[0.08] text-zinc-200 shadow-sm"
                              : "border-transparent bg-white/[0.02] text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300",
                          )}
                        >
                          <Icon className={cn("h-4 w-4", active ? "text-zinc-300" : "opacity-60")} />
                          {feature.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Right Column: Columns Setup */}
            <ScrollArea className="flex-2.5">
              <div className="space-y-5 p-6">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-medium text-zinc-300">
                    Board columns
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAddColumn}
                    className="h-8 px-3 text-[12px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Add Column
                  </Button>
                </div>

                <div className="space-y-3">
                  {columns.map((column) => (
                    <div
                      key={column.id}
                      className="group flex flex-col gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 focus-within:border-white/[0.15] focus-within:bg-white/[0.04] transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Input
                          value={column.title}
                          onChange={(e) =>
                            handleChangeColumnTitle(column.id, e.target.value)
                          }
                          className="h-8 flex-1 bg-transparent border-none text-[14px] text-white focus-visible:ring-0 px-1 font-medium placeholder:text-zinc-600"
                          placeholder="Column Title"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveColumn(column.id)}
                          disabled={columns.length <= 1}
                          className="h-7 w-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-500 transition-colors cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.04] px-1">
                        {COLUMN_COLORS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            title={opt.label}
                            onClick={() => handleChangeColumnColor(column.id, opt.value)}
                            className={cn(
                              "h-5 w-5 rounded-full transition-all duration-200 border-[2.5px] cursor-pointer",
                              column.color === opt.value 
                                ? "border-white scale-110 shadow-sm" 
                                : "border-transparent hover:scale-110 hover:border-white/50 opacity-80 hover:opacity-100"
                            )}
                            style={{ backgroundColor: opt.value }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Footer */}
          <DialogFooter className="p-6 pt-2 bg-[#181818] flex items-center justify-end gap-3 rounded-b-2xl">
            <button
              type="button"
              onClick={handleClose}
              className="h-9 px-5 text-[13px] font-medium text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canCreate || createProject.isPending}
              className="h-9 px-6 text-[13px] font-medium bg-white/[0.08] text-zinc-200 border border-white/[0.05] hover:bg-white/[0.12] hover:text-white disabled:opacity-40 disabled:hover:bg-white/[0.08] rounded-lg transition-all cursor-pointer"
            >
              {createProject.isPending ? "Creating..." : "Create Project"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}