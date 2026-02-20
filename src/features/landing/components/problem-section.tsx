import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const problems = [
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
        ),
        title: "Code Blindness",
        description: "In regular trackers (Jira/Trello) you move a task to \"Done\" without knowing how bad the code is inside.",
        color: "text-rose-400",
        border: "border-rose-500/20 hover:border-rose-500/40",
        bg: "bg-rose-500/5",
        glow: "group-hover:shadow-rose-500/10",
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
        ),
        title: "Auto-Audit",
        description: "Qualive connects to GitHub, scans every commit with ESLint and blocks \"dirty\" code automatically.",
        color: "text-violet-400",
        border: "border-violet-500/20 hover:border-violet-500/40",
        bg: "bg-violet-500/5",
        glow: "group-hover:shadow-violet-500/10",
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
        ),
        title: "Transparent Quality",
        description: "Visualize technical debt. The unique Q(t) metric shows the real health of your project in real-time.",
        color: "text-emerald-400",
        border: "border-emerald-500/20 hover:border-emerald-500/40",
        bg: "bg-emerald-500/5",
        glow: "group-hover:shadow-emerald-500/10",
    },
]

export function ProblemSection() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    return (
        <section id="features" className="py-32 relative" ref={ref}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.015] via-transparent to-transparent pointer-events-none" />

            <div className="max-w-6xl mx-auto px-6 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-xs uppercase tracking-widest text-zinc-500 font-medium">The Problem</span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 tracking-tight">
                        Why existing tools fail
                    </h2>
                    <p className="text-zinc-400 mt-4 max-w-lg mx-auto">
                        Traditional project trackers don't care about what's inside your code. We do.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                    {problems.map((item, i) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: i * 0.15 }}
                            className={`rounded-2xl border ${item.border} ${item.bg} p-8 transition-all duration-300 group cursor-default shadow-lg ${item.glow}`}
                        >
                            <div className={`${item.color} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                {item.icon}
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-3">{item.title}</h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">{item.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
