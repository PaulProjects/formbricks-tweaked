import { beforeEach, describe, expect, test, vi } from "vitest";
import { deepDiff, redactPII, sanitizeUrlForLogging } from "./logger-helpers";

// Patch cache before any imports
beforeEach(async () => {
  // Mock the cache service for tests
  vi.doMock("@/lib/cache", () => ({
    cache: {
      getRedisClient: vi.fn().mockResolvedValue({
        multi: vi.fn().mockReturnValue({
          set: vi.fn(),
          exec: vi.fn().mockResolvedValue([["OK"]]),
        }),
        watch: vi.fn().mockResolvedValue("OK"),
        get: vi.fn().mockResolvedValue(null),
      }),
    },
  }));
});

vi.mock("@/modules/license-stub/lib/utils", () => ({
  getIsAuditLogsEnabled: vi.fn().mockResolvedValue(true),
}));

// Move all relevant mocks to the very top
vi.mock("@formbricks/logger", () => ({
  logger: { error: vi.fn() },
}));
vi.mock("@/lib/utils/helper", () => ({
  getOrganizationIdFromEnvironmentId: vi.fn().mockResolvedValue("org-env-id"),
}));

// Mocks
vi.mock("@/lib/constants", () => ({
  AUDIT_LOG_ENABLED: true,
  AUDIT_LOG_GET_USER_IP: true,
  ENCRYPTION_KEY: "testsecret",
}));
vi.mock("@/lib/utils/client-ip", () => ({
  getClientIpFromHeaders: vi.fn().mockResolvedValue("127.0.0.1"),
}));
vi.mock("@/modules/audit-logs/lib/service", () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

// Cache mock is handled in beforeEach above

// Set ENCRYPTION_KEY for all tests unless explicitly testing its absence
process.env.ENCRYPTION_KEY = "testsecret";

describe("redactPII", () => {
  test("redacts sensitive keys in objects", () => {
    const input = { email: "test@example.com", name: "John", foo: "bar" };
    expect(redactPII(input)).toEqual({ email: "********", name: "********", foo: "bar" });
  });
  test("redacts nested sensitive keys", () => {
    const input = { user: { password: "secret", profile: { address: "123 St" } } };
    expect(redactPII(input)).toEqual({ user: { password: "********", profile: { address: "********" } } });
  });
  test("redacts arrays of objects", () => {
    const input = [{ email: "a@b.com" }, { name: "Jane" }];
    expect(redactPII(input)).toEqual([{ email: "********" }, { name: "********" }]);
  });
  test("returns primitives as is", () => {
    expect(redactPII(42)).toBe(42);
    expect(redactPII("foo")).toBe("foo");
    expect(redactPII(null)).toBe(null);
  });
});

describe("deepDiff", () => {
  test("returns undefined for equal primitives", () => {
    expect(deepDiff(1, 1)).toBeUndefined();
    expect(deepDiff("a", "a")).toBeUndefined();
  });
  test("returns new value for different primitives", () => {
    expect(deepDiff(1, 2)).toBe(2);
    expect(deepDiff("a", "b")).toBe("b");
  });
  test("returns diff for objects", () => {
    expect(deepDiff({ a: 1 }, { a: 2 })).toEqual({ a: 2 });
    expect(deepDiff({ a: 1, b: 2 }, { a: 1, b: 3 })).toEqual({ b: 3 });
  });
  test("returns diff for nested objects", () => {
    expect(deepDiff({ a: { b: 1 } }, { a: { b: 2 } })).toEqual({ a: { b: 2 } });
  });
  test("returns diff for added/removed keys", () => {
    expect(deepDiff({ a: 1 }, { a: 1, b: 2 })).toEqual({ b: 2 });
    // The following case should return undefined, as removed keys are not included in the diff
    expect(deepDiff({ a: 1, b: 2 }, { a: 1 })).toBeUndefined();
  });
});

describe("sanitizeUrlForLogging", () => {
  test("returns sanitized URL with token", () => {
    expect(sanitizeUrlForLogging("https://example.com?token=1234567890")).toBe(
      "https://example.com/?token=********"
    );
  });

  test("returns sanitized URL with code", () => {
    expect(sanitizeUrlForLogging("https://example.com?code=1234567890")).toBe(
      "https://example.com/?code=********"
    );
  });

  test("returns sanitized URL with state", () => {
    expect(sanitizeUrlForLogging("https://example.com?state=1234567890")).toBe(
      "https://example.com/?state=********"
    );
  });

  test("returns sanitized URL with multiple keys", () => {
    expect(
      sanitizeUrlForLogging("https://example.com?token=1234567890&code=1234567890&state=1234567890")
    ).toBe("https://example.com/?token=********&code=********&state=********");
  });

  test("returns sanitized URL without query params", () => {
    expect(sanitizeUrlForLogging("https://example.com")).toBe("https://example.com/");
  });

  test("returns sanitized URL with invalid URL", () => {
    expect(sanitizeUrlForLogging("not-a-valid-url")).toBe("[invalid-url]");
  });
});
