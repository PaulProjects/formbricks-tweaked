import { createId } from "@paralleldrive/cuid2";
import { expect } from "@playwright/test";
import { prisma } from "@formbricks/database";
import { test } from "./lib/fixtures";

const t = (s: string) => ({ default: s });
const elementBase = { required: false };

const createRedesignSurvey = async (environmentId: string) => {
  const ids = { single: createId(), multi: createId(), text: createId() };
  const block = (name: string, element: object, buttonLabel = "Next") => ({
    id: createId(),
    name,
    buttonLabel: t(buttonLabel),
    backButtonLabel: t("Back"),
    elements: [element],
  });
  const survey = await prisma.survey.create({
    data: {
      name: "Redesign E2E",
      type: "link",
      status: "inProgress",
      environmentId,
      isAutoProgressingEnabled: true,
      styling: {
        overwriteThemeStyling: true,
        cardArrangement: { linkSurveys: "redesign", appSurveys: "simple" },
      },
      blocks: [
        block("single", {
          ...elementBase,
          id: ids.single,
          type: "multipleChoiceSingle",
          headline: t("Pick one"),
          required: true,
          choices: [
            { id: "c1", label: t("Alpha") },
            { id: "c2", label: t("Beta") },
            { id: "other", label: t("Other") },
          ],
        }),
        block("multi", {
          ...elementBase,
          id: ids.multi,
          type: "multipleChoiceMulti",
          headline: t("Pick many"),
          choices: [
            { id: "m1", label: t("One") },
            { id: "m2", label: t("Two") },
            { id: "m3", label: t("Three") },
          ],
        }),
        block(
          "text",
          { ...elementBase, id: ids.text, type: "openText", headline: t("Say more"), inputType: "text" },
          "Finish"
        ),
      ],
      endings: [{ id: createId(), type: "endScreen", headline: t("All done") }],
    },
  });
  return { survey, ids };
};

test.describe("Redesign link survey", () => {
  test.beforeEach(async ({ users }, testInfo) => {
    // No UI login: link surveys are public, and the login endpoint is rate limited (10 / 15 min).
    const email = `redesign-${testInfo.workerIndex}-${Date.now()}@example.com`;
    await users.create({ email });
    const environment = await prisma.environment.findFirstOrThrow({
      where: {
        type: "production",
        project: { organization: { memberships: { some: { user: { email } } } } },
      },
    });
    const { survey, ids } = await createRedesignSurvey(environment.id);
    Object.assign(testInfo, { surveyId: survey.id, ids });
  });

  const ctx = (testInfo: unknown) => testInfo as { surveyId: string; ids: Record<string, string> };

  const open = async (page: import("@playwright/test").Page, surveyId: string) => {
    await page.goto(`/s/${surveyId}`);
    await expect(page.locator(".fb-redesign")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("questionCard-0")).toBeVisible();
  };

  const nextButton = (page: import("@playwright/test").Page) =>
    page.locator("[data-fb-block-actions]").getByRole("button", { name: "Next" });

  test("completes survey with auto-advance, back, keyboard and stores response", async ({
    page,
  }, testInfo) => {
    const { surveyId, ids } = ctx(testInfo);
    await open(page, surveyId);

    // pick -> auto-advance without clicking Next
    await page.locator("[data-fb-choice-option]").filter({ hasText: "Alpha" }).click();
    await expect(page.getByTestId("questionCard-1")).toBeVisible();

    // back -> previous question, Next visible even though single choice auto-advances (Review Focus 5)
    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByTestId("questionCard-0")).toBeVisible();
    await expect(nextButton(page)).toBeVisible();
    await nextButton(page).click();
    await expect(page.getByTestId("questionCard-1")).toBeVisible();

    // multi choice via keyboard letters
    const options = page.locator("[data-fb-choice-option]");
    await page.keyboard.press("a");
    await page.keyboard.press("c");
    await expect(options.nth(0).locator("input")).toBeChecked();
    await expect(options.nth(2).locator("input")).toBeChecked();
    await expect(options.nth(1).locator("input")).not.toBeChecked();
    await nextButton(page).click();

    await expect(page.getByTestId("questionCard-2")).toBeVisible();
    await page.getByRole("textbox").fill("hello redesign");
    await page.getByRole("button", { name: "Finish" }).click();

    await expect(page.getByText("All done")).toBeVisible();
    await expect
      .poll(async () => (await prisma.response.findFirst({ where: { surveyId } }))?.finished)
      .toBe(true);
    const response = await prisma.response.findFirstOrThrow({ where: { surveyId } });
    expect(response.data).toEqual({
      [ids.single]: "Alpha",
      [ids.multi]: ["One", "Three"],
      [ids.text]: "hello redesign",
    });
  });

  test("mobile: Next is full-width and pinned to the bottom", async ({ page }, testInfo) => {
    const { surveyId } = ctx(testInfo);
    await page.setViewportSize({ width: 375, height: 812 });
    await open(page, surveyId);

    const next = nextButton(page);
    await expect(next).toBeVisible();
    const box = await next.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(300);
    // Short content: the sticky bar still sits at the bottom (only the branding line may be below it).
    const branding = page.getByText("Powered by");
    const bottomLimit = (await branding.count()) ? (await branding.first().boundingBox())!.y : 812;
    expect(box!.y + box!.height).toBeGreaterThan(bottomLimit - 24 - 16);
    expect(box!.y + box!.height).toBeLessThanOrEqual(812);
  });

  test("mobile: required error is visible after empty submit", async ({ page }, testInfo) => {
    const { surveyId } = ctx(testInfo);
    await page.setViewportSize({ width: 375, height: 812 });
    await open(page, surveyId);
    const next = nextButton(page);
    await next.click();
    await expect(page.getByText(/fill out this field/i).first()).toBeInViewport();
  });

  test("latest pick within the auto-advance window is stored", async ({ page }, testInfo) => {
    const { surveyId, ids } = ctx(testInfo);
    await open(page, surveyId);
    // Both picks in one task, so the second always lands inside the 300ms window
    await page.evaluate(() => {
      const options = [...document.querySelectorAll<HTMLElement>("[data-fb-choice-option]")];
      options.find((o) => o.textContent?.includes("Alpha"))!.click();
      options.find((o) => o.textContent?.includes("Beta"))!.click();
    });
    await expect(page.getByTestId("questionCard-1")).toBeVisible();
    await page.keyboard.press("a");
    await nextButton(page).click();
    await page.getByRole("button", { name: "Finish" }).click();
    await expect
      .poll(async () => (await prisma.response.findFirst({ where: { surveyId } }))?.finished)
      .toBe(true);
    const response = await prisma.response.findFirstOrThrow({ where: { surveyId } });
    expect((response.data as Record<string, unknown>)[ids.single]).toBe("Beta");
  });

  test("selecting Other does not auto-advance", async ({ page }, testInfo) => {
    const { surveyId } = ctx(testInfo);
    await open(page, surveyId);
    await page.locator("[data-fb-choice-option]").filter({ hasText: "Other" }).click();
    await page.getByRole("textbox").fill("something else");
    await page.waitForTimeout(1000);
    await expect(page.getByTestId("questionCard-0")).toBeVisible();
    await expect(page.getByTestId("questionCard-1")).toHaveCount(0);
  });

  test("pick then immediate Next submits the block once", async ({ page }, testInfo) => {
    const { surveyId, ids } = ctx(testInfo);
    const responseWrites: string[] = [];
    page.on("request", (req) => {
      if (/\/client\/[^/]+\/responses/.test(req.url()) && req.method() !== "GET")
        responseWrites.push(req.url());
    });
    await open(page, surveyId);
    // Next one frame after the pick (so the pick is rendered), well inside the 300ms auto-advance window
    await page.evaluate(async () => {
      const options = [...document.querySelectorAll<HTMLElement>("[data-fb-choice-option]")];
      options.find((o) => o.textContent?.includes("Alpha"))!.click();
      await new Promise(requestAnimationFrame);
      document.querySelector<HTMLElement>("[data-fb-block-actions] .button-custom")!.click();
    });
    await expect(page.getByTestId("questionCard-1")).toBeVisible();
    // Past the auto-advance delay: a leftover timer would skip question 2
    await page.waitForTimeout(800);
    await expect(page.getByTestId("questionCard-1")).toBeVisible();
    await expect(page.getByTestId("questionCard-2")).toHaveCount(0);
    const response = await prisma.response.findFirstOrThrow({ where: { surveyId } });
    expect(response.data).toEqual({ [ids.single]: "Alpha" });
    expect(responseWrites).toHaveLength(1);
  });

  test("desktop: action row is inline, not sticky", async ({ page }, testInfo) => {
    const { surveyId } = ctx(testInfo);
    await page.setViewportSize({ width: 1280, height: 800 });
    await open(page, surveyId);
    const position = await page
      .locator("[data-fb-block-actions]")
      .evaluate((el) => getComputedStyle(el).position);
    expect(position).not.toBe("sticky");
  });

  test("mobile: with many options, tapping Next validates instead of scrolling", async ({
    page,
  }, testInfo) => {
    const { surveyId } = ctx(testInfo);
    const survey = await prisma.survey.findUniqueOrThrow({ where: { id: surveyId } });
    const blocks = survey.blocks as { elements: { id: string; choices?: unknown[] }[] }[];
    blocks[0].elements[0].choices = Array.from({ length: 16 }, (_, i) => ({
      id: `long${i}`,
      label: t(`Option ${i + 1}`),
    }));
    await prisma.survey.update({ where: { id: surveyId }, data: { blocks: blocks as object[] } });

    await page.setViewportSize({ width: 375, height: 812 });
    await open(page, surveyId);
    const box = (await nextButton(page).boundingBox())!;
    const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    // Nothing (e.g. the scroll-to-bottom button) sits on top of Next once the loading overlay is gone
    await expect
      .poll(() =>
        page.evaluate(
          ({ x, y }) => Boolean(document.elementFromPoint(x, y)?.closest(".button-custom")),
          center
        )
      )
      .toBe(true);
    await page.mouse.click(center.x, center.y);
    await expect(page.getByText(/fill out this field/i).first()).toBeInViewport();
  });
});
