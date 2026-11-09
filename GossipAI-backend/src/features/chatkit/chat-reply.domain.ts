import { createHash } from "node:crypto";

export const replyMessageIds = (userId: string, requestId: string) => {
  const key = createHash("sha256").update(`${userId}:${requestId}`).digest("hex");
  return { user: `turn_${key}`, assistant: `reply_${key}` };
};

export const replyStatus = (status: string | null, createdAt: Date, now = Date.now()) =>
  status === "processing" && now - createdAt.getTime() > 15 * 60_000 ? "interrupted" : status;

export const CHAT_REPLY_COPY = {
  tr: ["Yeni yanıt geldi", "Gossip AI yanıtladı. Sohbetine dönüp okuyabilirsin."],
  en: ["New reply", "Gossip AI replied. Open your chat to read it."],
  de: ["Neue Antwort", "Gossip AI hat geantwortet. Öffne deinen Chat, um sie zu lesen."],
  fr: ["Nouvelle réponse", "Gossip AI a répondu. Ouvre ta conversation pour la lire."],
  it: ["Nuova risposta", "Gossip AI ha risposto. Apri la chat per leggerla."],
  es: ["Nueva respuesta", "Gossip AI ha respondido. Abre el chat para leerla."],
  "es-419": ["Nueva respuesta", "Gossip AI respondió. Abre el chat para leerla."],
  pt: ["Nova resposta", "Gossip AI respondeu. Abra a conversa para ler."],
  ru: ["Новый ответ", "Gossip AI ответил. Откройте чат, чтобы прочитать ответ."],
  uk: ["Нова відповідь", "Gossip AI відповів. Відкрийте чат, щоб прочитати відповідь."],
  zh: ["收到新回复", "Gossip AI 已回复，打开聊天即可查看。"],
  ja: ["新しい返信", "Gossip AIから返信が届きました。チャットで確認できます。"],
  ko: ["새 답변 도착", "Gossip AI가 답변했어요. 채팅을 열어 확인하세요."],
} satisfies Record<string, [string, string]>;

export const replyNotificationCopy = (language: string) =>
  CHAT_REPLY_COPY[language as keyof typeof CHAT_REPLY_COPY] ?? CHAT_REPLY_COPY.en;
