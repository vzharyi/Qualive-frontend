import type React from "react"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Paperclip, MessageSquare, CheckSquare, Calendar, Pencil } from "lucide-react"
import type { Task } from "@/types/kanban"

interface TaskCardProps {
  task: Task
  colorRGB?: string
  columnId: string
  onDragStart: (task: Task, columnId: string) => void
  onDragEnd: () => void
}

export function TaskCard({ task, colorRGB, columnId, onDragStart, onDragEnd }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short" })
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-destructive"
      case "medium":
        return "bg-warning"
      case "low":
        return "bg-muted-foreground"
      default:
        return "bg-muted-foreground"
    }
  }

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.effectAllowed = "move"
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement
    dragImage.style.transform = "rotate(3deg)"
    dragImage.style.opacity = "0.95"
    dragImage.style.boxShadow = "0 10px 40px rgba(0, 0, 0, 0.5)"
    dragImage.style.position = "absolute"
    dragImage.style.top = "-9999px"
    dragImage.style.width = `${(e.currentTarget as HTMLElement).offsetWidth}px`
    document.body.appendChild(dragImage)
    e.dataTransfer.setDragImage(dragImage, e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    setTimeout(() => document.body.removeChild(dragImage), 0)
    onDragStart(task, columnId)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    onDragEnd()
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        "group relative cursor-grab rounded-lg p-3 transition-all hover:brightness-110",
        isDragging && "opacity-40 cursor-grabbing scale-[0.98]",
      )}
      style={{ backgroundColor: colorRGB ? `rgba(${colorRGB}, 0.15)` : undefined }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Quick edit button */}
      {isHovered && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-2 top-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Pencil className="h-3 w-3" />
        </Button>
      )}

      {/* Title */}
      <h4 className="mb-2 text-sm font-medium leading-snug text-foreground">{task.title}</h4>

      {/* Assignee */}
      {task.assignee && (
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-5 w-5">
            <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} alt={task.assignee.name} />
            <AvatarFallback className="text-[10px]">{task.assignee.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{task.assignee.name}</span>
        </div>
      )}

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.labels.map((label) => (
            <Badge
              key={label.id}
              variant="secondary"
              className={cn("h-5 px-2 text-[10px] font-medium", label.color, "text-white")}
            >
              {label.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Bottom row with meta info - only show if has any meta */}
      {(task.dueDate || task.attachments > 0 || task.checklist || task.comments > 0) && (
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {/* Due date */}
            {task.dueDate && (
              <div className={cn("flex items-center gap-1", isOverdue && "text-destructive")}>
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
                  task.checklist.completed === task.checklist.total && "text-primary",
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
