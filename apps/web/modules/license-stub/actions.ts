/**
 * Stub license recheck action.
 *
 * Since there is no enterprise license system, this action is a no-op.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

"use server";

import { z } from "zod";
import { ZId } from "@formbricks/types/common";
import { authenticatedActionClient } from "@/lib/utils/action-client";

const ZRecheckLicenseAction = z.object({
  environmentId: ZId,
});

export type TRecheckLicenseAction = z.infer<typeof ZRecheckLicenseAction>;

export const recheckLicenseAction = authenticatedActionClient
  .inputSchema(ZRecheckLicenseAction)
  .action(async () => {
    return { status: "invalid_license" as any };
  });
