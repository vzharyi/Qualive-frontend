import { useState, useRef, useLayoutEffect, type ReactNode } from "react"
import { motion } from "framer-motion"
import { Link, useLocation, useNavigate } from "react-router-dom"

/* ─── Icons ─── */
function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 001 12c0 1.94.46 3.77 1.18 5.07l3.66-2.98z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    )
}

function GitHubIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
        </svg>
    )
}

/* ─── Shared input style ─── */
const inputClass =
    "w-full h-10 px-3.5 rounded-lg border border-white/[0.07] bg-white/[0.03] text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/40 focus:bg-white/[0.05] transition-all duration-200"

/* ─── Collapsible wrapper — animates height smoothly ─── */
function CollapsibleField({ visible, children }: { visible: boolean; children: ReactNode }) {
    const ref = useRef<HTMLDivElement>(null)
    const [height, setHeight] = useState(0)

    useLayoutEffect(() => {
        if (ref.current) {
            setHeight(ref.current.scrollHeight)
        }
    }, [children])

    return (
        <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{
                maxHeight: visible ? height : 0,
                opacity: visible ? 1 : 0,
                marginTop: visible ? undefined : 0,
                marginBottom: visible ? undefined : 0,
            }}
        >
            <div ref={ref}>{children}</div>
        </div>
    )
}

/* ─── Main Component ─── */
export function AuthForm() {
    const location = useLocation()
    const navigate = useNavigate()
    const initialMode = location.pathname === "/register" ? "register" : "login"
    const [mode, setMode] = useState<"login" | "register">(initialMode)

    const toggleMode = () => {
        const next = mode === "login" ? "register" : "login"
        setMode(next)
        navigate(next === "login" ? "/login" : "/register", { replace: true })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
    }

    const isLogin = mode === "login"

    return (
        <div className="relative w-full max-w-[400px]">
            {/* Ambient glow — subtle, off-center */}
            <div className="absolute -top-12 -right-16 w-[280px] h-[280px] bg-emerald-500/[0.045] rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative"
            >
                {/* ─── Header ─── */}
                <div className="flex items-center justify-center gap-3 mb-7">
                    <Link to="/landing" className="shrink-0 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-black font-bold text-xs group-hover:scale-110 transition-transform duration-200">
                            Q
                        </div>
                    </Link>
                    <h1 className="text-[22px] font-semibold text-white tracking-[-0.01em]">
                        {isLogin ? "Log in to Qualive" : "Create your account"}
                    </h1>
                </div>

                {/* ─── Card ─── */}
                <div className="rounded-xl border border-white/[0.07] bg-[#0e0e14]/90 backdrop-blur-md overflow-hidden">
                    <div className="p-6">
                        {/* ─── OAuth label (divider style) ─── */}
                        <div className="relative mb-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/[0.05]" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-2.5 text-[11px] uppercase tracking-[0.06em] text-zinc-600 bg-[#0e0e14]">
                                    {isLogin ? "Log in with" : "Sign up with"}
                                </span>
                            </div>
                        </div>

                        {/* ─── OAuth row ─── */}
                        <div className="grid grid-cols-2 gap-2.5 mb-5">
                            <button
                                type="button"
                                className="group flex items-center justify-center gap-2 h-10 rounded-lg border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-150 cursor-pointer"
                            >
                                <GoogleIcon className="w-4 h-4" />
                                <span className="text-[13px] text-zinc-400 font-medium group-hover:text-zinc-200 transition-colors">Google</span>
                            </button>
                            <button
                                type="button"
                                className="group flex items-center justify-center gap-2 h-10 rounded-lg border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-150 cursor-pointer"
                            >
                                <GitHubIcon className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                                <span className="text-[13px] text-zinc-400 font-medium group-hover:text-zinc-200 transition-colors">GitHub</span>
                            </button>
                        </div>

                        {/* ─── Divider ─── */}
                        <div className="relative mb-5">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/[0.05]" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-2.5 text-[11px] uppercase tracking-[0.06em] text-zinc-600 bg-[#0e0e14]">
                                    or continue with
                                </span>
                            </div>
                        </div>

                        {/* ─── Form ─── */}
                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            {/* Extra fields slide in/out smoothly */}
                            <CollapsibleField visible={!isLogin}>
                                <label htmlFor="name" className="block text-[12px] text-zinc-400 mb-1.5 font-medium">
                                    Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    placeholder="Your name"
                                    required={!isLogin}
                                    className={inputClass}
                                />
                            </CollapsibleField>

                            <div>
                                <label htmlFor="email" className="block text-[12px] text-zinc-400 mb-1.5 font-medium">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label htmlFor="password" className="text-[12px] text-zinc-400 font-medium">
                                        Password
                                    </label>
                                    {isLogin && (
                                        <button type="button" className="text-[11px] text-zinc-600 hover:text-emerald-400/70 transition-colors cursor-pointer">
                                            Forgot?
                                        </button>
                                    )}
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className={inputClass}
                                />
                            </div>

                            <CollapsibleField visible={!isLogin}>
                                <label htmlFor="confirm-password" className="block text-[12px] text-zinc-400 mb-1.5 font-medium">
                                    Confirm password
                                </label>
                                <input
                                    id="confirm-password"
                                    type="password"
                                    placeholder="••••••••"
                                    required={!isLogin}
                                    className={inputClass}
                                />
                            </CollapsibleField>

                            <button
                                type="submit"
                                className="w-full h-10 mt-1 rounded-lg bg-emerald-500 text-[13px] text-black font-semibold hover:bg-emerald-400 active:scale-[0.98] transition-all duration-150 cursor-pointer"
                            >
                                {isLogin ? "Continue" : "Create account"}
                            </button>
                        </form>
                    </div>

                    {/* ─── Footer strip ─── */}
                    <div className="border-t border-white/[0.05] px-6 py-3.5 text-center">
                        <span className="text-[12px] text-zinc-600">
                            {isLogin ? "No account? " : "Already have an account? "}
                            <button
                                type="button"
                                onClick={toggleMode}
                                className="text-white/70 hover:text-white font-medium transition-colors cursor-pointer"
                            >
                                {isLogin ? "Sign up" : "Log in"}
                            </button>
                        </span>
                    </div>
                </div>

                {/* ─── Terms ─── */}
                <p className="text-center text-[11px] text-zinc-700 mt-5 leading-relaxed">
                    By continuing, you agree to our{" "}
                    <a href="#" className="text-zinc-500 hover:text-zinc-400 transition-colors">Terms</a>
                    {" "}and{" "}
                    <a href="#" className="text-zinc-500 hover:text-zinc-400 transition-colors">Privacy Policy</a>.
                </p>
            </motion.div>
        </div>
    )
}
