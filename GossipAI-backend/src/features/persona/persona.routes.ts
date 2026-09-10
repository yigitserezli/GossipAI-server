import { Router } from "express";
import { authenticate } from "../../shared/middlewares/authenticate";
import { validateBody } from "../../shared/middlewares/validate-body";
import { createPersona, createPersonaAvatarUploadUrl, deletePersona, getPersona, listPersonas, refreshPersonaInsights, updatePersona } from "./persona.controller";
import { createPersonaAvatarUploadUrlSchema, createPersonaSchema, refreshPersonaInsightsSchema, updatePersonaSchema } from "./persona.schema";

const personaRouter = Router();
personaRouter.use(authenticate);
personaRouter.get("/", listPersonas);
personaRouter.post("/", validateBody(createPersonaSchema), createPersona);
personaRouter.post("/avatar-upload-url", validateBody(createPersonaAvatarUploadUrlSchema), createPersonaAvatarUploadUrl);
personaRouter.get("/:id", getPersona);
personaRouter.patch("/:id", validateBody(updatePersonaSchema), updatePersona);
personaRouter.delete("/:id", deletePersona);
personaRouter.post("/:id/insights/refresh", validateBody(refreshPersonaInsightsSchema), refreshPersonaInsights);
export default personaRouter;
