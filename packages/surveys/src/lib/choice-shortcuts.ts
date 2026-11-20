const NON_TEXT_INPUT_TYPES = new Set(["radio", "checkbox", "button", "submit", "reset"]);

/** Maps a plain letter key (a, b, c…) to a 0-based option index, or null if it is not a valid shortcut. */
export const getChoiceIndexFromKey = (
  event: Pick<KeyboardEvent, "key" | "metaKey" | "ctrlKey" | "altKey">,
  optionCount: number
): number | null => {
  if (event.metaKey || event.ctrlKey || event.altKey) return null;
  if (!/^[a-z]$/i.test(event.key)) return null;
  const index = event.key.toLowerCase().charCodeAt(0) - "a".charCodeAt(0);
  return index < optionCount ? index : null;
};

/** True when the key press goes into a text field (radio/checkbox inputs keep focus after a click and are not text). */
export const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  if (target instanceof HTMLInputElement) return !NON_TEXT_INPUT_TYPES.has(target.type);
  return (
    target instanceof HTMLTextAreaElement ||
    target.isContentEditable ||
    target.getAttribute("contenteditable") === "true"
  );
};
