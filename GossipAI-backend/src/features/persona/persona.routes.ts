import { Router } from "express";
import { authenticate } from "../../shared/middlewares/authenticate";
import { validateBody } from "../../shared/middlewares/validate-body";
import { answerPersonaCharacterAnalysis, createPersona, createPersonaAvatarUploadUrl, deletePersona, getPersona, getPersonaCharacterAnalysis, listPersonas, refreshPersonaInsights, startPersonaCharacterAnalysis, updatePersona } from "./persona.controller";
import { characterAnalysisAnswerSchema, createPersonaAvatarUploadUrlSchema, createPersonaSchema, refreshPersonaInsightsSchema, updatePersonaSchema } from "./persona.schema";

const personaRouter = Router();
personaRouter.use(authenticate);
personaRouter.get("/", listPersonas);
personaRouter.post("/", validateBody(createPersonaSchema), createPersona);
personaRouter.post("/avatar-upload-url", validateBody(createPersonaAvatarUploadUrlSchema), createPersonaAvatarUploadUrl);
personaRouter.post("/:id/character-analysis", startPersonaCharacterAnalysis);
personaRouter.get("/:id/character-analysis", getPersonaCharacterAnalysis);
personaRouter.put("/:id/character-analysis/answers/:questionId", validateBody(characterAnalysisAnswerSchema), answerPersonaCharacterAnalysis);
personaRouter.get("/:id", getPersona);
personaRouter.patch("/:id", validateBody(updatePersonaSchema), updatePersona);
personaRouter.delete("/:id", deletePersona);
personaRouter.post("/:id/insights/refresh", validateBody(refreshPersonaInsightsSchema), refreshPersonaInsights);
export default personaRouter;
