import { type TResponseData } from "@formbricks/types/responses";
import { type TSurveyElement, TSurveyElementTypeEnum } from "@formbricks/types/surveys/elements";

const isAutoProgressElementType = (type: TSurveyElementTypeEnum): boolean =>
  type === TSurveyElementTypeEnum.Rating ||
  type === TSurveyElementTypeEnum.NPS ||
  type === TSurveyElementTypeEnum.MultipleChoiceSingle;

// Single choice keeps "Next" visible so the respondent can always correct or skip the answer.
const isRatingOrNps = (type: TSurveyElementTypeEnum): boolean =>
  type === TSurveyElementTypeEnum.Rating || type === TSurveyElementTypeEnum.NPS;

// With a step transition the delay is the exit animation, so the respondent sees an instant reaction.
export const STEP_EXIT_MS = 180;

export const getAutoProgressDelayMs = (element: TSurveyElement, hasStepTransition = false): number => {
  if (hasStepTransition) return STEP_EXIT_MS;
  return element.type === TSurveyElementTypeEnum.MultipleChoiceSingle ? 300 : 0;
};

// Stored value is the choice label (any language) or id; "" / free text means "other".
const isNonOtherChoiceValue = (element: TSurveyElement, value: unknown): boolean => {
  if (element.type !== TSurveyElementTypeEnum.MultipleChoiceSingle) return true;
  if (typeof value !== "string" || value === "") return false;
  return element.choices.some(
    (choice) => choice.id !== "other" && (choice.id === value || Object.values(choice.label).includes(value))
  );
};

export const getAutoProgressElement = (
  elements: TSurveyElement[],
  isAutoProgressingEnabled: boolean
): TSurveyElement | null => {
  if (!isAutoProgressingEnabled || elements.length !== 1) {
    return null;
  }

  const [element] = elements;
  return isAutoProgressElementType(element.type) ? element : null;
};

export const shouldHideSubmitButtonForAutoProgress = (
  elements: TSurveyElement[],
  isAutoProgressingEnabled: boolean,
  value: TResponseData = {}
): boolean => {
  const autoProgressElement = getAutoProgressElement(elements, isAutoProgressingEnabled);
  // Once answered (e.g. after navigating back), keep "Next" visible so the respondent isn't stuck.
  return Boolean(
    autoProgressElement &&
    isRatingOrNps(autoProgressElement.type) &&
    autoProgressElement.required &&
    value[autoProgressElement.id] === undefined
  );
};

export const shouldTriggerAutoProgress = ({
  changedElementId,
  mergedValue,
  autoProgressElement,
  isAlreadyInFlight,
}: {
  changedElementId: string;
  mergedValue: TResponseData;
  autoProgressElement: TSurveyElement | null;
  isAlreadyInFlight: boolean;
}): boolean => {
  if (!autoProgressElement || isAlreadyInFlight || changedElementId !== autoProgressElement.id) {
    return false;
  }

  const changedValue = mergedValue[autoProgressElement.id];
  return changedValue !== undefined && isNonOtherChoiceValue(autoProgressElement, changedValue);
};
