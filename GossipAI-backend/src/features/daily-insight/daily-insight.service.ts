import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { AppError } from "../../shared/errors/app-error";

const SUPPORTED_LANGUAGES = [
  "en", "tr", "de", "fr", "it", "es", "es-419",
  "ru", "zh", "ja", "ko", "uk", "pt",
] as const;

const OPENAI_BASE_URL = "https://api.openai.com/v1";

const SYSTEM_PROMPT = `You are a creative writer for GossipAI, a social lifestyle app.
Generate a single short daily insight — sometimes a motivational quote, sometimes a famous person's wise words, sometimes a life-touching observation.
The tone should feel warm, human, and real — not generic corporate motivation.

Rules:
- Keep it between 1-3 sentences, max 280 characters.
- If you attribute a quote to someone, put their name in the "author" field.
- If it's an original insight (not attributed), leave "author" as null.
- Do NOT repeat common overused quotes.
- Make it feel like a friend sharing something meaningful.

Respond ONLY with valid JSON: { "content": "...", "author": "..." or null }`;

interface InsightResponse {
  content?: string;
  author?: string | null;
}

const generateForLanguage = async (language: string): Promise<{ content: string; author: string | null }> => {
  const languageLabel = language === "tr" ? "Turkish" : "English";

  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL,
      temperature: 0.9,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Generate today's daily insight in ${languageLabel}.` },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new AppError("OpenAI request failed for daily insight", 502, {
      status: response.status,
      body: errorText,
    });
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };

  const raw = data.choices?.[0]?.message?.content?.trim();
  if (!raw) {
    throw new AppError("OpenAI returned empty daily insight", 502);
  }

  const parsed: InsightResponse = JSON.parse(raw);
  if (!parsed.content || parsed.content.trim().length === 0) {
    throw new AppError("OpenAI returned insight with empty content", 502);
  }

  return {
    content: parsed.content.trim(),
    author: parsed.author?.trim() || null,
  };
};

const todayUTC = (): Date => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

export const dailyInsightService = {
  async getTodayInsight(language: string) {
    const date = todayUTC();
    const lang = SUPPORTED_LANGUAGES.includes(language as typeof SUPPORTED_LANGUAGES[number])
      ? language
      : "en";

    const insight = await prisma.dailyInsight.findUnique({
      where: { date_language: { date, language: lang } },
    });

    if (insight) {
      return insight;
    }

    // Fallback: generate on-the-fly if scheduler hasn't run yet
    return this.generateAndStore(lang, date);
  },

  async generateAndStore(language: string, date?: Date) {
    const targetDate = date ?? todayUTC();

    const existing = await prisma.dailyInsight.findUnique({
      where: { date_language: { date: targetDate, language } },
    });

    if (existing) {
      return existing;
    }

    const { content, author } = await generateForLanguage(language);

    return prisma.dailyInsight.create({
      data: {
        date: targetDate,
        language,
        content,
        author,
      },
    });
  },

  async generateAllLanguages(date?: Date) {
    const targetDate = date ?? todayUTC();
    const results: Array<{ language: string; success: boolean; error?: string }> = [];

    for (const lang of SUPPORTED_LANGUAGES) {
      try {
        await this.generateAndStore(lang, targetDate);
        results.push({ language: lang, success: true });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[daily-insight] Failed to generate for ${lang}:`, message);
        results.push({ language: lang, success: false, error: message });
      }
    }

    return results;
  },
};
