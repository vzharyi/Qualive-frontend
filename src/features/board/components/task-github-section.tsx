import { useState } from 'react'
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

interface TaskGithubSectionProps {
    taskId: number
    projectId: number
}

// ─── Score Badge ───
function ScoreBadge({ score }: { score: number | null }) {
    if (score === null) {
        return (
            <span className="inline-flex items-center gap-1 rounded-md bg-zinc-500/10 px-2 py-0.5 text-[11px] font-medium text-zinc-500">
                <Clock className="h-3 w-3" />
                Analyzing…
            </span>
        )
    }

    const color =
        score >= 80
            ? 'text-emerald-400 bg-emerald-500/10'
            : score >= 60
                ? 'text-amber-400 bg-amber-500/10'
                : 'text-red-400 bg-red-500/10'

    const Icon = score >= 80 ? CheckCircle2 : score >= 60 ? AlertTriangle : XCircle

    return (
        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${color}`}>
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
            <div className="flex items-center gap-2 py-2 pl-4 text-[11px] text-zinc-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading defects…
            </div>
        )
    }

    if (!defects?.length) {
        return (
            <div className="py-2 pl-4 text-[11px] text-zinc-500">No defects found ✓</div>
        )
    }

    return (
        <div className="mt-1 space-y-1 pl-4">
            {defects.map((d) => (
                <DefectRow key={d.id} defect={d} />
            ))}
        </div>
    )
}

function DefectRow({ defect }: { defect: AnalysisDefect }) {
    const severityColor =
        defect.severity === 'ERROR'
            ? 'text-red-400'
            : defect.severity === 'WARNING'
                ? 'text-amber-400'
                : 'text-blue-400'

    return (
        <div className="flex items-start gap-2 rounded-md bg-white/[0.02] px-2.5 py-1.5 text-[11px]">
            <span className={`mt-0.5 shrink-0 font-mono font-semibold uppercase ${severityColor}`}>
                {defect.severity.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-zinc-300 leading-snug">{defect.message}</p>
                <p className="mt-0.5 font-mono text-zinc-600">
                    {defect.filePath}:{defect.lineNumber}
                </p>
            </div>
            <span className="shrink-0 rounded bg-white/[0.04] px-1.5 py-0.5 font-mono text-zinc-500">
                −{defect.penaltyPoints}
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

    return (
        <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] transition-colors hover:bg-white/[0.03]">
            <div className="flex items-center gap-3 px-3 py-2.5">
                {/* Icon */}
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${isPR ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {isPR ? <GitPullRequest className="h-3.5 w-3.5" /> : <GitCommitHorizontal className="h-3.5 w-3.5" />}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <span className="truncate text-[13px] font-medium text-white">{item.title}</span>
                        <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-zinc-500">
                            {isPR ? `#${item.githubId}` : item.githubId.slice(0, 7)} · {item.author}
                        </span>
                    </div>
                </div>

                {/* Score */}
                <ScoreBadge score={item.codeScore} />

                {/* Expand defects */}
                {report && (report.defects?.length > 0 || report.qualityScore < 100) && (
                    <button
                        onClick={() => setShowDefects(!showDefects)}
                        className="flex h-6 w-6 items-center justify-center rounded text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-colors"
                        title="View defects"
                    >
                        {showDefects ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                )}

                {/* Delete */}
                <button
                    onClick={() => onUnlink(item.id)}
                    disabled={isDeleting}
                    className="flex h-6 w-6 items-center justify-center rounded text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                    title="Unlink"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Defects expanded */}
            {showDefects && report && <DefectsList reportId={report.id} />}
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
    const items = tab === 'pr' ? prs : commits

    return (
        <div className="rounded-xl border border-white/[0.08] bg-[#1a1a1a] shadow-xl shadow-black/40 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-white/[0.06]">
                <button
                    onClick={() => setTab('pr')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-medium transition-colors ${tab === 'pr'
                            ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/[0.03]'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                >
                    <GitPullRequest className="h-3.5 w-3.5" />
                    Pull Requests
                </button>
                <button
                    onClick={() => setTab('commit')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-medium transition-colors ${tab === 'commit'
                            ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/[0.03]'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                >
                    <GitCommitHorizontal className="h-3.5 w-3.5" />
                    Commits
                </button>
            </div>

            {/* List */}
            <div className="max-h-[220px] overflow-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                    </div>
                ) : !items?.length ? (
                    <div className="py-8 text-center text-[12px] text-zinc-500">
                        {tab === 'pr' ? 'No pull requests found' : 'No commits found'}
                    </div>
                ) : (
                    items.map((item) => {
                        const isPR = item.type === 'PULL_REQUEST'
                        return (
                            <button
                                key={item.githubId}
                                onClick={() => handleSelect(item)}
                                disabled={linkItem.isPending}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/[0.04] transition-colors disabled:opacity-50"
                            >
                                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded ${isPR ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                    {isPR ? <GitPullRequest className="h-3 w-3" /> : <GitCommitHorizontal className="h-3 w-3" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[12px] font-medium text-zinc-200">{item.title}</p>
                                    <p className="text-[11px] text-zinc-500">
                                        {isPR ? `#${item.githubId}` : item.githubId.slice(0, 7)} · {item.author}
                                        {'state' in item && item.state ? ` · ${item.state}` : ''}
                                    </p>
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
    const { data: items, isLoading } = useTaskGithubItems(taskId)
    const { data: reports } = useAnalysisReports(taskId)
    const unlinkItem = useUnlinkGithubItem()
    const [showSelector, setShowSelector] = useState(false)

    const getReportForItem = (githubItemId: number): AnalysisReport | undefined => {
        return reports?.find((r) => r.githubItemId === githubItemId)
    }

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileCode2 className="h-4 w-4 text-zinc-500" />
                    <h3 className="text-[12px] font-medium uppercase tracking-wider text-zinc-500">
                        Linked Code ({items?.length || 0})
                    </h3>
                </div>
                <button
                    onClick={() => setShowSelector(!showSelector)}
                    className="flex h-7 items-center gap-1 rounded-md px-2.5 text-[12px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Link
                </button>
            </div>

            {/* Selector dropdown */}
            {showSelector && (
                <GithubItemSelector
                    projectId={projectId}
                    taskId={taskId}
                    onClose={() => setShowSelector(false)}
                />
            )}

            {/* Items list */}
            {isLoading ? (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                </div>
            ) : !items?.length ? (
                <div className="rounded-lg border border-dashed border-white/[0.06] py-5 text-center">
                    <p className="text-[12px] text-zinc-500">
                        No PRs or commits linked yet
                    </p>
                </div>
            ) : (
                <div className="space-y-1.5">
                    {items.map((item) => (
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
