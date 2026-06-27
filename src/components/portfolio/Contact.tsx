"use client";

import { Mail, Phone, MapPin, Send, Github, Linkedin, Twitter, Globe, Download, Printer } from "lucide-react";
import { SectionTitle } from "./About";
import { Tilt3D } from "./Tilt3D";
import { PROFILE, type SocialLink } from "@/lib/portfolio-data";
import { withBasePath } from "@/lib/utils";
import { useSound } from "@/hooks/use-sound";

/** Map a social-link platform key to its Lucide icon. */
const LINK_ICON: Record<SocialLink["platform"], React.ReactNode> = {
  github: <Github size={16} />,
  linkedin: <Linkedin size={16} />,
  twitter: <Twitter size={16} />,
  website: <Globe size={16} />,
  email: <Mail size={16} />,
  phone: <Phone size={16} />,
};

export function Contact() {
  const { play } = useSound();
  return (
    <section id="contact" className="mx-auto max-w-6xl px-4 py-20 md:px-6">
      <SectionTitle index="06" title="CONTACT" accent="magenta" />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: contact card */}
        <Tilt3D max={7} className="h-full">
          <div className="neon-border-magenta relative h-full overflow-hidden bg-card/70 p-6 backdrop-blur-sm">
            <div className="font-pixel text-[11px] neon-magenta">{"// ESTABLISH_CONNECTION"}</div>
            <h3 className="mt-3 font-pixel text-lg neon-amber">LET&apos;S BUILD SOMETHING</h3>
            <p className="mt-3 font-retro text-base text-foreground/80">
              Open to remote roles worldwide and project collaborations. Drop a line — I read every message.
            </p>

            <div className="mt-6 space-y-3">
              <ContactRow
                icon={<Mail size={16} />}
                label="EMAIL"
                value={PROFILE.email}
                href={`mailto:${PROFILE.email}`}
                color="var(--neon-amber)"
              />
              <ContactRow
                icon={<Phone size={16} />}
                label="PHONE"
                value={PROFILE.phone}
                href={`tel:${PROFILE.phone.replace(/\s/g, "")}`}
                color="var(--neon-green)"
              />
              <ContactRow
                icon={<MapPin size={16} />}
                label="LOCATION"
                value={PROFILE.location}
                color="var(--neon-magenta)"
              />
            </div>

            {/* Social links — driven by bio.json PROFILE.links */}
            {PROFILE.links.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {PROFILE.links.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={`${s.label}${s.handle ? " · " + s.handle : ""}`}
                    onMouseEnter={() => play("hover")}
                    onClick={() => play("click")}
                    className="grid h-10 w-10 place-items-center border border-[color-mix(in_oklch,var(--neon-amber)_35%,transparent)] text-foreground/70 transition-all hover:border-[color-mix(in_oklch,var(--neon-amber)_70%,transparent)] hover:text-neon-amber"
                  >
                    {LINK_ICON[s.platform] ?? <Globe size={16} />}
                  </a>
                ))}
              </div>
            )}

            {/* Resume — download (always works) + print (save-as-PDF fallback) */}
            <div className="mt-5 border border-[color-mix(in_oklch,var(--neon-green)_35%,transparent)] bg-[color-mix(in_oklch,var(--neon-green)_6%,transparent)] p-3">
              <div className="mb-2 flex items-center gap-1.5 font-pixel text-[11px] text-[var(--neon-green)]">
                <Printer size={10} /> RESUME.SYS
              </div>
              <div className="flex gap-2">
                <a
                  href={withBasePath(PROFILE.resumeFile)}
                  download
                  onClick={() => {
                    play("click");
                    void import("@/lib/achievements").then((m) => m.unlock("archivist"));
                  }}
                  onMouseEnter={() => play("hover")}
                  className="group flex flex-1 items-center justify-center gap-2 border border-[color-mix(in_oklch,var(--neon-green)_60%,transparent)] bg-[color-mix(in_oklch,var(--neon-green)_14%,transparent)] py-2.5 font-pixel text-[11px] neon-green transition-all hover:bg-[color-mix(in_oklch,var(--neon-green)_24%,transparent)]"
                >
                  <Download size={13} className="transition-transform group-hover:translate-y-0.5" /> DOWNLOAD .PDF
                </a>
                <button
                  onClick={() => {
                    play("click");
                    void import("@/lib/achievements").then((m) => m.unlock("archivist"));
                    window.open(withBasePath(PROFILE.resumeFile), "_blank", "noopener,noreferrer");
                  }}
                  onMouseEnter={() => play("hover")}
                  aria-label="Open resume to print or save as PDF"
                  title="Print / save resume as PDF"
                  className="flex items-center justify-center gap-1.5 border border-[color-mix(in_oklch,var(--neon-amber)_40%,transparent)] px-3 py-2.5 font-retro text-[11px] text-[var(--neon-amber)] transition-all hover:bg-[color-mix(in_oklch,var(--neon-amber)_14%,transparent)]"
                >
                  <Printer size={13} /> PRINT
                </button>
              </div>
              <p className="mt-2 text-center font-retro text-[10px] text-muted-foreground">
                no printer? browser “Save as PDF” works too
              </p>
            </div>
          </div>
        </Tilt3D>

        {/* Right: retro mailto form */}
        <Tilt3D max={7} className="h-full">
          <form
            className="neon-border-amber h-full bg-card/70 p-6 backdrop-blur-sm"
            action={`mailto:${PROFILE.email}`}
            method="post"
            encType="text/plain"
          >
            <div className="font-pixel text-[11px] neon-amber">{"// COMPOSE_MESSAGE"}</div>

            <label className="mt-4 block font-retro text-xs text-muted-foreground">
              {"<"}FROM{">"}
            </label>
            <input
              type="email"
              name="from"
              required
              placeholder="you@domain.com"
              className="mt-1 w-full border border-[color-mix(in_oklch,var(--neon-amber)_30%,transparent)] bg-background/60 px-3 py-2 font-retro text-base text-foreground outline-none focus:border-[color-mix(in_oklch,var(--neon-amber)_70%,transparent)]"
            />

            <label className="mt-4 block font-retro text-xs text-muted-foreground">
              {"<"}SUBJECT{">"}
            </label>
            <input
              type="text"
              name="subject"
              required
              placeholder="Project / role / collaboration"
              className="mt-1 w-full border border-[color-mix(in_oklch,var(--neon-amber)_30%,transparent)] bg-background/60 px-3 py-2 font-retro text-base text-foreground outline-none focus:border-[color-mix(in_oklch,var(--neon-amber)_70%,transparent)]"
            />

            <label className="mt-4 block font-retro text-xs text-muted-foreground">
              {"<"}BODY{">"}
            </label>
            <textarea
              name="body"
              required
              rows={5}
              placeholder="Tell me about the opportunity…"
              className="mt-1 w-full resize-none border border-[color-mix(in_oklch,var(--neon-amber)_30%,transparent)] bg-background/60 px-3 py-2 font-retro text-base text-foreground outline-none focus:border-[color-mix(in_oklch,var(--neon-amber)_70%,transparent)]"
            />

            <button
              type="submit"
              className="mt-5 flex w-full items-center justify-center gap-2 border border-[color-mix(in_oklch,var(--neon-amber)_60%,transparent)] bg-[color-mix(in_oklch,var(--neon-amber)_12%,transparent)] py-3 font-pixel text-[10px] neon-amber transition-all hover:bg-[color-mix(in_oklch,var(--neon-amber)_22%,transparent)]"
            >
              <Send size={14} /> TRANSMIT
            </button>
            <p className="mt-2 text-center font-retro text-[11px] text-muted-foreground">
              opens your email client
            </p>
          </form>
        </Tilt3D>
      </div>
    </section>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  color: string;
}) {
  const inner = (
    <div
      className="flex items-center gap-3 border border-[color-mix(in_oklch,var(--neon-amber)_25%,transparent)] bg-background/40 px-3 py-2.5 transition-all hover:border-[color-mix(in_oklch,var(--neon-amber)_55%,transparent)]"
      style={{ borderColor: `color-mix(in oklch, ${color} 35%, transparent)` }}
    >
      <span
        className="grid h-9 w-9 shrink-0 place-items-center border"
        style={{
          borderColor: `color-mix(in oklch, ${color} 55%, transparent)`,
          color,
          textShadow: `0 0 6px color-mix(in oklch, ${color} 70%, transparent)`,
        }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <div className="font-retro text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="truncate font-retro text-base text-foreground">{value}</div>
      </div>
    </div>
  );
  return href ? (
    <a href={href} className="block">
      {inner}
    </a>
  ) : (
    inner
  );
}
