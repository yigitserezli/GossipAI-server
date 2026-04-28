import assert from "node:assert/strict";
import test from "node:test";
import { ensureTestEnv } from "../../test/test-env";

ensureTestEnv();

test("daily insight dil etiketleri beklenen dillere eşlenir", async () => {
  const { LANGUAGE_LABELS } = await import("./daily-insight.service");

  assert.equal(LANGUAGE_LABELS.tr, "Turkish");
  assert.equal(LANGUAGE_LABELS.de, "German");
  assert.equal(LANGUAGE_LABELS["es-419"], "Latin American Spanish");
  assert.equal(LANGUAGE_LABELS.ja, "Japanese");
});
