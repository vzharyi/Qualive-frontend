import { useState } from "react"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Users,
  CalendarRange,
  UserCircle2,
  Paperclip,
  BarChart2,
  Wallet2,
  Sparkles,
  Plus,
  X,
  Calendar,
  CheckSquare,
} from "lucide-react"
import { useCreateProject } from "@/features/projects/api/projects.queries"
import { cn } from "@/lib/utils"

interface CreateProjectModalProps {
  open: boolean
  onClose: () => void
}

type FeatureKey =
  | "priority"
  | "team"
  | "dates"
  | "assignee"
  | "attachments"
  | "progress"
  | "budget"
  | "aiSummary"

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
  { id: "attachments", label: "Attachments", icon: Paperclip },
  { id: "progress", label: "Progress", icon: BarChart2 },
  { id: "budget", label: "Budget", icon: Wallet2 },
  { id: "aiSummary", label: "AI summary", icon: Sparkles },
]

interface ColumnConfig {
  id: string
  title: string
  color: string
}

const defaultColumns: ColumnConfig[] = [
  { id: "todo", title: "To Do", color: "slate" },
  { id: "in-progress", title: "In Progress", color: "amber" },
  { id: "review", title: "In Review", color: "purple" },
  { id: "done", title: "Done", color: "green" },
]

// Маппинг цветов для селектора (левая часть) — ключи совпадают с kanban-column
const colorOptions = [
  { value: "slate", label: "Slate", class: "bg-slate-400" },
  { value: "blue", label: "Blue", class: "bg-blue-400" },
  { value: "amber", label: "Amber", class: "bg-amber-400" },
  { value: "green", label: "Green", class: "bg-emerald-500" },
  { value: "red", label: "Red", class: "bg-red-400" },
  { value: "purple", label: "Purple", class: "bg-purple-500" },
  { value: "pink", label: "Pink", class: "bg-pink-400" },
  { value: "cyan", label: "Cyan", class: "bg-cyan-400" },
]

// RGB значения для стилизации превью колонок (совпадают с KanbanColumn)
const columnColorsRGB: Record<string, string> = {
  slate: "148, 163, 184",
  blue: "96, 165, 250",
  amber: "251, 191, 36",
  green: "52, 211, 153",
  red: "248, 113, 113",
  purple: "192, 132, 252",
  pink: "244, 114, 182",
  cyan: "34, 211, 238",
}

export function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [enabledFeatures, setEnabledFeatures] = useState<FeatureKey[]>([
    "priority",
    "team",
    "dates",
    "assignee",
  ])
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns)

  const createProject = useCreateProject()

  const canContinue = name.trim().length > 0
  const canCreate = canContinue && columns.length > 0

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
        id: `custom-${index}`,
        title: `Column ${index}`,
        color: "slate",
      },
    ])
  }

  const handleRemoveColumn = (id: string) => {
    if (columns.length <= 1) return
    setColumns((prev) => prev.filter((c) => c.id !== id))
  }

  const resetState = () => {
    setStep(1)
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

  const handleCreate = () => {
    if (!canCreate || createProject.isPending) return

    createProject.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => {
          handleClose()
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent
        size="wide"
        // Задал базовый цвет модалки #181818, чтобы не было швов по краям
        className="max-w-[1000px] w-full p-0 gap-0 overflow-hidden bg-[#181818] border-white/10 text-zinc-200"
      >
        <div className="flex h-[600px]">

          {/* Левая часть – форма (Step 1 & 2) – Фон #131313 */}
          <div className="flex w-[400px] flex-col border-r border-white/10 p-6 bg-[#131313] z-10 shadow-[10px_0_20px_-10px_rgba(0,0,0,0.5)]">
            <DialogHeader className="mb-4">
              <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                {step === 1 ? "Step 1 of 2" : "Step 2 of 2"}
              </div>
              <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-white mt-1">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-semibold text-emerald-500">
                  {step}
                </span>
                {step === 1 ? "Customize your project" : "Set up your board"}
              </DialogTitle>
              <DialogDescription className="text-sm text-zinc-400 mt-1">
                {step === 1
                  ? "Name your project and choose which task properties to track."
                  : "Choose how many columns you want on your Kanban board."}
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex-1 overflow-y-auto pr-4 -mr-4">
              {step === 1 ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Project name</label>
                    <Input
                      placeholder="e.g. Public launch of iOS app"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">
                      Description <span className="text-zinc-500 font-normal">(optional)</span>
                    </label>
                    <textarea
                      rows={3}
                      className="flex w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/50 resize-none"
                      placeholder="Short description for your team..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-zinc-300">
                        Task properties
                      </label>
                      <span className="text-xs text-zinc-500">
                        {enabledFeatures.length} selected
                      </span>
                    </div>
                    
                    {/* Кнопки теперь идут оберткой (flex-wrap), а не жесткой сеткой */}
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
                              "flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                              active
                                ? "border-emerald-500 text-white" 
                                : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-300",
                            )}
                          >
                            <Icon 
                              className={cn(
                                "h-4 w-4",
                                active ? "text-emerald-500" : "text-zinc-400"
                              )} 
                            />
                            <span>{feature.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-300">
                      Columns ({columns.length})
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddColumn}
                      className="h-8 gap-1 rounded-md border-white/10 bg-white/5 text-xs hover:bg-white/10 text-zinc-300"
                    >
                      <Plus className="h-3 w-3" />
                      Add Column
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {columns.map((column) => (
                      <div
                        key={column.id}
                        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2"
                      >
                        <div
                          className={cn(
                            "h-6 w-1.5 rounded-full",
                            colorOptions.find((c) => c.value === column.color)?.class || "bg-slate-400",
                          )}
                        />
                        <Input
                          value={column.title}
                          onChange={(e) =>
                            handleChangeColumnTitle(column.id, e.target.value)
                          }
                          className="h-8 flex-1 bg-transparent border-none text-sm text-zinc-200 focus-visible:ring-0 px-2"
                        />
                        <select
                          value={column.color}
                          onChange={(e) =>
                            handleChangeColumnColor(column.id, e.target.value)
                          }
                          className="h-8 rounded-md bg-white/5 border border-white/10 px-2 text-xs text-zinc-300 focus:outline-none"
                        >
                          {colorOptions.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-[#1e1e1e]">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveColumn(column.id)}
                          disabled={columns.length <= 1}
                          className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ScrollArea>

            <DialogFooter className="mt-6 pt-4 border-t border-white/10 gap-2 sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                className="text-xs text-zinc-400 hover:text-white hover:bg-white/5"
              >
                Cancel
              </Button>
              <div className="flex items-center gap-2">
                {step === 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="gap-1 text-xs border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                  >
                    <ChevronLeft className="h-3 w-3" />
                    Back
                  </Button>
                )}
                {step === 1 ? (
                  <Button
                    type="button"
                    disabled={!canContinue}
                    onClick={() => canContinue && setStep(2)}
                    className="gap-2 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Continue
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleCreate}
                    disabled={!canCreate || createProject.isPending}
                    className="gap-2 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {createProject.isPending ? "Creating..." : "Create project"}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </div>

          {/* Правая часть – Горизонтальное Kanban превью (Фулл размер) – Фон #181818 */}
          <div className="flex flex-1 flex-col bg-[#181818] p-6 min-w-0 w-[400px]">
            {/* Header превью */}
            <div className="mb-6 flex items-start justify-between flex-shrink-0">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1">
                  Live preview
                </p>
                <h3 className="text-xl font-semibold text-white">
                  {name || "Public launch of iOS app"}
                </h3>
              </div>
            </div>

            {/* Контейнер колонок со скроллом */}
            <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
              <div className="flex h-full gap-4 w-max">
                {columns.map((column) => {
                  const colorRGB = columnColorsRGB[column.color] || columnColorsRGB.slate;

                  return (
                    <div
                      key={column.id}
                      className="flex h-fit w-[300px] flex-shrink-0 flex-col rounded-xl relative"
                    >
                      {/* Заголовок колонки */}
                      <div className="flex items-center justify-between mb-3 px-1">
                        <div
                          className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium"
                          style={{ backgroundColor: `rgba(${colorRGB}, 0.12)`, color: `rgb(${colorRGB})` }}
                        >
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: `rgb(${colorRGB})` }} />
                          {column.title}
                          <span className="ml-1 opacity-70 text-[11px] font-bold">2</span>
                        </div>
                      </div>

                      {/* Статичные таски для превью */}
                      <div className="flex flex-col gap-2">
                        {[1, 2].map((idx) => (
                          <div
                            key={idx}
                            className="relative rounded-xl border p-3.5"
                            style={{
                              background: `linear-gradient(rgba(${colorRGB}, 0.08), rgba(${colorRGB}, 0.08)), #181818`,
                              borderColor: `rgba(${colorRGB}, 0.12)`,
                            }}
                          >
                            <h4 className="mb-2 pr-6 text-[13px] font-medium leading-snug text-zinc-200">
                              {idx === 1 ? "Design onboarding screen" : "Connect analytics tools"}
                            </h4>

                            {/* Assignee Preview */}
                            {enabledFeatures.includes("assignee") && (
                              <div className="flex items-center gap-2 mb-2">
                                <Avatar className="h-5 w-5 ring-1 ring-white/[0.06]">
                                  <AvatarFallback className="text-[9px] bg-zinc-800 text-zinc-400">
                                    {idx === 1 ? "A" : "B"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-[11px] text-zinc-500">
                                  {idx === 1 ? "Alex D." : "Ben P."}
                                </span>
                              </div>
                            )}

                            {/* Нижний ряд с мета-информацией */}
                            {enabledFeatures.some(f => ["dates", "attachments", "progress", "priority", "budget", "aiSummary"].includes(f)) && (
                              <div className="mt-3 flex h-6 w-full items-center justify-between text-[11px] text-zinc-500">
                                <div className="flex items-center gap-3">
                                  {enabledFeatures.includes("dates") && (
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      <span>Mar 24</span>
                                    </div>
                                  )}
                                  
                                  {enabledFeatures.includes("attachments") && (
                                    <div className="flex items-center gap-1">
                                      <Paperclip className="h-3 w-3" />
                                      <span>2</span>
                                    </div>
                                  )}

                                  {enabledFeatures.includes("progress") && (
                                    <div className="flex items-center gap-1 text-emerald-500">
                                      <CheckSquare className="h-3 w-3" />
                                      <span>3/3</span>
                                    </div>
                                  )}

                                  {enabledFeatures.includes("budget") && (
                                    <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px]">
                                      $2,400
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2.5">
                                  {enabledFeatures.includes("aiSummary") && (
                                    <Sparkles className="h-3 w-3 text-emerald-400" />
                                  )}
                                  {enabledFeatures.includes("priority") && (
                                    <div
                                      className="h-2 w-2 rounded-full bg-red-500"
                                      title="High Priority"
                                    />
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Кнопка "New task" как в оригинале */}
                        <button
                          className="w-full flex items-center justify-start gap-2 py-2.5 px-3 rounded-xl text-[13px] font-medium"
                          style={{
                            backgroundColor: `rgba(${colorRGB}, 0.04)`,
                            color: `rgba(${colorRGB}, 0.8)`,
                            border: `1px solid rgba(${colorRGB}, 0.1)`,
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          New task
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}