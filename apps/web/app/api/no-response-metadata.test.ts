import { beforeEach, describe, expect, test, vi } from "vitest";
import { prisma } from "@formbricks/database";
import { ok } from "@formbricks/types/error-handlers";
import { TResponseInput } from "@formbricks/types/responses";
import { buildPrismaResponseData } from "@/app/api/v1/lib/utils";
import { createResponse as createResponseClientV2 } from "@/app/api/v2/client/[environmentId]/responses/lib/response";
import { getOrganizationByEnvironmentId } from "@/lib/organization/service";
import { updateResponse as updateResponseManagementV2 } from "@/modules/api/v2/management/responses/[responseId]/lib/response";
import {
  getMonthlyOrganizationResponseCount,
  getOrganizationBilling,
  getOrganizationIdFromEnvironmentId,
} from "@/modules/api/v2/management/responses/lib/organization";
import { createResponse as createResponseManagementV2 } from "@/modules/api/v2/management/responses/lib/response";

// Regression guard for this fork: response metadata (IP address, browser, OS,
// device type, country) must never reach the database. Every code path that
// writes a Response row is exercised here. If an upstream merge restores the
// meta passthrough anywhere, this test fails.

vi.mock("@formbricks/database", () => ({
  prisma: { response: { create: vi.fn(), update: vi.fn() } },
}));
vi.mock("@/lib/organization/service", () => ({ getOrganizationByEnvironmentId: vi.fn() }));
vi.mock("@/lib/utils/validate", () => ({ validateInputs: vi.fn() }));
vi.mock("@/app/api/v2/client/[environmentId]/responses/lib/contact", () => ({ getContact: vi.fn() }));
vi.mock("@/modules/api/v2/management/responses/lib/contact", () => ({ getContactByUserId: vi.fn() }));
vi.mock("@/modules/api/v2/management/responses/lib/organization", () => ({
  getOrganizationIdFromEnvironmentId: vi.fn(),
  getOrganizationBilling: vi.fn(),
  getMonthlyOrganizationResponseCount: vi.fn(),
}));
vi.mock("@/modules/api/v2/management/responses/[responseId]/lib/display", () => ({ deleteDisplay: vi.fn() }));
vi.mock("@/modules/api/v2/management/responses/[responseId]/lib/survey", () => ({
  getSurveyQuestions: vi.fn(),
}));
vi.mock("@/modules/api/v2/management/responses/[responseId]/lib/utils", () => ({
  findAndDeleteUploadedFilesInResponse: vi.fn(),
}));

const META = {
  source: "link",
  url: "https://example.com/s/cldu2q2y1000019mqauto1234",
  userAgent: { browser: "Chrome", device: "mobile", os: "Android" },
  country: "DE",
  action: "Exit Intent",
  ipAddress: "203.0.113.42",
};

const BASE = {
  environmentId: "cldu2q2y1000019mqenv00001",
  surveyId: "cldu2q2y1000019mqsurvey01",
  finished: true,
  data: { q1: "answer" },
  meta: META,
} satisfies TResponseInput;

const expectNoMeta = (written: Record<string, unknown> | undefined): void => {
  expect(written).toBeDefined();
  expect(written?.meta).toEqual({});
  for (const leak of ["203.0.113.42", "Chrome", "Android", "mobile", "DE"]) {
    expect(JSON.stringify(written)).not.toContain(leak);
  }
};

describe("this fork never persists response metadata", () => {
  beforeEach(() => {
    vi.mocked(getOrganizationByEnvironmentId).mockResolvedValue({ id: "org" } as never);
    vi.mocked(prisma.response.create).mockResolvedValue({ tags: [] } as never);
    vi.mocked(prisma.response.update).mockResolvedValue({} as never);
    vi.mocked(getOrganizationIdFromEnvironmentId).mockResolvedValue(ok("org") as never);
    vi.mocked(getOrganizationBilling).mockResolvedValue(ok({}) as never);
    vi.mocked(getMonthlyOrganizationResponseCount).mockResolvedValue(ok(0) as never);
  });

  // v1 client and v1 management responses both build their row here
  test("v1 buildPrismaResponseData drops meta", () => {
    expectNoMeta(buildPrismaResponseData(BASE, null, {}));
  });

  test("v2 client createResponse drops meta", async () => {
    await createResponseClientV2({ ...BASE, contactId: null });
    expectNoMeta(vi.mocked(prisma.response.create).mock.calls[0][0].data as Record<string, unknown>);
  });

  test("v2 management createResponse drops meta", async () => {
    await createResponseManagementV2(BASE.environmentId, BASE);
    expectNoMeta(vi.mocked(prisma.response.create).mock.calls[0][0].data as Record<string, unknown>);
  });

  test("v2 management updateResponse drops meta", async () => {
    await updateResponseManagementV2("cldu2q2y1000019mqresp0001", { meta: META } as never);
    expectNoMeta(vi.mocked(prisma.response.update).mock.calls[0][0].data as Record<string, unknown>);
  });
});
