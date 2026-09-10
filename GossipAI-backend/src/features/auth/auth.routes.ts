import { Router } from "express";
import { authenticate } from "../../shared/middlewares/authenticate";
import { validateBody } from "../../shared/middlewares/validate-body";
import { appleSignIn, completeGoogleRegistration, deleteAccount, getAiConsent, googleCallback, googleExchange, googleStart, linkGoogleAccount, login, logout, me, refresh, register, forgotPassword, resetPassword, updateAiConsent, updateLanguage, verifyAdminPasscode } from "./auth.controller";
import { adminVerifyPasscodeSchema, aiConsentSchema, appleSignInSchema, completeGoogleRegistrationSchema, deleteAccountSchema, googleExchangeSchema, loginSchema, refreshSchema, logoutSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, updateLanguageSchema } from "./auth.schema";

const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), register);
authRouter.post("/login", validateBody(loginSchema), login);
authRouter.post("/apple", validateBody(appleSignInSchema), appleSignIn);
authRouter.get("/google", googleStart);
authRouter.get("/google/callback", googleCallback);
authRouter.post("/google/exchange", validateBody(googleExchangeSchema), googleExchange);
authRouter.post("/google/link", authenticate, validateBody(googleExchangeSchema), linkGoogleAccount);
authRouter.post("/google/complete-registration", validateBody(completeGoogleRegistrationSchema), completeGoogleRegistration);
authRouter.post("/refresh", validateBody(refreshSchema), refresh);
authRouter.post("/logout", validateBody(logoutSchema), logout);
authRouter.delete("/account", authenticate, validateBody(deleteAccountSchema), deleteAccount);
authRouter.get("/me", authenticate, me);
authRouter.patch("/language", authenticate, validateBody(updateLanguageSchema), updateLanguage);
authRouter.get("/ai-consent", authenticate, getAiConsent);
authRouter.put("/ai-consent", authenticate, validateBody(aiConsentSchema), updateAiConsent);
authRouter.post("/admin/verify-passcode", validateBody(adminVerifyPasscodeSchema), verifyAdminPasscode);
authRouter.post("/forgot-password", validateBody(forgotPasswordSchema), forgotPassword);
authRouter.post("/reset-password", validateBody(resetPasswordSchema), resetPassword);

export default authRouter;
[]
