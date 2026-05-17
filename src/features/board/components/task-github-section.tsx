import { useState, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { taskKeys } from '@/features/tasks/api/tasks.queries'
import {
    GitPullRequest,
    GitCommitHorizontal,
    Trash2,
    Plus,
    Loader2,
    ExternalLink,
    ChevronDown,
    ChevronRight,
    FileCode2,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Clock,
    Search
} from 'lucide-react'
import {
    useTaskGithubItems,
    useLinkGithubItem,
    useUnlinkGithubItem,
    useGithubPullRequests,
    useGithubCommits,
} from '@/features/tasks/api/github-items.queries'
import { useAnalysisReports, useAnalysisDefects } from '@/features/analysis/api/analysis.queries'
import type { TaskGithubItem, GithubPullRequest, GithubCommit } from '@/features/tasks/types/github-items.types'
import type { AnalysisReport, AnalysisDefect } from '@/features/analysis/types/analysis.types'
import { cn } from '@/lib/utils'

interface TaskGithubSectionProps {
    taskId: number
    projectId: number
}

// ─── Score Badge ───
function ScoreBadge({ score }: { score: number | null }) {
    if (score === null) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/50 bg-zinc-800/30 px-2 py-0.5 text-[11px] font-medium text-zinc-400">
                <Clock className="h-3 w-3" />
                Analyzing
            </span>
        )
    }

    const color =
        score >= 80
            ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
            : score >= 60
                ? 'text-amber-400 border-amber-500/20 bg-amber-500/10'
                : 'text-red-400 border-red-500/20 bg-red-500/10'

    const Icon = score >= 80 ? CheckCircle2 : score >= 60 ? AlertTriangle : XCircle

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${color}`}>
            <Icon className="h-3 w-3" />
            {score}
        </span>
    )
}

// ─── Defects Inline List ───
function DefectsList({ reportId }: { reportId: number }) {
    const { data: defects, isLoading } = useAnalysisDefects(reportId)

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 py-3 pl-12 text-[12px] text-zinc-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Analyzing code quality...
            </div>
        )
    }

    if (!defects?.length) {
        return (
            <div className="py-3 pl-12 text-[12px] text-zinc-500 flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/70" />
                No defects found. Code looks solid.
            </div>
        )
    }

    return (
        <div className="mt-2 space-y-1.5 pl-12 pr-4 pb-3 max-h-[340px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600">
            {defects.map((d) => (
                <DefectRow key={d.id} defect={d} />
            ))}
        </div>
    )
}

function DefectRow({ defect }: { defect: AnalysisDefect }) {
    const severityBorder =
        defect.severity === 'ERROR'
            ? 'border-l-red-500/50 bg-red-500/[0.02]'
            : defect.severity === 'WARNING'
                ? 'border-l-amber-500/50 bg-amber-500/[0.02]'
                : 'border-l-blue-500/50 bg-blue-500/[0.02]'

    const severityText =
        defect.severity === 'ERROR'
            ? 'text-red-400'
            : defect.severity === 'WARNING'
                ? 'text-amber-400'
                : 'text-blue-400'

    return (
        <div className={`flex items-start gap-3 rounded-r-lg border border-l-2 border-y-white/[0.04] border-r-white/[0.04] px-3 py-2 ${severityBorder}`}>
            <span className={`mt-0.5 shrink-0 font-mono text-[10px] font-bold tracking-wider ${severityText}`}>
                {defect.severity.substring(0, 3)}
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-[12px] text-zinc-300 leading-relaxed">{defect.message}</p>
                <div className="mt-1 flex items-center gap-2 font-mono text-[10px] text-zinc-500">
                    <span className="truncate">{defect.filePath}</span>
                    <span className="shrink-0 text-zinc-600">line {defect.lineNumber}</span>
                </div>
            </div>
            <span className="shrink-0 rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-[11px] font-medium text-zinc-400 border border-white/[0.04]">
                -{defect.penaltyPoints}
            </span>
        </div>
    )
}

// ─── Linked Item Row ───
function LinkedItemRow({
    item,
    report,
    onUnlink,
    isDeleting,
}: {
    item: TaskGithubItem
    report?: AnalysisReport
    onUnlink: (id: number) => void
    isDeleting: boolean
}) {
    const [showDefects, setShowDefects] = useState(false)
    const isPR = item.type === 'PULL_REQUEST'
    const hasDefects = report && (report.defects?.length > 0 || report.qualityScore < 100)

    return (
        <div className={cn(
            "rounded-xl border transition-all overflow-hidden",
            showDefects ? "bg-white/[0.03] border-white/[0.08]" : "bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.06]"
        )}>
            <div 
                className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                onClick={() => hasDefects && setShowDefects(!showDefects)}
            >
                {/* Icon */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] border border-white/[0.05]">
                    {isPR ? <GitPullRequest className="h-4 w-4 text-zinc-300" /> : <GitCommitHorizontal className="h-4 w-4 text-zinc-300" />}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <span className="truncate text-[13px] font-medium text-zinc-200">{item.title}</span>
                        <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-zinc-600 hover:text-white transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-[11px] text-zinc-500 bg-black/20 px-1.5 py-0.5 rounded border border-white/[0.04]">
                            {isPR ? `#${item.githubId}` : item.githubId.slice(0, 7)}
                        </span>
                        <span className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                            {item.author}
                        </span>
                    </div>
                </div>

                {/* Score */}
                <ScoreBadge score={item.codeScore} />

                {/* Actions */}
                <div className="flex items-center gap-1 ml-2">
                    {hasDefects && (
                        <button
                            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors"
                            title="View defects"
                        >
                            {showDefects ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); onUnlink(item.id) }}
                        disabled={isDeleting}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                        title="Unlink"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Defects expanded */}
            {showDefects && report && (
                <div className="border-t border-white/[0.04] bg-black/10">
                    <DefectsList reportId={report.id} />
                </div>
            )}
        </div>
    )
}

// ─── Dropdown Selector ───
function GithubItemSelector({
    projectId,
    taskId,
    onClose,
}: {
    projectId: number
    taskId: number
    onClose: () => void
}) {
    const [tab, setTab] = useState<'pr' | 'commit'>('pr')
    const [searchQuery, setSearchQuery] = useState('')
    const { data: prs, isLoading: prsLoading } = useGithubPullRequests(projectId, tab === 'pr')
    const { data: commits, isLoading: commitsLoading } = useGithubCommits(projectId, tab === 'commit')
    const linkItem = useLinkGithubItem()

    const handleSelect = (item: GithubPullRequest | GithubCommit) => {
        linkItem.mutate(
            {
                taskId,
                data: {
                    type: item.type,
                    githubId: item.githubId,
                    url: item.url,
                    title: item.title,
                    author: item.author,
                },
            },
            { onSuccess: () => onClose() }
        )
    }

    const isLoading = tab === 'pr' ? prsLoading : commitsLoading
    const displayedItems = (() => {
        const baseItems = tab === 'pr' ? prs : commits
        if (!baseItems) return []
        if (!searchQuery.trim()) return baseItems
        
        const q = searchQuery.toLowerCase()
        return baseItems.filter(i => 
            i.title.toLowerCase().includes(q) || 
            i.author.toLowerCase().includes(q) || 
            String(i.githubId).toLowerCase().includes(q)
        )
    })()

    return (
        <div className="h-[422px] flex flex-col rounded-2xl border border-white/[0.08] bg-[#1e1e1e] overflow-hidden">
            {/* Segmented Control Tabs */}
            <div className="flex-none p-2 pb-0">
                <div className="flex bg-black/40 rounded-lg p-1 border border-white/[0.04]">
                    <button
                        onClick={() => setTab('pr')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-1.5 text-[12px] font-medium rounded-md transition-all",
                            tab === 'pr'
                                ? "bg-[#2a2a2a] text-white shadow-sm border border-white/[0.06]"
                                : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        <GitPullRequest className="h-3.5 w-3.5" />
                        Pull Requests
                    </button>
                    <button
                        onClick={() => setTab('commit')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-1.5 text-[12px] font-medium rounded-md transition-all",
                            tab === 'commit'
                                ? "bg-[#2a2a2a] text-white shadow-sm border border-white/[0.06]"
                                : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        <GitCommitHorizontal className="h-3.5 w-3.5" />
                        Commits
                    </button>
                </div>
            </div>

            {/* Search Input */}
            <div className="flex-none px-3 py-2 border-b border-white/[0.06]">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                    <input 
                        type="text" 
                        placeholder={tab === 'pr' ? "Search pull requests..." : "Search commits..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/20 border border-white/[0.05] rounded-lg pl-8 pr-3 py-1.5 text-[12px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.15] transition-colors"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-auto p-2 space-y-1">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-4 gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                        <span className="text-[11px] text-zinc-500">Loading {tab === 'pr' ? 'pull requests' : 'commits'}...</span>
                    </div>
                ) : !displayedItems?.length ? (
                    <div className="py-4 text-center flex flex-col items-center gap-1">
                        <FileCode2 className="h-4 w-4 text-zinc-700" />
                        <p className="text-[12px] text-zinc-500 font-medium">Nothing found</p>
                    </div>
                ) : (
                    displayedItems.map((item: GithubPullRequest | GithubCommit) => {
                        const isPR = item.type === 'PULL_REQUEST'
                        return (
                            <button
                                key={item.githubId}
                                onClick={() => handleSelect(item)}
                                disabled={linkItem.isPending}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-white/[0.05] transition-colors disabled:opacity-50 group border border-transparent hover:border-white/[0.04]"
                            >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/40 border border-white/[0.05] group-hover:bg-[#1a1a1a] transition-colors">
                                    {isPR ? <GitPullRequest className="h-4 w-4 text-zinc-400 group-hover:text-white transition-colors" /> : <GitCommitHorizontal className="h-4 w-4 text-zinc-400 group-hover:text-white transition-colors" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[13px] font-medium text-zinc-300 group-hover:text-white transition-colors">{item.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="font-mono text-[10px] text-zinc-500 bg-black/30 px-1.5 rounded border border-white/[0.04]">
                                            {isPR ? `#${item.githubId}` : item.githubId.slice(0, 7)}
                                        </span>
                                        <span className="text-[11px] text-zinc-600 truncate flex items-center gap-1.5">
                                            <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                                            {item.author}
                                            {'state' in item && item.state ? ` · ${item.state}` : ''}
                                        </span>
                                    </div>
                                </div>
                                <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex h-6 w-6 items-center justify-center rounded bg-white/[0.08] text-white">
                                        <Plus className="h-3.5 w-3.5" />
                                    </div>
                                </div>
                            </button>
                        )
                    })
                )}
            </div>
        </div>
    )
}

// ─── Main Component ───
export function TaskGithubSection({ taskId, projectId }: TaskGithubSectionProps) {
    const queryClient = useQueryClient()
    const { data: items, isLoading } = useTaskGithubItems(taskId) as any
    
    const isAnalyzing = items?.some((item: any) => item.codeScore === null)
    
    // Active polling when analyzing
    useTaskGithubItems(taskId, {
        refetchInterval: isAnalyzing ? 3000 : false,
        enabled: !!taskId && !!isAnalyzing
    })
    const { data: reports } = useAnalysisReports(taskId)
    const unlinkItem = useUnlinkGithubItem()
    const [showSelector, setShowSelector] = useState(false)

    const prevAnalyzing = useRef(false)
    
    useEffect(() => {
        const isAnalyzing = items?.some((item: any) => item.codeScore === null)
        
        if (prevAnalyzing.current && !isAnalyzing && items?.length) {
            queryClient.invalidateQueries({ queryKey: taskKeys.all })
        }
        
        prevAnalyzing.current = isAnalyzing
    }, [items, queryClient])

    const getReportForItem = (githubItemId: number): AnalysisReport | undefined => {
        return reports?.find((r) => r.githubItemId === githubItemId)
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.06] border border-white/[0.04]">
                        <FileCode2 className="h-3 w-3 text-zinc-300" />
                    </div>
                    <h3 className="text-[13px] font-semibold text-white tracking-tight">
                        Linked Github
                        {items && items.length > 0 && (
                            <span className="ml-2 rounded-full bg-white/[0.08] px-2 py-0.5 text-[11px] font-medium text-zinc-300 border border-white/[0.04]">
                                {items.length}
                            </span>
                        )}
                    </h3>
                </div>
                <button
                    onClick={() => setShowSelector(!showSelector)}
                    className={cn(
                        "flex h-7 items-center gap-1.5 rounded-md px-3 text-[12px] font-medium transition-all border",
                        showSelector 
                            ? "bg-white/[0.08] text-white border-white/[0.1]" 
                            : "bg-transparent text-zinc-400 hover:text-white border-white/[0.06] hover:bg-white/[0.04]"
                    )}
                >
                    <Plus className={cn("h-3.5 w-3.5 transition-transform", showSelector && "rotate-45")} />
                    {showSelector ? "Cancel" : "Add Link"}
                </button>
            </div>

            {/* Content Area */}
            {showSelector ? (
                <GithubItemSelector
                    projectId={projectId}
                    taskId={taskId}
                    onClose={() => setShowSelector(false)}
                />
            ) : isLoading ? (
                <div className="flex flex-col items-center justify-center h-[422px] gap-3 border border-dashed border-white/[0.08] rounded-2xl bg-white/[0.01]">
                    <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
                    <span className="text-[12px] text-zinc-500">Loading linked items...</span>
                </div>
            ) : !items?.length ? (
                <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] h-[422px] text-center flex flex-col items-center justify-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.05]">
                        <FileCode2 className="h-4 w-4 text-zinc-500" />
                    </div>
                    <div>
                        <p className="text-[13px] font-medium text-zinc-300">No linked code yet</p>
                        <p className="text-[12px] text-zinc-600 mt-1 max-w-[240px]">
                            Link a pull request or commit to automatically track its quality and status here.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-2 h-[422px] ">
                    {items.map((item: TaskGithubItem) => (
                        <LinkedItemRow
                            key={item.id}
                            item={item}
                            report={getReportForItem(item.id)}
                            onUnlink={(id) => unlinkItem.mutate(id)}
                            isDeleting={unlinkItem.isPending}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
