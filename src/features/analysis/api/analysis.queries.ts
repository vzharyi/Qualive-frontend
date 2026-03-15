import { useQuery } from '@tanstack/react-query'
import { analysisApi } from './analysis.api'

// ─── Query Keys ───
export const analysisKeys = {
    all: ['analysis'] as const,
    reports: (taskId: number) => [...analysisKeys.all, 'reports', taskId] as const,
    defects: (reportId: number) => [...analysisKeys.all, 'defects', reportId] as const,
}

// ─── Queries ───

export function useAnalysisReports(taskId: number) {
    return useQuery({
        queryKey: analysisKeys.reports(taskId),
        queryFn: () => analysisApi.getReports(taskId),
        enabled: !!taskId,
    })
}

export function useAnalysisDefects(reportId: number) {
    return useQuery({
        queryKey: analysisKeys.defects(reportId),
        queryFn: () => analysisApi.getDefects(reportId),
        enabled: !!reportId,
    })
}
