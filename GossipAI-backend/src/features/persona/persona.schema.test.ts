import assert from "node:assert/strict";
import test from "node:test";
import { createPersonaSchema, refreshPersonaInsightsSchema } from "./persona.schema";

test("persona creation accepts the supported relationship and context fields", () => {
  const result = createPersonaSchema.safeParse({
    name: "Ece",
    relationshipType: "crush",
    whoIsThis: "Art director",
    goals: "Get to know each other",
  });
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.themeKey, "violet");
});

test("persona creation rejects unsupported relationships and oversized avatar bodies", () => {
  assert.equal(createPersonaSchema.safeParse({ name: "Ece", relationshipType: "family" }).success, false);
  assert.equal(
    createPersonaSchema.safeParse({ name: "Ece", relationshipType: "crush", avatarImageBase64: "a".repeat(8_000_001) }).success,
    false
  );
});

test("persona insight refresh only accepts a UUID conversation id", () => {
  assert.equal(refreshPersonaInsightsSchema.safeParse({ conversationId: "not-an-id" }).success, false);
  assert.equal(refreshPersonaInsightsSchema.safeParse({}).success, true);
});
