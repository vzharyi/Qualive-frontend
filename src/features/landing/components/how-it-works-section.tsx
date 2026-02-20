import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const steps = [
    {
        number: "01",
        title: "Create Task",
        description: "Create a task on the Kanban board, just like any tracker.",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
        ),
    },
    {
        number: "02",
        title: "Code & Push",
        description: "Write code and push to GitHub. Qualive tracks commits.",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
        ),
    },
    {
        number: "03",
        title: "Analyze",
        description: "Engine auto-checks code with ESLint and calculates metrics.",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
        ),
    },
    {
        number: "04",
        title: "Get Score",
        description: "Get Quality Score right in the task card.",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
]

export function HowItWorksSection() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    return (
        <section id="how-it-works" className="py-32 relative" ref={ref}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-700/60 to-transparent" />

            <div className="max-w-6xl mx-auto px-6 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <span className="text-xs uppercase tracking-widest text-zinc-500 font-medium">How It Works</span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 tracking-tight">
                        Four steps to better code
                    </h2>
                </motion.div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                    {steps.map((step, i) => (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: i * 0.15 }}
                            className="relative text-center group"
                        >
                            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl border border-white/[0.12] bg-[#111115] flex items-center justify-center relative group-hover:border-emerald-500/30 group-hover:bg-emerald-500/5 transition-all duration-500 z-10">
                                <div className="text-zinc-400 group-hover:text-emerald-400 transition-colors duration-300">
                                    {step.icon}
                                </div>
                            </div>

                            <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-7 h-7 rounded-full bg-[#111115] border border-white/[0.12] flex items-center justify-center text-[10px] font-mono text-zinc-500 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all duration-300 z-20">
                                {step.number}
                            </span>

                            {i < steps.length - 1 && (
                                <div className="hidden lg:flex absolute top-12 -right-4 w-8 items-center justify-center z-0">
                                    <svg className="w-5 h-5 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </div>
                            )}

                            <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                            <p className="text-sm text-zinc-500 leading-relaxed max-w-[200px] mx-auto">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
