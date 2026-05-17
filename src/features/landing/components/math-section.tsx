import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const formulaDetails = [
    {
        title: "Quality Score Q(t)",
        description: "The main metric. A value from 0 to 100, calculated at time t. Shows the overall health of the codebase at any given moment.",
        color: "border-white/[0.06] bg-white/[0.02]",
        accent: "text-zinc-200",
    },
    {
        title: "Normalization Factor K",
        description: "A scaling coefficient that adjusts sensitivity. Prevents small files from being over-penalized and large codebases from hiding issues.",
        color: "border-white/[0.06] bg-white/[0.02]",
        accent: "text-zinc-200",
    },
    {
        title: "Defect Weight w(d)",
        description: "Each defect has a weight based on severity. Critical errors (no-explicit-any) weigh more than warnings (no-console). This ensures serious issues impact the score more.",
        color: "border-white/[0.06] bg-white/[0.02]",
        accent: "text-zinc-200",
    },
    {
        title: "Code Size S_code",
        description: "Total lines of code in the project. The formula divides by S_code to get defect density — a project with 10 errors in 10,000 lines is healthier than 10 errors in 100 lines.",
        color: "border-white/[0.06] bg-white/[0.02]",
        accent: "text-zinc-200",
    },
    {
        title: "Sum of Defects Σw(d)",
        description: "The aggregated total of all weighted defects. Each lint error, warning, and convention violation contributes to this sum. Fixing any defect immediately improves the score.",
        color: "border-white/[0.06] bg-white/[0.02]",
        accent: "text-zinc-200",
    },
    {
        title: "Floor Function max(0, ...)",
        description: "Ensures the score never goes below zero. Even the most problematic codebase gets a 0, not a negative number. This keeps the metric intuitive and comparable.",
        color: "border-white/[0.06] bg-white/[0.02]",
        accent: "text-zinc-200",
    },
]

function MarqueeColumn({ items, reverse = false }: { items: typeof formulaDetails; reverse?: boolean }) {
    return (
        <div className="flex flex-col overflow-hidden h-[420px] relative group">
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#131313] via-[#131313]/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#131313] via-[#131313]/80 to-transparent z-10 pointer-events-none" />

            <div className={`flex flex-col gap-4 ${reverse ? "animate-marquee-up-reverse" : "animate-marquee-up"} group-hover:[animation-play-state:paused]`}>
                {[...items, ...items].map((item, i) => (
                    <div key={i} className={`rounded-xl border ${item.color} p-5 shrink-0`}>
                        <h4 className={`font-mono text-sm font-bold ${item.accent} mb-2`}>{item.title}</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function MathSection() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    const col1 = formulaDetails.slice(0, 3)
    const col2 = formulaDetails.slice(3)

    return (
        <section id="formula" className="py-32 relative" ref={ref}>
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-700/60 to-transparent" />
            </div>

            <div className="max-w-6xl mx-auto px-6 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-xs uppercase tracking-widest text-zinc-500 font-medium">The Math</span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 tracking-tight">
                        Powered by Math, not feelings
                    </h2>
                    <p className="text-zinc-400 mt-4 max-w-lg mx-auto">
                        We use the Weighted Scoring algorithm — a weighted assessment accounting for defect density.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 sm:p-10 text-center mb-6 sticky top-24">
                            <div className="font-mono text-xl sm:text-3xl lg:text-4xl text-white tracking-wider select-none mb-8 leading-relaxed">
                                <span className="text-amber-500 font-bold italic">Q</span>
                                <span className="text-zinc-500">(</span>
                                <span className="text-amber-400 italic">t</span>
                                <span className="text-zinc-500">)</span>
                                <span className="text-zinc-600 mx-2">=</span>
                                <span className="text-zinc-400">max</span>
                                <span className="text-zinc-600">(</span>
                                <span className="text-zinc-300">0</span>
                                <span className="text-zinc-600">,&nbsp;</span>
                                <span className="text-zinc-300">100</span>
                                <span className="text-zinc-500 mx-1">−</span>

                                <span className="inline-flex flex-col items-center mx-1 align-middle">
                                    <span className="text-base sm:text-xl text-zinc-300 border-b border-zinc-600 px-2 pb-0.5">K</span>
                                    <span className="text-base sm:text-xl text-amber-400 px-2 pt-0.5 italic">
                                        S<sub className="text-[10px]">code</sub>
                                    </span>
                                </span>

                                <span className="text-zinc-500 mx-1">·</span>
                                <span className="text-zinc-400 text-xl sm:text-2xl">Σ</span>
                                <span className="text-zinc-400 italic">w</span>
                                <span className="text-zinc-500">(</span>
                                <span className="text-zinc-300 italic">d</span>
                                <span className="text-zinc-500">)</span>
                                <span className="text-zinc-600">)</span>
                            </div>

                            <div className="rounded-xl bg-black/40 border border-white/[0.08] p-4 text-left">
                                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3 font-medium">Example</div>
                                <div className="font-mono text-sm space-y-1.5">
                                    <div><span className="text-zinc-500">S_code =</span> <span className="text-zinc-300">1,247 lines</span></div>
                                    <div><span className="text-zinc-500">Defects:</span> <span className="text-zinc-300">2 errors × 5pt</span> + <span className="text-zinc-300">1 warning × 2pt</span></div>
                                    <div><span className="text-zinc-500">Σw(d) =</span> <span className="text-zinc-300">12</span></div>
                                    <div className="pt-2 border-t border-white/5">
                                        <span className="text-zinc-500">Q(t) = max(0, 100 − (1000/1247) × 12) =</span>{" "}
                                        <span className="text-amber-500 font-bold">90.4</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        <MarqueeColumn items={col1} />
                        <MarqueeColumn items={col2} reverse />
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
