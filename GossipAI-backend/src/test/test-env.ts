export const ensureTestEnv = () => {
  process.env.PORT ??= "4321";
  process.env.DATABASE_URL ??= "https://example.com/db";
  process.env.OPENAI_API_KEY ??= "test-openai-key";
  process.env.OPENAI_MODEL ??= "gpt-4o-mini";
  process.env.OPENAI_AGENT_MODEL ??= "gpt-4o-mini";
  process.env.ADMIN_PASSCODE ??= "123456";
  process.env.DEVELOPER_EMAILS ??= "dev@gossipai.test";
  process.env.JWT_ACCESS_SECRET ??= "12345678901234567890123456789012";
  process.env.JWT_REFRESH_SECRET ??= "abcdefghijklmnopqrstuvwxyz123456";
  process.env.JWT_ACCESS_EXPIRES_IN ??= "15m";
  process.env.JWT_REFRESH_EXPIRES_IN ??= "7d";
  process.env.BCRYPT_SALT_ROUNDS ??= "10";
  process.env.RESEND_API_KEY ??= "test-resend-key";
  process.env.RESEND_FROM_EMAIL ??= "noreply@gossipai.test";
};
