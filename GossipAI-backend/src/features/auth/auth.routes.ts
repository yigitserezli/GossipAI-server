import { Router } from "express";
import { authenticate } from "../../shared/middlewares/authenticate";
import { validateBody } from "../../shared/middlewares/validate-body";
import { getAiConsent, login, logout, me, refresh, register, forgotPassword, resetPassword, updateAiConsent, updateLanguage, verifyAdminPasscode } from "./auth.controller";
import { adminVerifyPasscodeSchema, aiConsentSchema, loginSchema, refreshSchema, logoutSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, updateLanguageSchema } from "./auth.schema";

const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), register);
authRouter.post("/login", validateBody(loginSchema), login);
authRouter.post("/refresh", validateBody(refreshSchema), refresh);
authRouter.post("/logout", validateBody(logoutSchema), logout);
authRouter.get("/me", authenticate, me);
authRouter.patch("/language", authenticate, validateBody(updateLanguageSchema), updateLanguage);
authRouter.get("/ai-consent", authenticate, getAiConsent);
authRouter.put("/ai-consent", authenticate, validateBody(aiConsentSchema), updateAiConsent);
authRouter.post("/admin/verify-passcode", validateBody(adminVerifyPasscodeSchema), verifyAdminPasscode);
authRouter.post("/forgot-password", validateBody(forgotPasswordSchema), forgotPassword);
authRouter.post("/reset-password", validateBody(resetPasswordSchema), resetPassword);

export default authRouter;
[]
