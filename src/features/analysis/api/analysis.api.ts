import { api } from '@/api/axios-instance'
import type { AnalysisReport, AnalysisDefect } from '../types/analysis.types'

export const analysisApi = {
    // GET /analysis/reports/:taskId
    getReports: async (taskId: number): Promise<AnalysisReport[]> => {
        const response = await api.get<AnalysisReport[]>(`/analysis/reports/${taskId}`)
        return response.data
    },

    // GET /analysis/defects/:reportId
    getDefects: async (reportId: number): Promise<AnalysisDefect[]> => {
        const response = await api.get<AnalysisDefect[]>(`/analysis/defects/${reportId}`)
        return response.data
    },
}
