import type React from "react"

import { useState, useRef, useEffect } from "react"
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
  onDrop: (columnId: string, targetTaskId?: string, position?: "top" | "bottom") => void
  isDraggingBoard?: boolean
  draggedTask?: Task | null
}

const columnColors: Record<string, string> = {
  slate: "148, 163, 184",
  blue: "96, 165, 250",
  amber: "251, 191, 36",
  green: "52, 211, 153",
  red: "248, 113, 113",
  purple: "192, 132, 252",
  pink: "244, 114, 182",
  cyan: "34, 211, 238",
}

export function KanbanColumn({ column, onDragStart, onDragEnd, onDrop, isDraggingBoard, draggedTask }: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false)
  const dragCounter = useRef(0)
  const colorRGB = columnColors[column.color] || columnColors.slate

  // Guaranteed cleanup: when the board stops dragging entirely, reset our local hover state.
  useEffect(() => {
    if (!isDraggingBoard) {
      setIsOver(false)
      dragCounter.current = 0
    }
  }, [isDraggingBoard])

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
      className="flex h-fit w-[300px] flex-shrink-0 flex-col rounded-xl transition-all"
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
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div
          className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium"
          style={{ backgroundColor: `rgba(${colorRGB}, 0.12)`, color: `rgb(${colorRGB})` }}
        >
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: `rgb(${colorRGB})` }} />
          {column.title}
          <span className="ml-1 opacity-70 text-[11px] font-bold">{column.tasks.length}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04] transition-colors cursor-pointer">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#1e1e1e] border-white/[0.07]">
            <DropdownMenuItem className="text-zinc-300 focus:bg-white/[0.04]">
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
            <DropdownMenuItem className="text-red-400 focus:bg-red-500/10 focus:text-red-300">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col gap-2">
        {column.tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            colorRGB={colorRGB}
            columnId={column.id}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDrop={onDrop}
            draggedTask={draggedTask}
            previousTaskId={index > 0 ? column.tasks[index - 1].id : undefined}
            nextTaskId={index < column.tasks.length - 1 ? column.tasks[index + 1].id : undefined}
          />
        ))}

        {/* New Task Button - moved into the card list flow */}
        <button
          className="w-full flex items-center justify-start gap-2 py-2.5 px-3 rounded-xl text-[13px] font-medium transition-colors cursor-pointer"
          style={{
            backgroundColor: `rgba(${colorRGB}, 0.04)`,
            color: `rgba(${colorRGB}, 0.8)`,
            border: `1px solid rgba(${colorRGB}, 0.1)`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `rgba(${colorRGB}, 0.08)`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = `rgba(${colorRGB}, 0.04)`
          }}
        >
          <Plus className="h-4 w-4" />
          New task
        </button>
      </div>
    </div>
  )
}
