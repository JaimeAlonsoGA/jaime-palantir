import type { IconType } from "react-icons/lib";
import { FaAmazon } from "react-icons/fa";
import { IoLogoFirebase } from "react-icons/io5";
import { LuDatabase, LuPlug } from "react-icons/lu";
import { RiOpenaiFill, RiTailwindCssFill } from "react-icons/ri";
import {
  SiArduino,
  SiCapacitor,
  SiCplusplus,
  SiDocker,
  SiEspressif,
  SiExpo,
  SiGithubactions,
  SiGnubash,
  SiGo,
  SiGraphql,
  SiJavascript,
  SiJuce,
  SiModelcontextprotocol,
  SiNodedotjs,
  SiNextdotjs,
  SiSqlite,
  SiReact,
  SiReplicate,
  SiShopify,
  SiPlatformio,
  SiPostgresql,
  SiTanstack,
  SiStripe,
  SiTypescript,
  SiWagmi,
  SiWeb3Dotjs,
} from "react-icons/si";
import { TbBrandReactNative } from "react-icons/tb";

const icons: Record<string, IconType> = {
  react: SiReact,
  nextjs: SiNextdotjs,
  postgresql: SiPostgresql,
  tanstack: SiTanstack,
  "rest-api": LuPlug,
  nosql: LuDatabase,
  docker: SiDocker,
  capacitor: SiCapacitor,
  go: SiGo,
  shell: SiGnubash,
  sqlite: SiSqlite,
  mcp: SiModelcontextprotocol,
  juce: SiJuce,
  openai: RiOpenaiFill,
  replicate: SiReplicate,
  "github-actions": SiGithubactions,
  shopify: SiShopify,
  "amazon-sp-api": FaAmazon,
  db2: LuDatabase,
  esp32: SiEspressif,
  arduino: SiArduino,
  platformio: SiPlatformio,
  web3: SiWeb3Dotjs,
  tailwindcss: RiTailwindCssFill,
  typescript: SiTypescript,
  javascript: SiJavascript,
  stripe: SiStripe,
  graphql: SiGraphql,
  firebase: IoLogoFirebase,
  "react native": TbBrandReactNative,
  expo: SiExpo,
  wagmi: SiWagmi,
  "c++": SiCplusplus,
  node: SiNodedotjs,
};

export function iconFor(id: string): IconType | null {
  return icons[id] ?? null;
}

// Some brand colors are too dark to read on the dark background.
export function readableColor(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  if (luminance < 0.15) return "#FFFFFF";
  if (luminance >= 0.4) return hex;
  // Dim brand colors keep their hue but move halfway to white.
  const lift = (channel: number) => Math.round(channel + (255 - channel) * 0.5);
  return `rgb(${lift(r)}, ${lift(g)}, ${lift(b)})`;
}
