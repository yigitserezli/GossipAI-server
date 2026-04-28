import assert from "node:assert/strict";
import test, { mock } from "node:test";
import { ensureTestEnv } from "../../test/test-env";

ensureTestEnv();

test("admin passcode doğrulanınca geçici admin kullanıcısı atanır", async () => {
  const { authService } = await import("../auth/auth.service");
  const { authenticateOrAdminPasscode } = await import("./notifications-auth");

  const verifyMock = mock.method(authService, "verifyAdminPasscode", async () => undefined);

  const req = {
    header(name: string) {
      return name === "x-admin-passcode" ? "123456" : undefined;
    },
    headers: {
      "x-forwarded-for": "10.0.0.1",
      "user-agent": "node-test",
    },
    ip: "127.0.0.1",
    socket: {
      remoteAddress: "127.0.0.1",
    },
    user: undefined,
  };

  let nextArg: unknown;

  await authenticateOrAdminPasscode(
    req as never,
    {} as never,
    ((error?: unknown) => {
      nextArg = error;
    }) as never
  );

  assert.equal(nextArg, undefined);
  assert.deepEqual(verifyMock.mock.calls[0]?.arguments, [
    null,
    { passcode: "123456" },
    { ipAddress: "10.0.0.1" },
  ]);
  assert.deepEqual(req.user, {
    id: "admin-passcode",
    email: "admin-passcode@gossipai.local",
    tokenVersion: 0,
  });
});

test("passcode yoksa bearer token ile normal kimlik doğrulama çalışır", async () => {
  const { authService } = await import("../auth/auth.service");
  const { authenticateOrAdminPasscode } = await import("./notifications-auth");

  const decodeMock = mock.method(authService, "decodeAccessToken", () => ({
    id: "user-42",
    email: "dev@gossipai.test",
    tokenVersion: 3,
  }));

  const req = {
    header() {
      return undefined;
    },
    headers: {
      authorization: "Bearer valid-token",
    },
    user: undefined,
  };

  let nextArg: unknown;

  await authenticateOrAdminPasscode(
    req as never,
    {} as never,
    ((error?: unknown) => {
      nextArg = error;
    }) as never
  );

  assert.equal(nextArg, undefined);
  assert.equal(decodeMock.mock.callCount(), 1);
  assert.deepEqual(req.user, {
    id: "user-42",
    email: "dev@gossipai.test",
    tokenVersion: 3,
  });
});
