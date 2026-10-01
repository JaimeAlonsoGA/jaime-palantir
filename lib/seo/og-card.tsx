import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { gradients } from "@/components/ui/palette";
import { city } from "@/lib/content/format";
import { publicRoot, readPortfolio } from "@/lib/content/store";
import { ogFonts } from "./og-fonts";

export const ogSize = { width: 1200, height: 630 };

// Same muted IDE colours as the hero line
const syntax = ["#569CD6", "#DCDCAA", "#6A9955", "#CE9178", "#D4D4D4"];

async function nebula() {
  const jpeg = await sharp(path.join(publicRoot(), "bg.webp"))
    .resize(ogSize.width, ogSize.height, { fit: "cover" })
    .modulate({ saturation: 0.8 })
    .jpeg({ quality: 70 })
    .toBuffer();
  return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
}

// Lucide icons (same as the site), inlined as SVG: the image renderer can't run React icon components
const lucide = {
  lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  bot: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  smartphone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
};

function icon(paths: string, color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

const equation: ({ op: string } | { icon: string; label: string; result?: boolean })[] = [
  { icon: icon(lucide.lightbulb, "#ffffff"), label: "Idea" },
  { op: "+" },
  { icon: icon(lucide.bot, "#ffffff"), label: "AI" },
  { op: "+" },
  { icon: icon(lucide.user, "#ffffff"), label: "Human" },
  { op: "=" },
  { icon: icon(lucide.smartphone, "#18181b"), label: "App", result: true },
];

/**
 * The link preview: who, what and how to reach, in the site's own look.
 * Built from content/ only; no project names, those change.
 */
export async function renderOgCard() {
  const [{ person, site }, background, fonts] = await Promise.all([readPortfolio(), nebula(), ogFonts()]);
  const host = new URL(site.siteUrl).host;
  // "Jaime Alonso" on the first line, the surnames on the second
  const surnames = person.fullName.startsWith(person.name) ? person.fullName.slice(person.name.length).trim() : "";
  const skills = person.skills[0]?.items.slice(0, 4) ?? [];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: "Geist", color: "white" }}>
        <img src={background} alt="" width={ogSize.width} height={ogSize.height} style={{ position: "absolute", top: 0, left: 0 }} />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: ogSize.width,
            height: ogSize.height,
            display: "flex",
            background: "linear-gradient(90deg, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.62) 55%, rgba(0,0,0,0.3) 100%)",
          }}
        />

        <div style={{ position: "relative", display: "flex", flexDirection: "column", width: 700, padding: "64px 0 56px 72px" }}>
          <div style={{ display: "flex", fontSize: 18, letterSpacing: 4, textTransform: "uppercase", color: "rgba(255,255,255,0.75)" }}>
            {`${person.role} · ${city(person.location)} · ${person.workArrangement}`}
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 18, fontSize: 80, fontWeight: 700, lineHeight: 1.02, letterSpacing: -2 }}>
            <span>{person.name}</span>
            {surnames ? <span style={{ color: "rgba(255,255,255,0.72)" }}>{surnames.replaceAll("-", "\u2011")}</span> : null}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              marginTop: 34,
              padding: "18px 22px",
              borderRadius: 12,
              background: "#1E1E1E",
              border: "1px solid rgba(255,255,255,0.12)",
              fontFamily: "Geist Mono",
              fontSize: 22,
              lineHeight: 1.45,
            }}
          >
            {site.heroTagline.split(" ").map((word, index) => (
              <span key={index} style={{ color: syntax[index % syntax.length], marginRight: 13 }}>
                {word}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: "auto" }}>
            {skills.map((skill) => (
              <div
                key={skill}
                style={{ display: "flex", whiteSpace: "nowrap", padding: "8px 16px", borderRadius: 8, background: "#f4f4f5", color: "#18181b", fontSize: 19, fontWeight: 700 }}
              >
                {skill}
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: "relative", display: "flex", flex: 1, padding: "56px 56px 56px 44px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "100%",
              padding: 34,
              borderRadius: 32,
              backgroundImage: gradients.contact,
              boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
            }}
          >
            {/* idea + ai + human = app, as icon tiles like the contact card, centred in the space above the title */}
            <div style={{ display: "flex", flex: 1, alignItems: "center", paddingBottom: 24 }}>
            <div style={{ display: "flex", flex: 1, alignItems: "flex-start", justifyContent: "space-between" }}>
              {equation.map((item, index) =>
                "op" in item ? (
                  <div key={index} style={{ display: "flex", height: 60, alignItems: "center", fontSize: 26, color: "rgba(255,255,255,0.85)" }}>
                    {item.op}
                  </div>
                ) : (
                  <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div
                      style={{
                        display: "flex",
                        width: 60,
                        height: 60,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 18,
                        background: item.result ? "#ffffff" : "rgba(0,0,0,0.22)",
                        border: item.result ? "none" : "1.5px solid rgba(255,255,255,0.35)",
                      }}
                    >
                      <img src={item.icon} alt="" width={28} height={28} />
                    </div>
                    <div style={{ display: "flex", marginTop: 8, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.92)" }}>
                      {item.label}
                    </div>
                  </div>
                ),
              )}
            </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 44, fontWeight: 700, lineHeight: 1.08 }}>{site.contactTitle}</div>
              <div style={{ display: "flex", marginTop: 14, fontFamily: "Geist Mono", fontSize: 21, color: "rgba(255,255,255,0.92)" }}>
                {host}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...ogSize, fonts },
  );
}
