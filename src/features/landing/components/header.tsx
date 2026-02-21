import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"

const NAV_ITEMS = [
    { label: "Features", id: "features" },
    { label: "How it Works", id: "how-it-works" },
    { label: "Live Demo", id: "demo" },
    { label: "Formula", id: "formula" },
    { label: "Tech Stack", id: "tech-stack" },
]

export function Header() {
    const [scrolled, setScrolled] = useState(false)
    const [activeId, setActiveId] = useState<string | null>(null)

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 20)
            if (window.scrollY < 100) {
                setActiveId(null)
                return
            }

            // Find the last section whose TOP edge has passed the trigger point
            // Change 0.4 to adjust when it triggers: 0.5 = middle, 0.7 = later, 0.4 = earlier
            const triggerY = window.scrollY + window.innerHeight * 0.4

            let active: string | null = null
            NAV_ITEMS.forEach(({ id }) => {
                const el = document.getElementById(id)
                if (!el) return
                // Use getBoundingClientRect + scrollY for accurate DOCUMENT position
                const elTop = el.getBoundingClientRect().top + window.scrollY
                if (elTop <= triggerY) {
                    active = id
                }
            })

            setActiveId(active)
        }

        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    // Remove the old IntersectionObserver effect — scroll spy is now handled above

    const scrollToSection = useCallback((id: string) => {
        const el = document.getElementById(id)
        if (el) {
            const elementRect = el.getBoundingClientRect()
            const absoluteElementTop = elementRect.top + window.pageYOffset
            const viewportHeight = window.innerHeight
            const elementHeight = elementRect.height

            // Calculate position to center the element in the available viewport (considering header height)
            const targetPosition = absoluteElementTop - (viewportHeight / 2) + (elementHeight / 2) - (64 / 2) // Subtract half header height to offset optical center

            window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
            })
        }
    }, [])

    const scrollToTop = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        window.scrollTo({ top: 0, behavior: "smooth" })
        setActiveId(null)
    }, [])

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                ? "bg-[#0a0a10]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-lg shadow-black/20"
                : "bg-transparent border-b border-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo — smooth scroll to top */}
                <a href="/" onClick={scrollToTop} className="flex items-center gap-2 group cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-black font-bold text-sm group-hover:scale-110 transition-transform duration-200">
                        Q
                    </div>
                    <span className="text-white font-semibold text-lg tracking-tight group-hover:text-zinc-200 transition-colors duration-200">
                        Qualive
                    </span>
                </a>

                {/* Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => scrollToSection(item.id)}
                            className={`relative text-sm transition-colors duration-200 pb-0.5 ${activeId === item.id ? "text-white" : "text-zinc-400 hover:text-white"
                                }`}
                        >
                            {item.label}
                            {/* Active indicator */}
                            <span className={`absolute -bottom-0.5 left-0 right-0 h-px bg-emerald-400 transition-all duration-300 ${activeId === item.id ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                                }`} />
                        </button>
                    ))}
                </nav>

                {/* CTA */}
                <div className="flex items-center gap-3">
                    <Link
                        to="/login"
                        className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/register"
                        className="text-sm px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </motion.header>
    )
}
