import { describe, expect, test } from "vitest";
import { resolveCardArrangement } from "./card-arrangement";

describe("resolveCardArrangement", () => {
  test("link survey uses linkSurveys value, including redesign", () => {
    expect(resolveCardArrangement("link", { linkSurveys: "redesign", appSurveys: "simple" })).toBe(
      "redesign"
    );
  });

  test("app survey with redesign renders as simple", () => {
    expect(resolveCardArrangement("app", { linkSurveys: "simple", appSurveys: "redesign" })).toBe("simple");
  });

  test("falls back to straight", () => {
    expect(resolveCardArrangement("link", null)).toBe("straight");
    expect(resolveCardArrangement("app", undefined)).toBe("straight");
  });
});
