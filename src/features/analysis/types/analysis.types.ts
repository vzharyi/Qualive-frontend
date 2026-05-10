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

export interface PublicAnalysisRequest {
    code: string
    fileName: string
}

export interface PublicAnalysisDefect {
    ruleId: string
    ruleType: DefectRuleType
    message: string
    line: number
    column: number
    severity: DefectSeverity
}

export interface PublicAnalysisResponse {
    qualityScore: number
    decision: AnalysisDecision
    linesOfCode: number
    defects: PublicAnalysisDefect[]
}
