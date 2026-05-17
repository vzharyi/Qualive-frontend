import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Plus,
    FolderOpen,
    Loader2,
    Kanban,
    Users,
    Code2,
    BarChart3,
    Zap,
    Shield,
    Settings2,
} from 'lucide-react'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppHeader } from '@/components/layout/app-header'
import { useAuth } from '@/features/auth/store/auth.store'
import { useProjects } from '@/features/projects/api/projects.queries'
import { CreateProjectModal } from '@/features/projects/components/create-project-modal'
import { ProjectSettingsModal } from '@/features/projects/components/project-settings-modal'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Project } from '@/features/projects/types/projects.types'

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

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

const PROJECT_COLORS = [
    { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', hoverBorder: 'hover:border-blue-500/40' },
    { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20', hoverBorder: 'hover:border-violet-500/40' },
    { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', hoverBorder: 'hover:border-amber-500/40' },
    { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', hoverBorder: 'hover:border-rose-500/40' },
    { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', hoverBorder: 'hover:border-cyan-500/40' },
    { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400', border: 'border-fuchsia-500/20', hoverBorder: 'hover:border-fuchsia-500/40' },
]

const getProjectColor = (id: string | number) => {
    const str = String(id);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return PROJECT_COLORS[Math.abs(hash) % PROJECT_COLORS.length];
}

export default function DashboardPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const { user } = useAuth()
    const { data: projects, isLoading } = useProjects()
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [settingsProject, setSettingsProject] = useState<Project | null>(null)

    const hasProjects = projects && projects.length > 0

    return (
        <div className="flex h-screen overflow-hidden bg-[#181818]">
            <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <AppHeader sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-auto">
                    <div className="mx-auto max-w-[1050px] w-full px-8 py-12">
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
                                        className="flex items-center gap-2 h-9 px-4 rounded-lg bg-white/[0.08] text-[13px] text-zinc-200 font-medium border border-white/[0.05] hover:bg-white/[0.12] hover:text-white transition-all cursor-pointer"
                                    >
                                        <Plus className="h-4 w-4" />
                                        New Project
                                    </button>
                                </motion.div>

                                {/* Project List */}
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="show"
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                                >
                                    {projects.map((project) => {
                                        const color = getProjectColor(project.id);
                                        return (
                                        <motion.div variants={itemVariants} key={project.id} className="relative group/card">
                                            {/* Settings button — top right, appears on hover */}
                                            <button
                                                onClick={(e) => { e.preventDefault(); setSettingsProject(project) }}
                                                className="absolute top-3 right-3 z-20 h-7 w-7 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.05] text-zinc-600 opacity-0 group-hover/card:opacity-100 hover:text-zinc-300 hover:bg-white/[0.08] transition-all"
                                                title="Project settings"
                                            >
                                                <Settings2 className="h-3.5 w-3.5" />
                                            </button>
                                            <Link
                                                to={`/projects/${project.id}`}
                                                className={`group relative flex flex-col justify-between p-5 h-[200px] rounded-2xl border border-white/[0.06] bg-white/[0.02] group-hover/card:bg-white/[0.04] ${color.hoverBorder.replace('hover:', 'group-hover/card:')} transition-all duration-300 overflow-visible`}
                                            >
                                                {/* Background hover subtle glow */}
                                                <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />

                                                <div className="relative z-10">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-11 w-11 rounded-xl">
                                                                {project.avatarUrl && <AvatarImage src={project.avatarUrl} alt={project.name} className="object-cover" />}
                                                                <AvatarFallback className={`h-full w-full flex items-center justify-center rounded-xl border ${color.bg} ${color.border} ${color.text} font-bold text-[14px] shadow-inner`}>
                                                                    {project.name.charAt(0).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <h3 className="text-[15px] font-semibold text-zinc-200 group-hover/card:text-white transition-colors line-clamp-1">
                                                                    {project.name.length > 20 ? `${project.name.slice(0, 20)}...` : project.name}
                                                                </h3>
                                                                <p className="text-[12px] text-zinc-500 mt-0.5">
                                                                    Created by <span className="text-zinc-400">{project.owner?.firstName || project.owner?.login || 'Unknown'}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <p className="text-[13px] text-zinc-400 line-clamp-2 leading-relaxed">
                                                        {project.description || "No description provided for this project."}
                                                    </p>
                                                </div>

                                                <div className="relative z-10 flex items-center justify-between mt-auto pt-4 border-t border-white/[0.04]">
                                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.05]">
                                                        <Users className="h-3.5 w-3.5 text-zinc-500" />
                                                        <span className="text-[12px] font-medium text-zinc-400">
                                                            {project.members?.length || 0} {project.members?.length === 1 ? 'member' : 'members'}
                                                        </span>
                                                    </div>

                                                    {/* Expandable Avatar Stack */}
                                                    <div className="flex items-center justify-end -space-x-2 group-hover/card:space-x-1 transition-all duration-300">
                                                        {project.members?.slice(0, 5).map((member, i) => {
                                                            const mUser = member.user
                                                            const initials = mUser
                                                                ? (`${mUser.firstName?.charAt(0) || ""}${mUser.lastName?.charAt(0) || ""}` || mUser.login?.charAt(0) || "?").toUpperCase()
                                                                : "?"
                                                            return (
                                                                <div
                                                                    key={member.userId}
                                                                    className="relative group/avatar"
                                                                    style={{ zIndex: 10 - i }}
                                                                >
                                                                    <Avatar className="h-7 w-7 ring-2 ring-[#181818] transition-all duration-300 hover:!scale-110 hover:!ring-white/[0.2]">
                                                                        {mUser?.avatarUrl && <AvatarImage src={mUser.avatarUrl} />}
                                                                        <AvatarFallback className="bg-white/10 text-white text-[10px] font-bold">
                                                                            {initials}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    {/* Tooltip on hover */}
                                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-zinc-800 text-white text-[11px] font-medium rounded-md shadow-xl opacity-0 group-hover/avatar:opacity-100 pointer-events-none whitespace-nowrap z-50 transform scale-95 group-hover/avatar:scale-100 transition-all">
                                                                        {mUser?.firstName || mUser?.login} <span className="text-zinc-400 ml-1">({member.role.toLowerCase()})</span>
                                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-zinc-800" />
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                        {project.members && project.members.length > 5 && (
                                                            <div className="h-7 w-7 rounded-full ring-2 ring-[#181818] bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 font-bold z-0 group-hover/card:ml-1 transition-all">
                                                                +{project.members.length - 5}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                        );
                                    })}
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
                                        className="w-full group flex items-center justify-center gap-3 p-5 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.2] transition-all duration-200 cursor-pointer"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] text-zinc-400 group-hover:bg-white/[0.08] group-hover:text-white transition-all">
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
                        {settingsProject && (
                            <ProjectSettingsModal
                                open={true}
                                onClose={() => setSettingsProject(null)}
                                project={settingsProject}
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}
