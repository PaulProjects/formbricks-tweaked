"use server";

import { z } from "zod";
import { InvalidInputError } from "@formbricks/types/errors";
import { createEmailToken } from "@/lib/jwt";
import { getUserByEmail } from "@/lib/user/service";
import { actionClient } from "@/lib/utils/action-client";
import { applyIPRateLimit } from "@/modules/core/rate-limit/helpers";
import { rateLimitConfigs } from "@/modules/core/rate-limit/rate-limit-configs";

const ZCreateEmailTokenAction = z.object({
  email: z
    .email({
      error: "Invalid email",
    })
    .min(5)
    .max(255),
});

export const createEmailTokenAction = actionClient
  .inputSchema(ZCreateEmailTokenAction)
  .action(async ({ parsedInput }) => {
    // Unauthenticated email-registration oracle: throttle like the other auth endpoints.
    await applyIPRateLimit(rateLimitConfigs.auth.emailToken);

    const user = await getUserByEmail(parsedInput.email);
    if (!user) {
      throw new InvalidInputError("Invalid request");
    }

    return createEmailToken(parsedInput.email);
  });
