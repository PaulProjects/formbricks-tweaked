import { describe, expect, test } from "vitest";
import { isCustomHeadScriptsChange } from "./custom-head-scripts-permission";

describe("isCustomHeadScriptsChange", () => {
  test("untouched or equivalent values are not a change", () => {
    expect(isCustomHeadScriptsChange({}, null)).toBe(false);
    expect(isCustomHeadScriptsChange({ customHeadScripts: "" }, { customHeadScripts: null })).toBe(false);
    expect(isCustomHeadScriptsChange({ customHeadScriptsMode: "add" }, { customHeadScriptsMode: null })).toBe(
      false
    );
    expect(
      isCustomHeadScriptsChange({ customHeadScripts: "<script/>" }, { customHeadScripts: "<script/>" })
    ).toBe(false);
  });

  test("setting, clearing or switching mode is a change", () => {
    expect(isCustomHeadScriptsChange({ customHeadScripts: "<script/>" }, null)).toBe(true);
    expect(isCustomHeadScriptsChange({ customHeadScripts: null }, { customHeadScripts: "<script/>" })).toBe(
      true
    );
    expect(
      isCustomHeadScriptsChange({ customHeadScriptsMode: "replace" }, { customHeadScriptsMode: "add" })
    ).toBe(true);
  });
});
