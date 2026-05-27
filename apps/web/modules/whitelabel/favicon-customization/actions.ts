/**
 * Server actions for favicon customization.
 *
 * No license gating — always available to organization owners/managers.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

"use server";

import { z } from "zod";
import { ZId, ZStorageUrl } from "@formbricks/types/common";
import { authenticatedActionClient } from "@/lib/utils/action-client";
import { checkAuthorizationUpdated } from "@/lib/utils/action-client/action-client-middleware";
import { updateOrganizationFaviconUrl } from "@/modules/whitelabel/favicon-customization/lib/organization";

const ZUpdateOrganizationFaviconUrlAction = z.object({
  organizationId: ZId,
  faviconUrl: ZStorageUrl,
});

export const updateOrganizationFaviconUrlAction = authenticatedActionClient
  .inputSchema(ZUpdateOrganizationFaviconUrlAction)
  .action(async ({ ctx, parsedInput }) => {
    const { organizationId, faviconUrl } = parsedInput;

    await checkAuthorizationUpdated({
      userId: ctx.user.id,
      organizationId,
      access: [
        {
          type: "organization",
          roles: ["owner", "manager"],
        },
      ],
    });

    return await updateOrganizationFaviconUrl(organizationId, faviconUrl);
  });

const ZRemoveOrganizationFaviconUrlAction = z.object({
  organizationId: ZId,
});

export const removeOrganizationFaviconUrlAction = authenticatedActionClient
  .inputSchema(ZRemoveOrganizationFaviconUrlAction)
  .action(async ({ ctx, parsedInput }) => {
    const { organizationId } = parsedInput;

    await checkAuthorizationUpdated({
      userId: ctx.user.id,
      organizationId,
      access: [{ type: "organization", roles: ["owner", "manager"] }],
    });

    return await updateOrganizationFaviconUrl(organizationId, null);
  });
