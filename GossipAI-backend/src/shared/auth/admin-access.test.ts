import assert from "node:assert/strict";
import test from "node:test";
import { ensureTestEnv } from "../../test/test-env";

ensureTestEnv();

test("admin passcode kullanıcısı admin erişimine sahiptir", async () => {
  const { createAdminPasscodeUser, isAdminPasscodeUser, assertAdminAccess } = await import("./admin-access");

  const user = createAdminPasscodeUser();

  assert.equal(isAdminPasscodeUser(user), true);
  assert.doesNotThrow(() => assertAdminAccess(user));
});

test("geliştirici e-posta adresi admin erişimi alır", async () => {
  const { assertAdminAccess } = await import("./admin-access");

  assert.doesNotThrow(() =>
    assertAdminAccess({
      id: "user-1",
      email: "dev@gossipai.test",
      tokenVersion: 1,
    })
  );
});

test("geliştirici olmayan kullanıcı admin erişimi alamaz", async () => {
  const { assertAdminAccess } = await import("./admin-access");

  assert.throws(() =>
    assertAdminAccess({
      id: "user-2",
      email: "user@gossipai.test",
      tokenVersion: 1,
    })
  );
});
