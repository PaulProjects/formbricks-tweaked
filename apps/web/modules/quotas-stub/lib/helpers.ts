/**
 * Quotas helpers stub.
 *
 * Returns a quota-full object indicating no quotas are active.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/** Returns an empty quota-full object (no quotas enforced). */
export const createQuotaFullObject = (_params?: Record<string, unknown>): any => ({
  quotaFull: false,
  quotaFullActions: [],
});
