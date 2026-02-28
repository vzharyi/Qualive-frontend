import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Columns3, Flag, Users, CalendarDays, GitCommitHorizontal } from 'lucide-react'
import type { Task, Column } from '@/features/tasks/types/tasks.types'
import type { ProjectMember } from '@/features/projects/types/projects.types'
import { useUpdateTask } from '@/features/tasks/api/tasks.queries'

const PRIORITIES = [
    { value: 'HIGH', label: 'High', dot: 'bg-red-500', text: 'text-red-400', bg: 'bg-red-500/15' },
    { value: 'MEDIUM', label: 'Medium', dot: 'bg-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/15' },
    { value: 'LOW', label: 'Low', dot: 'bg-zinc-500', text: 'text-zinc-400', bg: 'bg-zinc-500/15' },
]

const FALLBACK_COLORS = ["#94a3b8", "#fbbf24", "#c084fc", "#34d399", "#60a5fa", "#f87171"]

function hexToRGB(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return "148, 163, 184"
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
}

interface TaskEditPanelProps {
    open: boolean
    onClose: () => void
    task?: Task | null
    projectId: number
    members?: ProjectMember[]
    columns?: Column[]
}

export function TaskEditPanel({
    open,
    onClose,
    task,
    projectId: _projectId,
    members = [],
    columns = [],
}: TaskEditPanelProps) {
    const isEditing = !!task

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [assigneeId, setAssigneeId] = useState<number | ''>('')
    const [priority, setPriority] = useState<string>('MEDIUM')
    const [columnId, setColumnId] = useState<number | ''>(columns[0]?.id ?? '')
    const [githubCommitHash, setGithubCommitHash] = useState('')

    const updateTask = useUpdateTask()

    const hasChanges = useRef(false)
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (task) {
            setTitle(task.title)
            setDescription(task.description || '')
            setAssigneeId(task.assigneeId || '')
            setPriority(task.priority || 'MEDIUM')
            setColumnId(task.columnId)
            setGithubCommitHash(task.githubCommitHash || '')
            hasChanges.current = false
        } else {
            setTitle('')
            setDescription('')
            setAssigneeId('')
            setPriority('MEDIUM')
            setColumnId(columns[0]?.id ?? '')
            setGithubCommitHash('')
            hasChanges.current = false
        }
    }, [task, columns])

    const getMemberName = (m: ProjectMember) =>
        m.user
            ? m.user.firstName && m.user.lastName
                ? `${m.user.firstName} ${m.user.lastName}`
                : m.user.login
            : `User #${m.userId}`

    const saveNow = useCallback(() => {
        if (!isEditing || !task || !hasChanges.current) return
        const trimmedTitle = title.trim()
        if (!trimmedTitle || !columnId) return

        hasChanges.current = false
        updateTask.mutate({
            id: task.id,
            data: {
                title: trimmedTitle,
                description: description || undefined,
                assigneeId: assigneeId ? Number(assigneeId) : undefined,
                priority,
                columnId: Number(columnId),
                githubCommitHash: githubCommitHash || undefined,
            },
        })
    }, [isEditing, task, title, description, assigneeId, priority, columnId, githubCommitHash, updateTask])

    const markChanged = useCallback(() => {
        hasChanges.current = true
        if (debounceTimer.current) clearTimeout(debounceTimer.current)
        debounceTimer.current = setTimeout(() => saveNow(), 1500)
    }, [saveNow])

    useEffect(() => {
        return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current) }
    }, [])

    const handleClose = useCallback(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current)
        saveNow()
        onClose()
    }, [saveNow, onClose])

    const handleTitleChange = (v: string) => { setTitle(v); markChanged() }
    const handleDescriptionChange = (v: string) => { setDescription(v); markChanged() }
    const handleColumnChange = (v: string) => { setColumnId(Number(v)); markChanged() }
    const handlePriorityChange = (v: string) => { setPriority(v); markChanged() }
    const handleAssigneeChange = (v: string) => { setAssigneeId(v ? Number(v) : ''); markChanged() }
    const handleCommitChange = (v: string) => { setGithubCommitHash(v); markChanged() }

    // Get current column for styled chip
    const currentColumn = columns.find(c => c.id === columnId)
    const columnHex = currentColumn?.color || FALLBACK_COLORS[(currentColumn?.id ?? 0) % FALLBACK_COLORS.length]
    const columnRGB = hexToRGB(columnHex)

    const currentPriority = PRIORITIES.find(p => p.value === priority)

    // Get assignee member
    const selectedAssignee = members.find(m => m.userId === assigneeId)

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Transparent backdrop — click to save + close */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40"
                        onClick={handleClose}
                    />

                    {/* Floating card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97, y: '-50%' }}
                        animate={{ opacity: 1, scale: 1, y: '-50%' }}
                        exit={{ opacity: 0, scale: 0.97, y: '-50%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                        className="fixed right-8 top-1/2 z-50 flex w-[670px] h-[720px] flex-col rounded-2xl border border-white/[0.08] bg-[#181818] shadow-2xl shadow-black/50"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Body — scrollable */}
                        <div className="flex-1 overflow-auto px-7 pt-7 pb-6">
                            {/* Title — large, borderless */}
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                placeholder="Task title..."
                                autoFocus
                                className="w-full bg-transparent text-2xl font-bold text-white placeholder:text-zinc-600 focus:outline-none mb-5"
                            />

                            {/* Metadata — table-like: headers row + values row */}
                            <div className="grid grid-cols-5 gap-x-6  gap-y-2 mb-6">
                                {/* Header row */}
                                <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                                    <Columns3 className="h-3.5 w-3.5" />
                                    Status
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                                    <Users className="h-3.5 w-3.5" />
                                    Assignee
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                                    <Flag className="h-3.5 w-3.5" />
                                    Priority
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    End date
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                                    <GitCommitHorizontal className="h-3.5 w-3.5" />
                                    Commit
                                </div>

                                {/* Values row */}

                                {/* Column — styled like kanban column header chip */}
                                <div>
                                    <div
                                        className="relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium cursor-pointer"
                                        style={{
                                            backgroundColor: `rgba(${columnRGB}, 0.12)`,
                                            color: `rgb(${columnRGB})`,
                                        }}
                                    >
                                        <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: `rgb(${columnRGB})` }} />
                                        <select
                                            value={columnId}
                                            onChange={(e) => handleColumnChange(e.target.value)}
                                            className="appearance-none bg-transparent focus:outline-none cursor-pointer text-[12px] font-medium pr-1"
                                            style={{ color: `rgb(${columnRGB})` }}
                                        >
                                            {columns.map((c) => (
                                                <option key={c.id} value={c.id} className="bg-[#1e1e1e] text-white">
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Assignee */}
                                <div className="flex items-center gap-1.5 min-w-0">
                                    {selectedAssignee && (
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 text-[10px] font-bold text-white shrink-0">
                                            {getMemberName(selectedAssignee).charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <select
                                        value={assigneeId}
                                        onChange={(e) => handleAssigneeChange(e.target.value)}
                                        className="appearance-none bg-transparent text-[13px] text-zinc-300 focus:outline-none cursor-pointer min-w-0 max-w-[80px] truncate"
                                    >
                                        <option value="" className="bg-[#1e1e1e]">Unassigned</option>
                                        {members.map((m) => (
                                            <option key={m.userId} value={m.userId} className="bg-[#1e1e1e]">
                                                {getMemberName(m)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Priority — styled chip */}
                                <div>
                                    <div className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 ${currentPriority?.bg || ''}`}>
                                        <select
                                            value={priority}
                                            onChange={(e) => handlePriorityChange(e.target.value)}
                                            className={`appearance-none bg-transparent text-[12px] font-medium focus:outline-none cursor-pointer ${currentPriority?.text || 'text-zinc-400'}`}
                                        >
                                            {PRIORITIES.map((p) => (
                                                <option key={p.value} value={p.value} className="bg-[#1e1e1e] text-white">
                                                    {p.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* End date — clickable date input */}
                                <div className="flex items-center">
                                    <input
                                        type="date"
                                        className="bg-transparent text-[13px] text-zinc-300 focus:outline-none cursor-pointer w-full"
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </div>

                                {/* Commit hash */}
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        value={githubCommitHash}
                                        onChange={(e) => handleCommitChange(e.target.value)}
                                        placeholder="—"
                                        className="bg-transparent text-[13px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none w-full font-mono"
                                    />
                                </div>
                            </div>

                            {/* Separator */}
                            <div className="border-t border-white/[0.06] mb-5" />

                            {/* Description — clean textarea, no lines, auto-height */}
                            <textarea
                                value={description}
                                onChange={(e) => handleDescriptionChange(e.target.value)}
                                placeholder="Write your notes here..."
                                className="w-full bg-transparent text-[14px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none resize-none leading-relaxed min-h-[200px]"
                            />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
