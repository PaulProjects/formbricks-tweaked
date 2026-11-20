// @vitest-environment jsdom
import { describe, expect, test } from "vitest";
import { getChoiceIndexFromKey, isTypingTarget } from "./choice-shortcuts";

const key = (k: string, mods: Partial<{ metaKey: boolean; ctrlKey: boolean; altKey: boolean }> = {}) => ({
  key: k,
  metaKey: false,
  ctrlKey: false,
  altKey: false,
  ...mods,
});

describe("getChoiceIndexFromKey", () => {
  test("maps letters to indexes, case-insensitive", () => {
    expect(getChoiceIndexFromKey(key("b"), 6)).toBe(1);
    expect(getChoiceIndexFromKey(key("B"), 6)).toBe(1);
  });

  test("returns null for out-of-range, non-letter and modified keys", () => {
    expect(getChoiceIndexFromKey(key("g"), 6)).toBeNull();
    expect(getChoiceIndexFromKey(key("1"), 6)).toBeNull();
    expect(getChoiceIndexFromKey(key("Enter"), 6)).toBeNull();
    expect(getChoiceIndexFromKey(key("a", { metaKey: true }), 6)).toBeNull();
    expect(getChoiceIndexFromKey(key("a", { ctrlKey: true }), 6)).toBeNull();
    expect(getChoiceIndexFromKey(key("a", { altKey: true }), 6)).toBeNull();
  });
});

describe("isTypingTarget", () => {
  test("detects editable elements", () => {
    expect(isTypingTarget(document.createElement("input"))).toBe(true);
    expect(isTypingTarget(document.createElement("textarea"))).toBe(true);
    const editable = document.createElement("div");
    editable.setAttribute("contenteditable", "true");
    expect(isTypingTarget(editable)).toBe(true);
  });

  test("ignores other targets", () => {
    expect(isTypingTarget(document.createElement("div"))).toBe(false);
    expect(isTypingTarget(null)).toBe(false);
  });

  test("radio and checkbox inputs are not typing targets, text inputs are", () => {
    const input = (type: string) => Object.assign(document.createElement("input"), { type });
    expect(isTypingTarget(input("radio"))).toBe(false);
    expect(isTypingTarget(input("checkbox"))).toBe(false);
    expect(isTypingTarget(input("text"))).toBe(true);
  });
});
