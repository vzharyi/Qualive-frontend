import { motion, useInView, AnimatePresence } from "framer-motion"
import { useRef, useState, useCallback } from "react"

const defaultCode = `function processUserData(data: any) {
  console.log("Processing data:", data);
  var result = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i].status == "active") {
      result.push(data[i]);
    }
  }
  return result;
}`

interface AnalysisError {
    severity: "error" | "warning"
    rule: string
    message: string
    line: number
    points: number
}

function analyzeCode(code: string): AnalysisError[] {
    const errors: AnalysisError[] = []
    const lines = code.split("\n")

    lines.forEach((line, idx) => {
        const lineNum = idx + 1
        if (/:\s*any\b/.test(line)) {
            errors.push({ severity: "error", rule: "no-explicit-any", message: "Unexpected 'any'. Specify a type.", line: lineNum, points: -5 })
        }
        if (/console\.(log|warn|error|info)\s*\(/.test(line)) {
            errors.push({ severity: "warning", rule: "no-console", message: "Unexpected console statement.", line: lineNum, points: -2 })
        }
        if (/\bvar\s+/.test(line)) {
            errors.push({ severity: "error", rule: "no-var", message: "Unexpected var, use let or const.", line: lineNum, points: -5 })
        }
        if (/[^=!]==[^=]/.test(line)) {
            errors.push({ severity: "warning", rule: "eqeqeq", message: "Expected '===' but found '=='.", line: lineNum, points: -3 })
        }
        if (/eval\s*\(/.test(line)) {
            errors.push({ severity: "error", rule: "no-eval", message: "eval() is not allowed.", line: lineNum, points: -10 })
        }
        if (line.length > 120) {
            errors.push({ severity: "warning", rule: "max-len", message: "Line exceeds 120 characters.", line: lineNum, points: -1 })
        }
    })

    return errors
}

export function LiveDemoSection() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })
    const [code, setCode] = useState(defaultCode)
    const [results, setResults] = useState<AnalysisError[]>([])
    const [analyzed, setAnalyzed] = useState(false)
    const [scanning, setScanning] = useState(false)
    const editorRef = useRef<HTMLTextAreaElement>(null)
    const backdropRef = useRef<HTMLDivElement>(null)

    const handleScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
        if (backdropRef.current) {
            backdropRef.current.scrollTop = e.currentTarget.scrollTop
            backdropRef.current.scrollLeft = e.currentTarget.scrollLeft
        }
    }, [])

    const handleAnalyze = useCallback(() => {
        if (scanning) return
        setScanning(true)
        setAnalyzed(false)
        setTimeout(() => {
            const found = analyzeCode(code)
            setResults(found)
            setScanning(false)
            setAnalyzed(true)
        }, 1500)
    }, [code, scanning])

    const handleFileOpen = useCallback(() => {
        const input = document.createElement("input")
        input.type = "file"
        input.accept = ".ts,.tsx,.js,.jsx,.py,.java,.go,.rs,.cpp,.c,.cs"
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
                const reader = new FileReader()
                reader.onload = (ev) => {
                    const text = ev.target?.result as string
                    setCode(text)
                    setAnalyzed(false)
                }
                reader.readAsText(file)
            }
        }
        input.click()
    }, [])

    const score = Math.max(0, 100 + results.reduce((sum, e) => sum + e.points, 0))
    const scoreColor = score >= 90 ? "text-emerald-400" : score >= 70 ? "text-yellow-400" : "text-rose-400"
    const scoreBorder = score >= 90 ? "border-emerald-500/30" : score >= 70 ? "border-yellow-500/30" : "border-rose-500/30"
    const scoreBg = score >= 90 ? "bg-emerald-500/10" : score >= 70 ? "bg-yellow-500/10" : "bg-rose-500/10"

    const errorMap = analyzed ? results.reduce((acc, err) => {
        if (!acc[err.line] || err.severity === "error") acc[err.line] = err.severity;
        return acc;
    }, {} as Record<number, "error" | "warning">) : {} as Record<number, "error" | "warning">;

    return (
        <section id="demo" className="py-32 relative" ref={ref}>
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
                    <span className="text-xs uppercase tracking-widest text-zinc-500 font-medium">Live Demo</span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 tracking-tight">
                        Try the Qualive Engine
                    </h2>
                    <p className="text-zinc-400 mt-4 max-w-lg mx-auto">
                        Test the scoring algorithm right now. Paste your code or open a file.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="rounded-2xl border border-white/[0.14] bg-[#111115] overflow-hidden shadow-2xl shadow-emerald-500/5"
                >
                    {/* Window chrome */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                            <span className="ml-3 text-xs text-zinc-600 font-mono">analysis-sandbox.ts</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleFileOpen}
                                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 text-xs font-medium hover:bg-white/10 transition-all duration-200 flex items-center gap-1.5"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                </svg>
                                Open File
                            </button>
                            <button
                                onClick={handleAnalyze}
                                disabled={scanning}
                                className="px-4 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                            >
                                {scanning ? (
                                    <>
                                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Scanning...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                                        </svg>
                                        Run Analysis
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Split view */}
                    <div className="grid lg:grid-cols-2 h-[450px]">
                        {/* Left: Editable code */}
                        <div className="relative border-r border-white/5 overflow-hidden">
                            <AnimatePresence>
                                {scanning && (
                                    <motion.div
                                        initial={{ top: 0 }}
                                        animate={{ top: "100%" }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 1.5, ease: "linear" }}
                                        className="absolute left-0 right-0 h-0.5 bg-emerald-400 z-10 shadow-[0_0_20px_rgba(52,211,153,0.5)]"
                                    />
                                )}
                            </AnimatePresence>

                            <div className="flex h-full overflow-hidden relative">
                                <div
                                    ref={backdropRef}
                                    className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
                                >
                                    <div className="py-4 pb-12 min-h-full">
                                        {code.split("\n").map((line, i) => {
                                            const severity = errorMap[i + 1]
                                            return (
                                                <div key={i} className="flex min-h-[24px]">
                                                    <div className={`w-12 pr-3 text-right text-[10px] font-mono leading-6 shrink-0 border-r border-white/5 bg-[#111115] ${severity === "error" ? "text-rose-400" : severity === "warning" ? "text-yellow-400" : "text-zinc-600"}`}>
                                                        {i + 1}
                                                    </div>
                                                    <div className={`flex-1 px-4 relative whitespace-pre-wrap break-words font-mono text-sm leading-6 ${severity === "error" ? "bg-rose-500/10" : severity === "warning" ? "bg-yellow-500/10" : ""}`}>
                                                        <span className="invisible">{line || " "}</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <textarea
                                    ref={editorRef}
                                    value={code}
                                    onChange={(e) => { setCode(e.target.value); setAnalyzed(false) }}
                                    onScroll={handleScroll}
                                    className="relative z-10 w-full h-full bg-transparent text-zinc-300 font-mono text-sm leading-6 overflow-auto resize-none outline-none placeholder:text-zinc-700 whitespace-pre-wrap p-0 pl-12 pr-4 py-4 pb-12 custom-scrollbar"
                                    spellCheck={false}
                                    placeholder="Paste your code here..."
                                    style={{
                                        caretColor: "white",
                                        paddingLeft: "3rem",
                                    }}
                                />
                            </div>
                        </div>

                        {/* Right: Results */}
                        <div className="p-6 bg-[#0d0d12]">
                            {!analyzed && !scanning && (
                                <div className="h-full flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-zinc-600 mb-3">
                                            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                                            </svg>
                                        </div>
                                        <p className="text-zinc-600 text-sm">
                                            Press <span className="text-zinc-400 font-medium">Run Analysis</span> to start
                                        </p>
                                        <p className="text-zinc-700 text-xs mt-2">
                                            Edit the code or open a file, then analyze
                                        </p>
                                    </div>
                                </div>
                            )}

                            {scanning && (
                                <div className="h-full flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin mx-auto mb-4" />
                                        <p className="text-zinc-500 text-sm">Analyzing code...</p>
                                    </div>
                                </div>
                            )}

                            <AnimatePresence>
                                {analyzed && !scanning && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <div className={`rounded-xl ${scoreBg} border ${scoreBorder} p-5 mb-6 text-center`}>
                                            <div className={`font-mono text-5xl font-bold ${scoreColor}`}>
                                                {score}<span className="text-xl opacity-50">/100</span>
                                            </div>
                                            <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">Quality Score</div>
                                        </div>

                                        {results.length === 0 ? (
                                            <div className="text-center py-8">
                                                <svg className="w-10 h-10 mx-auto text-emerald-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p className="text-emerald-400 text-sm font-medium">Perfect! No issues found.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2 max-h-[300px] overflow-y-auto overflow-x-hidden custom-scrollbar">
                                                {results.map((err, i) => (
                                                    <motion.div
                                                        key={`${err.line}-${err.rule}-${i}`}
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.08 }}
                                                        className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5"
                                                    >
                                                        <span className={`text-xs font-mono px-1.5 py-0.5 rounded shrink-0 ${err.severity === "error"
                                                            ? "bg-rose-500/10 text-rose-400"
                                                            : "bg-yellow-500/10 text-yellow-400"
                                                            }`}>
                                                            {err.severity === "error" ? "ERR" : "WARN"}
                                                        </span>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-zinc-300">{err.message}</p>
                                                            <p className="text-xs text-zinc-600 font-mono mt-0.5">
                                                                Line {err.line} · {err.rule}
                                                            </p>
                                                        </div>
                                                        <span className="text-xs font-mono text-rose-400 shrink-0">{err.points}pt</span>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
