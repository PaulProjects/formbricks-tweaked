/**
 * Organization logo URL service.
 *
 * Fetches the custom logo URL from the organization's whitelabel config.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import "server-only";
import { Prisma } from "@prisma/client";
import { cache as reactCache } from "react";
import { prisma } from "@formbricks/database";
import { ZId } from "@formbricks/types/common";
import { DatabaseError } from "@formbricks/types/errors";
import { validateInputs } from "@/lib/utils/validate";

export const getOrganizationLogoUrl = reactCache(async (organizationId: string): Promise<string | null> => {
  validateInputs([organizationId, ZId]);
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        whitelabel: true,
      },
    });
    return organization?.whitelabel?.logoUrl ?? null;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }
    throw error;
  }
});
