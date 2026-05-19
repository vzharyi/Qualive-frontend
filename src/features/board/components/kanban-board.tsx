import { useState, useMemo, useRef, useCallback, useEffect } from "react"
import { KanbanColumn } from "@/features/board/components/kanban-column"
import { TaskEditPanel } from "@/features/board/components/task-edit-panel"
import { Reorder } from "framer-motion"
import { Loader2, ZoomIn, Minus, Plus } from "lucide-react"
import type { Project } from "@/features/projects/types/projects.types"
import type { Task, Column } from "@/features/tasks/types/tasks.types"
import { useTasks, useColumns, useUpdateTask, useUpdateColumn } from "@/features/tasks/api/tasks.queries"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDays } from "lucide-react"
import { useTaskGithubItems } from "@/features/tasks/api/github-items.queries"

interface KanbanBoardProps {
  project: Project
  searchQuery?: string
  myTasksOnly?: boolean
  priorityFilter?: string | null
  sortBy?: string | null
  currentUserId?: number
  onWidthChange?: (width: number) => void
  viewMode?: "kanban" | "list"
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
  viewMode = "kanban",
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
          {viewMode === "kanban" ? (
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
          ) : (
            <div className="px-12 py-6 max-w-5xl mx-auto">
              {orderedColumns.map((column) => {
                const columnTasks = tasksByColumn[column.id] || []
                return (
                  <div key={column.id} className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: column.color || "#94a3b8" }}
                      />
                      <h3 className="text-[14px] font-medium text-white">
                        {column.name}
                      </h3>
                      <span className="text-[12px] text-zinc-600">
                        {columnTasks.length}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {columnTasks.map((task) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          onOpenPanel={handleEditTask}
                        />
                      ))}
                      {columnTasks.length === 0 && (
                        <div className="text-[12px] text-zinc-600 py-2 pl-4">
                          No tasks in this column
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
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

// TaskRow component for List View
function TaskRow({ task, onOpenPanel }: { task: Task, onOpenPanel: (task: Task) => void }) {
  const { data: githubItems } = useTaskGithubItems(task.id)
  
  const displayScore = (() => {
    if (task.qualityScore !== null && task.qualityScore !== undefined) return task.qualityScore
    if (task.codeScore !== null && task.codeScore !== undefined) return task.codeScore
    if (githubItems && (githubItems as any).length > 0) {
      const itemsWithScore = (githubItems as any).filter((item: any) => item.codeScore !== null)
      if (itemsWithScore.length === 0) return null
      const total = itemsWithScore.reduce((sum: number, item: any) => sum + (item.codeScore || 0), 0)
      return Math.round(total / itemsWithScore.length)
    }
    return null
  })()

  const assigneeName = task.assignee
    ? task.assignee.firstName || task.assignee.lastName
      ? `${task.assignee.firstName || ""} ${task.assignee.lastName || ""}`.trim()
      : task.assignee.login
    : null

  const assigneeInitial = task.assignee
    ? task.assignee.firstName?.charAt(0) || task.assignee.login.charAt(0)
    : null

  const getDueDateInfo = (dueDateStr: string) => {
    const due = new Date(dueDateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    due.setHours(0, 0, 0, 0)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    let style = "bg-transparent text-zinc-400 border border-white/10"
    let iconStyle = "text-zinc-500"
    
    if (diffDays < 0) {
      style = "bg-transparent text-red-500 border border-red-500/30"
      iconStyle = "text-red-500"
    } else if (diffDays === 0) {
      style = "bg-transparent text-red-500 border border-red-500/30"
      iconStyle = "text-red-500"
    } else if (diffDays <= 3) {
      style = "bg-transparent text-amber-500 border border-amber-500/30"
      iconStyle = "text-amber-500"
    }
    
    return {
      style,
      iconStyle,
      label: due.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
    }
  }

  const getScoreStyle = (score: number) => {
    if (score >= 80) return "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20"
    if (score >= 50) return "bg-amber-500/10 text-amber-500 ring-amber-500/20"
    return "bg-red-500/10 text-red-500 ring-red-500/20"
  }

  return (
    <div
      onClick={() => onOpenPanel(task)}
      className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] rounded-lg p-3 hover:bg-white/[0.04] transition-all cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <span className="text-[12px] font-mono text-zinc-600">
          #{task.id}
        </span>
        <span className="text-[14px] text-white">
          {task.title}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {task.dueDate && (() => {
          const { style, iconStyle, label } = getDueDateInfo(task.dueDate)
          return (
            <div className={cn("flex h-5 items-center rounded border px-1.5 text-[10px] font-medium gap-1.5", style)}>
              <CalendarDays className={cn("h-3 w-3", iconStyle)} />
              {label}
            </div>
          )
        })()}

        {task.priority && (
          <span className={cn(
            "text-[11px] px-1.5 py-0.5 rounded-md font-bold uppercase",
            task.priority === "HIGH" && "bg-red-500/10 text-red-500",
            task.priority === "MEDIUM" && "bg-amber-500/10 text-amber-500",
            task.priority === "LOW" && "bg-zinc-500/10 text-zinc-400"
          )}>
            {task.priority}
          </span>
        )}

        {assigneeName && (
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5 ring-1 ring-white/[0.06]">
              {task.assignee?.avatarUrl && <AvatarImage src={task.assignee.avatarUrl} alt={assigneeName} />}
              <AvatarFallback className="text-[9px] bg-zinc-800 text-zinc-500">{assigneeInitial}</AvatarFallback>
            </Avatar>
            <span className="text-[11px] text-zinc-500 hidden md:inline">{assigneeName}</span>
          </div>
        )}

        {displayScore !== null && (
          <div 
            className={cn(
              "flex shrink-0 h-6 w-6 items-center justify-center rounded-full ring-1 text-[9px] font-bold shadow-sm", 
              getScoreStyle(displayScore)
            )}
            title="Task Health Score"
          >
            {displayScore}
          </div>
        )}
      </div>
    </div>
  )
}
