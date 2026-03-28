import { z } from "zod";

const supportedLanguages = [
  "tr",
  "en",
  "de",
  "fr",
  "it",
  "es",
  "ru",
  "zh",
  "ja",
  "ko",
  "uk",
  "pt",
  "es-419"
] as const;

export const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8),
  gender: z.enum(['male', 'female', 'other']).optional()
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8)
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1)
});

export const updateLanguageSchema = z.object({
  language: z.enum(supportedLanguages)
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email()
});

export const resetPasswordSchema = z.object({
  token: z.string().length(6).regex(/^\d{6}$/, 'Token must be a 6-digit code'),
  password: z.string().min(8)
});

export const adminVerifyPasscodeSchema = z.object({
  passcode: z.string().length(6).regex(/^\d{6}$/, 'Passcode must be a 6-digit code')
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type UpdateLanguageInput = z.infer<typeof updateLanguageSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type AdminVerifyPasscodeInput = z.infer<typeof adminVerifyPasscodeSchema>;
