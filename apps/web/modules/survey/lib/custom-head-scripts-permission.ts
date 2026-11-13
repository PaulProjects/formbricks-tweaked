import type { TSurvey } from "@formbricks/types/surveys/types";

// Backport of upstream #9432: survey head scripts run as arbitrary HTML on the published link survey,
// so changing them takes Manage access (same boundary as the project-level scripts), not Read & write.
export type TCustomHeadScriptsFields = Partial<Pick<TSurvey, "customHeadScripts" | "customHeadScriptsMode">>;

export const CUSTOM_HEAD_SCRIPTS_PERMISSION_MESSAGE =
  "Only owners, managers and members with Manage access can change a survey's custom head scripts.";

// An empty script and no script render the same page; a missing mode is treated as "add" by the
// link-survey injector. Normalising both keeps an untouched survey from reading as a change.
const normalizeScripts = (value: string | null | undefined): string | null => value || null;
const normalizeMode = (value: TSurvey["customHeadScriptsMode"] | undefined) => value ?? "add";

/**
 * Whether a write would change a survey's custom head scripts or their mode. `existing` is null for
 * a create. A key the write leaves `undefined` is not written, so it never counts as a change.
 */
export const isCustomHeadScriptsChange = (
  incoming: TCustomHeadScriptsFields,
  existing: TCustomHeadScriptsFields | null
): boolean => {
  const isScriptsChange =
    incoming.customHeadScripts !== undefined &&
    normalizeScripts(incoming.customHeadScripts) !== normalizeScripts(existing?.customHeadScripts);
  const isModeChange =
    incoming.customHeadScriptsMode !== undefined &&
    normalizeMode(incoming.customHeadScriptsMode) !== normalizeMode(existing?.customHeadScriptsMode);

  return isScriptsChange || isModeChange;
};
