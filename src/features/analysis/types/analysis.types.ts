// ─── Analysis Types ───

export type AnalysisDecision = 'APPROVED' | 'PENDING' | 'REJECTED'

export type DefectSeverity = 'ERROR' | 'WARNING' | 'INFO'

export type DefectRuleType =
    | 'BEST_PRACTICE'
    | 'POSSIBLE_ERROR'
    | 'STYLE'
    | 'SUGGESTION'
    | 'LAYOUT'
    | string

export interface AnalysisReport {
    id: number
    taskId: number
    githubItemId: number
    analyzedRef: string
    qualityScore: number
    decision: AnalysisDecision
    defects: AnalysisDefect[]
    githubItem?: {
        type: 'PULL_REQUEST' | 'COMMIT'
        githubId: string
        title: string
    }
}

export interface AnalysisDefect {
    id: number
    reportId: number
    ruleType: DefectRuleType
    message: string
    filePath: string
    lineNumber: number
    severity: DefectSeverity
    penaltyPoints: number
}
