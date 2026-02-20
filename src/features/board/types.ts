export interface Label {
    id: string
    name: string
    color: string
}

export interface Assignee {
    id: string
    name: string
    avatar: string
}

export interface Task {
    id: string
    title: string
    description?: string
    labels?: Label[]
    assignee?: Assignee
    dueDate?: string
    priority: "high" | "medium" | "low"
    attachments: number
    comments: number
    checklist?: {
        completed: number
        total: number
    }
}

export interface Column {
    id: string
    title: string
    color: string
    tasks: Task[]
}
