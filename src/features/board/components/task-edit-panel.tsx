import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Loader2 } from 'lucide-react'
import type { Task, Column } from '@/features/tasks/types/tasks.types'
import type { ProjectMember } from '@/features/projects/types/projects.types'
import { useCreateTask, useUpdateTask, useDeleteTask } from '@/features/tasks/api/tasks.queries'

const PRIORITIES = [
    { value: 'HIGH', label: 'High', color: 'bg-red-500' },
    { value: 'MEDIUM', label: 'Medium', color: 'bg-amber-500' },
    { value: 'LOW', label: 'Low', color: 'bg-zinc-500' },
]

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
    projectId,
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

    const createTask = useCreateTask()
    const updateTask = useUpdateTask()
    const deleteTask = useDeleteTask()

    useEffect(() => {
        if (task) {
            setTitle(task.title)
            setDescription(task.description || '')
            setAssigneeId(task.assigneeId || '')
            setPriority(task.priority || 'MEDIUM')
            setColumnId(task.columnId)
            setGithubCommitHash(task.githubCommitHash || '')
        } else {
            setTitle('')
            setDescription('')
            setAssigneeId('')
            setPriority('MEDIUM')
            setColumnId(columns[0]?.id ?? '')
            setGithubCommitHash('')
        }
    }, [task, columns])

    const getMemberName = (m: ProjectMember) =>
        m.user
            ? m.user.firstName && m.user.lastName
                ? `${m.user.firstName} ${m.user.lastName}`
                : m.user.login
            : `User #${m.userId}`

    const handleSave = () => {
        if (!title.trim() || !columnId) return

        if (isEditing) {
            updateTask.mutate(
                {
                    id: task.id,
                    data: {
                        title: title.trim(),
                        description: description || undefined,
                        assigneeId: assigneeId ? Number(assigneeId) : undefined,
                        priority,
                        columnId: Number(columnId),
                        githubCommitHash: githubCommitHash || undefined,
                    },
                },
                { onSuccess: onClose },
            )
        } else {
            createTask.mutate(
                {
                    projectId,
                    data: {
                        title: title.trim(),
                        description: description || undefined,
                        assigneeId: assigneeId ? Number(assigneeId) : undefined,
                        priority,
                        columnId: Number(columnId),
                    },
                },
                { onSuccess: onClose },
            )
        }
    }

    const handleDelete = () => {
        if (!task) return
        deleteTask.mutate(task.id, { onSuccess: onClose })
    }

    const isSaving = createTask.isPending || updateTask.isPending

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-black/40"
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-white/[0.06] bg-[#141414] shadow-2xl shadow-black/60"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                            <h2 className="text-[15px] font-semibold text-white">
                                {isEditing ? 'Edit Task' : 'Create Task'}
                            </h2>
                            <button
                                onClick={onClose}
                                className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-colors cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-auto px-5 py-5 space-y-5">
                            {/* Title */}
                            <div>
                                <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-1.5">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Task title..."
                                    autoFocus
                                    className="w-full h-9 px-3 rounded-lg border border-white/[0.07] bg-white/[0.03] text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/40 transition-all"
                                />
                            </div>

                            {/* Column + Priority row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-1.5">Column</label>
                                    <select
                                        value={columnId}
                                        onChange={(e) => setColumnId(Number(e.target.value))}
                                        className="w-full h-9 px-3 rounded-lg border border-white/[0.07] bg-[#1a1a1a] text-[13px] text-white focus:outline-none focus:border-emerald-500/40 transition-all cursor-pointer"
                                    >
                                        {columns.map((c) => (
                                            <option key={c.id} value={c.id} className="bg-[#1e1e1e]">
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-1.5">Priority</label>
                                    <select
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                        className="w-full h-9 px-3 rounded-lg border border-white/[0.07] bg-[#1a1a1a] text-[13px] text-white focus:outline-none focus:border-emerald-500/40 transition-all cursor-pointer"
                                    >
                                        {PRIORITIES.map((p) => (
                                            <option key={p.value} value={p.value} className="bg-[#1e1e1e]">
                                                {p.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Assignee */}
                            <div>
                                <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-1.5">Assignee</label>
                                <select
                                    value={assigneeId}
                                    onChange={(e) => setAssigneeId(e.target.value ? Number(e.target.value) : '')}
                                    className="w-full h-9 px-3 rounded-lg border border-white/[0.07] bg-[#1a1a1a] text-[13px] text-white focus:outline-none focus:border-emerald-500/40 transition-all cursor-pointer"
                                >
                                    <option value="" className="bg-[#1e1e1e]">Unassigned</option>
                                    {members.map((m) => (
                                        <option key={m.userId} value={m.userId} className="bg-[#1e1e1e]">
                                            {getMemberName(m)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* GitHub Commit Hash */}
                            <div>
                                <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-1.5">GitHub Commit Hash</label>
                                <input
                                    type="text"
                                    value={githubCommitHash}
                                    onChange={(e) => setGithubCommitHash(e.target.value)}
                                    placeholder="e.g. a1b2c3d4e5f6..."
                                    className="w-full h-9 px-3 rounded-lg border border-white/[0.07] bg-white/[0.03] text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/40 transition-all font-mono"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-1.5">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the task..."
                                    rows={6}
                                    className="w-full px-3 py-2.5 rounded-lg border border-white/[0.07] bg-white/[0.03] text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/40 transition-all resize-none leading-relaxed"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-4">
                            {isEditing ? (
                                <button
                                    onClick={handleDelete}
                                    disabled={deleteTask.isPending}
                                    className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-[13px] text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    {deleteTask.isPending ? 'Deleting...' : 'Delete'}
                                </button>
                            ) : (
                                <div />
                            )}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={onClose}
                                    className="h-9 px-4 rounded-lg border border-white/[0.07] text-[13px] text-zinc-400 hover:text-white hover:border-white/[0.12] transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || !title.trim() || !columnId}
                                    className="h-9 px-5 rounded-lg bg-emerald-500 text-[13px] text-black font-semibold hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-2"
                                >
                                    {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                    {isEditing ? 'Save Changes' : 'Create Task'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
