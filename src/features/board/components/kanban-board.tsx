import { useState } from "react"
import { KanbanColumn } from "@/features/board/components/kanban-column"
import { Reorder } from "framer-motion"
import { Plus } from "lucide-react"
import type { Column, Task } from "@/features/board/types"

const PRIORITY_WEIGHT = { high: 3, medium: 2, low: 1, undefined: 0 } as const

const initialColumns: Column[] = [
  {
    id: "todo",
    title: "To Do",
    color: "slate",
    tasks: [
      {
        id: "TASK-101",
        title: "Design homepage layout",
        labels: [
          { id: "l1", name: "Design", color: "bg-sky-500" },
          { id: "l2", name: "Frontend", color: "bg-violet-500" },
        ],
        assignee: { id: "1", name: "Maria S.", avatar: "/serene-woman.png" },
        dueDate: "2026-01-15",
        priority: "high",
        attachments: 3,
        comments: 5,
        checklist: { completed: 2, total: 5 },
        codeRating: 92,
      },
      {
        id: "TASK-102",
        title: "Setup CI/CD pipeline",
        labels: [{ id: "l3", name: "DevOps", color: "bg-amber-500" }],
        assignee: { id: "2", name: "Dmitry V.", avatar: "/man-face.png" },
        dueDate: "2026-01-20",
        priority: "medium",
        attachments: 0,
        comments: 2,
      },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    color: "amber",
    tasks: [
      {
        id: "TASK-103",
        title: "Payment system integration",
        labels: [
          { id: "l4", name: "Backend", color: "bg-emerald-500" },
          { id: "l5", name: "Feature", color: "bg-violet-500" },
        ],
        assignee: { id: "3", name: "Alex K.", avatar: "/developer-man.png" },
        dueDate: "2026-01-12",
        priority: "high",
        attachments: 2,
        comments: 8,
        checklist: { completed: 4, total: 6 },
        codeRating: 65,
      },
      {
        id: "TASK-104",
        title: "Database performance optimization",
        labels: [{ id: "l4", name: "Backend", color: "bg-emerald-500" }],
        assignee: { id: "2", name: "Dmitry V.", avatar: "/man-face.png" },
        priority: "medium",
        attachments: 1,
        comments: 3,
      },
      {
        id: "TASK-105",
        title: "Write API documentation",
        labels: [{ id: "l6", name: "Docs", color: "bg-slate-400" }],
        assignee: { id: "4", name: "Anna P.", avatar: "/professional-woman.png" },
        dueDate: "2026-01-18",
        priority: "low",
        attachments: 0,
        comments: 1,
      },
    ],
  },
  {
    id: "review",
    title: "In Review",
    color: "purple",
    tasks: [
      {
        id: "TASK-106",
        title: "Review PR for auth module",
        labels: [
          { id: "l4", name: "Backend", color: "bg-emerald-500" },
          { id: "l7", name: "Review", color: "bg-amber-500" },
        ],
        assignee: { id: "1", name: "Maria S.", avatar: "/serene-woman.png" },
        priority: "high",
        attachments: 0,
        comments: 12,
        codeRating: 84,
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    color: "green",
    tasks: [
      {
        id: "TASK-107",
        title: "Setup error monitoring",
        labels: [{ id: "l3", name: "DevOps", color: "bg-amber-500" }],
        assignee: { id: "3", name: "Alex K.", avatar: "/developer-man.png" },
        priority: "medium",
        attachments: 1,
        comments: 4,
        checklist: { completed: 3, total: 3 },
      },
      {
        id: "TASK-108",
        title: "Fix logout bug",
        labels: [
          { id: "l8", name: "Bug", color: "bg-red-500" },
          { id: "l4", name: "Backend", color: "bg-emerald-500" },
        ],
        assignee: { id: "2", name: "Dmitry V.", avatar: "/man-face.png" },
        priority: "high",
        attachments: 0,
        comments: 6,
      },
    ],
  },
]

export function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(initialColumns)

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
    <Reorder.Group
      axis="x"
      values={columns}
      onReorder={setColumns}
      className="flex h-full items-start gap-4 overflow-x-auto p-4"
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
  )
}
