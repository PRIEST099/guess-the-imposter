import { Hero } from "@/components/landing/hero";
import { JoinForm } from "@/components/landing/join-form";
import { HowToPlay } from "@/components/landing/how-to-play";
import { GameModes } from "@/components/landing/game-modes";
import { StatsSection } from "@/components/landing/stats-section";
import { Showcase } from "@/components/landing/showcase";
import { AnimatedBackground } from "@/components/shared/animated-background";
import { ScrollProgress } from "@/components/shared/scroll-progress";
import { LandingHeader } from "@/components/landing/landing-header";
import { WheelSection, WheelContainer } from "@/components/shared/wheel-scroll";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--black-base,#0c0c14)] overflow-hidden relative">
      {/* Parallax background with reverse-scrolling particles */}
      <AnimatedBackground variant="hero" parallax />

      {/* Scroll progress bar */}
      <ScrollProgress />

      {/* Theme switcher + ambient cycling */}
      <LandingHeader />

      {/* Content — 3D carousel scroll */}
      <WheelContainer className="relative z-10">

        {/* Hero — excluded from carousel (own scroll-push) */}
        <WheelSection disabled>
          <Hero />
        </WheelSection>

        {/* Join form */}
        <WheelSection>
          <JoinForm />
        </WheelSection>

        {/* Stats */}
        <WheelSection>
          <StatsSection />
        </WheelSection>

        {/* How to play — 4 steps */}
        <WheelSection>
          <HowToPlay />
        </WheelSection>

        {/* Showcase — bento grid */}
        <WheelSection>
          <Showcase />
        </WheelSection>

        {/* Game modes — indexed list */}
        <WheelSection>
          <GameModes />
        </WheelSection>

        {/* Footer */}
        <WheelSection>
          <footer className="relative py-24 text-center">
            <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-white/20 mb-2">
              Guess the Imposter
            </p>
            <p className="font-[family-name:var(--font-outfit)] text-xs text-white/10 tracking-wide">
              A multiplayer party game of deduction
            </p>
          </footer>
        </WheelSection>

      </WheelContainer>
    </main>
  );
}
