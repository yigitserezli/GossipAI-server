import { Router } from "express";
import { authenticate } from "../../shared/middlewares/authenticate";
import { validateBody } from "../../shared/middlewares/validate-body";
import { login, logout, me, refresh, register, forgotPassword, resetPassword, updateLanguage, verifyAdminPasscode } from "./auth.controller";
import { adminVerifyPasscodeSchema, loginSchema, refreshSchema, logoutSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, updateLanguageSchema } from "./auth.schema";

const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), register);
authRouter.post("/login", validateBody(loginSchema), login);
authRouter.post("/refresh", validateBody(refreshSchema), refresh);
authRouter.post("/logout", validateBody(logoutSchema), logout);
authRouter.get("/me", authenticate, me);
authRouter.patch("/language", authenticate, validateBody(updateLanguageSchema), updateLanguage);
authRouter.post("/admin/verify-passcode", validateBody(adminVerifyPasscodeSchema), verifyAdminPasscode);
authRouter.post("/forgot-password", validateBody(forgotPasswordSchema), forgotPassword);
authRouter.post("/reset-password", validateBody(resetPasswordSchema), resetPassword);

export default authRouter;
[]
