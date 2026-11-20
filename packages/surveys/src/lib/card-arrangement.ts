import type { TBaseStyling, TCardArrangementOptions } from "@formbricks/types/styling";
import type { TSurveyType } from "@formbricks/types/surveys/types";

export const resolveCardArrangement = (
  surveyType: TSurveyType,
  cardArrangement: TBaseStyling["cardArrangement"]
): TCardArrangementOptions => {
  if (surveyType === "link") return cardArrangement?.linkSurveys ?? "straight";
  const value = cardArrangement?.appSurveys ?? "straight";
  // redesign is link-only; app/website surveys render as simple
  return value === "redesign" ? "simple" : value;
};
