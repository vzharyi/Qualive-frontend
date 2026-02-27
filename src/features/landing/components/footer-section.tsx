import { Link } from "react-router-dom"

export function FooterSection() {
    return (
        <footer className="border-t border-white/[0.08] py-12">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-black font-bold text-xs">
                            Q
                        </div>
                        <span className="text-white font-semibold tracking-tight">Qualive</span>
                    </Link>

                    {/* Links */}
                    <nav className="flex items-center gap-6">
                        <a href="#features" className="text-sm text-zinc-500 hover:text-white transition-colors">Home</a>
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-zinc-500 hover:text-white transition-colors"
                        >
                            GitHub Repo
                        </a>
                        <a
                            href="/api/docs"
                            className="text-sm text-zinc-500 hover:text-white transition-colors"
                        >
                            Documentation
                        </a>
                    </nav>

                    {/* Copyright */}
                    <p className="text-xs text-zinc-600">
                        © 2026 Vadim Zharyi. Student Project.
                    </p>
                </div>
            </div>
        </footer>
    )
}
