import { motion } from "framer-motion"
import { Link } from "react-router-dom"

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, delay: i * 0.15, ease: "easeOut" },
    }),
}

export function HeroSection() {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 pb-24 overflow-hidden">
            {/* Local overlays — global bg provides the glows */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Subtle local grid */}
                <div
                    className="absolute inset-0 opacity-[0.035]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: "60px 60px",
                    }}
                />
                {/* Bottom fade — smooth transition into next section */}
                <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#070710] to-transparent" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                {/* Badge */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-400 font-medium tracking-wide uppercase mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Code Quality × Project Management
                    </span>
                </motion.div>

                {/* H1 */}
                <motion.h1
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={1}
                    className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6"
                >
                    Where Code Quality
                    <br />
                    meets{" "}
                    <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                        Project Management
                    </span>
                </motion.h1>

                {/* Subhead */}
                <motion.p
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={2}
                    className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    Don't just close tasks.{" "}
                    <span className="text-white font-medium">Improve quality.</span>{" "}
                    The first tool that combines a Kanban board with automatic GitHub code analysis
                    and Quality&nbsp;Score calculation.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={3}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
                >
                    <Link
                        to="/register"
                        className="px-8 py-3.5 bg-white text-black rounded-xl font-semibold text-base hover:bg-zinc-200 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-white/10"
                    >
                        Get Started
                    </Link>
                    <Link
                        to="/login"
                        className="px-8 py-3.5 border border-zinc-700 text-zinc-300 rounded-xl font-medium text-base hover:bg-white/5 hover:border-zinc-500 transition-all duration-200"
                    >
                        Sign In
                    </Link>
                </motion.div>

                {/* Hero Visual */}
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={4}
                    className="relative max-w-3xl mx-auto"
                >
                    <div className="relative rounded-2xl border border-white/[0.14] bg-[#111115]/80 backdrop-blur-sm p-8 sm:p-12 shadow-2xl shadow-emerald-500/10">
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-2xl" />
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 1, duration: 0.6, type: "spring" }}
                            className="text-center mb-8"
                        >
                            <div className="font-mono text-7xl sm:text-8xl font-bold text-emerald-400 mb-2">
                                98<span className="text-emerald-400/40 text-5xl sm:text-6xl">/100</span>
                            </div>
                            <div className="text-sm text-zinc-500 uppercase tracking-widest">Quality Score</div>
                        </motion.div>

                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: "Issues", value: "2", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
                                { label: "Lines", value: "1,247", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
                                { label: "Commits", value: "16", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                            ].map((metric, i) => (
                                <motion.div
                                    key={metric.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.3 + i * 0.1, duration: 0.4 }}
                                    className={`rounded-xl ${metric.bg} border ${metric.border} p-4 text-center`}
                                >
                                    <div className={`font-mono text-2xl font-bold ${metric.color}`}>{metric.value}</div>
                                    <div className="text-xs text-zinc-500 mt-1">{metric.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.5, duration: 0.5 }}
                        className="hidden lg:block absolute -left-16 top-8 rounded-xl border border-white/10 bg-[#111115]/90 backdrop-blur-sm p-4 shadow-xl"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-violet-400" />
                            <span className="text-xs text-zinc-400 font-mono">AUTH-142</span>
                        </div>
                        <div className="text-sm text-white font-medium">Auth Refactoring</div>
                        <div className="text-xs text-zinc-500 mt-1">In Progress</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.7, duration: 0.5 }}
                        className="hidden lg:block absolute -right-12 top-16 rounded-xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm p-3 shadow-xl"
                    >
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs text-emerald-400 font-medium">0 errors found</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.9, duration: 0.5 }}
                        className="hidden lg:block absolute -right-8 bottom-4 rounded-xl border border-white/10 bg-[#111115]/90 backdrop-blur-sm p-3 shadow-xl"
                    >
                        <div className="font-mono text-xs text-zinc-400">
                            <span className="text-violet-400">ESLint</span> · passed
                        </div>
                    </motion.div>

                    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-emerald-500/15 blur-[80px] rounded-full" />
                </motion.div>
            </div>
        </section>
    )
}
