import { cache as reactCache } from "react";
import { prisma } from "@formbricks/database";

// Scoped to the environment: a client-supplied contactId must not link a display to another tenant's contact.
export const doesContactExist = reactCache(async (id: string, environmentId: string): Promise<boolean> => {
  const contact = await prisma.contact.findFirst({
    where: {
      id,
      environmentId,
    },
    select: {
      id: true,
    },
  });

  return !!contact;
});
