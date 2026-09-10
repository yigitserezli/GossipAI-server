import { Router } from "express";
import { authenticate } from "../../shared/middlewares/authenticate";
import { validateBody } from "../../shared/middlewares/validate-body";
import { createPersona, deletePersona, getPersona, listPersonas, refreshPersonaInsights, updatePersona } from "./persona.controller";
import { createPersonaSchema, refreshPersonaInsightsSchema, updatePersonaSchema } from "./persona.schema";

const personaRouter = Router();
personaRouter.use(authenticate);
personaRouter.get("/", listPersonas);
personaRouter.post("/", validateBody(createPersonaSchema), createPersona);
personaRouter.get("/:id", getPersona);
personaRouter.patch("/:id", validateBody(updatePersonaSchema), updatePersona);
personaRouter.delete("/:id", deletePersona);
personaRouter.post("/:id/insights/refresh", validateBody(refreshPersonaInsightsSchema), refreshPersonaInsights);
export default personaRouter;
