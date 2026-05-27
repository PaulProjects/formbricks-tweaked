/**
 * Server action to update project branding flags.
 *
 * No license gating — branding toggle is always available to
 * organization owners/managers and project managers.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

"use server";

import { z } from "zod";
import { ZId } from "@formbricks/types/common";
import { authenticatedActionClient } from "@/lib/utils/action-client";
import { checkAuthorizationUpdated } from "@/lib/utils/action-client/action-client-middleware";
import { getOrganizationIdFromProjectId } from "@/lib/utils/helper";
import { updateProjectBranding } from "@/modules/whitelabel/remove-branding/lib/project";
import { ZProjectUpdateBrandingInput } from "@/modules/whitelabel/remove-branding/types/project";

const ZUpdateProjectAction = z.object({
  projectId: ZId,
  data: ZProjectUpdateBrandingInput,
});

export const updateProjectBrandingAction = authenticatedActionClient
  .inputSchema(ZUpdateProjectAction)
  .action(async ({ ctx, parsedInput }) => {
    const organizationId = await getOrganizationIdFromProjectId(parsedInput.projectId);

    await checkAuthorizationUpdated({
      userId: ctx.user.id,
      organizationId,
      access: [
        {
          type: "organization",
          roles: ["owner", "manager"],
        },
        {
          type: "projectTeam",
          projectId: parsedInput.projectId,
          minPermission: "manage",
        },
      ],
    });

    return await updateProjectBranding(parsedInput.projectId, parsedInput.data);
  });
