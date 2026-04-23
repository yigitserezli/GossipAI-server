import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { LandingPageEntry } from "@/components/app/landing-page-entry";
import type { SloganEntry } from "@/components/app/landing/types";

async function getSlogans() {
  const filePath = join(process.cwd(), "public/tx/slogan.txt");
  const raw = await readFile(filePath, "utf8");
  const blocks = raw
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const result: Record<string, SloganEntry> = {};

  for (const block of blocks) {
    const lines = block.split("\n").map((line) => line.trim());
    const code = lines[0]?.toLowerCase();
    if (!code) continue;

    const logo = lines.find((line) => line.startsWith("Logo:"))?.replace("Logo:", "").trim() ?? "";
    const subtitle = lines.find((line) => line.startsWith("Subtitle:"))?.replace("Subtitle:", "").trim() ?? "";
    if (!logo && !subtitle) continue;

    result[code] = { logo, subtitle };
  }

  return result;
}

export default async function Home() {
  const slogans = await getSlogans();
  return <LandingPageEntry slogans={slogans} />;
}
