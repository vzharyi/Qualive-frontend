import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Trash2, Loader2, MessageSquare } from 'lucide-react'
import { useTaskComments, useCreateComment, useDeleteComment } from '@/features/tasks/api/comments.queries'
import { useMe } from '@/features/users/api/users.queries'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Comment } from '@/features/tasks/types/comments.types'

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString()
}

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function getAvatarUrl(avatarUrl: string | null): string | undefined {
    if (!avatarUrl) return undefined
    if (avatarUrl.startsWith('http')) return avatarUrl
    return `${BASE_URL}${avatarUrl}`
}

function getUserDisplayName(user: Comment['user']): string {
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`
    if (user.firstName) return user.firstName
    return user.login
}

function getUserInitials(user: Comment['user']): string {
    if (user.firstName && user.lastName) return `${user.firstName[0]}${user.lastName[0]}`
    return user.login.slice(0, 2).toUpperCase()
}

interface TaskCommentsSectionProps {
    taskId: number
}

export function TaskCommentsSection({ taskId }: TaskCommentsSectionProps) {
    const [text, setText] = useState('')
    const listRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const { data: comments = [], isLoading } = useTaskComments(taskId)
    const { data: currentUser } = useMe()
    const createComment = useCreateComment()
    const deleteComment = useDeleteComment()

    // Auto-scroll to bottom when new comments arrive
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight
        }
    }, [comments.length])

    const handleSubmit = () => {
        const trimmed = text.trim()
        if (!trimmed || createComment.isPending) return
        createComment.mutate({ taskId, content: trimmed })
        setText('')
        textareaRef.current?.focus()
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    return (
        <div className="h-[466px] flex flex-col rounded-2xl border border-white/[0.08] bg-[#1e1e1e] overflow-hidden">
            {/* Comments List */}
            <div ref={listRef} className="flex-1 overflow-auto px-3 pt-3 pb-3">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                        <span className="text-[11px] text-zinc-500">Loading comments...</span>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.05]">
                            <MessageSquare className="h-3.5 w-3.5 text-zinc-600" />
                        </div>
                        <p className="text-[12px] text-zinc-500">No comments yet. Be the first!</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {comments.map((comment, idx) => {
                            const isOwn = currentUser?.id === comment.userId
                            // Group: show avatar/name only on first in a consecutive run
                            const prevComment = comments[idx - 1]
                            const isFirstInGroup = !prevComment || prevComment.userId !== comment.userId

                            return (
                                <motion.div
                                    key={comment.id}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.13 }}
                                    className={`group flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${isFirstInGroup ? 'mt-3' : 'mt-1'}`}
                                >
                                    {/* Avatar — only on first message in group, placeholder space for subsequent */}
                                    <div className="w-6 shrink-0 self-end mb-0.5">
                                        {isFirstInGroup ? (
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={getAvatarUrl(comment.user.avatarUrl)} />
                                                <AvatarFallback className="text-[9px] font-semibold bg-zinc-800 text-zinc-400">
                                                    {getUserInitials(comment.user)}
                                                </AvatarFallback>
                                            </Avatar>
                                        ) : (
                                            /* spacer so bubbles stay aligned */
                                            <div className="h-6 w-6" />
                                        )}
                                    </div>

                                    {/* Bubble */}
                                    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%] min-w-0`}>
                                        {/* Name + time — only on first in group */}
                                        {isFirstInGroup && (
                                            <div className={`flex items-baseline gap-1.5 mb-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                                                <span className="text-[11px] font-semibold text-zinc-400">
                                                    {isOwn ? 'You' : getUserDisplayName(comment.user)}
                                                </span>
                                                <span className="text-[10px] text-zinc-600">
                                                    {timeAgo(comment.createdAt)}
                                                </span>
                                            </div>
                                        )}

                                        <div className="relative group/bubble max-w-full">
                                            <p className={`
                                                text-[13px] leading-relaxed px-3 py-1.5 max-w-full
                                                whitespace-pre-wrap break-all
                                                ${isOwn
                                                    ? 'bg-indigo-500/20 border border-indigo-500/25 text-zinc-200 rounded-2xl rounded-br-sm'
                                                    : 'bg-white/[0.05] border border-white/[0.06] text-zinc-300 rounded-2xl rounded-bl-sm'
                                                }
                                                ${!isFirstInGroup && isOwn ? 'rounded-tr-2xl' : ''}
                                                ${!isFirstInGroup && !isOwn ? 'rounded-tl-2xl' : ''}
                                            `}>
                                                {comment.content}
                                            </p>

                                            {/* Delete button — appears on hover, for own messages */}
                                            {isOwn && (
                                                <button
                                                    onClick={() => deleteComment.mutate({ id: comment.id, taskId })}
                                                    disabled={deleteComment.isPending}
                                                    className={`
                                                        absolute top-1/2 -translate-y-1/2 -left-7
                                                        opacity-0 group-hover/bubble:opacity-100 transition-opacity
                                                        text-zinc-600 hover:text-red-400 disabled:opacity-30 cursor-pointer
                                                    `}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                )}
            </div>

            {/* Input Bar */}
            <div className="shrink-0 border-t border-white/[0.06] px-3 py-2 flex items-end gap-2">
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Write a comment... (Enter to send)"
                    rows={1}
                    className="flex-1 bg-transparent text-[13px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none resize-none leading-relaxed max-h-[80px] overflow-auto"
                    style={{ scrollbarWidth: 'none' }}
                />
                <button
                    onClick={handleSubmit}
                    disabled={!text.trim() || createComment.isPending}
                    className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                    {createComment.isPending
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Send className="h-3.5 w-3.5" />
                    }
                </button>
            </div>
        </div>
    )
}
