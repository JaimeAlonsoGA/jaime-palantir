import type { IconType } from "react-icons/lib";
import {
  LuBug,
  LuFlaskConical,
  LuInfinity,
  LuLayers,
  LuPalette,
  LuPlug,
} from "react-icons/lu";
import {
  SiAndroid,
  SiCapacitor,
  SiDocker,
  SiExpo,
  SiApple,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiReact,
  SiTypescript,
} from "react-icons/si";

// Brand marks and colors come from Simple Icons; concepts use Lucide.
// Near-black brand colors are lifted to white so they read on the dark hero.
const skills: Record<string, { icon: IconType; color: string }> = {
  "typescript": { icon: SiTypescript, color: "#3178C6" },
  "react": { icon: SiReact, color: "#61DAFB" },
  "next.js": { icon: SiNextdotjs, color: "#FFFFFF" },
  "node.js": { icon: SiNodedotjs, color: "#5FA04E" },
  "sql / postgresql": { icon: SiPostgresql, color: "#4169E1" },
  "docker": { icon: SiDocker, color: "#2496ED" },
  "api integration (rest)": { icon: LuPlug, color: "#22D3EE" },
  "software architecture": { icon: LuLayers, color: "#A78BFA" },
  "debugging": { icon: LuBug, color: "#F87171" },
  "testing": { icon: LuFlaskConical, color: "#4ADE80" },
  "ui/ux": { icon: LuPalette, color: "#F472B6" },
  "ci/cd": { icon: LuInfinity, color: "#FBBF24" },
  "react native / expo": { icon: SiExpo, color: "#FFFFFF" },
  "capacitor": { icon: SiCapacitor, color: "#119EFF" },
  "android": { icon: SiAndroid, color: "#34A853" },
  "ios": { icon: SiApple, color: "#FFFFFF" },
};

const fallback = "#E4E4E7";

export function skillStyle(label: string) {
  const known = skills[label.trim().toLowerCase()];
  return { Icon: known?.icon ?? null, color: known?.color ?? fallback };
}
