import { Prisma } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { prisma } from "@formbricks/database";
import { DatabaseError } from "@formbricks/types/errors";
import { canUserAccessEnvironmentIntegrations, hasUserEnvironmentAccess } from "./auth";

vi.mock("@formbricks/database", () => ({
  prisma: {
    membership: {
      findFirst: vi.fn(),
    },
    teamUser: {
      findFirst: vi.fn(),
    },
    projectTeam: {
      findFirst: vi.fn(),
    },
  },
}));

describe("hasUserEnvironmentAccess", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("returns true for owner role", async () => {
    vi.mocked(prisma.membership.findFirst).mockResolvedValue({
      role: "owner",
    } as any);

    const result = await hasUserEnvironmentAccess("user1", "env1");
    expect(result).toBe(true);
  });

  test("returns true for manager role", async () => {
    vi.mocked(prisma.membership.findFirst).mockResolvedValue({
      role: "manager",
    } as any);

    const result = await hasUserEnvironmentAccess("user1", "env1");
    expect(result).toBe(true);
  });

  test("returns true for billing role", async () => {
    vi.mocked(prisma.membership.findFirst).mockResolvedValue({
      role: "billing",
    } as any);

    const result = await hasUserEnvironmentAccess("user1", "env1");
    expect(result).toBe(true);
  });

  test("returns true when user has team membership", async () => {
    vi.mocked(prisma.membership.findFirst).mockResolvedValue({
      role: "member",
    } as any);
    vi.mocked(prisma.teamUser.findFirst).mockResolvedValue({
      userId: "user1",
    } as any);

    const result = await hasUserEnvironmentAccess("user1", "env1");
    expect(result).toBe(true);
  });

  test("returns false when user has no access", async () => {
    vi.mocked(prisma.membership.findFirst).mockResolvedValue({
      role: "member",
    } as any);
    vi.mocked(prisma.teamUser.findFirst).mockResolvedValue(null);

    const result = await hasUserEnvironmentAccess("user1", "env1");
    expect(result).toBe(false);
  });

  test("throws DatabaseError on Prisma error", async () => {
    vi.mocked(prisma.membership.findFirst).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Test error", {
        code: "P2002",
        clientVersion: "1.0.0",
      })
    );

    await expect(hasUserEnvironmentAccess("user1", "env1")).rejects.toThrow(DatabaseError);
  });
});

describe("canUserAccessEnvironmentIntegrations", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("rejects the billing role", async () => {
    vi.mocked(prisma.membership.findFirst).mockResolvedValue({ role: "billing" } as any);
    expect(await canUserAccessEnvironmentIntegrations("user1", "env1", { write: false })).toBe(false);
  });

  test("allows owners", async () => {
    vi.mocked(prisma.membership.findFirst).mockResolvedValue({ role: "owner" } as any);
    expect(await canUserAccessEnvironmentIntegrations("user1", "env1", { write: true })).toBe(true);
  });

  test("requires a readWrite or manage team grant for members to write", async () => {
    vi.mocked(prisma.membership.findFirst).mockResolvedValue({ role: "member" } as any);
    vi.mocked(prisma.projectTeam.findFirst).mockResolvedValue(null);
    expect(await canUserAccessEnvironmentIntegrations("user1", "env1", { write: true })).toBe(false);
    expect(vi.mocked(prisma.projectTeam.findFirst).mock.calls[0][0]?.where).toMatchObject({
      permission: { in: ["readWrite", "manage"] },
    });
  });
});
