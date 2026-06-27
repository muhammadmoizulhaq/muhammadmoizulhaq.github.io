"use client";

import { CRTOverlay } from "@/components/portfolio/CRTOverlay";
import { Header } from "@/components/portfolio/Header";
import { Hero } from "@/components/portfolio/Hero";
import { About } from "@/components/portfolio/About";
import { Experience } from "@/components/portfolio/Experience";
import { Projects } from "@/components/portfolio/Projects";
import { Skills } from "@/components/portfolio/Skills";
import { Interests } from "@/components/portfolio/Interests";
import { Contact } from "@/components/portfolio/Contact";
import { Footer } from "@/components/portfolio/Footer";
import { BootSequence } from "@/components/portfolio/BootSequence";
import { CommandTerminal } from "@/components/portfolio/CommandTerminal";
import { SectionDivider } from "@/components/portfolio/SectionDivider";
import { KonamiGlitch } from "@/components/portfolio/KonamiGlitch";
import { ProjectModal } from "@/components/portfolio/ProjectModal";
import { ShortcutsOverlay } from "@/components/portfolio/ShortcutsOverlay";
import { ActivityTicker } from "@/components/portfolio/ActivityTicker";
import { HeroQuote } from "@/components/portfolio/HeroQuote";
import { SnakeGame } from "@/components/portfolio/SnakeGame";
import { CRTSettingsPanel } from "@/components/portfolio/CRTSettingsPanel";
import { MatrixRain } from "@/components/portfolio/MatrixRain";
import { BossKey } from "@/components/portfolio/BossKey";
import { WelcomeBack } from "@/components/portfolio/WelcomeBack";
import { ClickGlitchFx } from "@/components/portfolio/ClickGlitchFx";
import {
  AchievementToast,
  AchievementsPanel,
} from "@/components/portfolio/AchievementToast";

export default function Home() {
  return (
    <div className="relative grid-bg flex min-h-screen flex-col">
      <BootSequence />
      <CRTOverlay />
      <KonamiGlitch />
      <ProjectModal />
      <ShortcutsOverlay />
      <AchievementsPanel />
      <CRTSettingsPanel />
      <MatrixRain />
      <BossKey />
      <WelcomeBack />
      <SnakeGame />
      <ClickGlitchFx />
      <AchievementToast />
      <Header />
      <main className="flex-1">
        <Hero />
        <About />
        <SectionDivider symbol="◆" accent="orange" />
        <Experience />
        <SectionDivider symbol="▼" accent="magenta" />
        <Projects />
        <SectionDivider symbol="◆" accent="green" />
        <Skills />
        <Interests />
        <SectionDivider symbol="▼" accent="amber" />
        <Contact />
      </main>
      <ActivityTicker />
      <Footer />
      <CommandTerminal />
    </div>
  );
}
