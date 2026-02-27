import { useState, useMemo } from "react"
import { KanbanColumn } from "@/features/board/components/kanban-column"
import { TaskEditPanel } from "@/features/board/components/task-edit-panel"
import { Reorder } from "framer-motion"
import { Plus, Loader2 } from "lucide-react"
import type { Project } from "@/features/projects/types/projects.types"
import type { Task, Column } from "@/features/tasks/types/tasks.types"
import { useTasks, useColumns, useUpdateTask, useUpdateColumn } from "@/features/tasks/api/tasks.queries"

interface KanbanBoardProps {
  project: Project
}

export function KanbanBoard({ project }: KanbanBoardProps) {
  const { data: columns, isLoading: columnsLoading } = useColumns(project.id)
  const { data: tasks, isLoading: tasksLoading } = useTasks({ projectId: project.id })
  const updateTask = useUpdateTask()
  const updateColumn = useUpdateColumn()

  // Edit panel state
  const [editPanelOpen, setEditPanelOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Column order (from API, draggable locally)
  const [columnOrder, setColumnOrder] = useState<Column[] | null>(null)

  // Use API columns sorted by order, or local reordered state
  const orderedColumns = useMemo(() => {
    if (columnOrder !== null) return columnOrder
    if (!columns) return []
    return [...columns].sort((a, b) => a.order - b.order)
  }, [columns, columnOrder])

  // When new columns arrive from API, reset local order
  useMemo(() => {
    if (columns) setColumnOrder(null)
  }, [columns])

  // Group tasks by columnId
  const tasksByColumn = useMemo(() => {
    const grouped: Record<number, Task[]> = {}
    if (tasks) {
      tasks.forEach((task) => {
        if (!grouped[task.columnId]) grouped[task.columnId] = []
        grouped[task.columnId].push(task)
      })
    }
    return grouped
  }, [tasks])

  // Drag task to another column → update columnId
  const handleTaskDrop = (taskId: number, targetColumnId: number) => {
    const task = tasks?.find((t) => t.id === taskId)
    if (!task || task.columnId === targetColumnId) return
    updateTask.mutate({ id: taskId, data: { columnId: targetColumnId } })
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setEditPanelOpen(true)
  }

  const handleClosePanel = () => {
    setEditPanelOpen(false)
    setEditingTask(null)
  }

  // Handle column reordering — update order values via API
  const handleColumnsReorder = (newOrder: Column[]) => {
    setColumnOrder(newOrder)
    // Update order for each column that changed position
    newOrder.forEach((col, idx) => {
      if (col.order !== idx) {
        updateColumn.mutate({
          projectId: project.id,
          columnId: col.id,
          data: { order: idx },
        })
      }
    })
  }

  if (columnsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 text-zinc-600 animate-spin" />
      </div>
    )
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
        <span className="ml-auto text-[11px] text-zinc-600">{tasks?.length ?? 0} tasks</span>
      </div>

      {/* Board */}
      <Reorder.Group
        axis="x"
        values={orderedColumns}
        onReorder={handleColumnsReorder}
        className="flex flex-1 items-start gap-4 overflow-x-auto p-4"
      >
        {orderedColumns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasksByColumn[column.id] || []}
            onEditTask={handleEditTask}
            onDropTask={(taskId) => handleTaskDrop(taskId, column.id)}
            projectId={project.id}
            members={project.members}
          />
        ))}

        {/* Add column button */}
        <div className="flex-shrink-0">
          <button className="flex h-10 w-64 items-center justify-start gap-2 rounded-xl border border-dashed border-white/[0.06] bg-white/[0.02] px-4 text-[13px] text-zinc-600 hover:bg-white/[0.04] hover:text-zinc-400 hover:border-white/[0.1] transition-all cursor-pointer">
            <Plus className="h-4 w-4" />
            Add Column
          </button>
        </div>
      </Reorder.Group>

      {/* Task Edit Panel */}
      <TaskEditPanel
        open={editPanelOpen}
        onClose={handleClosePanel}
        task={editingTask}
        projectId={project.id}
        members={project.members}
        columns={orderedColumns}
      />
    </div>
  )
}
