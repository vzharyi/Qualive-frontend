import { Header } from "../features/landing/components/header"
import { HeroSection } from "../features/landing/components/hero-section"
import { ProblemSection } from "../features/landing/components/problem-section"
import { HowItWorksSection } from "../features/landing/components/how-it-works-section"
import { LiveDemoSection } from "../features/landing/components/live-demo-section"
import { MathSection } from "../features/landing/components/math-section"
import { TechStackSection } from "../features/landing/components/tech-stack-section"
import { FooterSection } from "../features/landing/components/footer-section"

export default function LandingPage() {
    return (
        <div className="relative min-h-screen bg-[#070710] text-white overflow-x-hidden">
            {/* ─── Global background: two soft ambient orbs ─── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                {/* Top emerald — fades naturally down through all sections */}
                <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1100px] h-[900px] bg-emerald-500/[0.09] rounded-full blur-[200px]" />
                {/* Bottom violet — gives depth to lower sections */}
                <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-violet-600/[0.08] rounded-full blur-[200px]" />
            </div>

            <Header />
            <HeroSection />
            <ProblemSection />
            <HowItWorksSection />
            <LiveDemoSection />
            <MathSection />
            <TechStackSection />
            <FooterSection />
        </div>
    )
}
