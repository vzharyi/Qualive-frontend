import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Palette } from 'lucide-react'
import type { Task, Column } from '@/features/tasks/types/tasks.types'
import { useUpdateColumn, useDeleteColumnTasks } from '@/features/tasks/api/tasks.queries'
import { useAuth } from '@/features/auth/store/auth.store'
import type { ProjectMember } from '@/features/projects/types/projects.types'
import { cn } from '@/lib/utils'

const PRESET_COLORS = ["#94a3b8", "#fbbf24", "#fb923c", "#f87171", "#c084fc", "#60a5fa", "#34d399"]

interface ColumnEditPanelProps {
    open: boolean
    onClose: () => void
    column: Column
    projectId: number
    tasks: Task[]
    anchorRect?: DOMRect | null
    members: ProjectMember[]
}

export function ColumnEditPanel({
    open,
    onClose,
    column,
    projectId,
    tasks,
    anchorRect,
    members,
}: ColumnEditPanelProps) {
    const { user } = useAuth()
    const [name, setName] = useState(column.name)
    const updateColumn = useUpdateColumn()
    const deleteBatch = useDeleteColumnTasks()

    // Role check: Admin-only for bulk deletion
    const currentMember = members.find(m => m.userId === user?.id)
    const isOwner = currentMember?.role?.toUpperCase() === 'ADMIN'


    const hasChanges = useRef(false)
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        setName(column.name)
        hasChanges.current = false
    }, [column])

    const saveNow = useCallback(() => {
        if (!hasChanges.current) return
        const trimmed = name.trim()
        if (!trimmed || trimmed === column.name) return

        hasChanges.current = false
        updateColumn.mutate({
            projectId,
            columnId: column.id,
            data: { name: trimmed },
        })
    }, [column.id, column.name, name, projectId, updateColumn])

    const markChanged = useCallback(() => {
        hasChanges.current = true
        if (debounceTimer.current) clearTimeout(debounceTimer.current)
        debounceTimer.current = setTimeout(() => saveNow(), 1000)
    }, [saveNow])

    useEffect(() => {
        return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current) }
    }, [])

    const handleClose = useCallback(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current)
        saveNow()
        onClose()
    }, [saveNow, onClose])

    const onColorSelect = (color: string) => {
        updateColumn.mutate({
            projectId,
            columnId: column.id,
            data: { color },
        })
    }

    const onDeleteAllTasks = () => {
        if (!isOwner) return
        if (window.confirm(`Are you sure you want to delete all ${tasks.length} tasks in "${column.name}"?`)) {
            deleteBatch.mutate(column.id)
            handleClose()
        }
    }

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Completely transparent backdrop — same as TaskEditPanel */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60]"
                        onClick={handleClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                        style={{
                            top: anchorRect ? anchorRect.top : '50%',
                            left: (() => {
                                if (!anchorRect) return 'auto'
                                const panelWidth = 320
                                const margin = 12
                                const overflowsRight = anchorRect.right + panelWidth + margin > window.innerWidth
                                return overflowsRight 
                                    ? anchorRect.left - panelWidth - margin 
                                    : anchorRect.right + margin
                            })(),
                            transform: anchorRect ? 'none' : 'translateY(-50%)',
                            position: 'fixed'
                        }}
                        className={cn(
                            "z-[70] flex w-[320px] flex-col rounded-2xl border border-white/[0.08] bg-[#181818] shadow-2xl shadow-black/50",
                            !anchorRect && "right-8"
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex-1 overflow-auto px-6 pt-6 pb-7">
                            {/* Column Name Row */}
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => { setName(e.target.value); markChanged() }}
                                placeholder="Column name..."
                                autoFocus
                                className="w-full bg-transparent text-xl font-bold text-white placeholder:text-zinc-700 focus:outline-none mb-6"
                            />

                            {/* Theme Row */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                                    <Palette className="h-3.5 w-3.5" />
                                    Theme
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                    {PRESET_COLORS.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => onColorSelect(c)}
                                            className={cn(
                                                "h-6 w-6 rounded-full border-2 transition-all hover:scale-110 active:scale-95",
                                                column.color === c ? "border-white scale-110 shadow-lg shadow-white/10" : "border-transparent"
                                            )}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Actions Row - Only for Owner/Admin */}
                            {isOwner && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Actions
                                    </div>
                                    <button
                                        onClick={onDeleteAllTasks}
                                        disabled={deleteBatch.isPending}
                                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-colors border border-red-500/10 text-[12px] font-medium disabled:opacity-50"
                                    >
                                        <span>Delete all tasks</span>
                                        <span className="text-[10px] opacity-60 tabular-nums">
                                            {deleteBatch.isPending ? 'Deleting...' : tasks.length}
                                        </span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
