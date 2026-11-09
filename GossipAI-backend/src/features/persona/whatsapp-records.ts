import { createHash } from "node:crypto";
import { AppError } from "../../shared/errors/app-error";

export interface WhatsAppMessage {
  id: string;
  timestampLabel: string;
  sender: string;
  content: string;
}
export interface WhatsAppRecords {
  messages: WhatsAppMessage[];
  participants: string[];
  systemMessageCount: number;
  contentHash: string;
}

// Keep the exported order and original timestamp labels. Numeric dates may be
// day-first or month-first; never silently reinterpret their chronology.
const timestamp = String.raw`\d{1,4}[./-]\d{1,2}[./-]\d{1,4},?\s+\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?`;
const header = new RegExp(String.raw`^(?:\[(${timestamp})\]\s*|(${timestamp})\s+-\s+)(.*)$`);
export function parseWhatsAppRecords(raw: string): WhatsAppRecords {
  const text = raw.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, "").replace(/\u202f/g, " ");
  if (!text.trim() || text.includes("\u0000") || text.includes("\uFFFD")) {
    throw new AppError("The export must be non-empty UTF-8 WhatsApp text.", 422, undefined, "INVALID_WHATSAPP_IMPORT", true);
  }
  const messages: WhatsAppMessage[] = [];
  let current: WhatsAppMessage | undefined;
  let systemMessageCount = 0;
  for (const line of text.split("\n")) {
    const match = header.exec(line);
    if (match) {
      const body = match[3]!;
      const separator = body.indexOf(": ");
      if (separator < 1) { systemMessageCount++; current = undefined; continue; }
      const sender = body.slice(0, separator).trim();
      if (!sender || sender.length > 200) throw new AppError("The sender could not be identified reliably.", 422, undefined, "WHATSAPP_PARTICIPANTS_INVALID", true);
      current = { id: `m${messages.length + 1}`, timestampLabel: (match[1] ?? match[2])!, sender, content: body.slice(separator + 2) };
      messages.push(current);
    } else if (current) {
      current.content += `\n${line}`;
    } else if (line.trim()) {
      throw new AppError("The WhatsApp date/message format could not be read reliably.", 422, undefined, "WHATSAPP_FORMAT_UNSUPPORTED", true);
    }
  }
  if (!messages.length) throw new AppError("No WhatsApp messages found.", 422, undefined, "EMPTY_WHATSAPP_IMPORT", true);
  const participants = [...new Set(messages.map((message) => message.sender))];
  if (participants.length !== 2) throw new AppError("Upload a one-to-one conversation with two identifiable senders.", 422, undefined, "WHATSAPP_PARTICIPANTS_INVALID", true);
  return { messages, participants, systemMessageCount, contentHash: createHash("sha256").update(text.trim()).digest("hex") };
}

export function chunkWhatsAppMessages(messages: WhatsAppMessage[], maxCharacters = 18_000) {
  const chunks: WhatsAppMessage[][] = [];
  let chunk: WhatsAppMessage[] = [];
  let size = 0;
  for (const message of messages) {
    const length = JSON.stringify(message).length;
    if (length > maxCharacters) throw new AppError("One message exceeds the supported analysis size.", 422, undefined, "WHATSAPP_MESSAGE_TOO_LARGE", true);
    if (size + length > maxCharacters && chunk.length) { chunks.push(chunk); chunk = []; size = 0; }
    chunk.push(message); size += length;
  }
  if (chunk.length) chunks.push(chunk);
  return chunks;
}
