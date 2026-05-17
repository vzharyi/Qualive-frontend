import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Columns3, Flag, Users, CalendarDays, GitCommitHorizontal, MessageSquare, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import type { Task, Column } from '@/features/tasks/types/tasks.types'
import type { ProjectMember } from '@/features/projects/types/projects.types'
import { useUpdateTask } from '@/features/tasks/api/tasks.queries'
import { useTaskGithubItems } from '@/features/tasks/api/github-items.queries'
import { useTaskComments } from '@/features/tasks/api/comments.queries'
import { TaskGithubSection } from './task-github-section'
import { TaskCommentsSection } from './task-comments-section'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarCustom } from "@/components/ui/calendar-custom"

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
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
    const [showGithub, setShowGithub] = useState(false)
    const [showComments, setShowComments] = useState(false)
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)
    const updateTask = useUpdateTask()
    const { data: githubItems } = useTaskGithubItems(task?.id ?? 0)
    const { data: comments = [] } = useTaskComments(task?.id ?? 0)

    const displayScore = (() => {
        if (!task) return null
        if (task.qualityScore !== null && task.qualityScore !== undefined) return task.qualityScore
        if (task.codeScore !== null && task.codeScore !== undefined) return task.codeScore

        if (githubItems && githubItems.length > 0) {
            const itemsWithScore = githubItems.filter(item => item.codeScore !== null)
            if (itemsWithScore.length === 0) return null
            
            const total = itemsWithScore.reduce((sum, item) => sum + (item.codeScore || 0), 0)
            return Math.round(total / itemsWithScore.length)
        }

        return null
    })()

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
            setDueDate(task.dueDate ? new Date(task.dueDate) : undefined)
            setShowGithub(false)
            setShowComments(false)
            hasChanges.current = false
        } else {
            setTitle('')
            setDescription('')
            setAssigneeId('')
            setPriority('MEDIUM')
            setColumnId(columns[0]?.id ?? '')
            setGithubCommitHash('')
            setDueDate(undefined)
            setShowGithub(false)
            setShowComments(false)
            hasChanges.current = false
        }
    }, [task, columns])

    const getMemberName = (m: ProjectMember) =>
        m.user
            ? m.user.firstName || m.user.lastName
                ? `${m.user.firstName || ""} ${m.user.lastName || ""}`.trim()
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
                dueDate: dueDate ? dueDate.toISOString() : null,
            },
        })
    }, [isEditing, task, title, description, assigneeId, priority, columnId, githubCommitHash, updateTask, dueDate])

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
                        {/* Body — no full scroll */}
                        <div className="flex-1 flex flex-col px-7 pt-7 pb-6 overflow-hidden">
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
                            <div className="grid grid-cols-5 gap-x-6 gap-y-2 mb-6">
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
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Score
                                </div>

                                {/* Values row */}

                                {/* Column — styled like kanban column header chip */}
                                <div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <div
                                                className="relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium cursor-pointer"
                                                style={{
                                                    backgroundColor: `rgba(${columnRGB}, 0.12)`,
                                                    color: `rgb(${columnRGB})`,
                                                }}
                                            >
                                                <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: `rgb(${columnRGB})` }} />
                                                <span className="pr-1">{currentColumn?.name || "Status"}</span>
                                            </div>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side="bottom" className="bg-[#1e1e1e] border-white/[0.08] p-1 shadow-2xl rounded-xl">
                                            {columns.map((c) => (
                                                <DropdownMenuItem
                                                    key={c.id}
                                                    onClick={() => handleColumnChange(String(c.id))}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-400 focus:bg-white/[0.03] focus:text-zinc-200 cursor-pointer"
                                                >
                                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color || '#fff' }} />
                                                    <span className="text-[13px]">{c.name}</span>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Assignee */}
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <div className="flex items-center gap-1.5 cursor-pointer min-w-0">
                                                {selectedAssignee ? (
                                                    <Avatar className="h-5 w-5 shrink-0 ring-1 ring-[#181818]">
                                                        {selectedAssignee.user?.avatarUrl && <AvatarImage src={selectedAssignee.user.avatarUrl} />}
                                                        <AvatarFallback className="bg-zinc-700 text-[10px] font-bold text-white">
                                                            {getMemberName(selectedAssignee).charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                ) : (
                                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-500 shrink-0">
                                                        ?
                                                    </div>
                                                )}
                                                <span className="text-[13px] text-zinc-300 truncate max-w-[80px]">
                                                    {selectedAssignee ? getMemberName(selectedAssignee) : "Unassigned"}
                                                </span>
                                            </div>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side="bottom" className="bg-[#1e1e1e] border-white/[0.08] p-1 shadow-2xl rounded-xl">
                                            <DropdownMenuItem
                                                onClick={() => handleAssigneeChange("")}
                                                className="px-3 py-2 rounded-lg text-zinc-400 focus:bg-white/[0.03] focus:text-zinc-200 cursor-pointer"
                                            >
                                                Unassigned
                                            </DropdownMenuItem>
                                            {members.map((m) => (
                                                <DropdownMenuItem
                                                    key={m.userId}
                                                    onClick={() => handleAssigneeChange(String(m.userId))}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-400 focus:bg-white/[0.03] focus:text-zinc-200 cursor-pointer"
                                                >
                                                    <Avatar className="h-5 w-5 shrink-0 ring-1 ring-[#1e1e1e]">
                                                        {m.user?.avatarUrl && <AvatarImage src={m.user.avatarUrl} />}
                                                        <AvatarFallback className="bg-zinc-700 text-[10px] font-bold text-white">
                                                            {getMemberName(m).charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-[13px]">{getMemberName(m)}</span>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Priority — styled chip */}
                                <div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <div className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 ${currentPriority?.bg || ''} cursor-pointer`}>
                                                <span className={`text-[12px] font-medium ${currentPriority?.text || 'text-zinc-400'}`}>
                                                    {currentPriority?.label || 'Select'}
                                                </span>
                                            </div>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side="bottom" className="bg-[#1e1e1e] border-white/[0.08] p-1 shadow-2xl rounded-xl">
                                            {PRIORITIES.map((p) => (
                                                <DropdownMenuItem
                                                    key={p.value}
                                                    onClick={() => handlePriorityChange(p.value)}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-400 focus:bg-white/[0.03] focus:text-zinc-200 cursor-pointer"
                                                >
                                                    <div className={`h-2 w-2 rounded-full ${p.dot}`} />
                                                    <span className="text-[13px]">{p.label}</span>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* End date — custom date picker */}
                                <div className="flex items-center">
                                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                        <PopoverTrigger asChild>
                                            <button className="bg-transparent text-[13px] text-zinc-300 focus:outline-none cursor-pointer w-full text-left hover:text-zinc-100 transition-colors">
                                                {dueDate ? dueDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pick a date'}
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 bg-[#1e1e1e] border-white/[0.08] shadow-2xl rounded-xl" align="start">
                                            <CalendarCustom
                                                selected={dueDate}
                                                onSelect={(date: Date | undefined) => {
                                                    setDueDate(date)
                                                    markChanged()
                                                    setIsCalendarOpen(false)
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Task Score */}
                                <div className="flex items-center">
                                    {displayScore !== null ? (
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] font-semibold",
                                            displayScore >= 80 ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" :
                                            displayScore >= 50 ? "text-amber-400 border-amber-500/20 bg-amber-500/10" :
                                            "text-red-400 border-red-500/20 bg-red-500/10"
                                        )}>
                                            {displayScore >= 80 ? <CheckCircle2 className="h-3.5 w-3.5" /> : 
                                             displayScore >= 50 ? <AlertTriangle className="h-3.5 w-3.5" /> : 
                                             <XCircle className="h-3.5 w-3.5" />}
                                            {displayScore}
                                        </span>
                                    ) : (
                                        <span className="text-[13px] text-zinc-600">—</span>
                                    )}
                                </div>
                            </div>

                            {/* Separator */}
                            <div className="border-t border-white/[0.06] mb-5" />

                            {/* Description — clean textarea, no lines, auto-height */}
                            <textarea
                                value={description}
                                onChange={(e) => handleDescriptionChange(e.target.value)}
                                placeholder="Write your notes here..."
                                className="w-full bg-transparent text-[14px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none resize-none leading-relaxed min-h-[120px] flex-1"
                            />
                        </div>
                        
                        {/* Sticky Footer for GitHub Links & Comments */}
                        {isEditing && task && (
                            <div className="border-t border-white/[0.06] px-7 py-4 bg-[#181818] rounded-b-2xl mt-auto shrink-0 z-10">
                                <div className="flex gap-4 mb-2">
                                    <button
                                        onClick={() => { setShowGithub(!showGithub); setShowComments(false); }}
                                        className={cn(
                                            "flex items-center justify-center flex-1 gap-2 text-[13px] font-medium transition-colors cursor-pointer py-1.5 rounded-md",
                                            showGithub ? "text-white bg-white/[0.04]" : "text-zinc-500 hover:text-zinc-300"
                                        )}
                                    >
                                        <GitCommitHorizontal className="h-4 w-4" />
                                        {showGithub ? 'Hide Linked Code' : 'Show Linked Code'}
                                        <span className="ml-1.5 font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-white">
                                            {githubItems?.length || 0}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => { setShowComments(!showComments); setShowGithub(false); }}
                                        className={cn(
                                            "flex items-center justify-center flex-1 gap-2 text-[13px] font-medium transition-colors cursor-pointer py-1.5 rounded-md",
                                            showComments ? "text-white bg-white/[0.04]" : "text-zinc-500 hover:text-zinc-300"
                                        )}
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                        {showComments ? 'Hide Comments' : 'Show Comments'}
                                        <span className="ml-1.5 font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-white">
                                            {comments.length}
                                        </span>
                                    </button>
                                </div>
                                <AnimatePresence>
                                    {(showGithub || showComments) && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20, height: 0 }}
                                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                                            exit={{ opacity: 0, y: 20, height: 0 }}
                                            transition={{ type: "spring", damping: 26, stiffness: 300 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pt-4 mt-2 border-t border-white/[0.04]">
                                                {showGithub ? (
                                                    <TaskGithubSection taskId={task.id} projectId={task.projectId} />
                                                ) : (
                                                    /* Mock Comments Section */
                                                    <TaskCommentsSection taskId={task.id} />
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}</motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
