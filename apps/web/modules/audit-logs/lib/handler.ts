/**
 * No-op audit logging handler.
 *
 * Provides the same public API as the original audit-log handler so that all
 * existing call-sites compile and work without changes. Every function is a
 * no-op — it simply forwards to the wrapped handler (for `withAuditLogging`)
 * or returns immediately (for `queueAuditEvent*`).
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ActionClientCtx } from "@/lib/utils/action-client/types/context";
import type { TAuditAction, TAuditTarget } from "@/modules/audit-logs/types/audit-log";

/**
 * No-op: wraps a server-action handler without performing any audit logging.
 * Preserves the original handler's return type and error propagation.
 */
export const withAuditLogging = <
  TCtx extends ActionClientCtx = ActionClientCtx,
  TParsedInput = Record<string, unknown>,
  TResult = unknown,
>(
  _action: TAuditAction,
  _targetType: TAuditTarget,
  handler: (args: { ctx: TCtx; parsedInput: TParsedInput }) => Promise<TResult>
) => {
  return async function wrappedAction(args: { ctx: TCtx; parsedInput: TParsedInput }): Promise<TResult> {
    return handler(args);
  };
};

/** No-op: does nothing. */
export const queueAuditEventBackground = async (_params: Record<string, unknown>): Promise<void> => {};

/** No-op: does nothing. */
export const queueAuditEvent = async (_params: Record<string, unknown>): Promise<void> => {};

/** No-op: does nothing. */
export const buildAndLogAuditEvent = async (_params: Record<string, unknown>): Promise<void> => {};
