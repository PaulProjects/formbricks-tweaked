import { beforeEach, describe, expect, test, vi } from "vitest";
import { InvalidInputError } from "@formbricks/types/errors";
import { getIsFreshInstance } from "@/lib/instance/service";
import { verifyInviteToken } from "@/lib/jwt";
import { getInvite } from "@/modules/auth/signup/lib/invite";
import { getIsMultiOrgEnabled } from "@/modules/license-stub/lib/utils";
import { assertSignupAllowed, getValidInvite } from "./signup-policy";

const constants = vi.hoisted(() => ({ SIGNUP_ENABLED: false }));
vi.mock("@/lib/constants", () => constants);
vi.mock("@/lib/instance/service", () => ({ getIsFreshInstance: vi.fn() }));
vi.mock("@/lib/jwt", () => ({ verifyInviteToken: vi.fn() }));
vi.mock("@/modules/auth/signup/lib/invite", () => ({ getInvite: vi.fn() }));
vi.mock("@/modules/license-stub/lib/utils", () => ({ getIsMultiOrgEnabled: vi.fn() }));

const invite = {
  id: "invite-1",
  email: "Invited@Example.com",
  expiresAt: new Date(Date.now() + 60_000),
} as any;

describe("getValidInvite", () => {
  beforeEach(() => {
    vi.mocked(verifyInviteToken).mockReturnValue({ inviteId: "invite-1", email: "invited@example.com" });
    vi.mocked(getInvite).mockResolvedValue(invite);
  });

  test("accepts the invited address case-insensitively", async () => {
    await expect(getValidInvite("token", "INVITED@example.com")).resolves.toBe(invite);
  });

  test("rejects a different address", async () => {
    await expect(getValidInvite("token", "attacker@example.com")).rejects.toThrow(InvalidInputError);
  });

  test("rejects an expired invite", async () => {
    vi.mocked(getInvite).mockResolvedValue({ ...invite, expiresAt: new Date(Date.now() - 1) });
    await expect(getValidInvite("token", "invited@example.com")).rejects.toThrow(InvalidInputError);
  });

  test("rejects a missing invite", async () => {
    vi.mocked(getInvite).mockResolvedValue(null);
    await expect(getValidInvite("token", "invited@example.com")).rejects.toThrow(InvalidInputError);
  });
});

describe("assertSignupAllowed", () => {
  beforeEach(() => {
    constants.SIGNUP_ENABLED = false;
    vi.mocked(getIsMultiOrgEnabled).mockResolvedValue(false);
    vi.mocked(getIsFreshInstance).mockResolvedValue(false);
  });

  test("rejects uninvited sign-up on a closed instance", async () => {
    await expect(assertSignupAllowed(undefined, "a@example.com")).rejects.toThrow(InvalidInputError);
  });

  test("allows the first administrator on a fresh instance", async () => {
    vi.mocked(getIsFreshInstance).mockResolvedValue(true);
    await expect(assertSignupAllowed(undefined, "a@example.com")).resolves.toBeUndefined();
  });

  test("allows uninvited sign-up when sign-up and multi-org are enabled", async () => {
    constants.SIGNUP_ENABLED = true;
    vi.mocked(getIsMultiOrgEnabled).mockResolvedValue(true);
    await expect(assertSignupAllowed(undefined, "a@example.com")).resolves.toBeUndefined();
  });
});
