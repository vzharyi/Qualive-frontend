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
        <div className="relative min-h-screen bg-[#131313] text-white overflow-x-hidden">
            {/* ─── Global background: clean dark slate ─── */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true" />

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
