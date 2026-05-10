import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Github, Trash2, Plus, Loader2, Link2 } from 'lucide-react'
import {
    useProjectRepositories,
    useCreateRepository,
    useDeleteRepository,
} from '../api/repositories.queries'
import { useProject } from '@/features/projects/api/projects.queries'
import { useAuth } from '@/features/auth/store/auth.store'
import type { ProjectMember } from '@/features/projects/types/projects.types'
import { api } from '@/api/axios-instance'
import { cn } from '@/lib/utils'

export function RepositoryPanel({ open, onClose, projectId, members }: { open: boolean, onClose: () => void, projectId: number, members?: ProjectMember[] }) {
    const { user } = useAuth()
    const { data: project } = useProject(projectId)
    const { data: repositories, isLoading } = useProjectRepositories(projectId)
    const deleteRepo = useDeleteRepository()
    const createRepo = useCreateRepository()

    const currentMember = members?.find(m => m.userId === user?.id)
    const role = currentMember?.role?.toUpperCase()
    const isOwner = project?.ownerId === user?.id
    const canManageRepo = isOwner || role === 'ADMIN' || role === 'MANAGER'

    // Setup fallback manual connect state
    const [showManual, setShowManual] = useState(false)
    const [manualRepoId, setManualRepoId] = useState('')
    const [manualToken, setManualToken] = useState('')

    const [isRedirecting, setIsRedirecting] = useState(false)

    // Handle GitHub App Installation
    const handleInstallClick = async () => {
        setIsRedirecting(true)
        try {
            const response = await api.get(`/github/install`, {
                params: { projectId },
                validateStatus: (status) => status >= 200 && status < 400,
            })

            if (response.data && response.data.url) {
                window.location.href = response.data.url
                return
            }
            if (response.request && response.request.responseURL) {
                window.location.href = response.request.responseURL
                return
            }
            throw new Error('Could not resolve GitHub App redirect URL')
        } catch (error) {
            console.error('Failed to start GitHub installation flux:', error)
            alert('Could not start GitHub installation. Please report this error.')
        } finally {
            setIsRedirecting(false)
        }
    }

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to disconnect this repository?')) {
            deleteRepo.mutate(id)
        }
    }

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!manualRepoId.trim()) return

        createRepo.mutate(
            {
                projectId,
                githubRepoId: manualRepoId.trim(),
                accessToken: manualToken.trim() || undefined,
            },
            {
                onSuccess: () => {
                    setManualRepoId('')
                    setManualToken('')
                    setShowManual(false)
                },
            }
        )
    }

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: '-50%', x: '-50%' }}
                        animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
                        exit={{ opacity: 0, scale: 0.95, y: '-50%', x: '-50%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed left-1/2 top-1/2 z-50 flex w-[480px] max-h-[80vh] flex-col rounded-2xl border border-white/[0.08] bg-[#181818] shadow-2xl shadow-black/50"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.1] shadow-inner">
                                    <Github className="h-4 w-4 text-zinc-300" />
                                </div>
                                <h2 className="text-xl font-semibold text-white tracking-tight">GitHub Repositories</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto px-6 pb-6 space-y-6">
                            {/* Connect App Banner - Only show if NO repos connected */}
                            {canManageRepo && !repositories?.length && (
                                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.05] text-zinc-300 shrink-0">
                                                <Link2 className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-[14px] font-medium text-white mb-1">
                                                    Fast & Secure Connection
                                                </h3>
                                                <p className="text-[12px] leading-relaxed text-zinc-500">
                                                    Install the Qualive GitHub App to easily link repositories without manually copying tokens or IDs.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleInstallClick}
                                            disabled={isRedirecting}
                                            className="h-9 w-full rounded-lg bg-white/[0.08] text-zinc-200 border border-white/[0.05] hover:bg-white/[0.12] hover:text-white disabled:opacity-40 disabled:hover:bg-white/[0.08] text-[13px] font-medium transition-all cursor-pointer flex items-center justify-center gap-2"
                                        >
                                            {isRedirecting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Redirecting to GitHub...
                                                </>
                                            ) : (
                                                <>Connect GitHub App</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Connected Repositories List */}
                            <div>
                                <h3 className="text-[11px] font-medium uppercase tracking-wider text-zinc-600 mb-3">
                                    Connected ({repositories?.length || 0})
                                </h3>

                                {isLoading ? (
                                    <div className="flex items-center justify-center py-6 text-zinc-500">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    </div>
                                ) : !repositories?.length ? (
                                    <div className="rounded-xl border border-dashed border-white/[0.06] bg-white/[0.01] py-8 text-center px-4">
                                        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04]">
                                            <Github className="h-4 w-4 text-zinc-600" />
                                        </div>
                                        <p className="text-[13px] font-medium text-zinc-400">No repositories yet</p>
                                        <p className="text-[12px] text-zinc-600 mt-1 max-w-[240px] mx-auto">
                                            Connect your GitHub app above to start linking pull requests and commits.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {repositories.map((repo) => (
                                            <div
                                                key={repo.id}
                                                className="group flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] p-3 hover:bg-white/[0.04] transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/[0.03] border border-white/[0.05]">
                                                        <Github className="h-4 w-4 text-zinc-400" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[13px] font-medium text-white">
                                                            ID: {repo.githubRepoId}
                                                        </span>
                                                        <span className="text-[11px] text-zinc-600">
                                                            {repo.installationId ? 'GitHub App' : 'Manual token'}
                                                        </span>
                                                    </div>
                                                </div>
                                                {canManageRepo && (
                                                    <button
                                                        onClick={() => handleDelete(repo.id)}
                                                        disabled={deleteRepo.isPending}
                                                        title="Disconnect repository"
                                                        className="h-8 w-8 rounded-md flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50 cursor-pointer"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Manual Form (Fallback) - Only show if NO repos connected */}
                            {canManageRepo && !repositories?.length && (
                                <div>
                                    <button
                                        onClick={() => setShowManual((s) => !s)}
                                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[12px] font-medium text-zinc-600 hover:bg-white/[0.02] hover:text-zinc-400 transition-colors cursor-pointer"
                                    >
                                        <span>Advanced: Manual Connection</span>
                                        <Plus className={`h-3.5 w-3.5 transition-transform ${showManual ? 'rotate-45' : ''}`} />
                                    </button>

                                    {showManual && (
                                        <form onSubmit={handleManualSubmit} className="mt-3 space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[12px] font-medium text-zinc-500 uppercase tracking-wider">
                                                    GitHub Repository ID <span className="text-red-400">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={manualRepoId}
                                                    onChange={(e) => setManualRepoId(e.target.value)}
                                                    placeholder="e.g. 123456789"
                                                    required
                                                    className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[14px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.15] focus:ring-1 focus:ring-white/[0.15] transition-all shadow-inner font-mono"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[12px] font-medium text-zinc-500 uppercase tracking-wider">
                                                    Personal Access Token
                                                </label>
                                                <input
                                                    type="text"
                                                    value={manualToken}
                                                    onChange={(e) => setManualToken(e.target.value)}
                                                    placeholder="ghp_xxxxxxxx... (only if private)"
                                                    className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[14px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.15] focus:ring-1 focus:ring-white/[0.15] transition-all shadow-inner font-mono"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={createRepo.isPending || !manualRepoId.trim()}
                                                className="h-9 w-full rounded-lg bg-white/[0.08] text-zinc-200 border border-white/[0.05] hover:bg-white/[0.12] hover:text-white disabled:opacity-40 disabled:hover:bg-white/[0.08] text-[13px] font-medium transition-all cursor-pointer flex items-center justify-center"
                                            >
                                                {createRepo.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Connect Repository'}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
