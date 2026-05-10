import { useState, useMemo, useRef, useCallback, useEffect } from "react"
import { KanbanColumn } from "@/features/board/components/kanban-column"
import { TaskEditPanel } from "@/features/board/components/task-edit-panel"
import { Reorder } from "framer-motion"
import { Loader2, ZoomIn, Minus, Plus } from "lucide-react"
import type { Project } from "@/features/projects/types/projects.types"
import type { Task, Column } from "@/features/tasks/types/tasks.types"
import { useTasks, useColumns, useUpdateTask, useUpdateColumn } from "@/features/tasks/api/tasks.queries"

interface KanbanBoardProps {
  project: Project
  searchQuery?: string
  myTasksOnly?: boolean
  priorityFilter?: string | null
  sortBy?: string | null
  currentUserId?: number
  onWidthChange?: (width: number) => void
}

const COLUMN_WIDTH = 312 // px (approximate width of a column)
const COLUMN_GAP = 16    // gap-4
const BOARD_PADDING = 48 // px-6 * 2

export function KanbanBoard({
  project,
  searchQuery = "",
  myTasksOnly = false,
  priorityFilter = null,
  sortBy = null,
  currentUserId,
  onWidthChange,
}: KanbanBoardProps) {
  const { data: columns, isLoading: columnsLoading } = useColumns(project.id)
  const { data: tasks, isLoading: tasksLoading } = useTasks({ projectId: project.id })
  const updateTask = useUpdateTask()
  const updateColumn = useUpdateColumn()

  // Edit panel state
  const [editPanelOpen, setEditPanelOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Column order (from API, draggable locally)
  const [columnOrder, setColumnOrder] = useState<Column[] | null>(null)

  // Zoom state
  const [zoom, setZoom] = useState(1)
  const [isZooming, setIsZooming] = useState(false)
  const [zoomControlOpen, setZoomControlOpen] = useState(false)
  const [autoZoomed, setAutoZoomed] = useState(false)
  const [userManuallyZoomed, setUserManuallyZoomed] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

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

  // Reset zoom when switching projects
  useEffect(() => {
    setZoom(1)
    setAutoZoomed(false)
    setUserManuallyZoomed(false)
  }, [project.id])

  // Auto-scale: when columns overflow, shrink zoom to fit
  useEffect(() => {
    if (!containerRef.current || orderedColumns.length === 0) return
    if (userManuallyZoomed) return

    const containerWidth = containerRef.current.clientWidth
    const totalContentWidth =
      orderedColumns.length * COLUMN_WIDTH +
      (orderedColumns.length - 1) * COLUMN_GAP +
      BOARD_PADDING

    if (totalContentWidth > containerWidth) {
      const fitScale = Math.max(0.5, (containerWidth - BOARD_PADDING) / (totalContentWidth - BOARD_PADDING))
      if (!autoZoomed) {
        setIsZooming(true)
        setZoom(Number(fitScale.toFixed(2)))
        setAutoZoomed(true)
        setTimeout(() => setIsZooming(false), 50)
      }
    } else if (autoZoomed) {
      setAutoZoomed(false)
    }
  }, [orderedColumns.length, autoZoomed])

  const handleZoomChange = useCallback((val: number) => {
    setIsZooming(true)
    setZoom(Math.min(1.5, Math.max(0.5, Number(val.toFixed(2)))))
    setUserManuallyZoomed(true)
    setTimeout(() => setIsZooming(false), 50)
  }, [])

  // Report visual width to parent so toolbar can align
  useEffect(() => {
    if (onWidthChange && orderedColumns.length > 0) {
      const totalContentWidth = orderedColumns.length * COLUMN_WIDTH + (orderedColumns.length - 1) * COLUMN_GAP + BOARD_PADDING
      onWidthChange(totalContentWidth * zoom)
    }
  }, [orderedColumns.length, zoom, onWidthChange])

  // Priority weights for sorting
  const priorityWeight: Record<string, number> = {
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  }

  // Group tasks by columnId with search, user and priority filtering + sorting
  const tasksByColumn = useMemo(() => {
    const grouped: Record<number, Task[]> = {}
    if (tasks) {
      const query = searchQuery.toLowerCase().trim()

      // 1. Filter
      const filteredTasks = tasks.filter((task) => {
        if (query && !task.title.toLowerCase().includes(query)) return false
        if (myTasksOnly && currentUserId && task.assigneeId !== currentUserId) return false
        if (priorityFilter && task.priority !== priorityFilter) return false
        return true
      })

      // 2. Sort
      if (sortBy) {
        filteredTasks.sort((a, b) => {
          if (sortBy === "name") return a.title.localeCompare(b.title)
          if (sortBy === "priority") {
            const weightA = priorityWeight[a.priority || ""] || 0
            const weightB = priorityWeight[b.priority || ""] || 0
            return weightB - weightA
          }
          if (sortBy === "created") {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          }
          return 0
        })
      }

      // 3. Group
      filteredTasks.forEach((task) => {
        if (!grouped[task.columnId]) grouped[task.columnId] = []
        grouped[task.columnId].push(task)
      })
    }
    return grouped
  }, [tasks, searchQuery, myTasksOnly, priorityFilter, sortBy, currentUserId])

  // Drag task to another column or reorder
  const handleTaskDrop = (taskId: number, targetColumnId: number, beforeId: number | null) => {
    if (!tasks) return
    const activeTask = tasks.find((t) => t.id === taskId)
    if (!activeTask) return

    let columnTasks = tasks.filter((t) => t.columnId === targetColumnId)
    if (activeTask.columnId === targetColumnId) {
      columnTasks = columnTasks.filter((t) => t.id !== taskId)
    }

    const insertIndex = beforeId
      ? columnTasks.findIndex((t) => t.id === beforeId)
      : columnTasks.length
    const finalIndex = insertIndex >= 0 ? insertIndex : columnTasks.length
    columnTasks.splice(finalIndex, 0, activeTask)

    const samePriorityTasks = columnTasks.filter((t) => t.priority === activeTask.priority)
    samePriorityTasks.forEach((task, index) => {
      const isDraggedTask = task.id === activeTask.id
      const hasOrderChanged = (task.order ?? 0) !== index
      if (isDraggedTask || hasOrderChanged) {
        updateTask.mutate({
          id: task.id,
          data: { columnId: targetColumnId, order: index },
        })
      }
    })
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setEditPanelOpen(true)
  }

  const handleClosePanel = () => {
    setEditPanelOpen(false)
    setEditingTask(null)
  }

  const handleColumnsReorder = (newOrder: Column[]) => {
    setColumnOrder(newOrder)
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

  // Slider fill percentage (zoom 0.5..1.5 mapped to 0..100%)
  const sliderFill = ((zoom - 0.5) / 1.0) * 100

  return (
    <div ref={containerRef} className="flex flex-col h-full overflow-hidden relative">
      {/* Zoomable board area */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <div
          className="min-h-full"
          style={{
            zoom: zoom,
          }}
        >
          <Reorder.Group
            axis="x"
            values={orderedColumns}
            onReorder={handleColumnsReorder}
            className="flex items-start gap-4 px-6 py-4 mx-auto w-max"
          >
            {orderedColumns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={tasksByColumn[column.id] || []}
                onOpenPanel={handleEditTask}
                onDropTask={(taskId, beforeId) => handleTaskDrop(taskId, column.id, beforeId)}
                projectId={project.id}
                members={project.members}
                isZooming={isZooming}
              />
            ))}
          </Reorder.Group>
        </div>
      </div>

      {/* Floating zoom control — bottom right */}
      <div
        className="absolute bottom-5 right-5 z-50 flex items-center gap-2"
        onMouseEnter={() => setZoomControlOpen(true)}
        onMouseLeave={() => setZoomControlOpen(false)}
      >
        {/* Slide-in panel */}
        <div
          className="flex items-center overflow-hidden transition-all duration-300 ease-out"
          style={{
            maxWidth: zoomControlOpen ? "240px" : "0px",
            opacity: zoomControlOpen ? 1 : 0,
          }}
        >
          <div className="flex items-center gap-2.5 bg-[#1e1e1e] border border-white/[0.08] rounded-xl px-3 py-2 shadow-2xl mr-2">
            {/* Minus */}
            <button
              onClick={() => handleZoomChange(zoom - 0.1)}
              className="flex h-5 w-5 items-center justify-center text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              <Minus className="h-3 w-3" />
            </button>

            {/* Slider */}
            <div className="relative flex items-center w-24">
              <input
                type="range"
                min={50}
                max={150}
                step={1}
                value={Math.round(zoom * 100)}
                onChange={(e) => handleZoomChange(Number(e.target.value) / 100)}
                className="w-full cursor-pointer"
                style={{
                  WebkitAppearance: "none",
                  appearance: "none",
                  height: "3px",
                  borderRadius: "999px",
                  background: `linear-gradient(to right, rgba(255,255,255,0.55) ${sliderFill}%, rgba(255,255,255,0.07) ${sliderFill}%)`,
                  outline: "none",
                }}
              />
            </div>

            {/* Plus */}
            <button
              onClick={() => handleZoomChange(zoom + 0.1)}
              className="flex h-5 w-5 items-center justify-center text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              <Plus className="h-3 w-3" />
            </button>

            {/* Divider + percentage */}
            <div className="w-px h-3.5 bg-white/[0.08]" />
            <span className="text-[10px] font-mono text-zinc-500 tabular-nums w-8 text-right select-none">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>

        {/* Trigger button (click = reset to 100%) */}
        <button
          onClick={() => handleZoomChange(1)}
          title="Click to reset zoom to 100%"
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1e1e1e] border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/[0.15] transition-all shadow-xl cursor-pointer"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>

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
