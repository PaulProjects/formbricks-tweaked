import { describe, expect, test } from "vitest";
import { type TSurveyElement, TSurveyElementTypeEnum } from "@formbricks/types/surveys/elements";
import {
  STEP_EXIT_MS,
  getAutoProgressDelayMs,
  getAutoProgressElement,
  shouldHideSubmitButtonForAutoProgress,
  shouldTriggerAutoProgress,
} from "./auto-progress";

const createElement = (id: string, type: TSurveyElementTypeEnum, required: boolean): TSurveyElement =>
  ({
    id,
    type,
    required,
  }) as unknown as TSurveyElement;

describe("auto-progress helpers", () => {
  test("returns auto-progress element for single rating/nps blocks only", () => {
    const ratingElement = createElement("rating_1", TSurveyElementTypeEnum.Rating, true);
    const npsElement = createElement("nps_1", TSurveyElementTypeEnum.NPS, false);
    const openTextElement = createElement("text_1", TSurveyElementTypeEnum.OpenText, false);

    expect(getAutoProgressElement([ratingElement], true)).toEqual(ratingElement);
    expect(getAutoProgressElement([npsElement], true)).toEqual(npsElement);
    expect(getAutoProgressElement([openTextElement], true)).toBeNull();
    expect(getAutoProgressElement([ratingElement], false)).toBeNull();
    expect(getAutoProgressElement([ratingElement, npsElement], true)).toBeNull();
  });

  test("hides submit button only for required auto-progress elements", () => {
    const requiredRating = createElement("rating_required", TSurveyElementTypeEnum.Rating, true);
    const optionalRating = createElement("rating_optional", TSurveyElementTypeEnum.Rating, false);

    expect(shouldHideSubmitButtonForAutoProgress([requiredRating], true)).toBe(true);
    expect(shouldHideSubmitButtonForAutoProgress([optionalRating], true)).toBe(false);
    expect(shouldHideSubmitButtonForAutoProgress([requiredRating], false)).toBe(false);
    // Already answered (navigated back): Next must stay visible
    expect(shouldHideSubmitButtonForAutoProgress([requiredRating], true, { [requiredRating.id]: 4 })).toBe(
      false
    );
  });

  test("triggers auto-progress only when an eligible response was changed", () => {
    const autoProgressElement = createElement("rating_1", TSurveyElementTypeEnum.Rating, true);

    expect(
      shouldTriggerAutoProgress({
        changedElementId: "rating_1",
        mergedValue: { rating_1: 5 },
        autoProgressElement,
        isAlreadyInFlight: false,
      })
    ).toBe(true);

    expect(
      shouldTriggerAutoProgress({
        changedElementId: "other",
        mergedValue: { rating_1: 5 },
        autoProgressElement,
        isAlreadyInFlight: false,
      })
    ).toBe(false);

    expect(
      shouldTriggerAutoProgress({
        changedElementId: "rating_1",
        mergedValue: {},
        autoProgressElement,
        isAlreadyInFlight: false,
      })
    ).toBe(false);

    expect(
      shouldTriggerAutoProgress({
        changedElementId: "rating_1",
        mergedValue: { rating_1: 5 },
        autoProgressElement,
        isAlreadyInFlight: true,
      })
    ).toBe(false);
  });
  describe("single choice", () => {
    const singleChoice = {
      id: "sc_1",
      type: TSurveyElementTypeEnum.MultipleChoiceSingle,
      required: true,
      choices: [
        { id: "c1", label: { default: "2–5" } },
        { id: "c2", label: { default: "Yes", de: "Ja" } },
        { id: "other", label: { default: "Other" } },
      ],
    } as unknown as TSurveyElement;
    const trigger = (v: unknown) =>
      shouldTriggerAutoProgress({
        changedElementId: "sc_1",
        mergedValue: { sc_1: v } as never,
        autoProgressElement: singleChoice,
        isAlreadyInFlight: false,
      });

    test("is an auto-progress element only when enabled", () => {
      expect(getAutoProgressElement([singleChoice], true)).toEqual(singleChoice);
      expect(getAutoProgressElement([singleChoice], false)).toBeNull();
    });

    test("triggers for a choice label (any language) or id, not for other", () => {
      expect(trigger("2–5")).toBe(true);
      expect(trigger("Ja")).toBe(true);
      expect(trigger("c1")).toBe(true);
      expect(trigger("")).toBe(false);
      expect(trigger("mein eigener Text")).toBe(false);
      expect(trigger("other")).toBe(false);
      expect(trigger(undefined)).toBe(false);
    });

    test("never hides the submit button", () => {
      expect(shouldHideSubmitButtonForAutoProgress([singleChoice], true, {})).toBe(false);
    });

    test("delay is 300ms for single choice and 0 otherwise", () => {
      const rating = createElement("r", TSurveyElementTypeEnum.Rating, true);
      expect(getAutoProgressDelayMs(singleChoice)).toBe(300);
      expect(getAutoProgressDelayMs(rating)).toBe(0);
    });

    test("delay is the exit animation for every type with a step transition", () => {
      const rating = createElement("r", TSurveyElementTypeEnum.Rating, true);
      expect(getAutoProgressDelayMs(singleChoice, true)).toBe(STEP_EXIT_MS);
      expect(getAutoProgressDelayMs(rating, true)).toBe(STEP_EXIT_MS);
    });
  });
});
