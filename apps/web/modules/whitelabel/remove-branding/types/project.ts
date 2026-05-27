/**
 * Branding update types.
 *
 * Defines the input shape for toggling survey branding on/off.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from "zod";

export const ZProjectUpdateBrandingInput = z.object({
  linkSurveyBranding: z.boolean().optional(),
  inAppSurveyBranding: z.boolean().optional(),
});

export type TProjectUpdateBrandingInput = z.infer<typeof ZProjectUpdateBrandingInput>;
