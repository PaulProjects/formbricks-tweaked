/**
 * Quotas evaluation service stub.
 *
 * Always returns empty/passed quotas since quotas are an EE feature.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/** No-op: always passes (no quotas enforced). */
export const evaluateResponseQuotas = async (_params: Record<string, unknown>): Promise<any> => ({
  passed: true,
  quotaFullActions: [],
});
