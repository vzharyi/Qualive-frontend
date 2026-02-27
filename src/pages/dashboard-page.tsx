import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Plus,
    FolderOpen,
    ArrowRight,
    Loader2,
    Kanban,
    Users,
    Code2,
    BarChart3,
    Zap,
    Shield,
} from 'lucide-react'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppHeader } from '@/components/layout/app-header'
import { useAuth } from '@/features/auth/store/auth.store'
import { useProjects } from '@/features/projects/api/projects.queries'
import { CreateProjectModal } from '@/features/projects/components/create-project-modal'

const features = [
    {
        icon: Kanban,
        title: 'Kanban Board',
        description: 'Organize tasks in customizable columns. Drag and drop to move tasks between stages instantly.',
        color: 'emerald',
    },
    {
        icon: Users,
        title: 'Team Collaboration',
        description: 'Invite members to your project, assign tasks, and track team progress in real time.',
        color: 'violet',
    },
    {
        icon: Code2,
        title: 'Code Quality Rating',
        description: 'Get an objective rating based on ESLint analysis of your commits to ensure clean, maintainable code.',
        color: 'amber',
    },
    {
        icon: Shield,
        title: 'Role-Based Access',
        description: 'Administrator, Manager, User, and Unauthorized User roles to control project permissions.',
        color: 'teal',
    },
    {
        icon: Zap,
        title: 'Priority Management',
        description: 'Set task priorities from Critical to Low. Tasks auto-sort so you focus on what matters.',
        color: 'rose',
    },
    {
        icon: BarChart3,
        title: 'Insights',
        description: 'Track project progress and identify bottlenecks before they slow your team down.',
        color: 'sky',
    },
]

const iconColorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-400',
    violet: 'bg-violet-500/10 text-violet-400',
    amber: 'bg-amber-500/10 text-amber-400',
    sky: 'bg-sky-500/10 text-sky-400',
    rose: 'bg-rose-500/10 text-rose-400',
    teal: 'bg-teal-500/10 text-teal-400',
}

export default function DashboardPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const { user } = useAuth()
    const { data: projects, isLoading } = useProjects()
    const [showCreateModal, setShowCreateModal] = useState(false)

    const hasProjects = projects && projects.length > 0

    return (
        <div className="flex h-screen overflow-hidden bg-[#181818]">
            <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <AppHeader sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-auto">
                    <div className="mx-auto max-w-3xl px-8 py-12">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-32">
                                <Loader2 className="h-6 w-6 text-zinc-600 animate-spin" />
                            </div>
                        ) : hasProjects ? (
                            /* ─── Projects View ─── */
                            <>
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="flex items-center justify-between mb-6"
                                >
                                    <div>
                                        <h1 className="text-[22px] font-semibold text-white tracking-tight">
                                            Your Projects
                                        </h1>
                                        <p className="text-[13px] text-zinc-500 mt-1">
                                            {projects.length} project{projects.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="flex items-center gap-2 h-9 px-4 rounded-lg bg-emerald-500 text-[13px] text-black font-semibold hover:bg-emerald-400 transition-all cursor-pointer"
                                    >
                                        <Plus className="h-4 w-4" />
                                        New Project
                                    </button>
                                </motion.div>

                                {/* Project List */}
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.1 }}
                                    className="space-y-2"
                                >
                                    {projects.map((project) => (
                                        <Link
                                            key={project.id}
                                            to={`/projects/${project.id}`}
                                            className="group flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-200"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400/20 to-violet-500/20 text-white font-bold text-[11px]">
                                                    {project.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-medium text-white">{project.name}</p>
                                                    {project.description && (
                                                        <p className="text-[12px] text-zinc-600 mt-0.5 truncate max-w-[400px]">
                                                            {project.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                                        </Link>
                                    ))}
                                </motion.div>
                            </>
                        ) : (
                            /* ─── Onboarding (shown only when no projects) ─── */
                            <>
                                {/* Hero */}
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="text-center mb-6"
                                >
                                    <h1 className="text-[32px] font-semibold text-white tracking-tight mb-1">
                                        Welcome to Qualive{user?.firstName ? `, ${user.firstName}` : ''}! 👋
                                    </h1>
                                    <p className="text-[14px] text-zinc-400 leading-relaxed max-w-lg mx-auto">
                                        Your intelligent project management platform. Create your first project to start managing tasks and tracking code quality.
                                    </p>
                                </motion.div>

                                {/* Create Project CTA */}
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.1 }}
                                    className="mb-6"
                                >
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="w-full group flex items-center justify-center gap-3 p-5 rounded-xl border border-dashed border-emerald-500/20 bg-emerald-500/[0.03] hover:bg-emerald-500/[0.06] hover:border-emerald-500/30 transition-all duration-200 cursor-pointer"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                                            <Plus className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[14px] font-medium text-white">Create your first project</p>
                                        </div>
                                    </button>
                                </motion.div>

                                {/* Features Grid */}
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.15 }}
                                    className="mb-0"
                                >
                                    <h2 className="text-[12px] font-medium uppercase tracking-[0.06em] text-zinc-500 mb-3 flex items-center gap-2">
                                        <FolderOpen className="h-3.5 w-3.5 text-zinc-600" />
                                        What you can do with Qualive
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {features.map((feature, i) => (
                                            <motion.div
                                                key={feature.title}
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
                                                className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconColorMap[feature.color]}`}>
                                                        <feature.icon className="h-[18px] w-[18px]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[13px] font-medium text-white mb-1">{feature.title}</p>
                                                        <p className="text-[12px] text-zinc-500 leading-relaxed">{feature.description}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            </>
                        )}
                        <CreateProjectModal open={showCreateModal} onClose={() => setShowCreateModal(false)} />
                    </div>
                </main>
            </div>
        </div>
    )
}
