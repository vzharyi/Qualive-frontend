import { useState } from "react"
import { KanbanColumn } from "@/features/board/components/kanban-column"
import { Reorder } from "framer-motion"
import { Plus } from "lucide-react"
import type { Column, Task } from "@/features/board/types"
import type { Project } from "@/features/projects/types/projects.types"

const PRIORITY_WEIGHT = { high: 3, medium: 2, low: 1, undefined: 0 } as const

// Empty initial columns for a new project
const emptyColumns: Column[] = [
  { id: "todo", title: "To Do", color: "slate", tasks: [] },
  { id: "in-progress", title: "In Progress", color: "amber", tasks: [] },
  { id: "review", title: "In Review", color: "purple", tasks: [] },
  { id: "done", title: "Done", color: "green", tasks: [] },
]

interface KanbanBoardProps {
  project: Project
}

export function KanbanBoard({ project }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>(emptyColumns)

  // Task Drag State
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [sourceColumnId, setSourceColumnId] = useState<string | null>(null)

  const handleDragStart = (task: Task, columnId: string) => {
    setDraggedTask(task)
    setSourceColumnId(columnId)
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
    setSourceColumnId(null)
  }

  const handleDrop = (targetColumnId: string, targetTaskId?: string, position?: "top" | "bottom") => {
    if (!draggedTask || !sourceColumnId) return
    if (sourceColumnId === targetColumnId && targetTaskId === draggedTask.id) return

    setColumns((prevColumns) => {
      // First, remove task from source column
      const columnsAfterRemove = prevColumns.map((column) => {
        if (column.id === sourceColumnId) {
          return {
            ...column,
            tasks: column.tasks.filter((task) => task.id !== draggedTask.id),
          }
        }
        return column
      })

      // Then add into target column
      return columnsAfterRemove.map((column) => {
        if (column.id === targetColumnId) {
          const newTasks = [...column.tasks]
          if (targetTaskId) {
            const index = newTasks.findIndex((t) => t.id === targetTaskId)
            if (index !== -1) {
              const insertIndex = position === "bottom" ? index + 1 : index
              newTasks.splice(insertIndex, 0, draggedTask)
            } else {
              newTasks.push(draggedTask)
            }
          } else {
            newTasks.push(draggedTask)
          }

          // Stable sort by priority
          newTasks.sort((a, b) => {
            const weightA = PRIORITY_WEIGHT[a.priority as keyof typeof PRIORITY_WEIGHT] || 0
            const weightB = PRIORITY_WEIGHT[b.priority as keyof typeof PRIORITY_WEIGHT] || 0
            return weightB - weightA // descending
          })

          return { ...column, tasks: newTasks }
        }
        return column
      })
    })

    handleDragEnd()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Project title bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04]">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-emerald-400/20 to-violet-500/20 text-[10px] font-bold text-white">
          {project.name.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-[15px] font-semibold text-white tracking-tight">{project.name}</h2>
        {project.description && (
          <span className="text-[12px] text-zinc-600 ml-1 hidden sm:inline">— {project.description}</span>
        )}
      </div>

      {/* Board */}
      <Reorder.Group
        axis="x"
        values={columns}
        onReorder={setColumns}
        className="flex flex-1 items-start gap-4 overflow-x-auto p-4"
      >
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            isDraggingBoard={!!draggedTask}
            draggedTask={draggedTask}
          />
        ))}

        {/* Add column button */}
        <div className="flex-shrink-0">
          <button className="flex h-10 w-72 items-center justify-start gap-2 rounded-xl border border-dashed border-white/[0.06] bg-white/[0.02] px-4 text-[13px] text-zinc-600 hover:bg-white/[0.04] hover:text-zinc-400 hover:border-white/[0.1] transition-all cursor-pointer">
            <Plus className="h-4 w-4" />
            Add Column
          </button>
        </div>
      </Reorder.Group>
    </div>
  )
}
