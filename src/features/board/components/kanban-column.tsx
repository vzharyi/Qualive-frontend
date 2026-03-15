import React, { useState, useRef, useEffect } from "react"
import { Reorder, useDragControls } from "framer-motion"
import { TaskCard } from "@/features/board/components/task-card"
import { Plus, Pencil, Search, Users, CircleDot, X, Settings } from "lucide-react"
import type { Task, Column } from "@/features/tasks/types/tasks.types"
import type { ProjectMember } from "@/features/projects/types/projects.types"
import { useCreateTask, useUpdateTask } from "@/features/tasks/api/tasks.queries"
import { cn } from "@/lib/utils"
// import { ColorPicker } from "@/components/ui/color-picker"
import { ColumnEditPanel } from "./column-edit-panel"

// Color palette defaults (fallback if column has no color)
const FALLBACK_COLORS = ["#94a3b8", "#fbbf24", "#c084fc", "#34d399", "#60a5fa", "#f87171"]

// Convert HEX to "r, g, b" for rgba() usage
function hexToRGB(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return "148, 163, 184"
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
}

interface KanbanColumnProps {
  column: Column
  tasks: Task[]
  onOpenPanel: (task: Task) => void
  onDropTask: (taskId: number, beforeId: number | null) => void
  projectId: number
  members?: ProjectMember[]
}

const DropIndicator = ({ beforeId, columnId, priority }: { beforeId: string | number, columnId: number, priority: string }) => {
  return (
    <div
      data-before={beforeId || "-1"}
      data-column={columnId}
      data-indicator-priority={priority}
      className="absolute left-0 right-0 h-0.5 w-full bg-violet-400 opacity-0 pointer-events-none z-50 -top-1"
    />
  )
}

export function KanbanColumn({
  column,
  tasks,
  onOpenPanel,
  onDropTask,
  projectId,
  members = [],
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false)
  const dragCounter = useRef(0)
  const dragControls = useDragControls()

  // Use the column's color from API, fall back to palette based on column.id
  const hex = column.color || FALLBACK_COLORS[column.id % FALLBACK_COLORS.length]
  const colorRGB = hexToRGB(hex)

  // Inline create state
  const [showInlineCreate, setShowInlineCreate] = useState(false)
  const [inlineTitle, setInlineTitle] = useState("")
  const [inlinePriority, setInlinePriority] = useState<string | null>(null)
  const [inlineAssigneeId, setInlineAssigneeId] = useState<number | null>(null)
  const [showPriorityPicker, setShowPriorityPicker] = useState(false)
  const [showAssigneePicker, setShowAssigneePicker] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  const createTask = useCreateTask()
  const updateTask = useUpdateTask()

  // Inline task edit state
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editPriority, setEditPriority] = useState<string | null>(null)
  const [editAssigneeId, setEditAssigneeId] = useState<number | null>(null)
  const [showEditPriorityPicker, setShowEditPriorityPicker] = useState(false)
  const [showEditAssigneePicker, setShowEditAssigneePicker] = useState(false)
  const editFormRef = useRef<HTMLDivElement>(null)
  const settingsBtnRef = useRef<HTMLButtonElement>(null)

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)

  const resetForm = () => {
    setShowInlineCreate(false)
    setInlineTitle("")
    setInlinePriority(null)
    setInlineAssigneeId(null)
    setShowPriorityPicker(false)
    setShowAssigneePicker(false)
  }

  const handleInlineEditTask = (task: Task) => {
    setEditingTask(task)
    setEditTitle(task.title)
    setEditPriority(task.priority || null)
    setEditAssigneeId(task.assigneeId || null)
    setShowEditPriorityPicker(false)
    setShowEditAssigneePicker(false)
  }

  const resetEditForm = () => {
    setEditingTask(null)
    setEditTitle("")
    setEditPriority(null)
    setEditAssigneeId(null)
    setShowEditPriorityPicker(false)
    setShowEditAssigneePicker(false)
  }

  const handleEditSave = () => {
    if (!editingTask) return
    if (!editTitle.trim()) {
      resetEditForm()
      return
    }
    updateTask.mutate(
      {
        id: editingTask.id,
        data: {
          title: editTitle.trim(),
          priority: editPriority || undefined,
          assigneeId: editAssigneeId || undefined,
        },
      },
      { onSuccess: resetEditForm }
    )
  }

  const handleSave = () => {
    if (!inlineTitle.trim()) {
      resetForm()
      return
    }

    // Calculate the order so the new task appears at the bottom of its priority group
    const priorityToMatch = inlinePriority || null
    const samePriorityTasks = tasks.filter(t => (t.priority || null) === priorityToMatch)
    const newOrder = samePriorityTasks.length

    createTask.mutate(
      {
        projectId,
        data: {
          title: inlineTitle.trim(),
          columnId: column.id,
          priority: inlinePriority || undefined,
          assigneeId: inlineAssigneeId || undefined,
          order: newOrder,
        },
      },
      { onSuccess: resetForm },
    )
  }

  // Ref to always call the latest handleSave (avoids stale closure)
  const handleSaveRef = useRef(handleSave)
  handleSaveRef.current = handleSave

  // Auto-save on click outside (create form)
  useEffect(() => {
    if (!showInlineCreate) return
    const onClickOutside = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        handleSaveRef.current()
      }
    }
    const timer = setTimeout(() => document.addEventListener("mousedown", onClickOutside), 100)
    return () => {
      clearTimeout(timer)
      document.removeEventListener("mousedown", onClickOutside)
    }
  }, [showInlineCreate])

  // Auto-save on click outside (edit form)
  const handleEditSaveRef = useRef(handleEditSave)
  handleEditSaveRef.current = handleEditSave
  useEffect(() => {
    if (!editingTask) return
    const onClickOutside = (e: MouseEvent) => {
      if (editFormRef.current && !editFormRef.current.contains(e.target as Node)) {
        handleEditSaveRef.current()
      }
    }
    const timer = setTimeout(() => document.addEventListener("mousedown", onClickOutside), 100)
    return () => {
      clearTimeout(timer)
      document.removeEventListener("mousedown", onClickOutside)
    }
  }, [editingTask])

  // Close ALL pickers when clicking anywhere else
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // If clicking outside any specific picker button/container, close them all
      if (!target.closest('.picker-container') && !target.closest('.picker-trigger')) {
        setShowPriorityPicker(false)
        setShowAssigneePicker(false)
        setShowEditPriorityPicker(false)
        setShowEditAssigneePicker(false)
      }
    }
    document.addEventListener("mousedown", handleGlobalClick)
    return () => document.removeEventListener("mousedown", handleGlobalClick)
  }, [])

  const priorityOptions = [
    { value: "HIGH", label: "High", color: "bg-red-500" },
    { value: "MEDIUM", label: "Medium", color: "bg-amber-500" },
    { value: "LOW", label: "Low", color: "bg-zinc-500" },
  ]

  const selectedAssignee = members.find((m) => m.userId === inlineAssigneeId)

  const getMemberName = (m: ProjectMember) =>
    m.user
      ? m.user.firstName && m.user.lastName
        ? `${m.user.firstName} ${m.user.lastName}`
        : m.user.login
      : `User #${m.userId}`

  const highlightIndicator = (e: React.DragEvent) => {
    // Read the globally stored priority from TaskCard's onDragStart
    // (DataTransfer isn't available during dragOver due to browser security)
    const activePriority = (window as any).__draggingTaskPriority || "none"
    const activeTaskId = (window as any).__draggingTaskId
    
    // Only select indicators that match the active task's priority
    const indicators = Array.from(document.querySelectorAll(`[data-column="${column.id}"][data-indicator-priority="${activePriority}"]`)) as HTMLElement[]
    clearHighlights()
    const el = getNearestIndicator(e, indicators)
    
    // Don't show an indicator if we are dragging the task right onto its own current spot
    if (el) {
      const beforeId = el.dataset.before
      
      if (beforeId === activeTaskId) return 
      

      const activeTaskIndex = tasks.findIndex(t => t.id.toString() === activeTaskId)
      if (activeTaskIndex !== -1) {
        const nextTask = tasks[activeTaskIndex + 1]
        if (nextTask && beforeId === nextTask.id.toString()) return
        
        if (!nextTask && beforeId === "-1") return
      }
      
      el.style.opacity = "1"
    }
  }

  const clearHighlights = (els?: HTMLElement[]) => {
    const indicators = els || Array.from(document.querySelectorAll(`[data-column="${column.id}"]`)) as HTMLElement[]
    indicators.forEach((i) => {
      i.style.opacity = "0"
    })
  }

  const getNearestIndicator = (e: React.DragEvent, indicators: HTMLElement[]) => {
    const DISTANCE_OFFSET = 50
    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect()
        const offset = e.clientY - (box.top + DISTANCE_OFFSET)
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child }
        } else {
          return closest
        }
      },
      { offset: Number.NEGATIVE_INFINITY, element: indicators[indicators.length - 1] }
    )
    return el.element
  }

  // HTML drag-and-drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current++
    setIsOver(true)
  }
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    highlightIndicator(e)
  }
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsOver(false)
      clearHighlights()
    }
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current = 0
    setIsOver(false)
    clearHighlights()
    
    const taskIdStr = e.dataTransfer.getData("taskId")
    const taskId = taskIdStr ? Number(taskIdStr) : (window as any).__draggingTaskId ? Number((window as any).__draggingTaskId) : null
    
    if (!taskId) return

    const activePriority = (window as any).__draggingTaskPriority || "none"
    const indicators = Array.from(document.querySelectorAll(`[data-column="${column.id}"][data-indicator-priority="${activePriority}"]`)) as HTMLElement[]
    
    // Also include the fallback indicator which might be the only one if priority changed
    const fallbackIndicator = document.querySelector(`[data-column="${column.id}"][data-indicator-priority="fallback"]`) as HTMLElement;
    if (fallbackIndicator && !indicators.includes(fallbackIndicator)) {
      indicators.push(fallbackIndicator);
    }

    const el = getNearestIndicator(e, indicators)
    const before = el?.dataset.before || "-1"
    const beforeId = before === "-1" ? null : Number(before)

    onDropTask(taskId, beforeId)
  }

  return (
    <Reorder.Item
      value={column}
      dragListener={false}
      dragControls={dragControls}
      layout="position"
      axis="x"
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex h-fit w-[300px] flex-shrink-0 flex-col rounded-xl relative select-none"
      style={{
        backgroundColor: isOver ? `rgba(${colorRGB}, 0.01)` : "transparent",
        outline: isOver ? `1.5px dashed rgba(${colorRGB}, 0.4)` : "1.5px solid transparent",
        outlineOffset: "2px",
      }}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column header — drag the whole header, except the name pill */}
      <div
        className="flex items-center justify-between mb-3 px-1 touch-none cursor-grab active:cursor-grabbing"
        onPointerDown={(e) => {
          e.preventDefault()
          dragControls.start(e)
        }}
      >
        {/* Left: colored name pill + count badge */}
        <div className="flex items-center gap-2">
          {/* Name pill — static colored pill (was clickable/editable) */}
          <div
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium"
            style={{ backgroundColor: `rgba(${colorRGB}, 0.12)`, color: `rgb(${colorRGB})` }}
          >
            <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: `rgb(${colorRGB})` }} />
            <span>{column.name}</span>
          </div>

          {/* Task count — separate badge */}
          <span
            className="text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded-md"
            style={{ backgroundColor: `rgba(${colorRGB}, 0.08)`, color: `rgba(${colorRGB}, 0.7)` }}
          >
            {tasks.length}
          </span>
        </div>

        {/* Right: settings button */}
        <div className="flex items-center gap-0.5" onPointerDown={(e) => e.stopPropagation()}>
          <button
            ref={settingsBtnRef}
            onClick={() => {
              if (settingsBtnRef.current) {
                setAnchorRect(settingsBtnRef.current.getBoundingClientRect())
              }
              setIsSettingsOpen(true)
            }}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {tasks.map((task, index) => {
          const nextTask = tasks[index + 1]
          const isLastInPriority = !nextTask || (nextTask.priority || "none") !== (task.priority || "none")

          // If this task is being inline-edited, show edit form instead of card
          if (editingTask?.id === task.id) {
            return (
              <React.Fragment key={task.id}>
                <div
                  ref={editFormRef}
                  className="rounded-xl border p-3"
                  style={{
                    background: `linear-gradient(rgba(${colorRGB}, 0.06), rgba(${colorRGB}, 0.06)), #181818`,
                    borderColor: `rgba(${colorRGB}, 0.3)`,
                  }}
                >
                  {/* Title */}
                  <div className="flex items-center gap-2.5 py-2">
                    <Pencil className="h-4 w-4 text-emerald-400 shrink-0" />
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleEditSave()
                        if (e.key === "Escape") resetEditForm()
                      }}
                      placeholder="Task name..."
                      autoFocus
                      className="w-full bg-transparent text-[13px] text-white placeholder:text-zinc-500 focus:outline-none"
                    />
                  </div>

                  <div className="h-px bg-white/[0.06]" />

                  {/* Assignee */}
                  <div className="relative h-[36px]">
                    {!showEditAssigneePicker ? (
                      <button
                        onClick={() => { setShowEditAssigneePicker(true); setShowEditPriorityPicker(false) }}
                        className="absolute inset-0 flex items-center gap-2.5 text-[13px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer picker-trigger"
                      >
                        <Users className="h-4 w-4 shrink-0" />
                        <span>{members.find((m) => m.userId === editAssigneeId) ? getMemberName(members.find((m) => m.userId === editAssigneeId)!) : "Assignee"}</span>
                      </button>
                    ) : (
                      <div className="absolute -inset-x-2.5 -top-2 z-30 rounded-xl border border-white/[0.08] bg-[#1e1e1e] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 picker-container">
                        <div className="flex items-center justify-between px-2.5 py-2 border-b border-white/[0.06] bg-white/[0.02]">
                          <div className="flex items-center gap-2 min-w-0">
                            <Users className="h-4 w-4 shrink-0 text-blue-400" />
                            {editAssigneeId ? (
                              <span className="text-[13px] text-white font-medium truncate">{getMemberName(members.find(m => m.userId === editAssigneeId)!)}</span>
                            ) : (
                              <span className="text-[13px] text-zinc-400">Select Assignee</span>
                            )}
                          </div>
                          {editAssigneeId && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditAssigneeId(null); setShowEditAssigneePicker(false) }}
                              className="shrink-0 ml-2 p-1 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="p-1 max-h-[200px] overflow-y-auto">
                          {!editAssigneeId && members.length === 0 && (
                            <div className="px-2.5 py-2 text-[12px] text-zinc-500">No members available</div>
                          )}
                          {members.filter(m => m.userId !== editAssigneeId).map((m) => (
                            <button
                              key={m.userId}
                              onClick={() => { setEditAssigneeId(m.userId); setShowEditAssigneePicker(false) }}
                              className="w-full flex items-center px-2 py-1.5 rounded-md text-[13px] text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
                            >
                              <span className="truncate ml-6">{getMemberName(m)}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-white/[0.06]" />

                  {/* Priority */}
                  <div className="relative h-[36px]">
                    {!showEditPriorityPicker ? (
                      <button
                        onClick={() => { setShowEditPriorityPicker(true); setShowEditAssigneePicker(false) }}
                        className="absolute inset-0 flex items-center gap-2.5 text-[13px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer picker-trigger"
                      >
                        <CircleDot className="h-4 w-4 shrink-0" />
                        <span className="flex items-center gap-1.5">
                          {editPriority ? (
                            <>
                              <span className={cn("h-2 w-2 rounded-full", priorityOptions.find((p) => p.value === editPriority)?.color)} />
                              {priorityOptions.find((p) => p.value === editPriority)?.label}
                            </>
                          ) : "Priority"}
                        </span>
                      </button>
                    ) : (
                      <div className="absolute -inset-x-2.5 -top-2 z-30 rounded-xl border border-white/[0.08] bg-[#1e1e1e] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 picker-container">
                        <div className="flex items-center justify-between px-2.5 py-2 border-b border-white/[0.06] bg-white/[0.02]">
                          <div className="flex items-center gap-2 min-w-0">
                            <CircleDot className="h-4 w-4 shrink-0 text-amber-400" />
                            {editPriority ? (
                              <div className="flex items-center gap-1.5">
                                <span className={cn("h-2 w-2 rounded-full", priorityOptions.find((p) => p.value === editPriority)?.color)} />
                                <span className="text-[13px] text-white font-medium truncate">{priorityOptions.find(p => p.value === editPriority)?.label}</span>
                              </div>
                            ) : (
                              <span className="text-[13px] text-zinc-400">Select Priority</span>
                            )}
                          </div>
                          {editPriority && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditPriority(null); setShowEditPriorityPicker(false) }}
                              className="shrink-0 ml-2 p-1 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="p-1">
                          {priorityOptions.filter(p => p.value !== editPriority).map((p) => (
                            <button
                              key={p.value}
                              onClick={() => { setEditPriority(p.value); setShowEditPriorityPicker(false) }}
                              className="w-full flex items-center px-2 py-1.5 rounded-md text-[13px] text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-2 ml-6">
                                <span className={cn("h-2 w-2 rounded-full", p.color)} />
                                {p.label}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {isLastInPriority && (
                  <div className="relative -mt-2">
                    <DropIndicator 
                      beforeId={nextTask ? nextTask.id : "-1"} 
                      columnId={column.id} 
                      priority={task.priority || "none"} 
                    />
                  </div>
                )}
              </React.Fragment>
            )
          }

          return (
            <React.Fragment key={task.id}>
              <div className="relative">
                <DropIndicator beforeId={task.id} columnId={column.id} priority={task.priority || "none"} />
                <TaskCard
                  task={task}
                  colorRGB={colorRGB}
                  onEditTask={handleInlineEditTask}
                  onOpenPanel={onOpenPanel}
                />
              </div>
              {isLastInPriority && (
                <div className="relative -mt-2">
                  <DropIndicator beforeId={nextTask ? nextTask.id : "-1"} columnId={column.id} priority={task.priority || "none"} />
                </div>
              )}
            </React.Fragment>
          )
        })}
        <div className="relative -mt-2">
          <DropIndicator beforeId="-1" columnId={column.id} priority="fallback" />
        </div>

        {/* Inline create form — replaces the New task button */}
        {showInlineCreate && (
          <div
            ref={formRef}
            className="rounded-xl border p-3"
            style={{
              background: `linear-gradient(rgba(${colorRGB}, 0.06), rgba(${colorRGB}, 0.06)), #181818`,
              borderColor: `rgba(${colorRGB}, 0.2)`,
            }}
          >
            {/* Title */}
            <div className="flex items-center gap-2.5 py-2">
              <Search className="h-4 w-4 text-blue-400 shrink-0" />
              <input
                type="text"
                value={inlineTitle}
                onChange={(e) => setInlineTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave()
                  if (e.key === "Escape") resetForm()
                }}
                placeholder="Type a name..."
                autoFocus
                className="w-full bg-transparent text-[13px] text-white placeholder:text-zinc-500 focus:outline-none"
              />
            </div>

            <div className="h-px bg-white/[0.06]" />

            {/* Assignee */}
            <div className="relative h-[36px]">
              {!showAssigneePicker ? (
                <button
                  onClick={() => { setShowAssigneePicker(true); setShowPriorityPicker(false) }}
                  className="absolute inset-0 flex items-center gap-2.5 text-[13px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer picker-trigger"
                >
                  <Users className="h-4 w-4 shrink-0" />
                  <span>{selectedAssignee ? getMemberName(selectedAssignee) : "Add Assignee"}</span>
                </button>
              ) : (
                <div className="absolute -inset-x-2.5 -top-2 z-30 rounded-xl border border-white/[0.08] bg-[#1e1e1e] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 picker-container">
                  <div className="flex items-center justify-between px-2.5 py-2 border-b border-white/[0.06] bg-white/[0.02]">
                    <div className="flex items-center gap-2 min-w-0">
                      <Users className="h-4 w-4 shrink-0 text-blue-400" />
                      {inlineAssigneeId ? (
                        <span className="text-[13px] text-white font-medium truncate">{getMemberName(selectedAssignee!)}</span>
                      ) : (
                        <span className="text-[13px] text-zinc-400">Select Assignee</span>
                      )}
                    </div>
                    {inlineAssigneeId && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setInlineAssigneeId(null); setShowAssigneePicker(false) }}
                        className="shrink-0 ml-2 p-1 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="p-1 max-h-[200px] overflow-y-auto">
                    {!inlineAssigneeId && members.length === 0 && (
                      <div className="px-2.5 py-2 text-[12px] text-zinc-500">No members available</div>
                    )}
                    {members.filter(m => m.userId !== inlineAssigneeId).map((m) => (
                      <button
                        key={m.userId}
                        onClick={() => { setInlineAssigneeId(m.userId); setShowAssigneePicker(false) }}
                        className="w-full flex items-center px-2 py-1.5 rounded-md text-[13px] text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
                      >
                        <span className="truncate ml-6">{getMemberName(m)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="h-px bg-white/[0.06]" />

            {/* Priority */}
            <div className="relative h-[36px]">
              {!showPriorityPicker ? (
                <button
                  onClick={() => { setShowPriorityPicker(true); setShowAssigneePicker(false) }}
                  className="absolute inset-0 flex items-center gap-2.5 text-[13px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer picker-trigger"
                >
                  <CircleDot className="h-4 w-4 shrink-0" />
                  <span className="flex items-center gap-1.5">
                    {inlinePriority ? (
                      <>
                        <span className={cn("h-2 w-2 rounded-full", priorityOptions.find((p) => p.value === inlinePriority)?.color)} />
                        {priorityOptions.find((p) => p.value === inlinePriority)?.label}
                      </>
                    ) : "Add Priority"}
                  </span>
                </button>
              ) : (
                <div className="absolute -inset-x-2.5 -top-2 z-30 rounded-xl border border-white/[0.08] bg-[#1e1e1e] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 picker-container">
                  <div className="flex items-center justify-between px-2.5 py-2 border-b border-white/[0.06] bg-white/[0.02]">
                    <div className="flex items-center gap-2 min-w-0">
                      <CircleDot className="h-4 w-4 shrink-0 text-amber-400" />
                      {inlinePriority ? (
                        <div className="flex items-center gap-1.5">
                          <span className={cn("h-2 w-2 rounded-full", priorityOptions.find((p) => p.value === inlinePriority)?.color)} />
                          <span className="text-[13px] text-white font-medium truncate">{priorityOptions.find(p => p.value === inlinePriority)?.label}</span>
                        </div>
                      ) : (
                        <span className="text-[13px] text-zinc-400">Select Priority</span>
                      )}
                    </div>
                    {inlinePriority && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setInlinePriority(null); setShowPriorityPicker(false) }}
                        className="shrink-0 ml-2 p-1 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="p-1">
                    {priorityOptions.filter(p => p.value !== inlinePriority).map((p) => (
                      <button
                        key={p.value}
                        onClick={() => { setInlinePriority(p.value); setShowPriorityPicker(false) }}
                        className="w-full flex items-center px-2 py-1.5 rounded-md text-[13px] text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2 ml-6">
                          <span className={cn("h-2 w-2 rounded-full", p.color)} />
                          {p.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* New task button — always visible at the bottom */}
        <button
          onClick={() => setShowInlineCreate(true)}
          className="w-full flex items-center justify-start gap-2 py-2.5 px-3 rounded-xl text-[13px] font-medium transition-colors cursor-pointer"
          style={{
            backgroundColor: `rgba(${colorRGB}, 0.04)`,
            color: `rgba(${colorRGB}, 0.8)`,
            border: `1px solid rgba(${colorRGB}, 0.1)`,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `rgba(${colorRGB}, 0.08)` }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `rgba(${colorRGB}, 0.04)` }}
        >
          <Plus className="h-4 w-4" />
          New task
        </button>
      </div>
      <ColumnEditPanel
        open={isSettingsOpen}
        onClose={() => { setIsSettingsOpen(false); setAnchorRect(null) }}
        column={column}
        projectId={projectId}
        tasks={tasks}
        anchorRect={anchorRect}
      />
    </Reorder.Item>
  )
}
