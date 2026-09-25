import type { Webhook } from "@prisma/client";

/** The signing secret is only returned once, in the create response; never on reads/updates/deletes. */
export const omitWebhookSecret = <T extends Pick<Webhook, "secret">>({
  secret: _secret,
  ...webhook
}: T): Omit<T, "secret"> => webhook;
