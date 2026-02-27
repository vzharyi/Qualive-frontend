import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Pencil } from "lucide-react"
import type { Task } from "@/features/tasks/types/tasks.types"

interface TaskCardProps {
  task: Task
  colorRGB?: string
  columnId: string
  onEditTask: (task: Task) => void
}

export function TaskCard({ task, colorRGB, columnId, onEditTask }: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const dragGhostRef = useRef<HTMLElement | null>(null)
  const dragOffset = useRef({ x: 0, y: 0 })

  const getPriorityColor = (priority?: string | null) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-500"
      case "MEDIUM":
        return "bg-amber-500"
      case "LOW":
        return "bg-zinc-500"
      default:
        return "bg-zinc-600"
    }
  }

  const getPriorityLabel = (priority?: string | null) => {
    switch (priority) {
      case "HIGH":
        return "High"
      case "MEDIUM":
        return "Medium"
      case "LOW":
        return "Low"
      default:
        return "—"
    }
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("taskId", String(task.id))

    // Hide native ghost
    const blankImg = new Image()
    blankImg.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    e.dataTransfer.setDragImage(blankImg, 0, 0)

    // Clone for custom ghost
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }

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

    setTimeout(() => setIsDragging(true), 0)
  }

  const handleDrag = (e: React.DragEvent) => {
    if (e.clientX === 0 && e.clientY === 0) return
    if (dragGhostRef.current) {
      dragGhostRef.current.style.transform = `translate(${e.clientX - dragOffset.current.x}px, ${e.clientY - dragOffset.current.y}px)`
    }
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    if (dragGhostRef.current?.parentNode) {
      dragGhostRef.current.parentNode.removeChild(dragGhostRef.current)
      dragGhostRef.current = null
    }
    document.querySelectorAll('[data-drag-ghost="true"]').forEach((el) => el.remove())
  }

  useEffect(() => {
    return () => {
      if (dragGhostRef.current?.parentNode) {
        dragGhostRef.current.parentNode.removeChild(dragGhostRef.current)
      }
    }
  }, [])

  // Assignee display
  const assigneeName = task.assignee
    ? task.assignee.firstName && task.assignee.lastName
      ? `${task.assignee.firstName} ${task.assignee.lastName}`
      : task.assignee.login
    : null

  const assigneeInitial = task.assignee
    ? task.assignee.firstName?.charAt(0) || task.assignee.login.charAt(0)
    : null

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      className={cn(
        "group relative cursor-grab rounded-xl border p-3.5 transition-all hover:brightness-110",
        isDragging && "opacity-50 cursor-grabbing scale-[0.98]",
      )}
      style={{
        background: colorRGB
          ? `linear-gradient(rgba(${colorRGB}, 0.08), rgba(${colorRGB}, 0.08)), #181818`
          : "#181818",
        borderColor: colorRGB ? `rgba(${colorRGB}, 0.12)` : "rgba(255,255,255,0.06)",
      }}
    >
      {/* Quick edit button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onEditTask(task)
        }}
        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.06] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/[0.1] cursor-pointer"
      >
        <Pencil className="h-3 w-3 text-zinc-400" />
      </button>

      {/* Title */}
      <h4 className="mb-2 pr-6 text-[13px] font-medium leading-snug text-zinc-200">{task.title}</h4>

      {/* Assignee */}
      {assigneeName && (
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-5 w-5 ring-1 ring-white/[0.06]">
            {task.assignee?.avatarUrl && <AvatarImage src={task.assignee.avatarUrl} alt={assigneeName} />}
            <AvatarFallback className="text-[9px] bg-zinc-800 text-zinc-500">{assigneeInitial}</AvatarFallback>
          </Avatar>
          <span className="text-[11px] text-zinc-500">{assigneeName}</span>
        </div>
      )}

      {/* Bottom row */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-600">
        <span className="text-[10px] text-zinc-600">
          #{task.id}
        </span>
        <div className="flex items-center gap-2">
          {/* Priority indicator */}
          <div className="flex items-center gap-1">
            <div
              className={cn("h-2 w-2 rounded-full", getPriorityColor(task.priority))}
              title={`Priority: ${getPriorityLabel(task.priority)}`}
            />
            <span className="text-[10px]">{getPriorityLabel(task.priority)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
