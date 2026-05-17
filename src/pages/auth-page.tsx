import { AuthForm } from "@/features/auth/components/auth-form"
import { Link } from "react-router-dom"

export default function AuthPage() {
    return (
        <div className="relative min-h-screen flex items-center justify-center bg-[#131313] overflow-hidden px-4">
            {/* ─── Grid ─── */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.02]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: "60px 60px",
                }}
            />

            {/* ─── Back link ─── */}
            <Link
                to="/"
                className="absolute top-5 left-5 z-20 inline-flex items-center gap-1.5 text-[13px] text-zinc-600 hover:text-zinc-300 transition-colors duration-200"
            >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Home
            </Link>

            {/* ─── Form ─── */}
            <AuthForm />
        </div>
    )
}
