import React, { useState, useRef, useEffect } from "react"
import { Reorder, useDragControls } from "framer-motion"
import { TaskCard } from "@/features/board/components/task-card"
import { Plus, Users, CircleDot, X, Settings, ExternalLink, Trash2, Pencil } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Task, Column } from "@/features/tasks/types/tasks.types"
import type { ProjectMember } from "@/features/projects/types/projects.types"
import { useCreateTask, useUpdateTask, useUpdateColumn, useDeleteTask } from "@/features/tasks/api/tasks.queries"
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
  isZooming?: boolean
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
  isZooming = false,
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
  const updateColumn = useUpdateColumn()
  const deleteTask = useDeleteTask()

  // Inline column rename state
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(column.name)
  const nameSizerRef = useRef<HTMLSpanElement>(null)

  // Auto-focus and select-all when editing starts
  useEffect(() => {
    if (isEditingName && nameSizerRef.current) {
      const el = nameSizerRef.current
      el.focus()
      const range = document.createRange()
      range.selectNodeContents(el)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  }, [isEditingName])

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
  
  const [contextMenuTask, setContextMenuTask] = useState<{ task: Task, x: number, y: number } | null>(null)

  useEffect(() => {
    const handleClose = () => setContextMenuTask(null)
    window.addEventListener('click', handleClose)
    window.addEventListener('mousedown', handleClose)
    return () => {
      window.removeEventListener('click', handleClose)
      window.removeEventListener('mousedown', handleClose)
    }
  }, [])

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

  const handleNameSave = (text: string) => {
    setIsEditingName(false)
    const trimmed = text.trim()
    if (!trimmed || trimmed === column.name) {
      setNameValue(column.name)
      return
    }
    setNameValue(trimmed)
    updateColumn.mutate({
      projectId,
      columnId: column.id,
      data: { name: trimmed },
    })
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
      transition={isZooming ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
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
          if (!isEditingName) {
            e.preventDefault()
            dragControls.start(e)
          }
        }}
      >
        {/* Left: colored name pill + count badge */}
        <div className="flex items-center gap-2">
          {/* Name pill — click to edit, blocks drag propagation */}
          <div
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium cursor-text"
            style={{ backgroundColor: `rgba(${colorRGB}, 0.12)`, color: `rgb(${colorRGB})` }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => {
              if (!isEditingName) setIsEditingName(true)
            }}
          >
            <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: `rgb(${colorRGB})` }} />
            <span className="relative inline-flex items-center">
              {isEditingName ? (
                <span
                  ref={nameSizerRef}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    handleNameSave(e.currentTarget.textContent || "")
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleNameSave(nameSizerRef.current?.textContent || "")
                      nameSizerRef.current?.blur()
                    }
                    if (e.key === "Escape") {
                      if (nameSizerRef.current) nameSizerRef.current.textContent = column.name
                      setNameValue(column.name)
                      setIsEditingName(false)
                    }
                  }}
                  className="bg-transparent text-[13px] font-medium focus:outline-none min-w-[1ch] whitespace-pre"
                >
                  {nameValue}
                </span>
              ) : (
                <span>{column.name}</span>
              )}
            </span>
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
                  className="rounded-xl border p-3.5 space-y-3"
                  style={{
                    background: `linear-gradient(rgba(${colorRGB}, 0.06), rgba(${colorRGB}, 0.06)), #181818`,
                    borderColor: `rgba(${colorRGB}, 0.3)`,
                  }}
                >
                  {/* Title */}
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
                    className="w-full bg-transparent text-[14px] font-medium text-white placeholder:text-zinc-600 focus:outline-none"
                  />

                  {/* Chips row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Assignee chip */}
                    <div className="relative picker-trigger">
                      <button
                        onClick={() => { setShowEditAssigneePicker(!showEditAssigneePicker); setShowEditPriorityPicker(false) }}
                        className={cn(
                          "flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[12px] font-medium border transition-all cursor-pointer picker-trigger",
                          editAssigneeId
                            ? "bg-blue-500/10 border-blue-500/20 text-blue-300"
                            : "bg-white/[0.04] border-white/[0.08] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06]"
                        )}
                      >
                        {editAssigneeId && members.find(m => m.userId === editAssigneeId) ? (
                          <>
                            <Avatar className="h-4 w-4 shrink-0">
                              {members.find(m => m.userId === editAssigneeId)?.user?.avatarUrl && (
                                <AvatarImage src={members.find(m => m.userId === editAssigneeId)!.user!.avatarUrl!} />
                              )}
                              <AvatarFallback className="text-[8px] bg-zinc-700 text-zinc-300">
                                {(members.find(m => m.userId === editAssigneeId)?.user?.firstName?.charAt(0) || members.find(m => m.userId === editAssigneeId)?.user?.login?.charAt(0) || '?').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="max-w-[80px] truncate">{getMemberName(members.find(m => m.userId === editAssigneeId)!)}</span>
                            <button onClick={(e) => { e.stopPropagation(); setEditAssigneeId(null) }} className="ml-0.5 text-blue-400/60 hover:text-blue-300 transition-colors">
                              <X className="h-3 w-3" />
                            </button>
                          </>
                        ) : (
                          <>
                            <Users className="h-3.5 w-3.5" />
                            Assignee
                          </>
                        )}
                      </button>
                      {showEditAssigneePicker && (
                        <div className="absolute left-0 top-full mt-1.5 z-40 w-52 rounded-xl border border-white/[0.1] bg-[#1a1a1a] shadow-2xl shadow-black/60 overflow-hidden picker-container">
                          <div className="p-1.5 max-h-[180px] overflow-y-auto flex flex-col gap-0.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full">
                            {members.length === 0 ? (
                              <div className="px-3 py-2 text-[12px] text-zinc-500">No members</div>
                            ) : members.map((m) => (
                              <button
                                key={m.userId}
                                onClick={() => { setEditAssigneeId(m.userId); setShowEditAssigneePicker(false) }}
                                className={cn(
                                  "w-full flex items-center gap-2.5 px-2.5 py-1 rounded-lg text-[13px] transition-colors cursor-pointer",
                                  m.userId === editAssigneeId
                                    ? "bg-blue-500/10 text-blue-300"
                                    : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                                )}
                              >
                                <Avatar className="h-6 w-6 shrink-0">
                                  {m.user?.avatarUrl && <AvatarImage src={m.user.avatarUrl} alt={getMemberName(m)} />}
                                  <AvatarFallback className="text-[9px] bg-zinc-800 text-zinc-400">
                                    {(m.user?.firstName?.charAt(0) || m.user?.login?.charAt(0) || '?').toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="truncate">{getMemberName(m)}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Priority chip */}
                    <div className="relative picker-trigger">
                      <button
                        onClick={() => { setShowEditPriorityPicker(!showEditPriorityPicker); setShowEditAssigneePicker(false) }}
                        className={cn(
                          "flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[12px] font-medium border transition-all cursor-pointer picker-trigger",
                          editPriority === 'HIGH' ? "bg-red-500/10 border-red-500/20 text-red-400" :
                          editPriority === 'MEDIUM' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                          editPriority === 'LOW' ? "bg-zinc-500/10 border-zinc-500/20 text-zinc-400" :
                          "bg-white/[0.04] border-white/[0.08] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06]"
                        )}
                      >
                        {editPriority ? (
                          <>
                            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", priorityOptions.find(p => p.value === editPriority)?.color)} />
                            {priorityOptions.find(p => p.value === editPriority)?.label}
                            <button onClick={(e) => { e.stopPropagation(); setEditPriority(null) }} className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity">
                              <X className="h-3 w-3" />
                            </button>
                          </>
                        ) : (
                          <>
                            <CircleDot className="h-3.5 w-3.5" />
                            Priority
                          </>
                        )}
                      </button>
                      {showEditPriorityPicker && (
                        <div className="absolute left-0 top-full mt-1.5 z-40 w-40 rounded-xl border border-white/[0.1] bg-[#1a1a1a] shadow-2xl shadow-black/60 overflow-hidden picker-container">
                          <div className="p-1.5 flex flex-col gap-0.5">
                            {priorityOptions.map((p) => (
                              <button
                                key={p.value}
                                onClick={() => { setEditPriority(p.value); setShowEditPriorityPicker(false) }}
                                className={cn(
                                  "w-full flex items-center gap-2.5 px-2.5 py-1 rounded-lg text-[13px] transition-colors cursor-pointer",
                                  p.value === editPriority
                                    ? "bg-white/[0.08] text-white"
                                    : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                                )}
                              >
                                <span className={cn("h-2 w-2 rounded-full shrink-0", p.color)} />
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
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
                  onContextMenu={(task, x, y) => setContextMenuTask({ task, x, y })}
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
            className="rounded-xl border p-3.5 space-y-3"
            style={{
              background: `linear-gradient(rgba(${colorRGB}, 0.06), rgba(${colorRGB}, 0.06)), #181818`,
              borderColor: `rgba(${colorRGB}, 0.2)`,
            }}
          >
            {/* Title */}
            <input
              type="text"
              value={inlineTitle}
              onChange={(e) => setInlineTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave()
                if (e.key === "Escape") resetForm()
              }}
              placeholder="Task name..."
              autoFocus
              className="w-full bg-transparent text-[14px] font-medium text-white placeholder:text-zinc-600 focus:outline-none"
            />

            {/* Chips row */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Assignee chip */}
              <div className="relative picker-trigger">
                <button
                  onClick={() => { setShowAssigneePicker(!showAssigneePicker); setShowPriorityPicker(false) }}
                  className={cn(
                    "flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[12px] font-medium border transition-all cursor-pointer picker-trigger",
                    inlineAssigneeId
                      ? "bg-blue-500/10 border-blue-500/20 text-blue-300"
                      : "bg-white/[0.04] border-white/[0.08] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06]"
                  )}
                >
                  {inlineAssigneeId && selectedAssignee ? (
                    <>
                      <Avatar className="h-4 w-4 shrink-0">
                        {selectedAssignee.user?.avatarUrl && <AvatarImage src={selectedAssignee.user.avatarUrl} />}
                        <AvatarFallback className="text-[8px] bg-zinc-700 text-zinc-300">
                          {(selectedAssignee.user?.firstName?.charAt(0) || selectedAssignee.user?.login?.charAt(0) || '?').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="max-w-[80px] truncate">{getMemberName(selectedAssignee)}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setInlineAssigneeId(null) }}
                        className="ml-0.5 text-blue-400/60 hover:text-blue-300 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Users className="h-3.5 w-3.5" />
                      Assignee
                    </>
                  )}
                </button>
                {showAssigneePicker && (
                  <div className="absolute left-0 bottom-full mb-1.5 z-40 w-52 rounded-xl border border-white/[0.1] bg-[#1a1a1a] shadow-2xl shadow-black/60 overflow-hidden picker-container">
                    <div className="p-1.5 max-h-[180px] overflow-y-auto flex flex-col gap-0.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full">
                      {members.length === 0 ? (
                        <div className="px-3 py-2 text-[12px] text-zinc-500">No members</div>
                      ) : members.map((m) => (
                        <button
                          key={m.userId}
                          onClick={() => { setInlineAssigneeId(m.userId); setShowAssigneePicker(false) }}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-2.5 py-1 rounded-lg text-[13px] transition-colors cursor-pointer",
                            m.userId === inlineAssigneeId
                              ? "bg-blue-500/10 text-blue-300"
                              : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                          )}
                        >
                          <Avatar className="h-6 w-6 shrink-0">
                            {m.user?.avatarUrl && <AvatarImage src={m.user.avatarUrl} alt={getMemberName(m)} />}
                            <AvatarFallback className="text-[9px] bg-zinc-800 text-zinc-400">
                              {(m.user?.firstName?.charAt(0) || m.user?.login?.charAt(0) || '?').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate">{getMemberName(m)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Priority chip */}
              <div className="relative picker-trigger">
                <button
                  onClick={() => { setShowPriorityPicker(!showPriorityPicker); setShowAssigneePicker(false) }}
                  className={cn(
                    "flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[12px] font-medium border transition-all cursor-pointer picker-trigger",
                    inlinePriority === 'HIGH' ? "bg-red-500/10 border-red-500/20 text-red-400" :
                    inlinePriority === 'MEDIUM' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                    inlinePriority === 'LOW' ? "bg-zinc-500/10 border-zinc-500/20 text-zinc-400" :
                    "bg-white/[0.04] border-white/[0.08] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06]"
                  )}
                >
                  {inlinePriority ? (
                    <>
                      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", priorityOptions.find(p => p.value === inlinePriority)?.color)} />
                      {priorityOptions.find(p => p.value === inlinePriority)?.label}
                      <button
                        onClick={(e) => { e.stopPropagation(); setInlinePriority(null) }}
                        className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <>
                      <CircleDot className="h-3.5 w-3.5" />
                      Priority
                    </>
                  )}
                </button>
                {showPriorityPicker && (
                  <div className="absolute left-0 bottom-full mb-1.5 z-40 w-40 rounded-xl border border-white/[0.1] bg-[#1a1a1a] shadow-2xl shadow-black/60 overflow-hidden picker-container">
                    <div className="p-1.5 flex flex-col gap-0.5">
                      {priorityOptions.map((p) => (
                        <button
                          key={p.value}
                          onClick={() => { setInlinePriority(p.value); setShowPriorityPicker(false) }}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-2.5 py-1 rounded-lg text-[13px] transition-colors cursor-pointer",
                            p.value === inlinePriority
                              ? "bg-white/[0.08] text-white"
                              : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                          )}
                        >
                          <span className={cn("h-2 w-2 rounded-full shrink-0", p.color)} />
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
        members={members}
      />

      {contextMenuTask && (
        <div 
          className="fixed z-50 w-44 bg-[#1e1e1e] border border-white/[0.07] p-1.5 rounded-xl shadow-2xl"
          style={{ 
            top: contextMenuTask.y, 
            left: contextMenuTask.x,
            transform: `translate(${contextMenuTask.x + 180 > window.innerWidth ? '-100%' : '0px'}, ${contextMenuTask.y + 160 > window.innerHeight ? '-100%' : '0px'})`
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={() => { onOpenPanel(contextMenuTask.task); setContextMenuTask(null) }} 
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] text-zinc-300 hover:bg-white/[0.06] hover:text-white cursor-pointer transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Open Task</span>
          </button>
          <button 
            onClick={() => { handleInlineEditTask(contextMenuTask.task); setContextMenuTask(null) }} 
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] text-zinc-300 hover:bg-white/[0.06] hover:text-white cursor-pointer transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Quick Edit</span>
          </button>
          <div className="h-px bg-white/[0.06] my-1" />
          <button 
            onClick={() => {
              deleteTask.mutate(contextMenuTask.task.id)
              setContextMenuTask(null)
            }} 
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] text-red-400 hover:bg-red-500/10 hover:text-red-400 cursor-pointer transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Task</span>
          </button>
        </div>
      )}
    </Reorder.Item>
  )
}
