import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"

const techs = [
    {
        name: "NestJS",
        color: "#E0234E",
        description: "Backend framework",
        icon: (
            <svg viewBox="0 0 24 24" className="w-10 h-10" fill="currentColor">
                <path d="M14.131.047c-.173 0-.334.037-.483.087.316.21.49.49.576.806.007.043.019.074.025.117.007.043.012.074.018.117a1.891 1.891 0 01-.104.912c-.012.03-.024.062-.043.093l-.012.03c-.03.067-.067.136-.104.198a1.876 1.876 0 01-.585.585 1.836 1.836 0 01-.198.104l-.03.012c-.03.019-.062.031-.093.043a1.891 1.891 0 01-.912.104c-.043-.006-.074-.012-.117-.018-.043-.006-.074-.018-.117-.025a1.588 1.588 0 01-.806-.576c-.05.149-.087.31-.087.483a1.78 1.78 0 001.78 1.78 1.78 1.78 0 001.78-1.78A1.78 1.78 0 0014.131.048zM12 3.355a8.644 8.644 0 00-8.645 8.644A8.644 8.644 0 0012 20.644 8.644 8.644 0 0020.645 12 8.644 8.644 0 0012 3.355zm0 1.474A7.17 7.17 0 0119.17 12 7.17 7.17 0 0112 19.17 7.17 7.17 0 014.83 12 7.17 7.17 0 0112 4.83z" />
            </svg>
        ),
    },
    {
        name: "React",
        color: "#61DAFB",
        description: "UI library",
        icon: (
            <svg viewBox="0 0 24 24" className="w-10 h-10" fill="currentColor">
                <path d="M12 10.11c1.03 0 1.87.84 1.87 1.89 0 1-.84 1.85-1.87 1.85S10.13 13 10.13 12c0-1.05.84-1.89 1.87-1.89M7.37 20c.63.38 2.01-.2 3.6-1.7-.52-.59-1.03-1.23-1.51-1.9a22.7 22.7 0 01-2.4-.36c-.51 2.14-.32 3.61.31 3.96m.71-5.74l-.29-.51c-.11.29-.22.58-.29.86.27.06.57.11.88.16l-.3-.51m6.54-.76l.81-1.5-.81-1.5c-.3-.53-.62-1-.91-1.47C13.17 9 12.6 9 12 9c-.6 0-1.17 0-1.71.03-.29.47-.61.94-.91 1.47L8.57 12l.81 1.5c.3.53.62 1 .91 1.47.54.03 1.11.03 1.71.03.6 0 1.17 0 1.71-.03.29-.47.61-.94.91-1.47M12 6.78c-.19.22-.39.45-.59.72h1.18c-.2-.27-.4-.5-.59-.72m0 10.44c.19-.22.39-.45.59-.72h-1.18c.2.27.4.5.59.72M16.62 4c-.63-.38-2.01.2-3.6 1.7.52.59 1.03 1.23 1.51 1.9.82.08 1.63.2 2.4.36.51-2.14.32-3.61-.31-3.96m-.71 5.74l.29.51c.11-.29.22-.58.29-.86-.27-.06-.57-.11-.88-.16l.3.51m1.45-7.05c1.47.84 1.63 3.05 1.01 5.63 2.54.75 4.37 1.99 4.37 3.68 0 1.69-1.83 2.93-4.37 3.68.62 2.58.46 4.79-1.01 5.63-1.46.84-3.45-.12-5.37-1.95-1.92 1.83-3.91 2.79-5.38 1.95-1.46-.84-1.62-3.05-1-5.63-2.54-.75-4.37-1.99-4.37-3.68 0-1.69 1.83-2.93 4.37-3.68-.62-2.58-.46-4.79 1-5.63 1.47-.84 3.46.12 5.38 1.95 1.92-1.83 3.91-2.79 5.37-1.95M17.08 12c.34.75.64 1.5.89 2.26 2.1-.63 3.28-1.53 3.28-2.26 0-.73-1.18-1.63-3.28-2.26-.25.76-.55 1.51-.89 2.26M6.92 12c-.34-.75-.64-1.5-.89-2.26-2.1.63-3.28 1.53-3.28 2.26 0 .73 1.18 1.63 3.28 2.26.25-.76.55-1.51.89-2.26" />
            </svg>
        ),
    },
    {
        name: "TypeScript",
        color: "#3178C6",
        description: "Type safety",
        icon: (
            <svg viewBox="0 0 24 24" className="w-10 h-10" fill="currentColor">
                <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 011.306.34v2.458a3.95 3.95 0 00-.643-.361 5.093 5.093 0 00-.717-.26 5.453 5.453 0 00-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 00-.623.242c-.17.104-.3.229-.393.374a.888.888 0 00-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 01-1.012 1.085 4.38 4.38 0 01-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 01-1.84-.164 5.544 5.544 0 01-1.512-.493v-2.63a5.033 5.033 0 003.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 00-.074-1.089 2.12 2.12 0 00-.537-.5 5.597 5.597 0 00-.807-.444 27.72 27.72 0 00-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 011.47-.629 7.536 7.536 0 011.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" />
            </svg>
        ),
    },
    {
        name: "Prisma",
        color: "#5A67D8",
        description: "ORM & database",
        icon: (
            <svg viewBox="0 0 24 24" className="w-10 h-10" fill="currentColor">
                <path d="M21.807 18.285L13.553.756a1.324 1.324 0 00-1.129-.754 1.31 1.31 0 00-1.206.626l-8.952 14.5a1.356 1.356 0 00.016 1.455l4.376 6.778a1.408 1.408 0 001.58.581l12.703-3.757c.389-.115.707-.39.873-.755s.164-.783-.007-1.145zm-1.848.752L9.18 22.224a.452.452 0 01-.575-.52l3.85-18.438c.072-.345.549-.4.699-.08l7.129 15.138a.453.453 0 01-.325.713z" />
            </svg>
        ),
    },
    {
        name: "GitHub API",
        color: "#FFFFFF",
        description: "Version control",
        icon: (
            <svg viewBox="0 0 24 24" className="w-10 h-10" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
        ),
    },
    {
        name: "TiDB",
        color: "#FF6B6B",
        description: "Cloud database",
        icon: (
            <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
            </svg>
        ),
    },
]

export function TechStackSection() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

    return (
        <section id="tech-stack" className="py-32 relative" ref={ref}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-700/60 to-transparent" />

            <div className="max-w-5xl mx-auto px-6 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-xs uppercase tracking-widest text-zinc-500 font-medium">Tech Stack</span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 tracking-tight">
                        Built with modern stack
                    </h2>
                    <p className="text-zinc-400 mt-4 max-w-md mx-auto">
                        Production-grade technologies chosen for reliability, performance, and developer experience.
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {techs.map((tech, i) => (
                        <motion.div
                            key={tech.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.4, delay: i * 0.08 }}
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300 cursor-default group"
                        >
                            <div
                                className="transition-all duration-300"
                                style={{
                                    color: hoveredIndex === i ? tech.color : "#52525b",
                                    filter: hoveredIndex === i ? `drop-shadow(0 0 16px ${tech.color}30)` : "none",
                                    transform: hoveredIndex === i ? "scale(1.15) translateY(-2px)" : "scale(1)",
                                }}
                            >
                                {tech.icon}
                            </div>
                            <div className="text-center">
                                <span
                                    className="text-sm font-semibold block transition-colors duration-300"
                                    style={{ color: hoveredIndex === i ? "#fff" : "#a1a1aa" }}
                                >
                                    {tech.name}
                                </span>
                                <span className="text-[10px] text-zinc-600 mt-0.5 block">{tech.description}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
