import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Reorder, useDragControls } from "framer-motion"
import { TaskCard } from "@/features/board/components/task-card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Pencil, Trash2, ArrowLeft, ArrowRight, Palette, Search, Users, CircleDot } from "lucide-react"
import type { Task, Column } from "@/features/tasks/types/tasks.types"
import type { ProjectMember } from "@/features/projects/types/projects.types"
import { useCreateTask, useDeleteColumn, useUpdateColumn } from "@/features/tasks/api/tasks.queries"
import { cn } from "@/lib/utils"

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
  onEditTask: (task: Task) => void
  onDropTask: (taskId: number) => void
  projectId: number
  members?: ProjectMember[]
}

export function KanbanColumn({
  column,
  tasks,
  onEditTask,
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
  const deleteColumn = useDeleteColumn()
  const updateColumn = useUpdateColumn()

  // Inline column rename
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

  // Accept text directly to avoid stale-closure with async setState
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

  const resetForm = () => {
    setShowInlineCreate(false)
    setInlineTitle("")
    setInlinePriority(null)
    setInlineAssigneeId(null)
    setShowPriorityPicker(false)
    setShowAssigneePicker(false)
  }

  const handleSave = () => {
    if (!inlineTitle.trim()) {
      resetForm()
      return
    }
    createTask.mutate(
      {
        projectId,
        data: {
          title: inlineTitle.trim(),
          columnId: column.id,
          priority: inlinePriority || undefined,
          assigneeId: inlineAssigneeId || undefined,
        },
      },
      { onSuccess: resetForm },
    )
  }

  // Ref to always call the latest handleSave (avoids stale closure)
  const handleSaveRef = useRef(handleSave)
  handleSaveRef.current = handleSave

  // Auto-save on click outside
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

  // HTML drag-and-drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current++
    setIsOver(true)
  }
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) setIsOver(false)
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current = 0
    setIsOver(false)
    const taskId = e.dataTransfer.getData("taskId")
    if (taskId) onDropTask(Number(taskId))
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

        {/* Right: menu button */}
        <div className="flex items-center gap-0.5" onPointerDown={(e) => e.stopPropagation()}>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04] transition-colors cursor-pointer">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1e1e1e] border-white/[0.07]">
              <DropdownMenuItem className="text-zinc-300 focus:bg-white/[0.04]" onClick={() => setIsEditingName(true)}>
                <Pencil className="mr-2 h-4 w-4 text-zinc-500" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem className="text-zinc-300 focus:bg-white/[0.04]">
                <Palette className="mr-2 h-4 w-4 text-zinc-500" />
                Change Color
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              <DropdownMenuItem className="text-zinc-300 focus:bg-white/[0.04]">
                <ArrowLeft className="mr-2 h-4 w-4 text-zinc-500" />
                Move Left
              </DropdownMenuItem>
              <DropdownMenuItem className="text-zinc-300 focus:bg-white/[0.04]">
                <ArrowRight className="mr-2 h-4 w-4 text-zinc-500" />
                Move Right
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              <DropdownMenuItem
                className="text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer"
                onClick={() => deleteColumn.mutate({ projectId, columnId: column.id })}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            colorRGB={colorRGB}
            columnId={String(column.id)}
            onEditTask={onEditTask}
          />
        ))}

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
            <div className="relative">
              <button
                onClick={() => { setShowAssigneePicker(!showAssigneePicker); setShowPriorityPicker(false) }}
                className="w-full flex items-center gap-2.5 py-2 text-[13px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <Users className="h-4 w-4 shrink-0" />
                <span>{selectedAssignee ? getMemberName(selectedAssignee) : "Add Assignee"}</span>
              </button>
              {showAssigneePicker && (
                <div className="absolute left-0 top-full z-20 w-full rounded-lg border border-white/[0.07] bg-[#1a1a1a] shadow-xl py-1">
                  <button onClick={() => { setInlineAssigneeId(null); setShowAssigneePicker(false) }}
                    className="w-full text-left px-3 py-1.5 text-[12px] text-zinc-400 hover:bg-white/[0.04] cursor-pointer">
                    Unassigned
                  </button>
                  {members.map((m) => (
                    <button key={m.userId} onClick={() => { setInlineAssigneeId(m.userId); setShowAssigneePicker(false) }}
                      className="w-full text-left px-3 py-1.5 text-[12px] text-zinc-300 hover:bg-white/[0.04] cursor-pointer">
                      {getMemberName(m)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-px bg-white/[0.06]" />

            {/* Priority */}
            <div className="relative">
              <button
                onClick={() => { setShowPriorityPicker(!showPriorityPicker); setShowAssigneePicker(false) }}
                className="w-full flex items-center gap-2.5 py-2 text-[13px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
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
              {showPriorityPicker && (
                <div className="absolute left-0 top-full z-20 w-full rounded-lg border border-white/[0.07] bg-[#1a1a1a] shadow-xl py-1">
                  {priorityOptions.map((p) => (
                    <button key={p.value} onClick={() => { setInlinePriority(p.value); setShowPriorityPicker(false) }}
                      className="w-full text-left px-3 py-1.5 text-[12px] text-zinc-300 hover:bg-white/[0.04] flex items-center gap-2 cursor-pointer">
                      <span className={cn("h-2 w-2 rounded-full", p.color)} />
                      {p.label}
                    </button>
                  ))}
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
    </Reorder.Item>
  )
}
