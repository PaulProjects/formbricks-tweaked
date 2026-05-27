"use server";

import { z } from "zod";
import { OperationNotAllowedError } from "@formbricks/types/errors";
import { ZUserPassword } from "@formbricks/types/user";
import { PASSWORD_RESET_DISABLED } from "@/lib/constants";
import { actionClient } from "@/lib/utils/action-client";
import { withAuditLogging } from "@/modules/audit-logs/lib/handler";
import { completePasswordReset } from "@/modules/auth/forgot-password/lib/password-reset-service";

const ZResetPasswordAction = z.object({
  token: z.string().min(1),
  password: ZUserPassword,
});

export const resetPasswordAction = actionClient.inputSchema(ZResetPasswordAction).action(
  withAuditLogging("updated", "user", async ({ ctx, parsedInput }) => {
    if (PASSWORD_RESET_DISABLED) {
      throw new OperationNotAllowedError("Password reset is disabled");
    }

    const result = await completePasswordReset(parsedInput.token, parsedInput.password);
    ctx.auditLoggingCtx.userId = result.userId;
    ctx.auditLoggingCtx.oldObject = { ...result.oldUser, passwordResetMarker: false };
    ctx.auditLoggingCtx.newObject = { ...result.updatedUser, passwordResetMarker: true };

    return { success: true };
  })
);
