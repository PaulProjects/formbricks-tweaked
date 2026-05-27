/**
 * Segment actions stub.
 *
 * Server actions for segments — all throw not-available errors.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

"use server";

/** No-op: segments require enterprise. */
export const createSegmentAction = async (..._args: any[]): Promise<any> => {
  return { data: null };
};
