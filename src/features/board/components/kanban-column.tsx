import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { TaskCard } from "@/features/board/components/task-card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Pencil, Trash2, ArrowLeft, ArrowRight, Palette } from "lucide-react"
import type { Column, Task } from "@/features/board/types"

interface KanbanColumnProps {
  column: Column
  onDragStart: (task: Task, columnId: string) => void
  onDragEnd: () => void
  onDrop: (columnId: string) => void
  isDragOver?: boolean
}

const columnColors: Record<string, string> = {
  slate: "148, 163, 184",
  blue: "59, 130, 246",
  amber: "245, 158, 11",
  green: "34, 197, 94",
  red: "239, 68, 68",
  purple: "168, 85, 247",
  pink: "236, 72, 153",
  cyan: "6, 182, 212",
}

export function KanbanColumn({ column, onDragStart, onDragEnd, onDrop, isDragOver }: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false)
  const dragCounter = useRef(0)
  const colorRGB = columnColors[column.color] || columnColors.slate

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current++
    setIsOver(true)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsOver(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current = 0
    setIsOver(false)
    onDrop(column.id)
  }

  return (
    <div
      className="flex h-fit w-72 flex-shrink-0 flex-col rounded-xl p-3 transition-all"
      style={{
        backgroundColor: `rgba(${colorRGB}, 0.08)`,
        outline: isOver ? `2px dashed rgb(${colorRGB})` : "none",
        outlineOffset: "-2px",
      }}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="rounded-md px-2.5 py-1 text-sm font-semibold"
            style={{ backgroundColor: `rgb(${colorRGB})`, color: "#1a1a1a" }}
          >
            {column.title}
          </span>
          <span className="text-sm text-muted-foreground">{column.tasks.length}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Palette className="mr-2 h-4 w-4" />
              Change Color
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Move Left
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ArrowRight className="mr-2 h-4 w-4" />
              Move Right
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col gap-2">
        {column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            colorRGB={colorRGB}
            columnId={column.id}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}

        <Button
          variant="ghost"
          className="w-full justify-start gap-2 hover:bg-white/5"
          style={{ color: `rgb(${colorRGB})` }}
        >
          <Plus className="h-4 w-4" />
          New page
        </Button>
      </div>
    </div>
  )
}
