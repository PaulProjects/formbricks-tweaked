"use server";

import { z } from "zod";
import { ZId } from "@formbricks/types/common";
import { ZIntegrationInput } from "@formbricks/types/integration";
import { withStoredIntegrationKey } from "@/lib/integration/redact-credentials";
import {
  createOrUpdateIntegration,
  deleteIntegration,
  getIntegrationByType,
} from "@/lib/integration/service";
import { capturePostHogEvent } from "@/lib/posthog";
import { authenticatedActionClient } from "@/lib/utils/action-client";
import { checkAuthorizationUpdated } from "@/lib/utils/action-client/action-client-middleware";
import {
  getOrganizationIdFromEnvironmentId,
  getOrganizationIdFromIntegrationId,
  getProjectIdFromEnvironmentId,
  getProjectIdFromIntegrationId,
} from "@/lib/utils/helper";
import { withAuditLogging } from "@/modules/audit-logs/lib/handler";

const ZCreateOrUpdateIntegrationAction = z.object({
  environmentId: ZId,
  integrationData: ZIntegrationInput,
});

export const createOrUpdateIntegrationAction = authenticatedActionClient
  .inputSchema(ZCreateOrUpdateIntegrationAction)
  .action(
    withAuditLogging("createdUpdated", "integration", async ({ ctx, parsedInput }) => {
      const organizationId = await getOrganizationIdFromEnvironmentId(parsedInput.environmentId);

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
            minPermission: "readWrite",
            projectId: await getProjectIdFromEnvironmentId(parsedInput.environmentId),
          },
        ],
      });

      ctx.auditLoggingCtx.organizationId = organizationId;
      // The settings pages redact `config.key` (OAuth credentials) before sending the integration to the
      // client, and the mapping UI echoes it back here. Keep the stored key so a save never overwrites
      // real tokens with blanks; credentials are only written by the OAuth callbacks.
      const storedIntegration = await getIntegrationByType(
        parsedInput.environmentId,
        parsedInput.integrationData.type
      );
      const integrationData = withStoredIntegrationKey(parsedInput.integrationData, storedIntegration);
      const result = await createOrUpdateIntegration(parsedInput.environmentId, integrationData);
      ctx.auditLoggingCtx.integrationId = result.id;
      ctx.auditLoggingCtx.newObject = result;

      capturePostHogEvent(ctx.user.id, "integration_connected", {
        integration_type: parsedInput.integrationData.type,
        organization_id: organizationId,
      });

      // Only the id leaves the action: the row carries the provider OAuth tokens in config.key (ENG-2292).
      return { id: result.id };
    })
  );

const ZDeleteIntegrationAction = z.object({
  integrationId: ZId,
});

export const deleteIntegrationAction = authenticatedActionClient.inputSchema(ZDeleteIntegrationAction).action(
  withAuditLogging("deleted", "integration", async ({ ctx, parsedInput }) => {
    const organizationId = await getOrganizationIdFromIntegrationId(parsedInput.integrationId);

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
          projectId: await getProjectIdFromIntegrationId(parsedInput.integrationId),
          minPermission: "readWrite",
        },
      ],
    });

    ctx.auditLoggingCtx.organizationId = organizationId;
    ctx.auditLoggingCtx.integrationId = parsedInput.integrationId;
    const result = await deleteIntegration(parsedInput.integrationId);
    ctx.auditLoggingCtx.oldObject = result;
    // Only the id leaves the action: the deleted row still carries the live OAuth tokens (ENG-2292).
    return { id: result.id };
  })
);
