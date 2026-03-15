import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Pencil } from "lucide-react"
import type { Task } from "@/features/tasks/types/tasks.types"

declare global {
  interface Window {
    __draggingTaskPriority?: string
    __draggingTaskId?: string
  }
}

interface TaskCardProps {
  task: Task
  colorRGB?: string
  onEditTask: (task: Task) => void
  onOpenPanel: (task: Task) => void
}

export function TaskCard({ task, colorRGB, onEditTask, onOpenPanel }: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const dragGhostRef = useRef<HTMLElement | null>(null)
  const dragOffset = useRef({ x: 0, y: 0 })

  const getPriorityStyle = (priority?: string | null) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20"
      case "LOW":
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
      default:
        return "bg-white/5 text-zinc-500 border-white/10"
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

  const mockScore = 40 + ((task.id * 17) % 61)
  const getScoreStyle = (score: number) => {
    if (score >= 80) return "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20"
    if (score >= 50) return "text-amber-400 bg-amber-500/10 ring-amber-500/20"
    return "text-red-400 bg-red-500/10 ring-red-500/20"
  }

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
      onDragStart={(e) => {
        handleDragStart(e)
        // Store the priority globally during the drag so dragOver can read it securely
        window.__draggingTaskPriority = task.priority || "none"
        window.__draggingTaskId = task.id.toString()
        // Ensure dataTransfer has the taskId
        e.dataTransfer.setData("taskId", task.id.toString())
      }}
      onDrag={handleDrag}
      onDragEnd={() => {
        handleDragEnd()
        window.__draggingTaskPriority = undefined
        window.__draggingTaskId = undefined
      }}
      data-priority={task.priority || "none"}
      className={cn(
        "group relative cursor-pointer rounded-xl border p-3.5 transition-all hover:brightness-110",
        isDragging && "opacity-50 cursor-grabbing scale-[0.98]",
      )}
      style={{
        background: colorRGB
          ? `linear-gradient(rgba(${colorRGB}, 0.08), rgba(${colorRGB}, 0.08)), #181818`
          : "#181818",
        borderColor: colorRGB ? `rgba(${colorRGB}, 0.12)` : "rgba(255,255,255,0.06)",
      }}
      onClick={() => onOpenPanel(task)}
    >
      {/* Quick edit button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onEditTask(task)
        }}
        className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-md bg-[#181818] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-zinc-800 cursor-pointer border border-white/10 shadow-sm"
      >
        <Pencil className="h-3 w-3 text-zinc-400" />
      </button>

      {/* Title */}
      <h4 className="mb-3 pr-6 text-[16px] font-semibold leading-snug text-zinc-100">{task.title}</h4>

      {/* Assignee */}
      {assigneeName && (
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-5 w-5 ring-1 ring-white/[0.06]">
            {task.assignee?.avatarUrl && <AvatarImage src={task.assignee.avatarUrl} alt={assigneeName} />}
            <AvatarFallback className="text-[9px] bg-zinc-800 text-zinc-500">{assigneeInitial}</AvatarFallback>
          </Avatar>
          <span className="text-[11px] text-zinc-500">{assigneeName}</span>
        </div>
      )}

      {/* Bottom row */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-600">
        <div className="flex flex-wrap items-center gap-2">
          {/* Task ID Badge */}
          <div className="flex h-5 items-center rounded border border-white/5 bg-white/5 px-1.5 text-[10px] font-mono font-medium text-zinc-400">
            #{task.id}
          </div>
          {/* Priority Badge */}
          <div className={cn(
            "flex h-5 items-center rounded border px-1.5 text-[10px] font-bold uppercase tracking-wider",
            getPriorityStyle(task.priority)
          )}>
            {getPriorityLabel(task.priority)}
          </div>
        </div>

        {/* Task Score */}
        <div 
          className={cn("flex shrink-0 h-6 w-6 items-center justify-center rounded-full ring-1 text-[9px] font-bold shadow-sm", getScoreStyle(mockScore))}
          title="Task Health Score"
        >
          {mockScore}
        </div>
      </div>
    </div>
  )
}
