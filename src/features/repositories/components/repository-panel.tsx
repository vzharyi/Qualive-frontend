import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Github, Trash2, Plus, Loader2, Link2 } from 'lucide-react'
import {
    useProjectRepositories,
    useCreateRepository,
    useDeleteRepository,
} from '../api/repositories.queries'
import { api } from '@/api/axios-instance'

interface RepositoryPanelProps {
    open: boolean
    onClose: () => void
    projectId: number
}

export function RepositoryPanel({ open, onClose, projectId }: RepositoryPanelProps) {
    const { data: repositories, isLoading } = useProjectRepositories(projectId)
    const deleteRepo = useDeleteRepository()
    const createRepo = useCreateRepository()

    // Setup fallback manual connect state
    const [showManual, setShowManual] = useState(false)
    const [manualRepoId, setManualRepoId] = useState('')
    const [manualToken, setManualToken] = useState('')

    const [isRedirecting, setIsRedirecting] = useState(false)

    // Handle GitHub App Installation
    const handleInstallClick = async () => {
        setIsRedirecting(true)
        try {
            // We do a manual fetch/axios call. If the backend does a 302 redirect,
            // axios will try to follow it. We might hit CORS. Let's see if we can catch the URL.
            // A common workaround is to have the backend return JSON, but if it returns 302,
            // we'll try to just grab the responseURL.
            const response = await api.get(`/github/install`, {
                params: { projectId },
                validateStatus: (status) => status >= 200 && status < 400,
            })

            // If backend changed to return `{ url: '...' }`
            if (response.data && response.data.url) {
                window.location.href = response.data.url
                return
            }
            // If it returns a 302 redirect, responseURL should be the final GitHub login page
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
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: '-50%', x: '-50%' }}
                        animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
                        exit={{ opacity: 0, scale: 0.95, y: '-50%', x: '-50%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed left-1/2 top-1/2 z-50 flex w-[480px] max-h-[80vh] flex-col rounded-2xl border border-white/[0.08] bg-[#181818] shadow-2xl shadow-black/60"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-5">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04]">
                                    <Github className="h-4 w-4 text-white" />
                                </div>
                                <h2 className="text-[15px] font-semibold text-white">GitHub Repositories</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-auto px-6 py-6 space-y-6">
                            {/* Connect App Banner */}
                            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-5">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 shrink-0">
                                            <Link2 className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-[13px] font-medium text-emerald-400 mb-1.5">
                                                Fast & Secure Connection
                                            </h3>
                                            <p className="text-[12px] leading-relaxed text-emerald-400/70">
                                                Install the Qualive GitHub App to easily link repositories without manually copying tokens or IDs.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleInstallClick}
                                        disabled={isRedirecting}
                                        className="h-9 w-full rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[13px] font-medium transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
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

                            {/* Connected Repositories List */}
                            <div>
                                <h3 className="text-[12px] font-medium uppercase tracking-wider text-zinc-500 mb-3">
                                    Connected ({repositories?.length || 0})
                                </h3>

                                {isLoading ? (
                                    <div className="flex items-center justify-center py-6 text-zinc-500">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    </div>
                                ) : !repositories?.length ? (
                                    <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] py-8 text-center px-4">
                                        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04]">
                                            <Github className="h-4 w-4 text-zinc-500" />
                                        </div>
                                        <p className="text-[13px] font-medium text-zinc-300">No repositories yet</p>
                                        <p className="text-[12px] text-zinc-500 mt-1 max-w-[240px] mx-auto">
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
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/[0.05]">
                                                        <Github className="h-4 w-4 text-zinc-400" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[13px] font-medium text-white">
                                                            ID: {repo.githubRepoId}
                                                        </span>
                                                        <span className="text-[11px] text-zinc-500">
                                                            {repo.installationId ? 'GitHub App' : 'Manual token'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(repo.id)}
                                                    disabled={deleteRepo.isPending}
                                                    title="Disconnect repository"
                                                    className="h-8 w-8 rounded-md flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Manual Form (Fallback) */}
                            <div>
                                <button
                                    onClick={() => setShowManual((s) => !s)}
                                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[12px] font-medium text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300 transition-colors"
                                >
                                    <span>Advanced: Manual Connection</span>
                                    <Plus className={`h-3.5 w-3.5 transition-transform ${showManual ? 'rotate-45' : ''}`} />
                                </button>

                                {showManual && (
                                    <form onSubmit={handleManualSubmit} className="mt-3 rounded-xl border border-white/[0.06] bg-[#1a1a1a] p-4 space-y-4">
                                        <div>
                                            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                                                GitHub Repository ID <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={manualRepoId}
                                                onChange={(e) => setManualRepoId(e.target.value)}
                                                placeholder="e.g. 123456789"
                                                required
                                                className="h-9 w-full rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 font-mono text-[13px] text-white placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                                                Personal Access Token
                                            </label>
                                            <input
                                                type="text"
                                                value={manualToken}
                                                onChange={(e) => setManualToken(e.target.value)}
                                                placeholder="ghp_xxxxxxxx... (only if private)"
                                                className="h-9 w-full rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 font-mono text-[13px] text-white placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={createRepo.isPending || !manualRepoId.trim()}
                                            className="h-9 w-full rounded-lg bg-emerald-500 px-4 text-[13px] font-semibold text-black hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50 transition-colors flex items-center justify-center"
                                        >
                                            {createRepo.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Connect Repository'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
