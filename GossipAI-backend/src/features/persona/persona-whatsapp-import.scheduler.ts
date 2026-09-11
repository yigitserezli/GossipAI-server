import cron, { type ScheduledTask } from "node-cron";
import { personaWhatsAppImportService } from "./persona-whatsapp-import.service";

let task: ScheduledTask | null = null;
let running = false;

const tick = async () => {
  if (running) return;
  running = true;
  try {
    // Claimed rows are durable; after a restart the next tick simply resumes them.
    for (let index = 0; index < 3; index += 1) {
      if (!(await personaWhatsAppImportService.processNext())) break;
    }
  } catch (error) {
    console.error("[persona-whatsapp-import] worker tick failed", error);
  } finally { running = false; }
};

export const startPersonaWhatsAppImportScheduler = () => {
  if (task) return;
  task = cron.schedule("* * * * *", () => { void tick(); }, { name: "persona-whatsapp-imports", noOverlap: true });
  void tick();
};

export const stopPersonaWhatsAppImportScheduler = () => { task?.stop(); task?.destroy(); task = null; };
