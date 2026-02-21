import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Paperclip, MessageSquare, CheckSquare, Calendar, Pencil } from "lucide-react"
import type { Task } from "@/features/board/types"

interface TaskCardProps {
  task: Task
  colorRGB?: string
  columnId: string
  onDragStart: (task: Task, columnId: string) => void
  onDragEnd: () => void
  onDrop: (columnId: string, targetTaskId?: string, position?: "top" | "bottom") => void
  draggedTask?: Task | null
  previousTaskId?: string
  nextTaskId?: string
}

export function TaskCard({ task, colorRGB, columnId, onDragStart, onDragEnd, onDrop, draggedTask, previousTaskId, nextTaskId }: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragHover, setDragHover] = useState<"top" | "bottom" | null>(null)
  const dragGhostRef = useRef<HTMLElement | null>(null)
  const dragOffset = useRef({ x: 0, y: 0 })

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short" })
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-amber-500"
      case "low":
        return "bg-zinc-500"
      default:
        return "bg-zinc-500"
    }
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move"

    // 1. Hide the native ghost by setting an invisible image
    const blankImg = new Image()
    blankImg.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    e.dataTransfer.setDragImage(blankImg, 0, 0)

    // 2. Clone the element for our custom fixed ghost
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()

    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }

    const ghost = target.cloneNode(true) as HTMLElement
    ghost.setAttribute("data-drag-ghost", "true")
    ghost.style.position = "fixed"
    ghost.style.top = "0px"
    ghost.style.left = "0px"
    ghost.style.width = `${rect.width}px`
    ghost.style.height = `${rect.height}px`
    ghost.style.pointerEvents = "none"
    ghost.style.zIndex = "9999"
    ghost.style.transform = `translate(${e.clientX - dragOffset.current.x}px, ${e.clientY - dragOffset.current.y}px)`
    ghost.style.boxShadow = "0 20px 40px rgba(0,0,0,0.5)"
    ghost.style.opacity = "0.4"
    ghost.style.transition = "none"

    document.body.appendChild(ghost)
    dragGhostRef.current = ghost

    setTimeout(() => {
      setIsDragging(true)
    }, 0)

    onDragStart(task, columnId)
  }

  const handleDrag = (e: React.DragEvent) => {
    // Chrome sometimes fires a last drag event with 0,0
    if (e.clientX === 0 && e.clientY === 0) return

    if (dragGhostRef.current) {
      dragGhostRef.current.style.transform = `translate(${e.clientX - dragOffset.current.x}px, ${e.clientY - dragOffset.current.y}px)`
    }
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    if (dragGhostRef.current && dragGhostRef.current.parentNode) {
      dragGhostRef.current.parentNode.removeChild(dragGhostRef.current)
      dragGhostRef.current = null
    }
    // Clean up any stray ghosts that might have lost their ref connection
    document.querySelectorAll('[data-drag-ghost="true"]').forEach(el => el.remove())
    onDragEnd()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (isDragging || !draggedTask) return

    if (draggedTask.priority !== task.priority) return
    if (draggedTask.id === task.id) return

    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const position = y < rect.height / 2 ? "top" : "bottom"

    if (position === "top" && draggedTask.id === previousTaskId) return

    if (position === "bottom" && draggedTask.id === nextTaskId) return

    setDragHover(position)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragHover(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const position = dragHover || "top"
    setDragHover(null)
    onDrop(columnId, task.id, position)
  }

  useEffect(() => {
    return () => {
      if (dragGhostRef.current && dragGhostRef.current.parentNode) {
        dragGhostRef.current.parentNode.removeChild(dragGhostRef.current)
      }
    }
  }, [])

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "group relative cursor-grab rounded-xl border p-3.5 transition-all hover:brightness-110",
        "before:absolute before:-top-1 before:left-0 before:h-1 before:w-full before:content-['']",
        "after:absolute after:-bottom-1 after:left-0 after:h-1 after:w-full after:content-['']",
        isDragging && "opacity-50 cursor-grabbing scale-[0.98]",
      )}
      style={{
        background: colorRGB
          ? `linear-gradient(rgba(${colorRGB}, 0.08), rgba(${colorRGB}, 0.08)), #181818`
          : "#181818",
        borderColor: colorRGB ? `rgba(${colorRGB}, 0.12)` : "rgba(255,255,255,0.06)",
      }}
    >
      {/* Drop Indicators */}
      {dragHover === "top" && (
        <div
          className="pointer-events-none absolute left-0 z-50 w-full rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
          style={{ top: "-5px", height: "2px" }}
        />
      )}
      {dragHover === "bottom" && (
        <div
          className="pointer-events-none absolute left-0 z-50 w-full rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
          style={{ bottom: "-5px", height: "2px" }}
        />
      )}
      {/* Quick edit button */}
      <button className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.06] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/[0.1] cursor-pointer">
        <Pencil className="h-3 w-3 text-zinc-400" />
      </button>

      {/* Title */}
      <h4 className="mb-2 pr-6 text-[13px] font-medium leading-snug text-zinc-200">{task.title}</h4>

      {/* Assignee */}
      {task.assignee && (
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-5 w-5 ring-1 ring-white/[0.06]">
            <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} alt={task.assignee.name} />
            <AvatarFallback className="text-[9px] bg-zinc-800 text-zinc-500">{task.assignee.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-[11px] text-zinc-500">{task.assignee.name}</span>
        </div>
      )}

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.labels.map((label) => (
            <span
              key={label.id}
              className={cn("inline-flex h-[18px] items-center px-1.5 rounded text-[10px] font-medium text-white/90", label.color)}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Bottom row with meta info */}
      {(task.dueDate || task.attachments > 0 || task.checklist || task.comments > 0) && (
        <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-600">
          <div className="flex items-center gap-3">
            {/* Due date */}
            {task.dueDate && (
              <div className={cn("flex items-center gap-1", isOverdue && "text-red-400")}>
                <Calendar className="h-3 w-3" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}

            {/* Attachments */}
            {task.attachments > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                <span>{task.attachments}</span>
              </div>
            )}

            {/* Checklist */}
            {task.checklist && (
              <div
                className={cn(
                  "flex items-center gap-1",
                  task.checklist.completed === task.checklist.total && "text-emerald-500",
                )}
              >
                <CheckSquare className="h-3 w-3" />
                <span>
                  {task.checklist.completed}/{task.checklist.total}
                </span>
              </div>
            )}

            {/* Comments */}
            {task.comments > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{task.comments}</span>
              </div>
            )}
          </div>

          {/* Priority indicator */}
          <div
            className={cn("h-2 w-2 rounded-full", getPriorityColor(task.priority))}
            title={`Priority: ${task.priority}`}
          />
        </div>
      )}
    </div>
  )
}
