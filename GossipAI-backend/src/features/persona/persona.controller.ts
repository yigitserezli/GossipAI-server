import type { RequestHandler } from "express";
import { AppError } from "../../shared/errors/app-error";
import { personaInsightService } from "./persona-insight.service";
import { personaCharacterAnalysisService } from "./persona-character-analysis.service";
import { personaService } from "./persona.service";
import { r2AvatarService } from "./r2-avatar.service";
import { personaWhatsAppImportService } from "./persona-whatsapp-import.service";

const userId = (value: string | undefined) => {
  if (!value) throw new AppError("Unauthorized", 401);
  return value;
};
const personaId = (value: string | string[] | undefined) => {
  const id = Array.isArray(value) ? value[0] : value;
  if (!id) throw new AppError("Persona id is required.", 400);
  return id;
};

export const listPersonas: RequestHandler = async (req, res) => res.json({ data: await personaService.list(userId(req.user?.id)) });
export const getPersona: RequestHandler = async (req, res) => res.json({ data: await personaService.get(userId(req.user?.id), personaId(req.params.id)) });
export const createPersona: RequestHandler = async (req, res) => res.status(201).json({ data: await personaService.create(userId(req.user?.id), req.body) });
export const updatePersona: RequestHandler = async (req, res) => res.json({ data: await personaService.update(userId(req.user?.id), personaId(req.params.id), req.body) });
export const deletePersona: RequestHandler = async (req, res) => { await personaService.remove(userId(req.user?.id), personaId(req.params.id)); res.status(204).send(); };
export const refreshPersonaInsights: RequestHandler = async (req, res) => res.json({ data: await personaInsightService.refresh(userId(req.user?.id), personaId(req.params.id), req.body.conversationId, req.body.language) });
export const createPersonaAvatarUploadUrl: RequestHandler = async (req, res) => res.status(201).json({ data: await r2AvatarService.createUploadUrl(userId(req.user?.id), req.body.contentType) });
export const startPersonaCharacterAnalysis: RequestHandler = async (req, res) => res.status(201).json({ data: await personaCharacterAnalysisService.start(userId(req.user?.id), personaId(req.params.id)) });
export const getPersonaCharacterAnalysis: RequestHandler = async (req, res) => res.json({ data: await personaCharacterAnalysisService.get(userId(req.user?.id), personaId(req.params.id)) });
export const answerPersonaCharacterAnalysis: RequestHandler = async (req, res) => res.json({ data: await personaCharacterAnalysisService.answer(userId(req.user?.id), personaId(req.params.id), personaId(req.params.questionId), req.body.score) });
export const createWhatsAppImportUploadUrl: RequestHandler = async (req, res) => res.status(201).json({ data: await personaWhatsAppImportService.createUploadUrl(userId(req.user?.id), personaId(req.params.id), req.body) });
export const createWhatsAppImport: RequestHandler = async (req, res) => res.status(201).json({ data: await personaWhatsAppImportService.create(userId(req.user?.id), personaId(req.params.id), req.body) });
export const listWhatsAppImports: RequestHandler = async (req, res) => res.json({ data: await personaWhatsAppImportService.list(userId(req.user?.id), personaId(req.params.id)) });
export const refreshRelationshipAnalysis: RequestHandler = async (req, res) => res.json({ data: await personaInsightService.refresh(userId(req.user?.id), personaId(req.params.id), undefined, req.body?.language) });
